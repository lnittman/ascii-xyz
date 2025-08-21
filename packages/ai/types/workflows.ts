/**
 * Workflow execution input
 */
export interface WorkflowInput {
  id: string;
  input: any;
  agentId?: string;
  runtimeContext?: Record<string, any>;
}

/**
 * Workflow execution result
 */
export interface WorkflowResult {
  id: string;
  status: 'success' | 'error' | 'cancelled';
  output?: any;
  error?: Error;
  metadata?: WorkflowMetadata;
}

/**
 * Workflow metadata
 */
export interface WorkflowMetadata {
  startTime: string;
  endTime: string;
  duration: number;
  steps: WorkflowStep[];
}

/**
 * Workflow step information
 */
export interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: string;
  endTime?: string;
  output?: any;
  error?: Error;
}

/**
 * Workflow stream chunk
 */
export interface WorkflowStreamChunk {
  type: 'progress' | 'result' | 'error';
  data: any;
  timestamp: string;
}
