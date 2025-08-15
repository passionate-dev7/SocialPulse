import { useState, useEffect } from 'react';
import { Trader } from '../types';

interface UseTraders {
  traders: Trader[];
  loading: boolean;
  error: string | null;
  fetchTraders: (filters?: TraderFilters) => Promise<void>;
}

interface TraderFilters {
  sortBy?: 'pnl' | 'winRate' | 'followers' | 'trades';
  order?: 'asc' | 'desc';
  minRank?: number;
  maxRank?: number;
  minWinRate?: number;
  verified?: boolean;
}

export const useTraders = (): UseTraders => {
  const [traders, setTraders] = useState<Trader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTraders = async (filters: TraderFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockTraders: Trader[] = Array.from({ length: 50 }, (_, i) => ({
        id: `trader-${i + 1}`,
        address: `0x${Math.random().toString(16).substr(2, 40)}`,
        username: `Trader${i + 1}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
        verified: Math.random() > 0.7,
        rank: i + 1,
        totalPnL: (Math.random() - 0.3) * 100000,
        winRate: Math.random() * 40 + 50,
        totalTrades: Math.floor(Math.random() * 1000) + 100,
        followersCount: Math.floor(Math.random() * 5000),
        copiedVolume: Math.random() * 500000,
        riskScore: Math.floor(Math.random() * 10) + 1,
        sharpeRatio: Math.random() * 3,
        maxDrawdown: Math.random() * 30,
        avgHoldTime: Math.random() * 24,
        preferredPairs: ['BTC/USD', 'ETH/USD', 'SOL/USD'].slice(0, Math.floor(Math.random() * 3) + 1),
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      }));

      // Apply filters
      let filteredTraders = [...mockTraders];
      
      if (filters.verified !== undefined) {
        filteredTraders = filteredTraders.filter(t => t.verified === filters.verified);
      }
      
      if (filters.minWinRate) {
        filteredTraders = filteredTraders.filter(t => t.winRate >= filters.minWinRate!);
      }

      if (filters.sortBy) {
        filteredTraders.sort((a, b) => {
          const aVal = a[filters.sortBy as keyof Trader] as number;
          const bVal = b[filters.sortBy as keyof Trader] as number;
          return filters.order === 'asc' ? aVal - bVal : bVal - aVal;
        });
      }

      setTraders(filteredTraders);
    } catch (err) {
      setError('Failed to fetch traders');
      console.error('Error fetching traders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTraders();
  }, []);

  return { traders, loading, error, fetchTraders };
};