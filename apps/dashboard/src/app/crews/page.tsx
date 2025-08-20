'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  Plus, 
  Search, 
  Calendar, 
  Play, 
  Edit3, 
  Trash2, 
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react'
import { studioApi } from '@/lib/api'

interface CrewSummary {
  id: string
  name: string
  description: string
  agents: Array<{
    id: string
    role: string
    status: 'idle' | 'pending' | 'running' | 'completed' | 'failed'
  }>
  created_at: string
  updated_at: string
  last_execution?: {
    id: string
    status: 'idle' | 'running' | 'completed' | 'error'
    started_at: string
    total_cost: number
    total_tokens: number
  }
}

export default function CrewsPage() {
  const router = useRouter()
  const [crews, setCrews] = useState<CrewSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingCrewId, setDeletingCrewId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'idle'>('all')

  useEffect(() => {
    loadCrews()
  }, [])

  const loadCrews = async () => {
    try {
      setLoading(true)
      const crewsData = await studioApi.getCrews()
      
      // Transform API data to match our UI interface
      const formattedCrews: CrewSummary[] = crewsData.map(crew => ({
        id: crew.id || '',
        name: crew.name,
        description: crew.description || '',
        agents: crew.agents.map(agent => ({
          id: agent.id,
          role: agent.config.role,
          status: agent.status
        })),
        created_at: typeof crew.created_at === 'string' ? crew.created_at : (crew.created_at?.toISOString() || new Date().toISOString()),
        updated_at: typeof crew.updated_at === 'string' ? crew.updated_at : (crew.updated_at?.toISOString() || new Date().toISOString())
      }))
      
      setCrews(formattedCrews)
    } catch (error) {
      console.error('Failed to load crews:', error)
      // Fallback to mock data if API fails
      const mockCrews: CrewSummary[] = [
        {
          id: '1',
          name: 'Marketing Research Team',
          description: 'Competitive analysis and market research crew',
          agents: [
            { id: 'agent-1', role: 'Market Researcher', status: 'idle' },
            { id: 'agent-2', role: 'Data Analyst', status: 'idle' },
            { id: 'agent-3', role: 'Report Writer', status: 'idle' }
          ],
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-20T14:45:00Z',
          last_execution: {
            id: 'exec-1',
            status: 'completed',
            started_at: '2024-01-20T09:15:00Z',
            total_cost: 0.24,
            total_tokens: 1250
          }
        },
        {
          id: '2',
          name: 'Content Creation Squad',
          description: 'Blog posts, social media, and marketing content generation',
          agents: [
            { id: 'agent-4', role: 'Content Strategist', status: 'idle' },
            { id: 'agent-5', role: 'Copywriter', status: 'idle' },
            { id: 'agent-6', role: 'SEO Specialist', status: 'idle' },
            { id: 'agent-7', role: 'Social Media Manager', status: 'idle' }
          ],
          created_at: '2024-01-10T08:20:00Z',
          updated_at: '2024-01-18T16:30:00Z',
          last_execution: {
            id: 'exec-2',
            status: 'running',
            started_at: '2024-01-21T11:00:00Z',
            total_cost: 0.18,
            total_tokens: 920
          }
        }
      ]
      setCrews(mockCrews)
    } finally {
      setLoading(false)
    }
  }

  const filteredCrews = crews.filter(crew => {
    const matchesSearch = crew.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         crew.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (filterStatus === 'all') return matchesSearch
    if (filterStatus === 'active') return matchesSearch && crew.last_execution?.status === 'running'
    if (filterStatus === 'idle') return matchesSearch && crew.last_execution?.status !== 'running'
    
    return matchesSearch
  })

  const handleCreateCrew = () => {
    router.push('/studio')
  }

  const handleEditCrew = (crewId: string) => {
    router.push(`/studio?crew=${crewId}`)
  }

  const handleExecuteCrew = async (crewId: string) => {
    try {
      const execution = await studioApi.executeCrew(crewId)
      console.log('Crew execution started:', execution)
      // Refresh crews to show updated status
      loadCrews()
    } catch (error) {
      console.error('Failed to execute crew:', error)
    }
  }

  const handleDeleteCrew = async (crewId: string, crewName: string) => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete the crew "${crewName}"?\n\nThis action cannot be undone.`
    )
    
    if (!confirmed) return

    try {
      setDeletingCrewId(crewId)
      await studioApi.deleteCrew(crewId)
      
      // Remove the deleted crew from the local state
      setCrews(prev => prev.filter(crew => crew.id !== crewId))
      
      console.log('Crew deleted successfully:', crewId)
    } catch (error) {
      console.error('Failed to delete crew:', error)
      // You could add a toast notification here
      alert('Failed to delete crew. Please try again.')
    } finally {
      setDeletingCrewId(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Loader className="h-4 w-4 animate-spin text-blue-500" />
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />
      default: return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300'
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300'
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <Users className="h-8 w-8 mr-3 text-blue-600" />
                Your Crews
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage and monitor your agent teams
              </p>
            </div>
            <button
              onClick={handleCreateCrew}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>New Crew</span>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search crews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex space-x-2">
              {(['all', 'active', 'idle'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filterStatus === status
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Crews Grid */}
        {filteredCrews.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchQuery ? 'No crews found' : 'No crews yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery 
                ? 'Try adjusting your search terms or filters'
                : 'Create your first agent crew to get started'
              }
            </p>
            {!searchQuery && (
              <button
                onClick={handleCreateCrew}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Create Your First Crew</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCrews.map((crew) => (
              <div
                key={crew.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Card Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {crew.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {crew.description}
                      </p>
                    </div>
                    {crew.last_execution && (
                      <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(crew.last_execution.status)}`}>
                        {getStatusIcon(crew.last_execution.status)}
                        <span className="capitalize">{crew.last_execution.status}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Agents */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Agents ({crew.agents.length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {crew.agents.slice(0, 3).map((agent) => (
                      <div key={agent.id} className="flex items-center space-x-2 text-sm">
                        <div className={`w-2 h-2 rounded-full ${
                          agent.status === 'running' ? 'bg-blue-500' :
                          agent.status === 'completed' ? 'bg-green-500' :
                          agent.status === 'failed' ? 'bg-red-500' : 'bg-gray-300'
                        }`} />
                        <span className="text-gray-600 dark:text-gray-400">{agent.role}</span>
                      </div>
                    ))}
                    {crew.agents.length > 3 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        +{crew.agents.length - 3} more agents
                      </div>
                    )}
                  </div>
                </div>

                {/* Last Execution Stats */}
                {crew.last_execution && (
                  <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>Last run: {formatDate(crew.last_execution.started_at)}</span>
                      <div className="flex space-x-3">
                        <span>{crew.last_execution.total_tokens.toLocaleString()} tokens</span>
                        <span>${crew.last_execution.total_cost.toFixed(3)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="h-3 w-3" />
                    <span>Updated {formatDate(crew.updated_at)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleExecuteCrew(crew.id)}
                      className="p-1.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded-md transition-colors"
                      title="Execute crew"
                    >
                      <Play className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditCrew(crew.id)}
                      className="p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-md transition-colors"
                      title="Edit crew"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCrew(crew.id, crew.name)}
                      disabled={deletingCrewId === crew.id}
                      className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={deletingCrewId === crew.id ? "Deleting..." : "Delete crew"}
                    >
                      {deletingCrewId === crew.id ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
