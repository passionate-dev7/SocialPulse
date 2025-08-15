// Utility functions for formatting numbers, dates, and other data

/**
 * Format currency values with appropriate suffixes
 */
export const formatCurrency = (
  value: number,
  options: {
    compact?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string => {
  const { compact = true, minimumFractionDigits = 0, maximumFractionDigits = 2 } = options;

  if (compact) {
    if (Math.abs(value) >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(1)}B`;
    } else if (Math.abs(value) >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`;
    } else if (Math.abs(value) >= 1_000) {
      return `$${(value / 1_000).toFixed(0)}K`;
    }
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
};

/**
 * Format percentage values with appropriate precision
 */
export const formatPercentage = (
  value: number,
  options: {
    showSign?: boolean;
    precision?: number;
  } = {}
): string => {
  const { showSign = true, precision = 2 } = options;
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(precision)}%`;
};

/**
 * Format large numbers with appropriate suffixes
 */
export const formatNumber = (
  value: number,
  options: {
    compact?: boolean;
    precision?: number;
  } = {}
): string => {
  const { compact = true, precision = 1 } = options;

  if (!compact) {
    return value.toLocaleString('en-US');
  }

  if (Math.abs(value) >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(precision)}B`;
  } else if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(precision)}M`;
  } else if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(precision)}K`;
  }

  return value.toString();
};

/**
 * Format date strings for display
 */
export const formatDate = (
  dateString: string,
  options: {
    format?: 'short' | 'medium' | 'long' | 'relative';
    includeTime?: boolean;
  } = {}
): string => {
  const { format = 'medium', includeTime = false } = options;
  const date = new Date(dateString);

  if (format === 'relative') {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }

  const dateOptions: Intl.DateTimeFormatOptions = {
    year: format === 'short' ? '2-digit' : 'numeric',
    month: format === 'short' ? 'numeric' : format === 'long' ? 'long' : 'short',
    day: 'numeric',
  };

  if (includeTime) {
    dateOptions.hour = '2-digit';
    dateOptions.minute = '2-digit';
  }

  return date.toLocaleDateString('en-US', dateOptions);
};

/**
 * Format time duration in human readable format
 */
export const formatDuration = (seconds: number): string => {
  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

/**
 * Format risk level based on percentage
 */
export const formatRiskLevel = (riskPercentage: number): {
  level: 'Low' | 'Medium' | 'High';
  color: string;
} => {
  if (riskPercentage <= 5) {
    return { level: 'Low', color: '#059669' };
  } else if (riskPercentage <= 15) {
    return { level: 'Medium', color: '#d97706' };
  } else {
    return { level: 'High', color: '#dc2626' };
  }
};

/**
 * Format Sharpe ratio with appropriate precision and color coding
 */
export const formatSharpeRatio = (sharpe: number): {
  formatted: string;
  quality: 'Excellent' | 'Good' | 'Average' | 'Poor';
  color: string;
} => {
  const formatted = sharpe.toFixed(2);

  if (sharpe >= 2.0) {
    return { formatted, quality: 'Excellent', color: '#059669' };
  } else if (sharpe >= 1.0) {
    return { formatted, quality: 'Good', color: '#10b981' };
  } else if (sharpe >= 0.5) {
    return { formatted, quality: 'Average', color: '#d97706' };
  } else {
    return { formatted, quality: 'Poor', color: '#dc2626' };
  }
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
};

/**
 * Format asset pair (e.g., BTC/USDT)
 */
export const formatAssetPair = (base: string, quote: string = 'USDT'): string => {
  return `${base.toUpperCase()}/${quote.toUpperCase()}`;
};

/**
 * Format trading volume with K/M/B suffixes
 */
export const formatVolume = (volume: number): string => {
  return formatNumber(volume, { compact: true, precision: 1 });
};