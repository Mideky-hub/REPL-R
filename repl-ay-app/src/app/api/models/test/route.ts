import { NextRequest, NextResponse } from 'next/server'
import AIModelService from '@/lib/AIModelService'
import { getModelById } from '@/lib/aiModels'

export async function POST(request: NextRequest) {
  try {
    const { modelId } = await request.json()
    
    if (!modelId) {
      return NextResponse.json(
        { error: 'Model ID is required' }, 
        { status: 400 }
      )
    }

    const model = getModelById(modelId)
    if (!model) {
      return NextResponse.json(
        { error: 'Model not found' }, 
        { status: 404 }
      )
    }

    // Test model availability
    const available = await AIModelService.testModelAvailability(modelId)

    return NextResponse.json({
      modelId,
      available,
      model: {
        name: model.name,
        provider: model.provider,
        requiresApiKey: model.requiresApiKey,
        isLocal: model.isLocal
      }
    })

  } catch (error) {
    console.error('Model test error:', error)
    return NextResponse.json(
      { error: 'Failed to test model availability' }, 
      { status: 500 }
    )
  }
}