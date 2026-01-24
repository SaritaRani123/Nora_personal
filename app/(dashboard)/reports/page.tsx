'use client';

import { BarChart3 } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="w-full min-w-0">
      <div className="max-w-2xl mx-auto text-center py-12 sm:py-16">
        <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Reports</h1>
        <p className="text-gray-500">
          Weekly and monthly reports will appear here. Connect your calendar and expenses to see summaries and trends.
        </p>
      </div>
    </div>
  );
}
