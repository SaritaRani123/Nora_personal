import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export default function Card({ children, className, hover = true }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
      className={cn(
        'bg-white rounded-xl shadow-md p-6 border border-gray-100',
        hover && 'hover:shadow-xl transition-shadow duration-200',
        className
      )}
    >
      {children}
    </motion.div>
  )
}
