export * from './request'
export * from './storage'
export * from './id'
export * from './date'
export * from './file'
export { FILE_TYPES } from './file'
export { STORAGE_KEYS } from './storage'
export * from './dify-app-mode'

export { 
  generateId,
  generateConversationId,
  generateMessageId,
  generateAppId,
  generateUUID,
  generateShortId
} from './id'

export {
  formatDate,
  formatMessageTime,
  formatConversationTime,
  getRelativeTime,
  formatDuration
} from './date'

export {
  formatFileSize,
  getFileTypeCategory,
  validateFiles,
  isImage,
  isAudio,
  isVideo,
  isDocument,
  compressImage,
  downloadFile
} from './file'

export {
  localStorage,
  sessionStorage,
  useLocalStorage,
  useSessionStorage,
  storageUtils
} from './storage'

export {
  get,
  post,
  put,
  patch,
  del,
  uploadFile,
  downloadFile as downloadFileFromUrl,
  requestWithRetry
} from './request'

// Utility functions that might be commonly used
import { formatFileSize } from './file'
import { formatDate, getRelativeTime } from './date'
import { generateId } from './id'

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T
  }
  
  if (typeof obj === 'object') {
    const cloned: any = {}
    Object.keys(obj).forEach(key => {
      cloned[key] = deepClone((obj as any)[key])
    })
    return cloned as T
  }
  
  return obj
}

/**
 * Check if value is empty
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * Format text to title case
 */
export function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  )
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Generate random hex color
 */
export function randomColor(): string {
  return '#' + Math.floor(Math.random() * 16777215).toString(16)
}

/**
 * Get contrast color (black or white) for a given color
 */
export function getContrastColor(hexColor: string): string {
  const r = parseInt(hexColor.slice(1, 3), 16)
  const g = parseInt(hexColor.slice(3, 5), 16)
  const b = parseInt(hexColor.slice(5, 7), 16)
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  return luminance > 0.5 ? '#000000' : '#ffffff'
}

/**
 * Sleep function
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (i < maxRetries) {
        await sleep(delay * Math.pow(2, i)) // Exponential backoff
      }
    }
  }
  
  throw lastError!
}

/**
 * Check if code is running in browser
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

/**
 * Check if device is mobile
 */
export function isMobile(): boolean {
  if (!isBrowser()) return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/**
 * Check if device is iOS
 */
export function isIOS(): boolean {
  if (!isBrowser()) return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

/**
 * Check if device is Android
 */
export function isAndroid(): boolean {
  if (!isBrowser()) return false
  return /Android/.test(navigator.userAgent)
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!isBrowser()) return false
  
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      try {
        document.execCommand('copy')
        return true
      } finally {
        document.body.removeChild(textArea)
      }
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

/**
 * Parse URL parameters
 */
export function parseUrlParams(url?: string): Record<string, string> {
  const params: Record<string, string> = {}
  const urlToParse = url || (isBrowser() ? window.location.href : '')
  
  try {
    const urlObj = new URL(urlToParse)
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value
    })
  } catch (error) {
    console.error('Failed to parse URL:', error)
  }
  
  return params
}

/**
 * Build URL with parameters
 */
export function buildUrl(baseUrl: string, params: Record<string, any>): string {
  const url = new URL(baseUrl, isBrowser() ? window.location.origin : 'http://localhost')
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value))
    }
  })
  
  return url.toString()
}

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Get safe area insets for mobile devices
 */
export function getSafeAreaInsets(): { top: number; bottom: number; left: number; right: number } {
  if (!isBrowser()) return { top: 0, bottom: 0, left: 0, right: 0 }
  
  const style = getComputedStyle(document.documentElement)
  
  return {
    top: parseInt(style.getPropertyValue('env(safe-area-inset-top)')) || 0,
    bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)')) || 0,
    left: parseInt(style.getPropertyValue('env(safe-area-inset-left)')) || 0,
    right: parseInt(style.getPropertyValue('env(safe-area-inset-right)')) || 0
  }
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString()
}

/**
 * Calculate reading time for text
 */
export function calculateReadingTime(text: string, wordsPerMinute: number = 200): number {
  const words = text.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

/**
 * Utility object with commonly used functions
 */
export const utils = {
  // ID generation
  generateId,
  generateConversationId,
  generateMessageId,
  generateAppId,
  generateUUID,
  generateShortId,
  
  // Date formatting
  formatDate,
  formatMessageTime,
  formatConversationTime,
  getRelativeTime,
  formatDuration,
  
  // File utilities
  formatFileSize,
  getFileTypeCategory,
  validateFiles,
  isImage,
  isAudio,
  isVideo,
  isDocument,
  compressImage,
  downloadFile,
  
  // Storage
  localStorage,
  sessionStorage,
  storageUtils,
  
  // Common utilities
  debounce,
  throttle,
  deepClone,
  isEmpty,
  toTitleCase,
  truncate,
  randomColor,
  getContrastColor,
  sleep,
  retry,
  
  // Browser detection
  isBrowser,
  isMobile,
  isIOS,
  isAndroid,
  
  // Clipboard
  copyToClipboard,
  
  // URL utilities
  parseUrlParams,
  buildUrl,
  
  // Validation
  isValidEmail,
  isValidUrl,
  
  // Mobile utilities
  getSafeAreaInsets,
  
  // Number utilities
  formatNumber,
  calculateReadingTime
}

export default utils