'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Card from '@/ui/Card'
import { BookOpen, Code, Settings, Zap } from 'lucide-react'

const docCategories = [
  {
    icon: BookOpen,
    title: 'Getting Started',
    description: 'Learn the basics and set up your account',
  },
  {
    icon: Code,
    title: 'API Reference',
    description: 'Complete API documentation and examples',
    href: '/api-reference',
  },
  {
    icon: Settings,
    title: 'Configuration',
    description: 'Customize your workspace and preferences',
  },
  {
    icon: Zap,
    title: 'Integrations',
    description: 'Connect with your favorite tools',
  },
]

export default function DocsPage() {
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
              Documentation
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about using our platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {docCategories.map((category, index) => {
              const Icon = category.icon
              return (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card>
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {category.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {category.description}
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
