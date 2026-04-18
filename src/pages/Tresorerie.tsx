import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import type { TreasuryType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Wallet, CircleArrowUp as ArrowUpCircle, CircleArrowDown as ArrowDownCircle, Plus } from 'lucide-react';

const fmt = (n: number) => n.toLocaleString('fr-DZ') + ' DA';

const typeLabels: Record<TreasuryType, string> = {
  sale_in: 'Vente',
  client_payment_in: 'Versement client',
  income: 'Entrée',
  manual_add: 'Ajout manuel',
  supplier_out: 'Commande fournisseur',
  supplier_payment_out: 'Paiement fournisseur',
  expense: 'Dépense',
  manual_remove: 'Retrait manuel',
};

const isInflow = (type: TreasuryType) =>
  ['sale_in', 'client_payment_in', 'income', 'manual_add'].includes(type);

export function Tresorerie() {
  const { treasury, addTreasuryEntry } = useApp();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const totalIn = treasury.filter(t => isInflow(t.type)).reduce((s, t) => s + t.amount, 0);
  const totalOut = treasury.filter(t => !isInflow(t.type)).reduce((s, t) => s + t.amount, 0);
  const balance = totalIn - totalOut;

  const handleAdd = async () => {
    if (!amount || !note) return;
    setSaving(true);
    await addTreasuryEntry('manual_add', parseFloat(amount), note);
    setAmount('');
    setNote('');
    setSaving(false);
    setAddDialogOpen(false);
  };

  const handleRemove = async () => {
    if (!amount || !note) return;
    setSaving(true);
    await addTreasuryEntry('manual_remove', parseFloat(amount), note);
    setAmount('');
    setNote('');
    setSaving(false);
    setRemoveDialogOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Balance cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-primary/30">
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Solde actuel</p>
                <p className={`text-3xl font-bold ${balance >= 0 ? 'text-primary' : 'text-destructive'}`}>{fmt(balance)}</p>
              </div>
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wallet className="size-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-success/30">
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total entrées</p>
                <p className="text-3xl font-bold text-success">{fmt(totalIn)}</p>
              </div>
              <div className="size-10 rounded-lg bg-success/10 flex items-center justify-center">
                <ArrowUpCircle className="size-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/30">
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total sorties</p>
                <p className="text-3xl font-bold text-destructive">{fmt(totalOut)}</p>
              </div>
              <div className="size-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <ArrowDownCircle className="size-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={() => setAddDialogOpen(true)} variant="default" className="gap-2">
          <ArrowUpCircle className="size-4" /> Ajouter une entrée
        </Button>
        <Button onClick={() => setRemoveDialogOpen(true)} variant="destructive" className="gap-2">
          <ArrowDownCircle className="size-4" /> Enregistrer une sortie
        </Button>
      </div>

      <Separator />

      {/* Transaction history */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Historique des transactions ({treasury.length})</h2>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {treasury.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      <Wallet className="size-8 mx-auto mb-2 opacity-30" />
                      Aucune transaction
                    </TableCell>
                  </TableRow>
                ) : treasury.map(t => {
                  const inflow = isInflow(t.type);
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="text-muted-foreground">
                        {new Date(t.created_at).toLocaleDateString('fr-DZ')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={inflow ? 'default' : 'destructive'} className={`text-xs ${inflow ? 'bg-success/10 text-success border-success/30' : ''}`}>
                          {inflow ? '↑' : '↓'} {typeLabels[t.type] || t.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{t.source}</TableCell>
                      <TableCell className="text-muted-foreground">{t.note || '—'}</TableCell>
                      <TableCell className={`text-right font-bold ${inflow ? 'text-success' : 'text-destructive'}`}>
                        {inflow ? '+' : '-'}{fmt(t.amount)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpCircle className="size-5 text-success" /> Ajouter une entrée
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Montant (DA) *</Label>
              <Input type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label>Libellé / Motif *</Label>
              <Input value={note} onChange={e => setNote(e.target.value)} placeholder="Ex: Règlement facture, Recette journalière..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleAdd} disabled={saving || !amount || !note} className="bg-success hover:bg-success/90">
              <Plus className="size-4 mr-1" /> {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Dialog */}
      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowDownCircle className="size-5 text-destructive" /> Enregistrer une sortie
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Montant (DA) *</Label>
              <Input type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label>Libellé / Motif *</Label>
              <Input value={note} onChange={e => setNote(e.target.value)} placeholder="Ex: Loyer, Electricité, Dépense..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleRemove} disabled={saving || !amount || !note} variant="destructive">
              {saving ? 'Enregistrement...' : 'Enregistrer la sortie'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
