'use client'

import { useState, useEffect } from 'react'
import { Activity, AlertCircle, Clock, DollarSign, Eye, Zap, Workflow } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import Link from 'next/link'
import { Navigation } from '@/components/navigation/Navigation'
import { dashboardApi } from '@/lib/api'
import { DashboardMetrics, TokenUsagePoint, CostBreakdownItem, TraceListItem } from '@/types/studio'

export default function Dashboard() {
  const [selectedTrace, setSelectedTrace] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState('24h')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Data state
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [tokenUsageData, setTokenUsageData] = useState<TokenUsagePoint[]>([])
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdownItem[]>([])
  const [traces, setTraces] = useState<TraceListItem[]>([])
  const [traceDetail, setTraceDetail] = useState<any>(null)

  // Load dashboard data
  useEffect(() => {
    loadDashboardData()
  }, [timeRange])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load all dashboard data in parallel
      const [
        metricsResult,
        tokenUsageResult,
        costBreakdownResult,
        tracesResult
      ] = await Promise.all([
        dashboardApi.getMetrics(timeRange),
        dashboardApi.getTokenUsage(timeRange),
        dashboardApi.getCostBreakdown(timeRange),
        dashboardApi.getRecentTraces(20, 0)
      ])

      setMetrics(metricsResult)
      setTokenUsageData(tokenUsageResult)
      setCostBreakdown(costBreakdownResult)
      setTraces(tracesResult)

    } catch (err) {
      console.error('Failed to load dashboard data:', err)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadTraceDetail = async (traceId: string) => {
    try {
      const detail = await dashboardApi.getTraceDetail(traceId)
      setTraceDetail(detail)
      setSelectedTrace(traceId)
    } catch (err) {
      console.error('Failed to load trace detail:', err)
      setError('Failed to load trace details.')
    }
  }

  if (loading && !metrics) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error && !metrics) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button 
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <Activity className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">REPL;ay</h1>
              </div>
              <Navigation />
              <div className="hidden sm:flex items-center space-x-1 text-sm text-gray-500">
                <span>Production</span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="text-sm border rounded-md px-3 py-1 bg-white dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="1h">Last hour</option>
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Traces</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {metrics?.total_traces || 0}
                </p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Agents</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {metrics?.active_agents || 0}
                </p>
              </div>
              <Zap className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Cost</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  ${metrics?.total_cost?.toFixed(2) || '0.00'}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Latency</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {metrics?.avg_latency?.toFixed(1) || '0.0'}s
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Token Usage Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Token Usage Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={tokenUsageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                  formatter={(value) => [value.toLocaleString(), 'Tokens']}
                />
                <Line type="monotone" dataKey="tokens" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cost by Model</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={costBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="cost"
                >
                  {costBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, 'Cost']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {costBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full`} style={{backgroundColor: item.color}}></div>
                    <span className="text-gray-600 dark:text-gray-400">{item.model_name}</span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">${item.cost}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Traces */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Traces</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Trace
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Agents/Tasks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tokens
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {traces.map((trace) => (
                  <tr key={trace.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{trace.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{trace.id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        trace.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        trace.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {trace.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {(trace.duration / 1000).toFixed(1)}s
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {trace.agents} / {trace.tasks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {trace.tokens.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      ${trace.cost}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => loadTraceDetail(trace.id)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {traces.length === 0 && !loading && (
            <div className="text-center py-12">
              <Activity className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No traces found</h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Start using the Studio or integrate the SDK to see traces here.
              </p>
              <div className="mt-6">
                <Link 
                  href="/studio" 
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Workflow className="mr-2 h-4 w-4" />
                  Open Studio
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Trace View Modal */}
        {selectedTrace && traceDetail && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Trace Details: {traceDetail.name}
                </h2>
                <button
                  onClick={() => {
                    setSelectedTrace(null)
                    setTraceDetail(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
                    <div className="font-medium text-gray-900 dark:text-white capitalize">{traceDetail.status}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Duration</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {traceDetail.duration ? `${(traceDetail.duration / 1000).toFixed(1)}s` : 'N/A'}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Total Tokens</div>
                    <div className="font-medium text-gray-900 dark:text-white">{traceDetail.total_tokens.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Total Cost</div>
                    <div className="font-medium text-gray-900 dark:text-white">${traceDetail.total_cost.toFixed(2)}</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Timeline</h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {traceDetail.timeline.length > 0 ? (
                      <div className="space-y-2">
                        {traceDetail.timeline.slice(0, 5).map((event: any, index: number) => (
                          <div key={index} className="flex justify-between items-center">
                            <span>{event.type} - {event.agent_name || event.agent_id}</span>
                            <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                          </div>
                        ))}
                        {traceDetail.timeline.length > 5 && (
                          <div className="text-gray-500">... and {traceDetail.timeline.length - 5} more events</div>
                        )}
                      </div>
                    ) : (
                      'No timeline events available'
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">LLM Calls</h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {traceDetail.llm_calls.length > 0 ? (
                      <div className="space-y-2">
                        {traceDetail.llm_calls.map((call: any, index: number) => (
                          <div key={index} className="flex justify-between items-center">
                            <span>{call.model_name} - {call.completion_tokens} tokens</span>
                            <span>${call.cost.toFixed(4)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      'No LLM calls recorded'
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Refreshing...</span>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 rounded-lg p-4 max-w-sm">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
            </div>
            <button 
              onClick={() => setError(null)}
              className="mt-2 text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
            >
              Dismiss
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
