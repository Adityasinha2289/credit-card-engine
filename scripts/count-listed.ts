/**
 * Adds `listed` (distinct cards on the site: the full catalogue merged with the
 * cards we hold reward rates for, duplicates removed) to catalogueStats.json, so
 * every page quotes the same number. Run by `npm run site:stats`.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { APPROVED_COMPARISON_PAIRS, getAllPublicCards, getComparisonPairSlug, getDirectoryCards } from '../src/public-platform/lib/cardKnowledgeGraph';

const path = new URL('../src/public-platform/site/catalogueStats.json', import.meta.url);
const stats = JSON.parse(readFileSync(path, 'utf8'));
stats.listed = getDirectoryCards().length;
stats.withRates = getDirectoryCards().filter((c) => c.hasRates !== false).length;
writeFileSync(path, `${JSON.stringify(stats, null, 2)}\n`);
console.log('listed', stats.listed, 'with rates', stats.withRates);

// Every card page in the sitemap (the section between its two comments).
const sitemapPath = new URL('../public/sitemap.xml', import.meta.url);
const sitemap = readFileSync(sitemapPath, 'utf8');
const start = sitemap.indexOf('  <!-- Credit Card Entity Pages -->');
const end = sitemap.indexOf('  <!-- Platform Informational Pages -->');
if (start > -1 && end > start) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = getDirectoryCards().map((c) => [
    '  <url>',
    `    <loc>https://renocred.com/cards/${c.slug}</loc>`,
    `    <lastmod>${today}</lastmod>`,
    '    <changefreq>weekly</changefreq>',
    `    <priority>${c.hasRates === false ? '0.6' : '0.8'}</priority>`,
    '  </url>',
  ].join('\n'));
  writeFileSync(sitemapPath, `${sitemap.slice(0, start)}  <!-- Credit Card Entity Pages -->\n${urls.join('\n')}\n\n${sitemap.slice(end)}`);
  console.log('sitemap card pages', urls.length);
}

// Comparison pages in the sitemap, from the pairs the site actually serves.
{
  const xml = readFileSync(sitemapPath, 'utf8');
  const from = xml.indexOf('  <!-- High-Value Head-to-Head Comparison Engine Pages -->');
  const to = xml.indexOf('  <!-- Public Utility Calculators -->');
  if (from > -1 && to > from) {
    const all = getAllPublicCards();
    const today = new Date().toISOString().slice(0, 10);
    const pairs = APPROVED_COMPARISON_PAIRS.map((p) => {
      const a = all.find((c) => c.id === p.cardAId);
      const b = all.find((c) => c.id === p.cardBId);
      return a && b ? getComparisonPairSlug(a, b) : null;
    }).filter(Boolean);
    const urls = pairs.map((slug) => ['  <url>', `    <loc>https://renocred.com/compare/${slug}</loc>`, `    <lastmod>${today}</lastmod>`, '    <changefreq>weekly</changefreq>', '    <priority>0.8</priority>', '  </url>'].join('\n'));
    writeFileSync(sitemapPath, `${xml.slice(0, from)}  <!-- High-Value Head-to-Head Comparison Engine Pages -->\n${urls.join('\n')}\n\n${xml.slice(to)}`);
    console.log('sitemap comparison pages', urls.length);
  }
}
