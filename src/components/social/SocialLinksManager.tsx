import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, Facebook, Instagram, Youtube, Linkedin, Twitter, Globe } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  display_order: number;
  is_active: boolean;
}

const platforms = [
  { value: 'facebook', label: 'Facebook', icon: Facebook },
  { value: 'instagram', label: 'Instagram', icon: Instagram },
  { value: 'youtube', label: 'YouTube', icon: Youtube },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { value: 'twitter', label: 'Twitter/X', icon: Twitter },
  { value: 'website', label: 'Website', icon: Globe },
];

const SocialLinksManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
  const [formData, setFormData] = useState({
    platform: '',
    url: '',
    is_active: true,
  });

  useEffect(() => {
    if (user) {
      fetchSocialLinks();
    }
  }, [user]);

  const fetchSocialLinks = async () => {
    try {
      const { data: brokerData } = await supabase
        .from('brokers')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!brokerData) return;

      const { data, error } = await supabase
        .from('social_links')
        .select('*')
        .eq('broker_id', brokerData.id)
        .order('display_order');

      if (error) throw error;
      setSocialLinks(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar redes sociais",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: brokerData } = await supabase
        .from('brokers')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!brokerData) throw new Error('Broker não encontrado');

      const linkData = {
        broker_id: brokerData.id,
        platform: formData.platform,
        url: formData.url,
        is_active: formData.is_active,
        display_order: editingLink?.display_order || socialLinks.length,
      };

      if (editingLink) {
        const { error } = await supabase
          .from('social_links')
          .update(linkData)
          .eq('id', editingLink.id);

        if (error) throw error;
        toast({ title: "Link atualizado com sucesso!" });
      } else {
        const { error } = await supabase
          .from('social_links')
          .insert(linkData);

        if (error) throw error;
        toast({ title: "Link criado com sucesso!" });
      }

      resetForm();
      setOpen(false);
      fetchSocialLinks();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar link",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteLink = async (id: string) => {
    try {
      const { error } = await supabase
        .from('social_links')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Link excluído com sucesso!" });
      fetchSocialLinks();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir link",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateOrder = async (id: string, newOrder: number) => {
    try {
      const { error } = await supabase
        .from('social_links')
        .update({ display_order: newOrder })
        .eq('id', id);

      if (error) throw error;
      fetchSocialLinks();
    } catch (error: any) {
      toast({
        title: "Erro ao reordenar link",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      platform: '',
      url: '',
      is_active: true,
    });
    setEditingLink(null);
  };

  const openEditDialog = (link: SocialLink) => {
    setEditingLink(link);
    setFormData({
      platform: link.platform,
      url: link.url,
      is_active: link.is_active,
    });
    setOpen(true);
  };

  const getPlatformIcon = (platform: string) => {
    const platformData = platforms.find(p => p.value === platform);
    const IconComponent = platformData?.icon || Globe;
    return <IconComponent className="h-4 w-4" />;
  };

  const getPlatformLabel = (platform: string) => {
    return platforms.find(p => p.value === platform)?.label || platform;
  };

  if (loading) {
    return <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Redes Sociais</CardTitle>
            <CardDescription>
              Gerencie os links das redes sociais no rodapé do site
            </CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Link
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingLink ? 'Editar Link' : 'Novo Link'}
                </DialogTitle>
                <DialogDescription>
                  Adicione um link para rede social
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Plataforma *</Label>
                  <Select
                    value={formData.platform}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, platform: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a plataforma" />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map(platform => (
                        <SelectItem key={platform.value} value={platform.value}>
                          <div className="flex items-center gap-2">
                            <platform.icon className="h-4 w-4" />
                            {platform.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">URL *</Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://www.facebook.com/minha-imobiliaria"
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">Link ativo</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Salvando...' : editingLink ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {socialLinks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhum link cadastrado</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plataforma</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ordem</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {socialLinks.map((link, index) => (
                <TableRow key={link.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(link.platform)}
                      {getPlatformLabel(link.platform)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {link.url.substring(0, 40)}...
                    </a>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      link.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {link.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateOrder(link.id, link.display_order - 1)}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <span className="text-sm">{link.display_order}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateOrder(link.id, link.display_order + 1)}
                        disabled={index === socialLinks.length - 1}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(link)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteLink(link.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default SocialLinksManager;