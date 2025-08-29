#!/bin/bash
# Docker + Stripe Webhook Setup for Windows/PowerShell
# This sets up Stripe webhook forwarding for Docker environments

echo "🐳 Setting up Stripe for Docker + HTTPS"
echo ""

# Option 1: Use host networking (if supported)
echo "Option 1: Host Network Method"
echo "-------------------------"
echo "If you're using Docker Desktop, add this to docker-compose.yml:"
echo ""
echo "  app:"
echo "    network_mode: \"host\"  # Add this line"
echo "    # ... rest of config"
echo ""
echo "Then run: stripe listen --forward-to https://localhost:3000/api/stripe/webhook"
echo ""

# Option 2: Use ngrok
echo "Option 2: ngrok Method (Recommended)"
echo "-----------------------------------"
echo "1. Install ngrok: https://ngrok.com/download"
echo "2. Run: ngrok http https://localhost:3000"
echo "3. Copy the https://xxxxx.ngrok.io URL"
echo "4. In Stripe Dashboard > Webhooks, add endpoint:"
echo "   https://xxxxx.ngrok.io/api/stripe/webhook"
echo "5. Copy the webhook secret from Stripe Dashboard"
echo "6. Update your .env files with the real webhook secret"
echo ""

# Option 3: Disable webhooks for testing
echo "Option 3: Quick Test Without Webhooks"
echo "------------------------------------"
echo "For immediate testing, you can comment out webhook validation:"
echo "In /api/stripe/webhook/route.ts, temporarily add return at the top:"
echo "export async function POST() { return NextResponse.json({ ok: true }) }"
echo ""

echo "🔧 Current Issues to Fix:"
echo "1. Make sure userId and userEmail are passed to PricingPage"
echo "2. Check browser console for JavaScript errors"
echo "3. Verify user is signed in before trying to checkout"
echo ""

echo "🧪 Test Steps:"
echo "1. Open https://localhost:3000 in browser"
echo "2. Sign in to your account"
echo "3. Go to pricing page"
echo "4. Open browser console (F12)"
echo "5. Click a pricing plan button"
echo "6. Check console for errors"