import { get, post, put, del, createStreamRequest } from '../utils/http-client'

// 聊天相关接口
export interface ChatMessage {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  files?: Array<{
    id: string
    name: string
    url: string
    type: string
    size: number
  }>
  created_at: string
}

export interface Conversation {
  id: string
  name?: string
  status: 'active' | 'archived'
  created_at: string
  updated_at: string
  message_count: number
  last_message?: ChatMessage
}

export interface SendMessageRequest {
  content: string
  conversation_id?: string
  files?: File[]
  stream?: boolean
}

export interface ChatStreamChunk {
  id: string
  event: 'message' | 'message_end' | 'error' | 'ping'
  data: any
}

export const chatApi = {
  // 发送消息（非流式）
  sendMessage: (data: SendMessageRequest) => 
    post<ChatMessage>('/chat/messages', data),
  
  // 发送消息（流式）
  sendMessageStream: (data: SendMessageRequest) => {
    return createStreamRequest('/chat/messages/stream', {
      method: 'POST',
      data
    })
  },
  
  // 获取对话列表
  getConversations: (params?: { page?: number; limit?: number; status?: 'active' | 'archived' }) => 
    get<{ data: Conversation[]; total: number }>('/chat/conversations', params),
  
  // 获取对话详情
  getConversation: (id: string) => 
    get<Conversation>(`/chat/conversations/${id}`),
  
  // 创建新对话
  createConversation: (name?: string) => 
    post<Conversation>('/chat/conversations', { name }),
  
  // 更新对话
  updateConversation: (id: string, data: { name?: string; status?: 'active' | 'archived' }) => 
    put<Conversation>(`/chat/conversations/${id}`, data),
  
  // 删除对话
  deleteConversation: (id: string) => 
    del(`/chat/conversations/${id}`),
  
  // 获取对话消息
  getMessages: (conversationId: string, params?: { page?: number; limit?: number }) => 
    get<{ data: ChatMessage[]; total: number }>(`/chat/conversations/${conversationId}/messages`, params),
  
  // 删除消息
  deleteMessage: (messageId: string) => 
    del(`/chat/messages/${messageId}`),
  
  // 重新生成回复
  regenerateMessage: (messageId: string, stream = false) => {
    if (stream) {
      return createStreamRequest(`/chat/messages/${messageId}/regenerate/stream`)
    }
    return post<ChatMessage>(`/chat/messages/${messageId}/regenerate`)
  },
  
  // 停止生成
  stopGeneration: (conversationId: string) => 
    post(`/chat/conversations/${conversationId}/stop`)
}