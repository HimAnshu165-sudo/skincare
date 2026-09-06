'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Package,
  TrendingUp,
  DollarSign,
  Users,
  AlertTriangle,
  RefreshCw,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Truck,
  Box,
  ChevronRight,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface DashboardMetrics {
  totalOrders: number;
  placedOrders: number;
  confirmedOrders: number;
  processingOrders: number;
  packedOrders: number;
  shippedOrders: number;
  outForDeliveryOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  pendingFulfillment: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockProductsCount: number;
  outOfStockProductsCount: number;
  lowStockThreshold: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  total: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  itemsCount: number;
  createdAt: string;
}

interface LowStockItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stockQuantity: number;
  inStock: boolean;
  imageUrl: string;
}

interface RevenueTrendPoint {
  date: string;
  revenue: number;
  orders: number;
}

export default function AdminOverviewPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrendPoint[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const res = await fetch('/api/admin/dashboard');
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics);
        setRevenueTrend(data.revenueTrend || []);
        setRecentOrders(data.recentOrders || []);
        setLowStockProducts(data.lowStockProducts || []);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
      if (isManual) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    // Auto revalidate polling every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PLACED':
        return <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-xs bg-amber-500/10 text-amber-400 border border-amber-500/30">PLACED</span>;
      case 'CONFIRMED':
        return <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-xs bg-blue-500/10 text-blue-400 border border-blue-500/30">CONFIRMED</span>;
      case 'PROCESSING':
        return <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">PROCESSING</span>;
      case 'PACKED':
        return <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-xs bg-purple-500/10 text-purple-400 border border-purple-500/30">PACKED</span>;
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
        return <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-xs bg-teal-500/10 text-teal-400 border border-teal-500/30">SHIPPED</span>;
      case 'DELIVERED':
        return <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">DELIVERED</span>;
      case 'CANCELLED':
        return <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-xs bg-red-500/10 text-red-400 border border-red-500/30">CANCELLED</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-xs bg-neutral-800 text-neutral-400">{status}</span>;
    }
  };

  if (loading && !metrics) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-[#1F1E1B] rounded-sm w-1/4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-[#171614] rounded-sm border border-[#262422]"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262422] pb-6">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-amber-400 font-semibold font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Live PostgreSQL Database Metrics</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#FAF8F5] font-normal mt-1">
            Operations & Revenue Overview
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-[#8C857B] font-mono hidden sm:inline-block">
            Updated {lastRefreshed.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#1A1918] hover:bg-[#252422] border border-[#2E2C29] text-xs font-semibold text-[#FAF8F5] rounded-xs transition-all shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Database'}</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-[#171614] border border-[#262422] rounded-sm p-5 space-y-3 relative overflow-hidden group hover:border-[#383632] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-[#8C857B] font-semibold">Total Revenue</span>
            <div className="p-2 rounded-xs bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-3xl text-[#FAF8F5] font-semibold">
            {formatPrice(metrics?.totalRevenue || 0)}
          </div>
          <div className="text-[11px] text-[#A8A196] flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Today: <strong className="text-[#FAF8F5]">{formatPrice(metrics?.todayRevenue || 0)}</strong></span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-[#171614] border border-[#262422] rounded-sm p-5 space-y-3 relative overflow-hidden group hover:border-[#383632] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-[#8C857B] font-semibold">Total Orders</span>
            <div className="p-2 rounded-xs bg-amber-500/10 text-amber-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-3xl text-[#FAF8F5] font-semibold">
            {metrics?.totalOrders || 0}
          </div>
          <div className="text-[11px] text-[#A8A196] flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Today: <strong className="text-[#FAF8F5]">{metrics?.todayOrders || 0} orders</strong></span>
          </div>
        </div>

        {/* Pending Fulfillment */}
        <div className="bg-[#171614] border border-[#262422] rounded-sm p-5 space-y-3 relative overflow-hidden group hover:border-[#383632] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-[#8C857B] font-semibold">Pending Fulfillment</span>
            <div className="p-2 rounded-xs bg-blue-500/10 text-blue-400">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-3xl text-amber-400 font-semibold">
            {metrics?.pendingFulfillment || 0}
          </div>
          <div className="text-[11px] text-[#A8A196] flex items-center gap-1">
            <span>Delivered: <strong className="text-emerald-400">{metrics?.deliveredOrders || 0}</strong></span>
          </div>
        </div>

        {/* Customers & Catalog */}
        <div className="bg-[#171614] border border-[#262422] rounded-sm p-5 space-y-3 relative overflow-hidden group hover:border-[#383632] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-[#8C857B] font-semibold">Registered Customers</span>
            <div className="p-2 rounded-xs bg-purple-500/10 text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-3xl text-[#FAF8F5] font-semibold">
            {metrics?.totalCustomers || 0}
          </div>
          <div className="text-[11px] text-[#A8A196] flex items-center gap-1">
            <span>Active Products: <strong className="text-[#FAF8F5]">{metrics?.totalProducts || 0}</strong></span>
          </div>
        </div>
      </div>

      {/* Order Status Breakdown Bar */}
      <div className="bg-[#171614] border border-[#262422] rounded-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#FAF8F5]">
            Order Fulfillment Pipeline
          </h2>
          <Link
            href="/admin/orders"
            className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-2">
          {[
            { label: 'Placed', count: metrics?.placedOrders || 0, color: 'text-amber-400', border: 'border-amber-500/20' },
            { label: 'Confirmed', count: metrics?.confirmedOrders || 0, color: 'text-blue-400', border: 'border-blue-500/20' },
            { label: 'Processing', count: metrics?.processingOrders || 0, color: 'text-indigo-400', border: 'border-indigo-500/20' },
            { label: 'Packed', count: metrics?.packedOrders || 0, color: 'text-purple-400', border: 'border-purple-500/20' },
            { label: 'Shipped', count: metrics?.shippedOrders || 0, color: 'text-teal-400', border: 'border-teal-500/20' },
            { label: 'Out for Del.', count: metrics?.outForDeliveryOrders || 0, color: 'text-cyan-400', border: 'border-cyan-500/20' },
            { label: 'Delivered', count: metrics?.deliveredOrders || 0, color: 'text-emerald-400', border: 'border-emerald-500/20' },
            { label: 'Cancelled', count: metrics?.cancelledOrders || 0, color: 'text-red-400', border: 'border-red-500/20' },
          ].map((item) => (
            <div
              key={item.label}
              className={`bg-[#201F1D] border ${item.border} rounded-sm p-3 text-center space-y-1`}
            >
              <div className="text-[10px] uppercase tracking-wider text-[#8C857B] font-semibold truncate">
                {item.label}
              </div>
              <div className={`font-serif text-xl font-bold ${item.color}`}>
                {item.count}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day Trend and Low Stock Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Revenue Trend (2 cols) */}
        <div className="lg:col-span-2 bg-[#171614] border border-[#262422] rounded-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#262422] pb-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#FAF8F5]">
                Recent 7-Day Revenue Trend
              </h2>
              <p className="text-xs text-[#8C857B]">Daily order volume & gross processed revenue</p>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-4">
            {revenueTrend.map((point) => (
              <div
                key={point.date}
                className="bg-[#201F1D] border border-[#2E2C29] p-3 rounded-sm flex flex-col justify-between items-center text-center space-y-2"
              >
                <span className="text-[10px] uppercase font-mono text-[#8C857B] font-semibold">
                  {point.date.split(',')[0]}
                </span>
                <div className="py-2">
                  <div className="text-xs font-bold text-amber-400 font-serif">
                    {formatPrice(point.revenue)}
                  </div>
                  <div className="text-[10px] text-[#A8A196] font-mono mt-0.5">
                    {point.orders} {point.orders === 1 ? 'order' : 'orders'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts (1 col) */}
        <div className="bg-[#171614] border border-[#262422] rounded-sm p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#262422] pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[#FAF8F5]">
                  Inventory Alerts
                </h2>
              </div>
              <Link
                href="/admin/inventory"
                className="text-xs text-amber-400 hover:text-amber-300 font-medium"
              >
                Manage
              </Link>
            </div>

            <div className="space-y-3 pt-3">
              {lowStockProducts.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#8C857B]">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                  All catalog inventory is well-stocked.
                </div>
              ) : (
                lowStockProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between bg-[#201F1D] p-2.5 rounded-sm border border-[#2E2C29]"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-medium text-[#FAF8F5] truncate">{prod.name}</div>
                      <div className="text-[10px] text-[#8C857B] font-mono">{prod.sku}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs font-bold font-mono px-2 py-0.5 rounded-xs ${
                          prod.stockQuantity <= 0
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {prod.stockQuantity <= 0 ? 'OUT OF STOCK' : `${prod.stockQuantity} left`}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            href="/admin/inventory"
            className="w-full text-center py-2 bg-[#201F1D] hover:bg-[#2A2825] border border-[#2E2C29] text-xs font-semibold text-[#FAF8F5] rounded-xs transition-colors mt-4 block"
          >
            Open Inventory Manager &rarr;
          </Link>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-[#171614] border border-[#262422] rounded-sm overflow-hidden">
        <div className="p-6 border-b border-[#262422] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-serif text-[#FAF8F5] font-medium">
              Latest Live Orders
            </h2>
            <p className="text-xs text-[#8C857B]">Real-time incoming customer transactions from PostgreSQL</p>
          </div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold"
          >
            <span>Full Orders Database</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#8C857B] space-y-2">
            <ShoppingBag className="w-8 h-8 text-[#57534E] mx-auto" />
            <p>No customer orders placed yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1F1E1B] text-[10px] uppercase tracking-wider text-[#8C857B] font-semibold border-b border-[#262422]">
                <tr>
                  <th className="p-4">Order ID & Time</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Items</th>
                  <th className="p-4">Amount & Payment</th>
                  <th className="p-4">Fulfillment Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262422]">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#1E1D1B] transition-colors">
                    <td className="p-4">
                      <div className="font-mono font-semibold text-[#FAF8F5]">#{ord.orderNumber}</div>
                      <div className="text-[10px] text-[#8C857B]">
                        {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-medium text-[#FAF8F5]">{ord.customerName}</div>
                      <div className="text-[10px] text-[#8C857B]">{ord.customerPhone}</div>
                    </td>

                    <td className="p-4 text-[#A8A196]">
                      {ord.itemsCount} {ord.itemsCount === 1 ? 'item' : 'items'}
                    </td>

                    <td className="p-4">
                      <div className="font-serif font-bold text-sm text-[#FAF8F5]">
                        {formatPrice(ord.total)}
                      </div>
                      <span className="text-[9px] uppercase font-mono text-amber-400">
                        {ord.paymentMethod} • {ord.paymentStatus}
                      </span>
                    </td>

                    <td className="p-4">{getStatusBadge(ord.orderStatus)}</td>

                    <td className="p-4 text-right">
                      <Link
                        href={`/admin/orders/${ord.id}`}
                        className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold hover:underline"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
