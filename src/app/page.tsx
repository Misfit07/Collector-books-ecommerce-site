import React from "react";
import Link from "next/link";
import SafeBookImage from "@/components/common/SafeBookImage";
import { prisma } from "@/lib/prisma";
import { ArrowRight, Gavel, Feather, ShieldCheck } from "lucide-react";

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
    <div className="space-y-24 pb-20">
      {/* Editorial Hero */}
      <section className="relative bg-[#181614] text-[#FDFBF7] overflow-hidden border-b border-[#2B2724]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Left Column: Literary Introduction */}
            <div className="lg:col-span-7 space-y-7">
              <p className="text-xs uppercase tracking-[0.25em] text-[#C49E48] font-medium">
                Antiquarian Booksellers &bull; London &amp; New York
              </p>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal tracking-tight text-[#F7F4EB] leading-[1.12]">
                Rare First Editions, Association Copies &amp; Manuscripts
              </h1>

              <p className="text-base sm:text-lg text-[#C7BEAF] font-light leading-relaxed max-w-2xl font-serif italic">
                &ldquo;A great book should leave you with many experiences, and slightly exhausted at the end. You live several lives while reading.&rdquo;
              </p>

              <p className="text-sm text-[#A8A090] leading-relaxed max-w-xl">
                We specialize in landmark literature, original bindings, and historically documented signed copies. Every listing is a singular physical copy, reserved exclusively for 15 minutes upon cart entry.
              </p>

              <div className="pt-2 flex flex-wrap gap-4 items-center">
                <Link
                  href="/catalog"
                  className="px-7 py-3.5 bg-[#B38838] hover:bg-[#966E26] text-[#151413] text-xs uppercase tracking-widest font-semibold rounded-xs shadow-xs transition-colors flex items-center gap-2 group"
                >
                  <span>Explore The Catalogue</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/catalog?category=auctions"
                  className="px-7 py-3.5 bg-transparent hover:bg-[#25221E] border border-[#443E36] text-[#EFEAE1] text-xs uppercase tracking-widest font-semibold rounded-xs transition-colors flex items-center gap-2"
                >
                  <Gavel className="w-3.5 h-3.5 text-[#C49E48]" />
                  <span>Timed Auctions</span>
                </Link>
              </div>

              <div className="pt-8 border-t border-[#2B2724] text-xs text-[#8E867B] flex flex-wrap items-center gap-y-2 gap-x-8">
                <span>Member ABAA / ILAB Code of Practice</span>
                <span>&bull;</span>
                <span>Individual Certificates of Authenticity</span>
                <span>&bull;</span>
                <span>Worldwide Insured Shipping</span>
              </div>
            </div>

            {/* Right Column: Hero Specimen */}
            {heroItem && (
              <div className="lg:col-span-5">
                <div className="bg-[#201D1A] border border-[#332E28] p-6 rounded-xs shadow-xl">
                  {/* Book Image */}
                  <Link href={`/catalog/${heroItem.slug}`} className="block relative h-96 w-full bg-[#141311] rounded-xs overflow-hidden border border-[#2B2724] group">
                    <SafeBookImage
                      src={heroImage}
                      alt={heroItem.title}
                      title={heroItem.title}
                      author={heroItem.author}
                      year={heroItem.year}
                      fill
                      className="object-cover group-hover:scale-102 transition-transform duration-700"
                      priority
                      sizes="(max-width: 768px) 100vw, 500px"
                    />
                  </Link>

                  {/* Specimen Caption */}
                  <div className="mt-5 space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[11px] font-mono uppercase tracking-widest text-[#B38838]">
                        Circa {heroItem.year} &bull; {heroItem.conditionGrade.replace("_", " ")}
                      </span>
                      <span className="text-xl font-serif font-bold text-[#F7F4EB]">
                        {formatPrice(heroItem.priceInCents)}
                      </span>
                    </div>

                    <Link href={`/catalog/${heroItem.slug}`}>
                      <h3 className="font-serif text-xl font-bold text-[#F7F4EB] hover:text-[#C49E48] transition-colors line-clamp-1">
                        {heroItem.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-[#C7BEAF] italic">
                      {heroItem.author} &mdash; {heroItem.editionPrinting}
                    </p>

                    <p className="text-xs text-[#9E9689] line-clamp-2 leading-relaxed pt-1">
                      {heroItem.provenanceNotes}
                    </p>

                    <div className="pt-3">
                      <Link
                        href={`/catalog/${heroItem.slug}`}
                        className="w-full py-2.5 bg-[#2B2724] hover:bg-[#38332D] border border-[#443E36] text-[#F7F4EB] text-xs font-medium uppercase tracking-wider rounded-xs text-center block transition-colors"
                      >
                        View Full Description &amp; Collation &rarr;
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
          <div className="border border-[#E0D9C8] bg-[#F7F4EC] p-8 rounded-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-6 border-b border-[#E5DECD]">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-widest text-[#8E867B]">
                  Auctions
                </p>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1A1816] mt-1">
                  Current Timed Auctions
                </h2>
                <p className="text-xs text-[#5C564E] mt-1">
                  Rare institutional lots with 5-minute anti-snipe bidding protection.
                </p>
              </div>

              <Link
                href="/catalog?category=auctions"
                className="text-xs font-semibold uppercase tracking-wider text-[#966E26] hover:text-[#1A1816] flex items-center gap-1"
              >
                <span>All Active Lots</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              {activeAuctions.map((auction) => {
                const cover = auction.book.images[0]?.url || "";
                return (
                  <div
                    key={auction.id}
                    className="bg-white border border-[#E5DECD] rounded-xs p-5 flex flex-col justify-between hover:border-[#B38838] transition-colors"
                  >
                    <div>
                      <div className="relative h-64 w-full bg-[#EDE8DC] rounded-xs overflow-hidden mb-4 border border-[#DDD6C5]">
                        <SafeBookImage
                          src={cover}
                          alt={auction.book.title}
                          title={auction.book.title}
                          author={auction.book.author}
                          year={auction.book.year}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 350px"
                        />
                      </div>

                      <span className="text-[11px] font-mono uppercase text-[#8E867B] tracking-wider">
                        {auction.book.year} &bull; {auction.book.conditionGrade.replace("_", " ")}
                      </span>
                      <h3 className="font-serif font-bold text-lg text-[#1A1816] mt-1 line-clamp-1">
                        {auction.book.title}
                      </h3>
                      <p className="text-xs text-[#5C564E] italic">{auction.book.author}</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#EAE4D5] space-y-3">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[11px] uppercase tracking-wider text-[#8E867B]">
                          Current Bid
                        </span>
                        <span className="font-serif font-bold text-xl text-[#7A202E]">
                          {formatPrice(auction.currentBidInCents)}
                        </span>
                      </div>

                      <Link
                        href={`/catalog/${auction.book.slug}`}
                        className="w-full py-2.5 bg-[#1A1816] hover:bg-[#B38838] text-white text-xs font-semibold uppercase tracking-wider text-center block rounded-xs transition-colors"
                      >
                        Place Bid
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Featured Acquisitions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end pb-6 border-b border-[#E8E2D4] gap-4">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-widest text-[#8E867B]">
              Selections
            </p>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1A1816] mt-1">
              Featured Rare Books &amp; First Editions
            </h2>
          </div>

          <Link
            href="/catalog"
            className="text-xs uppercase tracking-widest font-semibold text-[#1A1816] hover:text-[#B38838] flex items-center gap-1 group"
          >
            <span>View Full Catalogue</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-8">
          {featuredBooks.map((book) => {
            const cover = book.images.find((i) => i.isCover)?.url || book.images[0]?.url || "";
            return (
              <div
                key={book.id}
                className="group bg-white border border-[#E8E2D4] rounded-xs overflow-hidden flex flex-col hover:border-[#B38838] hover:shadow-md transition-all"
              >
                {/* Book Cover Container */}
                <Link href={`/catalog/${book.slug}`} className="relative h-80 bg-[#F4EFE6] block overflow-hidden border-b border-[#E8E2D4]">
                  <SafeBookImage
                    src={cover}
                    alt={book.title}
                    title={book.title}
                    author={book.author}
                    year={book.year}
                    fill
                    className="object-cover group-hover:scale-103 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />

                  {book.isSigned && (
                    <div className="absolute top-3 left-3 z-10">
                      <span className="px-2.5 py-1 bg-[#1A1816]/90 text-[#F5E6A8] text-[10px] uppercase font-semibold tracking-wider rounded-xs flex items-center gap-1">
                        <Feather className="w-3 h-3" />
                        <span>Signed Copy</span>
                      </span>
                    </div>
                  )}

                  {book.status === "RESERVED" && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4 text-center">
                      <div className="bg-[#FFF8E7] text-[#7A5B18] px-4 py-2 rounded-xs text-xs font-serif font-bold shadow-lg border border-[#EAD8B0]">
                        Temporarily Reserved in Cart
                      </div>
                    </div>
                  )}
                </Link>

                {/* Metadata & Details */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex justify-between items-baseline text-xs text-[#8E867B] font-mono">
                      <span>{book.year} &bull; {book.publisher.split(",")[0]}</span>
                      <span>Grade: {book.conditionGrade.replace("_", " ")}</span>
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
                        Price
                      </span>
                      <span className="text-xl font-serif font-bold text-[#1A1816]">
                        {formatPrice(book.priceInCents)}
                      </span>
                    </div>

                    <Link
                      href={`/catalog/${book.slug}`}
                      className="px-4 py-2 bg-[#F4EFE6] hover:bg-[#1A1816] text-[#1A1816] hover:text-[#FDFBF7] text-xs font-medium uppercase tracking-wider rounded-xs transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Antiquarian Standards Section */}
      <section className="bg-[#F8F5EE] py-16 border-y border-[#E8E2D4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-mono uppercase tracking-widest text-[#B38838]">
              Bookseller Standards
            </p>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1A1816] mt-1">
              Antiquarian Guarantees &amp; Provenance
            </h2>
            <p className="text-sm text-[#5C564E] mt-2 leading-relaxed">
              Every volume offered in our catalogue conforms to the professional standards of the Antiquarian Booksellers&apos; Association of America (ABAA) and the International League of Antiquarian Booksellers (ILAB).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xs border border-[#E5DECD] space-y-3">
              <h3 className="font-serif font-bold text-base text-[#1A1816]">15-Minute Exclusive Reservation</h3>
              <p className="text-xs text-[#5C564E] leading-relaxed">
                Because each collectible is unique, adding an item to your cart initiates an automatic 15-minute lock. No other collector can purchase the volume while your reservation is active.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xs border border-[#E5DECD] space-y-3">
              <h3 className="font-serif font-bold text-base text-[#1A1816]">Physical Certificate of Authenticity</h3>
              <p className="text-xs text-[#5C564E] leading-relaxed">
                Signed editions and significant manuscripts include an individual certificate detailing publisher points, paper stock, ink analysis, and an online verification deed.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xs border border-[#E5DECD] space-y-3">
              <h3 className="font-serif font-bold text-base text-[#1A1816]">Thorough Collation &amp; Condition</h3>
              <p className="text-xs text-[#5C564E] leading-relaxed">
                Every leaf, plate, map, and binding component is examined under magnification. All restorations, chips, foxing, or jacket price-clips are explicitly recorded.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Catalogued Items */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-baseline pb-6 border-b border-[#E8E2D4]">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-widest text-[#8E867B]">
              New Acquisitions
            </p>
            <h2 className="text-2xl font-serif font-bold text-[#1A1816] mt-1">
              Recently Catalogued
            </h2>
          </div>
          <Link
            href="/catalog"
            className="text-xs font-semibold uppercase tracking-wider text-[#966E26] hover:text-[#1A1816]"
          >
            View All ({recentAcquisitions.length}+ Items) &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6">
          {recentAcquisitions.slice(0, 4).map((book) => {
            const cover = book.images[0]?.url || "";
            return (
              <Link
                key={book.id}
                href={`/catalog/${book.slug}`}
                className="group block bg-white border border-[#E8E2D4] rounded-xs p-3 hover:border-[#B38838] hover:shadow-xs transition-all"
              >
                <div className="relative h-56 bg-[#F4EFE6] rounded-xs overflow-hidden border border-[#EDE8DC] mb-3">
                  <SafeBookImage
                    src={cover}
                    alt={book.title}
                    title={book.title}
                    author={book.author}
                    year={book.year}
                    fill
                    className="object-cover group-hover:scale-103 transition-transform"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <p className="text-[10px] font-mono uppercase text-[#8E867B]">{book.year} &bull; {book.conditionGrade.replace("_", " ")}</p>
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
