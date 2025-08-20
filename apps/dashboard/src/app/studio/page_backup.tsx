'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { 
  Play, 
  Plus, 
  Save, 
  Upload, 
  Download, 
  Settings, 
  ArrowLeft, 
  AlertCircle,
  Users,
  Target,
  GitBranch,
  Calendar,
  CheckCircle,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { StudioCanvas } from '@/components/studio/StudioCanvas'
import { TeamHierarchyPanel } from '@/components/studio/TeamHierarchyPanel'
import { AgentConfigPanel } from '@/components/studio/AgentConfigPanel'
import { ExecutionPanel } from '@/components/studio/ExecutionPanel'
import { Agent, Connection, CanvasPosition } from '@/types/studio'
import { studioApi } from '@/lib/api'

type StudioView = 'hierarchy' | 'canvas' | 'configuration'

export default function StudioPage() {
  const searchParams = useSearchParams()
  const crewParam = searchParams.get('crew')
  
  const [agents, setAgents] = useState<Agent[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [executionState, setExecutionState] = useState<'idle' | 'running' | 'completed' | 'error'>('idle')
  const [canvasPosition, setCanvasPosition] = useState<CanvasPosition>({ x: 0, y: 0, zoom: 1 })
  const [crewName, setCrewName] = useState('New Team')
  const [crewDescription, setCrewDescription] = useState('')
  const [currentCrewId, setCurrentCrewId] = useState<string | null>(crewParam)
  const [currentExecutionId, setCurrentExecutionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<StudioView>('hierarchy')

  // Team organization structure
  const [teamStructure, setTeamStructure] = useState({
    manager: null as Agent | null,
    departments: [] as Array<{
      id: string
      name: string
      lead: Agent | null
      members: Agent[]
      objectives: string[]
    }>
  })

  // Load crew if editing existing one
  useEffect(() => {
    if (crewParam) {
      loadCrew(crewParam)
    }
  }, [crewParam])

  // Polling for execution status
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (currentExecutionId && isRunning) {
      interval = setInterval(async () => {
        try {
          const status = await studioApi.getExecutionStatus(currentExecutionId)
          
          // Update agent statuses
          setAgents(prev => prev.map(agent => {
            const agentStatus = status.agents.find(a => a.agent_id === agent.id)
            if (agentStatus) {
              return { ...agent, status: agentStatus.status }
            }
            return agent
          }))

          // Check if execution is complete
          if (status.status === 'completed' || status.status === 'error') {
            setIsRunning(false)
            setExecutionState(status.status)
            if (interval) clearInterval(interval)
          }
        } catch (err) {
          console.error('Failed to get execution status:', err)
        }
      }, 2000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [currentExecutionId, isRunning])
        }
      }, 2000) // Poll every 2 seconds
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [currentExecutionId, isRunning])

  // Handle adding new agent to canvas
  const handleAddAgent = useCallback((position: { x: number; y: number }) => {
    const newAgent: Agent = {
      id: `agent-${Date.now()}`,
      type: 'agent',
      position,
      config: {
        role: 'New Agent',
        goal: 'Define your agent\'s goal here',
        backstory: 'Provide context and personality for this agent',
        systemPrompt: '',
        tools: []
      },
      status: 'idle',
      connections: { inputs: [], outputs: [] }
    }
    
    setAgents(prev => [...prev, newAgent])
    setSelectedAgent(newAgent)
  }, [])

  // Handle updating agent configuration
  const handleUpdateAgent = useCallback((agentId: string, updates: Partial<Agent>) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId ? { ...agent, ...updates } : agent
    ))
    
    if (selectedAgent?.id === agentId) {
      setSelectedAgent((prev: Agent | null) => prev ? { ...prev, ...updates } as Agent : null)
    }
  }, [selectedAgent])

  // Handle deleting agent
  const handleDeleteAgent = useCallback((agentId: string) => {
    setAgents(prev => prev.filter(agent => agent.id !== agentId))
    setConnections(prev => prev.filter(conn => 
      conn.sourceAgentId !== agentId && conn.targetAgentId !== agentId
    ))
    
    if (selectedAgent?.id === agentId) {
      setSelectedAgent(null)
    }
  }, [selectedAgent])

  // Handle creating connections between agents
  const handleCreateConnection = useCallback((sourceId: string, targetId: string, sourceType: 'input' | 'output', targetType: 'input' | 'output') => {
    const newConnection: Connection = {
      id: `connection-${Date.now()}`,
      sourceAgentId: sourceId,
      targetAgentId: targetId,
      sourceType,
      targetType,
      config: {
        dataMapping: 'output',
        transformations: []
      }
    }
    
    setConnections(prev => [...prev, newConnection])
  }, [])

  // Handle saving crew
  const handleSaveCrew = useCallback(async () => {
    if (agents.length === 0) {
      setError('Cannot save empty crew')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const crewData = {
        name: crewName,
        description: `A crew with ${agents.length} agents`,
        agents,
        connections
      }

      if (currentCrewId) {
        await studioApi.updateCrew(currentCrewId, crewData)
      } else {
        const result = await studioApi.createCrew(crewData)
        setCurrentCrewId(result.id || null)
      }
    } catch (err) {
      console.error('Failed to save crew:', err)
      setError('Failed to save crew')
    } finally {
      setLoading(false)
    }
  }, [agents, connections, crewName, currentCrewId])

  // Handle running the crew
  const handleRunCrew = useCallback(async () => {
    if (agents.length === 0) {
      setError('Cannot run empty crew')
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      setIsRunning(true)
      setExecutionState('running')
      
      // Save crew first if not saved
      let crewId = currentCrewId
      if (!crewId) {
        const crewData = {
          name: crewName,
          description: `A crew with ${agents.length} agents`,
          agents,
          connections
        }
        const result = await studioApi.createCrew(crewData)
        crewId = result.id || null
        setCurrentCrewId(crewId)
      }

      if (!crewId) {
        throw new Error('Failed to create crew')
      }
      
      // Update all agents to pending status
      setAgents(prev => prev.map(agent => ({ ...agent, status: 'pending' })))
      
      // Start execution
      const execution = await studioApi.executeCrew(crewId, {}, { model: 'gpt-4' })
      setCurrentExecutionId(execution.execution_id)
      
    } catch (err) {
      console.error('Failed to run crew:', err)
      setError('Failed to run crew')
      setIsRunning(false)
      setExecutionState('error')
    } finally {
      setLoading(false)
    }
  }, [agents, connections, crewName, currentCrewId])

  // Handle importing crew
  const handleImportCrew = useCallback(async () => {
    try {
      // In a real implementation, this would open a file dialog
      // For now, just show a placeholder
      setError('Import feature coming soon')
    } catch (err) {
      console.error('Failed to import crew:', err)
      setError('Failed to import crew')
    }
  }, [])

  // Handle exporting crew
  const handleExportCrew = useCallback(async () => {
    if (agents.length === 0) {
      setError('Cannot export empty crew')
      return
    }

    try {
      const crewData = {
        name: crewName,
        agents,
        connections,
        canvasPosition,
        exportedAt: new Date().toISOString()
      }

      const blob = new Blob([JSON.stringify(crewData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${crewName.replace(/\s+/g, '-').toLowerCase()}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to export crew:', err)
      setError('Failed to export crew')
    }
  }, [agents, connections, crewName, canvasPosition])

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to Dashboard</span>
            </Link>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Agent Crew Studio
            </h1>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <input
                type="text"
                value={crewName}
                onChange={(e) => setCrewName(e.target.value)}
                className="bg-transparent border-none text-gray-600 dark:text-gray-300 focus:outline-none focus:text-gray-900 dark:focus:text-white"
              />
              <div className={`w-2 h-2 rounded-full ${currentCrewId ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleSaveCrew}
              disabled={loading || agents.length === 0}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Saving...' : 'Save'}</span>
            </button>
            
            <button 
              onClick={handleImportCrew}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <Upload className="h-4 w-4" />
              <span>Import</span>
            </button>
            
            <button 
              onClick={handleExportCrew}
              disabled={agents.length === 0}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
            
            <button
              onClick={handleRunCrew}
              disabled={loading || isRunning || agents.length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="h-4 w-4" />
              <span>{isRunning ? 'Running...' : 'Run Crew'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Error notification */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border-l-4 border-red-400 dark:border-red-600 p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Studio Interface */}
      <div className="flex-1 flex overflow-hidden">
        {/* Component Library - Left Sidebar */}
        <ComponentLibrary />
        
        {/* Main Canvas Area */}
        <div className="flex-1 relative">
          <StudioCanvas
            agents={agents}
            connections={connections}
            selectedAgent={selectedAgent}
            canvasPosition={canvasPosition}
            isRunning={isRunning}
            onAddAgent={handleAddAgent}
            onSelectAgent={setSelectedAgent}
            onUpdateAgent={handleUpdateAgent}
            onDeleteAgent={handleDeleteAgent}
            onCreateConnection={handleCreateConnection}
            onCanvasPositionChange={setCanvasPosition}
          />
        </div>
        
        {/* Configuration Panel - Right Sidebar */}
        <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
          {selectedAgent ? (
            <AgentConfigPanel
              agent={selectedAgent}
              onUpdateAgent={(updates: Partial<Agent>) => handleUpdateAgent(selectedAgent.id, updates)}
              onClose={() => setSelectedAgent(null)}
            />
          ) : (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              <Settings className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Select an agent to configure</p>
              <p className="text-xs mt-2">Or double-click the canvas to add a new agent</p>
            </div>
          )}
        </div>
      </div>

      {/* Execution Panel - Bottom (when running) */}
      {(isRunning || executionState !== 'idle') && (
        <ExecutionPanel
          agents={agents}
          connections={connections}
          executionId={currentExecutionId}
          executionState={executionState}
          onAgentClick={setSelectedAgent}
        />
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-900 dark:text-white">Processing...</span>
          </div>
        </div>
      )}
    </div>
  )
}
