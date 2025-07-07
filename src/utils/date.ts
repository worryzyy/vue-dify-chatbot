import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import duration from 'dayjs/plugin/duration'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import isToday from 'dayjs/plugin/isToday'
import isYesterday from 'dayjs/plugin/isYesterday'

// Extend dayjs with plugins
dayjs.extend(relativeTime)
dayjs.extend(duration)
dayjs.extend(timezone)
dayjs.extend(utc)
dayjs.extend(localizedFormat)
dayjs.extend(isToday)
dayjs.extend(isYesterday)

// Date format constants
export const DATE_FORMATS = {
  FULL: 'YYYY-MM-DD HH:mm:ss',
  DATE: 'YYYY-MM-DD',
  TIME: 'HH:mm:ss',
  DATETIME: 'YYYY-MM-DD HH:mm',
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  FRIENDLY: 'MMM D, YYYY',
  FRIENDLY_TIME: 'MMM D, YYYY HH:mm',
  SHORT_DATE: 'MM/DD/YYYY',
  SHORT_TIME: 'HH:mm',
  MONTH_YEAR: 'MMMM YYYY',
  WEEKDAY: 'dddd',
  RELATIVE: 'relative'
} as const

export type DateFormat = typeof DATE_FORMATS[keyof typeof DATE_FORMATS]

/**
 * Format a date using dayjs
 */
export function formatDate(
  date: string | number | Date | dayjs.Dayjs,
  format: DateFormat = DATE_FORMATS.DATETIME
): string {
  if (!date) return ''
  
  const dayjsDate = dayjs(date)
  
  if (!dayjsDate.isValid()) {
    return 'Invalid Date'
  }
  
  if (format === 'relative') {
    return dayjsDate.fromNow()
  }
  
  return dayjsDate.format(format)
}

/**
 * Format a date for chat messages (smart formatting)
 */
export function formatMessageTime(timestamp: number): string {
  const date = dayjs(timestamp)
  const now = dayjs()
  
  if (!date.isValid()) return ''
  
  // If it's today, show only time
  if (date.isToday()) {
    return date.format('HH:mm')
  }
  
  // If it's yesterday
  if (date.isYesterday()) {
    return `Yesterday ${date.format('HH:mm')}`
  }
  
  // If it's this year, show month and day
  if (date.year() === now.year()) {
    return date.format('MMM D HH:mm')
  }
  
  // Otherwise show full date
  return date.format('MMM D, YYYY HH:mm')
}

/**
 * Format conversation time (for conversation list)
 */
export function formatConversationTime(timestamp: number): string {
  const date = dayjs(timestamp)
  const now = dayjs()
  
  if (!date.isValid()) return ''
  
  const diffMinutes = now.diff(date, 'minute')
  const diffHours = now.diff(date, 'hour')
  const diffDays = now.diff(date, 'day')
  
  // Less than 1 minute
  if (diffMinutes < 1) {
    return 'Just now'
  }
  
  // Less than 1 hour
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`
  }
  
  // Less than 24 hours
  if (diffHours < 24) {
    return `${diffHours}h ago`
  }
  
  // Less than 7 days
  if (diffDays < 7) {
    return `${diffDays}d ago`
  }
  
  // More than 7 days
  if (date.year() === now.year()) {
    return date.format('MMM D')
  }
  
  return date.format('MMM D, YYYY')
}

/**
 * Get relative time from now
 */
export function getRelativeTime(date: string | number | Date | dayjs.Dayjs): string {
  const dayjsDate = dayjs(date)
  
  if (!dayjsDate.isValid()) {
    return 'Invalid Date'
  }
  
  return dayjsDate.fromNow()
}

/**
 * Check if date is today
 */
export function isToday(date: string | number | Date | dayjs.Dayjs): boolean {
  return dayjs(date).isToday()
}

/**
 * Check if date is yesterday
 */
export function isYesterday(date: string | number | Date | dayjs.Dayjs): boolean {
  return dayjs(date).isYesterday()
}

/**
 * Check if date is in the current week
 */
export function isThisWeek(date: string | number | Date | dayjs.Dayjs): boolean {
  const inputDate = dayjs(date)
  const startOfWeek = dayjs().startOf('week')
  const endOfWeek = dayjs().endOf('week')
  
  return inputDate.isAfter(startOfWeek) && inputDate.isBefore(endOfWeek)
}

/**
 * Check if date is in the current month
 */
export function isThisMonth(date: string | number | Date | dayjs.Dayjs): boolean {
  const inputDate = dayjs(date)
  const now = dayjs()
  
  return inputDate.month() === now.month() && inputDate.year() === now.year()
}

/**
 * Check if date is in the current year
 */
export function isThisYear(date: string | number | Date | dayjs.Dayjs): boolean {
  return dayjs(date).year() === dayjs().year()
}

/**
 * Get time difference in human readable format
 */
export function getTimeDifference(
  start: string | number | Date | dayjs.Dayjs,
  end: string | number | Date | dayjs.Dayjs = dayjs()
): string {
  const startDate = dayjs(start)
  const endDate = dayjs(end)
  
  if (!startDate.isValid() || !endDate.isValid()) {
    return 'Invalid Date'
  }
  
  const diff = endDate.diff(startDate)
  const duration = dayjs.duration(diff)
  
  const days = Math.floor(duration.asDays())
  const hours = duration.hours()
  const minutes = duration.minutes()
  const seconds = duration.seconds()
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  } else {
    return `${seconds}s`
  }
}

/**
 * Format duration in milliseconds to human readable
 */
export function formatDuration(milliseconds: number): string {
  const duration = dayjs.duration(milliseconds)
  
  const days = Math.floor(duration.asDays())
  const hours = duration.hours()
  const minutes = duration.minutes()
  const seconds = duration.seconds()
  
  const parts: string[] = []
  
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`)
  
  return parts.join(' ')
}

/**
 * Convert timestamp to date string
 */
export function timestampToDate(timestamp: number, format = DATE_FORMATS.DATETIME): string {
  return formatDate(timestamp, format)
}

/**
 * Convert date string to timestamp
 */
export function dateToTimestamp(date: string | Date): number {
  return dayjs(date).valueOf()
}

/**
 * Get start of day timestamp
 */
export function getStartOfDay(date?: string | number | Date): number {
  return dayjs(date).startOf('day').valueOf()
}

/**
 * Get end of day timestamp
 */
export function getEndOfDay(date?: string | number | Date): number {
  return dayjs(date).endOf('day').valueOf()
}

/**
 * Get start of week timestamp
 */
export function getStartOfWeek(date?: string | number | Date): number {
  return dayjs(date).startOf('week').valueOf()
}

/**
 * Get end of week timestamp
 */
export function getEndOfWeek(date?: string | number | Date): number {
  return dayjs(date).endOf('week').valueOf()
}

/**
 * Get start of month timestamp
 */
export function getStartOfMonth(date?: string | number | Date): number {
  return dayjs(date).startOf('month').valueOf()
}

/**
 * Get end of month timestamp
 */
export function getEndOfMonth(date?: string | number | Date): number {
  return dayjs(date).endOf('month').valueOf()
}

/**
 * Add time to a date
 */
export function addTime(
  date: string | number | Date,
  amount: number,
  unit: dayjs.ManipulateType
): number {
  return dayjs(date).add(amount, unit).valueOf()
}

/**
 * Subtract time from a date
 */
export function subtractTime(
  date: string | number | Date,
  amount: number,
  unit: dayjs.ManipulateType
): number {
  return dayjs(date).subtract(amount, unit).valueOf()
}

/**
 * Check if a date is between two dates
 */
export function isBetween(
  date: string | number | Date,
  start: string | number | Date,
  end: string | number | Date
): boolean {
  const targetDate = dayjs(date)
  const startDate = dayjs(start)
  const endDate = dayjs(end)
  
  return targetDate.isAfter(startDate) && targetDate.isBefore(endDate)
}

/**
 * Get timezone offset
 */
export function getTimezoneOffset(): number {
  return dayjs().utcOffset()
}

/**
 * Convert to UTC
 */
export function toUTC(date: string | number | Date): dayjs.Dayjs {
  return dayjs(date).utc()
}

/**
 * Convert from UTC to local
 */
export function fromUTC(date: string | number | Date): dayjs.Dayjs {
  return dayjs.utc(date).local()
}

/**
 * Format date for different locales
 */
export function formatLocalized(
  date: string | number | Date,
  format: 'L' | 'LL' | 'LLL' | 'LLLL' | 'LT' | 'LTS' = 'LL'
): string {
  return dayjs(date).format(format)
}

/**
 * Group timestamps by date
 */
export function groupByDate(timestamps: number[]): Record<string, number[]> {
  const groups: Record<string, number[]> = {}
  
  timestamps.forEach(timestamp => {
    const dateKey = dayjs(timestamp).format('YYYY-MM-DD')
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(timestamp)
  })
  
  return groups
}

/**
 * Get date range labels (for charts/analytics)
 */
export function getDateRangeLabels(
  start: string | number | Date,
  end: string | number | Date,
  unit: 'day' | 'week' | 'month' = 'day'
): string[] {
  const startDate = dayjs(start)
  const endDate = dayjs(end)
  const labels: string[] = []
  
  let current = startDate
  
  while (current.isBefore(endDate) || current.isSame(endDate)) {
    switch (unit) {
      case 'day':
        labels.push(current.format('MM/DD'))
        current = current.add(1, 'day')
        break
      case 'week':
        labels.push(current.format('MM/DD'))
        current = current.add(1, 'week')
        break
      case 'month':
        labels.push(current.format('MMM'))
        current = current.add(1, 'month')
        break
    }
  }
  
  return labels
}

// Export dayjs instance for advanced usage
export { dayjs }

// Default export
export default {
  formatDate,
  formatMessageTime,
  formatConversationTime,
  getRelativeTime,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
  isThisYear,
  getTimeDifference,
  formatDuration,
  timestampToDate,
  dateToTimestamp,
  getStartOfDay,
  getEndOfDay,
  getStartOfWeek,
  getEndOfWeek,
  getStartOfMonth,
  getEndOfMonth,
  addTime,
  subtractTime,
  isBetween,
  getTimezoneOffset,
  toUTC,
  fromUTC,
  formatLocalized,
  groupByDate,
  getDateRangeLabels,
  DATE_FORMATS,
  dayjs
}