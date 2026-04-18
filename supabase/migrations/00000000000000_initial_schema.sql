-- Initial schema setup for GestionPro DZ

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- App Users table
CREATE TABLE IF NOT EXISTS app_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'seller')),
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  company_name TEXT NOT NULL DEFAULT '',
  activity TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  rc TEXT,
  nif TEXT,
  nis TEXT,
  logo_url TEXT,
  total_orders NUMERIC(14,2) DEFAULT 0,
  debt NUMERIC(14,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT,
  purchase_price NUMERIC(14,2) DEFAULT 0,
  selling_price NUMERIC(14,2) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  stock INTEGER DEFAULT 0,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  total_purchases NUMERIC(14,2) DEFAULT 0,
  debt NUMERIC(14,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  total_amount NUMERIC(14,2) NOT NULL,
  paid_amount NUMERIC(14,2) DEFAULT 0,
  remaining NUMERIC(14,2) DEFAULT 0,
  status TEXT CHECK (status IN ('paid', 'partial', 'unpaid')),
  note TEXT,
  sale_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sale Items table
CREATE TABLE IF NOT EXISTS sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(14,2) NOT NULL,
  subtotal NUMERIC(14,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client Payments table
CREATE TABLE IF NOT EXISTS client_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  amount NUMERIC(14,2) NOT NULL,
  note TEXT,
  payment_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Supplier Orders table
CREATE TABLE IF NOT EXISTS supplier_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  total_amount NUMERIC(14,2) NOT NULL,
  paid_amount NUMERIC(14,2) DEFAULT 0,
  remaining NUMERIC(14,2) DEFAULT 0,
  status TEXT CHECK (status IN ('paid', 'partial', 'unpaid')),
  note TEXT,
  order_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Supplier Order Items table
CREATE TABLE IF NOT EXISTS supplier_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES supplier_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(14,2) NOT NULL,
  subtotal NUMERIC(14,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Supplier Payments table
CREATE TABLE IF NOT EXISTS supplier_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
  amount NUMERIC(14,2) NOT NULL,
  note TEXT,
  payment_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Treasury Transactions table
CREATE TABLE IF NOT EXISTS treasury_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('income','expense','manual_add','manual_remove','sale_in','supplier_out','client_payment_in','supplier_payment_out')),
  amount NUMERIC(14,2) NOT NULL,
  source TEXT,
  note TEXT,
  transaction_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default admin user
INSERT INTO app_users (username, password, full_name, role, email, is_active)
VALUES ('admin', 'admin123', 'Administrator', 'admin', 'admin@gestionpro.dz', true)
ON CONFLICT (username) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_sales_client ON sales(client_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product ON sale_items(product_id);
CREATE INDEX IF NOT EXISTS idx_supplier_orders_supplier ON supplier_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_orders_date ON supplier_orders(order_date);
CREATE INDEX IF NOT EXISTS idx_treasury_date ON treasury_transactions(transaction_date);
