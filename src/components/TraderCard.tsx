import React from 'react';
import { CheckCircle2, TrendingUp, Users } from 'lucide-react';
import { Trader } from '../types';
import { useFollowTrader, useUnfollowTrader } from '../hooks/useTraders';

interface TraderCardProps {
  trader: Trader;
  onCopyTrade?: (trader: Trader) => void;
}

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
};

const formatPercentage = (value: number) => {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
};

export const TraderCard: React.FC<TraderCardProps> = ({ trader, onCopyTrade }) => {
  const { followTrader } = useFollowTrader();
  const { unfollowTrader } = useUnfollowTrader();

  const handleFollowClick = () => {
    if (trader.isFollowing) {
      unfollowTrader(trader.id);
    } else {
      followTrader(trader.id);
    }
  };

  const handleCopyTradeClick = () => {
    onCopyTrade?.(trader);
  };

  // Generate mini chart data from performance
  const chartData = trader.performance.slice(-7).map(p => p.pnl);
  const maxPnl = Math.max(...chartData);
  const minPnl = Math.min(...chartData);
  const range = maxPnl - minPnl;

  return (
    <div 
      className="bg-white rounded-xl p-5 md:p-4 shadow-lg border border-gray-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
      role="article" 
      aria-label={`Trader card for ${trader.name}`}
    >
      {/* Header */}
      <div className="flex items-center mb-4">
        <img 
          src={trader.avatar} 
          alt={`${trader.name}'s avatar`}
          className="w-12 h-12 rounded-full mr-3 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/default-avatar.png';
          }}
        />
        <div className="flex-1">
          <h3 className="m-0 text-lg font-semibold text-gray-900 flex items-center gap-2">
            {trader.name}
            {trader.isVerified && (
              <div title="Verified trader">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
            )}
          </h3>
          <p className="mt-1 mb-0 text-sm text-gray-500 flex items-center gap-1">
            <Users className="w-3 h-3" />
            {trader.followers.toLocaleString()} followers
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1 font-medium">PnL</div>
          <div className={`text-base font-semibold ${
            trader.pnl > 0 ? 'text-emerald-600' : trader.pnl < 0 ? 'text-red-600' : 'text-gray-900'
          }`}>
            {formatCurrency(trader.pnl)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1 font-medium">ROI</div>
          <div className={`text-base font-semibold ${
            trader.roi > 0 ? 'text-emerald-600' : trader.roi < 0 ? 'text-red-600' : 'text-gray-900'
          }`}>
            {formatPercentage(trader.roi)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1 font-medium">Win Rate</div>
          <div className="text-base font-semibold text-gray-900">{trader.winRate.toFixed(1)}%</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1 font-medium">Sharpe Ratio</div>
          <div className="text-base font-semibold text-gray-900">{trader.sharpeRatio.toFixed(2)}</div>
        </div>
      </div>

      {/* Mini Chart */}
      <div 
        className="h-15 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg my-4 flex items-end p-2 relative overflow-hidden"
        aria-label="Performance chart"
      >
        {chartData.map((value, index) => {
          const height = range > 0 ? ((value - minPnl) / range) * 100 : 50;
          return (
            <div
              key={index}
              className="flex-1 bg-white bg-opacity-30 mx-px rounded-sm transition-all duration-300 ease-out"
              style={{ height: `${height}%` }}
              title={`Day ${index + 1}: ${formatCurrency(value)}`}
            />
          );
        })}
      </div>

      {/* Strategy Info */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 font-medium">
          AUM: {formatCurrency(trader.aum)} • Strategy: {trader.strategy}
        </div>
      </div>

      {/* Button Group */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleFollowClick}
          disabled={false}
          aria-label={trader.isFollowing ? 'Unfollow trader' : 'Follow trader'}
          className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-300 bg-gray-50 text-gray-700 transition-all duration-200 hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {trader.isFollowing ? 'Unfollow' : 'Follow'}
        </button>
        <button
          onClick={handleCopyTradeClick}
          aria-label="Copy trade this trader"
          className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white transition-all duration-200 hover:bg-blue-700 flex items-center justify-center gap-1"
        >
          <TrendingUp className="w-4 h-4" />
          Copy Trade
        </button>
      </div>
    </div>
  );
};