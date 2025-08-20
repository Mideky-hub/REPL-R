'use client'

import { useState, useEffect } from 'react'
import { Agent, Connection, ExecutionLog } from '@/types/studio'
import { studioApi } from '@/lib/api'
import { 
  Activity, 
  Clock,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Eye,
  ChevronUp,
  ChevronDown,
  Zap,
  MessageSquare,
  Terminal,
  Loader
} from 'lucide-react'

interface ExecutionPanelProps {
  agents: Agent[]
  connections: Connection[]
  executionId?: string
  executionState: 'idle' | 'running' | 'completed' | 'error'
  onAgentClick: (agent: Agent) => void
}

interface ExecutionMetrics {
  execution_id: string
  crew_id: string
  status: 'idle' | 'running' | 'completed' | 'error'
  start_time: string
  end_time?: string
  agents: Array<{
    agent_id: string
    status: 'idle' | 'pending' | 'running' | 'completed' | 'failed'
    start_time?: string
    end_time?: string
    tokens_used: number
    cost: number
    duration_ms: number
    logs: Array<Record<string, any>>
  }>
  total_tokens: number
  total_cost: number
  result?: Record<string, any>
  error_message?: string
}

export function ExecutionPanel({ agents, connections, executionId, executionState, onAgentClick }: ExecutionPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [showLogs, setShowLogs] = useState(true)
  const [executionMetrics, setExecutionMetrics] = useState<ExecutionMetrics | null>(null)
  const [loading, setLoading] = useState(false)

  // Fetch execution status from backend
  useEffect(() => {
    if (executionId && executionState === 'running') {
      const interval = setInterval(async () => {
        try {
          setLoading(true)
          const metrics = await studioApi.getExecutionStatus(executionId)
          setExecutionMetrics(metrics)
          
          // Stop polling if execution is complete
          if (metrics.status === 'completed' || metrics.status === 'error') {
            clearInterval(interval)
          }
        } catch (error) {
          console.error('Failed to fetch execution status:', error)
        } finally {
          setLoading(false)
        }
      }, 2000) // Poll every 2 seconds

      return () => clearInterval(interval)
    }
  }, [executionId, executionState])

  // Get agent metrics for display
  const getAgentMetrics = (agentId: string) => {
    if (!executionMetrics) return null
    return executionMetrics.agents.find(a => a.agent_id === agentId)
  }

  // Update agent status based on backend metrics
  const getAgentStatus = (agent: Agent) => {
    const metrics = getAgentMetrics(agent.id)
    if (metrics) {
      return metrics.status
    }
    return agent.status
  }

  const runningAgents = agents.filter(agent => getAgentStatus(agent) === 'running')
  const completedAgents = agents.filter(agent => getAgentStatus(agent) === 'completed')
  const failedAgents = agents.filter(agent => getAgentStatus(agent) === 'failed')

  const handleAgentClick = (agent: Agent) => {
    setSelectedAgentId(agent.id)
    onAgentClick(agent)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-blue-500'
      case 'completed': return 'text-green-500'
      case 'failed': return 'text-red-500'
      case 'pending': return 'text-yellow-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-100 dark:bg-blue-900'
      case 'completed': return 'bg-green-100 dark:bg-green-900'
      case 'failed': return 'bg-red-100 dark:bg-red-900'
      case 'pending': return 'bg-yellow-100 dark:bg-yellow-900'
      default: return 'bg-gray-100 dark:bg-gray-700'
    }
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    const seconds = Math.floor(ms / 1000)
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const selectedAgent = selectedAgentId ? agents.find(a => a.id === selectedAgentId) : null
  const selectedAgentMetrics = selectedAgentId ? getAgentMetrics(selectedAgentId) : null

  return (
    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
      {/* Header */}
      <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Activity className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Execution Monitor
            </h3>
            <div className="flex items-center space-x-2 text-sm">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                executionState === 'running' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                executionState === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                executionState === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}>
                {executionState.charAt(0).toUpperCase() + executionState.slice(1)}
              </span>
              {loading && (
                <Loader className="h-4 w-4 animate-spin text-blue-500" />
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Metrics */}
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
              <span>Running: {runningAgents.length}</span>
              <span>Completed: {completedAgents.length}</span>
              {failedAgents.length > 0 && (
                <span className="text-red-600">Failed: {failedAgents.length}</span>
              )}
              {executionMetrics && (
                <>
                  <span>Tokens: {executionMetrics.total_tokens.toLocaleString()}</span>
                  <span>Cost: ${executionMetrics.total_cost.toFixed(4)}</span>
                </>
              )}
            </div>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {isExpanded ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronUp className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="flex h-64">
          {/* Agent Status List */}
          <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Agent Status
              </h4>
              <div className="space-y-2">
                {agents.map(agent => {
                  const agentStatus = getAgentStatus(agent)
                  const agentMetrics = getAgentMetrics(agent.id)
                  
                  const StatusIcon = agentStatus === 'running' ? Play :
                                   agentStatus === 'completed' ? CheckCircle :
                                   agentStatus === 'failed' ? XCircle :
                                   agentStatus === 'pending' ? Clock : 
                                   Pause

                  return (
                    <button
                      key={agent.id}
                      onClick={() => handleAgentClick(agent)}
                      className={`
                        w-full p-3 text-left rounded-md transition-colors
                        ${selectedAgentId === agent.id 
                          ? 'bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-600' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-1 rounded-full ${getStatusBg(agentStatus)}`}>
                          <StatusIcon className={`h-3 w-3 ${getStatusColor(agentStatus)}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-gray-900 dark:text-white truncate block">
                            {agent.config.role}
                          </span>
                          <div className="flex items-center space-x-2 text-xs">
                            <span className={`${getStatusColor(agentStatus)} capitalize`}>
                              {agentStatus}
                            </span>
                            {agentMetrics && agentMetrics.duration_ms > 0 && (
                              <span className="text-gray-500">
                                • {formatDuration(agentMetrics.duration_ms)}
                              </span>
                            )}
                          </div>
                        </div>
                        {agentStatus === 'running' && (
                          <div className="flex space-x-1">
                            <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
                            <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse delay-75" />
                            <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse delay-150" />
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Agent Details & Logs */}
          <div className="flex-1 flex flex-col">
            {selectedAgent ? (
              <>
                {/* Agent Details Header */}
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedAgent.config.role}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Agent ID: {selectedAgentId}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3 text-xs">
                      <button
                        onClick={() => setShowLogs(!showLogs)}
                        className={`flex items-center space-x-1 px-2 py-1 rounded ${
                          showLogs ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        <Terminal className="h-3 w-3" />
                        <span>Logs</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Logs */}
                {showLogs && (
                  <div className="flex-1 overflow-y-auto bg-gray-900 text-green-400 font-mono text-xs">
                    <div className="p-4">
                      {selectedAgentMetrics?.logs && selectedAgentMetrics.logs.length > 0 ? (
                        selectedAgentMetrics.logs.map((log, index) => (
                          <div key={index} className="mb-2 flex">
                            <span className="text-gray-500 mr-3 flex-shrink-0">
                              {new Date().toLocaleTimeString()}
                            </span>
                            <span className="text-blue-400 mr-2 flex-shrink-0">
                              [INFO]
                            </span>
                            <span className="text-green-400">{JSON.stringify(log)}</span>
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="mb-2 flex">
                            <span className="text-gray-500 mr-3 flex-shrink-0">
                              {new Date().toLocaleTimeString()}
                            </span>
                            <span className="text-blue-400 mr-2 flex-shrink-0">
                              [INFO]
                            </span>
                            <span className="text-green-400">Agent initialized and ready</span>
                          </div>
                          <div className="mb-2 flex">
                            <span className="text-gray-500 mr-3 flex-shrink-0">
                              {new Date(Date.now() - 1000).toLocaleTimeString()}
                            </span>
                            <span className="text-blue-400 mr-2 flex-shrink-0">
                              [INFO]
                            </span>
                            <span className="text-green-400">Starting task execution...</span>
                          </div>
                        </>
                      )}
                      
                      {/* Live cursor for running agents */}
                      {getAgentStatus(selectedAgent) === 'running' && (
                        <div className="flex items-center">
                          <span className="text-gray-500 mr-3">
                            {new Date().toLocaleTimeString()}
                          </span>
                          <span className="text-blue-400 mr-2">[INFO]</span>
                          <span className="text-green-400">Processing...</span>
                          <span className="ml-2 animate-pulse">▌</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Real-time Metrics */}
                <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {selectedAgentMetrics?.duration_ms ? formatDuration(selectedAgentMetrics.duration_ms) : '0s'}
                        </span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Zap className="h-3 w-3" />
                        <span>{selectedAgentMetrics?.tokens_used?.toLocaleString() || 0} tokens</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>LLM calls</span>
                      </span>
                    </div>
                    <span>${selectedAgentMetrics?.cost?.toFixed(4) || '0.0000'}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Select an agent to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
