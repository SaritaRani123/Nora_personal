'use client'

import Link from 'next/link'
import { useUser } from '@/lib/contexts/UserContext'
import { getUserInitials } from '@/lib/services/user'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Receipt,
  BarChart3,
  Settings,
  Sparkles,
  FileCheck,
  CalendarDays,
  Users,
  PiggyBank,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar'

const navItems = [
  { title: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { title: 'Bank Statements', icon: FileText, href: '/statements' },
  { title: 'Expenses', icon: Receipt, href: '/expenses' },
  { title: 'Invoices', icon: FileCheck, href: '/invoices' },
  { title: 'Contacts', icon: Users, href: '/contacts' },
  { title: 'Calendar', icon: CalendarDays, href: '/calendar' },
  { title: 'Reports', icon: BarChart3, href: '/reports' },
  { title: 'Settings', icon: Settings, href: '/settings' },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user } = useUser()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">Nora</span>
            <span className="text-xs text-sidebar-foreground/60">Business Tracker</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent text-sm font-medium text-sidebar-accent-foreground">
            {getUserInitials(user)}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-sidebar-foreground">{user.firstName} {user.lastName}</span>
            <span className="text-xs text-sidebar-foreground/60">{user.email}</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
