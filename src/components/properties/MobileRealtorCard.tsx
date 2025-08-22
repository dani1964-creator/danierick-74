import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Property {
  id: string;
  title: string;
  price: number;
  property_code: string;
  realtor_name?: string;
  realtor_avatar_url?: string;
  realtor_creci?: string;
  realtor_bio?: string;
  realtor_whatsapp_button_text?: string;
}

interface BrokerProfile {
  id: string;
  business_name: string;
  logo_url: string | null;
  primary_color: string | null;
  whatsapp_button_color: string | null;
  whatsapp_button_text: string | null;
}

interface MobileRealtorCardProps {
  property: Property;
  brokerProfile: BrokerProfile;
  onWhatsAppClick: () => void;
}

const MobileRealtorCard = ({ property, brokerProfile, onWhatsAppClick }: MobileRealtorCardProps) => {
  // Só renderiza se houver corretor associado à propriedade
  if (!property.realtor_name) {
    return null;
  }

  return (
    <Card className="bg-white shadow-sm border border-gray-200 rounded-lg">
      <CardContent className="p-4">
        <h3 className="text-base font-semibold mb-3 text-gray-900">Corretor</h3>
        
        {/* Informações do Corretor */}
        <div className="flex items-center space-x-3 mb-4">
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
            <p className="font-semibold text-gray-900 text-sm">
              {property.realtor_name}
            </p>
            <p className="text-xs text-gray-600">
              Corretor {property.realtor_creci && `• CRECI ${property.realtor_creci}`}
            </p>
          </div>
        </div>

        {/* Bio compacta apenas se houver */}
        {property.realtor_bio && (
          <p className="text-gray-700 text-xs leading-relaxed mb-3 line-clamp-2">
            {property.realtor_bio}
          </p>
        )}

        {/* Botão do WhatsApp */}
        <Button
          onClick={onWhatsAppClick}
          className="w-full text-white font-medium text-sm py-3"
          style={{ 
            backgroundColor: brokerProfile?.whatsapp_button_color || '#25D366',
            borderColor: brokerProfile?.whatsapp_button_color || '#25D366'
          }}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 mr-2" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.69"/>
          </svg>
          <span>
            {property.realtor_whatsapp_button_text || 'Tire suas dúvidas!'}
          </span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default MobileRealtorCard;