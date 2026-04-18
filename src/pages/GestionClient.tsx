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
import {
  ShoppingCart, Plus, Minus, Trash2, Search, CreditCard, ChevronDown, ChevronRight,
} from 'lucide-react';

const fmt = (n: number) => n.toLocaleString('fr-DZ') + ' DA';

// ──────────────────────────────────────────────────────────────────────────────
// POS Tab
// ──────────────────────────────────────────────────────────────────────────────
function PosTab() {
  const { products, clients, processSale } = useApp();
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [clientId, setClientId] = useState('');
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
        return prev.map(i => i.product.id === product.id
          ? { ...i, quantity: Math.min(i.quantity + 1, product.stock) }
          : i);
      }
      return [...prev, { product, quantity: 1, unit_price: product.selling_price }];
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
    if (cart.length === 0) return;
    setProcessing(true);
    const finalClientId = clientId === 'comptoir' ? undefined : clientId;
    await processSale(finalClientId, cart, paid, note);
    setCart([]);
    setClientId('');
    setPaidAmount('');
    setNote('');
    setSuccessMsg('Vente enregistrée avec succès!');
    setTimeout(() => setSuccessMsg(''), 3000);
    setProcessing(false);
  };

  return (
    <div className="grid grid-cols-5 gap-4 h-full">
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
              onClick={() => p.stock > 0 && addToCart(p)}
              disabled={p.stock === 0}
              className="text-left p-3 rounded-lg border bg-card hover:bg-accent hover:border-primary/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <p className="text-sm font-medium truncate">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.category}</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm font-bold text-primary">{fmt(p.selling_price)}</p>
                <Badge variant={p.stock === 0 ? 'destructive' : p.stock <= 5 ? 'outline' : 'secondary'} className="text-xs">
                  {p.stock}
                </Badge>
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
              <ShoppingCart className="size-4" /> Panier ({cart.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">
                <ShoppingCart className="size-8 mx-auto mb-2 opacity-30" />
                Panier vide
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
                  <button onClick={() => updateQty(item.product.id, Math.min(item.quantity + 1, item.product.stock))} className="size-6 rounded-md border flex items-center justify-center hover:bg-accent">
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

        {/* Order summary */}
        <Card>
          <CardContent className="p-4 space-y-3">
            {successMsg && (
              <div className="bg-success/10 text-success text-xs px-3 py-2 rounded-md">{successMsg}</div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs">Client (optionnel)</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Vente comptoir" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comptoir">Vente comptoir</SelectItem>
                  {clients.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.full_name} {c.debt > 0 && `(dette: ${fmt(c.debt)})`}
                    </SelectItem>
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
              <Label className="text-xs">Montant encaissé (DA)</Label>
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

            <Button onClick={handleSubmit} disabled={processing || cart.length === 0} className="w-full gap-2">
              <CreditCard className="size-4" />
              {processing ? 'Traitement...' : 'Valider la vente'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Factures Tab
// ──────────────────────────────────────────────────────────────────────────────
function FacturesTab() {
  const { sales } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = sales.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = (s.client?.full_name || 'Comptoir').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
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
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
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
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Payé</TableHead>
                <TableHead className="text-right">Reste</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Aucune facture</TableCell>
                </TableRow>
              ) : filtered.map(s => (
                <>
                  <TableRow key={s.id} className="cursor-pointer hover:bg-accent/50" onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}>
                    <TableCell>
                      {expandedId === s.id ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                    </TableCell>
                    <TableCell className="font-medium">{s.client?.full_name || 'Comptoir'}</TableCell>
                    <TableCell className="text-muted-foreground">{new Date(s.created_at).toLocaleDateString('fr-DZ')}</TableCell>
                    <TableCell className="text-right">{fmt(s.total_amount)}</TableCell>
                    <TableCell className="text-right text-success">{fmt(s.paid_amount)}</TableCell>
                    <TableCell className="text-right text-destructive">{s.remaining > 0 ? fmt(s.remaining) : '—'}</TableCell>
                    <TableCell>
                      <Badge variant={s.status === 'paid' ? 'default' : s.status === 'partial' ? 'outline' : 'destructive'} className="text-xs">
                        {s.status === 'paid' ? 'Payé' : s.status === 'partial' ? 'Partiel' : 'Impayé'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  {expandedId === s.id && s.items && s.items.length > 0 && (
                    <TableRow key={`${s.id}-detail`}>
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
                              {s.items.map(item => (
                                <tr key={item.id} className="border-t border-border/50">
                                  <td className="py-1">{item.product?.name || item.product_id}</td>
                                  <td className="text-center py-1">{item.quantity}</td>
                                  <td className="text-right py-1">{fmt(item.unit_price)}</td>
                                  <td className="text-right py-1 font-semibold">{fmt(item.subtotal || item.unit_price * item.quantity)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {s.note && <p className="text-xs text-muted-foreground mt-2">Note: {s.note}</p>}
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
  const { clients, clientPayments, addClientPayment } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const clientsWithDebt = clients.filter(c => c.debt > 0);

  const handleSave = async () => {
    if (!selectedClient || !amount) return;
    setSaving(true);
    await addClientPayment(selectedClient, parseFloat(amount), note);
    setSelectedClient('');
    setAmount('');
    setNote('');
    setSaving(false);
    setDialogOpen(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium">Clients avec dettes</p>
          <p className="text-xs text-muted-foreground">{clientsWithDebt.length} client(s)</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2" disabled={clientsWithDebt.length === 0}>
          <Plus className="size-4" /> Enregistrer versement
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        {clientsWithDebt.map(c => (
          <Card key={c.id} className="border-warning/30">
            <CardContent className="pt-4">
              <p className="font-semibold text-sm">{c.full_name}</p>
              <p className="text-xs text-muted-foreground">{c.phone}</p>
              <p className="text-lg font-bold text-warning mt-2">{fmt(c.debt)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead>Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Aucun versement</TableCell>
                </TableRow>
              ) : clientPayments.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.client?.full_name || '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(p.created_at).toLocaleDateString('fr-DZ')}</TableCell>
                  <TableCell className="text-right text-success font-semibold">{fmt(p.amount)}</TableCell>
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
            <DialogTitle>Enregistrer un versement client</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Client *</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un client..." />
                </SelectTrigger>
                <SelectContent>
                  {clientsWithDebt.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.full_name} — dette: {fmt(c.debt)}
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
            <Button onClick={handleSave} disabled={saving || !selectedClient || !amount}>
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
  const { clients, sales, clientPayments } = useApp();
  const [selectedClient, setSelectedClient] = useState('');

  const clientSales = selectedClient ? sales.filter(s => s.client_id === selectedClient) : [];
  const clientPaymentsFiltered = selectedClient ? clientPayments.filter(p => p.client_id === selectedClient) : [];
  const selectedClientData = clients.find(c => c.id === selectedClient);

  return (
    <div className="space-y-4">
      <div className="max-w-sm">
        <Label className="mb-1.5 block text-sm">Sélectionner un client</Label>
        <Select value={selectedClient} onValueChange={setSelectedClient}>
          <SelectTrigger>
            <SelectValue placeholder="Choisir un client..." />
          </SelectTrigger>
          <SelectContent>
            {clients.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedClientData && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-xl font-bold">{fmt(selectedClientData.total_purchases)}</p>
                <p className="text-xs text-muted-foreground">Total achats</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-xl font-bold text-success">{fmt(clientPaymentsFiltered.reduce((s, p) => s + p.amount, 0))}</p>
                <p className="text-xs text-muted-foreground">Total versements</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-xl font-bold text-warning">{fmt(selectedClientData.debt)}</p>
                <p className="text-xs text-muted-foreground">Dette actuelle</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Factures ({clientSales.length})</h3>
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
                      {clientSales.length === 0 ? (
                        <TableRow><TableCell colSpan={3} className="text-center py-4 text-muted-foreground text-sm">Aucune vente</TableCell></TableRow>
                      ) : clientSales.map(s => (
                        <TableRow key={s.id}>
                          <TableCell className="text-xs">{new Date(s.created_at).toLocaleDateString('fr-DZ')}</TableCell>
                          <TableCell className="text-right text-xs">{fmt(s.total_amount)}</TableCell>
                          <TableCell>
                            <Badge variant={s.status === 'paid' ? 'default' : s.status === 'partial' ? 'outline' : 'destructive'} className="text-[10px] h-4">
                              {s.status === 'paid' ? 'Payé' : s.status === 'partial' ? 'Partiel' : 'Impayé'}
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
              <h3 className="text-sm font-semibold mb-2">Versements ({clientPaymentsFiltered.length})</h3>
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
                      {clientPaymentsFiltered.length === 0 ? (
                        <TableRow><TableCell colSpan={3} className="text-center py-4 text-muted-foreground text-sm">Aucun versement</TableCell></TableRow>
                      ) : clientPaymentsFiltered.map(p => (
                        <TableRow key={p.id}>
                          <TableCell className="text-xs">{new Date(p.created_at).toLocaleDateString('fr-DZ')}</TableCell>
                          <TableCell className="text-right text-xs text-success font-semibold">{fmt(p.amount)}</TableCell>
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
export function GestionClient() {
  return (
    <div className="p-6 h-full flex flex-col">
      <Tabs defaultValue="pos" className="flex-1 flex flex-col">
        <TabsList className="w-fit mb-4">
          <TabsTrigger value="pos">Caisse / POS</TabsTrigger>
          <TabsTrigger value="factures">Factures</TabsTrigger>
          <TabsTrigger value="versements">Versements</TabsTrigger>
          <TabsTrigger value="historique">Historique client</TabsTrigger>
        </TabsList>
        <TabsContent value="pos" className="flex-1 mt-0">
          <PosTab />
        </TabsContent>
        <TabsContent value="factures" className="mt-0">
          <FacturesTab />
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
