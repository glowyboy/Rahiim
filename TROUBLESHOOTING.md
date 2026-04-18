# Troubleshooting Guide

## Issue: Data not updating after purchases/sales

### Step 1: Check Database Connection

1. Open browser console (F12)
2. Look for any red error messages
3. Check if you see messages like:
   - "Processing sale: ..."
   - "Sale created: ..."
   - "Stock updated for ..."
   - "Treasury updated: ..."

### Step 2: Verify Database Schema

The most common issue is that the database tables don't exist yet.

**Solution:**
1. Go to https://toqxppdffjrnrrqntxyb.supabase.co
2. Click "SQL Editor"
3. Run the SQL from `supabase/migrations/00000000000000_initial_schema.sql`
4. Refresh your app

### Step 3: Check for Specific Errors

#### Error: "relation does not exist"
- **Cause:** Database tables haven't been created
- **Fix:** Run the initial schema migration (see DATABASE_SETUP.md)

#### Error: "null value in column violates not-null constraint"
- **Cause:** Missing required fields
- **Fix:** Ensure all required fields are filled in forms

#### Error: "permission denied"
- **Cause:** Supabase RLS (Row Level Security) is enabled
- **Fix:** Disable RLS or add policies:
  ```sql
  -- Run in Supabase SQL Editor
  ALTER TABLE app_users DISABLE ROW LEVEL SECURITY;
  ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
  ALTER TABLE products DISABLE ROW LEVEL SECURITY;
  ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
  ALTER TABLE sales DISABLE ROW LEVEL SECURITY;
  ALTER TABLE sale_items DISABLE ROW LEVEL SECURITY;
  ALTER TABLE client_payments DISABLE ROW LEVEL SECURITY;
  ALTER TABLE supplier_orders DISABLE ROW LEVEL SECURITY;
  ALTER TABLE supplier_order_items DISABLE ROW LEVEL SECURITY;
  ALTER TABLE supplier_payments DISABLE ROW LEVEL SECURITY;
  ALTER TABLE treasury_transactions DISABLE ROW LEVEL SECURITY;
  ```

### Step 4: Test Each Feature

1. **Add Supplier:**
   - Go to Fournisseurs page
   - Click "Ajouter"
   - Fill in company name
   - Save
   - Check console for "Supplier added" or errors

2. **Add Product:**
   - Go to Articles page
   - Click "Ajouter"
   - Fill in name and selling price
   - Save
   - Check console for errors

3. **Make a Sale:**
   - Go to Gestion Client > Caisse/POS
   - Add products to cart
   - Select client or leave as "Comptoir"
   - Enter paid amount
   - Click "Valider la vente"
   - Check console for:
     - "Processing sale: ..."
     - "Sale created: ..."
     - "Stock updated for ..."
     - "Treasury updated: ..."
     - "Sale process complete!"

4. **Check Stock:**
   - Go to Articles page
   - Verify stock decreased after sale
   - If not, check console errors

5. **Check Treasury:**
   - Go to Trésorerie page
   - Verify transaction appears
   - Check balance updated

### Step 5: Clear Cache

If data seems stuck:
1. Open browser console
2. Run: `localStorage.clear()`
3. Refresh page
4. Login again

### Step 6: Check Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by "supabase"
4. Make a sale/purchase
5. Check if requests are:
   - Sending (status 200 = success)
   - Failing (status 400/500 = error)
6. Click on failed requests to see error details

## Common Console Messages

### Success Messages:
```
Processing sale: {clientId: "...", cartItems: 2, paidAmount: 5000}
Sale created: abc-123-def
Stock updated for Marteau: 50 -> 48
Treasury updated: +5000 DA
Reloading all data...
Sale process complete!
```

### Error Messages:
```
Error creating sale: {message: "relation 'sales' does not exist"}
→ Fix: Run database migrations

Error updating stock: {message: "permission denied"}
→ Fix: Disable RLS (see above)

Error creating treasury transaction: {message: "null value in column"}
→ Fix: Check required fields
```

## Still Having Issues?

1. Check `.env` file has correct Supabase credentials
2. Verify Supabase project is active (not paused)
3. Check Supabase logs in dashboard
4. Try creating tables manually in Supabase SQL Editor
5. Restart dev server: `npm run dev`
