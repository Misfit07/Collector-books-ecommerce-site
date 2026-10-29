"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookListing, BookImage, NotificationSubscription } from "@prisma/client";
import { useCart } from "@/components/providers/CartProvider";
import { Heart, Bell, Trash2, ArrowLeft, CheckCircle2 } from "lucide-react";

type WishlistEntry = {
  id: string;
  bookId: string;
  book: BookListing & {
    images: BookImage[];
  };
};

interface WishlistClientProps {
  initialWishlists: WishlistEntry[];
  initialSubscriptions: NotificationSubscription[];
  userEmail: string;
}

export default function WishlistClientView({
  initialWishlists,
  initialSubscriptions,
  userEmail,
}: WishlistClientProps) {
  const { reserveBook } = useCart();
  const [wishlists, setWishlists] = useState(initialWishlists);
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [authorInput, setAuthorInput] = useState("");
  const [subSuccess, setSubSuccess] = useState(false);

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const handleRemoveWishlist = async (bookId: string) => {
    try {
      await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      });
      setWishlists(wishlists.filter((w) => w.bookId !== bookId));
    } catch {
      alert("Failed to remove item.");
    }
  };

  const handleAddAuthorAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorInput.trim()) return;

    try {
      const res = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          type: "AUTHOR_NEW_LISTINGS",
          authorName: authorInput.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubscriptions([...subscriptions, data.subscription]);
        setAuthorInput("");
        setSubSuccess(true);
        setTimeout(() => setSubSuccess(false), 3000);
      }
    } catch {
      alert("Failed to create alert.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
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
            Monitored Titles &amp; Author Alerts
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-8">
        {/* Wishlist Items (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <h2 className="text-xl font-serif font-bold text-[#1A1816] pb-2 border-b border-[#E8E2D4]">
            Saved Masterpieces ({wishlists.length})
          </h2>

          {wishlists.length === 0 ? (
            <div className="bg-white border border-[#E8E2D4] rounded-lg p-10 text-center space-y-3">
              <Heart className="w-12 h-12 text-[#D9D1BF] mx-auto stroke-1" />
              <p className="font-serif italic text-base text-[#1A1816]">
                Your wishlist holds no saved titles.
              </p>
              <p className="text-xs text-[#8E867B]">
                Click the heart emblem on any catalogue listing to save rare specimens for private study.
              </p>
              <Link
                href="/catalog"
                className="inline-block mt-2 px-5 py-2.5 bg-[#1A1816] text-white text-xs uppercase tracking-wider rounded"
              >
                Explore Catalogue
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {wishlists.map((entry) => {
                const book = entry.book;
                const cover = book.images[0]?.url || "";

                return (
                  <div
                    key={entry.id}
                    className="bg-white border border-[#E8E2D4] rounded-lg p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between shadow-xs hover:border-[#B38838] transition-all"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="relative w-16 h-24 bg-[#EDE8DC] rounded border border-[#DDD6C5] overflow-hidden shrink-0">
                        {cover && (
                          <Image
                            src={cover}
                            alt={book.title}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        )}
                      </div>
                      <div>
                        <Link href={`/catalog/${book.slug}`}>
                          <h3 className="font-serif font-bold text-base text-[#1A1816] hover:text-[#B38838]">
                            {book.title}
                          </h3>
                        </Link>
                        <p className="text-xs text-[#5C564E] italic">{book.author}</p>
                        <div className="flex gap-2 items-center text-[11px] text-[#8E867B] font-mono mt-1">
                          <span>{book.year}</span>
                          <span>•</span>
                          <span>Grade: {book.conditionGrade}</span>
                          <span>•</span>
                          <span className={book.status === "AVAILABLE" ? "text-green-700 font-bold" : "text-amber-700"}>
                            {book.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto gap-3">
                      <span className="font-serif font-bold text-base text-[#1A1816]">
                        {formatPrice(book.priceInCents)}
                      </span>

                      <div className="flex items-center gap-2">
                        {book.status === "AVAILABLE" && (
                          <button
                            onClick={() => reserveBook(book.id)}
                            className="px-3 py-1.5 bg-[#1A1816] hover:bg-[#B38838] text-white text-[11px] font-bold uppercase tracking-wider rounded transition-colors"
                          >
                            Reserve Hold
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveWishlist(book.id)}
                          className="p-1.5 text-[#8E867B] hover:text-[#7A202E]"
                          title="Remove from saved"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Author Alerts Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-[#E8E2D4] rounded-lg p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#1A1816] uppercase tracking-wider pb-2 border-b border-[#E8E2D4]">
              <Bell className="w-4 h-4 text-[#B38838]" />
              <span>Curatorial Author Notifications</span>
            </div>

            <p className="text-xs text-[#5C564E] leading-relaxed">
              Specify authors or historical creators. When newly authenticated first editions matching your criteria enter our vault, you will receive priority early access.
            </p>

            {subSuccess && (
              <div className="p-3 bg-green-50 text-green-800 text-xs rounded border border-green-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Author alert catalogued successfully!</span>
              </div>
            )}

            <form onSubmit={handleAddAuthorAlert} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#1A1816] mb-1">
                  Author / Creator Name
                </label>
                <input
                  type="text"
                  required
                  value={authorInput}
                  onChange={(e) => setAuthorInput(e.target.value)}
                  placeholder="e.g. F. Scott Fitzgerald, Tolkien..."
                  className="w-full px-3 py-2 text-xs border border-[#DDD6C5] rounded bg-white"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-[#1A1816] hover:bg-[#B38838] text-white text-xs font-bold uppercase tracking-wider rounded transition-colors"
              >
                Set Acquisition Alert
              </button>
            </form>

            {subscriptions.length > 0 && (
              <div className="pt-4 border-t border-[#E8E2D4] space-y-2">
                <span className="text-[10px] font-mono uppercase text-[#8E867B] tracking-wider block">
                  Active Monitored Authors
                </span>
                <ul className="space-y-1 text-xs text-[#1A1816]">
                  {subscriptions.map((s) => (
                    <li key={s.id} className="flex justify-between items-center bg-[#F4EFE6] px-2.5 py-1 rounded">
                      <span className="font-serif italic">{s.authorName || "General Registry"}</span>
                      <span className="text-[10px] text-[#233D30] font-mono">Active</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
