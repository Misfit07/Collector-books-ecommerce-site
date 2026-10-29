"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Order, OrderItem } from "@prisma/client";
import { ArrowLeft, PackageCheck, Truck, Award, CheckCircle } from "lucide-react";

type OrderWithItems = Order & {
  items: (OrderItem & {
    book?: {
      slug: string;
      images: { url: string }[];
      certificate?: { certificateNumber: string } | null;
    };
  })[];
};

export default function AdminOrdersClient({ initialOrders }: { initialOrders: OrderWithItems[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    setLoadingId(orderId);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders(orders.map((o) => (o.id === orderId ? { ...o, status } : o)));
      } else {
        alert(data.error || "Update failed.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="pb-6 border-b border-[#E8E2D4] flex justify-between items-center">
        <div>
          <Link
            href="/admin"
            className="text-xs font-mono uppercase tracking-wider text-[#8E867B] hover:text-[#1A1816] flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Executive Overview</span>
          </Link>
          <h1 className="text-3xl font-serif font-bold text-[#1A1816]">
            Orders &amp; Archival Dispatch Desk
          </h1>
          <p className="text-xs text-[#5C564E] mt-1 font-mono">
            {orders.length} Historical Fulfillment Records
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-[#E8E2D4] rounded-lg p-12 text-center text-xs text-[#8E867B]">
          No customer orders logged yet.
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            let address = { street: "", city: "", state: "", postalCode: "", country: "" };
            try {
              if (order.shippingAddressJson) address = JSON.parse(order.shippingAddressJson);
            } catch {
              // fallback
            }

            return (
              <div
                key={order.id}
                className="bg-white border border-[#E8E2D4] rounded-lg p-6 space-y-4 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-[#E8E2D4] gap-2 text-xs">
                  <div>
                    <span className="font-mono font-bold text-sm text-[#1A1816]">
                      #{order.orderNumber}
                    </span>
                    <span className="text-[#8E867B] ml-3">
                      Recorded: {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#8E867B]">Fulfillment:</span>
                    <select
                      value={order.status}
                      disabled={loadingId === order.id}
                      onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                      className="bg-[#F7F3E9] border border-[#DDD6C5] rounded px-2.5 py-1 text-xs font-bold text-[#1A1816]"
                    >
                      <option value="PAID">PAID (Processing)</option>
                      <option value="SHIPPED">SHIPPED (In Transit)</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-7 space-y-2">
                    <h4 className="text-xs font-serif font-bold uppercase tracking-wider text-[#8E867B]">
                      Acquired Volumes
                    </h4>
                    <div className="divide-y divide-[#F4EFE6]">
                      {order.items.map((item) => (
                        <div key={item.id} className="py-2 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-serif font-bold text-[#1A1816]">{item.title}</span>
                            <span className="text-[#8E867B] ml-2 italic">({item.author})</span>
                          </div>
                          <span className="font-mono font-bold text-[#1A1816]">
                            {formatPrice(item.priceInCents)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-5 bg-[#FDFBF7] p-4 rounded border border-[#E8E2D4] text-xs space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#8E867B] tracking-wider block">
                      Recipient &amp; Delivery Destination
                    </span>
                    <p className="font-bold text-[#1A1816]">{order.customerName}</p>
                    <p className="text-[#5C564E]">{address.street}</p>
                    <p className="text-[#5C564E]">
                      {address.city}, {address.state} {address.postalCode} • {address.country}
                    </p>
                    <p className="text-[#8E867B]">Email: {order.customerEmail}</p>
                    {order.razorpayPaymentId && (
                      <p className="text-[10px] font-mono text-[#8E867B] pt-1">
                        Razorpay Ref: {order.razorpayPaymentId}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
