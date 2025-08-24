import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Position, 
  Balance, 
  PnLData, 
  Trade,
  TradeFilters,
  ApiResponse,
  PaginatedResponse
} from '../types/trading';
import { apiClient, queryKeys } from '../utils/api';
import { useWebSocket } from './useWebSocket';
import { useCallback, useEffect, useState } from 'react';
// import { toast } from 'react-hot-toast'; // Commented out as package not installed

// Get current positions with real-time updates
export const usePositions = () => {
  const [realtimePositions, setRealtimePositions] = useState<Position[]>([]);
  const { subscribe, unsubscribe, isConnected } = useWebSocket();
  
  // Initial fetch
  const query = useQuery({
    queryKey: queryKeys.portfolio.positions(),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Position[]>>(
        '/portfolio/positions'
      );
      return response.data;
    },
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 30 * 1000, // 30 seconds
    refetchInterval: 15 * 1000, // Refresh every 15 seconds
  });

  // Real-time position updates
  const handlePositionUpdate = useCallback((data: {
    type: 'position_update' | 'position_closed' | 'position_liquidated';
    position: Position;
  }) => {
    const { type, position } = data;
    
    setRealtimePositions(prev => {
      let newPositions = [...prev];
      const existingIndex = newPositions.findIndex(p => p.coin === position.coin);
      
      switch (type) {
        case 'position_update':
          if (existingIndex >= 0) {
            newPositions[existingIndex] = position;
          } else {
            newPositions.push(position);
          }
          break;
          
        case 'position_closed':
        case 'position_liquidated':
          if (existingIndex >= 0) {
            newPositions.splice(existingIndex, 1);
          }
          
          // Show notification
          const message = type === 'position_liquidated' 
            ? `⚠️ ${position.coin} position liquidated`
            : `✅ ${position.coin} position closed`;
          console.log(message);
          break;
      }
      
      return newPositions;
    });
  }, []);

  useEffect(() => {
    if (query.data) {
      setRealtimePositions(query.data);
    }
  }, [query.data]);

  useEffect(() => {
    if (isConnected) {
      subscribe({
        channel: 'positions',
        callback: handlePositionUpdate,
      });

      return () => {
        unsubscribe('positions');
      };
    }
  }, [isConnected, subscribe, unsubscribe, handlePositionUpdate]);

  return {
    ...query,
    data: realtimePositions.length > 0 ? realtimePositions : query.data,
    isConnected,
  };
};

// Get account balance with real-time updates
export const useBalance = () => {
  const [realtimeBalance, setRealtimeBalance] = useState<Balance | null>(null);
  const { subscribe, unsubscribe, isConnected } = useWebSocket();

  const query = useQuery({
    queryKey: queryKeys.portfolio.balance(),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Balance>>(
        '/portfolio/balance'
      );
      return response.data;
    },
    staleTime: 5 * 1000, // 5 seconds
    gcTime: 30 * 1000, // 30 seconds
    refetchInterval: 10 * 1000, // Refresh every 10 seconds
  });

  const handleBalanceUpdate = useCallback((balance: Balance) => {
    setRealtimeBalance(balance);
  }, []);

  useEffect(() => {
    if (query.data) {
      setRealtimeBalance(query.data);
    }
  }, [query.data]);

  useEffect(() => {
    if (isConnected) {
      subscribe({
        channel: 'balance',
        callback: handleBalanceUpdate,
      });

      return () => {
        unsubscribe('balance');
      };
    }
  }, [isConnected, subscribe, unsubscribe, handleBalanceUpdate]);

  return {
    ...query,
    data: realtimeBalance || query.data,
    isConnected,
  };
};

// Get P&L data across different timeframes
export const usePnL = (timeframe?: '1d' | '7d' | '30d' | 'all') => {
  return useQuery({
    queryKey: [...queryKeys.portfolio.pnl(), timeframe],
    queryFn: async () => {
      const params = timeframe ? `?timeframe=${timeframe}` : '';
      const response = await apiClient.get<ApiResponse<PnLData>>(
        `/portfolio/pnl${params}`
      );
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 30 * 1000,
  });
};

// Get user's trade history with filtering and pagination
export const useTradeHistory = (
  filters?: TradeFilters,
  limit = 50
) => {
  return useQuery({
    queryKey: ['portfolio', 'trades', filters, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
      params.append('limit', String(limit));
      const response = await apiClient.get<ApiResponse<PaginatedResponse<Trade>>>(
        `/portfolio/trades?${params}`
      );
      return response.data;
    },
    staleTime: 15 * 1000, // 15 seconds
    gcTime: 60 * 1000, // 1 minute
  });
};

// Get portfolio summary statistics
export const usePortfolioSummary = () => {
  return useQuery({
    queryKey: [...queryKeys.portfolio.all(), 'summary'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<{
        totalValue: number;
        totalPnL: number;
        totalPnLPercentage: number;
        activePositions: number;
        totalTrades: number;
        winRate: number;
        avgWin: number;
        avgLoss: number;
        maxDrawdown: number;
        sharpeRatio: number;
        dailyPnL: Array<{
          date: string;
          pnl: number;
          volume: number;
        }>;
      }>>('/portfolio/summary');
      return response.data;
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000,
  });
};

// Close a position
export const useClosePosition = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      coin,
      size,
      reduceOnly = true,
    }: {
      coin: string;
      size?: number; // If not provided, closes entire position
      reduceOnly?: boolean;
    }) => {
      const response = await apiClient.post<ApiResponse<{
        orderId: string;
        status: 'filled' | 'pending';
      }>>('/portfolio/close-position', {
        coin,
        size,
        reduceOnly,
      });
      return response.data;
    },
    onMutate: async ({ coin, size }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.portfolio.positions(),
      });

      // Get previous positions
      const previousPositions = queryClient.getQueryData<Position[]>(
        queryKeys.portfolio.positions()
      );

      // Optimistically update positions
      if (previousPositions) {
        const updatedPositions = previousPositions.map(position => {
          if (position.coin === coin) {
            const newSize = size ? position.size - size : 0;
            return newSize <= 0 ? null : { ...position, size: newSize };
          }
          return position;
        }).filter(Boolean) as Position[];

        queryClient.setQueryData(
          queryKeys.portfolio.positions(),
          updatedPositions
        );
      }

      return { previousPositions };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(
        queryKeys.portfolio.positions(),
        context?.previousPositions
      );
      console.error('Failed to close position');
    },
    onSuccess: (data, variables) => {
      console.log(`Position ${variables.coin} closed successfully`);
      
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.portfolio.positions(),
      });
      
      queryClient.invalidateQueries({
        queryKey: queryKeys.portfolio.balance(),
      });
      
      queryClient.invalidateQueries({
        queryKey: ['portfolio', 'trades'],
      });
    },
  });
};

// Update stop loss or take profit for a position
export const useUpdatePositionSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      coin,
      stopLoss,
      takeProfit,
    }: {
      coin: string;
      stopLoss?: number;
      takeProfit?: number;
    }) => {
      const response = await apiClient.put<ApiResponse<Position>>(
        `/portfolio/positions/${coin}`,
        { stopLoss, takeProfit }
      );
      return response.data;
    },
    onMutate: async ({ coin, stopLoss, takeProfit }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.portfolio.positions(),
      });

      const previousPositions = queryClient.getQueryData<Position[]>(
        queryKeys.portfolio.positions()
      );

      // Optimistically update position
      if (previousPositions) {
        const updatedPositions = previousPositions.map(position => 
          position.coin === coin 
            ? { 
                ...position, 
                stopLoss: stopLoss ?? position.stopLoss,
                takeProfit: takeProfit ?? position.takeProfit 
              }
            : position
        );

        queryClient.setQueryData(
          queryKeys.portfolio.positions(),
          updatedPositions
        );
      }

      return { previousPositions };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(
        queryKeys.portfolio.positions(),
        context?.previousPositions
      );
      console.error('Failed to update position settings');
    },
    onSuccess: () => {
      console.log('Position settings updated');
      queryClient.invalidateQueries({
        queryKey: queryKeys.portfolio.positions(),
      });
    },
  });
};

// Get portfolio performance analytics
export const usePortfolioAnalytics = (timeRange: '7d' | '30d' | '90d' | '1y' = '30d') => {
  return useQuery({
    queryKey: [...queryKeys.portfolio.all(), 'analytics', timeRange],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<{
        performance: Array<{
          date: string;
          totalValue: number;
          pnl: number;
          drawdown: number;
        }>;
        metrics: {
          totalReturn: number;
          annualizedReturn: number;
          volatility: number;
          maxDrawdown: number;
          sharpeRatio: number;
          sortinoRatio: number;
          winRate: number;
          profitFactor: number;
        };
        topPerformers: Array<{
          coin: string;
          pnl: number;
          pnlPercentage: number;
        }>;
        worstPerformers: Array<{
          coin: string;
          pnl: number;
          pnlPercentage: number;
        }>;
      }>>(`/portfolio/analytics?timeRange=${timeRange}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Get risk metrics for the portfolio
export const useRiskMetrics = () => {
  return useQuery({
    queryKey: [...queryKeys.portfolio.all(), 'risk'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<{
        totalRisk: number;
        concentrationRisk: number;
        leverageRisk: number;
        correlationRisk: number;
        liquidationRisk: number;
        recommendations: string[];
        riskScore: number; // 0-100
      }>>('/portfolio/risk');
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 30 * 1000,
  });
};