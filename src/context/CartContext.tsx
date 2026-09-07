'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { CartItem, Product, Coupon } from '@/types';
import { trackAddToCart, trackRemoveFromCart } from '@/lib/analytics';

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
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
  isLoading: boolean;
}

const FREE_SHIPPING_THRESHOLD = 999;
const STANDARD_SHIPPING_FEE = 70;

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [orderNotes, setOrderNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchServerCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/cart', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.cart) {
        const mappedItems: CartItem[] = (data.cart.items || []).map((ci: any) => ({
          id: ci.id,
          productId: ci.productId,
          name: ci.product.name,
          price: ci.product.price,
          mrp: ci.product.mrp,
          quantity: ci.quantity,
          image: ci.product.image,
          slug: ci.product.slug,
          volume: ci.product.volume,
          inStock: ci.product.inStock,
          stockQuantity: ci.product.stockQuantity,
        }));
        setItems(mappedItems);
      }
    } catch (e) {
      console.error('Failed to load cart from server', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServerCart();

    const handleAuthChange = () => {
      fetchServerCart();
    };

    window.addEventListener('auth:login', handleAuthChange);
    window.addEventListener('auth:logout', handleAuthChange);

    return () => {
      window.removeEventListener('auth:login', handleAuthChange);
      window.removeEventListener('auth:logout', handleAuthChange);
    };
  }, [fetchServerCart]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addItem = async (product: Product, quantity = 1): Promise<void> => {
    if (product.isUpcoming || !product.inStock || product.stockQuantity <= 0) return;

    const safeQty = Math.max(1, Math.min(quantity, product.stockQuantity));

    // Optimistic local update
    setItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        const newQty = Math.min(existing.quantity + safeQty, product.stockQuantity);
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: newQty, stockQuantity: product.stockQuantity, inStock: product.inStock }
            : item
        );
      }
      const image = product.images && product.images.length > 0 ? product.images[0] : '/products/sunscreen-hero.webp';
      return [
        ...prev,
        {
          id: `temp_${Date.now()}`,
          productId: product.id,
          name: product.name,
          price: product.price,
          mrp: product.mrp,
          quantity: safeQty,
          image,
          slug: product.slug,
          volume: product.volume,
          inStock: product.inStock,
          stockQuantity: product.stockQuantity,
        },
      ];
    });

    setIsOpen(true);
    trackAddToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: safeQty,
      category: product.category,
    });

    // Sync with server and wait for response
    try {
      const res = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity: safeQty }),
      });
      const data = await res.json();
      if (data.success && data.cart) {
        const mappedItems: CartItem[] = (data.cart.items || []).map((ci: any) => ({
          id: ci.id,
          productId: ci.productId,
          name: ci.product.name,
          price: ci.product.price,
          mrp: ci.product.mrp,
          quantity: ci.quantity,
          image: ci.product.image,
          slug: ci.product.slug,
          volume: ci.product.volume,
          inStock: ci.product.inStock,
          stockQuantity: ci.product.stockQuantity,
        }));
        setItems(mappedItems);
      }
    } catch (e) {
      console.error('Error syncing add item to cart:', e);
      await fetchServerCart();
    }
  };

  const removeItem = async (id: string) => {
    const itemToRemove = items.find((item) => item.id === id || item.productId === id);
    if (itemToRemove) {
      trackRemoveFromCart({
        id: itemToRemove.productId,
        name: itemToRemove.name,
        price: itemToRemove.price,
        quantity: itemToRemove.quantity,
      });
    }

    setItems((prev) => prev.filter((item) => item.id !== id && item.productId !== id));

    try {
      const targetId = itemToRemove?.id || id;
      const res = await fetch(`/api/cart/items/${targetId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success && data.cart) {
        const mappedItems: CartItem[] = (data.cart.items || []).map((ci: any) => ({
          id: ci.id,
          productId: ci.productId,
          name: ci.product.name,
          price: ci.product.price,
          mrp: ci.product.mrp,
          quantity: ci.quantity,
          image: ci.product.image,
          slug: ci.product.slug,
          volume: ci.product.volume,
          inStock: ci.product.inStock,
          stockQuantity: ci.product.stockQuantity,
        }));
        setItems(mappedItems);
      }
    } catch (e) {
      console.error('Error removing item from cart:', e);
      await fetchServerCart();
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(id);
      return;
    }

    const targetItem = items.find((i) => i.id === id || i.productId === id);
    const maxAvailable = targetItem?.stockQuantity ?? 99;
    const boundedQty = Math.min(quantity, maxAvailable);

    setItems((prev) =>
      prev.map((item) =>
        item.id === id || item.productId === id ? { ...item, quantity: boundedQty } : item
      )
    );

    try {
      const targetId = targetItem?.id || targetItem?.productId || id;
      const res = await fetch(`/api/cart/items/${targetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: boundedQty }),
      });
      const data = await res.json();
      if (data.success && data.cart) {
        const mappedItems: CartItem[] = (data.cart.items || []).map((ci: any) => ({
          id: ci.id,
          productId: ci.productId,
          name: ci.product.name,
          price: ci.product.price,
          mrp: ci.product.mrp,
          quantity: ci.quantity,
          image: ci.product.image,
          slug: ci.product.slug,
          volume: ci.product.volume,
          inStock: ci.product.inStock,
          stockQuantity: ci.product.stockQuantity,
        }));
        setItems(mappedItems);
      }
    } catch (e) {
      console.error('Error updating quantity:', e);
      await fetchServerCart();
    }
  };

  const clearCart = async () => {
    setItems([]);
    setAppliedCoupon(null);
    try {
      await fetch('/api/cart', { method: 'DELETE' });
    } catch (e) {
      console.error('Error clearing cart:', e);
    }
  };

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'PERCENTAGE') {
      discount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
    } else {
      discount = appliedCoupon.discountValue;
    }
  }

  const shippingFee = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  const total = Math.max(0, subtotal - discount + shippingFee);

  const progressToFreeShipping = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();
      if (data.success && data.coupon) {
        setAppliedCoupon(data.coupon);
        return { success: true, message: `Coupon ${code} applied successfully!` };
      }
      return { success: false, message: data.message || 'Invalid coupon code.' };
    } catch {
      return { success: false, message: 'Failed to apply coupon.' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

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
        refreshCart: fetchServerCart,
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
        isLoading,
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
