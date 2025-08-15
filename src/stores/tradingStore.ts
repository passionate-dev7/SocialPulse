import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface Position {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  size: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnl: number;
  realizedPnl: number;
  leverage: number;
  margin: number;
  liquidationPrice: number;
  timestamp: string;
  status: 'open' | 'closed' | 'liquidated';
}

export interface Order {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  size: number;
  price?: number;
  stopPrice?: number;
  status: 'pending' | 'filled' | 'cancelled' | 'rejected';
  timestamp: string;
  filledSize: number;
  avgFillPrice: number;
  timeInForce: 'GTC' | 'IOC' | 'FOK';
}

export interface Trade {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  size: number;
  price: number;
  fee: number;
  timestamp: string;
  orderId: string;
  pnl?: number;
}

export interface Portfolio {
  totalValue: number;
  availableBalance: number;
  usedMargin: number;
  freeMargin: number;
  unrealizedPnl: number;
  realizedPnl: number;
  totalPnl: number;
  marginRatio: number;
}

export interface TradingState {
  // State
  positions: Position[];
  orders: Order[];
  trades: Trade[];
  portfolio: Portfolio;
  isLoading: boolean;
  error: string | null;
  lastUpdate: string | null;
  isConnected: boolean;
  
  // Real-time subscriptions
  priceSubscriptions: Set<string>;
  
  // Actions
  fetchPositions: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  fetchTrades: () => Promise<void>;
  fetchPortfolio: () => Promise<void>;
  placeOrder: (order: Omit<Order, 'id' | 'timestamp' | 'status' | 'filledSize' | 'avgFillPrice'>) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
  closePosition: (positionId: string, size?: number) => Promise<void>;
  updatePositionPrice: (symbol: string, price: number) => void;
  subscribeToPrice: (symbol: string) => void;
  unsubscribeFromPrice: (symbol: string) => void;
  clearError: () => void;
  reset: () => void;
}

const initialPortfolio: Portfolio = {
  totalValue: 0,
  availableBalance: 0,
  usedMargin: 0,
  freeMargin: 0,
  unrealizedPnl: 0,
  realizedPnl: 0,
  totalPnl: 0,
  marginRatio: 0,
};

const useTradingStore = create<TradingState>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Initial state
        positions: [],
        orders: [],
        trades: [],
        portfolio: initialPortfolio,
        isLoading: false,
        error: null,
        lastUpdate: null,
        isConnected: false,
        priceSubscriptions: new Set(),

        // Actions
        fetchPositions: async () => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            const response = await fetch('/api/trading/positions', {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
              },
            });

            if (!response.ok) {
              throw new Error('Failed to fetch positions');
            }

            const positions = await response.json();

            set((state) => {
              state.positions = positions;
              state.isLoading = false;
              state.lastUpdate = new Date().toISOString();
            });
          } catch (error) {
            set((state) => {
              state.isLoading = false;
              state.error = error instanceof Error ? error.message : 'Failed to fetch positions';
            });
          }
        },

        fetchOrders: async () => {
          try {
            const response = await fetch('/api/trading/orders', {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
              },
            });

            if (!response.ok) {
              throw new Error('Failed to fetch orders');
            }

            const orders = await response.json();

            set((state) => {
              state.orders = orders;
            });
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to fetch orders';
            });
          }
        },

        fetchTrades: async () => {
          try {
            const response = await fetch('/api/trading/trades', {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
              },
            });

            if (!response.ok) {
              throw new Error('Failed to fetch trades');
            }

            const trades = await response.json();

            set((state) => {
              state.trades = trades;
            });
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to fetch trades';
            });
          }
        },

        fetchPortfolio: async () => {
          try {
            const response = await fetch('/api/trading/portfolio', {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
              },
            });

            if (!response.ok) {
              throw new Error('Failed to fetch portfolio');
            }

            const portfolio = await response.json();

            set((state) => {
              state.portfolio = portfolio;
            });
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to fetch portfolio';
            });
          }
        },

        placeOrder: async (orderData) => {
          const tempId = `temp-${Date.now()}`;
          
          // Optimistic update
          const optimisticOrder: Order = {
            ...orderData,
            id: tempId,
            timestamp: new Date().toISOString(),
            status: 'pending',
            filledSize: 0,
            avgFillPrice: 0,
          };

          set((state) => {
            state.orders.unshift(optimisticOrder);
          });

          try {
            const response = await fetch('/api/trading/orders', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
              },
              body: JSON.stringify(orderData),
            });

            if (!response.ok) {
              throw new Error('Failed to place order');
            }

            const newOrder = await response.json();

            set((state) => {
              const index = state.orders.findIndex(order => order.id === tempId);
              if (index !== -1) {
                state.orders[index] = newOrder;
              }
            });
          } catch (error) {
            // Remove optimistic update on failure
            set((state) => {
              state.orders = state.orders.filter(order => order.id !== tempId);
              state.error = error instanceof Error ? error.message : 'Failed to place order';
            });
          }
        },

        cancelOrder: async (orderId) => {
          // Optimistic update
          set((state) => {
            const order = state.orders.find(o => o.id === orderId);
            if (order) {
              order.status = 'cancelled';
            }
          });

          try {
            const response = await fetch(`/api/trading/orders/${orderId}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
              },
            });

            if (!response.ok) {
              throw new Error('Failed to cancel order');
            }
          } catch (error) {
            // Revert optimistic update
            set((state) => {
              const order = state.orders.find(o => o.id === orderId);
              if (order) {
                order.status = 'pending';
              }
              state.error = error instanceof Error ? error.message : 'Failed to cancel order';
            });
          }
        },

        closePosition: async (positionId, size) => {
          const position = get().positions.find(p => p.id === positionId);
          if (!position) return;

          const closeSize = size || position.size;
          
          try {
            const response = await fetch(`/api/trading/positions/${positionId}/close`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
              },
              body: JSON.stringify({ size: closeSize }),
            });

            if (!response.ok) {
              throw new Error('Failed to close position');
            }

            // Refresh positions after close
            await get().fetchPositions();
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to close position';
            });
          }
        },

        updatePositionPrice: (symbol, price) => {
          set((state) => {
            const position = state.positions.find(p => p.symbol === symbol);
            if (position) {
              position.currentPrice = price;
              position.unrealizedPnl = (price - position.entryPrice) * position.size * (position.side === 'long' ? 1 : -1);
            }
            
            // Update portfolio unrealized PnL
            state.portfolio.unrealizedPnl = state.positions.reduce((sum, pos) => sum + pos.unrealizedPnl, 0);
            state.portfolio.totalPnl = state.portfolio.realizedPnl + state.portfolio.unrealizedPnl;
          });
        },

        subscribeToPrice: (symbol) => {
          set((state) => {
            state.priceSubscriptions.add(symbol);
          });
        },

        unsubscribeFromPrice: (symbol) => {
          set((state) => {
            state.priceSubscriptions.delete(symbol);
          });
        },

        clearError: () => {
          set((state) => {
            state.error = null;
          });
        },

        reset: () => {
          set((state) => {
            state.positions = [];
            state.orders = [];
            state.trades = [];
            state.portfolio = initialPortfolio;
            state.error = null;
            state.lastUpdate = null;
            state.priceSubscriptions.clear();
          });
        },
      }))
    ),
    { name: 'trading-store' }
  )
);

// Auto-refresh positions and orders every 30 seconds
if (typeof window !== 'undefined') {
  setInterval(() => {
    const state = useTradingStore.getState();
    if (state.isConnected) {
      state.fetchPositions();
      state.fetchOrders();
      state.fetchPortfolio();
    }
  }, 30000);
}

export default useTradingStore;