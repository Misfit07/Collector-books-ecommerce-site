import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const subSchema = z.object({
  email: z.string().email("Valid email required"),
  type: z.enum(["SOLD_OUT_ITEM", "AUTHOR_NEW_LISTINGS"]),
  bookId: z.string().optional(),
  authorName: z.string().optional(),
  userId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = subSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid payload" },
        { status: 400 }
      );
    }

    const { email, type, bookId, authorName, userId } = parsed.data;

    const sub = await prisma.notificationSubscription.create({
      data: {
        email: email.toLowerCase().trim(),
        type,
        bookId: bookId || null,
        authorName: authorName || null,
        userId: userId || null,
      },
    });

    return NextResponse.json({ success: true, subscription: sub });
  } catch (err: unknown) {
    console.error("Subscription error:", err);
    return NextResponse.json({ success: false, error: "Subscription error" }, { status: 500 });
  }
}
