import { useApp } from '@/contexts/AppContext';
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarSeparator,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard, Package, Users, Truck, ShoppingCart, Warehouse,
  Wallet, UserCog, Settings, LogOut, Package2, ShoppingBag,
} from 'lucide-react';

export function AppSidebar() {
  const { currentUser, navigate, currentPage, logout, t } = useApp();

  const navItems = [
    { key: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { key: 'articles', label: t('articles'), icon: Package },
    { key: 'clients', label: t('clients'), icon: Users },
    { key: 'fournisseurs', label: t('fournisseurs'), icon: Truck },
    { key: 'purchases', label: 'Achats', icon: ShoppingBag },
    { key: 'gestion-client', label: t('gestionClient'), icon: ShoppingCart },
    { key: 'gestion-fournisseur', label: t('gestionFournisseur'), icon: Warehouse },
    { key: 'tresorerie', label: t('tresorerie'), icon: Wallet },
    { key: 'utilisateurs', label: t('utilisateurs'), icon: UserCog },
    { key: 'systeme', label: t('systeme'), icon: Settings },
  ];

  const roleLabel = currentUser?.role === 'admin' ? t('admin') : currentUser?.role === 'manager' ? t('manager') : t('seller');

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="py-4 px-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-9 rounded-xl bg-primary shrink-0">
            <Package2 className="size-5 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-sidebar-foreground truncate">GestionPro DZ</p>
            <p className="text-xs text-sidebar-foreground/50 truncate">Commerce</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = currentPage === item.key;
                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => navigate(item.key)}
                      tooltip={item.label}
                      className="cursor-pointer"
                    >
                      <Icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="py-3 px-3">
        <div className="flex items-center gap-3 mb-2">
          <Avatar className="size-8 shrink-0">
            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
              {currentUser?.full_name?.slice(0, 2).toUpperCase() || 'AD'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-sidebar-foreground truncate">{currentUser?.full_name || 'Admin'}</p>
            <Badge variant="outline" className="text-[10px] h-4 px-1 border-sidebar-border text-sidebar-foreground/70">
              {roleLabel}
            </Badge>
          </div>
          <button onClick={logout} className="text-sidebar-foreground/50 hover:text-destructive transition-colors p-1 rounded-md hover:bg-sidebar-accent">
            <LogOut className="size-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
