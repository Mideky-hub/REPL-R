'use client'

import { useEffect, useState } from 'react'

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

export default function GoogleScriptLoader() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Only run on client side after hydration
    if (!mounted || typeof window === 'undefined') return

    // Check if script already exists or is loading
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]')
    if (existingScript || window.googleScriptLoaded) {
      console.log('Google Identity Services script already loaded or loading')
      return
    }

    console.log('Loading Google Identity Services script...')

    // Create and load the script
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    
    script.onload = () => {
      console.log('Google Identity Services script loaded successfully')
      window.googleScriptLoaded = true
      
      // Wait a bit for Google services to initialize
      setTimeout(() => {
        if (window.google?.accounts?.id) {
          console.log('Google Identity Services API ready')
        } else {
          console.warn('Google Identity Services API not available after load')
        }
      }, 100)
    }
    
    script.onerror = (error) => {
      console.error('Failed to load Google Identity Services script:', error)
      window.googleScriptLoaded = false
    }
    
    document.head.appendChild(script)

    // Cleanup function
    return () => {
      // Don't remove the script as it might be needed by other components
    }
  }, [mounted])

  return null // This component doesn't render anything
}