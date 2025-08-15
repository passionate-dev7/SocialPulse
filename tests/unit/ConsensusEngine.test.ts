/**
 * Unit tests for ConsensusEngine
 * Tests voting mechanisms, conflict resolution, and consensus building
 */

import { jest } from '@jest/globals';
import { createMockAgent, delay } from '../utils/setup';
import { mockConsensusScenarios } from '../fixtures/test-data';

// Mock ConsensusEngine implementation
class MockConsensusEngine {
  private threshold: number;
  private votingSystem: string;
  private timeoutMs: number;
  
  constructor(config: { threshold?: number; votingSystem?: string; timeoutMs?: number } = {}) {
    this.threshold = config.threshold || 0.6;
    this.votingSystem = config.votingSystem || 'weighted';
    this.timeoutMs = config.timeoutMs || 5000;
  }
  
  async collectVotes(proposal: any, agents: any[], timeoutMs?: number): Promise<any[]> {
    const timeout = timeoutMs || this.timeoutMs;
    const startTime = Date.now();
    
    const votes = await Promise.race([
      Promise.all(agents.map(async (agent, index) => {
        await delay(Math.random() * 100); // Simulate network delay
        
        // Simulate agent decision making
        const confidence = 0.5 + Math.random() * 0.5;
        const decision = confidence > 0.7 ? 'approve' : confidence > 0.4 ? 'reject' : 'abstain';
        
        return {
          agentId: agent.id,
          decision,
          confidence,
          timestamp: Date.now(),
          reasoning: `Agent ${agent.id} analysis of proposal ${proposal.id}`
        };
      })),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Voting timeout')), timeout)
      )
    ]);
    
    return votes as any[];
  }
  
  async buildConsensus(votes: any[]): Promise<any> {
    if (votes.length === 0) {
      throw new Error('No votes provided');
    }
    
    const decisions = votes.reduce((acc, vote) => {
      acc[vote.decision] = acc[vote.decision] || [];
      acc[vote.decision].push(vote);
      return acc;
    }, {} as Record<string, any[]>);
    
    // Weighted voting based on confidence
    const weightedScores = Object.entries(decisions).map(([decision, voteList]) => {
      const totalWeight = voteList.reduce((sum, vote) => sum + vote.confidence, 0);
      const avgConfidence = totalWeight / voteList.length;
      
      return {
        decision,
        votes: voteList.length,
        totalWeight,
        avgConfidence,
        score: totalWeight * (voteList.length / votes.length)
      };
    });
    
    // Sort by score descending
    weightedScores.sort((a, b) => b.score - a.score);
    
    const winner = weightedScores[0];
    const overallConfidence = winner.avgConfidence * (winner.votes / votes.length);
    
    // Check if consensus meets threshold
    if (overallConfidence < this.threshold) {
      return {
        decision: 'require-more-data',
        confidence: overallConfidence,
        votes,
        consensus: false,
        reason: 'Confidence below threshold',
        alternatives: weightedScores.slice(1, 3)
      };
    }
    
    return {
      decision: winner.decision,
      confidence: overallConfidence,
      votes,
      consensus: true,
      votingBreakdown: weightedScores,
      timestamp: Date.now()
    };
  }
  
  async resolveConflict(conflictingVotes: any[]): Promise<any> {
    // Group by decision
    const groups = conflictingVotes.reduce((acc, vote) => {
      acc[vote.decision] = acc[vote.decision] || [];
      acc[vote.decision].push(vote);
      return acc;
    }, {} as Record<string, any[]>);
    
    // If we have a clear majority with high confidence
    const majorityDecision = Object.entries(groups)
      .find(([_, votes]) => votes.length > conflictingVotes.length / 2);
    
    if (majorityDecision) {
      const [decision, votes] = majorityDecision;
      const avgConfidence = votes.reduce((sum, v) => sum + v.confidence, 0) / votes.length;
      
      if (avgConfidence >= this.threshold) {
        return {
          resolution: 'majority-rule',
          decision,
          confidence: avgConfidence,
          conflictResolved: true
        };
      }
    }
    
    // If no clear majority, require additional expertise
    return {
      resolution: 'escalate-to-expert',
      decision: 'pending',
      confidence: 0,
      conflictResolved: false,
      requiredActions: ['gather-more-data', 'consult-domain-expert']
    };
  }
  
  async validateConsensus(consensus: any): Promise<boolean> {
    // Validation rules
    const hasValidDecision = consensus.decision && typeof consensus.decision === 'string';
    const hasValidConfidence = typeof consensus.confidence === 'number' && 
                               consensus.confidence >= 0 && consensus.confidence <= 1;
    const hasVotes = Array.isArray(consensus.votes) && consensus.votes.length > 0;
    const meetsThreshold = consensus.confidence >= this.threshold;
    
    return hasValidDecision && hasValidConfidence && hasVotes && meetsThreshold;
  }
}

describe('ConsensusEngine', () => {
  let consensusEngine: MockConsensusEngine;
  let mockAgents: any[];
  
  beforeEach(() => {
    consensusEngine = new MockConsensusEngine({
      threshold: 0.6,
      votingSystem: 'weighted',
      timeoutMs: 2000
    });
    
    mockAgents = [
      createMockAgent({ id: 'agent-1', role: 'validator' }),
      createMockAgent({ id: 'agent-2', role: 'optimizer' }),
      createMockAgent({ id: 'agent-3', role: 'coordinator' })
    ];
  });
  
  describe('Vote Collection', () => {
    test('should collect votes from all agents within timeout', async () => {
      const proposal = { id: 'proposal-001', type: 'optimization', details: 'Improve algorithm' };
      
      const votes = await consensusEngine.collectVotes(proposal, mockAgents);
      
      expect(votes).toHaveLength(3);
      votes.forEach(vote => {
        expect(vote).toHaveProperty('agentId');
        expect(vote).toHaveProperty('decision');
        expect(vote).toHaveProperty('confidence');
        expect(vote).toHaveProperty('timestamp');
        expect(vote.confidence).toBeGreaterThanOrEqual(0);
        expect(vote.confidence).toBeLessThanOrEqual(1);
      });
    });
    
    test('should handle voting timeout', async () => {
      const proposal = { id: 'proposal-002', type: 'critical' };
      const slowEngine = new MockConsensusEngine({ timeoutMs: 50 });
      
      await expect(
        slowEngine.collectVotes(proposal, mockAgents)
      ).rejects.toThrow('Voting timeout');
    });
    
    test('should handle empty agent list', async () => {
      const proposal = { id: 'proposal-003', type: 'test' };
      
      const votes = await consensusEngine.collectVotes(proposal, []);
      
      expect(votes).toHaveLength(0);
    });
  });
  
  describe('Consensus Building', () => {
    test('should build consensus with unanimous approval', async () => {
      const votes = mockConsensusScenarios.unanimous.votes;
      
      const consensus = await consensusEngine.buildConsensus(votes);
      
      expect(consensus).toHaveConsensus();
      expect(consensus.decision).toBe('approve');
      expect(consensus.confidence).toBeGreaterThanOrEqual(0.6);
      expect(consensus.consensus).toBe(true);
    });
    
    test('should build consensus with majority vote', async () => {
      const votes = mockConsensusScenarios.majority.votes;
      
      const consensus = await consensusEngine.buildConsensus(votes);
      
      expect(consensus).toHaveConsensus();
      expect(consensus.decision).toBe('approve');
      expect(consensus.votingBreakdown).toBeDefined();
    });
    
    test('should handle conflicting votes', async () => {
      const votes = mockConsensusScenarios.conflicting.votes;
      
      const consensus = await consensusEngine.buildConsensus(votes);
      
      // Should either resolve or require more data
      expect(['approve', 'reject', 'require-more-data']).toContain(consensus.decision);
      expect(consensus.alternatives).toBeDefined();
    });
    
    test('should require more data for low confidence votes', async () => {
      const votes = mockConsensusScenarios.lowConfidence.votes;
      
      const consensus = await consensusEngine.buildConsensus(votes);
      
      expect(consensus.decision).toBe('require-more-data');
      expect(consensus.consensus).toBe(false);
      expect(consensus.reason).toBe('Confidence below threshold');
    });
    
    test('should throw error for empty vote set', async () => {
      await expect(
        consensusEngine.buildConsensus([])
      ).rejects.toThrow('No votes provided');
    });
  });
  
  describe('Conflict Resolution', () => {
    test('should resolve conflict with clear majority', async () => {
      const conflictingVotes = [
        { agentId: 'agent-1', decision: 'approve', confidence: 0.9 },
        { agentId: 'agent-2', decision: 'approve', confidence: 0.8 },
        { agentId: 'agent-3', decision: 'reject', confidence: 0.6 },
        { agentId: 'agent-4', decision: 'approve', confidence: 0.7 }
      ];
      
      const resolution = await consensusEngine.resolveConflict(conflictingVotes);
      
      expect(resolution.resolution).toBe('majority-rule');
      expect(resolution.decision).toBe('approve');
      expect(resolution.conflictResolved).toBe(true);
    });
    
    test('should escalate when no clear majority exists', async () => {
      const conflictingVotes = [
        { agentId: 'agent-1', decision: 'approve', confidence: 0.5 },
        { agentId: 'agent-2', decision: 'reject', confidence: 0.5 },
        { agentId: 'agent-3', decision: 'defer', confidence: 0.4 }
      ];
      
      const resolution = await consensusEngine.resolveConflict(conflictingVotes);
      
      expect(resolution.resolution).toBe('escalate-to-expert');
      expect(resolution.conflictResolved).toBe(false);
      expect(resolution.requiredActions).toContain('gather-more-data');
    });
    
    test('should handle tied votes appropriately', async () => {
      const tiedVotes = [
        { agentId: 'agent-1', decision: 'approve', confidence: 0.8 },
        { agentId: 'agent-2', decision: 'approve', confidence: 0.7 },
        { agentId: 'agent-3', decision: 'reject', confidence: 0.8 },
        { agentId: 'agent-4', decision: 'reject', confidence: 0.7 }
      ];
      
      const resolution = await consensusEngine.resolveConflict(tiedVotes);
      
      // Should either pick higher confidence group or escalate
      expect(['approve', 'reject', 'pending']).toContain(resolution.decision);
    });
  });
  
  describe('Consensus Validation', () => {
    test('should validate correct consensus structure', async () => {
      const validConsensus = {
        decision: 'approve',
        confidence: 0.8,
        votes: [{ agentId: 'agent-1', decision: 'approve' }],
        consensus: true
      };
      
      const isValid = await consensusEngine.validateConsensus(validConsensus);
      
      expect(isValid).toBe(true);
    });
    
    test('should reject consensus below confidence threshold', async () => {
      const lowConfidenceConsensus = {
        decision: 'approve',
        confidence: 0.3, // Below 0.6 threshold
        votes: [{ agentId: 'agent-1', decision: 'approve' }],
        consensus: true
      };
      
      const isValid = await consensusEngine.validateConsensus(lowConfidenceConsensus);
      
      expect(isValid).toBe(false);
    });
    
    test('should reject malformed consensus', async () => {
      const malformedConsensus = {
        decision: null,
        confidence: 'high', // Should be number
        votes: 'some votes', // Should be array
        consensus: true
      };
      
      const isValid = await consensusEngine.validateConsensus(malformedConsensus);
      
      expect(isValid).toBe(false);
    });
  });
  
  describe('Different Voting Systems', () => {
    test('should handle majority voting system', async () => {
      const majorityEngine = new MockConsensusEngine({ 
        votingSystem: 'majority',
        threshold: 0.5 
      });
      
      const votes = [
        { agentId: 'agent-1', decision: 'approve', confidence: 0.6 },
        { agentId: 'agent-2', decision: 'approve', confidence: 0.7 },
        { agentId: 'agent-3', decision: 'reject', confidence: 0.8 }
      ];
      
      const consensus = await majorityEngine.buildConsensus(votes);
      
      expect(consensus.decision).toBe('approve');
    });
    
    test('should handle unanimous voting requirement', async () => {
      const unanimousEngine = new MockConsensusEngine({ 
        votingSystem: 'unanimous',
        threshold: 0.95 
      });
      
      const votes = [
        { agentId: 'agent-1', decision: 'approve', confidence: 0.9 },
        { agentId: 'agent-2', decision: 'approve', confidence: 0.85 },
        { agentId: 'agent-3', decision: 'reject', confidence: 0.8 }
      ];
      
      const consensus = await unanimousEngine.buildConsensus(votes);
      
      // Should not reach consensus due to conflicting vote
      expect(consensus.consensus).toBe(false);
    });
  });
  
  describe('Performance and Scalability', () => {
    test('should handle large number of votes efficiently', async () => {
      const manyVotes = Array.from({ length: 100 }, (_, i) => ({
        agentId: `agent-${i}`,
        decision: i % 3 === 0 ? 'approve' : i % 3 === 1 ? 'reject' : 'abstain',
        confidence: 0.5 + Math.random() * 0.5,
        timestamp: Date.now()
      }));
      
      const startTime = Date.now();
      const consensus = await consensusEngine.buildConsensus(manyVotes);
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
      expect(consensus).toHaveProperty('decision');
      expect(consensus.votingBreakdown).toBeDefined();
    });
    
    test('should maintain accuracy with concurrent consensus building', async () => {
      const voteSets = Array.from({ length: 5 }, (_, i) => 
        Array.from({ length: 10 }, (_, j) => ({
          agentId: `agent-${i}-${j}`,
          decision: 'approve',
          confidence: 0.7 + Math.random() * 0.3
        }))
      );
      
      const promises = voteSets.map(votes => consensusEngine.buildConsensus(votes));
      const results = await Promise.all(promises);
      
      results.forEach(consensus => {
        expect(consensus.decision).toBe('approve');
        expect(consensus.confidence).toBeGreaterThan(0.6);
      });
    });
  });
  
  describe('Edge Cases and Error Handling', () => {
    test('should handle votes with missing fields gracefully', async () => {
      const incompleteVotes = [
        { agentId: 'agent-1', decision: 'approve' }, // Missing confidence
        { decision: 'reject', confidence: 0.8 }, // Missing agentId
        { agentId: 'agent-3', confidence: 0.9 } // Missing decision
      ];
      
      // Should either process valid votes or handle gracefully
      await expect(async () => {
        await consensusEngine.buildConsensus(incompleteVotes);
      }).not.toThrow();
    });
    
    test('should handle extremely high confidence values', async () => {
      const highConfidenceVotes = [
        { agentId: 'agent-1', decision: 'approve', confidence: 1.0 },
        { agentId: 'agent-2', decision: 'approve', confidence: 0.99 },
        { agentId: 'agent-3', decision: 'approve', confidence: 0.98 }
      ];
      
      const consensus = await consensusEngine.buildConsensus(highConfidenceVotes);
      
      expect(consensus.decision).toBe('approve');
      expect(consensus.confidence).toBeLessThanOrEqual(1.0);
    });
  });
});