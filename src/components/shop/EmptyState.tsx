'use client';

import React from 'react';
import { Sparkles, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  onClearAll: () => void;
  searchQuery?: string;
}

export function EmptyState({ onClearAll, searchQuery }: EmptyStateProps) {
  return (
    <div className="py-20 px-4 text-center bg-surface-muted/30 border border-border-subtle rounded-sm max-w-xl mx-auto my-8 space-y-4">
      <div className="w-12 h-12 rounded-full bg-surface-muted border border-border-subtle flex items-center justify-center mx-auto text-brand-amber">
        <Sparkles className="w-6 h-6" />
      </div>

      <div className="space-y-1.5">
        <h3 className="font-serif text-xl sm:text-2xl text-brand-charcoal font-normal">
          No Formulas Found
        </h3>
        <p className="text-xs sm:text-sm text-brand-mineral max-w-md mx-auto leading-relaxed">
          {searchQuery
            ? `We couldn't find any Velyra formulations matching "${searchQuery}". Try searching for SPF, finish, or key ingredients.`
            : "We couldn't find any Velyra formulations matching your selected filter criteria."}
        </p>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={onClearAll}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm bg-brand-charcoal text-white hover:bg-brand-mineral text-xs uppercase tracking-widest font-semibold transition-colors shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear All Filters</span>
        </button>
      </div>
    </div>
  );
}
