import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ChatMessage, SendMessageRequest } from '@/interfaces'

export interface MessageHubState {
  messageList: ChatMessage[]
  activeConversationId: string | null
  isLoading: boolean
  isSendingMessage: boolean
  isStreamingResponse: boolean
  errorMessage: string | null
  currentStreamMessage: Partial<ChatMessage> | null
}

export const useMessageHubStore = defineStore('messageHub', () => {
  // 状态
  const messageList = ref<ChatMessage[]>([])
  const activeConversationId = ref<string | null>(null)
  const isLoading = ref(false)
  const isSendingMessage = ref(false)
  const isStreamingResponse = ref(false)
  const errorMessage = ref<string | null>(null)
  const currentStreamMessage = ref<Partial<ChatMessage> | null>(null)

  // 计算属性
  const messageCount = computed(() => messageList.value.length)
  const latestMessage = computed(() => messageList.value[messageList.value.length - 1] || null)
  const humanMessages = computed(() => messageList.value.filter(msg => msg.role === 'human'))
  const aiMessages = computed(() => messageList.value.filter(msg => msg.role === 'ai'))
  const hasMessages = computed(() => messageList.value.length > 0)
  const isProcessing = computed(() => isSendingMessage.value || isLoading.value || isStreamingResponse.value)

  // 操作方法
  const addMessage = (message: ChatMessage) => {
    const existingIndex = messageList.value.findIndex(msg => msg.messageId === message.messageId)
    if (existingIndex >= 0) {
      messageList.value[existingIndex] = message
    } else {
      messageList.value.push(message)
    }
  }

  const updateMessage = (messageId: string, updates: Partial<ChatMessage>) => {
    const index = messageList.value.findIndex(msg => msg.messageId === messageId)
    if (index >= 0) {
      messageList.value[index] = { ...messageList.value[index], ...updates }
    }
  }

  const deleteMessage = (messageId: string) => {
    const index = messageList.value.findIndex(msg => msg.messageId === messageId)
    if (index >= 0) {
      messageList.value.splice(index, 1)
    }
  }

  const setMessageList = (messages: ChatMessage[]) => {
    messageList.value = messages
  }

  const clearMessages = () => {
    messageList.value = []
    currentStreamMessage.value = null
  }

  const setActiveConversationId = (conversationId: string | null) => {
    activeConversationId.value = conversationId
  }

  const setLoadingState = (loading: boolean) => {
    isLoading.value = loading
  }

  const setSendingState = (sending: boolean) => {
    isSendingMessage.value = sending
  }

  const setStreamingState = (streaming: boolean) => {
    isStreamingResponse.value = streaming
  }

  const setErrorMessage = (message: string | null) => {
    errorMessage.value = message
  }

  const clearError = () => {
    errorMessage.value = null
  }

  const setCurrentStreamMessage = (message: Partial<ChatMessage> | null) => {
    currentStreamMessage.value = message
  }

  const updateCurrentStreamMessage = (updates: Partial<ChatMessage>) => {
    if (currentStreamMessage.value) {
      currentStreamMessage.value = { ...currentStreamMessage.value, ...updates }
    }
  }

  const completeStreamMessage = () => {
    if (currentStreamMessage.value && currentStreamMessage.value.messageId) {
      addMessage(currentStreamMessage.value as ChatMessage)
      currentStreamMessage.value = null
    }
    setStreamingState(false)
  }

  const findMessageById = (messageId: string): ChatMessage | undefined => {
    return messageList.value.find(msg => msg.messageId === messageId)
  }

  const getMessagesByConversation = (conversationId: string): ChatMessage[] => {
    return messageList.value.filter(msg => msg.conversationId === conversationId)
  }

  const resetStore = () => {
    messageList.value = []
    activeConversationId.value = null
    isLoading.value = false
    isSendingMessage.value = false
    isStreamingResponse.value = false
    errorMessage.value = null
    currentStreamMessage.value = null
  }

  return {
    // 状态
    messageList,
    activeConversationId,
    isLoading,
    isSendingMessage,
    isStreamingResponse,
    errorMessage,
    currentStreamMessage,
    
    // 计算属性
    messageCount,
    latestMessage,
    humanMessages,
    aiMessages,
    hasMessages,
    isProcessing,
    
    // 操作方法
    addMessage,
    updateMessage,
    deleteMessage,
    setMessageList,
    clearMessages,
    setActiveConversationId,
    setLoadingState,
    setSendingState,
    setStreamingState,
    setErrorMessage,
    clearError,
    setCurrentStreamMessage,
    updateCurrentStreamMessage,
    completeStreamMessage,
    findMessageById,
    getMessagesByConversation,
    resetStore
  }
}, {
  persist: {
    key: 'message-hub-store',
    storage: localStorage,
    paths: ['messageList', 'activeConversationId']
  }
})