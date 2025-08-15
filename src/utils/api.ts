// API Client Utilities

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.socialpulse.trade';

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestConfig extends RequestInit {
  timeout?: number;
}

class ApiClient {
  private baseUrl: string;
  private defaultTimeout = 10000;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const { timeout = this.defaultTimeout, ...requestConfig } = config;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...requestConfig,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...requestConfig.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `HTTP ${response.status}`,
          response.status,
          errorData.code
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof AbortError) {
        throw new ApiError('Request timeout');
      }
      
      throw error;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return this.request<T>(url.pathname + url.search);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Query key factories for React Query
export const queryKeys = {
  traders: {
    all: ['traders'] as const,
    lists: () => [...queryKeys.traders.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.traders.lists(), filters] as const,
    details: () => [...queryKeys.traders.all, 'detail'] as const,
    detail: (address: string) => [...queryKeys.traders.details(), address] as const,
    performance: (address: string, timeframe: string) => 
      [...queryKeys.traders.detail(address), 'performance', timeframe] as const,
    trades: (address: string) => 
      [...queryKeys.traders.detail(address), 'trades'] as const,
  },
  
  copyTrading: {
    all: ['copyTrading'] as const,
    followed: () => [...queryKeys.copyTrading.all, 'followed'] as const,
    settings: (address: string) => 
      [...queryKeys.copyTrading.all, 'settings', address] as const,
  },
  
  markets: {
    all: ['markets'] as const,
    lists: () => [...queryKeys.markets.all, 'list'] as const,
    detail: (coin: string) => [...queryKeys.markets.all, coin] as const,
    orderBook: (coin: string) => [...queryKeys.markets.detail(coin), 'orderBook'] as const,
    candles: (coin: string, interval: string) => 
      [...queryKeys.markets.detail(coin), 'candles', interval] as const,
    fundingRates: () => [...queryKeys.markets.all, 'funding'] as const,
  },
  
  portfolio: {
    all: ['portfolio'] as const,
    positions: () => [...queryKeys.portfolio.all, 'positions'] as const,
    balance: () => [...queryKeys.portfolio.all, 'balance'] as const,
    pnl: () => [...queryKeys.portfolio.all, 'pnl'] as const,
    trades: () => [...queryKeys.portfolio.all, 'trades'] as const,
  },
} as const;