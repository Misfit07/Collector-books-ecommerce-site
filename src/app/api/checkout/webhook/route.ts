import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== signature) {
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    // Handle payment.captured or order.paid
    if (event === "payment.captured" || event === "order.paid") {
      const payment = payload.payload.payment.entity;
      const razorpayOrderId = payment.order_id;

      if (razorpayOrderId) {
        const order = await prisma.order.findFirst({
          where: { razorpayOrderId },
          include: { items: true },
        });

        if (order && order.status !== "PAID") {
          const bookIds = order.items.map((i) => i.bookId);

          await prisma.$transaction([
            prisma.order.update({
              where: { id: order.id },
              data: {
                status: "PAID",
                razorpayPaymentId: payment.id,
              },
            }),
            prisma.bookListing.updateMany({
              where: { id: { in: bookIds } },
              data: { status: "SOLD" },
            }),
            prisma.cartReservation.deleteMany({
              where: { bookId: { in: bookIds } },
            }),
          ]);
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (err: unknown) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
