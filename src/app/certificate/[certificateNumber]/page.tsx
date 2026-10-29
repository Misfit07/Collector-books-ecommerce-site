import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import QRCode from "qrcode";
import { ShieldCheck, Award, CheckCircle, ArrowLeft } from "lucide-react";
import PrintButton from "@/components/common/PrintButton";

interface CertificatePageProps {
  params: Promise<{ certificateNumber: string }>;
}

export default async function CertificatePage({ params }: CertificatePageProps) {
  const { certificateNumber } = await params;

  const cert = await prisma.authenticityCertificate.findFirst({
    where: {
      OR: [
        { certificateNumber },
        { id: certificateNumber },
      ],
    },
    include: {
      book: {
        include: {
          images: { where: { isCover: true }, take: 1 },
        },
      },
    },
  });

  if (!cert) {
    notFound();
  }

  // Generate QR code data URL
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/certificate/${cert.certificateNumber}`;
  let qrCodeDataUrl = "";
  try {
    qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      margin: 1,
      width: 140,
      color: {
        dark: "#1A1816",
        light: "#FDFBF7",
      },
    });
  } catch (err) {
    console.error("QR Code error:", err);
  }

  let metadata = {
    paperStock: "Handmade rag paper, laid watermarked",
    bindingType: "Contemporary morocco with gilt armorial tooling",
    microscopicInkAnalysis: "Iron gall ink consistency verified, genuine author signature",
    catalogDate: new Date().toISOString(),
  };

  try {
    if (cert.metadataJson) {
      metadata = { ...metadata, ...JSON.parse(cert.metadataJson) };
    }
  } catch {
    // default metadata
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Top back navigation */}
      <div className="mb-6 flex justify-between items-center print:hidden">
        <Link
          href={`/catalog/${cert.book.slug}`}
          className="text-xs uppercase font-mono tracking-wider text-[#5C564E] hover:text-[#1A1816] flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Volume Dossier</span>
        </Link>
        <PrintButton />
      </div>

      {/* Archival Certificate Document with Gilt Double Border */}
      <div className="bg-[#FFFDF9] border-8 border-double border-[#C49E48] p-8 sm:p-14 rounded shadow-2xl relative overflow-hidden">
        {/* Subtle Watermark Guild Crest */}
        <div className="absolute inset-0 flex items-center justify-center opacity-3 pointer-events-none">
          <Award className="w-96 h-96 text-[#1A1816]" />
        </div>

        {/* Certificate Header */}
        <div className="text-center pb-8 border-b-2 border-[#E8E2D4] space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-[0.3em] uppercase text-[#B38838]">
            <ShieldCheck className="w-4 h-4" />
            <span>The Antiquarian Guild • Board of Forensic Authentication</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1A1816] tracking-tight">
            Certificate of Archival Authenticity
          </h1>
          <p className="text-xs font-mono text-[#8E867B] tracking-widest uppercase">
            Official Registry ID: {cert.certificateNumber}
          </p>
        </div>

        {/* Core Verification Declaration */}
        <div className="py-8 text-center max-w-2xl mx-auto space-y-4">
          <p className="font-serif italic text-base sm:text-lg text-[#1A1816] leading-relaxed">
            This certifies that the specimen described herein has undergone rigorous physical collation, typographical census analysis, and forensic inspection in conformity with the standards of the Antiquarian Booksellers&apos; Association of America (ABAA) and the International League of Antiquarian Booksellers (ILAB).
          </p>
        </div>

        {/* Collation Specifications Matrix */}
        <div className="bg-[#FBF9F5] border border-[#E8E2D4] p-6 rounded my-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="block font-mono text-[10px] uppercase text-[#8E867B]">Work Title</span>
              <span className="font-serif font-bold text-base text-[#1A1816]">{cert.book.title}</span>
            </div>
            <div>
              <span className="block font-mono text-[10px] uppercase text-[#8E867B]">Author / Originator</span>
              <span className="font-serif font-bold text-base text-[#1A1816]">{cert.book.author}</span>
            </div>
            <div>
              <span className="block font-mono text-[10px] uppercase text-[#8E867B]">Year of Publication</span>
              <span className="font-mono text-[#1A1816]">{cert.book.year}</span>
            </div>
            <div>
              <span className="block font-mono text-[10px] uppercase text-[#8E867B]">Edition &amp; Printing</span>
              <span className="text-[#1A1816]">{cert.book.editionPrinting}</span>
            </div>
            <div>
              <span className="block font-mono text-[10px] uppercase text-[#8E867B]">Condition Grade</span>
              <span className="font-bold text-[#1A1816]">{cert.book.conditionGrade}</span>
            </div>
            <div>
              <span className="block font-mono text-[10px] uppercase text-[#8E867B]">Dust Jacket State</span>
              <span className="text-[#1A1816]">{cert.book.dustJacket.replace(/_/g, " ")}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E8E2D4] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="block font-mono text-[10px] uppercase text-[#8E867B]">Substrate &amp; Paper Analysis</span>
              <span className="text-[#5C564E]">{metadata.paperStock}</span>
            </div>
            <div>
              <span className="block font-mono text-[10px] uppercase text-[#8E867B]">Binding Structure</span>
              <span className="text-[#5C564E]">{metadata.bindingType}</span>
            </div>
          </div>

          <div className="pt-2">
            <span className="block font-mono text-[10px] uppercase text-[#8E867B]">Autograph / Provenance Forensic Finding</span>
            <span className="text-xs text-[#233D30] font-medium flex items-center gap-1.5 mt-0.5">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{metadata.microscopicInkAnalysis}</span>
            </span>
          </div>
        </div>

        {/* Cryptographic Seal & Signatures */}
        <div className="pt-6 border-t-2 border-[#E8E2D4] grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
          {/* QR Code */}
          <div className="flex flex-col items-center sm:items-start space-y-1">
            {qrCodeDataUrl ? (
              <img
                src={qrCodeDataUrl}
                alt="Verification QR code"
                className="w-28 h-28 border border-[#DDD6C5] rounded p-1 bg-white"
              />
            ) : (
              <div className="w-28 h-28 bg-stone-100 flex items-center justify-center text-xs">QR</div>
            )}
            <span className="text-[9px] font-mono uppercase text-[#8E867B] text-center sm:text-left">
              Scan to Verify Online
            </span>
          </div>

          {/* Cryptographic SHA256 Box */}
          <div className="text-center sm:text-left space-y-1">
            <span className="block font-mono text-[10px] uppercase tracking-wider text-[#8E867B]">
              SHA-256 Digital Fingerprint
            </span>
            <p className="font-mono text-[10px] text-[#5C564E] break-all bg-[#F4EFE6] p-2 rounded border border-[#E8E2D4]">
              {cert.signatureSha256}
            </p>
            <span className="block text-[10px] text-[#8E867B]">
              Issued: {new Date(cert.issuedAt).toLocaleDateString()}
            </span>
          </div>

          {/* Examiner Signature Seal */}
          <div className="text-center sm:text-right space-y-1">
            <div className="font-serif italic text-xl text-[#1A1816] tracking-wide border-b border-[#1A1816] pb-1 inline-block">
              {cert.examinerName.split(",")[0]}
            </div>
            <p className="font-serif font-bold text-xs text-[#1A1816]">
              {cert.examinerName}
            </p>
            <p className="text-[10px] text-[#8E867B]">
              {cert.examinerTitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
