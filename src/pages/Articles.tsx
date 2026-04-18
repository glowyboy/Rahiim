import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import type { Product } from '@/lib/types';
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Pencil, Trash2, Package } from 'lucide-react';

const fmt = (n: number) => n.toLocaleString('fr-DZ') + ' DA';

type FormData = {
  name: string;
  category: string;
  purchase_price: string;
  selling_price: string;
  stock: string;
  supplier_id: string;
};

const emptyForm: FormData = {
  name: '', category: '', purchase_price: '', selling_price: '', stock: '', supplier_id: '',
};

export function Articles() {
  const { products, suppliers, addProduct, updateProduct, deleteProduct } = useApp();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))].sort();

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (p: Product) => {
    setEditItem(p);
    setForm({
      name: p.name, category: p.category, purchase_price: String(p.purchase_price),
      selling_price: String(p.selling_price), stock: String(p.stock),
      supplier_id: p.supplier_id || 'none',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.selling_price) return;
    setSaving(true);
    const payload = {
      name: form.name,
      category: form.category,
      purchase_price: parseFloat(form.purchase_price) || 0,
      selling_price: parseFloat(form.selling_price) || 0,
      stock: parseInt(form.stock) || 0,
      stock_quantity: parseInt(form.stock) || 0,
      supplier_id: (form.supplier_id && form.supplier_id !== 'none') ? form.supplier_id : null,
      image_url: '',
    };
    if (editItem) {
      await updateProduct(editItem.id, payload);
    } else {
      await addProduct(payload);
    }
    setSaving(false);
    setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteProduct(deleteId);
    setDeleteId(null);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Rechercher un article..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
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
                <TableHead>Article</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead className="text-right">Prix achat</TableHead>
                <TableHead className="text-right">Prix vente</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead>Fournisseur</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    <Package className="size-8 mx-auto mb-2 opacity-30" />
                    Aucun article trouvé
                  </TableCell>
                </TableRow>
              ) : filtered.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>
                    {p.category && <Badge variant="secondary">{p.category}</Badge>}
                  </TableCell>
                  <TableCell className="text-right">{fmt(p.purchase_price)}</TableCell>
                  <TableCell className="text-right font-semibold text-primary">{fmt(p.selling_price)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={p.stock === 0 ? 'destructive' : p.stock <= 5 ? 'outline' : 'default'}>
                      {p.stock}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {p.supplier?.company_name || p.supplier?.name || '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(p)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(p.id)}>
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Modifier l\'article' : 'Ajouter un article'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1.5">
              <Label>Désignation *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nom de l'article" />
            </div>
            <div className="space-y-1.5">
              <Label>Catégorie</Label>
              <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Ex: Électricité" />
            </div>
            <div className="space-y-1.5">
              <Label>Fournisseur</Label>
              <Select value={form.supplier_id} onValueChange={v => setForm(f => ({ ...f, supplier_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun</SelectItem>
                  {suppliers.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.company_name || s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Prix d'achat (DA)</Label>
              <Input type="number" min="0" value={form.purchase_price} onChange={e => setForm(f => ({ ...f, purchase_price: e.target.value }))} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label>Prix de vente (DA) *</Label>
              <Input type="number" min="0" value={form.selling_price} onChange={e => setForm(f => ({ ...f, selling_price: e.target.value }))} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label>Stock initial</Label>
              <Input type="number" min="0" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="0" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={saving || !form.name || !form.selling_price}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'article ?</AlertDialogTitle>
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
