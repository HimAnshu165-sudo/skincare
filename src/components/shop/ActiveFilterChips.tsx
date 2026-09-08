'use client';

import React from 'react';
import { X, RotateCcw } from 'lucide-react';

export interface ActiveFilter {
  id: string;
  type: 'category' | 'spf' | 'skinType' | 'finish' | 'price' | 'availability' | 'search';
  label: string;
}

interface ActiveFilterChipsProps {
  filters: ActiveFilter[];
  onRemoveFilter: (filter: ActiveFilter) => void;
  onClearAll: () => void;
}

export function ActiveFilterChips({
  filters,
  onRemoveFilter,
  onClearAll,
}: ActiveFilterChipsProps) {
  if (filters.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap pt-3 pb-2 animate-fade-in">
      <span className="text-[11px] uppercase tracking-wider text-brand-mineral font-semibold mr-1">
        Filtered by:
      </span>

      {filters.map((filter) => (
        <span
          key={filter.id}
          className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full bg-surface-muted text-xs text-brand-charcoal border border-border-subtle hover:border-brand-charcoal/30 transition-colors"
        >
          <span className="font-medium">{filter.label}</span>
          <button
            type="button"
            onClick={() => onRemoveFilter(filter)}
            className="w-4 h-4 rounded-full flex items-center justify-center text-brand-mineral hover:text-brand-charcoal hover:bg-brand-charcoal/10 transition-colors"
            aria-label={`Remove filter ${filter.label}`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      <button
        type="button"
        onClick={onClearAll}
        className="inline-flex items-center gap-1 text-xs text-brand-amber hover:text-brand-charcoal font-semibold ml-2 underline underline-offset-4 transition-colors"
      >
        <RotateCcw className="w-3 h-3" />
        <span>Clear all</span>
      </button>
    </div>
  );
}
