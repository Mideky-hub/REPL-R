'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Agent, AgentStatus } from '@/types/studio'
import { 
  Bot, 
  Circle, 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle, 
  Clock,
  Trash2,
  Settings
} from 'lucide-react'

interface AgentCardProps {
  agent: Agent
  isSelected: boolean
  isRunning: boolean
  onSelect: () => void
  onDelete: () => void
  onDrag: (position: { x: number; y: number }) => void
  onConnectionStart: (type: 'input' | 'output', position: { x: number; y: number }) => void
  onConnectionEnd: (type: 'input' | 'output') => void
}

export function AgentCard({ 
  agent, 
  isSelected, 
  isRunning,
  onSelect, 
  onDelete,
  onDrag, 
  onConnectionStart, 
  onConnectionEnd 
}: AgentCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Status styling
  const getStatusConfig = (status: AgentStatus) => {
    switch (status) {
      case 'idle':
        return { icon: Circle, color: 'text-gray-400', bg: 'bg-gray-100 dark:bg-gray-700' }
      case 'pending':
        return { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900' }
      case 'running':
        return { icon: Play, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900' }
      case 'completed':
        return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900' }
      case 'failed':
        return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900' }
      default:
        return { icon: Circle, color: 'text-gray-400', bg: 'bg-gray-100 dark:bg-gray-700' }
    }
  }

  const statusConfig = getStatusConfig(agent.status)
  const StatusIcon = statusConfig.icon

  // Handle dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target instanceof HTMLElement && e.target.closest('.connection-node')) {
      return // Don't drag when clicking on connection nodes
    }
    
    setIsDragging(true)
    setDragStart({
      x: e.clientX - agent.position.x,
      y: e.clientY - agent.position.y
    })
    onSelect()
    e.preventDefault()
  }, [agent.position, onSelect])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x
      const newY = e.clientY - dragStart.y
      onDrag({ x: newX, y: newY })
    }
  }, [isDragging, dragStart, onDrag])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Add global mouse event listeners when dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // Handle connection nodes
  const handleConnectionMouseDown = (type: 'input' | 'output', e: React.MouseEvent) => {
    e.stopPropagation()
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    onConnectionStart(type, {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    })
  }

  const handleConnectionMouseUp = (type: 'input' | 'output', e: React.MouseEvent) => {
    e.stopPropagation()
    onConnectionEnd(type)
  }

  return (
    <div
      ref={cardRef}
      className={`absolute select-none transition-all duration-200 ${
        isSelected ? 'z-20' : 'z-10'
      }`}
      style={{
        left: agent.position.x,
        top: agent.position.y,
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
      }}
    >
      {/* Agent Card */}
      <div
        className={`
          w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 transition-all cursor-move
          ${isSelected ? 'border-blue-500 shadow-xl' : 'border-gray-200 dark:border-gray-600'}
          ${agent.status === 'running' ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
          hover:shadow-xl
        `}
        onMouseDown={handleMouseDown}
        onClick={onSelect}
      >
        {/* Header */}
        <div className={`px-4 py-3 rounded-t-lg ${statusConfig.bg}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              <span className="font-medium text-gray-900 dark:text-white text-sm">
                {agent.config.role}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              {isSelected && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete()
                  }}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  title="Delete agent (or press Delete key)"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-3">
          <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            <span className="font-medium">Goal:</span> {agent.config.goal}
          </div>
          
          {agent.config.tools.length > 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <span className="font-medium">Tools:</span> {agent.config.tools.slice(0, 2).join(', ')}
              {agent.config.tools.length > 2 && ` +${agent.config.tools.length - 2} more`}
            </div>
          )}
        </div>

        {/* Status Bar */}
        {agent.status !== 'idle' && (
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-300 capitalize">
                {agent.status}
              </span>
              {agent.status === 'running' && (
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-75" />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Connection Nodes */}
      {/* Input Node (Left) */}
      <div
        className="connection-node absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full cursor-crosshair hover:scale-125 transition-transform"
        onMouseDown={(e) => handleConnectionMouseDown('input', e)}
        onMouseUp={(e) => handleConnectionMouseUp('input', e)}
        title="Input connection"
      />

      {/* Output Node (Right) */}
      <div
        className="connection-node absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 border-2 border-white dark:border-gray-800 rounded-full cursor-crosshair hover:scale-125 transition-transform"
        onMouseDown={(e) => handleConnectionMouseDown('output', e)}
        onMouseUp={(e) => handleConnectionMouseUp('output', e)}
        title="Output connection"
      />

      {/* Selection Indicators */}
      {isSelected && (
        <>
          {/* Resize handles */}
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full" />
        </>
      )}
    </div>
  )
}
