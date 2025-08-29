'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { 
  User, 
  Settings, 
  Crown, 
  LogOut, 
  ChevronDown, 
  Zap,
  Shield,
  BarChart3
} from 'lucide-react'

export default function UserProfileDropdown() {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!user) return null

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'founder': return <Crown className="w-4 h-4 text-slate-700" />
      case 'developer': return <Zap className="w-4 h-4 text-slate-700" />
      case 'essential': return <Shield className="w-4 h-4 text-slate-700" />
      default: return <User className="w-4 h-4 text-slate-700" />
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'founder': return 'text-yellow-600'
      case 'developer': return 'text-blue-600'
      case 'essential': return 'text-green-600'
      default: return 'text-enhanced'
    }
  }

  const getTierLabel = (tier: string) => {
    return tier.charAt(0).toUpperCase() + tier.slice(1)
  }

  const getInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`
    }
    return user.email[0].toUpperCase()
  }

  const getDisplayName = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    return user.email
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative overflow-hidden flex items-center space-x-3 px-4 py-2 rounded-xl transition-all duration-300 group shadow-lg hover:shadow-xl"
        style={{
          background: 'linear-gradient(135deg, #D4A373 0%, #FAEDCD 50%, #CCD5AE 100%)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Avatar */}
        <div className="relative w-8 h-8 bg-gradient-to-r from-white/20 to-white/10 rounded-lg flex items-center justify-center text-slate-800 text-sm font-semibold shadow-inner">
          {getInitials()}
        </div>
        
        {/* User Info */}
        <div className="relative hidden md:block text-left">
          <div className="text-sm font-semibold text-slate-800 drop-shadow-sm truncate max-w-32">
            {getDisplayName()}
          </div>
          <div className={`text-xs flex items-center space-x-1 text-slate-700`}>
            {getTierIcon(user.tier)}
            <span>{getTierLabel(user.tier)}</span>
          </div>
        </div>

        <ChevronDown className={`relative w-4 h-4 text-slate-800 drop-shadow-sm transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-64 glass border border-white/20 rounded-xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(212, 163, 115, 0.8) 0%, rgba(250, 237, 205, 0.8) 50%, rgba(204, 213, 174, 0.8) 100%)',
            }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/20 bg-gradient-to-r from-white/10 to-transparent">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-white/20 to-white/10 rounded-xl flex items-center justify-center text-white font-medium shadow-inner">
                  {getInitials()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white drop-shadow-sm truncate">
                    {getDisplayName()}
                  </div>
                  <div className="text-xs text-white/80 drop-shadow-sm truncate">
                    {user.email}
                  </div>
                  <div className={`text-xs flex items-center space-x-1 mt-1 ${getTierColor(user.tier)}`}>
                    {getTierIcon(user.tier)}
                    <span>{getTierLabel(user.tier)} Plan</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button className="w-full px-4 py-2 text-left text-sm text-black/90 hover:bg-white/20 transition-colors flex items-center space-x-3 hover:text-white">
                <User className="w-4 h-4" />
                <span>Profile Settings</span>
              </button>
              
              <button className="w-full px-4 py-2 text-left text-sm text-black/90 hover:bg-white/20 transition-colors flex items-center space-x-3 hover:text-white">
                <BarChart3 className="w-4 h-4" />
                <span>Usage & Analytics</span>
              </button>

              <button className="w-full px-4 py-2 text-left text-sm text-black/90 hover:bg-white/20 transition-colors flex items-center space-x-3 hover:text-white">
                <Settings className="w-4 h-4" />
                <span>Account Settings</span>
              </button>

              {/* Upgrade Option for Free Users */}
              {user.tier === 'free' && (
                <>
                  <div className="border-t border-white/20 my-2"></div>
                  <button className="w-full px-4 py-2 text-left text-sm text-yellow-200 hover:bg-yellow-500/20 transition-colors flex items-center space-x-3 hover:text-yellow-100">
                    <Crown className="w-4 h-4" />
                    <span>Upgrade Plan</span>
                  </button>
                </>
              )}

              <div className="border-t border-white/20 my-2"></div>
              
              <button
                onClick={logout}
                className="w-full px-4 py-2 text-left text-sm text-red-200 hover:bg-red-500/20 transition-colors flex items-center space-x-3 hover:text-red-100"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}