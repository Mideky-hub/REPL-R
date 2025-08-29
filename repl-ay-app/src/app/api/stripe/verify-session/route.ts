import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import UserService from '@/lib/UserService'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
})

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer']
    })

    console.log('📋 Session retrieved:', {
      id: session.id,
      status: session.status,
      payment_status: session.payment_status,
      customer: session.customer,
      subscription: session.subscription,
      metadata: session.metadata
    })

    // Check if payment was successful
    const isSuccessful = session.payment_status === 'paid' && session.status === 'complete'

    if (isSuccessful) {
      // Get session metadata
      const userId = session.metadata?.userId
      const plan = session.metadata?.plan

      console.log('✅ Payment successful, immediately updating user:', { userId, plan })

      if (!userId || !plan) {
        console.error('❌ Missing userId or plan in session metadata')
        return NextResponse.json({
          success: false,
          error: 'Missing user information in payment session'
        }, { status: 400 })
      }

      // Immediately update user subscription in database
      try {
        console.log(`🔄 Immediately upgrading user ${userId} to ${plan} plan`)
        
        const updatedUser = await UserService.updateUserSubscription(userId, {
          plan: plan,
          status: 'active',
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: typeof session.subscription === 'string' ? session.subscription : session.subscription?.id || '',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Monthly subscription
        })

        if (updatedUser) {
          console.log(`🎉 SUCCESS: User ${userId} upgraded to ${updatedUser.tier} tier`)
          
          return NextResponse.json({
            success: true,
            session: {
              id: session.id,
              status: session.status,
              payment_status: session.payment_status,
              customer_email: session.customer_details?.email,
              amount_total: session.amount_total,
              currency: session.currency
            },
            subscription: {
              userId,
              plan,
              customer: session.customer,
              subscription_id: session.subscription
            },
            upgrade: {
              planPurchased: plan,
              expectedTier: updatedUser.tier,
              actualTier: updatedUser.tier,
              subscriptionStatus: updatedUser.subscriptionStatus,
              upgradeSuccessful: true
            },
            user: {
              id: updatedUser.id,
              email: updatedUser.email,
              tier: updatedUser.tier,
              subscriptionStatus: updatedUser.subscriptionStatus,
              stripeCustomerId: updatedUser.stripeCustomerId
            }
          })
        } else {
          console.error(`❌ Failed to find/update user ${userId}`)
          return NextResponse.json({
            success: false,
            error: 'User not found or update failed'
          }, { status: 500 })
        }

      } catch (dbError) {
        console.error('💥 Database error during immediate user upgrade:', dbError)
        
        // Still return session info but indicate upgrade failed
        return NextResponse.json({
          success: true,
          session: {
            id: session.id,
            status: session.status,
            payment_status: session.payment_status,
            customer_email: session.customer_details?.email,
            amount_total: session.amount_total,
            currency: session.currency
          },
          subscription: {
            userId,
            plan,
            customer: session.customer,
            subscription_id: session.subscription
          },
          upgrade: {
            planPurchased: plan,
            expectedTier: plan === 'founder' ? 'founder' : 
                         plan === 'developer' ? 'developer' : 
                         plan === 'essential' ? 'essential' : 'free',
            upgradeSuccessful: false,
            upgradeError: dbError instanceof Error ? dbError.message : 'Unknown database error'
          }
        })
      }
    } else {
      console.log('⏳ Payment not yet completed:', {
        status: session.status,
        payment_status: session.payment_status
      })
      
      return NextResponse.json({
        success: false,
        message: 'Payment not completed yet',
        session: {
          id: session.id,
          status: session.status,
          payment_status: session.payment_status
        }
      })
    }

  } catch (error) {
    console.error('Session verification error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to verify session',
        details: process.env.NODE_ENV === 'development' ? (error as Error)?.message : undefined
      }, 
      { status: 500 }
    )
  }
}