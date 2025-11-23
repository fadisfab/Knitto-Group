export interface User {
  id: string;
  email: string;
  password: string;
  username: string;
  created_at: Date;
}

export interface DataRecord {
  id: string;
  unique_code: string;
  running_number: number;
  data: any;
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  sku: string;
  created_at: Date;
  updated_at: Date;
}

export interface Order {
  id: string;
  customer_id: string;
  product_id: string;
  quantity: number;
  total_price: number;
  city: string;
  created_at: Date;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  total_purchases: number;
  last_purchase_date: Date;
  created_at: Date;
}