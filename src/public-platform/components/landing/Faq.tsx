import { Plus } from 'lucide-react';
import { ArrowLink, Container, Display, Eyebrow, Reveal } from '../../site/primitives';
import { FAQSchema } from '../FAQSchema';
import { CATALOG_STATS } from '../../site/swipeMath';

export const FAQ_ITEMS = [
  {
    question: 'Is RenoCred free?',
    answer: 'Yes. Comparing cards, tracking your spending, reminders and Taqdeer are all free to use.',
  },
  {
    question: 'Will using RenoCred affect my credit score?',
    answer: "No. We never pull your credit report. Eligibility estimates are based on the income and credit-score range you tell us, so nothing shows up with the credit bureaus.",
  },
  {
    question: 'Do I need to share my card numbers?',
    answer: 'No. You add cards by picking them from our catalogue. If you want SMS alerts matched to a card automatically, you can add its last four digits, never the full number or CVV.',
  },
  {
    question: 'Where do the reward rates come from?',
    answer: `From each issuer's published terms for the ${CATALOG_STATS.cards} cards we cover. Our methodology page explains how we turn rates, caps and fees into a ranking.`,
  },
  {
    question: 'How does RenoCred make money?',
    answer: 'Some card and partner links may earn us a commission when you apply or buy. That never changes how cards are ranked; our affiliate disclosure explains how it works.',
  },
  {
    question: 'Which languages does Taqdeer speak?',
    answer: 'English, Hindi and Hinglish. Ask the way you would ask a friend; it replies in the same language.',
  },
];

export function Faq() {
  return (
    <section className="py-28 lg:py-40">
      <FAQSchema items={FAQ_ITEMS} />
      <Container className="grid gap-14 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <Eyebrow index="07">FAQ</Eyebrow>
          <Display size="md" className="mt-6 text-rc-ink">Questions, <span className="italic text-rc-forest">answered.</span></Display>
          <p className="mt-6 text-[16px] leading-relaxed text-rc-muted">Something else on your mind?</p>
          <ArrowLink to="/contact" className="mt-3">Write to us</ArrowLink>
        </Reveal>
        <div className="lg:col-span-7 lg:col-start-6">
          {FAQ_ITEMS.map((f) => (
            <details key={f.question} className="group border-b border-rc-ink/10 first:border-t">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left [&::-webkit-details-marker]:hidden">
                <span className="font-serif text-[22px] leading-snug text-rc-ink sm:text-[24px]">{f.question}</span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-rc-ink/15 transition-transform duration-300 group-open:rotate-45">
                  <Plus className="h-4 w-4 text-rc-ink" />
                </span>
              </summary>
              <p className="max-w-[60ch] pb-7 pr-14 text-[16px] leading-relaxed text-rc-muted">{f.answer}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
