// File utilities

export interface FileInfo {
  name: string
  size: number
  type: string
  extension: string
  lastModified: number
}

// File type constants
export const FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/webm'],
  VIDEO: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'],
  DOCUMENT: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ],
  TEXT: ['text/plain', 'text/markdown', 'text/csv', 'application/json', 'text/html'],
  ARCHIVE: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed']
} as const

export const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
export const AUDIO_EXTENSIONS = ['mp3', 'wav', 'ogg', 'm4a', 'webm']
export const VIDEO_EXTENSIONS = ['mp4', 'webm', 'ogg', 'avi', 'mov']
export const DOCUMENT_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx']
export const TEXT_EXTENSIONS = ['txt', 'md', 'csv', 'json', 'html', 'htm']

/**
 * Get file information from File object
 */
export function getFileInfo(file: File): FileInfo {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    extension: getFileExtension(file.name),
    lastModified: file.lastModified
  }
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Get file type category
 */
export function getFileTypeCategory(file: File | string): 'image' | 'audio' | 'video' | 'document' | 'text' | 'archive' | 'unknown' {
  const mimeType = typeof file === 'string' ? file : file.type
  const extension = typeof file === 'string' ? getFileExtension(file) : getFileExtension(file.name)
  
  if (FILE_TYPES.IMAGE.includes(mimeType) || IMAGE_EXTENSIONS.includes(extension)) {
    return 'image'
  }
  
  if (FILE_TYPES.AUDIO.includes(mimeType) || AUDIO_EXTENSIONS.includes(extension)) {
    return 'audio'
  }
  
  if (FILE_TYPES.VIDEO.includes(mimeType) || VIDEO_EXTENSIONS.includes(extension)) {
    return 'video'
  }
  
  if (FILE_TYPES.DOCUMENT.includes(mimeType) || DOCUMENT_EXTENSIONS.includes(extension)) {
    return 'document'
  }
  
  if (FILE_TYPES.TEXT.includes(mimeType) || TEXT_EXTENSIONS.includes(extension)) {
    return 'text'
  }
  
  if (FILE_TYPES.ARCHIVE.includes(mimeType)) {
    return 'archive'
  }
  
  return 'unknown'
}

/**
 * Check if file is an image
 */
export function isImage(file: File | string): boolean {
  return getFileTypeCategory(file) === 'image'
}

/**
 * Check if file is audio
 */
export function isAudio(file: File | string): boolean {
  return getFileTypeCategory(file) === 'audio'
}

/**
 * Check if file is video
 */
export function isVideo(file: File | string): boolean {
  return getFileTypeCategory(file) === 'video'
}

/**
 * Check if file is document
 */
export function isDocument(file: File | string): boolean {
  return getFileTypeCategory(file) === 'document'
}

/**
 * Check if file is text
 */
export function isText(file: File | string): boolean {
  return getFileTypeCategory(file) === 'text'
}

/**
 * Validate file type against allowed types
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.some(type => {
    if (type.includes('/')) {
      // MIME type
      return file.type === type || file.type.startsWith(type.replace('*', ''))
    } else {
      // Extension
      return getFileExtension(file.name) === type.replace('.', '')
    }
  })
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSizeInMB: number): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024
  return file.size <= maxSizeInBytes
}

/**
 * Validate multiple files
 */
export function validateFiles(
  files: FileList | File[],
  options: {
    allowedTypes?: string[]
    maxSize?: number // in MB
    maxCount?: number
  } = {}
): { valid: boolean; errors: string[] } {
  const fileArray = Array.from(files)
  const errors: string[] = []
  
  // Check count limit
  if (options.maxCount && fileArray.length > options.maxCount) {
    errors.push(`Maximum ${options.maxCount} files allowed`)
  }
  
  // Check each file
  fileArray.forEach((file, index) => {
    // Check type
    if (options.allowedTypes && !validateFileType(file, options.allowedTypes)) {
      errors.push(`File ${index + 1}: Invalid file type (${file.type})`)
    }
    
    // Check size
    if (options.maxSize && !validateFileSize(file, options.maxSize)) {
      errors.push(`File ${index + 1}: File size exceeds ${options.maxSize}MB limit`)
    }
  })
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Read file as text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (event) => {
      resolve(event.target?.result as string)
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    reader.readAsText(file)
  })
}

/**
 * Read file as data URL
 */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (event) => {
      resolve(event.target?.result as string)
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    reader.readAsDataURL(file)
  })
}

/**
 * Read file as array buffer
 */
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (event) => {
      resolve(event.target?.result as ArrayBuffer)
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Create file from blob
 */
export function createFileFromBlob(blob: Blob, filename: string): File {
  return new File([blob], filename, { type: blob.type })
}

/**
 * Download file from URL
 */
export function downloadFile(url: string, filename?: string): void {
  const link = document.createElement('a')
  link.href = url
  link.download = filename || 'download'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Download file from blob
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  downloadFile(url, filename)
  URL.revokeObjectURL(url)
}

/**
 * Create download from data
 */
export function downloadData(data: string, filename: string, mimeType = 'text/plain'): void {
  const blob = new Blob([data], { type: mimeType })
  downloadBlob(blob, filename)
}

/**
 * Convert file to base64
 */
export async function fileToBase64(file: File): Promise<string> {
  const dataUrl = await readFileAsDataURL(file)
  return dataUrl.split(',')[1] // Remove data:mime;base64, prefix
}

/**
 * Convert base64 to file
 */
export function base64ToFile(base64: string, filename: string, mimeType: string): File {
  const byteCharacters = atob(base64)
  const byteNumbers = new Array(byteCharacters.length)
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  
  const byteArray = new Uint8Array(byteNumbers)
  const blob = new Blob([byteArray], { type: mimeType })
  
  return new File([blob], filename, { type: mimeType })
}

/**
 * Compress image file
 */
export function compressImage(
  file: File,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    if (!isImage(file)) {
      reject(new Error('File is not an image'))
      return
    }
    
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }
      
      // Set canvas dimensions
      canvas.width = width
      canvas.height = height
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            reject(new Error('Failed to compress image'))
          }
        },
        file.type,
        quality
      )
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
    
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Get image dimensions
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    if (!isImage(file)) {
      reject(new Error('File is not an image'))
      return
    }
    
    const img = new Image()
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      })
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
    
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Create thumbnail from image
 */
export function createThumbnail(
  file: File,
  size = 200,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!isImage(file)) {
      reject(new Error('File is not an image'))
      return
    }
    
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // Calculate square thumbnail dimensions
      const { width, height } = img
      const minDimension = Math.min(width, height)
      const scale = size / minDimension
      
      canvas.width = size
      canvas.height = size
      
      // Calculate crop position for center crop
      const sx = (width - minDimension) / 2
      const sy = (height - minDimension) / 2
      
      ctx?.drawImage(
        img,
        sx, sy, minDimension, minDimension,
        0, 0, size, size
      )
      
      resolve(canvas.toDataURL(file.type, quality))
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
    
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Get file icon based on type
 */
export function getFileIcon(file: File | string): string {
  const category = getFileTypeCategory(file)
  
  const icons = {
    image: '🖼️',
    audio: '🎵',
    video: '🎬',
    document: '📄',
    text: '📝',
    archive: '📦',
    unknown: '📎'
  }
  
  return icons[category]
}

/**
 * Check if browser supports file type
 */
export function isFileTypeSupported(mimeType: string): boolean {
  // Check if browser can handle the file type
  const video = document.createElement('video')
  const audio = document.createElement('audio')
  
  if (mimeType.startsWith('video/')) {
    return video.canPlayType(mimeType) !== ''
  }
  
  if (mimeType.startsWith('audio/')) {
    return audio.canPlayType(mimeType) !== ''
  }
  
  if (mimeType.startsWith('image/')) {
    return ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'].includes(mimeType)
  }
  
  return true // Assume supported for other types
}

// Default export
export default {
  getFileInfo,
  getFileExtension,
  formatFileSize,
  getFileTypeCategory,
  isImage,
  isAudio,
  isVideo,
  isDocument,
  isText,
  validateFileType,
  validateFileSize,
  validateFiles,
  readFileAsText,
  readFileAsDataURL,
  readFileAsArrayBuffer,
  createFileFromBlob,
  downloadFile,
  downloadBlob,
  downloadData,
  fileToBase64,
  base64ToFile,
  compressImage,
  getImageDimensions,
  createThumbnail,
  getFileIcon,
  isFileTypeSupported,
  FILE_TYPES,
  IMAGE_EXTENSIONS,
  AUDIO_EXTENSIONS,
  VIDEO_EXTENSIONS,
  DOCUMENT_EXTENSIONS,
  TEXT_EXTENSIONS
}