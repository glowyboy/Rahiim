import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import type { UserRole } from '@/lib/types';
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
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, UserPlus, Pencil, Trash2, ShieldCheck, User } from 'lucide-react';

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrateur',
  manager: 'Gestionnaire',
  seller: 'Vendeur',
};

const roleVariant: Record<UserRole, 'default' | 'secondary' | 'outline'> = {
  admin: 'default',
  manager: 'secondary',
  seller: 'outline',
};

type FormData = {
  username: string;
  password: string;
  full_name: string;
  role: UserRole;
  email: string;
  is_active: boolean;
};

const emptyForm = (): FormData => ({
  username: '',
  password: '',
  full_name: '',
  role: 'seller',
  email: '',
  is_active: true,
});

export function Utilisateurs() {
  const { users, currentUser, addUser, updateUser, deleteUser } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm());
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (id: string) => {
    const u = users.find(x => x.id === id);
    if (!u) return;
    setEditId(id);
    setForm({
      username: u.username,
      password: u.password,
      full_name: u.full_name,
      role: u.role,
      email: u.email,
      is_active: u.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.username || !form.password || !form.full_name) return;
    setSaving(true);
    if (editId) {
      await updateUser(editId, form);
    } else {
      await addUser(form);
    }
    setSaving(false);
    setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteUser(deleteId);
    setDeleteId(null);
  };

  const totalAdmins = users.filter(u => u.role === 'admin').length;
  const totalManagers = users.filter(u => u.role === 'manager').length;
  const totalSellers = users.filter(u => u.role === 'seller').length;
  const totalActive = users.filter(u => u.is_active).length;

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total utilisateurs</p>
                <p className="text-3xl font-bold text-primary">{users.length}</p>
              </div>
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="size-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Administrateurs</p>
                <p className="text-3xl font-bold">{totalAdmins}</p>
              </div>
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="size-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Gestionnaires</p>
                <p className="text-3xl font-bold">{totalManagers}</p>
              </div>
              <div className="size-9 rounded-lg bg-secondary/50 flex items-center justify-center">
                <User className="size-5 text-secondary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Actifs / Vendeurs</p>
                <p className="text-3xl font-bold text-success">{totalActive} / {totalSellers}</p>
              </div>
              <div className="size-9 rounded-lg bg-success/10 flex items-center justify-center">
                <Users className="size-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Liste des utilisateurs ({users.length})</h2>
        {isAdmin && (
          <Button onClick={openAdd} className="gap-2">
            <UserPlus className="size-4" /> Nouvel utilisateur
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom complet</TableHead>
                <TableHead>Identifiant</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Créé le</TableHead>
                {isAdmin && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-10 text-muted-foreground">
                    <Users className="size-8 mx-auto mb-2 opacity-30" />
                    Aucun utilisateur
                  </TableCell>
                </TableRow>
              ) : users.map(u => (
                <TableRow key={u.id} className={u.id === currentUser?.id ? 'bg-primary/5' : ''}>
                  <TableCell className="font-medium">
                    {u.full_name}
                    {u.id === currentUser?.id && (
                      <Badge variant="outline" className="ml-2 text-[10px] h-4">Vous</Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{u.username}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email || '—'}</TableCell>
                  <TableCell>
                    <Badge variant={roleVariant[u.role]}>{roleLabels[u.role]}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.is_active ? 'default' : 'outline'}
                      className={u.is_active ? 'bg-success/10 text-success border-success/30' : 'text-muted-foreground'}>
                      {u.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString('fr-DZ')}
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => openEdit(u.id)}>
                          <Pencil className="size-3.5" />
                        </Button>
                        {u.id !== currentUser?.id && (
                          <Button variant="ghost" size="icon-sm" onClick={() => setDeleteId(u.id)}
                            className="text-destructive hover:text-destructive">
                            <Trash2 className="size-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="size-5 text-primary" />
              {editId ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Nom complet *</Label>
                <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  placeholder="Prénom Nom" />
              </div>
              <div className="space-y-1.5">
                <Label>Identifiant *</Label>
                <Input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  placeholder="nom.utilisateur" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Mot de passe *</Label>
                <Input type="password" value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••" />
              </div>
              <div className="space-y-1.5">
                <Label>Rôle</Label>
                <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v as UserRole }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrateur</SelectItem>
                    <SelectItem value="manager">Gestionnaire</SelectItem>
                    <SelectItem value="seller">Vendeur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="prenom.nom@email.com" />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Compte actif</p>
                <p className="text-xs text-muted-foreground">L'utilisateur peut se connecter</p>
              </div>
              <Switch checked={form.is_active}
                onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave}
              disabled={saving || !form.username || !form.password || !form.full_name}>
              {saving ? 'Enregistrement...' : editId ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'utilisateur</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'utilisateur ne pourra plus se connecter.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-white">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
