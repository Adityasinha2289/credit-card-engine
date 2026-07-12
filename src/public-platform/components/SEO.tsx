import { useEffect } from 'react';

export interface SEOProps {
  title: string;
  description: string;
  canonicalUrl: string;
  robotsDirective?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogUrl?: string;
  ogType?: string;
  twitterCardType?: string;
  twitterTitle?: string;
  twitterDescription?: string;
}

export function SEO({
  title,
  description,
  canonicalUrl,
  robotsDirective = 'index, follow',
  ogTitle,
  ogDescription,
  ogUrl,
  ogType = 'website',
  twitterCardType = 'summary_large_image',
  twitterTitle,
  twitterDescription,
}: SEOProps) {
  useEffect(() => {
    // 1. Update Title
    document.title = title;

    // Helper to safely update or create a meta tag
    const setMetaTag = (attribute: string, value: string, content: string) => {
      let element = document.querySelector(`meta[${attribute}="${value}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, value);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
      return element;
    };

    // 2. Update Standard Meta
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'robots', robotsDirective);

    // 3. Update Canonical
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonicalUrl);

    // 4. Update Open Graph
    setMetaTag('property', 'og:title', ogTitle || title);
    setMetaTag('property', 'og:description', ogDescription || description);
    setMetaTag('property', 'og:url', ogUrl || canonicalUrl);
    setMetaTag('property', 'og:type', ogType);

    // 5. Update Twitter
    setMetaTag('name', 'twitter:card', twitterCardType);
    setMetaTag('name', 'twitter:title', twitterTitle || title);
    setMetaTag('name', 'twitter:description', twitterDescription || description);

    // Cleanup logic (optional, but good practice if routes change often)
    return () => {
      // In a CSR app, we generally overwrite rather than remove to prevent flashing,
      // but it's safe since the next route will immediately overwrite them.
    };
  }, [
    title,
    description,
    canonicalUrl,
    robotsDirective,
    ogTitle,
    ogDescription,
    ogUrl,
    ogType,
    twitterCardType,
    twitterTitle,
    twitterDescription,
  ]);

  return null;
}
