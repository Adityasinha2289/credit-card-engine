import { useState } from 'react';
import { SEO } from '../../components/SEO';
import { getBreadcrumbSchema, getOrganizationSchema, getWebSiteSchema } from '../../lib/schemaBuilders';
import { ButtonLink, formatINR } from '../../site/primitives';
import { CalculatorShell } from '../../site/CalculatorShell';
import { MoneyInput } from '../../site/CardSelect';
import { SIGN_UP } from '../../site/nav';

const ROUTE = '/calculators/credit-utilization';

function band(ratio: number) {
  if (ratio <= 30) return { label: 'Healthy', colour: '#E3EED4', text: 'Credit bureaus (CIBIL, Experian) favour utilisation below 30%. You are inside that range.' };
  if (ratio <= 50) return { label: 'Moderate', colour: '#F4D9A6', text: 'Between 30% and 50%. Paying part of the balance before your statement is generated brings the reported figure down.' };
  return { label: 'High', colour: '#F2B8A0', text: `At ${ratio}%, utilisation above 50% can pull your credit score down. Paying before the statement date helps most.` };
}

export function CreditUtilizationPage() {
  const [limit, setLimit] = useState(300000);
  const [balance, setBalance] = useState(45000);

  const ratio = limit > 0 ? Math.round((balance / limit) * 100) : 0;
  const status = band(ratio);
  const toThirty = Math.max(0, balance - Math.floor(limit * 0.3));
  const r = 54;
  const circ = 2 * Math.PI * r;

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Credit Utilization Calculator', item: ROUTE },
  ]);

  return (
    <>
      <SEO
        title="Credit Utilization Ratio Calculator | CIBIL Impact | RenoCred"
        description="Calculate your credit card utilization ratio and understand its impact on your CIBIL score, with the payment that brings you under 30%."
        canonicalUrl={`https://renocred.com${ROUTE}`}
        schemaData={[getOrganizationSchema(), getWebSiteSchema(), breadcrumbSchema]}
      />
      <CalculatorShell
        current={ROUTE}
        title={<>Credit <span className="italic text-rc-forest">utilisation</span></>}
        lede="How much of your credit limit you are using, what bureaus read into it, and the payment that brings you back under 30%."
        note="Utilisation is one of the larger factors in Indian credit scores, but bureaus weigh it alongside repayment history and credit age. This is an educational estimate, not a score prediction."
        inputs={
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-rc-muted">Across all your cards</p>
            <MoneyInput id="limit" label="Total credit limit" value={limit} onChange={setLimit} />
            <MoneyInput id="balance" label="Current outstanding balance" value={balance} onChange={setBalance} />
            <input
              type="range"
              aria-label="Outstanding balance"
              min={0}
              max={Math.max(limit, 1)}
              step={1000}
              value={Math.min(balance, limit)}
              onChange={(e) => setBalance(Number(e.target.value))}
              className="rc-range mt-10 w-full"
            />
            <div className="mt-3 flex justify-between text-[12px] text-rc-muted"><span>₹0</span><span>{formatINR(limit)}</span></div>
          </div>
        }
        result={
          <div className="overflow-hidden rounded-[28px] bg-rc-ink text-rc-cream">
            <div className="flex flex-col items-center p-7 text-center sm:p-9">
              <div className="relative h-44 w-44">
                <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90" aria-hidden>
                  <circle cx="70" cy="70" r={r} stroke="white" strokeOpacity="0.1" strokeWidth="12" fill="none" />
                  <circle cx="70" cy="70" r={r} stroke={status.colour} strokeWidth="12" fill="none" strokeLinecap="round"
                    strokeDasharray={circ} strokeDashoffset={circ * (1 - Math.min(ratio, 100) / 100)} className="transition-[stroke-dashoffset] duration-700" />
                  <circle cx="70" cy="70" r={r} stroke="white" strokeOpacity="0.35" strokeWidth="2" fill="none"
                    strokeDasharray={`2 ${circ - 2}`} strokeDashoffset={-circ * 0.3} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-serif text-[48px] leading-none tabular-nums">{ratio}%</span>
                  <span className="mt-1 text-[11px] uppercase tracking-[0.16em] text-rc-mist">used</span>
                </div>
              </div>
              <p className="mt-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.16em] text-rc-ink" style={{ background: status.colour }}>{status.label}</p>
              <p className="mt-4 max-w-[34ch] text-[15px] leading-relaxed text-rc-mist">{status.text}</p>
            </div>
            {toThirty > 0 && (
              <div className="border-t border-white/10 p-7 sm:p-9">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rc-mist">To get under 30%</p>
                <p className="mt-2 font-serif text-[30px] leading-none tabular-nums">Pay {formatINR(toThirty)}</p>
                <p className="mt-2 text-[13px] text-rc-mist">before your statements are generated.</p>
              </div>
            )}
            <div className="border-t border-white/10 p-7 sm:p-9">
              <ButtonLink to={SIGN_UP} variant="cream" className="w-full">Track your cards in RenoCred</ButtonLink>
            </div>
          </div>
        }
      />
    </>
  );
}
