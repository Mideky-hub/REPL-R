'use client'

import React, { useState } from 'react'
import { MainNavigation } from '@/components/MainNavigation'
import { ChatInterface } from '@/components/ChatInterface'
import { AuthButton } from '@/components/AuthButton'
import { AgentCrewStudio } from '@/components/AgentCrewStudio'
import { PromptStudio } from '@/components/PromptStudio'
import { WhitelistPage } from '@/components/WhitelistPage'
import { NavigationMode, ChatMessage, ChatMode, ParallelChatInstance } from '@/types'
import { generateId } from '@/lib/utils'

export default function Home() {
  // App state
  const [navigationMode, setNavigationMode] = useState<NavigationMode>('chat')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userTier, setUserTier] = useState('curious')
  const [messagesLeft, setMessagesLeft] = useState(15)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  // Chat mode state
  const [chatMode, setChatMode] = useState<ChatMode>('normal')
  const [parallelInstances, setParallelInstances] = useState<ParallelChatInstance[]>([
    {
      id: generateId(),
      title: 'Chat 1',
      messages: [],
      prompt: '',
      deepResearch: false,
      isLoading: false
    },
    {
      id: generateId(),
      title: 'Chat 2',
      messages: [],
      prompt: '',
      deepResearch: false,
      isLoading: false
    }
  ])

  // Mock authentication handlers
  const handleLogin = () => {
    setIsAuthenticated(true)
    setUserTier('developer') // Pro access for demo
    setMessagesLeft(500) // Developer tier gets more messages
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUserTier('curious')
    setMessagesLeft(15)
  }

  // Mock message sending
  const handleSendMessage = async (content: string) => {
    if (!isAuthenticated && messagesLeft <= 0) {
      return // Prevent sending if no messages left
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: `I understand you'd like me to help with: "${content}". This is a demo response showing how R; will work when fully launched. The AI will provide detailed, contextual responses based on your prompts.`,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, aiResponse])
      setIsLoading(false)
      
      if (!isAuthenticated) {
        setMessagesLeft(prev => Math.max(0, prev - 1))
      }
    }, 1500)
  }

  // Parallel chat handlers
  const handleParallelSend = async (instanceId: string, content: string) => {
    const instance = parallelInstances.find(i => i.id === instanceId)
    if (!instance) return

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date()
    }

    // Update instance with new message and loading state
    setParallelInstances(prev => prev.map(inst => 
      inst.id === instanceId 
        ? { ...inst, messages: [...inst.messages, userMessage], isLoading: true }
        : inst
    ))

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: instance.deepResearch 
          ? `Deep Research Response for "${content}": This would include comprehensive analysis, multiple sources, and detailed insights. The deep research mode provides more thorough responses with citations and expanded context.`
          : `Standard response for "${content}": This is a focused answer to your specific question using R;'s AI capabilities.`,
        timestamp: new Date()
      }

      setParallelInstances(prev => prev.map(inst => 
        inst.id === instanceId 
          ? { ...inst, messages: [...inst.messages, aiResponse], isLoading: false }
          : inst
      ))

      if (!isAuthenticated) {
        setMessagesLeft(prev => Math.max(0, prev - 1))
      }
    }, 2000)
  }

  const updateParallelInstance = (instanceId: string, updates: Partial<ParallelChatInstance>) => {
    setParallelInstances(prev => prev.map(inst => 
      inst.id === instanceId ? { ...inst, ...updates } : inst
    ))
  }

  const addParallelInstance = () => {
    if (parallelInstances.length < 4) { // Limit to 4 parallel chats
      const newInstance: ParallelChatInstance = {
        id: generateId(),
        title: `Chat ${parallelInstances.length + 1}`,
        messages: [],
        prompt: '',
        deepResearch: false,
        isLoading: false
      }
      setParallelInstances(prev => [...prev, newInstance])
    }
  }

  const removeParallelInstance = (instanceId: string) => {
    if (parallelInstances.length > 1) { // Keep at least one instance
      setParallelInstances(prev => prev.filter(inst => inst.id !== instanceId))
    }
  }

  // Render different views based on navigation mode
  const renderMainContent = () => {
    switch (navigationMode) {
      case 'whitelist':
        return (
          <WhitelistPage 
            onClose={() => setNavigationMode('chat')}
          />
        )
        
      case 'chat':
        return (
          <ChatInterface
            mode={chatMode}
            isAuthenticated={isAuthenticated}
            messagesLeft={messagesLeft}
            onSendMessage={handleSendMessage}
            onLoginClick={handleLogin}
            messages={messages}
            isLoading={isLoading}
            // Parallel chat props
            parallelInstances={parallelInstances}
            onParallelSend={handleParallelSend}
            onUpdateInstance={updateParallelInstance}
            onAddInstance={addParallelInstance}
            onRemoveInstance={removeParallelInstance}
            onModeChange={setChatMode}
          />
        )
            isLoading={isLoading}
          />
        )
      
      case 'prompt-studio':
        return (
          <PromptStudio
            isAuthenticated={isAuthenticated}
            userTier={userTier}
            onUpgrade={() => {
              // In the real app, this would show auth modal for free users
              if (!isAuthenticated) {
                handleLogin()
              }
            }}
          />
        )
      
      case 'agent-crew-studio':
        return (
          <AgentCrewStudio
            isAuthenticated={isAuthenticated}
            userTier={userTier}
            onUpgrade={() => {
              // In the real app, this would show pricing modal
              alert('Upgrade to Developer Pack - €29/month')
            }}
          />
        )
      
      default:
        return null
    }
  }

  return (
    <div className="relative min-h-screen">
      {/* Background gradient is applied via CSS */}
      
      {/* Navigation blur overlay */}
      <div className="nav-blur-overlay" />
      
      {/* Main Navigation */}
      <MainNavigation
        currentMode={navigationMode}
        onModeChange={setNavigationMode}
        isAuthenticated={isAuthenticated}
        userTier={userTier}
      />

      {/* Auth Button */}
      <AuthButton
        isAuthenticated={isAuthenticated}
        userEmail={isAuthenticated ? 'demo@repl-ay.com' : undefined}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      {renderMainContent()}
    </div>
  )
}