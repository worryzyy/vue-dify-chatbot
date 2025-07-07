export interface DifyApp {
  id: string
  auth_user_id: string
  name: string
  description?: string
  base_url: string
  api_key: string
  icon_url?: string
  app_type: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DifyApiAppInfo {
  name: string
  description?: string
  icon?: string
  mode: string
}

export interface CreateDifyAppRequest {
  base_url: string
  api_key: string
}

export interface UpdateDifyAppRequest {
  name?: string
  description?: string
  base_url?: string
  api_key?: string
  icon_url?: string
  is_active?: boolean
}

export interface DifyAppResponse {
  success: boolean
  data?: DifyApp | DifyApp[]
  error?: string
  message?: string
}