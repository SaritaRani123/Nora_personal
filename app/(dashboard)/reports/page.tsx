'use client';

import { BarChart3, TrendingUp, Calendar, Download, FileText } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="w-full min-w-0 space-y-6">
      {/* Premium Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Reports</h1>
          <p className="text-sm text-gray-500">Analytics and insights for your finances</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium shadow-sm hover:shadow-md transition-all">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Weekly Report */}
        <div className="card p-6 hover:shadow-card-hover transition-all cursor-pointer">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Weekly Report</h3>
              <p className="text-xs text-gray-500">Last 7 days</p>
            </div>
          </div>
          <div className="h-32 bg-gray-50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200">
            <FileText className="w-8 h-8 text-gray-300" />
          </div>
        </div>

        {/* Monthly Report */}
        <div className="card p-6 hover:shadow-card-hover transition-all cursor-pointer">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-info-subtle rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-info" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Monthly Report</h3>
              <p className="text-xs text-gray-500">Last 30 days</p>
            </div>
          </div>
          <div className="h-32 bg-gray-50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200">
            <BarChart3 className="w-8 h-8 text-gray-300" />
          </div>
        </div>

        {/* Trends Report */}
        <div className="card p-6 hover:shadow-card-hover transition-all cursor-pointer">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-success-subtle rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Trends Analysis</h3>
              <p className="text-xs text-gray-500">Growth patterns</p>
            </div>
          </div>
          <div className="h-32 bg-gray-50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200">
            <TrendingUp className="w-8 h-8 text-gray-300" />
          </div>
        </div>
      </div>

      {/* Main Report Area */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Financial Overview</h2>
            <p className="text-sm text-gray-500 mt-1">Comprehensive analysis of your finances</p>
          </div>
        </div>
        <div className="h-96 bg-gray-50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500 mb-1">Report visualization</p>
            <p className="text-xs text-gray-400">Detailed charts and analytics will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
