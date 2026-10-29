import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminReservationsClient from "@/components/admin/AdminReservationsClient";

export const dynamic = "force-dynamic";

export default async function AdminReservationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as { role?: string })?.role !== "ADMIN") {
    redirect("/login");
  }

  const now = new Date();
  const reservations = await prisma.cartReservation.findMany({
    where: { reservedUntil: { gt: now } },
    include: {
      book: {
        include: {
          images: { where: { isCover: true }, take: 1 },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return <AdminReservationsClient initialReservations={reservations} />;
}
