#!/bin/bash
# Stripe Test Setup Script
# Run this to configure Stripe for local development

echo "🚀 Setting up Stripe Test Environment..."

# Check if Stripe CLI is installed
if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI not found. Please install it first:"
    echo "   Windows: https://github.com/stripe/stripe-cli/releases"
    echo "   Or use: scoop install stripe"
    exit 1
fi

echo "✅ Stripe CLI found"

# Login to Stripe (if not already)
echo "🔐 Logging into Stripe..."
stripe login

# Forward webhooks to local development server
echo "🔗 Setting up webhook forwarding..."
echo "Starting webhook forwarding. Keep this terminal open!"
echo "Your webhook endpoint will be: http://localhost:3000/api/stripe/webhook"

# This will output the webhook signing secret you need
stripe listen --forward-to localhost:3000/api/stripe/webhook