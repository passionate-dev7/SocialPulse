import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  FollowRelation, 
  CopySettings, 
  Trade,
  ApiResponse,
  PaginatedResponse
} from '../types/trading';
import { apiClient, queryKeys } from '../utils/api';
import { useWebSocket } from './useWebSocket';
import { useCallback, useEffect } from 'react';
// import { toast } from 'react-hot-toast'; // Commented out as package not installed

// Follow a trader with copy settings
export const useFollowTrader = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      traderAddress,
      settings,
    }: {
      traderAddress: string;
      settings: CopySettings;
    }) => {
      const response = await apiClient.post<ApiResponse<FollowRelation>>(
        '/copy-trading/follow',
        {
          traderAddress,
          settings,
        }
      );
      return response.data;
    },
    onMutate: async ({ traderAddress, settings }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.copyTrading.followed(),
      });

      // Snapshot previous value
      const previousFollowed = queryClient.getQueryData<FollowRelation[]>(
        queryKeys.copyTrading.followed()
      );

      // Optimistically update
      const newFollowRelation: FollowRelation = {
        traderAddress,
        followerAddress: 'current-user', // This should come from auth context
        settings,
        createdAt: new Date().toISOString(),
        totalCopiedTrades: 0,
        totalPnl: 0,
      };

      queryClient.setQueryData<FollowRelation[]>(
        queryKeys.copyTrading.followed(),
        (old) => [...(old || []), newFollowRelation]
      );

      return { previousFollowed };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(
        queryKeys.copyTrading.followed(),
        context?.previousFollowed
      );
      console.error('Failed to follow trader');
    },
    onSuccess: (data) => {
      console.log(`Now following ${data.traderAddress}`);
      
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.copyTrading.followed(),
      });
      
      // Update trader details to reflect new follower count
      queryClient.invalidateQueries({
        queryKey: queryKeys.traders.detail(data.traderAddress),
      });
    },
  });
};

// Unfollow a trader
export const useUnfollowTrader = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (traderAddress: string) => {
      const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(
        `/copy-trading/unfollow/${traderAddress}`
      );
      return response.data;
    },
    onMutate: async (traderAddress) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.copyTrading.followed(),
      });

      const previousFollowed = queryClient.getQueryData<FollowRelation[]>(
        queryKeys.copyTrading.followed()
      );

      // Optimistically remove from list
      queryClient.setQueryData<FollowRelation[]>(
        queryKeys.copyTrading.followed(),
        (old) => old?.filter(relation => relation.traderAddress !== traderAddress) || []
      );

      return { previousFollowed, traderAddress };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(
        queryKeys.copyTrading.followed(),
        context?.previousFollowed
      );
      console.error('Failed to unfollow trader');
    },
    onSuccess: (data, traderAddress) => {
      console.log(`Unfollowed ${traderAddress}`);
      
      queryClient.invalidateQueries({
        queryKey: queryKeys.copyTrading.followed(),
      });
      
      queryClient.invalidateQueries({
        queryKey: queryKeys.traders.detail(traderAddress),
      });
    },
  });
};

// Update copy trading settings for a followed trader
export const useUpdateCopySettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      traderAddress,
      settings,
    }: {
      traderAddress: string;
      settings: Partial<CopySettings>;
    }) => {
      const response = await apiClient.put<ApiResponse<FollowRelation>>(
        `/copy-trading/settings/${traderAddress}`,
        settings
      );
      return response.data;
    },
    onMutate: async ({ traderAddress, settings }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.copyTrading.settings(traderAddress),
      });

      const previousSettings = queryClient.getQueryData(
        queryKeys.copyTrading.settings(traderAddress)
      );

      // Optimistically update settings
      queryClient.setQueryData(
        queryKeys.copyTrading.settings(traderAddress),
        (old: any) => ({ ...old, ...settings })
      );

      return { previousSettings, traderAddress };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(
        queryKeys.copyTrading.settings(context!.traderAddress),
        context?.previousSettings
      );
      console.error('Failed to update copy settings');
    },
    onSuccess: () => {
      console.log('Copy settings updated');
      queryClient.invalidateQueries({
        queryKey: queryKeys.copyTrading.followed(),
      });
    },
  });
};

// Get list of followed traders
export const useFollowedTraders = () => {
  return useQuery({
    queryKey: queryKeys.copyTrading.followed(),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<FollowRelation[]>>(
        '/copy-trading/followed'
      );
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get copy trading settings for a specific trader
export const useCopySettings = (traderAddress: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.copyTrading.settings(traderAddress || ''),
    queryFn: async () => {
      if (!traderAddress) throw new Error('Trader address is required');
      
      const response = await apiClient.get<ApiResponse<CopySettings>>(
        `/copy-trading/settings/${traderAddress}`
      );
      return response.data;
    },
    enabled: !!traderAddress,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Real-time copy trading functionality
export const useCopyTrades = () => {
  const { subscribe, unsubscribe, isConnected } = useWebSocket();
  const queryClient = useQueryClient();

  const handleTradeSignal = useCallback((data: {
    traderAddress: string;
    trade: Trade;
    action: 'open' | 'close' | 'modify';
  }) => {
    const { traderAddress, trade, action } = data;
    
    // Show notification
    const message = `${traderAddress} ${action}ed ${trade.side} ${trade.coin} at ${trade.entryPrice}`;
    toast(`📈 ${message}`, { duration: 5000 });

    // Update cache with new trade
    queryClient.setQueryData<Trade[]>(
      queryKeys.traders.trades(traderAddress),
      (old) => old ? [trade, ...old] : [trade]
    );

    // Invalidate related queries
    queryClient.invalidateQueries({
      queryKey: queryKeys.portfolio.positions(),
    });
    
    queryClient.invalidateQueries({
      queryKey: queryKeys.portfolio.balance(),
    });
  }, [queryClient]);

  useEffect(() => {
    if (isConnected) {
      subscribe({
        channel: 'copy-trades',
        callback: handleTradeSignal,
      });

      return () => {
        unsubscribe('copy-trades');
      };
    }
  }, [isConnected, subscribe, unsubscribe, handleTradeSignal]);

  return {
    isConnected,
  };
};

// Get copy trading statistics
export const useCopyTradingStats = () => {
  return useQuery({
    queryKey: [...queryKeys.copyTrading.all, 'stats'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<{
        totalFollowed: number;
        totalPnl: number;
        totalCopiedTrades: number;
        successRate: number;
        bestPerformer: string;
        worstPerformer: string;
      }>>('/copy-trading/stats');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get copy trade history
export const useCopyTradeHistory = (limit = 50) => {
  return useQuery({
    queryKey: [...queryKeys.copyTrading.all, 'history', limit],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<Trade & {
        originalTraderAddress: string;
        copiedAt: string;
      }>>>('/copy-trading/history', { limit });
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Check if currently following a trader
export const useIsFollowing = (traderAddress: string | undefined) => {
  const { data: followedTraders } = useFollowedTraders();
  
  return {
    isFollowing: followedTraders?.some(
      relation => relation.traderAddress === traderAddress
    ) ?? false,
    followRelation: followedTraders?.find(
      relation => relation.traderAddress === traderAddress
    ),
  };
};