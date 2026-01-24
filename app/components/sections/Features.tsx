'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Card from '@/ui/Card'
import {
  Zap,
  Shield,
  BarChart3,
  Users,
  Calendar,
  FileText,
} from 'lucide-react'

const features = [
  {
    icon: Calendar,
    title: 'Calendar View',
    description: 'See expenses by week or month. Add and edit entries right from the calendar—just like Momenteo.',
    accent: 'primary',
  },
  {
    icon: Zap,
    title: 'Quick Expense Tracking',
    description: 'Log expenses fast with categories, vendors, and payment methods. Generate receipts and invoices on the go.',
    accent: 'warning',
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    description: 'Your data stays safe with encryption and regular backups. Built for freelancers and small teams.',
    accent: 'success',
  },
  {
    icon: BarChart3,
    title: 'Reports & Insights',
    description: 'Weekly and monthly summaries. Understand where your money goes and plan your budget better.',
    accent: 'info',
  },
  {
    icon: Users,
    title: 'Simple Collaboration',
    description: 'Share access with your accountant or team. Export data for taxes and reconciliation.',
    accent: 'secondary',
  },
  {
    icon: FileText,
    title: 'Invoice Generation',
    description: 'Turn expenses into professional invoices. Download as text or print for your records.',
    accent: 'danger',
  },
]

const accentClasses: Record<string, string> = {
  primary: 'bg-primary-50 text-primary-600',
  success: 'bg-success-subtle text-success',
  info: 'bg-info-subtle text-info',
  warning: 'bg-warning-subtle text-warning',
  danger: 'bg-danger-subtle text-danger',
  secondary: 'bg-secondary-subtle text-secondary',
}

export default function Features() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Everything you need
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Expense tracking, calendar view, and invoices—all in one clean, colourful interface
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              >
                <Card className="h-full hover:shadow-lg hover:border-primary-100 transition-all duration-300">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${accentClasses[feature.accent]}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
