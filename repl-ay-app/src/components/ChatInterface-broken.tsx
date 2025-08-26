'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, User, Bot, LogIn, MessageCircle, Grid3X3, Plus, X, Settings } from 'lucide-react'
import { ChatMessage, ChatMode, ParallelChatInstance } from '@/types'
import { cn } from '@/lib/utils'

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
  onModeChange
}: ChatInterfaceProps) {
  onLoginClick,
  messages,
  isLoading 
}: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [isParallelMode, setIsParallelMode] = useState(false)
  const [parallelMessages, setParallelMessages] = useState<{[key: string]: ChatMessage[]}>({
    chat1: [],
    chat2: [],
    chat3: []
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    
    if (isParallelMode && isAuthenticated) {
      // Send to all 3 parallel chats
      const userMessage = {
        id: Date.now().toString() + Math.random(),
        role: 'user' as const,
        content: input.trim(),
        timestamp: new Date()
      }
      
      Object.keys(parallelMessages).forEach((chatId, responseIndex) => {
        setParallelMessages(prev => ({
          ...prev,
          [chatId]: [...prev[chatId], userMessage]
        }))
        
        // Simulate different AI responses
        setTimeout(() => {
          const responses = [
            "I'll help you with a comprehensive approach to this challenge...",
            "Here's an alternative perspective on this topic...",
            "Let me break this down into actionable steps..."
          ]
          
          setParallelMessages(prev => ({
            ...prev,
            [chatId]: [...prev[chatId], {
              id: Date.now().toString() + Math.random() + chatId,
              role: 'assistant' as const,
              content: responses[responseIndex] + "\n\n" + 
                      "This is a simulated response from AI Model " + (responseIndex + 1) + 
                      ". Each model provides different insights and approaches to your question.",
              timestamp: new Date()
            }]
          }))
        }, 1000 + responseIndex * 500)
      })
    } else {
      onSendMessage(input.trim())
    }
    
    setInput('')
    setShowSuggestions(false)
  }

  const handleSuggestionClick = (prompt: string) => {
    setInput(prompt)
    setShowSuggestions(false)
    setTimeout(() => onSendMessage(prompt), 100)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-20">
      {/* Parallel Chat Mode Toggle */}
      {isAuthenticated && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center space-x-4"
        >
          <span className="text-enhanced text-sm">Chat Mode:</span>
          <div className="flex items-center space-x-2 glass rounded-full p-1">
            <motion.button
              onClick={() => setIsParallelMode(false)}
              className={cn(
                "px-4 py-2 rounded-full transition-all duration-200 flex items-center space-x-2 text-sm",
                !isParallelMode 
                  ? "bg-white/30 text-enhanced-contrast shadow-sm" 
                  : "text-enhanced hover:text-enhanced-contrast"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <MessageCircle size={16} />
              <span>Single Chat</span>
            </motion.button>
            <motion.button
              onClick={() => setIsParallelMode(true)}
              className={cn(
                "px-4 py-2 rounded-full transition-all duration-200 flex items-center space-x-2 text-sm",
                isParallelMode 
                  ? "bg-white/30 text-enhanced-contrast shadow-sm" 
                  : "text-enhanced hover:text-enhanced-contrast"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Grid3X3 size={16} />
              <span>Parallel Chat</span>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Main Chat Container */}
      <div className={cn(
        "w-full mx-auto",
        isParallelMode ? "max-w-7xl" : "max-w-4xl"
      )}>
        
        {/* Messages Area */}
        {isParallelMode && isAuthenticated ? (
          // Parallel Chat Layout
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {Object.keys(parallelMessages).map((chatId, index) => (
              <motion.div
                key={chatId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-dark rounded-2xl p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-enhanced-contrast font-semibold">
                    AI Model {index + 1}
                  </h3>
                  <div className="text-xs text-enhanced bg-white/10 px-2 py-1 rounded">
                    {['GPT-4', 'Claude', 'Gemini'][index]}
                  </div>
                </div>
                
                <div className="max-h-[50vh] overflow-y-auto space-y-3">
                  {parallelMessages[chatId].length === 0 ? (
                    <div className="text-center py-8">
                      <Bot size={32} className="mx-auto mb-2 text-white/30" />
                      <p className="text-enhanced text-sm">Ready for your question</p>
                    </div>
                  ) : (
                    parallelMessages[chatId].map((message) => (
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
                          <Bot size={24} className="text-green-400 flex-shrink-0 mt-1" />
                        )}
                        <div
                          className={cn(
                            'px-3 py-2 rounded-lg max-w-[85%] text-sm',
                            message.role === 'user' 
                              ? 'bg-amber-500/20 text-enhanced-contrast ml-auto' 
                              : 'bg-white/10 text-enhanced'
                          )}
                        >
                          {message.content}
                        </div>
                        {message.role === 'user' && (
                          <User size={24} className="text-blue-400 flex-shrink-0 mt-1" />
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          // Single Chat Layout
          messages.length > 0 && (
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
                  <div className="glass-dark p-2 rounded-full">
                    <Bot size={16} className="text-orange-800" />
                  </div>
                )}
                
                <div className={cn(
                  'max-w-[80%] p-4 rounded-2xl',
                  message.role === 'user' 
                    ? 'bg-orange-500/20 text-orange-900 ml-auto' 
                    : 'glass-dark text-orange-900'
                )}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>

                {message.role === 'user' && (
                  <div className="glass p-2 rounded-full">
                    <User size={16} className="text-orange-800" />
                  </div>
                )}
              </motion.div>
            ))}
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3 items-start justify-start"
              >
                <div className="glass-dark p-2 rounded-full">
                  <Bot size={16} className="text-orange-800" />
                </div>
                <div className="glass-dark p-4 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </motion.div>
          )
        )}

        {/* Hero Section - Only show when no messages */}
        {(!isParallelMode ? messages.length === 0 : Object.values(parallelMessages).every(msgs => msgs.length === 0)) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <motion.h1 
              className="text-6xl font-bold text-enhanced-contrast mb-4 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              R;
            </motion.h1>
            <motion.p 
              className="text-xl text-enhanced mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Build, deploy, and manage production-grade AI agent crews
            </motion.p>
          </motion.div>
        )}

        {/* Chat Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: messages.length === 0 ? 0.3 : 0 }}
          className="relative max-w-2xl mx-auto"
        >
          <form onSubmit={handleSubmit} className="relative">
            <div className="glass rounded-full p-1 shadow-2xl">
              <div className="flex items-center space-x-3 px-6 py-4">
                <Sparkles size={20} className="text-amber-700 flex-shrink-0" />
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={messages.length === 0 ? "Build a marketing plan..." : "Continue the conversation..."}
                  className="flex-1 bg-transparent text-enhanced-contrast placeholder-amber-600 border-none outline-none text-lg"
                  disabled={isLoading}
                />
                <motion.button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'p-3 rounded-full transition-all duration-200',
                    input.trim() && !isLoading
                      ? 'bg-amber-600/20 text-amber-800 hover:bg-amber-600/30'
                      : 'bg-amber-300/20 text-amber-500 cursor-not-allowed'
                  )}
                >
                  <Send size={18} />
                </motion.button>
              </div>
            </div>
          </form>

          {/* Usage indicator for non-authenticated users */}
          {!isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center mt-4"
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
        </motion.div>

        {/* Suggested Prompts - Only show when no messages and suggestions are active */}
        <AnimatePresence>
          {(!isParallelMode ? messages.length === 0 : Object.values(parallelMessages).every(msgs => msgs.length === 0)) && showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.5 }}
              className="mt-8 max-w-4xl mx-auto"
            >
              <p className="text-orange-600 text-center mb-4 text-sm">Try these prompts:</p>
              <div className="flex flex-wrap justify-center gap-3">
                {SUGGESTED_PROMPTS.map((prompt, index) => (
                  <motion.button
                    key={prompt}
                    onClick={() => handleSuggestionClick(prompt)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="glass-dark px-4 py-2 rounded-full text-sm text-orange-800 hover:text-orange-900 hover:bg-orange-400/20 transition-all duration-200"
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mode Switcher for authenticated users */}
        {isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 right-6"
          >
            <div className="glass rounded-full p-1">
              <div className="flex items-center space-x-1">
                <button
                  className={cn(
                    'px-4 py-2 rounded-full text-sm transition-all duration-200',
                    mode === 'normal' 
                      ? 'bg-white/20 text-white' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  )}
                >
                  Normal
                </button>
                <button
                  className={cn(
                    'px-4 py-2 rounded-full text-sm transition-all duration-200',
                    mode === 'parallel' 
                      ? 'bg-white/20 text-white' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  )}
                >
                  Parallel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}