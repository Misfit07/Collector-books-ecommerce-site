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

    const { reservationId } = await req.json();
    if (!reservationId) {
      return NextResponse.json({ success: false, error: "Reservation ID required" }, { status: 400 });
    }

    const reservation = await prisma.cartReservation.findUnique({
      where: { id: reservationId },
    });

    if (reservation) {
      await prisma.$transaction([
        prisma.cartReservation.delete({
          where: { id: reservationId },
        }),
        prisma.bookListing.update({
          where: { id: reservation.bookId },
          data: { status: "AVAILABLE" },
        }),
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Force release error:", err);
    return NextResponse.json({ success: false, error: "Force release failure" }, { status: 500 });
  }
}
