'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Button from '@/ui/Button'
import { ArrowRight } from 'lucide-react'

export default function CTA() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-600 to-primary-700">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl sm:text-2xl text-primary-100 mb-10 max-w-2xl mx-auto">
            Join thousands of businesses already using our platform to streamline their operations.
          </p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              as="link"
              href="/auth/signup"
              variant="secondary"
              size="lg"
              className="group bg-white text-primary-600 hover:bg-gray-50"
            >
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5 inline-block group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white/10"
            >
              Contact Sales
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
