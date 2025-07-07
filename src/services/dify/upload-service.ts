import { HttpService } from '../http/base'
import type {
  FileUploadRequest,
  FileUploadResponse,
  AudioTranscriptionRequest,
  AudioTranscriptionResponse,
  TextToSpeechRequest,
  TextToSpeechResponse
} from '@/interfaces'

export class UploadService extends HttpService {
  async uploadFile(request: FileUploadRequest): Promise<FileUploadResponse> {
    const endpoint = `/external/dify/${this.applicationId}/files/upload`
    
    const formData = this.buildFormData({
      file: request.file,
      user: request.userId || 'anonymous-user'
    })

    return this.makeRequest<FileUploadResponse>(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`
        // 不设置 Content-Type，让浏览器自动设置 FormData 的边界
      },
      body: formData
    })
  }

  async transcribeAudio(request: AudioTranscriptionRequest): Promise<AudioTranscriptionResponse> {
    const endpoint = `/external/dify/${this.applicationId}/audio2text`
    
    const formData = this.buildFormData({
      file: request.audioFile,
      user: request.userId || 'anonymous-user'
    })

    return this.makeRequest<AudioTranscriptionResponse>(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`
      },
      body: formData
    })
  }

  async convertTextToSpeech(request: TextToSpeechRequest): Promise<TextToSpeechResponse> {
    const endpoint = `/external/dify/${this.applicationId}/text2audio`
    
    const requestData = {
      text: request.text,
      user: request.userId || 'anonymous-user',
      streaming: request.streaming || false
    }

    if (request.streaming) {
      // 流式返回音频数据
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return {
        audioUrl: URL.createObjectURL(await response.blob())
      }
    } else {
      return this.makeRequest<TextToSpeechResponse>(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestData)
      })
    }
  }

  async downloadFile(downloadUrl: string, filename?: string): Promise<void> {
    try {
      const response = await fetch(downloadUrl)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = filename || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(objectUrl)
    } catch (error) {
      console.error('文件下载失败:', error)
      throw error
    }
  }

  validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.some(type => {
      if (type.includes('/')) {
        return file.type === type
      } else {
        return file.type.startsWith(type + '/')
      }
    })
  }

  validateFileSize(file: File, maxSizeInMB: number): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024
    return file.size <= maxSizeInBytes
  }

  getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || ''
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}