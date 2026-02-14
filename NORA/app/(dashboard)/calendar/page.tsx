'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import useSWR, { mutate } from 'swr'
import {
  formatDateToLocal,
  parseDateString,
  mapExpenseToCalendarEvent,
  type CalendarEvent as CalendarEventType,
} from '@/lib/calendar-utils'
import {
  listExpenses,
  createExpense as createExpenseAPI,
  updateExpense as updateExpenseAPI,
  deleteExpense as deleteExpenseAPI,
  type Expense,
} from '@/lib/services/expenses'
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  FileCheck,
  FileText,
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
  Loader2,
  AlertCircle,
  CalendarX,
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
import { DatePicker } from '@/components/ui/date-picker'
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
  DropdownMenuLabel,
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
import { ExpenseForm } from '@/components/expenses/ExpenseForm'
import { useToast } from '@/hooks/use-toast'
import { listWorkDone, createWorkDone, deleteWorkDone, type WorkDoneEntry } from '@/lib/services/work-done'
import { getPaymentMethodById, listExpenseCategories } from '@/lib/services/expense-service'
import type { ExpenseCreatePayload, ExpenseUpdatePayload } from '@/types/expense'

import { listInvoices, type Invoice } from '@/lib/services/invoices'
import { listContacts, createContact, type Contact } from '@/lib/services/contacts'
import { fetchCalendarSummary } from '@/lib/services/calendar-summary'
import { fetchCalendarConfig, type CalendarEntryType } from '@/lib/services/calendar-config'
import { fetchConfig } from '@/lib/services/app-config'
import { fetchPaymentMethods } from '@/lib/services/payment-methods'

/** Map backend iconKey to Lucide icon component. List of types comes from backend; only mapping lives here. */
const ICON_MAP: Record<string, typeof Briefcase> = {
  briefcase: Briefcase,
  clock: Clock,
  receipt: Receipt,
  dollarSign: DollarSign,
  fileCheck: FileCheck,
  users: Users,
  car: Car,
  fileText: FileText,
  landmark: Landmark,
  alertTriangle: AlertTriangle,
}
/** Map backend colorKey to Tailwind classes. */
const COLOR_MAP: Record<string, { color: string; dotColor: string }> = {
  primary: { color: 'bg-primary text-primary-foreground', dotColor: 'bg-primary' },
  chart3: { color: 'bg-chart-3 text-chart-3-foreground', dotColor: 'bg-chart-3' },
  destructive: { color: 'bg-destructive/90 text-destructive-foreground', dotColor: 'bg-destructive' },
  success: { color: 'bg-success text-success-foreground', dotColor: 'bg-success' },
  chart2: { color: 'bg-chart-2 text-white', dotColor: 'bg-chart-2' },
  chart4: { color: 'bg-chart-4 text-chart-4-foreground', dotColor: 'bg-chart-4' },
  chart5: { color: 'bg-chart-5 text-chart-5-foreground', dotColor: 'bg-chart-5' },
  muted: { color: 'bg-muted text-muted-foreground', dotColor: 'bg-muted-foreground' },
  orange: { color: 'bg-orange-500 text-white', dotColor: 'bg-orange-500' },
}
const DEFAULT_DISPLAY = { icon: FileText, color: 'bg-muted text-muted-foreground', dotColor: 'bg-muted-foreground' }

function getEventTypeDisplay(entryTypes: CalendarEntryType[], typeId: string): { icon: typeof Briefcase; color: string; dotColor: string } {
  const t = entryTypes.find((e) => e.id === typeId)
  if (!t) return DEFAULT_DISPLAY
  const icon = ICON_MAP[t.iconKey] ?? DEFAULT_DISPLAY.icon
  const colors = COLOR_MAP[t.colorKey] ?? { color: DEFAULT_DISPLAY.color, dotColor: DEFAULT_DISPLAY.dotColor }
  return { icon, color: colors.color, dotColor: colors.dotColor }
}

function getEntryTypeLabel(entryTypes: CalendarEntryType[], typeId: string): string {
  return entryTypes.find((t) => t.id === typeId)?.label ?? typeId
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Helper function for case-insensitive alphabetical sorting
const sortAlphabetically = <T extends { name?: string; label?: string }>(items: T[]): T[] => {
  return [...items].sort((a, b) => {
    const nameA = (a.name || a.label || '').toLowerCase()
    const nameB = (b.name || b.label || '').toLowerCase()
    return nameA.localeCompare(nameB)
  })
}

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
  notes?: string
}

// Upcoming event type configuration (derived from API data)
const upcomingTypeConfig = {
  invoice: { label: 'Invoice Due', icon: FileCheck, color: 'text-chart-2' },
  overdue: { label: 'Overdue', icon: AlertTriangle, color: 'text-destructive' },
  income: { label: 'Income', icon: DollarSign, color: 'text-success' },
  expense: { label: 'Expense', icon: Receipt, color: 'text-destructive' },
}

// Helper: get category display name from id (uses categories from API)
function getCategoryName(categories: { id: string; name: string }[], categoryId: string): string {
  const cat = categories.find((c) => c.id === categoryId)
  return cat?.name ?? categoryId
}

export default function CalendarPage() {
  const { toast } = useToast()

  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => new Date())
  const [isAddEventOpen, setIsAddEventOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('month')

  // Calculate view date range based on viewMode and currentDate
  const { viewStartDate, viewEndDate } = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    if (viewMode === 'week') {
      // Week view: get start and end of current week
      const startOfWeek = new Date(currentDate)
      const day = startOfWeek.getDay()
      startOfWeek.setDate(startOfWeek.getDate() - day)
      
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(endOfWeek.getDate() + 6)
      
      return {
        viewStartDate: formatDateToLocal(startOfWeek),
        viewEndDate: formatDateToLocal(endOfWeek),
      }
    } else {
      // Month view: get first day of month (accounting for calendar padding) to last day
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      
      // Include previous month days shown in calendar grid
      const startingDay = firstDay.getDay()
      const calendarStart = new Date(year, month, 1 - startingDay)
      
      // Include next month days shown in calendar grid (42 cells total)
      const daysInMonth = lastDay.getDate()
      const totalCells = 42
      const remainingCells = totalCells - (startingDay + daysInMonth)
      const calendarEnd = new Date(year, month + 1, remainingCells)
      
      return {
        viewStartDate: formatDateToLocal(calendarStart),
        viewEndDate: formatDateToLocal(calendarEnd),
      }
    }
  }, [currentDate, viewMode])

  // SWR fetcher for expenses with date range filters
  const expensesFetcher = useCallback(
    () => listExpenses({ from: viewStartDate, to: viewEndDate }),
    [viewStartDate, viewEndDate]
  )

  // Fetch expenses from API with date range filters
  const { 
    data: expenses = [], 
    error: expensesError, 
    isLoading: expensesLoading 
  } = useSWR<Expense[]>(
    `expenses-${viewStartDate}-${viewEndDate}`, 
    expensesFetcher
  )

  // Fetch invoices and income from backend
  const { data: invoicesData, error: invoicesError, isLoading: invoicesLoading } = useSWR<Invoice[]>('invoices', listInvoices)

  // Fetch work-done entries for calendar view range (from backend)
  const workDoneFetcher = useCallback(
    () => listWorkDone({ from: viewStartDate, to: viewEndDate }),
    [viewStartDate, viewEndDate]
  )
  const { data: workDoneList = [], mutate: mutateWorkDone } = useSWR<WorkDoneEntry[]>(
    `work-done-${viewStartDate}-${viewEndDate}`,
    workDoneFetcher
  )

  // Calendar summary (Work, Expenses, Income, Net) from backend for current view range
  const calendarSummaryFetcher = useCallback(
    () => fetchCalendarSummary(viewStartDate, viewEndDate),
    [viewStartDate, viewEndDate]
  )
  const { data: calendarSummary, mutate: mutateCalendarSummary } = useSWR(
    `calendar-summary-${viewStartDate}-${viewEndDate}`,
    calendarSummaryFetcher
  )

  const { data: calendarConfig } = useSWR('calendar-config', fetchCalendarConfig)
  const entryTypes: CalendarEntryType[] = calendarConfig?.entryTypes ?? []

  const { data: categories = [] } = useSWR('categories', listExpenseCategories)
  const { data: appConfig } = useSWR('config', fetchConfig)
  const defaultCategoryId = useMemo(() => {
    if (appConfig?.defaultCategoryId && categories.some((c) => c.id === appConfig.defaultCategoryId))
      return appConfig.defaultCategoryId
    return categories[0]?.id ?? ''
  }, [appConfig?.defaultCategoryId, categories])

  const { data: paymentMethodsData } = useSWR('payment-methods', fetchPaymentMethods)
  const paymentMethods = paymentMethodsData?.paymentMethods ?? []
  const defaultPaymentMethodId = paymentMethodsData?.defaultPaymentMethodId ?? paymentMethods[0]?.id ?? ''
  const defaultPaymentMethodName = useMemo(
    () => paymentMethods.find((p) => p.id === defaultPaymentMethodId)?.name ?? paymentMethods[0]?.name ?? '',
    [paymentMethods, defaultPaymentMethodId]
  )

  const calendarYears = useMemo(() => {
    const min = appConfig?.calendarMinYear ?? 2020
    const max = appConfig?.calendarMaxYear ?? 2030
    const size = Math.max(0, max - min + 1)
    return Array.from({ length: size }, (_, i) => min + i)
  }, [appConfig?.calendarMinYear, appConfig?.calendarMaxYear])

  const isLoading = expensesLoading || invoicesLoading
  const hasError = expensesError || invoicesError

  const invoices = invoicesData ?? []
  const income: { id: string; date: string; description: string; amount: number; client?: string }[] = []

  // Local state for calendar-only events (meetings, work, travel that don't map to expenses/invoices)
  const [localEvents, setLocalEvents] = useState<CalendarEvent[]>([])

  // Derive calendar events from API data + local events
  // Normalize all API responses into a common CalendarEvent format
  const calendarEvents = useMemo((): CalendarEvent[] => {
    // Return empty if still loading
    if (isLoading) return []
    
    const events: CalendarEvent[] = []

    // Map expenses to calendar events using shared helper
    expenses.forEach((expense) => {
      events.push(mapExpenseToCalendarEvent(expense) as CalendarEvent)
    })

    // Normalize invoices from /api/invoices into calendar events
    invoices.forEach((invoice) => {
      // Show invoice on due date
      events.push({
        id: `invoice-${invoice.id}`,
        title: `Invoice ${invoice.id} - ${invoice.client}`,
        date: invoice.dueDate,
        type: invoice.status === 'overdue' ? 'overdue' : 'invoice',
        amount: invoice.amount,
        client: invoice.client,
      })

      // If invoice is paid, also show as income on paid date
      if (invoice.status === 'paid' && invoice.paidDate) {
        events.push({
          id: `paid-invoice-${invoice.id}`,
          title: `Payment received - ${invoice.client}`,
          date: invoice.paidDate,
          type: 'income',
          amount: invoice.amount,
          client: invoice.client,
        })
      }
    })

    // Map work-done from backend to calendar events (same date as saved)
    workDoneList.forEach((w) => {
      events.push({
        id: w.id,
        title: w.description || 'Work Done',
        date: w.date,
        type: 'work',
        amount: w.amount,
        client: w.contact || undefined,
        hours: w.hours,
      })
    })

    // Add local events (meetings, travel, note, etc. - not work; work comes from API)
    events.push(...localEvents)

    return events
  }, [expenses, invoices, workDoneList, localEvents, isLoading])

  // State for adding new client inline
  const [isAddingClient, setIsAddingClient] = useState(false)
  const [isAddingClientInEdit, setIsAddingClientInEdit] = useState(false)
  const [newClientName, setNewClientName] = useState('')

  // Contacts from Contacts page (backend API)
  const { data: contacts = [], mutate: mutateContacts } = useSWR<Contact[]>('contacts', listContacts)
  const clientsForFilter = useMemo(() => contacts.map((c) => ({ id: c.id, label: c.name })), [contacts])

  const addContact = useCallback(
    async (contact: { name: string; email?: string }) => {
      try {
        await createContact({ name: contact.name, email: contact.email ?? '' })
        await mutateContacts()
        return contact.name
      } catch {
        return null
      }
    },
    [mutateContacts]
  )

  // Advanced filter state (types filled from calendar config when loaded)
  const [filters, setFilters] = useState<FilterState>({
    types: [],
    categories: [],
    clients: [],
    paymentMethods: [],
    taxDeductible: null,
  })
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Quick add popover for date click
  const [quickAddDate, setQuickAddDate] = useState<Date | null>(null)
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)
  
  // Daily entries panel state
  const [isDailyEntriesOpen, setIsDailyEntriesOpen] = useState(false)
  const [dailyEntriesDate, setDailyEntriesDate] = useState<Date | null>(null)
  const [showAddEntryOptions, setShowAddEntryOptions] = useState(false)

  // Inline edit state
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)

  // ExpenseForm state (reusable component from Expenses page)
  const [expenseFormOpen, setExpenseFormOpen] = useState(false)
  const [expenseFormMode, setExpenseFormMode] = useState<'create' | 'edit'>('create')
  const [expenseFormDefaultDate, setExpenseFormDefaultDate] = useState<Date | null>(null)
  const [selectedExpenseForEdit, setSelectedExpenseForEdit] = useState<Expense | null>(null)

const [newEntry, setNewEntry] = useState({
  type: 'work',
  title: '',
  client: '',
  amount: '',
  hours: '',
  kilometers: '',
  kmRate: '',
  category: '',
  notes: '',
  repeat: false,
  paymentMethod: '',
  taxDeductible: false,
  startTime: '',
  endTime: '',
  vendor: '',
  })

  const [activeFilters, setActiveFilters] = useState<string[]>([])

  useEffect(() => {
    if (entryTypes.length > 0 && filters.types.length === 0) {
      const typeIds = entryTypes.map((t) => t.id)
      setFilters((prev) => ({ ...prev, types: typeIds }))
      setActiveFilters(typeIds)
    }
  }, [entryTypes.length])

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
    const dateStr = formatDateToLocal(date)
    return calendarEvents.filter((event) => {
      // Type filter (empty = all types)
      if (filters.types.length > 0 && !filters.types.includes(event.type)) return false
      
      // Category filter (if categories selected)
      if (filters.categories.length > 0 && event.category) {
        const categoryMatch = filters.categories.some(cat => 
          event.category?.toLowerCase().includes(cat.toLowerCase())
        )
        if (!categoryMatch) return false
      }
      
      // Client filter (if clients selected)
      if (filters.clients.length > 0 && event.client) {
        const clientMatch = filters.clients.some((client) =>
          clientsForFilter.find((c) => c.id === client)?.label === event.client
        )
        if (!clientMatch) return false
      }
      
      // Payment method filter (filters store ids; event.paymentMethod is name from API)
      if (filters.paymentMethods.length > 0 && event.paymentMethod) {
        const eventMethodId = paymentMethods.find((p) => p.name === event.paymentMethod)?.id
        if (!eventMethodId || !filters.paymentMethods.includes(eventMethodId)) return false
      }
      
      // Tax deductible filter
      if (filters.taxDeductible !== null) {
        if (event.taxDeductible !== filters.taxDeductible) return false
      }
      
      return event.date === dateStr
    })
  }

  // Get events for agenda view (next 14 days)
  const agendaEvents = useMemo(() => {
    const events: { date: Date; events: CalendarEvent[] }[] = []
    const startDate = new Date()
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

  // Calculate insights based on filtered events
  const insights = useMemo(() => {
  const monthEvents = calendarEvents.filter((event) => {
    const eventDate = parseDateString(event.date)
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
      const eventDate = parseDateString(event.date)
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

  // Get upcoming events sorted by urgency - derived from real invoice data
// Get upcoming events sorted by urgency - derived from API data
  const sortedUpcomingEvents = useMemo(() => {
    if (isLoading) return []
    
    const today = new Date()
    const upcomingEvents: Array<{
      id: string
      title: string
      date: string
      type: string
      amount: number
      client?: string
      status?: string
      daysUntil: number
      urgency: 'overdue' | 'due_soon' | 'upcoming'
    }> = []
    
    // Add pending/overdue invoices from /api/invoices as upcoming events
    invoices.forEach((invoice) => {
      if (invoice.status === 'pending' || invoice.status === 'overdue') {
        const eventDate = new Date(invoice.dueDate)
        const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        let urgency: 'overdue' | 'due_soon' | 'upcoming' = 'upcoming'
        if (daysUntil < 0 || invoice.status === 'overdue') urgency = 'overdue'
        else if (daysUntil <= 7) urgency = 'due_soon'
        
        upcomingEvents.push({
          id: `upcoming-invoice-${invoice.id}`,
          title: `Invoice ${invoice.id}`,
          date: invoice.dueDate,
          type: invoice.status === 'overdue' ? 'overdue' : 'invoice',
          amount: invoice.amount,
          client: invoice.client,
          status: urgency,
          daysUntil,
          urgency,
        })
      }
    })
    
    return upcomingEvents.sort((a, b) => {
      const urgencyOrder = { overdue: 0, due_soon: 1, upcoming: 2 }
      if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
      }
      return a.daysUntil - b.daysUntil
    })
  }, [invoices, isLoading])

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
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    setCurrentDate(today)
    setSelectedDate(today)
  }

  const isToday = (date: Date) => {
    const today = new Date()
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
  const typeIds = entryTypes.length > 0 ? entryTypes.map((t) => t.id) : []
  setFilters({
    types: typeIds,
    categories: [],
    clients: [],
    paymentMethods: [],
    taxDeductible: null,
  })
  setActiveFilters(typeIds)
  }

const activeFilterCount =
  (entryTypes.length > 0 && filters.types.length < entryTypes.length ? 1 : 0) +
  (filters.categories.length > 0 ? 1 : 0) +
  (filters.clients.length > 0 ? 1 : 0) +
  (filters.paymentMethods.length > 0 ? 1 : 0) +
  (filters.taxDeductible !== null ? 1 : 0)

const handleAddEntry = async () => {
  // For note type, title can be optional if notes are provided
  const hasContent = newEntry.title || (newEntry.type === 'note' && newEntry.notes)
  
  if (hasContent) {
    const eventDate = selectedDate ? formatDateToLocal(selectedDate) : formatDateToLocal(new Date())
    
    // Handle expense type - use the expenses API
    if (newEntry.type === 'expense') {
      const expensePayload = {
        date: eventDate,
        description: newEntry.title || 'Expense',
        category: newEntry.category || defaultCategoryId,
        amount: newEntry.amount ? parseFloat(newEntry.amount) : 0,
        paymentMethod: newEntry.paymentMethod || defaultPaymentMethodName,
        source: 'calendar' as const,
      }
      
      try {
        await createExpenseAPI(expensePayload)
        // Revalidate expenses cache
        mutate(`expenses-${viewStartDate}-${viewEndDate}`)
        mutate('expenses')
        mutateCalendarSummary()
        toast({
          title: 'Expense added',
          description: `Added expense for $${expensePayload.amount.toFixed(2)}`,
        })
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to add expense',
          variant: 'destructive',
        })
      }
    }
    // Handle travel type - use the expenses API with travel category
    else if (newEntry.type === 'travel') {
      const defaultKm = calendarConfig?.defaultKmRate ?? 0.58
      const kmRate = newEntry.kmRate !== '' && !Number.isNaN(parseFloat(newEntry.kmRate)) ? parseFloat(newEntry.kmRate) : defaultKm
      const distance = newEntry.kilometers ? parseFloat(newEntry.kilometers) : 0
      const calculatedAmount = newEntry.amount ? parseFloat(newEntry.amount) : distance * kmRate
      
      const expensePayload = {
        date: eventDate,
        description: newEntry.title || 'Travel',
        category: 'travel',
        amount: calculatedAmount,
        paymentMethod: newEntry.paymentMethod || defaultPaymentMethodName,
        source: 'calendar' as const,
      }
      
      try {
        await createExpenseAPI(expensePayload)
        // Revalidate expenses cache
        mutate(`expenses-${viewStartDate}-${viewEndDate}`)
        mutate('expenses')
        mutateCalendarSummary()
        toast({
          title: 'Travel expense added',
          description: `Added travel expense for $${expensePayload.amount.toFixed(2)}`,
        })
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to add travel expense',
          variant: 'destructive',
        })
      }
    }
    // Handle income type as local-only (no Income API)
    else if (newEntry.type === 'income') {
      const newEvent: CalendarEvent = {
        id: `local-${Date.now()}`,
        title: newEntry.title || 'Income',
        date: eventDate,
        type: 'income',
        amount: newEntry.amount ? parseFloat(newEntry.amount) : undefined,
        client: newEntry.client || undefined,
      }
      setLocalEvents((prev) => [...prev, newEvent])
      toast({
        title: 'Income entry added',
        description: `Added to calendar (local only)`,
      })
    }
    // Handle work: persist to backend only (no localEvents); appears via refetch
    else if (newEntry.type === 'work') {
      const hours = newEntry.hours ? parseFloat(newEntry.hours) : 0
      const rate = newEntry.amount ? parseFloat(newEntry.amount) : 0
      const amount = hours * rate
      try {
        await createWorkDone({
          date: eventDate,
          contact: newEntry.client || '',
          description: newEntry.title || 'Work Done',
          hours,
          rate,
          amount,
        })
        await mutateWorkDone()
        mutateCalendarSummary()
        toast({
          title: 'Work done added',
          description: 'Saved to calendar and available under Invoices → Unbilled Work',
        })
      } catch (e) {
        toast({
          title: 'Failed to save work done',
          description: e instanceof Error ? e.message : 'Please try again.',
          variant: 'destructive',
        })
      }
    }
    // Handle other entry types (time, meeting, note) as local events
    else {
      const newEvent: CalendarEvent = {
        id: `local-${Date.now()}`,
        title: newEntry.title || (newEntry.type === 'note' ? 'Note' : ''),
        date: eventDate,
        type: newEntry.type,
        amount: newEntry.amount ? parseFloat(newEntry.amount) : undefined,
        hours: newEntry.hours ? parseFloat(newEntry.hours) : undefined,
        client: newEntry.client || undefined,
        category: newEntry.category || undefined,
        kilometers: newEntry.kilometers ? parseFloat(newEntry.kilometers) : undefined,
        paymentMethod: newEntry.paymentMethod || defaultPaymentMethodName || undefined,
        taxDeductible: newEntry.taxDeductible,
        notes: newEntry.notes || undefined,
      }
      setLocalEvents((prev) => [...prev, newEvent])
      toast({
        title: 'Entry added',
        description: `Added ${newEntry.type} entry to calendar`,
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
      kmRate: '',
      category: defaultCategoryId,
      notes: '',
      repeat: false,
      paymentMethod: defaultPaymentMethodName,
      taxDeductible: false,
      startTime: '',
      endTime: '',
      vendor: '',
    })
  }

  const handleQuickAdd = (type: string) => {
    if (quickAddDate) {
      setSelectedDate(quickAddDate)
      setIsQuickAddOpen(false)
      
      // For expense type, open the reusable ExpenseForm
      if (type === 'expense') {
        handleOpenExpenseForm(quickAddDate)
      } else {
        setNewEntry({ ...newEntry, type })
        setIsAddEventOpen(true)
      }
    }
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setDailyEntriesDate(date)
    setShowAddEntryOptions(false)
    setIsDailyEntriesOpen(true)
  }
  
  const handleAddNewFromDailyPanel = (type: string) => {
    if (dailyEntriesDate) {
      setIsDailyEntriesOpen(false)
      setShowAddEntryOptions(false)
      
      // For expense type, open the reusable ExpenseForm
      if (type === 'expense') {
        handleOpenExpenseForm(dailyEntriesDate)
      } else {
        setNewEntry({ ...newEntry, type })
        setSelectedDate(dailyEntriesDate)
        setIsAddEventOpen(true)
      }
    }
  }

  const handleEditEvent = (event: CalendarEvent) => {
    // For expense events, open the reusable ExpenseForm
    if (event.id.startsWith('expense-')) {
      handleEditExpenseFromCalendar(event)
      return
    }

    // Normalize category to ID format for the Select component
    let normalizedCategory = event.category
    if (normalizedCategory) {
      const matchedCat = categories.find(c => 
        c.name?.toLowerCase() === normalizedCategory?.toLowerCase() ||
        c.id === normalizedCategory?.toLowerCase()
      )
      if (matchedCat) {
        normalizedCategory = matchedCat.id
      }
    }
    setEditingEvent({ ...event, category: normalizedCategory })
    setIsEditSheetOpen(true)
  }

  const handleSaveEdit = async () => {
    if (editingEvent) {
      const eventId = editingEvent.id
      
      // Handle expense events - call API
      if (eventId.startsWith('expense-')) {
        const originalExpenseId = eventId.replace('expense-', '')
        
        const idToName = Object.fromEntries(paymentMethods.map((p) => [p.id, p.name]))
        const paymentMethodName =
          idToName[editingEvent.paymentMethod ?? ''] ??
          editingEvent.paymentMethod ??
          defaultPaymentMethodName
        const expenseUpdate = {
          date: editingEvent.date,
          description: editingEvent.title,
          category: editingEvent.category || defaultCategoryId,
          amount: editingEvent.amount || 0,
          paymentMethod: paymentMethodName,
        }
        
        try {
          await updateExpenseAPI(originalExpenseId, expenseUpdate)
          // Revalidate expenses cache
          mutate(`expenses-${viewStartDate}-${viewEndDate}`)
          mutate('expenses')
          mutateCalendarSummary()
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to update expense',
            variant: 'destructive',
          })
        }
      } else if (eventId.startsWith('local-')) {
        // Handle local events
        setLocalEvents((prev) =>
          prev.map((e) => (e.id === eventId ? editingEvent : e))
        )
      }
      // Note: invoice and income events are read-only from this view
      
      setIsEditSheetOpen(false)
      setEditingEvent(null)
      setIsAddingClientInEdit(false)
      setNewClientName('')
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      if (eventId.startsWith('expense-')) {
        const originalExpenseId = eventId.replace('expense-', '')
        await deleteExpenseAPI(originalExpenseId)
        mutate(`expenses-${viewStartDate}-${viewEndDate}`)
        mutate('expenses')
        mutateCalendarSummary()
        toast({ title: 'Entry deleted', description: 'Expense removed.' })
      } else if (eventId.startsWith('work-')) {
        await deleteWorkDone(eventId)
        await mutateWorkDone()
        mutateCalendarSummary()
        toast({ title: 'Entry deleted', description: 'Work done entry removed.' })
      } else if (eventId.startsWith('local-')) {
        setLocalEvents((prev) => prev.filter((e) => e.id !== eventId))
        toast({ title: 'Entry deleted', description: 'Entry removed.' })
      } else {
        // invoice / income: read-only from calendar
        toast({
          title: 'Cannot delete',
          description: 'Invoices and income are managed from the Invoices page.',
          variant: 'destructive',
        })
        return
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete entry',
        variant: 'destructive',
      })
      return
    }
    setIsEditSheetOpen(false)
    setEditingEvent(null)
    setIsAddingClientInEdit(false)
    setNewClientName('')
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

  // Open ExpenseForm for adding a new expense
  const handleOpenExpenseForm = (date: Date) => {
    setExpenseFormDefaultDate(date)
    setSelectedExpenseForEdit(null)
    setExpenseFormMode('create')
    setExpenseFormOpen(true)
  }

  // Open ExpenseForm for editing an existing expense
  const handleEditExpenseFromCalendar = (event: CalendarEvent) => {
    if (!event.id.startsWith('expense-')) return
    
    const expenseId = event.id.replace('expense-', '')
    const expense = expenses.find(e => e.id === expenseId)
    
    if (expense) {
      setSelectedExpenseForEdit(expense)
      setExpenseFormDefaultDate(null)
      setExpenseFormMode('edit')
      setExpenseFormOpen(true)
    }
  }

  // Handle ExpenseForm submission
  const handleExpenseFormSubmit = async (data: ExpenseCreatePayload | ExpenseUpdatePayload) => {
    try {
      const paymentMethod = await getPaymentMethodById((data as ExpenseCreatePayload).paymentMethodId)
      
      const apiData = {
        date: data.date || '',
        description: data.description || '',
        category: (data as ExpenseCreatePayload).categoryId || '',
        amount: data.amount || 0,
        paymentMethod: paymentMethod?.name || defaultPaymentMethodName,
        status: (data as ExpenseCreatePayload).isPaid ? 'paid' : 'pending',
        source: 'calendar' as const,
      }

      if (expenseFormMode === 'create') {
        await createExpenseAPI(apiData)
        // Revalidate expenses cache
        mutate(`expenses-${viewStartDate}-${viewEndDate}`)
        mutate('expenses')
        mutateCalendarSummary()
        toast({
          title: 'Expense added',
          description: `Added expense for $${apiData.amount.toFixed(2)} on ${apiData.date}`,
        })
      } else if (selectedExpenseForEdit) {
        await updateExpenseAPI(selectedExpenseForEdit.id, apiData)
        // Revalidate expenses cache
        mutate(`expenses-${viewStartDate}-${viewEndDate}`)
        mutate('expenses')
        mutateCalendarSummary()
        toast({
          title: 'Expense updated',
          description: 'Successfully updated expense details',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save expense. Please try again.',
        variant: 'destructive',
      })
      throw error
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading calendar events...</p>
      </div>
    )
  }

  // Error state
  if (hasError) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground">Failed to load calendar</h2>
          <p className="text-sm text-muted-foreground">
            Unable to fetch events from the server. Please try again later.
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          className="bg-transparent"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  // Check if there are no events at all (empty state will be shown in the calendar grid)
  const hasNoEvents = calendarEvents.length === 0

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
            {viewMode === 'month' ? (
              <div className="flex shrink-0 items-center gap-1">
                <Select
                  value={month.toString()}
                  onValueChange={(value) => setCurrentDate(new Date(year, parseInt(value), 1))}
                >
                  <SelectTrigger className="h-8 w-auto min-w-[90px] border-0 bg-transparent text-sm font-semibold md:min-w-[110px] md:text-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m, idx) => (
                      <SelectItem key={m} value={idx.toString()}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={year.toString()}
                  onValueChange={(value) => setCurrentDate(new Date(parseInt(value), month, 1))}
                >
                  <SelectTrigger className="h-8 w-auto min-w-[60px] border-0 bg-transparent text-sm font-semibold md:min-w-[70px] md:text-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {calendarYears.map((y) => (
                      <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <h1 className="min-w-[100px] text-center text-sm font-semibold text-foreground md:min-w-[140px] md:text-lg">
                {viewMode === 'week'
                  ? `Week of ${weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                  : 'Upcoming Events'}
              </h1>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateMonth('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="ml-1 h-8 bg-transparent md:ml-2" onClick={goToToday}>
              Today
            </Button>
          </div>

          {/* Center: Inline Stats - Hidden on mobile/tablet (from backend API) */}
          <div className="hidden items-center gap-4 xl:flex">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/20">
                <Clock className="h-3 w-3 text-primary" />
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Work:</span>{' '}
                <span className="font-medium">${(calendarSummary?.workDone ?? 0).toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-destructive/20">
                <Receipt className="h-3 w-3 text-destructive" />
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Expenses:</span>{' '}
                <span className="font-medium">${(calendarSummary?.expenses ?? 0).toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-success/20">
                <DollarSign className="h-3 w-3 text-success" />
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Income:</span>{' '}
                <span className="font-medium">${(calendarSummary?.income ?? 0).toLocaleString()}</span>
              </div>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex cursor-help items-center gap-2 rounded-md bg-muted/50 px-2 py-1">
                  <TrendingUp className="h-3 w-3 text-success" />
                  <div className="text-sm">
                    <span className="text-muted-foreground">Net:</span>{' '}
                    <span className="font-semibold text-success">
                      ${(calendarSummary?.net ?? 0).toLocaleString()}
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
                  <p className="mt-2 text-xl font-bold">${(calendarSummary?.workDone ?? 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{(calendarSummary?.hoursWorked ?? 0)}h logged</p>
                </div>
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                  <div className="flex items-center gap-2">
                    <div className="rounded-md bg-destructive p-1.5">
                      <Receipt className="h-4 w-4 text-destructive-foreground" />
                    </div>
                    <span className="text-xs text-muted-foreground">Expenses</span>
                  </div>
                  <p className="mt-2 text-xl font-bold">${(calendarSummary?.expenses ?? 0).toLocaleString()}</p>
                </div>
                <div className="rounded-lg border border-success/20 bg-success/5 p-4">
                  <div className="flex items-center gap-2">
                    <div className="rounded-md bg-success p-1.5">
                      <DollarSign className="h-4 w-4 text-success-foreground" />
                    </div>
                    <span className="text-xs text-muted-foreground">Income</span>
                  </div>
                  <p className="mt-2 text-xl font-bold">${(calendarSummary?.income ?? 0).toLocaleString()}</p>
                </div>
                <div className="rounded-lg border border-chart-2/20 bg-chart-2/5 p-4">
                  <div className="flex items-center gap-2">
                    <div className="rounded-md bg-chart-2 p-1.5">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs text-muted-foreground">Net</span>
                  </div>
                  <p className="mt-2 text-xl font-bold text-success">
                    ${(calendarSummary?.net ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>
              {/* Quick Add in Sheet - from backend /calendar/config only */}
              <div className="border-t border-border pt-4">
                <p className="mb-3 text-sm font-medium">Quick Add</p>
                <div className="grid grid-cols-4 gap-2">
                  {entryTypes.map((t) => {
                    const display = getEventTypeDisplay(entryTypes, t.id)
                    const Icon = display.icon
                    return (
                      <Button
                        key={t.id}
                        variant="outline"
                        className="h-auto flex-col gap-1 bg-transparent py-3"
                        onClick={() => {
                          setIsStatsOpen(false)
                          if (t.id === 'expense') {
                            handleOpenExpenseForm(selectedDate || new Date())
                          } else {
                            const next = { ...newEntry, type: t.id }
                            if (t.id === 'time' && next.amount === '') next.amount = String(calendarConfig?.defaultHourlyRate ?? 75)
                            if (t.id === 'travel' && next.kmRate === '') next.kmRate = String(calendarConfig?.defaultKmRate ?? 0.58)
                            setNewEntry(next)
                            setIsAddEventOpen(true)
                          }
                        }}
                      >
                        <div className={`rounded p-1.5 ${display.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-xs">{t.label}</span>
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
                  {/* Entry Types - from backend /calendar/config */}
                  <div>
                    <h5 className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Entry Type</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {entryTypes.map((t) => {
                        const display = getEventTypeDisplay(entryTypes, t.id)
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => toggleTypeFilter(t.id)}
                            className={`flex items-center gap-2 rounded-md border px-3 py-2 text-xs transition-colors ${
                              filters.types.includes(t.id)
                                ? 'border-primary bg-primary/10 text-foreground'
                                : 'border-border bg-transparent text-muted-foreground hover:border-primary/50'
                            }`}
                          >
                            <div className={`h-2 w-2 rounded-full ${display.dotColor}`} />
                            {t.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <Separator />

                  {/* Categories */}
                  <div>
                    <h5 className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Category</h5>
                    <div className="space-y-1">
                      {categories.map((cat) => (
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
                          <Receipt className="h-3.5 w-3.5 shrink-0" />
                          {cat.name}
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
                    <h5 className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Contact</h5>
                    <div className="space-y-1">
                      {clientsForFilter.map((client) => (
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
                      {paymentMethods.map((method) => (
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
                          {method.name}
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="h-8">
                <Plus className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">Add Entry</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs text-muted-foreground">New entry in</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {entryTypes.map((t) => {
                const display = getEventTypeDisplay(entryTypes, t.id)
                const Icon = display.icon
                return (
                  <DropdownMenuItem
                    key={t.id}
                    onClick={() => {
                      const next = { ...newEntry, type: t.id }
                      if (t.id === 'time' && next.amount === '') next.amount = String(calendarConfig?.defaultHourlyRate ?? 75)
                      if (t.id === 'travel' && next.kmRate === '') next.kmRate = String(calendarConfig?.defaultKmRate ?? 0.58)
                      setNewEntry(next)
                      setIsAddEventOpen(true)
                    }}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {t.label}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Add New Entry Sheet - Momenteo Style */}
          <Sheet open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
            <SheetContent className="flex h-full max-h-screen w-full flex-col overflow-hidden p-0 sm:max-w-md">
              <SheetHeader className="shrink-0 border-b border-border px-4 py-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <SheetTitle className="text-base whitespace-nowrap">New entry in</SheetTitle>
                    <Select
                      value={entryTypes.some((t) => t.id === newEntry.type) ? newEntry.type : (entryTypes[0]?.id ?? 'work')}
                      onValueChange={(v) => {
                        const next = { ...newEntry, type: v }
                        if (v === 'time' && newEntry.amount === '') next.amount = String(calendarConfig?.defaultHourlyRate ?? 75)
                        if (v === 'travel' && newEntry.kmRate === '') next.kmRate = String(calendarConfig?.defaultKmRate ?? 0.58)
                        setNewEntry(next)
                      }}
                    >
                      <SelectTrigger className="h-8 w-[130px] text-sm font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {entryTypes.map((t) => {
                          const display = getEventTypeDisplay(entryTypes, t.id)
                          const Icon = display.icon
                          return (
                            <SelectItem key={t.id} value={t.id}>
                              <span className="flex items-center gap-2">
                                <Icon className="h-3.5 w-3.5" />
                                {t.label}
                              </span>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <span>for</span>
                    <DatePicker
                      date={selectedDate || new Date()}
                      onDateChange={(date) => {
                        if (date) setSelectedDate(date)
                      }}
                      placeholder="Select date"
                      className="h-8"
                    />
                  </div>
                </div>
                <SheetDescription className="sr-only">
                  Add a new calendar entry
                </SheetDescription>
              </SheetHeader>

              <ScrollArea className="flex-1 overflow-y-auto">
                <div className="grid gap-4 p-4">

                  {/* Work Done Fields */}
                  {newEntry.type === 'work' && (
                    <>
                      <div className="space-y-2">
                        <Label>Contact</Label>
                        {isAddingClient ? (
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter contact name"
                              value={newClientName}
                              onChange={(e) => setNewClientName(e.target.value)}
                              autoFocus
                            />
                            <Button
                              type="button"
                              size="sm"
                              onClick={async () => {
                                if (newClientName.trim()) {
                                  const name = newClientName.trim()
                                  if (name) {
                                    await addContact({ name, email: '' })
                                    setNewEntry({ ...newEntry, client: name })
                                    setNewClientName('')
                                    setIsAddingClient(false)
                                  }
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
                              <SelectValue placeholder="Select a contact" />
                            </SelectTrigger>
                            <SelectContent>
                              {sortAlphabetically(contacts).map((contact) => (
                                <SelectItem key={contact.id} value={contact.name}>
                                  {contact.name}
                                </SelectItem>
                              ))}
                              <SelectItem value="__add_new__" className="text-primary">
                                <span className="flex items-center gap-2">
                                  <Plus className="h-3 w-3" />
                                  Add new contact
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
                          placeholder={String(calendarConfig?.defaultHourlyRate ?? 75)}
                          value={newEntry.amount}
                          onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Time Fields */}
                {newEntry.type === 'time' && (
                  <>
                    <div className="space-y-2">
                      <Label>Contact</Label>
                      {isAddingClient ? (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter contact name"
                            value={newClientName}
                            onChange={(e) => setNewClientName(e.target.value)}
                            autoFocus
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={async () => {
                              if (newClientName.trim()) {
                                const name = newClientName.trim()
                                if (name) {
                                  await addContact({ name, email: '' })
                                  setNewEntry({ ...newEntry, client: name })
                                  setNewClientName('')
                                  setIsAddingClient(false)
                                }
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
                            <SelectValue placeholder="Select a contact" />
                          </SelectTrigger>
                          <SelectContent>
                            {sortAlphabetically(contacts).map((contact) => (
                              <SelectItem key={contact.id} value={contact.name}>
                                {contact.name}
                              </SelectItem>
                            ))}
                            <SelectItem value="__add_new__" className="text-primary">
                              <span className="flex items-center gap-2">
                                <Plus className="h-3 w-3" />
                                Add new contact
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
                        <Label>Start Time</Label>
                        <Input
                          type="time"
                          value={newEntry.startTime || ''}
                          onChange={(e) => setNewEntry({ ...newEntry, startTime: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Time</Label>
                        <Input
                          type="time"
                          value={newEntry.endTime || ''}
                          onChange={(e) => setNewEntry({ ...newEntry, endTime: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Hours (calculated)</Label>
                      <Input
                        type="number"
                        step="0.25"
                        placeholder="0"
                        value={newEntry.hours}
                        onChange={(e) => setNewEntry({ ...newEntry, hours: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {/* Expense Fields - Inline Form */}
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
                      <Select 
                        value={newEntry.category || defaultCategoryId || ''} 
                        onValueChange={(v) => setNewEntry({ ...newEntry, category: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {sortAlphabetically(categories).map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Vendor (optional)</Label>
                      <Input
                        placeholder="Where did you make this purchase?"
                        value={newEntry.vendor || ''}
                        onChange={(e) => setNewEntry({ ...newEntry, vendor: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Payment Method</Label>
                      <Select 
                        value={newEntry.paymentMethod || defaultPaymentMethodName || ''} 
                        onValueChange={(v) => setNewEntry({ ...newEntry, paymentMethod: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          {sortAlphabetically(paymentMethods).map((method) => (
                            <SelectItem key={method.id} value={method.name}>
                              {method.name}
                            </SelectItem>
                          ))}
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
                        <Input
                          type="number"
                          step="0.01"
                          placeholder={String(calendarConfig?.defaultKmRate ?? 0.58)}
                          value={newEntry.kmRate}
                          onChange={(e) => setNewEntry({ ...newEntry, kmRate: e.target.value })}
                        />
                      </div>
                    </div>
                      <div className="space-y-2">
                        <Label>Contact</Label>
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
                            {sortAlphabetically(contacts).map((contact) => (
                              <SelectItem key={contact.id} value={contact.name}>
                                {contact.name}
                              </SelectItem>
                            ))}
                            <SelectItem value="__add_new__" className="text-primary">
                              <span className="flex items-center gap-2">
                                <Plus className="h-3 w-3" />
                                Add new contact
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
                        <Label>Contact</Label>
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
                            <SelectValue placeholder="Select a contact" />
                          </SelectTrigger>
                          <SelectContent>
                            {sortAlphabetically(contacts).map((contact) => (
                              <SelectItem key={contact.id} value={contact.name}>
                                {contact.name}
                              </SelectItem>
                            ))}
                            <SelectItem value="__add_new__" className="text-primary">
                              <span className="flex items-center gap-2">
                                <Plus className="h-3 w-3" />
                                Add new contact
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

                {/* Invoice Fields */}
                {newEntry.type === 'invoice' && (
                  <>
                    <div className="space-y-2">
                      <Label>Contact</Label>
                      {isAddingClient ? (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter contact name"
                            value={newClientName}
                            onChange={(e) => setNewClientName(e.target.value)}
                            autoFocus
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={async () => {
                              if (newClientName.trim()) {
                                const name = newClientName.trim()
                                if (name) {
                                  await addContact({ name, email: '' })
                                  setNewEntry({ ...newEntry, client: name })
                                  setNewClientName('')
                                  setIsAddingClient(false)
                                }
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
                            <SelectValue placeholder="Select a contact" />
                          </SelectTrigger>
                          <SelectContent>
                            {sortAlphabetically(contacts).map((contact) => (
                              <SelectItem key={contact.id} value={contact.name}>
                                {contact.name}
                              </SelectItem>
                            ))}
                            <SelectItem value="__add_new__" className="text-primary">
                              <span className="flex items-center gap-2">
                                <Plus className="h-3 w-3" />
                                Add new contact
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Invoice Description</Label>
                      <Input
                        placeholder="What is this invoice for?"
                        value={newEntry.title}
                        onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                      />
                    </div>
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
                  </>
                )}

                {/* Income Fields */}
                {newEntry.type === 'income' && (
                  <>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        placeholder="What is this income from?"
                        value={newEntry.title}
                        onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                      />
                    </div>
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
                      <Label>Client (optional)</Label>
<Select value={newEntry.client || 'none'} onValueChange={(v) => {
                          if (v === '__add_new__') {
                            setIsAddingClient(true)
                          } else if (v === 'none') {
                            setNewEntry({ ...newEntry, client: '' })
                          } else {
                            setNewEntry({ ...newEntry, client: v })
                          }
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a contact (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No client</SelectItem>
                          {sortAlphabetically(contacts).map((contact) => (
                            <SelectItem key={contact.id} value={contact.name}>
                              {contact.name}
                            </SelectItem>
                          ))}
                          <SelectItem value="__add_new__" className="text-primary">
                            <span className="flex items-center gap-2">
                              <Plus className="h-3 w-3" />
                              Add new contact
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {/* Note Fields */}
                {newEntry.type === 'note' && (
                  <>
                    <div className="space-y-2">
                      <Label>Note Title</Label>
                      <Input
                        placeholder="Enter a title for your note"
                        value={newEntry.title}
                        onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Note Content</Label>
                      <Textarea
                        placeholder="Write your note here..."
                        rows={4}
                        value={newEntry.notes}
                        onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Client (optional)</Label>
                      <Select value={newEntry.client || 'none'} onValueChange={(v) => {
                        if (v === '__add_new__') {
                          setIsAddingClient(true)
                        } else if (v === 'none') {
                          setNewEntry({ ...newEntry, client: '' })
                        } else {
                          setNewEntry({ ...newEntry, client: v })
                        }
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Link to a client (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No client</SelectItem>
                          {sortAlphabetically(contacts).map((contact) => (
                            <SelectItem key={contact.id} value={contact.name}>
                              {contact.name}
                            </SelectItem>
                          ))}
                          <SelectItem value="__add_new__" className="text-primary">
                            <span className="flex items-center gap-2">
                              <Plus className="h-3 w-3" />
                              Add new contact
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {/* Repeat Option - Only show for certain entry types */}
                {['work', 'time', 'expense', 'travel'].includes(newEntry.type) && (
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
                )}
              </div>

              </ScrollArea>
              <div className="shrink-0 border-t border-border px-4 py-4">
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setIsAddEventOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={handleAddEntry}>Add Entry</Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
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
  <CalendarX className="mx-auto h-12 w-12 text-muted-foreground/50" />
  <h3 className="mt-4 text-sm font-medium text-foreground">No upcoming events</h3>
  <p className="mt-1 text-sm text-muted-foreground">
    {hasNoEvents ? 'No expenses, invoices, or income found in the system.' : 'No events scheduled for the upcoming days.'}
  </p>
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
                            const config = getEventTypeDisplay(entryTypes, event.type)
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
                  {DAYS.map((day, index) => {
                    const isWeekend = index === 0 || index === 6
                    return (
                      <div
                        key={day}
                        className={`border-r border-border p-2 text-center text-xs font-medium last:border-r-0 text-muted-foreground ${
                          isWeekend ? 'bg-foreground/[0.04]' : ''
                        }`}
                      >
                        {day}
                      </div>
                    )
                  })}
                </div>

                {/* Calendar Grid - Expanded */}
                <div className="grid flex-1 grid-cols-7 grid-rows-6">
                  {calendarDays.map((day, index) => {
                    const events = getEventsForDate(day.date)
                    const isSelected = selectedDate?.toDateString() === day.date.toDateString()
                    const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6

                    return (
                      <div
                        key={index}
                        onClick={() => handleDateClick(day.date)}
                        className={`
                          group relative flex cursor-pointer flex-col border-b border-r border-border p-1.5 text-left transition-colors last:border-r-0 hover:bg-accent/30
                          ${!day.isCurrentMonth ? (isWeekend ? 'bg-muted/50' : 'bg-muted/40') : isWeekend ? 'bg-foreground/[0.04]' : 'bg-card'}
                          ${isWeekend ? 'border-r-border/60' : ''}
                          ${isSelected ? 'ring-2 ring-inset ring-primary' : ''}
                        `}
                      >
                        {/* Hover "+" icon - opens sidebar */}
                        <div className="absolute right-1 top-1 z-10 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDateClick(day.date)
                              setShowAddEntryOptions(true)
                            }}
                            className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span
                          className={`
                            inline-flex h-7 w-7 items-center justify-center rounded-full text-sm
                            ${isToday(day.date) ? 'bg-primary font-semibold text-primary-foreground' : ''}
                            ${!day.isCurrentMonth ? 'text-muted-foreground/40' : 'text-foreground'}
                          `}
                        >
                          {day.date.getDate()}
                        </span>
                        <div className="mt-1 flex-1 space-y-0.5 overflow-hidden">
                          {events.slice(0, 4).map((event) => {
                            const config = getEventTypeDisplay(entryTypes, event.type)
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
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              /* Week View - Expanded */
              <div className="flex h-full flex-col">
                <div className="sticky top-0 z-10 grid grid-cols-7 border-b border-border bg-card">
                  {weekDays.map((day, index) => {
                    const isWeekend = day.getDay() === 0 || day.getDay() === 6
                    return (
                      <div
                        key={index}
                        className={`border-r border-border p-3 text-center last:border-r-0 ${
                          isToday(day) ? 'bg-primary/10' : isWeekend ? 'bg-foreground/[0.04]' : ''
                        } ${isWeekend ? 'border-r-border/60' : ''}`}
                      >
                        <div className="text-xs text-muted-foreground">{DAYS[day.getDay()]}</div>
                        <div className={`text-xl font-semibold ${isToday(day) ? 'text-primary' : 'text-foreground'}`}>
                          {day.getDate()}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="grid flex-1 grid-cols-7">
                  {weekDays.map((day, index) => {
                    const events = getEventsForDate(day)
                    const isSelected = selectedDate?.toDateString() === day.toDateString()
                    const isWeekend = day.getDay() === 0 || day.getDay() === 6

                    return (
                      <div
                        key={index}
                        onClick={() => handleDateClick(day)}
                        className={`
                          group relative flex cursor-pointer flex-col border-r border-border p-2 text-left last:border-r-0 hover:bg-accent/30
                          ${isWeekend ? 'border-r-border/60' : ''}
                          ${isSelected ? 'bg-accent/50' : isWeekend ? 'bg-foreground/[0.04]' : ''}
                        `}
                      >
                        {/* Hover "+" icon - opens sidebar */}
                        <div className="absolute right-1 top-1 z-10 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDateClick(day)
                              setShowAddEntryOptions(true)
                            }}
                            className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="flex-1 space-y-1.5">
                          {events.map((event) => {
                            const config = getEventTypeDisplay(entryTypes, event.type)
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
                      </div>
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
                            {parseDateString(insights.mostExpensiveDay.date).toLocaleDateString('en-US', {
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
                            {parseDateString(insights.bestEarningDay.date).toLocaleDateString('en-US', {
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
                              {parseDateString(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
                          {parseDateString(insights.mostExpensiveDay.date).toLocaleDateString('en-US', {
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
                          {parseDateString(insights.bestEarningDay.date).toLocaleDateString('en-US', {
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
                              {parseDateString(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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

              {/* Legend - from backend /calendar/config only */}
              <Card className="border-border/50">
                <CardContent className="p-3">
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {entryTypes.map((t) => {
                      const display = getEventTypeDisplay(entryTypes, t.id)
                      return (
                        <div key={t.id} className="flex items-center gap-1.5">
                          <div className={`h-2 w-2 rounded-full ${display.dotColor}`} />
                          <span className="text-[10px] text-muted-foreground">{t.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Daily Entries Sheet - Opens when clicking a date */}
      <Sheet open={isDailyEntriesOpen} onOpenChange={(open) => {
        setIsDailyEntriesOpen(open)
        if (!open) setShowAddEntryOptions(false)
      }}>
        <SheetContent className="flex h-full max-h-screen w-full flex-col overflow-hidden p-0 sm:max-w-sm">
          <SheetHeader className="shrink-0 border-b border-border px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-base">
                  {dailyEntriesDate?.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </SheetTitle>
                <SheetDescription className="mt-0.5">
                  {(() => {
                    const entries = dailyEntriesDate ? getEventsForDate(dailyEntriesDate) : []
                    return entries.length === 0 
                      ? 'No entries' 
                      : `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`
                  })()}
                </SheetDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 bg-transparent"
                onClick={() => setShowAddEntryOptions(!showAddEntryOptions)}
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
            
            {/* Add Entry Options - from backend entry types */}
            {showAddEntryOptions && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {entryTypes.map((t) => {
                  const display = getEventTypeDisplay(entryTypes, t.id)
                  const Icon = display.icon
                  return (
                    <Button
                      key={t.id}
                      variant="outline"
                      className="h-auto flex-col gap-1 bg-transparent px-2 py-2"
                      onClick={() => handleAddNewFromDailyPanel(t.id)}
                    >
                      <div className={`rounded p-1 ${display.color}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-[10px]">{t.label}</span>
                    </Button>
                  )
                })}
              </div>
            )}
          </SheetHeader>

          <ScrollArea className="flex-1">
            <div className="px-4 py-3">
              {(() => {
                const entries = dailyEntriesDate ? getEventsForDate(dailyEntriesDate) : []
                
                if (entries.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="mb-3 rounded-full bg-muted p-3">
                        <CalendarX className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium text-foreground">No entries yet</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Click the Add button to create an entry
                      </p>
                    </div>
                  )
                }

                // Group entries by type
                const groupedEntries = entries.reduce((acc, entry) => {
                  const type = entry.type
                  if (!acc[type]) acc[type] = []
                  acc[type].push(entry)
                  return acc
                }, {} as Record<string, CalendarEvent[]>)

                return (
                  <div className="space-y-4">
                    {Object.entries(groupedEntries).map(([type, typeEntries]) => {
                      const config = getEventTypeDisplay(entryTypes, type)
                      return (
                        <div key={type}>
                          <div className="mb-2 flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${config.dotColor}`} />
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              {getEntryTypeLabel(entryTypes, type)}
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            {typeEntries.map((entry) => {
                              const Icon = config.icon
                              return (
                                <div
                                  key={entry.id}
                                  className="group flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent/50"
                                >
                                  <div className={`shrink-0 rounded-md p-1.5 ${config.color}`}>
                                    <Icon className="h-4 w-4" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">{entry.title}</p>
                                    {entry.amount !== undefined && (
                                      <p className="text-xs text-muted-foreground">
                                        ${entry.amount.toLocaleString()}
                                      </p>
                                    )}
                                    {entry.hours && (
                                      <p className="text-xs text-muted-foreground">{entry.hours}h</p>
                                    )}
                                    {entry.client && (
                                      <p className="text-xs text-muted-foreground">{entry.client}</p>
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                                    onClick={() => {
                                      setIsDailyEntriesOpen(false)
                                      handleEditEvent(entry)
                                    }}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Inline Edit Sheet - Responsive with Scrollbar */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent className="flex h-full max-h-screen w-full flex-col overflow-hidden p-0 sm:max-w-md">
          <SheetHeader className="shrink-0 border-b border-border px-4 py-4 sm:px-6">
            <SheetTitle className="flex items-center gap-2">
              {editingEvent && (
                <>
                  <div
                    className={`rounded p-1.5 ${getEventTypeDisplay(entryTypes, editingEvent.type).color}`}
                  >
                    {(() => {
                      const Icon = getEventTypeDisplay(entryTypes, editingEvent.type).icon
                      return Icon ? <Icon className="h-4 w-4" /> : null
                    })()}
                  </div>
                  Edit Entry
                </>
              )}
            </SheetTitle>
            <SheetDescription>
              {editingEvent &&
                parseDateString(editingEvent.date).toLocaleDateString('en-US', {
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
                {/* Entry Type - Read-only (fixed when entry was created) */}
                <div className="space-y-2">
                  <Label className="text-xs">Entry Type</Label>
                  <div className="flex h-10 items-center gap-2 rounded-md border border-input bg-muted/50 px-3 text-sm sm:h-9">
<div className={`h-2 w-2 shrink-0 rounded-full ${getEventTypeDisplay(entryTypes, editingEvent.type).dotColor}`} />
                      <span className="text-muted-foreground">
                      {getEntryTypeLabel(entryTypes, editingEvent.type)}
                    </span>
                  </div>
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
                  <DatePicker
                    date={editingEvent.date ? parseDateString(editingEvent.date) : new Date()}
                    onDateChange={(date) => {
                      if (date) {
                        setEditingEvent({ ...editingEvent, date: formatDateToLocal(date) })
                      }
                    }}
                    placeholder="Select date"
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
                      <Label className="text-xs">Contact</Label>
                      {isAddingClientInEdit ? (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter contact name"
                            value={newClientName}
                            onChange={(e) => setNewClientName(e.target.value)}
                            className="h-10 sm:h-9"
                            autoFocus
                          />
                          <Button
                            type="button"
                            size="sm"
                            className="h-10 sm:h-9"
                            onClick={async () => {
                              if (newClientName.trim()) {
                                const name = newClientName.trim()
                                await addContact({ name, email: '' })
                                setEditingEvent({ ...editingEvent, client: name })
                                setNewClientName('')
                                setIsAddingClientInEdit(false)
                              }
                            }}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-10 sm:h-9"
                            onClick={() => {
                              setNewClientName('')
                              setIsAddingClientInEdit(false)
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Select
                            value={editingEvent.client || 'none'}
                            onValueChange={(v) => setEditingEvent({ ...editingEvent, client: v === 'none' ? undefined : v })}
                          >
                            <SelectTrigger className="h-10 sm:h-9 flex-1">
                              <SelectValue placeholder="Select client" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No client</SelectItem>
                              {sortAlphabetically(contacts).map((contact) => (
                                <SelectItem key={contact.id} value={contact.name}>
                                  {contact.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-10 sm:h-9 bg-transparent"
                            onClick={() => setIsAddingClientInEdit(true)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
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
                          {sortAlphabetically(categories).map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Payment Method</Label>
                      <Select
                        value={
                          paymentMethods.find((p) => p.name === editingEvent.paymentMethod)?.id ??
                          editingEvent.paymentMethod ??
                          'none'
                        }
                        onValueChange={(v) =>
                          setEditingEvent({ ...editingEvent, paymentMethod: v === 'none' ? undefined : v })
                        }
                      >
                        <SelectTrigger className="h-10 sm:h-9">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Not specified</SelectItem>
                          {sortAlphabetically(paymentMethods).map((method) => (
                            <SelectItem key={method.id} value={method.id}>
                              {method.name}
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
                      <Label className="text-xs">Contact</Label>
                      {isAddingClientInEdit ? (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter contact name"
                            value={newClientName}
                            onChange={(e) => setNewClientName(e.target.value)}
                            className="h-10 sm:h-9"
                            autoFocus
                          />
                          <Button
                            type="button"
                            size="sm"
                            className="h-10 sm:h-9"
                            onClick={async () => {
                              if (newClientName.trim()) {
                                const name = newClientName.trim()
                                await addContact({ name, email: '' })
                                setEditingEvent({ ...editingEvent, client: name })
                                setNewClientName('')
                                setIsAddingClientInEdit(false)
                              }
                            }}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-10 sm:h-9"
                            onClick={() => {
                              setNewClientName('')
                              setIsAddingClientInEdit(false)
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Select
                            value={editingEvent.client || 'none'}
                            onValueChange={(v) => setEditingEvent({ ...editingEvent, client: v === 'none' ? undefined : v })}
                          >
                            <SelectTrigger className="h-10 sm:h-9 flex-1">
                              <SelectValue placeholder="Select client" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No client</SelectItem>
                              {sortAlphabetically(contacts).map((contact) => (
                                <SelectItem key={contact.id} value={contact.name}>
                                  {contact.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-10 sm:h-9 bg-transparent"
                            onClick={() => setIsAddingClientInEdit(true)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
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
                      <Label className="text-xs">Contact</Label>
                      {isAddingClientInEdit ? (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter contact name"
                            value={newClientName}
                            onChange={(e) => setNewClientName(e.target.value)}
                            className="h-10 sm:h-9"
                            autoFocus
                          />
                          <Button
                            type="button"
                            size="sm"
                            className="h-10 sm:h-9"
                            onClick={async () => {
                              if (newClientName.trim()) {
                                const name = newClientName.trim()
                                await addContact({ name, email: '' })
                                setEditingEvent({ ...editingEvent, client: name })
                                setNewClientName('')
                                setIsAddingClientInEdit(false)
                              }
                            }}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-10 sm:h-9"
                            onClick={() => {
                              setNewClientName('')
                              setIsAddingClientInEdit(false)
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Select
                            value={editingEvent.client || 'none'}
                            onValueChange={(v) => setEditingEvent({ ...editingEvent, client: v === 'none' ? undefined : v })}
                          >
                            <SelectTrigger className="h-10 sm:h-9 flex-1">
                              <SelectValue placeholder="Select client" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No client</SelectItem>
                              {sortAlphabetically(contacts).map((contact) => (
                                <SelectItem key={contact.id} value={contact.name}>
                                  {contact.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-10 sm:h-9 bg-transparent"
                            onClick={() => setIsAddingClientInEdit(true)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
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
              {(editingEvent.id.startsWith('expense-') || editingEvent.id.startsWith('work-') || editingEvent.id.startsWith('local-')) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleDeleteEvent(editingEvent.id)}
                >
                  <Trash2 className="mr-2 h-3 w-3" />
                  Delete Entry
                </Button>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Reusable ExpenseForm component - same as Expenses page */}
      <ExpenseForm
        open={expenseFormOpen}
        onOpenChange={setExpenseFormOpen}
        mode={expenseFormMode}
        expense={selectedExpenseForEdit}
        defaultDate={expenseFormDefaultDate}
        onSubmit={handleExpenseFormSubmit}
      />
    </div>
  </TooltipProvider>
  )
}
