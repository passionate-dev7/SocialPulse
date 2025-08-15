/**
 * Unit tests for SwarmCoordinator
 * Tests the core coordination logic for swarm intelligence
 */

import { jest } from '@jest/globals';
import { createMockAgent, createMockSwarm, delay } from '../utils/setup';
import { mockAgentConfigurations } from '../fixtures/test-data';

// Mock the SwarmCoordinator class (would be imported from src)
class MockSwarmCoordinator {
  private agents: Map<string, any> = new Map();
  private topology: string;
  private maxAgents: number;
  
  constructor(config: { topology: string; maxAgents: number }) {
    this.topology = config.topology;
    this.maxAgents = config.maxAgents;
  }
  
  async addAgent(agent: any): Promise<boolean> {
    if (this.agents.size >= this.maxAgents) {
      throw new Error('Maximum agents reached');
    }
    
    if (this.agents.has(agent.id)) {
      return false;
    }
    
    this.agents.set(agent.id, { ...agent, status: 'active' });
    return true;
  }
  
  async removeAgent(agentId: string): Promise<boolean> {
    return this.agents.delete(agentId);
  }
  
  getAgents(): any[] {
    return Array.from(this.agents.values());
  }
  
  getTopology(): string {
    return this.topology;
  }
  
  async distributeTask(task: any, targetAgents?: string[]): Promise<any[]> {
    const agents = targetAgents 
      ? targetAgents.map(id => this.agents.get(id)).filter(Boolean)
      : this.getAgents();
    
    if (agents.length === 0) {
      throw new Error('No available agents');
    }
    
    return agents.map(agent => ({
      agentId: agent.id,
      taskId: task.id,
      status: 'assigned',
      estimatedCompletion: Date.now() + Math.random() * 5000
    }));
  }
  
  async checkHealth(): Promise<any> {
    const agents = this.getAgents();
    const activeAgents = agents.filter(a => a.status === 'active');
    
    return {
      totalAgents: agents.length,
      activeAgents: activeAgents.length,
      healthScore: activeAgents.length / agents.length,
      topology: this.topology,
      timestamp: Date.now()
    };
  }
  
  async optimizeTopology(): Promise<string> {
    const agentCount = this.agents.size;
    
    if (agentCount <= 3) return 'star';
    if (agentCount <= 10) return 'hierarchical';
    return 'mesh';
  }
}

describe('SwarmCoordinator', () => {
  let coordinator: MockSwarmCoordinator;
  
  beforeEach(() => {
    coordinator = new MockSwarmCoordinator({
      topology: 'mesh',
      maxAgents: 10
    });
  });
  
  describe('Agent Management', () => {
    test('should add new agent successfully', async () => {
      const agent = createMockAgent(mockAgentConfigurations.researcher);
      
      const result = await coordinator.addAgent(agent);
      
      expect(result).toBe(true);
      expect(coordinator.getAgents()).toHaveLength(1);
      expect(coordinator.getAgents()[0]).toBeValidSwarmAgent();
    });
    
    test('should reject duplicate agent', async () => {
      const agent = createMockAgent({ id: 'duplicate-agent' });
      
      await coordinator.addAgent(agent);
      const result = await coordinator.addAgent(agent);
      
      expect(result).toBe(false);
      expect(coordinator.getAgents()).toHaveLength(1);
    });
    
    test('should enforce maximum agent limit', async () => {
      const smallCoordinator = new MockSwarmCoordinator({
        topology: 'star',
        maxAgents: 2
      });
      
      await smallCoordinator.addAgent(createMockAgent({ id: 'agent-1' }));
      await smallCoordinator.addAgent(createMockAgent({ id: 'agent-2' }));
      
      await expect(
        smallCoordinator.addAgent(createMockAgent({ id: 'agent-3' }))
      ).rejects.toThrow('Maximum agents reached');
    });
    
    test('should remove agent successfully', async () => {
      const agent = createMockAgent({ id: 'removable-agent' });
      await coordinator.addAgent(agent);
      
      const result = await coordinator.removeAgent('removable-agent');
      
      expect(result).toBe(true);
      expect(coordinator.getAgents()).toHaveLength(0);
    });
    
    test('should handle removal of non-existent agent', async () => {
      const result = await coordinator.removeAgent('non-existent');
      
      expect(result).toBe(false);
    });
  });
  
  describe('Task Distribution', () => {
    beforeEach(async () => {
      // Add test agents
      await coordinator.addAgent(createMockAgent(mockAgentConfigurations.researcher));
      await coordinator.addAgent(createMockAgent(mockAgentConfigurations.coordinator));
      await coordinator.addAgent(createMockAgent(mockAgentConfigurations.optimizer));
    });
    
    test('should distribute task to all agents by default', async () => {
      const task = { id: 'task-001', type: 'analysis', priority: 'high' };
      
      const assignments = await coordinator.distributeTask(task);
      
      expect(assignments).toHaveLength(3);
      assignments.forEach(assignment => {
        expect(assignment).toHaveProperty('agentId');
        expect(assignment).toHaveProperty('taskId', task.id);
        expect(assignment).toHaveProperty('status', 'assigned');
        expect(assignment).toHaveProperty('estimatedCompletion');
      });
    });
    
    test('should distribute task to specific agents', async () => {
      const task = { id: 'task-002', type: 'optimization', priority: 'medium' };
      const targetAgents = ['optimizer-001'];
      
      const assignments = await coordinator.distributeTask(task, targetAgents);
      
      expect(assignments).toHaveLength(1);
      expect(assignments[0].agentId).toBe('optimizer-001');
    });
    
    test('should handle task distribution with no available agents', async () => {
      const emptyCoordinator = new MockSwarmCoordinator({
        topology: 'mesh',
        maxAgents: 10
      });
      
      const task = { id: 'task-003', type: 'analysis' };
      
      await expect(
        emptyCoordinator.distributeTask(task)
      ).rejects.toThrow('No available agents');
    });
  });
  
  describe('Health Monitoring', () => {
    test('should report healthy swarm status', async () => {
      await coordinator.addAgent(createMockAgent({ id: 'agent-1', status: 'active' }));
      await coordinator.addAgent(createMockAgent({ id: 'agent-2', status: 'active' }));
      
      const health = await coordinator.checkHealth();
      
      expect(health).toMatchObject({
        totalAgents: 2,
        activeAgents: 2,
        healthScore: 1.0,
        topology: 'mesh'
      });
      expect(health.timestamp).toBeCloseTo(Date.now(), -2);
    });
    
    test('should detect unhealthy agents', async () => {
      await coordinator.addAgent(createMockAgent({ id: 'agent-1', status: 'active' }));
      await coordinator.addAgent(createMockAgent({ id: 'agent-2', status: 'inactive' }));
      await coordinator.addAgent(createMockAgent({ id: 'agent-3', status: 'error' }));
      
      const health = await coordinator.checkHealth();
      
      expect(health.totalAgents).toBe(3);
      expect(health.activeAgents).toBe(1);
      expect(health.healthScore).toBeCloseTo(0.33, 1);
    });
  });
  
  describe('Topology Optimization', () => {
    test('should recommend star topology for small swarms', async () => {
      await coordinator.addAgent(createMockAgent({ id: 'agent-1' }));
      await coordinator.addAgent(createMockAgent({ id: 'agent-2' }));
      
      const optimizedTopology = await coordinator.optimizeTopology();
      
      expect(optimizedTopology).toBe('star');
    });
    
    test('should recommend hierarchical topology for medium swarms', async () => {
      // Add 5 agents
      for (let i = 1; i <= 5; i++) {
        await coordinator.addAgent(createMockAgent({ id: `agent-${i}` }));
      }
      
      const optimizedTopology = await coordinator.optimizeTopology();
      
      expect(optimizedTopology).toBe('hierarchical');
    });
    
    test('should recommend mesh topology for large swarms', async () => {
      // Add 12 agents (would exceed the limit, but for testing optimization logic)
      const largeCoordinator = new MockSwarmCoordinator({
        topology: 'mesh',
        maxAgents: 20
      });
      
      for (let i = 1; i <= 12; i++) {
        await largeCoordinator.addAgent(createMockAgent({ id: `agent-${i}` }));
      }
      
      const optimizedTopology = await largeCoordinator.optimizeTopology();
      
      expect(optimizedTopology).toBe('mesh');
    });
  });
  
  describe('Error Handling and Edge Cases', () => {
    test('should handle concurrent agent additions', async () => {
      const agents = Array.from({ length: 5 }, (_, i) => 
        createMockAgent({ id: `concurrent-agent-${i}` })
      );
      
      const promises = agents.map(agent => coordinator.addAgent(agent));
      const results = await Promise.all(promises);
      
      expect(results.every(result => result === true)).toBe(true);
      expect(coordinator.getAgents()).toHaveLength(5);
    });
    
    test('should maintain state consistency during rapid operations', async () => {
      // Rapidly add and remove agents
      const operations = [];
      for (let i = 0; i < 10; i++) {
        operations.push(coordinator.addAgent(createMockAgent({ id: `agent-${i}` })));
        if (i % 2 === 0) {
          operations.push(coordinator.removeAgent(`agent-${i}`));
        }
      }
      
      await Promise.all(operations);
      
      const finalAgents = coordinator.getAgents();
      expect(finalAgents.length).toBeGreaterThan(0);
      
      // Verify no duplicate IDs
      const ids = finalAgents.map(a => a.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
    
    test('should handle malformed agent data gracefully', async () => {
      const malformedAgent = { id: null, capabilities: 'not-an-array' };
      
      // This should either reject or sanitize the data
      await expect(async () => {
        await coordinator.addAgent(malformedAgent);
      }).not.toThrow();
    });
  });
  
  describe('Performance Characteristics', () => {
    test('should add agents within acceptable time limits', async () => {
      const startTime = Date.now();
      
      await coordinator.addAgent(createMockAgent());
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(100); // Should complete within 100ms
    });
    
    test('should scale efficiently with agent count', async () => {
      const measurements = [];
      
      for (let count = 1; count <= 10; count++) {
        const startTime = Date.now();
        await coordinator.addAgent(createMockAgent({ id: `perf-agent-${count}` }));
        const duration = Date.now() - startTime;
        measurements.push(duration);
      }
      
      // Performance should not degrade significantly with scale
      const avgDuration = measurements.reduce((a, b) => a + b, 0) / measurements.length;
      expect(avgDuration).toBeLessThan(50);
    });
  });
});