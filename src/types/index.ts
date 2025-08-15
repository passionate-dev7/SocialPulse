// Core types for SocialPulse platform
export interface Trader {
  id: string;
  address: string;
  username?: string;
  avatar?: string;
  verified: boolean;
  rank: number;
  totalPnL: number;
  winRate: number;
  totalTrades: number;
  followersCount: number;
  copiedVolume: number;
  riskScore: number;
  sharpeRatio: number;
  maxDrawdown: number;
  avgHoldTime: number;
  preferredPairs: string[];
  createdAt: Date;
  lastActive: Date;
}

export interface Trade {
  id: string;
  traderId: string;
  pair: string;
  side: 'long' | 'short';
  entryPrice: number;
  exitPrice?: number;
  size: number;
  pnl?: number;
  pnlPercent?: number;
  leverage: number;
  openedAt: Date;
  closedAt?: Date;
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
  id: string;
  pair: string;
  side: 'long' | 'short';
  size: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  leverage: number;
  liquidationPrice: number;
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