"use client";

import React, { useState } from "react";
import SafeBookImage from "@/components/common/SafeBookImage";
import Link from "next/link";
import { Offer, BookListing, BookImage } from "@prisma/client";
import { Check, X, CornerUpRight, ArrowLeft } from "lucide-react";

type OfferWithBook = Offer & {
  book: BookListing & {
    images: BookImage[];
  };
};

export default function AdminOffersClient({ initialOffers }: { initialOffers: OfferWithBook[] }) {
  const [offers, setOffers] = useState(initialOffers);
  const [counterModalOfferId, setCounterModalOfferId] = useState<string | null>(null);
  const [counterPrice, setCounterPrice] = useState<string>("");
  const [adminNote, setAdminNote] = useState<string>("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const handleAction = async (offerId: string, action: "ACCEPT" | "REJECT") => {
    setLoadingId(offerId);
    try {
      const res = await fetch("/api/admin/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId, action }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOffers(
          offers.map((o) =>
            o.id === offerId ? { ...o, status: action === "ACCEPT" ? "ACCEPTED" : "REJECTED" } : o
          )
        );
      } else {
        alert(data.error || "Action failed.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleCounterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!counterModalOfferId || !counterPrice) return;

    setLoadingId(counterModalOfferId);
    try {
      const res = await fetch("/api/admin/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offerId: counterModalOfferId,
          action: "COUNTER",
          counterAmountInCents: Math.round(parseFloat(counterPrice) * 100),
          adminNote,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOffers(
          offers.map((o) =>
            o.id === counterModalOfferId
              ? {
                  ...o,
                  status: "COUNTERED",
                  counterAmountInCents: Math.round(parseFloat(counterPrice) * 100),
                  adminNote,
                }
              : o
          )
        );
        setCounterModalOfferId(null);
      } else {
        alert(data.error || "Counter failed.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="pb-6 border-b border-[#E8E2D4] flex justify-between items-center">
        <div>
          <Link
            href="/admin"
            className="text-xs font-mono uppercase tracking-wider text-[#8E867B] hover:text-[#1A1816] flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Executive Overview</span>
          </Link>
          <h1 className="text-3xl font-serif font-bold text-[#1A1816]">
            Private Offer Negotiation Desk
          </h1>
          <p className="text-xs text-[#5C564E] mt-1 font-mono">
            {offers.filter((o) => o.status === "PENDING").length} Proposals Awaiting Curatorial Response
          </p>
        </div>
      </div>

      {offers.length === 0 ? (
        <div className="bg-white border border-[#E8E2D4] rounded-lg p-12 text-center text-xs text-[#8E867B]">
          No offers currently recorded in the registry.
        </div>
      ) : (
        <div className="space-y-6">
          {offers.map((offer) => {
            const cover = offer.book.images[0]?.url || "";
            const isPending = offer.status === "PENDING";

            return (
              <div
                key={offer.id}
                className="bg-white border border-[#E8E2D4] rounded-lg p-6 space-y-4 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-[#E8E2D4] gap-2 text-xs">
                  <div>
                    <span className="font-bold text-[#1A1816]">{offer.guestName}</span>{" "}
                    <span className="text-[#8E867B]">({offer.guestEmail})</span>
                    <span className="text-[#8E867B] ml-3">
                      Received: {new Date(offer.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded ${
                      offer.status === "ACCEPTED"
                        ? "bg-green-100 text-green-800"
                        : offer.status === "COUNTERED"
                        ? "bg-amber-100 text-amber-800"
                        : offer.status === "REJECTED"
                        ? "bg-red-100 text-red-800"
                        : "bg-[#F4EFE6] text-[#7A5B18]"
                    }`}
                  >
                    {offer.status}
                  </span>
                </div>

                <div className="flex gap-4 items-center">
                  <div className="relative w-14 h-20 bg-[#EDE8DC] rounded border border-[#DDD6C5] overflow-hidden shrink-0">
                    <SafeBookImage
                      src={cover}
                      alt={offer.book.title}
                      title={offer.book.title}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <div className="flex-1">
                    <Link href={`/catalog/${offer.book.slug}`}>
                      <h3 className="font-serif font-bold text-base text-[#1A1816] hover:text-[#B38838]">
                        {offer.book.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-[#5C564E] italic">{offer.book.author}</p>
                    <div className="flex items-baseline gap-4 mt-2 text-xs">
                      <span className="text-[#8E867B]">Catalog Price: {formatPrice(offer.book.priceInCents)}</span>
                      <span className="font-serif font-bold text-base text-[#7A202E]">
                        Buyer Offer: {formatPrice(offer.offerAmountInCents)}
                      </span>
                      {offer.counterAmountInCents && (
                        <span className="font-serif font-bold text-base text-[#B38838]">
                          Countered: {formatPrice(offer.counterAmountInCents)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {offer.buyerNote && (
                  <div className="p-3 bg-[#FBF9F5] rounded text-xs text-[#5C564E] border border-[#E8E2D4]">
                    <strong>Buyer Note:</strong> {offer.buyerNote}
                  </div>
                )}

                {/* Curators' actions */}
                {isPending && (
                  <div className="pt-3 border-t border-[#E8E2D4] flex flex-wrap gap-2 justify-end">
                    <button
                      onClick={() => handleAction(offer.id, "REJECT")}
                      disabled={loadingId === offer.id}
                      className="px-3.5 py-1.5 bg-[#F4EFE6] hover:bg-red-100 text-[#7A202E] rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Decline</span>
                    </button>
                    <button
                      onClick={() => {
                        setCounterModalOfferId(offer.id);
                        setCounterPrice(Math.round((offer.book.priceInCents * 0.95) / 100).toString());
                      }}
                      disabled={loadingId === offer.id}
                      className="px-3.5 py-1.5 bg-[#F4EFE6] hover:bg-[#E8E2D4] text-[#1A1816] rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1"
                    >
                      <CornerUpRight className="w-3.5 h-3.5 text-[#B38838]" />
                      <span>Propose Counter</span>
                    </button>
                    <button
                      onClick={() => handleAction(offer.id, "ACCEPT")}
                      disabled={loadingId === offer.id}
                      className="px-4 py-1.5 bg-[#1A1816] hover:bg-[#233D30] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow"
                    >
                      <Check className="w-3.5 h-3.5 text-green-400" />
                      <span>Accept Formal Offer</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Counter Offer Modal */}
      {counterModalOfferId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E2D4] rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-serif font-bold text-lg text-[#1A1816]">
              Submit Official Curatorial Counter-Proposal
            </h3>
            <form onSubmit={handleCounterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#1A1816] mb-1">
                  Counter-Proposal Price ($ USD) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="50"
                  value={counterPrice}
                  onChange={(e) => setCounterPrice(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#DDD6C5] rounded bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1A1816] mb-1">
                  Curatorial Terms or Note
                </label>
                <textarea
                  rows={3}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="e.g. We can agree to this valuation with white-glove transit included..."
                  className="w-full p-2.5 text-xs border border-[#DDD6C5] rounded bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#E8E2D4]">
                <button
                  type="button"
                  onClick={() => setCounterModalOfferId(null)}
                  className="px-4 py-2 text-xs text-[#5C564E]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1A1816] hover:bg-[#B38838] text-white text-xs font-bold uppercase tracking-wider rounded"
                >
                  Dispatch Counter-Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
