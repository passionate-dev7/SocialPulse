import { useState, useEffect } from 'react';
import { Trader, LeaderboardFilters, UseTraders } from '../types';

export const useTraders = (filters: LeaderboardFilters): UseTraders => {
  const [data, setData] = useState<Trader[]>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTraders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Mock API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const strategies = ['Momentum', 'Arbitrage', 'DeFi', 'Swing'];
      
      const mockTraders: Trader[] = Array.from({ length: 50 }, (_, i) => {
        const pnlValue = (Math.random() - 0.3) * 100000;
        const roiValue = (Math.random() - 0.2) * 150;
        const aumValue = Math.random() * 1000000 + 50000;
        
        return {
          id: `trader-${i + 1}`,
          address: `0x${Math.random().toString(16).substr(2, 40)}`,
          name: `Trader${i + 1}`,
          username: `trader${i + 1}`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
          isVerified: Math.random() > 0.7,
          verified: Math.random() > 0.7,
          rank: i + 1,
          pnl: pnlValue,
          totalPnL: pnlValue,
          roi: roiValue,
          totalReturn: roiValue,
          monthlyReturn: roiValue / 12,
          winRate: Math.random() * 40 + 50,
          totalTrades: Math.floor(Math.random() * 1000) + 100,
          followers: Math.floor(Math.random() * 5000),
          followersCount: Math.floor(Math.random() * 5000),
          copiedVolume: Math.random() * 500000,
          aum: aumValue,
          riskScore: Math.floor(Math.random() * 10) + 1,
          sharpeRatio: Math.random() * 3,
          maxDrawdown: Math.random() * 30,
          avgHoldTime: Math.random() * 24,
          preferredPairs: ['BTC/USD', 'ETH/USD', 'SOL/USD'].slice(0, Math.floor(Math.random() * 3) + 1),
          strategy: strategies[Math.floor(Math.random() * strategies.length)],
          performance: Array.from({ length: 30 }, (_, j) => ({
            date: new Date(Date.now() - (29 - j) * 24 * 60 * 60 * 1000).toISOString(),
            value: 10000 + Math.random() * 50000,
            pnl: (Math.random() - 0.5) * 5000,
            cumulativeReturn: Math.random() * 200 - 50
          })),
          isFollowing: Math.random() > 0.7,
          createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
          lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        };
      });

      // Apply filters
      let filteredTraders = [...mockTraders];
      
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredTraders = filteredTraders.filter(t => 
          t.name.toLowerCase().includes(searchTerm) ||
          t.username?.toLowerCase().includes(searchTerm) ||
          t.strategy.toLowerCase().includes(searchTerm)
        );
      }
      
      // Strategy filter
      if (filters.strategy !== 'all') {
        filteredTraders = filteredTraders.filter(t => t.strategy === filters.strategy);
      }

      // Sorting
      if (filters.sortBy) {
        filteredTraders.sort((a, b) => {
          const aVal = a[filters.sortBy] as number;
          const bVal = b[filters.sortBy] as number;
          return filters.sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        });
      }

      setData(filteredTraders);
    } catch (err) {
      setError(new Error('Failed to fetch traders'));
      console.error('Error fetching traders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTraders();
  }, [filters.timeframe, filters.strategy, filters.search, filters.sortBy, filters.sortOrder]);

  return { data, isLoading, error };
};

// Follow trader hook
export const useFollowTrader = () => {
  const followTrader = async (traderId: string) => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Following trader:', traderId);
  };

  return { followTrader };
};

// Unfollow trader hook
export const useUnfollowTrader = () => {
  const unfollowTrader = async (traderId: string) => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Unfollowing trader:', traderId);
  };

  return { unfollowTrader };
};

// Top traders hook - alias for useTraders
export const useTopTraders = (filters?: Partial<LeaderboardFilters>) => {
  const defaultFilters: LeaderboardFilters = {
    timeframe: '30d',
    strategy: 'all',
    search: '',
    sortBy: 'pnl',
    sortOrder: 'desc',
    ...filters
  };
  return useTraders(defaultFilters);
};

// Trader details hook
export const useTraderDetails = (traderId: string) => {
  const { data: traders } = useTraders({
    timeframe: '30d',
    strategy: 'all',
    search: '',
    sortBy: 'pnl',
    sortOrder: 'desc'
  });
  
  const trader = traders?.find(t => t.id === traderId);
  
  return {
    data: trader,
    isLoading: false,
    error: null
  };
};

// Trader performance hook
export const useTraderPerformance = (traderId: string) => {
  const { data: trader } = useTraderDetails(traderId);
  return {
    data: trader?.performance,
    isLoading: false,
    error: null
  };
};

// Trader trades hook
export const useTraderTrades = (traderId: string) => {
  // Mock trades data
  const mockTrades = Array.from({ length: 10 }, (_, i) => ({
    id: `trade-${i}`,
    traderId,
    pair: ['BTC/USD', 'ETH/USD', 'SOL/USD'][i % 3],
    asset: ['BTC/USD', 'ETH/USD', 'SOL/USD'][i % 3],
    side: Math.random() > 0.5 ? 'long' as const : 'short' as const,
    entryPrice: 40000 + Math.random() * 20000,
    exitPrice: Math.random() > 0.3 ? 45000 + Math.random() * 15000 : undefined,
    size: Math.random() * 10 + 1,
    pnl: Math.random() > 0.3 ? (Math.random() - 0.5) * 10000 : undefined,
    timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: Math.random() > 0.3 ? 'closed' as const : 'open' as const
  }));

  return {
    data: mockTrades,
    isLoading: false,
    error: null
  };
};

// Search traders hook
export const useSearchTraders = (query: string) => {
  return useTraders({
    timeframe: '30d',
    strategy: 'all',
    search: query,
    sortBy: 'pnl',
    sortOrder: 'desc'
  });
};

// Trader rank hook
export const useTraderRank = (traderId: string) => {
  const { data: traders } = useTraders({
    timeframe: '30d',
    strategy: 'all',
    search: '',
    sortBy: 'pnl',
    sortOrder: 'desc'
  });
  
  const rank = traders?.findIndex(t => t.id === traderId);
  
  return {
    data: rank !== undefined && rank >= 0 ? rank + 1 : null,
    isLoading: false,
    error: null
  };
};

// Similar traders hook
export const useSimilarTraders = (traderId: string) => {
  const { data: allTraders } = useTraders({
    timeframe: '30d',
    strategy: 'all',
    search: '',
    sortBy: 'pnl',
    sortOrder: 'desc'
  });
  
  const similarTraders = allTraders?.filter(t => t.id !== traderId).slice(0, 5);
  
  return {
    data: similarTraders,
    isLoading: false,
    error: null
  };
};