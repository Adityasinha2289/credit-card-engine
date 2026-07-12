import { SEO } from '../components/SEO';

export function ContactPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <SEO 
        title="Contact Us | Renocred"
        description="Get in touch with the Renocred team."
        canonicalUrl="https://renocred.com/contact"
      />
      <h1 className="text-4xl font-display font-bold mb-8 tracking-tight">Contact Us</h1>
      <div className="prose prose-invert max-w-none text-gray-300 space-y-6 text-lg leading-relaxed">
        <p>Renocred is currently in active development.</p>
        <p>Formal contact channels and support infrastructure are being established. At this time, we do not have a monitored public support email or a functioning contact form.</p>
        <p>Please check back soon as we continue to roll out the public platform.</p>
      </div>
    </div>
  );
}
