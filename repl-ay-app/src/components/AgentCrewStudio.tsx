'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Play, 
  Settings, 
  Trash2, 
  Bot, 
  Zap, 
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react'
import { WorkflowStep, AgentCrewWorkflow } from '@/types'
import { generateId } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface AgentCrewStudioProps {
  isAuthenticated: boolean
  userTier: string
  onUpgrade: () => void
}

interface StepExecutionStatus {
  stepId: string
  status: 'pending' | 'running' | 'completed' | 'error'
  logs: string[]
}

export function AgentCrewStudio({ userTier, onUpgrade }: AgentCrewStudioProps) {
  const [workflow, setWorkflow] = useState<AgentCrewWorkflow>({
    id: generateId(),
    name: 'My Agent Crew',
    description: 'A powerful workflow for automating tasks',
    steps: [],
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date()
  })
  
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [executionStatus, setExecutionStatus] = useState<StepExecutionStatus[]>([])
  const [showConfigPanel, setShowConfigPanel] = useState(false)

  // Check if user has access to paid features
  const hasAccess = ['developer', 'founder', 'pro'].includes(userTier)

  const addStep = useCallback((type: 'trigger' | 'agent') => {
    if (!hasAccess) {
      onUpgrade()
      return
    }

    const newStep: WorkflowStep = {
      id: generateId(),
      type: type,
      position: { x: 0, y: workflow.steps.length * 120 + 100 },
      data: {
        role: type === 'agent' ? 'New Agent' : 'Trigger',
        goal: type === 'agent' ? 'Define the agent\'s goal here' : 'Start the workflow',
        backstory: type === 'agent' ? 'Describe the agent\'s expertise' : '',
        tools: []
      },
      connections: workflow.steps.length > 0 ? [workflow.steps[workflow.steps.length - 1].id] : []
    }

    setWorkflow(prev => ({
      ...prev,
      steps: [...prev.steps, newStep],
      updatedAt: new Date()
    }))
  }, [workflow.steps, hasAccess, onUpgrade])

  const updateStep = useCallback((stepId: string, updates: Partial<WorkflowStep>) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId 
          ? { ...step, ...updates, data: { ...step.data, ...updates.data } }
          : step
      ),
      updatedAt: new Date()
    }))
  }, [])

  const deleteStep = useCallback((stepId: string) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId),
      updatedAt: new Date()
    }))
    if (selectedStep?.id === stepId) {
      setSelectedStep(null)
    }
  }, [selectedStep])

  const runWorkflow = useCallback(async () => {
    if (!hasAccess || workflow.steps.length === 0) return

    setIsRunning(true)
    setExecutionStatus(workflow.steps.map(step => ({
      stepId: step.id,
      status: 'pending',
      logs: []
    })))

    // Simulate workflow execution
    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i]
      
      // Update status to running
      setExecutionStatus(prev => prev.map(status => 
        status.stepId === step.id 
          ? { ...status, status: 'running', logs: [...status.logs, `Starting ${step.data.role}...`] }
          : status
      ))

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000))

      // Update status to completed (or error with 10% chance)
      const hasError = Math.random() < 0.1
      setExecutionStatus(prev => prev.map(status => 
        status.stepId === step.id 
          ? { 
              ...status, 
              status: hasError ? 'error' : 'completed',
              logs: [
                ...status.logs, 
                hasError 
                  ? `❌ Error: Failed to execute ${step.data.role}` 
                  : `✅ Successfully completed ${step.data.role} task`
              ]
            }
          : status
      ))

      if (hasError) break
    }

    setIsRunning(false)
  }, [workflow.steps, hasAccess])

  const getStepStatus = (stepId: string) => {
    return executionStatus.find(s => s.stepId === stepId)
  }

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl mx-auto"
        >
          <div className="glass-dark rounded-2xl p-8 shadow-2xl">
            <Bot size={64} className="text-orange-600 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-orange-900 mb-4">Agent Crew Studio</h2>
            <p className="text-xl text-orange-800 mb-8">
              Build sophisticated AI agent workflows with our visual pipeline builder
            </p>
            <div className="space-y-4 text-left mb-8">
              <div className="flex items-center space-x-3 text-orange-700">
                <CheckCircle size={20} className="text-orange-500" />
                <span>Visual step-function interface</span>
              </div>
              <div className="flex items-center space-x-3 text-orange-700">
                <CheckCircle size={20} className="text-orange-500" />
                <span>Real-time execution monitoring</span>
              </div>
              <div className="flex items-center space-x-3 text-orange-700">
                <CheckCircle size={20} className="text-orange-500" />
                <span>Advanced agent configuration</span>
              </div>
            </div>
            <motion.button
              onClick={onUpgrade}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-900 font-semibold py-3 px-8 rounded-full transition-all duration-200"
            >
              Upgrade to Developer Pack - €29/month
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-orange-900 mb-2">{workflow.name}</h1>
            <p className="text-orange-700">{workflow.description}</p>
          </div>
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={() => runWorkflow()}
              disabled={isRunning || workflow.steps.length === 0}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "flex items-center space-x-2 px-6 py-3 rounded-full font-semibold transition-all duration-200",
                isRunning || workflow.steps.length === 0
                  ? "bg-white/10 text-enhanced cursor-not-allowed"
                  : "bg-green-500/20 text-green-300 hover:bg-green-500/30"
              )}
            >
              {isRunning ? (
                <Clock size={18} className="animate-spin" />
              ) : (
                <Play size={18} />
              )}
              <span>{isRunning ? 'Running...' : 'Run Workflow'}</span>
            </motion.button>
            
            <motion.button
              onClick={() => setShowConfigPanel(!showConfigPanel)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-3 glass rounded-full hover:bg-white/20 transition-all duration-200"
            >
              <Settings size={18} className="text-enhanced-contrast" />
            </motion.button>
          </div>
        </motion.div>

        <div className="flex gap-6">
          {/* Workflow Canvas */}
          <div className="flex-1">
            <div className="glass-dark rounded-2xl p-6 min-h-[70vh]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-enhanced-contrast">Workflow Pipeline</h3>
                <div className="flex items-center space-x-2">
                  <motion.button
                    onClick={() => addStep('trigger')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 text-blue-100 rounded-full hover:bg-blue-500/30 transition-all duration-200"
                  >
                    <Zap size={16} />
                    <span>Add Trigger</span>
                  </motion.button>
                  <motion.button
                    onClick={() => addStep('agent')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 text-purple-100 rounded-full hover:bg-purple-500/30 transition-all duration-200"
                  >
                    <Bot size={16} />
                    <span>Add Agent</span>
                  </motion.button>
                </div>
              </div>

              {/* Workflow Steps */}
              <div className="space-y-4">
                <AnimatePresence>
                  {workflow.steps.map((step, index) => {
                    const status = getStepStatus(step.id)
                    const StatusIcon = status?.status === 'completed' ? CheckCircle :
                                     status?.status === 'error' ? AlertCircle :
                                     status?.status === 'running' ? Clock : Bot

                    return (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={cn(
                          "relative p-4 rounded-xl border transition-all duration-200 cursor-pointer",
                          selectedStep?.id === step.id 
                            ? "bg-white/10 border-white/30" 
                            : "glass border-white/10 hover:bg-white/5",
                          status?.status === 'running' && "ring-2 ring-blue-400/50",
                          status?.status === 'completed' && "ring-2 ring-green-400/50",
                          status?.status === 'error' && "ring-2 ring-red-400/50"
                        )}
                        onClick={() => setSelectedStep(step)}
                      >
                        {/* Connection Line */}
                        {index > 0 && (
                          <div className="absolute -top-4 left-1/2 w-0.5 h-4 bg-white/20 transform -translate-x-1/2" />
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={cn(
                              "p-2 rounded-full",
                              step.type === 'trigger' ? "bg-blue-500/20" : "bg-purple-500/20"
                            )}>
                              <StatusIcon 
                                size={20} 
                                className={cn(
                                  status?.status === 'running' && "animate-spin",
                                  status?.status === 'completed' && "text-green-400",
                                  status?.status === 'error' && "text-red-400",
                                  !status && "text-white"
                                )}
                              />
                            </div>
                            <div>
                              <h4 className="font-semibold text-enhanced-contrast">{step.data.role}</h4>
                              <p className="text-sm text-enhanced truncate max-w-md">
                                {step.data.goal}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {status && (
                              <span className={cn(
                                "text-xs px-2 py-1 rounded-full",
                                status.status === 'pending' && "bg-gray-500/20 text-gray-300",
                                status.status === 'running' && "bg-blue-500/20 text-blue-300",
                                status.status === 'completed' && "bg-green-500/20 text-green-300",
                                status.status === 'error' && "bg-red-500/20 text-red-300"
                              )}>
                                {status.status}
                              </span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteStep(step.id)
                              }}
                              className="p-1 text-enhanced hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Execution Logs */}
                        {status?.logs && status.logs.length > 0 && (
                          <div className="mt-3 space-y-1">
                            {status.logs.map((log, logIndex) => (
                              <div key={logIndex} className="text-xs text-enhanced font-mono bg-black/20 px-2 py-1 rounded">
                                {log}
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </AnimatePresence>

                {/* Empty State */}
                {workflow.steps.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-16 text-center"
                  >
                    <Bot size={64} className="text-white/20 mb-4" />
                    <h3 className="text-xl font-semibold text-enhanced mb-2">
                      Start building your AI crew
                    </h3>
                    <p className="text-enhanced mb-6 max-w-md">
                      Add triggers and agents to create powerful automated workflows
                    </p>
                    <motion.button
                      onClick={() => addStep('agent')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center space-x-2 px-6 py-3 bg-purple-500/20 text-purple-100 rounded-full hover:bg-purple-500/30 transition-all duration-200"
                    >
                      <Plus size={18} />
                      <span>Add Your First Agent</span>
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Configuration Panel */}
          <AnimatePresence>
            {(showConfigPanel || selectedStep) && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="w-80 glass-dark rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">
                    {selectedStep ? 'Configure Agent' : 'Workflow Settings'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowConfigPanel(false)
                      setSelectedStep(null)
                    }}
                    className="text-white/40 hover:text-white transition-colors"
                  >
                    ×
                  </button>
                </div>

                {selectedStep ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-enhanced mb-2">
                        Role
                      </label>
                      <input
                        type="text"
                        value={selectedStep.data.role || ''}
                        onChange={(e) => updateStep(selectedStep.id, { 
                          data: { role: e.target.value } 
                        })}
                        className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-enhanced-contrast placeholder-white/40 focus:outline-none focus:border-white/30"
                        placeholder="e.g., Content Writer"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-enhanced mb-2">
                        Goal
                      </label>
                      <textarea
                        value={selectedStep.data.goal || ''}
                        onChange={(e) => updateStep(selectedStep.id, { 
                          data: { goal: e.target.value } 
                        })}
                        className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-enhanced-contrast placeholder-white/40 focus:outline-none focus:border-white/30 h-20 resize-none"
                        placeholder="Describe what this agent should accomplish..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Backstory
                      </label>
                      <textarea
                        value={selectedStep.data.backstory || ''}
                        onChange={(e) => updateStep(selectedStep.id, { 
                          data: { backstory: e.target.value } 
                        })}
                        className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/30 h-24 resize-none"
                        placeholder="Provide context about this agent's expertise..."
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Workflow Name
                      </label>
                      <input
                        type="text"
                        value={workflow.name}
                        onChange={(e) => setWorkflow(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/30"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Description
                      </label>
                      <textarea
                        value={workflow.description}
                        onChange={(e) => setWorkflow(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/30 h-20 resize-none"
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}