'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Card from '@/ui/Card'

const sections = [
  {
    title: 'Information We Collect',
    content: 'We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.',
  },
  {
    title: 'How We Use Your Information',
    content: 'We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.',
  },
  {
    title: 'Information Sharing',
    content: 'We do not sell, trade, or rent your personal information to third parties. We may share information only as described in this policy.',
  },
  {
    title: 'Data Security',
    content: 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access.',
  },
  {
    title: 'Your Rights',
    content: 'You have the right to access, update, or delete your personal information at any time through your account settings.',
  },
  {
    title: 'Contact Us',
    content: 'If you have questions about this Privacy Policy, please contact us at privacy@momenteo.com.',
  },
]

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen pt-16">
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 via-white to-primary-50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-600">
              Last updated: March 2024
            </p>
          </motion.div>

          <div className="space-y-6">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    {section.title}
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    {section.content}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
