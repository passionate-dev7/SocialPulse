// Trading Platform Types

export interface Trader {
  address: string;
  username?: string;
  avatar?: string;
  rank: number;
  totalVolume: number;
  winRate: number;
  pnl: number;
  followers: number;
  verified: boolean;
  joinedAt: string;
}

export interface TraderDetails extends Trader {
  bio?: string;
  twitter?: string;
  discord?: string;
  badges: string[];
  statistics: {
    totalTrades: number;
    avgHoldTime: number;
    maxDrawdown: number;
    sharpeRatio: number;
    roi: number;
  };
}

export interface TraderPerformance {
  address: string;
  timeframe: '1h' | '24h' | '7d' | '30d' | '1y' | 'all';
  pnl: number;
  pnlPercentage: number;
  volume: number;
  trades: number;
  winRate: number;
  history: PerformancePoint[];
}

export interface PerformancePoint {
  timestamp: number;
  pnl: number;
  volume: number;
}

export interface Trade {
  id: string;
  traderAddress: string;
  coin: string;
  side: 'long' | 'short';
  size: number;
  leverage: number;
  entryPrice: number;
  exitPrice?: number;
  pnl?: number;
  status: 'open' | 'closed' | 'liquidated';
  openedAt: string;
  closedAt?: string;
  fees: number;
}

export interface CopySettings {
  maxPositionSize: number;
  riskPercentage: number;
  maxLeverage: number;
  stopLoss?: number;
  takeProfit?: number;
  includedCoins?: string[];
  excludedCoins?: string[];
  enabled: boolean;
}

export interface FollowRelation {
  traderAddress: string;
  followerAddress: string;
  settings: CopySettings;
  createdAt: string;
  totalCopiedTrades: number;
  totalPnl: number;
}

export interface Market {
  coin: string;
  displayName: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap?: number;
  maxLeverage: number;
  tickSize: number;
  minSize: number;
  isActive: boolean;
}

export interface OrderBookLevel {
  price: number;
  size: number;
  total: number;
}

export interface OrderBook {
  coin: string;
  timestamp: number;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  spread: number;
  midPrice: number;
}

export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface FundingRate {
  coin: string;
  rate: number;
  timestamp: number;
  nextFunding: number;
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

export interface Balance {
  total: number;
  available: number;
  used: number;
  pnl: number;
}

export interface PnLData {
  total: number;
  realized: number;
  unrealized: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  allTime: number;
}

// WebSocket Types
export interface WebSocketMessage {
  type: string;
  channel: string;
  data: any;
}

export interface WebSocketSubscription {
  channel: string;
  params?: Record<string, any>;
  callback: (data: any) => void;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  timestamp: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Query Parameters
export interface TraderFilters {
  timeframe?: '24h' | '7d' | '30d';
  minVolume?: number;
  minWinRate?: number;
  verified?: boolean;
}

export interface TradeFilters {
  coin?: string;
  side?: 'long' | 'short';
  status?: 'open' | 'closed' | 'liquidated';
  startDate?: string;
  endDate?: string;
}