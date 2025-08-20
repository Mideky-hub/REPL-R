'use client'

import { useState, useEffect } from 'react'
import { Agent, AgentConfig, Tool } from '@/types/studio'
import { 
  X, 
  Bot, 
  Target, 
  User, 
  Code, 
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Search,
  Database,
  FileText,
  Globe,
  Settings,
  Loader
} from 'lucide-react'
import { studioApi } from '@/lib/api'

interface TeamDepartment {
  id: string
  name: string
  color: string
}

interface AgentConfigPanelProps {
  agent: Agent
  departments: TeamDepartment[]
  onUpdateAgent: (updates: Partial<Agent>) => void
  onClose: () => void
}

const toolCategoryIcons = {
  'search': Search,
  'database': Database,
  'file': FileText,
  'communication': Globe,
  'analysis': Settings,
  'other': Settings
}

export function AgentConfigPanel({ agent, departments, onUpdateAgent, onClose }: AgentConfigPanelProps) {
  const [config, setConfig] = useState<AgentConfig>(agent.config)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showToolPicker, setShowToolPicker] = useState(false)
  const [availableTools, setAvailableTools] = useState<Tool[]>([])
  const [loadingTools, setLoadingTools] = useState(false)
  const [toolsError, setToolsError] = useState<string | null>(null)

  // Load available tools when component mounts
  useEffect(() => {
    loadAvailableTools()
  }, [])

  const loadAvailableTools = async () => {
    try {
      setLoadingTools(true)
      setToolsError(null)
      const tools = await studioApi.getTools()
      setAvailableTools(tools)
    } catch (err) {
      console.error('Failed to load tools:', err)
      setToolsError('Failed to load available tools')
      // Fallback to hardcoded tools
      setAvailableTools([
        { id: 'web-search', name: 'Web Search', description: 'Search the internet', category: 'search' },
        { id: 'database-query', name: 'Database Query', description: 'Query databases', category: 'database' },
        { id: 'file-read', name: 'File Reader', description: 'Read files', category: 'file' },
        { id: 'file-write', name: 'File Writer', description: 'Write files', category: 'file' },
        { id: 'api-call', name: 'API Call', description: 'HTTP requests', category: 'communication' },
        { id: 'email-send', name: 'Email Sender', description: 'Send emails', category: 'communication' },
        { id: 'data-analysis', name: 'Data Analysis', description: 'Analyze data', category: 'analysis' },
        { id: 'image-generation', name: 'Image Generator', description: 'Generate images', category: 'other' }
      ])
    } finally {
      setLoadingTools(false)
    }
  }

  const handleConfigChange = (field: keyof AgentConfig, value: any) => {
    const newConfig = { ...config, [field]: value }
    setConfig(newConfig)
    onUpdateAgent({ config: newConfig })
  }

  const handleAddTool = (toolId: string) => {
    if (!config.tools.includes(toolId)) {
      const newTools = [...config.tools, toolId]
      handleConfigChange('tools', newTools)
    }
    setShowToolPicker(false)
  }

  const handleRemoveTool = (toolId: string) => {
    const newTools = config.tools.filter(id => id !== toolId)
    handleConfigChange('tools', newTools)
  }

  const getToolById = (id: string) => availableTools.find(tool => tool.id === id)

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Agent Configuration
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Configure your agent's role, goals, and capabilities
        </p>
      </div>

      {/* Configuration Form */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        
        {/* Basic Configuration */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
            <User className="h-4 w-4 mr-2 text-blue-600" />
            Basic Information
          </h3>
          
          {/* Role */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role
            </label>
            <input
              type="text"
              value={config.role}
              onChange={(e) => handleConfigChange('role', e.target.value)}
              placeholder="e.g., Senior Market Researcher"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              A clear, concise title for this agent
            </p>
          </div>

          {/* Goal */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Goal
            </label>
            <textarea
              value={config.goal}
              onChange={(e) => handleConfigChange('goal', e.target.value)}
              placeholder="e.g., Find the top 5 competitors for a new SaaS product and analyze their pricing strategies"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              What should this agent accomplish?
            </p>
          </div>

          {/* Backstory */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Backstory
            </label>
            <textarea
              value={config.backstory}
              onChange={(e) => handleConfigChange('backstory', e.target.value)}
              placeholder="You are an experienced market researcher with 10+ years in competitive analysis..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Provide context and personality to guide behavior
            </p>
          </div>
        </div>

        {/* Tools Configuration */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
            <Settings className="h-4 w-4 mr-2 text-green-600" />
            Tools & Capabilities
          </h3>

          {/* Selected Tools */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">Selected Tools</span>
              <button
                onClick={() => setShowToolPicker(true)}
                disabled={loadingTools}
                className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 disabled:opacity-50"
              >
                {loadingTools ? (
                  <Loader className="h-3 w-3 animate-spin" />
                ) : (
                  <Plus className="h-3 w-3" />
                )}
                <span>Add Tool</span>
              </button>
            </div>

            {config.tools.length > 0 ? (
              <div className="space-y-2">
                {config.tools.map(toolId => {
                  const tool = getToolById(toolId)
                  if (!tool) return null
                  
                  const IconComponent = toolCategoryIcons[tool.category] || Settings
                  
                  return (
                    <div key={toolId} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <div className="flex items-center space-x-2">
                        <IconComponent className="h-4 w-4 text-gray-500" />
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {tool.name}
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {tool.description}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveTool(toolId)}
                        className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-md">
                <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No tools selected</p>
                <p className="text-xs">Click "Add Tool" to get started</p>
              </div>
            )}

            {toolsError && (
              <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-md">
                <p className="text-xs text-yellow-800 dark:text-yellow-300">{toolsError}</p>
              </div>
            )}
          </div>
        </div>

        {/* Department Assignment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Department Assignment
          </label>
          <select
            value={config.department || ''}
            onChange={(e) => handleConfigChange('department', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">No Department (Independent Agent)</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Select which department this agent belongs to
          </p>
        </div>

        {/* Advanced Configuration */}
        <div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 hover:text-gray-900 dark:hover:text-white"
          >
            <Code className="h-4 w-4 text-purple-600" />
            <span>Advanced Settings</span>
            {showAdvanced ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>

          {showAdvanced && (
            <div className="space-y-4">
              {/* Model Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  AI Model
                </label>
                <select
                  value={config.model || 'gpt-4o'}
                  onChange={(e) => handleConfigChange('model', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <optgroup label="Claude (Anthropic)">
                    <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                    <option value="claude-3-7-sonnet">Claude 3.7 Sonnet</option>
                    <option value="claude-4">Claude 4</option>
                  </optgroup>
                  <optgroup label="Gemini (Google)">
                    <option value="gemini-2-5-pro">Gemini 2.5 Pro</option>
                  </optgroup>
                  <optgroup label="GPT (OpenAI)">
                    <option value="gpt-4-1">GPT 4.1</option>
                    <option value="gpt-4o">GPT 4o</option>
                    <option value="o3">o3</option>
                    <option value="o3-mini">o3 mini</option>
                    <option value="gpt-5-mini">GPT 5 mini</option>
                    <option value="gpt-5">GPT 5</option>
                  </optgroup>
                  <optgroup label="DeepSeek">
                    <option value="deepseek-r1">DeepSeek R1</option>
                  </optgroup>
                  <optgroup label="Mistral">
                    <option value="mistral-large">Mistral Large</option>
                    <option value="mistral-medium">Mistral Medium</option>
                  </optgroup>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Select the AI model for this agent
                </p>
              </div>

              {/* Custom System Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Custom System Prompt
                </label>
                <textarea
                  value={config.systemPrompt || ''}
                  onChange={(e) => handleConfigChange('systemPrompt', e.target.value)}
                  placeholder="Override default system prompt for fine-grained control..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none font-mono text-sm"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Leave empty to use default system prompt based on role and backstory
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tool Picker Modal */}
      {showToolPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-96 max-h-[80vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Select Tools
                </h3>
                <button
                  onClick={() => setShowToolPicker(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {loadingTools ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600 dark:text-gray-400">Loading tools...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableTools.map(tool => {
                    const IconComponent = toolCategoryIcons[tool.category] || Settings
                    const isSelected = config.tools.includes(tool.id)
                    
                    return (
                      <button
                        key={tool.id}
                        onClick={() => handleAddTool(tool.id)}
                        disabled={isSelected}
                        className={`
                          w-full p-3 text-left rounded-md border transition-colors
                          ${isSelected
                            ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-600 cursor-not-allowed'
                            : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                          }
                        `}
                      >
                        <div className="flex items-center space-x-3">
                          <IconComponent className={`h-5 w-5 ${isSelected ? 'text-green-600' : 'text-gray-500'}`} />
                          <div className="flex-1">
                            <span className={`text-sm font-medium ${isSelected ? 'text-green-900 dark:text-green-300' : 'text-gray-900 dark:text-white'}`}>
                              {tool.name}
                            </span>
                            <p className={`text-xs ${isSelected ? 'text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                              {tool.description}
                            </p>
                          </div>
                          {isSelected && (
                            <span className="text-xs text-green-600 font-medium">Selected</span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
