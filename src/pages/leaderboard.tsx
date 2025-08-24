import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useTraders } from '../hooks/useTraders';
import { formatCurrency, formatPercentage, formatAddress, getPnLColor, getRiskColor } from '../utils/format';
import type { Trader } from '../types';

interface LeaderboardPageProps {
  initialTraders: Trader[];
}

type SortField = 'rank' | 'totalPnL' | 'winRate' | 'totalTrades' | 'followersCount' | 'sharpeRatio';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';

const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ initialTraders }) => {
  const { data: traders, isLoading: loading, error } = useTraders({ 
    timeframe: '30d', 
    strategy: 'all', 
    search: '', 
    sortBy: 'rank', 
    sortOrder: 'asc' 
  });
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    minWinRate: '',
    maxRisk: '',
    verified: false,
    minFollowers: '',
  });

  const displayTraders = loading ? initialTraders : traders;

  // Filter and sort traders
  const filteredTraders = (displayTraders || [])
    .filter(trader => {
      if (searchQuery && !trader.username?.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !trader.address.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (filters.minWinRate && trader.winRate < parseFloat(filters.minWinRate)) return false;
      if (filters.maxRisk && trader.riskScore > parseFloat(filters.maxRisk)) return false;
      if (filters.verified && !trader.verified) return false;
      if (filters.minFollowers && trader.followersCount < parseInt(filters.minFollowers)) return false;
      return true;
    })
    .sort((a, b) => {
      const aVal = a[sortField] as number;
      const bVal = b[sortField] as number;
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'rank' ? 'asc' : 'desc');
    }
  };

  const handleFilterChange = (key: string, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      minWinRate: '',
      maxRisk: '',
      verified: false,
      minFollowers: '',
    });
    setSearchQuery('');
  };

  return (
    <ErrorBoundary>
      <Head>
        <title>Trader Leaderboard - SocialPulse</title>
        <meta 
          name="description" 
          content="Browse top crypto traders on Hyperliquid. Compare performance, win rates, and find the best traders to follow and copy."
        />
        <meta name="keywords" content="crypto leaderboard, top traders, hyperliquid rankings, copy trading" />
        <meta property="og:title" content="Trader Leaderboard - SocialPulse" />
        <meta property="og:description" content="Browse and compare top performing crypto traders." />
        <link rel="canonical" href="https://socialpulse.com/leaderboard" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Trader Leaderboard</h1>
            <p className="text-gray-600">
              Discover and follow the top performing traders on Hyperliquid
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
              <div className="lg:col-span-2">
                <label htmlFor="search" className="sr-only">Search traders</label>
                <div className="relative">
                  <svg className="absolute left-3 top-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    id="search"
                    type="text"
                    placeholder="Search by username or address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="minWinRate" className="block text-sm font-medium text-gray-700 mb-1">
                  Min Win Rate (%)
                </label>
                <input
                  id="minWinRate"
                  type="number"
                  placeholder="e.g. 60"
                  value={filters.minWinRate}
                  onChange={(e) => handleFilterChange('minWinRate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="maxRisk" className="block text-sm font-medium text-gray-700 mb-1">
                  Max Risk Score
                </label>
                <select
                  id="maxRisk"
                  value={filters.maxRisk}
                  onChange={(e) => handleFilterChange('maxRisk', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Any</option>
                  <option value="3">Low (1-3)</option>
                  <option value="6">Medium (4-6)</option>
                  <option value="10">High (7-10)</option>
                </select>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.verified}
                  onChange={(e) => handleFilterChange('verified', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Verified only</span>
              </label>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Min Followers:</span>
                <input
                  type="number"
                  placeholder="1000"
                  value={filters.minFollowers}
                  onChange={(e) => handleFilterChange('minFollowers', e.target.value)}
                  className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear Filters
              </button>
              
              <div className="ml-auto flex items-center gap-2">
                <span className="text-sm text-gray-700">View:</span>
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1 text-sm ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    List
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-1 text-sm ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    Grid
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="text-red-600 text-lg font-medium mb-2">Error loading traders</div>
              <p className="text-gray-600">{error?.message || 'An error occurred'}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
              >
                Retry
              </button>
            </div>
          )}

          {/* Results */}
          {!loading && !error && (
            <>
              {/* Results Count */}
              <div className="mb-6">
                <p className="text-gray-600">
                  Showing {filteredTraders.length} traders
                  {filteredTraders.length !== (displayTraders || []).length && ` of ${(displayTraders || []).length} total`}
                </p>
              </div>

              {/* List View */}
              {viewMode === 'list' && (
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {[
                            { key: 'rank', label: 'Rank' },
                            { key: '', label: 'Trader' },
                            { key: 'totalPnL', label: 'Total P&L' },
                            { key: 'winRate', label: 'Win Rate' },
                            { key: 'totalTrades', label: 'Trades' },
                            { key: 'followersCount', label: 'Followers' },
                            { key: 'sharpeRatio', label: 'Sharpe' },
                            { key: '', label: 'Risk' },
                            { key: '', label: 'Action' },
                          ].map((header) => (
                            <th
                              key={header.key}
                              className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                                header.key ? 'cursor-pointer hover:bg-gray-100' : ''
                              }`}
                              onClick={header.key ? () => handleSort(header.key as SortField) : undefined}
                            >
                              <div className="flex items-center gap-1">
                                {header.label}
                                {header.key && sortField === header.key && (
                                  <svg className={`w-4 h-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredTraders.map((trader) => (
                          <tr key={trader.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              #{trader.rank}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="relative flex-shrink-0 h-10 w-10">
                                  <img
                                    className="h-10 w-10 rounded-full"
                                    src={trader.avatar || '/default-avatar.png'}
                                    alt={trader.username || 'Trader'}
                                    loading="lazy"
                                  />
                                  {trader.verified && (
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {trader.username || 'Anonymous'}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {formatAddress(trader.address)}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getPnLColor(trader.totalPnL)}`}>
                              {formatCurrency(trader.totalPnL)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatPercentage(trader.winRate, 1)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {trader.totalTrades.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {trader.followersCount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {trader.sharpeRatio.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(trader.riskScore)}`}>
                                {trader.riskScore}/10
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Link
                                href={`/trader/${trader.address}`}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                View Profile
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Grid View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTraders.map((trader) => (
                    <div key={trader.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="relative">
                            <img
                              className="h-12 w-12 rounded-full"
                              src={trader.avatar || '/default-avatar.png'}
                              alt={trader.username || 'Trader'}
                              loading="lazy"
                            />
                            {trader.verified && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="ml-3">
                            <h3 className="text-lg font-medium text-gray-900">
                              {trader.username || 'Anonymous'}
                            </h3>
                            <p className="text-sm text-gray-500">Rank #{trader.rank}</p>
                          </div>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(trader.riskScore)}`}>
                          Risk: {trader.riskScore}/10
                        </span>
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Total P&L:</span>
                          <span className={`font-semibold ${getPnLColor(trader.totalPnL)}`}>
                            {formatCurrency(trader.totalPnL)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Win Rate:</span>
                          <span className="font-semibold text-gray-900">
                            {formatPercentage(trader.winRate, 1)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Followers:</span>
                          <span className="font-semibold text-gray-900">
                            {trader.followersCount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Sharpe Ratio:</span>
                          <span className="font-semibold text-gray-900">
                            {trader.sharpeRatio.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      
                      <Link
                        href={`/trader/${trader.address}`}
                        className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-center transition-colors"
                      >
                        View Profile
                      </Link>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {filteredTraders.length === 0 && (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No traders found</h3>
                  <p className="mt-2 text-gray-600">Try adjusting your search or filter criteria.</p>
                  <button
                    onClick={clearFilters}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export const getServerSideProps: GetServerSideProps<LeaderboardPageProps> = async () => {
  // Pre-load initial traders data for faster initial render
  const initialTraders: Trader[] = Array.from({ length: 20 }, (_, i) => ({
    id: `initial-trader-${i + 1}`,
    address: `0x${Math.random().toString(16).substr(2, 40)}`,
    username: `Trader${i + 1}`,
    name: `Trader${i + 1}`,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
    verified: Math.random() > 0.7,
    isVerified: Math.random() > 0.7,
    rank: i + 1,
    totalPnL: (Math.random() - 0.3) * 100000,
    pnl: (Math.random() - 0.3) * 100000,
    roi: Math.random() * 40 + 50,
    totalReturn: Math.random() * 40 + 50,
    monthlyReturn: (Math.random() * 40 + 50) / 12,
    winRate: Math.random() * 40 + 50,
    totalTrades: Math.floor(Math.random() * 1000) + 100,
    followersCount: Math.floor(Math.random() * 5000),
    followers: Math.floor(Math.random() * 5000),
    copiedVolume: Math.random() * 500000,
    aum: Math.random() * 500000,
    riskScore: Math.floor(Math.random() * 10) + 1,
    sharpeRatio: Math.random() * 3,
    maxDrawdown: Math.random() * 30,
    avgHoldTime: Math.random() * 24,
    preferredPairs: ['BTC/USD', 'ETH/USD', 'SOL/USD'].slice(0, Math.floor(Math.random() * 3) + 1),
    strategy: ['DeFi Yield', 'Swing Trading', 'Arbitrage', 'Momentum', 'Mean Reversion'][i % 5],
    performance: Array.from({ length: 30 }, (_, j) => ({
      date: new Date(Date.now() - (29 - j) * 24 * 60 * 60 * 1000).toISOString(),
      pnl: Math.random() * 5000 - 2500,
      value: Math.random() * 100000 + 50000,
      cumulativeReturn: Math.random() * 50 - 25
    })),
    isFollowing: false,
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
  }));

  return {
    props: {
      initialTraders,
    },
  };
};

export default LeaderboardPage;