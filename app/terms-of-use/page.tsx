'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Card from '@/ui/Card'

const sections = [
  {
    title: 'Acceptance of Terms',
    content: 'By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement.',
  },
  {
    title: 'Use License',
    content: 'Permission is granted to temporarily use our service for personal or commercial use. This is the grant of a license, not a transfer of title.',
  },
  {
    title: 'User Accounts',
    content: 'You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.',
  },
  {
    title: 'Prohibited Uses',
    content: 'You may not use our service in any way that causes damage or impairs the availability or accessibility of the service.',
  },
  {
    title: 'Limitation of Liability',
    content: 'In no event shall our company be liable for any damages arising out of the use or inability to use our service.',
  },
  {
    title: 'Changes to Terms',
    content: 'We reserve the right to modify these terms at any time. Your continued use of the service after any changes constitutes acceptance of the new terms.',
  },
]

export default function TermsOfUsePage() {
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
              Terms of Use
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
