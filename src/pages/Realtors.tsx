import { useState, useEffect } from 'react';
import { User, Mail, Phone, Plus, Edit, Trash2, Check, X, UserCheck, UserX, Award } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AvatarUpload } from '@/components/ui/avatar-upload';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

interface Realtor {
  id: string;
  broker_id: string;
  name: string;
  email: string;
  phone: string | null;
  creci: string | null;
  commission_percentage: number;
  is_active: boolean;
  avatar_url: string | null;
  bio: string | null;
  whatsapp_button_text: string;
  created_at: string;
  updated_at: string;
}

const Realtors = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [realtors, setRealtors] = useState<Realtor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingRealtor, setEditingRealtor] = useState<string | null>(null);
  const [brokerInfo, setBrokerInfo] = useState<any>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    creci: '',
    commission_percentage: 50,
    bio: '',
    avatar_url: '',
    whatsapp_button_text: 'Tire suas dúvidas!'
  });

  useEffect(() => {
    if (user) {
      fetchBrokerInfo();
      fetchRealtors();
    }
  }, [user]);

  const fetchBrokerInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('brokers')
        .select('id, business_name')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setBrokerInfo(data);
    } catch (error: any) {
      console.error('Error fetching broker info:', error);
    }
  };

  const fetchRealtors = async () => {
    try {
      const { data, error } = await supabase
        .from('realtors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRealtors(data || []);
    } catch (error: any) {
      console.error('Error fetching realtors:', error);
      toast({
        title: "Erro ao carregar corretores",
        description: "Verifique sua conexão e tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!brokerInfo) {
      toast({
        title: "Erro",
        description: "Informações do corretor não encontradas.",
        variant: "destructive"
      });
      return;
    }

    try {
      const realtorData = {
        ...formData,
        broker_id: brokerInfo.id,
        commission_percentage: Number(formData.commission_percentage)
      };

      if (editingRealtor) {
        const { error } = await supabase
          .from('realtors')
          .update(realtorData)
          .eq('id', editingRealtor);

        if (error) throw error;

        setRealtors(realtors.map(realtor => 
          realtor.id === editingRealtor 
            ? { ...realtor, ...realtorData }
            : realtor
        ));

        toast({
          title: "Corretor atualizado",
          description: "As informações do corretor foram atualizadas com sucesso."
        });
      } else {
        const { data, error } = await supabase
          .from('realtors')
          .insert([realtorData])
          .select()
          .single();

        if (error) throw error;

        setRealtors([data, ...realtors]);

        toast({
          title: "Corretor adicionado",
          description: "Novo corretor foi adicionado com sucesso."
        });
      }

      setShowAddDialog(false);
      setEditingRealtor(null);
      resetForm();
    } catch (error: any) {
      console.error('Error saving realtor:', error);
      toast({
        title: "Erro ao salvar corretor",
        description: error.message || "Tente novamente em alguns minutos.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (realtor: Realtor) => {
    setFormData({
      name: realtor.name,
      email: realtor.email,
      phone: realtor.phone || '',
      creci: realtor.creci || '',
      commission_percentage: realtor.commission_percentage,
      bio: realtor.bio || '',
      avatar_url: realtor.avatar_url || '',
      whatsapp_button_text: realtor.whatsapp_button_text || 'Tire suas dúvidas!'
    });
    setEditingRealtor(realtor.id);
    setShowAddDialog(true);
  };

  const handleDelete = async (realtorId: string) => {
    if (!confirm('Tem certeza que deseja excluir este corretor?')) return;

    try {
      const { error } = await supabase
        .from('realtors')
        .delete()
        .eq('id', realtorId);

      if (error) throw error;

      setRealtors(realtors.filter(realtor => realtor.id !== realtorId));
      
      toast({
        title: "Corretor excluído",
        description: "O corretor foi removido com sucesso."
      });
    } catch (error: any) {
      console.error('Error deleting realtor:', error);
      toast({
        title: "Erro ao excluir corretor",
        description: "Tente novamente em alguns minutos.",
        variant: "destructive"
      });
    }
  };

  const toggleRealtorStatus = async (realtorId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('realtors')
        .update({ is_active: !currentStatus })
        .eq('id', realtorId);

      if (error) throw error;

      setRealtors(realtors.map(realtor => 
        realtor.id === realtorId 
          ? { ...realtor, is_active: !currentStatus }
          : realtor
      ));

      toast({
        title: `Corretor ${!currentStatus ? 'ativado' : 'desativado'}`,
        description: `O corretor foi ${!currentStatus ? 'ativado' : 'desativado'} com sucesso.`
      });
    } catch (error: any) {
      console.error('Error updating realtor status:', error);
      toast({
        title: "Erro ao atualizar status",
        description: "Tente novamente em alguns minutos.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      creci: '',
      commission_percentage: 50,
      bio: '',
      avatar_url: '',
      whatsapp_button_text: 'Tire suas dúvidas!'
    });
  };

  const handleAddNew = () => {
    resetForm();
    setEditingRealtor(null);
    setShowAddDialog(true);
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-500 hover:bg-green-600">
        <UserCheck className="h-3 w-3 mr-1" />
        Ativo
      </Badge>
    ) : (
      <Badge variant="secondary">
        <UserX className="h-3 w-3 mr-1" />
        Inativo
      </Badge>
    );
  };

  const getActiveRealtors = () => realtors.filter(realtor => realtor.is_active);
  const getInactiveRealtors = () => realtors.filter(realtor => !realtor.is_active);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-fade-in">
          <div className="space-y-2">
            <div className="h-8 w-32 bg-muted rounded-md animate-pulse" />
            <div className="h-4 w-64 bg-muted rounded-md animate-pulse" />
          </div>
          
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card rounded-lg shadow-sm border">
                <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                </div>
                <div className="p-6 pt-0">
                  <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Corretores</h1>
            <p className="text-muted-foreground">
              Gerencie a equipe de corretores da {brokerInfo?.business_name}
            </p>
          </div>
          
          <Button onClick={handleAddNew} className="self-start sm:self-auto">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Adicionar</span> Corretor
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Corretores</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{realtors.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Corretores Ativos</CardTitle>
              <UserCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{getActiveRealtors().length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comissão Média</CardTitle>
              <Award className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {realtors.length > 0 
                  ? Math.round(realtors.reduce((sum, r) => sum + r.commission_percentage, 0) / realtors.length)
                  : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Realtors List */}
        <div className="space-y-4">
          {realtors.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12">
                <User className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum corretor cadastrado</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Adicione corretores à sua equipe para começar a gerenciar leads e vendas.
                </p>
                <Button onClick={handleAddNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Corretor
                </Button>
              </CardContent>
            </Card>
          ) : (
            realtors.map((realtor) => (
              <Card key={realtor.id}>
                 <CardContent className="p-4 sm:p-6">
                   <div className="flex flex-col md:flex-row gap-4">
                     <div className="flex items-start gap-3 flex-1 min-w-0">
                       <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                         <AvatarImage src={realtor.avatar_url || undefined} />
                         <AvatarFallback>
                           <span className="font-medium text-xs sm:text-sm">
                             {realtor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                           </span>
                         </AvatarFallback>
                       </Avatar>
                       
                       <div className="flex-1 space-y-2 min-w-0">
                         <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                           <h3 className="text-base sm:text-lg font-semibold truncate">{realtor.name}</h3>
                           <div className="flex flex-wrap items-center gap-1">
                             {getStatusBadge(realtor.is_active)}
                             <Badge variant="outline" className="text-xs">
                               <Award className="h-3 w-3 mr-1" />
                               {realtor.commission_percentage}%
                             </Badge>
                           </div>
                         </div>
                         
                         <div className="flex flex-col gap-1 text-xs sm:text-sm text-muted-foreground">
                           <div className="flex items-center gap-1 min-w-0">
                             <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                             <span className="truncate">{realtor.email}</span>
                           </div>
                           {realtor.phone && (
                             <div className="flex items-center gap-1 min-w-0">
                               <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                               <span className="truncate">{realtor.phone}</span>
                             </div>
                           )}
                           {realtor.creci && (
                             <div className="flex items-center gap-1 flex-shrink-0">
                               <span className="font-medium">CRECI:</span>
                               <span>{realtor.creci}</span>
                             </div>
                           )}
                         </div>

                         {realtor.bio && (
                           <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{realtor.bio}</p>
                         )}
                       </div>
                     </div>
                    
                    <div className="flex flex-row md:flex-col items-start gap-1 md:gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleRealtorStatus(realtor.id, realtor.is_active)}
                        className="text-xs flex-1 md:flex-none md:w-20"
                      >
                        {realtor.is_active ? (
                          <>
                            <UserX className="h-3 w-3 md:mr-1" />
                            <span className="hidden md:inline text-xs">Desativar</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-3 w-3 md:mr-1" />
                            <span className="hidden md:inline text-xs">Ativar</span>
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(realtor)}
                        className="text-xs flex-1 md:flex-none md:w-20"
                      >
                        <Edit className="h-3 w-3 md:mr-1" />
                        <span className="hidden md:inline text-xs">Editar</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(realtor.id)}
                        className="text-xs flex-1 md:flex-none md:w-20"
                      >
                        <Trash2 className="h-3 w-3 md:mr-1" />
                        <span className="hidden md:inline text-xs">Excluir</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Realtor Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingRealtor ? 'Editar Corretor' : 'Adicionar Novo Corretor'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome completo"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="creci">CRECI</Label>
                <Input
                  id="creci"
                  value={formData.creci}
                  onChange={(e) => setFormData({ ...formData, creci: e.target.value })}
                  placeholder="CRECI 123456"
                />
              </div>
            </div>

            <AvatarUpload
              currentUrl={formData.avatar_url}
              onUploadComplete={(url) => setFormData({ ...formData, avatar_url: url })}
              fallbackText={formData.name ? formData.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'A'}
            />

            <div className="space-y-2">
              <Label htmlFor="commission">Percentual de Comissão (%)</Label>
              <Input
                id="commission"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.commission_percentage}
                onChange={(e) => setFormData({ ...formData, commission_percentage: Number(e.target.value) })}
                placeholder="50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biografia</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Escreva uma mensagem chamativa para atrair leads..."
                rows={3}
              />
              <p className="text-sm text-muted-foreground">
                Este texto será exibido na página do imóvel como uma chamada para o lead entrar em contato
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp_button_text">Texto do Botão WhatsApp</Label>
              <Input
                id="whatsapp_button_text"
                value={formData.whatsapp_button_text}
                onChange={(e) => setFormData({ ...formData, whatsapp_button_text: e.target.value })}
                placeholder="Tire suas dúvidas!"
              />
              <p className="text-sm text-muted-foreground">
                Texto que aparecerá no botão do WhatsApp abaixo da biografia
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editingRealtor ? 'Atualizar' : 'Adicionar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Realtors;