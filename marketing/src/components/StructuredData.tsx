export function StructuredData({ data }: { data: Record<string, any> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function FinancialProductSchema({ card }: { card: any }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: card.name,
    description: `${card.name} by ${card.bank}. Annual fee ₹${card.annualFee}. Base reward rate ${card.baseRewardRate}%. ${card.highlights.join('. ')}`,
    url: `https://renocred.com/cards/${card.slug}`,
    category: 'Credit Card',
    provider: {
      '@type': 'Organization',
      name: card.bank,
    },
    feesAndCommissionsSpecification: card.annualFee === 0 
      ? 'Lifetime Free Credit Card. ₹0 Annual Fee.' 
      : `Annual fee ₹${card.annualFee}.${card.feeWaiverSpend ? ` Waived on annual spend of ₹${card.feeWaiverSpend.toLocaleString('en-IN')}.` : ''}`,
    offers: {
      '@type': 'Offer',
      price: card.annualFee.toString(),
      priceCurrency: 'INR',
      description: card.welcomeBonus || 'Standard Card Issuance',
    },
  };

  return <StructuredData data={schema} />;
}

export function FAQSchema({ items }: { items: { question: string; answer: string }[] }) {
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
