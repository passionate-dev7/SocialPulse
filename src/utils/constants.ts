// Trading platform constants
export const PLATFORMS = {
  HYPERLIQUID: 'hyperliquid',
  BINANCE: 'binance',
  FTX: 'ftx',
} as const;

// Asset categories
export const ASSET_CATEGORIES = {
  MAJOR: ['BTC', 'ETH'],
  DEFI: ['UNI', 'AAVE', 'SUSHI', 'COMP'],
  L1: ['SOL', 'AVAX', 'DOT', 'ATOM'],
  L2: ['MATIC', 'OP', 'ARB'],
  MEME: ['DOGE', 'SHIB', 'PEPE'],
} as const;

// Trading strategies
export const STRATEGIES = [
  'Momentum',
  'Arbitrage',
  'DeFi',
  'Swing Trading',
  'Scalping',
  'Grid Trading',
  'Mean Reversion',
  'Breakout',
] as const;

// Risk levels
export const RISK_LEVELS = {
  LOW: { min: 0, max: 5, label: 'Low Risk', color: '#059669' },
  MEDIUM: { min: 5, max: 15, label: 'Medium Risk', color: '#d97706' },
  HIGH: { min: 15, max: 100, label: 'High Risk', color: '#dc2626' },
} as const;

// Fee structure
export const FEES = {
  MANAGEMENT_FEE: 0.02, // 2% annually
  PERFORMANCE_FEE: 0.20, // 20% of profits
  PLATFORM_FEE: 0.001, // 0.1% per trade
} as const;

// API endpoints
export const API_ENDPOINTS = {
  TRADERS: '/api/traders',
  TRADES: '/api/trades',
  COPY_TRADE: '/api/copy-trade',
  PERFORMANCE: '/api/performance',
  FOLLOW: '/api/follow',
} as const;

// Chart colors for different traders
export const CHART_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6366f1'
] as const;

// Timeframe options
export const TIMEFRAMES = [
  { key: '1h', label: '1H', hours: 1 },
  { key: '4h', label: '4H', hours: 4 },
  { key: '1d', label: '1D', hours: 24 },
  { key: '7d', label: '7D', hours: 168 },
  { key: '30d', label: '30D', hours: 720 },
  { key: '90d', label: '90D', hours: 2160 },
  { key: '1y', label: '1Y', hours: 8760 }
] as const;

// Performance metrics thresholds
export const METRICS_THRESHOLDS = {
  EXCELLENT_ROI: 50,
  GOOD_ROI: 20,
  EXCELLENT_WIN_RATE: 80,
  GOOD_WIN_RATE: 60,
  EXCELLENT_SHARPE: 2.0,
  GOOD_SHARPE: 1.0,
} as const;