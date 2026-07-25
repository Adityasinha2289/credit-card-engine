import { MetadataRoute } from 'next';
import { ALL_CARDS, ALL_BANKS } from '../lib/cards';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://renocred.com';
  const currentDate = new Date().toISOString().split('T')[0];

  // Static marketing pages
  const staticPages = [
    '',
    '/about',
    '/methodology',
    '/contact',
    '/editorial-policy',
    '/affiliate-disclosure',
    '/privacy',
    '/terms',
    '/disclaimer',
    '/cards',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Dynamic Card pages (/cards/[slug])
  const cardPages = ALL_CARDS.map((card) => ({
    url: `${baseUrl}/cards/${card.slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // Dynamic Bank pages (/banks/[slug])
  const bankPages = ALL_BANKS.map((bank) => ({
    url: `${baseUrl}/banks/${bank.id}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Category pages (/best/[category])
  const categoryPages = [
    'travel-cards',
    'cashback-cards',
    'fuel-cards',
    'shopping-cards',
    'dining-cards',
    'lounge-access-cards',
    'lifetime-free-cards',
    'student-cards',
  ].map((category) => ({
    url: `${baseUrl}/best/${category}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  return [...staticPages, ...cardPages, ...bankPages, ...categoryPages];
}
