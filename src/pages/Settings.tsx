
import { useState, useEffect } from 'react';
import { Save, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

interface BrokerProfile {
  id: string;
  business_name: string;
  display_name: string;
  email: string;
  contact_email: string;
  phone: string;
  address: string;
  about_text: string;
  footer_text: string;
  whatsapp_number: string;
  creci: string;
}

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<BrokerProfile | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('brokers')
        .select('id, business_name, display_name, email, contact_email, phone, address, about_text, footer_text, whatsapp_number, creci')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
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
          contact_email: profile.contact_email,
          phone: profile.phone,
          address: profile.address,
          about_text: profile.about_text,
          footer_text: profile.footer_text,
          whatsapp_number: profile.whatsapp_number,
          creci: profile.creci,
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "Suas configurações foram salvas com sucesso."
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

  const updateProfile = (field: keyof BrokerProfile, value: string) => {
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
              <div className="h-8 w-48 bg-muted rounded-md animate-pulse" />
              <div className="h-4 w-64 bg-muted rounded-md animate-pulse" />
            </div>
            <div className="h-10 w-40 bg-muted rounded-md animate-pulse" />
          </div>
          
          <div className="bg-card rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-muted rounded animate-pulse" />
                <div className="h-6 w-48 bg-muted rounded animate-pulse" />
              </div>
              <div className="h-4 w-64 bg-muted rounded animate-pulse mt-2" />
            </div>
            <div className="p-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                    <div className="h-10 w-full bg-muted rounded animate-pulse" />
                  </div>
                ))}
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
              <h1 className="text-2xl sm:text-3xl font-bold">Configurações</h1>
              <p className="text-muted-foreground">
                Configure as informações do seu perfil
              </p>
            </div>
            <Button onClick={saveProfile} disabled={saving} className="self-start sm:self-auto">
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Básicas
              </CardTitle>
              <CardDescription>
                Configure as informações principais da sua imobiliária
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Autenticação)</Label>
                    <Input
                      id="email"
                      value={profile.email}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Email de Contato</Label>
                    <Input
                      id="contact_email"
                      value={profile.contact_email || ''}
                      onChange={(e) => updateProfile('contact_email', e.target.value)}
                      placeholder="contato@imobiliaria.com"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={profile.phone || ''}
                      onChange={(e) => updateProfile('phone', e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp_number">WhatsApp para Contato</Label>
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
                </div>

              </CardContent>
            </Card>
          </div>
    </DashboardLayout>
  );
};

export default Settings;
