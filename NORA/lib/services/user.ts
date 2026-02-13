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

/** Get initials from firstName + lastName */
export function getUserInitials(user: User): string {
  const first = user.firstName?.charAt(0) || ''
  const last = user.lastName?.charAt(0) || ''
  return (first + last).toUpperCase() || '?'
}

/** Mock fetch - returns hardcoded John Doe */
export async function fetchUser(): Promise<User> {
  return {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@business.com',
    phone: '+1 (555) 123-4567',
    avatar: null,
  }
}

/**
 * Update user - no API call yet.
 * Caller should use UserContext.updateUser() which updates local state.
 * Later: this can persist to backend.
 */
export async function updateUser(_updates: Partial<User>): Promise<void> {
  // No-op for now; context handles local updates
}
