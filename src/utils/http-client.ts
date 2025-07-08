import hookFetch from 'hook-fetch'
import { useAuthStore } from '../stores/auth'
import { ElMessage } from 'element-plus'

// 响应数据结构
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  success: boolean
}

// 请求配置接口
export interface RequestConfig {
  skipAuth?: boolean
  skipErrorHandler?: boolean
  timeout?: number
  headers?: Record<string, string>
  [key: string]: any
}

// 创建HTTP客户端实例
const createHttpClient = () => {
  // 创建基础实例
  const client = hookFetch.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  // 认证插件
  const authPlugin = () => ({
    name: 'auth-plugin',
    priority: 1,
    async beforeRequest(config: any) {
      if (!config.skipAuth) {
        const authStore = useAuthStore()
        if (authStore.session?.access_token) {
          config.headers = new Headers(config.headers)
          config.headers.set('Authorization', `Bearer ${authStore.session.access_token}`)
        }
      }
      return config
    }
  })

  // 响应拦截插件
  const responsePlugin = () => ({
    name: 'response-plugin',
    priority: 2,
    async afterResponse(context: any) {
      const { result, response } = context
      
      // 业务层面的错误处理
      if (result && typeof result === 'object' && 'code' in result) {
        if (result.code !== 0 && result.code !== 200) {
          throw new Error(result.message || '请求失败')
        }
      }
      
      return context
    }
  })

  // 错误处理插件
  const errorHandlerPlugin = () => ({
    name: 'error-handler',
    priority: 3,
    async onError(error: any, config: any) {
      // 处理HTTP状态码错误
      if (error.status) {
        switch (error.status) {
          case 401:
            if (!config.skipAuth) {
              const authStore = useAuthStore()
              authStore.logout()
              if (typeof window !== 'undefined') {
                window.location.href = '/auth/login'
              }
            }
            break
          case 403:
            error.message = '权限不足'
            break
          case 404:
            error.message = '资源不存在'
            break
          case 422:
            error.message = '请求参数错误'
            break
          case 429:
            error.message = '请求过于频繁'
            break
          case 500:
            error.message = '服务器内部错误'
            break
          case 502:
            error.message = '网关错误'
            break
          case 503:
            error.message = '服务不可用'
            break
          case 504:
            error.message = '网关超时'
            break
          default:
            error.message = error.message || `请求失败 (${error.status})`
        }
      } else if (!error.message) {
        error.message = '网络错误，请检查您的网络连接'
      }

      // 全局错误提示
      if (!config.skipErrorHandler) {
        ElMessage.error(error.message)
      }

      return error
    }
  })

  // 请求日志插件（仅开发环境）
  const loggerPlugin = () => ({
    name: 'logger-plugin',
    priority: 10,
    async beforeRequest(config: any) {
      if (import.meta.env.DEV) {
        console.log('🚀 API Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          data: config.data,
          params: config.params
        })
      }
      config.startTime = Date.now()
      return config
    },
    async afterResponse(context: any, config: any) {
      if (import.meta.env.DEV && config.startTime) {
        const duration = Date.now() - config.startTime
        console.log('✅ API Response:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          status: context.response.status,
          duration: `${duration}ms`,
          data: context.result
        })
      }
      return context
    },
    async onError(error: any, config: any) {
      if (import.meta.env.DEV) {
        const duration = config.startTime ? Date.now() - config.startTime : 0
        console.error('❌ API Error:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          status: error.status,
          duration: `${duration}ms`,
          message: error.message
        })
      }
      return error
    }
  })

  // 注册插件
  client.use(authPlugin())
  client.use(responsePlugin())
  client.use(errorHandlerPlugin())
  client.use(loggerPlugin())

  return client
}

// 创建默认客户端实例
export const httpClient = createHttpClient()

// 基础请求方法
export const get = <T = any>(
  url: string, 
  params?: any,
  config?: RequestConfig
): Promise<T> => {
  // 如果URL是完整的（包含http://或https://），直接使用hookFetch而不是实例
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return hookFetch.get(url, params, config) as unknown as Promise<T>
  }
  return httpClient.get(url, params, config) as unknown as Promise<T>
}

export const post = <T = any>(
  url: string, 
  data?: any, 
  config?: RequestConfig
): Promise<T> => {
  // 如果URL是完整的（包含http://或https://），直接使用hookFetch而不是实例
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return hookFetch.post(url, data, config) as unknown as Promise<T>
  }
  return httpClient.post(url, data, config) as unknown as Promise<T>
}

export const put = <T = any>(
  url: string, 
  data?: any, 
  config?: RequestConfig
): Promise<T> => {
  // 如果URL是完整的（包含http://或https://），直接使用hookFetch而不是实例
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return hookFetch.put(url, data, config) as unknown as Promise<T>
  }
  return httpClient.put(url, data, config) as unknown as Promise<T>
}

export const patch = <T = any>(
  url: string, 
  data?: any, 
  config?: RequestConfig
): Promise<T> => {
  // 如果URL是完整的（包含http://或https://），直接使用hookFetch而不是实例
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return hookFetch.patch(url, data, config) as unknown as Promise<T>
  }
  return httpClient.patch(url, data, config) as unknown as Promise<T>
}

export const del = <T = any>(
  url: string, 
  config?: RequestConfig
): Promise<T> => {
  // 如果URL是完整的（包含http://或https://），直接使用hookFetch而不是实例
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return hookFetch.delete(url, config) as unknown as Promise<T>
  }
  return httpClient.delete(url, config) as unknown as Promise<T>
}

// 文件上传
export const uploadFile = <T = any>(
  url: string,
  file: File,
  config?: RequestConfig & { onProgress?: (progress: number) => void }
): Promise<T> => {
  const formData = new FormData()
  formData.append('file', file)
  
  return httpClient.post(url, formData, {
    ...config,
    headers: {
      'Content-Type': 'multipart/form-data',
      ...config?.headers 
    }
  }) as unknown as Promise<T>
}

// 文件下载
export const downloadFile = async (
  url: string,
  filename?: string,
  config?: RequestConfig
): Promise<void> => {
  try {
    const response = await httpClient.get(url, undefined, config)
    
    const blob = await response.blob()
    const downloadUrl = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(downloadUrl)
  } catch (error) {
    console.error('下载失败:', error)
    throw error
  }
}

// 批量请求
export const batchRequest = async <T = any>(
  requests: Array<() => Promise<T>>
): Promise<T[]> => {
  try {
    const results = await Promise.allSettled(requests.map(req => req()))
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        console.error(`批量请求 ${index} 失败:`, result.reason)
        throw result.reason
      }
    })
  } catch (error) {
    console.error('批量请求失败:', error)
    throw error
  }
}

// 带重试的请求
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
        console.warn(`请求失败，${delay}ms后重试... (${i + 1}/${maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, delay))
        delay *= 2 // 指数退避
      }
    }
  }
  
  throw lastError
}

// 流式请求（用于SSE等场景）
export const createStreamRequest = (url: string, config?: RequestConfig) => {
  const request = httpClient.get(url, undefined, config)
  
  return {
    // 获取流式数据
    async *stream<T = string>() {
      for await (const chunk of request.stream<T>()) {
        yield chunk
      }
    },
    
    // 中断请求
    abort() {
      request.abort()
    },
    
    // 重试请求
    retry() {
      return request.retry()
    }
  }
}

export default httpClient