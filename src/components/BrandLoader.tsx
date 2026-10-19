/**
 * Shown while sign-in or your pages load: a card dipping into a card machine,
 * the same object the landing page uses to "read" cards. Pure CSS so it can
 * sit in the entry bundle and paint instantly.
 */
import { BrandMark } from '../public-platform/site/Brand';

export function BrandLoader({ label = 'Getting your cards ready' }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex min-h-[100dvh] w-full flex-col items-center justify-center bg-rc-night px-6 text-rc-cream">
      <div className="relative h-[170px] w-[180px]">
        {/* the card, behind the machine so it vanishes into the slot */}
        <div className="absolute left-1/2 top-0 z-0 h-[84px] w-[132px] -translate-x-1/2 animate-rc-dip rounded-[12px] bg-gradient-to-br from-[#375534] to-[#0F2A1D] shadow-[0_10px_24px_-10px_rgba(0,0,0,0.7)] ring-1 ring-white/15">
          <span className="absolute left-3 top-6 h-[14px] w-[19px] rounded-[3px] bg-gradient-to-br from-[#f3dc8c] to-[#c9a13b]" />
          <span className="absolute bottom-3 left-3 h-[3px] w-12 rounded-full bg-white/40" />
        </div>
        {/* the machine */}
        <div className="absolute inset-x-0 bottom-0 z-10 h-[118px] rounded-[26px] bg-gradient-to-b from-[#1d2e24] to-[#0b1610] p-3 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)] ring-1 ring-white/10">
          <span className="absolute left-1/2 top-0 h-2.5 w-[148px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black" />
          <div className="flex h-[54px] items-center justify-center rounded-[14px] bg-rc-pistachio">
            <BrandMark size={22} />
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/3 animate-rc-progress rounded-full bg-rc-pistachio" />
          </div>
        </div>
      </div>
      <p className="mt-8 text-[15px] text-rc-mist">{label}…</p>
    </div>
  );
}
