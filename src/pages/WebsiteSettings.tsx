import { useState, useEffect } from 'react';
import { Save, Globe, Palette, Code, Share2, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import LogoUpload from '@/components/settings/LogoUpload';
import BackgroundImageUpload from '@/components/settings/BackgroundImageUpload';
import SocialLinksManager from '@/components/social/SocialLinksManager';
import BackgroundStyleSelector from '@/components/backgrounds/BackgroundStyleSelector';

interface BrokerProfile {
  id: string;
  business_name: string;
  display_name: string;
  website_slug: string;
  address: string | null;
  about_text: string | null;
  footer_text: string | null;
  whatsapp_number: string | null;
  contact_email: string | null;
  creci: string | null;
  cnpj: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  background_image_url: string | null;
  overlay_color: string | null;
  overlay_opacity: string | null;
  whatsapp_button_text: string | null;
  whatsapp_button_color: string | null;
  tracking_scripts: any;
  about_us_content: string | null;
  privacy_policy_content: string | null;
  terms_of_use_content: string | null;
  sections_background_style: string | null;
  sections_background_color_1: string | null;
  sections_background_color_2: string | null;
  sections_background_color_3: string | null;
}

const WebsiteSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<BrokerProfile | null>(null);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('brokers')
        .select('id, business_name, display_name, website_slug, address, about_text, footer_text, whatsapp_number, contact_email, creci, cnpj, hero_title, hero_subtitle, logo_url, primary_color, secondary_color, background_image_url, overlay_color, overlay_opacity, whatsapp_button_text, whatsapp_button_color, tracking_scripts, about_us_content, privacy_policy_content, terms_of_use_content, sections_background_style, sections_background_color_1, sections_background_color_2, sections_background_color_3')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setProfile({
        ...data,
        overlay_color: data.overlay_color || '#000000',
        overlay_opacity: data.overlay_opacity || '50',
        sections_background_style: data.sections_background_style || 'style1',
        sections_background_color_1: data.sections_background_color_1 || '#2563eb',
        sections_background_color_2: data.sections_background_color_2 || '#64748b',
        sections_background_color_3: data.sections_background_color_3 || '#ffffff'
      });
    } catch (error: any) {
      toast({
        title: "Erro ao carregar perfil",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('brokers')
        .update({
          business_name: profile.business_name,
          display_name: profile.display_name,
          website_slug: profile.website_slug,
          address: profile.address,
          about_text: profile.about_text,
          footer_text: profile.footer_text,
          whatsapp_number: profile.whatsapp_number,
          contact_email: profile.contact_email,
          creci: profile.creci,
          cnpj: profile.cnpj,
          hero_title: profile.hero_title,
          hero_subtitle: profile.hero_subtitle,
          logo_url: profile.logo_url,
          primary_color: profile.primary_color,
          secondary_color: profile.secondary_color,
          background_image_url: profile.background_image_url,
          overlay_color: profile.overlay_color,
          overlay_opacity: profile.overlay_opacity,
          whatsapp_button_text: profile.whatsapp_button_text,
          whatsapp_button_color: profile.whatsapp_button_color,
          tracking_scripts: profile.tracking_scripts,
          about_us_content: profile.about_us_content,
          privacy_policy_content: profile.privacy_policy_content,
          terms_of_use_content: profile.terms_of_use_content,
          sections_background_style: profile.sections_background_style,
          sections_background_color_1: profile.sections_background_color_1,
          sections_background_color_2: profile.sections_background_color_2,
          sections_background_color_3: profile.sections_background_color_3,
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Configurações salvas",
        description: "Suas configurações foram atualizadas com sucesso."
      });
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateProfile = (field: keyof BrokerProfile, value: string | any) => {
    if (profile) {
      setProfile({ ...profile, [field]: value });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="h-8 w-60 bg-muted rounded-md animate-pulse" />
              <div className="h-4 w-80 bg-muted rounded-md animate-pulse" />
            </div>
            <div className="h-10 w-40 bg-muted rounded-md animate-pulse" />
          </div>
          
          <div className="w-full">
            <div className="grid w-full grid-cols-5 h-10 bg-muted rounded-md animate-pulse mb-6" />
            
            <div className="space-y-6">
              <div className="bg-card rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 bg-muted rounded animate-pulse" />
                    <div className="h-6 w-48 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="h-4 w-64 bg-muted rounded animate-pulse mt-2" />
                </div>
                <div className="p-6 space-y-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                      <div className="h-10 w-full bg-muted rounded animate-pulse" />
                      <div className="h-3 w-48 bg-muted rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Erro ao carregar perfil</h3>
              <p className="text-muted-foreground">
                Não foi possível carregar suas configurações.
              </p>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Configurações do Site</h1>
            <p className="text-muted-foreground">
              Configure o conteúdo e aparência do seu site público
            </p>
          </div>
          <Button onClick={saveProfile} disabled={saving} className="self-start sm:self-auto">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col gap-2 w-full mb-6">
            <div className="grid grid-cols-2 gap-2 w-full">
              <Button
                variant={activeTab === 'general' ? 'default' : 'outline'}
                onClick={() => setActiveTab('general')}
                className="text-sm"
              >
                Geral
              </Button>
              <Button
                variant={activeTab === 'visual' ? 'default' : 'outline'}
                onClick={() => setActiveTab('visual')}
                className="text-sm"
              >
                Identidade Visual
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full">
              <Button
                variant={activeTab === 'pages' ? 'default' : 'outline'}
                onClick={() => setActiveTab('pages')}
                className="text-sm"
              >
                Páginas
              </Button>
              <Button
                variant={activeTab === 'social' ? 'default' : 'outline'}
                onClick={() => setActiveTab('social')}
                className="text-sm"
              >
                Redes Sociais
              </Button>
            </div>
            <div className="w-full">
              <Button
                variant={activeTab === 'tracking' ? 'default' : 'outline'}
                onClick={() => setActiveTab('tracking')}
                className="text-sm w-full"
              >
                Rastreamento
              </Button>
            </div>
          </div>
          <TabsList className="sr-only">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="visual">Identidade Visual</TabsTrigger>
            <TabsTrigger value="pages">Páginas</TabsTrigger>
            <TabsTrigger value="social">Redes Sociais</TabsTrigger>
            <TabsTrigger value="tracking">Rastreamento</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Informações Gerais
                </CardTitle>
                <CardDescription>
                  Configure as informações públicas que aparecerão no seu site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="business_name">Nome da Imobiliária</Label>
                    <Input
                      id="business_name"
                      value={profile.business_name || ''}
                      onChange={(e) => updateProfile('business_name', e.target.value)}
                      placeholder="Minha Imobiliária Ltda"
                    />
                    <p className="text-sm text-muted-foreground">
                      Nome oficial da empresa que aparece no site
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="display_name">Nome de Exibição</Label>
                    <Input
                      id="display_name"
                      value={profile.display_name || ''}
                      onChange={(e) => updateProfile('display_name', e.target.value)}
                      placeholder="Alexandre Ferreira"
                    />
                    <p className="text-sm text-muted-foreground">
                      Nome do corretor ou responsável que será exibido publicamente
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      value={profile.address || ''}
                      onChange={(e) => updateProfile('address', e.target.value)}
                      placeholder="Rua das Flores, 123 - Centro - São Paulo/SP"
                    />
                    <p className="text-sm text-muted-foreground">
                      Endereço completo que será exibido no site público
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="about_text">Sobre a Imobiliária</Label>
                    <Textarea
                      id="about_text"
                      value={profile.about_text || ''}
                      onChange={(e) => updateProfile('about_text', e.target.value)}
                      placeholder="Somos uma imobiliária especializada em soluções completas para compra, venda e locação..."
                      rows={4}
                    />
                    <p className="text-sm text-muted-foreground">
                      Texto descritivo sobre a imobiliária que aparece no site
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="footer_text">Texto do Rodapé</Label>
                    <Input
                      id="footer_text"
                      value={profile.footer_text || ''}
                      onChange={(e) => updateProfile('footer_text', e.target.value)}
                      placeholder="Todos os direitos reservados"
                    />
                    <p className="text-sm text-muted-foreground">
                      Texto que aparece no rodapé do site
                    </p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="text-lg font-semibold mb-4">Informações de Contato</h4>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact_email">Email de Contato</Label>
                      <Input
                        id="contact_email"
                        type="email"
                        value={profile.contact_email || ''}
                        onChange={(e) => updateProfile('contact_email', e.target.value)}
                        placeholder="contato@imobiliaria.com"
                      />
                      <p className="text-sm text-muted-foreground">
                        Email que será exibido no site público para contato
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="whatsapp_number">Número do WhatsApp</Label>
                      <Input
                        id="whatsapp_number"
                        value={profile.whatsapp_number || ''}
                        onChange={(e) => updateProfile('whatsapp_number', e.target.value)}
                        placeholder="5511999999999"
                      />
                      <p className="text-sm text-muted-foreground">
                        Número com código do país (sem símbolos). Ex: 5511999999999
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="creci">CRECI</Label>
                      <Input
                        id="creci"
                        value={profile.creci || ''}
                        onChange={(e) => updateProfile('creci', e.target.value)}
                        placeholder="12345-J"
                      />
                      <p className="text-sm text-muted-foreground">
                        Número do CRECI que será exibido no site público
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cnpj">CNPJ</Label>
                      <Input
                        id="cnpj"
                        value={profile.cnpj || ''}
                        onChange={(e) => updateProfile('cnpj', e.target.value)}
                        placeholder="00.000.000/0000-00"
                      />
                      <p className="text-sm text-muted-foreground">
                        CNPJ da empresa que será exibido no rodapé do site público
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="text-lg font-semibold mb-4">Configurações do Site</h4>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="website_slug">URL do Site</Label>
                      <div className="flex items-center">
                        <span className="text-sm text-muted-foreground mr-2">
                          https://meusite.com/
                        </span>
                        <Input
                          id="website_slug"
                          value={profile.website_slug || ''}
                          onChange={(e) => updateProfile('website_slug', e.target.value)}
                          placeholder="minha-imobiliaria"
                          className="flex-1"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        URL amigável para o seu site público
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hero_title">Frase Principal do Site</Label>
                      <Input
                        id="hero_title"
                        value={profile.hero_title || ''}
                        onChange={(e) => updateProfile('hero_title', e.target.value)}
                        placeholder="Encontre o lar dos seus sonhos"
                      />
                      <p className="text-sm text-muted-foreground">
                        Frase de impacto que aparece em destaque no banner principal
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hero_subtitle">Descrição Complementar</Label>
                      <Input
                        id="hero_subtitle"
                        value={profile.hero_subtitle || ''}
                        onChange={(e) => updateProfile('hero_subtitle', e.target.value)}
                        placeholder="Oferecemos os melhores imóveis da região"
                      />
                      <p className="text-sm text-muted-foreground">
                        Texto complementar que aparece abaixo da frase principal
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visual" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Identidade Visual
                </CardTitle>
                <CardDescription>
                  Personalize as cores e aparência do seu site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <LogoUpload
                  logoUrl={profile?.logo_url || ''}
                  onLogoChange={(url) => updateProfile('logo_url', url)}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="primary_color">Cor Principal</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="primary_color"
                        type="color"
                        value={profile?.primary_color || '#2563eb'}
                        onChange={(e) => updateProfile('primary_color', e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={profile?.primary_color || '#2563eb'}
                        onChange={(e) => updateProfile('primary_color', e.target.value)}
                        placeholder="#2563eb"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondary_color">Cor Secundária</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="secondary_color"
                        type="color"
                        value={profile?.secondary_color || '#64748b'}
                        onChange={(e) => updateProfile('secondary_color', e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={profile?.secondary_color || '#64748b'}
                        onChange={(e) => updateProfile('secondary_color', e.target.value)}
                        placeholder="#64748b"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <BackgroundImageUpload
                  imageUrl={profile?.background_image_url || ''}
                  onImageChange={(url) => updateProfile('background_image_url', url)}
                />

                <div className="space-y-2">
                  <Label htmlFor="overlay_color">Cor do Overlay</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="overlay_color"
                      type="color"
                      value={profile?.overlay_color || '#000000'}
                      onChange={(e) => updateProfile('overlay_color', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={profile?.overlay_color || '#000000'}
                      onChange={(e) => updateProfile('overlay_color', e.target.value)}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Cor do overlay sobre a imagem de fundo
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="overlay_opacity">Intensidade do Overlay</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="overlay_opacity"
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={profile?.overlay_opacity || 50}
                      onChange={(e) => updateProfile('overlay_opacity', e.target.value)}
                      className="flex-1"
                    />
                    <span className="text-sm w-12">{profile?.overlay_opacity || 50}%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Controle a transparência do overlay (0% = transparente, 100% = opaco)
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp_button_text">Texto do Botão WhatsApp</Label>
                    <Input
                      id="whatsapp_button_text"
                      value={profile?.whatsapp_button_text || 'Fale com um corretor'}
                      onChange={(e) => updateProfile('whatsapp_button_text', e.target.value)}
                      placeholder="Fale com um corretor"
                    />
                    <p className="text-sm text-muted-foreground">
                      Texto que aparecerá nos botões de contato via WhatsApp
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp_button_color">Cor do Botão WhatsApp</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="whatsapp_button_color"
                        type="color"
                        value={profile?.whatsapp_button_color || '#25D366'}
                        onChange={(e) => updateProfile('whatsapp_button_color', e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={profile?.whatsapp_button_color || '#25D366'}
                        onChange={(e) => updateProfile('whatsapp_button_color', e.target.value)}
                        placeholder="#25D366"
                        className="flex-1"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Cor dos botões de contato via WhatsApp (independente do tema)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Backgrounds das Seções
                </CardTitle>
                <CardDescription>
                  Personalize o estilo visual das seções "Imóveis em Destaque" e "Todos os Imóveis"
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BackgroundStyleSelector
                  selectedStyle={profile?.sections_background_style || 'style1'}
                  color1={profile?.sections_background_color_1 || '#2563eb'}
                  color2={profile?.sections_background_color_2 || '#64748b'}
                  color3={profile?.sections_background_color_3 || '#ffffff'}
                  onStyleChange={(style) => updateProfile('sections_background_style', style)}
                  onColorChange={(colorIndex, color) => {
                    const field = `sections_background_color_${colorIndex}` as keyof BrokerProfile;
                    updateProfile(field, color);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Páginas Básicas
                </CardTitle>
                <CardDescription>
                  Configure o conteúdo das páginas institucionais do seu site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="about_us_content">Sobre Nós</Label>
                  <Textarea
                    id="about_us_content"
                    value={profile?.about_us_content || ''}
                    onChange={(e) => updateProfile('about_us_content', e.target.value)}
                    placeholder="Conte a história da sua empresa, missão, visão e valores..."
                    rows={8}
                    className="font-mono text-sm"
                  />
                  <p className="text-sm text-muted-foreground">
                    Conteúdo que será exibido na página "Sobre Nós". Use **texto** para negrito.
                  </p>
                  <p className="text-sm text-blue-600">
                    <strong>URL:</strong> /{profile?.website_slug}/sobre-nos
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="privacy_policy_content">Política de Privacidade</Label>
                  <Textarea
                    id="privacy_policy_content"
                    value={profile?.privacy_policy_content || ''}
                    onChange={(e) => updateProfile('privacy_policy_content', e.target.value)}
                    placeholder="Descreva como sua empresa coleta, usa e protege os dados dos usuários..."
                    rows={8}
                    className="font-mono text-sm"
                  />
                  <p className="text-sm text-muted-foreground">
                    Conteúdo que será exibido na página "Política de Privacidade". Use **texto** para negrito.
                  </p>
                  <p className="text-sm text-blue-600">
                    <strong>URL:</strong> /{profile?.website_slug}/politica-de-privacidade
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="terms_of_use_content">Termos de Uso</Label>
                  <Textarea
                    id="terms_of_use_content"
                    value={profile?.terms_of_use_content || ''}
                    onChange={(e) => updateProfile('terms_of_use_content', e.target.value)}
                    placeholder="Defina as regras de utilização do site, direitos e responsabilidades..."
                    rows={8}
                    className="font-mono text-sm"
                  />
                  <p className="text-sm text-muted-foreground">
                    Conteúdo que será exibido na página "Termos de Uso". Use **texto** para negrito.
                  </p>
                  <p className="text-sm text-blue-600">
                    <strong>URL:</strong> /{profile?.website_slug}/termos-de-uso
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">💡 Dicas de formatação:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Use **texto** para deixar o texto em negrito</li>
                    <li>• Use *texto* para deixar o texto em itálico</li>
                    <li>• Quebras de linha são convertidas automaticamente</li>
                    <li>• As páginas são linkadas automaticamente no rodapé do site</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <SocialLinksManager />
          </TabsContent>

          <TabsContent value="tracking" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Pixels de Redes Sociais
                </CardTitle>
                <CardDescription>
                  Configure pixels das principais redes sociais para rastreamento de conversões
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="google_analytics">Google Analytics ID</Label>
                  <Input
                    id="google_analytics"
                    value={profile?.tracking_scripts?.google_analytics || ''}
                    onChange={(e) => updateProfile('tracking_scripts', {
                      ...profile?.tracking_scripts,
                      google_analytics: e.target.value
                    })}
                    placeholder="G-XXXXXXXXXX"
                  />
                  <p className="text-xs text-muted-foreground">
                    ID do Google Analytics (ex: G-ABC123DEF4)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facebook_pixel">Facebook Pixel ID</Label>
                  <Input
                    id="facebook_pixel"
                    value={profile?.tracking_scripts?.facebook_pixel || ''}
                    onChange={(e) => updateProfile('tracking_scripts', {
                      ...profile?.tracking_scripts,
                      facebook_pixel: e.target.value
                    })}
                    placeholder="123456789012345"
                  />
                  <p className="text-xs text-muted-foreground">
                    ID numérico do Facebook Pixel
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tiktok_pixel">TikTok Pixel ID</Label>
                  <Input
                    id="tiktok_pixel"
                    value={profile?.tracking_scripts?.tiktok_pixel || ''}
                    onChange={(e) => updateProfile('tracking_scripts', {
                      ...profile?.tracking_scripts,
                      tiktok_pixel: e.target.value
                    })}
                    placeholder="C4A..."
                  />
                  <p className="text-xs text-muted-foreground">
                    ID do Pixel do TikTok
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin_insight">LinkedIn Insight Tag ID</Label>
                  <Input
                    id="linkedin_insight"
                    value={profile?.tracking_scripts?.linkedin_insight || ''}
                    onChange={(e) => updateProfile('tracking_scripts', {
                      ...profile?.tracking_scripts,
                      linkedin_insight: e.target.value
                    })}
                    placeholder="123456"
                  />
                  <p className="text-xs text-muted-foreground">
                    ID do LinkedIn Insight Tag
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="google_ads">Google Ads ID</Label>
                  <Input
                    id="google_ads"
                    value={profile?.tracking_scripts?.google_ads || ''}
                    onChange={(e) => updateProfile('tracking_scripts', {
                      ...profile?.tracking_scripts,
                      google_ads: e.target.value
                    })}
                    placeholder="AW-123456789"
                  />
                  <p className="text-xs text-muted-foreground">
                    ID de Conversão do Google Ads
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pinterest_tag">Pinterest Tag ID</Label>
                  <Input
                    id="pinterest_tag"
                    value={profile?.tracking_scripts?.pinterest_tag || ''}
                    onChange={(e) => updateProfile('tracking_scripts', {
                      ...profile?.tracking_scripts,
                      pinterest_tag: e.target.value
                    })}
                    placeholder="2612..."
                  />
                  <p className="text-xs text-muted-foreground">
                    ID do Pinterest Tag
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="snapchat_pixel">Snapchat Pixel ID</Label>
                  <Input
                    id="snapchat_pixel"
                    value={profile?.tracking_scripts?.snapchat_pixel || ''}
                    onChange={(e) => updateProfile('tracking_scripts', {
                      ...profile?.tracking_scripts,
                      snapchat_pixel: e.target.value
                    })}
                    placeholder="12345678-1234-1234-1234-123456789012"
                  />
                  <p className="text-xs text-muted-foreground">
                    ID do Snapchat Pixel
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter_pixel">Twitter Pixel ID</Label>
                  <Input
                    id="twitter_pixel"
                    value={profile?.tracking_scripts?.twitter_pixel || ''}
                    onChange={(e) => updateProfile('tracking_scripts', {
                      ...profile?.tracking_scripts,
                      twitter_pixel: e.target.value
                    })}
                    placeholder="o1234"
                  />
                  <p className="text-xs text-muted-foreground">
                    ID do Twitter Pixel
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Configuração de UTMs
                </CardTitle>
                <CardDescription>
                  Configure parâmetros UTM padrão para rastreamento de origem do tráfego
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="utm_source">UTM Source</Label>
                    <Input
                      id="utm_source"
                      value={profile?.tracking_scripts?.utm_source || ''}
                      onChange={(e) => updateProfile('tracking_scripts', {
                        ...profile?.tracking_scripts,
                        utm_source: e.target.value
                      })}
                      placeholder="site_imobiliaria"
                    />
                    <p className="text-xs text-muted-foreground">
                      Origem do tráfego (ex: google, facebook)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="utm_medium">UTM Medium</Label>
                    <Input
                      id="utm_medium"
                      value={profile?.tracking_scripts?.utm_medium || ''}
                      onChange={(e) => updateProfile('tracking_scripts', {
                        ...profile?.tracking_scripts,
                        utm_medium: e.target.value
                      })}
                      placeholder="organic"
                    />
                    <p className="text-xs text-muted-foreground">
                      Meio de marketing (ex: cpc, email, social)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="utm_campaign">UTM Campaign</Label>
                    <Input
                      id="utm_campaign"
                      value={profile?.tracking_scripts?.utm_campaign || ''}
                      onChange={(e) => updateProfile('tracking_scripts', {
                        ...profile?.tracking_scripts,
                        utm_campaign: e.target.value
                      })}
                      placeholder="imoveis_vendas"
                    />
                    <p className="text-xs text-muted-foreground">
                      Nome da campanha específica
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="utm_term">UTM Term</Label>
                    <Input
                      id="utm_term"
                      value={profile?.tracking_scripts?.utm_term || ''}
                      onChange={(e) => updateProfile('tracking_scripts', {
                        ...profile?.tracking_scripts,
                        utm_term: e.target.value
                      })}
                      placeholder="imóveis+são+paulo"
                    />
                    <p className="text-xs text-muted-foreground">
                      Termos de pesquisa pagos (opcional)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="utm_content">UTM Content</Label>
                    <Input
                      id="utm_content"
                      value={profile?.tracking_scripts?.utm_content || ''}
                      onChange={(e) => updateProfile('tracking_scripts', {
                        ...profile?.tracking_scripts,
                        utm_content: e.target.value
                      })}
                      placeholder="banner_azul"
                    />
                    <p className="text-xs text-muted-foreground">
                      Diferencia anúncios similares (opcional)
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-900 mb-2">💡 Como usar UTMs:</h4>
                  <ul className="text-sm text-amber-800 space-y-1">
                    <li>• <strong>utm_source:</strong> Obrigatório - identifica a fonte (google, facebook, newsletter)</li>
                    <li>• <strong>utm_medium:</strong> Obrigatório - tipo de mídia (cpc, email, social, organic)</li>
                    <li>• <strong>utm_campaign:</strong> Obrigatório - nome da campanha específica</li>
                    <li>• <strong>utm_term:</strong> Opcional - palavras-chave de pesquisa paga</li>
                    <li>• <strong>utm_content:</strong> Opcional - diferencia anúncios similares</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Scripts Customizados por Posição
                </CardTitle>
                <CardDescription>
                  Adicione códigos personalizados em posições específicas da página
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="header_scripts">Scripts do Header (HEAD)</Label>
                  <Textarea
                    id="header_scripts"
                    value={profile?.tracking_scripts?.header_scripts || ''}
                    onChange={(e) => updateProfile('tracking_scripts', {
                      ...profile?.tracking_scripts,
                      header_scripts: e.target.value
                    })}
                    placeholder="<!-- Scripts que devem ser carregados no head da página -->
<script>
  // GoogleTag Manager, verificações de domínio, etc.
</script>"
                    rows={6}
                    className="font-mono text-sm"
                  />
                  <p className="text-sm text-muted-foreground">
                    Scripts inseridos no &lt;head&gt; - ideal para GTM, verificações de domínio
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="body_scripts">Scripts do Body (BODY)</Label>
                  <Textarea
                    id="body_scripts"
                    value={profile?.tracking_scripts?.body_scripts || ''}
                    onChange={(e) => updateProfile('tracking_scripts', {
                      ...profile?.tracking_scripts,
                      body_scripts: e.target.value
                    })}
                    placeholder="<!-- Scripts e elementos que devem aparecer no body -->
<noscript>
  <!-- Fallbacks para pixels quando JavaScript está desabilitado -->
</noscript>"
                    rows={6}
                    className="font-mono text-sm"
                  />
                  <p className="text-sm text-muted-foreground">
                    Scripts inseridos no início do &lt;body&gt; - ideal para noscript tags
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="footer_scripts">Scripts do Footer</Label>
                  <Textarea
                    id="footer_scripts"
                    value={profile?.tracking_scripts?.footer_scripts || ''}
                    onChange={(e) => updateProfile('tracking_scripts', {
                      ...profile?.tracking_scripts,
                      footer_scripts: e.target.value
                    })}
                    placeholder="<!-- Scripts que devem carregar por último -->
<script>
  // Chats, analytics que não são críticos, etc.
</script>"
                    rows={6}
                    className="font-mono text-sm"
                  />
                  <p className="text-sm text-muted-foreground">
                    Scripts inseridos antes do fechamento do &lt;/body&gt; - ideal para chats e widgets
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom_scripts">Scripts Customizados Gerais</Label>
                  <Textarea
                    id="custom_scripts"
                    value={profile?.tracking_scripts?.custom_scripts || ''}
                    onChange={(e) => updateProfile('tracking_scripts', {
                      ...profile?.tracking_scripts,
                      custom_scripts: e.target.value
                    })}
                    placeholder="<!-- Códigos customizados que não se encaixam nas categorias acima -->
<script>
  // Pixels personalizados, scripts específicos, etc.
</script>"
                    rows={8}
                    className="font-mono text-sm"
                  />
                  <p className="text-sm text-muted-foreground">
                    Scripts customizados inseridos no head - para códigos que não se encaixam nas outras categorias
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">💡 Como usar:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• <strong>Pixels Simples:</strong> Use os campos de ID para configuração automática</li>
                    <li>• <strong>Header:</strong> Scripts críticos que devem carregar primeiro (GTM, etc.)</li>
                    <li>• <strong>Body:</strong> Tags noscript e elementos visíveis</li>
                    <li>• <strong>Footer:</strong> Scripts não críticos (chats, widgets)</li>
                    <li>• <strong>UTMs:</strong> Parâmetros automáticos para rastreamento de origem</li>
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">✅ Para testar se está funcionando:</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Use "Facebook Pixel Helper" para verificar pixels do Facebook</li>
                    <li>• Use "Tag Assistant" do Google para verificar Google Analytics/Ads</li>
                    <li>• TikTok Pixel Helper para verificar pixels do TikTok</li>
                    <li>• Verifique o Network Tab do DevTools para confirmar disparos</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default WebsiteSettings;
