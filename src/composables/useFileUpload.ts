import { ref, computed, inject } from 'vue'
import { DIFY_API_INJECTION_KEY } from '@/api'
import type { DifyApi } from '@/api'
import type { UploadFileResponse, FileInfo } from '@/api/types'
import { useAuthStore } from '@/stores/auth'

export interface FileUploadOptions {
  accept?: string[]
  maxSize?: number // in MB
  maxCount?: number
  autoUpload?: boolean
}

export interface UploadFileItem {
  id: string
  file: File
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
  response?: UploadFileResponse
  url?: string
}

export function useFileUpload(options: FileUploadOptions = {}) {
  const authStore = useAuthStore()
  const difyApi = inject<DifyApi>(DIFY_API_INJECTION_KEY)

  if (!difyApi) {
    throw new Error('DifyApi not found. Make sure to provide it in the app.')
  }

  const {
    accept = ['image/*', 'application/pdf', 'text/*'],
    maxSize = 10, // 10MB default
    maxCount = 5,
    autoUpload = true
  } = options

  // State
  const fileList = ref<UploadFileItem[]>([])
  const isUploading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const uploadedFiles = computed(() => 
    fileList.value.filter(item => item.status === 'success')
  )
  
  const failedFiles = computed(() => 
    fileList.value.filter(item => item.status === 'error')
  )
  
  const pendingFiles = computed(() => 
    fileList.value.filter(item => item.status === 'pending')
  )
  
  const uploadProgress = computed(() => {
    if (fileList.value.length === 0) return 0
    const totalProgress = fileList.value.reduce((sum, item) => sum + item.progress, 0)
    return Math.round(totalProgress / fileList.value.length)
  })

  const canUploadMore = computed(() => fileList.value.length < maxCount)

  // Utilities
  const generateFileId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file type
    const isValidType = accept.some(type => {
      if (type.includes('/')) {
        return file.type === type
      } else {
        return file.type.startsWith(type.replace('*', ''))
      }
    })

    if (!isValidType) {
      return { valid: false, error: `File type ${file.type} is not supported` }
    }

    // Check file size
    const maxSizeBytes = maxSize * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return { valid: false, error: `File size exceeds ${maxSize}MB limit` }
    }

    return { valid: true }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Actions
  const addFiles = async (files: FileList | File[]): Promise<void> => {
    const filesToAdd = Array.from(files)
    
    // Check count limit
    if (fileList.value.length + filesToAdd.length > maxCount) {
      error.value = `Cannot upload more than ${maxCount} files`
      return
    }

    const newFileItems: UploadFileItem[] = []

    for (const file of filesToAdd) {
      const validation = validateFile(file)
      
      if (!validation.valid) {
        error.value = validation.error || 'Invalid file'
        continue
      }

      const fileItem: UploadFileItem = {
        id: generateFileId(),
        file,
        status: 'pending',
        progress: 0
      }

      newFileItems.push(fileItem)
    }

    fileList.value.push(...newFileItems)

    if (autoUpload && newFileItems.length > 0) {
      await uploadPendingFiles()
    }
  }

  const uploadFile = async (fileItem: UploadFileItem): Promise<boolean> => {
    try {
      fileItem.status = 'uploading'
      fileItem.progress = 0
      fileItem.error = undefined

      const response = await difyApi.file.uploadFile({
        file: fileItem.file,
        user: authStore.user?.id || 'default-user'
      })

      fileItem.status = 'success'
      fileItem.progress = 100
      fileItem.response = response
      fileItem.url = response.url

      return true

    } catch (uploadError) {
      fileItem.status = 'error'
      fileItem.error = uploadError instanceof Error ? uploadError.message : 'Upload failed'
      console.error('File upload failed:', uploadError)
      return false
    }
  }

  const uploadPendingFiles = async (): Promise<void> => {
    const pending = pendingFiles.value
    if (pending.length === 0) return

    isUploading.value = true
    error.value = null

    try {
      const uploadPromises = pending.map(fileItem => uploadFile(fileItem))
      await Promise.all(uploadPromises)
    } catch (uploadError) {
      error.value = uploadError instanceof Error ? uploadError.message : 'Some files failed to upload'
    } finally {
      isUploading.value = false
    }
  }

  const removeFile = (fileId: string): void => {
    const index = fileList.value.findIndex(item => item.id === fileId)
    if (index >= 0) {
      fileList.value.splice(index, 1)
    }
  }

  const retryUpload = async (fileId: string): Promise<void> => {
    const fileItem = fileList.value.find(item => item.id === fileId)
    if (!fileItem || fileItem.status !== 'error') return

    fileItem.status = 'pending'
    fileItem.error = undefined
    fileItem.progress = 0

    await uploadFile(fileItem)
  }

  const clearFiles = (): void => {
    fileList.value = []
    error.value = null
  }

  const clearCompletedFiles = (): void => {
    fileList.value = fileList.value.filter(item => 
      item.status !== 'success' && item.status !== 'error'
    )
  }

  // Audio/Text conversion
  const convertAudioToText = async (file: File): Promise<string | null> => {
    try {
      const response = await difyApi.file.audio2Text({
        file,
        user: authStore.user?.id || 'default-user'
      })

      return response.text
    } catch (conversionError) {
      console.error('Audio to text conversion failed:', conversionError)
      error.value = conversionError instanceof Error ? conversionError.message : 'Conversion failed'
      return null
    }
  }

  const convertTextToAudio = async (text: string, streaming = false): Promise<string | null> => {
    try {
      const response = await difyApi.file.text2Audio({
        text,
        user: authStore.user?.id || 'default-user',
        streaming
      })

      return response.audio_url
    } catch (conversionError) {
      console.error('Text to audio conversion failed:', conversionError)
      error.value = conversionError instanceof Error ? conversionError.message : 'Conversion failed'
      return null
    }
  }

  // File picker
  const openFilePicker = (): void => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = maxCount > 1
    input.accept = accept.join(',')
    
    input.onchange = (event) => {
      const target = event.target as HTMLInputElement
      if (target.files) {
        addFiles(target.files)
      }
    }
    
    input.click()
  }

  // Drag and drop support
  const handleDrop = async (event: DragEvent): Promise<void> => {
    event.preventDefault()
    
    const files = event.dataTransfer?.files
    if (files) {
      await addFiles(files)
    }
  }

  const handleDragOver = (event: DragEvent): void => {
    event.preventDefault()
  }

  // Get uploaded file data for API
  const getUploadedFileData = (): FileInfo[] => {
    return uploadedFiles.value
      .filter(item => item.response)
      .map(item => ({
        id: item.response!.id,
        name: item.response!.name,
        size: item.response!.size,
        type: item.response!.mime_type,
        url: item.response!.url || item.url || '',
        created_at: item.response!.created_at
      }))
  }

  return {
    // State
    fileList,
    isUploading,
    error,
    
    // Computed
    uploadedFiles,
    failedFiles,
    pendingFiles,
    uploadProgress,
    canUploadMore,
    
    // Actions
    addFiles,
    uploadFile,
    uploadPendingFiles,
    removeFile,
    retryUpload,
    clearFiles,
    clearCompletedFiles,
    openFilePicker,
    handleDrop,
    handleDragOver,
    getUploadedFileData,
    
    // Utilities
    validateFile,
    formatFileSize,
    
    // Audio/Text conversion
    convertAudioToText,
    convertTextToAudio,
    
    // Configuration
    options: {
      accept,
      maxSize,
      maxCount,
      autoUpload
    }
  }
}