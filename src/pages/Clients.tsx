import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import type { Client } from '@/lib/types';
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
import { Plus, Search, Pencil, Trash2, Users } from 'lucide-react';

const fmt = (n: number) => n.toLocaleString('fr-DZ') + ' DA';

type FormData = { full_name: string; phone: string; email: string; address: string };
const emptyForm: FormData = { full_name: '', phone: '', email: '', address: '' };

export function Clients() {
  const { clients, addClient, updateClient, deleteClient } = useApp();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<Client | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    return c.full_name.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q);
  });

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (c: Client) => {
    setEditItem(c);
    setForm({ full_name: c.full_name, phone: c.phone, email: c.email, address: c.address });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.full_name) return;
    setSaving(true);
    if (editItem) {
      await updateClient(editItem.id, form);
    } else {
      await addClient(form);
    }
    setSaving(false);
    setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteClient(deleteId);
    setDeleteId(null);
  };

  const totalDebt = clients.reduce((s, c) => s + c.debt, 0);

  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-3 gap-4 mb-2">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-primary">{clients.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Total clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-success">{clients.filter(c => c.debt === 0).length}</p>
            <p className="text-xs text-muted-foreground mt-1">Sans dette</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-warning">{fmt(totalDebt)}</p>
            <p className="text-xs text-muted-foreground mt-1">Total créances</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Rechercher un client..." value={search} onChange={e => setSearch(e.target.value)} />
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
                <TableHead>Nom</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Adresse</TableHead>
                <TableHead className="text-right">Total achats</TableHead>
                <TableHead className="text-right">Dette</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    <Users className="size-8 mx-auto mb-2 opacity-30" />
                    Aucun client trouvé
                  </TableCell>
                </TableRow>
              ) : filtered.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.full_name}</TableCell>
                  <TableCell>{c.phone || '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{c.email || '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{c.address || '—'}</TableCell>
                  <TableCell className="text-right">{fmt(c.total_purchases)}</TableCell>
                  <TableCell className="text-right">
                    {c.debt > 0
                      ? <Badge variant="destructive">{fmt(c.debt)}</Badge>
                      : <Badge variant="default" className="bg-success text-success-foreground">0 DA</Badge>
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(c)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(c.id)}>
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Modifier le client' : 'Ajouter un client'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Nom complet *</Label>
              <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Prénom Nom" />
            </div>
            <div className="space-y-1.5">
              <Label>Téléphone</Label>
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="0X XX XX XX XX" />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@exemple.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Adresse</Label>
              <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Adresse complète" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={saving || !form.full_name}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le client ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible. L'historique des achats sera conservé.</AlertDialogDescription>
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
