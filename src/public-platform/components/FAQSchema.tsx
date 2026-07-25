import { StructuredData } from './StructuredData';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  items: FAQItem[];
}

/**
 * Renders FAQPage JSON-LD structured data.
 * Google uses this for rich results (expandable FAQ snippets in search).
 * No useEffect — renders as a static script tag in the DOM.
 */
export function FAQSchema({ items }: FAQSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return <StructuredData data={schema} />;
}
