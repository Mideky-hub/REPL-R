'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Check, 
  Star, 
  Zap, 
  Crown, 
  Loader2,
  CreditCard,
  Shield,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PRICING_PLANS, createCheckoutSession, redirectToCheckout, formatPrice, type PricingPlan } from '@/lib/stripe'

interface PricingModalProps {
  isOpen: boolean
  onClose: () => void
  currentTier?: string
  userId?: string
  userEmail?: string
  targetFeature?: string // Feature that triggered the upgrade modal
  onSelectTier?: (tier: string) => void // Keep for backward compatibility
}

const PLAN_ICONS = {
  free: Sparkles,
  essential: Star,
  developer: Zap,
  founder: Crown
}

const PLAN_COLORS = {
  free: 'from-blue-500 to-cyan-500',
  essential: 'from-yellow-400 to-orange-500',
  developer: 'from-purple-500 to-pink-500',
  founder: 'from-emerald-500 to-teal-500'
}

export function PricingModal({ 
  isOpen, 
  onClose, 
  currentTier = 'curious', 
  userId, 
  userEmail,
  targetFeature,
  onSelectTier // Backward compatibility
}: PricingModalProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleUpgrade = async (plan: PricingPlan) => {
    if (!userId || !userEmail) {
      setError('Please sign in to upgrade your account')
      return
    }

    if (plan.id === 'free') {
      // Free plan - use legacy callback if available
      onSelectTier?.('free')
      onClose()
      return
    }

    setLoading(plan.id)
    setError(null)

    try {
      const session = await createCheckoutSession(plan.id, userId, userEmail)
      await redirectToCheckout(session.sessionId)
    } catch (err) {
      console.error('Upgrade error:', err)
      setError('Failed to start upgrade process. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  const isCurrentPlan = (planId: string) => {
    if (planId === 'free' && currentTier === 'curious') return true
    if (planId === 'essential' && currentTier === 'essential') return true
    if (planId === 'developer' && currentTier === 'developer') return true
    if (planId === 'founder' && currentTier === 'founder') return true
    return false
  }

  const shouldHighlightPlan = (planId: string) => {
    // Highlight based on target feature
    if (targetFeature === 'premium_models') return planId === 'essential'
    if (targetFeature === 'unlimited_messages') return planId === 'developer'
    if (targetFeature === 'all_models') return planId === 'founder'
    
    // Default highlight
    return planId === 'developer'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-6xl max-h-[95vh] overflow-hidden"
          >
            <div className="bg-white rounded-3xl shadow-2xl">
              {/* Header */}
              <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                      <Crown className="text-amber-600" />
                      Upgrade Your Experience
                    </h2>
                    <p className="text-gray-600">
                      {targetFeature ? 
                        'Unlock premium features and get more from R; AI' : 
                        'Choose the perfect plan for your AI needs'}
                    </p>
                  </div>
                  <motion.button
                    onClick={onClose}
                    className="p-3 rounded-full bg-white shadow-sm hover:shadow-md transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X size={24} className="text-gray-600" />
                  </motion.button>
                </div>

                {targetFeature && (
                  <div className="bg-amber-100 border border-amber-200 rounded-xl p-4 mb-4">
                    <div className="flex items-center space-x-2 text-amber-800">
                      <Zap size={20} />
                      <span className="font-semibold">
                        {targetFeature === 'premium_models' && 'Premium Models Required'}
                        {targetFeature === 'unlimited_messages' && 'Unlimited Messages Required'}
                        {targetFeature === 'all_models' && 'Enterprise Features Required'}
                      </span>
                    </div>
                    <p className="text-amber-700 text-sm mt-2">
                      {targetFeature === 'premium_models' && 'Access GPT-4o and Claude 3.5 Sonnet with a Pro subscription'}
                      {targetFeature === 'unlimited_messages' && 'Remove daily message limits with a Pro subscription'}
                      {targetFeature === 'all_models' && 'Access all available models with an Enterprise subscription'}
                    </p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-100 border border-red-200 rounded-xl p-4 mb-4">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}
              </div>

              {/* Pricing Cards */}
              <div className="p-8 bg-gray-50 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  {PRICING_PLANS.map((plan) => {
                    const PlanIcon = PLAN_ICONS[plan.id as keyof typeof PLAN_ICONS] || Star
                    const isHighlighted = shouldHighlightPlan(plan.id)
                    const isCurrent = isCurrentPlan(plan.id)
                    const isLoading = loading === plan.id
                    
                    return (
                      <motion.div
                        key={plan.id}
                        className={cn(
                          'relative rounded-2xl border-2 bg-white overflow-hidden transition-all',
                          isHighlighted 
                            ? 'border-amber-300 shadow-lg shadow-amber-500/20 scale-105' 
                            : 'border-gray-200 hover:border-gray-300',
                          isCurrent && 'ring-2 ring-green-500'
                        )}
                        whileHover={!isCurrent ? { y: -4 } : undefined}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                      >
                        {/* Popular Badge */}
                        {isHighlighted && (
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                              Recommended
                            </div>
                          </div>
                        )}

                        {/* Current Plan Badge */}
                        {isCurrent && (
                          <div className="absolute top-4 right-4">
                            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                              Current Plan
                            </div>
                          </div>
                        )}

                        <div className="p-6">
                          {/* Plan Header */}
                          <div className="text-center mb-6">
                            <div className={cn(
                              'w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-gradient-to-br',
                              PLAN_COLORS[plan.id as keyof typeof PLAN_COLORS]
                            )}>
                              <PlanIcon size={24} className="text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                            <div className="mb-2">
                              <span className="text-3xl font-bold text-gray-900">
                                {plan.price === 0 ? 'Free' : formatPrice(plan.price, plan.interval)}
                              </span>
                              {plan.price > 0 && (
                                <span className="text-gray-600 text-sm ml-1">
                                  {plan.interval === 'year' ? '/year' : '/month'}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm">{plan.description}</p>
                          </div>

                          {/* Features */}
                          <div className="space-y-3 mb-6">
                            {plan.features.map((feature, index) => (
                              <div key={index} className="flex items-start space-x-3">
                                <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700 text-sm">{feature}</span>
                              </div>
                            ))}
                          </div>

                          {/* Action Button */}
                          <motion.button
                            onClick={() => handleUpgrade(plan)}
                            disabled={isCurrent || isLoading}
                            className={cn(
                              'w-full py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2',
                              isCurrent
                                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                : isHighlighted
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            )}
                            whileHover={!isCurrent && !isLoading ? { scale: 1.02 } : undefined}
                            whileTap={!isCurrent && !isLoading ? { scale: 0.98 } : undefined}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 size={20} className="animate-spin" />
                                <span>Processing...</span>
                              </>
                            ) : isCurrent ? (
                              <>
                                <Check size={20} />
                                <span>Current Plan</span>
                              </>
                            ) : (
                              <>
                                <CreditCard size={20} />
                                <span>{plan.buttonText}</span>
                              </>
                            )}
                          </motion.button>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Security Note */}
                <div className="mt-8 text-center">
                  <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
                    <Shield size={16} />
                    <span>Secure payment powered by Stripe • Cancel anytime</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default PricingModal
