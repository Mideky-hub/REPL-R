'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import { Agent, Connection, CanvasPosition } from '@/types/studio'
import { AgentCard } from './AgentCard'
import { ConnectionLine } from './ConnectionLine'
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react'

interface StudioCanvasProps {
  agents: Agent[]
  connections: Connection[]
  selectedAgent: Agent | null
  canvasPosition: CanvasPosition
  isRunning: boolean
  onAddAgent: (position: { x: number; y: number }) => void
  onSelectAgent: (agent: Agent | null) => void
  onUpdateAgent: (agentId: string, updates: Partial<Agent>) => void
  onDeleteAgent: (agentId: string) => void
  onCreateConnection: (sourceId: string, targetId: string, sourceType: 'input' | 'output', targetType: 'input' | 'output') => void
  onCanvasPositionChange: (position: CanvasPosition) => void
}

export function StudioCanvas({
  agents,
  connections,
  selectedAgent,
  canvasPosition,
  isRunning,
  onAddAgent,
  onSelectAgent,
  onUpdateAgent,
  onDeleteAgent,
  onCreateConnection,
  onCanvasPositionChange
}: StudioCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [connectionStart, setConnectionStart] = useState<{
    agentId: string
    type: 'input' | 'output'
    position: { x: number; y: number }
  } | null>(null)
  const [connectionPreview, setConnectionPreview] = useState<{ x: number; y: number } | null>(null)

  // Handle canvas panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - canvasPosition.x, y: e.clientY - canvasPosition.y })
    }
  }, [canvasPosition])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && canvasRef.current) {
      const newX = e.clientX - dragStart.x
      const newY = e.clientY - dragStart.y
      onCanvasPositionChange({ ...canvasPosition, x: newX, y: newY })
    }

    // Update connection preview
    if (connectionStart) {
      setConnectionPreview({ x: e.clientX, y: e.clientY })
    }
  }, [isDragging, dragStart, canvasPosition, onCanvasPositionChange, connectionStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setConnectionStart(null)
    setConnectionPreview(null)
  }, [])

  // Handle zooming
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.max(0.25, Math.min(2, canvasPosition.zoom * zoomFactor))
    onCanvasPositionChange({ ...canvasPosition, zoom: newZoom })
  }, [canvasPosition, onCanvasPositionChange])

  // Handle double-click to add agent
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left - canvasPosition.x) / canvasPosition.zoom
      const y = (e.clientY - rect.top - canvasPosition.y) / canvasPosition.zoom
      onAddAgent({ x, y })
    }
  }, [canvasPosition, onAddAgent])

  // Handle agent drag
  const handleAgentDrag = useCallback((agentId: string, position: { x: number; y: number }) => {
    onUpdateAgent(agentId, { position })
  }, [onUpdateAgent])

  // Handle connection creation
  const handleConnectionStart = useCallback((agentId: string, type: 'input' | 'output', position: { x: number; y: number }) => {
    setConnectionStart({ agentId, type, position })
  }, [])

  const handleConnectionEnd = useCallback((targetAgentId: string, targetType: 'input' | 'output') => {
    if (connectionStart && connectionStart.agentId !== targetAgentId) {
      onCreateConnection(connectionStart.agentId, targetAgentId, connectionStart.type, targetType)
    }
    setConnectionStart(null)
    setConnectionPreview(null)
  }, [connectionStart, onCreateConnection])

  // Zoom controls
  const handleZoomIn = () => {
    const newZoom = Math.min(2, canvasPosition.zoom * 1.2)
    onCanvasPositionChange({ ...canvasPosition, zoom: newZoom })
  }

  const handleZoomOut = () => {
    const newZoom = Math.max(0.25, canvasPosition.zoom * 0.8)
    onCanvasPositionChange({ ...canvasPosition, zoom: newZoom })
  }

  const handleZoomReset = () => {
    onCanvasPositionChange({ x: 0, y: 0, zoom: 1 })
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedAgent) {
        onDeleteAgent(selectedAgent.id)
      }
      if (e.key === 'Escape') {
        onSelectAgent(null)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedAgent, onDeleteAgent, onSelectAgent])

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Canvas Controls */}
      <div className="absolute top-4 right-4 z-10 flex space-x-2">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={handleZoomReset}
          className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <Maximize className="h-4 w-4" />
        </button>
      </div>

      {/* Zoom Level Indicator */}
      <div className="absolute bottom-4 right-4 z-10 px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm">
        {Math.round(canvasPosition.zoom * 100)}%
      </div>

      {/* Main Canvas */}
      <div
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        style={{
          backgroundImage: `
            radial-gradient(circle, #e5e7eb 1px, transparent 1px),
            radial-gradient(circle, #e5e7eb 1px, transparent 1px)
          `,
          backgroundSize: `${20 * canvasPosition.zoom}px ${20 * canvasPosition.zoom}px`,
          backgroundPosition: `${canvasPosition.x}px ${canvasPosition.y}px, ${canvasPosition.x + 10 * canvasPosition.zoom}px ${canvasPosition.y + 10 * canvasPosition.zoom}px`
        }}
      >
        {/* Connection Lines */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 1 }}
        >
          {connections.map(connection => {
            const sourceAgent = agents.find(a => a.id === connection.source_agent_id)
            const targetAgent = agents.find(a => a.id === connection.target_agent_id)
            
            if (!sourceAgent || !targetAgent) return null
            
            return (
              <ConnectionLine
                key={connection.id}
                connection={connection}
                sourceAgent={sourceAgent}
                targetAgent={targetAgent}
                canvasPosition={canvasPosition}
              />
            )
          })}
          
          {/* Connection Preview */}
          {connectionStart && connectionPreview && (
            <line
              x1={connectionStart.position.x}
              y1={connectionStart.position.y}
              x2={connectionPreview.x}
              y2={connectionPreview.y}
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="5,5"
              className="animate-pulse"
            />
          )}
        </svg>

        {/* Agents */}
        <div
          style={{
            transform: `translate(${canvasPosition.x}px, ${canvasPosition.y}px) scale(${canvasPosition.zoom})`,
            transformOrigin: '0 0'
          }}
        >
          {agents.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              isSelected={selectedAgent?.id === agent.id}
              isRunning={isRunning}
              onSelect={() => onSelectAgent(agent)}
              onDelete={() => onDeleteAgent(agent.id)}
              onDrag={(position) => handleAgentDrag(agent.id, position)}
              onConnectionStart={(type, position) => handleConnectionStart(agent.id, type, position)}
              onConnectionEnd={(type) => handleConnectionEnd(agent.id, type)}
            />
          ))}
        </div>
      </div>

      {/* Empty State */}
      {agents.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-medium mb-2">Welcome to Agent Crew Studio</h3>
            <p className="text-sm">Double-click to add your first agent, or drag from the component library</p>
          </div>
        </div>
      )}
    </div>
  )
}
