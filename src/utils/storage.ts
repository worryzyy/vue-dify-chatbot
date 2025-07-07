// Storage keys constants
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_INFO: 'user_info',
  APP_CONFIG: 'app_config',
  THEME_CONFIG: 'theme_config',
  CONVERSATION_LIST: 'conversation_list',
  CHAT_MESSAGES: 'chat_messages',
  APP_LIST: 'app_list',
  CURRENT_APP: 'current_app',
  RUNNING_MODE: 'running_mode',
  USER_PREFERENCES: 'user_preferences',
  CHAT_HISTORY: 'chat_history'
} as const

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS]

// Storage interface
interface StorageInterface {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
  clear(): void
  length: number
  key(index: number): string | null
}

// Storage options
interface StorageOptions {
  prefix?: string
  expire?: number // expiration time in milliseconds
  encrypt?: boolean
}

// Storage item with metadata
interface StorageItem<T = any> {
  data: T
  timestamp: number
  expire?: number
  version?: string
}

// Base storage class
class BaseStorage {
  private storage: StorageInterface
  private prefix: string
  private defaultExpire?: number

  constructor(storage: StorageInterface, options: StorageOptions = {}) {
    this.storage = storage
    this.prefix = options.prefix || 'dify_'
    this.defaultExpire = options.expire
  }

  private getFullKey(key: string): string {
    return `${this.prefix}${key}`
  }

  private isExpired(item: StorageItem): boolean {
    if (!item.expire) return false
    return Date.now() > item.timestamp + item.expire
  }

  private createStorageItem<T>(data: T, expire?: number): StorageItem<T> {
    return {
      data,
      timestamp: Date.now(),
      expire: expire || this.defaultExpire,
      version: '1.0'
    }
  }

  set<T>(key: string, value: T, expire?: number): boolean {
    try {
      const fullKey = this.getFullKey(key)
      const item = this.createStorageItem(value, expire)
      const serialized = JSON.stringify(item)
      
      this.storage.setItem(fullKey, serialized)
      return true
    } catch (error) {
      console.error('Storage set error:', error)
      return false
    }
  }

  get<T>(key: string, defaultValue?: T): T | undefined {
    try {
      const fullKey = this.getFullKey(key)
      const serialized = this.storage.getItem(fullKey)
      
      if (!serialized) {
        return defaultValue
      }

      const item: StorageItem<T> = JSON.parse(serialized)
      
      // Check if expired
      if (this.isExpired(item)) {
        this.remove(key)
        return defaultValue
      }

      return item.data
    } catch (error) {
      console.error('Storage get error:', error)
      return defaultValue
    }
  }

  remove(key: string): boolean {
    try {
      const fullKey = this.getFullKey(key)
      this.storage.removeItem(fullKey)
      return true
    } catch (error) {
      console.error('Storage remove error:', error)
      return false
    }
  }

  has(key: string): boolean {
    const value = this.get(key)
    return value !== undefined
  }

  clear(): boolean {
    try {
      // Only clear items with our prefix
      const keysToRemove: string[] = []
      
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i)
        if (key && key.startsWith(this.prefix)) {
          keysToRemove.push(key)
        }
      }
      
      keysToRemove.forEach(key => this.storage.removeItem(key))
      return true
    } catch (error) {
      console.error('Storage clear error:', error)
      return false
    }
  }

  getAllKeys(): string[] {
    const keys: string[] = []
    
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i)
      if (key && key.startsWith(this.prefix)) {
        keys.push(key.substring(this.prefix.length))
      }
    }
    
    return keys
  }

  getSize(): number {
    let size = 0
    const keys = this.getAllKeys()
    
    keys.forEach(key => {
      const value = this.storage.getItem(this.getFullKey(key))
      if (value) {
        size += value.length
      }
    })
    
    return size
  }

  // Clean expired items
  cleanExpired(): number {
    const keys = this.getAllKeys()
    let cleaned = 0
    
    keys.forEach(key => {
      try {
        const fullKey = this.getFullKey(key)
        const serialized = this.storage.getItem(fullKey)
        
        if (serialized) {
          const item: StorageItem = JSON.parse(serialized)
          
          if (this.isExpired(item)) {
            this.storage.removeItem(fullKey)
            cleaned++
          }
        }
      } catch (error) {
        // Invalid item, remove it
        this.remove(key)
        cleaned++
      }
    })
    
    return cleaned
  }
}

// Create storage instances
export const localStorage = new BaseStorage(window.localStorage, { prefix: 'dify_' })
export const sessionStorage = new BaseStorage(window.sessionStorage, { prefix: 'dify_' })

// Temporary storage with auto-cleanup
export const tempStorage = new BaseStorage(window.sessionStorage, { 
  prefix: 'dify_temp_',
  expire: 5 * 60 * 1000 // 5 minutes
})

// Reactive storage for Vue
import { ref, watch, type Ref } from 'vue'

export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  options: { expire?: number } = {}
): [Ref<T>, (value: T) => void, () => void] {
  const storedValue = localStorage.get<T>(key, defaultValue)
  const state = ref<T>(storedValue) as Ref<T>

  const setValue = (value: T) => {
    state.value = value
    localStorage.set(key, value, options.expire)
  }

  const removeValue = () => {
    localStorage.remove(key)
    state.value = defaultValue
  }

  // Watch for changes and sync to localStorage
  watch(
    state,
    (newValue) => {
      localStorage.set(key, newValue, options.expire)
    },
    { deep: true }
  )

  return [state, setValue, removeValue]
}

export function useSessionStorage<T>(
  key: string,
  defaultValue: T,
  options: { expire?: number } = {}
): [Ref<T>, (value: T) => void, () => void] {
  const storedValue = sessionStorage.get<T>(key, defaultValue)
  const state = ref<T>(storedValue) as Ref<T>

  const setValue = (value: T) => {
    state.value = value
    sessionStorage.set(key, value, options.expire)
  }

  const removeValue = () => {
    sessionStorage.remove(key)
    state.value = defaultValue
  }

  // Watch for changes and sync to sessionStorage
  watch(
    state,
    (newValue) => {
      sessionStorage.set(key, newValue, options.expire)
    },
    { deep: true }
  )

  return [state, setValue, removeValue]
}

// Utility functions for common storage operations
export const storageUtils = {
  // Save user session
  saveUserSession: (user: any, token: string) => {
    localStorage.set(STORAGE_KEYS.USER_INFO, user)
    localStorage.set(STORAGE_KEYS.AUTH_TOKEN, token)
  },

  // Get user session
  getUserSession: () => {
    const user = localStorage.get(STORAGE_KEYS.USER_INFO)
    const token = localStorage.get(STORAGE_KEYS.AUTH_TOKEN)
    return { user, token }
  },

  // Clear user session
  clearUserSession: () => {
    localStorage.remove(STORAGE_KEYS.USER_INFO)
    localStorage.remove(STORAGE_KEYS.AUTH_TOKEN)
  },

  // Save app configuration
  saveAppConfig: (config: any) => {
    localStorage.set(STORAGE_KEYS.APP_CONFIG, config)
  },

  // Get app configuration
  getAppConfig: (defaultConfig: any = {}) => {
    return localStorage.get(STORAGE_KEYS.APP_CONFIG, defaultConfig)
  },

  // Save theme configuration
  saveThemeConfig: (config: any) => {
    localStorage.set(STORAGE_KEYS.THEME_CONFIG, config)
  },

  // Get theme configuration
  getThemeConfig: (defaultConfig: any = {}) => {
    return localStorage.get(STORAGE_KEYS.THEME_CONFIG, defaultConfig)
  },

  // Save chat history with conversation ID
  saveChatHistory: (conversationId: string, messages: any[]) => {
    const key = `${STORAGE_KEYS.CHAT_HISTORY}_${conversationId}`
    localStorage.set(key, messages)
  },

  // Get chat history by conversation ID
  getChatHistory: (conversationId: string) => {
    const key = `${STORAGE_KEYS.CHAT_HISTORY}_${conversationId}`
    return localStorage.get(key, [])
  },

  // Remove chat history by conversation ID
  removeChatHistory: (conversationId: string) => {
    const key = `${STORAGE_KEYS.CHAT_HISTORY}_${conversationId}`
    localStorage.remove(key)
  },

  // Get all chat history keys
  getAllChatHistoryKeys: () => {
    return localStorage.getAllKeys().filter(key => 
      key.startsWith(STORAGE_KEYS.CHAT_HISTORY)
    )
  },

  // Clean up old data
  cleanup: () => {
    const cleaned = localStorage.cleanExpired()
    tempStorage.cleanExpired()
    console.log(`Cleaned ${cleaned} expired storage items`)
    return cleaned
  },

  // Get storage statistics
  getStats: () => {
    return {
      localStorage: {
        size: localStorage.getSize(),
        keys: localStorage.getAllKeys().length
      },
      sessionStorage: {
        size: sessionStorage.getSize(),
        keys: sessionStorage.getAllKeys().length
      },
      tempStorage: {
        size: tempStorage.getSize(),
        keys: tempStorage.getAllKeys().length
      }
    }
  }
}

// Auto cleanup on page load
if (typeof window !== 'undefined') {
  // Clean expired items on page load
  setTimeout(() => {
    storageUtils.cleanup()
  }, 1000)

  // Set up periodic cleanup (every 5 minutes)
  setInterval(() => {
    storageUtils.cleanup()
  }, 5 * 60 * 1000)
}

export default {
  localStorage,
  sessionStorage,
  tempStorage,
  useLocalStorage,
  useSessionStorage,
  storageUtils,
  STORAGE_KEYS
}