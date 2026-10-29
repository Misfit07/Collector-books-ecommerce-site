"use client";

import React, { useState, useEffect } from "react";
import SafeBookImage from "@/components/common/SafeBookImage";
import Link from "next/link";
import { CartReservation, BookListing, BookImage } from "@prisma/client";
import { Clock, Trash2, ArrowLeft, ShieldAlert } from "lucide-react";

type ReservationWithBook = CartReservation & {
  book: BookListing & {
    images: BookImage[];
  };
};

export default function AdminReservationsClient({
  initialReservations,
}: {
  initialReservations: ReservationWithBook[];
}) {
  const [reservations, setReservations] = useState(initialReservations);
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const getRemainingMinutes = (reservedUntil: Date | string) => {
    const diff = new Date(reservedUntil).getTime() - Date.now();
    if (diff <= 0) return "Expired (Cleaning)";
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins}m ${secs < 10 ? "0" : ""}${secs}s`;
  };

  const handleForceRelease = async (reservationId: string) => {
    if (!confirm("Are you sure you want to forcibly release this 15-minute reservation hold?")) {
      return;
    }

    try {
      const res = await fetch("/api/admin/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservationId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReservations(reservations.filter((r) => r.id !== reservationId));
      } else {
        alert(data.error || "Failed to release reservation.");
      }
    } catch {
      alert("Network error.");
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
            Active Cart 15-Minute Exclusivity Holds
          </h1>
          <p className="text-xs text-[#5C564E] mt-1 font-mono">
            {reservations.length} Singularity Locks Active in System
          </p>
        </div>
      </div>

      {reservations.length === 0 ? (
        <div className="bg-white border border-[#E8E2D4] rounded-lg p-12 text-center text-xs text-[#8E867B] space-y-2">
          <Clock className="w-8 h-8 text-[#DDD6C5] mx-auto" />
          <p className="font-serif italic text-base text-[#1A1816]">
            No singular volumes are currently held under cart reservations.
          </p>
          <p>All items in the catalogue are available for public contemplation.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E8E2D4] rounded-lg overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs divide-y divide-[#E8E2D4]">
            <thead className="bg-[#F7F3E9] text-[#1A1816] font-serif font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Held Specimen</th>
                <th className="px-4 py-3.5">Collector Session</th>
                <th className="px-4 py-3.5">Valuation</th>
                <th className="px-4 py-3.5">Time Remaining</th>
                <th className="px-5 py-3.5 text-right">Force Release</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4EFE6] text-[#5C564E]">
              {reservations.map((res) => {
                const cover = res.book.images[0]?.url || "";
                return (
                  <tr key={res.id} className="hover:bg-[#FDFBF7] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-14 bg-[#EDE8DC] rounded overflow-hidden shrink-0 border border-[#DDD6C5]">
                          <SafeBookImage
                            src={cover}
                            alt={res.book.title}
                            title={res.book.title}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                        <div>
                          <Link
                            href={`/catalog/${res.book.slug}`}
                            className="font-serif font-bold text-sm text-[#1A1816] hover:text-[#B38838]"
                          >
                            {res.book.title}
                          </Link>
                          <span className="text-[10px] text-[#8E867B] block">
                            {res.book.author}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 font-mono text-[11px]">
                      {res.sessionId.slice(0, 16)}...
                    </td>

                    <td className="px-4 py-4 font-serif font-bold text-[#1A1816]">
                      {formatPrice(res.book.priceInCents)}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded bg-[#FFF8E7] text-[#7A5B18] border border-[#EAD8B0] font-mono font-bold text-[11px] inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#B38838]" />
                        <span>{getRemainingMinutes(res.reservedUntil)}</span>
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleForceRelease(res.id)}
                        className="px-3 py-1 bg-red-50 hover:bg-red-100 text-[#7A202E] border border-red-200 rounded text-[11px] font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1"
                        title="Force release back to public available stock"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Force Release</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
