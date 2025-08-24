import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, CheckCircle, Copy } from 'lucide-react';
import { Trader, LeaderboardFilters } from '../types';
import { useTraders } from '../hooks/useTraders';
import { clsx } from 'clsx';

interface LeaderboardProps {
  onTraderClick?: (trader: Trader) => void;
  onCopyTrade?: (trader: Trader) => void;
}

const formatCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
};

const formatPercentage = (value: number): string => {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
};

export const Leaderboard: React.FC<LeaderboardProps> = ({ onTraderClick, onCopyTrade }) => {
  const [filters, setFilters] = useState<LeaderboardFilters>({
    timeframe: '30d',
    strategy: 'all',
    search: '',
    sortBy: 'pnl',
    sortOrder: 'desc'
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: traders, isLoading, error } = useTraders(filters);

  const paginatedTraders = useMemo(() => {
    if (!traders) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    return traders.slice(startIndex, startIndex + itemsPerPage);
  }, [traders, currentPage]);

  const totalPages = Math.ceil((traders?.length || 0) / itemsPerPage);

  const handleFilterChange = (key: keyof LeaderboardFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSort = (column: keyof Trader) => {
    setFilters(prev => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === 'desc' ? 'asc' : 'desc'
    }));
  };

  const getSortDirection = (column: keyof Trader) => {
    if (filters.sortBy !== column) return null;
    return filters.sortOrder;
  };

  const renderSortIcon = (column: keyof Trader) => {
    const direction = getSortDirection(column);
    if (direction === 'asc') {
      return <ChevronUp className="w-3 h-3 ml-1 text-gray-400" />;
    } else if (direction === 'desc') {
      return <ChevronDown className="w-3 h-3 ml-1 text-gray-400" />;
    }
    return <ChevronsUpDown className="w-3 h-3 ml-1 text-gray-400" />;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-10 text-center text-gray-500">
          <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"></div>
          Loading traders...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-10 text-center text-red-600">
          <div className="mb-2">⚠️</div>
          Failed to load traders. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-200 bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Trader Leaderboard</h2>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center md:gap-4">
          {/* Timeframe Filter */}
          <div className="flex gap-2 items-center">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Timeframe:
            </label>
            <select
              value={filters.timeframe}
              onChange={(e) => handleFilterChange('timeframe', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-700 min-w-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Filter by timeframe"
            >
              <option value="24h">24 Hours</option>
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
          
          {/* Strategy Filter */}
          <div className="flex gap-2 items-center">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Strategy:
            </label>
            <select
              value={filters.strategy}
              onChange={(e) => handleFilterChange('strategy', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-700 min-w-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Filter by strategy"
            >
              <option value="all">All Strategies</option>
              <option value="Momentum">Momentum</option>
              <option value="Arbitrage">Arbitrage</option>
              <option value="DeFi">DeFi</option>
              <option value="Swing">Swing Trading</option>
            </select>
          </div>
          
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search traders..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm min-w-[200px] md:min-w-[250px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Search traders"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Rank
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Trader
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:bg-gray-100"
                onClick={() => handleSort('pnl')}
                role="button"
                tabIndex={0}
                aria-label="Sort by PnL"
              >
                <div className="flex items-center">
                  PnL
                  {renderSortIcon('pnl')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:bg-gray-100"
                onClick={() => handleSort('roi')}
                role="button"
                tabIndex={0}
                aria-label="Sort by ROI"
              >
                <div className="flex items-center">
                  ROI
                  {renderSortIcon('roi')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:bg-gray-100"
                onClick={() => handleSort('winRate')}
                role="button"
                tabIndex={0}
                aria-label="Sort by Win Rate"
              >
                <div className="flex items-center">
                  Win Rate
                  {renderSortIcon('winRate')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:bg-gray-100"
                onClick={() => handleSort('sharpeRatio')}
                role="button"
                tabIndex={0}
                aria-label="Sort by Sharpe Ratio"
              >
                <div className="flex items-center">
                  Sharpe Ratio
                  {renderSortIcon('sharpeRatio')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:bg-gray-100"
                onClick={() => handleSort('followers')}
                role="button"
                tabIndex={0}
                aria-label="Sort by Followers"
              >
                <div className="flex items-center">
                  Followers
                  {renderSortIcon('followers')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:bg-gray-100"
                onClick={() => handleSort('aum')}
                role="button"
                tabIndex={0}
                aria-label="Sort by AUM"
              >
                <div className="flex items-center">
                  AUM
                  {renderSortIcon('aum')}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedTraders.map((trader, index) => (
              <tr
                key={trader.id}
                className={clsx(
                  'border-b border-gray-100 transition-colors duration-200',
                  onTraderClick && 'cursor-pointer hover:bg-gray-50'
                )}
                onClick={() => onTraderClick?.(trader)}
                role={onTraderClick ? "button" : undefined}
                tabIndex={onTraderClick ? 0 : undefined}
                aria-label={onTraderClick ? `View ${trader.name}'s profile` : undefined}
              >
                <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <img 
                      src={trader.avatar} 
                      alt={`${trader.name}'s avatar`}
                      className="w-8 h-8 rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/default-avatar.png';
                      }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <div className="font-medium text-gray-900">
                          {trader.name}
                        </div>
                        {trader.isVerified && (
                          <CheckCircle 
                            className="w-3 h-3 text-green-600" 
                            aria-label="Verified trader"
                            role="img" 
                          />
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {trader.strategy}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm whitespace-nowrap">
                  <div className={clsx(
                    'font-medium',
                    trader.pnl > 0 ? 'text-green-600' : trader.pnl < 0 ? 'text-red-600' : 'text-gray-900'
                  )}>
                    {formatCurrency(trader.pnl)}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm whitespace-nowrap">
                  <div className={clsx(
                    'font-medium',
                    trader.roi > 0 ? 'text-green-600' : trader.roi < 0 ? 'text-red-600' : 'text-gray-900'
                  )}>
                    {formatPercentage(trader.roi)}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm font-medium text-gray-700 whitespace-nowrap">
                  {trader.winRate.toFixed(1)}%
                </td>
                <td className="px-4 py-4 text-sm font-medium text-gray-700 whitespace-nowrap">
                  {trader.sharpeRatio.toFixed(2)}
                </td>
                <td className="px-4 py-4 text-sm font-medium text-gray-700 whitespace-nowrap">
                  {trader.followers.toLocaleString()}
                </td>
                <td className="px-4 py-4 text-sm font-medium text-gray-700 whitespace-nowrap">
                  {formatCurrency(trader.aum)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCopyTrade?.(trader);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                    aria-label={`Copy trade ${trader.name}`}
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center px-5 py-4 border-t border-gray-200 bg-gray-50">
        <span className="text-sm text-gray-500">
          Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, traders?.length || 0)} of {traders?.length || 0} traders
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            aria-label="Previous page"
          >
            Previous
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const page = i + 1;
            const isActive = page === currentPage;
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={clsx(
                  'px-3 py-2 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
                  isActive 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                )}
                aria-label={`Go to page ${page}`}
              >
                {page}
              </button>
            );
          })}
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};