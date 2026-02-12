/**
 * Centralized API configuration.
 * All backend requests use this base URL (no hardcoded URLs in services).
 * Frontend runs on port 3000; backend on port 8080.
 */

const DEFAULT_API_BASE_URL = 'http://localhost:8080'

/**
 * Returns the backend API base URL (no trailing slash).
 * Set NEXT_PUBLIC_API_BASE_URL in .env to override (e.g. for production).
 */
export function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL
  return url.replace(/\/+$/, '')
}
