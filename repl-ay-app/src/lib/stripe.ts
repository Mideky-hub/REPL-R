import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export { stripePromise }

export interface PricingPlan {
  id: string
  name: string
  price: number
  interval: 'month' | 'year'
  description: string
  features: string[]
  popular?: boolean
  buttonText: string
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Curious',
    price: 0,
    interval: 'month',
    description: 'Perfect for trying out AI assistance',
    features: [
      '5 messages per day',
      'Access to basic models (GPT-3.5)',
      'Standard response time',
      'Community support'
    ],
    buttonText: 'Get Started Free'
  },
  {
    id: 'essential',
    name: 'Essential Pack',
    price: 8,
    interval: 'month',
    description: 'Unlimited Prompt Studio access',
    features: [
      'Unlimited Prompt Studio access',
      'Prompt analysis & optimization',
      'Save prompt templates',
      'Basic usage analytics',
      '1,000 messages per day'
    ],
    buttonText: 'Choose Essential'
  },
  {
    id: 'developer',
    name: 'Developer Pack',
    price: 29,
    interval: 'month',
    description: 'Full Agent Crew Studio access',
    features: [
      'Everything in Essential Pack',
      'Full Agent Crew Studio access',
      'Up to 3 agent crews',
      '500 workflow executions/day',
      'Real-time monitoring',
      'Export workflows'
    ],
    popular: true,
    buttonText: 'Choose Developer'
  },
  {
    id: 'founder',
    name: 'Founder Pack',
    price: 39,
    interval: 'month',
    description: 'Advanced analytics and priority support',
    features: [
      'Everything in Developer Pack',
      'Up to 10 agent crews',
      '2,000 workflow executions/day',
      'Cost Control Panel',
      'Advanced analytics',
      'Priority support'
    ],
    buttonText: 'Choose Founder'
  }
]

export async function createCheckoutSession(planId: string, userId: string, userEmail: string) {
  try {
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan: planId,
        userId,
        userEmail,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create checkout session')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

export async function redirectToCheckout(sessionId: string) {
  const stripe = await stripePromise
  if (!stripe) throw new Error('Stripe failed to load')

  const { error } = await stripe.redirectToCheckout({ sessionId })
  if (error) {
    throw error
  }
}

export function formatPrice(price: number, interval: 'month' | 'year' = 'month') {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: price % 1 === 0 ? 0 : 2,
  })
  
  const formattedPrice = formatter.format(price)
  return interval === 'year' ? `${formattedPrice}/year` : `${formattedPrice}/mo`
}