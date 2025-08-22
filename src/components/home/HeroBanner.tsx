
interface BrokerProfile {
  id: string;
  business_name: string;
  display_name: string | null;
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
}

interface HeroBannerProps {
  brokerProfile: BrokerProfile;
}

const HeroBanner = ({ brokerProfile }: HeroBannerProps) => {
  const primaryColor = brokerProfile?.primary_color || '#2563eb';
  const secondaryColor = brokerProfile?.secondary_color || '#64748b';
  const backgroundImage = brokerProfile?.background_image_url;
  const overlayColor = brokerProfile?.overlay_color || 'rgba(0,0,0,0.4)';
  const overlayOpacity = brokerProfile?.overlay_opacity || '40';

  if (backgroundImage) {
    return (
      <section id="hero" className="relative h-[60vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={backgroundImage}
            alt="Banner"
            className="w-full h-full object-cover"
          />
          <div 
            className="absolute inset-0"
            style={{ 
              backgroundColor: overlayColor,
              opacity: `${overlayOpacity}%`
            }}
          />
        </div>
        
        <div className="relative z-10 h-full flex items-center justify-center text-center text-white">
          <div className="content-container">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {brokerProfile?.hero_title || 'Encontre o lar dos seus sonhos'}
            </h1>
            <p className="text-xl opacity-90">
              {brokerProfile?.hero_subtitle || 'Oferecemos os melhores imóveis da região'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      id="hero"
      className="relative h-[60vh] bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center"
      style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
    >
      <div className="text-center text-white">
        <div className="content-container">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {brokerProfile?.hero_title || 'Encontre o lar dos seus sonhos'}
          </h1>
          <p className="text-xl opacity-90">
            {brokerProfile?.hero_subtitle || 'Oferecemos os melhores imóveis da região'}
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
