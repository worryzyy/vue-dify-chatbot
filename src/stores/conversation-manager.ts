import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ChatConversation } from '@/interfaces'

export interface ConversationManagerState {
  conversationList: ChatConversation[]
  activeConversationId: string | null
  isLoading: boolean
  errorMessage: string | null
  hasMoreData: boolean
  currentPage: number
}

export const useConversationManagerStore = defineStore('conversationManager', () => {
  // 状态
  const conversationList = ref<ChatConversation[]>([])
  const activeConversationId = ref<string | null>(null)
  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)
  const hasMoreData = ref(true)
  const currentPage = ref(1)

  // 计算属性
  const conversationCount = computed(() => conversationList.value.length)
  const activeConversation = computed(() => 
    conversationList.value.find(conv => conv.conversationId === activeConversationId.value) || null
  )
  const activeConversations = computed(() => 
    conversationList.value.filter(conv => conv.status === 'active')
  )
  const archivedConversations = computed(() => 
    conversationList.value.filter(conv => conv.status === 'archived')
  )
  const sortedConversations = computed(() => 
    [...conversationList.value].sort((a, b) => b.updatedAt - a.updatedAt)
  )

  // 操作方法
  const setConversationList = (conversations: ChatConversation[]) => {
    conversationList.value = conversations
  }

  const addConversation = (conversation: ChatConversation) => {
    const existingIndex = conversationList.value.findIndex(conv => conv.conversationId === conversation.conversationId)
    if (existingIndex >= 0) {
      conversationList.value[existingIndex] = conversation
    } else {
      conversationList.value.unshift(conversation) // 添加到开头
    }
  }

  const appendConversations = (conversations: ChatConversation[]) => {
    conversations.forEach(conversation => {
      const existingIndex = conversationList.value.findIndex(conv => conv.conversationId === conversation.conversationId)
      if (existingIndex >= 0) {
        conversationList.value[existingIndex] = conversation
      } else {
        conversationList.value.push(conversation)
      }
    })
  }

  const updateConversation = (conversationId: string, updates: Partial<ChatConversation>) => {
    const index = conversationList.value.findIndex(conv => conv.conversationId === conversationId)
    if (index >= 0) {
      conversationList.value[index] = { ...conversationList.value[index], ...updates }
    }
  }

  const deleteConversation = (conversationId: string) => {
    const index = conversationList.value.findIndex(conv => conv.conversationId === conversationId)
    if (index >= 0) {
      conversationList.value.splice(index, 1)
      
      // 清除活跃对话
      if (activeConversationId.value === conversationId) {
        activeConversationId.value = null
      }
    }
  }

  const setActiveConversationId = (conversationId: string | null) => {
    activeConversationId.value = conversationId
  }

  const setActiveConversation = (conversation: ChatConversation | null) => {
    if (conversation) {
      activeConversationId.value = conversation.conversationId
      addConversation(conversation)
    } else {
      activeConversationId.value = null
    }
  }

  const setLoadingState = (loading: boolean) => {
    isLoading.value = loading
  }

  const setErrorMessage = (message: string | null) => {
    errorMessage.value = message
  }

  const clearError = () => {
    errorMessage.value = null
  }

  const setHasMoreData = (hasMore: boolean) => {
    hasMoreData.value = hasMore
  }

  const setCurrentPage = (page: number) => {
    currentPage.value = page
  }

  const incrementPage = () => {
    currentPage.value += 1
  }

  const resetPagination = () => {
    currentPage.value = 1
    hasMoreData.value = true
  }

  const findConversationById = (conversationId: string): ChatConversation | undefined => {
    return conversationList.value.find(conv => conv.conversationId === conversationId)
  }

  const getConversationsByApp = (applicationId: string): ChatConversation[] => {
    return conversationList.value.filter(conv => conv.applicationId === applicationId)
  }

  const updateConversationActivity = (conversationId: string) => {
    updateConversation(conversationId, { 
      updatedAt: Date.now()
    })
  }

  const archiveConversation = (conversationId: string) => {
    updateConversation(conversationId, { 
      status: 'archived',
      updatedAt: Date.now()
    })
  }

  const restoreConversation = (conversationId: string) => {
    updateConversation(conversationId, { 
      status: 'active',
      updatedAt: Date.now()
    })
  }

  const clearConversations = () => {
    conversationList.value = []
    activeConversationId.value = null
    resetPagination()
  }

  const resetStore = () => {
    conversationList.value = []
    activeConversationId.value = null
    isLoading.value = false
    errorMessage.value = null
    hasMoreData.value = true
    currentPage.value = 1
  }

  return {
    // 状态
    conversationList,
    activeConversationId,
    isLoading,
    errorMessage,
    hasMoreData,
    currentPage,
    
    // 计算属性
    conversationCount,
    activeConversation,
    activeConversations,
    archivedConversations,
    sortedConversations,
    
    // 操作方法
    setConversationList,
    addConversation,
    appendConversations,
    updateConversation,
    deleteConversation,
    setActiveConversationId,
    setActiveConversation,
    setLoadingState,
    setErrorMessage,
    clearError,
    setHasMoreData,
    setCurrentPage,
    incrementPage,
    resetPagination,
    findConversationById,
    getConversationsByApp,
    updateConversationActivity,
    archiveConversation,
    restoreConversation,
    clearConversations,
    resetStore
  }
}, {
  persist: {
    key: 'conversation-manager-store',
    storage: localStorage,
    paths: ['conversationList', 'activeConversationId']
  }
})