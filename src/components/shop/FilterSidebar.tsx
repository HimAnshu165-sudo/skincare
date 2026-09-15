'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Check, RotateCcw } from 'lucide-react';
import { Product } from '@/types';

export interface FilterState {
  categories: string[];
  spfRatings: string[];
  skinTypes: string[];
  finishes: string[];
  priceRanges: string[];
  availability: string[];
}

interface FilterOption {
  id: string;
  label: string;
  count: number;
}

interface FilterSidebarProps {
  products: Product[];
  filterState: FilterState;
  onToggleFilter: (type: keyof FilterState, value: string) => void;
  onClearAll: () => void;
  className?: string;
}

export function FilterSidebar({
  products,
  filterState,
  onToggleFilter,
  onClearAll,
  className = '',
}: FilterSidebarProps) {
  // Accordion open/close state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    category: true,
    spf: true,
    skinType: true,
    finish: true,
    price: true,
    availability: true,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Derive counts dynamically from all catalog products
  const categoryCounts = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryOptions: FilterOption[] = [
    { id: 'Sunscreens', label: 'Sunscreens', count: categoryCounts['Sunscreens'] || 0 },
    { id: 'Moisturizers', label: 'Moisturizers', count: categoryCounts['Moisturizers'] || 0 },
    { id: 'Cleansers', label: 'Cleansers', count: categoryCounts['Cleansers'] || 0 },
    { id: 'Sets', label: 'Sets', count: categoryCounts['Sets'] || 0 },
  ].filter((opt) => opt.count > 0);

  // SPF options
  const spfCounts = products.reduce((acc, p) => {
    if (p.spfRating) {
      const clean = p.spfRating.replace('•', '').replace(/\s+/g, ' ').trim();
      acc[clean] = (acc[clean] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const spfOptions: FilterOption[] = [
    { id: 'SPF 50+ PA++++', label: 'SPF 50+ PA++++', count: spfCounts['SPF 50+ PA++++'] || 0 },
    { id: 'SPF 50 PA++++', label: 'SPF 50 PA++++', count: spfCounts['SPF 50 PA++++'] || 0 },
  ].filter((opt) => opt.count > 0);

  // Skin Type options
  const skinTypeTaxonomy = [
    { id: 'all', label: 'All Skin Types', match: (p: Product) => (p.skinType || '').toLowerCase().includes('all') },
    { id: 'oily', label: 'Oily & Acne-Prone', match: (p: Product) => /(oily|acne)/i.test(p.skinType || '') },
    { id: 'dry', label: 'Dry & Dehydrated', match: (p: Product) => /(dry|dehydrated)/i.test(p.skinType || '') },
    { id: 'sensitive', label: 'Sensitive & Rosacea', match: (p: Product) => /(sensitive|rosacea|barrier)/i.test(p.skinType || '') },
    { id: 'mature', label: 'Mature & Aging', match: (p: Product) => /(mature|lines)/i.test(p.skinType || '') },
  ];

  const skinTypeOptions: FilterOption[] = skinTypeTaxonomy
    .map((item) => ({
      id: item.id,
      label: item.label,
      count: products.filter(item.match).length,
    }))
    .filter((opt) => opt.count > 0);

  // Finish options
  const finishCounts = products.reduce((acc, p) => {
    if (p.finish) {
      acc[p.finish] = (acc[p.finish] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const finishOptions: FilterOption[] = Object.keys(finishCounts)
    .sort()
    .map((f) => ({
      id: f,
      label: f,
      count: finishCounts[f],
    }));

  // Price Range options
  const priceOptions: FilterOption[] = [
    {
      id: 'under-900',
      label: 'Under ₹900',
      count: products.filter((p) => p.price < 900).length,
    },
    {
      id: '900-1000',
      label: '₹900 – ₹1,000',
      count: products.filter((p) => p.price >= 900 && p.price <= 1000).length,
    },
    {
      id: 'above-1000',
      label: 'Above ₹1,000',
      count: products.filter((p) => p.price > 1000).length,
    },
  ].filter((opt) => opt.count > 0);

  // Availability options
  const availabilityOptions: FilterOption[] = [
    {
      id: 'in-stock',
      label: 'In Stock',
      count: products.filter((p) => p.inStock && !p.isUpcoming).length,
    },
    {
      id: 'upcoming',
      label: 'Upcoming Launch',
      count: products.filter((p) => p.isUpcoming).length,
    },
  ].filter((opt) => opt.count > 0);

  const totalActive =
    filterState.categories.length +
    filterState.spfRatings.length +
    filterState.skinTypes.length +
    filterState.finishes.length +
    filterState.priceRanges.length +
    filterState.availability.length;

  return (
    <aside className={`w-full text-xs text-brand-charcoal space-y-6 ${className}`}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <span className="font-serif text-base tracking-wide font-medium">Filters</span>
          {totalActive > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-brand-charcoal text-white text-[10px] font-bold">
              {totalActive}
            </span>
          )}
        </div>
        {totalActive > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-[11px] text-brand-mineral hover:text-brand-charcoal underline underline-offset-2 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* 1. Category Accordion */}
      {categoryOptions.length > 0 && (
        <div className="pb-5 border-b border-border-subtle/80 space-y-3">
          <button
            type="button"
            onClick={() => toggleSection('category')}
            className="w-full flex items-center justify-between text-left font-semibold uppercase tracking-wider text-[11px] text-brand-mineral hover:text-brand-charcoal transition-colors"
          >
            <span>Category</span>
            {openSections.category ? (
              <ChevronUp className="w-3.5 h-3.5 text-brand-mineral" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-brand-mineral" />
            )}
          </button>

          {openSections.category && (
            <div className="space-y-2 pt-1">
              {categoryOptions.map((opt) => {
                const checked = filterState.categories.includes(opt.id);
                return (
                  <label
                    key={opt.id}
                    className="flex items-center justify-between group cursor-pointer select-none py-0.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-xs border flex items-center justify-center transition-colors ${
                          checked
                            ? 'bg-brand-charcoal border-brand-charcoal text-white'
                            : 'border-border-strong group-hover:border-brand-charcoal bg-surface-base'
                        }`}
                      >
                        {checked && <Check className="w-3 h-3 stroke-[2.5]" />}
                      </div>
                      <span className={`${checked ? 'font-semibold text-brand-charcoal' : 'text-brand-charcoal/80 group-hover:text-brand-charcoal'}`}>
                        {opt.label}
                      </span>
                    </div>
                    <span className="text-[11px] text-brand-mineral">{opt.count}</span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleFilter('categories', opt.id)}
                      className="sr-only"
                    />
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. SPF Rating Accordion */}
      {spfOptions.length > 0 && (
        <div className="pb-5 border-b border-border-subtle/80 space-y-3">
          <button
            type="button"
            onClick={() => toggleSection('spf')}
            className="w-full flex items-center justify-between text-left font-semibold uppercase tracking-wider text-[11px] text-brand-mineral hover:text-brand-charcoal transition-colors"
          >
            <span>SPF Protection</span>
            {openSections.spf ? (
              <ChevronUp className="w-3.5 h-3.5 text-brand-mineral" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-brand-mineral" />
            )}
          </button>

          {openSections.spf && (
            <div className="space-y-2 pt-1">
              {spfOptions.map((opt) => {
                const checked = filterState.spfRatings.includes(opt.id);
                return (
                  <label
                    key={opt.id}
                    className="flex items-center justify-between group cursor-pointer select-none py-0.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-xs border flex items-center justify-center transition-colors ${
                          checked
                            ? 'bg-brand-charcoal border-brand-charcoal text-white'
                            : 'border-border-strong group-hover:border-brand-charcoal bg-surface-base'
                        }`}
                      >
                        {checked && <Check className="w-3 h-3 stroke-[2.5]" />}
                      </div>
                      <span className={`${checked ? 'font-semibold text-brand-charcoal' : 'text-brand-charcoal/80 group-hover:text-brand-charcoal'}`}>
                        {opt.label}
                      </span>
                    </div>
                    <span className="text-[11px] text-brand-mineral">{opt.count}</span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleFilter('spfRatings', opt.id)}
                      className="sr-only"
                    />
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. Skin Type Accordion */}
      {skinTypeOptions.length > 0 && (
        <div className="pb-5 border-b border-border-subtle/80 space-y-3">
          <button
            type="button"
            onClick={() => toggleSection('skinType')}
            className="w-full flex items-center justify-between text-left font-semibold uppercase tracking-wider text-[11px] text-brand-mineral hover:text-brand-charcoal transition-colors"
          >
            <span>Skin Type</span>
            {openSections.skinType ? (
              <ChevronUp className="w-3.5 h-3.5 text-brand-mineral" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-brand-mineral" />
            )}
          </button>

          {openSections.skinType && (
            <div className="space-y-2 pt-1">
              {skinTypeOptions.map((opt) => {
                const checked = filterState.skinTypes.includes(opt.id);
                return (
                  <label
                    key={opt.id}
                    className="flex items-center justify-between group cursor-pointer select-none py-0.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-xs border flex items-center justify-center transition-colors ${
                          checked
                            ? 'bg-brand-charcoal border-brand-charcoal text-white'
                            : 'border-border-strong group-hover:border-brand-charcoal bg-surface-base'
                        }`}
                      >
                        {checked && <Check className="w-3 h-3 stroke-[2.5]" />}
                      </div>
                      <span className={`${checked ? 'font-semibold text-brand-charcoal' : 'text-brand-charcoal/80 group-hover:text-brand-charcoal'}`}>
                        {opt.label}
                      </span>
                    </div>
                    <span className="text-[11px] text-brand-mineral">{opt.count}</span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleFilter('skinTypes', opt.id)}
                      className="sr-only"
                    />
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. Finish Accordion */}
      {finishOptions.length > 0 && (
        <div className="pb-5 border-b border-border-subtle/80 space-y-3">
          <button
            type="button"
            onClick={() => toggleSection('finish')}
            className="w-full flex items-center justify-between text-left font-semibold uppercase tracking-wider text-[11px] text-brand-mineral hover:text-brand-charcoal transition-colors"
          >
            <span>Finish & Texture</span>
            {openSections.finish ? (
              <ChevronUp className="w-3.5 h-3.5 text-brand-mineral" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-brand-mineral" />
            )}
          </button>

          {openSections.finish && (
            <div className="space-y-2 pt-1 max-h-56 overflow-y-auto pr-1">
              {finishOptions.map((opt) => {
                const checked = filterState.finishes.includes(opt.id);
                return (
                  <label
                    key={opt.id}
                    className="flex items-center justify-between group cursor-pointer select-none py-0.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-xs border flex items-center justify-center transition-colors shrink-0 ${
                          checked
                            ? 'bg-brand-charcoal border-brand-charcoal text-white'
                            : 'border-border-strong group-hover:border-brand-charcoal bg-surface-base'
                        }`}
                      >
                        {checked && <Check className="w-3 h-3 stroke-[2.5]" />}
                      </div>
                      <span className={`line-clamp-1 ${checked ? 'font-semibold text-brand-charcoal' : 'text-brand-charcoal/80 group-hover:text-brand-charcoal'}`}>
                        {opt.label}
                      </span>
                    </div>
                    <span className="text-[11px] text-brand-mineral shrink-0">{opt.count}</span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleFilter('finishes', opt.id)}
                      className="sr-only"
                    />
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. Price Range Accordion */}
      {priceOptions.length > 0 && (
        <div className="pb-5 border-b border-border-subtle/80 space-y-3">
          <button
            type="button"
            onClick={() => toggleSection('price')}
            className="w-full flex items-center justify-between text-left font-semibold uppercase tracking-wider text-[11px] text-brand-mineral hover:text-brand-charcoal transition-colors"
          >
            <span>Price Range</span>
            {openSections.price ? (
              <ChevronUp className="w-3.5 h-3.5 text-brand-mineral" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-brand-mineral" />
            )}
          </button>

          {openSections.price && (
            <div className="space-y-2 pt-1">
              {priceOptions.map((opt) => {
                const checked = filterState.priceRanges.includes(opt.id);
                return (
                  <label
                    key={opt.id}
                    className="flex items-center justify-between group cursor-pointer select-none py-0.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-xs border flex items-center justify-center transition-colors ${
                          checked
                            ? 'bg-brand-charcoal border-brand-charcoal text-white'
                            : 'border-border-strong group-hover:border-brand-charcoal bg-surface-base'
                        }`}
                      >
                        {checked && <Check className="w-3 h-3 stroke-[2.5]" />}
                      </div>
                      <span className={`${checked ? 'font-semibold text-brand-charcoal' : 'text-brand-charcoal/80 group-hover:text-brand-charcoal'}`}>
                        {opt.label}
                      </span>
                    </div>
                    <span className="text-[11px] text-brand-mineral">{opt.count}</span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleFilter('priceRanges', opt.id)}
                      className="sr-only"
                    />
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 6. Availability Accordion */}
      {availabilityOptions.length > 0 && (
        <div className="pb-5 space-y-3">
          <button
            type="button"
            onClick={() => toggleSection('availability')}
            className="w-full flex items-center justify-between text-left font-semibold uppercase tracking-wider text-[11px] text-brand-mineral hover:text-brand-charcoal transition-colors"
          >
            <span>Availability</span>
            {openSections.availability ? (
              <ChevronUp className="w-3.5 h-3.5 text-brand-mineral" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-brand-mineral" />
            )}
          </button>

          {openSections.availability && (
            <div className="space-y-2 pt-1">
              {availabilityOptions.map((opt) => {
                const checked = filterState.availability.includes(opt.id);
                return (
                  <label
                    key={opt.id}
                    className="flex items-center justify-between group cursor-pointer select-none py-0.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-xs border flex items-center justify-center transition-colors ${
                          checked
                            ? 'bg-brand-charcoal border-brand-charcoal text-white'
                            : 'border-border-strong group-hover:border-brand-charcoal bg-surface-base'
                        }`}
                      >
                        {checked && <Check className="w-3 h-3 stroke-[2.5]" />}
                      </div>
                      <span className={`${checked ? 'font-semibold text-brand-charcoal' : 'text-brand-charcoal/80 group-hover:text-brand-charcoal'}`}>
                        {opt.label}
                      </span>
                    </div>
                    <span className="text-[11px] text-brand-mineral">{opt.count}</span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleFilter('availability', opt.id)}
                      className="sr-only"
                    />
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
