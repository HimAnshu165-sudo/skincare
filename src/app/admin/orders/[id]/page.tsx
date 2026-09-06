'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package,
  ChevronLeft,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  CreditCard,
  User,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Send,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface OrderItem {
  id: string;
  productName: string;
  productSku: string | null;
  productSlug: string | null;
  imageUrl: string | null;
  quantity: number;
  price: number;
  volume: string | null;
}

interface PaymentRecord {
  id: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  createdAt: string;
}

interface StatusHistoryItem {
  id: string;
  status: string;
  title: string;
  description: string | null;
  location: string | null;
  createdAt: string;
}

interface OrderDetail {
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
  notes: string | null;
  trackingNumber: string | null;
  courierName: string | null;
  trackingUrl: string | null;
  items: OrderItem[];
  payments: PaymentRecord[];
  statusHistory: StatusHistoryItem[];
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    createdAt: string;
    _count?: { orders: number };
  } | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Status transition form state
  const [newStatus, setNewStatus] = useState<string>('');
  const [newPaymentStatus, setNewPaymentStatus] = useState<string>('');
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [courierName, setCourierName] = useState<string>('Delhivery Express');
  const [trackingUrl, setTrackingUrl] = useState<string>('');
  const [statusTitle, setStatusTitle] = useState<string>('');
  const [statusDescription, setStatusDescription] = useState<string>('');
  const [statusLocation, setStatusLocation] = useState<string>('');

  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${resolvedParams.id}`);
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
        setNewStatus(data.order.orderStatus);
        setNewPaymentStatus(data.order.paymentStatus);
        setTrackingNumber(data.order.trackingNumber || '');
        setCourierName(data.order.courierName || 'Delhivery Express');
        setTrackingUrl(data.order.trackingUrl || '');
      }
    } catch (err) {
      console.error('Error fetching order detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [resolvedParams.id]);

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderStatus: newStatus,
          paymentStatus: newPaymentStatus,
          trackingNumber: trackingNumber.trim() || null,
          courierName: courierName.trim() || null,
          trackingUrl: trackingUrl.trim() || null,
          statusTitle: statusTitle.trim() || undefined,
          statusDescription: statusDescription.trim() || undefined,
          statusLocation: statusLocation.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
        setStatusTitle('');
        setStatusDescription('');
        setStatusLocation('');
        alert('Order updated successfully!');
      } else {
        alert(data.message || 'Failed to update order');
      }
    } catch (err) {
      console.error('Failed to patch order:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin text-amber-400 mx-auto" />
          <p className="text-xs text-[#8C857B]">Loading complete order details from PostgreSQL...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-xl font-serif text-[#FAF8F5]">Order Not Found</h2>
        <p className="text-xs text-[#8C857B]">The requested order could not be located in the database.</p>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1 text-xs text-amber-400 hover:underline"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262422] pb-6">
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 text-xs text-[#8C857B] hover:text-[#FAF8F5] transition-colors mb-2"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Orders List
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl sm:text-3xl text-[#FAF8F5] font-normal">
              Order #{order.orderNumber}
            </h1>
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded-xs ${
                order.paymentStatus === 'PAID'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              {order.orderStatus} • {order.paymentStatus}
            </span>
          </div>
          <div className="text-xs text-[#8C857B] mt-1">
            Placed on{' '}
            {new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`/track-order?query=${order.orderNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#201F1D] hover:bg-[#2A2825] border border-[#2E2C29] text-xs font-medium text-[#FAF8F5] rounded-xs transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            <span>Public Customer Tracker</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Items, Financials, Status History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items Table */}
          <div className="bg-[#171614] border border-[#262422] rounded-sm p-6 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#FAF8F5]">
              Purchased Items ({order.items.length})
            </h2>

            <div className="divide-y divide-[#262422]">
              {order.items.map((item) => (
                <div key={item.id} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 bg-[#201F1D] border border-[#2E2C29] rounded-sm overflow-hidden shrink-0 flex items-center justify-center">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-[#8C857B]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-[#FAF8F5] truncate">
                        {item.productName}
                      </div>
                      <div className="text-[10px] text-[#8C857B] font-mono">
                        SKU: {item.productSku || 'VEL-SKU'} {item.volume ? `• ${item.volume}` : ''}
                      </div>
                      <div className="text-[11px] text-[#A8A196] mt-0.5">
                        Qty: {item.quantity} × {formatPrice(item.price)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-serif font-bold text-sm text-[#FAF8F5] shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="pt-4 border-t border-[#262422] space-y-2 text-xs">
              <div className="flex justify-between text-[#8C857B]">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Coupon Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#8C857B]">
                <span>Shipping Fee</span>
                <span>{order.shippingFee === 0 ? 'Complimentary' : formatPrice(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between text-[#FAF8F5] font-bold text-base pt-2 border-t border-[#262422] font-serif">
                <span>Grand Total</span>
                <span className="text-amber-400">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Chronological Status History */}
          <div className="bg-[#171614] border border-[#262422] rounded-sm p-6 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#FAF8F5]">
              Chronological Audit & Status Timeline
            </h2>

            <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-[#2E2C29]">
              {order.statusHistory.map((entry, idx) => (
                <div key={entry.id || idx} className="flex items-start gap-4 relative pl-8">
                  <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-amber-500 border-2 border-[#171614]"></div>
                  <div className="bg-[#201F1D] border border-[#2E2C29] p-3 rounded-sm flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="text-xs font-semibold text-[#FAF8F5]">{entry.title}</span>
                      <span className="text-[10px] text-[#8C857B] font-mono">
                        {new Date(entry.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {entry.description && (
                      <p className="text-xs text-[#A8A196] mt-1">{entry.description}</p>
                    )}
                    {entry.location && (
                      <div className="text-[10px] text-amber-400 flex items-center gap-1 mt-1 font-mono">
                        <MapPin className="w-3 h-3" /> {entry.location}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Customer Card, Delivery Address, Actions */}
        <div className="space-y-6">
          {/* Status Update Controls */}
          <div className="bg-[#171614] border border-[#262422] rounded-sm p-6 space-y-4 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#FAF8F5] flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Update Fulfillment State</span>
            </h2>

            <form onSubmit={handleUpdateOrder} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#8C857B] font-semibold block mb-1">
                  Order Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-[#201F1D] border border-[#2E2C29] px-3 py-2 text-[#FAF8F5] rounded-xs font-semibold focus:border-amber-400/50"
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
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#8C857B] font-semibold block mb-1">
                  Payment Status
                </label>
                <select
                  value={newPaymentStatus}
                  onChange={(e) => setNewPaymentStatus(e.target.value)}
                  className="w-full bg-[#201F1D] border border-[#2E2C29] px-3 py-2 text-[#FAF8F5] rounded-xs font-semibold focus:border-amber-400/50"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="PAID">PAID</option>
                  <option value="FAILED">FAILED</option>
                  <option value="REFUNDED">REFUNDED</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#8C857B] font-semibold block mb-1">
                  Courier Name
                </label>
                <input
                  type="text"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  placeholder="e.g. Delhivery Express"
                  className="w-full bg-[#201F1D] border border-[#2E2C29] px-3 py-2 text-[#FAF8F5] rounded-xs"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#8C857B] font-semibold block mb-1">
                  AWB Tracking Number
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. DEL-918230198"
                  className="w-full bg-[#201F1D] border border-[#2E2C29] px-3 py-2 text-[#FAF8F5] rounded-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#8C857B] font-semibold block mb-1">
                  Timeline Note / Description (Optional)
                </label>
                <input
                  type="text"
                  value={statusDescription}
                  onChange={(e) => setStatusDescription(e.target.value)}
                  placeholder="e.g. Dispatched from Mumbai fulfillment facility"
                  className="w-full bg-[#201F1D] border border-[#2E2C29] px-3 py-2 text-[#FAF8F5] rounded-xs"
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full py-2.5 bg-amber-500 text-[#11100F] font-semibold text-xs uppercase tracking-wider rounded-xs hover:bg-amber-400 transition-colors shadow-xs"
              >
                {updating ? 'Recording Transaction...' : 'Commit Status Update'}
              </button>
            </form>
          </div>

          {/* Customer Profile Card */}
          <div className="bg-[#171614] border border-[#262422] rounded-sm p-6 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#FAF8F5] flex items-center gap-2">
              <User className="w-4 h-4 text-amber-400" />
              <span>Customer Details</span>
            </h2>

            <div className="space-y-1 text-xs">
              <div className="font-semibold text-[#FAF8F5] text-sm">{order.customerName}</div>
              <div className="text-[#8C857B]">{order.customerEmail}</div>
              <div className="text-[#8C857B] font-mono">{order.customerPhone}</div>
              {order.user && (
                <div className="pt-2 text-[10px] text-amber-400">
                  Registered Account • Total Orders: {order.user._count?.orders || 1}
                </div>
              )}
            </div>
          </div>

          {/* Delivery Address Card */}
          <div className="bg-[#171614] border border-[#262422] rounded-sm p-6 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#FAF8F5] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Shipping Address Snapshot</span>
            </h2>

            <div className="text-xs text-[#B8B0A2] space-y-0.5 leading-relaxed">
              <div className="font-semibold text-[#FAF8F5]">{order.shippingAddress?.fullName || order.customerName}</div>
              <div>{order.shippingAddress?.addressLine1 || order.shippingAddress?.address}</div>
              {order.shippingAddress?.addressLine2 && <div>{order.shippingAddress.addressLine2}</div>}
              <div>
                {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode || order.shippingAddress?.pincode}
              </div>
              <div className="text-[#8C857B] font-mono pt-1">
                Phone: {order.shippingAddress?.phone || order.customerPhone}
              </div>
            </div>
          </div>

          {/* Payment & Gateway Ledger */}
          <div className="bg-[#171614] border border-[#262422] rounded-sm p-6 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#FAF8F5] flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>Payment Details</span>
            </h2>

            <div className="text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#8C857B]">Payment Method</span>
                <span className="text-[#FAF8F5] font-mono font-semibold">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C857B]">Payment Status</span>
                <span className="text-amber-400 font-mono font-semibold">{order.paymentStatus}</span>
              </div>
              {order.payments?.map((pmt) => (
                <div key={pmt.id} className="pt-2 border-t border-[#262422] space-y-1">
                  {pmt.razorpayOrderId && (
                    <div className="text-[10px] text-[#8C857B] font-mono truncate">
                      Razorpay Order: {pmt.razorpayOrderId}
                    </div>
                  )}
                  {pmt.razorpayPaymentId && (
                    <div className="text-[10px] text-[#8C857B] font-mono truncate">
                      Razorpay Payment: {pmt.razorpayPaymentId}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
