import { HyperliquidClient, OrderRequest, Position, TraderStats, Trade } from '../../../src/services/hyperliquid';
import axios from 'axios';
import { ethers } from 'ethers';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock ethers
jest.mock('ethers', () => ({
  ethers: {
    Wallet: jest.fn().mockImplementation((privateKey) => ({
      address: '0x1234567890123456789012345678901234567890',
      signMessage: jest.fn().mockResolvedValue('0xsignature123')
    })),
    utils: {
      keccak256: jest.fn().mockReturnValue('0xhash123'),
      toUtf8Bytes: jest.fn().mockReturnValue(new Uint8Array([1, 2, 3]))
    }
  }
}));

// Mock WebSocket
global.WebSocket = jest.fn().mockImplementation(() => ({
  readyState: WebSocket.OPEN,
  send: jest.fn(),
  close: jest.fn(),
  onopen: null,
  onmessage: null,
  onerror: null,
  onclose: null
})) as any;

describe('HyperliquidClient', () => {
  let client: HyperliquidClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    mockAxiosInstance = {
      post: jest.fn(),
      create: jest.fn().mockReturnThis()
    };
    
    mockedAxios.create.mockReturnValue(mockAxiosInstance);
    
    client = new HyperliquidClient({
      apiUrl: 'https://test-api.hyperliquid.xyz',
      wsUrl: 'wss://test-api.hyperliquid.xyz/ws',
      chainId: 1337,
      privateKey: '0x' + '0'.repeat(64)
    });

    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with correct configuration', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://test-api.hyperliquid.xyz',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    });

    it('should initialize wallet when private key provided', () => {
      expect(ethers.Wallet).toHaveBeenCalledWith('0x' + '0'.repeat(64));
    });

    it('should not initialize wallet when no private key', () => {
      jest.clearAllMocks();
      new HyperliquidClient({
        apiUrl: 'https://test-api.hyperliquid.xyz',
        wsUrl: 'wss://test-api.hyperliquid.xyz/ws',
        chainId: 1337
      });
      
      expect(ethers.Wallet).not.toHaveBeenCalled();
    });
  });

  describe('Market Data Methods', () => {
    describe('getMarkets', () => {
      it('should fetch market metadata successfully', async () => {
        const mockMarkets = [{ coin: 'BTC', maxLeverage: 50 }, { coin: 'ETH', maxLeverage: 25 }];
        mockAxiosInstance.post.mockResolvedValue({ data: mockMarkets });

        const result = await client.getMarkets();

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/info', {
          type: 'meta'
        });
        expect(result).toEqual(mockMarkets);
      });

      it('should handle API errors', async () => {
        mockAxiosInstance.post.mockRejectedValue(new Error('API Error'));

        await expect(client.getMarkets()).rejects.toThrow('API Error');
      });
    });

    describe('getOrderBook', () => {
      it('should fetch order book for specific coin', async () => {
        const mockOrderBook = {
          levels: [[49000, 1.5], [48900, 2.1]],
          coin: 'BTC'
        };
        mockAxiosInstance.post.mockResolvedValue({ data: mockOrderBook });

        const result = await client.getOrderBook('BTC');

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/info', {
          type: 'l2Book',
          coin: 'BTC'
        });
        expect(result).toEqual(mockOrderBook);
      });
    });

    describe('getCandles', () => {
      it('should fetch candle data with all parameters', async () => {
        const mockCandles = [{ time: 1640995200, open: 47000, close: 47500 }];
        mockAxiosInstance.post.mockResolvedValue({ data: mockCandles });
        
        const startTime = 1640995200;
        const endTime = 1641081600;
        const result = await client.getCandles('BTC', '1h', startTime, endTime);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/info', {
          type: 'candles',
          coin: 'BTC',
          interval: '1h',
          startTime,
          endTime
        });
        expect(result).toEqual(mockCandles);
      });

      it('should fetch candles without time parameters', async () => {
        const mockCandles = [];
        mockAxiosInstance.post.mockResolvedValue({ data: mockCandles });

        await client.getCandles('ETH', '4h');

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/info', {
          type: 'candles',
          coin: 'ETH',
          interval: '4h',
          startTime: undefined,
          endTime: undefined
        });
      });
    });

    describe('getFundingRate', () => {
      beforeEach(() => {
        jest.spyOn(Date, 'now').mockReturnValue(1640995200000);
      });

      afterEach(() => {
        jest.restoreAllMocks();
      });

      it('should fetch funding rate history', async () => {
        const mockFundingHistory = [{ time: 1640995200, fundingRate: 0.0001 }];
        mockAxiosInstance.post.mockResolvedValue({ data: mockFundingHistory });

        const result = await client.getFundingRate('BTC');

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/info', {
          type: 'fundingHistory',
          coin: 'BTC',
          startTime: 1640908800000 // 24h ago
        });
        expect(result).toEqual(mockFundingHistory);
      });
    });
  });

  describe('Account Methods', () => {
    const testAddress = '0x1234567890123456789012345678901234567890';

    describe('getAccountInfo', () => {
      it('should fetch account clearinghouse state', async () => {
        const mockAccountInfo = {
          marginSummary: { accountValue: '1000', totalNtlPos: '500' },
          assetPositions: []
        };
        mockAxiosInstance.post.mockResolvedValue({ data: mockAccountInfo });

        const result = await client.getAccountInfo(testAddress);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/info', {
          type: 'clearinghouseState',
          user: testAddress
        });
        expect(result).toEqual(mockAccountInfo);
      });
    });

    describe('getPositions', () => {
      it('should return positions from account info', async () => {
        const mockPositions: Position[] = [
          {
            coin: 'BTC',
            szi: 1.5,
            entryPx: 47000,
            unrealizedPnl: 150,
            returnOnEquity: 0.1,
            leverage: 5,
            maxLeverage: 50,
            marginUsed: 1410
          }
        ];
        
        const mockAccountInfo = { assetPositions: mockPositions };
        mockAxiosInstance.post.mockResolvedValue({ data: mockAccountInfo });

        const result = await client.getPositions(testAddress);

        expect(result).toEqual(mockPositions);
      });

      it('should return empty array when no positions', async () => {
        const mockAccountInfo = {};
        mockAxiosInstance.post.mockResolvedValue({ data: mockAccountInfo });

        const result = await client.getPositions(testAddress);

        expect(result).toEqual([]);
      });
    });

    describe('getOpenOrders', () => {
      it('should fetch open orders for user', async () => {
        const mockOrders = [
          { oid: '12345', coin: 'BTC', side: 'buy', sz: 1, limitPx: 46000 }
        ];
        mockAxiosInstance.post.mockResolvedValue({ data: mockOrders });

        const result = await client.getOpenOrders(testAddress);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/info', {
          type: 'openOrders',
          user: testAddress
        });
        expect(result).toEqual(mockOrders);
      });
    });

    describe('getTradeHistory', () => {
      beforeEach(() => {
        jest.spyOn(Date, 'now').mockReturnValue(1640995200000);
      });

      it('should fetch trade history with custom start time', async () => {
        const mockTrades: Trade[] = [
          {
            tid: 't1',
            coin: 'BTC',
            side: 'buy',
            px: 47000,
            sz: 1,
            time: 1640995200,
            fee: 0.05
          }
        ];
        mockAxiosInstance.post.mockResolvedValue({ data: mockTrades });
        
        const customStartTime = 1640908800000;
        const result = await client.getTradeHistory(testAddress, customStartTime);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/info', {
          type: 'userFills',
          user: testAddress,
          startTime: customStartTime
        });
        expect(result).toEqual(mockTrades);
      });

      it('should use default 30-day lookback when no start time provided', async () => {
        const mockTrades: Trade[] = [];
        mockAxiosInstance.post.mockResolvedValue({ data: mockTrades });

        await client.getTradeHistory(testAddress);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/info', {
          type: 'userFills',
          user: testAddress,
          startTime: 1638403200000 // 30 days ago
        });
      });
    });
  });

  describe('Trading Methods', () => {
    beforeEach(() => {
      jest.spyOn(Date, 'now').mockReturnValue(1640995200000);
    });

    describe('placeOrder', () => {
      const mockOrder: OrderRequest = {
        coin: 'BTC',
        isBuy: true,
        sz: 1,
        limitPx: 47000,
        orderType: 'limit',
        postOnly: true
      };

      it('should place order successfully with signature', async () => {
        const mockResponse = { status: 'ok', response: { type: 'order', data: { statuses: ['success'] } } };
        mockAxiosInstance.post.mockResolvedValue({ data: mockResponse });

        const result = await client.placeOrder(mockOrder);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/exchange', {
          action: {
            type: 'order',
            orders: [{
              ...mockOrder,
              timestamp: 1640995200000,
              nonce: 1640995200000
            }]
          },
          signature: '0xsignature123',
          timestamp: 1640995200000
        });
        expect(result).toEqual(mockResponse);
      });

      it('should throw error when no private key available', async () => {
        const clientWithoutKey = new HyperliquidClient({
          apiUrl: 'https://test-api.hyperliquid.xyz',
          wsUrl: 'wss://test-api.hyperliquid.xyz/ws',
          chainId: 1337
        });

        await expect(clientWithoutKey.placeOrder(mockOrder))
          .rejects.toThrow('Private key required for trading');
      });
    });

    describe('cancelOrder', () => {
      it('should cancel order by ID', async () => {
        const mockResponse = { status: 'ok' };
        mockAxiosInstance.post.mockResolvedValue({ data: mockResponse });

        const result = await client.cancelOrder('order123');

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/exchange', {
          action: {
            type: 'cancel',
            oid: 'order123',
            timestamp: 1640995200000
          },
          signature: '0xsignature123',
          timestamp: 1640995200000
        });
        expect(result).toEqual(mockResponse);
      });
    });

    describe('cancelAllOrders', () => {
      it('should cancel all orders for specific coin', async () => {
        const mockResponse = { status: 'ok' };
        mockAxiosInstance.post.mockResolvedValue({ data: mockResponse });

        const result = await client.cancelAllOrders('BTC');

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/exchange', {
          action: {
            type: 'cancelAll',
            coin: 'BTC',
            timestamp: 1640995200000
          },
          signature: '0xsignature123',
          timestamp: 1640995200000
        });
        expect(result).toEqual(mockResponse);
      });

      it('should cancel all orders for all coins', async () => {
        const mockResponse = { status: 'ok' };
        mockAxiosInstance.post.mockResolvedValue({ data: mockResponse });

        await client.cancelAllOrders();

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/exchange', {
          action: {
            type: 'cancelAll',
            coin: undefined,
            timestamp: 1640995200000
          },
          signature: '0xsignature123',
          timestamp: 1640995200000
        });
      });
    });
  });

  describe('Social Trading Methods', () => {
    describe('getTopTraders', () => {
      it('should fetch and calculate top trader statistics', async () => {
        const mockLeaderboardData = [
          {
            address: '0xtrader1',
            trades: [
              { tid: 't1', coin: 'BTC', side: 'buy', px: 47000, sz: 1, time: 1640995200, fee: 0.05 },
              { tid: 't2', coin: 'BTC', side: 'sell', px: 48000, sz: 1, time: 1640995300, fee: 0.05 }
            ]
          }
        ];
        mockAxiosInstance.post.mockResolvedValue({ data: mockLeaderboardData });

        const result = await client.getTopTraders(50);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/info', {
          type: 'leaderboard',
          timeWindow: '30d',
          limit: 50
        });
        expect(result).toHaveLength(1);
        expect(result[0]).toHaveProperty('address', '0xtrader1');
        expect(result[0]).toHaveProperty('pnl');
        expect(result[0]).toHaveProperty('volume');
        expect(result[0]).toHaveProperty('winRate');
      });
    });

    describe('getTraderPerformance', () => {
      it('should calculate performance metrics for specific trader', async () => {
        const mockTrades: Trade[] = [
          { tid: 't1', coin: 'BTC', side: 'buy', px: 47000, sz: 1, time: 1640995200000, fee: 0.05 },
          { tid: 't2', coin: 'BTC', side: 'sell', px: 48000, sz: 1, time: 1640995300000, fee: 0.05 }
        ];
        const mockPositions: Position[] = [];
        
        mockAxiosInstance.post
          .mockResolvedValueOnce({ data: mockTrades })
          .mockResolvedValueOnce({ data: { assetPositions: mockPositions } });

        const result = await client.getTraderPerformance('0xtrader1');

        expect(result).toHaveProperty('address', '0xtrader1');
        expect(result).toHaveProperty('pnl');
        expect(result).toHaveProperty('volume');
        expect(result).toHaveProperty('totalTrades', 2);
        expect(typeof result.sharpeRatio).toBe('number');
      });
    });

    describe('followTrader', () => {
      it('should create follow relationship', async () => {
        const result = await client.followTrader('0xtrader1', 10);

        expect(result).toEqual({
          follower: '0x1234567890123456789012345678901234567890',
          trader: '0xtrader1',
          allocation: 10,
          status: 'active',
          timestamp: expect.any(Number)
        });
      });
    });

    describe('copyTrade', () => {
      const mockTrade: Trade = {
        tid: 't1',
        coin: 'BTC',
        side: 'buy',
        px: 47000,
        sz: 1,
        time: 1640995200,
        fee: 0.05
      };

      it('should copy trade with scaled position size', async () => {
        const mockOrderResponse = { status: 'ok' };
        mockAxiosInstance.post.mockResolvedValue({ data: mockOrderResponse });

        const result = await client.copyTrade('0xtrader1', mockTrade, 25);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/exchange', expect.objectContaining({
          action: {
            type: 'order',
            orders: [{
              coin: 'BTC',
              isBuy: true,
              sz: 0.25, // 25% of original trade size
              orderType: 'market',
              timestamp: expect.any(Number),
              nonce: expect.any(Number)
            }]
          }
        }));
        expect(result).toEqual(mockOrderResponse);
      });
    });
  });

  describe('WebSocket Methods', () => {
    let mockWebSocket: any;
    let mockOnMessage: jest.Mock;

    beforeEach(() => {
      mockWebSocket = {
        readyState: WebSocket.OPEN,
        send: jest.fn(),
        close: jest.fn(),
        onopen: null,
        onmessage: null,
        onerror: null,
        onclose: null
      };
      (global.WebSocket as any).mockImplementation(() => mockWebSocket);
      mockOnMessage = jest.fn();
    });

    describe('connectWebSocket', () => {
      it('should establish WebSocket connection', () => {
        client.connectWebSocket(mockOnMessage);

        expect(global.WebSocket).toHaveBeenCalledWith('wss://test-api.hyperliquid.xyz/ws');
      });

      it('should handle incoming messages', () => {
        client.connectWebSocket(mockOnMessage);
        
        const testData = { type: 'trade', data: { coin: 'BTC', px: 47000 } };
        const messageEvent = { data: JSON.stringify(testData) };
        
        mockWebSocket.onmessage(messageEvent);
        
        expect(mockOnMessage).toHaveBeenCalledWith(testData);
      });

      it('should handle connection close with reconnection', () => {
        jest.useFakeTimers();
        client.connectWebSocket(mockOnMessage);
        
        mockWebSocket.onclose();
        
        jest.advanceTimersByTime(5000);
        
        expect(global.WebSocket).toHaveBeenCalledTimes(2);
        jest.useRealTimers();
      });
    });

    describe('subscribeToTrades', () => {
      it('should send trade subscription message', () => {
        client.connectWebSocket(mockOnMessage);
        client.subscribeToTrades(['BTC', 'ETH']);

        expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify({
          method: 'subscribe',
          subscription: {
            type: 'trades',
            coins: ['BTC', 'ETH']
          }
        }));
      });

      it('should throw error if WebSocket not connected', () => {
        expect(() => {
          client.subscribeToTrades(['BTC']);
        }).toThrow('WebSocket not connected');
      });
    });

    describe('subscribeToOrderBook', () => {
      it('should send order book subscription message', () => {
        client.connectWebSocket(mockOnMessage);
        client.subscribeToOrderBook(['BTC']);

        expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify({
          method: 'subscribe',
          subscription: {
            type: 'l2Book',
            coins: ['BTC']
          }
        }));
      });
    });

    describe('subscribeToUserEvents', () => {
      it('should send user events subscription message', () => {
        const testAddress = '0x1234567890123456789012345678901234567890';
        client.connectWebSocket(mockOnMessage);
        client.subscribeToUserEvents(testAddress);

        expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify({
          method: 'subscribe',
          subscription: {
            type: 'userEvents',
            user: testAddress
          }
        }));
      });
    });

    describe('disconnect', () => {
      it('should close WebSocket connection', () => {
        client.connectWebSocket(mockOnMessage);
        client.disconnect();

        expect(mockWebSocket.close).toHaveBeenCalled();
      });
    });
  });

  describe('Helper Methods', () => {
    describe('calculateTraderStats', () => {
      it('should calculate correct statistics from trade data', async () => {
        const mockTraderData = {
          address: '0xtrader1',
          trades: [
            { tid: 't1', coin: 'BTC', side: 'buy', px: 47000, sz: 1, time: 1640995200000, fee: 0.05 },
            { tid: 't2', coin: 'BTC', side: 'sell', px: 48000, sz: 1, time: 1640995300000, fee: 0.05 },
            { tid: 't3', coin: 'ETH', side: 'buy', px: 3000, sz: 2, time: 1640995400000, fee: 0.1 },
            { tid: 't4', coin: 'ETH', side: 'sell', px: 3100, sz: 2, time: 1640995500000, fee: 0.1 }
          ]
        };

        mockAxiosInstance.post.mockResolvedValue({ data: [mockTraderData] });
        const result = await client.getTopTraders(1);

        expect(result[0].pnl).toBeCloseTo(1200); // (48000-47000) + (3100-3000)*2
        expect(result[0].volume).toBeCloseTo(100200); // 47000 + 48000 + 6000 + 6200
        expect(result[0].totalTrades).toBe(4);
        expect(result[0].winRate).toBeCloseTo(50); // 2 sell trades out of 4 total
      });
    });

    describe('edge cases', () => {
      it('should handle empty trade arrays', async () => {
        const mockTraderData = { address: '0xtrader1', trades: [] };
        mockAxiosInstance.post.mockResolvedValue({ data: [mockTraderData] });

        const result = await client.getTopTraders(1);

        expect(result[0].pnl).toBe(0);
        expect(result[0].volume).toBe(0);
        expect(result[0].winRate).toBe(0);
        expect(result[0].totalTrades).toBe(0);
      });

      it('should handle API rate limiting', async () => {
        const rateLimitError = {
          response: {
            status: 429,
            data: { error: 'Rate limit exceeded' }
          }
        };
        mockAxiosInstance.post.mockRejectedValue(rateLimitError);

        await expect(client.getMarkets()).rejects.toMatchObject(rateLimitError);
      });

      it('should handle network timeouts', async () => {
        const timeoutError = new Error('timeout of 5000ms exceeded');
        timeoutError.name = 'TimeoutError';
        mockAxiosInstance.post.mockRejectedValue(timeoutError);

        await expect(client.getAccountInfo('0xtest')).rejects.toThrow('timeout of 5000ms exceeded');
      });
    });
  });
});
