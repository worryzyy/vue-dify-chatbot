// 统一导出所有API模块
export * from './auth'
export * from './user'
export * from './dify-application'
export * from './chat'
export * from './upload'

// 重新导出HTTP客户端工具
export { 
  httpClient as default,
  get, 
  post, 
  put, 
  patch, 
  del,
  uploadFile,
  downloadFile,
  batchRequest,
  requestWithRetry,
  createStreamRequest
} from '../utils/http-client'