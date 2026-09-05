'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Package, ArrowLeft, ChevronRight, Clock, Loader2, Sparkles } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function AccountOrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/account/orders');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetch('/api/orders')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setOrders(data.orders);
          }
        })
        .catch(console.error)
        .finally(() => setOrdersLoading(false));
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-surface-base">
        <Loader2 className="w-8 h-8 animate-spin text-brand-charcoal/40" />
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] bg-surface-base py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-foreground/60 hover:text-brand-charcoal transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Header */}
        <div className="space-y-1">
          <h1 className="font-serif text-3xl font-light text-brand-charcoal">
            Order History
          </h1>
          <p className="text-xs sm:text-sm text-foreground/60">
            View detailed invoices and live shipment milestones for your VELYRA formulations.
          </p>
        </div>

        {/* Order List */}
        {ordersLoading ? (
          <div className="py-16 bg-surface-elevated border border-border-subtle rounded-sm text-center flex items-center justify-center gap-2 text-xs text-foreground/50">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Retrieving your order records...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 bg-surface-elevated border border-border-subtle rounded-sm text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-surface-muted flex items-center justify-center text-foreground/40">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg text-brand-charcoal font-medium">No Orders Found</h3>
            <p className="text-xs text-foreground/50 max-w-sm mx-auto">
              You haven&apos;t placed any formulation orders yet. Your order history will appear here once purchased.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-brand-charcoal text-white rounded-xs text-xs uppercase tracking-editorial font-medium hover:bg-black transition-colors"
            >
              <span>Explore Formulations</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-surface-elevated border border-border-subtle rounded-sm p-5 sm:p-6 hover:border-brand-charcoal/30 transition-all shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-brand-charcoal tracking-wide">
                      #{order.orderNumber}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-brand-sand/50 text-brand-charcoal">
                      {order.orderStatus}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase ${order.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                      {order.paymentStatus}
                    </span>
                  </div>

                  <div className="text-xs text-foreground/50">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                {/* Items Summary */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="text-xs font-semibold uppercase tracking-wider text-brand-charcoal/70">
                      Formulations ({order.items?.length || 0})
                    </div>
                    <div className="text-xs text-foreground/80">
                      {order.items?.map((item: any) => `${item.productName} × ${item.quantity}`).join(', ')}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0">
                    <div className="text-right">
                      <div className="text-[11px] text-foreground/50 uppercase tracking-wider">Order Total</div>
                      <div className="font-serif text-base font-semibold text-brand-charcoal">
                        {formatPrice(order.total)}
                      </div>
                    </div>

                    <Link
                      href={`/account/orders/${order.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-charcoal text-white rounded-xs text-xs uppercase tracking-editorial font-medium hover:bg-black transition-colors"
                    >
                      <span>View & Track</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
