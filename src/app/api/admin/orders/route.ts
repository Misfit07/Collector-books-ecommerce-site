import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string })?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const { orderId, status, trackingNumber } = await req.json();
    if (!orderId) {
      return NextResponse.json({ success: false, error: "Order ID required" }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        trackingNumber: trackingNumber || undefined,
      },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (err: unknown) {
    console.error("Order status update error:", err);
    return NextResponse.json({ success: false, error: "Order update failure" }, { status: 500 });
  }
}
