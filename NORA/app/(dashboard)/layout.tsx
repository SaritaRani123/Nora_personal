'use client'

import React from "react"

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { DashboardHeader } from '@/components/dashboard-header'
import { UserProvider } from '@/lib/contexts/UserContext'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <UserProvider>
    <SidebarProvider className="w-full min-w-0">
      <div className="print:hidden shrink-0 grow-0 basis-auto">
        <AppSidebar />
      </div>
      <SidebarInset className="min-w-0">
        <div className="print:hidden h-16 shrink-0" aria-hidden>
          <DashboardHeader />
        </div>
        <main className="min-h-0 min-w-0 flex-1 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
    </UserProvider>
  )
}
