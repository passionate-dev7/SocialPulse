/**
 * Mock data generators and test utilities for SocialPulse testing
 */

import { TraderStats, Trade, Position, OrderRequest, HyperliquidConfig } from '../../src/services/hyperliquid';

// Configuration for test environments
export const TEST_CONFIG: HyperliquidConfig = {
  apiUrl: 'https://test-api.hyperliquid.xyz',
  wsUrl: 'wss://test-api.hyperliquid.xyz/ws',
  chainId: 31337, // Hardhat test network
  privateKey: '0x' + '0'.repeat(64) // Test private key
};

// Mock trader addresses
export const MOCK_ADDRESSES = {
  TRADER_1: '0x1234567890123456789012345678901234567890',
  TRADER_2: '0x2345678901234567890123456789012345678901',
  TRADER_3: '0x3456789012345678901234567890123456789012',
  FOLLOWER: '0x9876543210987654321098765432109876543210',
  SYSTEM: '0x0000000000000000000000000000000000000000'
};

// Base mock trader stats
export const createMockTrader = (overrides: Partial<TraderStats> = {}): TraderStats => {
  const baseTrader: TraderStats = {
    address: MOCK_ADDRESSES.TRADER_1,
    pnl: 15420.50,
    volume: 2500000.75,
    winRate: 68.5,
    sharpeRatio: 2.34,
    maxDrawdown: 12.8,
    totalTrades: 156,
    avgHoldTime: 4.2,
    roi: 24.8
  };
  
  return { ...baseTrader, ...overrides };
};

// Export mock utilities
export default {
  TEST_CONFIG,
  MOCK_ADDRESSES,
  createMockTrader
};