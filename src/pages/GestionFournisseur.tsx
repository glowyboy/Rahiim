import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import type { CartItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Package, Plus, Minus, Trash2, Search, CircleCheck as CheckCircle, ChevronDown, ChevronRight } from 'lucide-react';

const fmt = (n: number) => n.toLocaleString('fr-DZ') + ' DA';

// ──────────────────────────────────────────────────────────────────────────────
// Arrivage Tab (supplier order entry)
// ──────────────────────────────────────────────────────────────────────────────
function ArrivageTab() {
  const { products, suppliers, processSupplierOrder } = useApp();
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [supplierId, setSupplierId] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [note, setNote] = useState('');
  const [processing, setProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const filtered = products.filter(p => {
    if (!search) return true;
    return p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
  });

  const addToCart = (product: typeof products[0]) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product, quantity: 1, unit_price: product.purchase_price }];
    });
  };

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(i => i.product.id !== productId));
    } else {
      setCart(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: qty } : i));
    }
  };

  const updatePrice = (productId: string, price: number) => {
    setCart(prev => prev.map(i => i.product.id === productId ? { ...i, unit_price: price } : i));
  };

  const total = cart.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  const paid = parseFloat(paidAmount) || 0;
  const remaining = Math.max(0, total - paid);

  const handleSubmit = async () => {
    if (cart.length === 0 || !supplierId) return;
    setProcessing(true);
    await processSupplierOrder(supplierId, cart, paid, note);
    setCart([]);
    setSupplierId('');
    setPaidAmount('');
    setNote('');
    setSuccessMsg('Arrivage enregistré avec succès!');
    setTimeout(() => setSuccessMsg(''), 3000);
    setProcessing(false);
  };

  return (
    <div className="grid grid-cols-5 gap-4">
      {/* Product grid */}
      <div className="col-span-3 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Rechercher un article..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="grid grid-cols-3 gap-2 max-h-[calc(100vh-260px)] overflow-y-auto pr-1">
          {filtered.map(p => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              className="text-left p-3 rounded-lg border bg-card hover:bg-accent hover:border-primary/30 transition-colors"
            >
              <p className="text-sm font-medium truncate">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.category}</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm font-bold text-primary">{fmt(p.purchase_price)}</p>
                <Badge variant="secondary" className="text-xs">Stock: {p.stock}</Badge>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart */}
      <div className="col-span-2 flex flex-col gap-3">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="py-3 px-4 border-b">
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="size-4" /> Arrivage ({cart.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">
                <Package className="size-8 mx-auto mb-2 opacity-30" />
                Liste vide
              </div>
            ) : cart.map(item => (
              <div key={item.product.id} className="px-4 py-2 border-b last:border-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium flex-1 truncate">{item.product.name}</p>
                  <button onClick={() => setCart(prev => prev.filter(i => i.product.id !== item.product.id))}>
                    <Trash2 className="size-3.5 text-destructive" />
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <button onClick={() => updateQty(item.product.id, item.quantity - 1)} className="size-6 rounded-md border flex items-center justify-center hover:bg-accent">
                    <Minus className="size-3" />
                  </button>
                  <span className="text-xs w-6 text-center font-semibold">{item.quantity}</span>
                  <button onClick={() => updateQty(item.product.id, item.quantity + 1)} className="size-6 rounded-md border flex items-center justify-center hover:bg-accent">
                    <Plus className="size-3" />
                  </button>
                  <span className="text-xs text-muted-foreground mx-1">×</span>
                  <Input
                    type="number" min="0"
                    className="h-6 text-xs w-24"
                    value={item.unit_price}
                    onChange={e => updatePrice(item.product.id, parseFloat(e.target.value) || 0)}
                  />
                </div>
                <p className="text-xs text-right text-primary font-semibold mt-1">{fmt(item.unit_price * item.quantity)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            {successMsg && (
              <div className="bg-success/10 text-success text-xs px-3 py-2 rounded-md">{successMsg}</div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs">Fournisseur *</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Choisir le fournisseur..." />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.company_name || s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex justify-between text-sm font-bold">
              <span>Total</span>
              <span className="text-primary">{fmt(total)}</span>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Montant payé (DA)</Label>
              <Input
                type="number" min="0" className="h-8 text-sm"
                value={paidAmount}
                onChange={e => setPaidAmount(e.target.value)}
                placeholder="0"
              />
            </div>

            {paid < total && paid >= 0 && (
              <div className="flex justify-between text-sm text-destructive">
                <span>Reste à payer</span>
                <span className="font-semibold">{fmt(remaining)}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs">Note</Label>
              <Input className="h-8 text-xs" value={note} onChange={e => setNote(e.target.value)} placeholder="Optionnel" />
            </div>

            <Button onClick={handleSubmit} disabled={processing || cart.length === 0 || !supplierId} className="w-full gap-2">
              <CheckCircle className="size-4" />
              {processing ? 'Traitement...' : 'Valider l\'arrivage'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Bons de commande Tab
// ──────────────────────────────────────────────────────────────────────────────
function BonsTab() {
  const { supplierOrders } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = supplierOrders.filter(o => {
    const name = (o.supplier?.company_name || o.supplier?.name || '').toLowerCase();
    const matchSearch = name.includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="paid">Payé</SelectItem>
            <SelectItem value="partial">Partiel</SelectItem>
            <SelectItem value="unpaid">Impayé</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Fournisseur</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Payé</TableHead>
                <TableHead className="text-right">Reste</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Aucun bon de commande</TableCell></TableRow>
              ) : filtered.map(o => (
                <>
                  <TableRow key={o.id} className="cursor-pointer hover:bg-accent/50" onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}>
                    <TableCell>
                      {expandedId === o.id ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                    </TableCell>
                    <TableCell className="font-medium">{o.supplier?.company_name || o.supplier?.name || '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{new Date(o.created_at).toLocaleDateString('fr-DZ')}</TableCell>
                    <TableCell className="text-right">{fmt(o.total_amount)}</TableCell>
                    <TableCell className="text-right text-success">{fmt(o.paid_amount)}</TableCell>
                    <TableCell className="text-right text-destructive">{o.remaining > 0 ? fmt(o.remaining) : '—'}</TableCell>
                    <TableCell>
                      <Badge variant={o.status === 'paid' ? 'default' : o.status === 'partial' ? 'outline' : 'destructive'} className="text-xs">
                        {o.status === 'paid' ? 'Payé' : o.status === 'partial' ? 'Partiel' : 'Impayé'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  {expandedId === o.id && o.items && o.items.length > 0 && (
                    <TableRow key={`${o.id}-detail`}>
                      <TableCell colSpan={7} className="p-0 bg-muted/30">
                        <div className="px-8 py-3">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-muted-foreground">
                                <th className="text-left pb-1">Article</th>
                                <th className="text-center pb-1">Qté</th>
                                <th className="text-right pb-1">Prix unit.</th>
                                <th className="text-right pb-1">Sous-total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {o.items.map(item => (
                                <tr key={item.id} className="border-t border-border/50">
                                  <td className="py-1">{item.product?.name || item.product_id}</td>
                                  <td className="text-center py-1">{item.quantity}</td>
                                  <td className="text-right py-1">{fmt(item.unit_price)}</td>
                                  <td className="text-right py-1 font-semibold">{fmt(item.subtotal || item.unit_price * item.quantity)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {o.note && <p className="text-xs text-muted-foreground mt-2">Note: {o.note}</p>}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Versements Tab
// ──────────────────────────────────────────────────────────────────────────────
function VersementsTab() {
  const { suppliers, supplierPayments, addSupplierPayment } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const suppliersWithDebt = suppliers.filter(s => s.debt > 0);

  const handleSave = async () => {
    if (!selectedSupplier || !amount) return;
    setSaving(true);
    await addSupplierPayment(selectedSupplier, parseFloat(amount), note);
    setSelectedSupplier('');
    setAmount('');
    setNote('');
    setSaving(false);
    setDialogOpen(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium">Fournisseurs avec dettes</p>
          <p className="text-xs text-muted-foreground">{suppliersWithDebt.length} fournisseur(s)</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2" disabled={suppliersWithDebt.length === 0}>
          <Plus className="size-4" /> Enregistrer paiement
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        {suppliersWithDebt.map(s => (
          <Card key={s.id} className="border-destructive/30">
            <CardContent className="pt-4">
              <p className="font-semibold text-sm">{s.company_name || s.name}</p>
              <p className="text-xs text-muted-foreground">{s.activity}</p>
              <p className="text-lg font-bold text-destructive mt-2">{fmt(s.debt)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fournisseur</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead>Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supplierPayments.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Aucun paiement</TableCell></TableRow>
              ) : supplierPayments.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.supplier?.company_name || p.supplier?.name || '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(p.created_at).toLocaleDateString('fr-DZ')}</TableCell>
                  <TableCell className="text-right text-destructive font-semibold">{fmt(p.amount)}</TableCell>
                  <TableCell className="text-muted-foreground">{p.note || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Enregistrer un paiement fournisseur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Fournisseur *</Label>
              <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                <SelectContent>
                  {suppliersWithDebt.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.company_name || s.name} — dette: {fmt(s.debt)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Montant (DA) *</Label>
              <Input type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label>Note</Label>
              <Input value={note} onChange={e => setNote(e.target.value)} placeholder="Optionnel" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={saving || !selectedSupplier || !amount}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Historique Tab
// ──────────────────────────────────────────────────────────────────────────────
function HistoriqueTab() {
  const { suppliers, supplierOrders, supplierPayments } = useApp();
  const [selectedSupplier, setSelectedSupplier] = useState('');

  const supplierOrdersFiltered = selectedSupplier ? supplierOrders.filter(o => o.supplier_id === selectedSupplier) : [];
  const supplierPaymentsFiltered = selectedSupplier ? supplierPayments.filter(p => p.supplier_id === selectedSupplier) : [];
  const selectedSupplierData = suppliers.find(s => s.id === selectedSupplier);

  return (
    <div className="space-y-4">
      <div className="max-w-sm">
        <Label className="mb-1.5 block text-sm">Sélectionner un fournisseur</Label>
        <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
          <SelectTrigger><SelectValue placeholder="Choisir un fournisseur..." /></SelectTrigger>
          <SelectContent>
            {suppliers.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.company_name || s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedSupplierData && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-xl font-bold">{fmt(selectedSupplierData.total_orders)}</p>
                <p className="text-xs text-muted-foreground">Total commandes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-xl font-bold text-success">{fmt(supplierPaymentsFiltered.reduce((s, p) => s + p.amount, 0))}</p>
                <p className="text-xs text-muted-foreground">Total paiements</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-xl font-bold text-destructive">{fmt(selectedSupplierData.debt)}</p>
                <p className="text-xs text-muted-foreground">Dette actuelle</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Commandes ({supplierOrdersFiltered.length})</h3>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {supplierOrdersFiltered.length === 0 ? (
                        <TableRow><TableCell colSpan={3} className="text-center py-4 text-muted-foreground text-sm">Aucune commande</TableCell></TableRow>
                      ) : supplierOrdersFiltered.map(o => (
                        <TableRow key={o.id}>
                          <TableCell className="text-xs">{new Date(o.created_at).toLocaleDateString('fr-DZ')}</TableCell>
                          <TableCell className="text-right text-xs">{fmt(o.total_amount)}</TableCell>
                          <TableCell>
                            <Badge variant={o.status === 'paid' ? 'default' : o.status === 'partial' ? 'outline' : 'destructive'} className="text-[10px] h-4">
                              {o.status === 'paid' ? 'Payé' : o.status === 'partial' ? 'Partiel' : 'Impayé'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">Paiements ({supplierPaymentsFiltered.length})</h3>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Montant</TableHead>
                        <TableHead>Note</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {supplierPaymentsFiltered.length === 0 ? (
                        <TableRow><TableCell colSpan={3} className="text-center py-4 text-muted-foreground text-sm">Aucun paiement</TableCell></TableRow>
                      ) : supplierPaymentsFiltered.map(p => (
                        <TableRow key={p.id}>
                          <TableCell className="text-xs">{new Date(p.created_at).toLocaleDateString('fr-DZ')}</TableCell>
                          <TableCell className="text-right text-xs text-destructive font-semibold">{fmt(p.amount)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{p.note || '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────────────────────────────────────
export function GestionFournisseur() {
  return (
    <div className="p-6 h-full flex flex-col">
      <Tabs defaultValue="arrivage" className="flex-1 flex flex-col">
        <TabsList className="w-fit mb-4">
          <TabsTrigger value="arrivage">Arrivage</TabsTrigger>
          <TabsTrigger value="bons">Bons de commande</TabsTrigger>
          <TabsTrigger value="versements">Paiements</TabsTrigger>
          <TabsTrigger value="historique">Historique fournisseur</TabsTrigger>
        </TabsList>
        <TabsContent value="arrivage" className="flex-1 mt-0">
          <ArrivageTab />
        </TabsContent>
        <TabsContent value="bons" className="mt-0">
          <BonsTab />
        </TabsContent>
        <TabsContent value="versements" className="mt-0">
          <VersementsTab />
        </TabsContent>
        <TabsContent value="historique" className="mt-0">
          <HistoriqueTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
