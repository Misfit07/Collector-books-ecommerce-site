"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, CheckCircle2, ShieldCheck, Image as ImageIcon } from "lucide-react";

export default function NewBookIntakePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [publisher, setPublisher] = useState("");
  const [year, setYear] = useState<number>(1925);
  const [editionPrinting, setEditionPrinting] = useState("First Edition, First Printing");
  const [isbn, setIsbn] = useState("");
  const [conditionGrade, setConditionGrade] = useState("FINE");
  const [dustJacket, setDustJacket] = useState("AS_ISSUED");
  const [isSigned, setIsSigned] = useState(false);
  const [isInscribed, setIsInscribed] = useState(false);
  const [isFirstEdition, setIsFirstEdition] = useState(true);
  const [isIllustrated, setIsIllustrated] = useState(false);
  const [isAntiquarian, setIsAntiquarian] = useState(false);
  const [provenanceNotes, setProvenanceNotes] = useState(
    "Acquired from private English estate collection. Unblemished armorial bookplate."
  );
  const [defectNotes, setDefectNotes] = useState(
    "Original cloth clean and square, spine gilt vivid. Jacket unclipped with faint rubbing to extremities."
  );
  const [priceInDollars, setPriceInDollars] = useState<number>(15000);
  const [tags, setTags] = useState("first-edition,modernism,fine-binding");
  const [featured, setFeatured] = useState(true);
  const [curatorPick, setCuratorPick] = useState(true);
  const [generateCertificate, setGenerateCertificate] = useState(true);

  // 6+ photos
  const [images, setImages] = useState([
    { url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=1200&q=80", caption: "Front Dust Jacket", isCover: true },
    { url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80", caption: "Original Publisher Cloth Binding", isCover: false },
    { url: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80", caption: "Title Page & Imprint Date", isCover: false },
    { url: "https://images.unsplash.com/photo-1507842229451-7f01be7fe734?auto=format&fit=crop&w=1200&q=80", caption: "Author Inscription Detail", isCover: false },
    { url: "https://images.unsplash.com/photo-1532012164546-f432f2e35b32?auto=format&fit=crop&w=1200&q=80", caption: "Spine & Headcap Condition", isCover: false },
    { url: "https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=1200&q=80", caption: "Provenance Ex-Libris Plate", isCover: false },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddImage = () => {
    setImages([
      ...images,
      { url: "https://images.unsplash.com/photo-1524578271613-d550eacf6090?auto=format&fit=crop&w=1200&q=80", caption: `Additional Specimen Photo ${images.length + 1}`, isCover: false },
    ]);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          author,
          publisher,
          year: Number(year),
          editionPrinting,
          isbn: isbn || null,
          conditionGrade,
          dustJacket,
          isSigned,
          isInscribed,
          isFirstEdition,
          isIllustrated,
          isAntiquarian,
          provenanceNotes,
          defectNotes,
          priceInCents: Math.round(Number(priceInDollars) * 100),
          tags,
          featured,
          curatorPick,
          generateCertificate,
          images: images.map((img, idx) => ({
            url: img.url,
            caption: img.caption,
            displayOrder: idx,
            isCover: img.isCover,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Intake registration failed.");
      }

      router.push("/admin/inventory");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error submitting intake.";
      setError(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Top Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/admin/inventory"
          className="text-xs font-mono uppercase tracking-wider text-[#8E867B] hover:text-[#1A1816] flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Inventory Workbench</span>
        </Link>
      </div>

      <div className="bg-white border border-[#E8E2D4] rounded-lg p-8 shadow-lg space-y-8">
        <div className="pb-4 border-b border-[#E8E2D4]">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#B38838]">
            Archival Intake Desk
          </span>
          <h1 className="text-3xl font-serif font-bold text-[#1A1816] mt-1">
            Catalog New Collectible Specimen
          </h1>
          <p className="text-xs text-[#5C564E] mt-1">
            Complete the 30+ attribute curatorial intake form, attach 6+ archival photos, and issue a cryptographic Certificate of Authenticity.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-xs text-red-800 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Core Bibliographic Metadata */}
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-base text-[#1A1816] pb-2 border-b border-[#E8E2D4]">
              1. Bibliographic Identity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#1A1816] mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. The Picture of Dorian Gray"
                  className="w-full px-3 py-2 text-xs border border-[#DDD6C5] rounded bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1A1816] mb-1">Author / Creator *</label>
                <input
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. Oscar Wilde"
                  className="w-full px-3 py-2 text-xs border border-[#DDD6C5] rounded bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1A1816] mb-1">Publisher &amp; City *</label>
                <input
                  type="text"
                  required
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  placeholder="e.g. Ward Lock and Co., London"
                  className="w-full px-3 py-2 text-xs border border-[#DDD6C5] rounded bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-[#1A1816] mb-1">Year *</label>
                  <input
                    type="number"
                    required
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 text-xs border border-[#DDD6C5] rounded bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#1A1816] mb-1">ISBN (Optional)</label>
                  <input
                    type="text"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    placeholder="Optional"
                    className="w-full px-3 py-2 text-xs border border-[#DDD6C5] rounded bg-white"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#1A1816] mb-1">Edition / Printing State *</label>
                <input
                  type="text"
                  required
                  value={editionPrinting}
                  onChange={(e) => setEditionPrinting(e.target.value)}
                  placeholder="e.g. First Edition, First Impression (1 of 250 copies)"
                  className="w-full px-3 py-2 text-xs border border-[#DDD6C5] rounded bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Condition & Dust Jacket */}
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-base text-[#1A1816] pb-2 border-b border-[#E8E2D4]">
              2. Physical Condition &amp; Description
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#1A1816] mb-1">Condition Grade *</label>
                <select
                  value={conditionGrade}
                  onChange={(e) => setConditionGrade(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#DDD6C5] rounded bg-white"
                >
                  <option value="FINE">Fine (F / As New)</option>
                  <option value="VERY_GOOD">Very Good (VG)</option>
                  <option value="GOOD">Good (G)</option>
                  <option value="FAIR">Fair</option>
                  <option value="POOR">Poor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1A1816] mb-1">Dust Jacket Status *</label>
                <select
                  value={dustJacket}
                  onChange={(e) => setDustJacket(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#DDD6C5] rounded bg-white"
                >
                  <option value="AS_ISSUED">As Issued (Original &amp; Unclipped)</option>
                  <option value="PRESENT_CLIPPED">Present (Price Clipped)</option>
                  <option value="PRESENT_DAMAGED">Present (Minor Wear / Restoration)</option>
                  <option value="LACKING">Lacking (Issued but missing)</option>
                  <option value="NOT_ISSUED">Not Issued (Binding as published)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              <label className="flex items-center gap-2 text-xs text-[#1A1816]">
                <input
                  type="checkbox"
                  checked={isSigned}
                  onChange={(e) => setIsSigned(e.target.checked)}
                />
                <span>Signed</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-[#1A1816]">
                <input
                  type="checkbox"
                  checked={isInscribed}
                  onChange={(e) => setIsInscribed(e.target.checked)}
                />
                <span>Inscribed</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-[#1A1816]">
                <input
                  type="checkbox"
                  checked={isFirstEdition}
                  onChange={(e) => setIsFirstEdition(e.target.checked)}
                />
                <span>First Edition</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-[#1A1816]">
                <input
                  type="checkbox"
                  checked={isIllustrated}
                  onChange={(e) => setIsIllustrated(e.target.checked)}
                />
                <span>Illustrated</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-[#1A1816]">
                <input
                  type="checkbox"
                  checked={isAntiquarian}
                  onChange={(e) => setIsAntiquarian(e.target.checked)}
                />
                <span>Antiquarian</span>
              </label>
            </div>
          </div>

          {/* Section 3: Provenance & Defect Notes */}
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-base text-[#1A1816] pb-2 border-b border-[#E8E2D4]">
              3. Provenance Chain &amp; Detailed Defect Accounting
            </h3>

            <div>
              <label className="block text-xs font-medium text-[#1A1816] mb-1">
                Provenance &amp; Previous Ownership *
              </label>
              <textarea
                rows={3}
                required
                value={provenanceNotes}
                onChange={(e) => setProvenanceNotes(e.target.value)}
                className="w-full p-2.5 text-xs border border-[#DDD6C5] rounded bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1A1816] mb-1">
                Defect Accounting (Spine, Foxing, Flaws) *
              </label>
              <textarea
                rows={3}
                required
                value={defectNotes}
                onChange={(e) => setDefectNotes(e.target.value)}
                className="w-full p-2.5 text-xs border border-[#DDD6C5] rounded bg-white"
              />
            </div>
          </div>

          {/* Section 4: Valuation & Tags */}
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-base text-[#1A1816] pb-2 border-b border-[#E8E2D4]">
              4. Valuation &amp; Taxonomy
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#1A1816] mb-1">
                  Valuation ($ USD) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="50"
                  value={priceInDollars}
                  onChange={(e) => setPriceInDollars(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-[#DDD6C5] rounded bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1A1816] mb-1">
                  Category Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#DDD6C5] rounded bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 5: 6+ Archival Photographs */}
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#E8E2D4]">
              <h3 className="font-serif font-bold text-base text-[#1A1816]">
                5. Archival Specimen Photography ({images.length} Photos)
              </h3>
              <button
                type="button"
                onClick={handleAddImage}
                className="px-3 py-1 bg-[#F4EFE6] hover:bg-[#E8E2D4] text-[#1A1816] text-xs font-medium rounded flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Image URL</span>
              </button>
            </div>

            <div className="space-y-3">
              {images.map((img, idx) => (
                <div key={idx} className="flex gap-3 items-center bg-[#FBF9F5] p-3 rounded border border-[#E8E2D4]">
                  <span className="text-xs font-mono font-bold text-[#8E867B] w-6">#{idx + 1}</span>
                  <input
                    type="url"
                    required
                    placeholder="https://..."
                    value={img.url}
                    onChange={(e) => {
                      const updated = [...images];
                      updated[idx].url = e.target.value;
                      setImages(updated);
                    }}
                    className="flex-1 px-2.5 py-1.5 text-xs border border-[#DDD6C5] rounded bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Caption (e.g. Inscription closeup)"
                    value={img.caption}
                    onChange={(e) => {
                      const updated = [...images];
                      updated[idx].caption = e.target.value;
                      setImages(updated);
                    }}
                    className="w-48 px-2.5 py-1.5 text-xs border border-[#DDD6C5] rounded bg-white"
                  />
                  <label className="flex items-center gap-1 text-[11px] text-[#5C564E]">
                    <input
                      type="radio"
                      name="coverSelection"
                      checked={img.isCover}
                      onChange={() => {
                        const updated = images.map((item, i) => ({
                          ...item,
                          isCover: i === idx,
                        }));
                        setImages(updated);
                      }}
                    />
                    <span>Cover</span>
                  </label>
                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="text-[#8E867B] hover:text-[#7A202E]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 6: Certificate Generation */}
          <div className="bg-[#FFFDF9] border-2 border-dashed border-[#B38838] p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-[#B38838]" />
              <div>
                <h4 className="font-serif font-bold text-sm text-[#1A1816]">
                  Generate Cryptographic Certificate of Authenticity
                </h4>
                <p className="text-xs text-[#5C564E]">
                  Automatically generates unique certificate number, verification code, and SHA-256 seal.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={generateCertificate}
              onChange={(e) => setGenerateCertificate(e.target.checked)}
              className="w-5 h-5 accent-[#B38838]"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-[#E8E2D4]">
            <Link
              href="/admin/inventory"
              className="px-5 py-2.5 text-xs font-medium text-[#5C564E] hover:text-[#1A1816]"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-[#1A1816] hover:bg-[#B38838] text-white text-xs font-bold uppercase tracking-widest rounded transition-colors shadow disabled:opacity-50"
            >
              {isLoading ? "Cataloguing Volume..." : "Add Volume to Catalogue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
