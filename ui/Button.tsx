import React, { forwardRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

interface BaseButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
}

interface ButtonAsButton extends BaseButtonProps, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  as?: 'button'
  href?: never
  children: React.ReactNode
}

interface ButtonAsLink extends BaseButtonProps, Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'href'> {
  as: 'link'
  href: string
  children: React.ReactNode
}

type ButtonProps = ButtonAsButton | ButtonAsLink

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, as, href, ...props }, ref) => {
    const baseStyles = 'font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center'
    
    const variants = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-md hover:shadow-lg',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
      outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
    }
    
    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    }
    
    const classes = cn(baseStyles, variants[variant], sizes[size], className)
    
    if (as === 'link' && href) {
      return (
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link
            href={href}
            className={classes}
            ref={ref as React.ForwardedRef<HTMLAnchorElement>}
            {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
          >
            {children}
          </Link>
        </motion.div>
      )
    }
    
    const buttonProps = props as React.ButtonHTMLAttributes<HTMLButtonElement>
    
    return (
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-block">
        <button
          className={classes}
          ref={ref as React.ForwardedRef<HTMLButtonElement>}
          {...buttonProps}
        >
          {children}
        </button>
      </motion.div>
    )
  }
)

Button.displayName = 'Button'

export default Button
