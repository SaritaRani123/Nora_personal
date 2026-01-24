'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, ArrowRight, Calendar, Receipt, FileText } from 'lucide-react'

const steps = [
  {
    number: '01',
    title: 'Launch the app',
    description: 'Open Nora and head to the calendar or expense list. No setup required.',
    icon: Calendar,
    accent: 'primary',
  },
  {
    number: '02',
    title: 'Log your expenses',
    description: 'Add expenses by date. Pick a category, vendor, amount, and payment method.',
    icon: Receipt,
    accent: 'success',
  },
  {
    number: '03',
    title: 'Use week & month views',
    description: 'Switch between calendar views to see weekly or monthly updates at a glance.',
    icon: CheckCircle2,
    accent: 'info',
  },
  {
    number: '04',
    title: 'Generate invoices',
    description: 'Download expense receipts or invoices for your records and taxes.',
    icon: FileText,
    accent: 'warning',
  },
]

const accentBg: Record<string, string> = {
  primary: 'bg-primary-50 text-primary-600',
  success: 'bg-success-subtle text-success',
  info: 'bg-info-subtle text-info',
  warning: 'bg-warning-subtle text-warning',
}

export default function HowItWorks() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            How it works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get started in minutes—no complex setup
          </p>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200 transform -translate-y-1/2" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all relative z-10">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${accentBg[step.accent]}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-bold text-gray-200">{step.number}</span>
                    <h3 className="text-lg font-semibold text-gray-900 mt-2 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      {step.description}
                    </p>
                    {index < steps.length - 1 && (
                      <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20">
                        <ArrowRight className="w-5 h-5 text-primary-400" />
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
