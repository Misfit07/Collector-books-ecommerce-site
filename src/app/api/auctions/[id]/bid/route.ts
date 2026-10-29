import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const bidSchema = z.object({
  amountInCents: z.number().int().min(100),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { id: auctionId } = await params;
    const body = await req.json();
    const parsed = bidSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid bid amount" },
        { status: 400 }
      );
    }

    const { amountInCents } = parsed.data;

    // Check auth
    let userId: string;
    const session = await getServerSession(authOptions);

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      if (user) {
        userId = user.id;
      } else {
        return NextResponse.json({ success: false, error: "User record not found" }, { status: 401 });
      }
    } else {
      // Find or assign demo collector user for testing
      const collector = await prisma.user.findFirst({
        where: { role: "CUSTOMER" },
      });
      if (!collector) {
        return NextResponse.json({ success: false, error: "Please sign in to place auction bids." }, { status: 401 });
      }
      userId = collector.id;
    }

    // Atomic transaction for bidding with anti-snipe auto-extend
    const result = await prisma.$transaction(async (tx) => {
      const auction = await tx.timedAuction.findUnique({
        where: { id: auctionId },
        include: { book: true },
      });

      if (!auction) {
        throw new Error("Auction not found.");
      }

      if (auction.status !== "ACTIVE") {
        throw new Error("This auction is not active.");
      }

      const now = new Date();
      if (now > new Date(auction.endTime)) {
        throw new Error("This auction has ended.");
      }

      const minRequiredBid = auction.currentBidInCents + auction.bidIncrementInCents;
      if (amountInCents < minRequiredBid) {
        throw new Error(
          `Bid must be at least $${minRequiredBid / 100} (current bid $${auction.currentBidInCents / 100} + $${auction.bidIncrementInCents / 100} increment).`
        );
      }

      // Check for Anti-Snipe: if bid is within 5 minutes of end time, auto-extend by 5 minutes
      const remainingMs = new Date(auction.endTime).getTime() - now.getTime();
      const FIVE_MINUTES_MS = 5 * 60 * 1000;
      let newEndTime = auction.endTime;

      if (remainingMs <= FIVE_MINUTES_MS) {
        // Auto-extend by autoExtendMinutes
        newEndTime = new Date(now.getTime() + auction.autoExtendMinutes * 60 * 1000);
      }

      // Update auction
      const updatedAuction = await tx.timedAuction.update({
        where: { id: auctionId },
        data: {
          currentBidInCents: amountInCents,
          endTime: newEndTime,
        },
      });

      // Record bid
      const bid = await tx.bid.create({
        data: {
          auctionId,
          userId,
          amountInCents,
        },
      });

      return {
        auction: updatedAuction,
        bid,
        extended: newEndTime > auction.endTime,
      };
    });

    return NextResponse.json({
      success: true,
      currentBidInCents: result.auction.currentBidInCents,
      endTime: result.auction.endTime.toISOString(),
      extended: result.extended,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Bidding error occurred.";
    return NextResponse.json({ success: false, error: msg }, { status: 409 });
  }
}
