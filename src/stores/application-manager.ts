import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ChatApplication, ApplicationConfiguration } from '@/interfaces'

export type WorkMode = 'single-app' | 'multi-app'

export interface ApplicationManagerState {
  applicationList: ChatApplication[]
  selectedApplication: ChatApplication | null
  workMode: WorkMode
  isLoading: boolean
  errorMessage: string | null
}

export const useApplicationManagerStore = defineStore('applicationManager', () => {
  // 状态
  const applicationList = ref<ChatApplication[]>([])
  const selectedApplication = ref<ChatApplication | null>(null)
  const workMode = ref<WorkMode>('single-app')
  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)

  // 计算属性
  const enabledApplications = computed(() => applicationList.value.filter(app => app.status === 'enabled'))
  const applicationCount = computed(() => applicationList.value.length)
  const selectedApplicationId = computed(() => selectedApplication.value?.appId)
  const selectedApplicationName = computed(() => selectedApplication.value?.appName || '')
  const selectedAppConfiguration = computed(() => selectedApplication.value?.configuration)
  const isSingleAppMode = computed(() => workMode.value === 'single-app')
  const isMultiAppMode = computed(() => workMode.value === 'multi-app')

  // 操作方法
  const setApplicationList = (applications: ChatApplication[]) => {
    applicationList.value = applications
  }

  const addApplication = (application: ChatApplication) => {
    const existingIndex = applicationList.value.findIndex(app => app.appId === application.appId)
    if (existingIndex >= 0) {
      applicationList.value[existingIndex] = application
    } else {
      applicationList.value.push(application)
    }
  }

  const updateApplication = (appId: string, updates: Partial<ChatApplication>) => {
    const index = applicationList.value.findIndex(app => app.appId === appId)
    if (index >= 0) {
      applicationList.value[index] = { ...applicationList.value[index], ...updates }
      
      // 更新选中应用
      if (selectedApplication.value?.appId === appId) {
        selectedApplication.value = { ...selectedApplication.value, ...updates }
      }
    }
  }

  const deleteApplication = (appId: string) => {
    const index = applicationList.value.findIndex(app => app.appId === appId)
    if (index >= 0) {
      applicationList.value.splice(index, 1)
      
      // 清除选中应用
      if (selectedApplication.value?.appId === appId) {
        selectedApplication.value = null
      }
    }
  }

  const selectApplication = (application: ChatApplication | null) => {
    selectedApplication.value = application
  }

  const selectApplicationById = (appId: string) => {
    const application = applicationList.value.find(app => app.appId === appId)
    if (application) {
      selectedApplication.value = application
    }
  }

  const setWorkMode = (mode: WorkMode) => {
    workMode.value = mode
  }

  const updateSelectedAppConfiguration = (config: Partial<ApplicationConfiguration>) => {
    if (selectedApplication.value) {
      selectedApplication.value.configuration = { ...selectedApplication.value.configuration, ...config }
      updateApplication(selectedApplication.value.appId, { configuration: selectedApplication.value.configuration })
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

  const findApplicationById = (appId: string): ChatApplication | undefined => {
    return applicationList.value.find(app => app.appId === appId)
  }

  const resetStore = () => {
    applicationList.value = []
    selectedApplication.value = null
    workMode.value = 'single-app'
    isLoading.value = false
    errorMessage.value = null
  }

  return {
    // 状态
    applicationList,
    selectedApplication,
    workMode,
    isLoading,
    errorMessage,
    
    // 计算属性
    enabledApplications,
    applicationCount,
    selectedApplicationId,
    selectedApplicationName,
    selectedAppConfiguration,
    isSingleAppMode,
    isMultiAppMode,
    
    // 操作方法
    setApplicationList,
    addApplication,
    updateApplication,
    deleteApplication,
    selectApplication,
    selectApplicationById,
    setWorkMode,
    updateSelectedAppConfiguration,
    setLoadingState,
    setErrorMessage,
    clearError,
    findApplicationById,
    resetStore
  }
}, {
  persist: {
    key: 'application-manager-store',
    storage: localStorage,
    paths: ['applicationList', 'selectedApplication', 'workMode']
  }
})