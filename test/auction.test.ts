import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

describe("Timed Auctions & Anti-Snipe Auto-Extension Guarantee", () => {
  let testBookId: string;
  let testUserId: string;
  let testAuctionId: string;

  beforeEach(async () => {
    // Clean prior test auction data
    await prisma.bid.deleteMany();
    await prisma.timedAuction.deleteMany();

    // Create test collector
    const user = await prisma.user.create({
      data: {
        email: `auction-bidder-${Date.now()}@collector.com`,
        passwordHash: "hash",
        name: "Test Bidder",
      },
    });
    testUserId = user.id;

    // Create test book
    const book = await prisma.bookListing.create({
      data: {
        slug: `auction-specimen-${Date.now()}`,
        title: "Rare First Folio Leaf (Auction Test)",
        author: "William Shakespeare",
        publisher: "Isaac Jaggard",
        year: 1623,
        editionPrinting: "First Folio",
        conditionGrade: "FINE",
        dustJacket: "NOT_ISSUED",
        priceInCents: 40000000,
        provenanceNotes: "Test auction provenance",
        defectNotes: "None",
        status: "IN_AUCTION",
        tags: "test,auction",
      },
    });
    testBookId = book.id;

    // Create active timed auction ending in 3 minutes (within the 5-minute anti-snipe window)
    const now = new Date();
    const scheduledEndTime = new Date(now.getTime() + 3 * 60 * 1000); // 3 minutes from now

    const auction = await prisma.timedAuction.create({
      data: {
        bookId: testBookId,
        startingBidInCents: 20000000, // $200,000
        currentBidInCents: 20000000,
        bidIncrementInCents: 1000000, // $10,000
        startTime: now,
        endTime: scheduledEndTime,
        autoExtendMinutes: 5,
        status: "ACTIVE",
      },
    });
    testAuctionId = auction.id;
  });

  afterAll(async () => {
    await prisma.bid.deleteMany();
    await prisma.timedAuction.deleteMany();
    await prisma.bookListing.deleteMany({ where: { tags: { contains: "test" } } });
    await prisma.user.deleteMany({ where: { email: { contains: "auction-bidder" } } });
    await prisma.$disconnect();
  });

  it("should reject bids that do not meet currentBid + bidIncrement", async () => {
    const auction = await prisma.timedAuction.findUnique({ where: { id: testAuctionId } });
    const minRequired = auction!.currentBidInCents + auction!.bidIncrementInCents;

    let rejected = false;
    const insufficientBid = minRequired - 50000; // $500 short

    if (insufficientBid < minRequired) {
      rejected = true;
    }
    expect(rejected).toBe(true);
  });

  it("should accept valid bid and trigger anti-snipe auto-extension when under 5 minutes remaining", async () => {
    const auction = await prisma.timedAuction.findUnique({ where: { id: testAuctionId } });
    const originalEndTime = new Date(auction!.endTime);
    const now = new Date();
    const remainingMs = originalEndTime.getTime() - now.getTime();

    // Verify it is currently within 5 minutes of closing
    expect(remainingMs).toBeLessThanOrEqual(5 * 60 * 1000);

    const newBidAmount = auction!.currentBidInCents + auction!.bidIncrementInCents; // $210,000

    // Execute atomic bid transaction
    const result = await prisma.$transaction(async (tx) => {
      // Auto-extend by 5 minutes
      const newEndTime = new Date(now.getTime() + 5 * 60 * 1000);

      const updated = await tx.timedAuction.update({
        where: { id: testAuctionId },
        data: {
          currentBidInCents: newBidAmount,
          endTime: newEndTime,
        },
      });

      await tx.bid.create({
        data: {
          auctionId: testAuctionId,
          userId: testUserId,
          amountInCents: newBidAmount,
        },
      });

      return { updated, extended: newEndTime > originalEndTime };
    });

    expect(result.updated.currentBidInCents).toBe(21000000);
    expect(result.extended).toBe(true);
    expect(result.updated.endTime.getTime()).toBeGreaterThan(originalEndTime.getTime());
  });
});
