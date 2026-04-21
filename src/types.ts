/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  brand?: string;
  price: number;
  salePrice?: number;
  description: string;
  image: string;
  gallery?: string[];
  category: string;
  tags?: string[];
  inventory: number;
  status: 'active' | 'draft';
  variants?: {
    colors?: string[];
    sizes?: string[];
  };
  preOrderEnabled?: boolean;
  preOrderEndsAt?: string;
  preOrderPrice?: number;
  limitedTimeEnabled?: boolean;
  limitedTimeEndsAt?: string;
}

export interface Order {
  id: string;
  orderNumber?: number;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  items: { productId: string; quantity: number; price: number }[];
  total: number;
  status: 'pending' | 'processed' | 'shipped' | 'out-for-delivery' | 'delivered' | 'cancelled';
  createdAt: string;
  trackingNumber?: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingPostalCode?: string;
  shippingCountry?: string;
  stripePaymentIntentId?: string;
  paypalOrderId?: string;
  paymentMethodId?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  orders: number;
  totalSpent: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  enabled: boolean;
  type: 'card' | 'paypal' | 'klarna' | 'test';
}

export interface ShippingMethod {
  id: string;
  name: string;
  price: number;
  enabled: boolean;
}

export interface Category {
  id: string;
  name: string;
  created_at?: string;
}

export interface StoreSettings {
  name: string;
  currency: string;
  logo: string;
  heroBannerUrl: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  colors: {
    ink: string;
    paper: string;
    accent: string;
    muted: string;
    gold: string;
    preOrder: string;
    limitedTime: string;
    topbarBg: string;
    topbarText: string;
    buttonBg: string;
    buttonText: string;
  }
}

export interface ShippingRegion {
  id: string;
  name: string;
  countries: string[];
  shippingPrice: number;
  isDefault: boolean;
}

export interface TaxRule {
  id: string;
  name: string;
  rate: number;
  regionId?: string;
  isGlobal: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed' | 'bogo';
  discountValue: number;
  minPurchase: number;
  requiredProductId?: string;
  benefitProductId?: string;
  active: boolean;
  expiryDate?: string;
  usageCount: number;
}

export interface Policy {
  id: string;
  type: 'refund' | 'privacy' | 'terms' | 'shipping';
  content: string;
  published: boolean;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  profile_id: string;
  status: 'active' | 'cancelled' | 'past_due' | 'incomplete';
  interval: 'fortnightly' | 'monthly';
  total: number;
  created_at: string;
  next_delivery_date: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
}
