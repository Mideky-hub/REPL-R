import AIModelService from './AIModelService'
import { getModelById, DEFAULT_MODEL, AI_MODELS } from './aiModels'

export interface ModelFallbackOptions {
  originalModelId: string
  maxRetries?: number
  fallbackModels?: string[]
  userContext?: any
  systemPrompt?: string
}

export class ModelManager {
  private static instance: ModelManager
  private failureCount = new Map<string, number>()
  private lastFailureTime = new Map<string, number>()
  private readonly FAILURE_THRESHOLD = 3
  private readonly COOLDOWN_PERIOD = 5 * 60 * 1000 // 5 minutes

  static getInstance(): ModelManager {
    if (!ModelManager.instance) {
      ModelManager.instance = new ModelManager()
    }
    return ModelManager.instance
  }

  private isModelCooledDown(modelId: string): boolean {
    const lastFailure = this.lastFailureTime.get(modelId)
    if (!lastFailure) return true
    
    return Date.now() - lastFailure > this.COOLDOWN_PERIOD
  }

  private recordFailure(modelId: string): void {
    const currentFailures = this.failureCount.get(modelId) || 0
    this.failureCount.set(modelId, currentFailures + 1)
    this.lastFailureTime.set(modelId, Date.now())
  }

  private resetFailures(modelId: string): void {
    this.failureCount.delete(modelId)
    this.lastFailureTime.delete(modelId)
  }

  private getAvailableModels(): string[] {
    return AI_MODELS
      .filter(model => {
        // Skip models with too many failures that haven't cooled down
        const failures = this.failureCount.get(model.id) || 0
        if (failures >= this.FAILURE_THRESHOLD && !this.isModelCooledDown(model.id)) {
          return false
        }

        // Check if model is available (has API key if required)
        if (model.requiresApiKey) {
          switch (model.provider) {
            case 'openai':
              return !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here'
            case 'anthropic':
              return !!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your-anthropic-api-key-here'
            case 'google':
              return !!process.env.GOOGLE_AI_API_KEY && process.env.GOOGLE_AI_API_KEY !== 'your-google-ai-api-key-here'
            default:
              return false
          }
        }
        
        return true // Local models or models that don't require API keys
      })
      .map(model => model.id)
  }

  private getFallbackModels(originalModelId: string): string[] {
    const originalModel = getModelById(originalModelId)
    const availableModels = this.getAvailableModels()
    
    if (!originalModel) {
      return availableModels.slice(0, 3) // Return first 3 available models
    }

    // Prioritize fallbacks based on model characteristics
    const fallbacks: string[] = []
    
    // 1. Try models from same provider first
    const sameProviderModels = availableModels.filter(id => {
      const model = getModelById(id)
      return model && model.provider === originalModel.provider && model.id !== originalModelId
    })
    fallbacks.push(...sameProviderModels.slice(0, 2))
    
    // 2. Try models with same category
    const sameCategoryModels = availableModels.filter(id => {
      const model = getModelById(id)
      return model && 
             model.category === originalModel.category && 
             model.provider !== originalModel.provider &&
             !fallbacks.includes(id)
    })
    fallbacks.push(...sameCategoryModels.slice(0, 2))
    
    // 3. Add default model if not already included
    if (!fallbacks.includes(DEFAULT_MODEL) && availableModels.includes(DEFAULT_MODEL)) {
      fallbacks.push(DEFAULT_MODEL)
    }
    
    // 4. Add any remaining available models
    const remainingModels = availableModels.filter(id => 
      !fallbacks.includes(id) && id !== originalModelId
    )
    fallbacks.push(...remainingModels.slice(0, 3 - fallbacks.length))
    
    return fallbacks
  }

  async generateResponseWithFallback(
    messages: Array<{ role: 'system' | 'user' | 'assistant', content: string }>,
    options: ModelFallbackOptions
  ): Promise<{ response: string, modelUsed: string, fallbackUsed: boolean }> {
    const { originalModelId, maxRetries = 3, fallbackModels, userContext, systemPrompt } = options
    
    const tryModels = [
      originalModelId,
      ...(fallbackModels || this.getFallbackModels(originalModelId))
    ].slice(0, maxRetries)

    let lastError: Error | null = null

    for (let i = 0; i < tryModels.length; i++) {
      const modelId = tryModels[i]
      
      // Skip models that are in cooldown
      if (i > 0) { // Skip cooldown check for original model
        const failures = this.failureCount.get(modelId) || 0
        if (failures >= this.FAILURE_THRESHOLD && !this.isModelCooledDown(modelId)) {
          console.log(`Skipping model ${modelId} (in cooldown)`)
          continue
        }
      }

      try {
        console.log(`Attempting to use model: ${modelId} (attempt ${i + 1}/${tryModels.length})`)
        
        const response = await AIModelService.generateResponse(messages, {
          modelId,
          systemPrompt: systemPrompt || AIModelService.getDefaultSystemPrompt(userContext),
          temperature: 0.7,
          maxTokens: 1024
        })

        // Success! Reset failure count for this model
        this.resetFailures(modelId)
        
        return {
          response,
          modelUsed: modelId,
          fallbackUsed: i > 0
        }
        
      } catch (error) {
        console.error(`Model ${modelId} failed:`, error)
        lastError = error as Error
        this.recordFailure(modelId)
        
        // Continue to next model
        continue
      }
    }

    // All models failed
    throw new Error(
      `All models failed to generate response. Last error: ${lastError?.message || 'Unknown error'}`
    )
  }

  async testModelAvailability(modelId: string): Promise<{
    available: boolean
    error?: string
    responseTime?: number
  }> {
    const startTime = Date.now()
    
    try {
      const available = await AIModelService.testModelAvailability(modelId)
      const responseTime = Date.now() - startTime
      
      if (available) {
        this.resetFailures(modelId)
        return { available: true, responseTime }
      } else {
        this.recordFailure(modelId)
        return { available: false, error: 'Model test failed' }
      }
    } catch (error) {
      this.recordFailure(modelId)
      const responseTime = Date.now() - startTime
      
      return {
        available: false,
        error: (error as Error).message,
        responseTime
      }
    }
  }

  getModelStatus(modelId: string): {
    status: 'healthy' | 'degraded' | 'unavailable'
    failureCount: number
    lastFailure?: number
    nextRetryTime?: number
  } {
    const failures = this.failureCount.get(modelId) || 0
    const lastFailure = this.lastFailureTime.get(modelId)
    
    if (failures === 0) {
      return { status: 'healthy', failureCount: 0 }
    }
    
    if (failures < this.FAILURE_THRESHOLD) {
      return { 
        status: 'degraded', 
        failureCount: failures,
        lastFailure 
      }
    }
    
    if (lastFailure && !this.isModelCooledDown(modelId)) {
      return {
        status: 'unavailable',
        failureCount: failures,
        lastFailure,
        nextRetryTime: lastFailure + this.COOLDOWN_PERIOD
      }
    }
    
    return {
      status: 'degraded',
      failureCount: failures,
      lastFailure
    }
  }

  getAllModelStatuses(): Record<string, ReturnType<typeof this.getModelStatus>> {
    const statuses: Record<string, ReturnType<typeof this.getModelStatus>> = {}
    
    for (const model of AI_MODELS) {
      statuses[model.id] = this.getModelStatus(model.id)
    }
    
    return statuses
  }

  clearAllFailures(): void {
    this.failureCount.clear()
    this.lastFailureTime.clear()
  }
}

export default ModelManager.getInstance()