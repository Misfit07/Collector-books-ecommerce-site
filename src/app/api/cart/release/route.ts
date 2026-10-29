import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const releaseSchema = z.object({
  bookId: z.string().min(1, "Book ID is required"),
  sessionId: z.string().min(1, "Session ID is required"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = releaseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
    }

    const { bookId, sessionId } = parsed.data;

    await prisma.$transaction(async (tx) => {
      const reservation = await tx.cartReservation.findFirst({
        where: { bookId, sessionId },
      });

      if (reservation) {
        await tx.cartReservation.delete({
          where: { id: reservation.id },
        });

        // Check if book has status RESERVED and revert to AVAILABLE
        const book = await tx.bookListing.findUnique({ where: { id: bookId } });
        if (book && book.status === "RESERVED") {
          await tx.bookListing.update({
            where: { id: bookId },
            data: { status: "AVAILABLE" },
          });
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Release error occurred.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
