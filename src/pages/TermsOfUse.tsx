import { useEffect, useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';
import { ContentPageSkeleton } from '@/components/ui/loading-skeleton';


interface BrokerProfile {
  id: string;
  business_name: string;
  display_name: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  terms_of_use_content?: string | null;
  website_slug?: string | null;
}

const TermsOfUse = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [brokerProfile, setBrokerProfile] = useState<BrokerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchBrokerProfile = async () => {
      if (!slug) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('get_public_broker_branding_secure', {
          broker_website_slug: slug
        });

        if (error) {
          console.error('Error fetching broker:', error);
          setNotFound(true);
        } else if (!data || data.length === 0) {
          setNotFound(true);
        } else {
          setBrokerProfile(data[0]);
        }
      } catch (error) {
        console.error('Error:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBrokerProfile();
  }, [slug, navigate]);


  if (loading) {
    return <ContentPageSkeleton />;
  }

  if (notFound) {
    return <Navigate to="/404" replace />;
  }

  // Convert markdown-style content to HTML
  const formatContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/- (.*?)(?=\n|$)/g, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
      .replace(/\n/g, '<br />');
  };

  const sanitizedContent = DOMPurify.sanitize(
    formatContent(brokerProfile?.terms_of_use_content || '')
  );

  return (
    <>
      <Helmet>
        <title>Termos de Uso - {brokerProfile?.business_name}</title>
        <meta name="description" content={`Termos de Uso da ${brokerProfile?.business_name}. Regras e condições para utilização dos nossos serviços.`} />
      </Helmet>

      <div className="min-h-screen bg-background animate-fade-in">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center">
              {brokerProfile?.logo_url ? (
                <img 
                  src={brokerProfile.logo_url} 
                  alt={brokerProfile.business_name} 
                  className="h-10 w-auto mr-3" 
                />
              ) : (
                <div 
                  className="h-10 w-10 rounded text-white flex items-center justify-center font-bold mr-3"
                  style={{ backgroundColor: brokerProfile?.primary_color || 'hsl(var(--primary))' }}
                >
                  {brokerProfile?.business_name?.charAt(0) || 'I'}
                </div>
              )}
              <span className="text-xl font-bold text-foreground">
                {brokerProfile?.business_name}
              </span>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-card rounded-lg shadow-lg p-8">
            <h1 
              className="text-3xl font-bold mb-8"
              style={{ color: brokerProfile?.primary_color || 'hsl(var(--primary))' }}
            >
              Termos de Uso
            </h1>
            
            <div 
              className="prose prose-lg text-muted-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          </div>

          {/* Back to site button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                // Navigate back and let the PublicSite component handle context restoration
                navigate(`/${slug}`, { replace: true });
              }}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white transition-colors hover:opacity-90"
              style={{ 
                backgroundColor: brokerProfile?.primary_color || 'hsl(var(--primary))'
              }}
            >
              Voltar ao site
            </button>
          </div>
        </main>
      </div>
    </>
  );
};

export default TermsOfUse;