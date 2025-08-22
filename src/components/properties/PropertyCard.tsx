import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, Bed, Bath, Car, Eye, Heart, Share2, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SwipeableCarousel } from '@/components/ui/swipeable-carousel';


interface PropertyCardProps {
  id?: string;
  property: {
    id: string;
    title: string;
    price: number;
    property_type: string;
    transaction_type: string;
    address: string;
    neighborhood: string;
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
    slug?: string;
  };
  brokerProfile: {
    id: string;
    business_name: string;
    primary_color: string | null;
    secondary_color: string | null;
    whatsapp_button_text: string | null;
    whatsapp_button_color: string | null;
  } | null;
  onContactLead: (propertyId: string) => void;
  onShare: (property: any) => void;
  onFavorite: (propertyId: string) => void;
  isFavorited: (propertyId: string) => boolean;
  onImageClick: (images: string[], index: number, title: string) => void;
}

const PropertyCard = ({ 
  id,
  property, 
  brokerProfile, 
  onContactLead, 
  onShare, 
  onFavorite, 
  isFavorited, 
  onImageClick 
}: PropertyCardProps) => {
  const navigate = useNavigate();
  const { slug } = useParams();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const propertyImages = property.images && property.images.length > 0 
    ? property.images 
    : property.main_image_url 
      ? [property.main_image_url] 
      : [];

  const handleViewDetails = () => {
    navigate(`/${slug}/${property.slug || property.id}`);
  };

  return (
    <Card 
      id={id}
      className="overflow-hidden hover:shadow-lg transition-all duration-300 group rounded-lg"
    >
      {/* Layout sempre vertical para melhor experiência */}
      <div className="flex flex-col">
        {/* Container da imagem - proporção 4:3 */}
        <div className="relative w-full aspect-[4/3] flex-shrink-0 rounded-t-lg overflow-hidden">
          {propertyImages.length > 0 ? (
            <img
              src={propertyImages[0]}
              alt={property.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-sm">Sem imagem</span>
            </div>
          )}
          
          {/* Badges e botões sobrepostos */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            <Badge 
              variant="secondary" 
              className="text-white border-0 text-xs font-medium"
              style={
                property.is_featured 
                  ? { backgroundColor: brokerProfile?.primary_color || '#2563eb' }
                  : { backgroundColor: brokerProfile?.secondary_color || '#64748b' }
              }
            >
              {property.is_featured ? 'Destaque' : (property.transaction_type === 'sale' ? 'Venda' : 'Aluguel')}
            </Badge>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 bg-black/60 border-0 text-white hover:bg-black/80 backdrop-blur-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onFavorite(property.id);
                }}
              >
                <Heart className={`h-4 w-4 ${isFavorited(property.id) ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 bg-black/60 border-0 text-white hover:bg-black/80 backdrop-blur-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onShare(property);
                }}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Contador de visualizações e fotos */}
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
            <div className="flex items-center text-white text-xs bg-black/60 px-2 py-1 rounded backdrop-blur-sm">
              <Eye className="h-3 w-3 mr-1" />
              {property.views_count || 0}
            </div>
            {propertyImages.length > 1 && (
              <div className="bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                +{propertyImages.length - 1} fotos
              </div>
            )}
          </div>
        </div>

        {/* Container das informações - bem organizado */}
        <CardContent className="p-4 space-y-3">
          {/* Título e localização */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg line-clamp-2 leading-tight">
              {property.title}
            </h3>
            
            <p className="text-sm text-muted-foreground flex items-center">
              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="truncate">{property.neighborhood}, {property.uf}</span>
            </p>
          </div>
          
          {/* Preço destacado */}
          <div 
            className="text-2xl font-bold"
            style={{ color: brokerProfile?.primary_color || '#2563eb' }}
          >
            {formatPrice(property.price)}
          </div>
          
          {/* Características do imóvel - Layout organizado com nomenclaturas */}
          <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
            {property.bedrooms > 0 && (
              <div className="flex items-center space-x-2">
                <Bed className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">{property.bedrooms}</span>
                <span className="text-xs">Quartos</span>
              </div>
            )}
            {property.bathrooms > 0 && (
              <div className="flex items-center space-x-2">
                <Bath className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">{property.bathrooms}</span>
                <span className="text-xs">Banheiros</span>
              </div>
            )}
            {property.parking_spaces > 0 && (
              <div className="flex items-center space-x-2">
                <Car className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">{property.parking_spaces}</span>
                <span className="text-xs">Vagas</span>
              </div>
            )}
            {property.area_m2 && (
              <div className="flex items-center space-x-2">
                <Square className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">{property.area_m2}</span>
                <span className="text-xs">m²</span>
              </div>
            )}
          </div>

          {/* Botão Ver Detalhes */}
          <Button
            className="w-full text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails();
            }}
            style={{ 
              backgroundColor: brokerProfile?.primary_color || '#2563eb',
              borderColor: brokerProfile?.primary_color || '#2563eb',
              color: 'white'
            }}
          >
            Ver Detalhes
          </Button>
        </CardContent>
      </div>
    </Card>
  );
};

export default PropertyCard;