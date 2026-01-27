'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  FileCheck,
  Receipt,
  DollarSign,
  Users,
  AlertTriangle,
  Landmark,
  Clock,
  Car,
  Repeat,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  X,
  Filter,
  BarChart3,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Building2,
  Check,
  RotateCcw,
  Utensils,
  Plane,
  Home,
  Briefcase,
  ShoppingBag,
  Zap,
  Save,
  CalendarClock,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useDataStore } from '@/lib/data-store'

// Extended event data for Momenteo-style calendar
const initialCalendarEvents: any[] = [
  {
    id: '1',
    title: 'Web Development - ABC Corp',
    date: '2025-01-25',
    type: 'work',
    amount: 450.0,
    hours: 6,
    client: 'ABC Corporation',
    paymentMethod: 'bank',
    taxDeductible: false,
  },
  {
    id: '2',
    title: 'Invoice INV-002 Due',
    date: '2025-01-30',
    type: 'invoice',
    amount: 2500.0,
    client: 'XYZ Ltd',
  },
  {
    id: '3',
    title: 'Quarterly Tax Payment',
    date: '2025-01-31',
    type: 'tax',
    amount: 3500.0,
    taxDeductible: true,
  },
  {
    id: '4',
    title: 'Office Supplies',
    date: '2025-01-24',
    type: 'expense',
    amount: 156.0,
    category: 'Office Expenses',
    paymentMethod: 'credit',
    taxDeductible: true,
  },
  {
    id: '5',
    title: 'Client Meeting - Tech Inc',
    date: '2025-01-27',
    type: 'meeting',
    client: 'Tech Innovations',
  },
  {
    id: '6',
    title: 'Drive to Client Office',
    date: '2025-01-27',
    type: 'travel',
    amount: 45.0,
    kilometers: 85,
    client: 'Tech Innovations',
    taxDeductible: true,
  },
  {
    id: '7',
    title: 'Consulting Session',
    date: '2025-01-28',
    type: 'work',
    amount: 300.0,
    hours: 4,
    client: 'StartUp Ventures',
    paymentMethod: 'bank',
  },
  {
    id: '8',
    title: 'Software Subscription',
    date: '2025-01-20',
    type: 'expense',
    amount: 49.99,
    category: 'Software',
    paymentMethod: 'credit',
    taxDeductible: true,
  },
  {
    id: '9',
    title: 'Design Work',
    date: '2025-01-25',
    type: 'work',
    amount: 200.0,
    hours: 2.5,
    client: 'Global Services',
  },
  {
    id: '10',
    title: 'Invoice INV-005 Paid',
    date: '2025-01-18',
    type: 'income',
    amount: 4200.0,
    client: 'StartUp Ventures',
  },
  {
    id: '11',
    title: 'Lunch Meeting',
    date: '2025-01-26',
    type: 'expense',
    amount: 65.0,
    category: 'Food & Dining',
    paymentMethod: 'cash',
    taxDeductible: false,
  },
  {
    id: '12',
    title: 'Project Milestone',
    date: '2025-01-29',
    type: 'work',
    amount: 800.0,
    hours: 8,
    client: 'ABC Corporation',
    paymentMethod: 'bank',
  },
]

const eventTypeConfig = {
  work: { label: 'Work Done', icon: Clock, color: 'bg-primary text-primary-foreground', dotColor: 'bg-primary' },
  expense: { label: 'Expense', icon: Receipt, color: 'bg-destructive/90 text-destructive-foreground', dotColor: 'bg-destructive' },
  income: { label: 'Income', icon: DollarSign, color: 'bg-success text-success-foreground', dotColor: 'bg-success' },
  invoice: { label: 'Invoice', icon: FileCheck, color: 'bg-chart-2 text-white', dotColor: 'bg-chart-2' },
  meeting: { label: 'Meeting', icon: Users, color: 'bg-chart-4 text-chart-4-foreground', dotColor: 'bg-chart-4' },
  travel: { label: 'Travel', icon: Car, color: 'bg-chart-5 text-chart-5-foreground', dotColor: 'bg-chart-5' },
  tax: { label: 'Tax', icon: Landmark, color: 'bg-orange-500 text-white', dotColor: 'bg-orange-500' },
  overdue: { label: 'Overdue', icon: AlertTriangle, color: 'bg-destructive text-destructive-foreground', dotColor: 'bg-destructive' },
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Filter options
const CATEGORIES = [
  { id: 'office', label: 'Office Expenses', icon: Building2 },
  { id: 'software', label: 'Software', icon: Zap },
  { id: 'food', label: 'Food & Dining', icon: Utensils },
  { id: 'travel', label: 'Travel', icon: Plane },
  { id: 'rent', label: 'Rent', icon: Home },
  { id: 'marketing', label: 'Marketing', icon: Briefcase },
  { id: 'supplies', label: 'Supplies', icon: ShoppingBag },
]

const CLIENTS = [
  { id: 'abc', label: 'ABC Corporation' },
  { id: 'xyz', label: 'XYZ Ltd' },
  { id: 'tech', label: 'Tech Innovations' },
  { id: 'startup', label: 'StartUp Ventures' },
  { id: 'global', label: 'Global Services' },
]

const PAYMENT_METHODS = [
  { id: 'credit', label: 'Credit Card' },
  { id: 'debit', label: 'Debit Card' },
  { id: 'cash', label: 'Cash' },
  { id: 'bank', label: 'Bank Transfer' },
  { id: 'paypal', label: 'PayPal' },
]

type ViewMode = 'month' | 'week' | 'agenda'

interface FilterState {
  types: string[]
  categories: string[]
  clients: string[]
  paymentMethods: string[]
  taxDeductible: boolean | null
}

interface CalendarEvent {
  id: string
  title: string
  date: string
  type: string
  amount?: number
  hours?: number
  client?: string
  category?: string
  kilometers?: number
  paymentMethod?: string
  taxDeductible?: boolean
}

// Upcoming events data (invoices, subscriptions, planned expenses, expected income)
const upcomingEventsData = [
  {
    id: 'up1',
    title: 'Invoice INV-002',
    date: '2025-01-30',
    type: 'invoice',
    amount: 2500,
    client: 'XYZ Ltd',
    status: 'due_soon',
  },
  {
    id: 'up2',
    title: 'Adobe Creative Cloud',
    date: '2025-02-01',
    type: 'subscription',
    amount: 54.99,
    recurring: true,
  },
  {
    id: 'up3',
    title: 'Office Rent',
    date: '2025-02-01',
    type: 'planned_expense',
    amount: 1200,
    category: 'Rent',
  },
  {
    id: 'up4',
    title: 'Project Payment - ABC',
    date: '2025-02-05',
    type: 'expected_income',
    amount: 3500,
    client: 'ABC Corporation',
  },
  {
    id: 'up5',
    title: 'Invoice INV-001',
    date: '2025-01-20',
    type: 'invoice',
    amount: 1800,
    client: 'Tech Innovations',
    status: 'overdue',
  },
  {
    id: 'up6',
    title: 'Slack Subscription',
    date: '2025-02-03',
    type: 'subscription',
    amount: 12.50,
    recurring: true,
  },
  {
    id: 'up7',
    title: 'Quarterly Tax',
    date: '2025-01-31',
    type: 'planned_expense',
    amount: 3500,
    category: 'Tax',
    status: 'due_soon',
  },
]

const upcomingTypeConfig = {
  invoice: { label: 'Invoice Due', icon: FileCheck, color: 'text-chart-2' },
  subscription: { label: 'Subscription', icon: Repeat, color: 'text-primary' },
  planned_expense: { label: 'Planned Expense', icon: Receipt, color: 'text-destructive' },
  expected_income: { label: 'Expected Income', icon: DollarSign, color: 'text-success' },
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 25))
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date(2025, 0, 25))
  const [isAddEventOpen, setIsAddEventOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(initialCalendarEvents)

  // Data store hooks for cross-page data consistency
  const { addExpense, addInvoice, contacts, addContact } = useDataStore()

  // State for adding new client inline
  const [isAddingClient, setIsAddingClient] = useState(false)
  const [newClientName, setNewClientName] = useState('')
  
  // Advanced filter state
  const [filters, setFilters] = useState<FilterState>({
    types: ['work', 'expense', 'income', 'invoice', 'meeting', 'travel', 'tax'],
    categories: [],
    clients: [],
    paymentMethods: [],
    taxDeductible: null,
  })
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Quick add popover for date click
  const [quickAddDate, setQuickAddDate] = useState<Date | null>(null)
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)

  // Inline edit state
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)

  const [newEntry, setNewEntry] = useState({
    type: 'work',
    title: '',
    client: '',
    amount: '',
    hours: '',
    kilometers: '',
    category: '',
    notes: '',
    repeat: false,
    paymentMethod: '',
    taxDeductible: false,
  })

  const [activeFilters, setActiveFilters] = useState(['work', 'expense', 'income', 'invoice', 'meeting', 'travel', 'tax'])
  
  // Mobile/responsive state
  const [isMobile, setIsMobile] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Auto-switch to agenda view on mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile && viewMode === 'month') {
        setViewMode('agenda')
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [viewMode])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const days: { date: Date; isCurrentMonth: boolean }[] = []

    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      })
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      })
    }

    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      })
    }

    return days
  }, [year, month])

  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate)
    const day = startOfWeek.getDay()
    startOfWeek.setDate(startOfWeek.getDate() - day)

    const days: Date[] = []
    for (let i = 0; i < 7; i++) {
      days.push(new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + i))
    }
    return days
  }, [currentDate])

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return calendarEvents.filter((event) => {
      // Type filter
      if (!filters.types.includes(event.type)) return false
      
      // Category filter (if categories selected)
      if (filters.categories.length > 0 && event.category) {
        const categoryMatch = filters.categories.some(cat => 
          event.category?.toLowerCase().includes(cat.toLowerCase())
        )
        if (!categoryMatch) return false
      }
      
      // Client filter (if clients selected)
      if (filters.clients.length > 0 && event.client) {
        const clientMatch = filters.clients.some(client => 
          CLIENTS.find(c => c.id === client)?.label === event.client
        )
        if (!clientMatch) return false
      }
      
      // Payment method filter
      if (filters.paymentMethods.length > 0 && event.paymentMethod) {
        if (!filters.paymentMethods.includes(event.paymentMethod)) return false
      }
      
      // Tax deductible filter
      if (filters.taxDeductible !== null) {
        if (event.taxDeductible !== filters.taxDeductible) return false
      }
      
      return event.date === dateStr
    })
  }

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : []

  // Get events for agenda view (next 14 days)
  const agendaEvents = useMemo(() => {
    const events: { date: Date; events: CalendarEvent[] }[] = []
    const startDate = new Date(2025, 0, 25)
    for (let i = 0; i < 14; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      const dayEvents = getEventsForDate(date)
      if (dayEvents.length > 0) {
        events.push({ date, events: dayEvents })
      }
    }
    return events
  }, [calendarEvents, filters])

  const monthStats = useMemo(() => {
    const monthEvents = calendarEvents.filter((event) => {
      const eventDate = new Date(event.date)
      return eventDate.getMonth() === month && eventDate.getFullYear() === year
    })

    return {
      workDone: monthEvents.filter((e) => e.type === 'work').reduce((sum, e) => sum + (e.amount || 0), 0),
      expenses: monthEvents.filter((e) => e.type === 'expense').reduce((sum, e) => sum + (e.amount || 0), 0),
      income: monthEvents.filter((e) => e.type === 'income').reduce((sum, e) => sum + (e.amount || 0), 0),
      hoursWorked: monthEvents.filter((e) => e.type === 'work').reduce((sum, e) => sum + (e.hours || 0), 0),
    }
  }, [month, year, calendarEvents])

  // Calculate insights based on filtered events
  const insights = useMemo(() => {
    const monthEvents = calendarEvents.filter((event) => {
      const eventDate = new Date(event.date)
      return eventDate.getMonth() === month && eventDate.getFullYear() === year
    })

    // Group expenses by day
    const expensesByDay: Record<string, number> = {}
    const incomeByDay: Record<string, number> = {}
    
    monthEvents.forEach((event) => {
      if (event.type === 'expense' && event.amount) {
        expensesByDay[event.date] = (expensesByDay[event.date] || 0) + event.amount
      }
      if ((event.type === 'income' || event.type === 'work') && event.amount) {
        incomeByDay[event.date] = (incomeByDay[event.date] || 0) + event.amount
      }
    })

    // Find most expensive day
    let mostExpensiveDay = { date: '', amount: 0 }
    Object.entries(expensesByDay).forEach(([date, amount]) => {
      if (amount > mostExpensiveDay.amount) {
        mostExpensiveDay = { date, amount }
      }
    })

    // Find best earning day
    let bestEarningDay = { date: '', amount: 0 }
    Object.entries(incomeByDay).forEach(([date, amount]) => {
      if (amount > bestEarningDay.amount) {
        bestEarningDay = { date, amount }
      }
    })

    // Calculate weekly spending
    const weeklySpending: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    monthEvents.forEach((event) => {
      if (event.type === 'expense' && event.amount) {
        const eventDate = new Date(event.date)
        const weekNum = Math.ceil(eventDate.getDate() / 7)
        weeklySpending[weekNum] = (weeklySpending[weekNum] || 0) + event.amount
      }
    })

    // Find lowest spending week
    let lowestSpendingWeek = { week: 0, amount: Infinity }
    Object.entries(weeklySpending).forEach(([week, amount]) => {
      if (amount < lowestSpendingWeek.amount && amount > 0) {
        lowestSpendingWeek = { week: parseInt(week), amount }
      }
    })
    if (lowestSpendingWeek.amount === Infinity) {
      lowestSpendingWeek = { week: 1, amount: 0 }
    }

    return {
      mostExpensiveDay,
      bestEarningDay,
      lowestSpendingWeek,
    }
  }, [month, year, calendarEvents, filters])

  // Get upcoming events sorted by urgency
  const sortedUpcomingEvents = useMemo(() => {
    const today = new Date(2025, 0, 25)
    return upcomingEventsData
      .map((event) => {
        const eventDate = new Date(event.date)
        const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        let urgency: 'overdue' | 'due_soon' | 'upcoming' = 'upcoming'
        if (daysUntil < 0) urgency = 'overdue'
        else if (daysUntil <= 7) urgency = 'due_soon'
        return { ...event, daysUntil, urgency: event.status || urgency }
      })
      .sort((a, b) => {
        const urgencyOrder = { overdue: 0, due_soon: 1, upcoming: 2 }
        if (urgencyOrder[a.urgency as keyof typeof urgencyOrder] !== urgencyOrder[b.urgency as keyof typeof urgencyOrder]) {
          return urgencyOrder[a.urgency as keyof typeof urgencyOrder] - urgencyOrder[b.urgency as keyof typeof urgencyOrder]
        }
        return a.daysUntil - b.daysUntil
      })
  }, [])

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + (direction === 'next' ? 1 : -1), 1))
    } else {
      const newDate = new Date(currentDate)
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
      setCurrentDate(newDate)
    }
  }

  const goToToday = () => {
    setCurrentDate(new Date(2025, 0, 25))
    setSelectedDate(new Date(2025, 0, 25))
  }

  const isToday = (date: Date) => {
    const today = new Date(2025, 0, 25)
    return date.toDateString() === today.toDateString()
  }

  const toggleTypeFilter = (type: string) => {
    setFilters((prev) => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type],
    }))
  }

  const toggleCategoryFilter = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }))
  }

  const toggleClientFilter = (client: string) => {
    setFilters((prev) => ({
      ...prev,
      clients: prev.clients.includes(client)
        ? prev.clients.filter((c) => c !== client)
        : [...prev.clients, client],
    }))
  }

  const togglePaymentMethodFilter = (method: string) => {
    setFilters((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter((m) => m !== method)
        : [...prev.paymentMethods, method],
    }))
  }

  const resetFilters = () => {
    setFilters({
      types: ['work', 'expense', 'income', 'invoice', 'meeting', 'travel', 'tax'],
      categories: [],
      clients: [],
      paymentMethods: [],
      taxDeductible: null,
    })
  }

  const activeFilterCount = 
    (filters.types.length < 7 ? 1 : 0) +
    (filters.categories.length > 0 ? 1 : 0) +
    (filters.clients.length > 0 ? 1 : 0) +
    (filters.paymentMethods.length > 0 ? 1 : 0) +
    (filters.taxDeductible !== null ? 1 : 0)

const handleAddEntry = () => {
    if (newEntry.title) {
      const eventDate = selectedDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        title: newEntry.title,
        date: eventDate,
        type: newEntry.type,
        amount: newEntry.amount ? parseFloat(newEntry.amount) : undefined,
        hours: newEntry.hours ? parseFloat(newEntry.hours) : undefined,
        client: newEntry.client || undefined,
        category: newEntry.category || undefined,
        kilometers: newEntry.kilometers ? parseFloat(newEntry.kilometers) : undefined,
        paymentMethod: newEntry.paymentMethod || undefined,
        taxDeductible: newEntry.taxDeductible,
      }
      setCalendarEvents((prev) => [...prev, newEvent])

      // Sync with data store for cross-page consistency
      if (newEntry.type === 'expense' || newEntry.type === 'travel') {
        addExpense({
          date: eventDate,
          description: newEntry.title,
          category: newEntry.category || (newEntry.type === 'travel' ? 'travel' : 'office'),
          amount: newEntry.amount ? parseFloat(newEntry.amount) : 0,
          paymentMethod: newEntry.paymentMethod === 'credit' ? 'Credit Card' : newEntry.paymentMethod === 'debit' ? 'Debit Card' : 'Bank Transfer',
          aiSuggested: false,
          confidence: 100,
          status: 'pending',
          source: 'calendar',
        })
      } else if (newEntry.type === 'invoice' && newEntry.client) {
        addInvoice({
          client: newEntry.client,
          email: '',
          amount: newEntry.amount ? parseFloat(newEntry.amount) : 0,
          status: 'pending',
          issueDate: eventDate,
          dueDate: eventDate,
          paidDate: null,
          source: 'calendar',
        })
      }
    }
    setIsAddEventOpen(false)
    resetNewEntry()
  }

  const resetNewEntry = () => {
    setNewEntry({
      type: 'work',
      title: '',
      client: '',
      amount: '',
      hours: '',
      kilometers: '',
      category: '',
      notes: '',
      repeat: false,
      paymentMethod: '',
      taxDeductible: false,
    })
  }

  const handleQuickAdd = (type: string) => {
    if (quickAddDate) {
      setSelectedDate(quickAddDate)
      setNewEntry({ ...newEntry, type })
      setIsQuickAddOpen(false)
      setIsAddEventOpen(true)
    }
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setQuickAddDate(date)
    setIsQuickAddOpen(true)
  }

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event)
    setIsEditSheetOpen(true)
  }

  const handleSaveEdit = () => {
    if (editingEvent) {
      setCalendarEvents((prev) =>
        prev.map((e) => (e.id === editingEvent.id ? editingEvent : e))
      )
      setIsEditSheetOpen(false)
      setEditingEvent(null)
    }
  }

  const handleDeleteEvent = (eventId: string) => {
    setCalendarEvents((prev) => prev.filter((e) => e.id !== eventId))
    setIsEditSheetOpen(false)
    setEditingEvent(null)
  }

  const [isStatsOpen, setIsStatsOpen] = useState(false)

  const toggleFilter = (key: string) => {
    setActiveFilters((prev) => {
      if (prev.includes(key)) {
        return prev.filter((filter) => filter !== key)
      } else {
        return [...prev, key]
      }
    })
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-[calc(100vh-4rem)] flex-col">
        {/* Compact Header with Inline Stats */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2 md:gap-4 md:px-4 md:py-3">
          {/* Left: Navigation */}
          <div className="flex items-center gap-1 md:gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="min-w-[100px] text-center text-sm font-semibold text-foreground md:min-w-[140px] md:text-lg">
              {viewMode === 'month'
                ? `${MONTHS[month]} ${year}`
                : viewMode === 'week'
                  ? `Week of ${weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                  : 'Upcoming Events'}
            </h1>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateMonth('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="ml-1 h-8 bg-transparent md:ml-2" onClick={goToToday}>
              Today
            </Button>
          </div>

          {/* Center: Inline Stats - Hidden on mobile/tablet */}
          <div className="hidden items-center gap-4 xl:flex">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/20">
                <Clock className="h-3 w-3 text-primary" />
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Work:</span>{' '}
                <span className="font-medium">${monthStats.workDone.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-destructive/20">
                <Receipt className="h-3 w-3 text-destructive" />
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Expenses:</span>{' '}
                <span className="font-medium">${monthStats.expenses.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-success/20">
                <DollarSign className="h-3 w-3 text-success" />
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Income:</span>{' '}
                <span className="font-medium">${monthStats.income.toLocaleString()}</span>
              </div>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex cursor-help items-center gap-2 rounded-md bg-muted/50 px-2 py-1">
                  <TrendingUp className="h-3 w-3 text-success" />
                  <div className="text-sm">
                    <span className="text-muted-foreground">Net:</span>{' '}
                    <span className="font-semibold text-success">
                      ${(monthStats.workDone + monthStats.income - monthStats.expenses).toLocaleString()}
                    </span>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>Work + Income - Expenses</TooltipContent>
            </Tooltip>
          </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile Stats Drawer Trigger */}
          <Sheet open={isStatsOpen} onOpenChange={setIsStatsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 bg-transparent xl:hidden">
                <BarChart3 className="mr-2 h-4 w-4" />
                Stats
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto max-h-[60vh]">
              <SheetHeader className="pb-4">
                <SheetTitle>Monthly Summary</SheetTitle>
                <SheetDescription>{MONTHS[month]} {year} financial overview</SheetDescription>
              </SheetHeader>
              <div className="grid grid-cols-2 gap-3 pb-4">
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-center gap-2">
                    <div className="rounded-md bg-primary p-1.5">
                      <Clock className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="text-xs text-muted-foreground">Work Done</span>
                  </div>
                  <p className="mt-2 text-xl font-bold">${monthStats.workDone.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{monthStats.hoursWorked}h logged</p>
                </div>
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                  <div className="flex items-center gap-2">
                    <div className="rounded-md bg-destructive p-1.5">
                      <Receipt className="h-4 w-4 text-destructive-foreground" />
                    </div>
                    <span className="text-xs text-muted-foreground">Expenses</span>
                  </div>
                  <p className="mt-2 text-xl font-bold">${monthStats.expenses.toLocaleString()}</p>
                </div>
                <div className="rounded-lg border border-success/20 bg-success/5 p-4">
                  <div className="flex items-center gap-2">
                    <div className="rounded-md bg-success p-1.5">
                      <DollarSign className="h-4 w-4 text-success-foreground" />
                    </div>
                    <span className="text-xs text-muted-foreground">Income</span>
                  </div>
                  <p className="mt-2 text-xl font-bold">${monthStats.income.toLocaleString()}</p>
                </div>
                <div className="rounded-lg border border-chart-2/20 bg-chart-2/5 p-4">
                  <div className="flex items-center gap-2">
                    <div className="rounded-md bg-chart-2 p-1.5">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs text-muted-foreground">Net</span>
                  </div>
                  <p className="mt-2 text-xl font-bold text-success">
                    ${(monthStats.workDone + monthStats.income - monthStats.expenses).toLocaleString()}
                  </p>
                </div>
              </div>
              {/* Quick Add in Sheet */}
              <div className="border-t border-border pt-4">
                <p className="mb-3 text-sm font-medium">Quick Add</p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { type: 'work', icon: Clock, label: 'Work' },
                    { type: 'expense', icon: Receipt, label: 'Expense' },
                    { type: 'travel', icon: Car, label: 'Travel' },
                    { type: 'meeting', icon: Users, label: 'Meeting' },
                  ].map((item) => {
                    const config = eventTypeConfig[item.type as keyof typeof eventTypeConfig]
                    return (
                      <Button
                        key={item.type}
                        variant="outline"
                        className="h-auto flex-col gap-1 bg-transparent py-3"
                        onClick={() => {
                          setNewEntry({ ...newEntry, type: item.type })
                          setIsStatsOpen(false)
                          setIsAddEventOpen(true)
                        }}
                      >
                        <div className={`rounded p-1.5 ${config.color}`}>
                          <item.icon className="h-4 w-4" />
                        </div>
                        <span className="text-xs">{item.label}</span>
                      </Button>
                    )
                  })}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList className="h-8">
              <TabsTrigger value="month" className="hidden px-2 text-xs md:inline-flex md:px-3">
                Month
              </TabsTrigger>
              <TabsTrigger value="week" className="hidden px-2 text-xs md:inline-flex md:px-3">
                Week
              </TabsTrigger>
              <TabsTrigger value="agenda" className="px-2 text-xs md:px-3">
                Agenda
              </TabsTrigger>
            </TabsList>
          </Tabs>
          {/* Advanced Filter Popover */}
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 bg-transparent">
                <Filter className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">Filter</span>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h4 className="text-sm font-semibold">Filters</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground"
                  onClick={resetFilters}
                >
                  <RotateCcw className="mr-1.5 h-3 w-3" />
                  Reset
                </Button>
              </div>
              <ScrollArea className="h-[400px]">
                <div className="p-4 space-y-4">
                  {/* Entry Types */}
                  <div>
                    <h5 className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Entry Type</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(eventTypeConfig).map(([key, config]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => toggleTypeFilter(key)}
                          className={`flex items-center gap-2 rounded-md border px-3 py-2 text-xs transition-colors ${
                            filters.types.includes(key)
                              ? 'border-primary bg-primary/10 text-foreground'
                              : 'border-border bg-transparent text-muted-foreground hover:border-primary/50'
                          }`}
                        >
                          <div className={`h-2 w-2 rounded-full ${config.dotColor}`} />
                          {config.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Categories */}
                  <div>
                    <h5 className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Category</h5>
                    <div className="space-y-1">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => toggleCategoryFilter(cat.id)}
                          className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs transition-colors ${
                            filters.categories.includes(cat.id)
                              ? 'bg-primary/10 text-foreground'
                              : 'text-muted-foreground hover:bg-accent/50'
                          }`}
                        >
                          <cat.icon className="h-3.5 w-3.5" />
                          {cat.label}
                          {filters.categories.includes(cat.id) && (
                            <Check className="ml-auto h-3.5 w-3.5 text-primary" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Clients */}
                  <div>
                    <h5 className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Client</h5>
                    <div className="space-y-1">
                      {CLIENTS.map((client) => (
                        <button
                          key={client.id}
                          type="button"
                          onClick={() => toggleClientFilter(client.id)}
                          className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs transition-colors ${
                            filters.clients.includes(client.id)
                              ? 'bg-primary/10 text-foreground'
                              : 'text-muted-foreground hover:bg-accent/50'
                          }`}
                        >
                          <Building2 className="h-3.5 w-3.5" />
                          {client.label}
                          {filters.clients.includes(client.id) && (
                            <Check className="ml-auto h-3.5 w-3.5 text-primary" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Payment Methods */}
                  <div>
                    <h5 className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Payment Method</h5>
                    <div className="flex flex-wrap gap-2">
                      {PAYMENT_METHODS.map((method) => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => togglePaymentMethodFilter(method.id)}
                          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                            filters.paymentMethods.includes(method.id)
                              ? 'border-primary bg-primary/10 text-foreground'
                              : 'border-border bg-transparent text-muted-foreground hover:border-primary/50'
                          }`}
                        >
                          <CreditCard className="h-3 w-3" />
                          {method.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Tax Deductible */}
                  <div>
                    <h5 className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Tax Deductible</h5>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFilters((prev) => ({ ...prev, taxDeductible: prev.taxDeductible === true ? null : true }))}
                        className={`flex-1 rounded-md border py-2 text-xs transition-colors ${
                          filters.taxDeductible === true
                            ? 'border-success bg-success/10 text-success'
                            : 'border-border text-muted-foreground hover:border-success/50'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilters((prev) => ({ ...prev, taxDeductible: prev.taxDeductible === false ? null : false }))}
                        className={`flex-1 rounded-md border py-2 text-xs transition-colors ${
                          filters.taxDeductible === false
                            ? 'border-destructive bg-destructive/10 text-destructive'
                            : 'border-border text-muted-foreground hover:border-destructive/50'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
          <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8">
                <Plus className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">Add Entry</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Entry</DialogTitle>
                <DialogDescription>
                  Add work done, expenses, or travels to your calendar
                </DialogDescription>
              </DialogHeader>

              {/* Entry Type Tabs */}
              <Tabs value={newEntry.type} onValueChange={(v) => setNewEntry({ ...newEntry, type: v })}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="work" className="gap-1 text-xs">
                    <Clock className="h-3 w-3" />
                    Work
                  </TabsTrigger>
                  <TabsTrigger value="expense" className="gap-1 text-xs">
                    <Receipt className="h-3 w-3" />
                    Expense
                  </TabsTrigger>
                  <TabsTrigger value="travel" className="gap-1 text-xs">
                    <Car className="h-3 w-3" />
                    Travel
                  </TabsTrigger>
                  <TabsTrigger value="meeting" className="gap-1 text-xs">
                    <Users className="h-3 w-3" />
                    Meeting
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="grid gap-4 py-4">
                {/* Date */}
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    defaultValue={selectedDate?.toISOString().split('T')[0]}
                  />
                </div>

                  {/* Work Done Fields */}
                  {newEntry.type === 'work' && (
                    <>
                      <div className="space-y-2">
                        <Label>Client</Label>
                        {isAddingClient ? (
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter client name"
                              value={newClientName}
                              onChange={(e) => setNewClientName(e.target.value)}
                              autoFocus
                            />
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => {
                                if (newClientName.trim()) {
                                  addContact({
                                    name: newClientName.trim(),
                                    email: '',
                                    phone: '',
                                    address: '',
                                  })
                                  setNewEntry({ ...newEntry, client: newClientName.trim() })
                                  setNewClientName('')
                                  setIsAddingClient(false)
                                }
                              }}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setIsAddingClient(false)
                                setNewClientName('')
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Select value={newEntry.client} onValueChange={(v) => {
                            if (v === '__add_new__') {
                              setIsAddingClient(true)
                            } else {
                              setNewEntry({ ...newEntry, client: v })
                            }
                          }}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a client" />
                            </SelectTrigger>
                            <SelectContent>
                              {contacts.map((contact) => (
                                <SelectItem key={contact.id} value={contact.name}>
                                  {contact.name}
                                </SelectItem>
                              ))}
                              <SelectItem value="__add_new__" className="text-primary">
                                <span className="flex items-center gap-2">
                                  <Plus className="h-3 w-3" />
                                  Add new client
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        placeholder="What did you work on?"
                        value={newEntry.title}
                        onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Hours Worked</Label>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="0"
                          value={newEntry.hours}
                          onChange={(e) => setNewEntry({ ...newEntry, hours: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Hourly Rate ($)</Label>
                        <Input
                          type="number"
                          placeholder="75"
                          value={newEntry.amount}
                          onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Expense Fields */}
                {newEntry.type === 'expense' && (
                  <>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        placeholder="What was the expense for?"
                        value={newEntry.title}
                        onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Amount ($)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={newEntry.amount}
                          onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={newEntry.category} onValueChange={(v) => setNewEntry({ ...newEntry, category: v })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="office">Office Expenses</SelectItem>
                            <SelectItem value="software">Software</SelectItem>
                            <SelectItem value="food">Food & Dining</SelectItem>
                            <SelectItem value="fuel">Fuel</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                      <div className="space-y-2">
                        <Label>Client (optional)</Label>
                        <Select value={newEntry.client} onValueChange={(v) => {
                          if (v === '__add_new__') {
                            setIsAddingClient(true)
                          } else {
                            setNewEntry({ ...newEntry, client: v })
                          }
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Bill to client?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No client</SelectItem>
                            {contacts.map((contact) => (
                              <SelectItem key={contact.id} value={contact.name}>
                                {contact.name}
                              </SelectItem>
                            ))}
                            <SelectItem value="__add_new__" className="text-primary">
                              <span className="flex items-center gap-2">
                                <Plus className="h-3 w-3" />
                                Add new client
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {/* Travel Fields */}
                {newEntry.type === 'travel' && (
                  <>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        placeholder="Where did you go?"
                        value={newEntry.title}
                        onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Kilometers</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={newEntry.kilometers}
                          onChange={(e) => setNewEntry({ ...newEntry, kilometers: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Rate per km ($)</Label>
                        <Input type="number" step="0.01" placeholder="0.58" defaultValue="0.58" />
                      </div>
                    </div>
                      <div className="space-y-2">
                        <Label>Client</Label>
                        <Select value={newEntry.client} onValueChange={(v) => {
                          if (v === '__add_new__') {
                            setIsAddingClient(true)
                          } else {
                            setNewEntry({ ...newEntry, client: v })
                          }
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Bill to client?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="expense">Track as expense</SelectItem>
                            {contacts.map((contact) => (
                              <SelectItem key={contact.id} value={contact.name}>
                                {contact.name}
                              </SelectItem>
                            ))}
                            <SelectItem value="__add_new__" className="text-primary">
                              <span className="flex items-center gap-2">
                                <Plus className="h-3 w-3" />
                                Add new client
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {/* Meeting Fields */}
                {newEntry.type === 'meeting' && (
                  <>
                    <div className="space-y-2">
                      <Label>Meeting Title</Label>
                      <Input
                        placeholder="What is the meeting about?"
                        value={newEntry.title}
                        onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                        <Label>Client</Label>
                        <Select
                          value={newEntry.client}
                          onValueChange={(v) => {
                            if (v === '__add_new__') {
                              setIsAddingClient(true)
                            } else {
                              setNewEntry({ ...newEntry, client: v })
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a client" />
                          </SelectTrigger>
                          <SelectContent>
                            {contacts.map((contact) => (
                              <SelectItem key={contact.id} value={contact.name}>
                                {contact.name}
                              </SelectItem>
                            ))}
                            <SelectItem value="__add_new__" className="text-primary">
                              <span className="flex items-center gap-2">
                                <Plus className="h-3 w-3" />
                                Add new client
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Notes</Label>
                        <Textarea placeholder="Meeting agenda or notes..."
                        rows={2}
                        value={newEntry.notes}
                        onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {/* Repeat Option */}
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2">
                    <Repeat className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Repeat this entry</p>
                      <p className="text-xs text-muted-foreground">Create recurring entries</p>
                    </div>
                  </div>
                  <Switch
                    checked={newEntry.repeat}
                    onCheckedChange={(checked) => setNewEntry({ ...newEntry, repeat: checked })}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddEventOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddEntry}>Add Entry</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Calendar & Sidebar - Calendar is now the primary element */}
      <div className="flex flex-1 gap-2 overflow-hidden p-2 pt-0 md:gap-4 md:p-4">
        {/* Calendar - Primary Element */}
        <Card className="flex flex-1 flex-col overflow-hidden border-border/50">
          <CardContent className="flex-1 overflow-auto p-0">
            {/* Agenda View - Mobile Friendly */}
            {viewMode === 'agenda' ? (
              <ScrollArea className="h-full">
                <div className="space-y-3 p-3 md:p-4">
                  {agendaEvents.length === 0 ? (
                    <div className="py-12 text-center">
                      <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <p className="mt-4 text-sm text-muted-foreground">No upcoming events</p>
                      <Button size="sm" className="mt-4" onClick={() => setIsAddEventOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Entry
                      </Button>
                    </div>
                  ) : (
                    agendaEvents.map(({ date, events }) => (
                      <div key={date.toISOString()} className="space-y-2">
                        <div className="sticky top-0 z-10 flex items-center gap-2 bg-card/95 py-2 backdrop-blur">
                          <div
                            className={`flex h-10 w-10 flex-col items-center justify-center rounded-lg ${
                              isToday(date) ? 'bg-primary text-primary-foreground' : 'bg-muted'
                            }`}
                          >
                            <span className="text-[10px] uppercase">{DAYS[date.getDay()]}</span>
                            <span className="text-sm font-bold">{date.getDate()}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {events.length} {events.length === 1 ? 'entry' : 'entries'}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2 pl-12">
                          {events.map((event) => {
                            const config = eventTypeConfig[event.type as keyof typeof eventTypeConfig]
                            const Icon = config.icon
                            return (
                              <button
                                key={event.id}
                                type="button"
                                onClick={() => handleEditEvent(event)}
                                className="group flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-accent/30"
                              >
                                <div className={`rounded-md p-2 ${config.color}`}>
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium">{event.title}</p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    {event.client && <span>{event.client}</span>}
                                    {event.hours && <span>{event.hours}h</span>}
                                  </div>
                                </div>
                                {event.amount && (
                                  <p className="text-sm font-semibold">${event.amount.toLocaleString()}</p>
                                )}
                                <Pencil className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            ) : viewMode === 'month' ? (
              <div className="flex h-full flex-col">
                {/* Day Headers */}
                <div className="sticky top-0 z-10 grid grid-cols-7 border-b border-border bg-card">
                  {DAYS.map((day) => (
                    <div
                      key={day}
                      className="border-r border-border p-2 text-center text-xs font-medium text-muted-foreground last:border-r-0"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid - Expanded */}
                <div className="grid flex-1 grid-cols-7 grid-rows-6">
                  {calendarDays.map((day, index) => {
                    const events = getEventsForDate(day.date)
                    const isSelected = selectedDate?.toDateString() === day.date.toDateString()
                    const isQuickAddTarget = quickAddDate?.toDateString() === day.date.toDateString()

                    return (
                      <Popover
                        key={index}
                        open={isQuickAddOpen && isQuickAddTarget}
                        onOpenChange={(open) => {
                          if (!open) setIsQuickAddOpen(false)
                        }}
                      >
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            onClick={() => handleDateClick(day.date)}
                            className={`
                              relative flex flex-col border-b border-r border-border p-1.5 text-left transition-colors last:border-r-0 hover:bg-accent/30
                              ${!day.isCurrentMonth ? 'bg-muted/20' : 'bg-card'}
                              ${isSelected ? 'ring-2 ring-inset ring-primary' : ''}
                            `}
                          >
                            <span
                              className={`
                                inline-flex h-7 w-7 items-center justify-center rounded-full text-sm
                                ${isToday(day.date) ? 'bg-primary font-semibold text-primary-foreground' : ''}
                                ${!day.isCurrentMonth ? 'text-muted-foreground/50' : 'text-foreground'}
                              `}
                            >
                              {day.date.getDate()}
                            </span>
                            <div className="mt-1 flex-1 space-y-0.5 overflow-hidden">
                              {events.slice(0, 4).map((event) => {
                                const config = eventTypeConfig[event.type as keyof typeof eventTypeConfig]
                                return (
                                  <button
                                    key={event.id}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleEditEvent(event)
                                    }}
                                    className={`w-full truncate rounded px-1.5 py-0.5 text-left text-[11px] leading-tight transition-opacity hover:opacity-80 ${config.color}`}
                                  >
                                    {event.amount ? `$${event.amount}` : ''} {event.title}
                                  </button>
                                )
                              })}
                              {events.length > 4 && (
                                <div className="px-1 text-[10px] text-muted-foreground">+{events.length - 4} more</div>
                              )}
                            </div>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-0" align="start">
                          <div className="border-b border-border px-4 py-3">
                            <p className="text-sm font-medium">
                              {day.date.toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                            <p className="text-xs text-muted-foreground">Add new entry</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2 p-3">
                            {[
                              { type: 'income', icon: DollarSign, label: 'Income' },
                              { type: 'expense', icon: Receipt, label: 'Expense' },
                              { type: 'invoice', icon: FileCheck, label: 'Invoice' },
                              { type: 'work', icon: Clock, label: 'Work Log' },
                            ].map((item) => {
                              const config = eventTypeConfig[item.type as keyof typeof eventTypeConfig]
                              return (
                                <Button
                                  key={item.type}
                                  variant="outline"
                                  className="h-auto flex-col gap-1.5 bg-transparent py-3"
                                  onClick={() => handleQuickAdd(item.type)}
                                >
                                  <div className={`rounded-md p-1.5 ${config.color}`}>
                                    <item.icon className="h-4 w-4" />
                                  </div>
                                  <span className="text-xs">{item.label}</span>
                                </Button>
                              )
                            })}
                          </div>
                          {events.length > 0 && (
                            <div className="border-t border-border px-3 py-2">
                              <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                {events.length} existing {events.length === 1 ? 'entry' : 'entries'}
                              </p>
                              <div className="space-y-1">
                                {events.slice(0, 3).map((event) => {
                                  const config = eventTypeConfig[event.type as keyof typeof eventTypeConfig]
                                  return (
                                    <button
                                      key={event.id}
                                      type="button"
                                      onClick={() => {
                                        setIsQuickAddOpen(false)
                                        handleEditEvent(event)
                                      }}
                                      className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left transition-colors hover:bg-accent/50"
                                    >
                                      <div className={`h-2 w-2 rounded-full ${config.dotColor}`} />
                                      <span className="flex-1 truncate text-xs">{event.title}</span>
                                      <Pencil className="h-3 w-3 text-muted-foreground" />
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </PopoverContent>
                      </Popover>
                    )
                  })}
                </div>
              </div>
            ) : (
              /* Week View - Expanded */
              <div className="flex h-full flex-col">
                <div className="sticky top-0 z-10 grid grid-cols-7 border-b border-border bg-card">
                  {weekDays.map((day, index) => (
                    <div
                      key={index}
                      className={`border-r border-border p-3 text-center last:border-r-0 ${
                        isToday(day) ? 'bg-primary/10' : ''
                      }`}
                    >
                      <div className="text-xs text-muted-foreground">{DAYS[day.getDay()]}</div>
                      <div className={`text-xl font-semibold ${isToday(day) ? 'text-primary' : 'text-foreground'}`}>
                        {day.getDate()}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid flex-1 grid-cols-7">
                  {weekDays.map((day, index) => {
                    const events = getEventsForDate(day)
                    const isSelected = selectedDate?.toDateString() === day.toDateString()

                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedDate(day)}
                        className={`
                          flex flex-col border-r border-border p-2 text-left last:border-r-0 hover:bg-accent/30
                          ${isSelected ? 'bg-accent/50' : ''}
                        `}
                      >
                <div className="flex-1 space-y-1.5">
                  {events.map((event) => {
                    const config = eventTypeConfig[event.type as keyof typeof eventTypeConfig]
                    const Icon = config.icon
                    return (
                      <button
                        key={event.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditEvent(event)
                        }}
                        className={`w-full rounded-md p-2.5 text-left text-xs ${config.color}`}
                      >
                        <div className="flex items-center gap-1.5 font-medium">
                          <Icon className="h-3.5 w-3.5" />
                          <span className="truncate">{event.title}</span>
                        </div>
                        {event.amount && <div className="mt-1 text-sm font-semibold">${event.amount}</div>}
                        {event.hours && <div className="mt-0.5 opacity-80">{event.hours}h</div>}
                      </button>
                    )
                  })}
                </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mobile Sidebar Toggle */}
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full bg-background shadow-lg lg:hidden"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <CalendarClock className="h-5 w-5" />
                    {sortedUpcomingEvents.filter((e) => e.urgency === 'overdue' || e.urgency === 'due_soon').length >
                      0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                        {sortedUpcomingEvents.filter((e) => e.urgency === 'overdue' || e.urgency === 'due_soon').length}
                      </span>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left">Open sidebar</TooltipContent>
              </Tooltip>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full p-0 sm:max-w-sm">
            <SheetHeader className="border-b border-border px-4 py-3">
              <SheetTitle>Calendar Details</SheetTitle>
              <SheetDescription>Insights, upcoming events, and quick actions</SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-5rem)]">
              <div className="space-y-3 p-4">
                {/* Mobile Insights */}
                <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
                  <CardHeader className="p-3 pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Monthly Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 p-3 pt-0">
                    {insights.mostExpensiveDay.amount > 0 && (
                      <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-2">
                        <div className="rounded bg-destructive/20 p-1">
                          <ArrowUpRight className="h-3 w-3 text-destructive" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] text-muted-foreground">Most Expensive Day</p>
                          <p className="text-xs font-medium">
                            {new Date(insights.mostExpensiveDay.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}{' '}
                            - ${insights.mostExpensiveDay.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                    {insights.bestEarningDay.amount > 0 && (
                      <div className="flex items-center gap-2 rounded-md bg-success/10 p-2">
                        <div className="rounded bg-success/20 p-1">
                          <TrendingUp className="h-3 w-3 text-success" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] text-muted-foreground">Best Earning Day</p>
                          <p className="text-xs font-medium">
                            {new Date(insights.bestEarningDay.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}{' '}
                            - ${insights.bestEarningDay.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 rounded-md bg-primary/10 p-2">
                      <div className="rounded bg-primary/20 p-1">
                        <ArrowDownRight className="h-3 w-3 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-muted-foreground">Lowest Spending Week</p>
                        <p className="text-xs font-medium">
                          Week {insights.lowestSpendingWeek.week} - $
                          {insights.lowestSpendingWeek.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Mobile Upcoming Events */}
                <Card className="border-border/50">
                  <CardHeader className="p-3 pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                      <CalendarClock className="h-4 w-4 text-muted-foreground" />
                      Upcoming
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1.5 p-3 pt-0">
                    {sortedUpcomingEvents.slice(0, 5).map((event) => {
                      const config = upcomingTypeConfig[event.type as keyof typeof upcomingTypeConfig]
                      const Icon = config?.icon || FileCheck
                      const isOverdue = event.urgency === 'overdue'
                      const isDueSoon = event.urgency === 'due_soon'

                      return (
                        <div
                          key={event.id}
                          className={`flex items-center gap-2 rounded-md border p-2 transition-colors ${
                            isOverdue
                              ? 'border-destructive/30 bg-destructive/5'
                              : isDueSoon
                                ? 'border-orange-500/30 bg-orange-500/5'
                                : 'border-border/50'
                          }`}
                        >
                          <div
                            className={`rounded p-1 ${
                              isOverdue ? 'bg-destructive/20' : isDueSoon ? 'bg-orange-500/20' : 'bg-muted'
                            }`}
                          >
                            <Icon
                              className={`h-3 w-3 ${
                                isOverdue ? 'text-destructive' : isDueSoon ? 'text-orange-500' : config?.color
                              }`}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium">{event.title}</p>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-semibold">${event.amount?.toLocaleString()}</p>
                            {isOverdue && (
                              <Badge variant="destructive" className="h-4 px-1 text-[8px]">
                                Overdue
                              </Badge>
                            )}
                            {isDueSoon && !isOverdue && (
                              <Badge className="h-4 bg-orange-500 px-1 text-[8px] hover:bg-orange-600">
                                {event.daysUntil}d left
                              </Badge>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    {sortedUpcomingEvents.length > 5 && (
                      <Button variant="ghost" size="sm" className="mt-1 h-7 w-full text-xs text-muted-foreground">
                        View all {sortedUpcomingEvents.length} upcoming
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Mobile Quick Add */}
                <Card className="border-border/50">
                  <CardHeader className="p-3 pb-2">
                    <CardTitle className="text-sm font-medium">Quick Add</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { type: 'work', icon: Clock, label: 'Work' },
                        { type: 'expense', icon: Receipt, label: 'Expense' },
                        { type: 'travel', icon: Car, label: 'Travel' },
                        { type: 'meeting', icon: Users, label: 'Meeting' },
                      ].map((item) => {
                        const config = eventTypeConfig[item.type as keyof typeof eventTypeConfig]
                        return (
                          <Button
                            key={item.type}
                            variant="ghost"
                            className="h-auto flex-col gap-1 px-2 py-3"
                            onClick={() => {
                              setNewEntry({ ...newEntry, type: item.type })
                              setIsSidebarOpen(false)
                              setIsAddEventOpen(true)
                            }}
                          >
                            <div className={`rounded p-1.5 ${config.color}`}>
                              <item.icon className="h-4 w-4" />
                            </div>
                            <span className="text-[10px]">{item.label}</span>
                          </Button>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>

        {/* Desktop Sidebar - Narrower and secondary */}
        <div className="hidden w-80 shrink-0 lg:block">
          <ScrollArea className="h-full pr-2">
            <div className="space-y-3 pb-4">
              {/* Insights Cards */}
              <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Monthly Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 p-3 pt-0">
                  {/* Most Expensive Day */}
                  {insights.mostExpensiveDay.amount > 0 && (
                    <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-2">
                      <div className="rounded bg-destructive/20 p-1">
                        <ArrowUpRight className="h-3 w-3 text-destructive" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-muted-foreground">Most Expensive Day</p>
                        <p className="text-xs font-medium">
                          {new Date(insights.mostExpensiveDay.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          - ${insights.mostExpensiveDay.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Best Earning Day */}
                  {insights.bestEarningDay.amount > 0 && (
                    <div className="flex items-center gap-2 rounded-md bg-success/10 p-2">
                      <div className="rounded bg-success/20 p-1">
                        <TrendingUp className="h-3 w-3 text-success" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-muted-foreground">Best Earning Day</p>
                        <p className="text-xs font-medium">
                          {new Date(insights.bestEarningDay.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          - ${insights.bestEarningDay.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Lowest Spending Week */}
                  <div className="flex items-center gap-2 rounded-md bg-primary/10 p-2">
                    <div className="rounded bg-primary/20 p-1">
                      <ArrowDownRight className="h-3 w-3 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-muted-foreground">Lowest Spending Week</p>
                      <p className="text-xs font-medium">
                        Week {insights.lowestSpendingWeek.week} - $
                        {insights.lowestSpendingWeek.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Events */}
              <Card className="border-border/50">
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <CalendarClock className="h-4 w-4 text-muted-foreground" />
                    Upcoming
                  </CardTitle>
                  <CardDescription className="text-[10px]">Invoices, bills, and expected payments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-1.5 p-3 pt-0">
                  {sortedUpcomingEvents.slice(0, 5).map((event) => {
                    const config = upcomingTypeConfig[event.type as keyof typeof upcomingTypeConfig]
                    const Icon = config?.icon || FileCheck
                    const isOverdue = event.urgency === 'overdue'
                    const isDueSoon = event.urgency === 'due_soon'

                    return (
                      <div
                        key={event.id}
                        className={`flex items-center gap-2 rounded-md border p-2 transition-colors ${
                          isOverdue
                            ? 'border-destructive/30 bg-destructive/5'
                            : isDueSoon
                              ? 'border-orange-500/30 bg-orange-500/5'
                              : 'border-border/50 hover:bg-accent/30'
                        }`}
                      >
                        <div
                          className={`rounded p-1 ${
                            isOverdue ? 'bg-destructive/20' : isDueSoon ? 'bg-orange-500/20' : 'bg-muted'
                          }`}
                        >
                          <Icon
                            className={`h-3 w-3 ${
                              isOverdue ? 'text-destructive' : isDueSoon ? 'text-orange-500' : config?.color
                            }`}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium">{event.title}</p>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                            {event.recurring && (
                              <Badge variant="outline" className="h-4 px-1 text-[8px]">
                                <Repeat className="mr-0.5 h-2 w-2" />
                                Recurring
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold">${event.amount?.toLocaleString()}</p>
                          {isOverdue && (
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge variant="destructive" className="h-4 px-1 text-[8px]">
                                  Overdue
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>Past due date</TooltipContent>
                            </Tooltip>
                          )}
                          {isDueSoon && !isOverdue && (
                            <Badge className="h-4 bg-orange-500 px-1 text-[8px] hover:bg-orange-600">
                              {event.daysUntil}d left
                            </Badge>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  {sortedUpcomingEvents.length > 5 && (
                    <Button variant="ghost" size="sm" className="mt-1 h-7 w-full text-xs text-muted-foreground">
                      View all {sortedUpcomingEvents.length} upcoming
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Selected Date - Compact */}
              <Card className="border-border/50">
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {selectedDate
                      ? selectedDate.toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'Select a Date'}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {selectedDateEvents.length} {selectedDateEvents.length === 1 ? 'entry' : 'entries'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  {selectedDateEvents.length > 0 ? (
                    <div className="space-y-1.5">
                      {selectedDateEvents.map((event) => {
                        const config = eventTypeConfig[event.type as keyof typeof eventTypeConfig]
                        const Icon = config.icon
                        return (
                          <button
                            key={event.id}
                            type="button"
                            onClick={() => handleEditEvent(event)}
                            className="group flex w-full items-start gap-2 rounded-md border border-border/50 p-2 text-left transition-colors hover:bg-accent/30"
                          >
                            <div className={`rounded p-1.5 ${config.color}`}>
                              <Icon className="h-3 w-3" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-medium leading-tight">{event.title}</p>
                              {event.client && <p className="text-[10px] text-muted-foreground">{event.client}</p>}
                              {event.amount && (
                                <p className="mt-0.5 text-xs font-semibold">${event.amount.toLocaleString()}</p>
                              )}
                            </div>
                            <Pencil className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="py-4 text-center">
                      <p className="mb-2 text-xs text-muted-foreground">No entries</p>
                      <Button size="sm" className="h-7 text-xs" onClick={() => setIsAddEventOpen(true)}>
                        <Plus className="mr-1.5 h-3 w-3" />
                        Add Entry
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Add - Compact */}
              <Card className="border-border/50">
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-sm font-medium">Quick Add</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { type: 'work', icon: Clock, label: 'Work' },
                      { type: 'expense', icon: Receipt, label: 'Expense' },
                      { type: 'travel', icon: Car, label: 'Travel' },
                      { type: 'meeting', icon: Users, label: 'Meeting' },
                    ].map((item) => {
                      const config = eventTypeConfig[item.type as keyof typeof eventTypeConfig]
                      return (
                        <Button
                          key={item.type}
                          variant="ghost"
                          className="h-auto flex-col gap-0.5 px-1 py-2"
                          onClick={() => {
                            setNewEntry({ ...newEntry, type: item.type })
                            setIsAddEventOpen(true)
                          }}
                        >
                          <div className={`rounded p-1 ${config.color}`}>
                            <item.icon className="h-3 w-3" />
                          </div>
                          <span className="text-[10px]">{item.label}</span>
                        </Button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Legend - Compact inline */}
              <Card className="border-border/50">
                <CardContent className="p-3">
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {Object.entries(eventTypeConfig)
                      .slice(0, 6)
                      .map(([key, config]) => (
                        <div key={key} className="flex items-center gap-1.5">
                          <div className={`h-2 w-2 rounded-full ${config.dotColor}`} />
                          <span className="text-[10px] text-muted-foreground">{config.label}</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Inline Edit Sheet - Responsive with Scrollbar */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent className="flex h-full max-h-screen w-full flex-col overflow-hidden p-0 sm:max-w-md">
          <SheetHeader className="shrink-0 border-b border-border px-4 py-4 sm:px-6">
            <SheetTitle className="flex items-center gap-2">
              {editingEvent && (
                <>
                  <div
                    className={`rounded p-1.5 ${eventTypeConfig[editingEvent.type as keyof typeof eventTypeConfig]?.color}`}
                  >
                    {(() => {
                      const Icon = eventTypeConfig[editingEvent.type as keyof typeof eventTypeConfig]?.icon
                      return Icon ? <Icon className="h-4 w-4" /> : null
                    })()}
                  </div>
                  Edit Entry
                </>
              )}
            </SheetTitle>
            <SheetDescription>
              {editingEvent &&
                new Date(editingEvent.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
            </SheetDescription>
          </SheetHeader>

          {editingEvent && (
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="space-y-4 px-4 py-4 sm:px-6">
                {/* Entry Type - Always visible */}
                <div className="space-y-2">
                  <Label className="text-xs">Entry Type</Label>
                  <Select
                    value={editingEvent.type}
                    onValueChange={(v) => setEditingEvent({ ...editingEvent, type: v })}
                  >
                    <SelectTrigger className="h-10 sm:h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(eventTypeConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${config.dotColor}`} />
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Title - Always visible */}
                <div className="space-y-2">
                  <Label className="text-xs">Title</Label>
                  <Input
                    value={editingEvent.title}
                    onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                    className="h-10 sm:h-9"
                  />
                </div>

                {/* Date - Always visible */}
                <div className="space-y-2">
                  <Label className="text-xs">Date</Label>
                  <Input
                    type="date"
                    value={editingEvent.date}
                    onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                    className="h-10 sm:h-9"
                  />
                </div>

                {/* ===== WORK DONE FIELDS ===== */}
                {editingEvent.type === 'work' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs">Hours Worked</Label>
                        <Input
                          type="number"
                          step="0.5"
                          value={editingEvent.hours || ''}
                          onChange={(e) =>
                            setEditingEvent({
                              ...editingEvent,
                              hours: e.target.value ? parseFloat(e.target.value) : undefined,
                            })
                          }
                          className="h-10 sm:h-9"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Rate ($/hr)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={editingEvent.amount || ''}
                          onChange={(e) =>
                            setEditingEvent({
                              ...editingEvent,
                              amount: e.target.value ? parseFloat(e.target.value) : undefined,
                            })
                          }
                          className="h-10 sm:h-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Client</Label>
                      <Select
                        value={editingEvent.client || 'none'}
                        onValueChange={(v) => setEditingEvent({ ...editingEvent, client: v === 'none' ? undefined : v })}
                      >
                        <SelectTrigger className="h-10 sm:h-9">
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No client</SelectItem>
                          {CLIENTS.map((client) => (
                            <SelectItem key={client.id} value={client.label}>
                              {client.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {/* ===== EXPENSE FIELDS ===== */}
                {editingEvent.type === 'expense' && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-xs">Amount ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editingEvent.amount || ''}
                        onChange={(e) =>
                          setEditingEvent({
                            ...editingEvent,
                            amount: e.target.value ? parseFloat(e.target.value) : undefined,
                          })
                        }
                        className="h-10 sm:h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Category</Label>
                      <Select
                        value={editingEvent.category || 'none'}
                        onValueChange={(v) =>
                          setEditingEvent({ ...editingEvent, category: v === 'none' ? undefined : v })
                        }
                      >
                        <SelectTrigger className="h-10 sm:h-9">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No category</SelectItem>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat.id} value={cat.label}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Payment Method</Label>
                      <Select
                        value={editingEvent.paymentMethod || 'none'}
                        onValueChange={(v) =>
                          setEditingEvent({ ...editingEvent, paymentMethod: v === 'none' ? undefined : v })
                        }
                      >
                        <SelectTrigger className="h-10 sm:h-9">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Not specified</SelectItem>
                          {PAYMENT_METHODS.map((method) => (
                            <SelectItem key={method.id} value={method.id}>
                              {method.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div>
                        <p className="text-sm font-medium">Tax Deductible</p>
                        <p className="text-xs text-muted-foreground">Mark as tax deductible expense</p>
                      </div>
                      <Switch
                        checked={editingEvent.taxDeductible || false}
                        onCheckedChange={(checked) => setEditingEvent({ ...editingEvent, taxDeductible: checked })}
                      />
                    </div>
                  </>
                )}

                {/* ===== INVOICE FIELDS ===== */}
                {editingEvent.type === 'invoice' && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-xs">Client</Label>
                      <Select
                        value={editingEvent.client || 'none'}
                        onValueChange={(v) => setEditingEvent({ ...editingEvent, client: v === 'none' ? undefined : v })}
                      >
                        <SelectTrigger className="h-10 sm:h-9">
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No client</SelectItem>
                          {CLIENTS.map((client) => (
                            <SelectItem key={client.id} value={client.label}>
                              {client.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Amount ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editingEvent.amount || ''}
                        onChange={(e) =>
                          setEditingEvent({
                            ...editingEvent,
                            amount: e.target.value ? parseFloat(e.target.value) : undefined,
                          })
                        }
                        className="h-10 sm:h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Due Date</Label>
                      <Input
                        type="date"
                        value={editingEvent.date}
                        onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                        className="h-10 sm:h-9"
                      />
                    </div>
                  </>
                )}

                {/* ===== INCOME FIELDS ===== */}
                {editingEvent.type === 'income' && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-xs">Amount ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editingEvent.amount || ''}
                        onChange={(e) =>
                          setEditingEvent({
                            ...editingEvent,
                            amount: e.target.value ? parseFloat(e.target.value) : undefined,
                          })
                        }
                        className="h-10 sm:h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Source</Label>
                      <Input
                        placeholder="e.g., Client payment, Refund, etc."
                        value={editingEvent.client || ''}
                        onChange={(e) => setEditingEvent({ ...editingEvent, client: e.target.value || undefined })}
                        className="h-10 sm:h-9"
                      />
                    </div>
                  </>
                )}

                {/* ===== TRAVEL FIELDS ===== */}
                {editingEvent.type === 'travel' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs">Kilometers</Label>
                        <Input
                          type="number"
                          value={editingEvent.kilometers || ''}
                          onChange={(e) =>
                            setEditingEvent({
                              ...editingEvent,
                              kilometers: e.target.value ? parseFloat(e.target.value) : undefined,
                            })
                          }
                          className="h-10 sm:h-9"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Amount ($)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={editingEvent.amount || ''}
                          onChange={(e) =>
                            setEditingEvent({
                              ...editingEvent,
                              amount: e.target.value ? parseFloat(e.target.value) : undefined,
                            })
                          }
                          className="h-10 sm:h-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Notes</Label>
                      <Textarea
                        placeholder="Trip details, destination, purpose..."
                        rows={2}
                        value={editingEvent.notes || ''}
                        onChange={(e) => setEditingEvent({ ...editingEvent, notes: e.target.value || undefined })}
                      />
                    </div>
                  </>
                )}

                {/* ===== MEETING FIELDS ===== */}
                {editingEvent.type === 'meeting' && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-xs">Client</Label>
                      <Select
                        value={editingEvent.client || 'none'}
                        onValueChange={(v) => setEditingEvent({ ...editingEvent, client: v === 'none' ? undefined : v })}
                      >
                        <SelectTrigger className="h-10 sm:h-9">
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No client</SelectItem>
                          {CLIENTS.map((client) => (
                            <SelectItem key={client.id} value={client.label}>
                              {client.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Notes</Label>
                      <Textarea
                        placeholder="Meeting agenda or notes..."
                        rows={3}
                        value={editingEvent.notes || ''}
                        onChange={(e) => setEditingEvent({ ...editingEvent, notes: e.target.value || undefined })}
                      />
                    </div>
                  </>
                )}

                {/* ===== TAX & OTHER FIELDS (basic fields only) ===== */}
                {(editingEvent.type === 'tax' || editingEvent.type === 'other') && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-xs">Amount ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editingEvent.amount || ''}
                        onChange={(e) =>
                          setEditingEvent({
                            ...editingEvent,
                            amount: e.target.value ? parseFloat(e.target.value) : undefined,
                          })
                        }
                        className="h-10 sm:h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Notes</Label>
                      <Textarea
                        placeholder="Additional details..."
                        rows={3}
                        value={editingEvent.notes || ''}
                        onChange={(e) => setEditingEvent({ ...editingEvent, notes: e.target.value || undefined })}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Fixed Footer Actions - Always visible at bottom */}
          {editingEvent && (
            <div className="sticky bottom-0 shrink-0 border-t border-border bg-background px-4 py-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] sm:px-6">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 bg-transparent"
                  onClick={() => setIsEditSheetOpen(false)}
                >
                  Cancel
                </Button>
                <Button size="lg" className="flex-1" onClick={handleSaveEdit}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => handleDeleteEvent(editingEvent.id)}
              >
                <Trash2 className="mr-2 h-3 w-3" />
                Delete Entry
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  </TooltipProvider>
  )
}
