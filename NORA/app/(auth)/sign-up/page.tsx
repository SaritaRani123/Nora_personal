'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Sparkles, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Check,
  Building2,
  User,
  Calendar,
  Users,
  CreditCard,
  Banknote,
  Wallet,
  ChevronRight,
  CheckCircle2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

type AuthView = 'login' | 'signup'
type OnboardingStep = 0 | 1 | 2 | 3 | 4

const businessCategories = [
  'Retail & E-commerce',
  'Professional Services',
  'Food & Beverage',
  'Healthcare',
  'Technology',
  'Construction',
  'Real Estate',
  'Education',
  'Manufacturing',
  'Transportation',
  'Other',
]

const legalStructures = [
  'Sole Proprietorship',
  'Partnership',
  'Limited Liability Company (LLC)',
  'Corporation (C-Corp)',
  'S Corporation (S-Corp)',
  'Non-profit',
]

const customerRanges = [
  '1-10 customers',
  '11-50 customers',
  '51-200 customers',
  '201-500 customers',
  '500+ customers',
]

const paymentMethods = [
  { id: 'card', label: 'Credit/Debit Card', icon: CreditCard },
  { id: 'bank', label: 'Bank Transfer', icon: Building2 },
  { id: 'cash', label: 'Cash', icon: Banknote },
  { id: 'digital', label: 'Digital Wallets', icon: Wallet },
]

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for getting started',
    features: ['Up to 50 transactions/month', 'Basic reports', 'Email support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For growing businesses',
    features: ['Unlimited transactions', 'Advanced analytics', 'Priority support', 'Multi-user access'],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$99',
    period: '/month',
    description: 'For large organizations',
    features: ['Everything in Pro', 'Custom integrations', 'Dedicated account manager', 'API access'],
  },
]

export default function AuthPage() {
  const router = useRouter()
  const [authView, setAuthView] = useState<AuthView>('signup')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>(0)
  const [isOnboarding, setIsOnboarding] = useState(false)

  // Form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authMethod, setAuthMethod] = useState<'email' | 'google'>('email')
  
  // Onboarding data
  const [fullName, setFullName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [businessCategory, setBusinessCategory] = useState('')
  const [legalStructure, setLegalStructure] = useState('')
  const [businessStartDate, setBusinessStartDate] = useState('')
  const [customerRange, setCustomerRange] = useState('')
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([])
  const [selectedPlan, setSelectedPlan] = useState('free')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      router.push('/dashboard')
    }, 1000)
  }

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setAuthMethod('email')
    setTimeout(() => {
      setIsLoading(false)
      setIsOnboarding(true)
      setOnboardingStep(1)
    }, 800)
  }

  const handleGoogleSignUp = () => {
    setIsLoading(true)
    setAuthMethod('google')
    setEmail('user@gmail.com')
    setTimeout(() => {
      setIsLoading(false)
      setIsOnboarding(true)
      setOnboardingStep(1)
    }, 800)
  }

  const nextStep = () => {
    if (onboardingStep < 4) {
      setOnboardingStep((prev) => (prev + 1) as OnboardingStep)
    }
  }

  const prevStep = () => {
    if (onboardingStep > 1) {
      setOnboardingStep((prev) => (prev - 1) as OnboardingStep)
    }
  }

  const finishOnboarding = () => {
    setIsLoading(true)
    setTimeout(() => {
      router.push('/dashboard')
    }, 500)
  }

  const togglePaymentMethod = (methodId: string) => {
    setSelectedPaymentMethods(prev => 
      prev.includes(methodId) 
        ? prev.filter(id => id !== methodId)
        : [...prev, methodId]
    )
  }

  // Progress indicator for onboarding
  const OnboardingProgress = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all duration-300 ${
              step < onboardingStep
                ? 'bg-primary text-primary-foreground'
                : step === onboardingStep
                  ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                  : 'bg-muted text-muted-foreground'
            }`}
          >
            {step < onboardingStep ? <Check className="h-4 w-4" /> : step}
          </div>
          {step < 4 && (
            <div
              className={`h-0.5 w-8 mx-1 transition-all duration-300 ${
                step < onboardingStep ? 'bg-primary' : 'bg-muted'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )

  // Onboarding Step 1: Account Confirmation
  const renderStep1 = () => (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
      </div>
      <div>
        <h2 className="text-xl font-semibold text-foreground">Account Created Successfully</h2>
        <p className="mt-2 text-muted-foreground">Your account has been set up and is ready to go.</p>
      </div>
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Email</span>
          <span className="text-sm font-medium text-foreground">{email}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Auth Method</span>
          <span className="text-sm font-medium text-foreground capitalize flex items-center gap-2">
            {authMethod === 'google' ? (
              <>
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                Email & Password
              </>
            )}
          </span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Let&apos;s set up your business profile to get started.
      </p>
    </div>
  )

  // Onboarding Step 2: Welcome & Basic Info
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground">Welcome to Nora</h2>
        <p className="mt-1 text-muted-foreground">Tell us about yourself and your business</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className="pl-10"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="businessName">Business Name</Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Acme Inc."
              className="pl-10"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Business Category</Label>
          <Select value={businessCategory} onValueChange={setBusinessCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {businessCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Legal Structure</Label>
          <Select value={legalStructure} onValueChange={setLegalStructure}>
            <SelectTrigger>
              <SelectValue placeholder="Select legal structure" />
            </SelectTrigger>
            <SelectContent>
              {legalStructures.map((structure) => (
                <SelectItem key={structure} value={structure}>
                  {structure}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )

  // Onboarding Step 3: About the Business
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground">About Your Business</h2>
        <p className="mt-1 text-muted-foreground">Help us understand your operations better</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">When did your business start?</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="startDate"
              type="month"
              value={businessStartDate}
              onChange={(e) => setBusinessStartDate(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Customer Range</Label>
          <Select value={customerRange} onValueChange={setCustomerRange}>
            <SelectTrigger>
              <Users className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Select customer range" />
            </SelectTrigger>
            <SelectContent>
              {customerRanges.map((range) => (
                <SelectItem key={range} value={range}>
                  {range}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-3">
          <Label>Payment Methods Accepted</Label>
          <div className="grid grid-cols-2 gap-3">
            {paymentMethods.map((method) => {
              const Icon = method.icon
              const isSelected = selectedPaymentMethods.includes(method.id)
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => togglePaymentMethod(method.id)}
                  className={`flex items-center gap-3 rounded-lg border-2 p-3 transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className={`rounded-md p-1.5 ${isSelected ? 'bg-primary/10' : 'bg-muted'}`}>
                    <Icon className={`h-4 w-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <span className={`text-sm font-medium ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {method.label}
                  </span>
                  {isSelected && <Check className="h-4 w-4 text-primary ml-auto" />}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )

  // Onboarding Step 4: Thank You & Plan Selection
  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-foreground">You&apos;re All Set!</h2>
        <p className="mt-1 text-muted-foreground">Thank you for setting up your account. Choose a plan to get started.</p>
      </div>
      <div className="space-y-3">
        {plans.map((plan) => (
          <button
            key={plan.id}
            type="button"
            onClick={() => setSelectedPlan(plan.id)}
            className={`relative w-full rounded-lg border-2 p-4 text-left transition-all ${
              selectedPlan === plan.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-2.5 right-4 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                Popular
              </div>
            )}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-foreground">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
            </div>
            <ul className="mt-3 space-y-1">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
            {selectedPlan === plan.id && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )

  // Render onboarding flow
  if (isOnboarding) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Nora</h1>
          </div>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <OnboardingProgress />
              
              {onboardingStep === 1 && renderStep1()}
              {onboardingStep === 2 && renderStep2()}
              {onboardingStep === 3 && renderStep3()}
              {onboardingStep === 4 && renderStep4()}

              <div className="mt-8 flex gap-3">
                {onboardingStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    className="flex-1 bg-transparent"
                  >
                    Back
                  </Button>
                )}
                {onboardingStep < 4 ? (
                  <Button onClick={nextStep} className="flex-1">
                    Continue
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={finishOnboarding} className="flex-1" disabled={isLoading}>
                    {isLoading ? 'Setting up...' : 'Go to Dashboard'}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Login / Sign Up View
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
            <Sparkles className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Nora</h1>
          <p className="mt-1 text-muted-foreground">AI-Powered Business Expense Tracker</p>
        </div>

        <Card className="bg-card border-border">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-card-foreground">
              {authView === 'login' ? 'Welcome back' : 'Create an account'}
            </CardTitle>
            <CardDescription>
              {authView === 'login'
                ? 'Sign in to manage your business finances'
                : 'Start managing your business finances today'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Toggle between Login and Sign Up */}
            <div className="mb-6 flex rounded-lg bg-muted p-1">
              <button
                onClick={() => setAuthView('login')}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                  authView === 'login'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setAuthView('signup')}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                  authView === 'signup'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Sign Up
              </button>
            </div>

            {authView === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="loginEmail">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="loginEmail"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@business.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loginPassword">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="loginPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-muted-foreground">
                    <Checkbox />
                    <span>Remember me</span>
                  </label>
                  <a href="#" className="text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Login'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                {/* Google Sign Up */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={handleGoogleSignUp}
                  disabled={isLoading}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
                  </div>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signupEmail">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="signupEmail"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@business.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupPassword">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="signupPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a password"
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    By signing up, you agree to our{' '}
                    <a href="#" className="text-primary hover:underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-primary hover:underline">
                      Privacy Policy
                    </a>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Create Account'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Secure, AI-powered expense management for small businesses
        </p>
      </div>
    </div>
  )
}
