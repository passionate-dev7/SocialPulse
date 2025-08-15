# SocialPulse Trading Platform React Hooks

A comprehensive collection of React Query-powered hooks for building trading applications with real-time data, copy trading, and portfolio management.

## Overview

This hooks library provides:
- **Real-time WebSocket connections** with auto-reconnection
- **Optimistic updates** for better UX
- **Intelligent caching** with background sync
- **TypeScript support** throughout
- **Error handling** and retry strategies
- **Performance optimizations** for trading apps

## Installation

```bash
npm install @tanstack/react-query react-hot-toast
```

## Quick Start

### 1. Setup React Query Provider

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './utils/queryClient';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app components */}
    </QueryClientProvider>
  );
}
```

### 2. Use Trading Hooks

```tsx
import { useTopTraders, usePositions, useOrderBook } from './hooks';

function TradingComponent() {
  const { data: traders, isLoading } = useTopTraders();
  const { data: positions } = usePositions();
  const { data: orderBook, isConnected } = useOrderBook('BTC');

  return (
    <div>
      {/* Your trading UI */}
    </div>
  );
}
```

## Hook Categories

### 👥 Trader Hooks (`useTraders.ts`)

Track and analyze top performing traders on the platform.

```tsx
// Get top traders with filtering
const { data: traders, fetchNextPage, hasNextPage } = useTopTraders({
  timeframe: '24h',
  minVolume: 10000,
  verified: true
}, 20);

// Get detailed trader information
const { data: trader } = useTraderDetails('0x123...');

// Get trader performance across timeframes
const { data: performance } = useTraderPerformance('0x123...', '30d');

// Get trader's trade history
const { data: trades } = useTraderTrades('0x123...', {
  coin: 'BTC',
  status: 'closed'
});

// Search traders by username
const { data: searchResults } = useSearchTraders('john_trader');
```

### 📋 Copy Trading Hooks (`useCopyTrading.ts`)

Implement social trading features with real-time trade copying.

```tsx
// Follow a trader with custom settings
const followTrader = useFollowTrader();
await followTrader.mutateAsync({
  traderAddress: '0x123...',
  settings: {
    maxPositionSize: 1000,
    riskPercentage: 2,
    maxLeverage: 10,
    stopLoss: 5,
    takeProfit: 15,
    enabled: true
  }
});

// Get list of followed traders
const { data: followedTraders } = useFollowedTraders();

// Real-time trade copying
useCopyTrades(); // Handles WebSocket subscriptions automatically

// Update copy settings
const updateSettings = useUpdateCopySettings();
await updateSettings.mutateAsync({
  traderAddress: '0x123...',
  settings: { maxPositionSize: 2000 }
});

// Check if following a trader
const { isFollowing, followRelation } = useIsFollowing('0x123...');
```

### 📊 Market Data Hooks (`useMarketData.ts`)

Access real-time market data with WebSocket updates.

```tsx
// Get all markets with filtering
const { data: markets } = useMarkets({
  search: 'BTC',
  sortBy: 'volume'
});

// Real-time order book (WebSocket)
const { data: orderBook, isConnected } = useOrderBook('BTC', 20);

// Candlestick data for charts
const { data: candles } = useCandles('BTC', '1h', 500);

// Real-time price updates for multiple coins
const { prices } = usePriceUpdates(['BTC', 'ETH', 'SOL']);

// Funding rates for perpetual contracts
const { data: fundingRates } = useFundingRates(['BTC', 'ETH']);
```

### 💼 Portfolio Hooks (`usePortfolio.ts`)

Manage user positions, balance, and trading history.

```tsx
// Real-time positions
const { data: positions, isConnected } = usePositions();

// Real-time balance updates
const { data: balance } = useBalance();

// P&L across timeframes
const { data: pnl } = usePnL('30d');

// Trading history with pagination
const { data: trades } = useTradeHistory({
  coin: 'BTC',
  startDate: '2023-01-01'
});

// Close position with optimistic updates
const closePosition = useClosePosition();
await closePosition.mutateAsync({ coin: 'BTC', size: 0.5 });

// Portfolio analytics
const { data: analytics } = usePortfolioAnalytics('30d');
```

### 🌐 WebSocket Hook (`useWebSocket.ts`)

Robust WebSocket connection with auto-reconnection and queuing.

```tsx
const {
  isConnected,
  subscribe,
  unsubscribe,
  sendMessage
} = useWebSocket({
  url: 'wss://api.socialpulse.trade',
  reconnectAttempts: 10,
  heartbeatInterval: 30000
});

// Subscribe to channels
useEffect(() => {
  if (isConnected) {
    subscribe({
      channel: 'orderbook',
      params: { coin: 'BTC' },
      callback: (data) => console.log('Order book update:', data)
    });
  }
}, [isConnected]);
```

## Advanced Features

### Optimistic Updates

Hooks automatically implement optimistic updates for better UX:

```tsx
const followTrader = useFollowTrader();

// UI updates immediately, rollbacks on error
await followTrader.mutateAsync({ 
  traderAddress: '0x123...',
  settings: { /* ... */ }
});
```

### Real-time Synchronization

WebSocket integration keeps data fresh:

```tsx
// Automatically receives real-time updates
const { data: positions } = usePositions();
const { data: orderBook } = useOrderBook('BTC');
```

### Error Handling

Built-in error handling with user notifications:

```tsx
// Automatically shows error toasts
// Implements retry strategies
// Handles network failures gracefully
```

### Caching Strategies

Intelligent caching based on data sensitivity:

- **Positions**: 10-second cache, real-time updates
- **Market data**: 15-30 second cache
- **Trader profiles**: 2-5 minute cache
- **Static data**: 10+ minute cache

### Background Sync

Automatic background synchronization when app regains focus.

## TypeScript Support

Fully typed interfaces for all data structures:

```tsx
interface Position {
  coin: string;
  side: 'long' | 'short';
  size: number;
  leverage: number;
  entryPrice: number;
  markPrice: number;
  unrealizedPnl: number;
  liquidationPrice: number;
  // ...
}

const { data: positions } = usePositions(); // positions: Position[]
```

## Performance Best Practices

1. **Use pagination** for large datasets
2. **Implement virtualization** for long lists
3. **Batch operations** when possible
4. **Cache static data** aggressively
5. **Debounce search queries**

```tsx
// Good: Paginated traders list
const { data, fetchNextPage } = useTopTraders(filters, 20);

// Good: Debounced search
const { data: searchResults } = useSearchTraders(
  query,
  { minLength: 2, debounceMs: 300 }
);
```

## Error Handling Patterns

```tsx
function TradingComponent() {
  const { data, error, isLoading } = usePositions();

  if (error) {
    return <ErrorBoundary error={error} />;
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return <PositionsList positions={data} />;
}
```

## WebSocket Connection Management

The WebSocket hook handles:
- **Auto-reconnection** with exponential backoff
- **Message queuing** during disconnections
- **Heartbeat** to keep connections alive
- **Subscription management**
- **Error recovery**

## Environment Variables

```env
REACT_APP_API_URL=https://api.socialpulse.trade
REACT_APP_WS_URL=wss://ws.socialpulse.trade
```

## Contributing

When adding new hooks:
1. Follow the existing patterns
2. Include proper TypeScript types
3. Add error handling
4. Implement optimistic updates where applicable
5. Add real-time capabilities if needed
6. Update this documentation

## License

MIT License - see LICENSE file for details.