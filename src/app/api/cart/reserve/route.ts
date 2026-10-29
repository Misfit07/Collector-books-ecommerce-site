import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const reserveSchema = z.object({
  bookId: z.string().min(1, "Book ID is required"),
  sessionId: z.string().min(1, "Session ID is required"),
  userId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = reserveSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid payload" },
        { status: 400 }
      );
    }

    const { bookId, sessionId, userId } = parsed.data;
    const RESERVATION_MINUTES = 15;
    const now = new Date();
    const reservedUntil = new Date(now.getTime() + RESERVATION_MINUTES * 60 * 1000);

    // Atomic transaction for strict unique inventory reservation
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch book with existing reservation
      const book = await tx.bookListing.findUnique({
        where: { id: bookId },
        include: { reservation: true, images: true },
      });

      if (!book) {
        throw new Error("Collectable volume not found.");
      }

      if (book.status === "SOLD") {
        throw new Error("This unique volume has already been acquired.");
      }

      // 2. Check if there's an existing reservation
      if (book.reservation) {
        const isExpired = new Date(book.reservation.reservedUntil).getTime() <= now.getTime();

        if (isExpired) {
          // Clean expired reservation
          await tx.cartReservation.delete({
            where: { id: book.reservation.id },
          });
        } else if (book.reservation.sessionId !== sessionId) {
          // Active reservation held by another collector!
          const remainingSecs = Math.ceil(
            (new Date(book.reservation.reservedUntil).getTime() - now.getTime()) / 1000
          );
          const mins = Math.ceil(remainingSecs / 60);
          throw new Error(
            `This unique copy is currently reserved in another collector's cart (expires in ~${mins} min). Please check back soon.`
          );
        } else {
          // Already reserved by this session - extend timer to 15 minutes
          const updatedReservation = await tx.cartReservation.update({
            where: { id: book.reservation.id },
            data: {
              reservedUntil,
              userId: userId || book.reservation.userId,
            },
          });

          return {
            reservation: updatedReservation,
            book,
          };
        }
      }

      // 3. Create fresh 15-minute reservation
      const newReservation = await tx.cartReservation.create({
        data: {
          bookId: book.id,
          sessionId,
          userId: userId || null,
          reservedUntil,
        },
      });

      await tx.bookListing.update({
        where: { id: book.id },
        data: { status: "RESERVED" },
      });

      return {
        reservation: newReservation,
        book,
      };
    });

    const cover = result.book.images.find((i) => i.isCover)?.url || result.book.images[0]?.url || "";

    return NextResponse.json({
      success: true,
      item: {
        id: result.reservation.id,
        bookId: result.book.id,
        title: result.book.title,
        author: result.book.author,
        edition: result.book.editionPrinting,
        priceInCents: result.book.priceInCents,
        coverImage: cover,
        reservedUntil: result.reservation.reservedUntil.toISOString(),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Reservation error occurred.";
    return NextResponse.json({ success: false, error: message }, { status: 409 });
  }
}
