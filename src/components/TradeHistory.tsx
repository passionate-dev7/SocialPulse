import React, { useState, useMemo } from 'react';
import { Download, Search, Filter, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Trade } from '../types';

interface TradeHistoryProps {
  trades: Trade[];
  traderId?: string;
  showTraderColumn?: boolean;
  onExport?: () => void;
}


const POPULAR_ASSETS = ['BTC', 'ETH', 'SOL', 'AVAX', 'MATIC', 'LINK', 'UNI', 'AAVE', 'DOT', 'ADA'];

// Mock data generator for demonstration
const generateMockTrades = (count: number): Trade[] => {
  const trades: Trade[] = [];
  
  for (let i = 0; i < count; i++) {
    const asset = POPULAR_ASSETS[Math.floor(Math.random() * POPULAR_ASSETS.length)];
    const side = Math.random() > 0.5 ? 'long' : 'short';
    const size = Math.random() * 1000 + 100;
    const entryPrice = Math.random() * 50000 + 1000;
    const isOpen = Math.random() > 0.7;
    const exitPrice = isOpen ? undefined : entryPrice * (0.8 + Math.random() * 0.4);
    const pnl = isOpen ? undefined : side === 'long' 
      ? (exitPrice! - entryPrice) * size 
      : (entryPrice - exitPrice!) * size;
    
    trades.push({
      id: `trade-${i}`,
      traderId: 'trader-1',
      pair: asset,
      asset,
      side,
      size,
      entryPrice,
      exitPrice,
      pnl,
      timestamp: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
      openedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: isOpen ? 'open' : 'closed'
    });
  }
  
  return trades.sort((a, b) => b.timestamp - a.timestamp);
};

const formatCurrency = (value: number, compact = false) => {
  if (compact && Math.abs(value) >= 1000) {
    if (Math.abs(value) >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatDate = (timestamp: number | string) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const TradeHistory: React.FC<TradeHistoryProps> = ({
  trades: propTrades,
  traderId,
  showTraderColumn = false,
  onExport
}) => {
  // Use mock data if no trades provided
  const allTrades = useMemo(() => 
    propTrades.length > 0 ? propTrades : generateMockTrades(50),
    [propTrades]
  );

  const [filters, setFilters] = useState({
    asset: 'all',
    side: 'all',
    status: 'all',
    pnl: 'all', // all, profit, loss
    search: ''
  });

  const filteredTrades = useMemo(() => {
    return allTrades.filter(trade => {
      if (traderId && trade.traderId !== traderId) return false;
      if (filters.asset !== 'all' && trade.asset !== filters.asset) return false;
      if (filters.side !== 'all' && trade.side !== filters.side) return false;
      if (filters.status !== 'all' && trade.status !== filters.status) return false;
      if (filters.pnl !== 'all') {
        if (filters.pnl === 'profit' && (trade.pnl || 0) <= 0) return false;
        if (filters.pnl === 'loss' && (trade.pnl || 0) >= 0) return false;
      }
      if (filters.search && !trade.asset.toLowerCase().includes(filters.search.toLowerCase())) return false;
      
      return true;
    });
  }, [allTrades, traderId, filters]);

  const summary = useMemo(() => {
    const closedTrades = filteredTrades.filter(t => t.status === 'closed' && t.pnl !== undefined);
    const totalPnL = closedTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const winningTrades = closedTrades.filter(t => (t.pnl || 0) > 0);
    const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;
    const totalVolume = filteredTrades.reduce((sum, trade) => sum + trade.size * trade.entryPrice, 0);
    
    return {
      totalTrades: filteredTrades.length,
      totalPnL,
      winRate,
      totalVolume
    };
  }, [filteredTrades]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleExport = () => {
    const csvContent = [
      ['Date', 'Asset', 'Side', 'Size', 'Entry Price', 'Exit Price', 'PnL', 'Status'].join(','),
      ...filteredTrades.map(trade => [
        formatDate(trade.timestamp),
        trade.asset,
        trade.side,
        trade.size.toFixed(2),
        trade.entryPrice.toFixed(2),
        trade.exitPrice?.toFixed(2) || '',
        trade.pnl?.toFixed(2) || '',
        trade.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trades_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    onExport?.();
  };

  const uniqueAssets = useMemo(() => {
    return Array.from(new Set(allTrades.map(t => t.asset))).sort();
  }, [allTrades]);

  const getStatusIcon = (status: 'open' | 'closed' | 'liquidated') => {
    switch (status) {
      case 'open':
        return <Clock className="w-3 h-3" />;
      case 'closed':
        return <CheckCircle className="w-3 h-3" />;
      case 'liquidated':
        return <XCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getSideIcon = (side: 'long' | 'short') => {
    return side === 'long' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-200 bg-gray-50">
        <h3 className="m-0 mb-4 text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" />
          Trade History
        </h3>
        <div className="flex flex-wrap justify-between items-center gap-3">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex gap-2 items-center">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Asset:</label>
              <select
                value={filters.asset}
                onChange={(e) => handleFilterChange('asset', e.target.value)}
                aria-label="Filter by asset"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-700 min-w-[120px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Assets</option>
                {uniqueAssets.map(asset => (
                  <option key={asset} value={asset}>{asset}</option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-2 items-center">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Side:</label>
              <select
                value={filters.side}
                onChange={(e) => handleFilterChange('side', e.target.value)}
                aria-label="Filter by side"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-700 min-w-[120px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Sides</option>
                <option value="long">Long</option>
                <option value="short">Short</option>
              </select>
            </div>
            
            <div className="flex gap-2 items-center">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Status:</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                aria-label="Filter by status"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-700 min-w-[120px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            
            <div className="flex gap-2 items-center">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">PnL:</label>
              <select
                value={filters.pnl}
                onChange={(e) => handleFilterChange('pnl', e.target.value)}
                aria-label="Filter by PnL"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-700 min-w-[120px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="profit">Profit</option>
                <option value="loss">Loss</option>
              </select>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search assets..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                aria-label="Search trades"
                className="pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm min-w-[150px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <button 
            onClick={handleExport} 
            aria-label="Export trades to CSV"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium bg-white text-gray-700 cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:border-gray-400 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        {filteredTrades.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No trades found matching your criteria.
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap border-b-2 border-gray-200">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap border-b-2 border-gray-200">Asset</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap border-b-2 border-gray-200">Side</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap border-b-2 border-gray-200">Size</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap border-b-2 border-gray-200">Entry Price</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap border-b-2 border-gray-200">Exit Price</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap border-b-2 border-gray-200">PnL</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap border-b-2 border-gray-200">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.map(trade => (
                <tr key={trade.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{formatDate(trade.timestamp)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                    <div className="flex items-center gap-2 font-medium">
                      {trade.asset}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium uppercase ${
                      trade.side === 'long' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {getSideIcon(trade.side)}
                      {trade.side}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{trade.size.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{formatCurrency(trade.entryPrice)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                    {trade.exitPrice ? formatCurrency(trade.exitPrice) : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    {trade.pnl !== undefined && trade.pnl !== null ? (
                      <span className={`font-medium ${
                        trade.pnl > 0 ? 'text-emerald-600' : trade.pnl < 0 ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {trade.pnl > 0 ? '+' : ''}{formatCurrency(trade.pnl)}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium capitalize ${
                      trade.status === 'open' ? 'bg-blue-100 text-blue-800' :
                      trade.status === 'liquidated' ? 'bg-red-100 text-red-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {getStatusIcon(trade.status)}
                      {trade.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary */}
      <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Total Trades</div>
          <div className="text-base font-semibold text-gray-900">{summary.totalTrades}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Total PnL</div>
          <div className={`text-base font-semibold ${
            summary.totalPnL > 0 ? 'text-emerald-600' : summary.totalPnL < 0 ? 'text-red-600' : 'text-gray-900'
          }`}>
            {summary.totalPnL > 0 ? '+' : ''}{formatCurrency(summary.totalPnL, true)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Win Rate</div>
          <div className="text-base font-semibold text-gray-900">{summary.winRate.toFixed(1)}%</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Total Volume</div>
          <div className="text-base font-semibold text-gray-900">{formatCurrency(summary.totalVolume, true)}</div>
        </div>
      </div>
    </div>
  );
};