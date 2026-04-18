
/*
  # Add demo data v2 - using gen_random_uuid() for IDs
*/

-- Extra products
INSERT INTO products (name, category, purchase_price, selling_price, stock_quantity, stock, supplier_id)
SELECT 'Tournevis Set 6pcs', 'tools', 450, 750, 60, 60, s.id
FROM suppliers s WHERE s.name = 'SARL Batna Tools'
AND NOT EXISTS (SELECT 1 FROM products p2 WHERE p2.name = 'Tournevis Set 6pcs');

INSERT INTO products (name, category, purchase_price, selling_price, stock_quantity, stock, supplier_id)
SELECT 'Disjoncteur 16A', 'electronics', 380, 650, 85, 85, s.id
FROM suppliers s WHERE s.name = 'ElectroSupply DZ'
AND NOT EXISTS (SELECT 1 FROM products p2 WHERE p2.name = 'Disjoncteur 16A');

INSERT INTO products (name, category, purchase_price, selling_price, stock_quantity, stock, supplier_id)
SELECT 'Ciment 50kg', 'hardware', 850, 1300, 120, 120, s.id
FROM suppliers s WHERE s.name = 'MegaBuild Algeria'
AND NOT EXISTS (SELECT 1 FROM products p2 WHERE p2.name = 'Ciment 50kg');

INSERT INTO products (name, category, purchase_price, selling_price, stock_quantity, stock, supplier_id)
SELECT 'Niveau à Bulle 60cm', 'tools', 320, 550, 35, 35, s.id
FROM suppliers s WHERE s.name = 'SARL Batna Tools'
AND NOT EXISTS (SELECT 1 FROM products p2 WHERE p2.name = 'Niveau à Bulle 60cm');

-- Demo Sales with client references
DO $$
DECLARE
  cid_ahmed uuid;
  cid_sara uuid;
  cid_yacine uuid;
  sale1 uuid;
  sale2 uuid;
  sale3 uuid;
  sale4 uuid;
  sale5 uuid;
  pid_marteau uuid;
  pid_perceuse uuid;
  pid_cable uuid;
  pid_peinture uuid;
  pid_ciment uuid;
  pid_tournevis uuid;
  pid_disjoncteur uuid;
  pid_niveau uuid;
BEGIN
  SELECT id INTO cid_ahmed FROM clients WHERE full_name = 'Ahmed Benali' LIMIT 1;
  SELECT id INTO cid_sara FROM clients WHERE full_name = 'Sara Khelifi' LIMIT 1;
  SELECT id INTO cid_yacine FROM clients WHERE full_name = 'Yacine Toumi' LIMIT 1;
  SELECT id INTO pid_marteau FROM products WHERE name = 'Marteau Professionnel' LIMIT 1;
  SELECT id INTO pid_perceuse FROM products WHERE name = 'Perceuse Électrique' LIMIT 1;
  SELECT id INTO pid_cable FROM products WHERE name = 'Câble Électrique (m)' LIMIT 1;
  SELECT id INTO pid_peinture FROM products WHERE name = 'Seau de Peinture 5L' LIMIT 1;
  SELECT id INTO pid_ciment FROM products WHERE name = 'Ciment 50kg' LIMIT 1;
  SELECT id INTO pid_tournevis FROM products WHERE name = 'Tournevis Set 6pcs' LIMIT 1;
  SELECT id INTO pid_disjoncteur FROM products WHERE name = 'Disjoncteur 16A' LIMIT 1;
  SELECT id INTO pid_niveau FROM products WHERE name = 'Niveau à Bulle 60cm' LIMIT 1;

  -- Sale 1: Ahmed - perceuse - unpaid
  INSERT INTO sales (client_id, total_amount, paid_amount, remaining, status, note, sale_date)
  VALUES (cid_ahmed, 8500, 0, 8500, 'unpaid', 'Commande urgente', CURRENT_DATE - 5)
  RETURNING id INTO sale1;
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES (sale1, pid_perceuse, 1, 8500, 8500);

  -- Sale 2: Sara - marteau + câble - partial
  INSERT INTO sales (client_id, total_amount, paid_amount, remaining, status, sale_date)
  VALUES (cid_sara, 4650, 1450, 3200, 'partial', CURRENT_DATE - 3)
  RETURNING id INTO sale2;
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES (sale2, pid_marteau, 2, 1200, 2400);
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES (sale2, pid_cable, 5, 300, 1500);

  -- Sale 3: Yacine - peinture + disjoncteur - unpaid
  INSERT INTO sales (client_id, total_amount, paid_amount, remaining, status, sale_date)
  VALUES (cid_yacine, 12000, 0, 12000, 'unpaid', CURRENT_DATE - 7)
  RETURNING id INTO sale3;
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES (sale3, pid_peinture, 4, 2500, 10000);
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES (sale3, pid_disjoncteur, 3, 650, 1950);

  -- Sale 4: Ahmed - paid
  INSERT INTO sales (client_id, total_amount, paid_amount, remaining, status, sale_date)
  VALUES (cid_ahmed, 5400, 5400, 0, 'paid', CURRENT_DATE - 12)
  RETURNING id INTO sale4;
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES (sale4, pid_marteau, 3, 1200, 3600);
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES (sale4, pid_cable, 6, 300, 1800);

  -- Sale 5: Yacine - partial
  INSERT INTO sales (client_id, total_amount, paid_amount, remaining, status, sale_date)
  VALUES (cid_yacine, 4800, 2400, 2400, 'partial', CURRENT_DATE - 2)
  RETURNING id INTO sale5;
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES (sale5, pid_ciment, 3, 1300, 3900);
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES (sale5, pid_tournevis, 1, 750, 750);

END $$;

-- Client payments
INSERT INTO client_payments (client_id, amount, payment_date, note)
SELECT c.id, 5000, CURRENT_DATE - 8, 'Versement partiel' FROM clients c WHERE c.full_name = 'Ahmed Benali';

INSERT INTO client_payments (client_id, amount, payment_date, note)
SELECT c.id, 2400, CURRENT_DATE - 2, 'Acompte reçu' FROM clients c WHERE c.full_name = 'Yacine Toumi';

INSERT INTO client_payments (client_id, amount, payment_date, note)
SELECT c.id, 1500, CURRENT_DATE - 4, 'Paiement espèces' FROM clients c WHERE c.full_name = 'Sara Khelifi';

-- Supplier orders
DO $$
DECLARE
  sid_batna uuid;
  sid_electro uuid;
  sid_mega uuid;
  ord1 uuid;
  ord2 uuid;
  ord3 uuid;
  ord4 uuid;
  pid_marteau uuid;
  pid_perceuse uuid;
  pid_peinture uuid;
  pid_ciment uuid;
  pid_tournevis uuid;
BEGIN
  SELECT id INTO sid_batna FROM suppliers WHERE name = 'SARL Batna Tools' LIMIT 1;
  SELECT id INTO sid_electro FROM suppliers WHERE name = 'ElectroSupply DZ' LIMIT 1;
  SELECT id INTO sid_mega FROM suppliers WHERE name = 'MegaBuild Algeria' LIMIT 1;
  SELECT id INTO pid_marteau FROM products WHERE name = 'Marteau Professionnel' LIMIT 1;
  SELECT id INTO pid_perceuse FROM products WHERE name = 'Perceuse Électrique' LIMIT 1;
  SELECT id INTO pid_peinture FROM products WHERE name = 'Seau de Peinture 5L' LIMIT 1;
  SELECT id INTO pid_ciment FROM products WHERE name = 'Ciment 50kg' LIMIT 1;
  SELECT id INTO pid_tournevis FROM products WHERE name = 'Tournevis Set 6pcs' LIMIT 1;

  INSERT INTO supplier_orders (supplier_id, total_amount, paid_amount, remaining, status, order_date)
  VALUES (sid_batna, 24000, 9000, 15000, 'partial', CURRENT_DATE - 10) RETURNING id INTO ord1;
  INSERT INTO supplier_order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES (ord1, pid_marteau, 20, 800, 16000);
  INSERT INTO supplier_order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES (ord1, pid_tournevis, 10, 450, 4500);

  INSERT INTO supplier_orders (supplier_id, total_amount, paid_amount, remaining, status, order_date)
  VALUES (sid_electro, 8000, 0, 8000, 'unpaid', CURRENT_DATE - 8) RETURNING id INTO ord2;
  INSERT INTO supplier_order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES (ord2, pid_perceuse, 2, 5500, 11000);

  INSERT INTO supplier_orders (supplier_id, total_amount, paid_amount, remaining, status, order_date)
  VALUES (sid_mega, 22000, 0, 22000, 'unpaid', CURRENT_DATE - 15) RETURNING id INTO ord3;
  INSERT INTO supplier_order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES (ord3, pid_peinture, 8, 1600, 12800);
  INSERT INTO supplier_order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES (ord3, pid_ciment, 7, 850, 5950);

  INSERT INTO supplier_orders (supplier_id, total_amount, paid_amount, remaining, status, order_date)
  VALUES (sid_batna, 18000, 18000, 0, 'paid', CURRENT_DATE - 20) RETURNING id INTO ord4;
  INSERT INTO supplier_order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES (ord4, pid_marteau, 15, 800, 12000);

END $$;

-- Supplier payments
INSERT INTO supplier_payments (supplier_id, amount, payment_date, note)
SELECT s.id, 9000, CURRENT_DATE - 9, 'Virement bancaire' FROM suppliers s WHERE s.name = 'SARL Batna Tools';

INSERT INTO supplier_payments (supplier_id, amount, payment_date, note)
SELECT s.id, 3000, CURRENT_DATE - 6, 'Espèces' FROM suppliers s WHERE s.name = 'ElectroSupply DZ';

-- Treasury
INSERT INTO treasury_transactions (type, amount, source, note, transaction_date) VALUES
  ('manual_add', 50000, 'Caisse initiale', 'Fond de caisse de départ', CURRENT_DATE - 30),
  ('sale_in', 5400, 'Vente - Ahmed Benali', '', CURRENT_DATE - 12),
  ('sale_in', 2400, 'Vente partielle - Yacine Toumi', 'Acompte', CURRENT_DATE - 2),
  ('supplier_out', 9000, 'Commande - SARL Batna Tools', '', CURRENT_DATE - 9),
  ('supplier_out', 3000, 'Commande - ElectroSupply DZ', '', CURRENT_DATE - 6),
  ('client_payment_in', 5000, 'Versement Ahmed Benali', '', CURRENT_DATE - 8),
  ('client_payment_in', 2400, 'Versement Yacine Toumi', '', CURRENT_DATE - 2),
  ('client_payment_in', 1500, 'Versement Sara Khelifi', '', CURRENT_DATE - 4),
  ('manual_add', 8000, 'Recettes diverses', 'Ventes comptant', CURRENT_DATE - 5);
