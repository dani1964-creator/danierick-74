
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Building2, Users, Settings, BarChart3, Globe, UserCheck } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { state } = useSidebar();
  
  const isCollapsed = state === "collapsed";

  const menuItems = [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: Home,
    },
    {
      title: 'Imóveis',
      url: '/dashboard/properties',
      icon: Building2,
    },
    {
      title: 'Leads',
      url: '/dashboard/leads',
      icon: Users,
    },
    {
      title: 'Corretores',
      url: '/dashboard/realtors',
      icon: UserCheck,
    },
    {
      title: 'Site',
      url: '/dashboard/website',
      icon: Globe,
    },
    {
      title: 'Configurações',
      url: '/dashboard/settings',
      icon: Settings,
    },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
          {!isCollapsed && (
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-semibold truncate">ImobiManager</h2>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">Painel Admin</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.url)}
                    isActive={location.pathname === item.url}
                    tooltip={isCollapsed ? item.title : undefined}
                  >
                    <item.icon className="h-4 w-4" />
                    {!isCollapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        {!isCollapsed && (
          <div className="p-4">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleSignOut}
            >
              Sair
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
