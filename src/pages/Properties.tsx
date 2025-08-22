
import { useState, useEffect } from 'react';
import { Search, Trash2, Eye, Filter } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AddPropertyDialog from '@/components/properties/AddPropertyDialog';
import PropertyViewToggle from '@/components/properties/PropertyViewToggle';
import EditPropertyDialog from '@/components/properties/EditPropertyDialog';
import { sanitizeInput } from '@/lib/security';

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  property_type: string;
  transaction_type: string;
  address: string;
  neighborhood: string;
  city: string;
  uf: string;
  bedrooms: number;
  bathrooms: number;
  area_m2: number;
  parking_spaces: number;
  is_active: boolean;
  is_featured: boolean;
  views_count: number;
  main_image_url: string;
  images: string[];
  features: string[];
  property_code: string;
  status: string;
  realtor_id?: string;
}

const Properties = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (user) {
      fetchProperties();
    }
  }, [user]);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *, 
          slug,
          realtors!realtor_id (
            id,
            name,
            avatar_url,
            creci
          )
        `)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar imóveis",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Sanitize search input to prevent XSS
  const sanitizedSearchTerm = sanitizeInput(searchTerm);
  
  const filteredProperties = properties.filter(property => {
    const searchLower = sanitizedSearchTerm.toLowerCase();
    const matchesSearch = (
      property.title.toLowerCase().includes(searchLower) ||
      property.address.toLowerCase().includes(searchLower) ||
      property.neighborhood?.toLowerCase().includes(searchLower) ||
      property.city?.toLowerCase().includes(searchLower) ||
      property.property_code?.toLowerCase().includes(searchLower)
    );
    
    const matchesStatus = statusFilter === 'all' || statusFilter === '' || property.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm('Tem certeza que deseja excluir este imóvel?')) return;

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;

      toast({
        title: "Imóvel excluído",
        description: "O imóvel foi removido com sucesso."
      });

      fetchProperties();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSearchChange = (value: string) => {
    // Limit search term length for security
    const limitedValue = value.substring(0, 100);
    setSearchTerm(limitedValue);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: 'Ativo', variant: 'default' as const },
      inactive: { label: 'Inativo', variant: 'secondary' as const },
      sold: { label: 'Vendido', variant: 'destructive' as const },
      rented: { label: 'Alugado', variant: 'outline' as const },
    };
    
    return statusMap[status as keyof typeof statusMap] || { label: 'Ativo', variant: 'default' as const };
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="h-8 w-48 bg-muted rounded-md animate-pulse" />
              <div className="h-4 w-64 bg-muted rounded-md animate-pulse" />
            </div>
            <div className="h-10 w-32 bg-muted rounded-md animate-pulse" />
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-2 flex-1">
              <div className="h-10 w-full bg-muted rounded-md animate-pulse" />
              <div className="h-10 w-32 bg-muted rounded-md animate-pulse" />
            </div>
            <div className="h-10 w-20 bg-muted rounded-md animate-pulse" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card rounded-lg shadow-sm border p-4">
                <div className="h-8 w-16 bg-muted rounded animate-pulse mb-2" />
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card rounded-lg shadow-sm border overflow-hidden">
                <div className="h-48 w-full bg-muted animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                  <div className="flex justify-between items-center">
                    <div className="h-5 w-20 bg-muted rounded animate-pulse" />
                    <div className="h-5 w-16 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Imóveis</h1>
            <p className="text-muted-foreground">
              Gerencie seus imóveis cadastrados ({properties.length} imóveis)
            </p>
          </div>
          <AddPropertyDialog onPropertyAdded={fetchProperties} />
        </div>

        {/* Search, Filters and View Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por título, endereço, bairro, cidade ou código..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 text-sm"
                maxLength={100}
              />
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-28 sm:w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="sold">Vendido</SelectItem>
                  <SelectItem value="rented">Alugado</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-center sm:justify-end">
            <PropertyViewToggle view={viewMode} onViewChange={setViewMode} />
          </div>
        </div>

        {/* Properties Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{properties.length}</div>
              <p className="text-sm text-muted-foreground">Total de Imóveis</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {properties.filter(p => p.is_active).length}
              </div>
              <p className="text-sm text-muted-foreground">Ativos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {properties.filter(p => p.is_featured).length}
              </div>
              <p className="text-sm text-muted-foreground">Em Destaque</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {properties.reduce((acc, p) => acc + p.views_count, 0)}
              </div>
              <p className="text-sm text-muted-foreground">Visualizações</p>
            </CardContent>
          </Card>
        </div>

        {/* Properties Grid */}
        {filteredProperties.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm ? 'Nenhum imóvel encontrado' : 'Nenhum imóvel cadastrado'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm 
                    ? 'Tente ajustar os termos de busca.'
                    : 'Comece adicionando seu primeiro imóvel ao sistema.'
                  }
                </p>
                {!searchTerm && (
                  <AddPropertyDialog onPropertyAdded={fetchProperties} />
                )}
              </div>
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          // Grid View
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProperties.map((property) => (
              <Card key={property.id} className="overflow-hidden">
                <div className="relative aspect-video">
                  {property.main_image_url ? (
                    <img
                      src={property.main_image_url}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground bg-muted">
                      Sem imagem
                    </div>
                  )}
                  {property.is_featured && (
                    <Badge className="absolute top-2 right-2" variant="default">
                      Destaque
                    </Badge>
                  )}
                  {property.status && property.status !== 'active' && (
                    <Badge className="absolute top-2 left-2" variant={getStatusBadge(property.status).variant}>
                      {getStatusBadge(property.status).label}
                    </Badge>
                  )}
                </div>
                
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base sm:text-lg line-clamp-2 flex-1">
                      {property.title}
                    </CardTitle>
                    {property.property_code && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        {property.property_code}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg sm:text-2xl font-bold text-primary">
                      {formatPrice(property.price)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {property.transaction_type === 'sale' ? 'Venda' : 'Aluguel'}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                    {property.address}
                  </p>
                  
                  <div className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground mb-3">
                    {property.bedrooms && (
                      <span>{property.bedrooms} quartos</span>
                    )}
                    {property.bathrooms && (
                      <span>{property.bathrooms} banheiros</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      <span>{property.views_count}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <EditPropertyDialog property={property} onPropertyUpdated={fetchProperties} />
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteProperty(property.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // List/Detailed View
          <div className="space-y-3 sm:space-y-4">
            {filteredProperties.map((property) => (
              <Card key={property.id} className="overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  <div className="relative w-full h-40 sm:w-56 sm:h-36 flex-shrink-0">
                    {property.main_image_url ? (
                      <img
                        src={property.main_image_url}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground bg-muted">
                        Sem imagem
                      </div>
                    )}
                    {property.is_featured && (
                      <Badge className="absolute top-2 right-2" variant="default">
                        Destaque
                      </Badge>
                    )}
                    {property.status && property.status !== 'active' && (
                      <Badge className="absolute top-2 left-2" variant={getStatusBadge(property.status).variant}>
                        {getStatusBadge(property.status).label}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex-1 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold line-clamp-2 flex-1 pr-2">
                            {property.title}
                          </h3>
                          {property.property_code && (
                            <Badge variant="outline" className="text-xs flex-shrink-0">
                              {property.property_code}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <span className="text-xl sm:text-2xl font-bold text-primary">
                            {formatPrice(property.price)}
                          </span>
                          <Badge variant="outline" className="w-fit">
                            {property.transaction_type === 'sale' ? 'Venda' : 'Aluguel'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-muted-foreground">
                        {property.address}
                      </p>
                      
                      {(property.neighborhood || property.city) && (
                        <p className="text-sm text-muted-foreground">
                          {[property.neighborhood, property.city, property.uf].filter(Boolean).join(', ')}
                        </p>
                      )}
                      
                      {property.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {property.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 text-sm text-muted-foreground mb-4">
                      {property.bedrooms && (
                        <span>{property.bedrooms} quartos</span>
                      )}
                      {property.bathrooms && (
                        <span>{property.bathrooms} banheiros</span>
                      )}
                      {property.area_m2 && (
                        <span>{property.area_m2}m²</span>
                      )}
                      {property.parking_spaces && (
                        <span>{property.parking_spaces} vagas</span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        <span>{property.views_count} visualizações</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <EditPropertyDialog property={property} onPropertyUpdated={fetchProperties} />
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteProperty(property.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Properties;
