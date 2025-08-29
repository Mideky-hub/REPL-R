'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface LogoProps {
  variant?: 'light' | 'dark' | 'clear'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  className?: string
  animated?: boolean
}

const sizeClasses = {
  sm: { logo: 'h-8 w-8', text: 'text-lg' },
  md: { logo: 'h-12 w-12', text: 'text-xl' },
  lg: { logo: 'h-20 w-20', text: 'text-3xl' },
  xl: { logo: 'h-32 w-32', text: 'text-5xl' }
}

export function Logo({ 
  variant = 'clear', 
  size = 'md', 
  showText = true, 
  className,
  animated = false 
}: LogoProps) {
  const logoFileName = variant === 'dark' 
    ? 'r_color_dark_no_bg.png'
    : 'r_color_clear_no_bg.png'

  const sizes = sizeClasses[size]

  const LogoWrapper = animated ? motion.div : 'div'
  const TextWrapper = animated ? motion.span : 'span'

  const logoAnimationProps = animated ? {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.6, ease: [0.4, 0.0, 0.2, 1] as any }
  } : {}

  const textAnimationProps = animated ? {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    transition: { delay: 0.3, duration: 0.6, ease: [0.4, 0.0, 0.2, 1] as any }
  } : {}

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <LogoWrapper
        className={cn('relative flex-shrink-0', sizes.logo)}
        {...logoAnimationProps}
      >
        <Image
          src={`/images/logo/${logoFileName}`}
          alt="R; Logo"
          fill
          className="object-contain"
          priority
        />
      </LogoWrapper>
      
      {showText && (
        <TextWrapper
          className={cn(
            'font-bold tracking-tight text-enhanced-contrast',
            sizes.text
          )}
          {...textAnimationProps}
        >
          ;
        </TextWrapper>
      )}
    </div>
  )
}

// Preset logo variants for common use cases
export function LogoNav() {
  return <Logo size="md" variant="clear" showText={false} />
}

export function LogoHero() {
  return <Logo size="xl" variant="clear" showText={false} animated={true} />
}

export function LogoCompact() {
  return <Logo size="sm" variant="clear" showText={false} />
}