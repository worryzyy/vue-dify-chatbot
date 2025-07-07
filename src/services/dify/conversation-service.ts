import { HttpService } from '../http/base'
import type {
  ChatConversation,
  ConversationListResponse,
  ConversationWithMessages,
  CreateConversationRequest,
  UpdateConversationRequest,
  RenameConversationRequest
} from '@/interfaces'

export class ConversationService extends HttpService {
  async fetchConversationList(
    userId?: string,
    lastId?: string,
    pageSize = 20,
    pinned?: boolean
  ): Promise<ConversationListResponse> {
    const params = {
      user: userId || 'anonymous-user',
      last_id: lastId,
      limit: pageSize,
      pinned
    }

    const endpoint = this.buildQueryString(`/external/dify/${this.applicationId}/conversations`, params)
    
    return this.makeRequest<ConversationListResponse>(endpoint, {
      method: 'GET'
    })
  }

  async fetchConversationDetails(
    conversationId: string,
    userId?: string
  ): Promise<ConversationWithMessages> {
    const params = {
      user: userId || 'anonymous-user'
    }

    const endpoint = this.buildQueryString(`/external/dify/${this.applicationId}/conversation/${conversationId}`, params)
    
    return this.makeRequest<ConversationWithMessages>(endpoint, {
      method: 'GET'
    })
  }

  async createConversation(request: CreateConversationRequest): Promise<ChatConversation> {
    const endpoint = `/external/dify/${this.applicationId}/conversations`
    
    const requestData = {
      name: request.title,
      inputs: request.inputVariables || {},
      user: request.userId || 'anonymous-user'
    }

    return this.makeRequest<ChatConversation>(endpoint, {
      method: 'POST',
      body: JSON.stringify(requestData)
    })
  }

  async removeConversation(
    conversationId: string,
    userId?: string
  ): Promise<void> {
    const endpoint = `/external/dify/${this.applicationId}/conversation/${conversationId}`
    
    const requestData = {
      user: userId || 'anonymous-user'
    }

    return this.makeRequest(endpoint, {
      method: 'DELETE',
      body: JSON.stringify(requestData)
    })
  }

  async renameConversation(
    conversationId: string,
    request: RenameConversationRequest,
    userId?: string
  ): Promise<ChatConversation> {
    const endpoint = `/external/dify/${this.applicationId}/conversation/${conversationId}/name`
    
    const requestData = {
      name: request.newTitle,
      auto_generate: request.autoGenerate || false,
      user: userId || 'anonymous-user'
    }

    return this.makeRequest<ChatConversation>(endpoint, {
      method: 'POST',
      body: JSON.stringify(requestData)
    })
  }

  async toggleConversationPin(
    conversationId: string,
    pinned: boolean,
    userId?: string
  ): Promise<void> {
    const endpoint = `/external/dify/${this.applicationId}/conversation/${conversationId}/pin`
    
    const requestData = {
      pinned,
      user: userId || 'anonymous-user'
    }

    return this.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(requestData)
    })
  }

  async fetchConversationMessages(
    conversationId: string,
    userId?: string,
    firstId?: string,
    pageSize = 20
  ): Promise<any> {
    const params = {
      user: userId || 'anonymous-user',
      conversation_id: conversationId,
      first_id: firstId,
      limit: pageSize
    }

    const endpoint = this.buildQueryString(`/external/dify/${this.applicationId}/conversation/${conversationId}/messages`, params)
    
    return this.makeRequest(endpoint, {
      method: 'GET'
    })
  }
}