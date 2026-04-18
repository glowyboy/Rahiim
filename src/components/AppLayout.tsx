import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Separator } from '@/components/ui/separator';
import { useApp } from '@/contexts/AppContext';
import { Spinner } from '@/components/ui/spinner';

import { Dashboard } from '@/pages/Dashboard';
import { Articles } from '@/pages/Articles';
import { Clients } from '@/pages/Clients';
import { Fournisseurs } from '@/pages/Fournisseurs';
import { GestionClient } from '@/pages/GestionClient';
import { GestionFournisseur } from '@/pages/GestionFournisseur';
import { Tresorerie } from '@/pages/Tresorerie';
import { Utilisateurs } from '@/pages/Utilisateurs';
import { Systeme } from '@/pages/Systeme';
import { Purchases } from '@/pages/Purchases';

const pageTitles: Record<string, string> = {
  dashboard: 'Tableau de bord',
  articles: 'Articles',
  clients: 'Clients',
  fournisseurs: 'Fournisseurs',
  'gestion-client': 'Gestion Client',
  'gestion-fournisseur': 'Gestion Fournisseur',
  tresorerie: 'Trésorerie',
  utilisateurs: 'Utilisateurs',
  systeme: 'Système',
  purchases: 'Historique des achats',
};

function PageContent({ page }: { page: string }) {
  switch (page) {
    case 'dashboard': return <Dashboard />;
    case 'articles': return <Articles />;
    case 'clients': return <Clients />;
    case 'fournisseurs': return <Fournisseurs />;
    case 'gestion-client': return <GestionClient />;
    case 'gestion-fournisseur': return <GestionFournisseur />;
    case 'tresorerie': return <Tresorerie />;
    case 'utilisateurs': return <Utilisateurs />;
    case 'systeme': return <Systeme />;
    case 'purchases': return <Purchases />;
    default: return <Dashboard />;
  }
}

export function AppLayout() {
  const { loading, currentPage } = useApp();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 items-center gap-2 px-4 border-b bg-background">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
          <h1 className="text-sm font-semibold">{pageTitles[currentPage] || 'Tableau de bord'}</h1>
        </header>
        <main className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="flex flex-col items-center gap-3">
                <Spinner className="size-8 text-primary" />
                <p className="text-sm text-muted-foreground">Chargement des données...</p>
              </div>
            </div>
          ) : (
            <PageContent page={currentPage} />
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
