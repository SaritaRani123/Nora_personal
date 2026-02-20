'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { fetchUser, AVATAR_STORAGE_KEY } from '@/lib/services/user'
import type { User } from '@/lib/services/user'

interface UserContextValue {
  user: User
  updateUser: (updates: Partial<User>) => void
  isLoading: boolean
}

const UserContext = createContext<UserContextValue | null>(null)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUser()
      .then((u) => setUser(u))
      .finally(() => setIsLoading(false))
  }, [])

  const updateUser = useCallback((updates: Partial<User>) => {
    if (updates.avatar !== undefined && typeof window !== 'undefined') {
      try {
        if (updates.avatar) window.localStorage.setItem(AVATAR_STORAGE_KEY, updates.avatar)
        else window.localStorage.removeItem(AVATAR_STORAGE_KEY)
      } catch {
        // ignore
      }
    }
    setUser((prev) => (prev ? { ...prev, ...updates } : null))
  }, [])

  const displayUser = user ?? {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@business.com',
    phone: '+1 (555) 123-4567',
    avatar: null,
  } as User

  return (
    <UserContext.Provider value={{ user: displayUser, updateUser, isLoading }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext)
  if (!ctx) {
    throw new Error('useUser must be used within UserProvider')
  }
  return ctx
}
