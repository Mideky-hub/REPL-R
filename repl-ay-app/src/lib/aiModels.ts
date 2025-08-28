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
  // OpenAI Models - GPT-5, GPT-4.5, GPT-4.1 Series (incl. Mini, Nano), GPT-4o (reinstated), o3 Series
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
    id: 'gpt-4.5',
    name: 'GPT-4.5',
    provider: 'openai',
    description: 'Enhanced GPT-4 with improved performance and capabilities',
    maxTokens: 12288,
    supportsStreaming: true,
    costPer1kTokens: 0.04,
    category: 'reasoning',
    icon: '⭐',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'gpt-4.1',
    name: 'GPT-4.1',
    provider: 'openai',
    description: 'Latest GPT-4.1 with refined performance',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.035,
    category: 'balanced',
    icon: '🚀',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'gpt-4.1-mini',
    name: 'GPT-4.1 Mini',
    provider: 'openai',
    description: 'Efficient version of GPT-4.1 for faster responses',
    maxTokens: 4096,
    supportsStreaming: true,
    costPer1kTokens: 0.005,
    category: 'fast',
    icon: '⚡',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'gpt-4.1-nano',
    name: 'GPT-4.1 Nano',
    provider: 'openai',
    description: 'Ultra-lightweight GPT-4.1 for simple tasks',
    maxTokens: 2048,
    supportsStreaming: true,
    costPer1kTokens: 0.001,
    category: 'fast',
    icon: '�',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o (Reinstated)',
    provider: 'openai',
    description: 'Reinstated GPT-4o with multimodal capabilities',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.03,
    category: 'creative',
    icon: '🎨',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'o3-preview',
    name: 'o3 Preview',
    provider: 'openai',
    description: 'Next-generation reasoning model with advanced chain-of-thought',
    maxTokens: 16384,
    supportsStreaming: false,
    costPer1kTokens: 0.2,
    category: 'reasoning',
    icon: '🧠',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'o3-mini',
    name: 'o3 Mini',
    provider: 'openai',
    description: 'Smaller o3 model optimized for coding and mathematical reasoning',
    maxTokens: 8192,
    supportsStreaming: false,
    costPer1kTokens: 0.05,
    category: 'coding',
    icon: '🔢',
    requiresApiKey: true,
    isLocal: false
  },

  // Anthropic Models - Claude Opus 4.1, Opus 4, Sonnet 4, Claude 3 (long context leader)
  {
    id: 'claude-opus-4.1',
    name: 'Claude Opus 4.1',
    provider: 'anthropic',
    description: 'Latest Claude Opus with enhanced capabilities',
    maxTokens: 200000,
    supportsStreaming: true,
    costPer1kTokens: 0.1,
    category: 'reasoning',
    icon: '👑',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'claude-opus-4',
    name: 'Claude Opus 4',
    provider: 'anthropic',
    description: 'Most powerful Claude model for complex reasoning tasks',
    maxTokens: 100000,
    supportsStreaming: true,
    costPer1kTokens: 0.085,
    category: 'reasoning',
    icon: '💎',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'claude-sonnet-4',
    name: 'Claude Sonnet 4',
    provider: 'anthropic',
    description: 'Balanced Claude model with excellent performance',
    maxTokens: 50000,
    supportsStreaming: true,
    costPer1kTokens: 0.025,
    category: 'balanced',
    icon: '🎭',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'claude-3-long-context',
    name: 'Claude 3 (Long Context Leader)',
    provider: 'anthropic',
    description: 'Claude 3 optimized for extremely long context processing',
    maxTokens: 1000000,
    supportsStreaming: true,
    costPer1kTokens: 0.015,
    category: 'reasoning',
    icon: '📚',
    requiresApiKey: true,
    isLocal: false
  },

  // Google Models - Gemini 2.5, Gemma 3, PaliGemma 2 Mix, PaLM 2 family (Bison, Unicorn, etc.)
  {
    id: 'gemini-2.5',
    name: 'Gemini 2.5',
    provider: 'google',
    description: 'Latest Gemini with breakthrough capabilities',
    maxTokens: 32768,
    supportsStreaming: true,
    costPer1kTokens: 0.006,
    category: 'reasoning',
    icon: '💎',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'gemma-3',
    name: 'Gemma 3',
    provider: 'google',
    description: 'Advanced open-source model from Google',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.002,
    category: 'balanced',
    icon: '🌟',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'paligemma-2-mix',
    name: 'PaliGemma 2 Mix',
    provider: 'google',
    description: 'Multimodal model with vision and language capabilities',
    maxTokens: 16384,
    supportsStreaming: true,
    costPer1kTokens: 0.008,
    category: 'creative',
    icon: '👁️',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'palm-2-bison',
    name: 'PaLM 2 Bison',
    provider: 'google',
    description: 'Large language model from PaLM 2 family',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.003,
    category: 'balanced',
    icon: '�',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'palm-2-unicorn',
    name: 'PaLM 2 Unicorn',
    provider: 'google',
    description: 'Specialized PaLM 2 model with unique capabilities',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.004,
    category: 'creative',
    icon: '🦄',
    requiresApiKey: true,
    isLocal: false
  },

  // DeepSeek Models - DeepSeek-V3.1, DeepSeek-R1 & R1-0528, DeepSeek-V3 (MoE, open source)
  {
    id: 'deepseek-v3.1',
    name: 'DeepSeek-V3.1',
    provider: 'deepseek',
    description: 'Latest DeepSeek model with enhanced reasoning capabilities',
    maxTokens: 16384,
    supportsStreaming: true,
    costPer1kTokens: 0.002,
    category: 'reasoning',
    icon: '🔥',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek-R1',
    provider: 'deepseek',
    description: 'Advanced reasoning model from DeepSeek',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.0015,
    category: 'reasoning',
    icon: '🧠',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'deepseek-r1-0528',
    name: 'DeepSeek-R1-0528',
    provider: 'deepseek',
    description: 'Specialized version of DeepSeek-R1',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.0015,
    category: 'coding',
    icon: '�',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'deepseek-v3-moe',
    name: 'DeepSeek-V3 (MoE, Open Source)',
    provider: 'deepseek',
    description: 'Mixture of Experts model, open source variant',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.001,
    category: 'balanced',
    icon: '🔓',
    requiresApiKey: true,
    isLocal: false
  },

  // Qwen Models - Qwen3-235B, Qwen2.5-VL/Omni, Qwen 2.5-Max (claimed GPT-4o-beater)
  {
    id: 'qwen3-235b',
    name: 'Qwen3-235B',
    provider: 'qwen',
    description: 'Massive 235B parameter model from Qwen',
    maxTokens: 32768,
    supportsStreaming: true,
    costPer1kTokens: 0.01,
    category: 'reasoning',
    icon: '�️',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'qwen2.5-vl',
    name: 'Qwen2.5-VL',
    provider: 'qwen',
    description: 'Vision-language multimodal model',
    maxTokens: 16384,
    supportsStreaming: true,
    costPer1kTokens: 0.005,
    category: 'creative',
    icon: '👁️',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'qwen2.5-omni',
    name: 'Qwen2.5-Omni',
    provider: 'qwen',
    description: 'Multimodal model with comprehensive capabilities',
    maxTokens: 16384,
    supportsStreaming: true,
    costPer1kTokens: 0.006,
    category: 'balanced',
    icon: '🌐',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'qwen2.5-max',
    name: 'Qwen 2.5-Max (GPT-4o-Beater)',
    provider: 'qwen',
    description: 'Claimed to surpass GPT-4o performance',
    maxTokens: 16384,
    supportsStreaming: true,
    costPer1kTokens: 0.008,
    category: 'reasoning',
    icon: '🎯',
    requiresApiKey: true,
    isLocal: false
  },

  // Mistral Models - Mistral Large 2, Medium 3, Small 3.1, Devstral (coding)
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
    id: 'mistral-medium-3',
    name: 'Mistral Medium 3',
    provider: 'mistral',
    description: 'Balanced performance model from Mistral',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.004,
    category: 'balanced',
    icon: '⚖️',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'mistral-small-3.1',
    name: 'Mistral Small 3.1',
    provider: 'mistral',
    description: 'Efficient and cost-effective Mistral model',
    maxTokens: 4096,
    supportsStreaming: true,
    costPer1kTokens: 0.002,
    category: 'fast',
    icon: '💨',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'devstral',
    name: 'Devstral (Coding)',
    provider: 'mistral',
    description: 'Specialized coding model by Mistral AI',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.003,
    category: 'coding',
    icon: '💻',
    requiresApiKey: true,
    isLocal: false
  },

  // Grok (xAI) Models - Grok 4 & 4 Heavy (state-of-the-art), Grok 2.5 (open-sourced), Grok 3 upcoming
  {
    id: 'grok-4',
    name: 'Grok 4 (State-of-the-Art)',
    provider: 'xai',
    description: 'Latest state-of-the-art model from xAI',
    maxTokens: 16384,
    supportsStreaming: true,
    costPer1kTokens: 0.015,
    category: 'reasoning',
    icon: '🚀',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'grok-4-heavy',
    name: 'Grok 4 Heavy',
    provider: 'xai',
    description: 'Heavy-duty version of Grok 4 for complex tasks',
    maxTokens: 32768,
    supportsStreaming: true,
    costPer1kTokens: 0.025,
    category: 'reasoning',
    icon: '💪',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'grok-2.5',
    name: 'Grok 2.5 (Open-Sourced)',
    provider: 'xai',
    description: 'Open-source version of Grok 2.5',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.005,
    category: 'balanced',
    icon: '�',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'grok-3-preview',
    name: 'Grok 3 (Upcoming Preview)',
    provider: 'xai',
    description: 'Preview of upcoming Grok 3 model',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.01,
    category: 'creative',
    icon: '🔮',
    requiresApiKey: true,
    isLocal: false
  },

  // Z.ai Models - GLM-4.5, GLM-4.5V (vision-language, Huawei-optimized)
  {
    id: 'glm-4.5',
    name: 'GLM-4.5',
    provider: 'zai',
    description: 'Advanced language model from Z.ai',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.003,
    category: 'balanced',
    icon: '⭐',
    requiresApiKey: true,
    isLocal: false
  },
  {
    id: 'glm-4.5v',
    name: 'GLM-4.5V (Vision-Language, Huawei-optimized)',
    provider: 'zai',
    description: 'Vision-language model optimized for Huawei infrastructure',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.005,
    category: 'creative',
    icon: '�️',
    requiresApiKey: true,
    isLocal: false
  },

  // Ollama Local Models - Model platform hosting DeepSeek, Qwen, Mistral, Gemma for local use
  {
    id: 'deepseek-v3.1-local',
    name: 'DeepSeek-V3.1 (Local)',
    provider: 'ollama',
    description: 'DeepSeek-V3.1 running locally via Ollama',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0,
    category: 'reasoning',
    icon: '🔥',
    requiresApiKey: false,
    isLocal: true
  },
  {
    id: 'qwen3-local',
    name: 'Qwen3 (Local)',
    provider: 'ollama',
    description: 'Qwen3 model running locally via Ollama',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0,
    category: 'balanced',
    icon: '🎯',
    requiresApiKey: false,
    isLocal: true
  },
  {
    id: 'mistral-large-2-local',
    name: 'Mistral Large 2 (Local)',
    provider: 'ollama',
    description: 'Mistral Large 2 running locally via Ollama',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0,
    category: 'reasoning',
    icon: '🌪️',
    requiresApiKey: false,
    isLocal: true
  },
  {
    id: 'gemma-3-local',
    name: 'Gemma 3 (Local)',
    provider: 'ollama',
    description: 'Google Gemma 3 running locally via Ollama',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0,
    category: 'balanced',
    icon: '�',
    requiresApiKey: false,
    isLocal: true
  },
  {
    id: 'devstral-local',
    name: 'Devstral (Local)',
    provider: 'ollama',
    description: 'Mistral Devstral coding model running locally',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0,
    category: 'coding',
    icon: '�',
    requiresApiKey: false,
    isLocal: true
  }
]

export const DEFAULT_MODEL = 'gpt-4.1-mini'

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