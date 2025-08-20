'use client'

import { Agent, Connection, CanvasPosition } from '@/types/studio'

interface ConnectionLineProps {
  connection: Connection
  sourceAgent: Agent
  targetAgent: Agent
  canvasPosition: CanvasPosition
}

export function ConnectionLine({ connection, sourceAgent, targetAgent, canvasPosition }: ConnectionLineProps) {
  // Calculate connection points
  const sourceX = sourceAgent.position.x + 256 // Right edge of source card (width: 256px)
  const sourceY = sourceAgent.position.y + 60  // Middle of source card
  const targetX = targetAgent.position.x       // Left edge of target card
  const targetY = targetAgent.position.y + 60  // Middle of target card

  // Apply canvas transformations
  const transformedSourceX = sourceX * canvasPosition.zoom + canvasPosition.x
  const transformedSourceY = sourceY * canvasPosition.zoom + canvasPosition.y
  const transformedTargetX = targetX * canvasPosition.zoom + canvasPosition.x
  const transformedTargetY = targetY * canvasPosition.zoom + canvasPosition.y

  // Create bezier curve path
  const deltaX = transformedTargetX - transformedSourceX
  const controlPointOffset = Math.max(50, Math.abs(deltaX) * 0.3)
  
  const controlPoint1X = transformedSourceX + controlPointOffset
  const controlPoint1Y = transformedSourceY
  const controlPoint2X = transformedTargetX - controlPointOffset
  const controlPoint2Y = transformedTargetY

  const pathData = `
    M ${transformedSourceX} ${transformedSourceY}
    C ${controlPoint1X} ${controlPoint1Y},
      ${controlPoint2X} ${controlPoint2Y},
      ${transformedTargetX} ${transformedTargetY}
  `

  // Status-based styling
  const getConnectionStyle = () => {
    const sourceStatus = sourceAgent.status
    const targetStatus = targetAgent.status
    
    if (sourceStatus === 'running' || targetStatus === 'running') {
      return {
        stroke: '#3b82f6',
        strokeWidth: 3,
        animation: 'connection-pulse 2s infinite'
      }
    }
    
    if (sourceStatus === 'completed' && targetStatus === 'completed') {
      return {
        stroke: '#10b981',
        strokeWidth: 2
      }
    }
    
    if (sourceStatus === 'failed' || targetStatus === 'failed') {
      return {
        stroke: '#ef4444',
        strokeWidth: 2
      }
    }
    
    return {
      stroke: '#6b7280',
      strokeWidth: 2
    }
  }

  const style = getConnectionStyle()

  return (
    <>
      {/* Drop shadow */}
      <path
        d={pathData}
        fill="none"
        stroke="rgba(0,0,0,0.1)"
        strokeWidth={style.strokeWidth + 1}
        transform="translate(1, 1)"
      />
      
      {/* Main connection line */}
      <path
        d={pathData}
        fill="none"
        stroke={style.stroke}
        strokeWidth={style.strokeWidth}
        strokeLinecap="round"
        strokeDasharray={connection.config.dataMapping === 'conditional' ? '5,5' : 'none'}
        className={style.animation ? 'animate-pulse' : ''}
      />
      
      {/* Arrow head */}
      <defs>
        <marker
          id={`arrowhead-${connection.id}`}
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill={style.stroke}
          />
        </marker>
      </defs>
      
      <path
        d={pathData}
        fill="none"
        stroke="transparent"
        strokeWidth="1"
        markerEnd={`url(#arrowhead-${connection.id})`}
      />

      {/* Data flow animation dots (when running) */}
      {sourceAgent.status === 'running' && (
        <>
          <circle r="3" fill={style.stroke} opacity="0.8">
            <animateMotion dur="2s" repeatCount="indefinite" path={pathData} />
            <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle r="2" fill={style.stroke} opacity="0.6">
            <animateMotion dur="2s" repeatCount="indefinite" path={pathData} begin="0.5s" />
            <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" begin="0.5s" />
          </circle>
        </>
      )}
    </>
  )
}
