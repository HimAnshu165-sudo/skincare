'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Package,
  MapPin,
  User,
  ShoppingBag,
  ArrowRight,
  LogOut,
  Clock,
  ChevronRight,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function AccountDashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [addressCount, setAddressCount] = useState(0);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [addressesLoading, setAddressesLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/account');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      // Fetch orders independently
      fetch('/api/orders')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setRecentOrders(data.orders.slice(0, 3));
          }
        })
        .catch(console.error)
        .finally(() => setOrdersLoading(false));

      // Fetch addresses independently
      fetch('/api/addresses')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setAddressCount(data.addresses.length);
          }
        })
        .catch(console.error)
        .finally(() => setAddressesLoading(false));
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-surface-base gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-charcoal/40" />
        <span className="text-xs text-foreground/50 font-mono tracking-wider uppercase">Loading account...</span>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] bg-surface-base py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header Profile Bar */}
        <div className="bg-surface-elevated border border-border-subtle p-6 sm:p-8 rounded-sm shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-brand-amber">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Patron</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-light text-brand-charcoal">
              Welcome back, {user.name}
            </h1>
            <p className="text-xs sm:text-sm text-foreground/60">{user.email}</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-brand-charcoal text-white rounded-xs text-xs uppercase tracking-editorial font-medium hover:bg-black transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Shop Formulations</span>
            </Link>
            <button
              onClick={logout}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 border border-border-strong text-foreground/70 rounded-xs text-xs uppercase tracking-editorial font-medium hover:bg-surface-muted hover:text-brand-charcoal transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Link
            href="/account/orders"
            className="group bg-surface-elevated border border-border-subtle p-6 rounded-sm hover:border-brand-charcoal/40 transition-all hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-brand-sand/30 flex items-center justify-center text-brand-charcoal group-hover:scale-105 transition-transform">
                <Package className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-foreground/30 group-hover:text-brand-charcoal transition-colors" />
            </div>
            <h3 className="font-serif text-lg text-brand-charcoal font-medium">My Orders</h3>
            <p className="text-xs text-foreground/60 mt-1">
              {ordersLoading ? 'Loading orders...' : `${recentOrders.length} active/past formulation orders`}
            </p>
          </Link>

          <Link
            href="/account/addresses"
            className="group bg-surface-elevated border border-border-subtle p-6 rounded-sm hover:border-brand-charcoal/40 transition-all hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-brand-sand/30 flex items-center justify-center text-brand-charcoal group-hover:scale-105 transition-transform">
                <MapPin className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-foreground/30 group-hover:text-brand-charcoal transition-colors" />
            </div>
            <h3 className="font-serif text-lg text-brand-charcoal font-medium">Saved Addresses</h3>
            <p className="text-xs text-foreground/60 mt-1">
              {addressesLoading ? 'Loading addresses...' : `${addressCount} saved shipping destination${addressCount === 1 ? '' : 's'}`}
            </p>
          </Link>

          <Link
            href="/account/profile"
            className="group bg-surface-elevated border border-border-subtle p-6 rounded-sm hover:border-brand-charcoal/40 transition-all hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-brand-sand/30 flex items-center justify-center text-brand-charcoal group-hover:scale-105 transition-transform">
                <User className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-foreground/30 group-hover:text-brand-charcoal transition-colors" />
            </div>
            <h3 className="font-serif text-lg text-brand-charcoal font-medium">Profile & Security</h3>
            <p className="text-xs text-foreground/60 mt-1">
              Manage personal details, phone number & password
            </p>
          </Link>
        </div>

        {/* Recent Orders Preview */}
        <div className="bg-surface-elevated border border-border-subtle rounded-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-border-subtle pb-4">
            <div>
              <h2 className="font-serif text-xl font-medium text-brand-charcoal">Recent Formulations</h2>
              <p className="text-xs text-foreground/60 mt-0.5">Track and view invoices for recent shipments</p>
            </div>
            <Link
              href="/account/orders"
              className="inline-flex items-center gap-1 text-xs uppercase tracking-wider font-semibold text-brand-charcoal hover:underline"
            >
              <span>View All Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {ordersLoading ? (
            <div className="py-8 text-center text-xs text-foreground/50 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading recent orders...</span>
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-surface-muted flex items-center justify-center text-foreground/40">
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-sm text-foreground/70 font-medium">No formulation orders yet</p>
              <p className="text-xs text-foreground/50 max-w-sm mx-auto">
                Discover our signature Silk-Air Fluid Sunscreen SPF 50+ and barrier care formulations.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand-charcoal text-white rounded-xs text-xs uppercase tracking-editorial font-medium hover:bg-black transition-colors mt-2"
              >
                <span>Explore Catalogue</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border-subtle">
              {recentOrders.map((order) => (
                <div key={order.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-brand-charcoal">
                        {order.orderNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-brand-sand/40 text-brand-charcoal">
                        {order.orderStatus}
                      </span>
                    </div>
                    <div className="text-xs text-foreground/60">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {order.items?.length || 0} item{order.items?.length === 1 ? '' : 's'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <div className="text-right">
                      <div className="text-xs text-foreground/50">Total</div>
                      <div className="font-serif text-sm font-medium text-brand-charcoal">
                        {formatPrice(order.total)}
                      </div>
                    </div>
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="px-3.5 py-1.5 border border-border-strong text-foreground rounded-xs text-xs font-medium hover:bg-surface-muted transition-colors inline-flex items-center gap-1"
                    >
                      <span>Track Order</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
