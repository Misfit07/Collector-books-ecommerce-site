import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const submitOfferSchema = z.object({
  bookId: z.string().min(1),
  offerAmountInCents: z.number().int().min(100),
  guestEmail: z.string().email(),
  guestName: z.string().min(2),
  buyerNote: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = submitOfferSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid payload" },
        { status: 400 }
      );
    }

    const { bookId, offerAmountInCents, guestEmail, guestName, buyerNote } = parsed.data;

    let userId: string | null = null;
    try {
      const session = await getServerSession(authOptions);
      if (session?.user?.email) {
        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (user) userId = user.id;
      }
    } catch {
      // optional
    }

    const book = await prisma.bookListing.findUnique({ where: { id: bookId } });
    if (!book) {
      return NextResponse.json({ success: false, error: "Volume not found." }, { status: 404 });
    }

    const offer = await prisma.offer.create({
      data: {
        bookId,
        userId,
        guestEmail: guestEmail.toLowerCase().trim(),
        guestName,
        offerAmountInCents,
        buyerNote: buyerNote || null,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, offer });
  } catch (err: unknown) {
    console.error("Submit offer error:", err);
    return NextResponse.json({ success: false, error: "Offer submission failed" }, { status: 500 });
  }
}
