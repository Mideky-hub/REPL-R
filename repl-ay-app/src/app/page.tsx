'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { LogIn } from 'lucide-react'
import { MainNavigation } from '@/components/MainNavigation'
import { ChatInterface } from '@/components/ChatInterface'
import { AgentCrewStudio } from '@/components/AgentCrewStudio'
import { PromptStudio } from '@/components/PromptStudio'
import { WhitelistPage } from '@/components/WhitelistPage'
import { LazyModal } from '@/components/LazyModal'
import UserProfileDropdown from '@/components/UserProfileDropdown'
import { NavigationMode, ChatMessage, ChatMode, ParallelChatInstance, UserTier } from '@/types'
import { generateId } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

// Lazy load the heavy modals
import dynamic from 'next/dynamic'

const AuthManager = dynamic(() => import('@/components/AuthManager'), {
  ssr: false,
  loading: () => null
})

const PricingModal = dynamic(() => import('@/components/PricingModal'), {
  ssr: false,
  loading: () => null
})

export default function Home() {
  const { user, isLoading, logout } = useAuth()
  const isAuthenticated = !!user
  
  // App state
  const [navigationMode, setNavigationMode] = useState<NavigationMode>('chat')
  const [messagesLeft, setMessagesLeft] = useState(15)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isMessageLoading, setIsMessageLoading] = useState(false)
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [blockedFeature, setBlockedFeature] = useState<string>('')
  const [showAuthModal, setShowAuthModal] = useState(false)
  
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

  // Get user tier from auth context, default to 'curious' for non-authenticated users
  const userTier = user?.tier || 'curious'

  const handleLogin = useCallback(() => {
    setShowAuthModal(true)
  }, [])

  const handleUpgrade = useCallback((feature: string) => {
    setBlockedFeature(feature)
    setShowPricingModal(true)
  }, [])

  const handleSelectTier = useCallback((tier: UserTier) => {
    // In a real app, this would trigger the upgrade process
    // For now, just close the modal
    setShowPricingModal(false)
    
    // The actual tier change would happen after payment processing
    console.log(`Selected tier: ${tier}`)
  }, [])

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
    setIsMessageLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: `I understand you'd like me to help with: "${content}". This is a demo response showing how R; will work when fully launched. The AI will provide detailed, contextual responses based on your prompts.`,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, aiResponse])
      setIsMessageLoading(false)
      
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

  // Navigation with premium feature detection
  const handleNavigationChange = (mode: NavigationMode) => {
    // Check if feature requires premium access
    const premiumFeatures = {
      'agent-crew-studio': 'Agent Crew Studio',
      'prompt-studio': 'Advanced Prompt Studio'
    }

    // Agent Crew Studio requires Developer tier or higher
    if (mode === 'agent-crew-studio' && !['developer', 'founder'].includes(userTier)) {
      handleUpgrade(premiumFeatures[mode])
      return
    }

    // Prompt Studio requires at least Free tier (not curious)
    if (mode === 'prompt-studio' && userTier === 'curious') {
      handleUpgrade(premiumFeatures[mode])
      return
    }

    setNavigationMode(mode)
  }

  // Render different views based on navigation mode (memoized for performance)
  const renderMainContent = useMemo(() => {
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
            isLoading={isMessageLoading}
            parallelInstances={parallelInstances}
            onParallelSend={handleParallelSend}
            onUpdateInstance={updateParallelInstance}
            onAddInstance={addParallelInstance}
            onRemoveInstance={removeParallelInstance}
            onModeChange={setChatMode}
            userTier={userTier}
            onUpgrade={handleUpgrade}
          />
        )
      
      case 'prompt-studio':
        return (
          <PromptStudio
            isAuthenticated={isAuthenticated}
            userTier={userTier}
            onUpgrade={() => handleUpgrade('Advanced Prompt Studio')}
          />
        )
      
      case 'agent-crew-studio':
        return (
          <AgentCrewStudio
            isAuthenticated={isAuthenticated}
            userTier={userTier}
            onUpgrade={() => handleUpgrade('Agent Crew Studio')}
          />
        )
      
      default:
        return null
    }
  }, [
    navigationMode,
    chatMode,
    isAuthenticated,
    messagesLeft,
    handleSendMessage,
    handleLogin,
    messages,
    isMessageLoading,
    parallelInstances,
    handleParallelSend,
    updateParallelInstance,
    addParallelInstance,
    removeParallelInstance,
    userTier,
    handleUpgrade
  ])

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* Enhanced gradient background overlay for extra richness */}
      <div className="fixed inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent pointer-events-none z-0"></div>
      
      {/* Navigation blur overlay */}
      <div className="nav-blur-overlay" />
      
      {/* Main Navigation */}
      <MainNavigation
        currentMode={navigationMode}
        onModeChange={handleNavigationChange}
        isAuthenticated={isAuthenticated}
        userTier={userTier}
      />

      {/* Auth Button / User Profile */}
      {isAuthenticated ? (
        <div className="fixed top-6 right-6 z-50">
          <UserProfileDropdown />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-6 right-6 z-50"
        >
          <motion.button
            onClick={handleLogin}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="glass rounded-full px-8 py-3 transition-all duration-200 flex items-center space-x-2 text-enhanced hover:text-enhanced-contrast hover:bg-white/20 shadow-lg"
          >
            <LogIn size={20} className="text-enhanced" />
            <span className="font-semibold tracking-wide">Sign Up / Log In</span>
          </motion.button>
        </motion.div>
      )}

      {/* Auth Manager - handles authentication modals */}
      {showAuthModal && (
        <AuthManager 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthComplete={() => setShowAuthModal(false)}
        />
      )}

      {/* Main Content */}
      {renderMainContent}

      {/* Pricing Modal */}
      {showPricingModal && (
        <PricingModal
          isOpen={showPricingModal}
          onClose={() => setShowPricingModal(false)}
          onSelectTier={handleSelectTier}
          currentTier={userTier}
          blockedFeature={blockedFeature}
        />
      )}
    </div>
  )
}