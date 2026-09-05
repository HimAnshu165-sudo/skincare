'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Truck, CheckCircle2, Clock, Package, MapPin, AlertCircle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Order } from '@/types';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('query') || '';

  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async (searchVal: string) => {
    if (!searchVal.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${searchVal.trim()}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'No order found with this Reference or Phone Number.');
        setOrder(null);
      } else {
        setOrder(data.order);
      }
    } catch (err) {
      setError('Network error searching for order.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      fetchOrder(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(query);
  };

  const steps = [
    { key: 'PLACED', label: 'Order Placed', desc: 'Received & logged into system' },
    { key: 'CONFIRMED', label: 'Confirmed', desc: 'Payment verified & batch allocated' },
    { key: 'PROCESSING', label: 'Processing', desc: 'Packed in climate-controlled hub' },
    { key: 'SHIPPED', label: 'Dispatched', desc: 'In transit via express air courier' },
    { key: 'DELIVERED', label: 'Delivered', desc: 'Handed over at doorstep' },
  ];

  const getStepIndex = (status: string) => {
    const idx = steps.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs uppercase tracking-widest text-brand-amber font-semibold">
          Order Status Concierge
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-brand-charcoal font-normal">
          Track Your VELYRA Package
        </h1>
        <p className="text-xs sm:text-sm text-brand-mineral max-w-md mx-auto leading-relaxed">
          Enter your Order ID (e.g. VEL-98241) or registered 10-digit mobile number to view live shipment timeline.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-xl mx-auto bg-surface-elevated p-2 rounded-sm border border-border-subtle shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Order ID (e.g. VEL-98241) or Mobile Number"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent px-4 py-3 text-xs text-brand-charcoal placeholder:text-brand-mineral focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !query}
            className="bg-brand-charcoal text-white px-6 py-3 text-xs uppercase tracking-wider font-semibold rounded-xs hover:bg-brand-mineral transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading ? (
              <span>Searching...</span>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Track</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="max-w-xl mx-auto p-4 bg-red-50 border border-red-200 rounded-xs flex items-center gap-3 text-red-700 text-xs font-medium animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results Timeline Card */}
      {order && (
        <div className="bg-surface-elevated rounded-sm border border-border-subtle shadow-sm p-6 sm:p-10 space-y-8 animate-fade-in">
          {/* Header info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-6">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-brand-mineral block font-semibold">
                Order Reference
              </span>
              <span className="font-serif text-2xl font-semibold text-brand-charcoal">
                #{order.orderNumber}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] uppercase tracking-wider text-brand-mineral block font-semibold">
                Order Status
              </span>
              <span className="inline-block bg-brand-charcoal text-white px-3 py-1 rounded-xs text-xs font-semibold uppercase tracking-wider mt-0.5">
                {order.orderStatus}
              </span>
            </div>
          </div>

          {/* Visual Stepper */}
          <div className="py-4">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 sm:gap-2 relative">
              {steps.map((step, idx) => {
                const currentIdx = getStepIndex(order.orderStatus);
                const isDone = idx <= currentIdx;
                const isCurrent = idx === currentIdx;

                return (
                  <div key={step.key} className="flex flex-col items-center text-center space-y-2 relative">
                    {/* Step Indicator Dot */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold z-10 transition-colors ${
                        isDone
                          ? 'bg-brand-charcoal text-white shadow-xs'
                          : 'bg-surface-muted text-brand-mineral border border-border-subtle'
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="w-4 h-4 text-brand-amber" /> : idx + 1}
                    </div>

                    <div className="space-y-0.5">
                      <span
                        className={`text-xs font-semibold uppercase tracking-wider block ${
                          isCurrent ? 'text-brand-charcoal font-bold' : isDone ? 'text-brand-charcoal' : 'text-brand-mineral'
                        }`}
                      >
                        {step.label}
                      </span>
                      <span className="text-[10px] text-brand-mineral block leading-tight">
                        {step.desc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Courier & Tracking Details */}
          {order.trackingNumber && (
            <div className="bg-surface-muted p-4 rounded-xs border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-brand-amber" />
                <div>
                  <span className="text-brand-mineral">Courier Partner: </span>
                  <strong className="text-brand-charcoal font-semibold">{order.courierName || 'Delhivery Express'}</strong>
                </div>
              </div>
              <div>
                <span className="text-brand-mineral">AWB / Airway Tracking: </span>
                <strong className="text-brand-charcoal font-mono">{order.trackingNumber}</strong>
              </div>
            </div>
          )}

          {/* Destination Address & Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4 border-t border-border-subtle text-xs text-brand-mineral">
            <div>
              <strong className="text-brand-charcoal uppercase tracking-wider text-[11px] block mb-1">
                Destination:
              </strong>
              <p className="text-brand-charcoal font-medium">{order.customerName}</p>
              <p>{order.shippingAddress.address}</p>
              {order.shippingAddress.apartment && <p>{order.shippingAddress.apartment}</p>}
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
            </div>

            <div>
              <strong className="text-brand-charcoal uppercase tracking-wider text-[11px] block mb-1">
                Ordered Items:
              </strong>
              <ul className="space-y-1">
                {order.items.map((item, i) => (
                  <li key={i} className="flex justify-between text-brand-charcoal">
                    <span>{item.quantity}x {item.productName}</span>
                    <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-2 mt-2 border-t border-border-subtle flex justify-between font-semibold text-brand-charcoal">
                <span>Total Amount ({order.paymentMethod}):</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <div className="bg-surface-base min-h-screen py-16 sm:py-24 border-b border-border-subtle">
      <Suspense fallback={<div className="text-center text-xs text-brand-mineral py-12">Loading tracker...</div>}>
        <TrackOrderContent />
      </Suspense>
    </div>
  );
}
