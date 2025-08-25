/**
 * GlueX Router API Integration Service
 * Provides efficient DeFi operations including swaps, lending, and more
 */

import axios, { AxiosInstance } from 'axios';

// GlueX Router API Base Configuration
const GLUEX_BASE_URL = 'https://router.gluex.xyz';
const API_VERSION = 'v1';

// Types for GlueX API
export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  chainId: number;
  logoURI?: string;
}

export interface PriceQuoteRequest {
  chainId: number;
  inputToken: string;
  outputToken: string;
  inputAmount?: string;
  outputAmount?: string;
  orderType?: 'SELL' | 'BUY';
  slippageTolerance?: number; // in basis points (100 = 1%)
  surgeProtection?: boolean;
  isPartialFill?: boolean;
  modulesFilter?: string[];
  partnerFee?: number; // in basis points
  partnerAddress?: string;
  activateSurplusFee?: boolean;
  userAddress?: string;
}

export interface PriceQuoteResponse {
  inputToken: TokenInfo;
  outputToken: TokenInfo;
  inputAmount: string;
  outputAmount: string;
  minOutputAmount: string;
  effectiveOutputAmount: string;
  priceImpact: number;
  route: RouteStep[];
  estimatedGas: string;
  estimatedGasPrice: string;
  executionPrice: number;
  marketPrice: number;
  surplus?: string;
  revert?: boolean;
  revertReason?: string;
}

export interface RouteStep {
  protocol: string;
  poolAddress: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  fee?: number;
}

export interface SwapQuoteRequest extends PriceQuoteRequest {
  deadline?: number; // Unix timestamp
  recipient?: string;
}

export interface SwapQuoteResponse extends PriceQuoteResponse {
  to: string; // Contract address to send transaction to
  data: string; // Transaction calldata
  value: string; // ETH value to send (for native token swaps)
  deadline: number;
  nonce?: number;
}

export interface TransactionStatus {
  hash: string;
  status: 'pending' | 'success' | 'failed';
  blockNumber?: number;
  gasUsed?: string;
  effectiveGasPrice?: string;
  inputAmount?: string;
  outputAmount?: string;
  timestamp?: number;
}

class GlueXService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${GLUEX_BASE_URL}/${API_VERSION}`,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 seconds
    });

    // Add request interceptor for logging
    this.api.interceptors.request.use(
      (config) => {
        console.log('[GlueX] Request:', config.method?.toUpperCase(), config.url, config.data);
        return config;
      },
      (error) => {
        console.error('[GlueX] Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => {
        console.log('[GlueX] Response:', response.status, response.data);
        return response;
      },
      (error) => {
        console.error('[GlueX] Response Error:', error.response?.data || error.message);
        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Get price quote for a swap
   * Fast endpoint (~500ms) for getting swap quotes without calldata
   */
  async getPriceQuote(params: PriceQuoteRequest): Promise<PriceQuoteResponse> {
    try {
      const response = await this.api.post<PriceQuoteResponse>('/price', params);
      return response.data;
    } catch (error) {
      console.error('Error getting price quote:', error);
      throw error;
    }
  }

  /**
   * Get executable swap quote with calldata
   * Returns everything needed to execute the swap on-chain
   */
  async getSwapQuote(params: SwapQuoteRequest): Promise<SwapQuoteResponse> {
    try {
      const response = await this.api.post<SwapQuoteResponse>('/quote', params);
      return response.data;
    } catch (error) {
      console.error('Error getting swap quote:', error);
      throw error;
    }
  }

  /**
   * Get list of supported tokens for a chain
   */
  async getSupportedTokens(chainId: number): Promise<TokenInfo[]> {
    try {
      const response = await this.api.get<TokenInfo[]>(`/tokens/${chainId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching supported tokens:', error);
      throw error;
    }
  }

  /**
   * Get list of supported liquidity modules
   */
  async getLiquidityModules(): Promise<string[]> {
    try {
      const response = await this.api.get<string[]>('/liquidity');
      return response.data;
    } catch (error) {
      console.error('Error fetching liquidity modules:', error);
      throw error;
    }
  }

  /**
   * Get supported chains
   */
  async getSupportedChains(): Promise<number[]> {
    try {
      const response = await this.api.get<number[]>('/chains');
      return response.data;
    } catch (error) {
      console.error('Error fetching supported chains:', error);
      throw error;
    }
  }

  /**
   * Validate swap parameters before execution
   */
  validateSwapParams(params: PriceQuoteRequest): boolean {
    // Basic validation
    if (!params.chainId || !params.inputToken || !params.outputToken) {
      console.error('Missing required parameters');
      return false;
    }

    // Either inputAmount or outputAmount must be provided
    if (!params.inputAmount && !params.outputAmount) {
      console.error('Either inputAmount or outputAmount must be provided');
      return false;
    }

    // If orderType is BUY, outputAmount is required
    if (params.orderType === 'BUY' && !params.outputAmount) {
      console.error('outputAmount is required for BUY orders');
      return false;
    }

    // If orderType is SELL or not specified, inputAmount is required
    if ((!params.orderType || params.orderType === 'SELL') && !params.inputAmount) {
      console.error('inputAmount is required for SELL orders');
      return false;
    }

    return true;
  }

  /**
   * Format token amount for display
   */
  formatTokenAmount(amount: string, decimals: number): string {
    const value = parseFloat(amount) / Math.pow(10, decimals);
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  }

  /**
   * Parse token amount from user input
   */
  parseTokenAmount(amount: string, decimals: number): string {
    const value = parseFloat(amount) * Math.pow(10, decimals);
    return Math.floor(value).toString();
  }

  /**
   * Calculate price impact percentage
   */
  calculatePriceImpact(executionPrice: number, marketPrice: number): number {
    if (marketPrice === 0) return 0;
    return ((executionPrice - marketPrice) / marketPrice) * 100;
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    if (error.response) {
      // Server responded with error
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          return new Error(`Bad Request: ${data.message || 'Invalid parameters'}`);
        case 401:
          return new Error('Unauthorized: API key required');
        case 429:
          return new Error('Rate limit exceeded. Please try again later.');
        case 500:
          return new Error('Server error. Please try again later.');
        default:
          return new Error(data.message || `Request failed with status ${status}`);
      }
    } else if (error.request) {
      // Request made but no response
      return new Error('Network error. Please check your connection.');
    } else {
      // Something else happened
      return new Error(error.message || 'An unexpected error occurred');
    }
  }

  /**
   * Get recommended slippage based on token pair and market conditions
   */
  getRecommendedSlippage(inputToken: string, outputToken: string): number {
    // Stablecoin to stablecoin: 0.1%
    const stablecoins = ['USDC', 'USDT', 'DAI', 'BUSD'];
    if (stablecoins.includes(inputToken) && stablecoins.includes(outputToken)) {
      return 10; // 0.1% in basis points
    }

    // Major pairs: 0.5%
    const majorTokens = ['ETH', 'BTC', 'WETH', 'WBTC'];
    if (majorTokens.includes(inputToken) || majorTokens.includes(outputToken)) {
      return 50; // 0.5% in basis points
    }

    // Default: 1%
    return 100; // 1% in basis points
  }
}

// Export singleton instance
export const gluexService = new GlueXService();

// Export types
export type { GlueXService };