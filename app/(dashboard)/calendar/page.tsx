'use client';

import CalendarView from '@/components/CalendarView';

export default function CalendarPage() {
  return (
    <div className="w-full min-w-0 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Calendar</h1>
        <p className="text-sm text-gray-500">Unified financial activity timeline</p>
      </div>
      <div className="h-[calc(100vh-280px)] min-h-[600px]">
        <CalendarView />
      </div>
    </div>
  );
}
