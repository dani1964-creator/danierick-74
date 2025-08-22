import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

interface TrackingScripts {
  google_analytics?: string;
  facebook_pixel?: string;
  tiktok_pixel?: string;
  linkedin_insight?: string;
  google_ads?: string;
  pinterest_tag?: string;
  snapchat_pixel?: string;
  twitter_pixel?: string;
  header_scripts?: string;
  body_scripts?: string;
  footer_scripts?: string;
  custom_scripts?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

interface TrackingScriptsProps {
  trackingScripts?: TrackingScripts | null;
}

const TrackingScripts = ({ trackingScripts }: TrackingScriptsProps) => {
  // Set up UTM parameters on page load
  useEffect(() => {
    if (trackingScripts?.utm_source || trackingScripts?.utm_medium || trackingScripts?.utm_campaign) {
      const urlParams = new URLSearchParams(window.location.search);
      
      // Add UTM parameters if they don't exist
      if (trackingScripts.utm_source && !urlParams.has('utm_source')) {
        urlParams.set('utm_source', trackingScripts.utm_source);
      }
      if (trackingScripts.utm_medium && !urlParams.has('utm_medium')) {
        urlParams.set('utm_medium', trackingScripts.utm_medium);
      }
      if (trackingScripts.utm_campaign && !urlParams.has('utm_campaign')) {
        urlParams.set('utm_campaign', trackingScripts.utm_campaign);
      }
      
      // Store UTM parameters in localStorage for later use
      localStorage.setItem('utm_data', JSON.stringify({
        source: urlParams.get('utm_source') || trackingScripts.utm_source,
        medium: urlParams.get('utm_medium') || trackingScripts.utm_medium,
        campaign: urlParams.get('utm_campaign') || trackingScripts.utm_campaign,
        timestamp: Date.now()
      }));
    }
  }, [trackingScripts]);

  // Initialize tracking scripts after component mount
  useEffect(() => {
    if (!trackingScripts) return;

    // Facebook Pixel
    if (trackingScripts.facebook_pixel) {
      if (!window.fbq) {
        const script = document.createElement('script');
        script.innerHTML = `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${trackingScripts.facebook_pixel}');
          fbq('track', 'PageView');
        `;
        document.head.appendChild(script);

        // Add noscript fallback
        const noscript = document.createElement('noscript');
        noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${trackingScripts.facebook_pixel}&ev=PageView&noscript=1" />`;
        document.head.appendChild(noscript);
      }
    }

    // Google Analytics
    if (trackingScripts.google_analytics) {
      if (!window.gtag) {
        // Load gtag script
        const gtagScript = document.createElement('script');
        gtagScript.async = true;
        gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${trackingScripts.google_analytics}`;
        document.head.appendChild(gtagScript);

        // Initialize gtag
        const initScript = document.createElement('script');
        initScript.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${trackingScripts.google_analytics}');
        `;
        document.head.appendChild(initScript);
      }
    }

    // TikTok Pixel
    if (trackingScripts.tiktok_pixel) {
      if (!window.ttq) {
        const script = document.createElement('script');
        script.innerHTML = `
          !function (w, d, t) {
            w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
            ttq.load('${trackingScripts.tiktok_pixel}');
            ttq.page();
          }(window, document, 'ttq');
        `;
        document.head.appendChild(script);
      }
    }

    // Custom Scripts
    if (trackingScripts.custom_scripts) {
      const script = document.createElement('script');
      script.innerHTML = trackingScripts.custom_scripts;
      document.head.appendChild(script);
    }

    // Header Scripts
    if (trackingScripts.header_scripts) {
      const div = document.createElement('div');
      div.innerHTML = trackingScripts.header_scripts;
      
      // Move all script tags to head
      const scripts = div.querySelectorAll('script');
      scripts.forEach(script => {
        const newScript = document.createElement('script');
        if (script.src) {
          newScript.src = script.src;
          newScript.async = true;
        } else {
          newScript.innerHTML = script.innerHTML;
        }
        document.head.appendChild(newScript);
      });

      // Move all other elements to head
      const others = div.querySelectorAll(':not(script)');
      others.forEach(element => {
        document.head.appendChild(element.cloneNode(true));
      });
    }
  }, [trackingScripts]);

  return (
    <>
      {/* Body Scripts */}
      {trackingScripts?.body_scripts && (
        <div 
          dangerouslySetInnerHTML={{
            __html: trackingScripts.body_scripts
          }}
          style={{ display: 'none' }}
        />
      )}
      
      {/* Footer Scripts - rendered at the end of the component */}
      {trackingScripts?.footer_scripts && (
        <div
          dangerouslySetInnerHTML={{
            __html: trackingScripts.footer_scripts
          }}
          style={{ display: 'none' }}
        />
      )}
    </>
  );
};

export default TrackingScripts;