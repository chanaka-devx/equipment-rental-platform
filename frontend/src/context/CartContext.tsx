'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Equipment {
  id: string;
  name: string;
  description?: string | null;
  rentalPrice?: number | string | null;
  deposit?: number | string | null;
  quantity?: number | null;
  images?: string[];
  category?: string;
  requiresDocuments?: boolean;
  requiredDocumentTypes?: string[];
}

export interface CartItem {
  equipment: Equipment;
  quantity: number;
}

interface CartContextValue {
  cart: CartItem[];
  startDate: string;
  endDate: string;
  setStartDate: (d: string) => void;
  setEndDate: (d: string) => void;
  addToCart: (equipment: Equipment, qty?: number) => void;
  removeFromCart: (equipmentId: string) => void;
  updateQuantity: (equipmentId: string, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'rentforge_cart';

// ─── Provider ────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Default rental period: tomorrow → day after tomorrow
  const tomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };
  const dayAfter = () => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  };

  const [startDate, setStartDate] = useState<string>(tomorrow());
  const [endDate, setEndDate] = useState<string>(dayAfter());

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setCart(parsed);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Persist to localStorage whenever cart changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore storage errors
    }
  }, [cart]);

  const addToCart = useCallback((equipment: Equipment, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.equipment.id === equipment.id);
      if (existing) {
        // Bump quantity, capped at available stock
        const maxQty = equipment.quantity ?? 99;
        const newQty = Math.min(existing.quantity + qty, maxQty);
        return prev.map((i) =>
          i.equipment.id === equipment.id ? { ...i, quantity: newQty } : i
        );
      }
      return [...prev, { equipment, quantity: Math.min(qty, equipment.quantity ?? 99) }];
    });
  }, []);

  const removeFromCart = useCallback((equipmentId: string) => {
    setCart((prev) => prev.filter((i) => i.equipment.id !== equipmentId));
  }, []);

  const updateQuantity = useCallback((equipmentId: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.equipment.id !== equipmentId));
      return;
    }
    setCart((prev) =>
      prev.map((i) => {
        if (i.equipment.id !== equipmentId) return i;
        const maxQty = i.equipment.quantity ?? 99;
        return { ...i, quantity: Math.min(qty, maxQty) };
      })
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        startDate,
        endDate,
        setStartDate,
        setEndDate,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
