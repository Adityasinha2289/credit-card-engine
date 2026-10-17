/**
 * RenoCred Structured Data Schema Builders (AEO & GEO Primitives)
 * Generates JSON-LD schema compliant with Schema.org for Search & Answer Engines (Google AI, Perplexity, Claude, ChatGPT, Bing Copilot).
 */

export const DOMAIN = 'https://renocred.com';

/** Organization Schema */
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${DOMAIN}/#organization`,
    name: 'RenoCred',
    url: DOMAIN,
    logo: {
      '@type': 'ImageObject',
      url: `${DOMAIN}/icons/icon-512.png`,
      width: 512,
      height: 512,
    },
    sameAs: [
      'https://twitter.com/renocred',
      'https://www.linkedin.com/company/renocred',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@renocred.com',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi'],
    },
  };
}

/** WebSite Schema with SearchAction */
export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${DOMAIN}/#website`,
    url: DOMAIN,
    name: 'RenoCred',
    description: 'Credit card intelligence for India: the right card for every spend.',
    publisher: {
      '@id': `${DOMAIN}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${DOMAIN}/marketplace?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/** BreadcrumbList Schema */
export function getBreadcrumbSchema(items: { name: string; item: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.item.startsWith('http') ? crumb.item : `${DOMAIN}${crumb.item}`,
    })),
  };
}

/** FinancialProduct Schema (Credit Card Entity) */
export interface CardSchemaInput {
  name: string;
  issuer: string;
  annualFee: number | null;
  joiningFee: number | null;
  rewardRate: string;
  network: string;
  perksSummary: string;
}

export function getCreditCardProductSchema(card: CardSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: card.name,
    provider: {
      '@type': 'BankOrCreditUnion',
      name: card.issuer,
    },
    category: 'CreditCard',
    // only state fees we actually know; no interest rate (issuers set it per customer)
    feesAndCommissionsSpecification: [
      card.annualFee != null ? `Annual Fee: ₹${card.annualFee}` : null,
      card.joiningFee != null ? `Joining Fee: ₹${card.joiningFee}` : null,
    ].filter(Boolean).join(', ') || undefined,
    description: `${card.name} by ${card.issuer}. ${card.perksSummary}. Network: ${card.network}. Rewards Rate: ${card.rewardRate}.`,
    amount: {
      '@type': 'MonetaryAmount',
      currency: 'INR',
    },
  };
}

/** FAQPage Schema */
export interface FAQItem {
  question: string;
  answer: string;
}

export function getFAQPageSchema(faqs: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
