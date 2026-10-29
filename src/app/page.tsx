import React from "react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ArrowRight, ShieldCheck, Gavel, Sparkles, Feather, Clock, CheckCircle } from "lucide-react";

export default async function HomePage() {
  // Fetch featured items, active auctions, and recent arrivals
  const featuredBooks = await prisma.bookListing.findMany({
    where: { featured: true },
    include: {
      images: { orderBy: { displayOrder: "asc" } },
      certificate: true,
      auction: true,
    },
    take: 6,
  });

  const activeAuctions = await prisma.timedAuction.findMany({
    where: { status: "ACTIVE" },
    include: {
      book: {
        include: {
          images: { where: { isCover: true }, take: 1 },
        },
      },
    },
    take: 3,
  });

  const recentAcquisitions = await prisma.bookListing.findMany({
    where: { status: "AVAILABLE" },
    include: {
      images: { where: { isCover: true }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const heroItem = featuredBooks[0] || recentAcquisitions[0];
  const heroImage = heroItem?.images[0]?.url || "";

  return (
    <div className="space-y-20 pb-16">
      {/* Editorial Curatorial Hero */}
      <section className="relative bg-[#1A1816] text-[#FDFBF7] overflow-hidden border-b border-[#2D2A26]">
        {/* Subtle background ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(#C49E48_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Editorial Monograph */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2B2722] border border-[#3E3831] rounded text-[11px] font-mono tracking-widest text-[#D9B464] uppercase">
                <Sparkles className="w-3.5 h-3.5 text-[#B38838]" />
                <span>Private Curatorial Acquisition • Autumn Catalogue</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-[#F7F4EB] leading-[1.1]">
                Rare First Editions, Inscribed Copies &amp; Archival Treasures
              </h1>

              <p className="text-base sm:text-lg text-[#C7BEAF] font-light leading-relaxed max-w-2xl font-serif italic">
                &ldquo;A true collector does not merely acquire an object; they inherit custody of a physical monument to human imagination.&rdquo;
              </p>

              <p className="text-sm text-[#A8A090] leading-relaxed max-w-xl">
                Every copy in our collection is singular. Adding an item to your portfolio secures an exclusive 15-minute reservation, accompanied by forensic authentication and a verifiable cryptographic certificate.
              </p>

              <div className="pt-4 flex flex-wrap gap-4 items-center">
                <Link
                  href="/catalog"
                  className="px-6 py-3.5 bg-[#B38838] hover:bg-[#966E26] text-[#151413] text-xs uppercase tracking-widest font-bold rounded shadow-md transition-all flex items-center gap-2 group"
                >
                  <span>Enter The Vault</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/catalog?category=auctions"
                  className="px-6 py-3.5 bg-[#2B2722] hover:bg-[#38332C] border border-[#4A433A] text-[#F7F4EB] text-xs uppercase tracking-widest font-bold rounded transition-colors flex items-center gap-2"
                >
                  <Gavel className="w-4 h-4 text-[#B38838]" />
                  <span>View Timed Auctions</span>
                </Link>
              </div>

              <div className="pt-8 grid grid-cols-3 gap-6 border-t border-[#2D2A26] text-xs text-[#9E9689]">
                <div>
                  <span className="block font-serif text-2xl font-bold text-[#F7F4EB]">100%</span>
                  <span className="text-[11px] uppercase tracking-wider text-[#7A6F60]">Forensic Guarantee</span>
                </div>
                <div>
                  <span className="block font-serif text-2xl font-bold text-[#F7F4EB]">15 Min</span>
                  <span className="text-[11px] uppercase tracking-wider text-[#7A6F60]">Exclusive Hold</span>
                </div>
                <div>
                  <span className="block font-serif text-2xl font-bold text-[#F7F4EB]">ABAA / ILAB</span>
                  <span className="text-[11px] uppercase tracking-wider text-[#7A6F60]">Code of Ethics</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Highlight Specimen */}
            {heroItem && (
              <div className="lg:col-span-5">
                <div className="relative group bg-[#24211D] border border-[#3E3831] p-5 rounded-lg shadow-2xl">
                  {/* Specimen Badge */}
                  <div className="absolute top-8 right-8 z-20 bg-[#7A202E] text-white text-[11px] uppercase tracking-wider font-bold px-3 py-1 rounded shadow-md">
                    Featured Masterpiece
                  </div>

                  {/* Book Image */}
                  <div className="relative h-96 w-full bg-[#1A1816] rounded overflow-hidden shadow-inner border border-[#332E27]">
                    <Image
                      src={heroImage}
                      alt={heroItem.title}
                      fill
                      className="object-cover group-hover:scale-103 transition-transform duration-700"
                      priority
                      sizes="(max-width: 768px) 100vw, 500px"
                    />
                  </div>

                  {/* Specimen Caption */}
                  <div className="mt-5 space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-mono uppercase tracking-widest text-[#B38838]">
                        Circa {heroItem.year} • {heroItem.conditionGrade} Grade
                      </span>
                      <span className="text-xl font-serif font-bold text-[#F7F4EB]">
                        {formatPrice(heroItem.priceInCents)}
                      </span>
                    </div>

                    <h3 className="font-serif text-xl font-bold text-[#F7F4EB] line-clamp-1">
                      {heroItem.title}
                    </h3>

                    <p className="text-xs text-[#C7BEAF] italic">
                      {heroItem.author} — {heroItem.editionPrinting}
                    </p>

                    <p className="text-xs text-[#9E9689] line-clamp-2 leading-relaxed pt-1">
                      {heroItem.provenanceNotes}
                    </p>

                    <div className="pt-3">
                      <Link
                        href={`/catalog/${heroItem.slug}`}
                        className="w-full py-2.5 bg-[#B38838]/15 hover:bg-[#B38838]/30 border border-[#B38838]/40 text-[#F7F4EB] text-xs font-medium uppercase tracking-wider rounded text-center block transition-colors"
                      >
                        Inspect Archival Ledger &amp; Provenance →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Live Timed Auctions Section */}
      {activeAuctions.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border border-[#D9D1BF] bg-[#F7F3E9] p-8 rounded-lg shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-6 border-b border-[#E8E2D4]">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#7A202E] text-white text-[11px] font-bold uppercase tracking-wider rounded">
                  <Gavel className="w-3.5 h-3.5" />
                  <span>Curatorial Auctions Live</span>
                </div>
                <h2 className="text-3xl font-serif font-bold text-[#1A1816] mt-2">
                  Timed Collector Bidding
                </h2>
                <p className="text-xs text-[#5C564E] mt-1">
                  Rare institutional lots with 5-minute anti-snipe auto-extension protection.
                </p>
              </div>

              <Link
                href="/catalog?category=auctions"
                className="text-xs font-bold uppercase tracking-wider text-[#966E26] hover:text-[#1A1816] flex items-center gap-1"
              >
                <span>View All Auctions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              {activeAuctions.map((auction) => {
                const cover = auction.book.images[0]?.url || "";
                return (
                  <div
                    key={auction.id}
                    className="bg-white border border-[#E8E2D4] rounded-lg p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
                  >
                    <div>
                      <div className="relative h-64 w-full bg-[#EDE8DC] rounded overflow-hidden mb-4 border border-[#DDD6C5]">
                        <Image
                          src={cover}
                          alt={auction.book.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 350px"
                        />
                        <div className="absolute bottom-2 left-2 bg-[#1A1816]/90 text-white text-[11px] font-mono px-2.5 py-1 rounded flex items-center gap-1.5 backdrop-blur-xs">
                          <Clock className="w-3 h-3 text-[#B38838]" />
                          <span>Anti-Snipe Active</span>
                        </div>
                      </div>

                      <span className="text-[11px] font-mono uppercase text-[#8E867B] tracking-wider">
                        Year {auction.book.year} • {auction.book.conditionGrade}
                      </span>
                      <h3 className="font-serif font-bold text-lg text-[#1A1816] mt-1 line-clamp-1">
                        {auction.book.title}
                      </h3>
                      <p className="text-xs text-[#5C564E] italic">{auction.book.author}</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#E8E2D4] space-y-3">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[11px] uppercase tracking-wider text-[#8E867B]">
                          Current High Bid
                        </span>
                        <span className="font-serif font-bold text-xl text-[#7A202E]">
                          {formatPrice(auction.currentBidInCents)}
                        </span>
                      </div>

                      <Link
                        href={`/catalog/${auction.book.slug}`}
                        className="w-full py-2.5 bg-[#1A1816] hover:bg-[#B38838] text-white text-xs font-bold uppercase tracking-wider text-center block rounded transition-colors"
                      >
                        Place Bid &amp; Inspect Lot
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Curators' Vault: Featured Rarities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end pb-8 border-b border-[#E8E2D4] gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#B38838]">
              The Vault Highlights
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1A1816] mt-1">
              Monumental First Editions &amp; Inscribed Works
            </h2>
          </div>

          <Link
            href="/catalog"
            className="text-xs uppercase tracking-widest font-bold text-[#1A1816] hover:text-[#B38838] flex items-center gap-1 group"
          >
            <span>Explore Complete Vault</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-8">
          {featuredBooks.map((book) => {
            const cover = book.images.find((i) => i.isCover)?.url || book.images[0]?.url || "";
            return (
              <div
                key={book.id}
                className="group bg-white border border-[#E8E2D4] rounded-lg overflow-hidden flex flex-col hover:border-[#B38838] hover:shadow-lg transition-all"
              >
                {/* Book Cover Container */}
                <Link href={`/catalog/${book.slug}`} className="relative h-80 bg-[#F4EFE6] block overflow-hidden border-b border-[#E8E2D4]">
                  <Image
                    src={cover}
                    alt={book.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />

                  {/* Badges Overlay */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                    {book.isSigned && (
                      <span className="px-2.5 py-1 bg-[#1A1816]/90 backdrop-blur-xs text-[#D9B464] text-[10px] uppercase font-bold tracking-wider rounded border border-[#3E3831] flex items-center gap-1">
                        <Feather className="w-3 h-3" />
                        <span>Signed Copy</span>
                      </span>
                    )}
                    {book.conditionGrade === "FINE" && (
                      <span className="px-2 py-0.5 bg-[#233D30] text-[#E8F2EC] text-[10px] uppercase font-bold tracking-wider rounded">
                        Fine Condition
                      </span>
                    )}
                  </div>

                  {book.status === "RESERVED" && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 text-center">
                      <div className="bg-[#FFF8E7] text-[#7A5B18] px-4 py-2 rounded text-xs font-serif font-bold shadow-lg border border-[#EAD8B0]">
                        Temporarily Reserved in Another Cart
                      </div>
                    </div>
                  )}
                </Link>

                {/* Metadata & Details */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex justify-between items-baseline text-xs text-[#8E867B] font-mono">
                      <span>{book.year} • {book.publisher.split(",")[0]}</span>
                      <span>Grade: {book.conditionGrade}</span>
                    </div>

                    <Link href={`/catalog/${book.slug}`}>
                      <h3 className="font-serif font-bold text-xl text-[#1A1816] mt-1 group-hover:text-[#966E26] transition-colors line-clamp-1">
                        {book.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-[#5C564E] italic mt-0.5">{book.author}</p>
                    <p className="text-xs text-[#8E867B] line-clamp-1 mt-1 font-light">
                      {book.editionPrinting}
                    </p>

                    <p className="text-xs text-[#5C564E] line-clamp-2 mt-2 leading-relaxed">
                      {book.provenanceNotes}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#E8E2D4] flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-[#8E867B]">
                        Collector Valuation
                      </span>
                      <span className="text-xl font-serif font-bold text-[#1A1816]">
                        {formatPrice(book.priceInCents)}
                      </span>
                    </div>

                    <Link
                      href={`/catalog/${book.slug}`}
                      className="px-4 py-2 bg-[#F4EFE6] hover:bg-[#1A1816] text-[#1A1816] hover:text-[#FDFBF7] text-xs font-medium uppercase tracking-wider rounded transition-colors"
                    >
                      Inspect Volume
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* The Anatomy of Antiquarian Trust */}
      <section className="bg-[#F7F3E9] py-16 border-y border-[#E8E2D4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-[#B38838]">
              Collector Safeguards
            </span>
            <h2 className="text-3xl font-serif font-bold text-[#1A1816] mt-2">
              The Architecture of Antiquarian Trust
            </h2>
            <p className="text-sm text-[#5C564E] mt-2 leading-relaxed">
              Unlike ordinary books, unique historical artifacts require uncompromising certainty in provenance, physical grading, and transactional integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg border border-[#E8E2D4] shadow-xs space-y-3">
              <div className="w-10 h-10 rounded bg-[#F4EFE6] text-[#B38838] flex items-center justify-center font-bold font-serif text-lg">
                1
              </div>
              <h3 className="font-serif font-bold text-lg text-[#1A1816]">15-Minute Reservation Lock</h3>
              <p className="text-xs text-[#5C564E] leading-relaxed">
                When you place a singular copy into your portfolio, our database initiates an atomic lock. For 15 uninterrupted minutes, no other buyer worldwide can purchase or displace your volume.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-[#E8E2D4] shadow-xs space-y-3">
              <div className="w-10 h-10 rounded bg-[#F4EFE6] text-[#B38838] flex items-center justify-center font-bold font-serif text-lg">
                2
              </div>
              <h3 className="font-serif font-bold text-lg text-[#1A1816]">Cryptographic Authenticity</h3>
              <p className="text-xs text-[#5C564E] leading-relaxed">
                Every signed or high-value volume receives a permanent Certificate of Authenticity with an SHA-256 cryptographic hash and QR code resolving to our public verifiable ledger.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-[#E8E2D4] shadow-xs space-y-3">
              <div className="w-10 h-10 rounded bg-[#F4EFE6] text-[#B38838] flex items-center justify-center font-bold font-serif text-lg">
                3
              </div>
              <h3 className="font-serif font-bold text-lg text-[#1A1816]">Forensic Defect Accounting</h3>
              <p className="text-xs text-[#5C564E] leading-relaxed">
                No surprises. We document headcap chips, foxing patterns, price-clipped jackets, and hinge wear under magnification with 6+ high-resolution photographs per listing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Acquisitions Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-baseline pb-6 border-b border-[#E8E2D4]">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#8E867B]">
              Latest Additions
            </span>
            <h2 className="text-2xl font-serif font-bold text-[#1A1816] mt-1">
              Newly Catalogued to the Ledger
            </h2>
          </div>
          <Link
            href="/catalog"
            className="text-xs font-bold uppercase tracking-wider text-[#966E26] hover:text-[#1A1816]"
          >
            View Entire Catalogue ({recentAcquisitions.length}+) →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6">
          {recentAcquisitions.slice(0, 4).map((book) => {
            const cover = book.images[0]?.url || "";
            return (
              <Link
                key={book.id}
                href={`/catalog/${book.slug}`}
                className="group block bg-white border border-[#E8E2D4] rounded p-3 hover:border-[#B38838] hover:shadow-md transition-all"
              >
                <div className="relative h-56 bg-[#F4EFE6] rounded overflow-hidden border border-[#EDE8DC] mb-3">
                  <Image
                    src={cover}
                    alt={book.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <p className="text-[10px] font-mono uppercase text-[#8E867B]">{book.year} • {book.conditionGrade}</p>
                <h4 className="font-serif font-bold text-sm text-[#1A1816] mt-0.5 line-clamp-1 group-hover:text-[#966E26]">
                  {book.title}
                </h4>
                <p className="text-xs text-[#5C564E] italic line-clamp-1">{book.author}</p>
                <p className="font-serif font-bold text-sm text-[#1A1816] mt-2">
                  {formatPrice(book.priceInCents)}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
