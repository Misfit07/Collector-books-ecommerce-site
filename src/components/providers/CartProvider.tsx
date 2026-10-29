"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export interface CartItem {
  id: string; // reservation id
  bookId: string;
  title: string;
  author: string;
  edition: string;
  priceInCents: number;
  coverImage: string;
  reservedUntil: string; // ISO date string
}

interface CartContextType {
  sessionId: string;
  items: CartItem[];
  isLoading: boolean;
  reserveBook: (bookId: string) => Promise<{ success: boolean; error?: string }>;
  releaseBook: (bookId: string) => Promise<{ success: boolean; error?: string }>;
  refreshCart: () => Promise<void>;
  itemCount: number;
  totalInCents: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  getRemainingSeconds: (reservedUntil: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "guest-session";
  let sid = localStorage.getItem("antiquarian_session_id");
  if (!sid) {
    sid = "sess_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem("antiquarian_session_id", sid);
  }
  return sid;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState<string>("");
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [, setTick] = useState<number>(0);

  // Initialize session ID
  useEffect(() => {
    const sid = getOrCreateSessionId();
    setSessionId(sid);
  }, []);

  // Fetch active reservations for this session
  const refreshCart = useCallback(async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`/api/cart/status?sessionId=${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (err) {
      console.error("Failed to sync cart status:", err);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (sessionId) {
      refreshCart();
    }
  }, [sessionId, refreshCart]);

  // 1-second interval to update countdown clocks and remove expired items
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);

      // Check for expired items locally
      const now = Date.now();
      setItems((currentItems) => {
        const activeItems = currentItems.filter((item) => {
          const expiry = new Date(item.reservedUntil).getTime();
          return expiry > now;
        });

        // If an item expired, refresh from backend to ensure state consistency
        if (activeItems.length < currentItems.length) {
          refreshCart();
        }
        return activeItems;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [refreshCart]);

  const reserveBook = async (bookId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/cart/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, sessionId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Item could not be reserved." };
      }
      await refreshCart();
      setIsCartOpen(true);
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Reservation failed.";
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const releaseBook = async (bookId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/cart/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, sessionId }),
      });
      const data = await res.json();
      await refreshCart();
      return { success: res.ok && data.success };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Release failed.";
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const getRemainingSeconds = (reservedUntil: string): number => {
    const diff = new Date(reservedUntil).getTime() - Date.now();
    return Math.max(0, Math.floor(diff / 1000));
  };

  const itemCount = items.length;
  const totalInCents = items.reduce((acc, curr) => acc + curr.priceInCents, 0);

  return (
    <CartContext.Provider
      value={{
        sessionId,
        items,
        isLoading,
        reserveBook,
        releaseBook,
        refreshCart,
        itemCount,
        totalInCents,
        isCartOpen,
        setIsCartOpen,
        getRemainingSeconds,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
