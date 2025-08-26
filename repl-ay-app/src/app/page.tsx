'use client'

import React, { useState } from 'react'
import { MainNavigation } from '@/components/MainNavigation'
import { ChatInterface } from '@/components/ChatInterface'
import { AuthButton } from '@/components/AuthButton'
import { AgentCrewStudio } from '@/components/AgentCrewStudio'
import { PromptStudio } from '@/components/PromptStudio'
import { NavigationMode, ChatMessage } from '@/types'
import { generateId } from '@/lib/utils'

export default function Home() {
  // App state
  const [navigationMode, setNavigationMode] = useState<NavigationMode>('chat')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userTier, setUserTier] = useState('curious')
  const [messagesLeft, setMessagesLeft] = useState(15)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)

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

    // Decrease message count for non-authenticated users
    if (!isAuthenticated) {
      setMessagesLeft(prev => Math.max(0, prev - 1))
    }

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: `I understand you want to "${content}". This is a demo response showing the chat functionality. In the full version, this would connect to actual AI models and provide real responses. The interface you're seeing demonstrates the core experience that users will have when interacting with AI agents in production.`,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 2000)
  }

  // Render different views based on navigation mode
  const renderMainContent = () => {
    switch (navigationMode) {
      case 'chat':
        return (
          <ChatInterface
            mode={'normal'}
            isAuthenticated={isAuthenticated}
            messagesLeft={messagesLeft}
            onSendMessage={handleSendMessage}
            onLoginClick={handleLogin}
            messages={messages}
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