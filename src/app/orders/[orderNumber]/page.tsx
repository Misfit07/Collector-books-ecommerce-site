import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SafeBookImage from "@/components/common/SafeBookImage";
import { ShieldCheck, Award, CheckCircle2, ArrowRight, Printer, PackageCheck, Gift, Sparkles } from "lucide-react";
import PrintButton from "@/components/common/PrintButton";

interface OrderPageProps {
  params: Promise<{ orderNumber: string }>;
}

export default async function OrderConfirmationPage({ params }: OrderPageProps) {
  const { orderNumber } = await params;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: {
        include: {
          book: {
            include: {
              images: { where: { isCover: true }, take: 1 },
              certificate: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  let address = { street: "", city: "", state: "", postalCode: "", country: "" };
  try {
    if (order.shippingAddressJson) {
      address = JSON.parse(order.shippingAddressJson);
    }
  } catch {
    // fallback
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Action buttons print/back */}
      <div className="mb-6 flex justify-between items-center print:hidden">
        <Link
          href="/catalog"
          className="text-xs uppercase font-mono tracking-wider text-[#5C564E] hover:text-[#1A1816]"
        >
          ← Return to Catalogue
        </Link>
        <PrintButton />
      </div>

      {/* Main Order Receipt Container */}
      <div className="bg-white border border-[#E8E2D4] rounded-lg p-8 sm:p-12 shadow-lg space-y-8">
        {/* Header */}
        <div className="text-center pb-8 border-b border-[#E8E2D4] space-y-3">
          <div className="w-14 h-14 bg-[#E8F2EC] text-[#233D30] rounded-full flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#B38838]">
            Formal Acquisition Deed &amp; Receipt
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1A1816]">
            Acquisition Confirmed &amp; Sealed
          </h1>
          <p className="text-xs font-mono text-[#5C564E]">
            Registry Order #{order.orderNumber} • Recorded: {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Status Callout */}
        <div className="bg-[#F7F3E9] border border-[#EAD8B0] p-4 rounded-lg flex items-center gap-3">
          <PackageCheck className="w-6 h-6 text-[#233D30] shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-[#1A1816] block">
              White-Glove Archival Packaging Initiated
            </span>
            <span className="text-[#5C564E]">
              Your unique volumes are transferred to our secure vaults for moisture-controlled conditioning and double-boxed archival dispatch.
            </span>
          </div>
        </div>

        {/* Acquired Volumes */}
        <div className="space-y-4">
          <h3 className="text-xs font-serif font-bold uppercase tracking-wider text-[#1A1816]">
            Purchased Volumes
          </h3>

          <div className="divide-y divide-[#E8E2D4] border-y border-[#E8E2D4]">
            {order.items.map((item) => {
              const cover = item.book.images[0]?.url || "";
              const cert = item.book.certificate;

              return (
                <div key={item.id} className="py-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                  <div className="flex gap-4 items-center">
                    <div className="relative w-16 h-24 bg-[#EDE8DC] rounded border border-[#DDD6C5] overflow-hidden shrink-0">
                      <SafeBookImage
                        src={cover}
                        alt={item.title}
                        title={item.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-base text-[#1A1816]">
                        {item.title}
                      </h4>
                      <p className="text-xs text-[#5C564E] italic">{item.author}</p>
                      <p className="text-[11px] text-[#8E867B]">{item.edition}</p>

                      {/* Certificate Link Button */}
                      {cert && (
                        <div className="mt-2">
                          <Link
                            href={`/certificate/${cert.certificateNumber}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F4EFE6] hover:bg-[#1A1816] text-[#1A1816] hover:text-white rounded text-[11px] font-mono transition-colors border border-[#DDD6C5]"
                          >
                            <Award className="w-3.5 h-3.5 text-[#B38838]" />
                            <span>Inspect Certificate #{cert.certificateNumber}</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right sm:self-center">
                    <span className="text-xs font-mono uppercase text-[#8E867B] block">Price</span>
                    <span className="font-serif font-bold text-lg text-[#1A1816]">
                      {formatPrice(item.priceInCents)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Complimentary Wooden Curio Prize */}
        {order.curioPrize && (
          <div className="bg-[#FAF7F0] border border-[#DDD6C5] rounded-lg p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1A1816] text-[#C59B27] flex items-center justify-center shrink-0">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase text-[#B38838] font-bold tracking-wider">
                    Complimentary Parcel Curio
                  </span>
                  {order.curioPrizeTier && (
                    <span className="text-[9px] font-mono uppercase bg-[#1A1816] text-[#E8D196] px-1.5 py-0.2 rounded">
                      {order.curioPrizeTier}
                    </span>
                  )}
                </div>
                <h4 className="font-serif font-bold text-base text-[#1A1816]">
                  {order.curioPrize}
                </h4>
                <p className="text-xs text-[#5C564E]">
                  Enclosed in custom tissue and boxed together with your volume.
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-[#233D30] bg-[#E8F2EC] px-3 py-1 rounded">
              Included Free
            </span>
          </div>
        )}

        {/* Shipping & Payment Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4 text-xs">
          <div className="space-y-1.5">
            <h4 className="font-serif font-bold text-sm text-[#1A1816] mb-2">
              Archival Delivery Destination
            </h4>
            <p className="font-bold text-[#1A1816]">{order.customerName}</p>
            <p className="text-[#5C564E]">{address.street}</p>
            <p className="text-[#5C564E]">{address.city}, {address.state} {address.postalCode}</p>
            <p className="text-[#5C564E]">{address.country}</p>
            <p className="text-[#8E867B] pt-1">Contact: {order.customerEmail}</p>
          </div>

          <div className="space-y-2 sm:text-right">
            <h4 className="font-serif font-bold text-sm text-[#1A1816] mb-2">
              Payment &amp; Order Summary
            </h4>
            <div className="flex justify-between sm:justify-end gap-4">
              <span className="text-[#8E867B]">Method:</span>
              <span className="font-mono text-[#1A1816]">{order.paymentMethod}</span>
            </div>
            {order.razorpayPaymentId && (
              <div className="flex justify-between sm:justify-end gap-4">
                <span className="text-[#8E867B]">Payment ID:</span>
                <span className="font-mono text-[#1A1816]">{order.razorpayPaymentId}</span>
              </div>
            )}
            {order.discountInCents > 0 && (
              <div className="flex justify-between sm:justify-end gap-4 text-[#233D30]">
                <span>Points Allowance ({order.pointsRedeemed} pts):</span>
                <span className="font-mono font-bold">-{formatPrice(order.discountInCents)}</span>
              </div>
            )}
            <div className="flex justify-between sm:justify-end gap-4 pt-2 border-t border-[#E8E2D4] font-serif font-bold text-base text-[#1A1816]">
              <span>Settled Total:</span>
              <span>{formatPrice(order.totalInCents)}</span>
            </div>
            {order.pointsEarned > 0 && (
              <div className="text-[11px] font-mono text-[#B38838] pt-1">
                +{order.pointsEarned} Patron Points credited to your account
              </div>
            )}
          </div>
        </div>

        {/* Certification Guarantee Banner */}
        <div className="pt-6 border-t border-[#E8E2D4] flex items-center justify-between text-xs text-[#5C564E]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#233D30]" />
            <span>Guaranteed Authentic in Perpetuity by The Antiquarian Guild LLC</span>
          </div>
          <Link
            href="/catalog"
            className="text-xs font-bold uppercase tracking-wider text-[#966E26] hover:text-[#1A1816] flex items-center gap-1 print:hidden"
          >
            <span>Continue Curating</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
