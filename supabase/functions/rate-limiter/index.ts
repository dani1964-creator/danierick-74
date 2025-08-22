import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RateLimitRequest {
  identifier: string; // IP address or user ID
  action: string; // Type of action being rate limited
  max_requests?: number; // Default 10
  window_minutes?: number; // Default 1 minute
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

    const { identifier, action, max_requests = 10, window_minutes = 1 } = await req.json() as RateLimitRequest;

    // Calculate time window
    const windowStart = new Date(Date.now() - (window_minutes * 60000)).toISOString();

    // Check recent requests
    const { data: recentRequests, error: queryError } = await supabase
      .from('security_logs')
      .select('id')
      .or(`ip_address.eq.${identifier},user_id.eq.${identifier}`)
      .eq('event_type', `rate_limit_${action}`)
      .gte('created_at', windowStart);

    if (queryError) {
      console.error('Error checking rate limit:', queryError);
      return new Response(
        JSON.stringify({ error: 'Failed to check rate limit' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const requestCount = recentRequests?.length || 0;
    const isRateLimited = requestCount >= max_requests;

    // Log the rate limit check
    const { error: logError } = await supabase
      .from('security_logs')
      .insert({
        event_type: `rate_limit_${action}`,
        ip_address: identifier.includes('.') ? identifier : null,
        user_id: !identifier.includes('.') ? identifier : null,
        metadata: {
          max_requests,
          window_minutes,
          current_count: requestCount,
          rate_limited: isRateLimited
        }
      });

    if (logError) {
      console.error('Error logging rate limit check:', logError);
    }

    return new Response(
      JSON.stringify({
        allowed: !isRateLimited,
        rate_limited: isRateLimited,
        requests_count: requestCount,
        max_requests,
        window_minutes,
        reset_time: new Date(Date.now() + (window_minutes * 60000)).toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Rate limiter error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});