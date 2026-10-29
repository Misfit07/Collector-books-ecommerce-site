import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminOrdersClient from "@/components/admin/AdminOrdersClient";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as { role?: string })?.role !== "ADMIN") {
    redirect("/login");
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          book: {
            include: {
              images: { where: { isCover: true }, take: 1 },
              certificate: true,
            },
          },
        },
      },
    },
  });

  return <AdminOrdersClient initialOrders={orders} />;
}
