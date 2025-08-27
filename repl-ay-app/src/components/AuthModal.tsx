'use client'

import { useState, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Eye, EyeOff, Chrome, Shield, Loader2 } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onAuthSuccess: (user: { email: string; isNewUser: boolean }) => void
}

type AuthMode = 'login' | 'register'

const AuthModal = memo(function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleEmailAuth = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Validate form
      if (authMode === 'register') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match')
        }
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters')
        }
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // For demo purposes, assume registration is successful
      const isNewUser = authMode === 'register'
      
      onAuthSuccess({ 
        email, 
        isNewUser 
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [authMode, password, confirmPassword, email, onAuthSuccess])

  const handleGoogleAuth = useCallback(async () => {
    setError('')
    setIsLoading(true)

    try {
      // Simulate Google OAuth flow
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // For demo purposes, simulate a new user
      const mockEmail = `user${Math.floor(Math.random() * 1000)}@gmail.com`
      
      onAuthSuccess({ 
        email: mockEmail, 
        isNewUser: true 
      })
    } catch (err) {
      setError('Google authentication failed')
    } finally {
      setIsLoading(false)
    }
  }, [onAuthSuccess])

  const toggleAuthMode = useCallback(() => {
    setAuthMode(authMode === 'login' ? 'register' : 'login')
    setError('')
    setPassword('')
    setConfirmPassword('')
  }, [authMode])

  const isFormValid = useCallback(() => {
    if (!email || !password) return false
    if (authMode === 'register' && (!confirmPassword || password !== confirmPassword)) return false
    return true
  }, [email, password, authMode, confirmPassword])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass rounded-2xl border border-white/20 shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-white/20">
              <button
                onClick={onClose}
                className="absolute right-6 top-6 p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-enhanced" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 glass rounded-xl flex items-center justify-center border border-white/30">
                  <Shield className="w-5 h-5 text-enhanced" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-enhanced-contrast">
                    {authMode === 'login' ? 'Welcome Back' : 'Join R;'}
                  </h2>
                  <p className="text-enhanced text-sm">
                    {authMode === 'login' 
                      ? 'Sign in to continue your journey' 
                      : 'Create your account in seconds'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-8 py-6">
              {/* Google Auth Button */}
              <motion.button
                onClick={handleGoogleAuth}
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mb-6 px-4 py-3 bg-white/90 hover:bg-white text-gray-900 rounded-xl font-medium flex items-center justify-center space-x-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border border-white/30"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Chrome className="w-5 h-5" />
                )}
                <span>Continue with Google</span>
              </motion.button>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/30"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 glass text-enhanced rounded-full">or</span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-enhanced-contrast mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-enhanced" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 glass border border-white/40 rounded-xl text-enhanced-contrast placeholder-enhanced focus:outline-none focus:ring-2 focus:ring-white/60 focus:border-transparent transition-all shadow-sm backdrop-blur-sm"
                      placeholder="you@example.com"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-enhanced-contrast mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 pr-11 py-3 glass border border-white/40 rounded-xl text-enhanced-contrast placeholder-enhanced focus:outline-none focus:ring-2 focus:ring-white/60 focus:border-transparent transition-all shadow-sm backdrop-blur-sm"
                      placeholder="Enter your password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-enhanced hover:text-enhanced-contrast"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {authMode === 'register' && (
                  <div>
                    <label className="block text-sm font-medium text-enhanced-contrast mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 pr-11 py-3 glass border border-white/40 rounded-xl text-enhanced-contrast placeholder-enhanced focus:outline-none focus:ring-2 focus:ring-white/60 focus:border-transparent transition-all shadow-sm backdrop-blur-sm"
                        placeholder="Confirm your password"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-enhanced hover:text-enhanced-contrast"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/20 border border-red-400/30 text-red-800 px-4 py-3 rounded-xl text-sm backdrop-blur-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  disabled={!isFormValid() || isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-4 py-3 glass hover:bg-white/20 text-enhanced-contrast rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg border border-white/20"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <span>{authMode === 'login' ? 'Sign In' : 'Create Account'}</span>
                  )}
                </motion.button>
              </form>

              {/* Toggle Auth Mode */}
              <div className="mt-6 text-center">
                <button
                  onClick={toggleAuthMode}
                  className="text-enhanced hover:text-enhanced-contrast text-sm transition-colors font-medium"
                  disabled={isLoading}
                >
                  {authMode === 'login' 
                    ? "Don't have an account? Sign up" 
                    : "Already have an account? Sign in"
                  }
                </button>
              </div>

              {/* Terms for Registration */}
              {authMode === 'register' && (
                <div className="mt-4 text-xs text-enhanced text-center">
                  By creating an account, you agree to our{' '}
                  <button className="text-enhanced-contrast hover:text-enhanced-contrast transition-colors font-medium underline">
                    Terms of Service
                  </button>
                  {' '}and{' '}
                  <button className="text-enhanced-contrast hover:text-enhanced-contrast transition-colors font-medium underline">
                    Privacy Policy
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
})

export default AuthModal