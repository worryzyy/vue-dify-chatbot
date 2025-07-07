import { ref, computed, inject, nextTick } from 'vue'
import { useMessageHubStore } from '@/stores/message-hub'
import { useApplicationManagerStore } from '@/stores/application-manager'
import { useConversationManagerStore } from '@/stores/conversation-manager'
import { useUserSessionStore } from '@/stores/user-session'
import { DIFY_SERVICES_KEY } from '@/services'
import type { DifyServiceManager } from '@/services'
import type { SendMessageRequest, ChatMessage, StreamMessage } from '@/interfaces'
import { generateId } from '@/utils/id'

export function useChatInterface() {
  const messageHub = useMessageHubStore()
  const applicationManager = useApplicationManagerStore()
  const conversationManager = useConversationManagerStore()
  const userSession = useUserSessionStore()
  const difyServices = inject<DifyServiceManager>(DIFY_SERVICES_KEY)

  if (!difyServices) {
    throw new Error('DifyServiceManager未找到。请确保在应用中提供了它。')
  }

  const requestAbortController = ref<AbortController | null>(null)

  // 计算属性
  const messageList = computed(() => messageHub.messageList)
  const isLoading = computed(() => messageHub.isLoading)
  const isSendingMessage = computed(() => messageHub.isSendingMessage)
  const isStreamingResponse = computed(() => messageHub.isStreamingResponse)
  const errorMessage = computed(() => messageHub.errorMessage)
  const currentStreamMessage = computed(() => messageHub.currentStreamMessage)
  const selectedApplication = computed(() => applicationManager.selectedApplication)
  const activeConversation = computed(() => conversationManager.activeConversation)

  // 发送消息功能
  const submitMessage = async (
    content: string,
    options: Partial<SendMessageRequest> = {}
  ): Promise<void> => {
    if (!selectedApplication.value) {
      throw new Error('未选择应用')
    }

    if (isSendingMessage.value || isStreamingResponse.value) {
      console.warn('正在发送消息中')
      return
    }

    try {
      messageHub.setSendingState(true)
      messageHub.clearError()

      // 创建用户消息
      const userMessage: ChatMessage = {
        messageId: generateId(),
        content,
        role: 'human',
        createdAt: Date.now(),
        conversationId: conversationManager.activeConversationId || undefined
      }

      // 添加用户消息到存储
      messageHub.addMessage(userMessage)

      // 准备发送参数
      const sendRequest: SendMessageRequest = {
        content,
        conversationId: conversationManager.activeConversationId || undefined,
        userId: userSession.userProfile?.userId || 'anonymous-user',
        inputVariables: options.inputVariables,
        attachments: options.attachments
      }

      // 更新服务的当前应用
      if (selectedApplication.value.appId) {
        difyServices.updateApplicationId(selectedApplication.value.appId)
      }

      // 发送流式消息
      await streamMessageResponse(sendRequest)

    } catch (error) {
      console.error('发送消息失败:', error)
      messageHub.setErrorMessage(error instanceof Error ? error.message : '发送消息失败')
    } finally {
      messageHub.setSendingState(false)
    }
  }

  // 发送流式消息
  const streamMessageResponse = async (request: SendMessageRequest): Promise<void> => {
    return new Promise((resolve, reject) => {
      messageHub.setStreamingState(true)
      
      let aiMessageId = ''
      let aiMessage: Partial<ChatMessage> = {
        messageId: '',
        content: '',
        role: 'ai',
        createdAt: Date.now(),
        conversationId: request.conversationId
      }

      difyServices.chatService.streamMessage(
        request,
        (event: StreamMessage) => {
          try {
            handleStreamEvent(event, aiMessage, (updatedMessage) => {
              aiMessage = updatedMessage
              aiMessageId = updatedMessage.messageId || aiMessageId
              messageHub.setCurrentStreamMessage(aiMessage)
            })
          } catch (error) {
            console.error('处理流事件错误:', error)
          }
        },
        (error: Error) => {
          console.error('流错误:', error)
          messageHub.setErrorMessage(error.message)
          messageHub.setStreamingState(false)
          reject(error)
        },
        () => {
          // 流完成
          if (aiMessage.messageId && aiMessage.content) {
            messageHub.addMessage(aiMessage as ChatMessage)
          }
          messageHub.setCurrentStreamMessage(null)
          messageHub.setStreamingState(false)
          resolve()
        }
      ).catch(reject)
    })
  }

  // 处理流事件
  const handleStreamEvent = (
    event: StreamMessage,
    currentMessage: Partial<ChatMessage>,
    updateCallback: (message: Partial<ChatMessage>) => void
  ) => {
    switch (event.eventType) {
      case 'chat_message':
        if (event.data.answer) {
          currentMessage.content = (currentMessage.content || '') + event.data.answer
          currentMessage.messageId = event.data.id || currentMessage.messageId
          updateCallback(currentMessage)
        }
        break

      case 'message_complete':
        currentMessage.messageId = event.data.id || currentMessage.messageId
        currentMessage.metadata = event.data.metadata
        
        // 更新对话 ID
        if (event.data.conversation_id && !conversationManager.activeConversationId) {
          conversationManager.setActiveConversationId(event.data.conversation_id)
          currentMessage.conversationId = event.data.conversation_id
        }
        
        updateCallback(currentMessage)
        break

      case 'message_update':
        currentMessage.content = event.data.answer || ''
        currentMessage.messageId = event.data.id || currentMessage.messageId
        updateCallback(currentMessage)
        break

      case 'system_error':
        throw new Error(event.data.message || '流错误发生')

      case 'workflow_start':
      case 'workflow_end':
      case 'node_execution_start':
      case 'node_execution_end':
        // 处理工作流事件
        if (event.data) {
          currentMessage.workflowData = {
            nodeId: event.data.node_id,
            nodeName: event.data.node_name,
            executionStatus: event.eventType.includes('end') ? 'completed' : 'processing'
          }
          updateCallback(currentMessage)
        }
        break

      default:
        console.log('未处理的事件:', event.eventType, event.data)
    }
  }

  // 停止当前消息
  const stopCurrentMessage = async (taskId?: string): Promise<void> => {
    if (requestAbortController.value) {
      requestAbortController.value.abort()
      requestAbortController.value = null
    }

    if (taskId) {
      try {
        await difyServices.chatService.stopMessage(taskId)
      } catch (error) {
        console.error('停止消息失败:', error)
      }
    }

    messageHub.setStreamingState(false)
    messageHub.setSendingState(false)
  }

  // 重新生成最后一条 AI 消息
  const regenerateLastResponse = async (): Promise<void> => {
    const lastHumanMessage = [...messageList.value]
      .reverse()
      .find(msg => msg.role === 'human')

    if (!lastHumanMessage) {
      throw new Error('未找到用户消息以重新生成')
    }

    // 删除最后一条 AI 消息
    const lastMessage = messageList.value[messageList.value.length - 1]
    if (lastMessage && lastMessage.role === 'ai') {
      messageHub.deleteMessage(lastMessage.messageId)
    }

    // 重新发送最后一条用户消息
    await submitMessage(lastHumanMessage.content)
  }

  // 加载对话消息
  const loadConversationMessages = async (conversationId: string): Promise<void> => {
    if (!selectedApplication.value) {
      throw new Error('未选择应用')
    }

    try {
      messageHub.setLoadingState(true)
      messageHub.clearError()

      const response = await difyServices.chatService.fetchMessageHistory(
        conversationId,
        userSession.userProfile?.userId || 'anonymous-user'
      )

      messageHub.setMessageList(response.messages || [])
      messageHub.setActiveConversationId(conversationId)

    } catch (error) {
      console.error('加载对话消息失败:', error)
      messageHub.setErrorMessage(error instanceof Error ? error.message : '加载消息失败')
    } finally {
      messageHub.setLoadingState(false)
    }
  }

  // 提交消息反馈
  const submitMessageFeedback = async (
    messageId: string,
    rating: 'positive' | 'negative',
    comment?: string
  ): Promise<void> => {
    try {
      await difyServices.chatService.provideFeedback(
        messageId,
        { messageId, rating, comment },
        userSession.userProfile?.userId || 'anonymous-user'
      )

      // 更新存储中的消息
      messageHub.updateMessage(messageId, {
        userFeedback: { messageId, rating, comment }
      })

    } catch (error) {
      console.error('提交反馈失败:', error)
      throw error
    }
  }

  // 获取建议问题
  const fetchSuggestedQuestions = async (messageId: string): Promise<string[]> => {
    try {
      return await difyServices.chatService.fetchSuggestedQuestions(
        messageId,
        userSession.userProfile?.userId || 'anonymous-user'
      )
    } catch (error) {
      console.error('获取建议问题失败:', error)
      return []
    }
  }

  // 清除当前聊天
  const clearCurrentChat = () => {
    messageHub.clearMessages()
    messageHub.setActiveConversationId(null)
    conversationManager.setActiveConversationId(null)
  }

  // 开始新对话
  const startNewConversation = () => {
    clearCurrentChat()
    // 可选择创建新对话
  }

  return {
    // 状态
    messageList,
    isLoading,
    isSendingMessage,
    isStreamingResponse,
    errorMessage,
    currentStreamMessage,
    selectedApplication,
    activeConversation,
    
    // 操作方法
    submitMessage,
    stopCurrentMessage,
    regenerateLastResponse,
    loadConversationMessages,
    submitMessageFeedback,
    fetchSuggestedQuestions,
    clearCurrentChat,
    startNewConversation
  }
}