"use client";

import React, { useState } from "react";
import SafeBookImage from "@/components/common/SafeBookImage";
import Link from "next/link";
import { BookListing, BookImage, AuthenticityCertificate, TimedAuction, Bid } from "@prisma/client";
import { useCart } from "@/components/providers/CartProvider";
import { useSession } from "next-auth/react";
import {
  ShieldCheck,
  Feather,
  Clock,
  BookOpen,
  Award,
  Maximize2,
  Heart,
  Share2,
  DollarSign,
  Gavel,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
} from "lucide-react";

type BookFull = BookListing & {
  images: BookImage[];
  certificate: AuthenticityCertificate | null;
  auction: (TimedAuction & { bids: (Bid & { user: { name: string | null } })[] }) | null;
};

interface ItemDetailClientProps {
  book: BookFull;
  initialInWishlist?: boolean;
}

export default function ItemDetailClient({ book, initialInWishlist = false }: ItemDetailClientProps) {
  const { reserveBook, items: cartItems } = useCart();
  const { data: session } = useSession();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [isReserving, setIsReserving] = useState(false);
  const [reservationError, setReservationError] = useState<string | null>(null);

  // Offer modal state
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState<string>("");
  const [offerNote, setOfferNote] = useState<string>("");
  const [guestEmail, setGuestEmail] = useState<string>(session?.user?.email || "");
  const [guestName, setGuestName] = useState<string>(session?.user?.name || "");
  const [offerSubmitted, setOfferSubmitted] = useState(false);
  const [offerLoading, setOfferLoading] = useState(false);

  // Auction bid state
  const [bidAmount, setBidAmount] = useState<string>("");
  const [bidLoading, setBidLoading] = useState(false);
  const [bidError, setBidError] = useState<string | null>(null);
  const [bidSuccess, setBidSuccess] = useState(false);

  // Wishlist state
  const [inWishlist, setInWishlist] = useState(initialInWishlist);

  // Condition guide modal
  const [isConditionModalOpen, setIsConditionModalOpen] = useState(false);

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const isHeldInMyCart = cartItems.some((item) => item.bookId === book.id);
  const isReservedByOther = book.status === "RESERVED" && !isHeldInMyCart;

  const handleReserve = async () => {
    setIsReserving(true);
    setReservationError(null);
    const res = await reserveBook(book.id);
    if (!res.success) {
      setReservationError(res.error || "Could not reserve this copy.");
    }
    setIsReserving(false);
  };

  const handleToggleWishlist = async () => {
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: book.id }),
      });
      if (res.ok) {
        setInWishlist(!inWishlist);
      }
    } catch {
      // optimistic fallback
      setInWishlist(!inWishlist);
    }
  };

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setOfferLoading(true);
    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: book.id,
          offerAmountInCents: Math.round(parseFloat(offerAmount) * 100),
          guestEmail,
          guestName,
          buyerNote: offerNote,
        }),
      });
      if (res.ok) {
        setOfferSubmitted(true);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to submit offer.");
      }
    } catch {
      alert("Submission error.");
    } finally {
      setOfferLoading(false);
    }
  };

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book.auction) return;
    setBidLoading(true);
    setBidError(null);
    try {
      const res = await fetch(`/api/auctions/${book.auction.id}/bid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountInCents: Math.round(parseFloat(bidAmount) * 100),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBidSuccess(true);
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setBidError(data.error || "Bid could not be processed.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      setBidError(msg);
    } finally {
      setBidLoading(false);
    }
  };

  const activeImage = book.images[activeImageIndex] || book.images[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="text-xs text-[#8E867B] font-mono mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-[#1A1816]">Guild</Link>
        <span>/</span>
        <Link href="/catalog" className="hover:text-[#1A1816]">The Vault</Link>
        <span>/</span>
        <span className="text-[#1A1816] font-medium truncate max-w-sm">{book.title}</span>
      </nav>

      {/* Main Specimen Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Gallery (7 cols): Main View + 6+ Thumbs */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Selected Image */}
          <div className="relative h-[480px] sm:h-[560px] bg-[#EDE8DC] rounded-lg overflow-hidden border border-[#D9D1BF] shadow-sm group">
            {activeImage && (
              <SafeBookImage
                src={activeImage.url}
                alt={activeImage.caption || book.title}
                title={book.title}
                author={book.author}
                year={book.year}
                fill
                priority
                className="object-cover cursor-zoom-in"
                onClick={() => setIsZoomModalOpen(true)}
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
            )}

            {/* Click to Zoom button */}
            <button
              onClick={() => setIsZoomModalOpen(true)}
              className="absolute bottom-4 right-4 bg-[#1A1816]/80 hover:bg-[#1A1816] text-white p-2.5 rounded-full backdrop-blur-xs transition-colors shadow-md"
              title="Inspect under magnification"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Image caption badge */}
            {activeImage?.caption && (
              <div className="absolute bottom-4 left-4 max-w-[80%] bg-[#1A1816]/80 text-[#FDFBF7] text-xs px-3 py-1.5 rounded backdrop-blur-xs shadow-md">
                {activeImage.caption}
              </div>
            )}
          </div>

          {/* 6+ Thumbnail Strip */}
          <div className="grid grid-cols-6 gap-2">
            {book.images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative h-20 bg-[#F4EFE6] rounded border overflow-hidden transition-all ${
                  activeImageIndex === idx
                    ? "border-[#B38838] ring-2 ring-[#B38838]/40 scale-102"
                    : "border-[#D9D1BF] opacity-70 hover:opacity-100"
                }`}
              >
                <SafeBookImage
                  src={img.url}
                  alt={img.caption || `Photograph ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="120px"
                />
              </button>
            ))}
          </div>

          {/* Forensic Defect Accounting Box */}
          <div className="mt-8 bg-[#F7F3E9] border border-[#E8E2D4] rounded-lg p-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#1A1816] uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-[#B38838]" />
              <span>Forensic Defect &amp; Physical Condition Accounting</span>
            </div>
            <p className="text-xs text-[#5C564E] leading-relaxed">
              {book.defectNotes}
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-[11px] text-[#8E867B] font-mono border-t border-[#E8E2D4]">
              <span>Dust Jacket: <strong>{book.dustJacket.replace(/_/g, " ")}</strong></span>
              <span>Binding: <strong>Original Publisher Cloth</strong></span>
              <span>Completeness: <strong>100% Collated &amp; Verified</strong></span>
            </div>
          </div>
        </div>

        {/* Right Dossier & Purchase Terminal (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex justify-between items-start gap-4">
              <span className="text-xs font-mono uppercase tracking-widest text-[#B38838]">
                Circa {book.year} • {book.publisher}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleWishlist}
                  className={`p-2 rounded-full border transition-colors ${
                    inWishlist
                      ? "bg-red-50 border-red-300 text-red-600"
                      : "bg-white border-[#DDD6C5] text-[#8E867B] hover:text-[#1A1816]"
                  }`}
                  title="Save to Collector Wishlist"
                >
                  <Heart className={`w-4 h-4 ${inWishlist ? "fill-red-600" : ""}`} />
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Specimen ledger link copied to clipboard.");
                  }}
                  className="p-2 bg-white border border-[#DDD6C5] rounded-full text-[#8E867B] hover:text-[#1A1816] transition-colors"
                  title="Share specimen link"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1A1816] mt-2 leading-tight">
              {book.title}
            </h1>

            <p className="text-base text-[#5C564E] font-serif italic mt-1">
              By {book.author}
            </p>

            <p className="text-xs text-[#8E867B] mt-2 font-mono">
              {book.editionPrinting}
              {book.isbn ? ` • ISBN: ${book.isbn}` : " • Antiquarian (Pre-ISBN Period)"}
            </p>
          </div>

          {/* Condition & Attributes Badges */}
          <div className="flex flex-wrap items-center gap-2 py-3 border-y border-[#E8E2D4]">
            <button
              onClick={() => setIsConditionModalOpen(true)}
              className="px-2.5 py-1 bg-[#F4EFE6] border border-[#DDD6C5] hover:border-[#B38838] rounded text-xs font-mono font-bold text-[#1A1816] flex items-center gap-1.5"
            >
              <span>Grade: {book.conditionGrade}</span>
              <HelpCircle className="w-3.5 h-3.5 text-[#8E867B]" />
            </button>

            {book.isSigned && (
              <span className="px-2.5 py-1 bg-[#1A1816] text-[#D9B464] rounded text-xs font-mono font-bold flex items-center gap-1">
                <Feather className="w-3.5 h-3.5" />
                <span>Signed by Author</span>
              </span>
            )}

            {book.isFirstEdition && (
              <span className="px-2.5 py-1 bg-[#233D30] text-white rounded text-xs font-mono font-bold">
                First Edition
              </span>
            )}

            {book.isIllustrated && (
              <span className="px-2.5 py-1 bg-[#6E5520] text-white rounded text-xs font-mono font-bold">
                Illustrated
              </span>
            )}
          </div>

          {/* Pricing & Acquisition Module */}
          <div className="bg-white border border-[#E8E2D4] rounded-lg p-6 space-y-4 shadow-sm">
            <div className="flex justify-between items-baseline">
              <span className="text-xs uppercase tracking-wider text-[#8E867B] font-mono">
                Acquisition Valuation
              </span>
              <span className="text-3xl font-serif font-bold text-[#1A1816]">
                {formatPrice(book.priceInCents)}
              </span>
            </div>

            {/* Reservation Status & Action Button */}
            {book.status === "IN_AUCTION" && book.auction ? (
              <div className="space-y-4 pt-2 border-t border-[#E8E2D4]">
                <div className="bg-[#FFF8E7] p-3 rounded border border-[#EAD8B0] space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-[#7A5B18] font-bold uppercase tracking-wider">
                      Live Auction Current Bid
                    </span>
                    <span className="text-xl font-serif font-bold text-[#7A202E]">
                      {formatPrice(book.auction.currentBidInCents)}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8A6720]">
                    Min next bid: {formatPrice(book.auction.currentBidInCents + book.auction.bidIncrementInCents)}
                  </p>
                </div>

                {bidSuccess && (
                  <div className="p-3 bg-green-50 text-green-800 text-xs rounded border border-green-200">
                    Your bid has been recorded successfully!
                  </div>
                )}
                {bidError && (
                  <div className="p-3 bg-red-50 text-red-800 text-xs rounded border border-red-200">
                    {bidError}
                  </div>
                )}

                <form onSubmit={handlePlaceBid} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      required
                      min={(book.auction.currentBidInCents + book.auction.bidIncrementInCents) / 100}
                      step="50"
                      placeholder={`$${(book.auction.currentBidInCents + book.auction.bidIncrementInCents) / 100}`}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="flex-1 px-3 py-2 border border-[#DDD6C5] rounded text-sm bg-white"
                    />
                    <button
                      type="submit"
                      disabled={bidLoading}
                      className="px-5 py-2 bg-[#7A202E] hover:bg-[#581620] text-white text-xs font-bold uppercase tracking-wider rounded transition-colors disabled:opacity-50"
                    >
                      {bidLoading ? "Submitting..." : "Place Bid"}
                    </button>
                  </div>
                  <p className="text-[10px] text-[#8E867B]">
                    Protected with 5-minute auto-extension anti-snipe guarantee.
                  </p>
                </form>
              </div>
            ) : book.status === "SOLD" ? (
              <div className="p-4 bg-[#F4EFE6] text-center rounded border border-[#DDD6C5] space-y-1">
                <span className="font-serif font-bold text-base text-[#1A1816]">
                  Acquired for a Private Collection
                </span>
                <p className="text-xs text-[#5C564E]">
                  This unique copy has been sold. You can request notification if a comparable edition enters our vault.
                </p>
              </div>
            ) : isReservedByOther ? (
              <div className="p-4 bg-[#FFF8E7] rounded border border-[#EAD8B0] space-y-2">
                <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#7A5B18]">
                  <Clock className="w-4 h-4 text-[#B38838]" />
                  <span>Temporarily Reserved in Another Cart</span>
                </div>
                <p className="text-xs text-[#8A6720] leading-relaxed">
                  Another collector currently has a 15-minute exclusivity lock on this singular volume. If their checkout window lapses, it will automatically return to the public market.
                </p>
              </div>
            ) : isHeldInMyCart ? (
              <div className="space-y-3">
                <div className="p-3 bg-[#E8F2EC] text-[#1E3A2F] rounded text-xs flex items-center gap-2 font-medium border border-[#C5DDD0]">
                  <CheckCircle2 className="w-4 h-4 text-[#233D30]" />
                  <span>Reserved exclusively in your acquisition portfolio.</span>
                </div>
                <Link
                  href="/checkout"
                  className="w-full py-3.5 bg-[#1A1816] hover:bg-[#B38838] text-white text-xs font-bold uppercase tracking-widest text-center block rounded transition-colors shadow-md"
                >
                  Proceed to Final Acquisition &amp; White-Glove Dispatch
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {reservationError && (
                  <div className="p-3 bg-red-50 text-red-800 text-xs rounded border border-red-200 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{reservationError}</span>
                  </div>
                )}
                <button
                  onClick={handleReserve}
                  disabled={isReserving}
                  className="w-full py-3.5 bg-[#1A1816] hover:bg-[#B38838] text-white text-xs font-bold uppercase tracking-widest rounded transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Clock className="w-4 h-4 text-[#B38838]" />
                  <span>{isReserving ? "Locking Portfolio..." : "Reserve Volume in Cart (15m Lock)"}</span>
                </button>
                <button
                  onClick={() => setIsOfferModalOpen(true)}
                  className="w-full py-2.5 bg-[#F4EFE6] hover:bg-[#E8E2D4] text-[#1A1816] text-xs font-medium uppercase tracking-wider rounded transition-colors"
                >
                  Propose Private Offer
                </button>
              </div>
            )}

            <div className="pt-2 flex items-center gap-2 text-xs text-[#5C564E] border-t border-[#E8E2D4]">
              <ShieldCheck className="w-4 h-4 text-[#233D30] shrink-0" />
              <span>Full institutional return privileges within 14 days if not as described.</span>
            </div>
          </div>

          {/* Provenance Ledger */}
          <div className="bg-[#FDFBF7] border border-[#E8E2D4] rounded-lg p-6 space-y-3">
            <h3 className="text-xs font-serif font-bold text-[#1A1816] uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-[#B38838]" />
              <span>Documented Chain of Provenance</span>
            </h3>
            <p className="text-xs text-[#5C564E] leading-relaxed">
              {book.provenanceNotes}
            </p>
          </div>

          {/* Certificate of Authenticity Link */}
          {book.certificate && (
            <div className="bg-[#F4EFE6] border border-[#DDD6C5] rounded-lg p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#B38838]">
                  Archival Guarantee
                </span>
                <p className="font-serif font-bold text-sm text-[#1A1816]">
                  Certificate #{book.certificate.certificateNumber}
                </p>
                <p className="text-[11px] text-[#5C564E]">
                  Issued by {book.certificate.examinerName}
                </p>
              </div>

              <Link
                href={`/certificate/${book.certificate.certificateNumber}`}
                className="px-3 py-1.5 bg-[#1A1816] text-white text-xs font-medium uppercase tracking-wider rounded hover:bg-[#B38838] transition-colors"
              >
                Inspect Seal
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Magnified Zoom Modal */}
      {isZoomModalOpen && activeImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4">
          <div className="flex justify-between items-center text-white p-2">
            <span className="text-xs font-mono">{activeImage.caption || book.title}</span>
            <button
              onClick={() => setIsZoomModalOpen(false)}
              className="p-2 text-white/80 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="relative flex-1 w-full max-h-[85vh]">
            <SafeBookImage
              src={activeImage.url}
              alt={activeImage.caption || book.title}
              title={book.title}
              author={book.author}
              year={book.year}
              fill
              className="object-contain"
            />
          </div>
          <div className="text-center text-xs text-white/60 p-2 font-mono">
            High-Resolution Curatorial Archive • 100% Optical Fidelity
          </div>
        </div>
      )}

      {/* Make-an-Offer Drawer/Modal */}
      {isOfferModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E2D4] rounded-lg max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-start pb-3 border-b border-[#E8E2D4]">
              <div>
                <h3 className="text-xl font-serif font-bold text-[#1A1816]">
                  Propose Private Acquisition Offer
                </h3>
                <p className="text-xs text-[#5C564E] mt-0.5">
                  Direct submission to the Curators&apos; Board. List price: {formatPrice(book.priceInCents)}.
                </p>
              </div>
              <button
                onClick={() => setIsOfferModalOpen(false)}
                className="text-[#8E867B] hover:text-[#1A1816]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {offerSubmitted ? (
              <div className="py-6 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-[#233D30] mx-auto" />
                <h4 className="font-serif font-bold text-lg text-[#1A1816]">
                  Offer Transmitted to the Curators
                </h4>
                <p className="text-xs text-[#5C564E] leading-relaxed max-w-sm mx-auto">
                  Your formal proposal has been catalogued. You will receive an official response or counter-offer via email within 24 business hours.
                </p>
                <button
                  onClick={() => setIsOfferModalOpen(false)}
                  className="mt-4 px-6 py-2 bg-[#1A1816] text-white text-xs uppercase tracking-wider rounded"
                >
                  Return to Dossier
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitOffer} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#1A1816] mb-1">
                      Collector Name
                    </label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Lord / Dr. / Ms. Name"
                      className="w-full px-3 py-2 text-xs border border-[#DDD6C5] rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#1A1816] mb-1">
                      Official Email
                    </label>
                    <input
                      type="email"
                      required
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="collector@domain.com"
                      className="w-full px-3 py-2 text-xs border border-[#DDD6C5] rounded bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#1A1816] mb-1">
                    Offered Amount ($ USD)
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-[#8E867B] absolute left-2.5 top-2.5" />
                    <input
                      type="number"
                      required
                      min="1"
                      step="50"
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(e.target.value)}
                      placeholder={`e.g. ${Math.round((book.priceInCents * 0.9) / 100)}`}
                      className="w-full pl-8 pr-3 py-2 text-xs border border-[#DDD6C5] rounded bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#1A1816] mb-1">
                    Curatorial Rationale or Note (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={offerNote}
                    onChange={(e) => setOfferNote(e.target.value)}
                    placeholder="Institutional acquisition for research collection, private study, or terms..."
                    className="w-full p-2.5 text-xs border border-[#DDD6C5] rounded bg-white"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-[#E8E2D4]">
                  <button
                    type="button"
                    onClick={() => setIsOfferModalOpen(false)}
                    className="px-4 py-2 text-xs text-[#5C564E] hover:text-[#1A1816]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={offerLoading}
                    className="px-5 py-2 bg-[#1A1816] hover:bg-[#B38838] text-white text-xs font-bold uppercase tracking-wider rounded transition-colors disabled:opacity-50"
                  >
                    {offerLoading ? "Submitting..." : "Submit Formal Offer"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Condition Grade Explanatory Modal */}
      {isConditionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E2D4] rounded-lg max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-[#E8E2D4]">
              <h3 className="text-lg font-serif font-bold text-[#1A1816]">
                ABAA Antiquarian Grading Standards
              </h3>
              <button onClick={() => setIsConditionModalOpen(false)}>
                <X className="w-5 h-5 text-[#8E867B]" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-[#5C564E] leading-relaxed">
              <div>
                <strong className="text-[#1A1816] font-serif text-sm">Fine (F / As New):</strong>
                <p>Appears crisp and unread. No defects, marks, foxing, or spine wear.</p>
              </div>
              <div>
                <strong className="text-[#1A1816] font-serif text-sm">Very Good (VG):</strong>
                <p>An exceptional collectible copy showing small signs of shelf wear or age, with no major defects.</p>
              </div>
              <div>
                <strong className="text-[#1A1816] font-serif text-sm">Good (G):</strong>
                <p>The traditional bookseller&apos;s term for an average used copy with intact text and binding.</p>
              </div>
              <div>
                <strong className="text-[#1A1816] font-serif text-sm">Fair / Poor:</strong>
                <p>Heavily worn copy with missing leaves, broken hinges, or severe damp staining, preserved purely for reading or historical completeness.</p>
              </div>
            </div>
            <div className="pt-2 text-right">
              <button
                onClick={() => setIsConditionModalOpen(false)}
                className="px-4 py-2 bg-[#1A1816] text-white text-xs uppercase tracking-wider rounded"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
