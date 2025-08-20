'use client'

import { useState } from 'react'
import { 
  Bot, 
  Workflow, 
  Settings, 
  Database,
  Search,
  FileText,
  MessageSquare,
  BarChart3,
  Globe,
  Code,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

interface ComponentItem {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  type: 'agent' | 'tool' | 'trigger' | 'action'
  category: string
}

const componentCategories = [
  {
    name: 'Agents',
    icon: Bot,
    expanded: true,
    items: [
      {
        id: 'research-agent',
        name: 'Research Agent',
        description: 'Specialized in gathering and analyzing information',
        icon: Search,
        type: 'agent' as const,
        category: 'agents'
      },
      {
        id: 'writer-agent',
        name: 'Content Writer',
        description: 'Creates written content based on research and requirements',
        icon: FileText,
        type: 'agent' as const,
        category: 'agents'
      },
      {
        id: 'analyst-agent',
        name: 'Data Analyst',
        description: 'Processes and analyzes data to extract insights',
        icon: BarChart3,
        type: 'agent' as const,
        category: 'agents'
      },
      {
        id: 'qa-agent',
        name: 'Quality Assurance',
        description: 'Reviews and validates outputs for quality and accuracy',
        icon: Settings,
        type: 'agent' as const,
        category: 'agents'
      }
    ]
  },
  {
    name: 'Tools',
    icon: Settings,
    expanded: false,
    items: [
      {
        id: 'web-search',
        name: 'Web Search',
        description: 'Search the internet for information',
        icon: Globe,
        type: 'tool' as const,
        category: 'tools'
      },
      {
        id: 'database-query',
        name: 'Database Query',
        description: 'Query databases for structured data',
        icon: Database,
        type: 'tool' as const,
        category: 'tools'
      },
      {
        id: 'file-read',
        name: 'File Reader',
        description: 'Read and process files',
        icon: FileText,
        type: 'tool' as const,
        category: 'tools'
      },
      {
        id: 'api-call',
        name: 'API Call',
        description: 'Make HTTP requests to external APIs',
        icon: Code,
        type: 'tool' as const,
        category: 'tools'
      }
    ]
  },
  {
    name: 'Workflow',
    icon: Workflow,
    expanded: false,
    items: [
      {
        id: 'conditional',
        name: 'Conditional',
        description: 'Route execution based on conditions',
        icon: Workflow,
        type: 'action' as const,
        category: 'workflow'
      },
      {
        id: 'parallel',
        name: 'Parallel Execution',
        description: 'Run multiple agents in parallel',
        icon: Workflow,
        type: 'action' as const,
        category: 'workflow'
      }
    ]
  }
]

export function ComponentLibrary() {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Agents'])
  const [draggedItem, setDraggedItem] = useState<ComponentItem | null>(null)

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryName)
        ? prev.filter(name => name !== categoryName)
        : [...prev, categoryName]
    )
  }

  const handleDragStart = (item: ComponentItem, e: React.DragEvent) => {
    setDraggedItem(item)
    e.dataTransfer.setData('application/json', JSON.stringify(item))
    e.dataTransfer.effectAllowed = 'copy'
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
  }

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Components
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Drag components to the canvas
        </p>
      </div>

      {/* Component Categories */}
      <div className="flex-1 overflow-y-auto">
        {componentCategories.map(category => {
          const CategoryIcon = category.icon
          const isExpanded = expandedCategories.includes(category.name)
          
          return (
            <div key={category.name} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.name)}
                className="w-full px-4 py-3 flex items-center justify-between text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <CategoryIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {category.name}
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
              </button>

              {/* Category Items */}
              {isExpanded && (
                <div className="pb-2">
                  {category.items.map(item => {
                    const ItemIcon = item.icon
                    
                    return (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(item, e)}
                        onDragEnd={handleDragEnd}
                        className={`
                          mx-2 my-1 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md cursor-grab active:cursor-grabbing
                          hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all
                          ${draggedItem?.id === item.id ? 'opacity-50' : ''}
                        `}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <ItemIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {item.name}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                              {item.description}
                            </p>
                            <span className={`
                              inline-block mt-2 px-2 py-1 text-xs rounded-full
                              ${item.type === 'agent' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' :
                                item.type === 'tool' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
                                'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'}
                            `}>
                              {item.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Usage Tips */}
      <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-blue-700 dark:text-blue-300">
          <div className="font-medium mb-1">💡 Quick Tips:</div>
          <ul className="space-y-1 text-blue-600 dark:text-blue-400">
            <li>• Drag agents to the canvas</li>
            <li>• Double-click canvas to add agent</li>
            <li>• Connect agents with drag & drop</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
