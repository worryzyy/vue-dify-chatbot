export interface UserProfile {
  id: string
  email: string
  name?: string
  avatar?: string
  created_at: string
  updated_at: string
  // 当前认证用户的信息
  auth_user_id?: string
  provider?: string
}

export interface UserAuthMapping {
  id: string
  auth_user_id: string
  profile_id: string
  provider: string
  created_at: string
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