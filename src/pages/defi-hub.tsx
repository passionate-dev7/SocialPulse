import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { 
  ChartBarIcon, 
  BanknotesIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
  SparklesIcon,
  BeakerIcon,
  ChartPieIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline';
import SwapInterface from '@/components/SwapInterface';
import { gluexService } from '@/services/gluex';

interface DeFiHubPageProps {
  analytics: {
    totalVolume: string;
    totalUsers: number;
    avgResponseTime: number;
    protocolsIntegrated: number;
  };
}

const DeFiHubPage: React.FC<DeFiHubPageProps> = ({ analytics }) => {
  const [activeTab, setActiveTab] = useState<'swap' | 'lend' | 'stake' | 'earn' | 'analytics'>('swap');
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  
  // Mock user address (in real app, from wallet connection)
  const userAddress = '0x0000000000000000000000000000000000000000';
  const chainId = 1;

  const strategies = [
    {
      id: 'yield-optimizer',
      name: 'Yield Optimizer',
      description: 'Automatically move funds to highest APY protocols',
      apy: '12.5%',
      risk: 'Medium',
      protocols: ['Aave', 'Compound', 'Yearn'],
      icon: ArrowTrendingUpIcon,
      color: 'blue'
    },
    {
      id: 'stable-farm',
      name: 'Stable Farming',
      description: 'Farm stablecoin yields across multiple protocols',
      apy: '8.2%',
      risk: 'Low',
      protocols: ['Curve', 'Convex', 'Balancer'],
      icon: ShieldCheckIcon,
      color: 'green'
    },
    {
      id: 'degen-mode',
      name: 'Degen Mode',
      description: 'High risk, high reward across new protocols',
      apy: '45.8%',
      risk: 'High',
      protocols: ['GMX', 'Gains', 'Vertex'],
      icon: SparklesIcon,
      color: 'purple'
    },
    {
      id: 'delta-neutral',
      name: 'Delta Neutral',
      description: 'Market neutral strategies with hedging',
      apy: '15.3%',
      risk: 'Low',
      protocols: ['dYdX', 'Perpetual', 'Drift'],
      icon: BeakerIcon,
      color: 'gray'
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'swap':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SwapInterface userAddress={userAddress} chainId={chainId} />
            
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Route Optimization</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Path Efficiency</span>
                      <span className="text-sm font-semibold text-green-600">98.5%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '98.5%' }}></div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium mb-2">Routing Path</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-1 bg-white rounded">USDC</span>
                      <span>→</span>
                      <span className="px-2 py-1 bg-white rounded">Uniswap V3</span>
                      <span>→</span>
                      <span className="px-2 py-1 bg-white rounded">Curve</span>
                      <span>→</span>
                      <span className="px-2 py-1 bg-white rounded">ETH</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">$0.85</p>
                      <p className="text-xs text-gray-600">Gas Saved</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">0.2%</p>
                      <p className="text-xs text-gray-600">Better Price</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">MEV Protection Active</h3>
                <p className="text-sm opacity-90 mb-4">
                  Your transaction is protected against sandwich attacks and front-running
                </p>
                <div className="flex items-center gap-4">
                  <ShieldCheckIcon className="h-8 w-8" />
                  <div>
                    <p className="text-2xl font-bold">$45.20</p>
                    <p className="text-xs opacity-75">Saved from MEV this month</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'lend':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-6">Lending Opportunities</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { protocol: 'Aave V3', asset: 'USDC', apy: '3.2%', ltv: '82.5%', available: '$2.5M' },
                  { protocol: 'Compound', asset: 'ETH', apy: '2.8%', ltv: '75%', available: '$8.3M' },
                  { protocol: 'Radiant', asset: 'ARB', apy: '8.5%', ltv: '65%', available: '$1.2M' },
                ].map((opportunity, idx) => (
                  <div key={idx} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold">{opportunity.protocol}</p>
                        <p className="text-sm text-gray-600">{opportunity.asset}</p>
                      </div>
                      <span className="text-2xl font-bold text-green-600">{opportunity.apy}</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Max LTV</span>
                        <span>{opportunity.ltv}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Available</span>
                        <span>{opportunity.available}</span>
                      </div>
                    </div>
                    <button className="w-full mt-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Supply
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Your Positions</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2">Protocol</th>
                      <th className="text-left py-2">Asset</th>
                      <th className="text-right py-2">Supplied</th>
                      <th className="text-right py-2">APY</th>
                      <th className="text-right py-2">Earned</th>
                      <th className="text-right py-2">Health</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3">Aave V3</td>
                      <td>USDC</td>
                      <td className="text-right">$10,000</td>
                      <td className="text-right text-green-600">3.2%</td>
                      <td className="text-right">$26.67</td>
                      <td className="text-right">
                        <span className="text-green-600">1.85</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'stake':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-6">Staking Opportunities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { token: 'ETH', validator: 'Lido', apy: '4.2%', tvl: '$15.2B', minStake: '0.01 ETH' },
                  { token: 'MATIC', validator: 'Polygon', apy: '5.8%', tvl: '$892M', minStake: '1 MATIC' },
                  { token: 'SOL', validator: 'Marinade', apy: '6.5%', tvl: '$425M', minStake: '0.1 SOL' },
                  { token: 'ATOM', validator: 'Cosmos Hub', apy: '18.2%', tvl: '$2.1B', minStake: '0.1 ATOM' },
                ].map((stake, idx) => (
                  <div key={idx} className="border rounded-lg p-5 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full"></div>
                        <div>
                          <p className="font-semibold">{stake.token}</p>
                          <p className="text-sm text-gray-600">{stake.validator}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">{stake.apy}</p>
                        <p className="text-xs text-gray-600">APY</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Staked</span>
                        <span className="font-medium">{stake.tvl}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Min Stake</span>
                        <span className="font-medium">{stake.minStake}</span>
                      </div>
                    </div>
                    <button className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity">
                      Stake Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'earn':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-6">Automated Yield Strategies</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {strategies.map((strategy) => {
                const Icon = strategy.icon;
                return (
                  <div 
                    key={strategy.id}
                    className={`bg-white rounded-xl shadow-lg p-6 border-2 transition-all cursor-pointer ${
                      selectedStrategy === strategy.id ? 'border-blue-500 shadow-xl' : 'border-transparent hover:border-gray-200'
                    }`}
                    onClick={() => setSelectedStrategy(strategy.id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg bg-${strategy.color}-100`}>
                          <Icon className={`h-6 w-6 text-${strategy.color}-600`} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">{strategy.name}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            strategy.risk === 'Low' ? 'bg-green-100 text-green-700' :
                            strategy.risk === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {strategy.risk} Risk
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-green-600">{strategy.apy}</p>
                        <p className="text-xs text-gray-600">APY</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">{strategy.description}</p>
                    
                    <div className="mb-4">
                      <p className="text-xs text-gray-600 mb-2">Protocols Used:</p>
                      <div className="flex gap-2">
                        {strategy.protocols.map((protocol) => (
                          <span key={protocol} className="text-xs px-2 py-1 bg-gray-100 rounded">
                            {protocol}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {selectedStrategy === strategy.id && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex gap-4 mb-4">
                          <input
                            type="number"
                            placeholder="Amount to invest"
                            className="flex-1 px-3 py-2 border rounded-lg"
                          />
                          <select className="px-3 py-2 border rounded-lg">
                            <option>USDC</option>
                            <option>USDT</option>
                            <option>DAI</option>
                          </select>
                        </div>
                        <button className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity">
                          Deploy Strategy
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-6 text-white">
              <h4 className="text-xl font-bold mb-4">AI-Powered Yield Optimization</h4>
              <p className="mb-4 opacity-90">
                GlueX automatically rebalances your positions across protocols to maximize yield while managing risk.
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-3xl font-bold">247</p>
                  <p className="text-sm opacity-75">Rebalances/Month</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">+3.2%</p>
                  <p className="text-sm opacity-75">Extra Yield</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">$892</p>
                  <p className="text-sm opacity-75">Gas Saved</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-600">Total Volume</p>
                  <ChartBarIcon className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold">{analytics.totalVolume}</p>
                <p className="text-sm text-green-600">+12.5% this week</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-600">Active Users</p>
                  <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold">{analytics.totalUsers.toLocaleString()}</p>
                <p className="text-sm text-green-600">+8.3% this week</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-600">Avg Response</p>
                  <BanknotesIcon className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-2xl font-bold">{analytics.avgResponseTime}ms</p>
                <p className="text-sm text-gray-600">Lightning fast</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-600">Protocols</p>
                  <ChartPieIcon className="h-5 w-5 text-orange-600" />
                </div>
                <p className="text-2xl font-bold">{analytics.protocolsIntegrated}</p>
                <p className="text-sm text-gray-600">Integrated</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-6">Protocol Distribution</h3>
              <div className="space-y-4">
                {[
                  { name: 'Uniswap V3', volume: '$2.8B', percentage: 35 },
                  { name: 'Curve', volume: '$1.9B', percentage: 24 },
                  { name: 'Balancer', volume: '$1.2B', percentage: 15 },
                  { name: 'SushiSwap', volume: '$980M', percentage: 12 },
                  { name: 'Others', volume: '$1.1B', percentage: 14 },
                ].map((protocol) => (
                  <div key={protocol.name}>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{protocol.name}</span>
                      <span className="text-sm text-gray-600">{protocol.volume}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                        style={{ width: `${protocol.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Gas Optimization</h3>
                <div className="text-center py-8">
                  <p className="text-5xl font-bold text-green-600 mb-2">$1.2M</p>
                  <p className="text-gray-600">Total Gas Saved This Month</p>
                  <p className="text-sm text-gray-500 mt-4">
                    Average saving per transaction: $3.45
                  </p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">MEV Protection Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sandwich Attacks Prevented</span>
                    <span className="font-bold">1,247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Front-runs Blocked</span>
                    <span className="font-bold">892</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Value Protected</span>
                    <span className="font-bold text-green-600">$458K</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>DeFi Hub | SocialPulse</title>
        <meta name="description" content="Advanced DeFi operations powered by GlueX Router" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              DeFi Super Hub
            </h1>
            <p className="text-gray-600">
              Powered by GlueX Router - Any token, Any protocol, Optimal execution
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-full shadow-lg p-1 inline-flex">
              {[
                { id: 'swap', label: 'Swap', icon: ArrowsUpDownIcon },
                { id: 'lend', label: 'Lend', icon: BanknotesIcon },
                { id: 'stake', label: 'Stake', icon: CurrencyDollarIcon },
                { id: 'earn', label: 'Earn', icon: ArrowTrendingUpIcon },
                { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>

          {/* Footer Stats */}
          <div className="mt-12 text-center text-sm text-gray-600">
            <p>
              Routing through {analytics.protocolsIntegrated}+ protocols • 
              {' '}{analytics.avgResponseTime}ms avg response • 
              {' '}0% routing fees • 
              {' '}MEV protected
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<DeFiHubPageProps> = async () => {
  // In production, these would come from the API
  const analytics = {
    totalVolume: '$12.8B',
    totalUsers: 45892,
    avgResponseTime: 487,
    protocolsIntegrated: 147,
  };

  return {
    props: {
      analytics,
    },
  };
};

export default DeFiHubPage;