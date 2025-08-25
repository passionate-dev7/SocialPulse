import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import SwapInterface from '@/components/SwapInterface';
import { gluexService } from '@/services/gluex';

interface SwapPageProps {
  supportedChains: number[];
}

const SwapPage: React.FC<SwapPageProps> = ({ supportedChains }) => {
  // In a real app, you would get these from wallet connection
  const userAddress = '0x0000000000000000000000000000000000000000';
  const chainId = 1; // Ethereum mainnet

  return (
    <>
      <Head>
        <title>Swap | SocialPulse</title>
        <meta name="description" content="Swap tokens efficiently with GlueX Router" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Token Swap</h1>
            <p className="text-gray-600">
              Powered by GlueX Router for optimal execution across DeFi protocols
            </p>
          </div>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-8 justify-center items-start">
            {/* Swap Interface */}
            <div className="flex justify-center">
              <SwapInterface userAddress={userAddress} chainId={chainId} />
            </div>

            {/* Info Panel */}
            <div className="max-w-md">
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Why use GlueX Router?</h2>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <div>
                      <p className="font-medium">Best Execution</p>
                      <p className="text-sm text-gray-600">Optimized routing across multiple DEXs</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <div>
                      <p className="font-medium">MEV Protection</p>
                      <p className="text-sm text-gray-600">Protected against front-running attacks</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <div>
                      <p className="font-medium">Surge Protection</p>
                      <p className="text-sm text-gray-600">Prevents trades during extreme volatility</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <div>
                      <p className="font-medium">Positive Slippage</p>
                      <p className="text-sm text-gray-600">You keep any positive price improvements</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Supported Features</h2>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Multi-chain Support</span>
                    <span className="text-green-600 font-medium">Active</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Buy Orders</span>
                    <span className="text-green-600 font-medium">Active</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Partial Fill</span>
                    <span className="text-green-600 font-medium">Active</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Average Response Time</span>
                    <span className="font-medium">~500ms</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Routing Fee</span>
                    <span className="font-medium">0%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Swaps Section */}
          <div className="mt-12 max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Swaps</h2>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      From
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {/* Mock data for demonstration */}
                  {[
                    {
                      time: '2 min ago',
                      from: 'ETH',
                      to: 'USDC',
                      amount: '2.5 ETH',
                      status: 'success'
                    },
                    {
                      time: '5 min ago',
                      from: 'USDC',
                      to: 'DAI',
                      amount: '1,000 USDC',
                      status: 'success'
                    },
                    {
                      time: '12 min ago',
                      from: 'WBTC',
                      to: 'ETH',
                      amount: '0.1 WBTC',
                      status: 'success'
                    }
                  ].map((swap, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {swap.time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {swap.from}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {swap.to}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {swap.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {swap.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<SwapPageProps> = async () => {
  try {
    // Fetch supported chains (in production, this would be cached)
    const supportedChains = [1, 56, 137, 42161]; // Example: Ethereum, BSC, Polygon, Arbitrum
    
    return {
      props: {
        supportedChains,
      },
    };
  } catch (error) {
    console.error('Error fetching swap data:', error);
    return {
      props: {
        supportedChains: [1], // Default to Ethereum
      },
    };
  }
};

export default SwapPage;