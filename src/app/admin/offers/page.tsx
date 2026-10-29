import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminOffersClient from "@/components/admin/AdminOffersClient";

export const dynamic = "force-dynamic";

export default async function AdminOffersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as { role?: string })?.role !== "ADMIN") {
    redirect("/login");
  }

  const offers = await prisma.offer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      book: {
        include: {
          images: { where: { isCover: true }, take: 1 },
        },
      },
    },
  });

  return <AdminOffersClient initialOffers={offers} />;
}
