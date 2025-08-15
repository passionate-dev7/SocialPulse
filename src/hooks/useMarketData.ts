import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { 
  Market, 
  OrderBook, 
  Candle, 
  FundingRate,
  ApiResponse,
  PaginatedResponse
} from '../types/trading';
import { apiClient, queryKeys } from '../utils/api';
import { useWebSocket } from './useWebSocket';
import { useCallback, useEffect, useState } from 'react';

// Get all available markets
export const useMarkets = (filters?: {
  search?: string;
  isActive?: boolean;
  sortBy?: 'volume' | 'change' | 'alphabetical';
  sortOrder?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: queryKeys.markets.lists(),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Market[]>>(
        '/markets',
        filters
      );
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
  });
};

// Get specific market details
export const useMarket = (coin: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.markets.detail(coin || ''),
    queryFn: async () => {
      if (!coin) throw new Error('Coin is required');
      
      const response = await apiClient.get<ApiResponse<Market>>(
        `/markets/${coin}`
      );
      return response.data;
    },
    enabled: !!coin,
    staleTime: 15 * 1000, // 15 seconds
    gcTime: 60 * 1000, // 1 minute
    refetchInterval: 15 * 1000,
  });
};

// Real-time order book with WebSocket updates
export const useOrderBook = (
  coin: string | undefined,
  depth: number = 20
) => {
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { subscribe, unsubscribe, isConnected } = useWebSocket();

  // Initial fetch
  const { data: initialData, isLoading: initialLoading, error: initialError } = useQuery({
    queryKey: queryKeys.markets.orderBook(coin || ''),
    queryFn: async () => {
      if (!coin) throw new Error('Coin is required');
      
      const response = await apiClient.get<ApiResponse<OrderBook>>(
        `/markets/${coin}/orderbook`,
        { depth }
      );
      return response.data;
    },
    enabled: !!coin,
    staleTime: 5 * 1000, // 5 seconds
    refetchOnWindowFocus: false,
  });

  // WebSocket updates
  const handleOrderBookUpdate = useCallback((data: OrderBook) => {
    if (data.coin === coin) {
      setOrderBook(data);
      setIsLoading(false);
      setError(null);
    }
  }, [coin]);

  useEffect(() => {
    if (initialData) {
      setOrderBook(initialData);
      setIsLoading(false);
    }
    if (initialError) {
      setError(initialError as Error);
      setIsLoading(false);
    }
  }, [initialData, initialError]);

  useEffect(() => {
    if (coin && isConnected) {
      subscribe({
        channel: 'orderbook',
        params: { coin, depth },
        callback: handleOrderBookUpdate,
      });

      return () => {
        unsubscribe('orderbook');
      };
    }
  }, [coin, depth, isConnected, subscribe, unsubscribe, handleOrderBookUpdate]);

  return {
    data: orderBook,
    isLoading: initialLoading || (isLoading && !orderBook),
    error: initialError || error,
    isConnected,
  };
};

// Candlestick data for charts
export const useCandles = (
  coin: string | undefined,
  interval: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w' = '1h',
  limit: number = 500
) => {
  const [realtimeCandles, setRealtimeCandles] = useState<Candle[]>([]);
  const { subscribe, unsubscribe, isConnected } = useWebSocket();

  // Initial historical data fetch
  const query = useQuery({
    queryKey: queryKeys.markets.candles(coin || '', interval),
    queryFn: async () => {
      if (!coin) throw new Error('Coin is required');
      
      const response = await apiClient.get<ApiResponse<Candle[]>>(
        `/markets/${coin}/candles`,
        { interval, limit }
      );
      return response.data;
    },
    enabled: !!coin,
    staleTime: interval === '1m' ? 10 * 1000 : 60 * 1000, // Dynamic based on interval
    gcTime: 5 * 60 * 1000,
    refetchInterval: interval === '1m' ? 10 * 1000 : undefined,
  });

  // Real-time candle updates
  const handleCandleUpdate = useCallback((data: {
    coin: string;
    interval: string;
    candle: Candle;
  }) => {
    if (data.coin === coin && data.interval === interval) {
      setRealtimeCandles(prev => {
        const newCandles = [...prev];
        const lastCandle = newCandles[newCandles.length - 1];
        
        if (lastCandle && lastCandle.timestamp === data.candle.timestamp) {
          // Update existing candle
          newCandles[newCandles.length - 1] = data.candle;
        } else {
          // Add new candle
          newCandles.push(data.candle);
          
          // Keep only recent candles to prevent memory issues
          if (newCandles.length > limit) {
            newCandles.splice(0, newCandles.length - limit);
          }
        }
        
        return newCandles;
      });
    }
  }, [coin, interval, limit]);

  useEffect(() => {
    if (query.data) {
      setRealtimeCandles(query.data);
    }
  }, [query.data]);

  useEffect(() => {
    if (coin && isConnected) {
      subscribe({
        channel: 'candles',
        params: { coin, interval },
        callback: handleCandleUpdate,
      });

      return () => {
        unsubscribe('candles');
      };
    }
  }, [coin, interval, isConnected, subscribe, unsubscribe, handleCandleUpdate]);

  return {
    ...query,
    data: realtimeCandles.length > 0 ? realtimeCandles : query.data,
    isConnected,
  };
};

// Funding rates for perpetual contracts
export const useFundingRates = (coins?: string[]) => {
  return useQuery({
    queryKey: queryKeys.markets.fundingRates(),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<FundingRate[]>>(
        '/markets/funding-rates',
        coins ? { coins: coins.join(',') } : undefined
      );
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 30 * 1000,
  });
};

// Real-time price updates for multiple coins
export const usePriceUpdates = (coins: string[]) => {
  const [prices, setPrices] = useState<Record<string, {
    price: number;
    change24h: number;
    timestamp: number;
  }>>({});
  
  const { subscribe, unsubscribe, isConnected } = useWebSocket();

  const handlePriceUpdate = useCallback((data: {
    coin: string;
    price: number;
    change24h: number;
    timestamp: number;
  }) => {
    setPrices(prev => ({
      ...prev,
      [data.coin]: {
        price: data.price,
        change24h: data.change24h,
        timestamp: data.timestamp,
      },
    }));
  }, []);

  useEffect(() => {
    if (coins.length > 0 && isConnected) {
      subscribe({
        channel: 'prices',
        params: { coins },
        callback: handlePriceUpdate,
      });

      return () => {
        unsubscribe('prices');
      };
    }
  }, [coins, isConnected, subscribe, unsubscribe, handlePriceUpdate]);

  return {
    prices,
    isConnected,
  };
};

// Market statistics and 24h data
export const useMarketStats = () => {
  return useQuery({
    queryKey: [...queryKeys.markets.all, 'stats'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<{
        totalVolume24h: number;
        totalMarkets: number;
        topGainer: { coin: string; change: number };
        topLoser: { coin: string; change: number };
        totalTrades24h: number;
      }>>('/markets/stats');
      return response.data;
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000,
  });
};

// Trading pairs and their relationships
export const useTradingPairs = () => {
  return useQuery({
    queryKey: [...queryKeys.markets.all, 'pairs'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<{
        coin: string;
        baseAsset: string;
        quoteAsset: string;
        status: 'active' | 'inactive' | 'delisted';
        minNotional: number;
        maxLeverage: number;
      }[]>>('/markets/pairs');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Market depth analysis
export const useMarketDepth = (coin: string | undefined) => {
  return useQuery({
    queryKey: [...queryKeys.markets.detail(coin || ''), 'depth'],
    queryFn: async () => {
      if (!coin) throw new Error('Coin is required');
      
      const response = await apiClient.get<ApiResponse<{
        coin: string;
        bidDepth: number;
        askDepth: number;
        spread: number;
        spreadPercentage: number;
        liquidity: {
          '1%': number;
          '2%': number;
          '5%': number;
        };
      }>>(`/markets/${coin}/depth`);
      return response.data;
    },
    enabled: !!coin,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
};