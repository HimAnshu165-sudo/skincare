'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, ArrowRight, CheckCircle2, MapPin, Plus, Loader2, AlertCircle, LogIn } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useProcessing } from '@/context/ProcessingContext';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { trackBeginCheckout, trackPurchase } from '@/lib/analytics';
import confetti from 'canvas-confetti';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).Razorpay) return resolve(true);

    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      if ((window as any).Razorpay) return resolve(true);
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

interface SavedAddress {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  addressType: string;
  isDefault: boolean;
}

export function CheckoutForm() {
  const router = useRouter();
  const { items, subtotal, discount, shippingFee, total, appliedCoupon, clearCart } = useCart();
  const { user } = useAuth();
  const { showProcessing, hideProcessing } = useProcessing();

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | 'NEW'>('NEW');
  const [saveAddressToAccount, setSaveAddressToAccount] = useState(true);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'COD'>('ONLINE');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Clean up global processing overlay on component unmount
  useEffect(() => {
    return () => {
      hideProcessing();
    };
  }, [hideProcessing]);

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi NCR', 'Jammu & Kashmir', 'Chandigarh'
  ];

  // Autofill user credentials & fetch saved addresses
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
      }));

      fetch('/api/addresses')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.addresses.length > 0) {
            setSavedAddresses(data.addresses);
            const defaultAddr = data.addresses.find((a: SavedAddress) => a.isDefault) || data.addresses[0];
            setSelectedAddressId(defaultAddr.id);
            setFormData((prev) => ({
              ...prev,
              fullName: defaultAddr.fullName,
              phone: defaultAddr.phone,
              addressLine1: defaultAddr.addressLine1,
              addressLine2: defaultAddr.addressLine2 || '',
              city: defaultAddr.city,
              state: defaultAddr.state,
              postalCode: defaultAddr.postalCode,
            }));
          }
        })
        .catch(console.error);
    }
  }, [user]);

  const handleSelectSavedAddress = (addr: SavedAddress) => {
    setSelectedAddressId(addr.id);
    setFormData({
      fullName: addr.fullName,
      email: formData.email || user?.email || '',
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || '',
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
    });
  };

  const handleChooseNewAddress = () => {
    setSelectedAddressId('NEW');
    setFormData({
      fullName: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setFormData({ ...formData, postalCode: val });

    // State auto-detect heuristic
    if (val.length === 6) {
      const first = val[0];
      if (first === '1') setFormData(prev => ({ ...prev, postalCode: val, state: 'Delhi NCR' }));
      else if (first === '4') setFormData(prev => ({ ...prev, postalCode: val, state: 'Maharashtra' }));
      else if (first === '5') setFormData(prev => ({ ...prev, postalCode: val, state: 'Karnataka' }));
      else if (first === '6') setFormData(prev => ({ ...prev, postalCode: val, state: 'Tamil Nadu' }));
      else if (first === '7') setFormData(prev => ({ ...prev, postalCode: val, state: 'West Bengal' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.email.trim() || !formData.addressLine1.trim() || !formData.city.trim() || !formData.postalCode.trim()) {
      setErrorMsg('Please complete all required delivery fields.');
      return;
    }

    const digitsOnly = formData.phone.trim().replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(digitsOnly)) {
      setErrorMsg('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.');
      return;
    }

    if (!/^\d{6}$/.test(formData.postalCode.trim())) {
      setErrorMsg('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    if (!items || items.length === 0) {
      setErrorMsg('Your cart is empty. Please add formulations before checkout.');
      return;
    }

    // Require authentication to place order
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent('/checkout')}`);
      return;
    }

    setLoading(true);
    trackBeginCheckout(items, total);

    const shippingPayload = {
      fullName: formData.fullName,
      phone: formData.phone,
      addressLine1: formData.addressLine1,
      addressLine2: formData.addressLine2,
      city: formData.city,
      state: formData.state || 'India',
      postalCode: formData.postalCode,
      country: 'India',
    };

    try {
      if (paymentMethod === 'COD') {
        showProcessing(
          'Confirming your order...',
          'Securing formulation batches and scheduling express dispatch. Please do not close this window.'
        );

        // Cash on Delivery Transaction
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: formData.fullName,
            customerEmail: formData.email,
            customerPhone: formData.phone,
            shippingAddress: shippingPayload,
            paymentMethod: 'COD',
            items: items.map(i => ({
              productId: i.productId,
              quantity: i.quantity,
            })),
            couponCode: appliedCoupon?.code || null,
            saveAddressToAccount: user ? saveAddressToAccount : false,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          hideProcessing();
          throw new Error(data.message || 'Failed to place COD order.');
        }

        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch {}

        await clearCart();
        showProcessing('Order confirmed!', 'Redirecting to your order confirmation receipt...');
        router.push(`/order-success?orderId=${data.order.id}&orderNumber=${data.order.orderNumber}`);
      } else {
        // Ensure Razorpay SDK script is loaded
        await loadRazorpayScript();

        // Online Payment Flow via Razorpay
        showProcessing(
          'Connecting to payment gateway...',
          'Opening 256-bit encrypted Razorpay interface...'
        );

        const orderRes = await fetch('/api/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: formData.fullName,
            customerEmail: formData.email,
            customerPhone: formData.phone,
            shippingAddress: shippingPayload,
            items: items.map(i => ({
              productId: i.productId,
              quantity: i.quantity,
            })),
            couponCode: appliedCoupon?.code || null,
            saveAddressToAccount: user ? saveAddressToAccount : false,
          }),
        });

        const orderData = await orderRes.json();
        if (!orderRes.ok || !orderData.success) {
          hideProcessing();
          throw new Error(orderData.message || 'Error initializing payment gateway.');
        }

        // Test simulation fallback only if mock order ID was returned
        if (orderData.isSimulation || orderData.razorpayOrder?.id?.startsWith('order_mock_')) {
          showProcessing(
            'Verifying test payment signature...',
            'Validating test transaction with bank simulator...'
          );

          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: orderData.order.id,
              razorpay_order_id: orderData.razorpayOrder?.id || `sim_${Date.now()}`,
              razorpay_payment_id: `pay_sim_${Date.now()}`,
              razorpay_signature: 'simulated_valid_test_signature_2026',
            }),
          });

          await verifyRes.json();
          await clearCart();
          showProcessing('Payment verified!', 'Redirecting to your order receipt...');
          router.push(`/order-success?orderId=${orderData.order.id}&orderNumber=${orderData.order.orderNumber}`);
          return;
        }

        // Verify Razorpay client object availability
        if (!window.Razorpay) {
          hideProcessing();
          setLoading(false);
          setErrorMsg('Unable to load Razorpay payment gateway. Please check your internet connection or ad-blocker.');
          return;
        }

        // Hide overlay while Razorpay modal is open for user interaction
        hideProcessing();

        // Live Razorpay SDK Modal
        const options = {
          key: orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: orderData.razorpayOrder.amount,
          currency: 'INR',
          name: 'VELYRA Skincare',
          description: `Order #${orderData.order.orderNumber}`,
          image: '/brand/logo-icon.svg',
          order_id: orderData.razorpayOrder.id,
          handler: async function (response: any) {
            showProcessing(
              'Verifying payment signature...',
              'Confirming transaction with bank network. Please do not close this window.'
            );
            try {
              const verifyRes = await fetch('/api/razorpay/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: orderData.order.id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                try {
                  confetti({
                    particleCount: 80,
                    spread: 60,
                    origin: { y: 0.6 },
                  });
                } catch {}
                await clearCart();
                showProcessing('Payment verified!', 'Redirecting to your order receipt...');
                router.push(`/order-success?orderId=${orderData.order.id}&orderNumber=${orderData.order.orderNumber}`);
              } else {
                hideProcessing();
                setLoading(false);
                setErrorMsg(verifyData.message || 'Payment verification failed. Please contact concierge support.');
              }
            } catch {
              hideProcessing();
              setLoading(false);
              setErrorMsg('Error verifying payment signature.');
            }
          },
          prefill: {
            name: formData.fullName,
            email: formData.email,
            contact: formData.phone,
          },
          theme: {
            color: '#1A1817',
          },
          modal: {
            ondismiss: function () {
              hideProcessing();
              setLoading(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp: any) {
          hideProcessing();
          setErrorMsg(resp.error?.description || 'Payment was declined. Please retry or choose Cash on Delivery.');
          setLoading(false);
        });
        rzp.open();
      }
    } catch (err: any) {
      hideProcessing();
      console.error('Checkout error:', err);
      setErrorMsg(err.message || 'An error occurred during checkout.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-xs sm:text-sm">
      {/* Error Banner */}
      {errorMsg && (
        <div className="flex items-center gap-2.5 p-4 bg-red-50/90 border border-red-200 text-red-700 text-xs rounded-xs animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 1. Customer Contact */}
      <section className="bg-surface-elevated border border-border-subtle p-6 sm:p-8 rounded-sm space-y-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-full bg-brand-charcoal text-white text-[10px] font-bold flex items-center justify-center">
              1
            </span>
            <h2 className="font-serif text-lg font-medium text-brand-charcoal">
              Contact Information
            </h2>
          </div>
          {user ? (
            <span className="text-[11px] text-brand-amber font-semibold uppercase tracking-wider">
              Signed in as {user.email}
            </span>
          ) : (
            <Link
              href={`/login?redirect=${encodeURIComponent('/checkout')}`}
              className="inline-flex items-center gap-1 text-[11px] text-brand-charcoal font-semibold underline uppercase tracking-wider hover:text-brand-mineral"
            >
              <LogIn className="w-3 h-3" />
              <span>Sign in to continue</span>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal/70">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 bg-surface-base border border-border-strong rounded-xs focus:outline-none focus:border-brand-charcoal text-xs sm:text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal/70">
              Mobile Phone (For Order Tracking SMS) *
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 bg-surface-muted border border-r-0 border-border-strong rounded-l-xs text-xs text-foreground/60 font-medium">
                +91
              </span>
              <input
                type="tel"
                name="phone"
                required
                maxLength={10}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                placeholder="9876543210"
                className="w-full px-3.5 py-2.5 bg-surface-base border border-border-strong rounded-r-xs focus:outline-none focus:border-brand-charcoal text-xs sm:text-sm font-mono"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Delivery Address */}
      <section className="bg-surface-elevated border border-border-subtle p-6 sm:p-8 rounded-sm space-y-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-full bg-brand-charcoal text-white text-[10px] font-bold flex items-center justify-center">
              2
            </span>
            <h2 className="font-serif text-lg font-medium text-brand-charcoal">
              Shipping Destination
            </h2>
          </div>
          <span className="text-[11px] text-foreground/50">Complimentary Over ₹999</span>
        </div>

        {/* Saved Addresses Picker for Logged-In User */}
        {user && savedAddresses.length > 0 && (
          <div className="space-y-3 pb-2 border-b border-border-subtle">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal/70">
              Select a Saved Address
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {savedAddresses.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() => handleSelectSavedAddress(addr)}
                  className={`p-3.5 border rounded-xs cursor-pointer transition-all ${
                    selectedAddressId === addr.id
                      ? 'border-brand-charcoal bg-brand-sand/15 shadow-xs'
                      : 'border-border-strong hover:border-brand-charcoal/40 bg-surface-base'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-brand-charcoal">{addr.fullName}</span>
                    <span className="text-[10px] uppercase font-bold text-foreground/50">{addr.addressType}</span>
                  </div>
                  <p className="text-[11px] text-foreground/70 truncate">{addr.addressLine1}</p>
                  <p className="text-[11px] text-foreground/70">{addr.city}, {addr.state} — {addr.postalCode}</p>
                </div>
              ))}

              <div
                onClick={handleChooseNewAddress}
                className={`p-3.5 border border-dashed rounded-xs cursor-pointer flex items-center justify-center gap-2 text-xs font-medium transition-colors ${
                  selectedAddressId === 'NEW'
                    ? 'border-brand-charcoal bg-brand-sand/15 text-brand-charcoal'
                    : 'border-border-strong text-foreground/60 hover:text-brand-charcoal'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Enter New Address</span>
              </div>
            </div>
          </div>
        )}

        {/* Address Input Fields */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal/70">
              Recipient Full Name *
            </label>
            <input
              type="text"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="e.g. Aarav Sharma"
              className="w-full px-3.5 py-2.5 bg-surface-base border border-border-strong rounded-xs focus:outline-none focus:border-brand-charcoal text-xs sm:text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal/70">
              Address (House / Flat No., Street, Building) *
            </label>
            <input
              type="text"
              name="addressLine1"
              required
              value={formData.addressLine1}
              onChange={handleInputChange}
              placeholder="Flat 402, Lotus Towers, 14th Main"
              className="w-full px-3.5 py-2.5 bg-surface-base border border-border-strong rounded-xs focus:outline-none focus:border-brand-charcoal text-xs sm:text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal/70">
              Apartment, Suite, Landmark (Optional)
            </label>
            <input
              type="text"
              name="addressLine2"
              value={formData.addressLine2}
              onChange={handleInputChange}
              placeholder="Near Indiranagar Metro Station"
              className="w-full px-3.5 py-2.5 bg-surface-base border border-border-strong rounded-xs focus:outline-none focus:border-brand-charcoal text-xs sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal/70">
                PIN Code *
              </label>
              <input
                type="text"
                name="postalCode"
                required
                value={formData.postalCode}
                onChange={handlePincodeChange}
                placeholder="6 digits"
                maxLength={6}
                className="w-full px-3.5 py-2.5 bg-surface-base border border-border-strong rounded-xs focus:outline-none focus:border-brand-charcoal text-xs sm:text-sm font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal/70">
                City *
              </label>
              <input
                type="text"
                name="city"
                required
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Bengaluru"
                className="w-full px-3.5 py-2.5 bg-surface-base border border-border-strong rounded-xs focus:outline-none focus:border-brand-charcoal text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal/70">
                State *
              </label>
              <select
                name="state"
                required
                value={formData.state}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 bg-surface-base border border-border-strong rounded-xs focus:outline-none focus:border-brand-charcoal text-xs sm:text-sm"
              >
                <option value="">Select State</option>
                {indianStates.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {user && selectedAddressId === 'NEW' && (
            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-brand-charcoal">
                <input
                  type="checkbox"
                  checked={saveAddressToAccount}
                  onChange={(e) => setSaveAddressToAccount(e.target.checked)}
                  className="accent-brand-charcoal"
                />
                <span>Save this address to my account for future orders</span>
              </label>
            </div>
          )}
        </div>
      </section>

      {/* 3. Payment Method */}
      <section className="bg-surface-elevated border border-border-subtle p-6 sm:p-8 rounded-sm space-y-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-full bg-brand-charcoal text-white text-[10px] font-bold flex items-center justify-center">
              3
            </span>
            <h2 className="font-serif text-lg font-medium text-brand-charcoal">
              Payment Method
            </h2>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
            <Lock className="w-3 h-3" />
            <span>256-Bit TLS Encrypted</span>
          </div>
        </div>

        <PaymentMethodSelector
          selectedMethod={paymentMethod}
          onChange={setPaymentMethod}
        />
      </section>

      {/* Submit Button */}
      <div className="space-y-3 pt-2">
        <button
          type="submit"
          disabled={loading || items.length === 0}
          className="w-full py-4 bg-brand-charcoal text-white rounded-xs text-xs sm:text-sm uppercase tracking-editorial font-medium hover:bg-black transition-all flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(0,0,0,0.12)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Authorizing & Verifying Order...</span>
            </>
          ) : !user ? (
            <>
              <span>Sign In to Place Order</span>
              <ArrowRight className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>{paymentMethod === 'ONLINE' ? 'Pay Now via Razorpay' : 'Confirm Cash on Delivery Order'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-4 text-[11px] text-foreground/50 pt-2">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Authentic Formulations Guaranteed</span>
          </span>
          <span>•</span>
          <span>Hassle-Free 14-Day Returns</span>
        </div>
      </div>
    </form>
  );
}
