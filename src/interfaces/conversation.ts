import type { ChatStatus } from '@/constants/enums'

export interface ChatConversation {
  conversationId: string
  title: string
  createdAt: number
  updatedAt: number
  status: ChatStatus
  summary?: string
  messageCount: number
  applicationId: string
  userId?: string
  inputVariables?: Record<string, any>
}

export interface ConversationListResponse {
  conversations: ChatConversation[]
  totalCount: number
  currentPage: number
  pageSize: number
  hasMoreData: boolean
}

export interface CreateConversationRequest {
  title?: string
  inputVariables?: Record<string, any>
  userId?: string
}

export interface UpdateConversationRequest {
  title?: string
  status?: ChatStatus
}

export interface ConversationWithMessages extends ChatConversation {
  messages: import('./chat').ChatMessage[]
}

export interface RenameConversationRequest {
  newTitle: string
  autoGenerate?: boolean
}