import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { DollarSign, ArrowLeft, Clock, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CollectorOffersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="pb-6 border-b border-[#E8E2D4] flex justify-between items-center">
        <div>
          <Link
            href="/account"
            className="text-xs font-mono uppercase tracking-wider text-[#8E867B] hover:text-[#1A1816] flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Collector Dossier</span>
          </Link>
          <h1 className="text-3xl font-serif font-bold text-[#1A1816]">
            Private Offer Submissions &amp; Negotiations
          </h1>
          <p className="text-xs sm:text-sm text-[#5C564E] mt-1">
            Review curatorial review status, counter-offers, and acquisition agreements.
          </p>
        </div>
      </div>

      <div className="pt-8">
        {user.offers.length === 0 ? (
          <div className="bg-white border border-[#E8E2D4] rounded-lg p-12 text-center space-y-3">
            <DollarSign className="w-12 h-12 text-[#D9D1BF] mx-auto stroke-1" />
            <h2 className="font-serif italic text-xl text-[#1A1816]">
              You have submitted no private acquisition offers.
            </h2>
            <p className="text-xs text-[#8E867B] max-w-sm mx-auto">
              Our curators welcome serious proposals on museum-grade and institutional volumes. You can propose an offer directly from any listing page.
            </p>
            <Link
              href="/catalog"
              className="inline-block mt-3 px-5 py-2.5 bg-[#1A1816] text-white text-xs uppercase tracking-wider rounded"
            >
              Browse Catalogue
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {user.offers.map((offer) => {
              const cover = offer.book.images[0]?.url || "";

              return (
                <div
                  key={offer.id}
                  className="bg-white border border-[#E8E2D4] rounded-lg p-6 space-y-4 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-[#E8E2D4] gap-2">
                    <span className="text-xs font-mono text-[#8E867B]">
                      Proposal Transmitted: {new Date(offer.createdAt).toLocaleDateString()}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs font-bold font-mono uppercase rounded ${
                        offer.status === "ACCEPTED"
                          ? "bg-green-100 text-green-800 border border-green-300"
                          : offer.status === "COUNTERED"
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : offer.status === "REJECTED"
                          ? "bg-red-100 text-red-800 border border-red-300"
                          : "bg-[#F4EFE6] text-[#6E5520] border border-[#DDD6C5]"
                      }`}
                    >
                      {offer.status}
                    </span>
                  </div>

                  <div className="flex gap-4 items-center">
                    <div className="relative w-16 h-24 bg-[#EDE8DC] rounded border border-[#DDD6C5] overflow-hidden shrink-0">
                      {cover && (
                        <Image
                          src={cover}
                          alt={offer.book.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      )}
                    </div>
                    <div>
                      <Link href={`/catalog/${offer.book.slug}`}>
                        <h3 className="font-serif font-bold text-lg text-[#1A1816] hover:text-[#B38838]">
                          {offer.book.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-[#5C564E] italic">{offer.book.author}</p>
                      <div className="flex items-baseline gap-3 text-xs mt-2">
                        <span className="text-[#8E867B]">List Price: {formatPrice(offer.book.priceInCents)}</span>
                        <span className="font-bold text-[#1A1816]">Your Offer: {formatPrice(offer.offerAmountInCents)}</span>
                      </div>
                    </div>
                  </div>

                  {offer.buyerNote && (
                    <div className="p-3 bg-[#FBF9F5] rounded text-xs text-[#5C564E] border border-[#E8E2D4]">
                      <strong>Your Note:</strong> {offer.buyerNote}
                    </div>
                  )}

                  {/* Counter offer details */}
                  {offer.status === "COUNTERED" && offer.counterAmountInCents && (
                    <div className="p-4 bg-[#FFF8E7] border border-[#EAD8B0] rounded space-y-2">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-[#7A5B18] text-xs uppercase tracking-wider">
                          Curatorial Counter-Proposal
                        </span>
                        <span className="font-serif font-bold text-lg text-[#1A1816]">
                          {formatPrice(offer.counterAmountInCents)}
                        </span>
                      </div>
                      {offer.adminNote && (
                        <p className="text-xs text-[#8A6720]">
                          <strong>Curators&apos; Note:</strong> {offer.adminNote}
                        </p>
                      )}
                      <div className="pt-2">
                        <Link
                          href={`/catalog/${offer.book.slug}`}
                          className="px-4 py-2 bg-[#1A1816] hover:bg-[#B38838] text-white text-xs font-bold uppercase tracking-wider rounded inline-flex items-center gap-1.5 transition-colors"
                        >
                          <span>Review &amp; Reserve at Counter Valuation</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
