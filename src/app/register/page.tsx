"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { ShieldCheck, Lock, Mail, User, ArrowRight, Award } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create collector profile.");
      }

      // Automatically sign in
      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        router.push("/login");
      } else {
        router.push("/account");
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed.";
      setError(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white border border-[#E8E2D4] rounded-lg p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#F4EFE6] text-[#B38838] rounded-full flex items-center justify-center mx-auto mb-2 border border-[#E8E2D4]">
            <Award className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#B38838]">
            Guild Registry
          </span>
          <h1 className="text-2xl font-serif font-bold text-[#1A1816]">
            Register Collector Account
          </h1>
          <p className="text-xs text-[#5C564E]">
            Join private auctions, submit direct offers, and preserve your provenance records.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#1A1816] mb-1">
              Collector Title &amp; Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#8E867B] absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Lady Clara Ravenswood"
                className="w-full pl-9 pr-3 py-2 text-xs border border-[#DDD6C5] rounded bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1A1816] mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8E867B] absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="collector@domain.com"
                className="w-full pl-9 pr-3 py-2 text-xs border border-[#DDD6C5] rounded bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1A1816] mb-1">
              Secure Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8E867B] absolute left-3 top-2.5" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-9 pr-3 py-2 text-xs border border-[#DDD6C5] rounded bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#1A1816] hover:bg-[#B38838] text-white text-xs font-bold uppercase tracking-widest rounded transition-colors shadow flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{isLoading ? "Enrolling Member..." : "Complete Collector Registration"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center text-xs text-[#5C564E] pt-2">
          <span>Already registered with the Guild? </span>
          <Link href="/login" className="text-[#B38838] font-bold hover:underline">
            Member Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
