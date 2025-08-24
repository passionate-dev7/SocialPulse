// Core types for SocialPulse platform
export interface Trader {
  id: string;
  address: string;
  name: string;
  username?: string;
  avatar: string;
  isVerified: boolean;
  verified: boolean;
  rank: number;
  pnl: number;
  totalPnL: number;
  roi: number;
  totalReturn: number;
  monthlyReturn: number;
  winRate: number;
  totalTrades: number;
  followers: number;
  followersCount: number;
  copiedVolume: number;
  aum: number;
  riskScore: number;
  sharpeRatio: number;
  maxDrawdown: number;
  avgHoldTime: number;
  preferredPairs: string[];
  strategy: string;
  performance: PerformanceData[];
  isFollowing?: boolean;
  createdAt: string;
  lastActive: string;
}

// Leaderboard specific types
export interface LeaderboardFilters {
  timeframe: '24h' | '7d' | '30d' | 'all';
  strategy: 'all' | 'Momentum' | 'Arbitrage' | 'DeFi' | 'Swing';
  search: string;
  sortBy: keyof Trader;
  sortOrder: 'asc' | 'desc';
}

export interface UseTraders {
  data: Trader[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

// Performance chart types
export interface PerformanceData {
  date: string;
  value: number;
  pnl: number;
  cumulativeReturn: number;
}

export interface CopyTradeSettings {
  traderId: string;
  amount: number;
  maxDrawdown: number;
  copyPercentage: number;
  takeProfitPercentage: number;
  stopLossPercentage: number;
  maxPositions: number;
  autoCopyNewTrades: boolean;
  copyExistingPositions: boolean;
}

export interface Trade {
  id: string;
  traderId: string;
  pair: string;
  asset: string;
  side: 'long' | 'short';
  entryPrice: number;
  exitPrice?: number | null;
  size: number;
  pnl?: number | null;
  pnlPercent?: number | null;
  leverage?: number;
  openedAt: string;
  closedAt?: string | null;
  timestamp: number;
  status: 'open' | 'closed' | 'liquidated';
}

export interface Portfolio {
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  positions: Position[];
  followedTraders: FollowedTrader[];
}

export interface Position {
  coin: string;
  side: 'long' | 'short';
  size: number;
  leverage: number;
  entryPrice: number;
  markPrice: number;
  unrealizedPnl: number;
  liquidationPrice: number;
  margin: number;
  marginRatio: number;
  stopLoss?: number;
  takeProfit?: number;
  openedAt: string;
}

export interface FollowedTrader {
  trader: Trader;
  allocatedAmount: number;
  copyRatio: number;
  totalCopied: number;
  totalPnL: number;
  followedAt: Date;
  active: boolean;
}

export interface UserSettings {
  riskManagement: {
    maxPositionSize: number;
    maxDailyLoss: number;
    stopLossPercentage: number;
    takeProfitPercentage: number;
  };
  notifications: {
    newTrades: boolean;
    profitLoss: boolean;
    riskAlerts: boolean;
    email: boolean;
    push: boolean;
  };
  copyTrading: {
    autoFollow: boolean;
    maxTraders: number;
    minTraderRank: number;
    diversificationRatio: number;
  };
}

export interface PlatformStats {
  totalUsers: number;
  totalVolume: number;
  totalTrades: number;
  avgWinRate: number;
  topPerformerPnL: number;
}