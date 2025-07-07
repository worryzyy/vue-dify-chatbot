// ID generation utilities

/**
 * Generate a unique ID using timestamp and random string
 */
export function generateId(prefix = ''): string {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 8)
  return prefix ? `${prefix}_${timestamp}_${randomStr}` : `${timestamp}_${randomStr}`
}

/**
 * Generate a UUID v4
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  
  // Fallback implementation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * Generate a short ID (8 characters)
 */
export function generateShortId(): string {
  return Math.random().toString(36).substring(2, 10)
}

/**
 * Generate a numeric ID
 */
export function generateNumericId(): string {
  return Date.now().toString() + Math.floor(Math.random() * 1000).toString().padStart(3, '0')
}

/**
 * Generate a conversation ID
 */
export function generateConversationId(): string {
  return generateId('conv')
}

/**
 * Generate a message ID
 */
export function generateMessageId(): string {
  return generateId('msg')
}

/**
 * Generate an app ID
 */
export function generateAppId(): string {
  return generateId('app')
}

/**
 * Generate a user ID
 */
export function generateUserId(): string {
  return generateId('user')
}

/**
 * Generate a file ID
 */
export function generateFileId(): string {
  return generateId('file')
}

/**
 * Generate a session ID
 */
export function generateSessionId(): string {
  return generateId('session')
}

/**
 * Generate a custom ID with specified length
 */
export function generateCustomId(length = 8, includeNumbers = true, includeLetters = true): string {
  let chars = ''
  if (includeNumbers) chars += '0123456789'
  if (includeLetters) chars += 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  
  if (!chars) {
    throw new Error('At least one character type must be included')
  }
  
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

/**
 * Generate a nanoid-like ID
 */
export function generateNanoId(size = 21): string {
  const alphabet = '_-0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let id = ''
  
  // Use crypto.getRandomValues if available
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(size)
    crypto.getRandomValues(bytes)
    
    for (let i = 0; i < size; i++) {
      id += alphabet[bytes[i] & 63]
    }
  } else {
    // Fallback to Math.random
    for (let i = 0; i < size; i++) {
      id += alphabet[Math.floor(Math.random() * alphabet.length)]
    }
  }
  
  return id
}

/**
 * Generate a hash-based ID from a string
 */
export function generateHashId(input: string): string {
  let hash = 0
  if (input.length === 0) return hash.toString()
  
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36)
}

/**
 * Validate if a string is a valid UUID
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Validate if a string is a valid generated ID (from generateId function)
 */
export function isValidGeneratedId(id: string): boolean {
  // Check if it matches the pattern: [prefix_]timestamp_random
  const pattern = /^(?:[a-zA-Z]+_)?[0-9a-z]+_[0-9a-z]+$/
  return pattern.test(id)
}

/**
 * Extract timestamp from generated ID
 */
export function extractTimestampFromId(id: string): number | null {
  try {
    const parts = id.split('_')
    if (parts.length < 2) return null
    
    // If there's a prefix, timestamp is the second part, otherwise it's the first
    const timestampPart = parts.length === 3 ? parts[1] : parts[0]
    const timestamp = parseInt(timestampPart, 36)
    
    return isNaN(timestamp) ? null : timestamp
  } catch {
    return null
  }
}

/**
 * Get age of ID in milliseconds
 */
export function getIdAge(id: string): number | null {
  const timestamp = extractTimestampFromId(id)
  return timestamp ? Date.now() - timestamp : null
}

/**
 * Check if ID is older than specified time
 */
export function isIdOlderThan(id: string, milliseconds: number): boolean {
  const age = getIdAge(id)
  return age !== null && age > milliseconds
}

/**
 * Sort IDs by their embedded timestamps (newest first)
 */
export function sortIdsByTime(ids: string[], ascending = false): string[] {
  return ids.sort((a, b) => {
    const timeA = extractTimestampFromId(a) || 0
    const timeB = extractTimestampFromId(b) || 0
    return ascending ? timeA - timeB : timeB - timeA
  })
}

/**
 * Create a deterministic ID from multiple inputs
 */
export function createDeterministicId(...inputs: string[]): string {
  const combined = inputs.join('|')
  return generateHashId(combined)
}

/**
 * Generate a readable ID with words (for debugging)
 */
export function generateReadableId(): string {
  const adjectives = ['quick', 'lazy', 'smart', 'bright', 'cool', 'fast', 'slow', 'big', 'small', 'happy']
  const nouns = ['fox', 'dog', 'cat', 'bird', 'fish', 'bear', 'lion', 'tiger', 'wolf', 'deer']
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const number = Math.floor(Math.random() * 1000)
  
  return `${adjective}-${noun}-${number}`
}

// Default export
export default {
  generateId,
  generateUUID,
  generateShortId,
  generateNumericId,
  generateConversationId,
  generateMessageId,
  generateAppId,
  generateUserId,
  generateFileId,
  generateSessionId,
  generateCustomId,
  generateNanoId,
  generateHashId,
  isValidUUID,
  isValidGeneratedId,
  extractTimestampFromId,
  getIdAge,
  isIdOlderThan,
  sortIdsByTime,
  createDeterministicId,
  generateReadableId
}