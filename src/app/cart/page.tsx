"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/providers/CartProvider";
import { Clock, Trash2, ArrowRight, ShieldCheck, BookOpen, AlertTriangle, ArrowLeft } from "lucide-react";

export default function CartPage() {
  const { items, releaseBook, getRemainingSeconds, totalInCents } = useCart();

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="pb-6 border-b border-[#E8E2D4]">
        <Link
          href="/catalog"
          className="text-xs font-mono uppercase tracking-wider text-[#8E867B] hover:text-[#1A1816] flex items-center gap-1.5 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to The Vault</span>
        </Link>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1A1816]">
          Acquisition Portfolio &amp; Active Holds
        </h1>
        <p className="text-xs sm:text-sm text-[#5C564E] mt-1">
          Items below are under your exclusive 15-minute temporary reservation.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <BookOpen className="w-16 h-16 text-[#D9D1BF] mx-auto stroke-1" />
          <h2 className="font-serif italic text-2xl text-[#1A1816]">
            No volumes are currently under your reservation hold.
          </h2>
          <p className="text-xs text-[#8E867B] max-w-md mx-auto">
            When you select a rare title from our catalogue, it is reserved exclusively for you for 15 minutes to guarantee no competing collector acquires it simultaneously.
          </p>
          <div className="pt-2">
            <Link
              href="/catalog"
              className="px-6 py-3 bg-[#1A1816] hover:bg-[#B38838] text-white text-xs font-bold uppercase tracking-wider rounded transition-colors inline-block"
            >
              Enter The Vault Catalogue
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-8">
          {/* Items List (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Live Exclusivity Notice */}
            <div className="bg-[#FFF8E7] border border-[#EAD8B0] p-4 rounded-lg flex items-start gap-3">
              <Clock className="w-5 h-5 text-[#B38838] shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-[#7A5B18] block">
                  Active 15-Minute Exclusivity Guarantee
                </span>
                <span className="text-[#8A6720] mt-0.5 block leading-relaxed">
                  These singular copies are locked to your session. If your reservation timer reaches 0:00, the items will immediately re-enter the public marketplace.
                </span>
              </div>
            </div>

            <div className="divide-y divide-[#E8E2D4] border-y border-[#E8E2D4]">
              {items.map((item) => {
                const rem = getRemainingSeconds(item.reservedUntil);
                const isUrgent = rem > 0 && rem <= 180;

                return (
                  <div key={item.id} className="py-6 flex gap-5 items-start">
                    {/* Thumbnail */}
                    <div className="relative w-24 h-36 bg-[#EDE8DC] rounded border border-[#D9D1BF] overflow-hidden shrink-0 shadow-xs">
                      {item.coverImage ? (
                        <Image
                          src={item.coverImage}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">
                          Rare Book
                        </div>
                      )}
                    </div>

                    {/* Book Information */}
                    <div className="flex-1 flex flex-col justify-between h-36">
                      <div>
                        <div className="flex justify-between items-start">
                          <Link
                            href={`/catalog/${item.bookId}`}
                            className="font-serif font-bold text-lg text-[#1A1816] hover:text-[#B38838] line-clamp-1"
                          >
                            {item.title}
                          </Link>
                          <button
                            onClick={() => releaseBook(item.bookId)}
                            className="text-[#8E867B] hover:text-[#7A202E] p-1 transition-colors"
                            title="Release reservation hold"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-[#5C564E] italic mt-0.5">{item.author}</p>
                        <p className="text-[11px] text-[#8E867B] line-clamp-1 mt-0.5">{item.edition}</p>
                      </div>

                      <div className="flex justify-between items-end pt-2 border-t border-[#F4EFE6]">
                        {/* Countdown Badge */}
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-bold ${
                            isUrgent
                              ? "bg-red-100 text-red-800 border border-red-300 animate-pulse"
                              : "bg-[#F3EEDF] text-[#6E5520] border border-[#DFD5BF]"
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Hold expires in: {formatTimer(rem)}</span>
                        </div>

                        <span className="font-serif font-bold text-xl text-[#1A1816]">
                          {formatPrice(item.priceInCents)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Acquisition Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-[#E8E2D4] rounded-lg p-6 space-y-5 shadow-sm">
              <h3 className="font-serif font-bold text-xl text-[#1A1816] pb-3 border-b border-[#E8E2D4]">
                Acquisition Summary
              </h3>

              <div className="space-y-3 text-xs text-[#5C564E]">
                <div className="flex justify-between">
                  <span>Singular Volumes ({items.length})</span>
                  <span className="font-mono text-[#1A1816]">{formatPrice(totalInCents)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Archival White-Glove Packaging</span>
                  <span className="text-[#233D30] font-medium">Complimentary</span>
                </div>
                <div className="flex justify-between">
                  <span>Full Lloyd&apos;s Transit Insurance</span>
                  <span className="text-[#233D30] font-medium">Included</span>
                </div>
                <div className="flex justify-between">
                  <span>Cryptographic ABAA Verification</span>
                  <span className="text-[#233D30] font-medium">Included</span>
                </div>

                <div className="pt-3 border-t border-[#E8E2D4] flex justify-between items-baseline">
                  <span className="font-serif font-bold text-base text-[#1A1816]">Total Valuation</span>
                  <span className="font-serif font-bold text-2xl text-[#1A1816]">
                    {formatPrice(totalInCents)}
                  </span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full py-4 bg-[#1A1816] hover:bg-[#B38838] text-white text-xs font-bold uppercase tracking-widest text-center block rounded transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <span>Proceed to Secure Acquisition</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="pt-2 text-[11px] text-[#8E867B] space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#233D30] shrink-0" />
                  <span>Encrypted payment processing with Razorpay sandbox.</span>
                </div>
                <p>
                  Institutional purchase orders and museum wire transfers may also be coordinated via our London or New York curatorial desks.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
