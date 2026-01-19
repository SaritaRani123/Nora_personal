'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Users, Target, Award, Heart } from 'lucide-react'
import Card from '@/ui/Card'

const values = [
  {
    icon: Target,
    title: 'Our Mission',
    description: 'To empower businesses of all sizes with tools that simplify operations and drive growth.',
  },
  {
    icon: Users,
    title: 'Our Team',
    description: 'A diverse group of passionate professionals dedicated to building the best platform for you.',
  },
  {
    icon: Award,
    title: 'Our Values',
    description: 'We believe in transparency, innovation, and putting our customers first in everything we do.',
  },
  {
    icon: Heart,
    title: 'Our Commitment',
    description: 'Committed to providing exceptional service and continuously improving our platform.',
  },
]

export default function AboutPage() {
  return (
    <main className="min-h-screen pt-16">
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 via-white to-primary-50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6"
          >
            About Us
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-gray-600 leading-relaxed"
          >
            We're a team of innovators, designers, and developers who are passionate about 
            creating tools that help businesses thrive. Our platform was born from the need 
            to simplify complex business operations and make them accessible to everyone.
          </motion.p>
        </div>
      </section>

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
              What We Stand For
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card>
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {value.description}
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
