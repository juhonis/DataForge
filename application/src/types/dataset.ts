import type { Product } from './product';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  created_at: string;
}

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface Order {
  id: string;
  customer_id: string;
  status: OrderStatus;
  placed_at: string;
  total: number;
  currency: string;
}

export interface OrderLine {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface CountRange {
  min: number;
  max: number;
}

export interface Review {
  id: string;
  product_id: string;
  customer_id: string;
  rating: number;
  title: string;
  body: string;
  created_at: string;
}

export interface Dataset {
  products: Product[];
  customers: Customer[];
  orders: Order[];
  order_lines: OrderLine[];
  reviews: Review[];
}

export interface RelatedDataConfig {
  customerCount: number;
  ordersPerCustomer: CountRange;
  reviewCount: number;
}

export interface GenerationSettings extends RelatedDataConfig {
  seed: number;
  productCount: number;
}
