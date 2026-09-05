'use client';

import React, { useState } from 'react';
import { Mail, Phone, MessageCircle, MapPin, CheckCircle2, Clock } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-surface-base min-h-screen py-16 sm:py-24 border-b border-border-subtle">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-widest text-brand-amber font-semibold">
            Client Concierge
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-brand-charcoal font-normal">
            We are here to assist your skincare journey.
          </h1>
          <p className="text-sm text-brand-mineral leading-relaxed">
            Have questions about formulations, batch testing, wholesale partnerships, or tracking an active order? Reach out below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Contact Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-surface-elevated p-6 rounded-sm border border-border-subtle shadow-sm space-y-4">
              <h3 className="font-serif text-xl text-brand-charcoal font-medium border-b border-border-subtle pb-3">
                Concierge Touchpoints
              </h3>

              <div className="space-y-4 text-xs text-brand-mineral">
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-brand-charcoal block mb-0.5 font-semibold">WhatsApp Skincare Concierge</strong>
                    <p>+91 98765 43210 (10 AM - 7 PM IST)</p>
                    <a
                      href="https://wa.me/919876543210"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-amber font-semibold hover:underline block mt-0.5"
                    >
                      Open WhatsApp Chat &rarr;
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-brand-amber flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-brand-charcoal block mb-0.5 font-semibold">Client Support Email</strong>
                    <p>concierge@velyra.in</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-brand-amber flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-brand-charcoal block mb-0.5 font-semibold">Operating Hours</strong>
                    <p>Monday – Saturday: 10:00 AM – 7:00 PM IST</p>
                    <p className="text-[11px] text-stone-400">Closed on Sundays & National Holidays</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-brand-amber flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-brand-charcoal block mb-0.5 font-semibold">VELYRA Studio & HQ</strong>
                    <p>Level 4, The Palm Court, MG Road, Bangalore 560001, Karnataka, India</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Contact Form */}
          <div className="lg:col-span-7 bg-surface-elevated p-6 sm:p-10 rounded-sm border border-border-subtle shadow-sm">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 border border-emerald-300 mx-auto flex items-center justify-center text-emerald-800">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="font-serif text-2xl text-brand-charcoal">Message Received</h3>
                <p className="text-xs text-brand-mineral max-w-sm mx-auto">
                  Thank you for contacting VELYRA. A member of our skincare advisory team will respond within 4 business hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="font-serif text-2xl text-brand-charcoal font-medium border-b border-border-subtle pb-3">
                  Send a Direct Inquiry
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wider text-brand-mineral font-semibold">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ananya Rao"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-surface-muted border border-border-subtle px-3.5 py-2.5 text-xs text-brand-charcoal placeholder:text-brand-mineral focus:outline-none focus:border-brand-charcoal rounded-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wider text-brand-mineral font-semibold">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="ananya@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-surface-muted border border-border-subtle px-3.5 py-2.5 text-xs text-brand-charcoal placeholder:text-brand-mineral focus:outline-none focus:border-brand-charcoal rounded-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wider text-brand-mineral font-semibold">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-surface-muted border border-border-subtle px-3.5 py-2.5 text-xs text-brand-charcoal placeholder:text-brand-mineral focus:outline-none focus:border-brand-charcoal rounded-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wider text-brand-mineral font-semibold">
                      Subject
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-surface-muted border border-border-subtle px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:border-brand-charcoal rounded-xs"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Order Tracking / Delivery">Order Tracking / Delivery</option>
                      <option value="Skincare Routine Advice">Skincare Routine Advice</option>
                      <option value="Wholesale & Press">Wholesale & Press</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-brand-mineral font-semibold">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="How can we assist you today?"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-surface-muted border border-border-subtle p-3.5 text-xs text-brand-charcoal placeholder:text-brand-mineral focus:outline-none focus:border-brand-charcoal rounded-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-charcoal text-white py-3.5 text-xs uppercase tracking-widest font-semibold rounded-xs hover:bg-brand-mineral transition-colors shadow-md"
                >
                  Send Inquiry to Concierge
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
