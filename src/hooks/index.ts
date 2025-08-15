// Main hooks export file for SocialPulse Trading Platform

// Authentication hooks
export {
  useAuth,
  useLogin,
  useLogout,
  useUpdatePreferences,
} from './useAuth';

// Trader-related hooks
export {
  useTopTraders,
  useTraderDetails,
  useTraderPerformance,
  useTraderTrades,
  useSearchTraders,
  useTraderRank,
  useSimilarTraders,
} from './useTraders';

// Copy trading hooks
export {
  useFollowTrader,
  useUnfollowTrader,
  useUpdateCopySettings,
  useFollowedTraders,
  useCopySettings,
  useCopyTrades,
  useCopyTradingStats,
  useCopyTradeHistory,
  useIsFollowing,
} from './useCopyTrading';

// Market data hooks
export {
  useMarkets,
  useMarket,
  useOrderBook,
  useCandles,
  useFundingRates,
  usePriceUpdates,
  useMarketStats,
  useTradingPairs,
  useMarketDepth,
} from './useMarketData';

// Portfolio management hooks
export {
  usePositions,
  useBalance,
  usePnL,
  useTradeHistory,
  usePortfolioSummary,
  useClosePosition,
  useUpdatePositionSettings,
  usePortfolioAnalytics,
  useRiskMetrics,
} from './usePortfolio';

// WebSocket connection hooks
export {
  useWebSocket,
  useMultiWebSocket,
  useReliableWebSocket,
} from './useWebSocket';

// Re-export types for convenience
export type {
  Trader,
  TraderDetails,
  TraderPerformance,
  Trade,
  CopySettings,
  FollowRelation,
  Market,
  OrderBook,
  Candle,
  FundingRate,
  Position,
  Balance,
  PnLData,
  WebSocketMessage,
  WebSocketSubscription,
  TraderFilters,
  TradeFilters,
} from '../types/trading';