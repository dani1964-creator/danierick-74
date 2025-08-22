import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin, Twitter, Youtube, Globe } from 'lucide-react';


interface BrokerProfile {
  id: string;
  business_name: string;
  display_name: string | null;
  about_text: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  footer_text: string | null;
  whatsapp_button_text: string | null;
  whatsapp_button_color: string | null;
  website_slug: string | null;
  address: string | null;
  cnpj: string | null;
}

interface BrokerContact {
  whatsapp_number: string | null;
  contact_email: string | null;
  creci: string | null;
}

interface FooterProps {
  brokerProfile: BrokerProfile | null;
  socialLinks?: any[];
  onContactRequest: () => Promise<BrokerContact | null>;
}

const Footer = ({ brokerProfile, socialLinks = [], onContactRequest }: FooterProps) => {
  const [contactInfo, setContactInfo] = useState<BrokerContact | null>(null);
  const [contactRequested, setContactRequested] = useState(false);
  const navigate = useNavigate();

  // Function to request contact information when needed
  const handleContactRequest = async () => {
    if (!contactRequested && !contactInfo) {
      setContactRequested(true);
      const contact = await onContactRequest();
      setContactInfo(contact);
    }
  };

  // Load contact info when footer is displayed
  useEffect(() => {
    handleContactRequest();
  }, []);

  // Mapear icons e cores para as plataformas
  const getIconForPlatform = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook':
        return Facebook;
      case 'instagram':
        return Instagram;
      case 'linkedin':
        return Linkedin;
      case 'twitter':
        return Twitter;
      case 'youtube':
        return Youtube;
      case 'website':
        return Globe;
      default:
        return Globe;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook':
        return '#1877F2';
      case 'instagram':
        return '#E4405F';
      case 'linkedin':
        return '#0A66C2';
      case 'twitter':
        return '#1DA1F2';
      case 'youtube':
        return '#FF0000';
      case 'website':
        return brokerProfile?.secondary_color || '#64748b';
      default:
        return brokerProfile?.secondary_color || '#64748b';
    }
  };

  // Formatar número do WhatsApp para exibição
  const formatPhoneForDisplay = (phone: string | null) => {
    if (!phone) return null;
    
    // Se o número começa com 55 (código do Brasil), remove para formatação
    const cleanPhone = phone.startsWith('55') ? phone.slice(2) : phone;
    
    // Formatar como (XX) XXXXX-XXXX
    if (cleanPhone.length === 11) {
      return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 7)}-${cleanPhone.slice(7)}`;
    }
    
    return phone;
  };

  // Function to handle internal navigation
  const handleInternalNavigation = (path: string) => {
    navigate(path);
  };

  // Verificar se há informações de contato válidas
  const hasContactInfo = contactInfo?.contact_email || contactInfo?.whatsapp_number;
  
  return (
    <footer id="footer" className="bg-gray-900 text-white py-16 w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo e Informações da Empresa */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              {brokerProfile?.logo_url ? (
                <img 
                  src={brokerProfile.logo_url} 
                  alt={brokerProfile.business_name} 
                  className="h-10 w-auto mr-3" 
                />
              ) : (
                <div 
                  className="h-10 w-10 rounded text-white flex items-center justify-center font-bold mr-3"
                  style={{ backgroundColor: brokerProfile?.primary_color || '#2563eb' }}
                >
                  {brokerProfile?.business_name?.charAt(0) || 'I'}
                </div>
              )}
              <span className="text-xl font-bold">
                {brokerProfile?.business_name || 'Imobiliária'}
              </span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              {brokerProfile?.about_text || 'Oferecemos os melhores imóveis da região com atendimento personalizado'}
            </p>
            
            {/* Redes Sociais */}
            {socialLinks.length > 0 && (
              <div className="flex space-x-4">
                {socialLinks.map((social) => {
                  const IconComponent = getIconForPlatform(social.platform);
                  return (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                      style={{ 
                        backgroundColor: getPlatformColor(social.platform),
                        color: 'white'
                      }}
                      aria-label={social.platform}
                    >
                      <IconComponent className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Contato */}
          <div>
            <h3 
              className="text-lg font-semibold mb-4"
              style={{ color: brokerProfile?.secondary_color || '#64748b' }}
            >
              Contato
            </h3>
            <div className="space-y-3">
              {brokerProfile?.display_name && (
                <div className="text-gray-300 text-sm">
                  <p className="font-semibold text-white mb-2">{brokerProfile.display_name}</p>
                </div>
              )}
              
              {contactInfo?.creci && (
                <div className="text-gray-300 text-sm mb-2">
                  <p>CRECI: {contactInfo.creci}</p>
                </div>
              )}
              
              {contactInfo?.whatsapp_number && (
                <div className="flex items-center mb-2 text-gray-300 text-sm">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>{formatPhoneForDisplay(contactInfo.whatsapp_number)}</span>
                </div>
              )}
              
              {contactInfo?.contact_email && (
                <div className="flex items-center mb-2 text-gray-300 text-sm">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>{contactInfo.contact_email}</span>
                </div>
              )}

              {brokerProfile?.address && (
                <div className="flex items-start text-gray-300 text-sm">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{brokerProfile.address}</span>
                </div>
              )}
              
              {/* Só mostrar a mensagem se realmente não houver informações de contato */}
              {!hasContactInfo && contactRequested && (
                <div className="text-gray-400 text-sm">
                  <p>Configure suas informações de contato nas configurações do site</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Links Úteis */}
          <div id="links-uteis">
            <h3 
              className="text-lg font-semibold mb-4"
              style={{ color: brokerProfile?.secondary_color || '#64748b' }}
            >
              Links Úteis
            </h3>
            <div className="space-y-2">
              <button 
                onClick={() => handleInternalNavigation(`/${brokerProfile?.website_slug || ''}/sobre-nos`)}
                className="text-gray-300 hover:text-white block text-sm transition-colors cursor-pointer w-full text-left"
              >
                Sobre Nós
              </button>
              <button 
                onClick={() => handleInternalNavigation(`/${brokerProfile?.website_slug || ''}/politica-de-privacidade`)}
                className="text-gray-300 hover:text-white block text-sm transition-colors cursor-pointer w-full text-left"
              >
                Política de Privacidade
              </button>
              <button 
                onClick={() => handleInternalNavigation(`/${brokerProfile?.website_slug || ''}/termos-de-uso`)}
                className="text-gray-300 hover:text-white block text-sm transition-colors cursor-pointer w-full text-left"
              >
                Termos de Uso
              </button>
            </div>
          </div>
        </div>
        
        {/* Rodapé Bottom */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm">
                {brokerProfile?.footer_text || 'Todos os direitos reservados'}
              </p>
              {brokerProfile?.cnpj && (
                <p className="text-gray-400 text-xs mt-1">
                  CNPJ: {brokerProfile.cnpj}
                </p>
              )}
              <p className="text-gray-400 text-sm mt-2">
                <a 
                  href="https://linkme.bio/danierickp" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Desenvolvido por DEPS
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;