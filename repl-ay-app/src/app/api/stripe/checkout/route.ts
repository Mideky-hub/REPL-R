import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
})

export async function POST(request: NextRequest) {
  try {
    const { plan, userId, userEmail } = await request.json()

    if (!plan || !userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: plan, userId, userEmail' },
        { status: 400 }
      )
    }

    // Define pricing plans
    const plans = {
      essential: {
        price: 800, // €8.00 in cents
        name: 'Essential Pack',
        description: 'Unlimited Prompt Studio access',
        interval: 'month',
        features: [
          'Unlimited Prompt Studio access',
          'Prompt analysis & optimization',
          'Save prompt templates',
          'Basic usage analytics',
          '1,000 messages per day'
        ]
      },
      developer: {
        price: 2900, // €29.00 in cents
        name: 'Developer Pack',
        description: 'Full Agent Crew Studio access',
        interval: 'month',
        features: [
          'Everything in Essential Pack',
          'Full Agent Crew Studio access',
          'Up to 3 agent crews',
          '500 workflow executions/day',
          'Real-time monitoring',
          'Export workflows'
        ]
      },
      founder: {
        price: 3900, // €39.00 in cents
        name: 'Founder Pack',
        description: 'Advanced analytics and priority support',
        interval: 'month',
        features: [
          'Everything in Developer Pack',
          'Up to 10 agent crews',
          '2,000 workflow executions/day',
          'Cost Control Panel',
          'Advanced analytics',
          'Priority support'
        ]
      }
    }

    const selectedPlan = plans[plan as keyof typeof plans]
    if (!selectedPlan) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      )
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: selectedPlan.name,
              description: selectedPlan.description,
              metadata: {
                plan: plan,
                features: JSON.stringify(selectedPlan.features)
              }
            },
            unit_amount: selectedPlan.price,
            recurring: {
              interval: selectedPlan.interval as 'month' | 'year'
            }
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      customer_email: userEmail,
      metadata: {
        userId: userId,
        plan: plan
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      subscription_data: {
        metadata: {
          userId: userId,
          plan: plan
        }
      }
    })

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    })

  } catch (error) {
    console.error('Stripe checkout error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: process.env.NODE_ENV === 'development' ? (error as Error)?.message : undefined
      }, 
      { status: 500 }
    )
  }
}