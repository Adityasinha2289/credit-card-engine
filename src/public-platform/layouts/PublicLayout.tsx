import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { PublicHeader } from '../components/PublicHeader';
import { PublicFooter } from '../components/PublicFooter';
import { StructuredData } from '../components/StructuredData';

// ─────────────────────────────────────────────────────────────────────────────
//  ORGANIZATION SCHEMA — Enhanced for E-E-A-T
// ─────────────────────────────────────────────────────────────────────────────

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  'name': 'RenoCred',
  'url': 'https://renocred.com/',
  'logo': 'https://renocred.com/icons/icon-512.png',
  'description': 'India\'s #1 AI-powered credit card intelligence platform. Compare 130+ cards, maximize cashback & rewards, and get personalized recommendations.',
  'foundingDate': '2025',
  'sameAs': [
    'https://www.instagram.com/social_renocred/',
    'https://www.linkedin.com/company/renocred',
  ],
  'contactPoint': {
    '@type': 'ContactPoint',
    'contactType': 'Customer Support',
    'url': 'https://renocred.com/contact',
    'availableLanguage': ['English', 'Hindi'],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  WEBSITE SCHEMA — with SearchAction for sitelinks search box
// ─────────────────────────────────────────────────────────────────────────────

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  'name': 'RenoCred',
  'url': 'https://renocred.com/',
  'potentialAction': {
    '@type': 'SearchAction',
    'target': {
      '@type': 'EntryPoint',
      'urlTemplate': 'https://renocred.com/cards?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  BREADCRUMB MAPPING
// ─────────────────────────────────────────────────────────────────────────────

const BREADCRUMB_LABELS: Record<string, string> = {
  '/': 'Home',
  '/about': 'About',
  '/methodology': 'Methodology',
  '/contact': 'Contact',
  '/editorial-policy': 'Editorial Policy',
  '/affiliate-disclosure': 'Affiliate Disclosure',
  '/privacy': 'Privacy Policy',
  '/terms': 'Terms of Service',
  '/disclaimer': 'Disclaimer',
};

function generateBreadcrumbSchema(pathname: string) {
  if (pathname === '/') return null; // No breadcrumbs on homepage

  const items = [
    {
      '@type': 'ListItem',
      'position': 1,
      'name': 'Home',
      'item': 'https://renocred.com/',
    },
  ];

  const label = BREADCRUMB_LABELS[pathname];
  if (label) {
    items.push({
      '@type': 'ListItem',
      'position': 2,
      'name': label,
      'item': `https://renocred.com${pathname}`,
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  LAYOUT
// ─────────────────────────────────────────────────────────────────────────────

export function PublicLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const breadcrumbSchema = generateBreadcrumbSchema(pathname);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#0f1115] text-white font-sans selection:bg-[#5da08c]/30">
      <PublicHeader />
      <main className="flex-1 flex flex-col">
        <StructuredData data={organizationSchema} />
        <StructuredData data={websiteSchema} />
        {breadcrumbSchema && <StructuredData data={breadcrumbSchema} />}
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
