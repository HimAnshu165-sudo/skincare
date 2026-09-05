// Google Analytics 4 (GA4) D2C E-Commerce Events Helper

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || '';

// Pageview
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag && GA_TRACKING_ID) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// E-commerce: View Item
export const trackViewItem = (item: { id: string; name: string; price: number; category?: string }) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_item', {
      currency: 'INR',
      value: item.price,
      items: [
        {
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          item_category: item.category,
        },
      ],
    });
  }
};

// E-commerce: Add To Cart
export const trackAddToCart = (item: { id: string; name: string; price: number; quantity: number; category?: string }) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: 'INR',
      value: item.price * item.quantity,
      items: [
        {
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          quantity: item.quantity,
          item_category: item.category,
        },
      ],
    });
  }
};

// E-commerce: Remove From Cart
export const trackRemoveFromCart = (item: { id: string; name: string; price: number; quantity: number }) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'remove_from_cart', {
      currency: 'INR',
      value: item.price * item.quantity,
      items: [
        {
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          quantity: item.quantity,
        },
      ],
    });
  }
};

// E-commerce: Begin Checkout
export const trackBeginCheckout = (items: Array<{ id: string; name: string; price: number; quantity: number }>, total: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'begin_checkout', {
      currency: 'INR',
      value: total,
      items: items.map(i => ({
        item_id: i.id,
        item_name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
    });
  }
};

// E-commerce: Purchase
export const trackPurchase = (order: { orderNumber: string; total: number; shipping: number; tax?: number; items: Array<any>; paymentMethod: string }) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: order.orderNumber,
      value: order.total,
      currency: 'INR',
      shipping: order.shipping,
      payment_type: order.paymentMethod,
      items: order.items.map(i => ({
        item_id: i.productId || i.id,
        item_name: i.productName || i.name,
        price: i.price,
        quantity: i.quantity,
      })),
    });
  }
};
