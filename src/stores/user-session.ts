import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface UserProfile {
  userId: string
  displayName: string
  email?: string
  avatarUrl?: string
  role?: string
  preferences?: Record<string, any>
}

export interface SessionState {
  userProfile: UserProfile | null
  accessToken: string | null
  refreshToken?: string | null
  isLoggedIn: boolean
  sessionExpiry?: number
}

export const useUserSessionStore = defineStore('userSession', () => {
  // 状态
  const userProfile = ref<UserProfile | null>(null)
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const sessionExpiry = ref<number | undefined>(undefined)

  // 计算属性
  const isLoggedIn = computed(() => 
    userProfile.value !== null && accessToken.value !== null
  )
  
  const displayName = computed(() => 
    userProfile.value?.displayName || '匿名用户'
  )
  
  const avatarUrl = computed(() => 
    userProfile.value?.avatarUrl || undefined
  )
  
  const userRole = computed(() => 
    userProfile.value?.role || 'user'
  )
  
  const isGuest = computed(() => 
    userProfile.value?.userId === 'guest'
  )
  
  const isSessionValid = computed(() => {
    if (!sessionExpiry.value) return true
    return Date.now() < sessionExpiry.value
  })

  // 操作方法
  const loginUser = (profile: UserProfile, token: string, refreshTokenValue?: string) => {
    userProfile.value = profile
    accessToken.value = token
    refreshToken.value = refreshTokenValue || null
    sessionExpiry.value = Date.now() + (24 * 60 * 60 * 1000) // 24小时后过期
  }

  const updateUserProfile = (profileData: Partial<UserProfile>) => {
    if (userProfile.value) {
      userProfile.value = { ...userProfile.value, ...profileData }
    }
  }

  const updateAccessToken = (token: string) => {
    accessToken.value = token
    sessionExpiry.value = Date.now() + (24 * 60 * 60 * 1000) // 重置过期时间
  }

  const updateRefreshToken = (token: string) => {
    refreshToken.value = token
  }

  const setUserPreferences = (preferences: Record<string, any>) => {
    if (userProfile.value) {
      userProfile.value.preferences = { ...userProfile.value.preferences, ...preferences }
    }
  }

  const getUserPreference = (key: string, defaultValue?: any) => {
    return userProfile.value?.preferences?.[key] || defaultValue
  }

  const logoutUser = () => {
    userProfile.value = null
    accessToken.value = null
    refreshToken.value = null
    sessionExpiry.value = undefined
  }

  const clearSessionData = () => {
    logoutUser()
  }

  const extendSession = (hours: number = 24) => {
    sessionExpiry.value = Date.now() + (hours * 60 * 60 * 1000)
  }

  const isTokenExpired = () => {
    if (!sessionExpiry.value) return false
    return Date.now() >= sessionExpiry.value
  }

  const getSessionTimeRemaining = (): number => {
    if (!sessionExpiry.value) return Infinity
    return Math.max(0, sessionExpiry.value - Date.now())
  }

  const hasPermission = (permission: string): boolean => {
    // 基础权限检查逻辑
    if (!userProfile.value) return false
    if (userProfile.value.role === 'admin') return true
    
    // 可以在这里添加更复杂的权限逻辑
    return true
  }

  const isAdmin = computed(() => userProfile.value?.role === 'admin')
  const isModerator = computed(() => ['admin', 'moderator'].includes(userProfile.value?.role || ''))

  return {
    // 状态
    userProfile,
    accessToken,
    refreshToken,
    sessionExpiry,
    
    // 计算属性
    isLoggedIn,
    displayName,
    avatarUrl,
    userRole,
    isGuest,
    isSessionValid,
    isAdmin,
    isModerator,
    
    // 操作方法
    loginUser,
    updateUserProfile,
    updateAccessToken,
    updateRefreshToken,
    setUserPreferences,
    getUserPreference,
    logoutUser,
    clearSessionData,
    extendSession,
    isTokenExpired,
    getSessionTimeRemaining,
    hasPermission
  }
}, {
  persist: {
    key: 'user-session-store',
    storage: localStorage,
    paths: ['userProfile', 'accessToken', 'refreshToken', 'sessionExpiry']
  }
})