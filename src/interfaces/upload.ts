import type { UploadState } from '@/constants/enums'

export interface FileUploadRequest {
  file: File
  userId?: string
}

export interface FileUploadResponse {
  fileId: string
  filename: string
  fileSize: number
  fileExtension: string
  mimeType: string
  uploadedBy: string
  uploadedAt: number
  downloadUrl?: string
}

export interface FileMetadata {
  fileId: string
  filename: string
  fileSize: number
  mimeType: string
  downloadUrl: string
  uploadedAt: number
}

export interface AudioTranscriptionRequest {
  audioFile: File
  userId?: string
}

export interface AudioTranscriptionResponse {
  transcription: string
}

export interface TextToSpeechRequest {
  text: string
  userId?: string
  streaming?: boolean
}

export interface TextToSpeechResponse {
  audioUrl: string
  duration?: number
}

export interface FileProcessingStatus {
  status: UploadState
  progress?: number
  errorMessage?: string
}