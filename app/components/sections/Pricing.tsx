'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Card from '@/ui/Card'
import Button from '@/ui/Button'
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for getting started',
    features: [
      'Calendar & expense tracking',
      'Up to 50 expenses/month',
      'Invoice generation',
      'Week & month views',
      'Export as text',
    ],
    popular: false,
    highlight: true,
    accent: 'success',
  },
  {
    name: 'Pro',
    price: '$12',
    period: '/month',
    description: 'Ideal for freelancers',
    features: [
      'Unlimited expenses',
      'Advanced reports',
      'Priority support',
      'Custom categories',
      'API access',
      'Team collaboration',
    ],
    popular: true,
    highlight: false,
    accent: 'primary',
  },
  {
    name: 'Team',
    price: 'Custom',
    period: '',
    description: 'For growing teams',
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'Custom branding',
      'Dedicated support',
      'SLA guarantee',
    ],
    popular: false,
    highlight: false,
    accent: 'info',
  },
]

export default function Pricing() {
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
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start free. Upgrade when you need more.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={plan.popular ? 'md:-mt-2 md:mb-2' : ''}
            >
              <Card
                hover={false}
                className={`relative h-full flex flex-col ${
                  plan.highlight
                    ? 'border-2 border-success shadow-lg bg-success-subtle/30'
                    : plan.popular
                    ? 'border-2 border-primary-500 shadow-xl ring-2 ring-primary-100'
                    : 'border border-gray-200'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <span className="bg-success text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Free forever
                    </span>
                  </div>
                )}
                {plan.popular && !plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Most popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500 ml-1 text-sm">{plan.period}</span>
                  </div>
                </div>

                <ul className="flex-1 space-y-3 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  as="link"
                  href={plan.name === 'Team' ? '/contact' : '/auth/signup'}
                  variant={plan.highlight ? 'primary' : plan.popular ? 'primary' : 'outline'}
                  size="lg"
                  className="w-full"
                >
                  {plan.name === 'Team' ? 'Contact us' : 'Get started'}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-10 text-gray-500 text-sm"
        >
          All paid plans include a 14-day free trial. No credit card required.
        </motion.p>
      </div>
    </section>
  )
}
