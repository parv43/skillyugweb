import { supabaseAdmin } from "@/lib/supabaseServer";

export async function checkUserPayment(
  userId: string,
  email: string | null,
  fullName?: string | null
): Promise<{ hasPaid: boolean; resolvedRole: "student" | "parent" | "admin" }> {
  try {
    // 1. Check if Admin
    const [adminCheck, profileCheck] = await Promise.all([
      supabaseAdmin.from("admins").select("id").eq("user_id", userId).maybeSingle(),
      supabaseAdmin.from("users").select("role").eq("id", userId).maybeSingle()
    ]);

    const isUserAdmin =
      adminCheck.data ||
      profileCheck.data?.role === "admin" ||
      email === "eternallytanuj@gmail.com";

    if (isUserAdmin) {
      if (profileCheck.data?.role !== "admin") {
        console.log(`[paymentCheck] Promoting user ${userId} to admin role in DB`);
        await supabaseAdmin.from("users").upsert({
          id: userId,
          email: email || "",
          full_name: fullName || "Admin User",
          role: "admin"
        });
      }
      return { hasPaid: true, resolvedRole: "admin" };
    }

    // 2. Check if Parent with relations (has child)
    const { data: relations, error: relError } = await supabaseAdmin
      .from("student_parent_relations")
      .select("student_id")
      .eq("parent_id", userId);

    if (relError) {
      console.error("[paymentCheck] Error fetching parent relations:", relError);
    }

    const hasChildren = relations && relations.length > 0;

    if (hasChildren) {
      const studentIds = relations.map((r) => r.student_id);
      // Check if any student has a slot booking by user_id
      const { data: bookingsByUid, error: uidBookError } = await supabaseAdmin
        .from("slot_bookings")
        .select("razorpay_payment_id")
        .in("user_id", studentIds)
        .limit(1);

      if (uidBookError) {
        console.error("[paymentCheck] Error checking bookings by uid:", uidBookError);
      }

      if (bookingsByUid && bookingsByUid.length > 0) {
        if (profileCheck.data?.role !== "parent") {
          console.log(`[paymentCheck] Syncing user ${userId} as paid parent in DB`);
          await supabaseAdmin.from("users").upsert({
            id: userId,
            email: email || "",
            full_name: fullName || "Parent User",
            role: "parent"
          });
        }
        return { hasPaid: true, resolvedRole: "parent" };
      }

      // Fallback: check by child emails in slot_bookings
      const { data: childrenUsers, error: childUserError } = await supabaseAdmin
        .from("users")
        .select("email")
        .in("id", studentIds);

      if (childUserError) {
        console.error("[paymentCheck] Error fetching children users:", childUserError);
      }

      const childEmails = childrenUsers?.map((u) => u.email).filter(Boolean) || [];
      if (childEmails.length > 0) {
        const { data: bookingsByEmail, error: emailBookError } = await supabaseAdmin
          .from("slot_bookings")
          .select("razorpay_payment_id")
          .in("email", childEmails)
          .limit(1);

        if (emailBookError) {
          console.error("[paymentCheck] Error checking bookings by email:", emailBookError);
        }

        if (bookingsByEmail && bookingsByEmail.length > 0) {
          if (profileCheck.data?.role !== "parent") {
            console.log(`[paymentCheck] Syncing user ${userId} as paid parent in DB (by child email)`);
            await supabaseAdmin.from("users").upsert({
              id: userId,
              email: email || "",
              full_name: fullName || "Parent User",
              role: "parent"
            });
          }
          return { hasPaid: true, resolvedRole: "parent" };
        }
      }

      // If they have children but none are paid, they are an unpaid parent
      if (profileCheck.data?.role !== "parent") {
        console.log(`[paymentCheck] Syncing user ${userId} as unpaid parent in DB`);
        await supabaseAdmin.from("users").upsert({
          id: userId,
          email: email || "",
          full_name: fullName || "Parent User",
          role: "parent"
        });
      }
      return { hasPaid: false, resolvedRole: "parent" };
    }

    // 3. Check if Student (user is in slot_bookings by user_id or email)
    const { data: userBookingByUid, error: userUidError } = await supabaseAdmin
      .from("slot_bookings")
      .select("razorpay_payment_id")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();

    if (userUidError) {
      console.error("[paymentCheck] Error checking user booking by uid:", userUidError);
    }

    if (userBookingByUid) {
      if (profileCheck.data?.role !== "student") {
        console.log(`[paymentCheck] Syncing user ${userId} as paid student in DB (by uid booking)`);
        await supabaseAdmin.from("users").upsert({
          id: userId,
          email: email || "",
          full_name: fullName || "Student User",
          role: "student"
        });
      }
      return { hasPaid: true, resolvedRole: "student" };
    }

    if (email) {
      const { data: userBookingByEmail, error: userEmailError } = await supabaseAdmin
        .from("slot_bookings")
        .select("razorpay_payment_id")
        .ilike("email", email.trim())
        .limit(1)
        .maybeSingle();

      if (userEmailError) {
        console.error("[paymentCheck] Error checking user booking by email:", userEmailError);
      }

      if (userBookingByEmail) {
        console.log(`[paymentCheck] Healing slot_bookings: linking user_id ${userId} to email ${email}`);
        await supabaseAdmin
          .from("slot_bookings")
          .update({ user_id: userId })
          .ilike("email", email.trim());

        if (profileCheck.data?.role !== "student") {
          console.log(`[paymentCheck] Syncing user ${userId} as paid student in DB (by email booking)`);
          await supabaseAdmin.from("users").upsert({
            id: userId,
            email: email,
            full_name: fullName || "Student User",
            role: "student"
          });
        }
        return { hasPaid: true, resolvedRole: "student" };
      }
    }

    // 4. Default: Unpaid user, force to parent role
    if (profileCheck.data?.role !== "parent") {
      console.log(`[paymentCheck] Syncing user ${userId} as unpaid parent (default) in DB`);
      await supabaseAdmin.from("users").upsert({
        id: userId,
        email: email || "",
        full_name: fullName || "Parent User",
        role: "parent"
      });
    }
    return { hasPaid: false, resolvedRole: "parent" };
  } catch (error) {
    console.error("[paymentCheck] Critical error in checkUserPayment:", error);
    return { hasPaid: false, resolvedRole: "parent" };
  }
}
