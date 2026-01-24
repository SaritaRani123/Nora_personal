'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Button from '@/ui/Button'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative pt-32 pb-40 sm:pb-44 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-success-subtle/50" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-success/10 rounded-full blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-info/5 via-transparent to-transparent" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-6"
          >
            <Sparkles className="w-4 h-4" />
            Expense & budget management, simplified
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 sm:mb-10 leading-tight"
          >
            <span className="block pb-2">Track spending.</span>
            <span className="block pb-3 bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
              Stay on budget.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-xl sm:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Smart expense tracking, budget calculator, and finance management—all in one place. Built for freelancers and businesses.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button as="link" href="/calendar" variant="primary" size="lg" className="group">
              Launch App
              <ArrowRight className="ml-2 w-5 h-5 inline-block group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button as="link" href="/auth/signup" variant="outline" size="lg">
              Start Free Trial
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-8 text-sm text-gray-500"
          >
            No credit card required · 14-day free trial · Cancel anytime
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
