import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ success: true, items: [] });
    }

    const now = new Date();

    // 1. Housekeeping: Identify and remove globally expired reservations
    const expiredReservations = await prisma.cartReservation.findMany({
      where: { reservedUntil: { lte: now } },
      select: { id: true, bookId: true },
    });

    if (expiredReservations.length > 0) {
      const expiredIds = expiredReservations.map((r) => r.id);
      const expiredBookIds = expiredReservations.map((r) => r.bookId);

      await prisma.$transaction([
        prisma.cartReservation.deleteMany({
          where: { id: { in: expiredIds } },
        }),
        prisma.bookListing.updateMany({
          where: {
            id: { in: expiredBookIds },
            status: "RESERVED",
          },
          data: { status: "AVAILABLE" },
        }),
      ]);
    }

    // 2. Fetch active reservations specifically for this visitor's session
    const activeReservations = await prisma.cartReservation.findMany({
      where: {
        sessionId,
        reservedUntil: { gt: now },
      },
      include: {
        book: {
          include: {
            images: {
              where: { isCover: true },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const items = activeReservations.map((res) => {
      const cover = res.book.images[0]?.url || "";
      return {
        id: res.id,
        bookId: res.book.id,
        title: res.book.title,
        author: res.book.author,
        edition: res.book.editionPrinting,
        priceInCents: res.book.priceInCents,
        coverImage: cover,
        reservedUntil: res.reservedUntil.toISOString(),
      };
    });

    return NextResponse.json({ success: true, items });
  } catch (error: unknown) {
    console.error("Cart status sync error:", error);
    return NextResponse.json({ success: false, items: [] }, { status: 500 });
  }
}
