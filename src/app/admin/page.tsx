'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Truck, CheckCircle2, Clock, Search, RefreshCw, Shield, AlertCircle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Order } from '@/types';

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (e) {
      console.error('Error fetching admin orders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, orderStatus: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus as any } : o))
        );
      }
    } catch (e) {
      console.error('Failed to update status', e);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAssignTracking = async (orderId: string, trackingNumber: string, courierName: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, trackingNumber, courierName, orderStatus: 'SHIPPED' }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? { ...o, trackingNumber, courierName, orderStatus: 'SHIPPED' as any }
              : o
          )
        );
      }
    } catch (e) {
      console.error('Failed to update tracking', e);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = filterStatus === 'ALL' || o.orderStatus === filterStatus;
    const matchesSearch =
      !searchTerm ||
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerPhone.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'PAID' || o.orderStatus === 'DELIVERED' ? o.total : 0), 0);
  const pendingFulfillment = orders.filter((o) => o.orderStatus === 'PLACED' || o.orderStatus === 'CONFIRMED' || o.orderStatus === 'PROCESSING').length;

  return (
    <div className="bg-surface-base min-h-screen py-12 sm:py-16 border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-brand-amber font-semibold">
              <Shield className="w-3.5 h-3.5" />
              <span>Operations Portal</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-brand-charcoal font-normal mt-1">
              VELYRA Order Fulfillment Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/media"
              className="inline-flex items-center gap-2 bg-brand-charcoal text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-brand-mineral transition-colors shadow-xs"
            >
              <span>Blob Media Library</span>
            </Link>
            <Link
              href="/admin/products/prod_sunscreen_01/images"
              className="inline-flex items-center gap-2 bg-surface-elevated border border-border-subtle px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-surface-muted transition-colors text-brand-charcoal"
            >
              <span>Sunscreen Gallery</span>
            </Link>
            <button
              onClick={fetchOrders}
              className="inline-flex items-center gap-2 bg-surface-elevated border border-border-subtle px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-surface-muted transition-colors text-brand-charcoal"
            >
              <RefreshCw className="w-3.5 h-3.5 text-brand-mineral" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="bg-surface-elevated p-6 rounded-sm border border-border-subtle shadow-sm space-y-1">
            <span className="text-xs uppercase tracking-wider text-brand-mineral font-semibold">Total Orders</span>
            <div className="font-serif text-3xl text-brand-charcoal font-semibold">{orders.length}</div>
          </div>
          <div className="bg-surface-elevated p-6 rounded-sm border border-border-subtle shadow-sm space-y-1">
            <span className="text-xs uppercase tracking-wider text-brand-mineral font-semibold">Pending Fulfillment</span>
            <div className="font-serif text-3xl text-brand-amber font-semibold">{pendingFulfillment}</div>
          </div>
          <div className="bg-surface-elevated p-6 rounded-sm border border-border-subtle shadow-sm space-y-1">
            <span className="text-xs uppercase tracking-wider text-brand-mineral font-semibold">Processed Revenue</span>
            <div className="font-serif text-3xl text-brand-charcoal font-semibold">{formatPrice(totalRevenue)}</div>
          </div>
          <div className="bg-surface-elevated p-6 rounded-sm border border-border-subtle shadow-sm space-y-1">
            <span className="text-xs uppercase tracking-wider text-brand-mineral font-semibold">Catalog Stock</span>
            <div className="font-serif text-3xl text-emerald-800 font-semibold">In Stock (Active)</div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-surface-elevated p-4 rounded-sm border border-border-subtle">
          <div className="flex items-center gap-2 flex-wrap">
            {['ALL', 'PLACED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xs text-[11px] font-semibold uppercase tracking-wider transition-all ${
                  filterStatus === st
                    ? 'bg-brand-charcoal text-white shadow-xs'
                    : 'bg-surface-muted text-brand-mineral hover:text-brand-charcoal'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-brand-mineral" />
            <input
              type="text"
              placeholder="Search Order # or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-muted border border-border-subtle pl-9 pr-3 py-2 text-xs text-brand-charcoal placeholder:text-brand-mineral rounded-xs focus:outline-none focus:border-brand-charcoal"
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-surface-elevated rounded-sm border border-border-subtle shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-brand-mineral">
              Loading active customer orders...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Package className="w-8 h-8 text-brand-mineral mx-auto" />
              <h3 className="font-serif text-base text-brand-charcoal">No orders match the selected filter.</h3>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-muted border-b border-border-subtle text-[11px] uppercase tracking-wider text-brand-mineral font-semibold">
                  <tr>
                    <th className="p-4">Order ID & Date</th>
                    <th className="p-4">Customer & City</th>
                    <th className="p-4">Items</th>
                    <th className="p-4">Amount & Mode</th>
                    <th className="p-4">Fulfillment Status</th>
                    <th className="p-4">Tracking / AWB</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-surface-muted/50 transition-colors">
                      <td className="p-4 font-medium text-brand-charcoal">
                        <div className="font-semibold text-brand-charcoal">#{ord.orderNumber}</div>
                        <div className="text-[10px] text-brand-mineral">
                          {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-medium text-brand-charcoal">{ord.customerName}</div>
                        <div className="text-[11px] text-brand-mineral">{ord.customerPhone}</div>
                        <div className="text-[10px] text-brand-mineral">
                          {ord.shippingAddress?.city}, {ord.shippingAddress?.state}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="space-y-0.5">
                          {ord.items?.map((item, i) => (
                            <div key={i} className="text-[11px] text-brand-charcoal">
                              {item.quantity}x {item.productName}
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-brand-charcoal font-serif text-sm">
                          {formatPrice(ord.total)}
                        </div>
                        <span
                          className={`inline-block text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-xs mt-0.5 ${
                            ord.paymentMethod === 'COD'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {ord.paymentMethod} • {ord.paymentStatus}
                        </span>
                      </td>

                      <td className="p-4">
                        <select
                          value={ord.orderStatus}
                          disabled={updatingId === ord.id}
                          onChange={(e) => handleStatusUpdate(ord.id, e.target.value)}
                          className="bg-surface-muted border border-border-subtle px-2.5 py-1.5 rounded-xs text-xs font-semibold text-brand-charcoal focus:outline-none focus:border-brand-charcoal cursor-pointer"
                        >
                          <option value="PLACED">PLACED</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>

                      <td className="p-4">
                        {ord.trackingNumber ? (
                          <div>
                            <span className="font-mono text-xs text-brand-charcoal block">{ord.trackingNumber}</span>
                            <span className="text-[10px] text-brand-mineral">{ord.courierName || 'Delhivery Express'}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              const tracking = prompt('Enter Delhivery / Bluedart AWB Tracking Number:');
                              if (tracking) {
                                handleAssignTracking(ord.id, tracking, 'Delhivery Express');
                              }
                            }}
                            className="text-xs text-brand-amber font-semibold hover:underline"
                          >
                            + Assign AWB Tracking
                          </button>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <a
                          href={`/track-order?query=${ord.orderNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-brand-mineral hover:text-brand-charcoal font-medium hover:underline"
                        >
                          Public Tracker &rarr;
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
