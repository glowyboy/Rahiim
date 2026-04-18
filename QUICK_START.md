# 🚀 Quick Start - 5 Minutes Setup

## Step 1: Setup Database (2 minutes)

1. Open https://toqxppdffjrnrrqntxyb.supabase.co
2. Click **"SQL Editor"** in left sidebar
3. Click **"New Query"**
4. Copy ALL content from `supabase/migrations/00000000000000_initial_schema.sql`
5. Paste and click **"Run"**
6. Create another new query
7. Copy ALL content from `supabase/migrations/99999999999999_disable_rls.sql`
8. Paste and click **"Run"**

✅ Database is ready!

## Step 2: Start App (1 minute)

```bash
npm run dev
```

Open http://localhost:5173

## Step 3: Login

- Username: `admin`
- Password: `admin123`

## Step 4: Test Everything (2 minutes)

### Test 1: Add a Supplier
1. Click **"Fournisseurs"** in sidebar
2. Click **"Ajouter"**
3. Enter company name: "Test Supplier"
4. Click **"Enregistrer"**
5. ✅ Should appear in list

### Test 2: Add a Product
1. Click **"Articles"** in sidebar
2. Click **"Ajouter"**
3. Enter:
   - Name: "Test Product"
   - Selling Price: 1000
   - Stock: 50
4. Click **"Enregistrer"**
5. ✅ Should appear in list with stock 50

### Test 3: Make a Sale
1. Click **"Gestion Client"** > **"Caisse / POS"** tab
2. Click on "Test Product" to add to cart
3. Enter paid amount: 1000
4. Click **"Valider la vente"**
5. ✅ Success message appears

### Test 4: Verify Stock Updated
1. Click **"Articles"** in sidebar
2. ✅ "Test Product" stock should now be 49 (decreased by 1)

### Test 5: Check Purchase History
1. Click **"Achats"** in sidebar
2. ✅ Your sale should appear with "Comptoir" as client
3. Click the row to expand
4. ✅ Should show "Test Product" with quantity 1

### Test 6: Check Treasury
1. Click **"Trésorerie"** in sidebar
2. ✅ Should show transaction: "Vente - Comptoir" +1000 DA

## 🎉 Success!

If all tests passed, your app is working perfectly!

## ❌ If Something Failed

1. Open browser console (F12)
2. Look for red error messages
3. Common issues:

   **Error: "relation does not exist"**
   - Go back to Step 1 and run the SQL scripts again

   **Error: "permission denied"**
   - Run the RLS disable script from Step 1

   **No errors but data doesn't update**
   - Refresh the page (Ctrl+R)
   - Check Supabase dashboard > Table Editor to see if data is there

4. See `TROUBLESHOOTING.md` for detailed help

## 🌍 Change Language

1. Click **"Système"** in sidebar
2. Select language: Français / العربية / English
3. ✅ Interface updates immediately

## 💾 Backup Data

1. Click **"Système"** in sidebar
2. Click **"Exporter en JSON"** or **"Créer une sauvegarde"**
3. ✅ File downloads automatically

---

**Need help?** Check `TROUBLESHOOTING.md` or `README.md`
