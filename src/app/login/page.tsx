"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, Mail, ArrowRight, BookOpen } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError(res.error);
      setIsLoading(false);
    } else {
      router.push("/account");
      router.refresh();
    }
  };

  const setDemoCredentials = (demoRole: "ADMIN" | "COLLECTOR") => {
    if (demoRole === "ADMIN") {
      setEmail("admin@antiquarianguild.com");
      setPassword("admin123");
    } else {
      setEmail("collector@antiquarianguild.com");
      setPassword("collector123");
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white border border-[#E8E2D4] rounded-lg p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#F4EFE6] text-[#B38838] rounded-full flex items-center justify-center mx-auto mb-2 border border-[#E8E2D4]">
            <BookOpen className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#B38838]">
            Member Access
          </span>
          <h1 className="text-2xl font-serif font-bold text-[#1A1816]">
            Collector Guild Sign In
          </h1>
          <p className="text-xs text-[#5C564E]">
            Access your private acquisition ledger, active offers, and saved lots.
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
              Registered Email
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
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8E867B] absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs border border-[#DDD6C5] rounded bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#1A1816] hover:bg-[#B38838] text-white text-xs font-bold uppercase tracking-widest rounded transition-colors shadow flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{isLoading ? "Authenticating..." : "Sign In to Guild"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Demo Credentials Quick Filler */}
        <div className="pt-4 border-t border-[#E8E2D4] space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#8E867B] block text-center">
            Curatorial Demo Profiles
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDemoCredentials("ADMIN")}
              className="px-2.5 py-1.5 bg-[#F4EFE6] hover:bg-[#E8E2D4] text-[#7A202E] text-[11px] font-mono font-bold rounded transition-colors text-center"
            >
              Fill Admin Demo
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials("COLLECTOR")}
              className="px-2.5 py-1.5 bg-[#F4EFE6] hover:bg-[#E8E2D4] text-[#1A1816] text-[11px] font-mono font-bold rounded transition-colors text-center"
            >
              Fill Collector Demo
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-[#5C564E] pt-2">
          <span>New to the Antiquarian Guild? </span>
          <Link href="/register" className="text-[#B38838] font-bold hover:underline">
            Register Collector Account
          </Link>
        </div>
      </div>
    </div>
  );
}
