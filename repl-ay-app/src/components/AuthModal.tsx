'use client'

import { useState, useCallback, memo, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Eye, EyeOff, Chrome, Shield, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onAuthSuccess: (user: { email: string; isNewUser: boolean }) => void
}

type AuthMode = 'login' | 'register'

// Add Google Identity Services types
declare global {
  interface Window {
    googleScriptLoaded?: boolean
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void
          prompt: (callback?: (notification: any) => void) => void
          renderButton: (element: HTMLElement | null, config: any) => void
        }
      }
    }
  }
}

// Optimized animation variants to reduce recalculations
const overlayVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
}

const modalVariants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { type: "spring" as const, damping: 25, stiffness: 300 } },
  exit: { scale: 0.9, opacity: 0 }
}

const AuthModal = memo(function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  // Get authentication functions from context
  const { login, register, loginWithGoogle } = useAuth()

  // All hooks declared first - before any conditional returns
  const [mounted, setMounted] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false)

  // All useEffect hooks
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return

    const checkGoogleAvailability = () => {
      if (window.googleScriptLoaded && window.google?.accounts?.id) {
        console.log('Google Identity Services ready from global loader')
        setGoogleScriptLoaded(true)
        return true
      }
      return false
    }

    if (checkGoogleAvailability()) return

    const pollInterval = setInterval(() => {
      if (checkGoogleAvailability()) {
        clearInterval(pollInterval)
      }
    }, 300)

    const fallbackTimeout = setTimeout(() => {
      if (!googleScriptLoaded) {
        console.log('Loading Google script as fallback...')
        const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]')
        if (!existingScript) {
          const script = document.createElement('script')
          script.src = 'https://accounts.google.com/gsi/client'
          script.async = true
          script.defer = true
          
          script.onload = () => {
            console.log('Google Identity Services script loaded via fallback')
            setGoogleScriptLoaded(true)
            clearInterval(pollInterval)
          }
          
          script.onerror = () => {
            console.error('Failed to load Google Identity Services script via fallback')
            clearInterval(pollInterval)
          }
          
          document.head.appendChild(script)
        }
      }
    }, 2000)

    return () => {
      clearInterval(pollInterval)
      clearTimeout(fallbackTimeout)
    }
  }, [mounted, googleScriptLoaded])

  // Password strength calculation with useMemo
  const calculatePasswordStrength = useMemo(() => {
    if (!password) return 0
    let strength = 0
    if (password.length >= 8) strength += 25
    if (password.match(/[a-z]/)) strength += 25
    if (password.match(/[A-Z]/)) strength += 25
    if (password.match(/[0-9]/)) strength += 25
    return strength
  }, [password])

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength)
  }, [calculatePasswordStrength])

  // Form validation with useMemo
  const isFormValid = useMemo(() => {
    if (!email || !password) return false
    if (authMode === 'register' && (!confirmPassword || password !== confirmPassword)) return false
    return true
  }, [email, password, authMode, confirmPassword])

  const validationError = useMemo(() => {
    if (authMode === 'register') {
      if (password && confirmPassword && password !== confirmPassword) {
        return 'Passwords do not match'
      }
      if (password && password.length < 8) {
        return 'Password must be at least 8 characters'
      }
    }
    return ''
  }, [authMode, password, confirmPassword])

  // All useCallback hooks
  const handleEmailAuth = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (authMode === 'register') {
        const user = await register(email, password)
        setShowSuccess(true)
        setTimeout(() => {
          onAuthSuccess({
            email: user.email,
            isNewUser: !user.isOnboarded // Trigger onboarding if not completed
          })
        }, 500)
      } else {
        const user = await login(email, password)
        setShowSuccess(true)
        setTimeout(() => {
          onAuthSuccess({
            email: user.email,
            isNewUser: !user.isOnboarded // Trigger onboarding if not completed
          })
        }, 500)
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.')
      setIsLoading(false)
    }
  }, [authMode, email, password, login, register, onAuthSuccess])

  const handleGoogleAuth = useCallback(async () => {
    setError('')
    setIsLoading(true)

    try {
      const result = await loginWithGoogle()
      setShowSuccess(true)
      
      setTimeout(() => {
        onAuthSuccess({
          email: result.user.email,
          isNewUser: result.needsOnboarding // Use needsOnboarding to trigger onboarding modal
        })
      }, 500)
      
    } catch (err: any) {
      console.error('Google OAuth error:', err)
      setError(err.message || 'Google authentication failed. Please try again.')
      setIsLoading(false)
    }
  }, [loginWithGoogle, onAuthSuccess])

  const toggleAuthMode = useCallback(() => {
    setAuthMode(authMode === 'login' ? 'register' : 'login')
    setError('')
    setPassword('')
    setConfirmPassword('')
  }, [authMode])

  // Early return AFTER all hooks are declared
  if (!mounted) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={overlayVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-0 bg-gradient-to-br from-green-50/90 via-emerald-50/85 to-teal-50/90 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl w-full max-w-md p-8 relative border border-green-100/50"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100/80 rounded-full transition-all duration-200"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Success state */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-3xl flex items-center justify-center"
                >
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center"
                    >
                      <Shield className="h-8 w-8 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">Success!</h3>
                    <p className="text-slate-600">Welcome to R;</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                {authMode === 'login' ? 'Welcome Back' : 'Join R;'}
              </h2>
              <p className="text-slate-600">
                {authMode === 'login' 
                  ? 'Sign in to your account to continue'
                  : 'Create your account to get started'
                }
              </p>
            </div>

            {/* Google Sign-in */}
            <div className="mb-6">
              <button
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full bg-white border-2 border-slate-200 text-slate-700 rounded-xl px-4 py-3 font-medium hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-300 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-green-600" />
                ) : (
                  <Chrome className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                )}
                <span>
                  {isLoading ? 'Connecting...' : 'Continue with Google'}
                </span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500">or</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {/* Email field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-300 transition-all duration-200 text-slate-900 placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pr-12 pl-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-300 transition-all duration-200 text-slate-900 placeholder-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Password strength indicator */}
                {authMode === 'register' && password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            passwordStrength < 25 ? 'bg-red-400 w-1/4' :
                            passwordStrength < 50 ? 'bg-orange-400 w-2/4' :
                            passwordStrength < 75 ? 'bg-yellow-400 w-3/4' :
                            'bg-green-500 w-full'
                          }`}
                        />
                      </div>
                      <span className={`text-xs font-medium ${
                        passwordStrength < 25 ? 'text-red-600' :
                        passwordStrength < 50 ? 'text-orange-600' :
                        passwordStrength < 75 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {passwordStrength < 25 ? 'Weak' :
                         passwordStrength < 50 ? 'Fair' :
                         passwordStrength < 75 ? 'Good' :
                         'Strong'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm password field (register mode) */}
              {authMode === 'register' && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                    Confirm password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="w-full pr-12 pl-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-300 transition-all duration-200 text-slate-900 placeholder-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors duration-200"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Error message */}
              {(error || validationError) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"
                >
                  {error || validationError}
                </motion.div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl px-4 py-3 font-semibold hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-green-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>{authMode === 'login' ? 'Sign In' : 'Create Account'}</span>
                )}
              </button>
            </form>

            {/* Mode toggle */}
            <div className="mt-6 text-center">
              <p className="text-slate-600">
                {authMode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                <button
                  onClick={toggleAuthMode}
                  className="ml-2 text-green-600 hover:text-green-700 font-medium hover:underline transition-all duration-200"
                >
                  {authMode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>

            {/* Terms */}
            {authMode === 'register' && (
              <div className="mt-4 text-center">
                <p className="text-xs text-slate-500">
                  By creating an account, you agree to our{' '}
                  <a href="#" className="text-green-600 hover:text-green-700 underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-green-600 hover:text-green-700 underline">Privacy Policy</a>
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
})

export default AuthModal