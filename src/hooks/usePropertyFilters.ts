
import { useState, useMemo } from 'react';

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
  is_featured: boolean;
  views_count: number;
  main_image_url: string;
  images: string[];
  features: string[];
  property_code?: string;
  status: string;
  slug?: string;
}

interface Filters {
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
}

export const usePropertyFilters = (properties: Property[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Filters>({
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

  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      // Filtro de busca por texto
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          property.title.toLowerCase().includes(searchLower) ||
          property.address.toLowerCase().includes(searchLower) ||
          property.neighborhood?.toLowerCase().includes(searchLower) ||
          property.city?.toLowerCase().includes(searchLower) ||
          property.property_code?.toLowerCase().includes(searchLower) ||
          property.description?.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Filtro por tipo de transação
      if (filters.transaction_type && property.transaction_type !== filters.transaction_type) {
        return false;
      }

      // Filtro por tipo de imóvel
      if (filters.property_type && property.property_type !== filters.property_type) {
        return false;
      }

      // Filtro por status
      if (filters.status && property.status !== filters.status) {
        return false;
      }

      // Filtro por preço mínimo
      if (filters.min_price && property.price < parseInt(filters.min_price)) {
        return false;
      }

      // Filtro por preço máximo
      if (filters.max_price && property.price > parseInt(filters.max_price)) {
        return false;
      }

      // Filtro por quartos
      if (filters.bedrooms) {
        if (filters.bedrooms === '4' && property.bedrooms < 4) {
          return false;
        } else if (filters.bedrooms !== '4' && property.bedrooms !== parseInt(filters.bedrooms)) {
          return false;
        }
      }

      // Filtro por bairro
      if (filters.neighborhood && 
          !property.neighborhood?.toLowerCase().includes(filters.neighborhood.toLowerCase())) {
        return false;
      }

      // Filtro por cidade
      if (filters.city && 
          !property.city?.toLowerCase().includes(filters.city.toLowerCase())) {
        return false;
      }

      // Filtro por UF
      if (filters.uf && 
          property.uf?.toLowerCase() !== filters.uf.toLowerCase()) {
        return false;
      }

      // Filtro por código do imóvel
      if (filters.property_code && 
          !property.property_code?.toLowerCase().includes(filters.property_code.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [properties, searchTerm, filters]);

  const featuredProperties = useMemo(() => {
    return filteredProperties.filter(property => property.is_featured);
  }, [filteredProperties]);

  const regularProperties = useMemo(() => {
    return filteredProperties.filter(property => !property.is_featured);
  }, [filteredProperties]);

  const hasActiveFilters = useMemo(() => {
    return searchTerm !== '' || Object.values(filters).some(value => value !== '');
  }, [searchTerm, filters]);

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    filteredProperties,
    featuredProperties,
    regularProperties,
    hasActiveFilters
  };
};
