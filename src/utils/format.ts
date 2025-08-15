// Utility functions for formatting data
export const formatCurrency = (amount: number, decimals = 2): string => {
  if (Math.abs(amount) >= 1e9) {
    return `$${(amount / 1e9).toFixed(decimals)}B`;
  }
  if (Math.abs(amount) >= 1e6) {
    return `$${(amount / 1e6).toFixed(decimals)}M`;
  }
  if (Math.abs(amount) >= 1e3) {
    return `$${(amount / 1e3).toFixed(decimals)}K`;
  }
  return `$${amount.toFixed(decimals)}`;
};

export const formatPercentage = (percentage: number, decimals = 2): string => {
  const sign = percentage >= 0 ? '+' : '';
  return `${sign}${percentage.toFixed(decimals)}%`;
};

export const formatNumber = (num: number, decimals = 0): string => {
  if (Math.abs(num) >= 1e9) {
    return `${(num / 1e9).toFixed(decimals)}B`;
  }
  if (Math.abs(num) >= 1e6) {
    return `${(num / 1e6).toFixed(decimals)}M`;
  }
  if (Math.abs(num) >= 1e3) {
    return `${(num / 1e3).toFixed(decimals)}K`;
  }
  return num.toLocaleString();
};

export const formatAddress = (address: string): string => {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

export const getPnLColor = (pnl: number): string => {
  if (pnl > 0) return 'text-green-600';
  if (pnl < 0) return 'text-red-600';
  return 'text-gray-600';
};

export const getRiskColor = (score: number): string => {
  if (score <= 3) return 'text-green-600 bg-green-100';
  if (score <= 6) return 'text-yellow-600 bg-yellow-100';
  return 'text-red-600 bg-red-100';
};