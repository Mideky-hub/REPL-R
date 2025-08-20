'use client'

import { useState, useEffect } from 'react'
import { 
  Play, 
  Save, 
  ArrowLeft, 
  AlertCircle,
  Users,
  Target,
  GitBranch,
  Settings2,
  Plus,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { StudioCanvas } from '@/components/studio/StudioCanvas'
import { AgentConfigPanel } from '@/components/studio/AgentConfigPanel'
import { ExecutionPanel } from '@/components/studio/ExecutionPanel'
import { Agent, Connection, CanvasPosition } from '@/types/studio'
import { studioApi } from '@/lib/api'

type StudioView = 'team-structure' | 'interaction-design' | 'agent-config'

interface TeamDepartment {
  id: string
  name: string
  lead: Agent | null
  members: Agent[]
  objectives: string[]
  color: string
}

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
  const [currentView, setCurrentView] = useState<StudioView>('team-structure')

  // Team organization structure
  const [teamManager, setTeamManager] = useState<Agent | null>(null)
  const [departments, setDepartments] = useState<TeamDepartment[]>([
    {
      id: 'research',
      name: 'Research Department',
      lead: null,
      members: [],
      objectives: ['Market analysis', 'Competitive research'],
      color: 'blue'
    },
    {
      id: 'execution',
      name: 'Execution Department', 
      lead: null,
      members: [],
      objectives: ['Task implementation', 'Quality assurance'],
      color: 'green'
    }
  ])

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

  const loadCrew = async (crewId: string) => {
    try {
      setLoading(true)
      const crew = await studioApi.getCrew(crewId)
      setCrewName(crew.name)
      setCrewDescription(crew.description || '')
      setAgents(crew.agents)
      setConnections(crew.connections)
    } catch (err) {
      setError('Failed to load crew')
      console.error('Failed to load crew:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAgent = (type: 'manager' | 'lead' | 'member', departmentId?: string) => {
    const newAgent: Agent = {
      id: `agent-${Date.now()}`,
      type: 'agent',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      config: {
        role: type === 'manager' ? 'Team Manager' : type === 'lead' ? 'Department Lead' : 'Team Member',
        goal: 'Define the specific goal for this agent',
        backstory: 'Describe the agent\'s background and expertise',
        tools: []
      },
      status: 'idle',
      connections: { inputs: [], outputs: [] }
    }

    setAgents(prev => [...prev, newAgent])
    setSelectedAgent(newAgent)
    setCurrentView('agent-config')
  }

  const handleUpdateAgent = (agentId: string, updates: Partial<Agent>) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId ? { ...agent, ...updates } : agent
    ))
    
    if (selectedAgent?.id === agentId) {
      setSelectedAgent({ ...selectedAgent, ...updates })
    }
  }

  const handleSaveCrew = async () => {
    try {
      setLoading(true)
      setError(null)

      const crewData = {
        name: crewName,
        description: crewDescription,
        agents,
        connections
      }

      let savedCrew
      if (currentCrewId) {
        savedCrew = await studioApi.updateCrew(currentCrewId, crewData)
      } else {
        savedCrew = await studioApi.createCrew(crewData)
        setCurrentCrewId(savedCrew.id)
      }

      console.log('Crew saved successfully:', savedCrew)
    } catch (err) {
      setError('Failed to save crew')
      console.error('Failed to save crew:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleExecuteCrew = async () => {
    if (agents.length === 0) {
      setError('Add at least one agent to execute the crew')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setIsRunning(true)
      setExecutionState('running')

      // Save crew first if not saved
      if (!currentCrewId) {
        await handleSaveCrew()
      }

      // Start execution
      if (currentCrewId) {
        const execution = await studioApi.executeCrew(currentCrewId, {})
        setCurrentExecutionId(execution.execution_id)
        
        // Update all agents to running status initially
        setAgents(prev => prev.map(agent => ({ ...agent, status: 'pending' })))
      }
    } catch (err) {
      setError('Failed to execute crew')
      setIsRunning(false)
      setExecutionState('error')
      console.error('Failed to execute crew:', err)
    } finally {
      setLoading(false)
    }
  }

  const renderTeamStructureView = () => (
    <div className="h-full overflow-y-auto">
      {/* Team Overview */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <Users className="h-6 w-6 text-blue-600" />
          <div>
            <input
              type="text"
              value={crewName}
              onChange={(e) => setCrewName(e.target.value)}
              className="text-2xl font-bold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 text-gray-900 dark:text-white"
              placeholder="Team Name"
            />
            <textarea
              value={crewDescription}
              onChange={(e) => setCrewDescription(e.target.value)}
              placeholder="Describe your team's mission and objectives..."
              className="mt-2 w-full text-sm text-gray-600 dark:text-gray-400 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 resize-none"
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Team Manager Section */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Target className="h-5 w-5 mr-2 text-purple-600" />
            Team Manager
          </h3>
          {!teamManager && (
            <button
              onClick={() => handleAddAgent('manager')}
              className="flex items-center space-x-1 px-3 py-1 text-sm bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 rounded-md hover:bg-purple-200 dark:hover:bg-purple-800"
            >
              <Plus className="h-4 w-4" />
              <span>Add Manager</span>
            </button>
          )}
        </div>
        
        {teamManager ? (
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{teamManager.config.role}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{teamManager.config.goal}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedAgent(teamManager)
                  setCurrentView('agent-config')
                }}
                className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-800 rounded-md"
              >
                <Settings2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No team manager assigned</p>
            <p className="text-xs">The manager coordinates the overall team execution</p>
          </div>
        )}
      </div>

      {/* Departments */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <GitBranch className="h-5 w-5 mr-2 text-green-600" />
            Departments
          </h3>
        </div>

        <div className="space-y-6">
          {departments.map((dept) => (
            <div key={dept.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className={`p-4 bg-${dept.color}-50 dark:bg-${dept.color}-900/20 border-b border-gray-200 dark:border-gray-700`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{dept.name}</h4>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {dept.objectives.map((obj, idx) => (
                        <span key={idx} className={`text-xs px-2 py-1 bg-${dept.color}-100 text-${dept.color}-700 dark:bg-${dept.color}-800 dark:text-${dept.color}-300 rounded-full`}>
                          {obj}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAddAgent('lead', dept.id)}
                      className={`px-3 py-1 text-xs bg-${dept.color}-100 text-${dept.color}-700 dark:bg-${dept.color}-800 dark:text-${dept.color}-300 rounded-md hover:bg-${dept.color}-200 dark:hover:bg-${dept.color}-700`}
                    >
                      Add Lead
                    </button>
                    <button
                      onClick={() => handleAddAgent('member', dept.id)}
                      className={`px-3 py-1 text-xs bg-${dept.color}-100 text-${dept.color}-700 dark:bg-${dept.color}-800 dark:text-${dept.color}-300 rounded-md hover:bg-${dept.color}-200 dark:hover:bg-${dept.color}-700`}
                    >
                      Add Member
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4">
                {dept.lead ? (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Department Lead</h5>
                    <div className={`bg-${dept.color}-50 dark:bg-${dept.color}-900/10 p-3 rounded-md`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">{dept.lead.config.role}</span>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{dept.lead.config.goal}</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedAgent(dept.lead)
                            setCurrentView('agent-config')
                          }}
                          className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          <Settings2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}

                {dept.members.length > 0 ? (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Team Members</h5>
                    <div className="space-y-2">
                      {dept.members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                          <div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{member.config.role}</span>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{member.config.goal}</p>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedAgent(member)
                              setCurrentView('agent-config')
                            }}
                            className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            <Settings2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    <p className="text-sm">No team members yet</p>
                    <p className="text-xs">Add members to build your department</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderInteractionDesignView = () => (
    <div className="h-full flex">
      <div className="flex-1">
        <StudioCanvas
          agents={agents}
          connections={connections}
          selectedAgent={selectedAgent}
          canvasPosition={canvasPosition}
          onAgentSelect={setSelectedAgent}
          onCanvasPositionChange={setCanvasPosition}
          onAgentMove={(agentId, position) => {
            handleUpdateAgent(agentId, { position })
          }}
          onConnectionCreate={(connection) => {
            setConnections(prev => [...prev, connection])
          }}
          onConnectionDelete={(connectionId) => {
            setConnections(prev => prev.filter(conn => conn.id !== connectionId))
          }}
        />
      </div>
    </div>
  )

  const viewTabs = [
    { id: 'team-structure' as const, label: 'Team Structure', icon: Users, description: 'Define your team organization' },
    { id: 'interaction-design' as const, label: 'Interaction Design', icon: GitBranch, description: 'Design agent interactions' },
    { id: 'agent-config' as const, label: 'Agent Configuration', icon: Settings2, description: 'Configure agent details', disabled: !selectedAgent }
  ]

  if (loading && !agents.length) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading team...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link
                href="/crews"
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Team Preparation Studio
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Design and organize your agent teams
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleSaveCrew}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>Save Team</span>
              </button>

              <button
                onClick={handleExecuteCrew}
                disabled={loading || isRunning || agents.length === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <Play className="h-4 w-4" />
                <span>{isRunning ? 'Running...' : 'Launch Team'}</span>
              </button>
            </div>
          </div>

          {/* View Tabs */}
          <div className="flex space-x-1 pb-2">
            {viewTabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => !tab.disabled && setCurrentView(tab.id)}
                  disabled={tab.disabled}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentView === tab.id
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : tab.disabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.disabled && selectedAgent && (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 p-4 bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700 dark:text-red-300">{error}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex h-[calc(100vh-140px)]">
        <div className={`${currentView === 'interaction-design' ? 'flex-1' : 'w-full'}`}>
          {currentView === 'team-structure' && renderTeamStructureView()}
          {currentView === 'interaction-design' && renderInteractionDesignView()}
        </div>

        {/* Agent Configuration Panel */}
        {currentView === 'agent-config' && selectedAgent && (
          <div className="w-96 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <AgentConfigPanel
              agent={selectedAgent}
              onUpdateAgent={(updates) => handleUpdateAgent(selectedAgent.id, updates)}
              onClose={() => setCurrentView('team-structure')}
            />
          </div>
        )}
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
    </div>
  )
}
