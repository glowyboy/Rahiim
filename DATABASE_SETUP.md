# Database Setup Instructions

## Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://toqxppdffjrnrrqntxyb.supabase.co
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the contents of `supabase/migrations/00000000000000_initial_schema.sql`
5. Click "Run" to execute the schema
6. The database is now set up!

## Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Link to your project
supabase link --project-ref toqxppdffjrnrrqntxyb

# Push migrations
supabase db push
```

## Verify Setup

After running the migration, you should have these tables:
- app_users
- suppliers
- products
- clients
- sales
- sale_items
- client_payments
- supplier_orders
- supplier_order_items
- supplier_payments
- treasury_transactions

## Default Login

- Username: `admin`
- Password: `admin123`

## Testing the App

1. Start the dev server: `npm run dev`
2. Open http://localhost:5173
3. Login with admin credentials
4. Try these actions to verify everything works:
   - Add a supplier (Fournisseurs page)
   - Add a product (Articles page)
   - Add a client (Clients page)
   - Make a sale (Gestion Client > Caisse/POS)
   - Check that stock decreases
   - Check that treasury updates
   - View purchase history (Achats page)

## Troubleshooting

If data doesn't update:
1. Check browser console for errors
2. Verify Supabase connection in Network tab
3. Check that .env file has correct credentials
4. Ensure migrations were applied successfully
5. Check Supabase logs in the dashboard
