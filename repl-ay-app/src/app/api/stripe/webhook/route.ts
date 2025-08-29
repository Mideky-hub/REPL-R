import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import UserService from '@/lib/UserService'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error('STRIPE_WEBHOOK_SECRET is not set')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
})

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    console.error('No Stripe signature found')
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const plan = session.metadata?.plan

        console.log('🎯 Checkout session completed:', {
          sessionId: session.id,
          userId,
          plan,
          customer: session.customer,
          subscription: session.subscription,
          paymentStatus: session.payment_status,
          mode: session.mode
        })

        if (!userId || !plan) {
          console.error('❌ Missing metadata in checkout session:', { 
            userId, 
            plan,
            allMetadata: session.metadata 
          })
          break
        }

        // Update user's subscription status
        try {
          console.log(`🔄 Updating subscription for user ${userId} with plan ${plan}`)
          
          const updatedUser = await UserService.updateUserSubscription(userId, {
            plan: plan,
            status: 'active',
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: typeof session.subscription === 'string' ? session.subscription : session.subscription?.id || '',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // All current plans are monthly
          })
          
          if (updatedUser) {
            console.log(`✅ Successfully upgraded user ${userId} to ${updatedUser.tier} tier`)
            console.log(`📊 User subscription details:`, {
              userId: updatedUser.id,
              email: updatedUser.email,
              tier: updatedUser.tier,
              subscriptionStatus: updatedUser.subscriptionStatus,
              stripeCustomerId: updatedUser.stripeCustomerId,
              subscriptionExpiresAt: updatedUser.subscriptionExpiresAt
            })
          } else {
            console.error(`❌ Failed to find user ${userId} after subscription update`)
          }

        } catch (dbError) {
          console.error('💥 Database error while updating user subscription:', dbError)
          
          // Log additional context for debugging
          console.error('🔍 Debug context:', {
            userId,
            plan,
            sessionId: session.id,
            error: dbError instanceof Error ? dbError.message : 'Unknown error'
          })
        }
        
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.userId

        if (!userId) {
          console.error('No userId in subscription metadata')
          break
        }

        console.log(`Subscription updated for user ${userId}`)

        try {
          await UserService.updateUserSubscription(userId, {
            status: subscription.status === 'active' ? 'active' : 'cancelled',
          })
        } catch (dbError) {
          console.error('Failed to update subscription:', dbError)
        }

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.userId

        if (!userId) {
          console.error('No userId in subscription metadata')
          break
        }

        console.log(`Subscription canceled for user ${userId}`)

        try {
          await UserService.updateUserSubscription(userId, {
            status: 'cancelled',
          })
        } catch (dbError) {
          console.error('Failed to cancel subscription:', dbError)
        }

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('Payment failed event received')
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
