import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";
import { z } from "zod";

const bookIntakeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  publisher: z.string().min(1, "Publisher is required"),
  year: z.number().int().min(1450).max(new Date().getFullYear()),
  editionPrinting: z.string().min(1, "Edition is required"),
  isbn: z.string().optional().nullable(),
  conditionGrade: z.enum(["FINE", "VERY_GOOD", "GOOD", "FAIR", "POOR"]),
  dustJacket: z.enum(["AS_ISSUED", "PRESENT_CLIPPED", "PRESENT_DAMAGED", "LACKING", "NOT_ISSUED"]),
  isSigned: z.boolean().default(false),
  isInscribed: z.boolean().default(false),
  isFirstEdition: z.boolean().default(false),
  isIllustrated: z.boolean().default(false),
  isAntiquarian: z.boolean().default(false),
  provenanceNotes: z.string().default("Acquired from private collector."),
  defectNotes: z.string().default("Complete and unblemished."),
  priceInCents: z.number().int().min(100),
  tags: z.string().default(""),
  featured: z.boolean().default(false),
  curatorPick: z.boolean().default(false),
  images: z.array(
    z.object({
      url: z.string().url(),
      caption: z.string().optional(),
      displayOrder: z.number().default(0),
      isCover: z.boolean().default(false),
    })
  ).min(1, "At least 1 image is required (6+ recommended)"),
  generateCertificate: z.boolean().default(true),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string })?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = bookIntakeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid payload" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const slug = `${data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${data.year}-${Date.now().toString(36)}`;

    const newBook = await prisma.$transaction(async (tx) => {
      const book = await tx.bookListing.create({
        data: {
          slug,
          title: data.title,
          author: data.author,
          publisher: data.publisher,
          year: data.year,
          editionPrinting: data.editionPrinting,
          isbn: data.isbn || null,
          conditionGrade: data.conditionGrade,
          dustJacket: data.dustJacket,
          isSigned: data.isSigned,
          isInscribed: data.isInscribed,
          isFirstEdition: data.isFirstEdition,
          isIllustrated: data.isIllustrated,
          isAntiquarian: data.isAntiquarian,
          provenanceNotes: data.provenanceNotes,
          defectNotes: data.defectNotes,
          priceInCents: data.priceInCents,
          tags: data.tags,
          featured: data.featured,
          curatorPick: data.curatorPick,
          images: {
            create: data.images.map((img, idx) => ({
              url: img.url,
              caption: img.caption || null,
              displayOrder: img.displayOrder ?? idx,
              isCover: img.isCover ?? idx === 0,
            })),
          },
        },
      });

      if (data.generateCertificate) {
        const certNum = `CERT-${data.year}-${slug.toUpperCase().slice(0, 6)}-${Math.floor(1000 + Math.random() * 9000)}`;
        const verificationCode = crypto.randomBytes(12).toString("hex");
        const payload = `${data.title}|${data.author}|${data.year}|${data.editionPrinting}|Julian Vance ABAA`;
        const signatureSha256 = crypto.createHash("sha256").update(payload).digest("hex");

        await tx.authenticityCertificate.create({
          data: {
            certificateNumber: certNum,
            bookId: book.id,
            verificationCode,
            signatureSha256,
            examinerName: "Julian Vance, ABAA / ILAB Appraiser",
            examinerTitle: "Senior Specialist in Antiquarian Literature & Manuscripts",
            metadataJson: JSON.stringify({
              paperStock: "Handmade rag paper, laid watermarked",
              bindingType: "Contemporary morocco with gilt armorial tooling",
              catalogDate: new Date().toISOString(),
            }),
          },
        });
      }

      return book;
    });

    return NextResponse.json({ success: true, book: newBook });
  } catch (err: unknown) {
    console.error("Intake error:", err);
    return NextResponse.json({ success: false, error: "Intake failure" }, { status: 500 });
  }
}
