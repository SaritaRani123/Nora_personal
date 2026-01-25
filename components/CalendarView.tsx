'use client';

import React, { useState, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  addYears,
  subYears,
  isSameMonth,
  isToday,
  isSameDay,
  parseISO,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  List,
  LayoutGrid,
  Clock,
  X,
  DollarSign,
  Receipt,
  Briefcase,
  Plane,
  StickyNote,
  DollarSign as DollarIcon,
  FileText,
} from 'lucide-react';
import { useCalendar } from '@/app/context/CalendarContext';
import type { Expense, Invoice } from '@/types/invoice';
import type { WorkEntry, TravelEntry, NoteEntry } from '@/types/calendar';
import Modal from '@/ui/Modal';

type CalendarViewType = 'month' | 'week' | 'day';

type CalendarEntry = {
  id: string;
  type: 'expense' | 'income' | 'work' | 'travel' | 'note' | 'invoice';
  date: string;
  data: Expense | Invoice | WorkEntry | TravelEntry | NoteEntry;
  amount?: number;
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
};

export default function CalendarView() {
  const calendar = useCalendar();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarViewType>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<CalendarEntry | null>(null);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addEntryType, setAddEntryType] = useState<'expense' | 'work' | 'travel' | 'note' | 'invoice'>('expense');

  // Combine all entries into unified calendar entries
  const calendarEntries = useMemo(() => {
    const entries: CalendarEntry[] = [];

    // Expenses (Red - money going out)
    calendar.expenses.forEach((exp) => {
      entries.push({
        id: `exp-${exp.id}`,
        type: 'expense',
        date: exp.date,
        data: exp,
        amount: -exp.amount,
        label: `${exp.vendor} - $${exp.amount.toFixed(2)}`,
        color: 'text-red-700',
        bgColor: 'bg-red-50 border-red-200',
        icon: <Receipt className="w-3 h-3" />,
      });
    });

    // Invoices/Income (Green - money coming in, when sent or paid)
    calendar.invoices.forEach((inv) => {
      if (inv.status === 'sent' || inv.status === 'paid') {
        entries.push({
          id: `inv-${inv.id}`,
          type: 'income',
          date: inv.issueDate,
          data: inv,
          amount: inv.amount,
          label: `${inv.clientName} - $${inv.amount.toFixed(2)}`,
          color: 'text-green-700',
          bgColor: 'bg-green-50 border-green-200',
          icon: <DollarIcon className="w-3 h-3" />,
        });
      }
    });

    // Work entries (Blue - time-based) - #3B82F6
    calendar.workEntries.forEach((work) => {
      entries.push({
        id: `work-${work.id}`,
        type: 'work',
        date: work.date,
        data: work,
        label: `${work.clientName || 'Work'}: ${work.description}`,
        color: 'text-blue-700',
        bgColor: 'bg-blue-50 border-blue-200',
        icon: <Briefcase className="w-3 h-3" />,
      });
    });

    // Travel entries (Purple) - #8B5CF6
    calendar.travelEntries.forEach((travel) => {
      entries.push({
        id: `travel-${travel.id}`,
        type: 'travel',
        date: travel.date,
        data: travel,
        label: `${travel.destination} - ${travel.purpose}`,
        color: 'text-purple-700',
        bgColor: 'bg-purple-50 border-purple-200',
        icon: <Plane className="w-3 h-3" />,
      });
    });

    // Notes (Gray) - #6B7280
    calendar.notes.forEach((note) => {
      entries.push({
        id: `note-${note.id}`,
        type: 'note',
        date: note.date,
        data: note,
        label: note.title,
        color: 'text-gray-700',
        bgColor: 'bg-gray-50 border-gray-200',
        icon: <StickyNote className="w-3 h-3" />,
      });
    });

    return entries;
  }, [calendar.expenses, calendar.invoices, calendar.workEntries, calendar.travelEntries, calendar.notes]);

  // Group entries by date
  const entriesByDate = useMemo(() => {
    const map: Record<string, CalendarEntry[]> = {};
    calendarEntries.forEach((entry) => {
      const dateKey = entry.date;
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(entry);
    });
    // Sort entries within each day
    Object.keys(map).forEach((date) => {
      map[date].sort((a, b) => {
        // Sort by type priority, then by amount (if applicable)
        const typeOrder = { expense: 0, income: 1, work: 2, travel: 3, note: 4 };
        const typeDiff = typeOrder[a.type] - typeOrder[b.type];
        if (typeDiff !== 0) return typeDiff;
        return (b.amount || 0) - (a.amount || 0);
      });
    });
    return map;
  }, [calendarEntries]);

  // Calculate totals per day
  const totalsByDate = useMemo(() => {
    const map: Record<string, { income: number; expense: number; net: number }> = {};
    calendarEntries.forEach((entry) => {
      const dateKey = entry.date;
      if (!map[dateKey]) map[dateKey] = { income: 0, expense: 0, net: 0 };
      if (entry.amount) {
        if (entry.amount > 0) {
          map[dateKey].income += entry.amount;
        } else {
          map[dateKey].expense += Math.abs(entry.amount);
        }
        map[dateKey].net = map[dateKey].income - map[dateKey].expense;
      }
    });
    return map;
  }, [calendarEntries]);

  // Calendar grid calculations
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const monthDays: Date[] = [];
  let d = calendarStart;
  while (d <= calendarEnd) {
    monthDays.push(d);
    d = addDays(d, 1);
  }

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);

  const getDayEntries = (date: Date): CalendarEntry[] => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return entriesByDate[dateKey] || [];
  };

  const getDayTotal = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return totalsByDate[dateKey] || { income: 0, expense: 0, net: 0 };
  };

  const handleEntryClick = (entry: CalendarEntry) => {
    setSelectedEntry(entry);
    setShowEntryModal(true);
  };

  const handleAddClick = (date: Date, type?: 'expense' | 'work' | 'travel' | 'note' | 'invoice') => {
    setSelectedDate(date);
    if (type) setAddEntryType(type);
    setShowAddModal(true);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    if (view === 'month') {
      setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
    } else if (view === 'week') {
      setCurrentDate(direction === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1));
    } else {
      setCurrentDate(direction === 'prev' ? subDays(currentDate, 1) : addDays(currentDate, 1));
    }
  };

  const navigateYear = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'prev' ? subYears(currentDate, 1) : addYears(currentDate, 1));
  };

  const currentYear = currentDate.getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="h-full flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Premium Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-b border-gray-200 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigateDate('prev')}
            className="p-2 text-gray-500 hover:bg-white hover:text-gray-700 rounded-xl transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
              {view === 'month' && format(currentDate, 'MMMM yyyy')}
              {view === 'week' && `Week of ${format(weekStart, 'MMM d, yyyy')}`}
              {view === 'day' && format(currentDate, 'EEEE, MMMM d, yyyy')}
            </h2>
            <select
              value={currentYear}
              onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value), currentDate.getMonth(), 1))}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => navigateDate('next')}
            className="p-2 text-gray-500 hover:bg-white hover:text-gray-700 rounded-xl transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-xl transition-colors"
          >
            Today
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-gray-200 p-0.5 bg-white">
            <button
              type="button"
              onClick={() => setView('month')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                view === 'month' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Month
            </button>
            <button
              type="button"
              onClick={() => setView('week')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                view === 'week' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Week
            </button>
            <button
              type="button"
              onClick={() => setView('day')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                view === 'day' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Day
            </button>
          </div>
          <button
            type="button"
            onClick={() => handleAddClick(currentDate)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Entry
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="px-5 py-3 border-b border-gray-200 bg-white flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-50 border border-red-200"></div>
          <span className="text-gray-600">Expenses</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-50 border border-green-200"></div>
          <span className="text-gray-600">Income</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-50 border border-blue-200"></div>
          <span className="text-gray-600">Work</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-purple-50 border border-purple-200"></div>
          <span className="text-gray-600">Travel</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gray-50 border border-gray-200"></div>
          <span className="text-gray-600">Notes</span>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 overflow-auto p-4">
        {view === 'month' ? (
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-xl overflow-hidden">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="bg-gray-50 px-3 py-2.5 text-center text-xs font-semibold text-gray-600 uppercase">
                {day}
              </div>
            ))}
            {monthDays.map((day) => {
              const entries = getDayEntries(day);
              const totals = getDayTotal(day);
              const inMonth = isSameMonth(day, currentDate);
              const isTodayDate = isToday(day);
              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[120px] bg-white p-2 flex flex-col ${!inMonth ? 'opacity-40' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <button
                      type="button"
                      onClick={() => handleAddClick(day)}
                      className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
                        isTodayDate
                          ? 'bg-primary-600 text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {format(day, 'd')}
                    </button>
                    {totals.net !== 0 && (
                      <span
                        className={`text-xs font-semibold ${
                          totals.net > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {totals.net > 0 ? '+' : ''}
                        {formatCurrency(totals.net)}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 space-y-1 overflow-y-auto flex-1 min-h-0">
                    {entries.slice(0, 4).map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => handleEntryClick(entry)}
                        className={`w-full text-left px-2 py-1 rounded-lg border text-xs truncate transition-all hover:shadow-sm ${entry.bgColor} ${entry.color}`}
                        title={entry.label}
                      >
                        <div className="flex items-center gap-1">
                          {entry.icon}
                          <span className="truncate">{entry.label}</span>
                        </div>
                      </button>
                    ))}
                    {entries.length > 4 && (
                      <button
                        type="button"
                        onClick={() => handleAddClick(day)}
                        className="w-full text-left px-2 py-1 text-xs text-gray-500 hover:bg-gray-50 rounded-lg"
                      >
                        +{entries.length - 4} more
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : view === 'week' ? (
          <div className="grid grid-cols-7 gap-4">
            {weekDays.map((day) => {
              const entries = getDayEntries(day);
              const totals = getDayTotal(day);
              const isTodayDate = isToday(day);
              return (
                <div key={day.toISOString()} className="flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-white">
                  <div
                    className={`px-4 py-3 text-sm font-semibold border-b border-gray-200 ${
                      isTodayDate ? 'bg-primary-600 text-white' : 'bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div>{format(day, 'EEE')}</div>
                    <div className="text-xs font-normal opacity-90">{format(day, 'MMM d')}</div>
                    {totals.net !== 0 && (
                      <div className={`text-xs mt-1 ${isTodayDate ? 'text-white' : totals.net > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {totals.net > 0 ? '+' : ''}
                        {formatCurrency(totals.net)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-3 space-y-2 min-h-[200px] overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => handleAddClick(day)}
                      className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-primary-500 hover:text-primary-600 text-sm transition-colors"
                    >
                      <Plus className="w-4 h-4 mx-auto mb-0.5" />
                      Add
                    </button>
                    {entries.map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => handleEntryClick(entry)}
                        className={`w-full text-left px-3 py-2 rounded-lg border transition-all hover:shadow-sm ${entry.bgColor} ${entry.color}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {entry.icon}
                          <span className="font-medium text-xs">{entry.type.toUpperCase()}</span>
                        </div>
                        <div className="text-sm font-medium truncate">{entry.label}</div>
                        {entry.amount && (
                          <div className="text-xs mt-1 font-semibold">
                            {entry.amount > 0 ? '+' : ''}
                            {formatCurrency(Math.abs(entry.amount))}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
              <div className={`px-6 py-4 border-b border-gray-200 ${isToday(currentDate) ? 'bg-primary-600 text-white' : 'bg-gray-50'}`}>
                <div className="text-2xl font-bold">{format(currentDate, 'EEEE, MMMM d, yyyy')}</div>
                {getDayTotal(currentDate).net !== 0 && (
                  <div className={`text-sm mt-2 ${isToday(currentDate) ? 'text-white' : getDayTotal(currentDate).net > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Net: {getDayTotal(currentDate).net > 0 ? '+' : ''}
                    {formatCurrency(getDayTotal(currentDate).net)}
                  </div>
                )}
              </div>
              <div className="p-6 space-y-3">
                <button
                  type="button"
                  onClick={() => handleAddClick(currentDate)}
                  className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-primary-500 hover:text-primary-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Entry</span>
                </button>
                {getDayEntries(currentDate).map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => handleEntryClick(entry)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all hover:shadow-md ${entry.bgColor} ${entry.color}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {entry.icon}
                        <span className="font-semibold text-sm uppercase">{entry.type}</span>
                      </div>
                      {entry.amount && (
                        <span className="font-bold">
                          {entry.amount > 0 ? '+' : ''}
                          {formatCurrency(Math.abs(entry.amount))}
                        </span>
                      )}
                    </div>
                    <div className="font-medium">{entry.label}</div>
                    {entry.type === 'work' && (entry.data as WorkEntry).hours && (
                      <div className="text-xs mt-1 opacity-75">
                        {(entry.data as WorkEntry).hours} hours
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Entry Detail Modal */}
      <Modal
        isOpen={showEntryModal}
        onClose={() => {
          setShowEntryModal(false);
          setSelectedEntry(null);
        }}
        title={selectedEntry ? `${selectedEntry.type.toUpperCase()} Entry` : ''}
        size="md"
      >
        {selectedEntry && (
          <div className="space-y-4">
            <div className={`p-4 rounded-xl border ${selectedEntry.bgColor}`}>
              <div className="flex items-center gap-2 mb-2">
                {selectedEntry.icon}
                <span className="font-semibold">{selectedEntry.type.toUpperCase()}</span>
              </div>
              <div className="font-medium text-gray-900">{selectedEntry.label}</div>
              {selectedEntry.amount && (
                <div className={`text-lg font-bold mt-2 ${selectedEntry.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedEntry.amount > 0 ? '+' : ''}
                  {formatCurrency(Math.abs(selectedEntry.amount))}
                </div>
              )}
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-500">Date:</span>{' '}
                <span className="text-gray-900">
                  {format(parseISO(selectedEntry.date), 'MMMM d, yyyy')}
                </span>
              </div>
              {selectedEntry.type === 'expense' && (
                <>
                  <div>
                    <span className="font-medium text-gray-500">Vendor:</span>{' '}
                    <span className="text-gray-900">{(selectedEntry.data as Expense).vendor}</span>
                  </div>
                  {(selectedEntry.data as Expense).description && (
                    <div>
                      <span className="font-medium text-gray-500">Description:</span>{' '}
                      <span className="text-gray-900">{(selectedEntry.data as Expense).description}</span>
                    </div>
                  )}
                </>
              )}
              {selectedEntry.type === 'income' && (
                <>
                  <div>
                    <span className="font-medium text-gray-500">Client:</span>{' '}
                    <span className="text-gray-900">{(selectedEntry.data as Invoice).clientName}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Invoice:</span>{' '}
                    <span className="text-gray-900">{(selectedEntry.data as Invoice).invoiceNumber}</span>
                  </div>
                </>
              )}
              {selectedEntry.type === 'work' && (
                <>
                  {(selectedEntry.data as WorkEntry).clientName && (
                    <div>
                      <span className="font-medium text-gray-500">Client:</span>{' '}
                      <span className="text-gray-900">{(selectedEntry.data as WorkEntry).clientName}</span>
                    </div>
                  )}
                  {(selectedEntry.data as WorkEntry).hours && (
                    <div>
                      <span className="font-medium text-gray-500">Hours:</span>{' '}
                      <span className="text-gray-900">{(selectedEntry.data as WorkEntry).hours}</span>
                    </div>
                  )}
                </>
              )}
              {selectedEntry.type === 'travel' && (
                <>
                  <div>
                    <span className="font-medium text-gray-500">Destination:</span>{' '}
                    <span className="text-gray-900">{(selectedEntry.data as TravelEntry).destination}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Purpose:</span>{' '}
                    <span className="text-gray-900">{(selectedEntry.data as TravelEntry).purpose}</span>
                  </div>
                </>
              )}
              {selectedEntry.type === 'note' && (
                <div>
                  <span className="font-medium text-gray-500">Content:</span>
                  <div className="text-gray-900 mt-1 p-2 bg-gray-50 rounded-lg">
                    {(selectedEntry.data as NoteEntry).content}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Add Entry Modal - Simplified for now, can be expanded */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSelectedDate(null);
        }}
        title={`Add ${addEntryType.charAt(0).toUpperCase() + addEntryType.slice(1)} Entry`}
        size="md"
      >
        <div className="text-center py-8 text-gray-500">
          <p>Add entry form will be implemented here.</p>
          <p className="text-sm mt-2">For now, use the Expenses or Invoices pages to add entries.</p>
        </div>
      </Modal>
    </div>
  );
}
