import { ChatOpenAI } from '@langchain/openai'
import { ChatAnthropic } from '@langchain/anthropic'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { ChatOllama } from '@langchain/ollama'
import { ChatMistralAI } from '@langchain/mistralai'
import { ChatGroq } from '@langchain/groq'
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { AIModel, getModelById } from './aiModels'

export interface ChatOptions {
  modelId: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export class AIModelService {
  private static instance: AIModelService
  private modelCache = new Map<string, any>()

  static getInstance(): AIModelService {
    if (!AIModelService.instance) {
      AIModelService.instance = new AIModelService()
    }
    return AIModelService.instance
  }

  private getModelInstance(modelId: string, options: Partial<ChatOptions> = {}) {
    const cacheKey = `${modelId}-${JSON.stringify(options)}`
    
    if (this.modelCache.has(cacheKey)) {
      return this.modelCache.get(cacheKey)
    }

    const modelConfig = getModelById(modelId)
    if (!modelConfig) {
      throw new Error(`Model ${modelId} not found`)
    }

    let model: any

    switch (modelConfig.provider) {
      case 'openai':
        model = new ChatOpenAI({
          modelName: modelId,
          temperature: options.temperature ?? 0.7,
          maxTokens: options.maxTokens ?? modelConfig.maxTokens,
          streaming: options.stream ?? false,
          openAIApiKey: process.env.OPENAI_API_KEY,
        })
        break

      case 'anthropic':
        model = new ChatAnthropic({
          model: modelId,
          temperature: options.temperature ?? 0.7,
          maxTokens: options.maxTokens ?? modelConfig.maxTokens,
          streaming: options.stream ?? false,
          anthropicApiKey: process.env.ANTHROPIC_API_KEY,
        })
        break

      case 'google':
        model = new ChatGoogleGenerativeAI({
          model: modelId,
          temperature: options.temperature ?? 0.7,
          maxOutputTokens: options.maxTokens ?? modelConfig.maxTokens,
          streaming: options.stream ?? false,
          apiKey: process.env.GOOGLE_AI_API_KEY,
        })
        break

      case 'mistral':
        model = new ChatMistralAI({
          model: modelId,
          temperature: options.temperature ?? 0.7,
          maxTokens: options.maxTokens ?? modelConfig.maxTokens,
          streaming: options.stream ?? false,
          apiKey: process.env.MISTRAL_API_KEY,
        })
        break

      case 'groq':
        model = new ChatGroq({
          model: modelId.includes('groq') ? modelId.replace('-groq', '') : modelId,
          temperature: options.temperature ?? 0.7,
          maxTokens: options.maxTokens ?? modelConfig.maxTokens,
          streaming: options.stream ?? false,
          apiKey: process.env.GROQ_API_KEY,
        })
        break

      case 'ollama':
        model = new ChatOllama({
          model: modelId,
          temperature: options.temperature ?? 0.7,
          numCtx: options.maxTokens ?? modelConfig.maxTokens,
          baseUrl: process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434',
        })
        break

      // For providers not directly supported by LangChain, we'll use OpenAI-compatible APIs
      case 'deepseek':
        model = new ChatOpenAI({
          modelName: modelId,
          temperature: options.temperature ?? 0.7,
          maxTokens: options.maxTokens ?? modelConfig.maxTokens,
          streaming: options.stream ?? false,
          openAIApiKey: process.env.DEEPSEEK_API_KEY,
          configuration: {
            baseURL: 'https://api.deepseek.com/v1',
          },
        })
        break

      case 'xai':
        model = new ChatOpenAI({
          modelName: modelId,
          temperature: options.temperature ?? 0.7,
          maxTokens: options.maxTokens ?? modelConfig.maxTokens,
          streaming: options.stream ?? false,
          openAIApiKey: process.env.XAI_API_KEY,
          configuration: {
            baseURL: 'https://api.x.ai/v1',
          },
        })
        break

      case 'qwen':
        model = new ChatOpenAI({
          modelName: modelId,
          temperature: options.temperature ?? 0.7,
          maxTokens: options.maxTokens ?? modelConfig.maxTokens,
          streaming: options.stream ?? false,
          openAIApiKey: process.env.QWEN_API_KEY,
          configuration: {
            baseURL: 'https://dashscope.aliyuncs.com/api/v1',
          },
        })
        break

      case 'meta':
        // Meta models are typically accessed through Ollama or other providers
        // For this example, we'll route to Ollama
        model = new ChatOllama({
          model: modelId.replace('llama-', 'llama:'),
          temperature: options.temperature ?? 0.7,
          numCtx: options.maxTokens ?? modelConfig.maxTokens,
          baseUrl: process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434',
        })
        break

      default:
        throw new Error(`Unsupported model provider: ${modelConfig.provider}`)
    }

    this.modelCache.set(cacheKey, model)
    return model
  }

  private convertMessagesToLangChain(messages: ChatMessage[]) {
    return messages.map(msg => {
      switch (msg.role) {
        case 'system':
          return new SystemMessage(msg.content)
        case 'user':
          return new HumanMessage(msg.content)
        case 'assistant':
          return new AIMessage(msg.content)
        default:
          throw new Error(`Unknown message role: ${msg.role}`)
      }
    })
  }

  async generateResponse(
    messages: ChatMessage[],
    options: ChatOptions
  ): Promise<string> {
    try {
      const model = this.getModelInstance(options.modelId, options)
      const langChainMessages = this.convertMessagesToLangChain(messages)

      // Add system prompt if provided
      if (options.systemPrompt) {
        langChainMessages.unshift(new SystemMessage(options.systemPrompt))
      }

      const response = await model.invoke(langChainMessages)
      return response.content
    } catch (error) {
      console.error(`Error generating response with model ${options.modelId}:`, error)
      throw error
    }
  }

  async generateStreamingResponse(
    messages: ChatMessage[],
    options: ChatOptions
  ): Promise<AsyncIterable<string>> {
    try {
      const model = this.getModelInstance(options.modelId, { ...options, stream: true })
      const langChainMessages = this.convertMessagesToLangChain(messages)

      // Add system prompt if provided
      if (options.systemPrompt) {
        langChainMessages.unshift(new SystemMessage(options.systemPrompt))
      }

      const stream = await model.stream(langChainMessages)
      
      // Transform the stream to yield string content
      async function* transformStream() {
        for await (const chunk of stream) {
          if (chunk.content) {
            yield chunk.content
          }
        }
      }
      
      return transformStream()
    } catch (error) {
      console.error(`Error generating streaming response with model ${options.modelId}:`, error)
      throw error
    }
  }

  async testModelAvailability(modelId: string): Promise<boolean> {
    try {
      const testMessages: ChatMessage[] = [
        { role: 'user', content: 'Hello, can you respond with just "OK"?' }
      ]

      const response = await this.generateResponse(testMessages, {
        modelId,
        maxTokens: 10,
        temperature: 0
      })

      return response.trim().toLowerCase().includes('ok')
    } catch (error) {
      console.error(`Model ${modelId} availability test failed:`, error)
      return false
    }
  }

  clearCache(): void {
    this.modelCache.clear()
  }

  getDefaultSystemPrompt(userContext?: any): string {
    const basePrompt = `You are R;, an AI assistant from REPL-ay, designed to help users with various tasks including coding, business strategy, marketing, and creative work.

Key characteristics:
- Be helpful, accurate, and concise
- Provide practical, actionable advice
- Use examples when helpful
- Maintain a professional but friendly tone
- Format responses clearly with proper structure`

    if (userContext) {
      return `${basePrompt}

User Context:
- Name: ${userContext.firstName || 'User'}
- Company: ${userContext.company || 'Not specified'}
- Role: ${userContext.jobTitle || 'Not specified'}
- Tier: ${userContext.tier || 'curious'}

Personalize your responses based on this context when relevant.`
    }

    return basePrompt
  }
}

export default AIModelService.getInstance()