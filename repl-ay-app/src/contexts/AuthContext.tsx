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
  loginWithGoogle: () => Promise<User>
  completeOnboarding: (data: OnboardingData) => Promise<User>
  logout: () => void
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
        const storedUser = localStorage.getItem('r_user')
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error('Failed to restore session:', error)
        localStorage.removeItem('r_user')
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  const saveUserSession = (userData: User) => {
    setUser(userData)
    localStorage.setItem('r_user', JSON.stringify(userData))
    
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
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock user data - in real implementation, this would come from your API
      const userData: User = {
        id: `user_${Date.now()}`,
        email,
        firstName: 'John',
        lastName: 'Doe',
        jobTitle: 'Software Engineer',
        company: 'Acme Corp',
        tier: 'free',
        isOnboarded: true,
        createdAt: new Date().toISOString()
      }

      saveUserSession(userData)
      return userData
    } catch (error) {
      throw new Error('Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string): Promise<User> => {
    try {
      setIsLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Create new user - needs onboarding
      const userData: User = {
        id: `user_${Date.now()}`,
        email,
        tier: 'free',
        isOnboarded: false,
        createdAt: new Date().toISOString()
      }

      saveUserSession(userData)
      
      // Track registration conversion
      trackUserEvent('user_registered', {
        user_id: userData.id,
        email: userData.email,
        registration_method: 'email'
      })

      return userData
    } catch (error) {
      throw new Error('Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithGoogle = async (): Promise<User> => {
    try {
      setIsLoading(true)
      
      // Simulate Google OAuth API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate Google user data
      const isNewUser = Math.random() > 0.5 // 50% chance of new user
      const userData: User = {
        id: `google_user_${Date.now()}`,
        email: `user${Math.floor(Math.random() * 1000)}@gmail.com`,
        firstName: isNewUser ? undefined : 'Jane',
        lastName: isNewUser ? undefined : 'Smith',
        tier: 'free',
        isOnboarded: !isNewUser,
        createdAt: new Date().toISOString()
      }

      saveUserSession(userData)
      
      // Track Google authentication
      trackUserEvent(isNewUser ? 'user_registered' : 'user_login', {
        user_id: userData.id,
        email: userData.email,
        registration_method: 'google_oauth',
        is_new_user: isNewUser
      })

      return userData
    } catch (error) {
      throw new Error('Google authentication failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const completeOnboarding = async (data: OnboardingData): Promise<User> => {
    if (!user) throw new Error('No user found')

    try {
      setIsLoading(true)
      
      // Simulate API call to update user profile
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const updatedUser: User = {
        ...user,
        firstName: data.firstName,
        lastName: data.lastName,
        jobTitle: data.jobTitle,
        company: data.company,
        isOnboarded: true
      }

      saveUserSession(updatedUser)
      
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
    localStorage.removeItem('r_user')
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