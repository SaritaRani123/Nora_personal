/**
 * User service - mock for now.
 * Later: fetchUser/updateUser can call AWS API.
 */

export interface User {
  firstName: string
  lastName: string
  email: string
  phone: string
  avatar?: string | null
}

/** localStorage key for avatar (used when backend does not persist it) */
export const AVATAR_STORAGE_KEY = 'nora_avatar'

/** Get initials from firstName + lastName */
export function getUserInitials(user: User): string {
  const first = user.firstName?.charAt(0) || ''
  const last = user.lastName?.charAt(0) || ''
  return (first + last).toUpperCase() || '?'
}

/** Mock fetch - returns hardcoded user and loads avatar from localStorage when no backend */
export async function fetchUser(): Promise<User> {
  const base = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@business.com',
    phone: '+1 (555) 123-4567',
  }
  const avatar =
    typeof window !== 'undefined' ? localStorage.getItem(AVATAR_STORAGE_KEY) : null
  return { ...base, avatar: avatar || null }
}

/**
 * Update user - no API call yet.
 * Caller should use UserContext.updateUser() which updates local state and persists avatar to localStorage.
 * Later: this can persist to backend.
 */
export async function updateUser(_updates: Partial<User>): Promise<void> {
  // No-op for now; context handles local updates and avatar persistence
}
