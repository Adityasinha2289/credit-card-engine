import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Container, Display, Eyebrow, Reveal } from '../../site/primitives';
import { CardFace } from '../../site/CardFace';
import { TOOLS } from '../../site/nav';

function RewardVisual() {
  return (
    <div className="relative h-full overflow-hidden bg-rc-pistachio p-7">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rc-forest">Net value a year</p>
      <p className="mt-2 font-serif text-[48px] leading-none text-rc-ink tabular-nums">₹17,500</p>
      <div className="absolute -bottom-10 -right-6 rotate-[-10deg] transition-transform duration-700 group-hover:rotate-[-6deg]">
        <CardFace name="HDFC Infinia Metal" bank="HDFC" width={200} />
      </div>
    </div>
  );
}

function BreakEvenVisual() {
  return (
    <div className="flex h-full items-center justify-center bg-rc-paper p-8">
      <svg viewBox="0 0 240 150" className="h-full w-full" aria-hidden>
        <line x1="10" y1="140" x2="230" y2="140" stroke="#0F2A1D" strokeOpacity="0.15" />
        <line x1="10" y1="62" x2="230" y2="62" stroke="#6B9071" strokeWidth="2" strokeDasharray="5 5" />
        <path d="M10 140 C 70 120, 110 80, 230 18" stroke="#0F2A1D" strokeWidth="2.5" fill="none" className="transition-[stroke-dashoffset] duration-1000" />
        <circle cx="139" cy="62" r="6" fill="#2A9D5C" />
        <circle cx="139" cy="62" r="12" fill="#2A9D5C" fillOpacity="0.15" />
        <text x="14" y="55" fontSize="10" fill="#4D6354" fontFamily="Inter">Annual fee</text>
        <text x="150" y="80" fontSize="10" fill="#0F2A1D" fontFamily="Inter" fontWeight="600">Break-even</text>
      </svg>
    </div>
  );
}

function UtilisationVisual() {
  const r = 46;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex h-full items-center justify-center bg-rc-ink">
      <div className="relative h-36 w-36">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden>
          <circle cx="60" cy="60" r={r} stroke="white" strokeOpacity="0.1" strokeWidth="10" fill="none" />
          <circle cx="60" cy="60" r={r} stroke="#E3EED4" strokeWidth="10" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - 0.28)} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-rc-cream">
          <span className="font-serif text-[36px] leading-none">28%</span>
          <span className="mt-1 text-[11px] uppercase tracking-[0.16em] text-rc-mist">used</span>
        </div>
      </div>
    </div>
  );
}

const VISUALS = [RewardVisual, BreakEvenVisual, UtilisationVisual];

export function ToolsGrid() {
  return (
    <section className="py-28 lg:py-40">
      <Container>
        <Reveal className="max-w-3xl">
          <Eyebrow index="04">Free tools</Eyebrow>
          <Display className="mt-6 text-rc-ink">Do the maths <span className="italic text-rc-forest">before you apply.</span></Display>
        </Reveal>
        <div className="mt-16 grid gap-x-8 gap-y-14 md:grid-cols-3">
          {TOOLS.map((t, i) => {
            const Visual = VISUALS[i];
            return (
              <Reveal key={t.to} delay={i * 0.08}>
                <Link to={t.to} className="group block">
                  <div className="aspect-[4/3] overflow-hidden rounded-[24px] transition-transform duration-500 group-hover:-translate-y-1">
                    <Visual />
                  </div>
                  <p className="mt-6 font-serif text-[26px] leading-tight text-rc-ink">{t.label}</p>
                  <p className="mt-2 max-w-[34ch] text-[15px] leading-relaxed text-rc-muted">{t.description}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-[13px] font-medium text-rc-ink underline decoration-rc-ink/25 underline-offset-[6px] group-hover:decoration-rc-ink">
                    Open calculator <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
