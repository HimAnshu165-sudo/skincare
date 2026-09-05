'use client';

import React from 'react';
import { CreditCard, Banknote, ShieldCheck, Zap, Sparkles } from 'lucide-react';

interface PaymentMethodSelectorProps {
  selectedMethod: 'ONLINE' | 'COD';
  onChange: (method: 'ONLINE' | 'COD') => void;
}

export function PaymentMethodSelector({
  selectedMethod,
  onChange,
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-serif text-lg text-brand-charcoal font-medium">
        Select Payment Method
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Option 1: Online Payment (UPI / Cards / Netbanking) */}
        <label
          className={`relative p-5 rounded-sm border-2 cursor-pointer flex flex-col justify-between transition-all ${
            selectedMethod === 'ONLINE'
              ? 'border-brand-charcoal bg-surface-muted shadow-sm'
              : 'border-border-subtle bg-surface-elevated hover:border-border-strong'
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="ONLINE"
            checked={selectedMethod === 'ONLINE'}
            onChange={() => onChange('ONLINE')}
            className="sr-only"
          />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-brand-charcoal text-xs uppercase tracking-wider">
                <CreditCard className="w-4 h-4 text-brand-amber" />
                <span>Online Payment (UPI & Cards)</span>
              </div>
              <span className="bg-brand-amber text-brand-charcoal text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-xs">
                Fastest
              </span>
            </div>
            <p className="text-[11px] text-brand-mineral leading-relaxed">
              Google Pay, PhonePe, Paytm UPI, Credit/Debit Cards & Netbanking via Razorpay.
            </p>
          </div>
          <div className="pt-3 text-[10px] text-emerald-700 font-medium flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>Instant order confirmation & priority dispatch</span>
          </div>
        </label>

        {/* Option 2: Cash on Delivery (COD) */}
        <label
          className={`relative p-5 rounded-sm border-2 cursor-pointer flex flex-col justify-between transition-all ${
            selectedMethod === 'COD'
              ? 'border-brand-charcoal bg-surface-muted shadow-sm'
              : 'border-border-subtle bg-surface-elevated hover:border-border-strong'
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="COD"
            checked={selectedMethod === 'COD'}
            onChange={() => onChange('COD')}
            className="sr-only"
          />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-brand-charcoal text-xs uppercase tracking-wider">
                <Banknote className="w-4 h-4 text-brand-olive" />
                <span>Cash on Delivery (COD)</span>
              </div>
            </div>
            <p className="text-[11px] text-brand-mineral leading-relaxed">
              Pay with cash or UPI directly to the courier agent upon doorstep delivery.
            </p>
          </div>
          <div className="pt-3 text-[10px] text-brand-mineral flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-brand-olive" />
            <span>Available across Indian pincodes</span>
          </div>
        </label>
      </div>
    </div>
  );
}
