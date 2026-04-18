import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import type { Supplier } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Pencil, Trash2, Truck } from 'lucide-react';

const fmt = (n: number) => n.toLocaleString('fr-DZ') + ' DA';

type FormData = {
  company_name: string; activity: string; phone: string; email: string;
  address: string; rc: string; nif: string; nis: string;
};
const emptyForm: FormData = {
  company_name: '', activity: '', phone: '', email: '',
  address: '', rc: '', nif: '', nis: '',
};

export function Fournisseurs() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useApp();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<Supplier | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const filtered = suppliers.filter(s => {
    const q = search.toLowerCase();
    const name = (s.company_name || s.name).toLowerCase();
    return name.includes(q) || s.phone.includes(q) || s.activity.toLowerCase().includes(q);
  });

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (s: Supplier) => {
    setEditItem(s);
    setForm({
      company_name: s.company_name || s.name, activity: s.activity, phone: s.phone,
      email: s.email, address: s.address, rc: s.rc, nif: s.nif, nis: s.nis,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.company_name) return;
    setSaving(true);
    if (editItem) {
      await updateSupplier(editItem.id, form);
    } else {
      await addSupplier({ ...form, name: form.company_name, logo_url: '' });
    }
    setSaving(false);
    setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteSupplier(deleteId);
    setDeleteId(null);
  };

  const totalDebt = suppliers.reduce((s, x) => s + x.debt, 0);

  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-3 gap-4 mb-2">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-primary">{suppliers.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Total fournisseurs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{fmt(suppliers.reduce((s, x) => s + x.total_orders, 0))}</p>
            <p className="text-xs text-muted-foreground mt-1">Total commandes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-destructive">{fmt(totalDebt)}</p>
            <p className="text-xs text-muted-foreground mt-1">Total dettes</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Rechercher un fournisseur..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="size-4" /> Ajouter
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Raison sociale</TableHead>
                <TableHead>Activité</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>RC / NIF</TableHead>
                <TableHead className="text-right">Total cmd</TableHead>
                <TableHead className="text-right">Dette</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    <Truck className="size-8 mx-auto mb-2 opacity-30" />
                    Aucun fournisseur trouvé
                  </TableCell>
                </TableRow>
              ) : filtered.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.company_name || s.name}</TableCell>
                  <TableCell>
                    {s.activity && <Badge variant="secondary">{s.activity}</Badge>}
                  </TableCell>
                  <TableCell>{s.phone || '—'}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{s.rc || s.nif ? `${s.rc} / ${s.nif}` : '—'}</TableCell>
                  <TableCell className="text-right">{fmt(s.total_orders)}</TableCell>
                  <TableCell className="text-right">
                    {s.debt > 0
                      ? <Badge variant="destructive">{fmt(s.debt)}</Badge>
                      : <Badge variant="default" className="bg-success text-success-foreground">0 DA</Badge>
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(s)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(s.id)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Modifier le fournisseur' : 'Ajouter un fournisseur'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1.5">
              <Label>Raison sociale *</Label>
              <Input value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} placeholder="Nom de l'entreprise" />
            </div>
            <div className="space-y-1.5">
              <Label>Activité</Label>
              <Input value={form.activity} onChange={e => setForm(f => ({ ...f, activity: e.target.value }))} placeholder="Électricité, Matériaux..." />
            </div>
            <div className="space-y-1.5">
              <Label>Téléphone</Label>
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Adresse</Label>
              <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>N° RC</Label>
              <Input value={form.rc} onChange={e => setForm(f => ({ ...f, rc: e.target.value }))} placeholder="Registre de commerce" />
            </div>
            <div className="space-y-1.5">
              <Label>NIF</Label>
              <Input value={form.nif} onChange={e => setForm(f => ({ ...f, nif: e.target.value }))} placeholder="N° d'identification fiscale" />
            </div>
            <div className="space-y-1.5">
              <Label>NIS</Label>
              <Input value={form.nis} onChange={e => setForm(f => ({ ...f, nis: e.target.value }))} placeholder="N° d'identification statistique" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={saving || !form.company_name}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le fournisseur ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
