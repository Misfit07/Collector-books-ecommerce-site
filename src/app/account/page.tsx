import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SafeBookImage from "@/components/common/SafeBookImage";
import { ShieldCheck, Award, Heart, DollarSign, Package, ArrowRight, Gavel, Gift, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      orders: {
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
      },
      offers: {
        orderBy: { createdAt: "desc" },
        include: {
          book: {
            include: {
              images: { where: { isCover: true }, take: 1 },
            },
          },
        },
      },
      wishlists: {
        include: {
          book: {
            include: {
              images: { where: { isCover: true }, take: 1 },
            },
          },
        },
      },
      bids: {
        orderBy: { createdAt: "desc" },
        include: {
          auction: {
            include: { book: true },
          },
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const totalAcquisitionCents = user.orders
    .filter((o) => o.status === "PAID" || o.status === "SHIPPED")
    .reduce((sum, o) => sum + o.totalInCents, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Profile Header */}
      <div className="pb-8 border-b border-[#E8E2D4] flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#B38838]">
            Member #{user.id.slice(-6).toUpperCase()} • {user.role === "ADMIN" ? "Curator Admin" : "Registered Collector"}
          </span>
          <h1 className="text-3xl font-serif font-bold text-[#1A1816] mt-1">
            {user.name || "Collector"}
          </h1>
          <p className="text-xs text-[#5C564E] font-mono mt-0.5">{user.email}</p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/account/wishlist"
            className="px-4 py-2 bg-white border border-[#DDD6C5] rounded text-xs font-medium text-[#1A1816] hover:bg-[#F4EFE6] transition-colors flex items-center gap-1.5"
          >
            <Heart className="w-3.5 h-3.5 text-red-500" />
            <span>Wishlist ({user.wishlists.length})</span>
          </Link>
          <Link
            href="/account/offers"
            className="px-4 py-2 bg-white border border-[#DDD6C5] rounded text-xs font-medium text-[#1A1816] hover:bg-[#F4EFE6] transition-colors flex items-center gap-1.5"
          >
            <DollarSign className="w-3.5 h-3.5 text-[#B38838]" />
            <span>Offers ({user.offers.length})</span>
          </Link>
          {user.role === "ADMIN" && (
            <Link
              href="/admin"
              className="px-4 py-2 bg-[#7A202E] hover:bg-[#581620] text-white rounded text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Curators&apos; House
            </Link>
          )}
        </div>
      </div>

      {/* Patron Reward Points Banner */}
      <div className="bg-[#FAF7F0] border border-[#E0D7C3] rounded-lg p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#1A1816] text-[#C59B27] flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-[#B38838] font-bold">
                Guild Patronage Standing
              </span>
              <span className="text-[10px] font-mono uppercase bg-[#1E3A2F] text-[#E8F2EC] px-2 py-0.5 rounded font-bold">
                Active Member
              </span>
            </div>
            <h3 className="font-serif font-bold text-xl text-[#1A1816]">
              {user.rewardPoints} Guild Patron Points
            </h3>
            <p className="text-xs text-[#5C564E] mt-0.5">
              Worth ${(user.rewardPoints * 0.10).toFixed(2)} in acquisition credit &bull; Unlocks spins at the Curio Wheel
            </p>
          </div>
        </div>

        <Link
          href="/catalog"
          className="px-4 py-2 bg-[#1A1816] hover:bg-[#B38838] text-white text-xs font-bold uppercase tracking-wider rounded transition-colors flex items-center gap-1.5"
        >
          <span>Use Points in Catalogue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 py-8">
        <div className="bg-white border border-[#E8E2D4] p-5 rounded-lg shadow-xs">
          <span className="text-[10px] font-mono uppercase text-[#8E867B] tracking-wider block">
            Orders Completed
          </span>
          <span className="text-2xl font-serif font-bold text-[#1A1816] mt-1 block">
            {user.orders.length}
          </span>
          <span className="text-[11px] text-[#5C564E] mt-0.5 block">
            Total Valued: {formatPrice(totalAcquisitionCents)}
          </span>
        </div>

        <div className="bg-white border border-[#E8E2D4] p-5 rounded-lg shadow-xs">
          <span className="text-[10px] font-mono uppercase text-[#8E867B] tracking-wider block">
            Saved to Wishlist
          </span>
          <span className="text-2xl font-serif font-bold text-[#1A1816] mt-1 block">
            {user.wishlists.length}
          </span>
          <span className="text-[11px] text-[#5C564E] mt-0.5 block">
            Monitored volumes
          </span>
        </div>

        <div className="bg-white border border-[#E8E2D4] p-5 rounded-lg shadow-xs">
          <span className="text-[10px] font-mono uppercase text-[#8E867B] tracking-wider block">
            Submitted Offers
          </span>
          <span className="text-2xl font-serif font-bold text-[#1A1816] mt-1 block">
            {user.offers.length}
          </span>
          <span className="text-[11px] text-[#5C564E] mt-0.5 block">
            Direct curator proposals
          </span>
        </div>

        <div className="bg-white border border-[#E8E2D4] p-5 rounded-lg shadow-xs">
          <span className="text-[10px] font-mono uppercase text-[#8E867B] tracking-wider block">
            Live Auction Bids
          </span>
          <span className="text-2xl font-serif font-bold text-[#1A1816] mt-1 block">
            {user.bids.length}
          </span>
          <span className="text-[11px] text-[#5C564E] mt-0.5 block">
            Timed bidding lots
          </span>
        </div>
      </div>

      {/* Acquisition Ledger & Certificates */}
      <div className="space-y-6 pt-6">
        <div className="flex justify-between items-baseline border-b border-[#E8E2D4] pb-3">
          <h2 className="text-2xl font-serif font-bold text-[#1A1816]">
            Order History
          </h2>
          <span className="text-xs text-[#8E867B] font-mono">
            {user.orders.length} Records Catalogued
          </span>
        </div>

        {user.orders.length === 0 ? (
          <div className="bg-white border border-[#E8E2D4] rounded-lg p-10 text-center space-y-3">
            <Package className="w-12 h-12 text-[#D9D1BF] mx-auto stroke-1" />
            <p className="font-serif italic text-lg text-[#1A1816]">
              Your acquisition ledger contains no past entries.
            </p>
            <p className="text-xs text-[#8E867B] max-w-sm mx-auto">
              Acquired rare first editions will appear here along with their cryptographic certificates of authenticity and transit tracking.
            </p>
            <Link
              href="/catalog"
              className="inline-block mt-3 px-5 py-2.5 bg-[#1A1816] text-white text-xs uppercase tracking-wider font-medium rounded hover:bg-[#B38838] transition-colors"
            >
              Explore Catalogue
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {user.orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-[#E8E2D4] rounded-lg p-6 space-y-4 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-3 border-b border-[#E8E2D4] gap-2">
                  <div>
                    <span className="text-xs font-mono font-bold text-[#1A1816]">
                      Order #{order.orderNumber}
                    </span>
                    <span className="text-xs text-[#8E867B] ml-3">
                      Recorded: {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 bg-[#E8F2EC] text-[#233D30] text-[11px] font-bold uppercase rounded">
                      {order.status}
                    </span>
                    <Link
                      href={`/orders/${order.orderNumber}`}
                      className="text-xs font-medium text-[#B38838] hover:underline"
                    >
                      View Deed &amp; Receipt →
                    </Link>
                  </div>
                </div>

                <div className="divide-y divide-[#F4EFE6]">
                  {order.items.map((item) => {
                    const cover = item.book.images[0]?.url || "";
                    const cert = item.book.certificate;

                    return (
                      <div key={item.id} className="py-3 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-16 bg-[#EDE8DC] rounded overflow-hidden shrink-0 border border-[#DDD6C5]">
                            <SafeBookImage
                              src={cover}
                              alt={item.title}
                              title={item.title}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                          <div>
                            <h4 className="font-serif font-bold text-sm text-[#1A1816]">
                              {item.title}
                            </h4>
                            <p className="text-xs text-[#5C564E] italic">{item.author}</p>
                            {cert && (
                              <Link
                                href={`/certificate/${cert.certificateNumber}`}
                                className="inline-flex items-center gap-1 text-[11px] text-[#B38838] hover:underline font-mono mt-0.5"
                              >
                                <Award className="w-3 h-3" />
                                <span>Cert #{cert.certificateNumber}</span>
                              </Link>
                            )}
                          </div>
                        </div>

                        <span className="font-serif font-bold text-sm text-[#1A1816]">
                          {formatPrice(item.priceInCents)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {order.curioPrize && (
                  <div className="px-5 py-2.5 bg-[#FAF7F0] border-t border-[#E8E2D4] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-[#5C564E]">
                      <Gift className="w-3.5 h-3.5 text-[#B38838]" />
                      <span>Boxed Parcel Curio: <strong className="text-[#1A1816]">{order.curioPrize}</strong></span>
                    </div>
                    {order.curioPrizeTier && (
                      <span className="text-[10px] font-mono uppercase bg-[#1A1816] text-[#E8D196] px-1.5 py-0.5 rounded">
                        {order.curioPrizeTier}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
