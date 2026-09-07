'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, ArrowRight, Sparkles, Check } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { formatPrice, calculateDiscount } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  featured?: boolean;
}

export function ProductCard({ product, featured = false }: ProductCardProps) {
  const { addItem } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const images = Array.isArray(product.images)
    ? product.images
    : typeof product.images === 'string'
    ? JSON.parse(product.images)
    : ['/products/sunscreen-hero.webp'];

  const primaryImage = images[0] || '/products/sunscreen-hero.webp';
  const secondaryImage = images[1] || primaryImage;

  const discountPercent = calculateDiscount(product.mrp, product.price);

  const isOutOfStock = !product.inStock || (product.stockQuantity ?? 0) <= 0;
  const isUpcoming = Boolean(product.isUpcoming);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUpcoming || isOutOfStock) return;

    addItem(product, 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  return (
    <div
      className="group relative flex flex-col bg-surface-elevated border border-border-subtle hover:border-brand-charcoal/30 transition-all duration-300 rounded-sm overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Visual Media Container */}
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-[4/5] bg-surface-muted overflow-hidden flex items-center justify-center cursor-pointer"
      >
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
          {product.spfRating && (
            <span className="bg-brand-charcoal text-white text-[10px] tracking-wider uppercase font-semibold px-2.5 py-1 rounded-xs">
              {product.spfRating}
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-brand-amber text-brand-charcoal text-[10px] tracking-wider uppercase font-bold px-2 py-0.5 rounded-xs">
              New Launch
            </span>
          )}
          {isUpcoming && (
            <span className="bg-brand-mineral text-white text-[10px] tracking-wider uppercase font-medium px-2 py-0.5 rounded-xs">
              Upcoming
            </span>
          )}
          {isOutOfStock && !isUpcoming && (
            <span className="bg-red-800 text-white text-[10px] tracking-wider uppercase font-bold px-2 py-0.5 rounded-xs">
              Out of Stock
            </span>
          )}
          {discountPercent > 0 && !isUpcoming && !isOutOfStock && (
            <span className="bg-brand-olive text-white text-[10px] tracking-wider font-semibold px-2 py-0.5 rounded-xs">
              Save {discountPercent}%
            </span>
          )}
        </div>

        {/* Primary and Hover Image Cross-Fade */}
        <div className="relative w-full h-full p-6 transition-transform duration-700 ease-out group-hover:scale-105">
          <Image
            src={isHovered ? secondaryImage : primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain transition-opacity duration-500"
          />
        </div>

        {/* Quick Add Overlay on Hover (Desktop) */}
        {!isUpcoming && !isOutOfStock && (
          <div className="hidden sm:block absolute inset-x-3 bottom-3 z-10 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <button
              onClick={handleQuickAdd}
              className={`w-full py-3 text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-1.5 rounded-sm shadow-md transition-all ${
                addedAnimation
                  ? 'bg-emerald-800 text-white'
                  : 'bg-brand-charcoal text-white hover:bg-brand-mineral'
              }`}
            >
              {addedAnimation ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Added to Bag</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Quick Add • {formatPrice(product.price)}</span>
                </>
              )}
            </button>
          </div>
        )}
      </Link>

      {/* Product Content & Meta */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-brand-mineral font-semibold mb-1">
            {product.category} {product.volume ? `• ${product.volume}` : ''}
          </div>
          <Link
            href={`/products/${product.slug}`}
            className="font-serif text-lg font-medium text-brand-charcoal hover:text-brand-amber transition-colors line-clamp-2"
          >
            {product.name}
          </Link>
          <p className="text-xs text-brand-mineral mt-1.5 line-clamp-2 leading-relaxed">
            {product.tagline}
          </p>
        </div>

        {/* Price & Mobile Add Button */}
        <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-semibold text-brand-charcoal">
              {formatPrice(product.price)}
            </span>
            {product.mrp > product.price && (
              <span className="text-xs text-brand-mineral line-through">
                {formatPrice(product.mrp)}
              </span>
            )}
          </div>

          {isUpcoming ? (
            <span className="text-xs text-brand-mineral uppercase tracking-wider font-semibold">
              Coming Soon
            </span>
          ) : isOutOfStock ? (
            <span className="text-xs text-red-700 uppercase tracking-wider font-semibold">
              Out of Stock
            </span>
          ) : (
            <button
              onClick={handleQuickAdd}
              className="sm:hidden text-xs uppercase tracking-wider font-semibold text-brand-charcoal hover:text-brand-amber flex items-center gap-1 p-1"
              aria-label="Add to bag"
            >
              <span>Add</span>
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
