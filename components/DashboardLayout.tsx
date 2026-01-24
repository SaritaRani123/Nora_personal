'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Calendar as CalendarIcon,
  Receipt,
  FileText,
  BarChart3,
  ChevronLeft,
} from 'lucide-react';

const sidebarLinks = [
  { name: 'Calendar', href: '/calendar', icon: CalendarIcon },
  { name: 'Expenses', href: '/expenses', icon: Receipt },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex pt-16 bg-gray-50">
      {/* Sidebar - fixed, permanently sticky, aligned under navbar */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 bg-gray-800 border-r border-gray-700/50">
        <nav className="flex-1 py-5 px-3 space-y-0.5 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              pathname === link.href ||
              (link.href === '/expenses' && pathname?.startsWith('/expenses')) ||
              (link.href === '/invoices' && pathname?.startsWith('/invoices')) ||
              (link.href === '/reports' && pathname?.startsWith('/reports'));
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {link.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-gray-700/50">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-400 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to site
          </Link>
        </div>
      </aside>

      {/* Mobile nav - fixed bottom */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-800 border-t border-gray-700/50">
        <div className="flex overflow-x-auto px-2 py-2 gap-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              pathname === link.href ||
              (link.href === '/expenses' && pathname?.startsWith('/expenses')) ||
              (link.href === '/invoices' && pathname?.startsWith('/invoices')) ||
              (link.href === '/reports' && pathname?.startsWith('/reports'));
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.name}
              </Link>
            );
          })}
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-700 hover:text-white whitespace-nowrap"
          >
            <ChevronLeft className="w-4 h-4" />
            Site
          </Link>
        </div>
      </div>

      {/* Main content - margin-left for fixed sidebar, consistent padding */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        <main className="flex-1 overflow-auto pb-20 lg:pb-0">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 min-w-0 break-words">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
