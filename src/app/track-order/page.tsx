'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Search,
  Truck,
  CheckCircle2,
  Package,
  MapPin,
  AlertCircle,
  Lock,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Order } from '@/types';

function TrackOrderContent() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('query') || searchParams.get('order') || '';

  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [error, setError] = useState<string | null>(null);

  // Fetch only the authenticated user's orders from server-side verified session
  useEffect(() => {
    if (!authLoading && user) {
      setOrdersLoading(true);
      setError(null);
      fetch('/api/orders')
        .then((res) => {
          if (!res.ok) throw new Error('Failed to retrieve your order records.');
          return res.json();
        })
        .then((data) => {
          if (data.success && Array.isArray(data.orders)) {
            setUserOrders(data.orders);
            if (data.orders.length > 0) {
              if (initialQuery) {
                const matched = data.orders.find(
                  (o: Order) =>
                    o.orderNumber.toLowerCase() === initialQuery.toLowerCase() ||
                    o.id === initialQuery
                );
                setSelectedOrder(matched || data.orders[0]);
              } else {
                setSelectedOrder(data.orders[0]);
              }
            }
          }
        })
        .catch((err) => {
          console.error('Error fetching user orders:', err);
          setError('Unable to load your orders. Please try refreshing.');
        })
        .finally(() => {
          setOrdersLoading(false);
        });
    } else if (!authLoading && !user) {
      setOrdersLoading(false);
    }
  }, [user, authLoading, initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const trimmed = searchQuery.trim().toLowerCase();
    const matched = userOrders.find(
      (o) =>
        o.orderNumber.toLowerCase() === trimmed ||
        o.id.toLowerCase() === trimmed ||
        (o.trackingNumber && o.trackingNumber.toLowerCase() === trimmed)
    );

    if (matched) {
      setSelectedOrder(matched);
      setError(null);
    } else {
      setError(`No order matching "${searchQuery}" was found in your account.`);
    }
  };

  const steps = [
    { key: 'PLACED', label: 'Order Placed', desc: 'Received & verified' },
    { key: 'CONFIRMED', label: 'Confirmed', desc: 'Batch allocated' },
    { key: 'PROCESSING', label: 'Processing', desc: 'Prepared in cleanroom' },
    { key: 'SHIPPED', label: 'Dispatched', desc: 'In express transit' },
    { key: 'DELIVERED', label: 'Delivered', desc: 'Handed over at doorstep' },
  ];

  const getStepIndex = (status: string) => {
    const idx = steps.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  // State 1: Auth checking state
  if (authLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-charcoal/40" />
        <span className="text-xs text-foreground/50 tracking-wide uppercase">Verifying session...</span>
      </div>
    );
  }

  // State 2: Unauthenticated state — Strict access gate
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-8 animate-fade-in">
        <div className="bg-surface-elevated border border-border-subtle rounded-sm p-8 sm:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.03)] text-center space-y-6">
          <div className="w-12 h-12 rounded-full bg-surface-muted border border-border-subtle flex items-center justify-center mx-auto text-brand-charcoal">
            <Lock className="w-5 h-5" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-widest text-brand-amber font-semibold">
              Authenticated Access Only
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl text-brand-charcoal font-normal">
              Sign In to Track Orders
            </h1>
            <p className="text-xs text-foreground/60 leading-relaxed max-w-sm mx-auto">
              To safeguard your shipment status, delivery address, and contact information, live order tracking is reserved exclusively for authenticated customers.
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <Link
              href="/login?redirect=/track-order"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-charcoal text-white rounded-xs text-xs uppercase tracking-editorial font-medium hover:bg-black transition-colors"
            >
              <span>Sign In to Track Your Order</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <div className="text-center pt-2">
              <Link
                href="/signup"
                className="text-xs text-foreground/50 hover:text-brand-charcoal transition-colors underline underline-offset-4"
              >
                New customer? Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // State 3: Authenticated user with orders
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs uppercase tracking-widest text-brand-amber font-semibold">
          Order Status Concierge
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-brand-charcoal font-normal">
          Track Your VELYRA Orders
        </h1>
        <p className="text-xs sm:text-sm text-foreground/60 max-w-md mx-auto">
          Logged in as <strong className="text-brand-charcoal">{user.name}</strong> ({user.email}). Displaying your verified formulation orders.
        </p>
      </div>

      {ordersLoading ? (
        <div className="py-16 bg-surface-elevated border border-border-subtle rounded-sm text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-brand-charcoal/50" />
          <span className="text-xs text-foreground/50 tracking-wide">Retrieving your verified shipments...</span>
        </div>
      ) : userOrders.length === 0 ? (
        <div className="bg-surface-elevated border border-border-subtle rounded-sm p-10 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 mx-auto rounded-full bg-surface-muted flex items-center justify-center text-foreground/40">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl text-brand-charcoal font-medium">No Orders Placed Yet</h3>
          <p className="text-xs text-foreground/60 max-w-sm mx-auto">
            You currently have no formulation shipments to track. Once you place an order, live tracking and milestone updates will appear here automatically.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-charcoal text-white rounded-xs text-xs uppercase tracking-editorial font-medium hover:bg-black transition-colors mt-2"
          >
            <span>Explore Formulations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Order Selector and Search Bar */}
          <div className="bg-surface-elevated p-4 rounded-sm border border-border-subtle shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground/60 mr-1">
                  Your Orders:
                </span>
                {userOrders.map((ord) => {
                  const isSelected = selectedOrder?.id === ord.id;
                  return (
                    <button
                      key={ord.id}
                      onClick={() => {
                        setSelectedOrder(ord);
                        setError(null);
                      }}
                      className={`px-3 py-1.5 rounded-xs text-xs font-mono transition-all ${
                        isSelected
                          ? 'bg-brand-charcoal text-white font-bold shadow-xs'
                          : 'bg-surface-muted text-foreground/70 hover:text-brand-charcoal border border-border-subtle'
                      }`}
                    >
                      #{ord.orderNumber}
                    </button>
                  );
                })}
              </div>

              {/* Quick filter within own orders */}
              {userOrders.length > 2 && (
                <form onSubmit={handleSearch} className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Search Order Number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-surface-base border border-border-subtle px-3 py-1.5 text-xs text-brand-charcoal placeholder:text-foreground/40 rounded-xs focus:outline-none focus:border-brand-charcoal"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-surface-muted hover:bg-brand-charcoal hover:text-white transition-colors text-xs font-medium rounded-xs border border-border-subtle"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xs flex items-center gap-3 text-red-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Detailed Shipment Card */}
          {selectedOrder && (
            <div className="bg-surface-elevated rounded-sm border border-border-subtle shadow-sm p-6 sm:p-10 space-y-8 animate-fade-in">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-6">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-foreground/50 block font-semibold">
                    Order Reference
                  </span>
                  <span className="font-mono text-2xl font-bold text-brand-charcoal">
                    #{selectedOrder.orderNumber}
                  </span>
                  <p className="text-[11px] text-foreground/50 mt-0.5">
                    Placed on {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-left sm:text-right">
                    <span className="text-[11px] uppercase tracking-wider text-foreground/50 block font-semibold">
                      Current Milestone
                    </span>
                    <span className="inline-block bg-brand-charcoal text-white px-3 py-1 rounded-xs text-xs font-semibold uppercase tracking-wider mt-0.5">
                      {selectedOrder.orderStatus}
                    </span>
                  </div>

                  <Link
                    href={`/account/orders/${selectedOrder.id}`}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 border border-border-subtle text-foreground/70 hover:text-brand-charcoal hover:border-brand-charcoal transition-colors rounded-xs text-xs font-medium uppercase tracking-wider ml-2"
                  >
                    <span>Full Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Visual Stepper */}
              <div className="py-4">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 sm:gap-2 relative">
                  {steps.map((step, idx) => {
                    const currentIdx = getStepIndex(selectedOrder.orderStatus);
                    const isDone = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <div key={step.key} className="flex flex-col items-center text-center space-y-2 relative">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold z-10 transition-colors ${
                            isDone
                              ? 'bg-brand-charcoal text-white shadow-xs'
                              : 'bg-surface-muted text-foreground/40 border border-border-subtle'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-4 h-4 text-brand-amber" /> : idx + 1}
                        </div>

                        <div className="space-y-0.5">
                          <span
                            className={`text-xs font-semibold uppercase tracking-wider block ${
                              isCurrent ? 'text-brand-charcoal font-bold' : isDone ? 'text-brand-charcoal' : 'text-foreground/40'
                            }`}
                          >
                            {step.label}
                          </span>
                          <span className="text-[10px] text-foreground/50 block leading-tight">
                            {step.desc}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Courier & Tracking Details */}
              {selectedOrder.trackingNumber ? (
                <div className="bg-surface-muted p-4 rounded-xs border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-brand-amber" />
                    <div>
                      <span className="text-foreground/60">Courier Partner: </span>
                      <strong className="text-brand-charcoal font-semibold">
                        {selectedOrder.courierName || 'Express Logistics Partner'}
                      </strong>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-foreground/60">AWB Number: </span>
                      <strong className="text-brand-charcoal font-mono">{selectedOrder.trackingNumber}</strong>
                    </div>
                    {selectedOrder.trackingUrl && (
                      <a
                        href={selectedOrder.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-brand-charcoal font-medium hover:underline text-xs"
                      >
                        <span>External Tracking</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-surface-muted/60 rounded-xs text-xs text-foreground/60 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-foreground/40" />
                  <span>Tracking number will be assigned once dispatched by our fulfillment center.</span>
                </div>
              )}

              {/* Destination Address & Items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4 border-t border-border-subtle text-xs text-foreground/70">
                <div>
                  <strong className="text-brand-charcoal uppercase tracking-wider text-[11px] block mb-1">
                    Delivery Destination:
                  </strong>
                  <p className="text-brand-charcoal font-medium">{selectedOrder.customerName}</p>
                  <p>{selectedOrder.shippingAddress?.addressLine1 || selectedOrder.shippingAddress?.address}</p>
                  {(selectedOrder.shippingAddress?.addressLine2 || selectedOrder.shippingAddress?.apartment) && (
                    <p>{selectedOrder.shippingAddress?.addressLine2 || selectedOrder.shippingAddress?.apartment}</p>
                  )}
                  <p>
                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} —{' '}
                    {selectedOrder.shippingAddress?.postalCode || selectedOrder.shippingAddress?.pincode}
                  </p>
                </div>

                <div>
                  <strong className="text-brand-charcoal uppercase tracking-wider text-[11px] block mb-1">
                    Ordered Formulations:
                  </strong>
                  <ul className="space-y-1.5">
                    {selectedOrder.items?.map((item: any, i: number) => (
                      <li key={i} className="flex justify-between text-brand-charcoal">
                        <span>{item.quantity}× {item.productName}</span>
                        <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2 mt-2 border-t border-border-subtle flex justify-between font-semibold text-brand-charcoal text-sm">
                    <span>Total Amount ({selectedOrder.paymentMethod}):</span>
                    <span>{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Action */}
              <div className="pt-4 border-t border-border-subtle flex justify-between items-center text-xs">
                <span className="text-foreground/50">
                  Payment Status: <strong className="text-brand-charcoal">{selectedOrder.paymentStatus}</strong>
                </span>
                <Link
                  href={`/account/orders/${selectedOrder.id}`}
                  className="inline-flex items-center gap-1 text-brand-charcoal font-medium hover:underline"
                >
                  <span>View Full Order Details & Invoice</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <div className="bg-surface-base min-h-screen py-16 sm:py-24 border-b border-border-subtle">
      <Suspense fallback={<div className="text-center text-xs text-foreground/50 py-12">Loading tracker...</div>}>
        <TrackOrderContent />
      </Suspense>
    </div>
  );
}
