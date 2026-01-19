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
  Store
} from 'lucide-react'

const useCases = [
  {
    icon: Briefcase,
    title: 'Consulting Firms',
    description: 'Manage client projects, track billable hours, and streamline invoicing for your consulting business.',
  },
  {
    icon: GraduationCap,
    title: 'Educational Institutions',
    description: 'Organize courses, manage student data, and track academic progress all in one platform.',
  },
  {
    icon: Building2,
    title: 'Real Estate',
    description: 'Handle property listings, client communications, and transaction management efficiently.',
  },
  {
    icon: Heart,
    title: 'Healthcare',
    description: 'Schedule appointments, manage patient records, and streamline administrative tasks.',
  },
  {
    icon: Code,
    title: 'Tech Startups',
    description: 'Track development sprints, manage team workflows, and monitor project milestones.',
  },
  {
    icon: Store,
    title: 'Retail & E-commerce',
    description: 'Manage inventory, track sales, and handle customer relationships seamlessly.',
  },
]

export default function UseCases() {
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
            Perfect for Every Industry
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See how businesses across different sectors use our platform
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon
            return (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card>
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
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
