import type { ApplicationMode, ApplicationStatus } from '@/constants/enums'

export interface ChatApplication {
  appId: string
  appName: string
  description?: string
  iconUrl?: string
  mode: ApplicationMode
  status: ApplicationStatus
  createdAt: number
  updatedAt: number
  configuration: ApplicationConfiguration
  apiToken?: string
  websiteInfo?: WebsiteConfiguration
}

export interface ApplicationConfiguration {
  welcomeMessage?: string
  suggestedQuestions?: string[]
  voiceInput?: {
    enabled: boolean
  }
  voiceOutput?: {
    enabled: boolean
    voiceId?: string
  }
  knowledgeRetrieval?: {
    enabled: boolean
  }
  annotationReply?: {
    enabled: boolean
  }
  similarQuestions?: {
    enabled: boolean
  }
  userInputFields?: UserInputField[]
  fileUploadSettings?: {
    imageUpload: {
      enabled: boolean
      maxFiles: number
      quality: 'low' | 'high'
      uploadMethods: string[]
    }
  }
  systemVariables?: Record<string, any>
}

export interface UserInputField {
  fieldConfig: {
    label: string
    variable: string
    required: boolean
    defaultValue?: string
  }
}

export interface WebsiteConfiguration {
  title: string
  iconUrl: string
  iconBackground?: string
  description?: string
  copyright?: string
  privacyPolicy?: string
  disclaimer?: string
}

export interface ApplicationListResponse {
  applications: ChatApplication[]
  totalCount: number
  currentPage: number
  pageSize: number
}

export interface CreateApplicationRequest {
  appName: string
  description?: string
  mode: ApplicationMode
  configuration?: Partial<ApplicationConfiguration>
}

export interface UpdateApplicationRequest {
  appName?: string
  description?: string
  configuration?: Partial<ApplicationConfiguration>
  status?: ApplicationStatus
}

export interface ApplicationDetailsResponse {
  appId: string
  appName: string
  description?: string
  mode: ApplicationMode
  configuration: ApplicationConfiguration
  website: WebsiteConfiguration
}

export interface ApplicationMetaResponse {
  toolIcons: Record<string, string>
}