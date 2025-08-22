import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SecurityLog {
  id: string;
  event_type: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  metadata?: Record<string, any>;
}

interface ContactAccessLog {
  id: string;
  broker_id: string;
  user_ip: string | null;
  user_agent: string | null;
  access_type: string;
  accessed_at: string;
}

export default function SecurityDashboard() {
  const { user } = useAuth();
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [contactLogs, setContactLogs] = useState<ContactAccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    suspiciousEvents: 0,
    contactAccesses: 0,
    rateLimitedEvents: 0
  });

  useEffect(() => {
    if (user) {
      fetchSecurityData();
    }
  }, [user]);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);

      // Fetch security logs for the current user
      const { data: secLogs, error: secError } = await supabase
        .from('security_logs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (secError) throw secError;

      // Fetch contact access logs for broker's properties
      const { data: contactData, error: contactError } = await supabase
        .from('contact_access_logs')
        .select('*')
        .order('accessed_at', { ascending: false })
        .limit(50);

      if (contactError) throw contactError;

      setSecurityLogs((secLogs || []) as SecurityLog[]);
      setContactLogs((contactData || []) as ContactAccessLog[]);

      // Calculate statistics
      const suspiciousCount = secLogs?.filter(log => 
        log.event_type.includes('suspicious') || 
        log.event_type.includes('rate_limit')
      ).length || 0;

      const rateLimitedCount = secLogs?.filter(log => 
        log.event_type.includes('rate_limit')
      ).length || 0;

      setStats({
        totalEvents: secLogs?.length || 0,
        suspiciousEvents: suspiciousCount,
        contactAccesses: contactData?.length || 0,
        rateLimitedEvents: rateLimitedCount
      });

    } catch (error) {
      console.error('Error fetching security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeColor = (eventType: string) => {
    if (eventType.includes('suspicious')) return 'destructive';
    if (eventType.includes('rate_limit')) return 'secondary';
    if (eventType.includes('auth')) return 'default';
    if (eventType.includes('form')) return 'outline';
    return 'default';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Painel de Segurança</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-16 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Painel de Segurança</h2>
        <Button onClick={fetchSecurityData} variant="outline">
          Atualizar
        </Button>
      </div>

      {/* Security Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-sm text-muted-foreground">Eventos Totais</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.suspiciousEvents}</div>
            <p className="text-sm text-muted-foreground">Atividades Suspeitas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.contactAccesses}</div>
            <p className="text-sm text-muted-foreground">Acessos a Contatos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.rateLimitedEvents}</div>
            <p className="text-sm text-muted-foreground">Rate Limit Ativado</p>
          </CardContent>
        </Card>
      </div>

      {/* Security Logs Tabs */}
      <Tabs defaultValue="security" className="space-y-4">
        <TabsList>
          <TabsTrigger value="security">Logs de Segurança</TabsTrigger>
          <TabsTrigger value="contact">Acessos a Contatos</TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Eventos de Segurança</CardTitle>
              <CardDescription>
                Últimos 50 eventos de segurança registrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {securityLogs.length === 0 ? (
                <p className="text-muted-foreground">Nenhum evento registrado</p>
              ) : (
                <div className="space-y-2">
                  {securityLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant={getEventTypeColor(log.event_type)}>
                          {log.event_type}
                        </Badge>
                        <div>
                          <p className="text-sm font-medium">
                            IP: {log.ip_address || 'N/A'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatTimestamp(log.created_at)}
                          </p>
                        </div>
                      </div>
                      {log.metadata && (
                        <div className="text-xs text-muted-foreground max-w-xs truncate">
                          {JSON.stringify(log.metadata)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Acessos a Informações de Contato</CardTitle>
              <CardDescription>
                Monitoramento de solicitações de dados de contato
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contactLogs.length === 0 ? (
                <p className="text-muted-foreground">Nenhum acesso registrado</p>
              ) : (
                <div className="space-y-2">
                  {contactLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">
                          {log.access_type}
                        </Badge>
                        <div>
                          <p className="text-sm font-medium">
                            IP: {log.user_ip || 'N/A'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatTimestamp(log.accessed_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground max-w-xs truncate">
                        {log.user_agent}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Security Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recomendações de Segurança</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full" />
            <p className="text-sm">
              Configure OTP expiry para 15 minutos nas configurações do Supabase Auth
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full" />
            <p className="text-sm">
              Ative a proteção contra senhas vazadas nas configurações de autenticação
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <p className="text-sm">
              Monitoramento de segurança ativo e funcionando
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <p className="text-sm">
              Rate limiting implementado para formulários e acessos
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}