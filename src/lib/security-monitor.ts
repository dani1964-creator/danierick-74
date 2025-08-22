import { supabase } from "@/integrations/supabase/client";

interface SecurityEvent {
  event_type: string;
  endpoint?: string;
  metadata?: Record<string, any>;
}

interface RateLimitOptions {
  action: string;
  max_requests?: number;
  window_minutes?: number;
}

export class SecurityMonitor {
  
  static async logEvent(event: SecurityEvent): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('security-monitor', {
        body: {
          ...event,
          user_agent: navigator.userAgent,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }
      });

      if (error) {
        console.error('Failed to log security event:', error);
        return false;
      }

      return data?.success || false;
    } catch (error) {
      console.error('Security monitor error:', error);
      return false;
    }
  }

  static async checkRateLimit(options: RateLimitOptions): Promise<{ allowed: boolean; rate_limited: boolean }> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      const identifier = user?.id || 'anonymous';

      const { data, error } = await supabase.functions.invoke('rate-limiter', {
        body: {
          identifier,
          ...options
        }
      });

      if (error) {
        console.error('Rate limit check failed:', error);
        // On error, allow the request but log it
        this.logEvent({
          event_type: 'rate_limit_error',
          metadata: { error: error.message, action: options.action }
        });
        return { allowed: true, rate_limited: false };
      }

      return {
        allowed: data?.allowed || false,
        rate_limited: data?.rate_limited || false
      };
    } catch (error) {
      console.error('Rate limiter error:', error);
      return { allowed: true, rate_limited: false };
    }
  }

  // Predefined event types
  static async logAuthAttempt(success: boolean, email?: string) {
    return this.logEvent({
      event_type: success ? 'auth_success' : 'auth_failure',
      endpoint: '/auth',
      metadata: { success, email: email ? email.substring(0, 3) + '***' : undefined }
    });
  }

  static async logFormSubmission(formType: string, success: boolean) {
    return this.logEvent({
      event_type: 'form_submission',
      metadata: { form_type: formType, success }
    });
  }

  static async logSuspiciousActivity(activity: string, details?: Record<string, any>) {
    return this.logEvent({
      event_type: 'suspicious_activity',
      metadata: { activity, ...details }
    });
  }

  // Rate limiting helpers
  static async checkAuthRateLimit() {
    return this.checkRateLimit({
      action: 'auth_attempt',
      max_requests: 5,
      window_minutes: 5
    });
  }

  static async checkContactFormRateLimit() {
    return this.checkRateLimit({
      action: 'contact_form',
      max_requests: 3,
      window_minutes: 10
    });
  }
}