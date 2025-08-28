import { NextRequest, NextResponse } from 'next/server';
import UserService from '@/lib/UserService';
import ModelManager from '@/lib/ModelManager';
import { DEFAULT_MODEL } from '@/lib/aiModels';

export async function POST(request: NextRequest) {
  try {
    // Get user ID from middleware (user should be authenticated for chat)
    const userId = request.headers.get('X-User-ID');
    const userEmail = request.headers.get('X-User-Email');
    
    const { message, conversationId, mode, modelId, messages: chatHistory, stream = false } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' }, 
        { status: 400 }
      );
    }

    // Use provided model or default
    const selectedModel = modelId || DEFAULT_MODEL;

    // If user is authenticated, we can access their profile for personalization
    let userContext = null;
    if (userId) {
      try {
        const user = await UserService.findById(userId);
        if (user) {
          userContext = {
            firstName: user.firstName,
            company: user.company,
            jobTitle: user.jobTitle,
            tier: user.tier
          };
        }
      } catch (error) {
        console.error('Failed to fetch user context:', error);
      }
    }

    // Prepare messages for AI model
    const messages = [
      ...(chatHistory || []),
      { role: 'user', content: message }
    ] as Array<{ role: 'system' | 'user' | 'assistant', content: string }>;

    // Generate system prompt based on user context and mode
    const systemPrompt = generateSystemPrompt(userContext, mode);

    try {
      // Generate AI response using ModelManager for automatic fallback handling
      const result = await ModelManager.generateResponseWithFallback(messages, {
        originalModelId: selectedModel,
        userContext,
        systemPrompt,
        maxRetries: 3
      });

      // Log conversation for analytics (only if user is authenticated)
      if (userId) {
        try {
          await logConversation(userId, message, result.response, conversationId, result.modelUsed);
        } catch (error) {
          console.error('Failed to log conversation:', error);
          // Don't fail the response if logging fails
        }
      }

      return NextResponse.json({
        message: result.response,
        conversationId: conversationId || generateConversationId(),
        timestamp: new Date().toISOString(),
        mode,
        modelId: result.modelUsed,
        fallbackUsed: result.fallbackUsed,
        originalModel: selectedModel !== result.modelUsed ? selectedModel : undefined
      });

    } catch (modelError) {
      console.error(`All models failed:`, modelError);
      
      // Return user-friendly error with fallback suggestion
      return NextResponse.json(
        { 
          error: 'I\'m experiencing technical difficulties with the AI models right now. Please try again in a few moments or contact support if the issue persists.',
          details: process.env.NODE_ENV === 'development' ? (modelError as Error)?.message : undefined,
          modelId: selectedModel,
          allModelsFailed: true
        }, 
        { status: 503 } // Service Unavailable
      );
    }

  } catch (error) {
    console.error('Chat API error:', error);
    
    // Return a more user-friendly error message
    return NextResponse.json(
      { 
        error: 'I encountered an issue processing your message. Please try again or select a different model.',
        details: process.env.NODE_ENV === 'development' ? (error as Error)?.message : undefined
      }, 
      { status: 500 }
    );
  }
}

function generateSystemPrompt(userContext: any, mode: string): string {
  let basePrompt = `You are R;, an AI assistant from REPL-ay, designed to help users with various tasks including coding, business strategy, marketing, and creative work.

Key characteristics:
- Be helpful, accurate, and concise
- Provide practical, actionable advice
- Use examples when helpful
- Maintain a professional but friendly tone
- Format responses clearly with proper structure`;

  // Add mode-specific instructions
  switch (mode) {
    case 'creative':
      basePrompt += `\n\nCREATIVE MODE: Be more creative and innovative in your responses. Think outside the box and provide original ideas.`;
      break;
    case 'precise':
      basePrompt += `\n\nPRECISE MODE: Be extremely accurate and concise. Focus on facts and avoid speculation.`;
      break;
    case 'deep':
      basePrompt += `\n\nDEEP RESEARCH MODE: Provide comprehensive, detailed analysis with multiple perspectives and thorough explanations.`;
      break;
    case 'parallel':
      basePrompt += `\n\nPARALLEL MODE: This is part of a parallel research session. Provide unique insights that complement other analyses.`;
      break;
  }

  // Add user context if available
  if (userContext) {
    basePrompt += `\n\nUser Context:
- Name: ${userContext.firstName || 'User'}
- Company: ${userContext.company || 'Not specified'}
- Role: ${userContext.jobTitle || 'Not specified'}
- Tier: ${userContext.tier || 'curious'}

Personalize your responses based on this context when relevant.`;
  }

  return basePrompt;
}

async function logConversation(userId: string, userMessage: string, aiResponse: string, conversationId?: string, modelId?: string) {
  // This would log the conversation to your database
  // For now, we'll just console.log for development
  console.log('Conversation logged:', {
    userId,
    conversationId,
    modelId,
    userMessage: userMessage.substring(0, 100) + (userMessage.length > 100 ? '...' : ''),
    aiResponseLength: aiResponse.length,
    timestamp: new Date().toISOString()
  });
  
  // In a real implementation, you would:
  // await UserService.logConversation({ userId, userMessage, aiResponse, conversationId, modelId });
}

function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}