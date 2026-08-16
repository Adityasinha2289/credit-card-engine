import { SEO } from '../components/SEO';

export function ContactPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-20">
      <SEO 
        title="Contact Us | Renocred"
        description="Get in touch with the Renocred team."
        canonicalUrl="https://www.renocred.com/contact"
      />
      <h1 className="text-4xl font-display font-bold mb-8 tracking-tight">Contact Us</h1>
      <div className="prose prose-invert max-w-none text-gray-300 space-y-6 text-lg leading-relaxed">
        <p>Renocred is currently in active development.</p>
        <p>Formal contact channels and support infrastructure are being established. At this time, we do not have a monitored public support email or a functioning contact form.</p>
        <p>While we do not offer customer support through direct messages, you can follow our progress and connect with us on our official social media channels:</p>
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <a href="https://www.instagram.com/social_renocred/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors underline underline-offset-4 decoration-white/20 hover:decoration-white">
            Instagram
          </a>
          <a href="https://www.linkedin.com/company/renocred" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors underline underline-offset-4 decoration-white/20 hover:decoration-white">
            LinkedIn
          </a>
        </div>
        <p className="mt-8">Please check back soon as we continue to roll out the public platform.</p>
      </div>
    </div>
  );
}
