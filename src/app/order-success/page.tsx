'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { CheckCircle2, Truck, Package, MessageCircle, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Order } from '@/types';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const orderNumberParam = searchParams.get('orderNumber');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fire festive luxury gold/sand confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#C9944D', '#1A1918', '#FAF8F5', '#485246'],
    });

    // Fetch order details
    const fetchOrder = async () => {
      if (!orderId && !orderNumberParam) {
        setLoading(false);
        return;
      }
      try {
        const query = orderNumberParam || orderId;
        const res = await fetch(`/api/orders/${query}`);
        const data = await res.json();
        if (data.success) {
          setOrder(data.order);
        }
      } catch (e) {
        console.error('Error fetching order details', e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, orderNumberParam]);

  const orderNum = order?.orderNumber || orderNumberParam || 'VEL-CONFIRMED';
  const whatsappMsg = encodeURIComponent(
    `Hello VELYRA, I have placed Order #${orderNum}. Please keep me updated with tracking details.`
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 mx-auto flex items-center justify-center text-emerald-800">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-widest text-brand-amber font-semibold">
            Ritual Confirmed
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-brand-charcoal font-normal">
            Thank you for choosing VELYRA.
          </h1>
          <p className="text-sm text-brand-mineral max-w-md mx-auto">
            Your order is being carefully prepared in our climate-controlled fulfillment hub.
          </p>
        </div>
      </div>

      {/* Order Details Card */}
      <div className="bg-surface-elevated rounded-sm border border-border-subtle shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-6">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-brand-mineral block font-semibold">
              Order Reference
            </span>
            <span className="font-serif text-2xl text-brand-charcoal font-semibold">
              #{orderNum}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-brand-sand/40 border border-brand-sand text-brand-charcoal px-3 py-1.5 rounded-xs text-xs font-semibold uppercase tracking-wider">
              {order?.paymentMethod === 'COD' ? 'Cash on Delivery (Pending)' : 'Online Payment (Verified)'}
            </span>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-wider text-brand-charcoal font-semibold">
            Delivery Progress
          </h4>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="space-y-1">
              <div className="h-1.5 rounded-full bg-brand-charcoal"></div>
              <span className="font-semibold text-brand-charcoal text-[11px]">Placed</span>
            </div>
            <div className="space-y-1">
              <div className="h-1.5 rounded-full bg-brand-sand"></div>
              <span className="text-brand-mineral text-[11px]">Confirmed</span>
            </div>
            <div className="space-y-1">
              <div className="h-1.5 rounded-full bg-brand-sand"></div>
              <span className="text-brand-mineral text-[11px]">Shipped</span>
            </div>
            <div className="space-y-1">
              <div className="h-1.5 rounded-full bg-brand-sand"></div>
              <span className="text-brand-mineral text-[11px]">Delivered</span>
            </div>
          </div>
        </div>

        {/* Customer & Address Details */}
        {order && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border-subtle text-xs text-brand-mineral">
            <div>
              <strong className="text-brand-charcoal block mb-1 uppercase tracking-wider text-[11px]">
                Delivering To:
              </strong>
              <p className="text-brand-charcoal font-medium">{order.customerName}</p>
              <p>{order.shippingAddress?.addressLine1 || order.shippingAddress?.address}</p>
              {(order.shippingAddress?.addressLine2 || order.shippingAddress?.apartment) && (
                <p>{order.shippingAddress?.addressLine2 || order.shippingAddress?.apartment}</p>
              )}
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode || order.shippingAddress?.pincode}</p>
              <p className="pt-1">Phone: +91 {order.customerPhone}</p>
            </div>

            <div>
              <strong className="text-brand-charcoal block mb-1 uppercase tracking-wider text-[11px]">
                Order Total:
              </strong>
              <p className="text-brand-charcoal font-serif text-lg font-semibold">{formatPrice(order.total)}</p>
              <p>Payment: {order.paymentMethod}</p>
              <p className="pt-1 text-brand-olive font-medium">Estimated Delivery: 2-4 business days</p>
            </div>
          </div>
        )}
      </div>

      {/* WhatsApp & Tracking Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a
          href={`https://wa.me/919876543210?text=${whatsappMsg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-brand-charcoal text-white p-4 rounded-sm flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-semibold hover:bg-emerald-800 transition-colors shadow-sm"
        >
          <MessageCircle className="w-4 h-4 text-emerald-400" />
          <span>Get WhatsApp Tracking Updates</span>
        </a>

        <Link
          href={`/track-order?query=${orderNum}`}
          className="border border-border-strong bg-surface-elevated text-brand-charcoal p-4 rounded-sm flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-semibold hover:bg-surface-muted transition-colors shadow-sm text-center"
        >
          <Truck className="w-4 h-4 text-brand-amber" />
          <span>Track Order Status</span>
        </Link>
      </div>

      {/* Continue Shopping */}
      <div className="text-center pt-4">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-brand-charcoal hover:text-brand-amber transition-colors"
        >
          <span>Continue Exploring VELYRA</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="bg-surface-base min-h-screen py-16 sm:py-24 border-b border-border-subtle">
      <Suspense fallback={<div className="text-center text-xs text-brand-mineral py-12">Loading order confirmation...</div>}>
        <OrderSuccessContent />
      </Suspense>
    </div>
  );
}
