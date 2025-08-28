'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDown, 
  Settings, 
  Zap, 
  Brain, 
  Code, 
  Sparkles, 
  Scale,
  Check,
  AlertCircle,
  ExternalLink,
  Loader2,
  Star,
  Wifi,
  WifiOff,
  Clock,
  DollarSign,
  Activity,
  Info,
  Search,
  Filter,
  X,
  Cpu,
  Globe,
  Home
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AIModel, ModelProvider, AI_MODELS, MODEL_PROVIDERS, getModelsByProvider, getAvailableModels, isModelAvailable } from '@/lib/aiModels'

interface ModelSelectorProps {
  selectedModel: string
  onModelChange: (modelId: string) => void
  isLoading?: boolean
  showProviderInfo?: boolean
}

const CATEGORY_ICONS = {
  fast: Zap,
  balanced: Scale,
  creative: Sparkles,
  coding: Code,
  reasoning: Brain
}

const CATEGORY_COLORS = {
  fast: 'text-green-400 bg-green-500/20 border-green-500/30',
  balanced: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
  creative: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
  coding: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
  reasoning: 'text-pink-400 bg-pink-500/20 border-pink-500/30'
}

const PROVIDER_COLORS = {
  openai: 'text-green-400 bg-green-500/10 border-green-500/20',
  anthropic: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  google: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  meta: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  deepseek: 'text-red-400 bg-red-500/10 border-red-500/20',
  xai: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  qwen: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  mistral: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  groq: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
  ollama: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
}

export function ModelSelector({ 
  selectedModel, 
  onModelChange, 
  isLoading = false,
  showProviderInfo = true 
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [availableModels, setAvailableModels] = useState<AIModel[]>([])
  const [selectedProvider, setSelectedProvider] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [modelStatus, setModelStatus] = useState<Record<string, 'checking' | 'available' | 'unavailable'>>({})
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({})
  const [sortBy, setSortBy] = useState<'name' | 'cost' | 'speed' | 'popularity'>('popularity')

  const selectedModelData = AI_MODELS.find(m => m.id === selectedModel)
  
  // Filter and sort models
  const filteredModels = availableModels
    .filter(model => {
      // Provider filter
      if (selectedProvider !== 'all' && model.provider !== selectedProvider) return false
      
      // Category filter  
      if (selectedCategory !== 'all' && model.category !== selectedCategory) return false
      
      // Search filter
      if (searchQuery && !model.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !model.provider.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !model.description.toLowerCase().includes(searchQuery.toLowerCase())) return false
      
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'cost':
          return a.costPer1kTokens - b.costPer1kTokens
        case 'speed':
          // Fast models first, then balanced, etc.
          const speedOrder = { fast: 0, balanced: 1, coding: 2, reasoning: 3, creative: 4 }
          return speedOrder[a.category] - speedOrder[b.category]
        case 'popularity':
        default:
          // Custom popularity order based on common usage
          const popularityOrder = ['gpt-4o', 'gpt-4o-mini', 'claude-3-5-sonnet-20241022', 'gpt-4-turbo', 'gemini-1.5-pro']
          const aIndex = popularityOrder.indexOf(a.id)
          const bIndex = popularityOrder.indexOf(b.id)
          if (aIndex === -1 && bIndex === -1) return a.name.localeCompare(b.name)
          if (aIndex === -1) return 1
          if (bIndex === -1) return -1
          return aIndex - bIndex
      }
    })

  useEffect(() => {
    const available = getAvailableModels()
    setAvailableModels(available)
  }, [])

  const checkModelAvailability = async (modelId: string) => {
    setModelStatus(prev => ({ ...prev, [modelId]: 'checking' }))
    
    try {
      const response = await fetch('/api/models/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId })
      })
      
      const result = await response.json()
      setModelStatus(prev => ({ 
        ...prev, 
        [modelId]: result.available ? 'available' : 'unavailable' 
      }))
    } catch (error) {
      console.error(`Failed to check availability for ${modelId}:`, error)
      setModelStatus(prev => ({ ...prev, [modelId]: 'unavailable' }))
    }
  }

  const handleModelSelect = (modelId: string) => {
    onModelChange(modelId)
    setIsOpen(false)
  }

  const toggleDetails = (modelId: string) => {
    setShowDetails(prev => ({ ...prev, [modelId]: !prev[modelId] }))
  }

  const getProviderModels = (providerId: string) => {
    return availableModels.filter(model => model.provider === providerId)
  }

  const getSpeedIndicator = (model: AIModel) => {
    const indicators = {
      fast: { text: 'Lightning Fast', color: 'text-green-400', bars: 3 },
      balanced: { text: 'Balanced', color: 'text-blue-400', bars: 2 },
      coding: { text: 'Optimized', color: 'text-orange-400', bars: 2 },
      reasoning: { text: 'Thoughtful', color: 'text-pink-400', bars: 1 },
      creative: { text: 'Creative', color: 'text-purple-400', bars: 2 }
    }
    return indicators[model.category] || indicators.balanced
  }

  const renderModelCard = (model: AIModel) => {
    const CategoryIcon = CATEGORY_ICONS[model.category]
    const status = modelStatus[model.id]
    const speedInfo = getSpeedIndicator(model)
    const isSelected = selectedModel === model.id
    const detailsVisible = showDetails[model.id]
    const isAvailable = isModelAvailable(model)
    const needsApiKey = model.requiresApiKey && !isAvailable
    
    return (
      <motion.div
        key={model.id}
        layout
        className={cn(
          'rounded-2xl border transition-all group relative overflow-hidden bg-white shadow-md',
          'hover:shadow-lg hover:shadow-amber-500/20',
          isSelected 
            ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 shadow-lg shadow-amber-500/20' 
            : needsApiKey
            ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200 opacity-90'
            : 'border-gray-200 hover:border-gray-300'
        )}
        whileHover={{ scale: needsApiKey ? 1.0 : 1.005 }}
        transition={{ type: 'tween', duration: 0.15 }}
      >
        {/* Main Model Info */}
        <div className="p-4">
          {/* Header with Icon and Status */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <span className={cn("text-2xl", needsApiKey && "grayscale opacity-50")}>{model.icon}</span>
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full flex items-center justify-center">
                    <Check size={8} className="text-white" />
                  </div>
                )}
                {needsApiKey && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                    <AlertCircle size={8} className="text-white" />
                  </div>
                )}
              </div>
              <div>
                <h3 className={cn("font-bold text-base flex items-center gap-2", 
                  needsApiKey ? "text-red-600" : "text-gray-800")}>
                  {model.name}
                  {model.id.includes('gpt-5') || model.id.includes('claude-opus-4') ? (
                    <Star size={12} className="text-amber-500" />
                  ) : null}
                  {needsApiKey && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                      API Key Required
                    </span>
                  )}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={cn(
                    'text-xs font-medium px-2 py-0.5 rounded-full border',
                    PROVIDER_COLORS[model.provider as keyof typeof PROVIDER_COLORS] || 'text-enhanced bg-white/10 border-white/20'
                  )}>
                    {model.provider.charAt(0).toUpperCase() + model.provider.slice(1)}
                  </span>
                  {model.isLocal && (
                    <div className="flex items-center space-x-1 text-green-400 text-xs">
                      <Home size={10} />
                      <span>Local</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Status Indicator */}
              <div className="flex items-center space-x-1">
                {needsApiKey && (
                  <AlertCircle size={14} className="text-red-400" />
                )}
                {status === 'checking' && (
                  <Loader2 size={14} className="text-enhanced animate-spin" />
                )}
                {status === 'unavailable' && (
                  <WifiOff size={14} className="text-red-400" />
                )}
                {status === 'available' && (
                  <Wifi size={14} className="text-green-400" />
                )}
                {!status && !needsApiKey && model.isLocal && (
                  <Home size={14} className="text-blue-400" />
                )}
              </div>
              
              {/* Details Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleDetails(model.id)
                }}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Info size={14} className="text-enhanced opacity-60" />
              </button>
            </div>
          </div>

          {/* Category and Speed */}
          <div className="flex items-center justify-between mb-3">
            <div className={cn(
              'flex items-center space-x-2 px-2 py-1 rounded-lg text-xs font-medium border',
              CATEGORY_COLORS[model.category]
            )}>
              <CategoryIcon size={12} />
              <span>{model.category.charAt(0).toUpperCase() + model.category.slice(1)}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={cn('text-xs font-medium', speedInfo.color)}>
                {speedInfo.text}
              </div>
              <div className="flex space-x-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'w-1 h-2 rounded-full',
                      i < speedInfo.bars 
                        ? speedInfo.color.replace('text-', 'bg-')
                        : 'bg-white/20'
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Description */}
          <p className={cn("text-sm mb-3 line-clamp-2",
            needsApiKey ? "text-red-500" : "text-gray-600")}>
            {model.description}
          </p>
          
          {/* Quick Stats */}
          <div className={cn("flex items-center justify-between text-xs mb-3",
            needsApiKey ? "text-red-400" : "text-gray-500")}>
            <div className="flex items-center space-x-1">
              <Cpu size={10} />
              <span>{model.maxTokens.toLocaleString()} tokens</span>
            </div>
            <div className="flex items-center space-x-1">
              {model.isLocal ? (
                <>
                  <Home size={10} />
                  <span className="text-green-500 font-medium">Free</span>
                </>
              ) : (
                <>
                  <DollarSign size={10} />
                  <span>${model.costPer1kTokens}/1k</span>
                </>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="flex items-center space-x-3 text-xs">
            {model.supportsStreaming && (
              <div className={cn("flex items-center space-x-1",
                needsApiKey ? "text-red-400" : "text-blue-500")}>
                <Activity size={10} />
                <span>Streaming</span>
              </div>
            )}
            {model.maxTokens > 4000 && (
              <div className={cn("flex items-center space-x-1",
                needsApiKey ? "text-red-400" : "text-purple-500")}>
                <Clock size={10} />
                <span>Long Context</span>
              </div>
            )}
          </div>

          {/* Expanded Details - Simplified for performance */}
          {detailsVisible && (
            <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-enhanced opacity-60 mb-1">Max Tokens</div>
                  <div className="text-enhanced-contrast font-medium">{model.maxTokens.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-enhanced opacity-60 mb-1">Cost per 1k</div>
                  <div className="text-enhanced-contrast font-medium">
                    {model.isLocal ? 'Free' : `$${model.costPer1kTokens}`}
                  </div>
                </div>
                <div>
                  <div className="text-enhanced opacity-60 mb-1">Provider</div>
                  <div className="text-enhanced-contrast font-medium capitalize">{model.provider}</div>
                </div>
                <div>
                  <div className="text-enhanced opacity-60 mb-1">Type</div>
                  <div className="text-enhanced-contrast font-medium">
                    {model.isLocal ? 'Local' : 'Cloud'}
                  </div>
                </div>
              </div>
              
              {needsApiKey && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <div className="flex items-center space-x-2 text-red-300 text-sm font-medium mb-2">
                    <AlertCircle size={14} />
                    <span>API Key Required</span>
                  </div>
                  <p className="text-red-200 text-xs">
                    This model requires a valid API key for {model.provider.charAt(0).toUpperCase() + model.provider.slice(1)}. 
                    Add your API key to the environment variables to use this model.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Select Button */}
        <button
          onClick={() => handleModelSelect(model.id)}
          disabled={isLoading || status === 'unavailable' || needsApiKey}
          className={cn(
            'w-full p-3 transition-all font-semibold border-t text-sm',
            isSelected
              ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border-amber-200'
              : status === 'unavailable' || needsApiKey
              ? 'bg-red-50 text-red-500 cursor-not-allowed border-red-200'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
          )}
        >
          {isLoading ? 'Switching...' : 
           isSelected ? 'Currently Selected' :
           needsApiKey ? 'API Key Required' :
           status === 'unavailable' ? 'Unavailable' :
           'Select Model'}
        </button>
      </motion.div>
    )
  }

  return (
    <div className="relative">
      {/* Selected Model Display */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={cn(
          'w-full flex items-center justify-between p-4 rounded-2xl glass transition-all border',
          'hover:bg-white/10 text-enhanced-contrast shadow-lg',
          isLoading && 'opacity-50 cursor-not-allowed',
          isOpen && 'bg-white/10 border-amber-500/30'
        )}
        whileHover={!isLoading ? { scale: 1.01, y: -1 } : undefined}
        whileTap={!isLoading ? { scale: 0.99 } : undefined}
      >
        <div className="flex items-center space-x-4">
          {selectedModelData ? (
            <>
              <span className="text-2xl">{selectedModelData.icon}</span>
              <div className="text-left">
                <div className="font-bold text-lg">{selectedModelData.name}</div>
                <div className="text-sm text-enhanced opacity-70 flex items-center space-x-2">
                  <span>{selectedModelData.provider.charAt(0).toUpperCase() + selectedModelData.provider.slice(1)}</span>
                  <span>•</span>
                  <span className="capitalize">{selectedModelData.category}</span>
                  {selectedModelData.isLocal && (
                    <>
                      <span>•</span>
                      <span className="text-green-400">Local</span>
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <Settings size={24} />
              <div className="text-left">
                <div className="font-bold">Select AI Model</div>
                <div className="text-sm text-enhanced opacity-70">Choose your preferred AI</div>
              </div>
            </>
          )}
        </div>
        
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="ml-2"
        >
          <ChevronDown size={24} />
        </motion.div>
      </motion.button>

      {/* Model Selection Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-7xl max-h-[95vh] overflow-hidden"
            >
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl">
                {/* Header */}
                <div className="p-8 border-b border-white/20 bg-white/90">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                        <Brain className="text-amber-600" />
                        Choose Your AI Model
                      </h2>
                      <p className="text-gray-600">
                        Select the perfect AI model for your task - from lightning-fast responses to deep reasoning
                      </p>
                    </div>
                    <motion.button
                      onClick={() => setIsOpen(false)}
                      className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X size={24} className="text-gray-600" />
                    </motion.button>
                  </div>
                  
                  {/* Search and Filters */}
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        placeholder="Search models..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>
                    
                    {/* Sort */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:border-amber-500 transition-colors"
                    >
                      <option value="popularity">Most Popular</option>
                      <option value="name">Name A-Z</option>
                      <option value="cost">Lowest Cost</option>
                      <option value="speed">Fastest</option>
                    </select>
                  </div>

                  {/* Filter Buttons */}
                  <div className="flex flex-wrap gap-3 mt-6">
                    {/* Provider Filters */}
                    <button
                      onClick={() => setSelectedProvider('all')}
                      className={cn(
                        'px-4 py-2 rounded-full text-sm font-medium transition-all border hover:scale-105',
                        selectedProvider === 'all'
                          ? 'bg-amber-100 text-amber-700 border-amber-300'
                          : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-300'
                      )}
                    >
                      <Globe size={16} className="inline mr-2" />
                      All Providers
                    </button>
                    
                      {MODEL_PROVIDERS.map(provider => {
                        const hasModels = getProviderModels(provider.id).length > 0
                        if (!hasModels) return null
                        
                        return (
                          <button
                            key={provider.id}
                            onClick={() => setSelectedProvider(provider.id)}
                            className={cn(
                              'px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center space-x-2 border hover:scale-105',
                              selectedProvider === provider.id
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-white/10 text-enhanced hover:bg-white/20 border-white/20'
                            )}
                          >
                            <span>{provider.icon}</span>
                            <span>{provider.name}</span>
                          </button>
                        )
                      })}                    {/* Category Filters */}
                    <div className="w-full border-t border-white/10 pt-4 mt-2">
                      <div className="flex flex-wrap gap-2">
                        {['all', 'fast', 'balanced', 'creative', 'coding', 'reasoning'].map(category => {
                          const Icon = category === 'all' ? Filter : CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]
                          return (
                            <button
                              key={category}
                              onClick={() => setSelectedCategory(category)}
                              className={cn(
                                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1 border hover:scale-105',
                                selectedCategory === category
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : 'bg-white/5 text-enhanced hover:bg-white/10 border-white/10'
                              )}
                            >
                              <Icon size={12} />
                              <span>{category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Models Grid */}
                <div className="p-8 max-h-[70vh] overflow-y-auto bg-gray-50">
                  {filteredModels.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {filteredModels.map((model, index) => (
                        <div key={model.id}>
                          {renderModelCard(model)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div>
                        <Search size={64} className="mx-auto text-enhanced opacity-30 mb-6" />
                        <h3 className="text-2xl font-bold text-enhanced-contrast mb-4">
                          No Models Found
                        </h3>
                        <p className="text-enhanced opacity-80 mb-6 max-w-md mx-auto">
                          No models match your current filters. Try adjusting your search or filters.
                        </p>
                        <button
                          onClick={() => {
                            setSearchQuery('')
                            setSelectedProvider('all')
                            setSelectedCategory('all')
                          }}
                          className="px-6 py-3 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/40 hover:bg-amber-500/30 transition-colors"
                        >
                          Clear All Filters
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 bg-white">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4 text-gray-500">
                      <span>{filteredModels.length} models available</span>
                      <span>•</span>
                      <span>Real-time status checking</span>
                    </div>
                    {showProviderInfo && (
                      <div className="text-gray-500">
                        <span>Need help? Check our </span>
                        <motion.button
                          className="text-amber-600 hover:text-amber-700 underline"
                          whileHover={{ scale: 1.05 }}
                        >
                          model guide
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}