import { get, post, put, del, createStreamRequest } from '../utils/http-client'

// Dify应用相关接口
export interface DifyApplication {
  id: string
  name: string
  description?: string
  icon?: string
  icon_background?: string
  mode: 'chat' | 'agent-chat' | 'advanced-chat' | 'workflow' | 'completion'
  enable_site: boolean
  enable_api: boolean
  api_token: string
  created_at: string
  updated_at: string
}

export interface CreateApplicationRequest {
  name: string
  description?: string
  mode: 'chat' | 'agent-chat' | 'advanced-chat' | 'workflow' | 'completion'
  icon?: string
  icon_background?: string
}

export interface UpdateApplicationRequest {
  name?: string
  description?: string
  icon?: string
  icon_background?: string
}

export const difyApplicationApi = {
  // 获取应用列表
  getApplications: (params?: { page?: number; limit?: number }) => 
    get<{ data: DifyApplication[]; total: number }>('/dify/applications', params),
  
  // 创建应用
  createApplication: (data: CreateApplicationRequest) => 
    post<DifyApplication>('/dify/applications', data),
  
  // 获取应用详情
  getApplication: (id: string) => 
    get<DifyApplication>(`/dify/applications/${id}`),
  
  // 更新应用
  updateApplication: (id: string, data: UpdateApplicationRequest) => 
    put<DifyApplication>(`/dify/applications/${id}`, data),
  
  // 删除应用
  deleteApplication: (id: string) => 
    del(`/dify/applications/${id}`),
  
  // 重新生成API Token
  regenerateApiToken: (id: string) => 
    post<{ api_token: string }>(`/dify/applications/${id}/regenerate-token`)
}