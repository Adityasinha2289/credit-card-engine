import type { ReactNode } from 'react';
import { PublicHeader } from '../components/PublicHeader';
import { PublicFooter } from '../components/PublicFooter';
import { StructuredData } from '../components/StructuredData';

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Renocred",
  "url": "https://renocred.com/",
  "sameAs": [
    "https://www.instagram.com/social_renocred/",
    "https://www.linkedin.com/company/renocred"
  ]
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Renocred",
  "url": "https://renocred.com/"
};

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0f1115] text-white font-sans selection:bg-[#5da08c]/30">
      <PublicHeader />
      <main className="flex-1 flex flex-col">
        <StructuredData data={organizationSchema} />
        <StructuredData data={websiteSchema} />
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
