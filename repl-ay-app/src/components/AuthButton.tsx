'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { LogIn, User } from 'lucide-react'

interface AuthButtonProps {
  isAuthenticated: boolean
  userEmail?: string
  onLogin: () => void
  onLogout: () => void
}

export function AuthButton({ isAuthenticated, userEmail, onLogin, onLogout }: AuthButtonProps) {
  if (isAuthenticated) {
    return (
      <div className="fixed top-6 right-6 z-50">
        <div className="glass rounded-full p-1 shadow-lg">
          <div className="flex items-center space-x-3 px-4 py-2">
            <div className="flex items-center space-x-2">
              <User size={16} className="text-orange-800" />
              <span className="text-orange-900 text-sm font-medium">
                {userEmail?.split('@')[0] || 'User'}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="text-orange-700 hover:text-orange-900 text-sm transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-6 right-6 z-50"
    >
      <motion.button
        onClick={onLogin}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="glass rounded-full px-6 py-3 shadow-lg transition-all duration-200 hover:bg-orange-400/20"
      >
        <div className="flex items-center space-x-2">
          <LogIn size={18} className="text-orange-800" />
          <span className="text-orange-900 font-medium">Log In</span>
        </div>
      </motion.button>
    </motion.div>
  )
}