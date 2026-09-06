export interface KeyIngredient {
  name: string;
  benefit: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  price: number;
  mrp: number;
  inStock: boolean;
  stockQuantity: number;
  sku: string;
  volume: string;
  spfRating?: string | null;
  finish?: string | null;
  skinType?: string | null;
  images: string[];
  benefits: string[];
  keyIngredients: KeyIngredient[];
  fullIngredients: string;
  howToUse: string;
  isFeatured: boolean;
  isUpcoming: boolean;
  category: 'Sunscreens' | 'Moisturizers' | 'Cleansers' | 'Sets';
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  mrp: number;
  quantity: number;
  image: string;
  volume: string;
  sku?: string;
  inStock?: boolean;
}

export interface ShippingAddress {
  fullName?: string;
  phone?: string;
  email?: string;
  address?: string;
  addressLine1?: string;
  apartment?: string;
  addressLine2?: string | null;
  city?: string;
  state?: string;
  pincode?: string;
  postalCode?: string;
  country?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  volume?: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  paymentMethod: 'ONLINE' | 'COD';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  orderStatus: 'PLACED' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  couponCode?: string | null;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  trackingNumber?: string | null;
  courierName?: string | null;
  notes?: string | null;
  items: OrderItem[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Coupon {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderValue: number;
}
