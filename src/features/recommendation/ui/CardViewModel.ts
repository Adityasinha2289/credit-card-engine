export interface CardAesthetics {
  gradientFrom: string;
  gradientTo: string;
  badgeLabel?: string;
  badgeColor?: string;
}

export interface CardViewModel {
  id: string;
  displayName: string;
  issuer: string;
  networkIcon: string;
  formattedAnnualFee: string;
  formattedRewardRate: string;
  aesthetics: CardAesthetics;
}
