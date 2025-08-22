import { supabase } from "@/integrations/supabase/client";
import { SecurityMonitor } from "./security-monitor";

interface ContactAccessResult {
  whatsapp_number: string | null;
  contact_email: string | null;
  creci: string | null;
  access_allowed: boolean;
}

interface PublicProperty {
  id: string;
  title: string;
  description: string;
  property_type: string;
  transaction_type: string;
  address: string;
  neighborhood: string;
  city: string;
  uf: string;
  main_image_url: string;
  images: string[];
  features: string[];
  price: number;
  bedrooms: number;
  bathrooms: number;
  parking_spaces: number;
  area_m2: number;
  views_count: number;
  is_featured: boolean;
  status: string;
  slug: string;
  property_code: string;
  created_at: string;
  updated_at: string;
  broker_business_name: string;
  broker_website_slug: string;
  broker_display_name: string;
}

export class EnhancedSecurity {
  
  /**
   * Securely get broker contact information with enhanced authentication and logging
   * This function now uses the new secure database function that properly controls access
   */
  static async getBrokerContactInfo(brokerSlug: string): Promise<ContactAccessResult | null> {
    try {
      // Get current user for authentication check
      const { data: { user } } = await supabase.auth.getUser();
      const userAgent = navigator.userAgent;
      
      // Use the new secure function that properly validates access
      const { data, error } = await supabase.rpc('get_broker_contact_secure', {
        broker_website_slug: brokerSlug,
        requesting_user_id: user?.id || null
      });

      if (error) {
        console.error('Error fetching broker contact:', error);
        SecurityMonitor.logSuspiciousActivity('contact_fetch_error', {
          broker_slug: brokerSlug,
          error: error.message,
          user_id: user?.id || 'anonymous'
        });
        return null;
      }

      if (data && data.length > 0) {
        const result = data[0];
        
        if (!result.access_granted) {
          SecurityMonitor.logSuspiciousActivity('contact_access_denied', {
            broker_slug: brokerSlug,
            user_agent: userAgent,
            reason: result.access_reason || 'unknown'
          });
          return null;
        }

        // Log successful contact access with the access reason
        SecurityMonitor.logEvent({
          event_type: 'contact_info_accessed',
          metadata: { 
            broker_slug: brokerSlug,
            access_reason: result.access_reason,
            success: true,
            user_id: user?.id || 'anonymous'
          }
        });

        return {
          whatsapp_number: result.whatsapp_number,
          contact_email: result.contact_email,
          creci: result.creci,
          access_allowed: result.access_granted
        };
      }

      return null;
    } catch (error) {
      console.error('Security error accessing broker contact:', error);
      SecurityMonitor.logSuspiciousActivity('contact_access_exception', {
        broker_slug: brokerSlug,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  /**
   * Get public broker branding information (safe, non-sensitive data only)
   */
  static async getPublicBrokerBranding(brokerSlug: string) {
    try {
      const { data, error } = await supabase.rpc('get_public_broker_branding_secure', {
        broker_website_slug: brokerSlug
      });

      if (error) {
        console.error('Error fetching broker branding:', error);
        return null;
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error accessing broker branding:', error);
      return null;
    }
  }

  /**
   * Get public properties using secure function (no sensitive broker data exposed)
   */
  static async getPublicProperties(limit: number = 50, offset: number = 0): Promise<PublicProperty[]> {
    try {
      const { data, error } = await supabase.rpc('get_public_properties', {
        property_limit: limit,
        property_offset: offset
      });

      if (error) {
        console.error('Error fetching public properties:', error);
        SecurityMonitor.logSuspiciousActivity('property_fetch_error', {
          error: error.message,
          limit,
          offset
        });
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Security error accessing properties:', error);
      SecurityMonitor.logSuspiciousActivity('property_access_exception', {
        error: error instanceof Error ? error.message : 'Unknown error',
        limit,
        offset
      });
      return [];
    }
  }

  /**
   * Enhanced property search with security logging
   */
  static async searchProperties(
    searchTerm: string,
    filters: {
      property_type?: string;
      transaction_type?: string;
      min_price?: number;
      max_price?: number;
      bedrooms?: number;
    } = {},
    limit: number = 20
  ): Promise<PublicProperty[]> {
    try {
      // Log search activity for monitoring
      SecurityMonitor.logEvent({
        event_type: 'property_search',
        metadata: {
          search_term: searchTerm.substring(0, 50), // Truncate for privacy
          filters: filters,
          results_limit: limit
        }
      });

      // Get all properties first, then filter (since we can't modify the RPC easily)
      const allProperties = await this.getPublicProperties(200, 0);
      
      let filteredProperties = allProperties;

      // Apply search filter
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase().trim();
        filteredProperties = filteredProperties.filter(property =>
          property.title.toLowerCase().includes(searchLower) ||
          property.description?.toLowerCase().includes(searchLower) ||
          property.address.toLowerCase().includes(searchLower) ||
          property.neighborhood?.toLowerCase().includes(searchLower) ||
          property.city?.toLowerCase().includes(searchLower)
        );
      }

      // Apply filters
      if (filters.property_type) {
        filteredProperties = filteredProperties.filter(p => p.property_type === filters.property_type);
      }
      
      if (filters.transaction_type) {
        filteredProperties = filteredProperties.filter(p => p.transaction_type === filters.transaction_type);
      }
      
      if (filters.min_price) {
        filteredProperties = filteredProperties.filter(p => p.price >= filters.min_price!);
      }
      
      if (filters.max_price) {
        filteredProperties = filteredProperties.filter(p => p.price <= filters.max_price!);
      }
      
      if (filters.bedrooms) {
        filteredProperties = filteredProperties.filter(p => p.bedrooms >= filters.bedrooms!);
      }

      return filteredProperties.slice(0, limit);
    } catch (error) {
      console.error('Security error in property search:', error);
      SecurityMonitor.logSuspiciousActivity('property_search_exception', {
        search_term: searchTerm.substring(0, 20),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return [];
    }
  }

  /**
   * Check if user has exceeded rate limits for sensitive operations
   */
  static async checkOperationRateLimit(operation: string): Promise<boolean> {
    try {
      const result = await SecurityMonitor.checkRateLimit({
        action: operation,
        max_requests: 10,
        window_minutes: 5
      });

      if (result.rate_limited) {
        SecurityMonitor.logSuspiciousActivity('operation_rate_limited', {
          operation,
          timestamp: new Date().toISOString()
        });
      }

      return result.allowed;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      // On error, allow the operation but log it
      SecurityMonitor.logSuspiciousActivity('rate_limit_check_failed', {
        operation,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return true;
    }
  }

  /**
   * Enhanced form submission with security validation
   */
  static async secureFormSubmit<T>(
    formType: string,
    formData: Record<string, any>,
    submitFunction: () => Promise<T>
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      // Check rate limits first
      const rateLimitOk = await this.checkOperationRateLimit(`form_${formType}`);
      if (!rateLimitOk) {
        return {
          success: false,
          error: 'Too many requests. Please try again later.'
        };
      }

      // Log form attempt
      SecurityMonitor.logEvent({
        event_type: 'form_submission_attempt',
        metadata: {
          form_type: formType,
          timestamp: new Date().toISOString()
        }
      });

      // Execute the form submission
      const result = await submitFunction();

      // Log success
      SecurityMonitor.logFormSubmission(formType, true);

      return {
        success: true,
        data: result
      };

    } catch (error) {
      console.error(`Secure form submission failed for ${formType}:`, error);
      
      // Log failure
      SecurityMonitor.logFormSubmission(formType, false);
      SecurityMonitor.logSuspiciousActivity('form_submission_error', {
        form_type: formType,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Form submission failed'
      };
    }
  }
}