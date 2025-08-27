'use client'

import { Suspense, lazy, ReactNode } from 'react'
import { AnimatePresence } from 'framer-motion'

interface LazyModalProps {
  isOpen: boolean
  children: ReactNode
}

// Loading fallback component
const ModalSkeleton = () => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="glass rounded-2xl max-w-md w-full h-96 flex items-center justify-center">
      <div className="animate-pulse">
        <div className="w-8 h-8 bg-white/20 rounded-full animate-spin border-2 border-white/30 border-t-transparent"></div>
      </div>
    </div>
  </div>
)

export function LazyModal({ isOpen, children }: LazyModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <Suspense fallback={<ModalSkeleton />}>
          {children}
        </Suspense>
      )}
    </AnimatePresence>
  )
}

// Higher-order component for lazy loading modals
export function withLazyModal<T extends object>(
  ModalComponent: React.ComponentType<T>
) {
  const LazyModalComponent = lazy(() => 
    Promise.resolve({ default: ModalComponent })
  )
  
  return function LazyModalWrapper(props: T) {
    return (
      <Suspense fallback={<ModalSkeleton />}>
        <LazyModalComponent {...props} />
      </Suspense>
    )
  }
}