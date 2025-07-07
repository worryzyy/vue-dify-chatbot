import { ref, computed } from 'vue'
import { useUserSessionStore } from '@/stores/user-session'
import type { UserProfile } from '@/stores/user-session'

export function useUserSession() {
  const sessionStore = useUserSessionStore()
  
  const isAuthenticating = ref(false)
  const authError = ref<string | null>(null)

  // 计算属性
  const isLoggedIn = computed(() => sessionStore.isLoggedIn)
  const userProfile = computed(() => sessionStore.userProfile)
  const accessToken = computed(() => sessionStore.accessToken)
  const displayName = computed(() => sessionStore.displayName)
  const avatarUrl = computed(() => sessionStore.avatarUrl)

  // 登录功能
  const authenticateUser = async (credentials: { username: string; password: string }) => {
    isAuthenticating.value = true
    authError.value = null

    try {
      // 模拟登录逻辑 - 替换为实际 API 调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 模拟用户数据 - 替换为实际响应
      const profile: UserProfile = {
        userId: '1',
        displayName: credentials.username,
        email: `${credentials.username}@example.com`,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${credentials.username}`
      }
      
      const token = 'mock-jwt-token-' + Date.now()
      
      sessionStore.loginUser(profile, token)
      
      return { success: true, profile, token }
    } catch (error) {
      authError.value = error instanceof Error ? error.message : '登录失败'
      return { success: false, error: authError.value }
    } finally {
      isAuthenticating.value = false
    }
  }

  // 访客登录功能
  const authenticateAsGuest = () => {
    const guestProfile: UserProfile = {
      userId: 'guest',
      displayName: 'Guest User'
    }
    
    const guestToken = 'guest-token-' + Date.now()
    sessionStore.loginUser(guestProfile, guestToken)
    
    return { success: true, profile: guestProfile, token: guestToken }
  }

  // 登出功能
  const logout = () => {
    sessionStore.logoutUser()
    // 清除其他应用状态
    // router.push('/auth/login')
  }

  // 更新用户信息
  const updateProfile = (profileData: Partial<UserProfile>) => {
    sessionStore.updateUserProfile(profileData)
  }

  // 检查用户权限（占位符）
  const hasPermission = (permission: string): boolean => {
    // 基于用户角色实现权限逻辑
    return true
  }

  // 刷新令牌功能
  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      // 模拟令牌刷新 - 替换为实际 API 调用
      const newToken = 'refreshed-token-' + Date.now()
      sessionStore.updateAccessToken(newToken)
      return true
    } catch (error) {
      logout()
      return false
    }
  }

  // 验证当前会话
  const validateCurrentSession = async (): Promise<boolean> => {
    if (!sessionStore.accessToken) {
      return false
    }

    try {
      // 模拟会话验证 - 替换为实际 API 调用
      await new Promise(resolve => setTimeout(resolve, 500))
      return true
    } catch (error) {
      logout()
      return false
    }
  }

  // 清除登录错误
  const clearAuthError = () => {
    authError.value = null
  }

  return {
    // 状态
    isAuthenticating,
    authError,
    
    // 计算属性
    isLoggedIn,
    userProfile,
    accessToken,
    displayName,
    avatarUrl,
    
    // 操作方法
    authenticateUser,
    authenticateAsGuest,
    logout,
    updateProfile,
    hasPermission,
    refreshAccessToken,
    validateCurrentSession,
    clearAuthError
  }
}