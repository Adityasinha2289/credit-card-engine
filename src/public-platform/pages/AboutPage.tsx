import { SEO } from '../components/SEO';
import { ContentMeta } from '../components/ContentMeta';

export function AboutPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <SEO 
        title="About Renocred | Optimizing Your Credit Card Strategy"
        description="Learn about Renocred's mission to bring clarity and transparency to the Indian credit card ecosystem."
        canonicalUrl="https://renocred.com/about"
      />
      <h1 className="text-4xl font-display font-bold mb-4 tracking-tight">About Renocred</h1>
      <ContentMeta author="RenoCred Team" role="Credit Intelligence" date="2026-07-25" />
      <div className="prose prose-invert max-w-none text-gray-300 space-y-6 text-lg leading-relaxed mt-8">
        <p>Renocred was built to solve a simple problem: understanding and maximizing credit card rewards is entirely too complicated.</p>
        <p>The modern credit card ecosystem is filled with hidden benefits, complex reward structures, shifting eligibility rules, and opaque terms. For the average consumer, making a confident decision about which card to use—or which card to apply for next—requires building a spreadsheet.</p>
        <p>Our philosophy is clarity and transparency. We aim to structure credit card information logically and provide tools that help you understand your spending habits. By evaluating how different cards align with your personal expenses, you can optimize your wallet without the guesswork.</p>
        <p>We are building Renocred to be the ultimate credit card command center—a place where you can manage your existing cards, optimize your everyday spending, and make confident, data-driven financial decisions.</p>
      </div>
    </div>
  );
}
