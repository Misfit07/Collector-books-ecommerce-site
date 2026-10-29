import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const offerActionSchema = z.object({
  offerId: z.string().min(1),
  action: z.enum(["ACCEPT", "REJECT", "COUNTER"]),
  counterAmountInCents: z.number().int().optional(),
  adminNote: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string })?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = offerActionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { offerId, action, counterAmountInCents, adminNote } = parsed.data;

    let updatedOffer;
    if (action === "ACCEPT") {
      updatedOffer = await prisma.offer.update({
        where: { id: offerId },
        data: {
          status: "ACCEPTED",
          adminNote: adminNote || "Offer accepted by curatorial committee.",
        },
      });
    } else if (action === "REJECT") {
      updatedOffer = await prisma.offer.update({
        where: { id: offerId },
        data: {
          status: "REJECTED",
          adminNote: adminNote || "Offer declined. Thank you for your interest.",
        },
      });
    } else if (action === "COUNTER") {
      if (!counterAmountInCents || counterAmountInCents <= 0) {
        return NextResponse.json(
          { success: false, error: "Counter-offer amount is required." },
          { status: 400 }
        );
      }
      updatedOffer = await prisma.offer.update({
        where: { id: offerId },
        data: {
          status: "COUNTERED",
          counterAmountInCents,
          adminNote: adminNote || "Counter-proposal submitted for your consideration.",
          expiresAt: new Date(Date.now() + 48 * 3600 * 1000), // 48 hr expiry
        },
      });
    }

    return NextResponse.json({ success: true, offer: updatedOffer });
  } catch (err: unknown) {
    console.error("Offer action error:", err);
    return NextResponse.json({ success: false, error: "Action failure" }, { status: 500 });
  }
}
