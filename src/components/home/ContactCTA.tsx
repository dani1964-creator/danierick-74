
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  address: string | null;
  cnpj: string | null;
}

interface BrokerContact {
  whatsapp_number: string | null;
  contact_email: string | null;
  creci: string | null;
}

interface ContactCTAProps {
  brokerProfile: BrokerProfile;
}

const ContactCTA = ({ brokerProfile }: ContactCTAProps) => {
  const [contactInfo, setContactInfo] = useState<BrokerContact | null>(null);
  const { toast } = useToast();
  
  const whatsappButtonText = brokerProfile?.whatsapp_button_text || 'Fale com um Corretor';
  const whatsappButtonColor = brokerProfile?.whatsapp_button_color || '#25D366';

  // Fetch contact information using public RPC (no authentication required)
  const fetchContactInfo = async () => {
    if (!brokerProfile?.website_slug) {
      console.log('No broker profile or website_slug available for ContactCTA');
      return null;
    }
    
    try {
      console.log('ContactCTA fetching contact info for:', brokerProfile.website_slug);
      const { data, error } = await supabase.rpc('get_public_broker_contact', {
        broker_website_slug: brokerProfile.website_slug
      });

      console.log('ContactCTA Contact RPC response:', { data, error });

      if (error) {
        console.error('ContactCTA Error fetching contact info:', error);
        return null;
      }

      const contactInfo = data && data.length > 0 ? data[0] : null;
      console.log('ContactCTA Parsed contact info:', contactInfo);
      
      if (contactInfo) {
        setContactInfo(contactInfo);
        return contactInfo;
      }
      return null;
    } catch (error) {
      console.error('ContactCTA Error fetching contact info:', error);
      return null;
    }
  };

  // Fetch contact info when component mounts
  useEffect(() => {
    if (brokerProfile?.website_slug) {
      console.log('ContactCTA component loaded, fetching contact info...');
      fetchContactInfo();
    }
  }, [brokerProfile]);

  const handleContactClick = async () => {
    // Fetch contact info if not already loaded
    let currentContactInfo = contactInfo;
    if (!currentContactInfo) {
      currentContactInfo = await fetchContactInfo();
    }

    if (currentContactInfo?.whatsapp_number) {
      const message = encodeURIComponent('Olá! Gostaria de mais informações sobre os imóveis.');
      
      // Detectar se é mobile para usar link apropriado
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const whatsappUrl = isMobile 
        ? `whatsapp://send?phone=${currentContactInfo.whatsapp_number}&text=${message}`
        : `https://wa.me/${currentContactInfo.whatsapp_number}?text=${message}`;
      
      try {
        window.open(whatsappUrl, '_blank');
      } catch (error) {
        console.error('Erro ao abrir WhatsApp:', error);
        // Fallback para web WhatsApp
        window.open(`https://wa.me/${currentContactInfo.whatsapp_number}?text=${message}`, '_blank');
      }
    } else {
      // Show user-friendly error message
      toast({
        title: "Informações de contato não disponíveis",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
      console.warn('ContactCTA: Contact information access denied or not available');
    }
  };

  return (
    <section 
      className="py-20 w-full"
      style={{ 
        background: `linear-gradient(135deg, ${brokerProfile?.primary_color || '#2563eb'}, ${brokerProfile?.secondary_color || '#64748b'})` 
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-bold text-white mb-6">
          Pronto para encontrar o imóvel dos seus sonhos?
        </h2>
        <p className="text-xl text-white/90 mb-8 leading-relaxed">
          Nossa equipe está preparada para ajudar você em cada etapa do processo, 
          desde a busca até a finalização do negócio.
        </p>
        
        <Button
          onClick={handleContactClick}
          size="lg"
          className="text-white font-semibold py-4 px-8 text-lg hover:scale-105 transition-transform duration-200"
          style={{ backgroundColor: whatsappButtonColor }}
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-white mr-3"
          >
            <path 
              d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488" 
              fill="currentColor"
            />
          </svg>
          {whatsappButtonText}
        </Button>
      </div>
    </section>
  );
};

export default ContactCTA;
