'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Plus, Check, Eye } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { formatPrice, calculateDiscount } from '@/lib/utils';

interface ShopProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string) => void;
  priority?: boolean;
}

export function ShopProductCard({
  product,
  onQuickView,
  isWishlisted = false,
  onToggleWishlist,
  priority = false,
}: ShopProductCardProps) {
  const { addItem } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Normalize images array
  const images = Array.isArray(product.images)
    ? product.images
    : typeof product.images === 'string'
    ? JSON.parse(product.images)
    : ['/products/sunscreen-hero.webp'];

  const primaryImage = images[0] || '/products/sunscreen-hero.webp';
  const secondaryImage = images[1] || primaryImage;

  const discountPercent = calculateDiscount(product.mrp, product.price);

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.isUpcoming || !product.inStock) return;

    try {
      await addItem(product, 1);
      setAddedAnimation(true);
      setTimeout(() => setAddedAnimation(false), 1600);
    } catch (err) {
      console.error('Failed to add product to bag:', err);
    }
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleWishlist) {
      onToggleWishlist(product.id);
    }
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  return (
    <div
      className="group relative flex flex-col bg-surface-elevated border border-border-subtle hover:border-brand-charcoal/30 transition-all duration-300 rounded-sm overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.07)] hover:-translate-y-0.5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      aria-label={product.name}
    >
      {/* 1. Visual Image Box with Hover Reveal */}
      <div className="relative aspect-[4/5] bg-surface-muted/50 overflow-hidden flex items-center justify-center">
        {/* Top Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start pointer-events-none">
          {product.spfRating && (
            <span className="bg-brand-charcoal text-white text-[10px] tracking-wider uppercase font-semibold px-2 py-0.5 rounded-xs shadow-xs">
              {product.spfRating.split('•')[0].trim()}
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-brand-amber text-brand-charcoal text-[9px] tracking-widest uppercase font-bold px-2 py-0.5 rounded-xs shadow-xs">
              Flagship
            </span>
          )}
          {product.isUpcoming && (
            <span className="bg-brand-mineral text-white text-[9px] tracking-wider uppercase font-medium px-2 py-0.5 rounded-xs">
              Upcoming
            </span>
          )}
          {discountPercent > 0 && !product.isUpcoming && (
            <span className="bg-brand-olive text-white text-[9px] tracking-wider font-semibold px-1.5 py-0.5 rounded-xs">
              Save {discountPercent}%
            </span>
          )}
        </div>

        {/* Top-Right Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 ${
            isWishlisted
              ? 'bg-white text-rose-600 shadow-md scale-105'
              : 'bg-white/80 hover:bg-white text-brand-charcoal/70 hover:text-brand-charcoal shadow-xs hover:scale-110'
          }`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted ? 'fill-rose-500 text-rose-500' : 'stroke-[1.75]'
            }`}
          />
        </button>

        {/* Product Media Link */}
        <Link
          href={`/products/${product.slug}`}
          className="relative w-full h-full p-6 flex items-center justify-center cursor-pointer"
        >
          <div className="relative w-full h-full transition-transform duration-700 ease-out group-hover:scale-[1.04]">
            <Image
              src={isHovered && secondaryImage ? secondaryImage : primaryImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              priority={priority}
              className="object-contain transition-opacity duration-500"
            />
          </div>
        </Link>

        {/* Desktop Quick Action Drawer (Revealed on Hover) */}
        <div className="hidden sm:flex absolute inset-x-3 bottom-3 z-10 gap-2 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          {onQuickView && (
            <button
              type="button"
              onClick={handleQuickViewClick}
              className="py-2.5 px-3 bg-white/95 backdrop-blur-md text-brand-charcoal hover:bg-white text-[11px] font-semibold tracking-wider uppercase rounded-xs border border-border-strong/50 shadow-md flex items-center justify-center gap-1 transition-colors"
              title="Quick Preview"
              aria-label="Quick preview product"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Preview</span>
            </button>
          )}

          {!product.isUpcoming && product.inStock ? (
            <button
              type="button"
              onClick={handleQuickAdd}
              className={`flex-1 py-2.5 px-3 text-[11px] uppercase tracking-widest font-semibold flex items-center justify-center gap-1.5 rounded-xs shadow-md transition-all ${
                addedAnimation
                  ? 'bg-emerald-800 text-white'
                  : 'bg-brand-charcoal text-white hover:bg-brand-mineral'
              }`}
            >
              {addedAnimation ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Quick Add</span>
                </>
              )}
            </button>
          ) : (
            <Link
              href={`/products/${product.slug}`}
              className="flex-1 py-2.5 px-3 bg-surface-muted text-brand-charcoal text-[11px] uppercase tracking-widest font-semibold flex items-center justify-center rounded-xs border border-border-subtle"
            >
              View Formula
            </Link>
          )}
        </div>
      </div>

      {/* 2. Product Meta & Information */}
      <div className="p-4 sm:p-4.5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Category & Volume Row */}
          <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-brand-mineral font-medium">
            <span>{product.category}</span>
            {product.volume && <span>{product.volume.split('/')[0].trim()}</span>}
          </div>

          {/* Title */}
          <Link
            href={`/products/${product.slug}`}
            className="block font-serif text-base sm:text-[17px] font-medium text-brand-charcoal hover:text-brand-amber transition-colors line-clamp-1 leading-snug"
          >
            {product.name}
          </Link>

          {/* Tagline */}
          <p className="text-xs text-brand-mineral line-clamp-2 leading-relaxed">
            {product.tagline}
          </p>

          {/* Key Attributes Pills (Finish & Skin Type) */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            {product.finish && (
              <span className="inline-block text-[10px] text-brand-charcoal/80 bg-surface-muted px-2 py-0.5 rounded-xs font-medium border border-border-subtle/60 line-clamp-1">
                {product.finish}
              </span>
            )}
            {product.skinType && (
              <span className="inline-block text-[10px] text-brand-mineral bg-surface-muted/50 px-2 py-0.5 rounded-xs font-medium border border-border-subtle/40 line-clamp-1">
                {product.skinType.split('•')[0].trim()}
              </span>
            )}
          </div>
        </div>

        {/* Price & Mobile CTAs */}
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

          {/* Mobile Add to Bag / View Button */}
          <div className="sm:hidden flex items-center gap-1.5">
            {!product.isUpcoming && product.inStock ? (
              <button
                type="button"
                onClick={handleQuickAdd}
                className={`text-xs uppercase tracking-wider font-semibold flex items-center gap-1 px-2.5 py-1.5 rounded-xs transition-all ${
                  addedAnimation
                    ? 'bg-emerald-800 text-white'
                    : 'bg-brand-charcoal text-white hover:bg-brand-mineral'
                }`}
                aria-label={`Add ${product.name} to bag`}
              >
                {addedAnimation ? (
                  <Check className="w-3 h-3 text-emerald-300" />
                ) : (
                  <Plus className="w-3 h-3" />
                )}
                <span>{addedAnimation ? 'Added' : 'Add'}</span>
              </button>
            ) : (
              <Link
                href={`/products/${product.slug}`}
                className="text-[11px] uppercase tracking-wider font-semibold text-brand-charcoal underline"
              >
                View
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
