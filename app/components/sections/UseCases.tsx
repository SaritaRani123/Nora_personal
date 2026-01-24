'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Card from '@/ui/Card'
import {
  Briefcase,
  GraduationCap,
  Building2,
  Heart,
  Code,
  Store,
} from 'lucide-react'

const useCases = [
  {
    icon: Briefcase,
    title: 'Consulting & freelancing',
    description: 'Track billable expenses, log by project, and generate invoices for clients.',
    accent: 'primary',
  },
  {
    icon: GraduationCap,
    title: 'Education & training',
    description: 'Manage course-related spending, travel, and supplies in one place.',
    accent: 'info',
  },
  {
    icon: Building2,
    title: 'Real estate',
    description: 'Record property expenses, maintenance, and marketing costs by date.',
    accent: 'success',
  },
  {
    icon: Heart,
    title: 'Healthcare',
    description: 'Track medical and office expenses for tax and reimbursement.',
    accent: 'danger',
  },
  {
    icon: Code,
    title: 'Tech & startups',
    description: 'Monitor SaaS, tools, and team expenses with calendar and reports.',
    accent: 'warning',
  },
  {
    icon: Store,
    title: 'Retail & e‑commerce',
    description: 'Log inventory, shipping, and operational costs for better budgeting.',
    accent: 'secondary',
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

export default function UseCases() {
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
            Built for every workflow
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Freelancers, teams, and small businesses use Nora to stay on budget
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon
            return (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              >
                <Card className="h-full hover:shadow-lg hover:border-primary-100 transition-all duration-300">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${accentClasses[useCase.accent]}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {useCase.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {useCase.description}
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
