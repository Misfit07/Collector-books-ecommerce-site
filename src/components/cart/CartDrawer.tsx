"use client";

import React from "react";
import { useCart } from "@/components/providers/CartProvider";
import { X, Clock, Trash2, ArrowRight, ShieldCheck, BookOpen } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, releaseBook, getRemainingSeconds, totalInCents } = useCart();

  if (!isCartOpen) return null;

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FDFBF7] border-l border-[#E8E2D4] shadow-2xl flex flex-col text-[#1A1816]">
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#E8E2D4] bg-[#F7F3E9] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#B38838]" />
              <h2 className="text-xl font-serif font-bold tracking-wide">Reserved Portfolio</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-[#5C564E] hover:text-[#1A1816] rounded-md transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Notice banner */}
          <div className="bg-[#FFF8E7] px-6 py-3 border-b border-[#EAD8B0] flex items-start gap-2 text-xs text-[#7A5B18]">
            <Clock className="w-4 h-4 shrink-0 mt-0.5 text-[#B38838]" />
            <div>
              <p className="font-semibold">15-Minute Exclusive Hold Active</p>
              <p className="mt-0.5 text-[#8A6720]">
                These unique volumes are removed from the market for you. If the clock lapses, they return to public availability.
              </p>
            </div>
          </div>

          {/* Items list */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-[#E8E2D4]">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#5C564E]">
                <BookOpen className="w-12 h-12 text-[#D9D1BF] mb-3 stroke-1" />
                <p className="text-lg font-serif italic">Your acquisition portfolio is empty.</p>
                <p className="text-xs text-[#8E867B] mt-1">
                  Explore our curated catalogue to reserve rare first editions and signed manuscripts.
                </p>
                <Link
                  href="/catalog"
                  onClick={() => setIsCartOpen(false)}
                  className="mt-5 px-5 py-2.5 bg-[#1A1816] text-[#FDFBF7] text-xs font-medium tracking-wider uppercase rounded hover:bg-[#B38838] transition-colors"
                >
                  Browse Catalogue
                </Link>
              </div>
            ) : (
              items.map((item) => {
                const remSeconds = getRemainingSeconds(item.reservedUntil);
                const isUrgent = remSeconds > 0 && remSeconds <= 180; // under 3 mins

                return (
                  <div key={item.id} className="py-4 flex gap-4 items-start">
                    {/* Cover thumbnail */}
                    <div className="relative w-20 h-28 bg-[#EDE8DC] rounded border border-[#D9D1BF] overflow-hidden shrink-0 shadow-xs">
                      {item.coverImage ? (
                        <Image
                          src={item.coverImage}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">
                          Rare Book
                        </div>
                      )}
                    </div>

                    {/* Book info & timer */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-1">
                        <Link
                          href={`/catalog/${item.bookId}`}
                          onClick={() => setIsCartOpen(false)}
                          className="font-serif font-bold text-base hover:text-[#B38838] transition-colors line-clamp-2"
                        >
                          {item.title}
                        </Link>
                        <button
                          onClick={() => releaseBook(item.bookId)}
                          className="text-[#8E867B] hover:text-[#7A202E] p-1 transition-colors"
                          title="Release hold"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xs text-[#5C564E] italic mt-0.5">{item.author}</p>
                      <p className="text-[11px] text-[#8E867B] line-clamp-1 mt-0.5">{item.edition}</p>

                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-serif font-bold text-base text-[#1A1816]">
                          {formatPrice(item.priceInCents)}
                        </span>

                        {/* Countdown Badge */}
                        <div
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold transition-colors ${
                            isUrgent
                              ? "bg-red-100 text-red-800 animate-pulse border border-red-300"
                              : "bg-[#F3EEDF] text-[#6E5520] border border-[#DFD5BF]"
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>{formatTimer(remSeconds)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout CTA */}
          {items.length > 0 && (
            <div className="p-6 bg-[#F7F3E9] border-t border-[#E8E2D4] space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-xs uppercase tracking-wider text-[#5C564E] font-medium">
                  Total Valuation
                </span>
                <span className="text-2xl font-serif font-bold text-[#1A1816]">
                  {formatPrice(totalInCents)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#5C564E]">
                <ShieldCheck className="w-4 h-4 text-[#233D30] shrink-0" />
                <span>Includes ABAA Certificate of Authenticity & insured white-glove shipping.</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link
                  href="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="px-4 py-3 bg-[#EAE3D2] text-[#1A1816] text-xs font-medium uppercase tracking-wider text-center rounded hover:bg-[#DDD4C0] transition-colors"
                >
                  View Ledger
                </Link>
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="px-4 py-3 bg-[#1A1816] text-[#FDFBF7] text-xs font-medium uppercase tracking-wider text-center rounded hover:bg-[#B38838] transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Acquire Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
