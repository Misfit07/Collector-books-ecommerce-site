"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/providers/CartProvider";
import { useSession, signOut } from "next-auth/react";
import { BookOpen, ShoppingBag, ShieldCheck, User, Gavel, Search, Menu, X } from "lucide-react";

export default function Navbar() {
  const { itemCount, setIsCartOpen } = useCart();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/catalog?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#E8E2D4] text-[#1A1816]">
      {/* Top Guild Ribbon */}
      <div className="bg-[#1A1816] text-[#E8E2D4] text-[11px] font-sans tracking-widest uppercase py-1.5 px-4 text-center flex items-center justify-center gap-4 border-b border-[#2D2A26]">
        <span>ABAA & ILAB Certified Antiquarian Booksellers</span>
        <span className="hidden md:inline text-[#B38838]">•</span>
        <span className="hidden md:inline">Guaranteed Authenticity on All Signed Works</span>
        <span className="hidden lg:inline text-[#B38838]">•</span>
        <span className="hidden lg:inline">White-Glove Archival Packaging</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#5C564E] hover:text-[#1A1816]"
              aria-label="Open navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Logo / Crest */}
          <div className="flex-1 md:flex-none text-center md:text-left">
            <Link href="/" className="inline-block group">
              <span className="block font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#1A1816] group-hover:text-[#966E26] transition-colors">
                The Antiquarian Guild
              </span>
              <span className="block text-[10px] uppercase tracking-[0.25em] text-[#8E867B] -mt-1 font-medium">
                Rare Books & Manuscripts • Est. 1892
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium tracking-wide">
            <Link
              href="/catalog"
              className="text-[#1A1816] hover:text-[#B38838] transition-colors"
            >
              The Vault
            </Link>
            <Link
              href="/catalog?category=auctions"
              className="flex items-center gap-1.5 text-[#1A1816] hover:text-[#B38838] transition-colors"
            >
              <Gavel className="w-4 h-4 text-[#B38838]" />
              <span>Timed Auctions</span>
              <span className="bg-[#7A202E] text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                Live
              </span>
            </Link>
            <Link
              href="/catalog?signed=true"
              className="text-[#5C564E] hover:text-[#1A1816] transition-colors"
            >
              Signed Works
            </Link>
            <Link
              href="/catalog?curator=true"
              className="text-[#5C564E] hover:text-[#1A1816] transition-colors"
            >
              Curators&apos; Picks
            </Link>
          </nav>

          {/* Search bar + Action items */}
          <div className="flex items-center space-x-4">
            {/* Quick search input */}
            <form onSubmit={handleSearchSubmit} className="hidden lg:block relative">
              <input
                type="text"
                placeholder="Search author, title, provenance..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 pl-8 pr-3 py-1.5 text-xs bg-[#F4EFE6] border border-[#DDD6C5] rounded focus:outline-hidden focus:border-[#B38838] focus:w-64 transition-all"
              />
              <Search className="w-3.5 h-3.5 text-[#8E867B] absolute left-2.5 top-2.5" />
            </form>

            {/* Auth / Account link */}
            {session ? (
              <div className="relative group">
                <Link
                  href="/account"
                  className="flex items-center gap-1.5 text-xs text-[#5C564E] hover:text-[#1A1816] py-1.5 px-2 rounded hover:bg-[#F4EFE6] transition-colors"
                >
                  <User className="w-4 h-4 text-[#B38838]" />
                  <span className="hidden sm:inline font-medium">
                    {session.user?.name?.split(" ")[0] || "Collector"}
                  </span>
                </Link>
                {/* Dropdown */}
                <div className="hidden group-hover:block absolute right-0 mt-1 w-48 bg-[#FDFBF7] border border-[#E8E2D4] rounded shadow-lg py-1 z-50 text-xs">
                  <div className="px-4 py-2 border-b border-[#E8E2D4] text-[#5C564E]">
                    Signed in as <span className="font-bold text-[#1A1816]">{session.user?.email}</span>
                  </div>
                  <Link href="/account" className="block px-4 py-2 hover:bg-[#F4EFE6]">
                    Acquisition Ledger
                  </Link>
                  <Link href="/account/wishlist" className="block px-4 py-2 hover:bg-[#F4EFE6]">
                    Saved Wishlist
                  </Link>
                  <Link href="/account/offers" className="block px-4 py-2 hover:bg-[#F4EFE6]">
                    Offers Desk
                  </Link>
                  {(session.user as { role?: string })?.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2 text-[#7A202E] font-bold hover:bg-[#F4EFE6] border-t border-[#E8E2D4]"
                    >
                      Admin House
                    </Link>
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full text-left px-4 py-2 text-[#8E867B] hover:bg-[#F4EFE6] border-t border-[#E8E2D4]"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1 text-xs text-[#5C564E] hover:text-[#1A1816] py-1.5 px-2.5 rounded hover:bg-[#F4EFE6] transition-colors font-medium"
              >
                <User className="w-4 h-4 text-[#8E867B]" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-[#1A1816] hover:text-[#B38838] transition-colors"
              aria-label="View reserved books"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#B38838] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F7F3E9] border-t border-[#E8E2D4] px-4 pt-3 pb-6 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative mb-3">
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-[#DDD6C5] rounded"
            />
            <Search className="w-4 h-4 text-[#8E867B] absolute left-2.5 top-2.5" />
          </form>
          <Link
            href="/catalog"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-serif text-[#1A1816]"
          >
            The Vault (Catalog)
          </Link>
          <Link
            href="/catalog?category=auctions"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-base font-serif text-[#1A1816]"
          >
            <Gavel className="w-4 h-4 text-[#B38838]" />
            <span>Timed Auctions (Live)</span>
          </Link>
          <Link
            href="/catalog?signed=true"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-serif text-[#5C564E]"
          >
            Signed Copies & Inscriptions
          </Link>
          <Link
            href="/catalog?curator=true"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-serif text-[#5C564E]"
          >
            Curators&apos; Picks
          </Link>
          <div className="pt-2 border-t border-[#E8E2D4]">
            {session ? (
              <div className="space-y-1">
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1.5 text-sm text-[#1A1816] font-medium"
                >
                  My Collector Account ({session.user?.name})
                </Link>
                {(session.user as { role?: string })?.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1.5 text-sm text-[#7A202E] font-bold"
                  >
                    Curators&apos; Admin House
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="block py-1.5 text-sm text-[#8E867B]"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-[#1A1816]"
              >
                Sign In / Collector Register
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
