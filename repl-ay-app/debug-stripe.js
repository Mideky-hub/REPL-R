// Debug Stripe Configuration
// Add this to your pages or run in browser console

export async function debugStripeConfig() {
  console.log('🔍 Debugging Stripe Configuration...\n')
  
  // Check environment variables
  console.log('📝 Environment Variables:')
  console.log('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? '✅ Present' : '❌ Missing')
  console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? '✅ Present' : '❌ Missing')
  console.log('STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET ? '✅ Present' : '❌ Missing')
  console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL)
  
  // Test Stripe initialization
  try {
    const { loadStripe } = await import('@stripe/stripe-js')
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')
    console.log('\n💳 Stripe.js:', stripe ? '✅ Loaded successfully' : '❌ Failed to load')
  } catch (error) {
    console.error('❌ Stripe.js error:', error)
  }
  
  // Test API route
  try {
    console.log('\n🔗 Testing API routes...')
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan: 'essential',
        userId: 'test-user',
        userEmail: 'test@example.com'
      })
    })
    
    if (response.ok) {
      console.log('✅ Checkout API: Working')
    } else {
      const error = await response.text()
      console.log('❌ Checkout API Error:', response.status, error)
    }
  } catch (error) {
    console.error('❌ API Error:', error)
  }
}

// Run in browser console or component
if (typeof window !== 'undefined') {
  (window).debugStripe = debugStripeConfig
  console.log('🚀 Run debugStripe() in console to test Stripe setup')
}