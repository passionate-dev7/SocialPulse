import axios, { AxiosInstance } from 'axios';
import { ethers } from 'ethers';

export interface HyperliquidConfig {
  apiUrl: string;
  wsUrl: string;
  chainId: number;
  privateKey?: string;
}

export interface OrderRequest {
  coin: string;
  isBuy: boolean;
  sz: number;
  limitPx?: number;
  orderType: 'market' | 'limit' | 'stop';
  reduceOnly?: boolean;
  postOnly?: boolean;
  clientOrderId?: string;
}

export interface Position {
  coin: string;
  szi: number;
  entryPx: number;
  unrealizedPnl: number;
  returnOnEquity: number;
  leverage: number;
  maxLeverage: number;
  marginUsed: number;
}

export interface TraderStats {
  address: string;
  pnl: number;
  volume: number;
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
  totalTrades: number;
  avgHoldTime: number;
  roi: number;
}

export interface Trade {
  tid: string;
  coin: string;
  side: 'buy' | 'sell';
  px: number;
  sz: number;
  time: number;
  fee: number;
}

export class HyperliquidClient {
  private api: AxiosInstance;
  private wsUrl: string;
  private wallet?: ethers.Wallet;
  private ws?: WebSocket;

  constructor(config: HyperliquidConfig) {
    this.api = axios.create({
      baseURL: config.apiUrl,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.wsUrl = config.wsUrl;

    if (config.privateKey) {
      this.wallet = new ethers.Wallet(config.privateKey);
    }
  }

  // Market Data Methods
  async getMarkets() {
    const response = await this.api.post('/info', {
      type: 'meta'
    });
    return response.data;
  }

  async getOrderBook(coin: string) {
    const response = await this.api.post('/info', {
      type: 'l2Book',
      coin
    });
    return response.data;
  }

  async getCandles(coin: string, interval: string, startTime?: number, endTime?: number) {
    const response = await this.api.post('/info', {
      type: 'candles',
      coin,
      interval,
      startTime,
      endTime
    });
    return response.data;
  }

  async getFundingRate(coin: string) {
    const response = await this.api.post('/info', {
      type: 'fundingHistory',
      coin,
      startTime: Date.now() - 86400000 // Last 24h
    });
    return response.data;
  }

  // Account Methods
  async getAccountInfo(address: string) {
    const response = await this.api.post('/info', {
      type: 'clearinghouseState',
      user: address
    });
    return response.data;
  }

  async getPositions(address: string): Promise<Position[]> {
    const accountInfo = await this.getAccountInfo(address);
    return accountInfo.assetPositions || [];
  }

  async getOpenOrders(address: string) {
    const response = await this.api.post('/info', {
      type: 'openOrders',
      user: address
    });
    return response.data;
  }

  async getTradeHistory(address: string, startTime?: number): Promise<Trade[]> {
    const response = await this.api.post('/info', {
      type: 'userFills',
      user: address,
      startTime: startTime || Date.now() - 30 * 86400000 // Default 30 days
    });
    return response.data;
  }

  // Trading Methods
  async placeOrder(order: OrderRequest) {
    if (!this.wallet) {
      throw new Error('Private key required for trading');
    }

    const timestamp = Date.now();
    const orderData = {
      ...order,
      timestamp,
      nonce: timestamp
    };

    const signature = await this.signOrder(orderData);

    const response = await this.api.post('/exchange', {
      action: {
        type: 'order',
        orders: [orderData]
      },
      signature,
      timestamp
    });

    return response.data;
  }

  async cancelOrder(orderId: string) {
    if (!this.wallet) {
      throw new Error('Private key required for trading');
    }

    const timestamp = Date.now();
    const cancelData = {
      type: 'cancel',
      oid: orderId,
      timestamp
    };

    const signature = await this.signOrder(cancelData);

    const response = await this.api.post('/exchange', {
      action: cancelData,
      signature,
      timestamp
    });

    return response.data;
  }

  async cancelAllOrders(coin?: string) {
    if (!this.wallet) {
      throw new Error('Private key required for trading');
    }

    const timestamp = Date.now();
    const cancelData = {
      type: 'cancelAll',
      coin,
      timestamp
    };

    const signature = await this.signOrder(cancelData);

    const response = await this.api.post('/exchange', {
      action: cancelData,
      signature,
      timestamp
    });

    return response.data;
  }

  // Social Trading Methods
  async getTopTraders(limit: number = 100): Promise<TraderStats[]> {
    const response = await this.api.post('/info', {
      type: 'leaderboard',
      timeWindow: '30d',
      limit
    });

    return response.data.map((trader: any) => this.calculateTraderStats(trader));
  }

  async getTraderPerformance(address: string, period: string = '30d'): Promise<TraderStats> {
    const trades = await this.getTradeHistory(address);
    const positions = await this.getPositions(address);
    
    return this.calculateTraderStats({
      address,
      trades,
      positions,
      period
    });
  }

  async followTrader(traderAddress: string, allocation: number) {
    // Store follow relationship and allocation
    // This would be managed in our backend
    return {
      follower: this.wallet?.address,
      trader: traderAddress,
      allocation,
      status: 'active',
      timestamp: Date.now()
    };
  }

  async copyTrade(traderAddress: string, trade: Trade, allocation: number) {
    if (!this.wallet) {
      throw new Error('Private key required for copy trading');
    }

    // Calculate position size based on allocation
    const scaledSize = trade.sz * (allocation / 100);

    return await this.placeOrder({
      coin: trade.coin,
      isBuy: trade.side === 'buy',
      sz: scaledSize,
      orderType: 'market'
    });
  }

  // WebSocket Methods
  connectWebSocket(onMessage: (data: any) => void) {
    this.ws = new WebSocket(this.wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      // Implement reconnection logic
      setTimeout(() => this.connectWebSocket(onMessage), 5000);
    };
  }

  subscribeToTrades(coins: string[]) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    this.ws.send(JSON.stringify({
      method: 'subscribe',
      subscription: {
        type: 'trades',
        coins
      }
    }));
  }

  subscribeToOrderBook(coins: string[]) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    this.ws.send(JSON.stringify({
      method: 'subscribe',
      subscription: {
        type: 'l2Book',
        coins
      }
    }));
  }

  subscribeToUserEvents(address: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    this.ws.send(JSON.stringify({
      method: 'subscribe',
      subscription: {
        type: 'userEvents',
        user: address
      }
    }));
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }

  // Helper Methods
  private async signOrder(data: any): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }

    const message = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(JSON.stringify(data))
    );

    return await this.wallet.signMessage(message);
  }

  private calculateTraderStats(data: any): TraderStats {
    // Calculate comprehensive trader statistics
    const trades = data.trades || [];
    const pnl = trades.reduce((sum: number, t: Trade) => sum + (t.px * t.sz * (t.side === 'sell' ? 1 : -1)), 0);
    const volume = trades.reduce((sum: number, t: Trade) => sum + (t.px * t.sz), 0);
    
    const wins = trades.filter((t: Trade) => t.side === 'sell' && t.px > 0).length;
    const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0;

    // Simplified calculations - would need more sophisticated analysis in production
    const returns = this.calculateReturns(trades);
    const sharpeRatio = this.calculateSharpeRatio(returns);
    const maxDrawdown = this.calculateMaxDrawdown(returns);
    const avgHoldTime = this.calculateAvgHoldTime(trades);
    const roi = (pnl / (volume || 1)) * 100;

    return {
      address: data.address,
      pnl,
      volume,
      winRate,
      sharpeRatio,
      maxDrawdown,
      totalTrades: trades.length,
      avgHoldTime,
      roi
    };
  }

  private calculateReturns(trades: Trade[]): number[] {
    // Calculate daily returns from trades
    const dailyReturns: { [key: string]: number } = {};
    
    trades.forEach(trade => {
      const date = new Date(trade.time).toISOString().split('T')[0];
      if (!dailyReturns[date]) dailyReturns[date] = 0;
      dailyReturns[date] += trade.px * trade.sz * (trade.side === 'sell' ? 1 : -1);
    });

    return Object.values(dailyReturns);
  }

  private calculateSharpeRatio(returns: number[]): number {
    if (returns.length < 2) return 0;
    
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const stdDev = Math.sqrt(
      returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
    );
    
    return stdDev !== 0 ? (avgReturn / stdDev) * Math.sqrt(365) : 0;
  }

  private calculateMaxDrawdown(returns: number[]): number {
    if (returns.length === 0) return 0;
    
    let peak = returns[0];
    let maxDrawdown = 0;
    let cumulative = 0;
    
    returns.forEach(ret => {
      cumulative += ret;
      if (cumulative > peak) peak = cumulative;
      const drawdown = (peak - cumulative) / peak;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    });
    
    return maxDrawdown * 100;
  }

  private calculateAvgHoldTime(trades: Trade[]): number {
    // This would need position matching logic in production
    // Simplified: assume average time between trades
    if (trades.length < 2) return 0;
    
    let totalTime = 0;
    for (let i = 1; i < trades.length; i++) {
      totalTime += trades[i].time - trades[i-1].time;
    }
    
    return totalTime / (trades.length - 1) / 3600000; // Convert to hours
  }
}

// Export singleton instance
export const hyperliquidClient = new HyperliquidClient({
  apiUrl: process.env.NEXT_PUBLIC_HYPERLIQUID_API_URL || 'https://api.hyperliquid.xyz',
  wsUrl: process.env.NEXT_PUBLIC_HYPERLIQUID_WS_URL || 'wss://api.hyperliquid.xyz/ws',
  chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '1337'),
  privateKey: process.env.HYPERLIQUID_PRIVATE_KEY
});