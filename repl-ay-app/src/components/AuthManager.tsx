'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import AuthModal from './AuthModal'
import UserOnboardingModal from './UserOnboardingModal'
import type { OnboardingData } from '@/contexts/AuthContext'

interface AuthManagerProps {
  trigger?: React.ReactNode
  onAuthComplete?: () => void
  isOpen?: boolean
  onClose?: () => void
}

export default function AuthManager({ trigger, onAuthComplete, isOpen = false, onClose }: AuthManagerProps) {
  const { user, loginWithGoogle, login, register, completeOnboarding } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showOnboardingModal, setShowOnboardingModal] = useState(false)
  const [pendingUser, setPendingUser] = useState<{ email: string; isNewUser: boolean } | null>(null)

  // Use external state if provided, otherwise use internal state
  const authModalOpen = isOpen !== undefined ? isOpen : showAuthModal
  const handleCloseAuthModal = () => {
    if (onClose) {
      onClose()
    } else {
      setShowAuthModal(false)
    }
  }

  const handleAuthSuccess = async (authResult: { email: string; isNewUser: boolean }) => {
    handleCloseAuthModal()
    setPendingUser(authResult)

    // Show onboarding if user needs profile completion
    if (authResult.isNewUser) {
      setShowOnboardingModal(true)
    } else {
      // User has complete profile, authentication complete
      onAuthComplete?.()
    }
  }

  const handleOnboardingComplete = async (onboardingData: OnboardingData) => {
    try {
      if (pendingUser) {
        await completeOnboarding(onboardingData)
        setShowOnboardingModal(false)
        setPendingUser(null)
        onAuthComplete?.()
      }
    } catch (error) {
      console.error('Onboarding failed:', error)
      // Handle error - maybe show toast notification
    }
  }

  const handleOnboardingClose = () => {
    // If user closes onboarding without completing, still proceed
    // but mark them as needing to complete onboarding later
    setShowOnboardingModal(false)
    setPendingUser(null)
    onAuthComplete?.()
  }

  // If user is already authenticated, don't show anything
  if (user) {
    return null
  }

  return (
    <>
      {/* Trigger button or element */}
      {trigger && (
        <div onClick={() => setShowAuthModal(true)} className="cursor-pointer">
          {trigger}
        </div>
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={handleCloseAuthModal}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* User Onboarding Modal */}
      <UserOnboardingModal
        isOpen={showOnboardingModal}
        onClose={handleOnboardingClose}
        onComplete={handleOnboardingComplete}
        userEmail={pendingUser?.email || ''}
      />
    </>
  )
}