// Quick Stripe Test Script
// Copy and paste this into your browser console at https://localhost:3000

async function testStripeSetup() {
  console.log('🧪 Testing Stripe Integration...\n')
  
  try {
    // Test 1: Check if Stripe.js loads
    console.log('1️⃣ Testing Stripe.js loading...')
    const stripeScript = document.querySelector('script[src*="stripe"]')
    console.log('Stripe script found:', stripeScript ? '✅' : '❌')
    
    // Test 2: Check environment variables (client-side only)
    console.log('\n2️⃣ Checking client-side config...')
    console.log('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:', window.location.hostname)
    
    // Test 3: Test debug API
    console.log('\n3️⃣ Testing debug API...')
    const debugResponse = await fetch('/api/stripe/debug')
    const debugData = await debugResponse.json()
    console.log('Debug API response:', debugData)
    
    // Test 4: Test checkout API
    console.log('\n4️⃣ Testing checkout API...')
    const checkoutResponse = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan: 'essential',
        userId: 'test-user-123',
        userEmail: 'test@example.com'
      })
    })
    
    if (checkoutResponse.ok) {
      const checkoutData = await checkoutResponse.json()
      console.log('✅ Checkout API works:', checkoutData)
      
      // Test 5: Test Stripe redirect (simulation)
      if (checkoutData.sessionId) {
        console.log('✅ Session ID received:', checkoutData.sessionId)
        console.log('✅ Stripe checkout would redirect to:', checkoutData.url)
      }
    } else {
      const errorText = await checkoutResponse.text()
      console.error('❌ Checkout API failed:', checkoutResponse.status, errorText)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Auto-run the test
testStripeSetup()

console.log('🔍 Stripe Test Complete! Check the logs above for results.')
console.log('🌐 If everything looks good but buttons still don\'t work, check:')
console.log('   1. Are you signed in?')
console.log('   2. Does the PricingPage component have userId and userEmail?')
console.log('   3. Are there any console errors when clicking buttons?')