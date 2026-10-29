"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Award, BookCheck, Feather } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#151413] text-[#D6CFBE] border-t border-[#2B2824] pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Core Guild Guarantees Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-[#2B2824]">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-[#B38838] shrink-0 mt-1" />
            <div>
              <h4 className="font-serif font-bold text-sm text-[#F7F4EB]">Absolute Authenticity</h4>
              <p className="text-xs text-[#9E9689] mt-1 leading-relaxed">
                Every rare work is forensically examined. Accompanied by a verifiable cryptographic Certificate of Authenticity.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Award className="w-6 h-6 text-[#B38838] shrink-0 mt-1" />
            <div>
              <h4 className="font-serif font-bold text-sm text-[#F7F4EB]">ABAA / ILAB Standards</h4>
              <p className="text-xs text-[#9E9689] mt-1 leading-relaxed">
                Strict adherence to the Antiquarian Booksellers&apos; Association of America code of ethics and rigorous grading standards.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <BookCheck className="w-6 h-6 text-[#B38838] shrink-0 mt-1" />
            <div>
              <h4 className="font-serif font-bold text-sm text-[#F7F4EB]">15-Minute Exclusive Hold</h4>
              <p className="text-xs text-[#9E9689] mt-1 leading-relaxed">
                Each physical copy is singular. Reserving places an uninterrupted lock on the title for checkout contemplation.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Feather className="w-6 h-6 text-[#B38838] shrink-0 mt-1" />
            <div>
              <h4 className="font-serif font-bold text-sm text-[#F7F4EB]">Archival Transit</h4>
              <p className="text-xs text-[#9E9689] mt-1 leading-relaxed">
                Custom acid-free enclosures, reinforced book-boxes, and fully insured white-glove global transport.
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Links & Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 py-12 border-b border-[#2B2824]">
          <div className="md:col-span-2 space-y-4">
            <span className="font-serif text-2xl font-bold tracking-tight text-[#F7F4EB]">
              The Antiquarian Guild
            </span>
            <p className="text-xs text-[#9E9689] leading-relaxed max-w-sm">
              Established 1892. Purveyors of monumentally significant first editions, inscribed presentation copies, incunabula, and fine historical bindings.
            </p>
            <div className="pt-2 text-xs text-[#7A6F60] space-y-1">
              <p>44 Great Russell Street, Bloomsbury, London</p>
              <p>790 Madison Avenue, Upper East Side, New York</p>
              <p>inquiries@antiquarianguild.com</p>
            </div>
          </div>

          <div>
            <h5 className="font-serif font-bold text-sm text-[#F7F4EB] mb-3">The Collection</h5>
            <ul className="space-y-2 text-xs text-[#A8A090]">
              <li><Link href="/catalog?tag=first-edition" className="hover:text-[#B38838] transition-colors">First Editions</Link></li>
              <li><Link href="/catalog?signed=true" className="hover:text-[#B38838] transition-colors">Signed & Inscribed</Link></li>
              <li><Link href="/catalog?tag=incunabula" className="hover:text-[#B38838] transition-colors">Incunabula & 16th Century</Link></li>
              <li><Link href="/catalog?tag=illustrated" className="hover:text-[#B38838] transition-colors">Illustrated & Fine Press</Link></li>
              <li><Link href="/catalog?category=auctions" className="hover:text-[#B38838] transition-colors">Active Timed Auctions</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-serif font-bold text-sm text-[#F7F4EB] mb-3">Curatorial Services</h5>
            <ul className="space-y-2 text-xs text-[#A8A090]">
              <li><Link href="/catalog" className="hover:text-[#B38838] transition-colors">Search & Appraisal</Link></li>
              <li><Link href="/account/offers" className="hover:text-[#B38838] transition-colors">Make an Offer</Link></li>
              <li><Link href="/certificate/verify" className="hover:text-[#B38838] transition-colors">Verify Certificate</Link></li>
              <li><Link href="/admin" className="hover:text-[#B38838] transition-colors">Curators&apos; Portal</Link></li>
              <li><Link href="/account/wishlist" className="hover:text-[#B38838] transition-colors">Author Notification Alerts</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-serif font-bold text-sm text-[#F7F4EB] mb-3">Curators&apos; Gazette</h5>
            <p className="text-xs text-[#9E9689] leading-relaxed mb-3">
              Receive private notices when museum-grade acquisitions enter the vault before public cataloging.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert("Thank you for subscribing to the Curators' Gazette."); }} className="space-y-2">
              <input
                type="email"
                required
                placeholder="collector@domain.com"
                className="w-full px-3 py-2 text-xs bg-[#1F1E1B] border border-[#3D3830] text-[#F7F4EB] rounded focus:outline-hidden focus:border-[#B38838]"
              />
              <button
                type="submit"
                className="w-full py-2 bg-[#B38838] hover:bg-[#966E26] text-[#151413] text-xs font-bold uppercase tracking-wider rounded transition-colors"
              >
                Join Private Registry
              </button>
            </form>
          </div>
        </div>

        {/* Legal & Accreditation */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-[11px] text-[#7A6F60] gap-4">
          <p>© {new Date().getFullYear()} The Antiquarian Guild LLC. All rights reserved. Members ABAA, ILAB, and PBFA.</p>
          <div className="flex space-x-6">
            <span>Condition Grading Code</span>
            <span>Provenance Guarantee</span>
            <span>Terms of Acquisition</span>
            <span>Privacy Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
