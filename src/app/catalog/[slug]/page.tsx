import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import ItemDetailClient from "@/components/catalog/ItemDetailClient";

interface ItemPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ItemDetailPage({ params }: ItemPageProps) {
  const { slug } = await params;

  // Find book by slug or ID
  const book = await prisma.bookListing.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
    },
    include: {
      images: {
        orderBy: { displayOrder: "asc" },
      },
      certificate: true,
      auction: {
        include: {
          bids: {
            orderBy: { amountInCents: "desc" },
            take: 5,
            include: {
              user: {
                select: { name: true },
              },
            },
          },
        },
      },
    },
  });

  if (!book) {
    notFound();
  }

  // Check wishlist
  let inWishlist = false;
  try {
    const session = await getServerSession();
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      if (user) {
        const entry = await prisma.wishlist.findUnique({
          where: {
            userId_bookId: {
              userId: user.id,
              bookId: book.id,
            },
          },
        });
        inWishlist = !!entry;
      }
    }
  } catch {
    // Session optional
  }

  return <ItemDetailClient book={book} initialInWishlist={inWishlist} />;
}
