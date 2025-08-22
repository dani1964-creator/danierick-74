import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface BrokerProfile {
  id: string;
  business_name: string;
  whatsapp_button_color?: string | null;
  whatsapp_button_text?: string | null;
  address: string | null;
  cnpj: string | null;
}

interface BrokerContact {
  whatsapp_number: string | null;
  contact_email: string | null;
  creci: string | null;
}

interface WhatsAppFloatProps {
  brokerProfile: BrokerProfile | null;
  onContactRequest: () => Promise<BrokerContact | null>;
}

const WhatsAppFloat = ({ brokerProfile, onContactRequest }: WhatsAppFloatProps) => {
  const [contactInfo, setContactInfo] = useState<BrokerContact | null>(null);
  const [contactRequested, setContactRequested] = useState(false);
  const { toast } = useToast();

  const whatsappColor = brokerProfile?.whatsapp_button_color || '#25D366';
  const buttonText = brokerProfile?.whatsapp_button_text || 'Fale com um corretor';

  // Function to request contact information when needed
  const handleContactRequest = async () => {
    if (!contactRequested && !contactInfo) {
      setContactRequested(true);
      const contact = await onContactRequest();
      setContactInfo(contact);
    }
  };

  const handleWhatsAppClick = async () => {
    // Fetch contact info if not already loaded
    if (!contactInfo) {
      await handleContactRequest();
    }
    
    // Use the fetched contact info
    const currentContactInfo = contactInfo || await onContactRequest();
    
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
      console.warn('Contact information access denied or rate limited');
    }
  };

  // Only render if broker profile exists
  if (!brokerProfile) {
    return null;
  }

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 text-white p-4 rounded-full shadow-lg whatsapp-pulse z-50 flex items-center justify-center"
      style={{ backgroundColor: whatsappColor }}
      aria-label="Falar no WhatsApp"
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.69"/>
      </svg>
    </button>
  );
};

export default WhatsAppFloat;