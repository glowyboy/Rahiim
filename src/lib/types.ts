export type UserRole = 'admin' | 'manager' | 'seller';

export interface AppUser {
  id: string;
  username: string;
  password: string;
  full_name: string;
  role: UserRole;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  company_name: string;
  activity: string;
  phone: string;
  email: string;
  address: string;
  rc: string;
  nif: string;
  nis: string;
  logo_url: string;
  total_orders: number;
  debt: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  purchase_price: number;
  selling_price: number;
  stock_quantity: number;
  stock: number;
  supplier_id: string | null;
  image_url: string;
  created_at: string;
  supplier?: Supplier;
}

export interface Client {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  address: string;
  total_purchases: number;
  debt: number;
  created_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product?: Product;
}

export interface Sale {
  id: string;
  client_id: string | null;
  sale_date: string;
  total_amount: number;
  paid_amount: number;
  remaining: number;
  status: 'paid' | 'partial' | 'unpaid';
  note: string;
  created_at: string;
  client?: Client;
  items?: SaleItem[];
}

export interface ClientPayment {
  id: string;
  client_id: string;
  amount: number;
  payment_date: string;
  note: string;
  created_at: string;
  client?: Client;
}

export interface SupplierOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product?: Product;
}

export interface SupplierOrder {
  id: string;
  supplier_id: string | null;
  order_date: string;
  total_amount: number;
  paid_amount: number;
  remaining: number;
  status: 'paid' | 'partial' | 'unpaid';
  note: string;
  created_at: string;
  supplier?: Supplier;
  items?: SupplierOrderItem[];
}

export interface SupplierPayment {
  id: string;
  supplier_id: string;
  amount: number;
  payment_date: string;
  note: string;
  created_at: string;
  supplier?: Supplier;
}

export type TreasuryType =
  | 'income'
  | 'expense'
  | 'manual_add'
  | 'manual_remove'
  | 'sale_in'
  | 'supplier_out'
  | 'client_payment_in'
  | 'supplier_payment_out';

export interface TreasuryTransaction {
  id: string;
  type: TreasuryType;
  amount: number;
  source: string;
  note: string;
  transaction_date: string;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unit_price: number;
}
