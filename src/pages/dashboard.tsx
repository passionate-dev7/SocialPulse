import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { formatCurrency, formatPercentage, formatTimeAgo, getPnLColor } from '../utils/format';
import type { Portfolio, Position, FollowedTrader, Trade } from '../types';

const DashboardPage: React.FC = () => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [recentActivity, setRecentActivity] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'positions' | 'following' | 'activity'>('overview');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Mock API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock portfolio data
        const mockPositions: Position[] = [
          {
            coin: 'BTC',
            side: 'long',
            size: 15000,
            entryPrice: 67500,
            markPrice: 69200,
            unrealizedPnl: 378.5,
            leverage: 3,
            liquidationPrice: 45000,
            margin: 5000,
            marginRatio: 0.072,
            openedAt: new Date().toISOString(),
          },
          {
            coin: 'ETH',
            side: 'short',
            size: 8000,
            entryPrice: 3750,
            markPrice: 3680,
            unrealizedPnl: 149.33,
            leverage: 2,
            liquidationPrice: 7500,
            margin: 4000,
            marginRatio: 0.533,
            openedAt: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            coin: 'SOL',
            side: 'long',
            size: 5000,
            entryPrice: 185,
            markPrice: 178,
            unrealizedPnl: -189.19,
            leverage: 5,
            liquidationPrice: 148,
            margin: 1000,
            marginRatio: 0.158,
            openedAt: new Date(Date.now() - 7200000).toISOString(),
          },
        ];

        const mockFollowedTraders: FollowedTrader[] = [
          {
            trader: {
              id: 'trader-1',
              address: '0x742d35Cc6634C0532925a3b8D82C9432E2',
              name: 'CryptoMaster',
              username: 'CryptoMaster',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
              isVerified: true,
              verified: true,
              rank: 3,
              pnl: 145000,
              totalPnL: 145000,
              roi: 45.2,
              totalReturn: 45.2,
              monthlyReturn: 3.8,
              winRate: 73.5,
              totalTrades: 1245,
              followers: 8900,
              followersCount: 8900,
              copiedVolume: 2400000,
              aum: 2400000,
              riskScore: 4,
              sharpeRatio: 2.8,
              maxDrawdown: 12.5,
              avgHoldTime: 18.5,
              preferredPairs: ['BTC/USD', 'ETH/USD'],
              strategy: 'Momentum',
              performance: [],
              isFollowing: true,
              createdAt: new Date('2023-01-15'),
              lastActive: new Date(),
            },
            allocatedAmount: 10000,
            copyRatio: 0.8,
            totalCopied: 25000,
            totalPnL: 1850,
            followedAt: new Date('2024-01-10'),
            active: true,
          },
          {
            trader: {
              id: 'trader-2',
              address: '0x892e47Dc8634C0532925a3b8D82C943BB4',
              name: 'DegenKing',
              username: 'DegenKing',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
              isVerified: false,
              verified: false,
              rank: 12,
              pnl: 89000,
              totalPnL: 89000,
              roi: 28.5,
              totalReturn: 28.5,
              monthlyReturn: 2.4,
              winRate: 68.2,
              totalTrades: 890,
              followers: 3400,
              followersCount: 3400,
              copiedVolume: 890000,
              aum: 890000,
              riskScore: 7,
              sharpeRatio: 2.1,
              maxDrawdown: 18.9,
              avgHoldTime: 8.2,
              preferredPairs: ['SOL/USD', 'AVAX/USD'],
              strategy: 'DeFi',
              performance: [],
              isFollowing: false,
              createdAt: new Date('2023-03-22'),
              lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
            },
            allocatedAmount: 5000,
            copyRatio: 0.5,
            totalCopied: 12000,
            totalPnL: -420,
            followedAt: new Date('2024-02-15'),
            active: true,
          },
        ];

        const mockPortfolio: Portfolio = {
          totalValue: 52847.32,
          totalPnL: 2847.32,
          totalPnLPercent: 5.69,
          positions: mockPositions,
          followedTraders: mockFollowedTraders,
        };

        const mockActivity: Trade[] = Array.from({ length: 10 }, (_, i) => {
          const pair = ['BTC/USD', 'ETH/USD', 'SOL/USD'][Math.floor(Math.random() * 3)];
          return {
            id: `activity-${i}`,
            traderId: mockFollowedTraders[Math.floor(Math.random() * 2)].trader.id,
            pair,
            asset: pair,
            side: Math.random() > 0.5 ? 'long' : 'short',
            entryPrice: Math.random() * 100000 + 1000,
            exitPrice: Math.random() > 0.5 ? Math.random() * 100000 + 1000 : undefined,
            size: Math.random() * 5000 + 100,
            pnl: Math.random() > 0.5 ? (Math.random() - 0.4) * 1000 : undefined,
            pnlPercent: Math.random() > 0.5 ? (Math.random() - 0.4) * 15 : undefined,
            leverage: Math.floor(Math.random() * 5) + 1,
            openedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
            closedAt: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000) : undefined,
            timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
            status: Math.random() > 0.5 ? 'closed' : 'open',
          };
        });

        setPortfolio(mockPortfolio);
        setRecentActivity(mockActivity);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Failed to load dashboard</h1>
          <p className="text-gray-600 mb-6">Please try refreshing the page.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Head>
        <title>Dashboard - SocialPulse</title>
        <meta 
          name="description" 
          content="Your personal trading dashboard. Monitor your portfolio, track copied trades, and manage your followed traders."
        />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://socialpulse.com/dashboard" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Monitor your portfolio and copy trading performance</p>
          </div>

          {/* Portfolio Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Total Portfolio Value</h3>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {formatCurrency(portfolio.totalValue)}
              </div>
              <div className={`text-sm ${getPnLColor(portfolio.totalPnL)}`}>
                {formatCurrency(portfolio.totalPnL)} ({formatPercentage(portfolio.totalPnLPercent)})
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Open Positions</h3>
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h2a2 2 0 002-2v-6a2 2 0 00-2-2h-2a2 2 0 00-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {portfolio.positions.length}
              </div>
              <div className="text-sm text-gray-600">
                Active trades
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Followed Traders</h3>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {portfolio.followedTraders.filter(ft => ft.active).length}
              </div>
              <div className="text-sm text-gray-600">
                Active copying
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow-sm border mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                {[
                  { key: 'overview', label: 'Overview', icon: '📊' },
                  { key: 'positions', label: 'Positions', icon: '📈' },
                  { key: 'following', label: 'Following', icon: '👥' },
                  { key: 'activity', label: 'Activity', icon: '🔄' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex items-center gap-2 py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Quick Actions */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Link
                        href="/leaderboard"
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                      >
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h2a2 2 0 002-2v-6a2 2 0 00-2-2h-2a2 2 0 00-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Browse Traders</div>
                          <div className="text-sm text-gray-600">Find new traders to follow</div>
                        </div>
                      </Link>
                      
                      <Link
                        href="/settings"
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Settings</div>
                          <div className="text-sm text-gray-600">Manage your account</div>
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Performance Chart Placeholder */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Performance</h3>
                    <div className="bg-gray-100 rounded-lg p-8 text-center">
                      <div className="text-gray-500 text-4xl mb-4">📈</div>
                      <p className="text-gray-600">Performance chart coming soon</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Positions Tab */}
              {activeTab === 'positions' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Open Positions</h3>
                    <span className="text-sm text-gray-600">
                      {portfolio.positions.length} active position{portfolio.positions.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
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
                            Current Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            P&L
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Leverage
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {portfolio.positions.map((position) => (
                          <tr key={position.coin}>
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                              {position.coin}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                position.side === 'long' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {position.side.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(position.size)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${position.entryPrice.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${position.markPrice.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className={getPnLColor(position.unrealizedPnl)}>
                                <div className="font-medium">{formatCurrency(position.unrealizedPnl)}</div>
                                <div className="text-xs">({formatPercentage((position.unrealizedPnl / (position.size * position.entryPrice)) * 100)})</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {position.leverage}x
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Following Tab */}
              {activeTab === 'following' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Followed Traders</h3>
                    <Link
                      href="/leaderboard"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm"
                    >
                      Find More Traders
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {portfolio.followedTraders.map((followedTrader) => (
                      <div key={followedTrader.trader.id} className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="relative">
                              <img
                                className="h-12 w-12 rounded-full"
                                src={followedTrader.trader.avatar || '/default-avatar.png'}
                                alt={followedTrader.trader.username}
                              />
                              {followedTrader.trader.verified && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="ml-3">
                              <Link
                                href={`/trader/${followedTrader.trader.address}`}
                                className="text-lg font-medium text-gray-900 hover:text-blue-600"
                              >
                                {followedTrader.trader.username}
                              </Link>
                              <p className="text-sm text-gray-500">Rank #{followedTrader.trader.rank}</p>
                            </div>
                          </div>
                          <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            followedTrader.active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {followedTrader.active ? 'Active' : 'Paused'}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="text-sm text-gray-600">Allocated</div>
                            <div className="font-medium">{formatCurrency(followedTrader.allocatedAmount)}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Copy Ratio</div>
                            <div className="font-medium">{formatPercentage(followedTrader.copyRatio * 100)}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Total Copied</div>
                            <div className="font-medium">{formatCurrency(followedTrader.totalCopied)}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">P&L</div>
                            <div className={`font-medium ${getPnLColor(followedTrader.totalPnL)}`}>
                              {formatCurrency(followedTrader.totalPnL)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded text-sm">
                            {followedTrader.active ? 'Pause' : 'Resume'}
                          </button>
                          <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-sm">
                            Adjust Settings
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Activity Tab */}
              {activeTab === 'activity' && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                    <p className="text-sm text-gray-600">Your copy trading activity from the last 24 hours</p>
                  </div>
                  
                  <div className="space-y-4">
                    {recentActivity.map((trade) => (
                      <div key={trade.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              trade.side === 'long' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {trade.side.toUpperCase()}
                            </span>
                            <span className="font-medium">{trade.pair}</span>
                            <span className="text-sm text-gray-600">
                              {formatCurrency(trade.size)} @ ${trade.entryPrice.toFixed(2)}
                            </span>
                          </div>
                          <div className="text-right">
                            {trade.pnl && (
                              <div className={`font-medium ${getPnLColor(trade.pnl)}`}>
                                {formatCurrency(trade.pnl)}
                              </div>
                            )}
                            <div className="text-sm text-gray-500">
                              {trade.openedAt ? formatTimeAgo(trade.openedAt) : 'Unknown'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Copied from: {
                            portfolio.followedTraders.find(ft => ft.trader.id === trade.traderId)?.trader.username || 'Unknown'
                          }</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            trade.status === 'open'
                              ? 'bg-blue-100 text-blue-800'
                              : trade.status === 'closed'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {trade.status}
                          </span>
                        </div>
                      </div>
                    ))}
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

export default DashboardPage;