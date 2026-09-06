'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Package,
  Search,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Truck,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  Download,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
}

interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: any;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  couponCode: string | null;
  trackingNumber: string | null;
  courierName: string | null;
  itemsCount: number;
  items: OrderItem[];
  createdAt: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filters and search states
  const [search, setSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState('ALL');
  const [paymentStatus, setPaymentStatus] = useState('ALL');
  const [paymentMethod, setPaymentMethod] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  // AWB modal state
  const [awbModalOrder, setAwbModalOrder] = useState<AdminOrder | null>(null);
  const [awbNumber, setAwbNumber] = useState('');
  const [courier, setCourier] = useState('Delhivery Express');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        search,
        orderStatus,
        paymentStatus,
        paymentMethod,
        sortBy,
        sortOrder,
      });

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, orderStatus, paymentStatus, paymentMethod, sortBy, sortOrder]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Quick order status transition handler
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
        );
      } else {
        alert(data.message || 'Failed to update order status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Assign AWB tracking
  const handleAssignTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!awbModalOrder || !awbNumber.trim()) return;

    setUpdatingId(awbModalOrder.id);
    try {
      const res = await fetch(`/api/admin/orders/${awbModalOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingNumber: awbNumber.trim(),
          courierName: courier,
          orderStatus: 'SHIPPED',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === awbModalOrder.id
              ? { ...o, trackingNumber: awbNumber.trim(), courierName: courier, orderStatus: 'SHIPPED' }
              : o
          )
        );
        setAwbModalOrder(null);
        setAwbNumber('');
      } else {
        alert(data.message || 'Failed to assign tracking');
      }
    } catch (err) {
      console.error('Tracking assignment error:', err);
    } finally {
      setUpdatingId(null);
    }
  };

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262422] pb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#FAF8F5] font-normal">
            Orders Management
          </h1>
          <p className="text-xs text-[#8C857B] mt-1">
            Real-time customer transactions & fulfillment pipeline from PostgreSQL
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchOrders()}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#1A1918] hover:bg-[#252422] border border-[#2E2C29] text-xs font-semibold text-[#FAF8F5] rounded-xs transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#171614] border border-[#262422] rounded-sm p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#8C857B]" />
            <input
              type="text"
              placeholder="Search by Order #, Name, Email, Phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#201F1D] border border-[#2E2C29] pl-9 pr-3 py-2 text-xs text-[#FAF8F5] placeholder:text-[#8C857B] rounded-xs focus:outline-none focus:border-amber-400/50"
            />
          </div>

          {/* Order Status */}
          <div>
            <select
              value={orderStatus}
              onChange={(e) => {
                setOrderStatus(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#201F1D] border border-[#2E2C29] px-3 py-2 text-xs text-[#FAF8F5] rounded-xs focus:outline-none focus:border-amber-400/50"
            >
              <option value="ALL">All Order Statuses</option>
              <option value="PLACED">Placed</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PROCESSING">Processing</option>
              <option value="PACKED">Packed</option>
              <option value="SHIPPED">Shipped</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Payment Status */}
          <div>
            <select
              value={paymentStatus}
              onChange={(e) => {
                setPaymentStatus(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#201F1D] border border-[#2E2C29] px-3 py-2 text-xs text-[#FAF8F5] rounded-xs focus:outline-none focus:border-amber-400/50"
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <select
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#201F1D] border border-[#2E2C29] px-3 py-2 text-xs text-[#FAF8F5] rounded-xs focus:outline-none focus:border-amber-400/50"
            >
              <option value="ALL">All Payment Modes</option>
              <option value="ONLINE">Online (Razorpay)</option>
              <option value="COD">Cash on Delivery (COD)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#171614] border border-[#262422] rounded-sm overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-16 text-center text-xs text-[#8C857B] space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-400" />
            <p>Loading database orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center text-xs text-[#8C857B] space-y-2">
            <Package className="w-8 h-8 text-[#57534E] mx-auto" />
            <p className="text-sm font-medium text-[#FAF8F5]">No matching orders found.</p>
            <p>Try clearing filters or search parameters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1F1E1B] text-[10px] uppercase tracking-wider text-[#8C857B] font-semibold border-b border-[#262422]">
                <tr>
                  <th className="p-4">Order Details</th>
                  <th className="p-4">Customer & City</th>
                  <th className="p-4">Items</th>
                  <th className="p-4">Financials</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Order Status</th>
                  <th className="p-4">Tracking / AWB</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262422]">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#1E1D1B] transition-colors">
                    {/* Order ID & Date */}
                    <td className="p-4">
                      <Link
                        href={`/admin/orders/${ord.id}`}
                        className="font-mono font-bold text-amber-400 hover:underline block"
                      >
                        #{ord.orderNumber}
                      </Link>
                      <div className="text-[10px] text-[#8C857B] mt-0.5">
                        {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>

                    {/* Customer Info */}
                    <td className="p-4">
                      <div className="font-semibold text-[#FAF8F5]">{ord.customerName}</div>
                      <div className="text-[10px] text-[#8C857B]">{ord.customerEmail}</div>
                      <div className="text-[10px] text-[#8C857B]">
                        {ord.shippingAddress?.city || 'N/A'}, {ord.shippingAddress?.state || ''}
                      </div>
                    </td>

                    {/* Items */}
                    <td className="p-4">
                      <div className="font-medium text-[#FAF8F5]">
                        {ord.itemsCount} {ord.itemsCount === 1 ? 'item' : 'items'}
                      </div>
                      <div className="text-[10px] text-[#8C857B] line-clamp-1 max-w-[180px]">
                        {ord.items?.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                      </div>
                    </td>

                    {/* Financials */}
                    <td className="p-4">
                      <div className="font-serif font-bold text-sm text-[#FAF8F5]">
                        {formatPrice(ord.total)}
                      </div>
                      {ord.discount > 0 && (
                        <div className="text-[10px] text-emerald-400">
                          Disc: -{formatPrice(ord.discount)}
                        </div>
                      )}
                    </td>

                    {/* Payment Mode & Status */}
                    <td className="p-4">
                      <span
                        className={`inline-block text-[9px] uppercase font-bold font-mono px-1.5 py-0.5 rounded-xs ${
                          ord.paymentStatus === 'PAID'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : ord.paymentStatus === 'PENDING'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {ord.paymentMethod} • {ord.paymentStatus}
                      </span>
                    </td>

                    {/* Order Status Select */}
                    <td className="p-4">
                      <select
                        value={ord.orderStatus}
                        disabled={updatingId === ord.id}
                        onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                        className="bg-[#201F1D] border border-[#2E2C29] px-2 py-1 text-xs font-semibold text-[#FAF8F5] rounded-xs focus:outline-none focus:border-amber-400/50 cursor-pointer"
                      >
                        <option value="PLACED">PLACED</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="PACKED">PACKED</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>

                    {/* Tracking AWB */}
                    <td className="p-4">
                      {ord.trackingNumber ? (
                        <div>
                          <span className="font-mono text-xs text-[#FAF8F5] block font-semibold">
                            {ord.trackingNumber}
                          </span>
                          <span className="text-[10px] text-[#8C857B]">
                            {ord.courierName || 'Delhivery'}
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setAwbModalOrder(ord);
                            setAwbNumber('');
                          }}
                          className="text-[11px] text-amber-400 font-semibold hover:underline"
                        >
                          + Assign AWB
                        </button>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right space-x-2">
                      <Link
                        href={`/admin/orders/${ord.id}`}
                        className="inline-flex items-center px-2.5 py-1 bg-[#201F1D] hover:bg-[#2A2825] border border-[#2E2C29] text-xs font-semibold text-[#FAF8F5] rounded-xs transition-colors"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Server Pagination */}
        <div className="p-4 bg-[#1F1E1B] border-t border-[#262422] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8C857B]">
          <div>
            Showing <strong className="text-[#FAF8F5]">{orders.length}</strong> of{' '}
            <strong className="text-[#FAF8F5]">{pagination.total}</strong> total orders
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 bg-[#201F1D] disabled:opacity-40 border border-[#2E2C29] rounded-xs text-[#FAF8F5] hover:bg-[#2A2825] transition-colors"
            >
              Previous
            </button>
            <span className="px-2 text-xs font-mono text-[#FAF8F5]">
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="px-3 py-1.5 bg-[#201F1D] disabled:opacity-40 border border-[#2E2C29] rounded-xs text-[#FAF8F5] hover:bg-[#2A2825] transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Assign AWB Modal */}
      {awbModalOrder && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#171614] border border-[#262422] rounded-sm max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h2 className="font-serif text-lg text-[#FAF8F5]">
              Assign Shipping AWB & Dispatch
            </h2>
            <p className="text-xs text-[#8C857B]">
              Order <strong className="text-amber-400">#{awbModalOrder.orderNumber}</strong> for{' '}
              <strong className="text-[#FAF8F5]">{awbModalOrder.customerName}</strong>
            </p>

            <form onSubmit={handleAssignTracking} className="space-y-4">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#8C857B] font-semibold block mb-1">
                  Courier Express Partner
                </label>
                <select
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
                  className="w-full bg-[#201F1D] border border-[#2E2C29] px-3 py-2 text-xs text-[#FAF8F5] rounded-xs"
                >
                  <option value="Delhivery Express">Delhivery Express</option>
                  <option value="Blue Dart Express">Blue Dart Express</option>
                  <option value="DTDC Premium">DTDC Premium</option>
                  <option value="Ecom Express">Ecom Express</option>
                  <option value="Shadowfax">Shadowfax</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#8C857B] font-semibold block mb-1">
                  Air Waybill (AWB) / Tracking Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. DEL-98234190823"
                  value={awbNumber}
                  onChange={(e) => setAwbNumber(e.target.value)}
                  required
                  className="w-full bg-[#201F1D] border border-[#2E2C29] px-3 py-2 text-xs text-[#FAF8F5] rounded-xs font-mono"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAwbModalOrder(null)}
                  className="flex-1 py-2 bg-[#201F1D] border border-[#2E2C29] text-xs text-[#FAF8F5] rounded-xs hover:bg-[#2A2825]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingId === awbModalOrder.id}
                  className="flex-1 py-2 bg-amber-500 text-[#11100F] text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-amber-400"
                >
                  {updatingId === awbModalOrder.id ? 'Updating...' : 'Assign & Mark Shipped'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
