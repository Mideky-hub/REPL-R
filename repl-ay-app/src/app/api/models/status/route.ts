import { NextRequest, NextResponse } from 'next/server'
import ModelManager from '@/lib/ModelManager'
import { AI_MODELS } from '@/lib/aiModels'

export async function GET(request: NextRequest) {
  try {
    const statuses = ModelManager.getAllModelStatuses()
    
    // Add model info to the status response
    const modelStatuses = AI_MODELS.map(model => ({
      id: model.id,
      name: model.name,
      provider: model.provider,
      category: model.category,
      requiresApiKey: model.requiresApiKey,
      isLocal: model.isLocal,
      ...statuses[model.id]
    }))

    return NextResponse.json({
      models: modelStatuses,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Model status check failed:', error)
    return NextResponse.json(
      { error: 'Failed to check model statuses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    if (action === 'clear-failures') {
      ModelManager.clearAllFailures()
      return NextResponse.json({ success: true, message: 'All model failures cleared' })
    }
    
    return NextResponse.json(
      { error: 'Unknown action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Model status action failed:', error)
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    )
  }
}