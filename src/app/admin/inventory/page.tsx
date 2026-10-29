import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SafeBookImage from "@/components/common/SafeBookImage";
import { PlusCircle, Search, ArrowLeft, Award, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as { role?: string })?.role !== "ADMIN") {
    redirect("/login");
  }

  const books = await prisma.bookListing.findMany({
    include: {
      images: { where: { isCover: true }, take: 1 },
      certificate: true,
      reservation: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-[#E8E2D4] flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <Link
            href="/admin"
            className="text-xs font-mono uppercase tracking-wider text-[#8E867B] hover:text-[#1A1816] flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Admin Overview</span>
          </Link>
          <h1 className="text-3xl font-serif font-bold text-[#1A1816]">
            Catalogue Inventory
          </h1>
          <p className="text-xs text-[#5C564E] mt-1 font-mono">
            {books.length} Total Curated Records
          </p>
        </div>

        <Link
          href="/admin/inventory/new"
          className="px-4 py-2.5 bg-[#1A1816] hover:bg-[#B38838] text-white rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 shadow"
        >
          <PlusCircle className="w-4 h-4 text-[#B38838]" />
          <span>Intake New Collectible</span>
        </Link>
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-[#E8E2D4] rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-[#E8E2D4]">
            <thead className="bg-[#F7F3E9] text-[#1A1816] font-serif font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Specimen</th>
                <th className="px-4 py-3.5">Author &amp; Year</th>
                <th className="px-4 py-3.5">Grade</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Valuation</th>
                <th className="px-4 py-3.5">Certificate</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4EFE6] text-[#5C564E]">
              {books.map((book) => {
                const cover = book.images[0]?.url || "";
                return (
                  <tr key={book.id} className="hover:bg-[#FDFBF7] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-14 bg-[#EDE8DC] rounded overflow-hidden shrink-0 border border-[#DDD6C5]">
                          <SafeBookImage
                            src={cover}
                            alt={book.title}
                            title={book.title}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                        <div>
                          <Link
                            href={`/catalog/${book.slug}`}
                            className="font-serif font-bold text-sm text-[#1A1816] hover:text-[#B38838] line-clamp-1"
                          >
                            {book.title}
                          </Link>
                          <span className="text-[10px] text-[#8E867B] font-mono block">
                            {book.editionPrinting}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <p className="font-medium text-[#1A1816]">{book.author}</p>
                      <span className="text-[11px] font-mono text-[#8E867B]">{book.year}</span>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F4EFE6] text-[#1A1816] border border-[#DDD6C5]">
                        {book.conditionGrade}
                      </span>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono ${
                          book.status === "AVAILABLE"
                            ? "bg-green-100 text-green-800"
                            : book.status === "RESERVED"
                            ? "bg-amber-100 text-amber-800"
                            : book.status === "IN_AUCTION"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-stone-200 text-stone-800"
                        }`}
                      >
                        {book.status}
                      </span>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap font-serif font-bold text-[#1A1816] text-sm">
                      {formatPrice(book.priceInCents)}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      {book.certificate ? (
                        <Link
                          href={`/certificate/${book.certificate.certificateNumber}`}
                          className="inline-flex items-center gap-1 text-[11px] font-mono text-[#B38838] hover:underline"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>#{book.certificate.certificateNumber.slice(-4)}</span>
                        </Link>
                      ) : (
                        <span className="text-[11px] text-[#8E867B]">None</span>
                      )}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <Link
                        href={`/catalog/${book.slug}`}
                        target="_blank"
                        className="p-1.5 text-[#5C564E] hover:text-[#1A1816] inline-block"
                        title="View Public Dossier"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
