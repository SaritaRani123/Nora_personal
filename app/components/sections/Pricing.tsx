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
      'Limited usage',
      'Basic features',
      'Community support',
      'Up to 3 team members',
      '5 projects',
      '1GB storage',
    ],
    popular: false,
    highlight: true,
  },
  {
    name: 'Pro',
    price: '$79',
    period: '/month',
    description: 'Ideal for growing businesses',
    features: [
      'Up to 25 team members',
      'Unlimited projects',
      '50GB storage',
      'Advanced analytics',
      'Priority support',
      'Custom integrations',
      'API access',
    ],
    popular: true,
    highlight: false,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations',
    features: [
      'Unlimited team members',
      'Unlimited projects',
      'Unlimited storage',
      'Custom analytics',
      '24/7 dedicated support',
      'Custom integrations',
      'API access',
      'SLA guarantee',
      'On-premise option',
    ],
    popular: false,
    highlight: false,
  },
]

export default function Pricing() {
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
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that's right for your business
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={plan.popular ? 'md:-mt-4 md:mb-4' : ''}
            >
              <Card
                className={`h-full flex flex-col ${
                  plan.highlight
                    ? 'border-2 border-green-500 shadow-xl relative bg-green-50'
                    : plan.popular
                    ? 'border-2 border-primary-600 shadow-xl relative'
                    : ''
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Free Forever
                    </span>
                  </div>
                )}
                {plan.popular && !plan.highlight && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-gray-600 ml-2">{plan.period}</span>
                  </div>
                </div>

                <ul className="flex-1 space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  as="link"
                  href={plan.name === 'Enterprise' ? '/contact' : '/auth/signup'}
                  variant={plan.highlight ? 'primary' : plan.popular ? 'primary' : 'outline'}
                  size="lg"
                  className="w-full"
                >
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12 text-gray-600"
        >
          All plans include a 14-day free trial. No credit card required.
        </motion.p>
      </div>
    </section>
  )
}
