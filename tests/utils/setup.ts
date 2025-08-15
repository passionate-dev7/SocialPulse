/**
 * Global test setup and utilities
 */

import { jest } from '@jest/globals';

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidSwarmAgent(): R;
      toHaveConsensus(): R;
      toSynchronizeMemory(): R;
      toAdaptLearning(): R;
    }
  }
}

// Custom matchers
expect.extend({
  toBeValidSwarmAgent(received: any) {
    const pass = received && 
                 typeof received.id === 'string' && 
                 typeof received.role === 'string' &&
                 Array.isArray(received.capabilities) &&
                 typeof received.status === 'string';
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid swarm agent`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid swarm agent with id, role, capabilities, and status`,
        pass: false,
      };
    }
  },

  toHaveConsensus(received: any) {
    const pass = received && 
                 typeof received.decision === 'string' &&
                 typeof received.confidence === 'number' &&
                 received.confidence >= 0.5 &&
                 Array.isArray(received.votes);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to have consensus`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to have consensus with decision, confidence >= 0.5, and votes`,
        pass: false,
      };
    }
  },

  toSynchronizeMemory(received: any) {
    const pass = received && 
                 typeof received.synchronized === 'boolean' &&
                 received.synchronized === true &&
                 typeof received.consistency === 'number' &&
                 received.consistency >= 0.9;
    
    if (pass) {
      return {
        message: () => `expected ${received} not to synchronize memory`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to synchronize memory with consistency >= 0.9`,
        pass: false,
      };
    }
  },

  toAdaptLearning(received: any) {
    const pass = received && 
                 typeof received.adapted === 'boolean' &&
                 received.adapted === true &&
                 typeof received.improvement === 'number' &&
                 received.improvement > 0;
    
    if (pass) {
      return {
        message: () => `expected ${received} not to adapt learning`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to adapt learning with positive improvement`,
        pass: false,
      };
    }
  }
});

// Global test configuration
beforeAll(() => {
  // Suppress console logs during tests unless debugging
  if (!process.env.DEBUG_TESTS) {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  }
});

afterEach(() => {
  // Clean up mocks after each test
  jest.clearAllMocks();
});

export const createMockAgent = (overrides: Partial<any> = {}) => ({
  id: 'agent-test-123',
  role: 'tester',
  capabilities: ['testing', 'validation'],
  status: 'active',
  memory: new Map(),
  ...overrides
});

export const createMockSwarm = (agentCount = 3) => {
  const agents = Array.from({ length: agentCount }, (_, i) => 
    createMockAgent({ id: `agent-${i}`, role: `role-${i}` })
  );
  
  return {
    agents,
    coordinator: { topology: 'mesh', maxAgents: agentCount },
    consensus: { threshold: 0.6, votingSystem: 'majority' },
    memory: { shared: new Map(), consistency: 1.0 }
  };
};

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const createStressTestData = (size: number) => {
  return Array.from({ length: size }, (_, i) => ({
    id: `item-${i}`,
    data: `test-data-${i}`,
    timestamp: Date.now() + i,
    complexity: Math.random()
  }));
};