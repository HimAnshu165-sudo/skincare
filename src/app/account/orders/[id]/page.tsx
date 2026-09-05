'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function OrderDetailsPage() {
  const routeParams = useParams();
  const orderId = (routeParams?.id as string) || '';
  const { user, loading } = useAuth();
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=/account/orders/${orderId}`);
    }
  }, [user, loading, router, orderId]);

  useEffect(() => {
    if (orderId) {
      fetch(`/api/orders/${orderId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(res.status === 404 ? 'Order not found or unauthorized.' : 'Failed to fetch order.');
          }
          return res.json();
        })
        .then((data) => {
          if (data.success && data.order) {
            setOrder(data.order);
          } else {
            setError(data.message || 'Unable to load order details.');
          }
        })
        .catch((err) => {
          setError(err.message || 'Error retrieving order.');
        })
        .finally(() => setFetchLoading(false));
    }
  }, [orderId]);

  if (loading || fetchLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-surface-base">
        <Loader2 className="w-8 h-8 animate-spin text-brand-charcoal/40" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-surface-base px-4">
        <div className="max-w-md w-full bg-surface-elevated border border-border-subtle p-8 rounded-sm text-center space-y-4">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
          <h2 className="font-serif text-xl font-medium text-brand-charcoal">Access Restricted</h2>
          <p className="text-xs text-foreground/60">
            {error || 'This order does not belong to your account or could not be found.'}
          </p>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand-charcoal text-white rounded-xs text-xs uppercase tracking-editorial font-medium hover:bg-black transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Orders</span>
          </Link>
        </div>
      </div>
    );
  }

  const shipping = order.shippingAddress || {};
  const statusHistory = order.statusHistory || [];

  return (
    <div className="min-h-[85vh] bg-surface-base py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-foreground/60 hover:text-brand-charcoal transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Orders</span>
          </Link>
        </div>

        {/* Order Header Summary */}
        <div className="bg-surface-elevated border border-border-subtle p-6 sm:p-8 rounded-sm shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xl sm:text-2xl font-bold text-brand-charcoal">
                #{order.orderNumber}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-brand-sand/50 text-brand-charcoal">
                {order.orderStatus}
              </span>
            </div>
            <p className="text-xs text-foreground/60">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-xs text-foreground/50 uppercase tracking-wider">Grand Total</div>
            <div className="font-serif text-2xl font-semibold text-brand-charcoal">
              {formatPrice(order.total)}
            </div>
            <div className="text-xs text-foreground/60 mt-0.5">
              Payment Status:{' '}
              <span className={`font-semibold ${order.paymentStatus === 'PAID' ? 'text-emerald-700' : 'text-amber-700'}`}>
                {order.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Items & Tracking Timeline */}
          <div className="lg:col-span-2 space-y-8">
            {/* Items Ordered Snapshot */}
            <div className="bg-surface-elevated border border-border-subtle rounded-sm p-6 space-y-6">
              <h2 className="font-serif text-lg font-medium text-brand-charcoal border-b border-border-subtle pb-3">
                Purchased Formulations ({order.items?.length || 0})
              </h2>

              <div className="divide-y divide-border-subtle">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 bg-surface-muted rounded-xs overflow-hidden flex-shrink-0 border border-border-subtle">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.productName}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-foreground/30 m-auto" />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-medium text-brand-charcoal">{item.productName}</h4>
                        {item.volume && <p className="text-xs text-foreground/50">{item.volume}</p>}
                        <p className="text-xs text-foreground/70">Qty: {item.quantity}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-semibold text-brand-charcoal">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      {item.quantity > 1 && (
                        <div className="text-[11px] text-foreground/40">
                          {formatPrice(item.price)} each
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tracking Status History */}
            <div className="bg-surface-elevated border border-border-subtle rounded-sm p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <h2 className="font-serif text-lg font-medium text-brand-charcoal">
                  Shipment & Milestone Tracking
                </h2>
                {order.trackingNumber && (
                  <span className="font-mono text-xs font-semibold text-brand-charcoal">
                    AWB: {order.trackingNumber}
                  </span>
                )}
              </div>

              {order.courierName && (
                <div className="p-3.5 bg-surface-muted rounded-xs flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-brand-charcoal/70" />
                    <span>Courier Partner: <strong className="text-brand-charcoal">{order.courierName}</strong></span>
                  </div>
                  {order.trackingUrl && (
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-brand-charcoal font-medium hover:underline"
                    >
                      <span>Track on Partner Site</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}

              {/* Vertical Timeline */}
              <div className="space-y-6 pt-2">
                {statusHistory.length === 0 ? (
                  <div className="text-xs text-foreground/50">Tracking initiated. Processing with fulfillment center.</div>
                ) : (
                  statusHistory.map((sh: any, index: number) => {
                    const isLast = index === statusHistory.length - 1;
                    return (
                      <div key={sh.id} className="relative flex gap-4">
                        {/* Timeline line */}
                        {!isLast && (
                          <div className="absolute left-3.5 top-8 bottom-0 w-0.5 bg-border-strong -translate-x-1/2" />
                        )}
                        <div className="w-7 h-7 rounded-full bg-brand-charcoal text-white flex items-center justify-center flex-shrink-0 z-10 shadow-sm">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div className="space-y-1 pb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-brand-charcoal">{sh.title}</span>
                            <span className="text-[11px] text-foreground/50">
                              {new Date(sh.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          {sh.description && (
                            <p className="text-xs text-foreground/70 leading-relaxed">{sh.description}</p>
                          )}
                          {sh.location && (
                            <p className="text-[11px] text-foreground/50">📍 {sh.location}</p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Col: Address & Invoice Breakdown */}
          <div className="space-y-8">
            {/* Delivery Address Snapshot */}
            <div className="bg-surface-elevated border border-border-subtle rounded-sm p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
                <MapPin className="w-4 h-4 text-brand-charcoal/70" />
                <h3 className="font-serif text-base font-medium text-brand-charcoal">Delivery Address</h3>
              </div>
              <div className="text-xs text-foreground/80 space-y-1 leading-relaxed">
                <p className="font-semibold text-brand-charcoal">{shipping.fullName || order.customerName}</p>
                <p>{shipping.addressLine1}</p>
                {shipping.addressLine2 && <p>{shipping.addressLine2}</p>}
                <p>
                  {shipping.city}, {shipping.state} — {shipping.postalCode}
                </p>
                <p>{shipping.country || 'India'}</p>
                <p className="pt-2 text-foreground/60">Phone: {shipping.phone || order.customerPhone}</p>
                <p className="text-foreground/60">Email: {order.customerEmail}</p>
              </div>
            </div>

            {/* Payment & Invoice Breakdown */}
            <div className="bg-surface-elevated border border-border-subtle rounded-sm p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
                <CreditCard className="w-4 h-4 text-brand-charcoal/70" />
                <h3 className="font-serif text-base font-medium text-brand-charcoal">Payment & Totals</h3>
              </div>

              <div className="space-y-2.5 text-xs text-foreground/80 border-b border-border-subtle pb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span>{order.shippingFee === 0 ? 'Complimentary' : formatPrice(order.shippingFee)}</span>
                </div>
              </div>

              <div className="flex justify-between text-sm font-semibold text-brand-charcoal pt-1">
                <span>Total Paid</span>
                <span>{formatPrice(order.total)}</span>
              </div>

              <div className="p-3 bg-surface-muted rounded-xs text-[11px] text-foreground/70 space-y-1">
                <p>Payment Method: <strong>{order.paymentMethod === 'ONLINE' ? 'Razorpay Secure Online' : 'Cash on Delivery (COD)'}</strong></p>
                {order.razorpayPaymentId && (
                  <p className="font-mono text-[10px]">Ref: {order.razorpayPaymentId}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
