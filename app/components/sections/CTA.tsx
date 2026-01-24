'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Button from '@/ui/Button'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function CTA() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-600 to-primary-700" />
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary-400/20 rounded-full blur-3xl" />

      <div className="max-w-4xl mx-auto relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 text-white/90 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Start tracking in minutes
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Ready to take control of your expenses?
          </h2>
          <p className="text-xl sm:text-2xl text-primary-100 mb-10 max-w-2xl mx-auto">
            Join freelancers and teams using Nora to track spending, manage budgets, and generate invoices.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              as="link"
              href="/calendar"
              variant="secondary"
              size="lg"
              className="group bg-white text-primary-600 hover:bg-gray-50 hover:text-primary-700"
            >
              Launch App
              <ArrowRight className="ml-2 w-5 h-5 inline-block group-hover:translate-x-1 transition-transform" />
            </Button>
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center px-6 py-3 text-lg font-medium border-2 border-white text-white rounded-xl hover:bg-white/10 transition-colors"
            >
              Start free trial
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
