// 导出所有 store
export { useUserSessionStore } from './user-session'
export { useApplicationManagerStore } from './application-manager'
export { useMessageHubStore } from './message-hub'
export { useConversationManagerStore } from './conversation-manager'
export { useThemeStore } from './theme'
export { useAuthStore } from './auth'

// 导出 store 类型
export type { UserProfile, SessionState } from './user-session'
export type { WorkMode, ApplicationManagerState } from './application-manager'
export type { MessageHubState } from './message-hub'
export type { ConversationManagerState } from './conversation-manager'
export type { ThemeMode, ColorScheme, ThemeConfig } from './theme'

// Store 设置函数（在 main.ts 中调用）
import type { App } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

export function setupPiniaStores(app: App) {
  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)
  app.use(pinia)
  return pinia
}

// Store 初始化辅助函数
export function initializeAppStores() {
  // 首先初始化主题 store 以应用主题
  const themeStore = useThemeStore()
  themeStore.applyTheme()
  
  // 注意：认证初始化在 App.vue 中进行，避免重复初始化
  
  return {
    userSession: useUserSessionStore(),
    applicationManager: useApplicationManagerStore(),
    messageHub: useMessageHubStore(),
    conversationManager: useConversationManagerStore(),
    theme: themeStore,
    auth: useAuthStore()
  }
}