'use client';

import React, { useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Product } from '@/types';
import { FilterSidebar, FilterState } from './FilterSidebar';

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  filterState: FilterState;
  onToggleFilter: (type: keyof FilterState, value: string) => void;
  onClearAll: () => void;
  matchingCount: number;
}

export function MobileFilterDrawer({
  isOpen,
  onClose,
  products,
  filterState,
  onToggleFilter,
  onClearAll,
  matchingCount,
}: MobileFilterDrawerProps) {
  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Filter formulations"
      className="fixed inset-0 z-50 lg:hidden flex"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      {/* Drawer Container */}
      <div className="relative ml-auto w-full max-w-xs sm:max-w-sm h-full bg-surface-base shadow-2xl flex flex-col z-10 animate-fade-up">
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg text-brand-charcoal font-medium">Filter Catalog</span>
            <span className="text-xs text-brand-mineral font-sans">({matchingCount} results)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-brand-mineral hover:text-brand-charcoal hover:bg-surface-muted transition-colors"
            aria-label="Close filter drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Filters */}
        <div className="flex-1 overflow-y-auto px-5 py-6">
          <FilterSidebar
            products={products}
            filterState={filterState}
            onToggleFilter={onToggleFilter}
            onClearAll={onClearAll}
          />
        </div>

        {/* Drawer Sticky Footer */}
        <div className="p-4 border-t border-border-subtle bg-surface-elevated/95 backdrop-blur-md flex items-center gap-3">
          <button
            type="button"
            onClick={onClearAll}
            className="flex-1 py-3 px-4 rounded-sm border border-border-strong text-xs font-semibold uppercase tracking-wider text-brand-charcoal hover:bg-surface-muted transition-colors"
          >
            Clear All
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-sm bg-brand-charcoal text-white text-xs font-semibold uppercase tracking-wider hover:bg-brand-mineral shadow-sm transition-colors flex items-center justify-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply ({matchingCount})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
