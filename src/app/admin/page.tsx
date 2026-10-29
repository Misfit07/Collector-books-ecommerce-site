import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  BookOpen,
  DollarSign,
  Clock,
  Gavel,
  PackageCheck,
  TrendingUp,
  PlusCircle,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as { role?: string })?.role !== "ADMIN") {
    redirect("/login");
  }

  // Fetch metrics
  const totalBooksCount = await prisma.bookListing.count();
  const availableBooks = await prisma.bookListing.findMany({
    where: { status: "AVAILABLE" },
    select: { priceInCents: true },
  });
  const totalInventoryValuationCents = availableBooks.reduce((sum, b) => sum + b.priceInCents, 0);

  const completedOrders = await prisma.order.findMany({
    where: { status: { in: ["PAID", "SHIPPED"] } },
    select: { totalInCents: true },
  });
  const grossVolumeCents = completedOrders.reduce((sum, o) => sum + o.totalInCents, 0);

  const activeReservationsCount = await prisma.cartReservation.count({
    where: { reservedUntil: { gt: new Date() } },
  });

  const pendingOffersCount = await prisma.offer.count({
    where: { status: "PENDING" },
  });

  const activeAuctionsCount = await prisma.timedAuction.count({
    where: { status: "ACTIVE" },
  });

  const recentOrders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { items: true },
  });

  const recentOffers = await prisma.offer.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { book: true },
  });

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="pb-6 border-b border-[#E8E2D4] flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#7A202E] text-white text-[10px] font-bold uppercase tracking-wider rounded mb-2">
            <ShieldAlert className="w-3 h-3" />
            <span>Curatorial Administration Authority</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#1A1816]">
            Curators&apos; Executive Desk
          </h1>
          <p className="text-xs text-[#5C564E] mt-1 font-mono">
            Signed in as Senior Curator: {session.user.name} ({session.user.email})
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/admin/inventory/new"
            className="px-4 py-2.5 bg-[#1A1816] hover:bg-[#B38838] text-white rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 shadow"
          >
            <PlusCircle className="w-4 h-4 text-[#B38838]" />
            <span>Catalog New Volume</span>
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#E8E2D4] pb-2 text-xs font-medium">
        <Link
          href="/admin"
          className="px-3.5 py-2 bg-[#1A1816] text-[#FDFBF7] rounded font-bold"
        >
          Executive Overview
        </Link>
        <Link
          href="/admin/inventory"
          className="px-3.5 py-2 text-[#5C564E] hover:text-[#1A1816] hover:bg-[#F4EFE6] rounded transition-colors"
        >
          Inventory Workbench ({totalBooksCount})
        </Link>
        <Link
          href="/admin/offers"
          className="px-3.5 py-2 text-[#5C564E] hover:text-[#1A1816] hover:bg-[#F4EFE6] rounded transition-colors flex items-center gap-1.5"
        >
          <span>Make-an-Offer Desk</span>
          {pendingOffersCount > 0 && (
            <span className="bg-[#7A202E] text-white text-[10px] px-1.5 rounded-full font-bold">
              {pendingOffersCount}
            </span>
          )}
        </Link>
        <Link
          href="/admin/reservations"
          className="px-3.5 py-2 text-[#5C564E] hover:text-[#1A1816] hover:bg-[#F4EFE6] rounded transition-colors flex items-center gap-1.5"
        >
          <span>Active Cart Holds</span>
          {activeReservationsCount > 0 && (
            <span className="bg-[#B38838] text-white text-[10px] px-1.5 rounded-full font-bold">
              {activeReservationsCount}
            </span>
          )}
        </Link>
        <Link
          href="/admin/orders"
          className="px-3.5 py-2 text-[#5C564E] hover:text-[#1A1816] hover:bg-[#F4EFE6] rounded transition-colors"
        >
          Orders &amp; White-Glove Dispatch
        </Link>
      </div>

      {/* Primary Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-[#E8E2D4] p-6 rounded-lg shadow-xs space-y-2">
          <div className="flex justify-between items-center text-[#8E867B]">
            <span className="text-[10px] font-mono uppercase tracking-wider">Gross Sales Volume</span>
            <TrendingUp className="w-4 h-4 text-[#233D30]" />
          </div>
          <span className="text-3xl font-serif font-bold text-[#1A1816] block">
            {formatPrice(grossVolumeCents)}
          </span>
          <span className="text-xs text-[#5C564E] block">
            {completedOrders.length} settled acquisitions
          </span>
        </div>

        <div className="bg-white border border-[#E8E2D4] p-6 rounded-lg shadow-xs space-y-2">
          <div className="flex justify-between items-center text-[#8E867B]">
            <span className="text-[10px] font-mono uppercase tracking-wider">Available Vault Valuation</span>
            <DollarSign className="w-4 h-4 text-[#B38838]" />
          </div>
          <span className="text-3xl font-serif font-bold text-[#1A1816] block">
            {formatPrice(totalInventoryValuationCents)}
          </span>
          <span className="text-xs text-[#5C564E] block">
            {availableBooks.length} titles available
          </span>
        </div>

        <div className="bg-white border border-[#E8E2D4] p-6 rounded-lg shadow-xs space-y-2">
          <div className="flex justify-between items-center text-[#8E867B]">
            <span className="text-[10px] font-mono uppercase tracking-wider">Active 15m Holds</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-3xl font-serif font-bold text-[#1A1816] block">
            {activeReservationsCount}
          </span>
          <Link
            href="/admin/reservations"
            className="text-xs text-[#B38838] hover:underline block"
          >
            Monitor real-time holds →
          </Link>
        </div>

        <div className="bg-white border border-[#E8E2D4] p-6 rounded-lg shadow-xs space-y-2">
          <div className="flex justify-between items-center text-[#8E867B]">
            <span className="text-[10px] font-mono uppercase tracking-wider">Pending Collector Offers</span>
            <Gavel className="w-4 h-4 text-[#7A202E]" />
          </div>
          <span className="text-3xl font-serif font-bold text-[#1A1816] block">
            {pendingOffersCount}
          </span>
          <Link
            href="/admin/offers"
            className="text-xs text-[#7A202E] font-medium hover:underline block"
          >
            Review &amp; respond to offers →
          </Link>
        </div>
      </div>

      {/* Two-Column Workbench Overview: Recent Orders & Recent Offers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white border border-[#E8E2D4] rounded-lg p-6 space-y-4 shadow-xs">
          <div className="flex justify-between items-center pb-3 border-b border-[#E8E2D4]">
            <h3 className="font-serif font-bold text-lg text-[#1A1816]">
              Recent Settled Acquisitions
            </h3>
            <Link
              href="/admin/orders"
              className="text-xs font-mono uppercase text-[#B38838] hover:underline"
            >
              View All Orders →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-xs text-[#8E867B] py-6 text-center italic">
              No orders logged yet.
            </p>
          ) : (
            <div className="divide-y divide-[#F4EFE6]">
              {recentOrders.map((o) => (
                <div key={o.id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-mono font-bold text-[#1A1816]">{o.orderNumber}</span>
                    <p className="text-[#5C564E]">{o.customerName} ({o.items.length} volume)</p>
                  </div>
                  <div className="text-right">
                    <span className="font-serif font-bold text-sm block">
                      {formatPrice(o.totalInCents)}
                    </span>
                    <span className="text-[10px] text-[#233D30] font-bold uppercase">
                      {o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Offers */}
        <div className="bg-white border border-[#E8E2D4] rounded-lg p-6 space-y-4 shadow-xs">
          <div className="flex justify-between items-center pb-3 border-b border-[#E8E2D4]">
            <h3 className="font-serif font-bold text-lg text-[#1A1816]">
              Incoming Collector Offers
            </h3>
            <Link
              href="/admin/offers"
              className="text-xs font-mono uppercase text-[#B38838] hover:underline"
            >
              Offer Workbench →
            </Link>
          </div>

          {recentOffers.length === 0 ? (
            <p className="text-xs text-[#8E867B] py-6 text-center italic">
              No offers submitted yet.
            </p>
          ) : (
            <div className="divide-y divide-[#F4EFE6]">
              {recentOffers.map((off) => (
                <div key={off.id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-serif font-bold text-[#1A1816] line-clamp-1">
                      {off.book.title}
                    </span>
                    <p className="text-[#5C564E]">By {off.guestName} ({off.guestEmail})</p>
                  </div>
                  <div className="text-right">
                    <span className="font-serif font-bold text-sm block text-[#7A202E]">
                      {formatPrice(off.offerAmountInCents)}
                    </span>
                    <span className="text-[10px] font-mono uppercase font-bold text-[#8E867B]">
                      {off.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
