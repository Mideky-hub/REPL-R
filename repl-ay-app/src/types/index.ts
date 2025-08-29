// Types for our rapid prototyping
export interface User {
  id: string
  email: string
  tier: UserTier
  messagesUsedToday: number
  createdAt: Date
}

export type UserTier = 'curious' | 'free' | 'essential' | 'developer' | 'founder' | 'pro'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface ChatSession {
  id: string
  messages: ChatMessage[]
  title: string
  createdAt: Date
  updatedAt: Date
}

export interface AgentCrewWorkflow {
  id: string
  name: string
  description: string
  steps: WorkflowStep[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface WorkflowStep {
  id: string
  type: 'agent' | 'trigger' | 'condition'
  position: { x: number; y: number }
  data: {
    role?: string
    goal?: string
    backstory?: string
    tools?: string[]
  }
  connections: string[] // IDs of connected steps
}

export interface PricingTier {
  name: string
  price: number
  currency: string
  interval: 'week' | 'month' | 'year'
  features: string[]
  limits: {
    messagesPerDay?: number
    parallelChats?: number
    agentCrews?: number
    executions?: number
  }
}

// Navigation types
export type NavigationMode = 'chat' | 'prompt-studio' | 'agent-crew-studio' | 'whitelist'
export type ChatMode = 'normal' | 'parallel'
export type ChatViewMode = 'fullscreen' | 'compact'

// Parallel chat types
export interface ParallelChatInstance {
  id: string
  title: string
  messages: ChatMessage[]
  prompt: string
  deepResearch: boolean
  isLoading: boolean
}

export interface ChatSettings {
  mode: ChatMode
  viewMode: ChatViewMode
  parallelInstances: ParallelChatInstance[]
  deepResearch: boolean
}

// Conversation history types
export interface ConversationPreview {
  id: string
  title: string
  preview: string
  date: string
  messageCount: number
  lastMessageAt: Date
}