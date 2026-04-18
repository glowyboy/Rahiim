
/*
  # Add missing columns and demo data (v2)
*/

-- app_users: add full_name
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='app_users' AND column_name='full_name') THEN
    ALTER TABLE app_users ADD COLUMN full_name text NOT NULL DEFAULT '';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='app_users' AND column_name='is_active') THEN
    ALTER TABLE app_users ADD COLUMN is_active boolean DEFAULT true;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='suppliers' AND column_name='company_name') THEN
    ALTER TABLE suppliers ADD COLUMN company_name text NOT NULL DEFAULT '';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='suppliers' AND column_name='total_orders') THEN
    ALTER TABLE suppliers ADD COLUMN total_orders numeric(14,2) DEFAULT 0;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='stock') THEN
    ALTER TABLE products ADD COLUMN stock integer DEFAULT 0;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sales' AND column_name='remaining') THEN
    ALTER TABLE sales ADD COLUMN remaining numeric(14,2) DEFAULT 0;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sales' AND column_name='sale_date') THEN
    ALTER TABLE sales ADD COLUMN sale_date date DEFAULT CURRENT_DATE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sale_items' AND column_name='subtotal') THEN
    ALTER TABLE sale_items ADD COLUMN subtotal numeric(14,2) DEFAULT 0;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='supplier_orders' AND column_name='remaining') THEN
    ALTER TABLE supplier_orders ADD COLUMN remaining numeric(14,2) DEFAULT 0;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='supplier_orders' AND column_name='order_date') THEN
    ALTER TABLE supplier_orders ADD COLUMN order_date date DEFAULT CURRENT_DATE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='supplier_order_items' AND column_name='subtotal') THEN
    ALTER TABLE supplier_order_items ADD COLUMN subtotal numeric(14,2) DEFAULT 0;
  END IF;
END $$;

-- Fix treasury type check
ALTER TABLE treasury_transactions DROP CONSTRAINT IF EXISTS treasury_transactions_type_check;
ALTER TABLE treasury_transactions ADD CONSTRAINT treasury_transactions_type_check
  CHECK (type IN ('income','expense','manual_add','manual_remove','sale_in','supplier_out','client_payment_in','supplier_payment_out'));

-- Update existing data
UPDATE app_users SET full_name = 'Administrateur', is_active = true WHERE username = 'admin';
UPDATE app_users SET full_name = 'Karim Mansouri', is_active = true WHERE username = 'manager1';

INSERT INTO app_users (username, password, full_name, role, email, is_active)
VALUES ('seller1', 'seller123', 'Amina Chaoui', 'seller', 'amina@store.dz', true)
ON CONFLICT (username) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true;

UPDATE suppliers SET company_name = name, total_orders = 85000, debt = 15000 WHERE name = 'SARL Batna Tools';
UPDATE suppliers SET company_name = name, total_orders = 62000, debt = 8000 WHERE name = 'ElectroSupply DZ';
UPDATE suppliers SET company_name = name, total_orders = 120000, debt = 22000 WHERE name = 'MegaBuild Algeria';

UPDATE products SET stock = stock_quantity;
UPDATE clients SET total_purchases = 45000, debt = 8500 WHERE full_name = 'Ahmed Benali';
UPDATE clients SET total_purchases = 28000, debt = 3200 WHERE full_name = 'Sara Khelifi';
UPDATE clients SET total_purchases = 67000, debt = 12000 WHERE full_name = 'Yacine Toumi';
