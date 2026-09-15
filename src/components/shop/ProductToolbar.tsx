'use client';

import React from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

interface ProductToolbarProps {
  totalCount: number;
  filteredCount: number;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onClearSearch: () => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  activeFilterCount: number;
  onOpenMobileFilters: () => void;
}

export function ProductToolbar({
  totalCount,
  filteredCount,
  searchQuery,
  onSearchChange,
  onClearSearch,
  sortBy,
  onSortChange,
  activeFilterCount,
  onOpenMobileFilters,
}: ProductToolbarProps) {
  return (
    <div className="py-4 border-b border-border-subtle bg-surface-base sticky top-16 z-20 backdrop-blur-md bg-surface-base/95">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5">
        {/* Left: Dynamic Result Count & Mobile Filter Trigger */}
        <div className="flex items-center justify-between sm:justify-start gap-4">
          <div className="text-xs uppercase tracking-widest text-brand-mineral font-medium">
            <span className="text-brand-charcoal font-semibold">{filteredCount}</span> of {totalCount} Formulations
          </div>

          {/* Mobile Filter Button */}
          <button
            type="button"
            onClick={onOpenMobileFilters}
            className="lg:hidden inline-flex items-center gap-2 px-3.5 py-1.5 rounded-sm bg-surface-elevated border border-border-subtle hover:border-brand-charcoal/40 text-xs font-medium text-brand-charcoal transition-colors"
            aria-label="Open filter menu"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-brand-amber" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-brand-charcoal text-white text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Right: Search Input & Sort Dropdown */}
        <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 min-w-0 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-mineral pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search formulas, finish..."
              className="w-full pl-9 pr-8 py-2 bg-surface-muted/60 border border-border-subtle hover:border-border-strong focus:border-brand-charcoal focus:bg-surface-base rounded-sm text-xs text-brand-charcoal placeholder:text-brand-mineral/70 transition-all outline-none"
              aria-label="Search products in collection"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={onClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-mineral hover:text-brand-charcoal p-0.5 rounded-xs"
                aria-label="Clear search query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative shrink-0">
            <div className="flex items-center gap-1 sm:gap-1.5 pl-2 sm:pl-3 pr-1.5 sm:pr-2 py-2 bg-surface-muted/60 border border-border-subtle hover:border-border-strong rounded-sm text-xs text-brand-charcoal">
              <ArrowUpDown className="w-3 h-3 text-brand-mineral hidden sm:inline" />
              <label htmlFor="shop-sort-select" className="text-brand-mineral font-normal hidden md:inline">
                Sort:
              </label>
              <select
                id="shop-sort-select"
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                className="bg-transparent text-brand-charcoal font-medium text-xs focus:outline-none cursor-pointer pr-4"
                aria-label="Sort products"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A–Z</option>
                <option value="name-desc">Name: Z–A</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
