// Example component demonstrating the usage of SocialPulse trading hooks
import React, { useState } from 'react';
import {
  useTopTraders,
  useTraderDetails,
  useFollowTrader,
  useUnfollowTrader,
  useIsFollowing,
  usePositions,
  useBalance,
  usePnL,
  useOrderBook,
  useCandles,
  useWebSocket,
  useCopyTrades,
} from '../hooks';

export const TradingDashboard: React.FC = () => {
  const [selectedTrader, setSelectedTrader] = useState<string | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<string>('BTC');

  // Trading hooks
  const { data: topTraders, isLoading: tradersLoading } = useTopTraders({
    timeframe: '24h'
  });
  
  const { data: traderDetails } = useTraderDetails(selectedTrader || '');
  
  const { data: positions, isConnected: positionsConnected } = usePositions();
  const { data: balance } = useBalance();
  const { data: pnl } = usePnL('30d');
  
  // Market data hooks
  const { data: orderBook, isConnected: orderBookConnected } = useOrderBook(selectedMarket, 10);
  const { data: candles } = useCandles(selectedMarket, '1h', 100);
  
  // Copy trading hooks
  const followTrader = useFollowTrader();
  const unfollowTrader = useUnfollowTrader();
  const { isFollowing } = useIsFollowing(selectedTrader || undefined);
  
  // WebSocket connection
  const { isConnected } = useWebSocket();
  
  // Copy trading real-time updates
  useCopyTrades();

  const handleFollowTrader = async (traderAddress: string) => {
    try {
      await followTrader.mutateAsync({
        traderAddress,
        settings: {
          maxPositionSize: 1000,
          riskPercentage: 2,
          maxLeverage: 10,
          enabled: true,
        },
      });
    } catch (error) {
      console.error('Failed to follow trader:', error);
    }
  };

  const handleUnfollowTrader = async (traderAddress: string) => {
    try {
      await unfollowTrader.mutateAsync(traderAddress);
    } catch (error) {
      console.error('Failed to unfollow trader:', error);
    }
  };

  return (
    <div className="trading-dashboard">
      {/* Connection Status */}
      <div className="status-bar">
        <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          WebSocket: {isConnected ? 'Connected' : 'Disconnected'}
        </span>
        <span className={`connection-status ${positionsConnected ? 'connected' : 'disconnected'}`}>
          Positions: {positionsConnected ? 'Live' : 'Offline'}
        </span>
        <span className={`connection-status ${orderBookConnected ? 'connected' : 'disconnected'}`}>
          Market Data: {orderBookConnected ? 'Live' : 'Offline'}
        </span>
      </div>

      <div className="dashboard-grid">
        {/* Portfolio Section */}
        <div className="portfolio-section">
          <h2>Portfolio</h2>
          
          {balance && (
            <div className="balance-card">
              <h3>Account Balance</h3>
              <p>Total: ${balance.total.toLocaleString()}</p>
              <p>Available: ${balance.available.toLocaleString()}</p>
              <p>P&L: ${balance.pnl.toLocaleString()}</p>
            </div>
          )}

          {pnl && (
            <div className="pnl-card">
              <h3>P&L (30 days)</h3>
              <p>Total: ${pnl.total.toLocaleString()}</p>
              <p>Realized: ${pnl.realized.toLocaleString()}</p>
              <p>Unrealized: ${pnl.unrealized.toLocaleString()}</p>
            </div>
          )}

          {positions && positions.length > 0 && (
            <div className="positions-card">
              <h3>Open Positions</h3>
              {positions.map((position) => (
                <div key={position.coin} className="position-item">
                  <span>{position.coin}</span>
                  <span className={position.side === 'long' ? 'long' : 'short'}>
                    {position.side.toUpperCase()}
                  </span>
                  <span>${position.size.toLocaleString()}</span>
                  <span className={position.unrealizedPnl >= 0 ? 'profit' : 'loss'}>
                    ${position.unrealizedPnl.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Traders Section */}
        <div className="traders-section">
          <h2>Top Traders</h2>
          
          {tradersLoading ? (
            <div>Loading traders...</div>
          ) : (
            <div className="traders-list">
              {topTraders?.map((trader: any) => (
                <div 
                  key={trader.address} 
                  className={`trader-item ${selectedTrader === trader.address ? 'selected' : ''}`}
                  onClick={() => setSelectedTrader(trader.address)}
                >
                  <div className="trader-info">
                    <h4>{trader.username || `${trader.address.slice(0, 8)}...`}</h4>
                    <p>Rank: #{trader.rank}</p>
                    <p>Win Rate: {(trader.winRate * 100).toFixed(1)}%</p>
                    <p>P&L: ${trader.pnl.toLocaleString()}</p>
                  </div>
                  
                  <div className="trader-actions">
                    {isFollowing ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnfollowTrader(trader.address);
                        }}
                        disabled={unfollowTrader.isPending}
                        className="unfollow-btn"
                      >
                        {unfollowTrader.isPending ? 'Unfollowing...' : 'Unfollow'}
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFollowTrader(trader.address);
                        }}
                        disabled={followTrader.isPending}
                        className="follow-btn"
                      >
                        {followTrader.isPending ? 'Following...' : 'Follow'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trader Details Section */}
        {traderDetails && (
          <div className="trader-details-section">
            <h2>Trader Details</h2>
            
            <div className="trader-details-card">
              <h3>{traderDetails.name || `${traderDetails.address.slice(0, 8)}...`}</h3>
              {traderDetails.verified && <span className="verified-badge">✓ Verified</span>}
              
              <div className="trader-stats">
                <p>Total Volume: ${traderDetails.copiedVolume.toLocaleString()}</p>
                <p>Followers: {traderDetails.followers.toLocaleString()}</p>
                <p>Total Trades: {traderDetails.totalTrades.toLocaleString()}</p>
                <p>Sharpe Ratio: {traderDetails.sharpeRatio.toFixed(2)}</p>
                <p>Max Drawdown: {traderDetails.maxDrawdown.toFixed(1)}%</p>
              </div>
              
              {/* Bio section commented out as bio property doesn't exist in Trader interface
              {traderDetails.bio && (
                <div className="trader-bio">
                  <h4>Bio</h4>
                  <p>{traderDetails.bio}</p>
                </div>
              )}
              */}
            </div>
          </div>
        )}

        {/* Market Data Section */}
        <div className="market-section">
          <h2>Market Data - {selectedMarket}</h2>
          
          <div className="market-selector">
            {['BTC', 'ETH', 'SOL', 'AVAX'].map((coin) => (
              <button
                key={coin}
                onClick={() => setSelectedMarket(coin)}
                className={selectedMarket === coin ? 'active' : ''}
              >
                {coin}
              </button>
            ))}
          </div>

          {orderBook && (
            <div className="orderbook-card">
              <h3>Order Book</h3>
              <div className="orderbook-data">
                <div className="asks">
                  <h4>Asks</h4>
                  {orderBook.asks.slice(0, 5).map((level, index) => (
                    <div key={index} className="orderbook-level ask">
                      <span>${level.price.toFixed(2)}</span>
                      <span>{level.size.toFixed(4)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="spread">
                  <p>Spread: ${orderBook.spread.toFixed(2)}</p>
                  <p>Mid: ${orderBook.midPrice.toFixed(2)}</p>
                </div>
                
                <div className="bids">
                  <h4>Bids</h4>
                  {orderBook.bids.slice(0, 5).map((level, index) => (
                    <div key={index} className="orderbook-level bid">
                      <span>${level.price.toFixed(2)}</span>
                      <span>{level.size.toFixed(4)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {candles && candles.length > 0 && (
            <div className="chart-card">
              <h3>Price Chart</h3>
              <div className="chart-placeholder">
                <p>Latest: ${candles[candles.length - 1]?.close.toFixed(2)}</p>
                <p>24h Change: {((candles[candles.length - 1]?.close / candles[0]?.close - 1) * 100).toFixed(2)}%</p>
                <p>Volume: {candles[candles.length - 1]?.volume.toLocaleString()}</p>
                {/* Here you would integrate with a charting library like TradingView or Chart.js */}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradingDashboard;