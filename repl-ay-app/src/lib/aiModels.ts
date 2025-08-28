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
    id: 'zai',
    name: 'Z.ai',
    icon: '⭐',
    website: 'https://z.ai',
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
  // OpenAI Models
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'Most advanced OpenAI model with multimodal capabilities',
    maxTokens: 4096,
    supportsStreaming: true,
    costPer1kTokens: 0.03,
    category: 'reasoning',
    icon: '🌟',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'o1-preview',
    name: 'GPT-o1 Preview',
    provider: 'openai',
    description: 'Advanced reasoning model with chain-of-thought capabilities',
    maxTokens: 4096,
    supportsStreaming: false,
    costPer1kTokens: 0.15,
    category: 'reasoning',
    icon: '🎯',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'o1-mini',
    name: 'GPT-o1 Mini',
    provider: 'openai',
    description: 'Faster reasoning model for coding and math',
    maxTokens: 4096,
    supportsStreaming: false,
    costPer1kTokens: 0.03,
    category: 'coding',
    icon: '⚡',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    description: 'Fast and cost-effective version of GPT-4o',
    maxTokens: 4096,
    supportsStreaming: true,
    costPer1kTokens: 0.003,
    category: 'fast',
    icon: '⚡',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    description: 'Latest GPT-4 model with improved performance',
    maxTokens: 4096,
    supportsStreaming: true,
    costPer1kTokens: 0.01,
    category: 'balanced',
    icon: '🚀',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    description: 'Fast and efficient model for most tasks',
    maxTokens: 4096,
    supportsStreaming: true,
    costPer1kTokens: 0.0015,
    category: 'fast',
    icon: '💨',
    requiresApiKey: true,
    isLocal: false
  },

  // Anthropic Models
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    description: 'Most intelligent Claude model, great for complex tasks',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.015,
    category: 'reasoning',
    icon: '🎭',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    description: 'Most powerful Claude model for complex reasoning',
    maxTokens: 4096,
    supportsStreaming: true,
    costPer1kTokens: 0.075,
    category: 'reasoning',
    icon: '👑',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'claude-3-haiku-20240307',
    name: 'Claude 3 Haiku',
    provider: 'anthropic',
    description: 'Fastest Claude model for quick responses',
    maxTokens: 4096,
    supportsStreaming: true,
    costPer1kTokens: 0.0025,
    category: 'fast',
    icon: '🌸',
    requiresApiKey: true,
    isLocal: false
  },

  // Google AI Models
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    description: 'Google\'s most capable AI model',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.0035,
    category: 'balanced',
    icon: '💎',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'google',
    description: 'Fast and efficient Google AI model',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.00075,
    category: 'fast',
    icon: '⚡',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash (Experimental)',
    provider: 'google',
    description: 'Next-generation Gemini model with enhanced capabilities',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.001,
    category: 'reasoning',
    icon: '🌟',
    requiresApiKey: true,
    isLocal: false
  },

  // Meta/Llama Models (via Groq/Ollama)
  {
    id: 'llama-3.3-70b',
    name: 'Llama 3.3 70B',
    provider: 'meta',
    description: 'Latest Llama model with 70B parameters',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.0008,
    category: 'reasoning',
    icon: '🦙',
    requiresApiKey: false,
    isLocal: true
  },
  {
    id: 'llama-3.2-90b',
    name: 'Llama 3.2 90B Vision',
    provider: 'meta',
    description: 'Multimodal Llama with vision capabilities',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.001,
    category: 'creative',
    icon: '👁️',
    requiresApiKey: false,
    isLocal: true
  },
  {
    id: 'llama-3.2-11b',
    name: 'Llama 3.2 11B Vision',
    provider: 'meta',
    description: 'Smaller multimodal Llama model',
    maxTokens: 4096,
    supportsStreaming: true,
    costPer1kTokens: 0.0005,
    category: 'balanced',
    icon: '🦙',
    requiresApiKey: false,
    isLocal: true
  },
  {
    id: 'llama-3.2-3b',
    name: 'Llama 3.2 3B',
    provider: 'meta',
    description: 'Fast and efficient small Llama model',
    maxTokens: 4096,
    supportsStreaming: true,
    costPer1kTokens: 0,
    category: 'fast',
    icon: '💨',
    requiresApiKey: false,
    isLocal: true
  },

  // DeepSeek Models
  {
    id: 'deepseek-v3',
    name: 'DeepSeek-V3',
    provider: 'deepseek',
    description: 'Advanced reasoning model from DeepSeek',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.002,
    category: 'reasoning',
    icon: '🔥',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'deepseek-coder-v2',
    name: 'DeepSeek Coder V2',
    provider: 'deepseek',
    description: 'Specialized coding model from DeepSeek',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.002,
    category: 'coding',
    icon: '💻',
    requiresApiKey: true,
    isLocal: false
  },

  // xAI Models
  {
    id: 'grok-2',
    name: 'Grok-2',
    provider: 'xai',
    description: 'xAI\'s advanced conversational AI model',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.01,
    category: 'creative',
    icon: '🚀',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'grok-2-mini',
    name: 'Grok-2 Mini',
    provider: 'xai',
    description: 'Faster version of Grok-2',
    maxTokens: 4096,
    supportsStreaming: true,
    costPer1kTokens: 0.005,
    category: 'fast',
    icon: '⚡',
    requiresApiKey: true,
    isLocal: false
  },

  // Qwen Models
  {
    id: 'qwen2.5-72b',
    name: 'Qwen2.5 72B',
    provider: 'qwen',
    description: 'Large multilingual model from Alibaba',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.003,
    category: 'reasoning',
    icon: '🎯',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'qwen2.5-coder-32b',
    name: 'Qwen2.5 Coder 32B',
    provider: 'qwen',
    description: 'Coding-specialized Qwen model',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.002,
    category: 'coding',
    icon: '💻',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'qwen2.5-14b',
    name: 'Qwen2.5 14B',
    provider: 'qwen',
    description: 'Balanced performance Qwen model',
    maxTokens: 4096,
    supportsStreaming: true,
    costPer1kTokens: 0.001,
    category: 'balanced',
    icon: '⚖️',
    requiresApiKey: true,
    isLocal: false
  },

  // Mistral AI Models
  {
    id: 'mistral-large-2',
    name: 'Mistral Large 2',
    provider: 'mistral',
    description: 'Latest flagship model from Mistral AI',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.008,
    category: 'reasoning',
    icon: '🌪️',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'mistral-small',
    name: 'Mistral Small',
    provider: 'mistral',
    description: 'Cost-effective model for simple tasks',
    maxTokens: 4096,
    supportsStreaming: true,
    costPer1kTokens: 0.002,
    category: 'fast',
    icon: '💨',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'codestral-latest',
    name: 'Codestral Latest',
    provider: 'mistral',
    description: 'Specialized coding model by Mistral AI',
    maxTokens: 4096,
    supportsStreaming: true,
    costPer1kTokens: 0.003,
    category: 'coding',
    icon: '💻',
    requiresApiKey: true,
    isLocal: false
  },

  // Groq Models (Fast inference)
  {
    id: 'llama-3.1-70b-groq',
    name: 'Llama 3.1 70B (Groq)',
    provider: 'groq',
    description: 'Ultra-fast Llama 3.1 70B on Groq infrastructure',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.0008,
    category: 'fast',
    icon: '💨',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'mixtral-8x7b-groq',
    name: 'Mixtral 8x7B (Groq)',
    provider: 'groq',
    description: 'Ultra-fast Mixtral on Groq infrastructure',
    maxTokens: 4096,
    supportsStreaming: true,
    costPer1kTokens: 0.0005,
    category: 'fast',
    icon: '🚀',
    requiresApiKey: true,
    isLocal: false
  },

  // Ollama Local Models
  {
    id: 'llama3.2',
    name: 'Llama 3.2 (Local)',
    provider: 'ollama',
    description: 'Meta\'s latest Llama model running locally',
    maxTokens: 4096,
    supportsStreaming: true,
    costPer1kTokens: 0,
    category: 'balanced',
    icon: '🏠',
    requiresApiKey: false,
    isLocal: true
  },
  {
    id: 'codestral',
    name: 'Codestral (Local)',
    provider: 'ollama',
    description: 'Specialized coding model running locally',
    maxTokens: 4096,
    supportsStreaming: true,
    costPer1kTokens: 0,
    category: 'coding',
    icon: '💻',
    requiresApiKey: false,
    isLocal: true
  },
  {
    id: 'phi3.5',
    name: 'Phi-3.5 (Local)',
    provider: 'ollama',
    description: 'Microsoft\'s efficient small model',
    maxTokens: 4096,
    supportsStreaming: true,
    costPer1kTokens: 0,
    category: 'fast',
    icon: '⚡',
    requiresApiKey: false,
    isLocal: true
  },
  {
    id: 'qwen2.5-7b',
    name: 'Qwen2.5 7B (Local)',
    provider: 'ollama',
    description: 'Qwen model running locally',
    maxTokens: 4096,
    supportsStreaming: true,
    costPer1kTokens: 0,
    category: 'balanced',
    icon: '🎯',
    requiresApiKey: false,
    isLocal: true
  },
  {
    id: 'deepseek-v2.5',
    name: 'DeepSeek V2.5 (Local)',
    provider: 'ollama',
    description: 'DeepSeek model running locally',
    maxTokens: 4096,
    supportsStreaming: true,
    costPer1kTokens: 0,
    category: 'reasoning',
    icon: '🔥',
    requiresApiKey: false,
    isLocal: true
  }
]

export const DEFAULT_MODEL = 'gpt-4o-mini'

export function getModelsByCategory(category: AIModel['category']): AIModel[] {
  return AI_MODELS.filter(model => model.category === category)
}

export function getModelsByProvider(provider: string): AIModel[] {
  return AI_MODELS.filter(model => model.provider === provider)
}

export function getAvailableModels(): AIModel[] {
  // Return all models - let the UI handle API key availability
  return AI_MODELS
}

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

export function getModelById(id: string): AIModel | undefined {
  return AI_MODELS.find(model => model.id === id)
}

export function getProviderById(id: string): ModelProvider | undefined {
  return MODEL_PROVIDERS.find(provider => provider.id === id)
}