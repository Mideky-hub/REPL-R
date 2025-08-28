import { NextRequest, NextResponse } from 'next/server'
import UserService from '@/lib/UserService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'config'
    
    if (action === 'user') {
      const userId = searchParams.get('userId')
      const email = searchParams.get('email')

      if (!userId && !email) {
        return NextResponse.json(
          { error: 'Please provide either userId or email parameter for user debug' },
          { status: 400 }
        )
      }

      let user = null
      if (userId) {
        user = await UserService.findById(userId)
      } else if (email) {
        user = await UserService.findByEmail(email)
      }

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      // Get subscription verification
      const subscriptionInfo = await UserService.verifySubscription(user.id)

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          tier: user.tier,
          subscriptionStatus: user.subscriptionStatus,
          stripeCustomerId: user.stripeCustomerId,
          subscriptionExpiresAt: user.subscriptionExpiresAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        subscriptionVerification: subscriptionInfo,
        debug: {
          isSubscriptionActive: subscriptionInfo.isActive,
          currentTier: subscriptionInfo.tier,
          hasStripeCustomerId: !!user.stripeCustomerId,
          subscriptionExpired: user.subscriptionExpiresAt ? user.subscriptionExpiresAt < new Date() : null
        }
      })
    }

    // Default: show Stripe configuration
    console.log('🔍 Debugging Stripe Configuration...')
    
    const config = {
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? '✅ Present' : '❌ Missing',
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? '✅ Present' : '❌ Missing', 
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ? '✅ Present' : '❌ Missing',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NODE_ENV: process.env.NODE_ENV,
      // Only show first 6 characters of keys for security
      publishableKeyPreview: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 12) + '...',
      secretKeyPreview: process.env.STRIPE_SECRET_KEY?.substring(0, 12) + '...',
      webhookSecretPreview: process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 12) + '...'
    }
    
    console.log('Environment config:', config)
    
    return NextResponse.json({
      message: 'Stripe Debug Info - Use ?action=user&email=user@example.com to debug a specific user',
      config,
      timestamp: new Date().toISOString(),
      availableActions: [
        'GET /api/stripe/debug - Show Stripe config',
        'GET /api/stripe/debug?action=user&email=user@email.com - Debug specific user',
        'GET /api/stripe/debug?action=user&userId=uuid - Debug specific user by ID'
      ]
    })

  } catch (error) {
    console.error('Debug endpoint error:', error)
    
    return NextResponse.json(
      { 
        error: 'Debug query failed',
        details: process.env.NODE_ENV === 'development' ? (error as Error)?.message : undefined
      }, 
      { status: 500 }
    )
  }
}