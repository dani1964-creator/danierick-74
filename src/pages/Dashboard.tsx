import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';


const Dashboard = () => {
  const { user, signOut, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [websiteSlug, setWebsiteSlug] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState({
    activeProperties: 0,
    totalLeads: 0,
    totalViews: 0,
    isLoading: true
  });

  useEffect(() => {
    if (user) {
      fetchBrokerProfile();
      fetchDashboardData();
    }
  }, [user]);

  const fetchBrokerProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('brokers')
        .select('website_slug')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      setWebsiteSlug(data?.website_slug);
    } catch (error: any) {
      console.error('Error fetching broker profile:', error);
    }
  };

  const fetchDashboardData = async () => {
    if (!user?.id) return;

    try {
      setDashboardData(prev => ({ ...prev, isLoading: true }));

      // Get broker ID first
      const { data: brokerData, error: brokerError } = await supabase
        .from('brokers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (brokerError) throw brokerError;
      if (!brokerData) {
        setDashboardData(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const brokerId = brokerData.id;

      // Fetch active properties count
      const { count: propertiesCount, error: propertiesError } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('broker_id', brokerId)
        .eq('is_active', true);

      if (propertiesError) throw propertiesError;

      // Fetch leads count (current month)
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: leadsCount, error: leadsError } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('broker_id', brokerId)
        .gte('created_at', startOfMonth.toISOString());

      if (leadsError) throw leadsError;

      // Fetch total views from properties
      const { data: propertiesViews, error: viewsError } = await supabase
        .from('properties')
        .select('views_count')
        .eq('broker_id', brokerId)
        .eq('is_active', true);

      if (viewsError) throw viewsError;

      const totalViews = propertiesViews?.reduce((sum, property) => sum + (property.views_count || 0), 0) || 0;

      setDashboardData({
        activeProperties: propertiesCount || 0,
        totalLeads: leadsCount || 0,
        totalViews,
        isLoading: false
      });

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData(prev => ({ ...prev, isLoading: false }));
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do dashboard.",
        variant: "destructive"
      });
    }
  };

  if (loading || dashboardData.isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-fade-in">
          <div className="space-y-2">
            <div className="h-6 sm:h-8 w-32 sm:w-48 bg-muted rounded-md animate-pulse" />
            <div className="h-4 w-24 sm:w-32 bg-muted rounded-md animate-pulse" />
          </div>
          
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card rounded-lg shadow-sm border p-4 sm:p-6">
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-20 sm:w-24 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-6 sm:h-8 w-12 sm:w-16 bg-muted rounded animate-pulse mt-2" />
                <div className="h-3 w-16 sm:w-20 bg-muted rounded animate-pulse mt-1" />
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="h-6 w-32 bg-muted rounded animate-pulse" />
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 sm:h-24 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm border p-4 sm:p-6">
            <div className="h-6 w-32 bg-muted rounded animate-pulse mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-muted rounded-full animate-pulse flex-shrink-0" />
                  <div className="h-4 flex-1 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Logout realizado com sucesso!"
      });
    }
  };

  const handleViewPublicSite = () => {
    if (websiteSlug) {
      navigate(`/${websiteSlug}`);
    } else {
      toast({
        title: "URL não configurada",
        description: "Configure sua URL nas configurações do site primeiro.",
        variant: "destructive"
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo, {user.email}
          </p>
        </div>
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {/* Dashboard Cards */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Imóveis Ativos</CardTitle>
              <CardDescription className="text-sm">Total de imóveis publicados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold">
                {dashboardData.isLoading ? '-' : dashboardData.activeProperties}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {dashboardData.activeProperties === 0 ? 'Nenhum imóvel cadastrado' : 'Imóveis disponíveis'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Leads</CardTitle>
              <CardDescription className="text-sm">Contatos recebidos este mês</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold">
                {dashboardData.isLoading ? '-' : dashboardData.totalLeads}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {dashboardData.totalLeads === 0 ? 'Nenhum lead ainda' : 'Novos contatos'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Visualizações</CardTitle>
              <CardDescription className="text-sm">Total de visitas aos imóveis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold">
                {dashboardData.isLoading ? '-' : dashboardData.totalViews}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {dashboardData.totalViews === 0 ? 'Sem visualizações' : 'Visitas registradas'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 sm:mt-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Ações Rápidas</h2>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Button 
              className="h-auto p-4 sm:p-6 flex flex-col items-center gap-2 text-sm sm:text-base"
              onClick={() => navigate('/dashboard/properties')}
            >
              <span className="text-xl sm:text-2xl">🏠</span>
              <span>Adicionar Imóvel</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 sm:p-6 flex flex-col items-center gap-2 text-sm sm:text-base"
              onClick={() => navigate('/dashboard/settings')}
            >
              <span className="text-xl sm:text-2xl">⚙️</span>
              <span>Configurações</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 sm:p-6 flex flex-col items-center gap-2 text-sm sm:text-base"
              onClick={() => navigate('/dashboard/leads')}
            >
              <span className="text-xl sm:text-2xl">👥</span>
              <span>Gerenciar Leads</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 sm:p-6 flex flex-col items-center gap-2 text-sm sm:text-base"
              onClick={handleViewPublicSite}
            >
              <Globe className="h-5 w-5 sm:h-6 sm:w-6" />
              <span>Ver Site Público</span>
            </Button>
          </div>
        </div>

        {/* Getting Started */}
        <Card className="mt-6 sm:mt-8">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Primeiros Passos</CardTitle>
            <CardDescription className="text-sm">
              Configure sua imobiliária em poucos passos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5 sm:mt-0">
                  1
                </div>
                <span className="text-sm sm:text-base">Complete seu perfil e personalize sua marca</span>
              </div>
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5 sm:mt-0">
                  2
                </div>
                <span className="text-sm sm:text-base">Adicione seu primeiro imóvel</span>
              </div>
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5 sm:mt-0">
                  3
                </div>
                <span className="text-sm sm:text-base">Adicione seus pixels de rastreamento</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;