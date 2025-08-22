import { useEffect } from 'react';
import { SecurityMonitor } from '@/lib/security-monitor';

interface SecurityHeaderProps {
  children: React.ReactNode;
}

export const SecurityHeader = ({ children }: SecurityHeaderProps) => {
  useEffect(() => {
    // Log page access for security monitoring
    SecurityMonitor.logEvent({
      event_type: 'page_access',
      endpoint: window.location.pathname,
      metadata: {
        referrer: document.referrer,
        timestamp: new Date().toISOString()
      }
    });

    // Add security headers via meta tags for enhanced protection
    const securityHeaders = [
      { name: 'X-Content-Type-Options', content: 'nosniff' },
      { name: 'X-Frame-Options', content: 'DENY' },
      { name: 'X-XSS-Protection', content: '1; mode=block' },
      { name: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' }
    ];

    securityHeaders.forEach(header => {
      let metaTag = document.querySelector(`meta[name="${header.name}"]`);
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('name', header.name);
        metaTag.setAttribute('content', header.content);
        document.head.appendChild(metaTag);
      }
    });

    // Monitor for suspicious activity patterns
    const monitorActivity = () => {
      // Detect rapid page navigation (potential bot behavior)
      const navigationTimes = JSON.parse(
        sessionStorage.getItem('navigationTimes') || '[]'
      );
      const now = Date.now();
      navigationTimes.push(now);

      // Keep only last 10 navigations
      const recentTimes = navigationTimes.slice(-10);
      sessionStorage.setItem('navigationTimes', JSON.stringify(recentTimes));

      // If more than 8 navigations in 30 seconds, log suspicious activity
      const thirtySecondsAgo = now - 30000;
      const rapidNavigations = recentTimes.filter((time: number) => time > thirtySecondsAgo);
      
      if (rapidNavigations.length > 8) {
        SecurityMonitor.logSuspiciousActivity('rapid_navigation', {
          navigations_count: rapidNavigations.length,
          time_window: '30_seconds',
          page: window.location.pathname
        });
      }
    };

    monitorActivity();

    // Monitor for tab visibility changes (potential bot detection)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        SecurityMonitor.logEvent({
          event_type: 'tab_hidden',
          metadata: { page: window.location.pathname }
        });
      } else {
        SecurityMonitor.logEvent({
          event_type: 'tab_visible',
          metadata: { page: window.location.pathname }
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return <>{children}</>;
};
