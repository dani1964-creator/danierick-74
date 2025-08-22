import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SecurityEvent {
  event_type: string;
  user_agent?: string;
  ip_address?: string;
  endpoint?: string;
  user_id?: string;
  metadata?: Record<string, any>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { event_type, user_agent, ip_address, endpoint, user_id, metadata } = await req.json() as SecurityEvent;

    // Get client IP from headers if not provided
    const clientIP = ip_address || 
      req.headers.get('cf-connecting-ip') || 
      req.headers.get('x-forwarded-for') || 
      req.headers.get('x-real-ip') || 
      'unknown';

    // Log security event
    const { error: logError } = await supabase
      .from('security_logs')
      .insert({
        event_type,
        user_agent: user_agent || req.headers.get('user-agent'),
        ip_address: clientIP,
        endpoint,
        user_id,
        metadata
      });

    if (logError) {
      console.error('Error logging security event:', logError);
      return new Response(
        JSON.stringify({ error: 'Failed to log security event' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check for rate limiting based on IP
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    
    const { data: recentEvents, error: queryError } = await supabase
      .from('security_logs')
      .select('id')
      .eq('ip_address', clientIP)
      .eq('event_type', event_type)
      .gte('created_at', oneMinuteAgo);

    if (queryError) {
      console.error('Error checking rate limit:', queryError);
    }

    const isRateLimited = recentEvents && recentEvents.length > 10; // Max 10 events per minute

    return new Response(
      JSON.stringify({ 
        success: true, 
        logged: !logError,
        rate_limited: isRateLimited,
        recent_events_count: recentEvents?.length || 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Security monitor error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});