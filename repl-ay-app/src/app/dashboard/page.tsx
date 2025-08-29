'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader2, Home, CreditCard } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

function DashboardContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'processing'>('loading')
  const [message, setMessage] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    const urlSessionId = searchParams.get('session_id')
    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')

    setSessionId(urlSessionId)

    if (canceled === 'true') {
      setStatus('error')
      setMessage('Payment was canceled. No changes were made to your account.')
      return
    }

    if (success === 'true' && urlSessionId) {
      setStatus('processing')
      setMessage('Processing your payment...')
      
      // Check payment status and refresh user data
      verifyPayment(urlSessionId)
    } else if (!urlSessionId) {
      // Regular dashboard access
      setStatus('success')
      setMessage('Welcome to your dashboard!')
    }
  }, [searchParams])

  const verifyPayment = async (sessionId: string) => {
    try {
      // Wait a moment for webhook processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Verify the session with Stripe
      const response = await fetch('/api/stripe/verify-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setStatus('success')
        setMessage(`Payment successful! Your subscription has been activated.`)
        
        // Redirect to main app after a delay
        setTimeout(() => {
          router.push('/')
        }, 3000)
      } else {
        setStatus('processing')
        setMessage('Payment completed! Your subscription is being activated...')
        
        // Redirect after delay even if verification is pending
        setTimeout(() => {
          router.push('/')
        }, 5000)
      }
    } catch (error) {
      console.error('Payment verification error:', error)
      setStatus('success') // Assume success since payment went through
      setMessage('Payment completed! If your subscription doesn\'t activate immediately, please contact support.')
      
      setTimeout(() => {
        router.push('/')
      }, 4000)
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle size={64} className="text-green-500" />
      case 'error':
        return <XCircle size={64} className="text-red-500" />
      case 'loading':
      case 'processing':
        return <Loader2 size={64} className="text-blue-500 animate-spin" />
      default:
        return <CheckCircle size={64} className="text-green-500" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'from-green-50 to-emerald-50'
      case 'error':
        return 'from-red-50 to-pink-50'
      case 'loading':
      case 'processing':
        return 'from-blue-50 to-cyan-50'
      default:
        return 'from-green-50 to-emerald-50'
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getStatusColor()} flex items-center justify-center p-4`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center"
      >
        {/* Status Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="flex justify-center mb-6"
        >
          {getStatusIcon()}
        </motion.div>

        {/* Status Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {status === 'success' && 'Payment Successful!'}
            {status === 'error' && 'Payment Issue'}
            {status === 'loading' && 'Loading...'}
            {status === 'processing' && 'Processing Payment...'}
          </h1>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            {message}
          </p>

          {/* Session Details */}
          {sessionId && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
              <div className="text-sm text-gray-500 mb-1">Session ID:</div>
              <div className="text-xs font-mono text-gray-700 break-all">
                {sessionId}
              </div>
            </div>
          )}

          {/* User Info */}
          {user && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="text-sm text-gray-500 mb-2">Account Info:</div>
              <div className="text-gray-700">
                <div className="flex items-center justify-between">
                  <span>Email:</span>
                  <span className="font-semibold">{user.email}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span>Current Tier:</span>
                  <span className="font-semibold capitalize">{user.tier}</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col space-y-3"
        >
          <motion.button
            onClick={() => router.push('/')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <Home size={20} />
            <span>Return to App</span>
          </motion.button>

          {status === 'error' && (
            <motion.button
              onClick={() => router.push('/pricing')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <CreditCard size={20} />
              <span>Try Again</span>
            </motion.button>
          )}
        </motion.div>

        {/* Auto-redirect notice */}
        {status === 'success' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-sm text-gray-500 mt-4"
          >
            Redirecting to app in a few seconds...
          </motion.p>
        )}
      </motion.div>
    </div>
  )
}

// Loading component for Suspense fallback
function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-2xl rounded-3xl p-8 max-w-lg w-full text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  )
}