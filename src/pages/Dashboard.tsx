import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { TrendingUp, Package, Users, Truck, TriangleAlert as AlertTriangle, Wallet, ShoppingCart, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const fmt = (n: number) => n.toLocaleString('fr-DZ') + ' DA';

export function Dashboard() {
  const { products, clients, suppliers, sales, supplierOrders, treasury, navigate } = useApp();

  const totalRevenue = sales.reduce((s, x) => s + x.paid_amount, 0);
  const totalDebtClients = clients.reduce((s, c) => s + c.debt, 0);
  const totalDebtSuppliers = suppliers.reduce((s, s2) => s + s2.debt, 0);
  const lowStock = products.filter(p => p.stock <= 5);

  const inflows = treasury.filter(t => ['sale_in', 'client_payment_in', 'manual_add', 'income'].includes(t.type));
  const outflows = treasury.filter(t => ['supplier_out', 'supplier_payment_out', 'manual_remove', 'expense'].includes(t.type));
  const totalIn = inflows.reduce((s, t) => s + t.amount, 0);
  const totalOut = outflows.reduce((s, t) => s + t.amount, 0);
  const balance = totalIn - totalOut;

  // Last 6 months chart data
  const now = new Date();
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const label = d.toLocaleString('fr-FR', { month: 'short' });
    const monthSales = sales.filter(s => {
      const sd = new Date(s.created_at);
      return sd.getMonth() === d.getMonth() && sd.getFullYear() === d.getFullYear();
    });
    return { month: label, ventes: monthSales.reduce((s, x) => s + x.total_amount, 0) };
  });

  const recentSales = sales.slice(0, 5);
  const recentOrders = supplierOrders.slice(0, 5);

  const chartConfig = {
    ventes: { label: 'Ventes', color: 'var(--chart-1)' },
  };

  return (
    <div className="p-6 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Solde trésorerie</p>
                <p className="text-2xl font-bold text-primary">{fmt(balance)}</p>
              </div>
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wallet className="size-5 text-primary" />
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <span className="text-xs text-success flex items-center gap-0.5"><ArrowUpRight className="size-3" />{fmt(totalIn)}</span>
              <span className="text-xs text-destructive flex items-center gap-0.5"><ArrowDownRight className="size-3" />{fmt(totalOut)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Chiffre d'affaires</p>
                <p className="text-2xl font-bold">{fmt(totalRevenue)}</p>
              </div>
              <div className="size-9 rounded-lg bg-chart-1/10 flex items-center justify-center">
                <TrendingUp className="size-5 text-chart-1" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{sales.length} ventes total</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Créances clients</p>
                <p className="text-2xl font-bold text-warning">{fmt(totalDebtClients)}</p>
              </div>
              <div className="size-9 rounded-lg bg-warning/10 flex items-center justify-center">
                <Users className="size-5 text-warning" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{clients.filter(c => c.debt > 0).length} clients en dette</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Dettes fournisseurs</p>
                <p className="text-2xl font-bold text-destructive">{fmt(totalDebtSuppliers)}</p>
              </div>
              <div className="size-9 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Truck className="size-5 text-destructive" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{suppliers.filter(s => s.debt > 0).length} fournisseurs en dette</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart + Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Évolution des ventes (6 mois)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} tickFormatter={v => (v / 1000).toFixed(0) + 'k'} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="ventes" fill="var(--color-ventes)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="size-4 text-warning" /> Stock faible
              </CardTitle>
              <Badge variant="outline" className="text-warning border-warning/30">{lowStock.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {lowStock.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Aucun stock faible</p>
            ) : (
              lowStock.slice(0, 6).map(p => (
                <div key={p.id} className="flex items-center justify-between py-1 border-b last:border-0">
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.category}</p>
                  </div>
                  <Badge variant={p.stock === 0 ? 'destructive' : 'outline'} className="text-xs shrink-0">
                    {p.stock}
                  </Badge>
                </div>
              ))
            )}
            {lowStock.length > 6 && (
              <p className="text-xs text-muted-foreground text-center">+{lowStock.length - 6} autres</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ShoppingCart className="size-4 text-primary" /> Dernières ventes
              </CardTitle>
              <button onClick={() => navigate('gestion-client')} className="text-xs text-primary hover:underline">Voir tout</button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentSales.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Aucune vente</p>
            ) : recentSales.map(s => (
              <div key={s.id} className="flex items-center justify-between py-1 border-b last:border-0">
                <div className="min-w-0">
                  <p className="text-xs font-medium">{s.client?.full_name || 'Comptoir'}</p>
                  <p className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleDateString('fr-DZ')}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold">{fmt(s.total_amount)}</p>
                  <Badge variant={s.status === 'paid' ? 'default' : s.status === 'partial' ? 'outline' : 'destructive'}
                    className="text-[10px] h-4">
                    {s.status === 'paid' ? 'Payé' : s.status === 'partial' ? 'Partiel' : 'Impayé'}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Package className="size-4 text-chart-2" /> Derniers arrivages
              </CardTitle>
              <button onClick={() => navigate('gestion-fournisseur')} className="text-xs text-primary hover:underline">Voir tout</button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentOrders.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Aucun arrivage</p>
            ) : recentOrders.map(o => (
              <div key={o.id} className="flex items-center justify-between py-1 border-b last:border-0">
                <div className="min-w-0">
                  <p className="text-xs font-medium">{o.supplier?.company_name || o.supplier?.name || 'Fournisseur'}</p>
                  <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString('fr-DZ')}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold">{fmt(o.total_amount)}</p>
                  <Badge variant={o.status === 'paid' ? 'default' : o.status === 'partial' ? 'outline' : 'destructive'}
                    className="text-[10px] h-4">
                    {o.status === 'paid' ? 'Payé' : o.status === 'partial' ? 'Partiel' : 'Impayé'}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-primary">{products.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Articles</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-chart-2">{clients.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-chart-3">{suppliers.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Fournisseurs</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
