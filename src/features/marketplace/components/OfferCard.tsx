import type { MarketplaceOffer } from '../types';
import { ArrowUpRight } from 'lucide-react';

/** One partner offer (or brand, when we list the partner without a specific deal). */
export function OfferCard({ offer }: { offer: MarketplaceOffer; isFeatured?: boolean }) {
  const deal = offer.discountType === 'percentage' ? `${offer.discountValue}% off`
    : offer.discountType === 'flat' ? `₹${offer.discountValue} off`
      : offer.discountType === 'points_multiplier' ? `${offer.discountValue}x points` : null;

  const body = (
    <>
      <div className="flex items-start gap-3.5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-rc-ink/[0.08] bg-white">
          {offer.partnerLogo
            ? <img src={offer.partnerLogo} alt="" className="h-full w-full object-contain p-1.5" />
            : <span className="font-serif text-[20px] font-semibold text-rc-ink">{offer.partnerName.charAt(0)}</span>}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold text-rc-ink">{offer.partnerName}</p>
          {deal
            ? <p className="mt-1 inline-flex rounded-full bg-rc-pistachio px-2.5 py-0.5 text-[12px] font-semibold text-rc-forest">{deal}</p>
            : <p className="mt-0.5 text-[13px] text-rc-muted">Partner brand</p>}
        </div>
        {offer.affiliateUrl && <ArrowUpRight size={17} className="shrink-0 text-rc-forest" />}
      </div>
      {(offer.title || offer.description) && (
        <p className="mt-3 line-clamp-3 text-[14px] leading-relaxed text-rc-ink/75">{offer.title ? `${offer.title}. ` : ''}{offer.description}</p>
      )}
      {offer.minimumSpend ? <p className="mt-3 text-[12px] text-rc-muted">Minimum spend ₹{offer.minimumSpend.toLocaleString('en-IN')}</p> : null}
    </>
  );

  const cls = 'block h-full rounded-[22px] border border-rc-ink/[0.08] bg-rc-paper p-4 transition-colors hover:bg-white';
  return offer.affiliateUrl
    ? <a href={offer.affiliateUrl} target="_blank" rel="noopener noreferrer sponsored" className={cls}>{body}</a>
    : <div className={cls}>{body}</div>;
}
