'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Card from '@/ui/Card'
import { Shield, Lock, Eye, CheckCircle2 } from 'lucide-react'

const securityFeatures = [
  {
    icon: Shield,
    title: 'End-to-End Encryption',
    description: 'All data is encrypted in transit and at rest using industry-standard protocols.',
  },
  {
    icon: Lock,
    title: 'Secure Authentication',
    description: 'Multi-factor authentication and SSO options to keep your account secure.',
  },
  {
    icon: Eye,
    title: 'Privacy First',
    description: 'We never sell your data. Your information is yours and yours alone.',
  },
  {
    icon: CheckCircle2,
    title: 'Compliance',
    description: 'We meet GDPR, SOC 2, and other industry compliance standards.',
  },
]

export default function SecurityPage() {
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
              Security
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your data's security is our top priority
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {securityFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card>
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary-600" />
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
    </main>
  )
}
