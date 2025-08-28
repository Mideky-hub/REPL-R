'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, Building2, Briefcase, Users, Globe, Zap, Loader2, CheckCircle } from 'lucide-react'

interface OnboardingData {
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

interface UserOnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (data: OnboardingData) => void
  userEmail: string
}

const COMPANY_SIZES = [
  'Solo/Freelancer',
  'Startup (2-10 employees)',
  'Small Business (11-50 employees)',
  'Mid-size (51-200 employees)', 
  'Large Enterprise (201-1000 employees)',
  'Corporation (1000+ employees)'
]

const INDUSTRIES = [
  'Technology/Software',
  'Marketing/Advertising',
  'Education',
  'Healthcare',
  'Finance/Banking',
  'E-commerce/Retail',
  'Consulting',
  'Manufacturing',
  'Media/Entertainment',
  'Non-profit',
  'Government',
  'Other'
]

const REFERRAL_SOURCES = [
  'Google Search',
  'Social Media (Twitter/X)',
  'Social Media (LinkedIn)',
  'Social Media (Other)',
  'YouTube',
  'Blog/Article',
  'Friend/Colleague',
  'Conference/Event',
  'Product Hunt',
  'AI Newsletter',
  'Other'
]

const USE_CASES = [
  'Content Creation',
  'Code Development',
  'Research & Analysis',
  'Customer Support',
  'Marketing Automation',
  'Business Strategy',
  'Personal Productivity',
  'Education/Learning',
  'Creative Projects',
  'Other'
]

const EXPERIENCE_LEVELS = [
  'New to AI',
  'Some AI Experience',
  'Regular AI User',
  'AI Expert/Developer'
]

const INTEREST_AREAS = [
  'GPT/Chat Models',
  'Code Generation',
  'Image Creation',
  'Data Analysis',
  'Automation',
  'Business Intelligence',
  'Research Tools',
  'Creative Writing'
]

export default function UserOnboardingModal({ 
  isOpen, 
  onClose, 
  onComplete, 
  userEmail 
}: UserOnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<OnboardingData>({
    firstName: '',
    lastName: '',
    jobTitle: '',
    company: '',
    companySize: '',
    industry: '',
    hearAboutUs: '',
    primaryUseCase: '',
    experienceLevel: '',
    interests: [],
    marketingConsent: true
  })

  const totalSteps = 4

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      // Complete setup
      setIsLoading(true)
      setError('')
      
      try {
        await onComplete(formData)
        setShowSuccess(true)
        
        // Show success message for 2 seconds before closing
        setTimeout(() => {
          setShowSuccess(false)
          setIsLoading(false)
          onClose()
        }, 2000)
      } catch (err: any) {
        setError(err.message || 'Failed to complete setup. Please try again.')
        setIsLoading(false)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updateFormData = (field: keyof OnboardingData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.firstName && formData.lastName && formData.jobTitle
      case 2:
        return formData.company && formData.companySize && formData.industry
      case 3:
        return formData.hearAboutUs && formData.primaryUseCase && formData.experienceLevel
      case 4:
        return true // Optional step
      default:
        return false
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Personal Information'
      case 2: return 'Company Details'
      case 3: return 'Usage & Background'
      case 4: return 'Interests & Preferences'
      default: return 'Welcome'
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => updateFormData('firstName', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => updateFormData('lastName', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                  placeholder="Smith"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                value={formData.jobTitle}
                onChange={(e) => updateFormData('jobTitle', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                placeholder="Software Engineer, Marketing Manager, CEO, etc."
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => updateFormData('company', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                placeholder="Acme Corp, Freelancer, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Company Size *
              </label>
              <select
                value={formData.companySize}
                onChange={(e) => updateFormData('companySize', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
              >
                <option value="">Select company size</option>
                {COMPANY_SIZES.map((size) => (
                  <option key={size} value={size} className="bg-gray-900">
                    {size}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Industry *
              </label>
              <select
                value={formData.industry}
                onChange={(e) => updateFormData('industry', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
              >
                <option value="">Select your industry</option>
                {INDUSTRIES.map((industry) => (
                  <option key={industry} value={industry} className="bg-gray-900">
                    {industry}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                How did you hear about us? *
              </label>
              <select
                value={formData.hearAboutUs}
                onChange={(e) => updateFormData('hearAboutUs', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
              >
                <option value="">Select source</option>
                {REFERRAL_SOURCES.map((source) => (
                  <option key={source} value={source} className="bg-gray-900">
                    {source}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Primary Use Case *
              </label>
              <select
                value={formData.primaryUseCase}
                onChange={(e) => updateFormData('primaryUseCase', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
              >
                <option value="">What will you use R; for?</option>
                {USE_CASES.map((useCase) => (
                  <option key={useCase} value={useCase} className="bg-gray-900">
                    {useCase}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                AI Experience Level *
              </label>
              <select
                value={formData.experienceLevel}
                onChange={(e) => updateFormData('experienceLevel', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
              >
                <option value="">Select your experience level</option>
                {EXPERIENCE_LEVELS.map((level) => (
                  <option key={level} value={level} className="bg-gray-900">
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">
                Areas of Interest (select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {INTEREST_AREAS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-4 py-3 rounded-lg border transition-all text-sm font-medium ${
                      formData.interests.includes(interest)
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-white/10">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={formData.marketingConsent}
                  onChange={(e) => updateFormData('marketingConsent', e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 bg-transparent border-white/20 rounded focus:ring-blue-500/50"
                />
                <span className="text-sm text-gray-300">
                  I agree to receive product updates, feature announcements, and marketing communications. You can unsubscribe at any time.
                </span>
              </label>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gradient-to-br from-green-50/95 via-emerald-50/90 to-teal-50/95 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white/95 backdrop-blur-sm rounded-2xl border border-green-100/50 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          >
            
            {/* Success Overlay */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 bg-green-50/98 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10"
                >
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <CheckCircle className="w-10 h-10 text-white" />
                    </motion.div>
                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-2xl font-bold text-green-700 mb-2"
                    >
                      Welcome to R;!
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="text-green-600"
                    >
                      Your account has been set up successfully
                    </motion.p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Header */}
            <div className="px-8 py-6 border-b border-green-100/50 bg-gradient-to-r from-green-50/50 to-emerald-50/50">
              <button
                onClick={onClose}
                className="absolute right-6 top-6 p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-enhanced" />
              </button>
              
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 glass rounded-xl flex items-center justify-center border border-white/30">
                  <Users className="w-5 h-5 text-enhanced" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-enhanced-contrast">
                    Welcome to R;
                  </h2>
                  <p className="text-enhanced text-sm">{userEmail}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-enhanced-contrast">
                  {getStepTitle()}
                </span>
                <span className="text-sm text-enhanced">
                  Step {currentStep} of {totalSteps}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <motion.div
                  className="h-2 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, #D4A373 0%, #FAEDCD 50%, #CCD5AE 100%)',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Content */}
            <div className="px-8 py-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderStepContent()}
              </motion.div>
              
              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50/80 border border-red-200/50 text-red-700 px-4 py-3 rounded-xl text-sm backdrop-blur-sm"
                >
                  {error}
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-white/10 flex justify-between">
              {currentStep > 1 ? (
                <button
                  onClick={handleBack}
                  className="px-6 py-3 border border-white/20 text-gray-300 rounded-xl hover:bg-white/5 transition-all"
                >
                  Back
                </button>
              ) : (
                <div />
              )}
                <motion.button
                onClick={handleNext}
                disabled={!isStepValid() || isLoading}
                whileHover={{ scale: isStepValid() && !isLoading ? 1.02 : 1 }}
                whileTap={{ scale: isStepValid() && !isLoading ? 0.98 : 1 }}
                className={`px-6 py-3 rounded-xl font-medium flex items-center space-x-2 transition-all shadow-lg border border-white/20 ${
                  isStepValid() && !isLoading
                    ? 'glass hover:bg-white/20 text-enhanced-contrast'
                    : 'bg-gray-400/50 text-enhanced cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Setting up your account...</span>
                  </>
                ) : (
                  <>
                    <span>{currentStep === totalSteps ? 'Complete Setup' : 'Continue'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}