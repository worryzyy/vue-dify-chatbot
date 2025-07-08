import { post, uploadFile } from '../utils/http-client'

// 文件上传相关接口
export interface UploadedFile {
  id: string
  name: string
  url: string
  type: string
  size: number
  created_at: string
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export const uploadApi = {
  // 上传文件
  uploadFile: (
    file: File, 
    options?: {
      onProgress?: (progress: UploadProgress) => void
    }
  ) => 
    uploadFile<UploadedFile>('/upload/file', file, {
      onProgress: options?.onProgress ? (progressEvent: any) => {
        const { loaded, total } = progressEvent
        options.onProgress?.({
          loaded,
          total,
          percentage: Math.round((loaded / total) * 100)
        })
      } : undefined
    }),
  
  // 上传图片
  uploadImage: (
    file: File, 
    options?: {
      onProgress?: (progress: UploadProgress) => void
    }
  ) => 
    uploadFile<UploadedFile>('/upload/image', file, {
      onProgress: options?.onProgress ? (progressEvent: any) => {
        const { loaded, total } = progressEvent
        options.onProgress?.({
          loaded,
          total,
          percentage: Math.round((loaded / total) * 100)
        })
      } : undefined
    }),
  
  // 批量上传文件
  uploadMultipleFiles: async (
    files: File[],
    options?: {
      onProgress?: (fileIndex: number, progress: UploadProgress) => void
      onComplete?: (fileIndex: number, file: UploadedFile) => void
    }
  ) => {
    const results: UploadedFile[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        const result = await uploadFile<UploadedFile>('/upload/file', file, {
          onProgress: options?.onProgress ? (progressEvent: any) => {
            const { loaded, total } = progressEvent
            options.onProgress?.(i, {
              loaded,
              total,
              percentage: Math.round((loaded / total) * 100)
            })
          } : undefined
        })
        
        results.push(result)
        options?.onComplete?.(i, result)
      } catch (error) {
        console.error(`上传文件 ${file.name} 失败:`, error)
        throw error
      }
    }
    
    return results
  }
}