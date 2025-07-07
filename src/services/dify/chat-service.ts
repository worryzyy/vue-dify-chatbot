import { HttpService } from '../http/base'
import type {
  SendMessageRequest,
  SendMessageResponse,
  MessageHistoryResponse,
  MessageFeedback,
  StreamMessage
} from '@/interfaces'

export class ChatService extends HttpService {
  async submitMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    const endpoint = `/external/dify/${this.applicationId}/chat-messages`
    
    const requestData = {
      inputs: request.inputVariables || {},
      query: request.content,
      user: request.userId || 'anonymous-user',
      conversation_id: request.conversationId,
      files: request.attachments || []
    }

    return this.makeRequest<SendMessageResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(requestData)
    })
  }

  async streamMessage(
    request: SendMessageRequest,
    onMessageReceived: (data: StreamMessage) => void,
    onError?: (error: Error) => void,
    onComplete?: () => void
  ): Promise<void> {
    const endpoint = `/external/dify/${this.applicationId}/chat-messages`
    
    const requestData = {
      inputs: request.inputVariables || {},
      query: request.content,
      user: request.userId || 'anonymous-user',
      conversation_id: request.conversationId,
      files: request.attachments || [],
      response_mode: 'streaming'
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          ...this.defaultHeaders,
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('无法获取响应流读取器')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          onComplete?.()
          break
        }

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.trim() === '') continue
          
          if (line.startsWith('data: ')) {
            try {
              const eventData = JSON.parse(line.slice(6))
              onMessageReceived({
                eventType: eventData.event || 'chat_message',
                data: eventData,
                messageId: eventData.id
              })
            } catch (err) {
              console.warn('解析SSE数据失败:', line)
            }
          }
        }
      }
    } catch (error) {
      onError?.(error as Error)
      throw error
    }
  }

  async stopMessage(taskId: string): Promise<void> {
    const endpoint = `/external/dify/${this.applicationId}/chat-messages/${taskId}/stop`
    
    return this.makeRequest(endpoint, {
      method: 'POST'
    })
  }

  async fetchMessageHistory(
    conversationId: string,
    userId?: string,
    firstId?: string,
    pageSize?: number
  ): Promise<MessageHistoryResponse> {
    const params = {
      user: userId || 'anonymous-user',
      conversation_id: conversationId,
      first_id: firstId,
      limit: pageSize || 20
    }

    const endpoint = this.buildQueryString(`/external/dify/${this.applicationId}/messages`, params)
    
    return this.makeRequest<MessageHistoryResponse>(endpoint, {
      method: 'GET'
    })
  }

  async provideFeedback(
    messageId: string,
    feedback: MessageFeedback,
    userId?: string
  ): Promise<void> {
    const endpoint = `/external/dify/${this.applicationId}/feedback`
    
    const requestData = {
      message_id: messageId,
      rating: feedback.rating,
      content: feedback.comment,
      user: userId || 'anonymous-user'
    }

    return this.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(requestData)
    })
  }

  async fetchSuggestedQuestions(
    messageId: string,
    userId?: string
  ): Promise<string[]> {
    const params = {
      user: userId || 'anonymous-user'
    }

    const endpoint = this.buildQueryString(`/external/dify/${this.applicationId}/messages/${messageId}/suggested`, params)
    
    const response = await this.makeRequest<{ data: string[] }>(endpoint, {
      method: 'GET'
    })

    return response.data
  }
}