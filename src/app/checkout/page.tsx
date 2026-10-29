"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useCart } from "@/components/providers/CartProvider";
import { useSession } from "next-auth/react";
import { ShieldCheck, Clock, Lock, ArrowLeft, CheckCircle2, AlertCircle, CreditCard } from "lucide-react";

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature?: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (res: RazorpayResponse) => Promise<void>;
  prefill?: {
    name?: string;
    email?: string;
  };
  theme?: {
    color?: string;
  };
}

interface RazorpayInstance {
  open: () => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, sessionId, totalInCents, refreshCart, getRemainingSeconds } = useCart();
  const { data: session } = useSession();

  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [street, setStreet] = useState("44 Great Russell Street");
  const [city, setCity] = useState("London");
  const [state, setState] = useState("Greater London");
  const [postalCode, setPostalCode] = useState("WC1B 3DG");
  const [country, setCountry] = useState("United Kingdom");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      if (!name && session.user.name) setName(session.user.name);
      if (!email && session.user.email) setEmail(session.user.email);
    }
  }, [session, name, email]);

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const handleStandardCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 1. Create order on server
      const res = await fetch("/api/checkout/create-razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          customerName: name,
          customerEmail: email,
          street,
          city,
          state,
          postalCode,
          country,
          userId: session?.user?.id,
        }),
      });

      const orderData = await res.json();
      if (!res.ok || !orderData.success) {
        throw new Error(orderData.error || "Order creation failed.");
      }

      // 2. Open Razorpay modal if SDK loaded, or simulate if popup blocked
      if (typeof window !== "undefined" && window.Razorpay) {
        const options: RazorpayOptions = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "The Antiquarian Guild",
          description: `Acquisition of ${items.length} rare volume(s)`,
          order_id: orderData.razorpayOrderId,
          handler: async (response: RazorpayResponse) => {
            await verifyAndCompleteOrder({
              orderNumber: orderData.orderNumber,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
          },
          prefill: {
            name,
            email,
          },
          theme: {
            color: "#1A1816",
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        setIsLoading(false);
      } else {
        // Fallback test verification simulation
        await simulateTestPayment(orderData.orderNumber, orderData.razorpayOrderId);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Checkout error occurred.";
      setErrorMessage(msg);
      setIsLoading(false);
    }
  };

  const simulateTestPayment = async (orderNumber: string, razorpayOrderId: string) => {
    const paymentId = "pay_test_simulated_" + Math.random().toString(36).substring(2, 10);
    await verifyAndCompleteOrder({
      orderNumber,
      razorpayOrderId,
      razorpayPaymentId: paymentId,
    });
  };

  const verifyAndCompleteOrder = async (payload: {
    orderNumber: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature?: string;
  }) => {
    setIsLoading(true);
    try {
      const verifyRes = await fetch("/api/checkout/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          sessionId,
        }),
      });

      const verifyData = await verifyRes.json();
      if (verifyRes.ok && verifyData.success) {
        await refreshCart();
        router.push(`/orders/${payload.orderNumber}`);
      } else {
        throw new Error(verifyData.error || "Payment verification failed.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Verification failed.";
      setErrorMessage(msg);
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-[#1A1816]">
          Your Portfolio Has Expired or is Empty
        </h2>
        <p className="text-xs text-[#5C564E]">
          The 15-minute reservation timer may have lapsed. Please select your rare volumes in the catalogue to initiate a fresh exclusive hold.
        </p>
        <Link
          href="/catalog"
          className="px-6 py-3 bg-[#1A1816] text-white text-xs uppercase tracking-wider font-bold rounded inline-block"
        >
          Return to The Vault
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* Top Header */}
      <div className="pb-6 border-b border-[#E8E2D4] flex justify-between items-center">
        <div>
          <Link
            href="/cart"
            className="text-xs font-mono uppercase tracking-wider text-[#8E867B] hover:text-[#1A1816] flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Portfolio Ledger</span>
          </Link>
          <h1 className="text-3xl font-serif font-bold text-[#1A1816]">
            Secure Collector Acquisition &amp; Transit
          </h1>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-[#233D30] font-medium bg-[#E8F2EC] px-3 py-1.5 rounded border border-[#C5DDD0]">
          <Lock className="w-3.5 h-3.5" />
          <span>256-Bit Encrypted Institutional Checkout</span>
        </div>
      </div>

      {errorMessage && (
        <div className="my-6 p-4 bg-red-50 border border-red-200 rounded text-xs text-red-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-8">
        {/* Shipping Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleStandardCheckout} className="space-y-6">
            <div className="bg-white border border-[#E8E2D4] rounded-lg p-6 space-y-4 shadow-xs">
              <h3 className="font-serif font-bold text-lg text-[#1A1816] pb-2 border-b border-[#E8E2D4]">
                1. Recipient &amp; Provenance Registry
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#1A1816] mb-1">
                    Collector Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Lord Julian Vance"
                    className="w-full px-3 py-2 text-xs border border-[#DDD6C5] rounded bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#1A1816] mb-1">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="collector@domain.com"
                    className="w-full px-3 py-2 text-xs border border-[#DDD6C5] rounded bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E8E2D4] rounded-lg p-6 space-y-4 shadow-xs">
              <h3 className="font-serif font-bold text-lg text-[#1A1816] pb-2 border-b border-[#E8E2D4]">
                2. White-Glove Archival Delivery Destination
              </h3>

              <div>
                <label className="block text-xs font-medium text-[#1A1816] mb-1">
                  Street Address &amp; Suite / Library Name *
                </label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Street and house or estate name"
                  className="w-full px-3 py-2 text-xs border border-[#DDD6C5] rounded bg-white"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-[#1A1816] mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#DDD6C5] rounded bg-white"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-[#1A1816] mb-1">State / Region *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#DDD6C5] rounded bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#1A1816] mb-1">Postal Code *</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#DDD6C5] rounded bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#1A1816] mb-1">Country *</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#DDD6C5] rounded bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Razorpay Test Mode Helper Card */}
            <div className="bg-[#F7F3E9] border border-[#EAD8B0] rounded-lg p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#7A5B18]">
                <CreditCard className="w-4 h-4 text-[#B38838]" />
                <span>Razorpay Test Sandbox Integration Active</span>
              </div>
              <p className="text-xs text-[#8A6720] leading-relaxed">
                Transactions operate in secure test mode. You can submit via standard Razorpay popup or click <strong>&ldquo;Instant Sandbox Checkout&rdquo;</strong> to verify the atomic transaction and certificate issuance immediately.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3.5 bg-[#1A1816] hover:bg-[#B38838] text-white text-xs font-bold uppercase tracking-widest rounded shadow transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isLoading ? "Executing Acquisition..." : "Launch Razorpay Payment Gateway"}</span>
                </button>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleStandardCheckout}
                  className="px-4 py-3 bg-[#EAE3D2] hover:bg-[#DDD4C0] text-[#1A1816] text-xs font-bold uppercase tracking-wider rounded transition-colors disabled:opacity-50"
                >
                  Instant Sandbox Checkout
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Order Review & Holds (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-[#E8E2D4] rounded-lg p-6 space-y-4 shadow-sm">
            <h3 className="font-serif font-bold text-lg text-[#1A1816] pb-2 border-b border-[#E8E2D4]">
              Singular Volume Ledger ({items.length})
            </h3>

            <div className="divide-y divide-[#E8E2D4]">
              {items.map((item) => (
                <div key={item.id} className="py-3 flex gap-3 items-center">
                  <div className="relative w-14 h-20 bg-[#EDE8DC] rounded border border-[#DDD6C5] overflow-hidden shrink-0">
                    {item.coverImage && (
                      <Image
                        src={item.coverImage}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif font-bold text-xs text-[#1A1816] line-clamp-1">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-[#5C564E] italic mt-0.5">{item.author}</p>
                    <span className="font-serif font-bold text-xs text-[#1A1816] mt-1 block">
                      {formatPrice(item.priceInCents)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#E8E2D4] space-y-2 text-xs text-[#5C564E]">
              <div className="flex justify-between">
                <span>Total Evaluation</span>
                <span className="font-mono text-[#1A1816]">{formatPrice(totalInCents)}</span>
              </div>
              <div className="flex justify-between">
                <span>Museum Transit Insurance</span>
                <span className="text-[#233D30]">Complimentary</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E8E2D4] font-serif font-bold text-base text-[#1A1816]">
                <span>Total Payable</span>
                <span className="text-xl">{formatPrice(totalInCents)}</span>
              </div>
            </div>

            <div className="pt-3 text-[11px] text-[#8E867B] space-y-1">
              <div className="flex items-center gap-1.5 text-[#233D30]">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-medium">Cryptographic Certificate Issued with Order</span>
              </div>
              <p>
                Once processed, your deed of ownership and provenance records are permanently sealed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
