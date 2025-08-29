'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, User, Bot, LogIn, MessageCircle, Grid3X3, Plus, X, Settings, Search } from 'lucide-react'
import { ChatMessage, ChatMode, ParallelChatInstance } from '@/types'
import { cn } from '@/lib/utils'
import { LogoHero } from '@/components/Logo'

interface ChatInterfaceProps {
  mode: ChatMode
  isAuthenticated: boolean
  messagesLeft: number
  onSendMessage: (message: string) => void
  onLoginClick: () => void
  messages: ChatMessage[]
  isLoading: boolean
  parallelInstances?: ParallelChatInstance[]
  onParallelSend?: (instanceId: string, content: string) => void
  onUpdateInstance?: (instanceId: string, updates: Partial<ParallelChatInstance>) => void
  onAddInstance?: () => void
  onRemoveInstance?: (instanceId: string) => void
  onModeChange?: (mode: ChatMode) => void
  userTier?: string
  onUpgrade?: (feature: string) => void
}

const SUGGESTED_PROMPTS = [
  "Create a marketing strategy for a new SaaS",
  "Write Python code to analyze CSV data",
  "Design a user onboarding flow",
  "Explain blockchain in simple terms",
  "Build a landing page wireframe"
]

export function ChatInterface({ 
  mode, 
  isAuthenticated, 
  messagesLeft, 
  onSendMessage, 
  onLoginClick, 
  messages, 
  isLoading,
  parallelInstances = [],
  onParallelSend,
  onUpdateInstance,
  onAddInstance,
  onRemoveInstance,
  onModeChange,
  userTier = 'curious',
  onUpgrade
}: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    
    onSendMessage(input.trim())
    setInput('')
  }

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt)
    setTimeout(() => onSendMessage(prompt), 100)
  }

  const handleParallelSubmit = (instanceId: string, instanceInput: string) => {
    if (!instanceInput.trim() || !onParallelSend) return
    onParallelSend(instanceId, instanceInput.trim())
  }

  const handleParallelModeClick = () => {
    // Check if parallel mode requires premium
    if (!['essential', 'developer', 'founder', 'pro'].includes(userTier) && onUpgrade) {
      onUpgrade('Parallel Chat Mode')
      return
    }
    onModeChange?.('parallel')
  }

  return (
    <div className="min-h-screen pt-24 pb-8 px-8">
      <div className="max-w-6xl mx-auto">
        {/* Chat Mode Toggle - Bottom Right */}
        {onModeChange && (
          <div className="fixed bottom-6 right-6 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-full p-2 shadow-lg"
            >
              <div className="flex items-center space-x-1">
                <motion.button
                  onClick={() => onModeChange('normal')}
                  className={cn(
                    'p-3 rounded-full transition-all duration-200',
                    mode === 'normal' 
                      ? 'bg-white/30 text-enhanced-contrast shadow-sm' 
                      : 'text-enhanced hover:bg-white/20'
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <MessageCircle size={20} />
                </motion.button>
                
                <motion.button
                  onClick={handleParallelModeClick}
                  className={cn(
                    'p-3 rounded-full transition-all duration-200 relative',
                    mode === 'parallel' 
                      ? 'bg-white/30 text-enhanced-contrast shadow-sm' 
                      : 'text-enhanced hover:bg-white/20'
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Grid3X3 size={20} />
                  {!['essential', 'developer', 'founder', 'pro'].includes(userTier) && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">+</span>
                    </div>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}

        {mode === 'normal' ? (
          // Normal Chat Mode
          <>
            {messages.length === 0 ? (
              // Welcome Screen
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
              >
                <motion.div 
                  className="flex justify-center mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <LogoHero />
                </motion.div>
                <motion.p 
                  className="text-xl text-enhanced mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Your AI Agent Crew Studio
                </motion.p>

                {/* Suggested Prompts */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="max-w-2xl mx-auto mb-12"
                >
                  <h3 className="text-lg font-semibold text-enhanced-contrast mb-6">
                    Try asking:
                  </h3>
                  <div className="grid gap-3">
                    {SUGGESTED_PROMPTS.map((prompt, index) => (
                      <motion.button
                        key={index}
                        onClick={() => handleSuggestedPrompt(prompt)}
                        className="glass rounded-xl p-4 text-left hover:bg-white/10 transition-all text-enhanced-contrast"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                      >
                        <Sparkles className="inline mr-2" size={16} />
                        {prompt}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              // Messages Display
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 max-h-[60vh] overflow-y-auto space-y-4 px-2"
              >
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'flex gap-3 items-start',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full glass flex items-center justify-center flex-shrink-0">
                        <Bot size={16} className="text-enhanced-contrast" />
                      </div>
                    )}
                    
                    <div
                      className={cn(
                        'px-4 py-3 rounded-2xl max-w-[80%] glass',
                        message.role === 'user' 
                          ? 'bg-amber-100/60 text-enhanced-contrast' 
                          : 'bg-white/40 text-enhanced-contrast'
                      )}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <span className="text-xs text-enhanced opacity-60 mt-2 block">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>

                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full glass flex items-center justify-center flex-shrink-0">
                        <User size={16} className="text-enhanced-contrast" />
                      </div>
                    )}
                  </motion.div>
                ))}
                
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 items-start"
                  >
                    <div className="w-8 h-8 rounded-full glass flex items-center justify-center flex-shrink-0">
                      <Bot size={16} className="text-enhanced-contrast" />
                    </div>
                    <div className="glass rounded-2xl px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-enhanced rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-enhanced rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-enhanced rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                        <span className="text-sm text-enhanced">R; is thinking...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </motion.div>
            )}

            {/* Message Counter */}
            {!isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-4"
              >
                <p className="text-enhanced text-sm">
                  {messagesLeft} messages left today. 
                  <button 
                    onClick={onLoginClick}
                    className="ml-2 inline-flex items-center space-x-1 text-enhanced-contrast underline hover:text-amber-700 transition-colors"
                  >
                    <LogIn size={14} />
                    <span>Log in</span>
                  </button>
                  {' '}for more.
                </p>
              </motion.div>
            )}

            {/* Input Form - Fixed positioning with proper animations */}
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              animate={{ 
                position: messages.length > 0 ? 'fixed' : 'static',
                bottom: messages.length > 0 ? '2rem' : 'auto',
                left: messages.length > 0 ? '50%' : 'auto',
                x: messages.length > 0 ? '-50%' : 0,
                zIndex: messages.length > 0 ? 40 : 'auto',
                maxWidth: messages.length > 0 ? '600px' : '1024px',
                width: messages.length > 0 ? 'calc(100vw - 4rem)' : '100%'
              }}
              transition={{ 
                type: "spring", 
                stiffness: 260, 
                damping: 20,
                duration: 0.6
              }}
              className={messages.length === 0 ? "max-w-4xl mx-auto" : ""}
            >
              <motion.form
                onSubmit={handleSubmit}
                className="w-full"
              >
                <div className="glass rounded-2xl p-2 shadow-lg">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask R; anything..."
                      className="flex-1 bg-transparent text-enhanced-contrast placeholder-amber-600 border-none outline-none text-lg"
                      disabled={isLoading || (!isAuthenticated && messagesLeft <= 0)}
                    />
                    <motion.button
                      type="submit"
                      disabled={!input.trim() || isLoading || (!isAuthenticated && messagesLeft <= 0)}
                      className={cn(
                        "p-3 rounded-xl transition-all",
                        input.trim() && !isLoading && (isAuthenticated || messagesLeft > 0)
                          ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700 shadow-lg"
                          : "bg-white/10 text-enhanced cursor-not-allowed"
                      )}
                      whileHover={input.trim() && !isLoading ? { scale: 1.05 } : undefined}
                      whileTap={input.trim() && !isLoading ? { scale: 0.95 } : undefined}
                    >
                      <Send size={20} />
                    </motion.button>
                  </div>
                </div>
              </motion.form>
            </motion.div>
          </>
        ) : (
          // Parallel Chat Mode
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-enhanced-contrast mb-2">Parallel Research Mode</h2>
              <p className="text-enhanced">Compare different approaches and get comprehensive insights</p>
            </div>

            {/* Add Instance Button */}
            {onAddInstance && parallelInstances.length < 4 && (
              <div className="text-center mb-6">
                <motion.button
                  onClick={onAddInstance}
                  className="glass rounded-xl px-6 py-3 text-enhanced-contrast hover:bg-white/10 transition-all flex items-center gap-2 mx-auto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus size={20} />
                  Add Chat Instance
                </motion.button>
              </div>
            )}

            {/* Parallel Chat Instances */}
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
              {parallelInstances.map((instance, index) => (
                <motion.div
                  key={instance.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass rounded-2xl p-4 space-y-4"
                >
                  {/* Instance Header */}
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={instance.title}
                      onChange={(e) => onUpdateInstance?.(instance.id, { title: e.target.value })}
                      className="font-semibold text-enhanced-contrast bg-transparent border-none outline-none"
                    />
                    <div className="flex items-center gap-2">
                      <motion.button
                        onClick={() => onUpdateInstance?.(instance.id, { deepResearch: !instance.deepResearch })}
                        className={cn(
                          'p-2 rounded-lg transition-all flex items-center gap-1 text-xs',
                          instance.deepResearch
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-white/10 text-enhanced hover:bg-white/20'
                        )}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Search size={14} />
                        Deep Research
                      </motion.button>
                      {parallelInstances.length > 1 && onRemoveInstance && (
                        <motion.button
                          onClick={() => onRemoveInstance(instance.id)}
                          className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <X size={14} />
                        </motion.button>
                      )}
                    </div>
                  </div>

                  {/* Custom Prompt */}
                  <div>
                    <textarea
                      value={instance.prompt}
                      onChange={(e) => onUpdateInstance?.(instance.id, { prompt: e.target.value })}
                      placeholder="Custom prompt for this chat instance..."
                      className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-enhanced-contrast placeholder-white/40 focus:outline-none focus:border-white/30 resize-none h-20"
                    />
                  </div>

                  {/* Messages */}
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {instance.messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          'p-3 rounded-lg text-sm',
                          message.role === 'user' 
                            ? 'bg-amber-500/20 text-amber-100 ml-4' 
                            : 'bg-white/10 text-enhanced-contrast mr-4'
                        )}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    ))}
                    
                    {instance.isLoading && (
                      <div className="bg-white/10 p-3 rounded-lg mr-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-enhanced rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-enhanced rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-enhanced rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                          <span className="text-xs text-enhanced">Processing...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Send Button */}
                  <motion.button
                    onClick={() => {
                      if (instance.prompt.trim()) {
                        handleParallelSubmit(instance.id, instance.prompt)
                      }
                    }}
                    disabled={!instance.prompt.trim() || instance.isLoading}
                    className={cn(
                      'w-full py-3 rounded-lg font-semibold transition-all',
                      instance.prompt.trim() && !instance.isLoading
                        ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700'
                        : 'bg-white/10 text-enhanced cursor-not-allowed'
                    )}
                    whileHover={instance.prompt.trim() && !instance.isLoading ? { scale: 1.02 } : undefined}
                    whileTap={instance.prompt.trim() && !instance.isLoading ? { scale: 0.98 } : undefined}
                  >
                    {instance.isLoading ? 'Processing...' : 'Send Query'}
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}