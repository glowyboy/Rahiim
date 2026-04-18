import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, ShoppingBag, ChevronDown, ChevronRight } from 'lucide-react';

const fmt = (n: number) => n.toLocaleString('fr-DZ') + ' DA';

export function Purchases() {
  const { sales } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = sales.filter(s => {
    const q = search.toLowerCase();
    const clientName = s.client?.full_name || 'Comptoir';
    const matchSearch = clientName.toLowerCase().includes(q) || 
                       s.items?.some(item => item.product?.name.toLowerCase().includes(q));
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingBag className="size-5 text-primary" />
            Historique des achats
          </h2>
          <p className="text-sm text-muted-foreground">
            {filtered.length} achat(s) enregistré(s)
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input 
            className="pl-9" 
            placeholder="Rechercher par client ou produit..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
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
                <TableHead className="text-center">Articles</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                    <ShoppingBag className="size-8 mx-auto mb-2 opacity-30" />
                    Aucun achat trouvé
                  </TableCell>
                </TableRow>
              ) : filtered.map(s => (
                <>
                  <TableRow 
                    key={s.id} 
                    className="cursor-pointer hover:bg-accent/50" 
                    onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                  >
                    <TableCell>
                      {expandedId === s.id ? 
                        <ChevronDown className="size-4" /> : 
                        <ChevronRight className="size-4" />
                      }
                    </TableCell>
                    <TableCell className="font-medium">
                      {s.client?.full_name || 'Comptoir'}
                      {s.client && (
                        <div className="text-xs text-muted-foreground">
                          {s.client.phone}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(s.created_at).toLocaleDateString('fr-DZ', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell className="text-right font-semibold">{fmt(s.total_amount)}</TableCell>
                    <TableCell className="text-right text-success">{fmt(s.paid_amount)}</TableCell>
                    <TableCell className="text-right text-destructive">
                      {s.remaining > 0 ? fmt(s.remaining) : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={s.status === 'paid' ? 'default' : s.status === 'partial' ? 'outline' : 'destructive'} 
                        className="text-xs"
                      >
                        {s.status === 'paid' ? 'Payé' : s.status === 'partial' ? 'Partiel' : 'Impayé'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="text-xs">
                        {s.items?.length || 0}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  {expandedId === s.id && s.items && s.items.length > 0 && (
                    <TableRow key={`${s.id}-detail`}>
                      <TableCell colSpan={8} className="p-0 bg-muted/30">
                        <div className="px-8 py-4">
                          <h4 className="text-sm font-semibold mb-3">Détails de l'achat</h4>
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-muted-foreground border-b">
                                <th className="text-left pb-2">Article</th>
                                <th className="text-left pb-2">Catégorie</th>
                                <th className="text-center pb-2">Quantité</th>
                                <th className="text-right pb-2">Prix unitaire</th>
                                <th className="text-right pb-2">Sous-total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {s.items.map(item => (
                                <tr key={item.id} className="border-t border-border/50">
                                  <td className="py-2 font-medium">
                                    {item.product?.name || item.product_id}
                                  </td>
                                  <td className="py-2">
                                    {item.product?.category && (
                                      <Badge variant="secondary" className="text-xs">
                                        {item.product.category}
                                      </Badge>
                                    )}
                                  </td>
                                  <td className="text-center py-2">
                                    <Badge variant="outline" className="text-xs">
                                      {item.quantity}
                                    </Badge>
                                  </td>
                                  <td className="text-right py-2">{fmt(item.unit_price)}</td>
                                  <td className="text-right py-2 font-semibold text-primary">
                                    {fmt(item.subtotal || item.unit_price * item.quantity)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="border-t-2 border-border font-semibold">
                                <td colSpan={4} className="text-right py-2">Total:</td>
                                <td className="text-right py-2 text-primary">{fmt(s.total_amount)}</td>
                              </tr>
                            </tfoot>
                          </table>
                          {s.note && (
                            <div className="mt-3 p-2 bg-muted rounded-md">
                              <p className="text-xs text-muted-foreground">
                                <strong>Note:</strong> {s.note}
                              </p>
                            </div>
                          )}
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
