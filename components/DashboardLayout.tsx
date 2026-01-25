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
  LayoutDashboard,
  Users,
} from 'lucide-react';

const sidebarLinks = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Calendar', href: '/calendar', icon: CalendarIcon },
  { name: 'Expenses', href: '/expenses', icon: Receipt },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex pt-16 bg-gray-50">
      {/* Premium Sidebar - soft white background */}
      <aside className="hidden lg:flex flex-col w-72 flex-shrink-0 bg-white border-r border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:from-primary-600 group-hover:to-primary-700 transition-all shadow-sm">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">Nora</span>
          </Link>
        </div>
        <nav className="flex-1 py-4 px-4 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              pathname === link.href ||
              (link.href === '/expenses' && pathname?.startsWith('/expenses')) ||
              (link.href === '/invoices' && pathname?.startsWith('/invoices')) ||
              (link.href === '/reports' && pathname?.startsWith('/reports')) ||
              (link.href === '/clients' && pathname?.startsWith('/clients')) ||
              (link.href === '/dashboard' && pathname === '/dashboard');
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-600' : 'text-gray-500'}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-all duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to site
          </Link>
        </div>
      </aside>

      {/* Mobile nav - premium bottom navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex overflow-x-auto px-2 py-2 gap-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              pathname === link.href ||
              (link.href === '/expenses' && pathname?.startsWith('/expenses')) ||
              (link.href === '/invoices' && pathname?.startsWith('/invoices')) ||
              (link.href === '/reports' && pathname?.startsWith('/reports')) ||
              (link.href === '/clients' && pathname?.startsWith('/clients')) ||
              (link.href === '/dashboard' && pathname === '/dashboard');
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-500'}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main content area - premium spacing */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        <main className="flex-1 overflow-auto pb-20 lg:pb-0">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 min-w-0 break-words">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
