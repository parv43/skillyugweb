import { NextResponse } from "next/server";
import { persistDemoBooking, persistSlotBooking } from "@/lib/bookingPersistence";
import {
  ensureCapturedRazorpayPayment,
  fetchRazorpayOrder,
  fetchRazorpayPayment,
  parseBookingOrderNotes,
  verifyRazorpayWebhookSignature,
  type RazorpayPayment,
} from "@/lib/razorpayServer";

export const runtime = "nodejs";

interface RazorpayWebhookEvent {
  event?: string;
  payload?: {
    payment?: {
      entity?: RazorpayPayment;
    };
  };
}

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("x-razorpay-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing webhook signature." }, { status: 400 });
    }

    const payload = await request.text();
    if (!verifyRazorpayWebhookSignature(payload, signature)) {
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
    }

    const event = JSON.parse(payload) as RazorpayWebhookEvent;
    if (!["payment.authorized", "payment.captured"].includes(event.event ?? "")) {
      return NextResponse.json({ received: true, ignored: true });
    }

    const paymentId = event.payload?.payment?.entity?.id;
    if (!paymentId) {
      return NextResponse.json({ error: "Missing payment ID in webhook payload." }, { status: 400 });
    }

    let payment = await fetchRazorpayPayment(paymentId);
    payment = await ensureCapturedRazorpayPayment(payment);

    if (!payment.order_id) {
      return NextResponse.json({ received: true, ignored: true });
    }

    const order = await fetchRazorpayOrder(payment.order_id);
    const notes = parseBookingOrderNotes(order.notes);

    if (notes.bookingType === "demo_booking") {
      await persistDemoBooking({
        expectedBookingType: "demo_booking",
        fallbackDetails: {
          email: payment.email ?? null,
          phoneNumber: payment.contact ?? null,
        },
        order,
        payment,
      });
      return NextResponse.json({ received: true, bookingType: "demo_booking" });
    }

    if (notes.bookingType === "slot_booking") {
      await persistSlotBooking({
        expectedBookingType: "slot_booking",
        fallbackDetails: {
          email: payment.email ?? null,
          phoneNumber: payment.contact ?? null,
        },
        order,
        payment,
      });
      return NextResponse.json({ received: true, bookingType: "slot_booking" });
    }

    return NextResponse.json({ received: true, ignored: true });
  } catch (error) {
    console.error("Razorpay webhook processing failed:", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
