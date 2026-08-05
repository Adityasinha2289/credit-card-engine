import type { ICreditCardProvider } from './ICreditCardProvider';
import type { CreditCardIntelligence } from '../types';
import { MOCK_CARDS_INTELLIGENCE } from '../mockCards';

export class MockCreditCardProvider implements ICreditCardProvider {
  public getCards(): CreditCardIntelligence[] {
    return MOCK_CARDS_INTELLIGENCE;
  }
}
