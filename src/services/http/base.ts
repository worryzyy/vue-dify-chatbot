import { ref } from 'vue'
import type { ApiResponse, ApiError } from '@/interfaces'

export interface HttpClientConfig {
  baseURL?: string
  timeout?: number
  headers?: Record<string, string>
}

export interface DifyClientOptions {
  apiToken: string
  baseURL?: string
  applicationId?: string
}

export class HttpService {
  protected apiToken: string
  protected baseURL: string
  protected applicationId?: string
  protected defaultHeaders: Record<string, string>

  constructor(options: DifyClientOptions) {
    this.apiToken = options.apiToken
    this.baseURL = options.baseURL || '/api'
    this.applicationId = options.applicationId
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiToken}`
    }
  }

  protected async makeRequest<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const requestConfig: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers
      }
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, requestConfig)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const responseData = await response.json()
      return responseData
    } catch (error) {
      console.error('HTTP请求失败:', error)
      throw error
    }
  }

  protected buildFormData(data: Record<string, any>): FormData {
    const formData = new FormData()
    
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value)
      } else if (value !== undefined && value !== null) {
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value))
      }
    })

    return formData
  }

  protected buildQueryString(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(endpoint, this.baseURL)
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    return url.pathname + url.search
  }

  updateApiToken(apiToken: string) {
    this.apiToken = apiToken
    this.defaultHeaders.Authorization = `Bearer ${apiToken}`
  }

  updateApplicationId(applicationId: string) {
    this.applicationId = applicationId
  }
}