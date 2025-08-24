import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { ErrorBoundary } from '../../components/ui/ErrorBoundary';
import { LoadingSpinner, PageLoader } from '../../components/ui/LoadingSpinner';
import { formatCurrency, formatPercentage, formatAddress, formatTimeAgo, getPnLColor, getRiskColor } from '../../utils/format';
import type { Trader, Trade } from '../../types';

interface TraderProfilePageProps {
  trader: Trader | null;
  recentTrades: Trade[];
}

const TraderProfilePage: React.FC<TraderProfilePageProps> = ({ trader: initialTrader, recentTrades: initialTrades }) => {
  const router = useRouter();
  const { address } = router.query;
  
  const [trader, setTrader] = useState(initialTrader);
  const [recentTrades, setRecentTrades] = useState(initialTrades);
  const [isFollowing, setIsFollowing] = useState(false);
  const [copyAmount, setCopyAmount] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'trades' | 'stats' | 'social'>('overview');
  const [loading, setLoading] = useState(false);

  if (router.isFallback || !trader) {
    return <PageLoader />;
  }

  const handleFollow = async () => {
    setLoading(true);
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsFollowing(!isFollowing);
    setLoading(false);
  };

  const handleCopyTrade = async () => {
    if (!copyAmount) return;
    
    setLoading(true);
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    alert(`Started copying trades with $${copyAmount} allocation!`);
    setLoading(false);
  };

  const performanceData = {
    '7d': { pnl: trader.totalPnL * 0.1, change: 12.5 },
    '30d': { pnl: trader.totalPnL * 0.4, change: 8.3 },
    '90d': { pnl: trader.totalPnL * 0.7, change: 15.2 },
    '1y': { pnl: trader.totalPnL, change: 42.8 },
  };

  return (
    <ErrorBoundary>
      <Head>
        <title>{trader.username || 'Trader'} Profile - SocialPulse</title>
        <meta 
          name="description" 
          content={`View ${trader.username || 'trader'}'s performance on Hyperliquid. ${formatPercentage(trader.winRate, 1)} win rate, ${formatCurrency(trader.totalPnL)} total P&L.`}
        />
        <meta name="keywords" content={`${trader.username}, crypto trader, hyperliquid, copy trading, performance`} />
        <meta property="og:title" content={`${trader.username || 'Trader'} Profile - SocialPulse`} />
        <meta property="og:description" content={`Follow this successful crypto trader with ${formatPercentage(trader.winRate, 1)} win rate.`} />
        <link rel="canonical" href={`https://socialpulse.com/trader/${address}`} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Breadcrumb */}
          <nav className="flex mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link href="/" className="text-gray-500 hover:text-gray-700">
                  Home
                </Link>
              </li>
              <li>
                <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li>
                <Link href="/leaderboard" className="text-gray-500 hover:text-gray-700">
                  Leaderboard
                </Link>
              </li>
              <li>
                <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li className="text-gray-900 font-medium">
                {trader.username || formatAddress(trader.address)}
              </li>
            </ol>
          </nav>

          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center mb-6 lg:mb-0">
                <div className="relative">
                  <img
                    className="h-24 w-24 rounded-full"
                    src={trader.avatar || '/default-avatar.png'}
                    alt={trader.username || 'Trader'}
                  />
                  {trader.verified && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="ml-6">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {trader.username || 'Anonymous Trader'}
                    </h1>
                    <span className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
                      Rank #{trader.rank}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{formatAddress(trader.address)}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Joined {formatTimeAgo(new Date(trader.createdAt))}</span>
                    <span>•</span>
                    <span>Last active {formatTimeAgo(new Date(trader.lastActive))}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {trader.followersCount.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Followers</div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleFollow}
                    disabled={loading}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      isFollowing 
                        ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    } disabled:opacity-50`}
                  >
                    {loading && <LoadingSpinner size="sm" className="mr-2" />}
                    {isFollowing ? 'Following' : 'Follow Trader'}
                  </button>
                  
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Amount ($)"
                      value={copyAmount}
                      onChange={(e) => setCopyAmount(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleCopyTrade}
                      disabled={!copyAmount || loading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="text-sm text-gray-600 mb-1">Total P&L</div>
              <div className={`text-2xl font-bold ${getPnLColor(trader.totalPnL)}`}>
                {formatCurrency(trader.totalPnL)}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="text-sm text-gray-600 mb-1">Win Rate</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatPercentage(trader.winRate, 1)}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="text-sm text-gray-600 mb-1">Total Trades</div>
              <div className="text-2xl font-bold text-gray-900">
                {trader.totalTrades.toLocaleString()}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="text-sm text-gray-600 mb-1">Sharpe Ratio</div>
              <div className="text-2xl font-bold text-gray-900">
                {trader.sharpeRatio.toFixed(2)}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="text-sm text-gray-600 mb-1">Risk Score</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900">{trader.riskScore}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${getRiskColor(trader.riskScore)}`}>
                  /10
                </span>
              </div>
            </div>
          </div>

          {/* Performance Timeline */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Performance Timeline</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(performanceData).map(([period, data]) => (
                <div key={period} className="text-center">
                  <div className="text-lg font-bold text-gray-900 mb-1">
                    {period.toUpperCase()}
                  </div>
                  <div className={`text-xl font-semibold ${getPnLColor(data.pnl)} mb-1`}>
                    {formatCurrency(data.pnl)}
                  </div>
                  <div className={`text-sm ${getPnLColor(data.change)}`}>
                    {formatPercentage(data.change)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="bg-white rounded-lg shadow-sm border mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                {[
                  { key: 'overview', label: 'Overview' },
                  { key: 'trades', label: 'Recent Trades' },
                  { key: 'stats', label: 'Statistics' },
                  { key: 'social', label: 'Social Feed' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`py-4 px-8 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Trading Style</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Average Hold Time:</span>
                          <span className="font-medium">{trader.avgHoldTime.toFixed(1)} hours</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Max Drawdown:</span>
                          <span className="font-medium text-red-600">
                            -{formatPercentage(trader.maxDrawdown)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Preferred Pairs:</span>
                          <div className="flex gap-2">
                            {trader.preferredPairs.map((pair) => (
                              <span key={pair} className="bg-gray-100 px-2 py-1 text-xs rounded">
                                {pair}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Copy Trading</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Copied Volume:</span>
                          <span className="font-medium">{formatCurrency(trader.copiedVolume)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Active Copiers:</span>
                          <span className="font-medium">{Math.floor(trader.followersCount * 0.3).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Min Copy Amount:</span>
                          <span className="font-medium">$100</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Trades Tab */}
              {activeTab === 'trades' && (
                <div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Pair
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Side
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Size
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Entry Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            P&L
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Time
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {recentTrades.map((trade) => (
                          <tr key={trade.id}>
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                              {trade.pair}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                trade.side === 'long' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {trade.side.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(trade.size)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${trade.entryPrice.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {trade.pnl ? (
                                <span className={getPnLColor(trade.pnl)}>
                                  {formatCurrency(trade.pnl)} ({formatPercentage(trade.pnlPercent || 0)})
                                </span>
                              ) : (
                                <span className="text-gray-500">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                trade.status === 'open' 
                                  ? 'bg-blue-100 text-blue-800'
                                  : trade.status === 'closed'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {trade.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatTimeAgo(new Date(trade.openedAt))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Stats Tab */}
              {activeTab === 'stats' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Win Rate</span>
                        <span className="font-semibold">{formatPercentage(trader.winRate, 1)}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Profit Factor</span>
                        <span className="font-semibold">{(trader.winRate / (100 - trader.winRate) * 1.5).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Average Win</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(trader.totalPnL / trader.totalTrades * 2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Average Loss</span>
                        <span className="font-semibold text-red-600">
                          -{formatCurrency(Math.abs(trader.totalPnL / trader.totalTrades * 0.8))}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Analysis</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Max Drawdown</span>
                        <span className="font-semibold text-red-600">
                          -{formatPercentage(trader.maxDrawdown)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Sharpe Ratio</span>
                        <span className="font-semibold">{trader.sharpeRatio.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Volatility</span>
                        <span className="font-semibold">{(trader.maxDrawdown * 1.5).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Risk Score</span>
                        <span className={`font-semibold px-3 py-1 rounded-full text-sm ${getRiskColor(trader.riskScore)}`}>
                          {trader.riskScore}/10
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Social Tab */}
              {activeTab === 'social' && (
                <div className="space-y-6">
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">💬</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Social Feed Coming Soon</h3>
                    <p className="text-gray-600">
                      Follow this trader to see their updates, insights, and trading commentary.
                    </p>
                    <button
                      onClick={handleFollow}
                      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
                    >
                      {isFollowing ? 'Following' : 'Follow for Updates'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export const getServerSideProps: GetServerSideProps<TraderProfilePageProps> = async (context) => {
  const { address } = context.params!;
  
  try {
    // Try to fetch real data from API
    const { fetchUserTrades, serializeForNextJS } = await import('../../utils/api');
    
    // Generate trader data (in production, fetch from API)
    const trader: Trader = {
      id: `trader-${address}`,
      address: address as string,
      username: `Trader_${(address as string).slice(0, 6)}`,
      name: `Trader_${(address as string).slice(0, 6)}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`,
      verified: Math.random() > 0.5,
      isVerified: Math.random() > 0.5,
      rank: Math.floor(Math.random() * 100) + 1,
      totalPnL: (Math.random() - 0.2) * 500000,
      pnl: (Math.random() - 0.2) * 500000,
      roi: Math.random() * 30 + 60,
      totalReturn: Math.random() * 30 + 60,
      monthlyReturn: (Math.random() * 30 + 60) / 12,
      winRate: Math.random() * 30 + 60,
      totalTrades: Math.floor(Math.random() * 2000) + 500,
      followersCount: Math.floor(Math.random() * 10000) + 100,
      followers: Math.floor(Math.random() * 10000) + 100,
      copiedVolume: Math.random() * 1000000,
      aum: Math.random() * 1000000,
      riskScore: Math.floor(Math.random() * 10) + 1,
      sharpeRatio: Math.random() * 4,
      maxDrawdown: Math.random() * 25 + 5,
      avgHoldTime: Math.random() * 48 + 2,
      preferredPairs: ['BTC-PERP', 'ETH-PERP', 'SOL-PERP'],
      strategy: 'Swing Trading',
      performance: Array.from({ length: 30 }, (_, j) => ({
        date: new Date(Date.now() - (29 - j) * 24 * 60 * 60 * 1000).toISOString(),
        pnl: Math.random() * 5000 - 2500,
        value: Math.random() * 100000 + 50000,
        cumulativeReturn: Math.random() * 50 - 25
      })),
      isFollowing: false,
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(), // Serialize to string
      lastActive: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(), // Serialize to string
    };

    const recentTrades: Trade[] = Array.from({ length: 20 }, (_, i) => {
      const pair = ['BTC-PERP', 'ETH-PERP', 'SOL-PERP', 'AVAX-PERP'][Math.floor(Math.random() * 4)];
      return {
        id: `trade-${i}`,
        traderId: trader.id,
        pair,
        asset: pair,
        side: Math.random() > 0.5 ? 'long' : 'short',
        entryPrice: Math.random() * 100000 + 1000,
        exitPrice: Math.random() > 0.3 ? Math.random() * 100000 + 1000 : null,
        size: Math.random() * 10000 + 100,
        pnl: Math.random() > 0.3 ? (Math.random() - 0.4) * 5000 : null,
        pnlPercent: Math.random() > 0.3 ? (Math.random() - 0.4) * 20 : null,
        leverage: Math.floor(Math.random() * 10) + 1,
        openedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Serialize to string
        closedAt: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 6 * 24 * 60 * 60 * 1000).toISOString() : null, // Serialize to string
        timestamp: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
        status: Math.random() > 0.3 ? 'closed' : Math.random() > 0.1 ? 'open' : 'liquidated',
      };
    });

    return {
      props: {
        trader: serializeForNextJS(trader),
        recentTrades: serializeForNextJS(recentTrades),
      },
    };
  } catch (error) {
    console.error('Error fetching trader data:', error);
    return {
      props: {
        trader: null,
        recentTrades: [],
      },
    };
  }
};

export default TraderProfilePage;