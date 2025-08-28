'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Check, Zap, Bot, Crown, Star } from 'lucide-react'
import { PricingTier } from '@/types'
import { cn } from '@/lib/utils'

interface PricingPageProps {
  currentTier: string
  highlightTier?: string
  onSelectPlan: (tierName: string) => void
}

const pricingTiers: PricingTier[] = [
  {
    name: 'Essential Pack',
    price: 8,
    currency: 'EUR',
    interval: 'month',
    features: [
      'Unlimited Prompt Studio access',
      'Prompt analysis & optimization',
      'Save prompt templates',
      'Basic usage analytics'
    ],
    limits: {
      messagesPerDay: 1000
    }
  },
  {
    name: 'Developer Pack',
    price: 29,
    currency: 'EUR', 
    interval: 'month',
    features: [
      'Everything in Essential Pack',
      'Full Agent Crew Studio access',
      'Up to 3 agent crews',
      '500 workflow executions/day',
      'Real-time monitoring',
      'Export workflows'
    ],
    limits: {
      agentCrews: 3,
      executions: 500
    }
  },
  {
    name: 'Founder Pack',
    price: 39,
    currency: 'EUR',
    interval: 'month',
    features: [
      'Everything in Developer Pack',
      'Up to 10 agent crews',
      '2,000 workflow executions/day',
      'Cost Control Panel',
      'Advanced analytics',
      'Priority support'
    ],
    limits: {
      agentCrews: 10,
      executions: 2000
    }
  }
]

export function PricingPage({ currentTier, highlightTier = 'developer', onSelectPlan }: PricingPageProps) {
  const getIcon = (tierName: string) => {
    switch (tierName.toLowerCase()) {
      case 'essential pack':
        return Zap
      case 'developer pack':
        return Bot
      case 'founder pack':
        return Crown
      default:
        return Star
    }
  }

  const isCurrentTier = (tierName: string) => {
    const tierMap: Record<string, string> = {
      'essential': 'Essential Pack',
      'developer': 'Developer Pack',
      'founder': 'Founder Pack'
    }
    return tierMap[currentTier] === tierName
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/95 via-emerald-50/90 to-teal-50/95 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-enhanced-contrast mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-enhanced max-w-2xl mx-auto">
            From prompt optimization to full AI agent workflows - select the plan that fits your needs
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingTiers.map((tier, index) => {
            const Icon = getIcon(tier.name)
            const isHighlighted = highlightTier === tier.name.toLowerCase().replace(' pack', '')
            const isCurrent = isCurrentTier(tier.name)

            return (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "relative bg-white/95 backdrop-blur-sm rounded-2xl p-8 transition-all duration-200 shadow-lg border border-green-100/50",
                  isHighlighted 
                    ? "scale-105 ring-2 ring-green-300/60 shadow-2xl" 
                    : "hover:bg-white/90 hover:shadow-xl",
                  isCurrent && "ring-2 ring-green-400/70 bg-green-50/80"
                )}
              >
                {/* Highlight Badge */}
                {isHighlighted && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                      Recommended
                    </div>
                  </div>
                )}

                {/* Current Plan Badge */}
                {isCurrent && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-green-500/20 text-green-700 px-3 py-1 rounded-full text-sm font-medium border border-green-300/50">
                      Current Plan
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className={cn(
                    "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center shadow-lg",
                    tier.name === 'Essential Pack' && "bg-gradient-to-br from-yellow-400 to-orange-500",
                    tier.name === 'Developer Pack' && "bg-gradient-to-br from-purple-500 to-pink-500", 
                    tier.name === 'Founder Pack' && "bg-gradient-to-br from-emerald-500 to-teal-500"
                  )}>
                    <Icon size={32} className="text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-enhanced-contrast mb-2">{tier.name}</h3>
                  
                  <div className="text-4xl font-bold text-enhanced-contrast mb-1">
                    €{tier.price}
                    <span className="text-lg text-enhanced font-normal">/month</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <Check size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-enhanced-contrast">{feature}</span>
                    </li>
                  ))}
                </ul>

                <motion.button
                  onClick={() => onSelectPlan(tier.name)}
                  disabled={isCurrent}
                  whileHover={!isCurrent ? { scale: 1.02 } : {}}
                  whileTap={!isCurrent ? { scale: 0.98 } : {}}
                  className={cn(
                    "w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg",
                    isCurrent
                      ? "bg-green-100 text-green-700 cursor-not-allowed"
                      : isHighlighted
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600"
                        : "bg-white/50 text-enhanced-contrast hover:bg-white/70 border border-green-200/50"
                  )}
                >
                  {isCurrent ? 'Current Plan' : `Get ${tier.name}`}
                </motion.button>
              </motion.div>
            )
          })}
        </div>

        {/* FAQ or Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto shadow-lg border border-green-100/50">
            <h3 className="text-xl font-semibold text-enhanced-contrast mb-4">
              Need something custom?
            </h3>
            <p className="text-enhanced mb-4">
              Our Pro Plan offers unlimited resources, enterprise security, and dedicated support.
            </p>
            <button className="text-green-600 hover:text-green-700 underline transition-colors font-medium">
              Contact Sales for Enterprise Pricing
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}