/**
 * /api/comments/[id]/route.ts
 * ───────────────────────────
 * DELETE → Admin-only comment deletion
 */

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, supabaseAdmin } from "@/lib/supabaseServer";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing comment ID" }, { status: 400 });
  }

  // ── 1. Verify user session ─────────────────────────────────────────────────
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── 2. Verify admin status ─────────────────────────────────────────────────
  const { data: adminRow, error: adminCheckError } = await supabaseAdmin
    .from("admins")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminCheckError) {
    console.error("[comments DELETE] admin check error", adminCheckError);
  }

  if (!adminRow) {
    return NextResponse.json(
      { error: "Forbidden: admin access required to delete comments." },
      { status: 403 }
    );
  }

  // ── 3. Delete the comment ──────────────────────────────────────────────────
  const { error: deleteError } = await supabaseAdmin
    .from("comments")
    .delete()
    .eq("id", id);

  if (deleteError) {
    console.error("[comments DELETE] delete error", deleteError);
    return NextResponse.json({ error: "Failed to delete comment." }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
