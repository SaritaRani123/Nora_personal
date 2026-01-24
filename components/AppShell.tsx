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

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex pt-16 bg-gray-50">
      {/* Sidebar - fixed, app-wide, Nora logo at top */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-16 bottom-0 w-64 flex-shrink-0 bg-gray-800 border-r border-gray-700/50 z-30">
        <div className="p-4 border-b border-gray-700/50">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-primary-600 rounded-lg flex-shrink-0 group-hover:bg-primary-500 transition-colors" />
            <span className="text-lg font-bold text-white">Nora</span>
          </Link>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
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
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white whitespace-nowrap"
          >
            Home
          </Link>
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
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <main className="flex-1 overflow-auto pb-20 lg:pb-0">
          {children}
        </main>
      </div>
    </div>
  );
}
