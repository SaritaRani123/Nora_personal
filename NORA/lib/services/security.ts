import { apiFetch } from '@/lib/api/http'
import { HttpError } from '@/lib/api/http'

export interface ChangePasswordParams {
  email: string
  currentPassword: string
  newPassword: string
}

export interface DeleteAccountParams {
  email: string
  password: string
}

export async function changePassword(params: ChangePasswordParams): Promise<void> {
  await apiFetch('/security/change-password', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}

export async function enable2FA(email: string): Promise<{ twoFactorEnabled: boolean }> {
  const body = (await apiFetch('/security/enable-2fa', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })) as { twoFactorEnabled?: boolean }
  return { twoFactorEnabled: body.twoFactorEnabled ?? false }
}

export async function get2FAStatus(email: string): Promise<{ twoFactorEnabled: boolean }> {
  const body = (await apiFetch(`/security/2fa-status?email=${encodeURIComponent(email)}`)) as {
    twoFactorEnabled?: boolean
  }
  return { twoFactorEnabled: body.twoFactorEnabled ?? false }
}

export async function deleteAccount(params: DeleteAccountParams): Promise<void> {
  await apiFetch('/security/account', {
    method: 'DELETE',
    body: JSON.stringify(params),
  })
}

export { HttpError }
