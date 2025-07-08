import { get, post } from '../utils/http-client'

// 认证相关接口
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name?: string
}

export interface AuthResponse {
  user: {
    id: string
    email: string
    name?: string
  }
  token: string
}

export const authApi = {
  // 登录
  login: (data: LoginRequest) => 
    post<AuthResponse>('/auth/login', data),
  
  // 注册  
  register: (data: RegisterRequest) => 
    post<AuthResponse>('/auth/register', data),
  
  // 登出
  logout: () => 
    post('/auth/logout'),
  
  // 刷新token
  refreshToken: () => 
    post<{ token: string }>('/auth/refresh'),
  
  // 获取当前用户信息
  getCurrentUser: () => 
    get('/auth/me'),
  
  // 重置密码
  resetPassword: (email: string) => 
    post('/auth/reset-password', { email }),
  
  // 确认重置密码
  confirmResetPassword: (token: string, password: string) => 
    post('/auth/confirm-reset', { token, password })
}