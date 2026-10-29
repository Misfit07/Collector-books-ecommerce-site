"use client";

import React from "react";
import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="px-4 py-2 bg-white border border-[#DDD6C5] rounded text-xs font-medium flex items-center gap-1.5 hover:bg-[#F4EFE6] transition-colors"
    >
      <Printer className="w-3.5 h-3.5 text-[#B38838]" />
      <span>Print Official Archival Document</span>
    </button>
  );
}
