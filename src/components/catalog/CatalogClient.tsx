"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookListing, BookImage } from "@prisma/client";
import { useCart } from "@/components/providers/CartProvider";
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Feather,
  Clock,
  Sparkles,
  ChevronDown,
} from "lucide-react";

type BookWithImages = BookListing & {
  images: BookImage[];
};

interface CatalogClientProps {
  initialBooks: BookWithImages[];
  initialQuery?: string;
  initialCategory?: string;
  initialSigned?: boolean;
  initialCurator?: boolean;
}

export default function CatalogClient({
  initialBooks,
  initialQuery = "",
  initialCategory = "",
  initialSigned = false,
  initialCurator = false,
}: CatalogClientProps) {
  const { reserveBook, items: cartItems } = useCart();
  const [reservingId, setReservingId] = useState<string | null>(null);

  // Filter states
  const [search, setSearch] = useState(initialQuery);
  const [selectedAuthor, setSelectedAuthor] = useState("");
  const [minYear, setMinYear] = useState<string>("");
  const [maxYear, setMaxYear] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedDustJacket, setSelectedDustJacket] = useState<string[]>([]);
  const [signedOnly, setSignedOnly] = useState<boolean>(initialSigned);
  const [firstEditionOnly, setFirstEditionOnly] = useState<boolean>(false);
  const [antiquarianOnly, setAntiquarianOnly] = useState<boolean>(false);
  const [selectedTag, setSelectedTag] = useState<string>(initialCategory === "auctions" ? "auctions" : "");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Distinct authors and tags for filters
  const authors = useMemo(() => {
    const list = Array.from(new Set(initialBooks.map((b) => b.author))).sort();
    return list;
  }, [initialBooks]);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    initialBooks.forEach((b) => {
      b.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .forEach((t) => tagSet.add(t));
    });
    return Array.from(tagSet).sort();
  }, [initialBooks]);

  // Filtered books logic
  const filteredBooks = useMemo(() => {
    return initialBooks.filter((book) => {
      // Search text
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = book.title.toLowerCase().includes(q);
        const matchesAuthor = book.author.toLowerCase().includes(q);
        const matchesPublisher = book.publisher.toLowerCase().includes(q);
        const matchesProvenance = book.provenanceNotes.toLowerCase().includes(q);
        const matchesTags = book.tags.toLowerCase().includes(q);
        if (!matchesTitle && !matchesAuthor && !matchesPublisher && !matchesProvenance && !matchesTags) {
          return false;
        }
      }

      // Author
      if (selectedAuthor && book.author !== selectedAuthor) return false;

      // Year
      if (minYear && book.year < parseInt(minYear, 10)) return false;
      if (maxYear && book.year > parseInt(maxYear, 10)) return false;

      // Price
      if (minPrice && book.priceInCents < parseInt(minPrice, 10) * 100) return false;
      if (maxPrice && book.priceInCents > parseInt(maxPrice, 10) * 100) return false;

      // Conditions
      if (selectedConditions.length > 0 && !selectedConditions.includes(book.conditionGrade)) {
        return false;
      }

      // Dust jacket
      if (selectedDustJacket.length > 0 && !selectedDustJacket.includes(book.dustJacket)) {
        return false;
      }

      // Flags
      if (signedOnly && !book.isSigned) return false;
      if (firstEditionOnly && !book.isFirstEdition) return false;
      if (antiquarianOnly && !book.isAntiquarian) return false;
      if (initialCurator && !book.curatorPick) return false;

      // Tag
      if (selectedTag) {
        if (selectedTag === "auctions") {
          if (book.status !== "IN_AUCTION") return false;
        } else {
          const tags = book.tags.split(",").map((t) => t.trim().toLowerCase());
          if (!tags.includes(selectedTag.toLowerCase())) return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "price-asc") return a.priceInCents - b.priceInCents;
      if (sortBy === "price-desc") return b.priceInCents - a.priceInCents;
      if (sortBy === "year-desc") return b.year - a.year;
      if (sortBy === "year-asc") return a.year - b.year;
      if (sortBy === "title-asc") return a.title.localeCompare(b.title);
      // Default: featured / curator picks first
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return b.priceInCents - a.priceInCents;
    });
  }, [
    initialBooks,
    search,
    selectedAuthor,
    minYear,
    maxYear,
    minPrice,
    maxPrice,
    selectedConditions,
    selectedDustJacket,
    signedOnly,
    firstEditionOnly,
    antiquarianOnly,
    selectedTag,
    sortBy,
    initialCurator,
  ]);

  const handleConditionToggle = (grade: string) => {
    setSelectedConditions((prev) =>
      prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade]
    );
  };

  const handleDustJacketToggle = (dj: string) => {
    setSelectedDustJacket((prev) =>
      prev.includes(dj) ? prev.filter((d) => d !== dj) : [...prev, dj]
    );
  };

  const handleClearFilters = () => {
    setSearch("");
    setSelectedAuthor("");
    setMinYear("");
    setMaxYear("");
    setMinPrice("");
    setMaxPrice("");
    setSelectedConditions([]);
    setSelectedDustJacket([]);
    setSignedOnly(false);
    setFirstEditionOnly(false);
    setAntiquarianOnly(false);
    setSelectedTag("");
    setSortBy("featured");
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const handleQuickReserve = async (e: React.MouseEvent, bookId: string) => {
    e.preventDefault();
    setReservingId(bookId);
    await reserveBook(bookId);
    setReservingId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Banner */}
      <div className="pb-8 border-b border-[#E8E2D4]">
        <span className="text-xs font-mono uppercase tracking-widest text-[#B38838]">
          The Antiquarian Guild Catalogue
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1A1816] mt-1">
          The Curators&apos; Vault
        </h1>
        <p className="text-xs sm:text-sm text-[#5C564E] mt-2 max-w-3xl leading-relaxed">
          Explore {initialBooks.length} authenticated rare books, first impressions, inscribed association copies, and incunabula. Each volume represents an unrepeatable historical specimen.
        </p>
      </div>

      {/* Control bar: search, sort, view toggles */}
      <div className="py-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#E8E2D4]">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <input
            type="text"
            placeholder="Search title, author, provenance, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#DDD6C5] rounded text-xs focus:outline-hidden focus:border-[#B38838] transition-colors"
          />
          <Search className="w-4 h-4 text-[#8E867B] absolute left-3 top-2.5" />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-2.5 text-[#8E867B] hover:text-[#1A1816]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden px-3 py-2 bg-white border border-[#DDD6C5] rounded text-xs font-medium flex items-center gap-1.5 text-[#1A1816]"
          >
            <Filter className="w-3.5 h-3.5 text-[#B38838]" />
            <span>Filters</span>
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#8E867B] hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-[#DDD6C5] rounded px-2.5 py-2 text-xs text-[#1A1816] focus:outline-hidden focus:border-[#B38838]"
            >
              <option value="featured">Curators&apos; Order</option>
              <option value="price-desc">Valuation: High to Low</option>
              <option value="price-asc">Valuation: Low to High</option>
              <option value="year-asc">Antiquity: Oldest First</option>
              <option value="year-desc">Chronology: Newest First</option>
              <option value="title-asc">Title: A-Z</option>
            </select>
          </div>

          {/* Grid / List View Toggle */}
          <div className="hidden sm:flex border border-[#DDD6C5] rounded overflow-hidden bg-white">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 transition-colors ${
                viewMode === "grid" ? "bg-[#1A1816] text-[#FDFBF7]" : "text-[#8E867B] hover:text-[#1A1816]"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 transition-colors ${
                viewMode === "list" ? "bg-[#1A1816] text-[#FDFBF7]" : "text-[#8E867B] hover:text-[#1A1816]"
              }`}
              title="Archival Ledger View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Catalog Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block space-y-6 pr-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D4]">
            <span className="text-xs font-serif font-bold tracking-wider uppercase text-[#1A1816] flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#B38838]" />
              <span>Refine Collection</span>
            </span>
            <button
              onClick={handleClearFilters}
              className="text-[11px] text-[#8E867B] hover:text-[#7A202E] transition-colors"
            >
              Reset All
            </button>
          </div>

          {/* Special Attributes Checkboxes */}
          <div className="space-y-2.5">
            <h4 className="text-xs uppercase font-mono tracking-wider text-[#8E867B]">
              Collector Attributes
            </h4>
            <label className="flex items-center gap-2 text-xs text-[#1A1816] cursor-pointer">
              <input
                type="checkbox"
                checked={signedOnly}
                onChange={(e) => setSignedOnly(e.target.checked)}
                className="rounded border-[#DDD6C5] text-[#B38838] focus:ring-[#B38838]"
              />
              <span>Signed or Inscribed Copy</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-[#1A1816] cursor-pointer">
              <input
                type="checkbox"
                checked={firstEditionOnly}
                onChange={(e) => setFirstEditionOnly(e.target.checked)}
                className="rounded border-[#DDD6C5] text-[#B38838] focus:ring-[#B38838]"
              />
              <span>First Edition / First Impression</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-[#1A1816] cursor-pointer">
              <input
                type="checkbox"
                checked={antiquarianOnly}
                onChange={(e) => setAntiquarianOnly(e.target.checked)}
                className="rounded border-[#DDD6C5] text-[#B38838] focus:ring-[#B38838]"
              />
              <span>Pre-1900 Antiquarian</span>
            </label>
          </div>

          {/* Condition Grade Filter */}
          <div className="space-y-2.5 pt-4 border-t border-[#E8E2D4]">
            <h4 className="text-xs uppercase font-mono tracking-wider text-[#8E867B]">
              Condition Grade
            </h4>
            {["FINE", "VERY_GOOD", "GOOD", "FAIR"].map((grade) => (
              <label key={grade} className="flex items-center gap-2 text-xs text-[#1A1816] cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedConditions.includes(grade)}
                  onChange={() => handleConditionToggle(grade)}
                  className="rounded border-[#DDD6C5] text-[#B38838] focus:ring-[#B38838]"
                />
                <span>{grade.replace("_", " ")}</span>
              </label>
            ))}
          </div>

          {/* Dust Jacket Status Filter */}
          <div className="space-y-2.5 pt-4 border-t border-[#E8E2D4]">
            <h4 className="text-xs uppercase font-mono tracking-wider text-[#8E867B]">
              Dust Jacket State
            </h4>
            {[
              { id: "AS_ISSUED", label: "As Issued (Unclipped)" },
              { id: "PRESENT_CLIPPED", label: "Present (Price Clipped)" },
              { id: "PRESENT_DAMAGED", label: "Present (Minor Wear)" },
              { id: "NOT_ISSUED", label: "Not Issued (Binding As Is)" },
            ].map((dj) => (
              <label key={dj.id} className="flex items-center gap-2 text-xs text-[#1A1816] cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedDustJacket.includes(dj.id)}
                  onChange={() => handleDustJacketToggle(dj.id)}
                  className="rounded border-[#DDD6C5] text-[#B38838] focus:ring-[#B38838]"
                />
                <span>{dj.label}</span>
              </label>
            ))}
          </div>

          {/* Author Selector */}
          <div className="space-y-2 pt-4 border-t border-[#E8E2D4]">
            <h4 className="text-xs uppercase font-mono tracking-wider text-[#8E867B]">
              Author / Originator
            </h4>
            <select
              value={selectedAuthor}
              onChange={(e) => setSelectedAuthor(e.target.value)}
              className="w-full bg-white border border-[#DDD6C5] rounded p-2 text-xs text-[#1A1816]"
            >
              <option value="">All Authors ({authors.length})</option>
              {authors.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {/* Year Range */}
          <div className="space-y-2 pt-4 border-t border-[#E8E2D4]">
            <h4 className="text-xs uppercase font-mono tracking-wider text-[#8E867B]">
              Publication Year
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="From (e.g. 1600)"
                value={minYear}
                onChange={(e) => setMinYear(e.target.value)}
                className="w-full bg-white border border-[#DDD6C5] rounded px-2 py-1.5 text-xs text-[#1A1816]"
              />
              <input
                type="number"
                placeholder="To (e.g. 1960)"
                value={maxYear}
                onChange={(e) => setMaxYear(e.target.value)}
                className="w-full bg-white border border-[#DDD6C5] rounded px-2 py-1.5 text-xs text-[#1A1816]"
              />
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-2 pt-4 border-t border-[#E8E2D4]">
            <h4 className="text-xs uppercase font-mono tracking-wider text-[#8E867B]">
              Valuation Range ($)
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min ($)"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full bg-white border border-[#DDD6C5] rounded px-2 py-1.5 text-xs text-[#1A1816]"
              />
              <input
                type="number"
                placeholder="Max ($)"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full bg-white border border-[#DDD6C5] rounded px-2 py-1.5 text-xs text-[#1A1816]"
              />
            </div>
          </div>

          {/* Tags cloud */}
          <div className="space-y-2 pt-4 border-t border-[#E8E2D4]">
            <h4 className="text-xs uppercase font-mono tracking-wider text-[#8E867B]">
              Category Tags
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {allTags.slice(0, 15).map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTag(selectedTag === t ? "" : t)}
                  className={`text-[11px] px-2 py-1 rounded transition-colors ${
                    selectedTag === t
                      ? "bg-[#1A1816] text-[#FDFBF7]"
                      : "bg-[#F4EFE6] text-[#5C564E] hover:bg-[#E8E2D4]"
                  }`}
                >
                  #{t}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Book Results Grid / List */}
        <div className="lg:col-span-3">
          {/* Active counts */}
          <div className="mb-4 flex justify-between items-baseline text-xs text-[#5C564E]">
            <span>
              Showing <strong className="text-[#1A1816]">{filteredBooks.length}</strong> collectible{" "}
              {filteredBooks.length === 1 ? "volume" : "volumes"}
            </span>
            {(selectedAuthor || minYear || maxYear || minPrice || maxPrice || signedOnly || selectedTag) && (
              <button
                onClick={handleClearFilters}
                className="text-[#7A202E] hover:underline"
              >
                Clear all active filters
              </button>
            )}
          </div>

          {filteredBooks.length === 0 ? (
            <div className="bg-white border border-[#E8E2D4] rounded-lg p-12 text-center space-y-4">
              <p className="font-serif italic text-xl text-[#1A1816]">
                No volumes match your precise curatorial criteria.
              </p>
              <p className="text-xs text-[#8E867B] max-w-md mx-auto">
                Try widening your publication year range, resetting condition grades, or clearing search keywords.
              </p>
              <button
                onClick={handleClearFilters}
                className="px-5 py-2.5 bg-[#1A1816] text-white text-xs uppercase tracking-wider font-medium rounded hover:bg-[#B38838] transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredBooks.map((book) => {
                const cover = book.images.find((i) => i.isCover)?.url || book.images[0]?.url || "";
                const isItemReserved = book.status === "RESERVED";
                const isHeldInMyCart = cartItems.some((ci) => ci.bookId === book.id);

                return (
                  <div
                    key={book.id}
                    className="group bg-white border border-[#E8E2D4] rounded-lg overflow-hidden flex flex-col hover:border-[#B38838] hover:shadow-md transition-all"
                  >
                    <Link
                      href={`/catalog/${book.slug}`}
                      className="relative h-72 bg-[#F4EFE6] block overflow-hidden border-b border-[#E8E2D4]"
                    >
                      <Image
                        src={cover}
                        alt={book.title}
                        fill
                        className="object-cover group-hover:scale-104 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />

                      {/* Badges */}
                      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                        {book.isSigned && (
                          <span className="px-2 py-0.5 bg-[#1A1816]/90 backdrop-blur-xs text-[#D9B464] text-[10px] uppercase font-bold tracking-wider rounded border border-[#3E3831] flex items-center gap-1">
                            <Feather className="w-2.5 h-2.5" />
                            <span>Signed</span>
                          </span>
                        )}
                        <span className="px-2 py-0.5 bg-white/90 backdrop-blur-xs text-[#1A1816] text-[10px] font-mono uppercase font-bold tracking-wider rounded border border-[#E8E2D4]">
                          {book.conditionGrade}
                        </span>
                      </div>

                      {/* Status Overlay */}
                      {isItemReserved && !isHeldInMyCart && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 text-center z-20">
                          <span className="bg-[#FFF8E7] text-[#7A5B18] px-3 py-1.5 rounded text-[11px] font-serif font-bold shadow-md border border-[#EAD8B0]">
                            Reserved in Cart
                          </span>
                        </div>
                      )}
                      {isHeldInMyCart && (
                        <div className="absolute top-2.5 right-2.5 bg-[#233D30] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow z-10">
                          In Your Cart
                        </div>
                      )}
                    </Link>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex justify-between items-baseline text-[11px] text-[#8E867B] font-mono">
                          <span>{book.year}</span>
                          <span className="line-clamp-1 max-w-[140px] text-right">
                            {book.publisher.split(",")[0]}
                          </span>
                        </div>

                        <Link href={`/catalog/${book.slug}`}>
                          <h3 className="font-serif font-bold text-lg text-[#1A1816] mt-1 group-hover:text-[#966E26] transition-colors line-clamp-1">
                            {book.title}
                          </h3>
                        </Link>

                        <p className="text-xs text-[#5C564E] italic">{book.author}</p>
                        <p className="text-[11px] text-[#8E867B] line-clamp-1 mt-0.5">
                          {book.editionPrinting}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#E8E2D4] flex items-center justify-between">
                        <div>
                          <span className="block text-[9px] uppercase tracking-wider text-[#8E867B]">
                            Valuation
                          </span>
                          <span className="text-lg font-serif font-bold text-[#1A1816]">
                            {formatPrice(book.priceInCents)}
                          </span>
                        </div>

                        {book.status === "IN_AUCTION" ? (
                          <Link
                            href={`/catalog/${book.slug}`}
                            className="px-3 py-1.5 bg-[#7A202E] hover:bg-[#581620] text-white text-[11px] font-bold uppercase tracking-wider rounded transition-colors"
                          >
                            Bid in Auction
                          </Link>
                        ) : book.status === "SOLD" ? (
                          <span className="text-xs text-[#8E867B] font-mono uppercase">Acquired</span>
                        ) : isHeldInMyCart ? (
                          <span className="text-xs text-[#233D30] font-bold">Reserved</span>
                        ) : (
                          <button
                            onClick={(e) => handleQuickReserve(e, book.id)}
                            disabled={reservingId === book.id || isItemReserved}
                            className="px-3 py-1.5 bg-[#F4EFE6] hover:bg-[#1A1816] text-[#1A1816] hover:text-[#FDFBF7] text-[11px] font-medium uppercase tracking-wider rounded transition-colors disabled:opacity-50"
                          >
                            {reservingId === book.id ? "Locking..." : "Reserve (15m)"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Archival Ledger List View */
            <div className="space-y-4">
              {filteredBooks.map((book) => {
                const cover = book.images.find((i) => i.isCover)?.url || book.images[0]?.url || "";
                return (
                  <div
                    key={book.id}
                    className="bg-white border border-[#E8E2D4] rounded-lg p-4 flex flex-col sm:flex-row gap-5 hover:border-[#B38838] transition-all"
                  >
                    <Link
                      href={`/catalog/${book.slug}`}
                      className="relative w-full sm:w-32 h-44 bg-[#F4EFE6] rounded overflow-hidden shrink-0 border border-[#DDD6C5]"
                    >
                      <Image
                        src={cover}
                        alt={book.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 150px"
                      />
                    </Link>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#8E867B] font-mono">
                          <span>{book.year}</span>
                          <span>•</span>
                          <span>{book.publisher}</span>
                          <span>•</span>
                          <span className="bg-[#F4EFE6] px-1.5 py-0.5 rounded text-[#1A1816] font-bold">
                            {book.conditionGrade}
                          </span>
                          {book.isSigned && (
                            <span className="bg-[#1A1816] text-[#D9B464] px-1.5 py-0.5 rounded font-bold">
                              Signed
                            </span>
                          )}
                        </div>

                        <Link href={`/catalog/${book.slug}`}>
                          <h3 className="font-serif font-bold text-xl text-[#1A1816] mt-1 hover:text-[#966E26] transition-colors">
                            {book.title}
                          </h3>
                        </Link>
                        <p className="text-xs text-[#5C564E] italic">{book.author}</p>
                        <p className="text-xs text-[#8E867B] mt-0.5">{book.editionPrinting}</p>

                        <p className="text-xs text-[#5C564E] line-clamp-2 mt-2 leading-relaxed">
                          {book.provenanceNotes}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#E8E2D4] flex items-center justify-between">
                        <span className="text-xl font-serif font-bold text-[#1A1816]">
                          {formatPrice(book.priceInCents)}
                        </span>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/catalog/${book.slug}`}
                            className="px-4 py-2 bg-[#F4EFE6] hover:bg-[#E8E2D4] text-[#1A1816] text-xs font-medium uppercase tracking-wider rounded"
                          >
                            Examine Dossier
                          </Link>
                          {book.status === "AVAILABLE" && (
                            <button
                              onClick={(e) => handleQuickReserve(e, book.id)}
                              disabled={reservingId === book.id}
                              className="px-4 py-2 bg-[#1A1816] hover:bg-[#B38838] text-white text-xs font-medium uppercase tracking-wider rounded transition-colors"
                            >
                              Reserve (15m)
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
