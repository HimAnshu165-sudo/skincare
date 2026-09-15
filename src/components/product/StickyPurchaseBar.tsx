'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ShoppingBag, Sparkles } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

interface StickyPurchaseBarProps {
  product: Product;
}

export function StickyPurchaseBar({ product }: StickyPurchaseBarProps) {
  const { addItem } = useCart();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled past 400px
      if (window.scrollY > 400) {
        setShow(true);
      } else {
        setShow(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!show || product.isUpcoming || !product.inStock) return null;

  const images = Array.isArray(product.images)
    ? product.images
    : typeof product.images === 'string'
    ? JSON.parse(product.images)
    : [];
  const thumbnail = images[0] || '/products/sunscreen-hero.webp';

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-surface-elevated/95 backdrop-blur-md border-t border-border-subtle p-3.5 pb-[calc(0.875rem+env(safe-area-inset-bottom))] shadow-2xl transition-all duration-300 md:hidden animate-slide-down">
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="relative w-10 h-10 bg-surface-muted rounded-sm flex-shrink-0 overflow-hidden border border-border-subtle">
            <Image
              src={thumbnail}
              alt={product.name}
              fill
              className="object-contain p-1"
            />
          </div>
          <div className="truncate">
            <div className="font-serif text-xs font-medium text-brand-charcoal truncate">
              {product.name}
            </div>
            <div className="text-xs font-semibold text-brand-charcoal">
              {formatPrice(product.price)}
            </div>
          </div>
        </div>

        <button
          onClick={() => addItem(product, 1)}
          className="bg-brand-charcoal text-white text-xs uppercase tracking-wider font-semibold px-5 py-2.5 rounded-sm hover:bg-brand-mineral flex items-center gap-1.5 flex-shrink-0"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Add to Bag</span>
        </button>
      </div>
    </div>
  );
}
