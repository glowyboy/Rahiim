import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Settings, LogOut, Download, Database, Info, Users, Package,
  ShoppingCart, Truck, Wallet, Shield, Languages, Save,
} from 'lucide-react';

export function Systeme() {
  const { currentUser, logout, products, clients, suppliers, sales, supplierOrders, treasury, users, language, setLanguage, t } = useApp();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState(false);

  const handleExport = () => {
    const data = {
      exportDate: new Date().toISOString(),
      products,
      clients,
      suppliers,
      sales,
      supplierOrders,
      treasury,
      users: users.map(u => ({ ...u, password: '***' })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gestionpro-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const handleBackup = () => {
    const backup = {
      backupDate: new Date().toISOString(),
      version: '1.0.0',
      data: {
        products,
        clients,
        suppliers,
        sales,
        supplierOrders,
        treasury,
        users: users.map(u => ({ ...u, password: '***' })),
      },
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gestionpro-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupSuccess(true);
    setTimeout(() => setBackupSuccess(false), 3000);
  };

  const stats = [
    { label: t('products'), value: products.length, icon: Package, color: 'text-chart-1' },
    { label: t('clients'), value: clients.length, icon: Users, color: 'text-chart-2' },
    { label: t('suppliers'), value: suppliers.length, icon: Truck, color: 'text-chart-3' },
    { label: t('sales'), value: sales.length, icon: ShoppingCart, color: 'text-primary' },
    { label: t('orders'), value: supplierOrders.length, icon: Database, color: 'text-chart-4' },
    { label: t('transactions'), value: treasury.length, icon: Wallet, color: 'text-chart-5' },
  ];

  const roleLabel = currentUser?.role === 'admin' ? t('admin') : currentUser?.role === 'manager' ? t('manager') : t('seller');

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h2 className="text-base font-semibold flex items-center gap-2 mb-4">
          <Info className="size-4 text-primary" /> {t('systemInfo')}
        </h2>
        <Card>
          <CardContent className="pt-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t('application')}</span>
                  <span className="font-medium">GestiPro Algérie</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t('version')}</span>
                  <Badge variant="outline">v1.0.0</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t('database')}</span>
                  <Badge variant="default" className="bg-success/10 text-success border-success/30">{t('connected')}</Badge>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t('user')}</span>
                  <span className="font-medium">{currentUser?.full_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t('role')}</span>
                  <Badge variant={currentUser?.role === 'admin' ? 'default' : 'secondary'}>
                    {roleLabel}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t('currency')}</span>
                  <span className="font-medium">DZD</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-base font-semibold flex items-center gap-2 mb-4">
          <Languages className="size-4 text-primary" /> {t('languageSettings')}
        </h2>
        <Card>
          <CardContent className="pt-5">
            <div className="space-y-3">
              <Label className="text-sm">{t('selectLanguage')}</Label>
              <Select value={language} onValueChange={(val) => setLanguage(val as any)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">{t('french')}</SelectItem>
                  <SelectItem value="ar">{t('arabic')}</SelectItem>
                  <SelectItem value="en">{t('english')}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{t('languageDesc')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-base font-semibold flex items-center gap-2 mb-4">
          <Database className="size-4 text-primary" /> {t('dataStats')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {stats.map(s => (
            <Card key={s.label}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-muted flex items-center justify-center">
                    <s.icon className={`size-4 ${s.color}`} />
                  </div>
                  <div>
                    <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="text-base font-semibold flex items-center gap-2 mb-4">
          <Settings className="size-4 text-primary" /> {t('actions')}
        </h2>
        <div className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Download className="size-4 text-primary" /> {t('exportData')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                {t('exportDesc')}
              </p>
              {exportSuccess && (
                <div className="bg-success/10 text-success text-xs px-3 py-2 rounded-md mb-3">
                  Export réussi!
                </div>
              )}
              <Button onClick={handleExport} variant="outline" className="gap-2">
                <Download className="size-4" /> {t('exportJson')}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Save className="size-4 text-primary" /> {t('backup')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                {t('backupDesc')}
              </p>
              {backupSuccess && (
                <div className="bg-success/10 text-success text-xs px-3 py-2 rounded-md mb-3">
                  Sauvegarde créée avec succès!
                </div>
              )}
              <Button onClick={handleBackup} variant="outline" className="gap-2">
                <Save className="size-4" /> {t('createBackup')}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="size-4 text-muted-foreground" /> {t('security')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                {t('loggedInAs')} <strong>{currentUser?.username}</strong>. {t('logoutDesc')}
              </p>
              <Button onClick={() => setLogoutDialogOpen(true)} variant="destructive" className="gap-2">
                <LogOut className="size-4" /> {t('logout')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('logout')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('logoutConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={logout} className="bg-destructive hover:bg-destructive/90 text-white">
              {t('logout')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
