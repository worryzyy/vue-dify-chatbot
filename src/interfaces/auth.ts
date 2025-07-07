export interface UserProfile {
  id: string
  email: string
  name?: string
  avatar?: string
  provider?: string
  created_at: string
  updated_at: string
  // 不再需要 auth_user_id，因为我们直接使用 Supabase Auth 的用户 ID
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name?: string
}

export type OAuthProvider = 'github' | 'google'

export interface OAuthLoginRequest {
  provider: OAuthProvider
  redirectTo?: string
}

export interface AuthResponse {
  user: UserProfile | null
  session: {
    access_token: string
    refresh_token: string
    expires_at: number
    user: UserProfile
  } | null
  error?: string
  message?: string // 用于成功但需要验证的消息
}

export interface AuthState {
  user: UserProfile | null
  session: {
    access_token: string
    refresh_token: string
    expires_at: number
  } | null
  isAuthenticated: boolean
  loading: boolean
}

// 简化的认证事件类型
export type AuthEvent = 'INITIAL_SESSION' | 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED'

// 简化的认证状态变更回调
export type AuthStateChangeCallback = (
  event: AuthEvent,
  session: AuthState['session'] | null,
  user: UserProfile | null
) => void