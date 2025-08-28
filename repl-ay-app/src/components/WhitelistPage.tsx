'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mail, 
  CheckCircle, 
  Sparkles, 
  Zap,
  Users,
  Calendar,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface WhitelistPageProps {
  onClose?: () => void
}

export function WhitelistPage({ onClose }: WhitelistPageProps) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)
    setError('')

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-green-50/20 to-blue-50/20">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-dark rounded-3xl p-12 max-w-2xl text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <CheckCircle size={80} className="mx-auto mb-6 text-green-400" />
          </motion.div>
          
          <h2 className="text-4xl font-bold text-enhanced-contrast mb-4">
            You&apos;re on the list! 🎉
          </h2>
          <p className="text-xl text-enhanced mb-8">
            Thank you for joining our exclusive launch event. We&apos;ll notify you as soon as R; goes live!
          </p>
          
          <div className="space-y-4 text-enhanced mb-8">
            <div className="flex items-center justify-center gap-3">
              <Sparkles className="text-yellow-400" size={20} />
              <span>Early access to all premium features</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Zap className="text-blue-400" size={20} />
              <span>Exclusive launch day discounts</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Users className="text-purple-400" size={20} />
              <span>Priority support and onboarding</span>
            </div>
          </div>

          {onClose && (
            <motion.button
              onClick={onClose}
              className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-amber-700 hover:to-orange-700 transition-all shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Continue to R;
            </motion.button>
          )}
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-dark rounded-3xl p-12 max-w-4xl"
      >
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Mail size={80} className="mx-auto mb-6 text-amber-500" />
          </motion.div>
          
          <motion.h1 
            className="text-6xl font-bold text-enhanced-contrast mb-4 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Join the Launch Event
          </motion.h1>
          
          <motion.p 
            className="text-xl text-enhanced mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Be among the first to experience R; AI Agent Crew Studio
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left side - Features */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-semibold text-enhanced-contrast mb-6">
              What you&apos;ll get:
            </h3>
            
            <div className="space-y-4">
              {[
                { icon: Zap, title: "Early Access", desc: "Be the first to use R; when it launches" },
                { icon: Sparkles, title: "Premium Features", desc: "Free access to all launch features for 30 days" },
                { icon: Users, title: "Exclusive Community", desc: "Join our private Discord for launch members" },
                { icon: Calendar, title: "Live Demos", desc: "Invitation to exclusive live demo sessions" }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-start gap-4 glass rounded-xl p-4"
                >
                  <feature.icon className="text-amber-500 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <h4 className="font-semibold text-enhanced-contrast">{feature.title}</h4>
                    <p className="text-enhanced text-sm">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right side - Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="glass rounded-2xl p-8"
          >
            <h3 className="text-2xl font-semibold text-enhanced-contrast mb-6 text-center">
              Reserve Your Spot
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-enhanced mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-enhanced-contrast placeholder-white/40 focus:outline-none focus:border-amber-500/50 focus:bg-white/15 transition-all"
                  disabled={isSubmitting}
                />
                
                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-red-400 text-sm mt-2"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "w-full py-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2",
                  isSubmitting
                    ? "bg-white/10 text-enhanced cursor-not-allowed"
                    : "bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700 shadow-lg"
                )}
                whileHover={!isSubmitting ? { scale: 1.02 } : undefined}
                whileTap={!isSubmitting ? { scale: 0.98 } : undefined}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    Join the Whitelist
                    <ArrowRight size={20} />
                  </>
                )}
              </motion.button>
            </form>

            <p className="text-xs text-enhanced text-center mt-4">
              We&apos;ll only email you about the R; launch. No spam, ever.
            </p>
          </motion.div>
        </div>

        {onClose && (
          <div className="text-center mt-8">
            <button
              onClick={onClose}
              className="text-enhanced hover:text-enhanced-contrast transition-colors underline"
            >
              Skip and continue to R;
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
