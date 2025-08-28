'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Sparkles, Zap, Crown, Rocket } from 'lucide-react'
import { UserTier } from '@/types'
import { cn } from '@/lib/utils'

interface PricingModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectTier: (tier: UserTier) => void
  currentTier: UserTier
  blockedFeature?: string
}

const pricingTiers = [
  {
    id: 'free' as UserTier,
    name: 'Free',
    price: 0,
    interval: 'month',
    icon: Sparkles,
    color: 'from-blue-500 to-cyan-500',
    features: [
      '50 messages per day',
      'Basic chat interface',
      'Prompt Studio access',
      'Community support',
      'Mobile responsive'
    ],
    limits: {
      messagesPerDay: 50,
      parallelChats: 1,
      agentCrews: 0,
      executions: 0
    }
  },
  {
    id: 'essential' as UserTier,
    name: 'Essential',
    price: 12,
    interval: 'month',
    icon: Zap,
    color: 'from-amber-500 to-orange-500',
    popular: true,
    features: [
      'Unlimited messages',
      'Parallel chat mode (up to 3)',
      'Deep research toggle',
      'Advanced prompt analysis',
      'Priority support',
      'Export conversations'
    ],
    limits: {
      messagesPerDay: -1, // unlimited
      parallelChats: 3,
      agentCrews: 0,
      executions: 0
    }
  },
  {
    id: 'developer' as UserTier,
    name: 'Developer',
    price: 39,
    interval: 'month',
    icon: Crown,
    color: 'from-purple-500 to-pink-500',
    features: [
      'Everything in Essential',
      'Agent Crew Studio',
      'Up to 10 parallel chats',
      'Workflow automation',
      'API access',
      'Custom integrations',
      'Advanced analytics'
    ],
    limits: {
      messagesPerDay: -1,
      parallelChats: 10,
      agentCrews: 5,
      executions: 1000
    }
  },
  {
    id: 'founder' as UserTier,
    name: 'Founder',
    price: 99,
    interval: 'month',
    icon: Rocket,
    color: 'from-emerald-500 to-teal-500',
    features: [
      'Everything in Developer',
      'Unlimited agent crews',
      'Unlimited parallel chats',
      'White-label options',
      'Dedicated support',
      'Early access to features',
      'Revenue sharing program'
    ],
    limits: {
      messagesPerDay: -1,
      parallelChats: -1,
      agentCrews: -1,
      executions: -1
    }
  }
]

function PricingModal({ 
  isOpen, 
  onClose, 
  onSelectTier, 
  currentTier, 
  blockedFeature 
}: PricingModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gradient-to-br from-green-50/90 via-emerald-50/85 to-teal-50/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-green-200/60"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-green-200/40 bg-gradient-to-r from-green-50/80 to-emerald-50/60">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">
                  Upgrade Your R; Experience
                </h2>
                {blockedFeature && (
                  <p className="text-gray-600 mt-2">
                    <span className="font-semibold text-orange-600">&quot;{blockedFeature}&quot;</span> requires a premium plan
                  </p>
                )}
              </div>
              <motion.button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-green-100/60 transition-colors text-gray-600"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X size={24} />
              </motion.button>
            </div>
          </div>

          {/* Pricing Tiers */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pricingTiers.map((tier, index) => {
                const Icon = tier.icon
                const isCurrentTier = currentTier === tier.id
                const isUpgrade = currentTier === 'curious' || 
                  (currentTier === 'free' && tier.id !== 'free') ||
                  (currentTier === 'essential' && ['developer', 'founder'].includes(tier.id)) ||
                  (currentTier === 'developer' && tier.id === 'founder')

                return (
                  <motion.div
                    key={tier.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      'relative rounded-2xl p-6 border-2 transition-all',
                      isCurrentTier 
                        ? 'border-green-400 bg-green-50/80' 
                        : 'border-gray-200/60 bg-white/80 hover:border-green-300 hover:bg-green-50/40',
                      tier.popular && 'ring-2 ring-green-400 ring-offset-2 ring-offset-transparent'
                    )}
                  >
                    {tier.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                          Most Popular
                        </span>
                      </div>
                    )}

                    {/* Tier Header */}
                    <div className="text-center mb-6">
                      <div className={cn('w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br flex items-center justify-center', tier.color)}>
                        <Icon className="text-white" size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {tier.name}
                      </h3>
                      <div className="mb-4">
                        <span className="text-4xl font-bold text-gray-800">
                          ${tier.price}
                        </span>
                        <span className="text-gray-600">/{tier.interval}</span>
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-6">
                      {tier.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start space-x-2">
                          <Check size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <motion.button
                      onClick={() => onSelectTier(tier.id)}
                      disabled={isCurrentTier}
                      className={cn(
                        'w-full py-3 rounded-xl font-semibold transition-all',
                        isCurrentTier
                          ? 'bg-green-100 text-green-700 cursor-default'
                          : isUpgrade
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg'
                          : 'bg-white/50 text-gray-700 hover:bg-white/70 border border-gray-200'
                      )}
                      whileHover={!isCurrentTier ? { scale: 1.02 } : undefined}
                      whileTap={!isCurrentTier ? { scale: 0.98 } : undefined}
                    >
                      {isCurrentTier ? 'Current Plan' : `Choose ${tier.name}`}
                    </motion.button>
                  </motion.div>
                )
              })}
            </div>

            {/* Features Comparison */}
            <div className="mt-8 p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                Feature Comparison
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200/40">
                      <th className="text-left py-3 px-4 text-gray-800 font-semibold">Feature</th>
                      {pricingTiers.map(tier => (
                        <th key={tier.id} className="text-center py-3 px-4 text-gray-800 font-semibold">
                          {tier.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200/30">
                      <td className="py-3 px-4 text-gray-700">Messages per day</td>
                      {pricingTiers.map(tier => (
                        <td key={tier.id} className="text-center py-3 px-4 text-gray-600">
                          {tier.limits.messagesPerDay === -1 ? '∞' : tier.limits.messagesPerDay}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-200/30">
                      <td className="py-3 px-4 text-gray-700">Parallel chats</td>
                      {pricingTiers.map(tier => (
                        <td key={tier.id} className="text-center py-3 px-4 text-gray-600">
                          {tier.limits.parallelChats === -1 ? '∞' : tier.limits.parallelChats}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-200/30">
                      <td className="py-3 px-4 text-gray-700">Agent crews</td>
                      {pricingTiers.map(tier => (
                        <td key={tier.id} className="text-center py-3 px-4 text-gray-600">
                          {tier.limits.agentCrews === -1 ? '∞' : tier.limits.agentCrews}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default PricingModal