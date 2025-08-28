'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import UserOnboardingModal from './UserOnboardingModal'
import type { OnboardingData } from '@/contexts/AuthContext'

export default function OnboardingCheck() {
  const { user, completeOnboarding } = useAuth()
  const [showOnboardingModal, setShowOnboardingModal] = useState(false)

  useEffect(() => {
    // Check if user needs onboarding when they log in
    if (user && !user.isOnboarded) {
      // User is authenticated but missing profile information
      const needsOnboarding = !user.firstName || !user.lastName || !user.jobTitle || !user.company
      
      if (needsOnboarding) {
        setShowOnboardingModal(true)
      }
    }
  }, [user])

  const handleOnboardingComplete = async (onboardingData: OnboardingData) => {
    try {
      await completeOnboarding(onboardingData)
      setShowOnboardingModal(false)
    } catch (error) {
      console.error('Onboarding failed:', error)
      // Keep modal open on error so user can try again
    }
  }

  const handleOnboardingClose = () => {
    // Allow user to close onboarding, but they can complete it later
    setShowOnboardingModal(false)
  }

  // Don't render anything if no user or no modal needed
  if (!user || !showOnboardingModal) {
    return null
  }

  return (
    <UserOnboardingModal
      isOpen={showOnboardingModal}
      onClose={handleOnboardingClose}
      onComplete={handleOnboardingComplete}
      userEmail={user.email}
    />
  )
}