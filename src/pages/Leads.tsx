import { useState, useEffect } from 'react';
import { Mail, Phone, MessageSquare, User, Clock, CheckCircle, XCircle, Edit, Trash2, Check, X, DollarSign, TrendingUp, Calendar, UserCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: string;
  source: string;
  property_id: string;
  created_at: string;
  deal_value?: number;
  commission_value?: number;
  deal_closed_at?: string;
  realtor_id?: string;
  realtor?: {
    id: string;
    name: string;
  };
  property?: {
    title: string;
    property_code: string | null;
  };
}

const Leads = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [editingLead, setEditingLead] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [editingFinancials, setEditingFinancials] = useState<string | null>(null);
  const [editDealValue, setEditDealValue] = useState('');
  const [editCommissionValue, setEditCommissionValue] = useState('');
  const [realtors, setRealtors] = useState<any[]>([]);
  const [assigningRealtor, setAssigningRealtor] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchLeads();
      fetchRealtors();
    }
  }, [user]);

  const fetchRealtors = async () => {
    try {
      const { data, error } = await supabase
        .from('realtors')
        .select('id, name, is_active')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setRealtors(data || []);
    } catch (error: any) {
      console.error('Error fetching realtors:', error);
    }
  };

  const fetchLeads = async () => {
    try {
      // With the new RLS policies, this will only return leads for the authenticated broker
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          realtor:realtors(
            id,
            name
          ),
          property:properties(
            title,
            property_code
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error: any) {
      console.error('Error fetching leads:', error);
      toast({
        title: "Erro ao carregar leads",
        description: "Verifique sua conexão e tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', leadId);

      if (error) throw error;

      setLeads(leads.map(lead => 
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      ));

      toast({
        title: "Status atualizado",
        description: "Status do lead foi atualizado com sucesso."
      });
    } catch (error: any) {
      console.error('Error updating lead status:', error);
      toast({
        title: "Erro ao atualizar status",
        description: "Tente novamente em alguns minutos.",
        variant: "destructive"
      });
    }
  };

  const handleSelectLead = (leadId: string, checked: boolean) => {
    if (checked) {
      setSelectedLeads([...selectedLeads, leadId]);
    } else {
      setSelectedLeads(selectedLeads.filter(id => id !== leadId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(leads.map(lead => lead.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const startEdit = (lead: Lead) => {
    setEditingLead(lead.id);
    setEditName(lead.name);
    setEditEmail(lead.email);
  };

  const saveEdit = async () => {
    if (!editingLead) return;
    
    try {
      const { error } = await supabase
        .from('leads')
        .update({ 
          name: editName.trim(), 
          email: editEmail.trim() 
        })
        .eq('id', editingLead);

      if (error) throw error;

      setLeads(leads.map(lead => 
        lead.id === editingLead 
          ? { ...lead, name: editName.trim(), email: editEmail.trim() } 
          : lead
      ));

      setEditingLead(null);
      setEditName('');
      setEditEmail('');

      toast({
        title: "Lead atualizado",
        description: "Informações do lead foram atualizadas com sucesso."
      });
    } catch (error: any) {
      console.error('Error updating lead:', error);
      toast({
        title: "Erro ao atualizar lead",
        description: "Tente novamente em alguns minutos.",
        variant: "destructive"
      });
    }
  };

  const cancelEdit = () => {
    setEditingLead(null);
    setEditName('');
    setEditEmail('');
  };

  const startEditFinancials = (lead: Lead) => {
    setEditingFinancials(lead.id);
    setEditDealValue(lead.deal_value?.toString() || '');
    setEditCommissionValue(lead.commission_value?.toString() || '');
  };

  const saveFinancials = async () => {
    if (!editingFinancials) return;
    
    try {
      const dealValue = editDealValue ? parseFloat(editDealValue) : null;
      const commissionValue = editCommissionValue ? parseFloat(editCommissionValue) : null;
      
      const { error } = await supabase
        .from('leads')
        .update({ 
          deal_value: dealValue,
          commission_value: commissionValue,
          deal_closed_at: dealValue ? new Date().toISOString() : null
        })
        .eq('id', editingFinancials);

      if (error) throw error;

      setLeads(leads.map(lead => 
        lead.id === editingFinancials 
          ? { 
              ...lead, 
              deal_value: dealValue || undefined,
              commission_value: commissionValue || undefined,
              deal_closed_at: dealValue ? new Date().toISOString() : undefined
            } 
          : lead
      ));

      setEditingFinancials(null);
      setEditDealValue('');
      setEditCommissionValue('');

      toast({
        title: "Valores financeiros atualizados",
        description: "Os valores do negócio foram atualizados com sucesso."
      });
    } catch (error: any) {
      console.error('Error updating financial values:', error);
      toast({
        title: "Erro ao atualizar valores",
        description: "Tente novamente em alguns minutos.",
        variant: "destructive"
      });
    }
  };

  const cancelEditFinancials = () => {
    setEditingFinancials(null);
    setEditDealValue('');
    setEditCommissionValue('');
  };

  const getFinancialSummary = () => {
    const convertedLeads = getLeadsByStatus('converted');
    const totalDealValue = convertedLeads
      .filter(lead => lead.deal_value)
      .reduce((sum, lead) => sum + (lead.deal_value || 0), 0);
    
    const totalCommission = convertedLeads
      .filter(lead => lead.commission_value)
      .reduce((sum, lead) => sum + (lead.commission_value || 0), 0);
    
    return { totalDealValue, totalCommission, convertedCount: convertedLeads.length };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const assignRealtorToLead = async (leadId: string, realtorId: string | null) => {
    try {
      const finalRealtorId = realtorId === 'none' ? null : realtorId;
      
      const { error } = await supabase
        .from('leads')
        .update({ realtor_id: finalRealtorId })
        .eq('id', leadId);

      if (error) throw error;

      setLeads(leads.map(lead => 
        lead.id === leadId 
          ? { 
              ...lead, 
              realtor_id: finalRealtorId || undefined,
              realtor: finalRealtorId ? realtors.find(r => r.id === finalRealtorId) : undefined
            } 
          : lead
      ));

      const realtorName = finalRealtorId ? realtors.find(r => r.id === finalRealtorId)?.name : 'Nenhum';
      
      toast({
        title: "Corretor atribuído",
        description: `Lead foi atribuído para: ${realtorName}`
      });
    } catch (error: any) {
      console.error('Error assigning realtor:', error);
      toast({
        title: "Erro ao atribuir corretor",
        description: "Tente novamente em alguns minutos.",
        variant: "destructive"
      });
    }
  };

  const deleteLeads = async () => {
    if (deleteConfirmText !== 'Excluir lead(s)') {
      toast({
        title: "Confirmação incorreta",
        description: "Digite exatamente 'Excluir lead(s)' para confirmar.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Tentando excluir leads:', selectedLeads);
      
      const { error, data } = await supabase
        .from('leads')
        .delete()
        .in('id', selectedLeads)
        .select();

      console.log('Resultado da exclusão:', { error, data });

      if (error) {
        console.error('Erro do Supabase na exclusão:', error);
        throw error;
      }

      console.log('Exclusão bem-sucedida, atualizando estado local');
      setLeads(leads.filter(lead => !selectedLeads.includes(lead.id)));
      setSelectedLeads([]);
      setShowDeleteDialog(false);
      setDeleteConfirmText('');

      toast({
        title: "Leads excluídos",
        description: `${selectedLeads.length} lead(s) foram excluídos com sucesso.`
      });
    } catch (error: any) {
      console.error('Error deleting leads:', error);
      toast({
        title: "Erro ao excluir leads",
        description: `Erro: ${error.message || 'Tente novamente em alguns minutos.'}`,
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="default">Novo</Badge>;
      case 'contacted':
        return <Badge variant="secondary">Contatado</Badge>;
      case 'qualified':
        return <Badge variant="outline">Qualificado</Badge>;
      case 'converted':
        return <Badge className="bg-green-500 hover:bg-green-600">Convertido</Badge>;
      case 'lost':
        return <Badge variant="destructive">Perdido</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getLeadsByStatus = (status: string) => {
    return leads.filter(lead => lead.status === status);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderPropertyInfo = (lead: Lead) => {
    if (lead.property && lead.property.title) {
      return (
        <div className="flex items-start gap-1 mt-3">
          <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <div className="text-sm">
            <p className="font-medium text-primary">Interesse no imóvel:</p>
            <p>{lead.property.title}</p>
            {lead.property.property_code && (
              <p className="text-muted-foreground">Código: {lead.property.property_code}</p>
            )}
          </div>
        </div>
      );
    }
    
    if (lead.message) {
      return (
        <div className="flex items-start gap-1 mt-3">
          <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <p className="text-sm">{lead.message}</p>
        </div>
      );
    }
    
    return null;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-fade-in">
          <div className="space-y-2">
            <div className="h-8 w-32 bg-muted rounded-md animate-pulse" />
            <div className="h-4 w-64 bg-muted rounded-md animate-pulse" />
          </div>
          
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
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
          
          <div className="w-full">
            <div className="flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground animate-pulse mb-6" />
            
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-card rounded-lg shadow-sm border p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="h-6 w-48 bg-muted rounded animate-pulse" />
                        <div className="h-6 w-16 bg-muted rounded animate-pulse" />
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="h-4 w-40 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                      </div>
                      <div className="h-12 w-full bg-muted rounded animate-pulse mt-3" />
                    </div>
                    <div className="h-8 w-32 bg-muted rounded animate-pulse ml-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6 animate-fade-in px-2 md:px-0">
         {/* Header */}
        <div className="flex flex-col gap-3 md:gap-4">
          <div className="flex flex-col gap-2">
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">Leads</h1>
              <p className="text-sm lg:text-base text-muted-foreground">
                Gerencie os contatos interessados em seus imóveis
              </p>
            </div>
          </div>
          
          {leads.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-3">
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={selectedLeads.length === leads.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-muted-foreground">
                  Selecionar todos
                </span>
              </div>
              {selectedLeads.length > 0 && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  className="self-start text-xs md:text-sm h-8 md:h-9"
                >
                  <Trash2 className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  Excluir ({selectedLeads.length})
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid gap-2 md:gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 sm:px-3 py-2">
              <CardTitle className="text-xs font-medium">Total</CardTitle>
              <User className="h-3 w-3 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-2 sm:px-3 pb-2">
              <div className="text-sm sm:text-base md:text-lg lg:text-xl font-bold">{leads.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 sm:px-3 py-2">
              <CardTitle className="text-xs font-medium">Novos</CardTitle>
              <Clock className="h-3 w-3 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-2 sm:px-3 pb-2">
              <div className="text-sm sm:text-base md:text-lg lg:text-xl font-bold">{getLeadsByStatus('new').length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 sm:px-3 py-2">
              <CardTitle className="text-xs font-medium">Convertidos</CardTitle>
              <CheckCircle className="h-3 w-3 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-2 sm:px-3 pb-2">
              <div className="text-sm sm:text-base md:text-lg lg:text-xl font-bold">{getLeadsByStatus('converted').length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 sm:px-3 py-2">
              <CardTitle className="text-xs font-medium">Taxa</CardTitle>
              <TrendingUp className="h-3 w-3 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-2 sm:px-3 pb-2">
              <div className="text-sm sm:text-base md:text-lg lg:text-xl font-bold">
                {leads.length > 0 
                  ? Math.round((getLeadsByStatus('converted').length / leads.length) * 100)
                  : 0}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 sm:px-3 py-2">
              <CardTitle className="text-xs font-medium">Valor Total</CardTitle>
              <DollarSign className="h-3 w-3 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-2 sm:px-3 pb-2">
              <div className="text-xs sm:text-sm md:text-base font-bold">
                {formatCurrency(getFinancialSummary().totalDealValue)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 sm:px-3 py-2">
              <CardTitle className="text-xs font-medium">Comissões</CardTitle>
              <DollarSign className="h-3 w-3 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-2 sm:px-3 pb-2">
              <div className="text-xs sm:text-sm md:text-base font-bold">
                {formatCurrency(getFinancialSummary().totalCommission)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leads Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <div className="space-y-2 md:space-y-0">
            {/* Mobile: Two rows layout */}
            <div className="md:hidden space-y-2">
              {/* First row: 3 tabs */}
              <div className="flex gap-1">
                <TabsList className="grid grid-cols-3 flex-1 h-9">
                  <TabsTrigger value="all" className="text-xs px-2">
                    <div className="flex items-center justify-center w-full">
                      <span>Todos</span>
                      <span className="ml-1">({leads.length})</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="new" className="text-xs px-2">
                    <div className="flex items-center justify-center w-full">
                      <span>Novos</span>
                      <span className="ml-1">({getLeadsByStatus('new').length})</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="contacted" className="text-xs px-2">
                    <div className="flex items-center justify-center w-full">
                      <span>Contatados</span>
                      <span className="ml-1">({getLeadsByStatus('contacted').length})</span>
                    </div>
                  </TabsTrigger>
                </TabsList>
              </div>
              
              {/* Second row: 2 tabs */}
              <div className="flex gap-1 justify-center">
                <TabsList className="grid grid-cols-2 w-2/3 h-9">
                  <TabsTrigger value="qualified" className="text-xs px-2">
                    <div className="flex items-center justify-center w-full">
                      <span>Qualificados</span>
                      <span className="ml-1">({getLeadsByStatus('qualified').length})</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="converted" className="text-xs px-2">
                    <div className="flex items-center justify-center w-full">
                      <span>Convertidos</span>
                      <span className="ml-1">({getLeadsByStatus('converted').length})</span>
                    </div>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            {/* Desktop: Single row layout */}
            <div className="hidden md:block">
              <TabsList className="grid w-full grid-cols-5 h-10">
                <TabsTrigger value="all" className="text-sm px-2">
                  <div className="flex items-center justify-center w-full">
                    <span>Todos</span>
                    <span className="ml-1">({leads.length})</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="new" className="text-sm px-2">
                  <div className="flex items-center justify-center w-full">
                    <span>Novos</span>
                    <span className="ml-1">({getLeadsByStatus('new').length})</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="contacted" className="text-sm px-2">
                  <div className="flex items-center justify-center w-full">
                    <span>Contatados</span>
                    <span className="ml-1">({getLeadsByStatus('contacted').length})</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="qualified" className="text-sm px-2">
                  <div className="flex items-center justify-center w-full">
                    <span>Qualificados</span>
                    <span className="ml-1">({getLeadsByStatus('qualified').length})</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="converted" className="text-sm px-2">
                  <div className="flex items-center justify-center w-full">
                    <span>Convertidos</span>
                    <span className="ml-1">({getLeadsByStatus('converted').length})</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="all" className="space-y-3 md:space-y-4">
            {leads.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-8 md:p-12">
                  <div className="text-center">
                    <h3 className="text-base md:text-lg font-semibold mb-2">Nenhum lead ainda</h3>
                    <p className="text-sm text-muted-foreground">
                      Os leads aparecerão aqui quando alguém demonstrar interesse em seus imóveis.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
                <div className="space-y-2 md:space-y-3">
                 {leads.map((lead) => (
                   <Card key={lead.id}>
                     <CardContent className="p-3 md:p-4">
                       <div className="flex flex-col gap-2 md:gap-3">
                         <div className="flex items-start gap-2 md:gap-3">
                           <Checkbox 
                             checked={selectedLeads.includes(lead.id)}
                             onCheckedChange={(checked) => handleSelectLead(lead.id, checked as boolean)}
                             className="mt-1 flex-shrink-0"
                           />
                           
                           <div className="flex-1 space-y-2 min-w-0">
                             <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                               {editingLead === lead.id ? (
                                 <div className="flex items-center gap-2 flex-1">
                                   <Input 
                                     value={editName}
                                     onChange={(e) => setEditName(e.target.value)}
                                     className="h-7 md:h-8 text-sm font-semibold"
                                     placeholder="Nome do lead"
                                   />
                                   <Button size="sm" variant="ghost" onClick={saveEdit} className="h-7 w-7 md:h-8 md:w-8 p-0">
                                     <Check className="h-3 w-3 md:h-4 md:w-4" />
                                   </Button>
                                   <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-7 w-7 md:h-8 md:w-8 p-0">
                                     <X className="h-3 w-3 md:h-4 md:w-4" />
                                   </Button>
                                 </div>
                               ) : (
                                 <>
                                   <div className="flex items-center gap-2 min-w-0 flex-1">
                                     <h3 className="text-sm md:text-base font-semibold truncate">{lead.name}</h3>
                                     <Button 
                                       size="sm" 
                                       variant="ghost" 
                                       onClick={() => startEdit(lead)}
                                       className="h-6 w-6 p-0 flex-shrink-0"
                                     >
                                       <Edit className="h-3 w-3" />
                                     </Button>
                                   </div>
                                   {getStatusBadge(lead.status)}
                                 </>
                               )}
                             </div>
                           </div>
                         </div>
                         
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs md:text-sm text-muted-foreground ml-6 md:ml-8">
                           <div className="flex items-center gap-1 min-w-0">
                             <Mail className="h-3 w-3 flex-shrink-0" />
                             {editingLead === lead.id ? (
                               <Input 
                                 value={editEmail}
                                 onChange={(e) => setEditEmail(e.target.value)}
                                 className="h-6 text-xs"
                                 placeholder="Email do lead"
                                 type="email"
                               />
                             ) : (
                               <span className="truncate">{lead.email}</span>
                             )}
                           </div>
                           {lead.phone && (
                             <div className="flex items-center gap-1 min-w-0">
                               <Phone className="h-3 w-3 flex-shrink-0" />
                               <span className="truncate">{lead.phone}</span>
                             </div>
                           )}
                           <div className="flex items-center gap-1 sm:col-span-2">
                             <Clock className="h-3 w-3 flex-shrink-0" />
                             <span className="text-xs">{formatDate(lead.created_at)}</span>
                           </div>
                         </div>

                         {renderPropertyInfo(lead) && (
                           <div className="ml-6 md:ml-8">
                             {renderPropertyInfo(lead)}
                           </div>
                         )}

                         <div className="flex flex-col gap-2 ml-6 md:ml-8">
                           <div className="flex flex-wrap gap-2">
                             {lead.status === 'new' && (
                               <Button 
                                 size="sm" 
                                 onClick={() => updateLeadStatus(lead.id, 'contacted')}
                                 className="text-xs h-7 md:h-8"
                               >
                                 <span className="hidden sm:inline">Marcar como </span>Contatado
                               </Button>
                             )}
                             {lead.status === 'contacted' && (
                               <Button 
                                 size="sm" 
                                 variant="outline"
                                 onClick={() => updateLeadStatus(lead.id, 'qualified')}
                                 className="text-xs h-7 md:h-8"
                               >
                                 Qualificar
                               </Button>
                             )}
                             {lead.status === 'qualified' && (
                                 <Button 
                                   size="sm" 
                                   className="bg-green-500 hover:bg-green-600 text-xs h-7 md:h-8"
                                   onClick={() => updateLeadStatus(lead.id, 'converted')}
                                 >
                                   Converter
                                 </Button>
                               )}
                           </div>
                           
                           {/* Realtor Assignment */}
                           <div className="flex items-center gap-2 w-full">
                             <UserCheck className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                             <Select
                               value={lead.realtor_id || "none"}
                               onValueChange={(value) => assignRealtorToLead(lead.id, value)}
                             >
                               <SelectTrigger className="w-full sm:w-[180px] md:w-[200px] h-7 md:h-8 text-xs">
                                 <SelectValue placeholder="Atribuir corretor" />
                               </SelectTrigger>
                               <SelectContent>
                                 <SelectItem value="none">Nenhum corretor</SelectItem>
                                 {realtors.map((realtor) => (
                                   <SelectItem key={realtor.id} value={realtor.id}>
                                     {realtor.name}
                                   </SelectItem>
                                 ))}
                               </SelectContent>
                             </Select>
                           </div>
                         </div>
                       </div>
                     </CardContent>
                   </Card>
                 ))}
                </div>
            )}
          </TabsContent>

          {['new', 'contacted', 'qualified'].map((status) => (
            <TabsContent key={status} value={status} className="space-y-3 md:space-y-4">
              {getLeadsByStatus(status).map((lead) => (
                <Card key={lead.id}>
                  <CardContent className="p-3 md:p-4">
                    <div className="flex flex-col gap-2 md:gap-3">
                      <div className="flex items-start gap-2 md:gap-3">
                        <Checkbox 
                          checked={selectedLeads.includes(lead.id)}
                          onCheckedChange={(checked) => handleSelectLead(lead.id, checked as boolean)}
                          className="mt-1 flex-shrink-0"
                        />
                        
                        <div className="flex-1 space-y-2 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            {editingLead === lead.id ? (
                              <div className="flex items-center gap-2 flex-1">
                                <Input 
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="h-7 md:h-8 text-sm font-semibold"
                                  placeholder="Nome do lead"
                                />
                                <Button size="sm" variant="ghost" onClick={saveEdit} className="h-7 w-7 md:h-8 md:w-8 p-0">
                                  <Check className="h-3 w-3 md:h-4 md:w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-7 w-7 md:h-8 md:w-8 p-0">
                                  <X className="h-3 w-3 md:h-4 md:w-4" />
                                </Button>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <h3 className="text-sm md:text-base font-semibold truncate">{lead.name}</h3>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => startEdit(lead)}
                                    className="h-6 w-6 p-0 flex-shrink-0"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                </div>
                                {getStatusBadge(lead.status)}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs md:text-sm text-muted-foreground ml-6 md:ml-8">
                        <div className="flex items-center gap-1 min-w-0">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          {editingLead === lead.id ? (
                            <Input 
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                              className="h-6 text-xs"
                              placeholder="Email do lead"
                              type="email"
                            />
                          ) : (
                            <span className="truncate">{lead.email}</span>
                          )}
                        </div>
                        {lead.phone && (
                          <div className="flex items-center gap-1 min-w-0">
                            <Phone className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{lead.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 sm:col-span-2">
                          <Clock className="h-3 w-3 flex-shrink-0" />
                          <span className="text-xs">{formatDate(lead.created_at)}</span>
                        </div>
                      </div>

                      {renderPropertyInfo(lead) && (
                        <div className="ml-6 md:ml-8">
                          {renderPropertyInfo(lead)}
                        </div>
                      )}

                      <div className="flex flex-col gap-2 ml-6 md:ml-8">
                        <div className="flex flex-wrap gap-2">
                          {status === 'new' && (
                            <Button 
                              size="sm" 
                              onClick={() => updateLeadStatus(lead.id, 'contacted')}
                              className="text-xs h-7 md:h-8"
                            >
                              <span className="hidden sm:inline">Marcar como </span>Contatado
                            </Button>
                          )}
                          {status === 'contacted' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateLeadStatus(lead.id, 'qualified')}
                              className="text-xs h-7 md:h-8"
                            >
                              Qualificar
                            </Button>
                          )}
                          {status === 'qualified' && (
                              <Button 
                                size="sm" 
                                className="bg-green-500 hover:bg-green-600 text-xs h-7 md:h-8"
                                onClick={() => updateLeadStatus(lead.id, 'converted')}
                              >
                                Converter
                              </Button>
                            )}
                        </div>
                            
                        {/* Realtor Assignment */}
                        <div className="flex items-center gap-2 w-full">
                          <UserCheck className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <Select
                            value={lead.realtor_id || "none"}
                            onValueChange={(value) => assignRealtorToLead(lead.id, value)}
                          >
                            <SelectTrigger className="w-full sm:w-[180px] md:w-[200px] h-7 md:h-8 text-xs">
                              <SelectValue placeholder="Atribuir corretor" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Nenhum corretor</SelectItem>
                              {realtors.map((realtor) => (
                                <SelectItem key={realtor.id} value={realtor.id}>
                                  {realtor.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          ))}

          {/* Converted Leads Tab with Financial Management */}
          <TabsContent value="converted" className="space-y-4">
            {getLeadsByStatus('converted').length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-12">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Nenhum lead convertido ainda</h3>
                    <p className="text-muted-foreground">
                      Os leads convertidos aparecerão aqui quando você marcar leads como convertidos.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Financial Dashboard Summary for Converted Leads */}
                <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-4 md:mb-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 md:px-6 py-2 md:py-3">
                      <CardTitle className="text-xs md:text-sm font-medium">Leads Convertidos</CardTitle>
                      <CheckCircle className="h-3 md:h-4 w-3 md:w-4 text-green-500" />
                    </CardHeader>
                    <CardContent className="px-3 md:px-6 pb-2 md:pb-3">
                      <div className="text-lg md:text-xl lg:text-2xl font-bold text-green-600">
                        {getFinancialSummary().convertedCount}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 md:px-6 py-2 md:py-3">
                      <CardTitle className="text-xs md:text-sm font-medium">Volume Total</CardTitle>
                      <DollarSign className="h-3 md:h-4 w-3 md:w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent className="px-3 md:px-6 pb-2 md:pb-3">
                      <div className="text-sm md:text-lg lg:text-xl font-bold text-blue-600">
                        {formatCurrency(getFinancialSummary().totalDealValue)}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 md:px-6 py-2 md:py-3">
                      <CardTitle className="text-xs md:text-sm font-medium">Comissões</CardTitle>
                      <TrendingUp className="h-3 md:h-4 w-3 md:w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent className="px-3 md:px-6 pb-2 md:pb-3">
                      <div className="text-sm md:text-lg lg:text-xl font-bold text-purple-600">
                        {formatCurrency(getFinancialSummary().totalCommission)}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Converted Leads List with Financial Info */}
                <div className="space-y-3 md:space-y-4">
                  {getLeadsByStatus('converted').map((lead) => (
                    <Card key={lead.id}>
                      <CardContent className="p-3 md:p-4 lg:p-6">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:gap-3">
                          <div className="flex items-start gap-2 md:gap-3 flex-1">
                            <Checkbox 
                              checked={selectedLeads.includes(lead.id)}
                              onCheckedChange={(checked) => handleSelectLead(lead.id, checked as boolean)}
                              className="mt-1 flex-shrink-0"
                            />
                            
                            <div className="flex-1 space-y-2 md:space-y-3 min-w-0">
                              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                                <h3 className="text-sm md:text-base lg:text-lg font-semibold truncate">{lead.name}</h3>
                                {getStatusBadge(lead.status)}
                                {lead.deal_closed_at && (
                                  <div className="flex items-center gap-1 text-xs md:text-sm text-muted-foreground">
                                    <Calendar className="h-3 md:h-4 w-3 md:w-4 flex-shrink-0" />
                                    <span className="hidden sm:inline">Fechado em </span>
                                    <span className="truncate">{formatDate(lead.deal_closed_at)}</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs md:text-sm text-muted-foreground">
                                <div className="flex items-center gap-1 min-w-0">
                                  <Mail className="h-3 md:h-4 w-3 md:w-4 flex-shrink-0" />
                                  <span className="truncate">{lead.email}</span>
                                </div>
                                {lead.phone && (
                                  <div className="flex items-center gap-1 min-w-0">
                                    <Phone className="h-3 md:h-4 w-3 md:w-4 flex-shrink-0" />
                                    <span className="truncate">{lead.phone}</span>
                                  </div>
                                )}
                              </div>

                              {renderPropertyInfo(lead)}

                              {/* Financial Information */}
                              <div className="bg-muted/30 rounded-lg p-3 md:p-4 mt-3 md:mt-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-3 mb-3">
                                  <h4 className="font-medium text-xs md:text-sm">Informações Financeiras</h4>
                                  {!editingFinancials || editingFinancials !== lead.id ? (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => startEditFinancials(lead)}
                                      className="text-xs h-8 w-full md:w-auto"
                                    >
                                      <Edit className="h-3 md:h-4 w-3 md:w-4 mr-1" />
                                      Editar
                                    </Button>
                                  ) : (
                                    <div className="flex gap-2 w-full md:w-auto">
                                      <Button size="sm" onClick={saveFinancials} className="text-xs h-8 flex-1 md:flex-none">
                                        <Check className="h-3 md:h-4 w-3 md:w-4 mr-1" />
                                        Salvar
                                      </Button>
                                      <Button size="sm" variant="outline" onClick={cancelEditFinancials} className="text-xs h-8 flex-1 md:flex-none">
                                        <X className="h-3 md:h-4 w-3 md:w-4 mr-1" />
                                        Cancelar
                                      </Button>
                                    </div>
                                  )}
                                </div>
                                
                                {lead.realtor && (
                                  <div className="flex items-center gap-1 text-xs md:text-sm text-muted-foreground mb-3">
                                    <UserCheck className="h-3 md:h-4 w-3 md:w-4 flex-shrink-0" />
                                    <span>Corretor: {lead.realtor.name}</span>
                                  </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                  <div>
                                    <label className="text-xs md:text-sm font-medium block mb-1">
                                      Valor do Negócio
                                    </label>
                                    {editingFinancials === lead.id ? (
                                      <Input
                                        type="number"
                                        step="0.01"
                                        value={editDealValue}
                                        onChange={(e) => setEditDealValue(e.target.value)}
                                        placeholder="0,00"
                                        className="h-8 text-xs md:text-sm"
                                      />
                                    ) : (
                                      <div className="text-sm md:text-base lg:text-lg font-semibold text-blue-600">
                                        {lead.deal_value ? formatCurrency(lead.deal_value) : 'Não informado'}
                                      </div>
                                    )}
                                  </div>

                                  <div>
                                    <label className="text-xs md:text-sm font-medium block mb-1">
                                      Valor da Comissão
                                    </label>
                                    {editingFinancials === lead.id ? (
                                      <Input
                                        type="number"
                                        step="0.01"
                                        value={editCommissionValue}
                                        onChange={(e) => setEditCommissionValue(e.target.value)}
                                        placeholder="0,00"
                                        className="h-8 text-xs md:text-sm"
                                      />
                                    ) : (
                                      <div className="text-sm md:text-base lg:text-lg font-semibold text-purple-600">
                                        {lead.commission_value ? formatCurrency(lead.commission_value) : 'Não informado'}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {lead.deal_value && lead.commission_value && (
                                  <div className="mt-3 pt-3 border-t">
                                    <div className="text-xs md:text-sm text-muted-foreground">
                                      Taxa de comissão: {((lead.commission_value / lead.deal_value) * 100).toFixed(2)}%
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Você está prestes a excluir permanentemente {selectedLeads.length} lead(s). 
              Esta ação não pode ser desfeita.
            </p>
            <p className="text-sm font-medium">
              Para confirmar, digite exatamente: <span className="font-mono bg-muted px-2 py-1 rounded">Excluir lead(s)</span>
            </p>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Digite aqui para confirmar"
              className="font-mono"
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeleteDialog(false);
                setDeleteConfirmText('');
              }}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={deleteLeads}
              disabled={deleteConfirmText !== 'Excluir lead(s)'}
            >
              Excluir Permanentemente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Leads;
