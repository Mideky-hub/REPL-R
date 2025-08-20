// Studio Types
export interface Agent {
  id: string
  type: 'agent'
  position: { x: number; y: number }
  config: AgentConfig
  status: AgentStatus
  connections: {
    inputs: string[]
    outputs: string[]
  }
}

export interface AgentConfig {
  role: string
  goal: string
  backstory: string
  systemPrompt?: string
  model?: string
  department?: string
  tools: string[]
}

export type AgentStatus = 'idle' | 'pending' | 'running' | 'completed' | 'failed'

export interface Connection {
  id: string
  source_agent_id: string
  target_agent_id: string
  source_type: 'input' | 'output'
  target_type: 'input' | 'output'
  config: ConnectionConfig
}

export interface ConnectionConfig {
  data_mapping: string
  transformations: ConnectionTransformation[]
  auto_generated?: boolean
  connection_type?: string
}

export interface ConnectionTransformation {
  type: 'filter' | 'map' | 'reduce'
  config: Record<string, any>
}

export interface CanvasPosition {
  x: number
  y: number
  zoom: number
}

export interface Tool {
  id: string
  name: string
  description: string
  category: 'search' | 'database' | 'file' | 'communication' | 'analysis' | 'other'
  config?: Record<string, any>
}

export interface CrewDefinition {
  id?: string
  name: string
  description?: string
  agents: Agent[]
  connections: Connection[]
  departments?: TeamDepartment[]
  created_at?: Date
  updated_at?: Date
}

export interface TeamDepartment {
  id: string
  name: string
  description?: string
  goal?: string
  tools?: string[]
  lead: Agent | null
  members: Agent[]
  objectives: string[]
  color: string
}

export interface CrewExecution {
  id: string
  status: 'idle' | 'running' | 'completed' | 'error'
  startTime?: Date
  endTime?: Date
  agents: AgentExecution[]
}

export interface AgentExecution {
  agentId: string
  status: AgentStatus
  startTime?: Date
  endTime?: Date
  logs: ExecutionLog[]
  metrics: {
    tokensUsed: number
    cost: number
    duration: number
  }
}

export interface ExecutionLog {
  timestamp: Date
  level: 'info' | 'warning' | 'error'
  message: string
  data?: Record<string, any>
}

// Canvas interaction types
export interface DragItem {
  type: 'component' | 'agent'
  id: string
  data?: any
}

export interface DropResult {
  position: { x: number; y: number }
  targetId?: string
}

// API Response Types
export interface DashboardMetrics {
  total_traces: number
  active_agents: number
  total_cost: number
  avg_latency: number
  period: string
}

export interface TokenUsagePoint {
  timestamp: string
  tokens: number
}

export interface CostBreakdownItem {
  model_name: string
  cost: number
  percentage: number
  color: string
}

export interface TraceListItem {
  id: string
  name: string
  start_time: string
  duration: number
  status: 'completed' | 'failed' | 'running' | 'cancelled'
  agents: number
  tasks: number
  tokens: number
  cost: number
  environment: string
}
