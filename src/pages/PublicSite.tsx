import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePropertyFilters } from '@/hooks/usePropertyFilters';
import { PublicSiteSkeleton } from '@/components/ui/loading-skeleton';
import HeroBanner from '@/components/home/HeroBanner';
import SearchFilters from '@/components/home/SearchFilters';
import FeaturedProperties from '@/components/home/FeaturedProperties';
import PropertiesGrid from '@/components/home/PropertiesGrid';
import ContactCTA from '@/components/home/ContactCTA';
import Footer from '@/components/home/Footer';
import WhatsAppFloat from '@/components/home/WhatsAppFloat';
import FixedHeader from '@/components/home/FixedHeader';
import TrackingScripts from '@/components/tracking/TrackingScripts';
import PropertyDetailPage from '@/components/properties/PropertyDetailPage';
import { EnhancedSecurity } from '@/lib/enhanced-security';


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

interface BrokerProfile {
  id: string;
  business_name: string;
  display_name: string | null;
  website_slug: string;
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
  hero_title: string | null;
  hero_subtitle: string | null;
  address: string | null;
  cnpj: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  tracking_scripts?: any;
  about_us_content?: string | null;
  privacy_policy_content?: string | null;
  terms_of_use_content?: string | null;
}

interface BrokerContact {
  whatsapp_number: string | null;
  contact_email: string | null;
  creci: string | null;
}

const PublicSite = () => {
  const { slug, propertySlug } = useParams();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [brokerProfile, setBrokerProfile] = useState<BrokerProfile | null>(null);
  const [brokerContact, setBrokerContact] = useState<BrokerContact | null>(null);
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxTitle, setLightboxTitle] = useState('');

  const {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    featuredProperties,
    regularProperties,
    hasActiveFilters
  } = usePropertyFilters(properties);

  useEffect(() => {
    fetchBrokerData();
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, [slug]);

  // Fetch contact info when broker profile is loaded
  useEffect(() => {
    if (brokerProfile?.website_slug) {
      console.log('Broker profile loaded, fetching contact info...');
      fetchContactInfo();
    }
  }, [brokerProfile]);


  const fetchBrokerData = async () => {
    try {
      console.log('Fetching broker data for slug:', slug);
      
      // Fetch broker profile using the secure function - usar maybeSingle() em vez de single()
      const { data: brokerData, error: brokerError } = await supabase
        .rpc('get_public_broker_branding', { broker_website_slug: slug })
        .maybeSingle();

      console.log('Broker RPC response:', { brokerData, brokerError });

      if (brokerError) {
        console.error('Broker RPC error:', brokerError);
        throw brokerError;
      }

      if (!brokerData) {
        console.log('No broker found for slug:', slug);
        setBrokerProfile(null);
        setLoading(false);
        return;
      }

      console.log('Broker data from RPC:', brokerData);
      setBrokerProfile(brokerData as BrokerProfile);

      // Fetch properties for this broker - only active status and active properties
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*, slug')
        .eq('broker_id', brokerData.id)
        .eq('is_active', true)
        .eq('status', 'active')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (propertiesError) {
        console.error('Properties error:', propertiesError);
        throw propertiesError;
      }

      console.log('Properties data:', propertiesData);
      setProperties(propertiesData || []);

      // Fetch social links for this broker
      const { data: socialLinksData, error: socialError } = await supabase
        .from('social_links')
        .select('*')
        .eq('broker_id', brokerData.id)
        .eq('is_active', true)
        .order('display_order');

      if (socialError) {
        console.error('Social links error:', socialError);
      } else {
        setSocialLinks(socialLinksData || []);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message || 'Erro desconhecido ao carregar os dados',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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

  const handleContactLead = async (propertyId: string) => {
    console.log('Contact lead for property:', propertyId);
    // Fetch contact info if not already loaded
    if (!brokerContact) {
      await fetchContactInfo();
    }
    // This will be handled by the SecureContactForm component
  };

  const handleShare = (property: Property) => {
    const propertyUrl = `${window.location.origin}/${slug}/${property.slug || property.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: `${property.title} - ${brokerProfile?.business_name}`,
        text: `Confira este imóvel: ${property.title} por ${property.price?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
        url: propertyUrl
      });
    } else {
      // Para WhatsApp Web, incluir parâmetros que forcem atualização dos meta tags
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Confira este imóvel: ${property.title} por ${property.price?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n\n${propertyUrl}?t=${Date.now()}`)}`;
      
      // Tentar abrir WhatsApp diretamente
      if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
        window.open(whatsappUrl, '_blank');
      } else {
        navigator.clipboard.writeText(propertyUrl);
        toast({
          title: "Link copiado!",
          description: "O link do imóvel foi copiado para a área de transferência."
        });
      }
    }
  };

  const handleFavorite = (propertyId: string) => {
    const newFavorites = favorites.includes(propertyId)
      ? favorites.filter(id => id !== propertyId)
      : [...favorites, propertyId];
    
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    
    toast({
      title: favorites.includes(propertyId) ? "Removido dos favoritos" : "Adicionado aos favoritos",
      description: favorites.includes(propertyId) 
        ? "O imóvel foi removido da sua lista de favoritos."
        : "O imóvel foi adicionado à sua lista de favoritos."
    });
  };

  const isFavorited = (propertyId: string) => favorites.includes(propertyId);

  const handleImageClick = (images: string[], index: number, title: string) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxTitle(title);
    setLightboxOpen(true);
  };

  if (loading) {
    return <PublicSiteSkeleton />;
  }

  if (!brokerProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center w-full">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Página não encontrada
          </h1>
          <p className="text-gray-600 mb-4">
            O site "{slug}" não foi encontrado ou não está disponível.
          </p>
          <p className="text-sm text-gray-500">
            Verifique se o URL está correto ou entre em contato com o proprietário do site.
          </p>
        </div>
      </div>
    );
  }

  // Se há um propertySlug na URL, mostrar página de detalhes
  if (propertySlug) {
    return <PropertyDetailPage />;
  }

  return (
    <>
      {/* Meta tags para o site da imobiliária */}
      <Helmet>
        <title>{brokerProfile?.business_name || 'Imobiliária'}</title>
        <meta 
          name="description" 
          content={`Encontre imóveis com ${brokerProfile?.business_name || 'nossa imobiliária'}. ${properties.length} propriedades disponíveis para venda e locação.`} 
        />
        
        {/* Open Graph */}
        <meta 
          property="og:title" 
          content={`${brokerProfile?.business_name || 'Imobiliária'} - Imóveis para Venda e Locação`} 
        />
        <meta 
          property="og:description" 
          content={`Encontre seu imóvel dos sonhos com ${brokerProfile?.business_name || 'nossa imobiliária'}. ${properties.length} propriedades disponíveis.`} 
        />
        <meta 
          property="og:image" 
          content={brokerProfile?.logo_url ? 
            (brokerProfile.logo_url.startsWith('http') ? brokerProfile.logo_url : `${window.location.origin}${brokerProfile.logo_url}`) :
            `${window.location.origin}/placeholder.svg`
          } 
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta 
          name="twitter:title" 
          content={`${brokerProfile?.business_name || 'Imobiliária'} - Imóveis para Venda e Locação`} 
        />
        
        {/* Canonical URL */}
        <link rel="canonical" href={window.location.href} />
        <meta name="robots" content="index, follow" />
      </Helmet>
      
      <div className="public-site-layout min-h-screen bg-white">
      <TrackingScripts trackingScripts={brokerProfile?.tracking_scripts} />
      <FixedHeader brokerProfile={brokerProfile} />
      <HeroBanner brokerProfile={brokerProfile} />
      
      <div id="search" className="w-full py-8">
        <div className="content-container">
          <SearchFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filters={filters}
            setFilters={setFilters}
            hasActiveFilters={hasActiveFilters}
            primaryColor={brokerProfile?.primary_color || '#2563eb'}
            secondaryColor={brokerProfile?.secondary_color || '#64748b'}
          />
        </div>
      </div>

      {featuredProperties.length > 0 && (
        <FeaturedProperties
          properties={featuredProperties}
          brokerProfile={brokerProfile}
          onContactLead={handleContactLead}
          onShare={handleShare}
          onFavorite={handleFavorite}
          isFavorited={isFavorited}
          onImageClick={handleImageClick}
        />
      )}

      {regularProperties.length > 0 && (
        <PropertiesGrid
          properties={regularProperties}
          brokerProfile={brokerProfile}
          onContactLead={handleContactLead}
          onShare={handleShare}
          onFavorite={handleFavorite}
          isFavorited={isFavorited}
          onImageClick={handleImageClick}
        />
      )}

      {properties.length > 0 && (
        <div id="contact">
          <ContactCTA brokerProfile={brokerProfile} />
        </div>
      )}

      <div id="footer">
        <Footer 
          brokerProfile={brokerProfile} 
          socialLinks={socialLinks} 
          onContactRequest={fetchContactInfo}
        />
      </div>
      
      <WhatsAppFloat 
        brokerProfile={brokerProfile} 
        onContactRequest={fetchContactInfo}
      />
    </div>
    </>
  );
};

export default PublicSite;
