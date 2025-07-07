import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { useAuthStore } from '@/stores/auth'

// Request configuration interface
export interface RequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean
  skipErrorHandler?: boolean
}

// Response data structure
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  success: boolean
}

// Create axios instance
const createRequest = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      const authStore = useAuthStore()
      
      // Add auth token if not skipped and token exists
      if (!config.skipAuth && authStore.token) {
        config.headers.Authorization = `Bearer ${authStore.token}`
      }
      
      // Add request timestamp
      config.metadata = { startTime: Date.now() }
      
      // Log request in development
      if (import.meta.env.DEV) {
        console.log('API Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          data: config.data,
          params: config.params
        })
      }
      
      return config
    },
    (error) => {
      console.error('Request error:', error)
      return Promise.reject(error)
    }
  )

  // Response interceptor
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      const config = response.config as RequestConfig
      
      // Log response in development
      if (import.meta.env.DEV && config.metadata?.startTime) {
        const duration = Date.now() - config.metadata.startTime
        console.log('API Response:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          status: response.status,
          duration: `${duration}ms`,
          data: response.data
        })
      }
      
      // Return response data directly
      return response.data
    },
    (error) => {
      const config = error.config as RequestConfig
      
      // Handle different error types
      if (error.response) {
        // Server responded with error status
        const { status, data } = error.response
        
        // Handle authentication errors
        if (status === 401 && !config.skipAuth) {
          const authStore = useAuthStore()
          authStore.logout()
          
          // Redirect to login page if needed
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login'
          }
        }
        
        // Handle other HTTP errors
        const errorMessage = data?.message || getErrorMessage(status)
        error.message = errorMessage
        
        if (import.meta.env.DEV) {
          console.error('API Error Response:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            status,
            message: errorMessage,
            data
          })
        }
      } else if (error.request) {
        // Network error
        error.message = 'Network error. Please check your connection.'
        console.error('Network Error:', error.request)
      } else {
        // Other errors
        console.error('Request Setup Error:', error.message)
      }
      
      // Skip error handler if specified
      if (config.skipErrorHandler) {
        return Promise.reject(error)
      }
      
      // Show error notification if needed
      handleGlobalError(error)
      
      return Promise.reject(error)
    }
  )

  return instance
}

// Get error message by status code
const getErrorMessage = (status: number): string => {
  const messages: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    408: 'Request Timeout',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    501: 'Not Implemented',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout'
  }
  
  return messages[status] || `HTTP ${status} Error`
}

// Global error handler
const handleGlobalError = (error: any): void => {
  // You can integrate with notification system here
  // For now, just log to console
  console.error('Global Error Handler:', error.message)
  
  // You could also show toast notifications here
  // ElMessage.error(error.message)
}

// Create default request instance
export const request = createRequest()

// Request methods with typed responses
export const get = <T = any>(
  url: string, 
  config?: RequestConfig
): Promise<T> => {
  return request.get(url, config)
}

export const post = <T = any>(
  url: string, 
  data?: any, 
  config?: RequestConfig
): Promise<T> => {
  return request.post(url, data, config)
}

export const put = <T = any>(
  url: string, 
  data?: any, 
  config?: RequestConfig
): Promise<T> => {
  return request.put(url, data, config)
}

export const patch = <T = any>(
  url: string, 
  data?: any, 
  config?: RequestConfig
): Promise<T> => {
  return request.patch(url, data, config)
}

export const del = <T = any>(
  url: string, 
  config?: RequestConfig
): Promise<T> => {
  return request.delete(url, config)
}

// Upload file with progress
export const uploadFile = <T = any>(
  url: string,
  file: File,
  onProgress?: (progressEvent: any) => void,
  config?: RequestConfig
): Promise<T> => {
  const formData = new FormData()
  formData.append('file', file)
  
  return request.post(url, formData, {
    ...config,
    headers: {
      'Content-Type': 'multipart/form-data',
      ...config?.headers
    },
    onUploadProgress: onProgress
  })
}

// Download file
export const downloadFile = async (
  url: string,
  filename?: string,
  config?: RequestConfig
): Promise<void> => {
  try {
    const response = await request.get(url, {
      ...config,
      responseType: 'blob'
    })
    
    const blob = new Blob([response])
    const downloadUrl = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(downloadUrl)
  } catch (error) {
    console.error('Download failed:', error)
    throw error
  }
}

// Batch requests
export const batchRequest = async <T = any>(
  requests: Array<() => Promise<T>>
): Promise<T[]> => {
  try {
    const results = await Promise.allSettled(requests.map(req => req()))
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        console.error(`Batch request ${index} failed:`, result.reason)
        throw result.reason
      }
    })
  } catch (error) {
    console.error('Batch request failed:', error)
    throw error
  }
}

// Request with retry
export const requestWithRetry = async <T = any>(
  requestFn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: any
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await requestFn()
    } catch (error) {
      lastError = error
      
      if (i < maxRetries) {
        console.warn(`Request failed, retrying in ${delay}ms... (${i + 1}/${maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, delay))
        delay *= 2 // Exponential backoff
      }
    }
  }
  
  throw lastError
}

// Cancel token utilities
export const createCancelToken = () => {
  return axios.CancelToken.source()
}

export const isCancel = (error: any): boolean => {
  return axios.isCancel(error)
}

// Request queue for managing concurrent requests
class RequestQueue {
  private queue: Array<() => Promise<any>> = []
  private running: number = 0
  private maxConcurrent: number = 5

  constructor(maxConcurrent = 5) {
    this.maxConcurrent = maxConcurrent
  }

  async add<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          this.running++
          const result = await requestFn()
          resolve(result)
        } catch (error) {
          reject(error)
        } finally {
          this.running--
          this.processQueue()
        }
      })
      
      this.processQueue()
    })
  }

  private processQueue(): void {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return
    }
    
    const request = this.queue.shift()
    if (request) {
      request()
    }
  }
}

export const requestQueue = new RequestQueue()

export default request