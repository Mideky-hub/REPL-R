import { NextRequest, NextResponse } from 'next/server'import { NextRequest, NextResponse } from 'next/server'

import Stripe from 'stripe'import Stripe from 'stripe'

import UserService from '@/lib/UserService'import UserService from '@/lib/UserService'extRequest, NextResponse } from 'next/server'

import Stripe           await UserService.updateUserSubscription(userId, {

if (!process.env.STRIPE_SECRET_KEY) {            plan: plan,

  throw new Error('STRIPE_SECRET_KEY is not set')            status: 'active',

}            stripeCustomerId: session.customer as string,

            stripeSubscriptionId: typeof session.subscription === 'string' ? session.subscription : session.subscription?.id || '',

if (!process.env.STRIPE_WEBHOOK_SECRET) {            currentPeriodStart: new Date(),

  throw new Error('STRIPE_WEBHOOK_SECRET is not set')            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // All current plans are monthly

}          })ripe'

import UserService from '@/lib/UserService'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {

  apiVersion: '2025-08-27.basil',if (!process.env.STRIPE_SECRET_KEY) {

})  throw new Error('STRIPE_SECRET_KEY is not set')

}

export async function POST(request: NextRequest) {

  const body = await request.text()if (!process.env.STRIPE_WEBHOOK_SECRET) {

  const signature = request.headers.get('stripe-signature')  throw new Error('STRIPE_WEBHOOK_SECRET is not set')

}

  if (!signature) {

    console.error('No Stripe signature found')const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {

    return NextResponse.json({ error: 'No signature' }, { status: 400 })  apiVersion: '2025-08-27.basil',

  }})



  let event: Stripe.Eventexport async function POST(request: NextRequest) {

  const body = await request.text()

  try {  const signature = request.headers.get('stripe-signature')

    event = stripe.webhooks.constructEvent(

      body,  if (!signature) {

      signature,    console.error('No Stripe signature found')

      process.env.STRIPE_WEBHOOK_SECRET!    return NextResponse.json({ error: 'No signature' }, { status: 400 })

    )  }

  } catch (error) {

    console.error('Webhook signature verification failed:', error)  let event: Stripe.Event

    return NextResponse.json(

      { error: 'Webhook signature verification failed' },  try {

      { status: 400 }    event = stripe.webhooks.constructEvent(

    )      body,

  }      signature,

      process.env.STRIPE_WEBHOOK_SECRET!

  try {    )

    switch (event.type) {  } catch (error) {

      case 'checkout.session.completed': {    console.error('Webhook signature verification failed:', error)

        const session = event.data.object as Stripe.Checkout.Session    return NextResponse.json(

        const userId = session.metadata?.userId      { error: 'Webhook signature verification failed' },

        const plan = session.metadata?.plan      { status: 400 }

    )

        console.log('🎯 Checkout session completed:', {  }

          sessionId: session.id,

          userId,  try {

          plan,    switch (event.type) {

          customer: session.customer,      case 'checkout.session.completed': {

          subscription: session.subscription,        const session = event.data.object as Stripe.Checkout.Session

          paymentStatus: session.payment_status,        const userId = session.metadata?.userId

          mode: session.mode        const plan = session.metadata?.plan

        })

        console.log('🎯 Checkout session completed:', {

        if (!userId || !plan) {          sessionId: session.id,

          console.error('❌ Missing metadata in checkout session:', {           userId,

            userId,           plan,

            plan,          customer: session.customer,

            allMetadata: session.metadata           subscription: session.subscription,

          })          paymentStatus: session.payment_status,

          break          mode: session.mode

        }        })



        // Update user's subscription status        if (!userId || !plan) {

        try {          console.error('❌ Missing metadata in checkout session:', { 

          console.log(`🔄 Updating subscription for user ${userId} with plan ${plan}`)            userId, 

                      plan,

          const updatedUser = await UserService.updateUserSubscription(userId, {            allMetadata: session.metadata 

            plan: plan,          })

            status: 'active',          break

            stripeCustomerId: session.customer as string,        }

            stripeSubscriptionId: typeof session.subscription === 'string' ? session.subscription : session.subscription?.id || '',

            currentPeriodStart: new Date(),        // Update user's subscription status

            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // All current plans are monthly        try {

          })          console.log(`🔄 Updating subscription for user ${userId} with plan ${plan}`)

          

          if (updatedUser) {          const updatedUser = await UserService.updateUserSubscription(userId, {

            console.log(`✅ Successfully upgraded user ${userId} to ${updatedUser.tier} tier`)            plan: plan,

            console.log(`📊 User subscription details:`, {            status: 'active',

              userId: updatedUser.id,            stripeCustomerId: session.customer as string,

              email: updatedUser.email,            stripeSubscriptionId: session.subscription as string,

              tier: updatedUser.tier,            currentPeriodStart: new Date(),

              subscriptionStatus: updatedUser.subscriptionStatus,            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // All current plans are monthly

              stripeCustomerId: updatedUser.stripeCustomerId,          })

              subscriptionExpiresAt: updatedUser.subscriptionExpiresAt

            })          if (updatedUser) {

          } else {            console.log(`✅ Successfully upgraded user ${userId} to ${updatedUser.tier} tier`)

            console.error(`❌ Failed to find user ${userId} after subscription update`)            console.log(`📊 User subscription details:`, {

          }              userId: updatedUser.id,

              email: updatedUser.email,

        } catch (dbError) {              tier: updatedUser.tier,

          console.error('💥 Database error while updating user subscription:', dbError)              subscriptionStatus: updatedUser.subscriptionStatus,

                        stripeCustomerId: updatedUser.stripeCustomerId,

          // Log additional context for debugging              subscriptionExpiresAt: updatedUser.subscriptionExpiresAt

          console.error('🔍 Debug context:', {            })

            userId,          } else {

            plan,            console.error(`❌ Failed to find user ${userId} after subscription update`)

            sessionId: session.id,          }

            error: dbError instanceof Error ? dbError.message : 'Unknown error'

          })        } catch (dbError) {

        }          console.error('💥 Database error while updating user subscription:', dbError)

          

        break          // Log additional context for debugging

      }          console.error('🔍 Debug context:', {

            userId,

      case 'customer.subscription.updated': {            plan,

        const subscription = event.data.object as Stripe.Subscription            sessionId: session.id,

        const userId = subscription.metadata?.userId            error: dbError instanceof Error ? dbError.message : 'Unknown error'

          })

        if (!userId) {        }

          console.error('No userId in subscription metadata')

          break        break

        }      }



        console.log(`Subscription updated for user ${userId}`)      case 'customer.subscription.updated': {

        const subscription = event.data.object as Stripe.Subscription

        try {        const userId = subscription.metadata?.userId

          await UserService.updateUserSubscription(userId, {

            status: subscription.status === 'active' ? 'active' : 'cancelled',        if (!userId) {

          })          console.error('No userId in subscription metadata')

        } catch (dbError) {          break

          console.error('Failed to update subscription:', dbError)        }

        }

        console.log(`Subscription updated for user ${userId}`)

        break

      }        try {

          await UserService.updateUserSubscription(userId, {

      case 'customer.subscription.deleted': {            status: subscription.status === 'active' ? 'active' : 'cancelled',

        const subscription = event.data.object as Stripe.Subscription            // Note: We'll update periods in a future iteration when Stripe types are clearer

        const userId = subscription.metadata?.userId          })

        } catch (dbError) {

        if (!userId) {          console.error('Failed to update subscription:', dbError)

          console.error('No userId in subscription metadata')        }

          break

        }        break

      }

        console.log(`Subscription canceled for user ${userId}`)

      case 'customer.subscription.deleted': {

        try {        const subscription = event.data.object as Stripe.Subscription

          await UserService.updateUserSubscription(userId, {        const userId = subscription.metadata?.userId

            status: 'cancelled',

          })        if (!userId) {

        } catch (dbError) {          console.error('No userId in subscription metadata')

          console.error('Failed to cancel subscription:', dbError)          break

        }        }



        break        console.log(`Subscription canceled for user ${userId}`)

      }

        try {

      case 'invoice.payment_failed': {          await UserService.updateUserSubscription(userId, {

        const invoice = event.data.object as Stripe.Invoice            status: 'cancelled',

        console.log('Payment failed event received')          })

        break        } catch (dbError) {

      }          console.error('Failed to cancel subscription:', dbError)

        }

      default:

        console.log(`Unhandled event type: ${event.type}`)        break

    }      }



    return NextResponse.json({ received: true })      case 'invoice.payment_failed': {

        const invoice = event.data.object as Stripe.Invoice

  } catch (error) {        // For now, we'll skip this complex case

    console.error('Webhook processing error:', error)        console.log('Payment failed event received')

    return NextResponse.json(        break

      { error: 'Webhook processing failed' },      }

      { status: 500 }

    )      default:

  }        console.log(`Unhandled event type: ${event.type}`)

}    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
