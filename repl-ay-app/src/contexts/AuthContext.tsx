'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  jobTitle?: string
  company?: string
  tier: 'free' | 'essential' | 'developer' | 'founder'
  isOnboarded: boolean
  createdAt: string
}

export interface OnboardingData {
  firstName: string
  lastName: string
  jobTitle: string
  company: string
  companySize: string
  industry: string
  hearAboutUs: string
  primaryUseCase: string
  experienceLevel: string
  interests: string[]
  marketingConsent: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<User>
  register: (email: string, password: string) => Promise<User>
  loginWithGoogle: () => Promise<{ user: User; needsOnboarding: boolean }>
  completeOnboarding: (data: OnboardingData) => Promise<User>
  logout: () => void
}

// Add global type for Google OAuth
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void
          prompt: (callback?: (notification: any) => void) => void
        }
      }
    }
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        const token = localStorage.getItem('r_token')
        if (token) {
          // Verify token with backend
          const response = await fetch('/api/auth/verify', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          })

          if (response.ok) {
            const { user: userData } = await response.json()
            setUser({
              id: userData.id,
              email: userData.email,
              firstName: userData.firstName,
              lastName: userData.lastName,
              jobTitle: userData.jobTitle,
              company: userData.company,
              tier: userData.tier,
              isOnboarded: !!userData.firstName && !!userData.lastName && !!userData.jobTitle && !!userData.company,
              createdAt: userData.createdAt
            })
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('r_token')
          }
        }
      } catch (error) {
        console.error('Failed to restore session:', error)
        localStorage.removeItem('r_token')
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  const saveUserSession = (userData: User, token: string) => {
    setUser(userData)
    localStorage.setItem('r_token', token)
    
    // Track user authentication event (for analytics)
    trackUserEvent('auth_success', {
      user_id: userData.id,
      email: userData.email,
      tier: userData.tier,
      is_new_user: !userData.isOnboarded
    })
  }

  const trackUserEvent = (event: string, data: any) => {
    // This would integrate with your analytics service
    console.log(`Analytics Event: ${event}`, data)
    
    // Store for batch sending to backend
    const events = JSON.parse(localStorage.getItem('r_analytics') || '[]')
    events.push({
      event,
      data,
      timestamp: new Date().toISOString(),
      session_id: getSessionId()
    })
    localStorage.setItem('r_analytics', JSON.stringify(events))
  }

  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('r_session_id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('r_session_id', sessionId)
    }
    return sessionId
  }

  const login = async (email: string, password: string): Promise<User> => {
    try {
      setIsLoading(true)
      
      // API call to login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Login failed')
      }

      const { user: userData, token, needsOnboarding } = await response.json()
      
      const user: User = {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        jobTitle: userData.jobTitle,
        company: userData.company,
        tier: userData.tier || 'free',
        isOnboarded: !needsOnboarding,
        createdAt: userData.createdAt
      }

      saveUserSession(user, token)
      return user
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string): Promise<User> => {
    try {
      setIsLoading(true)
      
      // API call to register
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Registration failed')
      }

      const { user: userData, token } = await response.json()
      
      const user: User = {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        jobTitle: userData.jobTitle,
        company: userData.company,
        tier: userData.tier || 'free',
        isOnboarded: false, // New users always need onboarding
        createdAt: userData.createdAt
      }

      saveUserSession(user, token)
      
      // Track registration conversion
      trackUserEvent('user_registered', {
        user_id: user.id,
        email: user.email,
        registration_method: 'email'
      })

      return user
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithGoogle = async (): Promise<{ user: User; needsOnboarding: boolean }> => {
    try {
      setIsLoading(true)
      
      // Initialize Google Auth
      if (!window.google?.accounts?.id) {
        throw new Error('Google OAuth not loaded')
      }

      // Get Google OAuth token
      const { credential } = await new Promise<{ credential: string }>((resolve, reject) => {
        if (!window.google?.accounts?.id) {
          reject(new Error('Google OAuth not available'))
          return
        }

        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          callback: resolve,
          auto_select: false,
          cancel_on_tap_outside: true
        })

        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            reject(new Error('Google OAuth cancelled'))
          }
        })
      })

      // Decode JWT token to get user info
      const payload = JSON.parse(atob(credential.split('.')[1]))
      
      // API call to authenticate with backend
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential, tokenPayload: payload }),
      })

      if (!response.ok) {
        throw new Error('Google authentication failed')
      }

      const { user: userData, isNewUser, needsOnboarding, token } = await response.json()
      
      const user: User = {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        jobTitle: userData.jobTitle,
        company: userData.company,
        tier: userData.tier || 'free',
        isOnboarded: !needsOnboarding,
        createdAt: userData.createdAt
      }

      saveUserSession(user, token)
      
      // Track Google authentication
      trackUserEvent(isNewUser ? 'user_registered' : 'user_login', {
        user_id: user.id,
        email: user.email,
        registration_method: 'google_oauth',
        is_new_user: isNewUser,
        needs_onboarding: needsOnboarding
      })

      return { user, needsOnboarding }
    } catch (error) {
      console.error('Google OAuth error:', error)
      throw new Error('Google authentication failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const completeOnboarding = async (data: OnboardingData): Promise<User> => {
    if (!user) throw new Error('No user found')

    try {
      setIsLoading(true)
      
      // Get current token to maintain session
      const currentToken = localStorage.getItem('r_token')
      if (!currentToken) {
        throw new Error('No authentication token found')
      }
      
      // API call to update user profile
      const response = await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
        body: JSON.stringify({
          onboardingData: data
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to complete onboarding')
      }

      const { user: updatedUserData } = await response.json()
      
      const updatedUser: User = {
        ...user,
        firstName: data.firstName,
        lastName: data.lastName,
        jobTitle: data.jobTitle,
        company: data.company,
        isOnboarded: true
      }

      // Get current token to maintain session
      const token = localStorage.getItem('r_token')
      if (token) {
        saveUserSession(updatedUser, token)
      } else {
        setUser(updatedUser)
      }
      
      // Track comprehensive onboarding data
      trackUserEvent('onboarding_completed', {
        user_id: user.id,
        email: user.email,
        profile_data: {
          job_title: data.jobTitle,
          company: data.company,
          company_size: data.companySize,
          industry: data.industry,
          hear_about_us: data.hearAboutUs,
          primary_use_case: data.primaryUseCase,
          experience_level: data.experienceLevel,
          interests: data.interests,
          marketing_consent: data.marketingConsent
        },
        onboarding_completion_time: new Date().toISOString()
      })
      
      // Track detailed user segmentation data
      trackUserEvent('user_segmentation', {
        user_id: user.id,
        segment_data: {
          company_size_category: getCategorizeCompanySize(data.companySize),
          industry_vertical: data.industry,
          experience_tier: getExperienceTier(data.experienceLevel),
          use_case_primary: data.primaryUseCase,
          acquisition_channel: getAcquisitionChannel(data.hearAboutUs),
          interest_profile: data.interests.join(','),
          b2b_indicator: data.company !== 'Freelancer' && data.company !== 'Personal'
        }
      })

      return updatedUser
    } catch (error) {
      console.error('Onboarding error:', error)
      throw new Error('Failed to complete onboarding. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    // Track logout event
    if (user) {
      trackUserEvent('user_logout', {
        user_id: user.id,
        session_duration: getSessionDuration()
      })
    }
    
    setUser(null)
    localStorage.removeItem('r_token')
    sessionStorage.removeItem('r_session_id')
  }

  // Helper functions for data categorization
  const getCategorizeCompanySize = (size: string) => {
    if (size.includes('Solo') || size.includes('Freelancer')) return 'individual'
    if (size.includes('Startup')) return 'startup'
    if (size.includes('Small')) return 'small_business'
    if (size.includes('Mid-size')) return 'mid_market'
    if (size.includes('Large') || size.includes('Corporation')) return 'enterprise'
    return 'unknown'
  }

  const getExperienceTier = (level: string) => {
    if (level.includes('New')) return 'beginner'
    if (level.includes('Some')) return 'intermediate'
    if (level.includes('Regular')) return 'advanced'
    if (level.includes('Expert')) return 'expert'
    return 'unknown'
  }

  const getAcquisitionChannel = (source: string) => {
    if (source.includes('Google')) return 'organic_search'
    if (source.includes('Social Media')) return 'social_media'
    if (source.includes('Friend') || source.includes('Colleague')) return 'referral'
    if (source.includes('YouTube')) return 'video_content'
    if (source.includes('Blog') || source.includes('Article')) return 'content_marketing'
    if (source.includes('Product Hunt')) return 'product_hunt'
    if (source.includes('Newsletter')) return 'email_marketing'
    if (source.includes('Conference') || source.includes('Event')) return 'events'
    return 'other'
  }

  const getSessionDuration = () => {
    const sessionStart = sessionStorage.getItem('r_session_start')
    if (sessionStart) {
      return Date.now() - parseInt(sessionStart)
    }
    return 0
  }

  // Set session start time
  useEffect(() => {
    if (!sessionStorage.getItem('r_session_start')) {
      sessionStorage.setItem('r_session_start', Date.now().toString())
    }
  }, [])

  const value = {
    user,
    isLoading,
    login,
    register,
    loginWithGoogle,
    completeOnboarding,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}