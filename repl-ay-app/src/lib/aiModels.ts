export interface AIModel {
  id: string
  name: string
  provider: string
  description: string
  maxTokens: number
  supportsStreaming: boolean
  costPer1kTokens: number
  category: 'fast' | 'balanced' | 'creative' | 'coding' | 'reasoning'
  icon: string
  requiresApiKey: boolean
  isLocal: boolean
}

export interface ModelProvider {
  id: string
  name: string
  icon: string
  website: string
  apiKeyRequired: boolean
}

export const MODEL_PROVIDERS: ModelProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    icon: '⚡',
    website: 'https://openai.com',
    apiKeyRequired: true
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    icon: '🎭',
    website: 'https://anthropic.com',
    apiKeyRequired: true
  },
  {
    id: 'google',
    name: 'Google AI',
    icon: '🌟',
    website: 'https://ai.google.dev',
    apiKeyRequired: true
  },
  {
    id: 'meta',
    name: 'Meta',
    icon: '🦾',
    website: 'https://llama.meta.com',
    apiKeyRequired: false
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: '🔥',
    website: 'https://platform.deepseek.com',
    apiKeyRequired: true
  },
  {
    id: 'xai',
    name: 'xAI',
    icon: '🚀',
    website: 'https://x.ai',
    apiKeyRequired: true
  },
  {
    id: 'qwen',
    name: 'Qwen',
    icon: '🎯',
    website: 'https://tongyi.aliyun.com',
    apiKeyRequired: true
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    icon: '🌪️',
    website: 'https://mistral.ai',
    apiKeyRequired: true
  },
  {
    id: 'groq',
    name: 'Groq',
    icon: '💨',
    website: 'https://groq.com',
    apiKeyRequired: true
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    icon: '🏠',
    website: 'https://ollama.ai',
    apiKeyRequired: false
  }
]

export const AI_MODELS: AIModel[] = [
  // OpenAI Models - Using correct API names from LangChain reference
  {
    id: 'gpt-5',
    name: 'GPT-5',
    provider: 'openai',
    description: 'Most advanced OpenAI model with unprecedented capabilities',
    maxTokens: 16384,
    supportsStreaming: true,
    costPer1kTokens: 0.05,
    category: 'reasoning',
    icon: '🌟',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'Omni-modal model with enhanced vision and reasoning',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.03,
    category: 'creative',
    icon: '🎨',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'gpt-4.1-mini',
    name: 'GPT-4.1 Mini',
    provider: 'openai',
    description: 'Efficient version of GPT-4.1 optimized for speed and cost',
    maxTokens: 4096,
    supportsStreaming: true,
    costPer1kTokens: 0.005,
    category: 'fast',
    icon: '⚡',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'o3',
    name: 'o3',
    provider: 'openai',
    description: 'Advanced reasoning model optimized for complex problem-solving',
    maxTokens: 16384,
    supportsStreaming: false,
    costPer1kTokens: 0.2,
    category: 'reasoning',
    icon: '🧠',
    requiresApiKey: true,
    isLocal: false
  },

  // Anthropic Models - Using correct API names from LangChain reference
  {
    id: 'claude-opus-4-1-20250805',
    name: 'Claude Opus 4.1',
    provider: 'anthropic',
    description: 'Most powerful Claude model with exceptional reasoning capabilities',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.1,
    category: 'reasoning',
    icon: '👑',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'claude-opus-4-20250514',
    name: 'Claude Opus 4',
    provider: 'anthropic',
    description: 'Flagship Claude model with advanced reasoning and analysis',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.085,
    category: 'reasoning',
    icon: '💎',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'claude-sonnet-4-20250514',
    name: 'Claude Sonnet 4',
    provider: 'anthropic',
    description: 'Balanced Claude model offering great performance at lower cost',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.025,
    category: 'balanced',
    icon: '🎭',
    requiresApiKey: true,
    isLocal: false
  },

  // Google Models - Using correct API names from LangChain reference
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'google',
    description: 'Next-generation Gemini with massive context window',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.0125,
    category: 'reasoning',
    icon: '🌟',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'google',
    description: 'Fast and efficient Gemini with excellent multimodal capabilities',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.00075,
    category: 'fast',
    icon: '⚡',
    requiresApiKey: true,
    isLocal: false
  },

  // DeepSeek Models - Using Ollama as per LangChain reference
  {
    id: 'deepseek-r1:latest',
    name: 'DeepSeek-R1 Latest',
    provider: 'ollama',
    description: 'Latest DeepSeek-R1 model with advanced reasoning capabilities',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.0,
    category: 'reasoning',
    icon: '🔥',
    requiresApiKey: false,
    isLocal: true
  },
  {
    id: 'deepseek-r1:8b',
    name: 'DeepSeek-R1 8B',
    provider: 'ollama',
    description: '8B parameter version of DeepSeek-R1 for efficient local deployment',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.0,
    category: 'balanced',
    icon: '🔥',
    requiresApiKey: false,
    isLocal: true
  },

  // Qwen Models - Using correct API names from LangChain reference
  {
    id: 'qwen-max',
    name: 'Qwen Max',
    provider: 'qwen',
    description: 'Most powerful Qwen model with advanced capabilities',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.02,
    category: 'reasoning',
    icon: '🎯',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'qwen-plus',
    name: 'Qwen Plus',
    provider: 'qwen',
    description: 'High-performance Qwen model for complex tasks',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.01,
    category: 'balanced',
    icon: '🎯',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'qwen-vl-max',
    name: 'Qwen VL Max',
    provider: 'qwen',
    description: 'Vision-language model with advanced multimodal capabilities',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.025,
    category: 'creative',
    icon: '👁️',
    requiresApiKey: true,
    isLocal: false
  },

  // Mistral Models - Using correct API names from LangChain reference
  {
    id: 'mistral-large-2411',
    name: 'Mistral Large 2411',
    provider: 'mistral',
    description: 'Latest Mistral Large model with enhanced capabilities',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.04,
    category: 'reasoning',
    icon: '🌪️',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'mistral-medium-2508',
    name: 'Mistral Medium 2508',
    provider: 'mistral',
    description: 'Balanced Mistral model for various tasks',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.025,
    category: 'balanced',
    icon: '🌪️',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'devstral-medium-2507',
    name: 'Devstral Medium 2507',
    provider: 'mistral',
    description: 'Code-optimized Mistral model for development tasks',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.02,
    category: 'coding',
    icon: '💻',
    requiresApiKey: true,
    isLocal: false
  },

  // Grok Models - Using correct API names from LangChain reference
  {
    id: 'grok-4',
    name: 'Grok 4',
    provider: 'xai',
    description: 'Advanced Grok model with enhanced reasoning capabilities',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.03,
    category: 'reasoning',
    icon: '🚀',
    requiresApiKey: true,
    isLocal: false
  },

  // Groq Models - High-speed inference platform
  {
    id: 'llama-3.2-90b-text-preview',
    name: 'Llama 3.2 90B (Groq)',
    provider: 'groq',
    description: 'High-speed Llama 3.2 90B on Groq infrastructure',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.015,
    category: 'fast',
    icon: '💨',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B Instant (Groq)',
    provider: 'groq',
    description: 'Ultra-fast Llama 3.1 8B with instant responses',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.001,
    category: 'fast',
    icon: '⚡',
    requiresApiKey: true,
    isLocal: false
  },

  // Local Ollama Models - Example models for local deployment
  {
    id: 'gpt-oss:20b',
    name: 'GPT-OSS 20B (Local)',
    provider: 'ollama',
    description: 'Local open-source GPT model with 20 billion parameters via Ollama',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.0,
    category: 'balanced',
    icon: '🏠',
    requiresApiKey: false,
    isLocal: true
  },
  {
    id: 'llama3.2:latest',
    name: 'Llama 3.2 (Local)',
    provider: 'ollama',
    description: 'Local Llama 3.2 model via Ollama',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.0,
    category: 'balanced',
    icon: '🏠',
    requiresApiKey: false,
    isLocal: true
  }
]

export function isModelAvailable(model: AIModel): boolean {
  if (!model.requiresApiKey) return true
  
  switch (model.provider) {
    case 'openai':
      return !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here'
    case 'anthropic':
      return !!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your-anthropic-api-key-here'
    case 'google':
      return !!process.env.GOOGLE_AI_API_KEY && process.env.GOOGLE_AI_API_KEY !== 'your-google-ai-api-key-here'
    case 'deepseek':
      return !!process.env.DEEPSEEK_API_KEY && process.env.DEEPSEEK_API_KEY !== 'your-deepseek-api-key-here'
    case 'xai':
      return !!process.env.XAI_API_KEY && process.env.XAI_API_KEY !== 'your-xai-api-key-here'
    case 'qwen':
      return !!process.env.QWEN_API_KEY && process.env.QWEN_API_KEY !== 'your-qwen-api-key-here'
    case 'mistral':
      return !!process.env.MISTRAL_API_KEY && process.env.MISTRAL_API_KEY !== 'your-mistral-api-key-here'
    case 'groq':
      return !!process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your-groq-api-key-here'
    case 'meta':
      // Meta models typically use Ollama or other providers - always available
      return true
    case 'ollama':
      // Local models are always available if Ollama is running
      return true
    default:
      return false
  }
}

export function getAvailableModels(): AIModel[] {
  return AI_MODELS.filter(isModelAvailable)
}

export function getModelsByProvider(provider: string): AIModel[] {
  return AI_MODELS.filter(model => model.provider === provider)
}

export function getModelsByCategory(category: AIModel['category']): AIModel[] {
  return AI_MODELS.filter(model => model.category === category)
}

export function getModelById(id: string): AIModel | undefined {
  return AI_MODELS.find(model => model.id === id)
}

// Default model for testing - set to your local Ollama model
export const DEFAULT_MODEL = 'gpt-oss:20b'