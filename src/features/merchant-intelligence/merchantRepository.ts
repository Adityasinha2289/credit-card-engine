import type { Merchant, MerchantOffer, MerchantDataSource } from './types';

export class MerchantRepository implements MerchantDataSource {
  private static instance: MerchantRepository;
  private merchants: Merchant[] = [];
  private offers: MerchantOffer[] = [];

  public static getInstance(): MerchantRepository {
    if (!MerchantRepository.instance) {
      MerchantRepository.instance = new MerchantRepository();
    }
    return MerchantRepository.instance;
  }

  public getMerchants(): Merchant[] {
    return this.merchants;
  }

  public getOffers(): MerchantOffer[] {
    return this.offers;
  }

  public getMerchantById(id: string): Merchant | undefined {
    return this.merchants.find((m) => m.id === id);
  }

  public getOffersByMerchantId(merchantId: string): MerchantOffer[] {
    return this.offers.filter((o) => o.merchantId === merchantId);
  }
}
