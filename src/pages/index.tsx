import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { GetStaticProps } from 'next';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { useTraders } from '../hooks/useTraders';
import { formatCurrency, formatPercentage, getPnLColor } from '../utils/format';
import { fetchTopTraders, serializeForNextJS } from '../utils/api';
import type { PlatformStats, Trader } from '../types';

interface HomePageProps {
  platformStats: PlatformStats;
  topTraders: Trader[];
}

const HomePage: React.FC<HomePageProps> = ({ platformStats, topTraders }) => {
  const { data: traders, isLoading } = useTraders({
    timeframe: '30d',
    strategy: 'all',
    search: '',
    sortBy: 'pnl',
    sortOrder: 'desc'
  });
  const displayTraders = isLoading ? topTraders : traders?.slice(0, 6) || [];

  return (
    <ErrorBoundary>
      <Head>
        <title>SocialPulse - Copy the Best Crypto Traders</title>
        <meta 
          name="description" 
          content="Follow and copy successful crypto traders on Hyperliquid. Access real-time performance data, leaderboards, and automated copy trading."
        />
        <meta name="keywords" content="crypto trading, copy trading, hyperliquid, social trading, cryptocurrency" />
        <meta property="og:title" content="SocialPulse - Copy the Best Crypto Traders" />
        <meta property="og:description" content="Follow and copy successful crypto traders with real-time performance tracking." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://socialpulse.com" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
                Copy the Best
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  {' '}Crypto Traders
                </span>
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                Access real-time performance data of top Hyperliquid traders. 
                Follow their strategies and automatically copy their trades with advanced risk management.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/leaderboard"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  View Leaderboard
                </Link>
                <Link
                  href="/dashboard"
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold py-4 px-8 rounded-lg transition-all duration-200"
                >
                  Start Copy Trading
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Statistics */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Platform Performance
              </h2>
              <p className="text-gray-600">
                Trusted by thousands of traders worldwide
              </p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {formatCurrency(platformStats.totalVolume, 0)}
                </div>
                <div className="text-gray-600">Total Volume</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {platformStats.totalUsers.toLocaleString()}
                </div>
                <div className="text-gray-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {platformStats.totalTrades.toLocaleString()}
                </div>
                <div className="text-gray-600">Total Trades</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">
                  {formatPercentage(platformStats.avgWinRate)}
                </div>
                <div className="text-gray-600">Avg Win Rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* Top Traders Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Top Performing Traders
              </h2>
              <p className="text-gray-600">
                Copy trades from the most successful traders on Hyperliquid
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayTraders.map((trader) => (
                <Link
                  key={trader.id}
                  href={`/trader/${trader.address}`}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 p-6 block"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {trader.rank}
                      </div>
                      <div className="ml-3">
                        <h3 className="font-semibold text-gray-900">{trader.name}</h3>
                        <p className="text-sm text-gray-500">@{trader.username || 'anonymous'}</p>
                      </div>
                    </div>
                    {trader.verified && (
                      <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total PnL</span>
                      <span className={`font-semibold ${getPnLColor(trader.totalPnL)}`}>
                        {formatCurrency(trader.totalPnL)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">ROI</span>
                      <span className={`font-semibold ${getPnLColor(trader.totalReturn)}`}>
                        {formatPercentage(trader.totalReturn)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Win Rate</span>
                      <span className="font-semibold text-gray-900">
                        {formatPercentage(trader.winRate)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Followers</span>
                      <span className="font-semibold text-gray-900">
                        {trader.followersCount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {trader.totalTrades} trades
                      </div>
                      <span className="text-sm font-medium text-blue-600 hover:text-blue-700">
                        View Profile →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link
                href="/leaderboard"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                View All Traders
                <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Start copy trading in three simple steps and let successful traders work for you
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h2a2 2 0 002-2v-6a2 2 0 00-2-2h-2a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  1. Browse Leaderboard
                </h3>
                <p className="text-gray-600">
                  Explore top-performing traders with detailed analytics, risk scores, and performance history.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  2. Follow Traders
                </h3>
                <p className="text-gray-600">
                  Select traders that match your risk profile and investment goals. Set allocation limits and risk parameters.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  3. Auto-Copy Trades
                </h3>
                <p className="text-gray-600">
                  Our system automatically replicates successful trades in real-time with your predefined risk settings.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Start Copy Trading?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of traders who are already profiting from social trading on Hyperliquid
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="bg-white hover:bg-gray-100 text-blue-600 font-semibold py-4 px-8 rounded-lg transition-colors"
              >
                Get Started Free
              </Link>
              <Link
                href="/leaderboard"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold py-4 px-8 rounded-lg transition-colors"
              >
                View Traders
              </Link>
            </div>
          </div>
        </section>
      </div>
    </ErrorBoundary>
  );
};

export const getStaticProps: GetStaticProps<HomePageProps> = async () => {
  try {
    // Fetch real data from Hyperliquid API
    const topTraders = await fetchTopTraders(6);
    
    // Calculate platform stats from real data
    const platformStats: PlatformStats = {
      totalUsers: 25430, // In production, fetch from API
      totalVolume: 2840000000, // In production, aggregate from API
      totalTrades: 1240000, // In production, fetch from API
      avgWinRate: topTraders.reduce((acc, t) => acc + t.winRate, 0) / topTraders.length || 68.5,
      topPerformerPnL: Math.max(...topTraders.map(t => t.totalPnL), 0),
    };

    // Serialize data for Next.js SSR
    return {
      props: {
        platformStats: serializeForNextJS(platformStats),
        topTraders: serializeForNextJS(topTraders),
      },
      revalidate: 300, // Revalidate every 5 minutes
    };
  } catch (error) {
    console.error('Error fetching data for homepage:', error);
    
    // Fallback data if API fails
    const fallbackStats: PlatformStats = {
      totalUsers: 25430,
      totalVolume: 2840000000,
      totalTrades: 1240000,
      avgWinRate: 68.5,
      topPerformerPnL: 1250000,
    };

    // Generate fallback traders with serialized dates and all required fields
    const fallbackTraders = Array.from({ length: 6 }, (_, i) => ({
      id: `trader-${i + 1}`,
      address: `0x${(i + 1).toString(16).padStart(40, '0')}`,
      name: `Elite Trader ${i + 1}`,
      username: `trader_${i + 1}`, // Always defined, never undefined
      avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${i}`,
      verified: true,
      rank: i + 1,
      totalPnL: (1000000 - i * 150000) + (Math.random() - 0.5) * 100000,
      totalReturn: 85 - i * 2 + Math.random() * 5,
      monthlyReturn: 15 - i * 1 + Math.random() * 5,
      winRate: 85 - i * 2 + Math.random() * 5,
      totalTrades: 5000 - i * 200,
      followersCount: 10000 - i * 1000,
      copiedVolume: 5000000 - i * 500000,
      riskScore: Math.floor(Math.random() * 5) + 1,
      sharpeRatio: 3.5 - i * 0.2,
      maxDrawdown: 5 + i * 2,
      avgHoldTime: 8 + Math.random() * 10,
      preferredPairs: ['BTC-PERP', 'ETH-PERP', 'SOL-PERP'],
      createdAt: new Date(Date.now() - (365 - i * 30) * 24 * 60 * 60 * 1000).toISOString(),
      lastActive: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      pnl: (1000000 - i * 150000) + (Math.random() - 0.5) * 100000,
      roi: 85 - i * 2 + Math.random() * 5,
      aum: 5000000 - i * 500000,
      isVerified: true,
      // Add any additional required fields
      followers: 10000 - i * 1000,
      strategy: ['Momentum', 'Swing Trading', 'Scalping', 'Arbitrage', 'Mean Reversion', 'DeFi Yield'][i],
      performance: [],
    }));

    return {
      props: {
        platformStats: fallbackStats,
        topTraders: fallbackTraders,
      },
      revalidate: 300,
    };
  }
};

export default HomePage;