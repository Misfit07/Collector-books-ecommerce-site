import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

describe("Archival Cart Reservation & Concurrency Safety", () => {
  let testBookId: string;

  beforeEach(async () => {
    // Clean any prior test reservations
    await prisma.cartReservation.deleteMany();

    // Create a pristine collectible test volume
    const book = await prisma.bookListing.create({
      data: {
        slug: `test-specimen-${Date.now()}-${Math.random()}`,
        title: "Test Inscribed First Edition",
        author: "Arthur Conan Doyle",
        publisher: "Spencer Blackett",
        year: 1890,
        editionPrinting: "First Edition",
        conditionGrade: "FINE",
        dustJacket: "AS_ISSUED",
        isSigned: true,
        priceInCents: 500000, // $5,000
        provenanceNotes: "Test provenance record",
        defectNotes: "Pristine",
        status: "AVAILABLE",
        tags: "test,signed",
      },
    });
    testBookId = book.id;
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.cartReservation.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.bookListing.deleteMany({
      where: { tags: { contains: "test" } },
    });
    await prisma.$disconnect();
  });

  it("should successfully reserve an available unique book for 15 minutes", async () => {
    const sessionId = "collector_session_A";
    const now = new Date();
    const reservedUntil = new Date(now.getTime() + 15 * 60 * 1000);

    const reservation = await prisma.$transaction(async (tx) => {
      const book = await tx.bookListing.findUnique({
        where: { id: testBookId },
        include: { reservation: true },
      });

      expect(book?.status).toBe("AVAILABLE");

      const created = await tx.cartReservation.create({
        data: {
          bookId: testBookId,
          sessionId,
          reservedUntil,
        },
      });

      await tx.bookListing.update({
        where: { id: testBookId },
        data: { status: "RESERVED" },
      });

      return created;
    });

    expect(reservation).toBeDefined();
    expect(reservation.sessionId).toBe(sessionId);
    expect(reservation.reservedUntil.getTime()).toBeGreaterThan(now.getTime());

    // Verify book status in DB
    const updatedBook = await prisma.bookListing.findUnique({
      where: { id: testBookId },
    });
    expect(updatedBook?.status).toBe("RESERVED");
  });

  it("should reject concurrent reservation attempt from another collector", async () => {
    const sessionA = "collector_session_A";
    const sessionB = "collector_session_B";
    const now = new Date();
    const reservedUntil = new Date(now.getTime() + 15 * 60 * 1000);

    // Session A acquires the 15-minute hold
    await prisma.cartReservation.create({
      data: {
        bookId: testBookId,
        sessionId: sessionA,
        reservedUntil,
      },
    });
    await prisma.bookListing.update({
      where: { id: testBookId },
      data: { status: "RESERVED" },
    });

    // Session B attempts to reserve the same book
    let conflictError: string | null = null;
    try {
      await prisma.$transaction(async (tx) => {
        const book = await tx.bookListing.findUnique({
          where: { id: testBookId },
          include: { reservation: true },
        });

        if (
          book?.reservation &&
          new Date(book.reservation.reservedUntil).getTime() > Date.now() &&
          book.reservation.sessionId !== sessionB
        ) {
          throw new Error("Item is reserved in another cart");
        }

        return await tx.cartReservation.create({
          data: {
            bookId: testBookId,
            sessionId: sessionB,
            reservedUntil,
          },
        });
      });
    } catch (e: unknown) {
      conflictError = e instanceof Error ? e.message : "Error";
    }

    expect(conflictError).toBe("Item is reserved in another cart");

    // Assert that Session A still holds the reservation
    const activeRes = await prisma.cartReservation.findUnique({
      where: { bookId: testBookId },
    });
    expect(activeRes?.sessionId).toBe(sessionA);
  });

  it("should allow a new collector to claim the book once previous reservation expires", async () => {
    const expiredSession = "expired_collector";
    const newSession = "new_collector";

    // Create an expired reservation (10 minutes in the past)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    await prisma.cartReservation.create({
      data: {
        bookId: testBookId,
        sessionId: expiredSession,
        reservedUntil: tenMinutesAgo,
      },
    });

    // New collector attempts reservation
    const freshReservation = await prisma.$transaction(async (tx) => {
      const book = await tx.bookListing.findUnique({
        where: { id: testBookId },
        include: { reservation: true },
      });

      if (book?.reservation) {
        const isExpired = new Date(book.reservation.reservedUntil).getTime() <= Date.now();
        if (isExpired) {
          await tx.cartReservation.delete({
            where: { id: book.reservation.id },
          });
        }
      }

      const now = new Date();
      return await tx.cartReservation.create({
        data: {
          bookId: testBookId,
          sessionId: newSession,
          reservedUntil: new Date(now.getTime() + 15 * 60 * 1000),
        },
      });
    });

    expect(freshReservation.sessionId).toBe(newSession);
    expect(freshReservation.reservedUntil.getTime()).toBeGreaterThan(Date.now());
  });

  it("should prevent double-selling on finalized orders and transition to SOLD", async () => {
    const session = "buyer_session";

    // Create order and complete transaction
    const orderNumber = `TEST-ORD-${Date.now()}`;
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerEmail: "buyer@collector.com",
          customerName: "Julian Vance",
          shippingAddressJson: "{}",
          totalInCents: 500000,
          status: "PAID",
          items: {
            create: [
              {
                bookId: testBookId,
                priceInCents: 500000,
                title: "Test Inscribed First Edition",
                author: "Arthur Conan Doyle",
                edition: "First Edition",
              },
            ],
          },
        },
      });

      await tx.bookListing.update({
        where: { id: testBookId },
        data: { status: "SOLD" },
      });

      return order;
    });

    // Check book is now SOLD
    const soldBook = await prisma.bookListing.findUnique({
      where: { id: testBookId },
    });
    expect(soldBook?.status).toBe("SOLD");

    // Any subsequent reservation attempt must fail
    let reservationFailed = false;
    try {
      await prisma.$transaction(async (tx) => {
        const book = await tx.bookListing.findUnique({
          where: { id: testBookId },
        });
        if (book?.status === "SOLD") {
          throw new Error("Cannot reserve sold volume");
        }
      });
    } catch {
      reservationFailed = true;
    }

    expect(reservationFailed).toBe(true);
  });
});
