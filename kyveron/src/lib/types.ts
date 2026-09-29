// ===== Kyveron Database Types =====
// These mirror the Supabase schema for the production backend.

export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP';

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  category: Category;
  collection: string;
  gender: 'men' | 'women' | 'unisex';
  fabric: string;
  careInstructions: string[];
  fit: string;
  seoTitle: string;
  seoDescription: string;
  images: ProductImage[];
  variants: ProductVariant[];
  basePrice: number; // in minor units (paise)
  compareAtPrice?: number;
  isFeatured: boolean;
  isNew: boolean;
  isPublished: boolean;
  stockTotal: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  colors: string[];
  sizes: string[];
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  order: number;
  type: 'front' | 'back' | 'detail' | 'lifestyle';
}

export interface ProductVariant {
  id: string;
  sku: string;
  size: string;
  color: string;
  price: number;
  stock: number;
  isAvailable: boolean;
}

export type Category = 't-shirts' | 'jackets' | 'polos' | 'joggers' | 'hoodies' | 'shorts' | 'accessories';

export interface Collection {
  id: string;
  slug: string;
  name: string;
  description: string;
  bannerImage: string;
  productCount: number;
}

export interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
  size: string;
  color: string;
  product: Product;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number; // GST already included in the prices, for information
  total: number;
  couponCode?: string;
}

export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  type: 'billing' | 'shipping';
}

export type OrderStatus =
  | 'pending_payment'
  | 'payment_failed'
  | 'paid'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancellation_requested'
  | 'cancelled'
  | 'return_requested'
  | 'returned'
  | 'refund_pending'
  | 'refunded'
  | 'payment_disputed';

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  email: string;
  phone: string;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  subtotal: number;
  discount: number;
  shipping: number;
  codFee?: number;
  tax: number; // GST already included in the prices, for information
  total: number;
  currency: Currency;
  paymentMethod?: string;
  isPreview?: boolean;
  status: OrderStatus;
  paymentStatus: 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded';
  paymentId?: string;
  gatewayOrderId?: string;
  trackingNumber?: string;
  courierName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: StatusChange[];
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  quantity: number;
  price: number;
  image: string;
}

export interface StatusChange {
  from: OrderStatus;
  to: OrderStatus;
  timestamp: string;
  actor: string;
  note?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  createdAt: string;
  addresses: Address[];
  wishlist: string[];
  marketingOptIn?: boolean;
}

export type UserRole = 'customer' | 'super_admin' | 'catalog_manager' | 'order_manager' | 'support_agent' | 'marketing_editor' | 'analyst';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  body: string;
  isVerified: boolean;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minCartValue?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
}

export interface JournalPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  publishedAt: string;
  tags: string[];
}

// Format currency
export function formatPrice(amountInPaise: number, currency: Currency = 'INR'): string {
  const amount = amountInPaise / 100;
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}
