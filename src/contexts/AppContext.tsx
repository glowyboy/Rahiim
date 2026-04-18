import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type {
  AppUser, Supplier, Product, Client, Sale, SaleItem,
  ClientPayment, SupplierOrder, SupplierOrderItem, SupplierPayment,
  TreasuryTransaction, CartItem
} from '@/lib/types';
import type { Language } from '@/lib/translations';
import { getTranslation } from '@/lib/translations';

interface AppContextValue {
  currentUser: AppUser | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;

  users: AppUser[];
  addUser: (u: Omit<AppUser, 'id' | 'created_at'>) => Promise<void>;
  updateUser: (id: string, u: Partial<AppUser>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  suppliers: Supplier[];
  addSupplier: (s: Omit<Supplier, 'id' | 'created_at' | 'total_orders' | 'debt'>) => Promise<void>;
  updateSupplier: (id: string, s: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;

  products: Product[];
  addProduct: (p: Omit<Product, 'id' | 'created_at' | 'supplier'>) => Promise<void>;
  updateProduct: (id: string, p: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  clients: Client[];
  addClient: (c: Omit<Client, 'id' | 'created_at' | 'total_purchases' | 'debt'>) => Promise<void>;
  updateClient: (id: string, c: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;

  sales: Sale[];
  processSale: (clientId: string | undefined, cart: CartItem[], paidAmount: number, note?: string) => Promise<void>;
  addClientPayment: (clientId: string, amount: number, note?: string) => Promise<void>;

  clientPayments: ClientPayment[];

  supplierOrders: SupplierOrder[];
  processSupplierOrder: (supplierId: string, items: CartItem[], paidAmount: number, note?: string) => Promise<void>;
  addSupplierPayment: (supplierId: string, amount: number, note?: string) => Promise<void>;

  supplierPayments: SupplierPayment[];

  treasury: TreasuryTransaction[];
  addTreasuryEntry: (type: 'manual_add' | 'manual_remove', amount: number, note: string) => Promise<void>;

  loading: boolean;
  navigate: (page: string) => void;
  currentPage: string;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    try { return JSON.parse(localStorage.getItem('currentUser') || 'null'); } catch { return null; }
  });
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [language, setLanguageState] = useState<Language>(() => {
    try { return (localStorage.getItem('appLanguage') as Language) || 'fr'; } catch { return 'fr'; }
  });

  const [users, setUsers] = useState<AppUser[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [clientPayments, setClientPayments] = useState<ClientPayment[]>([]);
  const [supplierOrders, setSupplierOrders] = useState<SupplierOrder[]>([]);
  const [supplierPayments, setSupplierPayments] = useState<SupplierPayment[]>([]);
  const [treasury, setTreasury] = useState<TreasuryTransaction[]>([]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [
      { data: usersData },
      { data: suppliersData },
      { data: productsData },
      { data: clientsData },
      { data: salesData },
      { data: saleItemsData },
      { data: clientPaymentsData },
      { data: supplierOrdersData },
      { data: supplierOrderItemsData },
      { data: supplierPaymentsData },
      { data: treasuryData },
    ] = await Promise.all([
      supabase.from('app_users').select('*').order('created_at'),
      supabase.from('suppliers').select('*').order('name'),
      supabase.from('products').select('*').order('name'),
      supabase.from('clients').select('*').order('full_name'),
      supabase.from('sales').select('*').order('created_at', { ascending: false }),
      supabase.from('sale_items').select('*'),
      supabase.from('client_payments').select('*').order('created_at', { ascending: false }),
      supabase.from('supplier_orders').select('*').order('created_at', { ascending: false }),
      supabase.from('supplier_order_items').select('*'),
      supabase.from('supplier_payments').select('*').order('created_at', { ascending: false }),
      supabase.from('treasury_transactions').select('*').order('created_at', { ascending: false }),
    ]);

    setUsers((usersData || []) as AppUser[]);

    const suppList = (suppliersData || []) as Supplier[];
    setSuppliers(suppList);

    const prodList = (productsData || []) as Product[];
    setProducts(prodList.map(p => ({
      ...p,
      stock: p.stock ?? p.stock_quantity,
      supplier: suppList.find(s => s.id === p.supplier_id),
    })));

    const clientList = (clientsData || []) as Client[];
    setClients(clientList);

    const itemsMap = new Map<string, SaleItem[]>();
    for (const item of (saleItemsData || [])) {
      const si = item as SaleItem;
      si.product = prodList.find(p => p.id === si.product_id);
      if (!itemsMap.has(si.sale_id)) itemsMap.set(si.sale_id, []);
      itemsMap.get(si.sale_id)!.push(si);
    }
    setSales(((salesData || []) as Sale[]).map(s => ({
      ...s,
      client: clientList.find(c => c.id === s.client_id),
      items: itemsMap.get(s.id) || [],
    })));

    setClientPayments(((clientPaymentsData || []) as ClientPayment[]).map(p => ({
      ...p,
      client: clientList.find(c => c.id === p.client_id),
    })));

    const orderItemsMap = new Map<string, SupplierOrderItem[]>();
    for (const item of (supplierOrderItemsData || [])) {
      const oi = item as SupplierOrderItem;
      oi.product = prodList.find(p => p.id === oi.product_id);
      if (!orderItemsMap.has(oi.order_id)) orderItemsMap.set(oi.order_id, []);
      orderItemsMap.get(oi.order_id)!.push(oi);
    }
    setSupplierOrders(((supplierOrdersData || []) as SupplierOrder[]).map(o => ({
      ...o,
      supplier: suppList.find(s => s.id === o.supplier_id),
      items: orderItemsMap.get(o.id) || [],
    })));

    setSupplierPayments(((supplierPaymentsData || []) as SupplierPayment[]).map(p => ({
      ...p,
      supplier: suppList.find(s => s.id === p.supplier_id),
    })));

    setTreasury((treasuryData || []) as TreasuryTransaction[]);
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const login = async (username: string, password: string) => {
    const { data } = await supabase
      .from('app_users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .eq('is_active', true)
      .maybeSingle();
    if (data) {
      setCurrentUser(data as AppUser);
      localStorage.setItem('currentUser', JSON.stringify(data));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setCurrentPage('dashboard');
  };

  const navigate = (page: string) => setCurrentPage(page);
  
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('appLanguage', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };
  
  const t = (key: string) => getTranslation(language, key);
  
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  // ── Users ──
  const addUser = async (u: Omit<AppUser, 'id' | 'created_at'>) => {
    const { data } = await supabase.from('app_users').insert(u).select().single();
    if (data) setUsers(prev => [...prev, data as AppUser]);
  };
  const updateUser = async (id: string, u: Partial<AppUser>) => {
    await supabase.from('app_users').update(u).eq('id', id);
    setUsers(prev => prev.map(x => x.id === id ? { ...x, ...u } : x));
    if (currentUser?.id === id) {
      const updated = { ...currentUser, ...u };
      setCurrentUser(updated);
      localStorage.setItem('currentUser', JSON.stringify(updated));
    }
  };
  const deleteUser = async (id: string) => {
    await supabase.from('app_users').delete().eq('id', id);
    setUsers(prev => prev.filter(x => x.id !== id));
  };

  // ── Suppliers ──
  const addSupplier = async (s: Omit<Supplier, 'id' | 'created_at' | 'total_orders' | 'debt'>) => {
    const { data } = await supabase.from('suppliers').insert({ ...s, name: s.company_name, total_orders: 0, debt: 0 }).select().single();
    if (data) setSuppliers(prev => [...prev, data as Supplier]);
  };
  const updateSupplier = async (id: string, s: Partial<Supplier>) => {
    const update = { ...s, ...(s.company_name ? { name: s.company_name } : {}) };
    await supabase.from('suppliers').update(update).eq('id', id);
    setSuppliers(prev => prev.map(x => x.id === id ? { ...x, ...s } : x));
  };
  const deleteSupplier = async (id: string) => {
    await supabase.from('suppliers').delete().eq('id', id);
    setSuppliers(prev => prev.filter(x => x.id !== id));
  };

  // ── Products ──
  const addProduct = async (p: Omit<Product, 'id' | 'created_at' | 'supplier'>) => {
    const { data } = await supabase.from('products').insert({ ...p, stock_quantity: p.stock }).select().single();
    if (data) {
      const newProd = { ...data as Product, stock: (data as Product).stock ?? (data as Product).stock_quantity };
      setProducts(prev => [...prev, { ...newProd, supplier: suppliers.find(s => s.id === newProd.supplier_id) }]);
    }
  };
  const updateProduct = async (id: string, p: Partial<Product>) => {
    const update = { ...p, ...(p.stock !== undefined ? { stock_quantity: p.stock } : {}) };
    await supabase.from('products').update(update).eq('id', id);
    setProducts(prev => prev.map(x => x.id === id ? { ...x, ...p, supplier: suppliers.find(s => s.id === (p.supplier_id ?? x.supplier_id)) } : x));
  };
  const deleteProduct = async (id: string) => {
    await supabase.from('products').delete().eq('id', id);
    setProducts(prev => prev.filter(x => x.id !== id));
  };

  // ── Clients ──
  const addClient = async (c: Omit<Client, 'id' | 'created_at' | 'total_purchases' | 'debt'>) => {
    const { data } = await supabase.from('clients').insert({ ...c, total_purchases: 0, debt: 0 }).select().single();
    if (data) setClients(prev => [...prev, data as Client]);
  };
  const updateClient = async (id: string, c: Partial<Client>) => {
    await supabase.from('clients').update(c).eq('id', id);
    setClients(prev => prev.map(x => x.id === id ? { ...x, ...c } : x));
  };
  const deleteClient = async (id: string) => {
    await supabase.from('clients').delete().eq('id', id);
    setClients(prev => prev.filter(x => x.id !== id));
  };

  // ── Sales / POS ──
  const processSale = async (clientId: string | undefined, cart: CartItem[], paidAmount: number, note = '') => {
    console.log('Processing sale:', { clientId, cartItems: cart.length, paidAmount });
    const total = cart.reduce((s, i) => s + i.unit_price * i.quantity, 0);
    const remaining = Math.max(0, total - paidAmount);
    const status = paidAmount >= total ? 'paid' : paidAmount > 0 ? 'partial' : 'unpaid';

    const { data: saleData, error: saleError } = await supabase.from('sales').insert({
      client_id: clientId || null,
      total_amount: total,
      paid_amount: paidAmount,
      remaining,
      status,
      note,
      sale_date: new Date().toISOString().split('T')[0],
    }).select().single();

    if (saleError) {
      console.error('Error creating sale:', saleError);
      return;
    }
    if (!saleData) return;
    const sale = saleData as Sale;
    console.log('Sale created:', sale.id);

    const { error: itemsError } = await supabase.from('sale_items').insert(
      cart.map(i => ({
        sale_id: sale.id,
        product_id: i.product.id,
        quantity: i.quantity,
        unit_price: i.unit_price,
        subtotal: i.unit_price * i.quantity,
      }))
    );

    if (itemsError) {
      console.error('Error creating sale items:', itemsError);
    }

    // Reduce stock
    for (const item of cart) {
      const newStock = Math.max(0, item.product.stock - item.quantity);
      const { error: stockError } = await supabase.from('products').update({ stock: newStock, stock_quantity: newStock }).eq('id', item.product.id);
      if (stockError) {
        console.error('Error updating stock:', stockError);
      } else {
        console.log(`Stock updated for ${item.product.name}: ${item.product.stock} -> ${newStock}`);
      }
    }

    // Update client
    if (clientId) {
      const client = clients.find(c => c.id === clientId);
      if (client) {
        const { error: clientError } = await supabase.from('clients').update({
          total_purchases: client.total_purchases + total,
          debt: client.debt + remaining,
        }).eq('id', clientId);
        if (clientError) {
          console.error('Error updating client:', clientError);
        } else {
          console.log(`Client updated: debt ${client.debt} -> ${client.debt + remaining}`);
        }
      }
    }

    // Treasury: record paid amount
    if (paidAmount > 0) {
      const clientName = clientId ? clients.find(c => c.id === clientId)?.full_name || 'Comptoir' : 'Comptoir';
      const { error: treasuryError } = await supabase.from('treasury_transactions').insert({
        type: 'sale_in',
        amount: paidAmount,
        source: `Vente - ${clientName}`,
        note,
        transaction_date: new Date().toISOString().split('T')[0],
      });
      if (treasuryError) {
        console.error('Error creating treasury transaction:', treasuryError);
      } else {
        console.log(`Treasury updated: +${paidAmount} DA`);
      }
    }

    console.log('Reloading all data...');
    await loadAll();
    console.log('Sale process complete!');
  };

  const addClientPayment = async (clientId: string, amount: number, note = '') => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    await supabase.from('client_payments').insert({
      client_id: clientId,
      amount,
      note,
      payment_date: new Date().toISOString().split('T')[0],
    });

    await supabase.from('clients').update({ debt: Math.max(0, client.debt - amount) }).eq('id', clientId);

    await supabase.from('treasury_transactions').insert({
      type: 'client_payment_in',
      amount,
      source: `Versement ${client.full_name}`,
      note,
      transaction_date: new Date().toISOString().split('T')[0],
    });

    await loadAll();
  };

  // ── Supplier Orders ──
  const processSupplierOrder = async (supplierId: string, items: CartItem[], paidAmount: number, note = '') => {
    console.log('Processing supplier order:', { supplierId, items: items.length, paidAmount });
    const total = items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
    const remaining = Math.max(0, total - paidAmount);
    const status = paidAmount >= total ? 'paid' : paidAmount > 0 ? 'partial' : 'unpaid';

    const { data: orderData, error: orderError } = await supabase.from('supplier_orders').insert({
      supplier_id: supplierId,
      total_amount: total,
      paid_amount: paidAmount,
      remaining,
      status,
      note,
      order_date: new Date().toISOString().split('T')[0],
    }).select().single();

    if (orderError) {
      console.error('Error creating supplier order:', orderError);
      return;
    }
    if (!orderData) return;
    const order = orderData as SupplierOrder;
    console.log('Supplier order created:', order.id);

    const { error: itemsError } = await supabase.from('supplier_order_items').insert(
      items.map(i => ({
        order_id: order.id,
        product_id: i.product.id,
        quantity: i.quantity,
        unit_price: i.unit_price,
        subtotal: i.unit_price * i.quantity,
      }))
    );

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
    }

    // Increase stock
    for (const item of items) {
      const newStock = item.product.stock + item.quantity;
      const { error: stockError } = await supabase.from('products').update({ stock: newStock, stock_quantity: newStock }).eq('id', item.product.id);
      if (stockError) {
        console.error('Error updating stock:', stockError);
      } else {
        console.log(`Stock updated for ${item.product.name}: ${item.product.stock} -> ${newStock}`);
      }
    }

    // Update supplier
    const supplier = suppliers.find(s => s.id === supplierId);
    if (supplier) {
      const { error: supplierError } = await supabase.from('suppliers').update({
        total_orders: supplier.total_orders + total,
        debt: supplier.debt + remaining,
      }).eq('id', supplierId);
      if (supplierError) {
        console.error('Error updating supplier:', supplierError);
      } else {
        console.log(`Supplier updated: debt ${supplier.debt} -> ${supplier.debt + remaining}`);
      }
    }

    // Treasury: paid amount
    if (paidAmount > 0) {
      const supplierName = supplier?.company_name || supplier?.name || '';
      const { error: treasuryError } = await supabase.from('treasury_transactions').insert({
        type: 'supplier_out',
        amount: paidAmount,
        source: `Commande - ${supplierName}`,
        note,
        transaction_date: new Date().toISOString().split('T')[0],
      });
      if (treasuryError) {
        console.error('Error creating treasury transaction:', treasuryError);
      } else {
        console.log(`Treasury updated: -${paidAmount} DA`);
      }
    }

    console.log('Reloading all data...');
    await loadAll();
    console.log('Supplier order process complete!');
  };

  const addSupplierPayment = async (supplierId: string, amount: number, note = '') => {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (!supplier) return;

    await supabase.from('supplier_payments').insert({
      supplier_id: supplierId,
      amount,
      note,
      payment_date: new Date().toISOString().split('T')[0],
    });

    await supabase.from('suppliers').update({ debt: Math.max(0, supplier.debt - amount) }).eq('id', supplierId);

    await supabase.from('treasury_transactions').insert({
      type: 'supplier_payment_out',
      amount,
      source: `Paiement ${supplier.company_name || supplier.name}`,
      note,
      transaction_date: new Date().toISOString().split('T')[0],
    });

    await loadAll();
  };

  // ── Treasury ──
  const addTreasuryEntry = async (type: 'manual_add' | 'manual_remove', amount: number, note: string) => {
    await supabase.from('treasury_transactions').insert({
      type,
      amount,
      source: type === 'manual_add' ? 'Ajout manuel' : 'Retrait manuel',
      note,
      transaction_date: new Date().toISOString().split('T')[0],
    });
    await loadAll();
  };

  return (
    <AppContext.Provider value={{
      currentUser, login, logout,
      language, setLanguage, t,
      users, addUser, updateUser, deleteUser,
      suppliers, addSupplier, updateSupplier, deleteSupplier,
      products, addProduct, updateProduct, deleteProduct,
      clients, addClient, updateClient, deleteClient,
      sales, processSale, addClientPayment,
      clientPayments,
      supplierOrders, processSupplierOrder, addSupplierPayment,
      supplierPayments,
      treasury, addTreasuryEntry,
      loading, navigate, currentPage,
    }}>
      {children}
    </AppContext.Provider>
  );
}
