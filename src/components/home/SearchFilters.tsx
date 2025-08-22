
import { useState } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { sanitizeInput } from '@/lib/security';

interface SearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filters: {
    transaction_type: string;
    property_type: string;
    min_price: string;
    max_price: string;
    bedrooms: string;
    neighborhood: string;
    city: string;
    uf: string;
    property_code: string;
    status: string;
  };
  setFilters: (filters: any) => void;
  hasActiveFilters: boolean;
  primaryColor?: string;
  secondaryColor?: string;
}

const SearchFilters = ({
  searchTerm,
  setSearchTerm,
  filters,
  setFilters,
  hasActiveFilters,
  primaryColor = '#2563eb',
  secondaryColor = '#64748b'
}: SearchFiltersProps) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const handleSearchChange = (value: string) => {
    // Sanitize and limit search input
    const sanitized = sanitizeInput(value).substring(0, 200);
    setSearchTerm(sanitized);
  };

  const handlePriceChange = (field: 'min_price' | 'max_price', value: string) => {
    // Only allow numeric input for prices
    const numericValue = value.replace(/[^0-9]/g, '');
    // Limit to reasonable price range
    const limitedValue = numericValue.substring(0, 12); // Max 12 digits
    
    setFilters(prev => ({ 
      ...prev, 
      [field]: limitedValue
    }));
  };

  const handleTextFieldChange = (field: string, value: string, maxLength: number = 100) => {
    // Sanitize text input
    const sanitized = sanitizeInput(value).substring(0, maxLength);
    setFilters(prev => ({ 
      ...prev, 
      [field]: sanitized
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      transaction_type: '',
      property_type: '',
      min_price: '',
      max_price: '',
      bedrooms: '',
      neighborhood: '',
      city: '',
      uf: '',
      property_code: '',
      status: ''
    });
    setSearchTerm('');
    setIsAdvancedOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Barra de Busca Principal */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Buscar por localização, tipo de imóvel, código..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-12"
            maxLength={200}
          />
        </div>
        <Button 
          className="h-12 px-6 sm:px-8"
          style={{ backgroundColor: primaryColor }}
        >
          <Search className="h-4 w-4 mr-2" />
          Buscar
        </Button>
      </div>

      {/* Filtros Básicos */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtros:</span>
        </div>
        
        <Select 
          value={filters.transaction_type} 
          onValueChange={(value) => setFilters(prev => ({ 
            ...prev, 
            transaction_type: value === 'all' ? '' : value 
          }))}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="sale">Venda</SelectItem>
            <SelectItem value="rent">Aluguel</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={filters.property_type || 'all'} 
          onValueChange={(value) => setFilters(prev => ({ 
            ...prev, 
            property_type: value === 'all' ? '' : value 
          }))}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Imóvel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="apartment">Apartamento</SelectItem>
            <SelectItem value="house">Casa</SelectItem>
            <SelectItem value="commercial">Comercial</SelectItem>
            <SelectItem value="land">Terreno</SelectItem>
          </SelectContent>
        </Select>


        {/* Botão Filtros Avançados */}
        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2 text-white border-0"
              style={{ backgroundColor: secondaryColor }}
            >
              <span>Avançado</span>
              {isAdvancedOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Código do Imóvel
                </label>
                <Input
                  placeholder="Ex: IMG001"
                  value={filters.property_code}
                  onChange={(e) => handleTextFieldChange('property_code', e.target.value, 50)}
                  maxLength={50}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Cidade
                </label>
                <Input
                  placeholder="Nome da cidade"
                  value={filters.city}
                  onChange={(e) => handleTextFieldChange('city', e.target.value, 100)}
                  maxLength={100}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Bairro
                </label>
                <Input
                  placeholder="Nome do bairro"
                  value={filters.neighborhood}
                  onChange={(e) => handleTextFieldChange('neighborhood', e.target.value, 100)}
                  maxLength={100}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Estado (UF)
                </label>
                <Input
                  placeholder="Ex: SP, RJ"
                  value={filters.uf}
                  onChange={(e) => handleTextFieldChange('uf', e.target.value.toUpperCase(), 2)}
                  maxLength={2}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Preço Mínimo
                </label>
                <Input
                  placeholder="Valor mínimo"
                  type="text"
                  value={filters.min_price}
                  onChange={(e) => handlePriceChange('min_price', e.target.value)}
                  maxLength={12}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Preço Máximo
                </label>
                <Input
                  placeholder="Valor máximo"
                  type="text"
                  value={filters.max_price}
                  onChange={(e) => handlePriceChange('max_price', e.target.value)}
                  maxLength={12}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Quartos
                </label>
                <Select 
                  value={filters.bedrooms} 
                  onValueChange={(value) => setFilters(prev => ({ 
                    ...prev, 
                    bedrooms: value === 'all' ? '' : value 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Quartos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Botão Limpar Filtros */}
        {hasActiveFilters && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={clearAllFilters}
            className="flex items-center gap-2 text-white border-0"
            style={{ backgroundColor: secondaryColor }}
          >
            <X className="h-4 w-4" />
            Limpar
          </Button>
        )}
      </div>
    </div>
  );
};

export default SearchFilters;
