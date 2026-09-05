'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Product, Coupon } from '@/types';
import { trackAddToCart, trackRemoveFromCart } from '@/lib/analytics';

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  freeShippingThreshold: number;
  progressToFreeShipping: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  orderNotes: string;
  setOrderNotes: (notes: string) => void;
}

const FREE_SHIPPING_THRESHOLD = 999;
const STANDARD_SHIPPING_FEE = 70;

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [orderNotes, setOrderNotes] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('velyra_cart');
      const savedCoupon = localStorage.getItem('velyra_coupon');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
      if (savedCoupon) {
        setAppliedCoupon(JSON.parse(savedCoupon));
      }
    } catch (e) {
      console.error('Failed to load cart from storage', e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem('velyra_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart', e);
    }
  }, [items, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      if (appliedCoupon) {
        localStorage.setItem('velyra_coupon', JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem('velyra_coupon');
      }
    } catch (e) {
      console.error('Failed to save coupon', e);
    }
  }, [appliedCoupon, isInitialized]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addItem = (product: Product, quantity = 1) => {
    if (product.isUpcoming || !product.inStock) return;

    setItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      let newItems: CartItem[];

      if (existing) {
        newItems = prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        const image = product.images && product.images.length > 0 ? product.images[0] : '/products/sunscreen-hero.webp';
        newItems = [
          ...prev,
          {
            id: product.id,
            productId: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            mrp: product.mrp,
            quantity: quantity,
            image: image,
            volume: product.volume,
            sku: product.sku,
            inStock: product.inStock,
          },
        ];
      }
      return newItems;
    });

    trackAddToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      category: product.category,
    });

    setIsOpen(true);
  };

  const removeItem = (id: string) => {
    const itemToRemove = items.find((item) => item.id === id);
    if (itemToRemove) {
      trackRemoveFromCart({
        id: itemToRemove.id,
        name: itemToRemove.name,
        price: itemToRemove.price,
        quantity: itemToRemove.quantity,
      });
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setOrderNotes('');
  };

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode) {
      return { success: false, message: 'Please enter a coupon code.' };
    }

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmedCode, subtotal }),
      });

      const data = await res.json();
      if (!res.ok || !data.valid) {
        return { success: false, message: data.message || 'Invalid coupon code.' };
      }

      setAppliedCoupon(data.coupon);
      return { success: true, message: `Coupon ${trimmedCode} applied successfully!` };
    } catch (e) {
      return { success: false, message: 'Network error validating coupon.' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Calculate discount
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'PERCENTAGE') {
      discount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
    } else {
      discount = appliedCoupon.discountValue;
    }
  }

  // Shipping
  const shippingFee = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  const total = Math.max(0, subtotal - discount + shippingFee);

  const progressToFreeShipping = Math.min(
    100,
    Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100)
  );

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        discount,
        shippingFee,
        total,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        progressToFreeShipping,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        orderNotes,
        setOrderNotes,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
