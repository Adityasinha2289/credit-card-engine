/**
 * The rows in the sign-in panel: everyday spends and the card in the catalogue
 * that earns most on each. Loaded after the page is up (it pulls in the card
 * dataset), so it never slows sign-in.
 */
import { HERO_MOMENTS, bestInCatalog } from '../../../public-platform/site/swipeMath';
import { displayCardName } from '../../../public-platform/site/CardFace';

export interface SpendRow { label: string; amount: number; card: string; reward: number; rate: number }

export function spendRows(): SpendRow[] {
  return HERO_MOMENTS.flatMap((m) => {
    const best = bestInCatalog(m.category, m.amount);
    return best ? [{ label: m.label, amount: m.amount, card: displayCardName(best.card.name), reward: best.reward, rate: best.rate }] : [];
  });
}
