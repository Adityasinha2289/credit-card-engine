import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { SEO } from '../components/SEO';
import { ContentPage } from '../site/ContentPage';
import { SOCIAL } from '../site/nav';

export function ContactPage() {
  const [params] = useSearchParams();
  const partner = params.get('intent') === 'partner';
  // LinkedIn first for partnership enquiries
  const channels = partner ? [...SOCIAL].sort((a, b) => Number(b.label === 'LinkedIn') - Number(a.label === 'LinkedIn')) : SOCIAL;

  return (
    <>
      <SEO
        title="Contact Us | RenoCred"
        description="Get in touch with the RenoCred team."
        canonicalUrl="https://www.renocred.com/contact"
      />
      <ContentPage
        eyebrow={partner ? 'Partnerships' : 'Contact'}
        title={partner ? 'Partner with RenoCred' : 'Where to find us'}
        lede={partner
          ? 'Our partnership desk is being set up. The quickest way to start a conversation today is a message to our LinkedIn page.'
          : 'RenoCred is in active development. Formal support channels are being set up; until then, the best way to reach the team is on social media.'}
      >
        {partner
          ? <p>Tell us about your brand, the customers you want to reach and the offer you have in mind.</p>
          : <p>We do not have a monitored support inbox or contact form yet, and we do not provide support through direct messages. Follow along for updates as we roll out the public platform:</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          {channels.map((s) => (
            <a
              key={s.href}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between rounded-2xl border border-rc-ink/10 bg-rc-paper px-6 py-5 !no-underline transition-colors hover:border-rc-ink/40"
            >
              <span className="font-serif text-[24px] text-rc-ink">{s.label}</span>
              <ArrowUpRight className="h-5 w-5 text-rc-ink transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          ))}
        </div>
        {partner
          ? <p>Read how partnerships work on <Link to="/business">RenoCred for business</Link>.</p>
          : <p>For business partnerships, see <Link to="/business">RenoCred for business</Link>.</p>}
      </ContentPage>
    </>
  );
}
