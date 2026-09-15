'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Product } from '@/types';
import { ShopHeader } from './ShopHeader';
import { ProductToolbar, SortOption } from './ProductToolbar';
import { FilterSidebar, FilterState } from './FilterSidebar';
import { MobileFilterDrawer } from './MobileFilterDrawer';
import { ActiveFilterChips, ActiveFilter } from './ActiveFilterChips';
import { ShopProductCard } from './ShopProductCard';
import { QuickViewModal } from './QuickViewModal';
import { EmptyState } from './EmptyState';
import { Sparkles, ShieldCheck } from 'lucide-react';

const INITIAL_FILTERS: FilterState = {
  categories: [],
  spfRatings: [],
  skinTypes: [],
  finishes: [],
  priceRanges: [],
  availability: [],
};

interface ShopAllViewProps {
  initialProducts: Product[];
}

export function ShopAllView({ initialProducts }: ShopAllViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [filterState, setFilterState] = useState<FilterState>(INITIAL_FILTERS);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  // Load wishlist from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('velyra_wishlist');
      if (stored) {
        setWishlistIds(JSON.parse(stored));
      }
    } catch {
      // Storage access disabled or unavailable
    }
  }, []);

  const handleToggleWishlist = useCallback((productId: string) => {
    setWishlistIds((prev) => {
      const exists = prev.includes(productId);
      const next = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      try {
        localStorage.setItem('velyra_wishlist', JSON.stringify(next));
      } catch {
        // Safe fallback
      }
      return next;
    });
  }, []);

  // Filter toggle handler
  const handleToggleFilter = useCallback((type: keyof FilterState, value: string) => {
    setFilterState((prev) => {
      const currentList = prev[type];
      const exists = currentList.includes(value);
      return {
        ...prev,
        [type]: exists ? currentList.filter((item) => item !== value) : [...currentList, value],
      };
    });
  }, []);

  const handleClearAll = useCallback(() => {
    setFilterState(INITIAL_FILTERS);
    setSearchQuery('');
  }, []);

  // Filter and sort computation
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // 1. Text Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const nameMatch = p.name.toLowerCase().includes(q);
        const categoryMatch = p.category.toLowerCase().includes(q);
        const taglineMatch = (p.tagline || '').toLowerCase().includes(q);
        const descMatch = (p.description || '').toLowerCase().includes(q);
        const finishMatch = (p.finish || '').toLowerCase().includes(q);
        const skinMatch = (p.skinType || '').toLowerCase().includes(q);
        const spfMatch = (p.spfRating || '').toLowerCase().includes(q);
        const ingMatch = (p.keyIngredients || []).some(
          (k) => (typeof k === 'string' ? k : k.name).toLowerCase().includes(q)
        );
        const benefitMatch = (p.benefits || []).some((b) => b.toLowerCase().includes(q));

        return (
          nameMatch ||
          categoryMatch ||
          taglineMatch ||
          descMatch ||
          finishMatch ||
          skinMatch ||
          spfMatch ||
          ingMatch ||
          benefitMatch
        );
      });
    }

    // 2. Category Filter
    if (filterState.categories.length > 0) {
      result = result.filter((p) => filterState.categories.includes(p.category));
    }

    // 3. SPF Rating Filter
    if (filterState.spfRatings.length > 0) {
      result = result.filter((p) => {
        if (!p.spfRating) return false;
        return filterState.spfRatings.some((selectedSpf) =>
          p.spfRating?.includes(selectedSpf.split(' ')[1] || selectedSpf)
        );
      });
    }

    // 4. Skin Type Filter
    if (filterState.skinTypes.length > 0) {
      result = result.filter((p) => {
        const text = (p.skinType || '').toLowerCase();
        return filterState.skinTypes.some((type) => {
          if (type === 'all') return text.includes('all');
          if (type === 'oily') return /(oily|acne)/i.test(text);
          if (type === 'dry') return /(dry|dehydrated)/i.test(text);
          if (type === 'sensitive') return /(sensitive|rosacea|barrier)/i.test(text);
          if (type === 'mature') return /(mature|lines)/i.test(text);
          return false;
        });
      });
    }

    // 5. Finish Filter
    if (filterState.finishes.length > 0) {
      result = result.filter((p) => p.finish && filterState.finishes.includes(p.finish));
    }

    // 6. Price Range Filter
    if (filterState.priceRanges.length > 0) {
      result = result.filter((p) => {
        return filterState.priceRanges.some((range) => {
          if (range === 'under-900') return p.price < 900;
          if (range === '900-1000') return p.price >= 900 && p.price <= 1000;
          if (range === 'above-1000') return p.price > 1000;
          return true;
        });
      });
    }

    // 7. Availability Filter
    if (filterState.availability.length > 0) {
      result = result.filter((p) => {
        return filterState.availability.some((av) => {
          if (av === 'in-stock') return p.inStock && !p.isUpcoming;
          if (av === 'upcoming') return p.isUpcoming;
          return true;
        });
      });
    }

    // 8. Sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'featured':
      default:
        // Preserves the flagship catalog curation
        break;
    }

    return result;
  }, [initialProducts, searchQuery, filterState, sortBy]);

  // Construct active filter chip items
  const activeChips: ActiveFilter[] = useMemo(() => {
    const chips: ActiveFilter[] = [];

    if (searchQuery.trim()) {
      chips.push({ id: 'search', type: 'search', label: `"${searchQuery}"` });
    }

    filterState.categories.forEach((cat) => {
      chips.push({ id: `cat-${cat}`, type: 'category', label: cat });
    });

    filterState.spfRatings.forEach((spf) => {
      chips.push({ id: `spf-${spf}`, type: 'spf', label: spf });
    });

    filterState.skinTypes.forEach((st) => {
      const labels: Record<string, string> = {
        all: 'All Skin Types',
        oily: 'Oily & Acne-Prone',
        dry: 'Dry & Dehydrated',
        sensitive: 'Sensitive & Rosacea',
        mature: 'Mature & Aging',
      };
      chips.push({ id: `st-${st}`, type: 'skinType', label: labels[st] || st });
    });

    filterState.finishes.forEach((fin) => {
      chips.push({ id: `fin-${fin}`, type: 'finish', label: fin });
    });

    filterState.priceRanges.forEach((pr) => {
      const labels: Record<string, string> = {
        'under-900': 'Under ₹900',
        '900-1000': '₹900 – ₹1,000',
        'above-1000': 'Above ₹1,000',
      };
      chips.push({ id: `pr-${pr}`, type: 'price', label: labels[pr] || pr });
    });

    filterState.availability.forEach((av) => {
      chips.push({
        id: `av-${av}`,
        type: 'availability',
        label: av === 'in-stock' ? 'In Stock' : 'Upcoming',
      });
    });

    return chips;
  }, [searchQuery, filterState]);

  const handleRemoveChip = (chip: ActiveFilter) => {
    if (chip.type === 'search') {
      setSearchQuery('');
    } else if (chip.type === 'category') {
      handleToggleFilter('categories', chip.label);
    } else if (chip.type === 'spf') {
      handleToggleFilter('spfRatings', chip.label);
    } else if (chip.type === 'skinType') {
      const key = Object.keys({
        all: 'All Skin Types',
        oily: 'Oily & Acne-Prone',
        dry: 'Dry & Dehydrated',
        sensitive: 'Sensitive & Rosacea',
        mature: 'Mature & Aging',
      }).find(
        (k) =>
          ({
            all: 'All Skin Types',
            oily: 'Oily & Acne-Prone',
            dry: 'Dry & Dehydrated',
            sensitive: 'Sensitive & Rosacea',
            mature: 'Mature & Aging',
          }[k] === chip.label)
      );
      if (key) handleToggleFilter('skinTypes', key);
    } else if (chip.type === 'finish') {
      handleToggleFilter('finishes', chip.label);
    } else if (chip.type === 'price') {
      const id = chip.id.replace('pr-', '');
      handleToggleFilter('priceRanges', id);
    } else if (chip.type === 'availability') {
      const val = chip.label === 'In Stock' ? 'in-stock' : 'upcoming';
      handleToggleFilter('availability', val);
    }
  };

  const totalActiveFilterCount =
    activeChips.length - (searchQuery.trim() ? 1 : 0);

  return (
    <div className="bg-surface-base min-h-screen">
      {/* 1. Shop All Luxury Editorial Header */}
      <ShopHeader />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28">
        {/* 2. Control Toolbar (Sticky below navbar) */}
        <ProductToolbar
          totalCount={initialProducts.length}
          filteredCount={filteredProducts.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClearSearch={() => setSearchQuery('')}
          sortBy={sortBy}
          onSortChange={setSortBy}
          activeFilterCount={totalActiveFilterCount}
          onOpenMobileFilters={() => setIsMobileDrawerOpen(true)}
        />

        {/* 3. Active Filter Chips Bar */}
        <ActiveFilterChips
          filters={activeChips}
          onRemoveFilter={handleRemoveChip}
          onClearAll={handleClearAll}
        />

        {/* 4. Desktop Two-Column Layout (Sticky Left Sidebar + Responsive Grid) */}
        <div className="mt-6 flex items-start gap-8 lg:gap-10">
          {/* Left: Desktop Sticky Filter Sidebar */}
          <div className="hidden lg:block w-60 xl:w-64 shrink-0 sticky top-36 max-h-[calc(100vh-10rem)] overflow-y-auto pr-2 pb-6">
            <FilterSidebar
              products={initialProducts}
              filterState={filterState}
              onToggleFilter={handleToggleFilter}
              onClearAll={handleClearAll}
            />
          </div>

          {/* Right: Product Collection Display */}
          <div className="flex-1 min-w-0">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                {filteredProducts.map((product, idx) => (
                  <ShopProductCard
                    key={product.id}
                    product={product}
                    onQuickView={setQuickViewProduct}
                    isWishlisted={wishlistIds.includes(product.id)}
                    onToggleWishlist={handleToggleWishlist}
                    priority={idx < 4}
                  />
                ))}
              </div>
            ) : (
              <EmptyState onClearAll={handleClearAll} searchQuery={searchQuery} />
            )}

            {/* Collection Editorial Note */}
            <div className="mt-16 bg-surface-muted/50 p-8 sm:p-10 rounded-sm border border-border-subtle text-center space-y-3 max-w-2xl mx-auto">
              <div className="w-9 h-9 rounded-full bg-brand-amber/10 flex items-center justify-center mx-auto text-brand-amber">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl text-brand-charcoal">
                Small-Batch Precision & Photostability
              </h3>
              <p className="text-xs text-brand-mineral leading-relaxed">
                We formulate in controlled micro-batches to ensure peak potency of our photostable European UV filters, bio-fermented botanicals, and lipid barrier complexes. Zero degradation, maximum dermal defense.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        products={initialProducts}
        filterState={filterState}
        onToggleFilter={handleToggleFilter}
        onClearAll={handleClearAll}
        matchingCount={filteredProducts.length}
      />

      {/* 6. Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}
