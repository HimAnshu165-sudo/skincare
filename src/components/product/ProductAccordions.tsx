'use client';

import React, { useState } from 'react';
import { ChevronDown, Sparkles, Feather, FlaskConical, HelpCircle } from 'lucide-react';
import { Product } from '@/types';

interface ProductAccordionsProps {
  product: Product;
}

export function ProductAccordions({ product }: ProductAccordionsProps) {
  const [openSection, setOpenSection] = useState<string | null>('ingredients');

  const toggle = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const keyIngredients = Array.isArray(product.keyIngredients)
    ? product.keyIngredients
    : typeof product.keyIngredients === 'string'
    ? JSON.parse(product.keyIngredients)
    : [];

  const sections = [
    {
      id: 'ingredients',
      title: 'Active Ingredients & Formulation',
      icon: FlaskConical,
      content: (
        <div className="space-y-4 text-xs text-brand-mineral leading-relaxed">
          {keyIngredients.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-border-subtle">
              {keyIngredients.map((item: { name: string; benefit: string }, idx: number) => (
                <div key={idx} className="bg-surface-muted p-3 rounded-sm space-y-1">
                  <div className="font-semibold text-brand-charcoal">{item.name}</div>
                  <div className="text-[11px] text-brand-mineral">{item.benefit}</div>
                </div>
              ))}
            </div>
          )}
          <div>
            <span className="font-semibold text-brand-charcoal block mb-1">Full Ingredient List (INCI):</span>
            <p className="text-[11px] font-mono leading-normal text-stone-600">
              {product.fullIngredients}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'howToUse',
      title: 'The Daily Application Ritual',
      icon: Feather,
      content: (
        <div className="space-y-3 text-xs text-brand-mineral leading-relaxed">
          <p>{product.howToUse}</p>
          <div className="bg-brand-sand/30 p-3 rounded-sm border border-brand-sand/60 text-[11px] text-brand-charcoal">
            <strong>Dermatologist Tip:</strong> Reapply every 2 to 3 hours if engaging in outdoor physical activity or swimming under direct sunlight.
          </div>
        </div>
      ),
    },
    {
      id: 'suitability',
      title: 'Skin Suitability & Clinical Safety',
      icon: Sparkles,
      content: (
        <div className="space-y-2 text-xs text-brand-mineral leading-relaxed">
          <p>
            Specifically tested on Indian skin phototypes (Fitzpatrick scale III to V). Formulated without artificial fragrance, drying alcohol, or pore-clogging heavy silicones.
          </p>
          <ul className="list-disc pl-4 space-y-1 text-[11px]">
            <li>Non-comedogenic & acne safe</li>
            <li>Zero stinging around sensitive eye contours</li>
            <li>Cruelty-free & 100% Vegan certified</li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <div className="border-t border-border-subtle divide-y divide-border-subtle">
      {sections.map((sec) => {
        const isOpen = openSection === sec.id;
        const Icon = sec.icon;
        return (
          <div key={sec.id} className="py-4">
            <button
              onClick={() => toggle(sec.id)}
              className="w-full flex items-center justify-between text-left group"
              aria-expanded={isOpen}
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 text-brand-amber group-hover:text-brand-charcoal transition-colors" />
                <span className="font-serif text-base text-brand-charcoal font-medium group-hover:text-brand-amber transition-colors">
                  {sec.title}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-brand-mineral transition-transform duration-300 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {isOpen && <div className="mt-4 pt-2 animate-fade-in">{sec.content}</div>}
          </div>
        );
      })}
    </div>
  );
}
