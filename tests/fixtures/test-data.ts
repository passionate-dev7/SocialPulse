/**
 * Test fixtures and mock data for swarm intelligence tests
 */

export const mockAgentConfigurations = {
  researcher: {
    id: 'researcher-001',
    role: 'researcher',
    capabilities: ['data-analysis', 'pattern-recognition', 'knowledge-synthesis'],
    cognitivePattern: 'analytical',
    specialization: 'information-processing',
    learningRate: 0.7,
    confidence: 0.85
  },
  
  coordinator: {
    id: 'coordinator-001', 
    role: 'coordinator',
    capabilities: ['task-distribution', 'resource-allocation', 'conflict-resolution'],
    cognitivePattern: 'systems-thinking',
    specialization: 'orchestration',
    learningRate: 0.6,
    confidence: 0.9
  },
  
  optimizer: {
    id: 'optimizer-001',
    role: 'optimizer', 
    capabilities: ['performance-tuning', 'efficiency-analysis', 'bottleneck-detection'],
    cognitivePattern: 'convergent',
    specialization: 'optimization',
    learningRate: 0.8,
    confidence: 0.75
  },
  
  validator: {
    id: 'validator-001',
    role: 'validator',
    capabilities: ['quality-assurance', 'error-detection', 'compliance-checking'],
    cognitivePattern: 'critical',
    specialization: 'validation',
    learningRate: 0.5,
    confidence: 0.95
  }
};

export const mockConsensusScenarios = {
  unanimous: {
    votes: [
      { agentId: 'agent-1', decision: 'approve', confidence: 0.9 },
      { agentId: 'agent-2', decision: 'approve', confidence: 0.85 },
      { agentId: 'agent-3', decision: 'approve', confidence: 0.8 }
    ],
    expectedOutcome: 'approve',
    expectedConfidence: 0.85
  },
  
  majority: {
    votes: [
      { agentId: 'agent-1', decision: 'approve', confidence: 0.9 },
      { agentId: 'agent-2', decision: 'approve', confidence: 0.7 },
      { agentId: 'agent-3', decision: 'reject', confidence: 0.6 }
    ],
    expectedOutcome: 'approve',
    expectedConfidence: 0.8
  },
  
  conflicting: {
    votes: [
      { agentId: 'agent-1', decision: 'approve', confidence: 0.6 },
      { agentId: 'agent-2', decision: 'reject', confidence: 0.8 },
      { agentId: 'agent-3', decision: 'defer', confidence: 0.4 }
    ],
    expectedOutcome: 'reject',
    expectedConfidence: 0.6
  },
  
  lowConfidence: {
    votes: [
      { agentId: 'agent-1', decision: 'approve', confidence: 0.3 },
      { agentId: 'agent-2', decision: 'approve', confidence: 0.4 },
      { agentId: 'agent-3', decision: 'approve', confidence: 0.2 }
    ],
    expectedOutcome: 'require-more-data',
    expectedConfidence: 0.3
  }
};

export const mockNeuralPatterns = {
  patternRecognition: {
    type: 'pattern-recognition',
    data: [
      [0.1, 0.9, 0.2, 0.8],
      [0.15, 0.85, 0.25, 0.75],
      [0.12, 0.88, 0.22, 0.78]
    ],
    expectedSimilarity: 0.95
  },
  
  learningAdaptation: {
    type: 'learning-adaptation',
    beforeTraining: { accuracy: 0.6, efficiency: 0.5 },
    trainingData: [
      { input: [1, 0, 1], output: [0.8] },
      { input: [0, 1, 1], output: [0.9] },
      { input: [1, 1, 0], output: [0.7] }
    ],
    expectedImprovement: 0.2
  },
  
  knowledgeTransfer: {
    type: 'knowledge-transfer',
    sourceAgent: 'expert-001',
    targetAgent: 'novice-001',
    knowledge: {
      domain: 'optimization',
      patterns: ['efficiency-heuristics', 'resource-allocation'],
      confidence: 0.9
    },
    expectedTransferRate: 0.75
  }
};

export const mockMemoryOperations = {
  store: [
    { key: 'task-001', value: { status: 'completed', result: 'success' }, namespace: 'tasks' },
    { key: 'agent-performance', value: { efficiency: 0.85, accuracy: 0.9 }, namespace: 'metrics' },
    { key: 'learned-pattern', value: { type: 'optimization', confidence: 0.8 }, namespace: 'knowledge' }
  ],
  
  retrieve: [
    { key: 'task-001', namespace: 'tasks', expected: { status: 'completed', result: 'success' } },
    { key: 'nonexistent', namespace: 'tasks', expected: null }
  ],
  
  consistency: {
    scenario: 'concurrent-updates',
    operations: [
      { type: 'store', key: 'shared-counter', value: 1 },
      { type: 'update', key: 'shared-counter', value: 2 },
      { type: 'store', key: 'shared-counter', value: 3 }
    ],
    expectedFinalValue: 3
  }
};

export const stressTestScenarios = {
  highLoad: {
    agentCount: 50,
    tasksPerAgent: 100,
    operationsPerSecond: 1000,
    duration: 60000 // 1 minute
  },
  
  scaleOut: {
    initialAgents: 5,
    maxAgents: 100,
    scalingInterval: 5000, // 5 seconds
    taskComplexity: 'high'
  },
  
  memoryStress: {
    memoryOperations: 10000,
    dataSize: '1MB',
    concurrentReads: 50,
    concurrentWrites: 20
  },
  
  networkPartition: {
    agentGroups: 3,
    partitionDuration: 30000, // 30 seconds
    healingTime: 10000 // 10 seconds
  }
};

export const performanceThresholds = {
  consensusTime: 1000, // ms
  memoryOperationTime: 100, // ms
  patternSyncTime: 500, // ms
  agentResponseTime: 200, // ms
  systemThroughput: 1000, // operations/second
  memoryConsistency: 0.99,
  learningEfficiency: 0.8
};