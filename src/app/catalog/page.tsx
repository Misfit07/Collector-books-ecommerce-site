import React from "react";
import { prisma } from "@/lib/prisma";
import CatalogClient from "@/components/catalog/CatalogClient";

interface CatalogPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    signed?: string;
    curator?: string;
    tag?: string;
  }>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;

  // Fetch all books with images
  const books = await prisma.bookListing.findMany({
    include: {
      images: {
        orderBy: { displayOrder: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <CatalogClient
      initialBooks={books}
      initialQuery={params.q || ""}
      initialCategory={params.category || (params.tag ? params.tag : "")}
      initialSigned={params.signed === "true"}
      initialCurator={params.curator === "true"}
    />
  );
}
