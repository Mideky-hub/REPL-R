# Stripe Test Configuration Issues & Solutions

## ❌ Current Issues in .env.local:

1. **FAKE WEBHOOK SECRET**: 
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your-stripe-webhook-secret
   ```
   This is a placeholder, not a real webhook secret!

2. **APP URL MISMATCH**: 
   ```
   NEXT_PUBLIC_APP_URL=https://localhost:3000
   ```
   You're probably running on http://localhost:3000

3. **MISSING WEBHOOK FORWARDING**: 
   Stripe can't reach localhost webhooks without forwarding

## ✅ Solutions:

### Option 1: Use Stripe CLI (Recommended)
1. **Install Stripe CLI**:
   ```powershell
   # Using Scoop (if you have it)
   scoop install stripe
   
   # Or download from: https://github.com/stripe/stripe-cli/releases
   ```

2. **Login to Stripe**:
   ```bash
   stripe login
   ```

3. **Forward webhooks** (run this in a separate terminal):
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   
4. **Copy the webhook secret** from the CLI output (starts with `whsec_...`)

5. **Update .env.local**:
   ```bash
   # Replace with the actual webhook secret from stripe listen command
   STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef...
   
   # Fix app URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### Option 2: Use ngrok
1. **Install ngrok**: https://ngrok.com/download
2. **Expose localhost**: `ngrok http 3000`
3. **Update webhook URL** in Stripe Dashboard to ngrok URL
4. **Get webhook secret** from Stripe Dashboard

## 🧪 Test Your Setup:

1. **Start your app**: `npm run dev`
2. **Start webhook forwarding**: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
3. **Test a payment** - you should see webhook events in the CLI
4. **Use test card**: `4242 4242 4242 4242` with any future date and CVC

## 📋 Test Cards for Stripe:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002  
- **Require Auth**: 4000 0027 6000 3184
- **Insufficient Funds**: 4000 0000 0000 9995

## 🔍 Debug Checklist:
- [x] Stripe CLI installed and logged in
- [x] Webhook forwarding active (stripe listen running)
- [x] Real webhook secret in .env.local
- [x] Test keys are correct (pk_test_... and sk_test_...)