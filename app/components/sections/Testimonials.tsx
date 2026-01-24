'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Card from '@/ui/Card'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Freelance consultant',
    content: 'The calendar view and expense tracking saved me hours at tax time. Clean, simple, and it just works.',
    rating: 5,
    avatar: 'SJ',
    accent: 'primary',
  },
  {
    name: 'Michael Chen',
    role: 'Startup founder',
    content: 'We switched from spreadsheets to Nora. Calendar + expenses + invoices in one place. Game changer.',
    rating: 5,
    avatar: 'MC',
    accent: 'success',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Operations manager',
    content: 'Love the Momenteo-style layout. Easy to onboard the team, and the reports are actually useful.',
    rating: 5,
    avatar: 'ER',
    accent: 'info',
  },
]

const accentBg: Record<string, string> = {
  primary: 'bg-primary-50',
  success: 'bg-success-subtle',
  info: 'bg-info-subtle',
}

export default function Testimonials() {
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
            Loved by teams like yours
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See what freelancers and small teams say about Nora
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                hover={false}
                className={`h-full border-0 ${accentBg[testimonial.accent]}`}
              >
                <Quote className="w-8 h-8 text-primary-300 mb-4" />
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-warning fill-warning" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div className="flex items-center">
                  <div className="w-11 h-11 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-sm mr-3">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
