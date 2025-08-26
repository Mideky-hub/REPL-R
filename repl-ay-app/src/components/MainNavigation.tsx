'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Zap, Bot } from 'lucide-react'
import { NavigationMode } from '@/types'
import { cn } from '@/lib/utils'

interface MainNavigationProps {
  currentMode: NavigationMode
  onModeChange: (mode: NavigationMode) => void
  isAuthenticated: boolean
  userTier: string
}

export function MainNavigation({ 
  currentMode, 
  onModeChange, 
  isAuthenticated,
  userTier 
}: MainNavigationProps) {
  const [hoveredMode, setHoveredMode] = useState<NavigationMode | null>(null)

  const navigationItems = [
    {
      id: 'prompt-studio' as NavigationMode,
      label: 'Prompt Studio',
      icon: Zap,
      description: 'Analyze & perfect your prompts',
      requiresAuth: true
    },
    {
      id: 'chat' as NavigationMode,
      label: 'Chat',
      icon: MessageCircle,
      description: 'AI conversations',
      requiresAuth: false
    },
    {
      id: 'agent-crew-studio' as NavigationMode,
      label: 'Agent Crew Studio',
      icon: Bot,
      description: 'Build AI workflows',
      requiresAuth: true,
      requiresPaid: true
    }
  ]

  const handleModeClick = (mode: NavigationMode, requiresAuth: boolean, requiresPaid?: boolean) => {
    if (requiresPaid && !['developer', 'founder', 'pro'].includes(userTier)) {
      // Show pricing modal/page
      return
    }
    
    if (requiresAuth && !isAuthenticated) {
      // Show auth modal
      return
    }
    
    onModeChange(mode)
  }

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="glass rounded-full p-1 shadow-lg">
        <div className="flex items-center space-x-1">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = currentMode === item.id
            const isDisabled = (item.requiresAuth && !isAuthenticated) || 
                              (item.requiresPaid && !['developer', 'founder', 'pro'].includes(userTier))
            
            return (
              <motion.button
                key={item.id}
                onClick={() => handleModeClick(item.id, item.requiresAuth, item.requiresPaid)}
                onHoverStart={() => setHoveredMode(item.id)}
                onHoverEnd={() => setHoveredMode(null)}
                className={cn(
                  'relative px-4 py-2 rounded-full transition-all duration-200 flex items-center space-x-2',
                  isActive 
                    ? 'bg-white/25 text-enhanced-contrast shadow-lg' 
                    : 'text-enhanced hover:text-enhanced-contrast hover:bg-white/15',
                  isDisabled && 'opacity-60 cursor-not-allowed'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-orange-500/20 rounded-full"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30
                    }}
                  />
                )}
                <Icon size={18} className="relative z-10" />
                <span className="relative z-10 font-medium text-sm">
                  {item.label}
                </span>
                {isDisabled && (
                  <div className="relative z-10 text-xs bg-orange-500/20 text-orange-800 px-1.5 py-0.5 rounded-full">
                    {item.requiresPaid ? 'Pro' : 'Login'}
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>
      
      {/* Hover tooltip */}
      {hoveredMode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-orange-900/80 text-cream-100 text-xs rounded-lg whitespace-nowrap"
        >
          {navigationItems.find(item => item.id === hoveredMode)?.description}
        </motion.div>
      )}
    </div>
  )
}