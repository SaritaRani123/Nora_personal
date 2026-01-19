'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Card from '@/ui/Card'
import { Code2, Key, Webhook, Database } from 'lucide-react'

const apiSections = [
  {
    icon: Key,
    title: 'Authentication',
    description: 'Learn how to authenticate API requests',
  },
  {
    icon: Code2,
    title: 'Endpoints',
    description: 'Browse all available API endpoints',
  },
  {
    icon: Webhook,
    title: 'Webhooks',
    description: 'Set up webhooks for real-time updates',
  },
  {
    icon: Database,
    title: 'Data Models',
    description: 'Understand our data structures',
  },
]

export default function ApiReferencePage() {
  return (
    <main className="min-h-screen pt-16">
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 via-white to-primary-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-4">
              API Reference
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Complete API documentation for developers
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {apiSections.map((section, index) => {
              const Icon = section.icon
              return (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card>
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {section.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {section.description}
                    </p>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>
    </main>
  )
}
