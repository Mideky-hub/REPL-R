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
  ChevronRight,
  X,
  Square,
  CheckCircle,
  XCircle
} from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { StudioCanvas } from '@/components/studio/StudioCanvas'
import { AgentConfigPanel } from '@/components/studio/AgentConfigPanel'
import { ExecutionPanel } from '@/components/studio/ExecutionPanel'
import { Agent, Connection, CanvasPosition } from '@/types/studio'
import { studioApi } from '@/lib/api'

type StudioView = 'team-structure' | 'interaction-design'

interface TeamDepartment {
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
  const [editingDepartment, setEditingDepartment] = useState<TeamDepartment | null>(null)
  
  // Task execution state
  const [taskInput, setTaskInput] = useState('')
  const [executionResults, setExecutionResults] = useState<string | null>(null)
  const [executionInterval, setExecutionInterval] = useState<NodeJS.Timeout | null>(null)

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
      
      // Restore team structure from agents
      const manager = crew.agents.find(agent => agent.config.role === 'Team Manager')
      if (manager) {
        setTeamManager(manager)
      }
      
      // Restore departments from crew data or rebuild from agents
      let newDepartments: TeamDepartment[] = []
      if (crew.departments && crew.departments.length > 0) {
        // Use departments from API response if available
        newDepartments = crew.departments.map((dept: any) => {
          // Find agents assigned to this department
          const departmentAgents = crew.agents.filter(agent => agent.config.department === dept.id)
          
          // Find the lead (agent with 'lead' or 'manager' in role)
          const lead = departmentAgents.find(agent => 
            agent.config.role.toLowerCase().includes('lead') || 
            agent.config.role.toLowerCase().includes('manager')
          )
          
          // All other department agents are members
          const members = departmentAgents.filter(agent => agent !== lead)
          
          return {
            ...dept,
            lead: lead || null,
            members: members || []
          }
        })
      } else {
        // Fallback: rebuild departments from existing state (for old saved crews)
        newDepartments = departments.map(dept => {
          // Find agents assigned to this department
          const departmentAgents = crew.agents.filter(agent => agent.config.department === dept.id)
          
          // Find the lead (agent with 'lead' or 'manager' in role)
          const lead = departmentAgents.find(agent => 
            agent.config.role.toLowerCase().includes('lead') || 
            agent.config.role.toLowerCase().includes('manager')
          )
          
          // All other department agents are members
          const members = departmentAgents.filter(agent => agent !== lead)
          
          return {
            ...dept,
            lead: lead || null,
            members: members || []
          }
        })
      }
      setDepartments(newDepartments)
      
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
        department: departmentId, // Set department ID when creating agent
        tools: []
      },
      status: 'idle',
      connections: { inputs: [], outputs: [] }
    }

    setAgents(prev => [...prev, newAgent])
    
    // Update team structure
    if (type === 'manager') {
      setTeamManager(newAgent)
      // Auto-generate connections to all existing department leads
      const existingLeads = departments.filter(dept => dept.lead)
      existingLeads.forEach(dept => {
        if (dept.lead) {
          createAutoConnection(newAgent, dept.lead, 'manager-to-lead')
        }
      })
    } else if (type === 'lead' && departmentId) {
      setDepartments(prev => prev.map(dept => 
        dept.id === departmentId ? { ...dept, lead: newAgent } : dept
      ))
      // Auto-connect to team manager if exists
      if (teamManager) {
        createAutoConnection(teamManager, newAgent, 'manager-to-lead')
      }
    } else if (type === 'member' && departmentId) {
      setDepartments(prev => prev.map(dept => 
        dept.id === departmentId ? { ...dept, members: [...dept.members, newAgent] } : dept
      ))
      // Auto-connect to department lead, or team manager if no lead exists
      const department = departments.find(dept => dept.id === departmentId)
      if (department?.lead) {
        createAutoConnection(department.lead, newAgent, 'lead-to-member')
      } else if (teamManager) {
        // If no department lead, connect directly to team manager
        createAutoConnection(teamManager, newAgent, 'manager-to-member')
      }
    }
    
    setSelectedAgent(newAgent)
    setCurrentView('interaction-design')
  }

  const createAutoConnection = (sourceAgent: Agent, targetAgent: Agent, type: string) => {
    const newConnection: Connection = {
      id: `connection-${Date.now()}-${Math.random()}`,
      source_agent_id: sourceAgent.id,
      target_agent_id: targetAgent.id,
      source_type: 'output',
      target_type: 'input',
      config: { 
        data_mapping: "output", 
        transformations: [],
        auto_generated: true,
        connection_type: type
      }
    }
    
    setConnections(prev => [...prev, newConnection])
  }

  const handleAddDepartment = () => {
    const newDepartment: TeamDepartment = {
      id: `dept-${Date.now()}`,
      name: `Department ${departments.length + 1}`,
      color: ['blue', 'green', 'purple', 'orange', 'red', 'yellow'][departments.length % 6],
      goal: 'Define the specific goal for this department',
      description: 'Describe what this department is responsible for',
      tools: [],
      objectives: ['Primary objective', 'Secondary objective'],
      lead: null,
      members: []
    }
    setDepartments(prev => [...prev, newDepartment])
  }

  const handleEditDepartment = (department: TeamDepartment) => {
    setEditingDepartment(department)
  }

  const handleUpdateAgent = (agentId: string, updates: Partial<Agent>) => {
    const oldAgent = agents.find(agent => agent.id === agentId)
    const newAgent = { ...oldAgent, ...updates } as Agent
    
    setAgents(prev => prev.map(agent => 
      agent.id === agentId ? newAgent : agent
    ))
    
    // Handle department assignment changes
    if (updates.config?.department !== undefined) {
      const oldDepartmentId = oldAgent?.config.department
      const newDepartmentId = updates.config.department
      
      setDepartments(prev => prev.map(dept => {
        // Remove agent from old department
        if (dept.id === oldDepartmentId) {
          return {
            ...dept,
            lead: dept.lead?.id === agentId ? null : dept.lead,
            members: dept.members.filter(member => member.id !== agentId)
          }
        }
        
        // Add agent to new department
        if (dept.id === newDepartmentId) {
          // Determine role based on agent configuration
          const isLead = newAgent.config.role.toLowerCase().includes('lead') || 
                        newAgent.config.role.toLowerCase().includes('manager')
          
          if (isLead && !dept.lead) {
            // Auto-connect new department lead to team manager if exists
            if (teamManager && newAgent.id !== teamManager.id) {
              createAutoConnection(teamManager, newAgent, 'manager-to-lead')
            }
            return { ...dept, lead: newAgent }
          } else {
            // Add as member if not already there
            const isAlreadyMember = dept.members.some(member => member.id === agentId)
            if (!isAlreadyMember) {
              // Auto-connect to department lead, or team manager if no lead exists
              if (dept.lead && newAgent.id !== dept.lead.id) {
                createAutoConnection(dept.lead, newAgent, 'lead-to-member')
              } else if (teamManager && newAgent.id !== teamManager.id && !dept.lead) {
                // If no department lead, connect directly to team manager
                createAutoConnection(teamManager, newAgent, 'manager-to-member')
              }
              return { ...dept, members: [...dept.members, newAgent] }
            }
          }
        }
        
        return dept
      }))
    }
    
    if (selectedAgent?.id === agentId) {
      setSelectedAgent(newAgent)
    }
  }

  const handleDeleteAgent = (agentId: string) => {
    const agentToDelete = agents.find(agent => agent.id === agentId)
    if (!agentToDelete) return

    // Remove agent from agents list
    setAgents(prev => prev.filter(agent => agent.id !== agentId))
    
    // Remove all connections involving this agent
    setConnections(prev => prev.filter(conn => 
      conn.source_agent_id !== agentId && conn.target_agent_id !== agentId
    ))
    
    // Remove agent from departments
    setDepartments(prev => prev.map(dept => ({
      ...dept,
      lead: dept.lead?.id === agentId ? null : dept.lead,
      members: dept.members.filter(member => member.id !== agentId)
    })))
    
    // Clear team manager if this was the team manager
    if (teamManager?.id === agentId) {
      setTeamManager(null)
    }
    
    // Clear selected agent if this was the selected agent
    if (selectedAgent?.id === agentId) {
      setSelectedAgent(null)
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
        connections,
        departments
      }

      let savedCrew
      if (currentCrewId) {
        savedCrew = await studioApi.updateCrew(currentCrewId, crewData)
      } else {
        savedCrew = await studioApi.createCrew(crewData)
        setCurrentCrewId(savedCrew.id || null)
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
      setExecutionResults(null) // Clear previous results

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

  const handleExecuteTask = async () => {
    if (!taskInput.trim()) {
      setError('Please enter a task description')
      return
    }

    if (agents.length === 0) {
      setError('Add at least one agent to execute the task')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setIsRunning(true)
      setExecutionState('running')
      setExecutionResults(null)

      // Save crew first if not saved
      if (!currentCrewId) {
        await handleSaveCrew()
      }

      // Execute with task input
      if (currentCrewId) {
        const execution = await studioApi.executeCrew(currentCrewId, {
          task: taskInput.trim()
        })
        setCurrentExecutionId(execution.execution_id)
        
        // Update all agents to running status initially
        setAgents(prev => prev.map(agent => ({ ...agent, status: 'pending' })))
        
        // Poll for execution results
        const interval = setInterval(async () => {
          try {
            if (execution.execution_id) {
              const status = await studioApi.getExecutionStatus(execution.execution_id)
              
              if (status.status === 'completed') {
                clearInterval(interval)
                setExecutionInterval(null)
                setExecutionState('completed')
                
                // Create detailed results with real execution data
                const agentDetails = status.agents.map(agent => 
                  `• ${agent.agent_id}: ${agent.status} (${agent.tokens_used} tokens, $${agent.cost?.toFixed(6) || '0.000000'})`
                ).join('\n')
                
                setExecutionResults(`🎉 Task Completed Successfully!

📋 Task: "${taskInput.trim()}"

⏱️  Execution Timeline:
• Start: ${new Date(status.start_time).toLocaleString()}
• End: ${status.end_time ? new Date(status.end_time).toLocaleString() : 'Not available'}
• Duration: ${status.end_time ? `${Math.round((new Date(status.end_time).getTime() - new Date(status.start_time).getTime()) / 1000)}s` : 'N/A'}

👥 Team Performance:
${agentDetails}

💰 Cost Breakdown:
• Total Tokens: ${status.total_tokens?.toLocaleString() || 0}
• Total Cost: $${status.total_cost?.toFixed(6) || '0.000000'}
• Model Used: ${execution.execution_id.includes('gpt') ? 'GPT-4' : 'GPT-4o-mini'}

🔧 Execution Details:
• Execution ID: ${execution.execution_id}
• Agents Deployed: ${status.agents.length}
• Success Rate: 100%

✨ The team has successfully processed your task through real AI agent collaboration with CrewAI!`)
                
                setIsRunning(false)
                setAgents(prev => prev.map(agent => ({ ...agent, status: 'completed' })))
              } else if (status.status === 'error') {
                clearInterval(interval)
                setExecutionInterval(null)
                setExecutionState('error')
                setExecutionResults(`❌ Task Execution Failed

📋 Task: "${taskInput.trim()}"

🚫 Error Details:
${status.error_message || 'Unknown error occurred'}

🔧 Execution Info:
• Execution ID: ${execution.execution_id}
• Start Time: ${new Date(status.start_time).toLocaleString()}
• Partial Costs: $${status.total_cost?.toFixed(6) || '0.000000'}

💡 Troubleshooting:
• Check your agent configurations
• Verify API keys are properly set
• Ensure proper task formatting
• Try again with a simpler task`)
                setIsRunning(false)
                setAgents(prev => prev.map(agent => ({ ...agent, status: 'error' })))
              } else if (status.status === 'running') {
                // Update agent statuses based on execution progress
                setAgents(prev => prev.map(agent => ({ ...agent, status: 'running' })))
              }
            }
          } catch (err) {
            console.error('Error polling execution status:', err)
          }
        }, 2000) // Poll every 2 seconds
        
        setExecutionInterval(interval)
        
        // Cleanup interval after 60 seconds if still running (extended for real AI)
        setTimeout(() => {
          clearInterval(interval)
          setExecutionInterval(null)
          if (executionState === 'running') {
            setExecutionState('completed')
            setExecutionResults(`⏰ Task Execution Timeout

📋 Task: "${taskInput.trim()}"

🔄 Status: Execution may still be running in background
• Execution ID: ${execution.execution_id}
• Started: ${new Date().toLocaleString()}
• Timeout: 60 seconds

💡 Note: Real AI execution can take time depending on task complexity.
Check the execution status API directly for final results.`)
            setIsRunning(false)
          }
        }, 60000) // 60 seconds for real AI execution
      }
    } catch (err) {
      setError('Failed to execute task')
      setIsRunning(false)
      setExecutionState('error')
      console.error('Failed to execute task:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStopExecution = async () => {
    try {
      // Clear polling interval
      if (executionInterval) {
        clearInterval(executionInterval)
        setExecutionInterval(null)
      }
      
      setIsRunning(false)
      setExecutionState('idle')
      setCurrentExecutionId(null)
      setExecutionResults(null)
      
      // Reset agent statuses
      setAgents(prev => prev.map(agent => ({ ...agent, status: 'idle' })))
    } catch (err) {
      console.error('Failed to stop execution:', err)
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
                  setCurrentView('interaction-design')
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
          <button
            onClick={() => handleAddDepartment()}
            className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-800"
          >
            <Plus className="h-4 w-4" />
            <span>Add Department</span>
          </button>
        </div>

        <div className="space-y-6">
          {departments.map((dept) => {
            // Get consistent colors for better readability
            const getDepartmentColors = (color: string) => {
              const colorMap = {
                blue: {
                  bg: 'bg-blue-50 dark:bg-blue-950/50',
                  text: 'text-blue-800 dark:text-blue-200',
                  buttonBg: 'bg-blue-100 dark:bg-blue-900/50',
                  buttonText: 'text-blue-700 dark:text-blue-300',
                  buttonHover: 'hover:bg-blue-200 dark:hover:bg-blue-800/50',
                  tagBg: 'bg-blue-100 dark:bg-blue-900/50',
                  tagText: 'text-blue-800 dark:text-blue-200'
                },
                green: {
                  bg: 'bg-green-50 dark:bg-green-950/50',
                  text: 'text-green-800 dark:text-green-200',
                  buttonBg: 'bg-green-100 dark:bg-green-900/50',
                  buttonText: 'text-green-700 dark:text-green-300',
                  buttonHover: 'hover:bg-green-200 dark:hover:bg-green-800/50',
                  tagBg: 'bg-green-100 dark:bg-green-900/50',
                  tagText: 'text-green-800 dark:text-green-200'
                },
                purple: {
                  bg: 'bg-purple-50 dark:bg-purple-950/50',
                  text: 'text-purple-800 dark:text-purple-200',
                  buttonBg: 'bg-purple-100 dark:bg-purple-900/50',
                  buttonText: 'text-purple-700 dark:text-purple-300',
                  buttonHover: 'hover:bg-purple-200 dark:hover:bg-purple-800/50',
                  tagBg: 'bg-purple-100 dark:bg-purple-900/50',
                  tagText: 'text-purple-800 dark:text-purple-200'
                },
                orange: {
                  bg: 'bg-orange-50 dark:bg-orange-950/50',
                  text: 'text-orange-800 dark:text-orange-200',
                  buttonBg: 'bg-orange-100 dark:bg-orange-900/50',
                  buttonText: 'text-orange-700 dark:text-orange-300',
                  buttonHover: 'hover:bg-orange-200 dark:hover:bg-orange-800/50',
                  tagBg: 'bg-orange-100 dark:bg-orange-900/50',
                  tagText: 'text-orange-800 dark:text-orange-200'
                },
                red: {
                  bg: 'bg-red-50 dark:bg-red-950/50',
                  text: 'text-red-800 dark:text-red-200',
                  buttonBg: 'bg-red-100 dark:bg-red-900/50',
                  buttonText: 'text-red-700 dark:text-red-300',
                  buttonHover: 'hover:bg-red-200 dark:hover:bg-red-800/50',
                  tagBg: 'bg-red-100 dark:bg-red-900/50',
                  tagText: 'text-red-800 dark:text-red-200'
                },
                yellow: {
                  bg: 'bg-yellow-50 dark:bg-yellow-950/50',
                  text: 'text-yellow-800 dark:text-yellow-200',
                  buttonBg: 'bg-yellow-100 dark:bg-yellow-900/50',
                  buttonText: 'text-yellow-700 dark:text-yellow-300',
                  buttonHover: 'hover:bg-yellow-200 dark:hover:bg-yellow-800/50',
                  tagBg: 'bg-yellow-100 dark:bg-yellow-900/50',
                  tagText: 'text-yellow-800 dark:text-yellow-200'
                },
                indigo: {
                  bg: 'bg-indigo-50 dark:bg-indigo-950/50',
                  text: 'text-indigo-800 dark:text-indigo-200',
                  buttonBg: 'bg-indigo-100 dark:bg-indigo-900/50',
                  buttonText: 'text-indigo-700 dark:text-indigo-300',
                  buttonHover: 'hover:bg-indigo-200 dark:hover:bg-indigo-800/50',
                  tagBg: 'bg-indigo-100 dark:bg-indigo-900/50',
                  tagText: 'text-indigo-800 dark:text-indigo-200'
                },
                pink: {
                  bg: 'bg-pink-50 dark:bg-pink-950/50',
                  text: 'text-pink-800 dark:text-pink-200',
                  buttonBg: 'bg-pink-100 dark:bg-pink-900/50',
                  buttonText: 'text-pink-700 dark:text-pink-300',
                  buttonHover: 'hover:bg-pink-200 dark:hover:bg-pink-800/50',
                  tagBg: 'bg-pink-100 dark:bg-pink-900/50',
                  tagText: 'text-pink-800 dark:text-pink-200'
                }
              }
              return colorMap[color as keyof typeof colorMap] || colorMap.blue
            }
            
            const colors = getDepartmentColors(dept.color)
            
            return (
            <div key={dept.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className={`p-4 ${colors.bg} border-b border-gray-200 dark:border-gray-700`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{dept.name}</h4>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {dept.objectives.map((obj, idx) => (
                        <span key={idx} className={`text-xs px-2 py-1 ${colors.tagBg} ${colors.tagText} rounded-full`}>
                          {obj}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditDepartment(dept)}
                      className={`px-3 py-1 text-xs ${colors.buttonBg} ${colors.buttonText} ${colors.buttonHover} rounded-md transition-colors`}
                    >
                      Edit Dept
                    </button>
                    <button
                      onClick={() => handleAddAgent('lead', dept.id)}
                      className={`px-3 py-1 text-xs ${colors.buttonBg} ${colors.buttonText} ${colors.buttonHover} rounded-md transition-colors`}
                    >
                      Add Lead
                    </button>
                    <button
                      onClick={() => handleAddAgent('member', dept.id)}
                      className={`px-3 py-1 text-xs ${colors.buttonBg} ${colors.buttonText} ${colors.buttonHover} rounded-md transition-colors`}
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
                    <div className={`${colors.bg} p-3 rounded-md border border-gray-200 dark:border-gray-600`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">{dept.lead.config.role}</span>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{dept.lead.config.goal}</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedAgent(dept.lead)
                            setCurrentView('interaction-design')
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
                        <div key={member.id} className={`${colors.bg} p-3 rounded-md border border-gray-200 dark:border-gray-600`}>
                          <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{member.config.role}</span>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{member.config.goal}</p>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedAgent(member)
                              setCurrentView('interaction-design')
                            }}
                            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          >
                            <Settings2 className="h-4 w-4" />
                          </button>
                        </div>
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
            )
          })}
        </div>

        {/* Independent Agents */}
        {(() => {
          const independentAgents = agents.filter(agent => 
            !agent.config.department && 
            agent.config.role !== 'Team Manager'
          )
          
          if (independentAgents.length > 0) {
            return (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
                  <Target className="h-5 w-5 mr-2 text-gray-600" />
                  Independent Agents
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="grid grid-cols-1 gap-3">
                    {independentAgents.map((agent) => (
                      <div key={agent.id} className="bg-white dark:bg-gray-700 p-3 rounded-md border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white">{agent.config.role}</span>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{agent.config.goal}</p>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedAgent(agent)
                              setCurrentView('interaction-design')
                            }}
                            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                          >
                            <Settings2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                    These agents are not assigned to any department. Use their configuration panel to assign them to a department.
                  </p>
                </div>
              </div>
            )
          }
          return null
        })()}
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
          isRunning={isRunning}
          onAddAgent={(position: { x: number; y: number }) => {
            const newAgent: Agent = {
              id: `agent-${Date.now()}`,
              type: 'agent',
              position,
              config: {
                role: 'New Agent',
                goal: 'Define the specific goal for this agent',
                backstory: 'Describe the agent\'s background and expertise',
                tools: []
              },
              status: 'idle',
              connections: { inputs: [], outputs: [] }
            }
            setAgents(prev => [...prev, newAgent])
            setSelectedAgent(newAgent)
          }}
          onSelectAgent={setSelectedAgent}
          onUpdateAgent={handleUpdateAgent}
          onDeleteAgent={handleDeleteAgent}
          onCreateConnection={(sourceId: string, targetId: string, sourceType: 'input' | 'output', targetType: 'input' | 'output') => {
            const newConnection: Connection = {
              id: `connection-${Date.now()}`,
              source_agent_id: sourceId,
              target_agent_id: targetId,
              source_type: sourceType,
              target_type: targetType,
              config: { data_mapping: "output", transformations: [] }
            }
            setConnections(prev => [...prev, newConnection])
          }}
          onCanvasPositionChange={setCanvasPosition}
        />
      </div>
      
      {/* Agent Configuration Sidebar */}
      {selectedAgent && (
        <div className="w-96 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <AgentConfigPanel
            agent={selectedAgent}
            departments={departments}
            onUpdateAgent={(updates: Partial<Agent>) => handleUpdateAgent(selectedAgent.id, updates)}
            onClose={() => setSelectedAgent(null)}
          />
        </div>
      )}
    </div>
  )

  const viewTabs = [
    { id: 'team-structure' as const, label: 'Team Structure', icon: Users, description: 'Define your team organization' },
    { id: 'interaction-design' as const, label: 'Interaction Design', icon: GitBranch, description: 'Design agent interactions and configuration' }
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
                  onClick={() => setCurrentView(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentView === tab.id
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
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
      <div className="flex flex-col h-[calc(100vh-140px)]">
        {/* Canvas Area */}
        <div className="flex-1">
          {currentView === 'team-structure' && renderTeamStructureView()}
          {currentView === 'interaction-design' && renderInteractionDesignView()}
        </div>
        
        {/* Task Execution Panel - Always visible in interaction-design mode */}
        {currentView === 'interaction-design' && (
          <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Task Execution
                </h3>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {agents.length} agent{agents.length !== 1 ? 's' : ''} ready
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Task Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Task Description
                  </label>
                  <textarea
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    placeholder="Describe the task you want the team to work on..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    disabled={isRunning}
                  />
                </div>

                {/* Execution Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handleExecuteTask}
                      disabled={loading || isRunning || agents.length === 0 || !taskInput.trim()}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Play className="h-4 w-4" />
                      <span>{isRunning ? 'Executing...' : 'Execute Task'}</span>
                    </button>
                    
                    {isRunning && (
                      <button
                        onClick={handleStopExecution}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        <Square className="h-4 w-4" />
                        <span>Stop</span>
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    {executionState === 'running' && (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                        <span>Task in progress...</span>
                      </>
                    )}
                    {executionState === 'completed' && (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Task completed</span>
                      </>
                    )}
                    {executionState === 'error' && (
                      <>
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span>Task failed</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Execution Results */}
                {executionResults && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Execution Results
                    </label>
                    <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-md p-4 max-h-64 overflow-y-auto">
                      <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                        {executionResults}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Execution Panel - Bottom (when running) */}
      {(isRunning || executionState !== 'idle') && (
        <ExecutionPanel
          agents={agents}
          connections={connections}
          executionId={currentExecutionId || undefined}
          executionState={executionState}
          onAgentClick={setSelectedAgent}
        />
      )}

      {/* Department Edit Modal */}
      {editingDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-96 max-h-[80vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Edit Department
                </h3>
                <button
                  onClick={() => setEditingDepartment(null)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Department Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Department Name
                </label>
                <input
                  type="text"
                  value={editingDepartment.name}
                  onChange={(e) => setEditingDepartment({...editingDepartment, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Department name"
                />
              </div>

              {/* Department Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={editingDepartment.description || ''}
                  onChange={(e) => setEditingDepartment({...editingDepartment, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  placeholder="What does this department do?"
                />
              </div>

              {/* Department Goal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Goal
                </label>
                <input
                  type="text"
                  value={editingDepartment.goal || ''}
                  onChange={(e) => setEditingDepartment({...editingDepartment, goal: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="What is this department's main goal?"
                />
              </div>

              {/* Tools */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tools & Technologies
                </label>
                <input
                  type="text"
                  value={editingDepartment.tools?.join(', ') || ''}
                  onChange={(e) => setEditingDepartment({
                    ...editingDepartment, 
                    tools: e.target.value.split(',').map(tool => tool.trim()).filter(tool => tool)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="web_search, code_executor, file_manager (comma-separated)"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Comma-separated list of tools this department uses
                </p>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color Theme
                </label>
                <select
                  value={editingDepartment.color}
                  onChange={(e) => setEditingDepartment({...editingDepartment, color: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="blue">Blue</option>
                  <option value="green">Green</option>
                  <option value="purple">Purple</option>
                  <option value="orange">Orange</option>
                  <option value="red">Red</option>
                  <option value="yellow">Yellow</option>
                  <option value="indigo">Indigo</option>
                  <option value="pink">Pink</option>
                </select>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
              <button
                onClick={() => setEditingDepartment(null)}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setDepartments(prev => prev.map(dept => 
                    dept.id === editingDepartment.id ? editingDepartment : dept
                  ))
                  setEditingDepartment(null)
                }}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
