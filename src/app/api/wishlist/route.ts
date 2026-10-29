import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        wishlists: {
          include: {
            book: {
              include: {
                images: { where: { isCover: true }, take: 1 },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    const items = user?.wishlists.map((w) => w.book) || [];
    return NextResponse.json({ success: true, items });
  } catch (err: unknown) {
    console.error("Wishlist GET error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { bookId } = await req.json();
    if (!bookId) {
      return NextResponse.json({ success: false, error: "Book ID required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_bookId: {
          userId: user.id,
          bookId,
        },
      },
    });

    if (existing) {
      await prisma.wishlist.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ success: true, inWishlist: false });
    } else {
      await prisma.wishlist.create({
        data: {
          userId: user.id,
          bookId,
        },
      });
      return NextResponse.json({ success: true, inWishlist: true });
    }
  } catch (err: unknown) {
    console.error("Wishlist POST error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
