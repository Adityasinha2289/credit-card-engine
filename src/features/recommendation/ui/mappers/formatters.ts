export function formatCurrency(amount: number): string {
  if (amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatPercentage(value: number): string {
  if (value === undefined || value === null) return '0%';
  return `${Math.round(value)}%`;
}

export function getNetworkIcon(network: string): string {
  const n = network?.toLowerCase() || '';
  if (n.includes('visa')) return 'visa-icon.png';
  if (n.includes('mastercard')) return 'mastercard-icon.png';
  if (n.includes('amex') || n.includes('american')) return 'amex-icon.png';
  if (n.includes('rupay')) return 'rupay-icon.png';
  return 'default-network.png';
}

export function getCardGradient(issuer: string, network: string): { from: string, to: string } {
  const i = issuer?.toLowerCase() || '';
  
  if (i.includes('sbi')) return { from: 'from-blue-600', to: 'to-blue-800' };
  if (i.includes('hdfc')) return { from: 'from-blue-800', to: 'to-blue-900' };
  if (i.includes('icici')) return { from: 'from-orange-500', to: 'to-red-600' };
  if (i.includes('axis')) return { from: 'from-red-700', to: 'to-rose-900' };
  if (i.includes('amex') || i.includes('american')) return { from: 'from-gray-300', to: 'to-gray-500' };
  if (i.includes('scb') || i.includes('standard')) return { from: 'from-green-600', to: 'to-blue-700' };
  if (i.includes('kotak')) return { from: 'from-red-600', to: 'to-red-800' };
  if (i.includes('indusind')) return { from: 'from-red-800', to: 'to-yellow-700' };

  // Fallback default gradient
  return { from: 'from-gray-700', to: 'to-gray-900' };
}
