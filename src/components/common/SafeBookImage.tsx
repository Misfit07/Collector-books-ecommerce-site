"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";
import { BookOpen, Award } from "lucide-react";

interface SafeBookImageProps extends Omit<ImageProps, "onError"> {
  title?: string;
  author?: string;
  year?: number | string;
}

export default function SafeBookImage({
  src,
  alt,
  title,
  author,
  year,
  className,
  fill,
  sizes,
  priority,
  ...props
}: SafeBookImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`w-full h-full min-h-[140px] bg-gradient-to-br from-[#2D2824] via-[#1E1C1A] to-[#121110] text-[#F7F4EB] p-4 flex flex-col justify-between border border-[#4A433A] relative overflow-hidden select-none ${
          className || ""
        }`}
      >
        {/* Subtle gilt border line */}
        <div className="absolute inset-1.5 border border-[#B38838]/30 rounded-xs pointer-events-none" />

        {/* Top guild ornament */}
        <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-widest text-[#B38838] relative z-10">
          <span>Rare Book</span>
          {year && <span>{year}</span>}
        </div>

        {/* Center Title & Author */}
        <div className="my-auto text-center px-2 py-4 relative z-10">
          <BookOpen className="w-5 h-5 text-[#B38838] mx-auto mb-2 opacity-80" />
          <h4 className="font-serif font-bold text-sm text-[#F7F4EB] leading-tight line-clamp-3">
            {title || alt || "Antiquarian Volume"}
          </h4>
          {author && (
            <p className="text-[11px] font-serif italic text-[#CFC5B4] mt-1.5 line-clamp-1">
              {author}
            </p>
          )}
        </div>

        {/* Bottom certification stamp */}
        <div className="flex items-center justify-center gap-1 text-[8px] font-mono tracking-wider text-[#A8A090] uppercase relative z-10">
          <Award className="w-3 h-3 text-[#B38838]" />
          <span>Antiquarian Booksellers Association</span>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => setHasError(true)}
      unoptimized
      {...props}
    />
  );
}
