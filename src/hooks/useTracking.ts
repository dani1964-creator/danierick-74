import { useEffect } from 'react';

// Declare global tracking functions
declare global {
  interface Window {
    fbq?: (action: string, event: string, data?: any) => void;
    gtag?: (command: string, ...args: any[]) => void;
    ttq?: {
      track: (event: string, data?: any) => void;
      page: () => void;
    };
    lintrk?: (action: string, event: string, data?: any) => void;
    pintrk?: (action: string, event: string, data?: any) => void;
    snaptr?: (action: string, event: string, data?: any) => void;
    twq?: (action: string, event: string, data?: any) => void;
  }
}

export interface TrackingEvent {
  event: string;
  data?: Record<string, any>;
}

export const useTracking = () => {
  // Track custom events across all platforms
  const trackEvent = (event: TrackingEvent) => {
    const { event: eventName, data = {} } = event;

    // Facebook Pixel
    if (window.fbq) {
      window.fbq('track', eventName, data);
    }

    // Google Analytics
    if (window.gtag) {
      window.gtag('event', eventName, data);
    }

    // TikTok Pixel
    if (window.ttq) {
      window.ttq.track(eventName, data);
    }

    // LinkedIn
    if (window.lintrk) {
      window.lintrk('track', eventName, data);
    }

    // Pinterest
    if (window.pintrk) {
      window.pintrk('track', eventName, data);
    }

    // Snapchat
    if (window.snaptr) {
      window.snaptr('track', eventName, data);
    }

    // Twitter
    if (window.twq) {
      window.twq('track', eventName, data);
    }
  };

  // Common property-related events
  const trackPropertyView = (propertyData: {
    property_id: string;
    title: string;
    price: number;
    type: string;
    city?: string;
  }) => {
    trackEvent({
      event: 'ViewContent',
      data: {
        content_type: 'property',
        content_ids: [propertyData.property_id],
        content_name: propertyData.title,
        value: propertyData.price,
        currency: 'BRL',
        property_type: propertyData.type,
        city: propertyData.city
      }
    });
  };

  const trackPropertyInterest = (propertyData: {
    property_id: string;
    title: string;
    price: number;
    contact_method: 'whatsapp' | 'email' | 'form';
  }) => {
    trackEvent({
      event: 'Lead',
      data: {
        content_type: 'property',
        content_ids: [propertyData.property_id],
        content_name: propertyData.title,
        value: propertyData.price,
        currency: 'BRL',
        contact_method: propertyData.contact_method
      }
    });
  };

  const trackSearch = (searchData: {
    search_term?: string;
    property_type?: string;
    location?: string;
    price_min?: number;
    price_max?: number;
  }) => {
    trackEvent({
      event: 'Search',
      data: {
        search_string: searchData.search_term,
        property_type: searchData.property_type,
        location: searchData.location,
        price_range: {
          min: searchData.price_min,
          max: searchData.price_max
        }
      }
    });
  };

  const trackContactForm = (formData: {
    form_name: string;
    property_id?: string;
  }) => {
    trackEvent({
      event: 'Contact',
      data: {
        form_name: formData.form_name,
        content_ids: formData.property_id ? [formData.property_id] : undefined
      }
    });
  };

  const trackWhatsAppClick = (data: {
    property_id?: string;
    source: string; // 'property_detail', 'floating_button', 'cta_button'
  }) => {
    trackEvent({
      event: 'WhatsAppContact',
      data: {
        content_ids: data.property_id ? [data.property_id] : undefined,
        source: data.source
      }
    });
  };

  const trackPageView = (pageData: {
    page_title: string;
    page_location: string;
    page_type?: string;
  }) => {
    // Facebook Pixel
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }

    // Google Analytics (handled automatically by gtag config)
    if (window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_title: pageData.page_title,
        page_location: pageData.page_location
      });
    }

    // TikTok
    if (window.ttq) {
      window.ttq.page();
    }
  };

  // UTM tracking utilities
  const getUTMParameters = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      utm_source: urlParams.get('utm_source'),
      utm_medium: urlParams.get('utm_medium'),
      utm_campaign: urlParams.get('utm_campaign'),
      utm_term: urlParams.get('utm_term'),
      utm_content: urlParams.get('utm_content')
    };
  };

  const storeUTMData = () => {
    const utmParams = getUTMParameters();
    const hasUTM = Object.values(utmParams).some(param => param !== null);
    
    if (hasUTM) {
      localStorage.setItem('utm_data', JSON.stringify({
        ...utmParams,
        timestamp: Date.now()
      }));
    }
  };

  const getStoredUTMData = () => {
    try {
      const stored = localStorage.getItem('utm_data');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  // Enhanced event tracking with UTM data
  const trackEventWithUTM = (event: TrackingEvent) => {
    const utmData = getStoredUTMData();
    const enhancedData = {
      ...event.data,
      ...(utmData && {
        utm_source: utmData.utm_source,
        utm_medium: utmData.utm_medium,
        utm_campaign: utmData.utm_campaign
      })
    };

    trackEvent({
      event: event.event,
      data: enhancedData
    });
  };

  // Store UTM data when hook is used
  useEffect(() => {
    storeUTMData();
  }, []);

  return {
    trackEvent,
    trackEventWithUTM,
    trackPropertyView,
    trackPropertyInterest,
    trackSearch,
    trackContactForm,
    trackWhatsAppClick,
    trackPageView,
    getUTMParameters,
    getStoredUTMData
  };
};

export default useTracking;