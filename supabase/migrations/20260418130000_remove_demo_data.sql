/*
  # Remove all demo data
*/

-- Delete all demo data
DELETE FROM treasury_transactions;
DELETE FROM supplier_payments;
DELETE FROM supplier_order_items;
DELETE FROM supplier_orders;
DELETE FROM client_payments;
DELETE FROM sale_items;
DELETE FROM sales;
DELETE FROM products;
DELETE FROM clients;
DELETE FROM suppliers;

-- Keep only admin user, remove demo users
DELETE FROM app_users WHERE username != 'admin';

-- Reset admin user
UPDATE app_users 
SET full_name = 'Administrator', 
    email = 'admin@gestionpro.dz',
    is_active = true
WHERE username = 'admin';
