import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronLeft, MapPin, Bed, Bath, Car, Square, Eye, Heart, Share2, MessageCircle, Phone, Mail, X, Play, Maximize2 } from 'lucide-react';
import { ZoomableImage } from '@/components/ui/zoomable-image';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { EnhancedSecurity } from '@/lib/enhanced-security';
import { useTracking } from '@/hooks/useTracking';
import { useIsMobile } from '@/hooks/use-mobile';
import ContactCTA from '@/components/home/ContactCTA';
import Footer from '@/components/home/Footer';
import MobileRealtorCard from './MobileRealtorCard';

interface Property {
  id: string;
  title: string;
  description: string;
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
  property_code: string;
  slug?: string;
  realtor_id?: string;
  realtor_name?: string;
  realtor_avatar_url?: string;
  realtor_creci?: string;
  realtor_bio?: string;
  realtor_whatsapp_button_text?: string;
}

interface BrokerProfile {
  id: string;
  business_name: string;
  display_name: string | null;
  website_slug: string | null;
  about_text: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  footer_text: string | null;
  background_image_url: string | null;
  overlay_color: string | null;
  overlay_opacity: string | null;
  whatsapp_button_text: string | null;
  whatsapp_button_color: string | null;
  whatsapp_number: string | null;
  address: string | null;
  cnpj: string | null;
  sections_background_style?: string | null;
  sections_background_color_1?: string | null;
  sections_background_color_2?: string | null;
  sections_background_color_3?: string | null;
}

interface BrokerContact {
  whatsapp_number: string | null;
  contact_email: string | null;
  creci: string | null;
}

const PropertyDetailPage = () => {
  const { slug, propertySlug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trackPropertyView, trackPropertyInterest, trackWhatsAppClick } = useTracking();
  const isMobile = useIsMobile();
  const [property, setProperty] = useState<Property | null>(null);
  const [brokerProfile, setBrokerProfile] = useState<BrokerProfile | null>(null);
  const [brokerContact, setBrokerContact] = useState<BrokerContact | null>(null);
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [viewsCount, setViewsCount] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [thumbnailCarouselApi, setThumbnailCarouselApi] = useState<CarouselApi>();

  useEffect(() => {
    if (propertySlug && slug) {
      fetchPropertyData();
    }
  }, [propertySlug, slug]);

  const fetchPropertyData = async () => {
    try {
      console.log('Fetching property data for:', { propertySlug, slug });
      
      // Fetch broker profile first using the slug
      const { data: brokerDataArray, error: brokerError } = await supabase
        .rpc('get_public_broker_branding', { broker_website_slug: slug });

      console.log('Broker data array:', brokerDataArray);
      
      const brokerData = brokerDataArray?.[0];
      console.log('Broker data:', brokerData);
      console.log('Broker data.id:', brokerData?.id);

      if (brokerError) {
        console.error('Broker error:', brokerError);
        throw brokerError;
      }

      if (!brokerData) {
        throw new Error('Corretor não encontrado');
      }

      // Fetch property details with realtor information
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select(`
          *, 
          slug,
          realtors!realtor_id (
            id,
            name,
            avatar_url,
            creci,
            bio,
            whatsapp_button_text
          )
        `)
        .eq('slug', propertySlug)
        .eq('broker_id', brokerData.id)
        .eq('is_active', true)
        .single();

      console.log('Property data:', propertyData);

      if (propertyError) {
        console.error('Property error:', propertyError);
        throw propertyError;
      }

      // Fetch similar properties
      const { data: similarData, error: similarError } = await supabase
        .from('properties')
        .select('*, slug')
        .eq('is_active', true)
        .eq('property_type', propertyData.property_type)
        .eq('transaction_type', propertyData.transaction_type)
        .eq('broker_id', brokerData.id)
        .neq('id', propertyData.id)
        .limit(6);

      if (similarError) throw similarError;

      // Fetch social links
      const { data: socialData, error: socialError } = await supabase
        .from('social_links')
        .select('*')
        .eq('broker_id', brokerData.id)
        .eq('is_active', true);

      if (socialError) {
        console.warn('Error fetching social links:', socialError);
      }

      console.log('Property data with realtor:', propertyData);

      // Process and assign realtor data
      const processedProperty = {
        ...propertyData,
        realtor_name: (propertyData as any).realtors?.name || null,
        realtor_avatar_url: (propertyData as any).realtors?.avatar_url || null,
        realtor_creci: (propertyData as any).realtors?.creci || null,
        realtor_bio: (propertyData as any).realtors?.bio || null,
        realtor_whatsapp_button_text: (propertyData as any).realtors?.whatsapp_button_text || null,
      };

      console.log('Processed realtor data:', {
        realtor_name: processedProperty.realtor_name,
        realtor_avatar_url: processedProperty.realtor_avatar_url,
        realtor_creci: processedProperty.realtor_creci
      });

      setProperty(processedProperty);
      setBrokerProfile({
        ...brokerData,
        address: (brokerData as any).address || null,
        cnpj: (brokerData as any).cnpj || null,
        whatsapp_number: (brokerData as any).whatsapp_number || null
      });
      setSimilarProperties(similarData || []);
      setSocialLinks(socialData || []);
      setViewsCount(propertyData.views_count || 0);

      // Update views count
      const updatedViews = (propertyData.views_count || 0) + 1;
      await supabase
        .from('properties')
        .update({ views_count: updatedViews })
        .eq('id', propertyData.id);
      
      setViewsCount(updatedViews);

      // Track property view for pixels
      if (propertyData) {
        trackPropertyView({
          property_id: propertyData.id,
          title: propertyData.title,
          price: propertyData.price,
          type: propertyData.property_type,
          city: propertyData.uf
        });
      }

    } catch (error: any) {
      toast({
        title: "Erro ao carregar imóvel",
        description: error.message,
        variant: "destructive"
      });
      navigate(`/${slug}`);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleContactLead = async () => {
    console.log('handleContactLead chamada - Dados:', {
      property: property?.id,
      brokerProfile: brokerProfile?.id,
      website_slug: brokerProfile?.website_slug
    });

    if (!property) {
      console.error('Property não encontrada');
      return;
    }

    if (!brokerProfile?.id) {
      console.error('Broker profile ID não encontrado');
      return;
    }

    try {
      console.log('Tentando inserir lead...');
      
      const leadData = {
        broker_id: brokerProfile.id,
        property_id: property.id,
        name: 'Visitante do Site',
        email: 'visitante@exemplo.com',
        message: 'Interesse no imóvel via site',
        source: 'site_publico',
      };
      
      console.log('Dados do lead a ser inserido:', leadData);
      
      const { data, error } = await supabase
        .from('leads')
        .insert(leadData)
        .select();

      console.log('Resultado da inserção do lead:', { data, error });

      if (error) {
        console.error('Erro detalhado do Supabase:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('Lead criado com sucesso:', data);

      // Track lead generation for pixels
      if (property) {
        trackPropertyInterest({
          property_id: property.id,
          title: property.title,
          price: property.price,
          contact_method: 'form'
        });
      }

      // Show contact message without exposing phone
      toast({
        title: "Interesse registrado!",
        description: "Seu interesse foi registrado. O corretor entrará em contato em breve."
      });
    } catch (error: any) {
      console.error('Error creating lead:', error);
      toast({
        title: "Erro",
        description: `Erro ao registrar interesse: ${error.message || 'Tente novamente.'}`,
        variant: "destructive"
      });
    }
  };

  // Fetch contact information using public RPC (no authentication required)
  const fetchContactInfo = async () => {
    if (!brokerProfile?.website_slug) {
      console.log('No broker profile or website_slug available');
      return null;
    }
    
    try {
      console.log('Fetching contact info for:', brokerProfile.website_slug);
      const { data, error } = await supabase.rpc('get_public_broker_contact', {
        broker_website_slug: brokerProfile.website_slug
      });

      console.log('Contact RPC response:', { data, error });

      if (error) {
        console.error('Error fetching contact info:', error);
        return null;
      }

      const contactInfo = data && data.length > 0 ? data[0] : null;
      console.log('Parsed contact info:', contactInfo);
      
      if (contactInfo) {
        setBrokerContact(contactInfo);
        return contactInfo;
      }
      return null;
    } catch (error) {
      console.error('Error fetching contact info:', error);
      return null;
    }
  };

  const handleWhatsAppClick = async () => {
    console.log('handleWhatsAppClick chamada');
    
    if (!property) {
      console.error('Property não encontrada no handleWhatsAppClick');
      return;
    }

    // Fetch contact info if not already loaded
    let contactInfo = brokerContact;
    if (!contactInfo) {
      console.log('Buscando informações de contato...');
      contactInfo = await fetchContactInfo();
    }

    console.log('Contact info:', contactInfo);

    if (contactInfo?.whatsapp_number && property) {
      const pageUrl = window.location.href;
      const message = encodeURIComponent(
        `Olá! Tenho interesse no imóvel "${property.title}" - Código: ${property.property_code || property.id.slice(-8)}. Valor: ${formatPrice(property.price)}. Gostaria de mais informações. Link: ${pageUrl}`
      );
      
      console.log('Abrindo WhatsApp e registrando lead...');
      
      // Detectar se é mobile para usar link apropriado
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const whatsappUrl = isMobile 
        ? `whatsapp://send?phone=${contactInfo.whatsapp_number}&text=${message}`
        : `https://wa.me/${contactInfo.whatsapp_number}?text=${message}`;
      
      console.log('WhatsApp URL:', whatsappUrl);
      
      // Tentar abrir WhatsApp
      try {
        window.open(whatsappUrl, '_blank');
      } catch (error) {
        console.error('Erro ao abrir WhatsApp:', error);
        // Fallback para web WhatsApp
        window.open(`https://wa.me/${contactInfo.whatsapp_number}?text=${message}`, '_blank');
      }
      
      // Registrar interesse também
      await handleContactLead();
      
      // Track WhatsApp click for pixels
      trackWhatsAppClick({
        property_id: property.id,
        source: 'property_detail'
      });
    } else {
      console.error('Informações de contato não disponíveis:', { contactInfo, property });
      toast({
        title: "Informações de contato não disponíveis",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    }
  };

  const handleShare = () => {
    if (!property) return;

    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `Confira este imóvel: ${property.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copiado!",
        description: "O link do imóvel foi copiado para a área de transferência."
      });
    }
  };

  const handleFavorite = () => {
    if (!property) return;

    const favorites = JSON.parse(localStorage.getItem('favoriteProperties') || '[]');
    const isFavorited = favorites.includes(property.id);
    
    if (isFavorited) {
      const newFavorites = favorites.filter((id: string) => id !== property.id);
      localStorage.setItem('favoriteProperties', JSON.stringify(newFavorites));
      toast({
        title: "Removido dos favoritos",
        description: "O imóvel foi removido da sua lista de favoritos."
      });
    } else {
      favorites.push(property.id);
      localStorage.setItem('favoriteProperties', JSON.stringify(favorites));
      toast({
        title: "Adicionado aos favoritos",
        description: "O imóvel foi adicionado à sua lista de favoritos."
      });
    }
  };

  const isFavorited = () => {
    if (!property) return false;
    const favorites = JSON.parse(localStorage.getItem('favoriteProperties') || '[]');
    return favorites.includes(property.id);
  };

  const propertyImages = property?.images && property.images.length > 0 
    ? property.images 
    : property?.main_image_url 
      ? [property.main_image_url] 
      : [];

  // Sync carousel with thumbnails
  const handleThumbnailClick = useCallback((index: number) => {
    setCurrentImageIndex(index);
    if (carouselApi) {
      carouselApi.scrollTo(index);
    }
  }, [carouselApi]);

  // Listen to carousel changes and sync thumbnails
  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => {
      const newIndex = carouselApi.selectedScrollSnap();
      setCurrentImageIndex(newIndex);
      
      // Sincronizar o carrossel de miniaturas no mobile apenas quando necessário
      if (thumbnailCarouselApi && propertyImages.length > 6) {
        // Verificar se a miniatura atual está visível (6 thumbnails por página)
        const thumbnailPage = Math.floor(newIndex / 6);
        const currentThumbnailPage = Math.floor(thumbnailCarouselApi.selectedScrollSnap() / 6);
        
        // Só sincronizar se mudou de página de thumbnails
        if (thumbnailPage !== currentThumbnailPage) {
          thumbnailCarouselApi.scrollTo(thumbnailPage * 6);
        }
      }

      // Desktop: Scroll automático das miniaturas
      const desktopThumbnailsContainer = document.querySelector('.desktop-thumbnails-container');
      if (desktopThumbnailsContainer) {
        const thumbnailButton = desktopThumbnailsContainer.querySelector(`[data-thumbnail-index="${newIndex}"]`) as HTMLElement;
        if (thumbnailButton) {
          thumbnailButton.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          });
        }
      }
    };

    carouselApi.on('select', onSelect);
    onSelect();

    return () => {
      carouselApi.off('select', onSelect);
    };
  }, [carouselApi, thumbnailCarouselApi, propertyImages.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background animate-fade-in">
        {/* Fixed Header Skeleton - Replicating exact structure */}
        <header className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b z-50">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-14 sm:h-16">
              {/* Left side: Back button + Logo + Title */}
              <div className="flex items-center min-w-0 flex-1 space-x-2 sm:space-x-3">
                <Skeleton className="h-8 w-8 sm:h-9 sm:w-9 rounded-md flex-shrink-0" />
                <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-md flex-shrink-0" />
                <Skeleton className="h-5 sm:h-6 w-32 sm:w-40 flex-shrink-0" />
              </div>
              
              {/* Right side: Share + Favorite buttons */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                <Skeleton className="h-8 w-20 sm:h-9 sm:w-24 rounded-md" />
                <Skeleton className="h-8 w-8 sm:h-9 sm:w-9 rounded-md" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="pt-14 sm:pt-16">
          {/* Image Gallery Skeleton - Full width like SwipeableCarousel */}
          <div className="relative h-64 sm:h-80 lg:h-96 bg-muted animate-pulse">
            {/* Navigation dots */}
            <div className="absolute bottom-4 left-0 right-0">
              <div className="flex justify-center space-x-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-2 w-8 rounded-full bg-white/30" />
                ))}
              </div>
            </div>
          </div>

          {/* Content Container */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Property Info Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Title and basic info */}
                <div className="space-y-4">
                  <Skeleton className="h-8 sm:h-10 w-full max-w-2xl shimmer" shimmer />
                  <Skeleton className="h-6 sm:h-7 w-3/4 max-w-lg" />
                  <Skeleton className="h-8 sm:h-10 w-40 sm:w-48" />
                  
                  {/* Property features */}
                  <div className="flex flex-wrap gap-3 sm:gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 flex-shrink-0" />
                        <Skeleton className="h-4 w-12 sm:w-16" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description Card */}
                <div className="bg-card rounded-lg shadow-sm border p-4 sm:p-6 space-y-4">
                  <Skeleton className="h-6 sm:h-7 w-32 shimmer" shimmer />
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton 
                        key={i} 
                        className={`h-4 ${i === 4 ? 'w-2/3' : 'w-full'}`} 
                      />
                    ))}
                  </div>
                </div>

                {/* Location Card */}
                <div className="bg-card rounded-lg shadow-sm border p-4 sm:p-6 space-y-4">
                  <Skeleton className="h-6 sm:h-7 w-24 shimmer" shimmer />
                  <Skeleton className="h-32 sm:h-40 w-full rounded-md" />
                </div>
              </div>

              {/* Contact Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-20">
                  <div className="bg-card rounded-lg shadow-lg border p-4 sm:p-6 space-y-4">
                    <Skeleton className="h-7 sm:h-8 w-40 shimmer" shimmer />
                    <div className="space-y-3">
                      <Skeleton className="h-11 sm:h-12 w-full rounded-md" />
                      <Skeleton className="h-11 sm:h-12 w-full rounded-md" />
                      <Skeleton className="h-11 sm:h-12 w-full rounded-md" />
                    </div>
                    
                    {/* Broker info */}
                    <div className="pt-4 border-t space-y-3">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                        <div className="space-y-1 flex-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property || !brokerProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Imóvel não encontrado</h2>
          <Button onClick={() => navigate(`/${slug || ''}`)}>Voltar ao início</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Meta tags dinâmicas para compartilhamento */}
      <Helmet>
        <title>
          {property ? 
            `${property.title} - ${brokerProfile?.business_name || 'Imobiliária'}` : 
            `${brokerProfile?.business_name || 'Imobiliária'}`
          }
        </title>
        <meta 
          name="description" 
          content={property ? 
            `${property.description?.slice(0, 160)} - ${formatPrice(property.price)} em ${property.neighborhood}, ${property.uf}` :
            `Confira este imóvel em ${brokerProfile?.business_name || 'nossa imobiliária'}`
          } 
        />
        
        {/* Open Graph para WhatsApp e redes sociais */}
        <meta 
          property="og:title" 
          content={property ? 
            `${property.title} - ${brokerProfile?.business_name || 'Imobiliária'}` : 
            `${brokerProfile?.business_name || 'Imobiliária'}`
          } 
        />
        <meta 
          property="og:description" 
          content={property ? 
            `${formatPrice(property.price)} • ${property.bedrooms} quartos • ${property.bathrooms} banheiros • ${property.area_m2}m² em ${property.neighborhood}, ${property.uf}` :
            `Confira este imóvel em ${brokerProfile?.business_name || 'nossa imobiliária'}`
          } 
        />
        <meta 
          property="og:image" 
          content={property?.main_image_url ? 
            (property.main_image_url.startsWith('http') ? property.main_image_url : `${window.location.origin}${property.main_image_url}`) :
            brokerProfile?.logo_url ? 
              (brokerProfile.logo_url.startsWith('http') ? brokerProfile.logo_url : `${window.location.origin}${brokerProfile.logo_url}`) :
              `${window.location.origin}/placeholder.svg`
          } 
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={window.location.href} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta 
          name="twitter:title" 
          content={property ? 
            `${property.title} - ${brokerProfile?.business_name || 'Imobiliária'}` : 
            `${brokerProfile?.business_name || 'Imobiliária'}`
          } 
        />
        <meta 
          name="twitter:description" 
          content={property ? 
            `${formatPrice(property.price)} • ${property.bedrooms} quartos • ${property.bathrooms} banheiros • ${property.area_m2}m²` :
            `Confira este imóvel em ${brokerProfile?.business_name || 'nossa imobiliária'}`
          } 
        />
        <meta 
          name="twitter:image" 
          content={property?.main_image_url ? 
            (property.main_image_url.startsWith('http') ? property.main_image_url : `${window.location.origin}${property.main_image_url}`) :
            brokerProfile?.logo_url ? 
              (brokerProfile.logo_url.startsWith('http') ? brokerProfile.logo_url : `${window.location.origin}${brokerProfile.logo_url}`) :
              `${window.location.origin}/placeholder.svg`
          } 
        />
        
        {/* WhatsApp específico */}
        <meta property="whatsapp:image" 
          content={property?.main_image_url ? 
            (property.main_image_url.startsWith('http') ? property.main_image_url : `${window.location.origin}${property.main_image_url}`) :
            `${window.location.origin}/placeholder.svg`
          } 
        />
      </Helmet>

      <div className="min-h-screen bg-background animate-fade-in">
      {/* Header Fixo - Melhorado para mobile */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center min-w-0 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="mr-2 sm:mr-4 p-1 sm:p-2"
              >
                <ChevronLeft className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Voltar</span>
              </Button>
              
              <button
                onClick={() => navigate(`/${brokerProfile?.website_slug || slug}`)}
                className="flex items-center hover:opacity-80 transition-opacity min-w-0 flex-1"
              >
                {brokerProfile.logo_url ? (
                  <img 
                    src={brokerProfile.logo_url} 
                    alt={brokerProfile.business_name} 
                    className="h-6 sm:h-8 w-auto flex-shrink-0" 
                  />
                ) : (
                  <div 
                    className="h-6 sm:h-8 w-6 sm:w-8 rounded text-white flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0"
                    style={{ backgroundColor: brokerProfile.primary_color || '#2563eb' }}
                  >
                    {brokerProfile.business_name?.charAt(0) || 'I'}
                  </div>
                )}
                <span className="ml-2 text-sm sm:text-xl font-bold text-gray-900 truncate">
                  {brokerProfile.business_name}
                </span>
              </button>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleWhatsAppClick}
                className="hidden sm:flex text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
                style={{ 
                  backgroundColor: brokerProfile?.whatsapp_button_color || '#25D366',
                  borderColor: brokerProfile?.whatsapp_button_color || '#25D366',
                  color: 'white'
                }}
              >
                <svg viewBox="0 0 24 24" className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.69"/>
                </svg>
                <span className="hidden md:inline">{brokerProfile?.whatsapp_button_text || 'Contato'}</span>
                <span className="md:hidden">WhatsApp</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumbs - Melhorado para mobile */}
      <div className="pt-16 sm:pt-20 pb-2 sm:pb-4">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <nav className="flex text-xs sm:text-sm text-gray-500">
              <button onClick={() => navigate(`/${slug}`)} className="hover:text-gray-700 cursor-pointer">
                Início
              </button>
              <span className="mx-2">&gt;</span>
              <span className="text-gray-900 truncate">
                Código {property.property_code || property.id.slice(-8)}
              </span>
            </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-20 sm:pb-16">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
          {/* Galeria de Imagens e Informações Principais - Desktop */}
          <div className="lg:col-span-8 space-y-4 sm:space-y-6">
            {/* Galeria de Imagens - Responsiva e otimizada */}
            <div className="space-y-3 sm:space-y-4">
              {/* Carousel Principal - Altura fixa responsiva */}
              <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden">
                {propertyImages.length > 0 ? (
                  <>
                    {propertyImages.length === 1 ? (
                      <img
                        src={propertyImages[0]}
                        alt={property.title}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setIsImageModalOpen(true)}
                        loading="lazy"
                      />
                    ) : (
                      <Carousel
                        setApi={setCarouselApi}
                        className="w-full h-full"
                        opts={{
                          align: "start",
                          loop: true,
                        }}
                      >
                        <CarouselContent className="-ml-0">
                          {propertyImages.map((image, index) => (
                            <CarouselItem key={index} className="pl-0">
                              <div className="relative w-full h-full">
                                <img
                                  src={image}
                                  alt={`${property.title} - ${index + 1}`}
                                  className="w-full h-full object-cover cursor-pointer"
                                  onClick={() => setIsImageModalOpen(true)}
                                  loading={index === 0 ? "eager" : "lazy"}
                                />
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-2 bg-black/60 text-white border-none hover:bg-black/80 h-8 w-8 sm:h-10 sm:w-10" />
                        <CarouselNext className="right-2 bg-black/60 text-white border-none hover:bg-black/80 h-8 w-8 sm:h-10 sm:w-10" />
                      </Carousel>
                    )}
                    
                    {/* Botão expandir - Responsivo */}
                    <button
                      onClick={() => setIsImageModalOpen(true)}
                      className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-black/60 text-white p-1.5 sm:p-2 rounded-lg hover:bg-black/80 transition-colors z-10"
                    >
                      <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                    
                    {/* Badge destaque - Responsivo */}
                    {property.is_featured && (
                      <Badge 
                        className="absolute top-2 sm:top-4 left-2 sm:left-4 text-white z-10 text-xs"
                        style={{ backgroundColor: brokerProfile.primary_color }}
                      >
                        Destaque
                      </Badge>
                    )}
                    
                    {/* Contador de imagens - Responsivo */}
                    {propertyImages.length > 1 && (
                      <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-black/60 text-white px-2 py-1 rounded text-xs sm:text-sm z-10">
                        {currentImageIndex + 1} / {propertyImages.length}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">Sem imagem</span>
                  </div>
                )}
              </div>

              {/* Thumbnails - Carrossel responsivo */}
              {propertyImages.length > 1 && (
                <div className="relative">
                  {/* Mobile: Carrossel horizontal simples */}
                  <div className="block sm:hidden">
                    <Carousel
                      setApi={setThumbnailCarouselApi}
                      opts={{
                        align: "start",
                        slidesToScroll: 1,
                        containScroll: "trimSnaps",
                      }}
                      className="w-full"
                    >
                      <CarouselContent className="-ml-1">
                        {propertyImages.map((image, index) => (
                          <CarouselItem key={index} className="pl-1 basis-1/6">
                            <button
                              onClick={() => handleThumbnailClick(index)}
                              className={`aspect-square w-full rounded-lg overflow-hidden border-2 transition-all duration-300 hover:scale-105 ${
                                currentImageIndex === index 
                                  ? 'border-primary shadow-md' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <img
                                src={image}
                                alt={`${property.title} - ${index + 1}`}
                                className="w-full h-full object-cover"
                                loading={index < 6 ? "eager" : "lazy"}
                              />
                            </button>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      {propertyImages.length > 6 && (
                        <>
                          <CarouselPrevious className="left-1 h-6 w-6 bg-black/60 text-white border-none hover:bg-black/80" />
                          <CarouselNext className="right-1 h-6 w-6 bg-black/60 text-white border-none hover:bg-black/80" />
                        </>
                      )}
                    </Carousel>
                    
                    <div className="text-xs text-gray-500 mt-1 text-center">
                      {propertyImages.length > 6 && "Deslize para ver todas as"} {propertyImages.length} {propertyImages.length === 1 ? 'foto' : 'fotos'}
                    </div>
                  </div>
                  
                  {/* Desktop: Scroll horizontal com sincronização automática */}
                  <div className="hidden sm:block">
                    <div className="desktop-thumbnails-container overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 transition-colors">
                      <div className="flex gap-2 pb-2">
                        {propertyImages.map((image, index) => (
                          <button
                            key={index}
                            data-thumbnail-index={index}
                            onClick={() => handleThumbnailClick(index)}
                            className={`flex-shrink-0 aspect-square w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 hover:scale-105 ${
                              currentImageIndex === index 
                                ? 'border-primary shadow-md ring-2 ring-primary/20' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <img
                              src={image}
                              alt={`${property.title} - ${index + 1}`}
                              className="w-full h-full object-cover"
                              loading={index < 6 ? "eager" : "lazy"}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-1 sm:mt-2 text-center">
                    {propertyImages.length} {propertyImages.length === 1 ? 'foto' : 'fotos'}
                  </div>
                </div>
              )}
            </div>

            {/* Hero Section - Informações principais - Mobile/Desktop */}
            <Card className="lg:hidden">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 sm:mb-4 gap-3 sm:gap-0">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 leading-tight">
                      {property.title}
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-600 flex items-start">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0 mt-0.5" />
                      <span className="break-words leading-relaxed">
                        {property.address}, {property.neighborhood} - {property.uf}
                      </span>
                    </p>
                  </div>
                  <div className="flex space-x-2 flex-shrink-0 self-start">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleFavorite}
                      className="p-2 h-8 w-8 sm:h-9 sm:w-9"
                    >
                      <Heart className={`h-3 w-3 sm:h-4 sm:w-4 ${isFavorited() ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShare}
                      className="p-2 h-8 w-8 sm:h-9 sm:w-9"
                    >
                      <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>

                {/* Preço e visualizações */}
                <div className="mb-4 sm:mb-6">
                  <div 
                    className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2"
                    style={{ color: brokerProfile.primary_color }}
                  >
                    {formatPrice(property.price)}
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-gray-500">
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    {viewsCount} visualizações
                  </div>
                </div>

                {/* Código e botão de contato */}
                <div className="mb-4 sm:mb-6">
                  <p className="text-xs sm:text-sm text-gray-600 mb-3">
                    Código: {property.property_code || property.id.slice(-8)}
                  </p>
                  <Button
                    className="w-full text-white text-sm sm:text-base py-2 sm:py-3"
                    style={{ backgroundColor: brokerProfile?.whatsapp_button_color || '#25D366' }}
                    onClick={handleWhatsAppClick}
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 mr-2" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.69"/>
                    </svg>
                    <span className="truncate">
                      {brokerProfile?.whatsapp_button_text || 'Fale com um corretor'}
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Ficha Técnica - Desktop visível sempre, Mobile quando não está na sidebar */}
            <Card>
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-3 sm:mb-4">Características</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                  <div className="flex items-center">
                    <Square className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-500 flex-shrink-0" />
                    <div>
                      <div className="text-base sm:text-lg font-semibold">{property.area_m2 || 'N/A'}</div>
                      <div className="text-xs sm:text-sm text-gray-500">m²</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Bed className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-500 flex-shrink-0" />
                    <div>
                      <div className="text-base sm:text-lg font-semibold">{property.bedrooms || 0}</div>
                      <div className="text-xs sm:text-sm text-gray-500">Quartos</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Bath className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-500 flex-shrink-0" />
                    <div>
                      <div className="text-base sm:text-lg font-semibold">{property.bathrooms || 0}</div>
                      <div className="text-xs sm:text-sm text-gray-500">Banheiros</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Car className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-500 flex-shrink-0" />
                    <div>
                      <div className="text-base sm:text-lg font-semibold">{property.parking_spaces || 0}</div>
                      <div className="text-xs sm:text-sm text-gray-500">Vagas</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Descrição Detalhada - Responsiva */}
            {property.description && (
              <Card>
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Descrição do Imóvel</h3>
                  <div className="prose max-w-none text-gray-700 text-sm sm:text-base">
                    {property.description.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-3 sm:mb-4 leading-relaxed">{paragraph}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Características Adicionais - Responsiva */}
            {property.features && property.features.length > 0 && (
              <Card>
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Características Adicionais</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                    {property.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-primary rounded-full mr-2 sm:mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700 text-sm sm:text-base">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Seção do Corretor - Mobile */}
            {isMobile && (
              <MobileRealtorCard
                property={property}
                brokerProfile={brokerProfile}
                onWhatsAppClick={handleWhatsAppClick}
              />
            )}
          </div>

          {/* Sidebar de Contato - Desktop */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              {/* Informações principais - Desktop */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0">
                      <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
                        {property.title}
                      </h1>
                      <p className="text-sm text-gray-600 flex items-start">
                        <MapPin className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5" />
                        <span className="break-words leading-relaxed">
                          {property.address}, {property.neighborhood} - {property.uf}
                        </span>
                      </p>
                    </div>
                    <div className="flex space-x-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleFavorite}
                        className="p-2 h-9 w-9"
                      >
                        <Heart className={`h-4 w-4 ${isFavorited() ? 'fill-red-500 text-red-500' : ''}`} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleShare}
                        className="p-2 h-9 w-9"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Preço e visualizações */}
                  <div className="mb-6">
                    <div 
                      className="text-3xl font-bold mb-2"
                      style={{ color: brokerProfile.primary_color }}
                    >
                      {formatPrice(property.price)}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Eye className="h-4 w-4 mr-1" />
                      {viewsCount} visualizações
                    </div>
                  </div>

                  {/* Código */}
                  <p className="text-sm text-gray-600 mb-6">
                    Código: {property.property_code || property.id.slice(-8)}
                  </p>

                  {/* Botão de contato principal */}
                  <Button
                    className="w-full text-white text-base py-3"
                    style={{ backgroundColor: brokerProfile?.whatsapp_button_color || '#25D366' }}
                    onClick={handleWhatsAppClick}
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.69"/>
                    </svg>
                    <span>
                      {brokerProfile?.whatsapp_button_text || 'Fale com um corretor'}
                    </span>
                  </Button>
                </CardContent>
              </Card>

              {/* Informações do Corretor */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Corretor</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      {property.realtor_name ? (
                        <>
                          {property.realtor_avatar_url ? (
                            <img 
                              src={property.realtor_avatar_url} 
                              alt={property.realtor_name} 
                              className="h-12 w-12 rounded-full object-cover flex-shrink-0" 
                            />
                          ) : (
                            <div 
                              className="h-12 w-12 rounded-full text-white flex items-center justify-center font-bold text-lg flex-shrink-0"
                              style={{ backgroundColor: brokerProfile.primary_color || '#2563eb' }}
                            >
                              {property.realtor_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'C'}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {property.realtor_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              Corretor {property.realtor_creci && `• CRECI ${property.realtor_creci}`}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          {brokerProfile.logo_url ? (
                            <img 
                              src={brokerProfile.logo_url} 
                              alt={brokerProfile.business_name} 
                              className="h-12 w-12 rounded-full object-cover flex-shrink-0" 
                            />
                          ) : (
                            <div 
                              className="h-12 w-12 rounded-full text-white flex items-center justify-center font-bold text-lg flex-shrink-0"
                              style={{ backgroundColor: brokerProfile.primary_color || '#2563eb' }}
                            >
                              {brokerProfile.business_name?.charAt(0) || 'I'}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {brokerProfile.business_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              Imobiliária
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Biografia do Corretor */}
                    {property.realtor_name && property.realtor_bio && (
                      <div className="border-t pt-4">
                        <p className="text-gray-700 text-sm leading-relaxed mb-4">
                          {property.realtor_bio}
                        </p>
                        <Button
                          onClick={() => {
                            if (brokerProfile?.whatsapp_number) {
                              const message = encodeURIComponent(`Olá! Vi o imóvel "${property.title}" e gostaria de mais informações.`);
                              window.open(`https://wa.me/${brokerProfile.whatsapp_number.replace(/\D/g, '')}?text=${message}`, '_blank');
                            }
                          }}
                          className="w-full"
                          style={{ 
                            backgroundColor: brokerProfile?.whatsapp_button_color || '#25D366',
                            borderColor: brokerProfile?.whatsapp_button_color || '#25D366'
                          }}
                        >
                          <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.69"/>
                          </svg>
                          <span>
                            {property.realtor_whatsapp_button_text || 'Tire suas dúvidas!'}
                          </span>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Imóveis Similares - Grid responsivo */}
        {similarProperties.length > 0 && (
          <div className="mt-6 sm:mt-8 lg:mt-12">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Imóveis Similares</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {similarProperties.map((similarProperty) => (
                <Card 
                  key={similarProperty.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
                  onClick={() => navigate(`/${slug}/${similarProperty.slug || similarProperty.id}`)}
                >
                  <div className="aspect-[4/3] relative overflow-hidden">
                    {similarProperty.main_image_url ? (
                      <img
                        src={similarProperty.main_image_url}
                        alt={similarProperty.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-sm">Sem imagem</span>
                      </div>
                    )}
                    {similarProperty.is_featured && (
                      <Badge 
                        className="absolute top-2 left-2 text-white text-xs"
                        style={{ backgroundColor: brokerProfile.primary_color }}
                      >
                        Destaque
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-3 sm:p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm sm:text-base leading-tight">
                      {similarProperty.title}
                    </h4>
                    <p 
                      className="text-lg sm:text-xl font-bold mb-2"
                      style={{ color: brokerProfile.primary_color }}
                    >
                      {formatPrice(similarProperty.price)}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 flex items-center">
                      <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{similarProperty.neighborhood} - {similarProperty.uf}</span>
                    </p>
                    <div className="flex justify-between text-xs sm:text-sm text-gray-500">
                      <span>{similarProperty.bedrooms || 0} quartos</span>
                      <span>{similarProperty.bathrooms || 0} banheiros</span>
                      <span>{similarProperty.area_m2 || 0} m²</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Imagem - Otimizado para mobile */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-[98vw] sm:max-w-4xl w-full h-[80vh] sm:h-[85vh] p-0 m-2 sm:m-0">
          <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-2 sm:top-4 right-2 sm:right-4 z-20 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-colors"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            
            {propertyImages.length > 0 && (
              <>
                <ZoomableImage
                  src={propertyImages[currentImageIndex]}
                  alt={property.title}
                  className="w-full h-full object-contain"
                />
                
                {propertyImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : propertyImages.length - 1)}
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-colors z-10"
                    >
                      <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(prev => prev < propertyImages.length - 1 ? prev + 1 : 0)}
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-colors z-10"
                    >
                      <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 rotate-180" />
                    </button>
                    
                    <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                      {currentImageIndex + 1} / {propertyImages.length}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Botão WhatsApp Flutuante - Tamanho consistente com a página principal */}
      <button
        onClick={handleWhatsAppClick}
        className="fixed bottom-6 right-6 text-white p-4 rounded-full shadow-lg whatsapp-pulse z-50 flex items-center justify-center transition-all hover:scale-105"
        style={{ backgroundColor: brokerProfile?.whatsapp_button_color || '#25D366' }}
        aria-label="Entrar em contato via WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.69"/>
        </svg>
      </button>
    </div>

    {/* Contact CTA Section - Fora do container principal para ocupar toda a largura */}
    {brokerProfile && (
      <ContactCTA brokerProfile={brokerProfile} />
    )}

    {/* Footer - Fora do container principal para ocupar toda a largura */}
    {brokerProfile && (
      <Footer 
        brokerProfile={brokerProfile}
        socialLinks={socialLinks}
        onContactRequest={fetchContactInfo}
      />
    )}
    </>
  );
};

export default PropertyDetailPage;