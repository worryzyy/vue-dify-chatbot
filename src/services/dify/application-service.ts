import { HttpService } from '../http/base'
import type {
  ChatApplication,
  ApplicationListResponse,
  ApplicationDetailsResponse,
  ApplicationMetaResponse,
  CreateApplicationRequest,
  UpdateApplicationRequest
} from '@/interfaces'

export class ApplicationService extends HttpService {
  async fetchApplicationDetails(applicationId?: string): Promise<ApplicationDetailsResponse> {
    const appId = applicationId || this.applicationId
    if (!appId) {
      throw new Error('应用ID是必需的')
    }

    const endpoint = `/external/dify/${appId}/info`
    
    return this.makeRequest<ApplicationDetailsResponse>(endpoint, {
      method: 'GET'
    })
  }

  async fetchApplicationMeta(applicationId?: string): Promise<ApplicationMetaResponse> {
    const appId = applicationId || this.applicationId
    if (!appId) {
      throw new Error('应用ID是必需的')
    }

    const endpoint = `/external/dify/${appId}/meta`
    
    return this.makeRequest<ApplicationMetaResponse>(endpoint, {
      method: 'GET'
    })
  }

  async fetchWebsiteConfig(applicationId?: string): Promise<any> {
    const appId = applicationId || this.applicationId
    if (!appId) {
      throw new Error('应用ID是必需的')
    }

    const endpoint = `/external/dify/${appId}/site`
    
    return this.makeRequest(endpoint, {
      method: 'GET'
    })
  }

  async fetchApplicationParams(applicationId?: string, userId?: string): Promise<any> {
    const appId = applicationId || this.applicationId
    if (!appId) {
      throw new Error('应用ID是必需的')
    }

    const params = {
      user: userId || 'anonymous-user'
    }

    const endpoint = this.buildQueryString(`/external/dify/${appId}/parameters`, params)
    
    return this.makeRequest(endpoint, {
      method: 'GET'
    })
  }

  // 应用管理功能（需要管理员权限）
  async fetchApplicationList(page = 1, pageSize = 20): Promise<ApplicationListResponse> {
    const params = { page, limit: pageSize }
    const endpoint = this.buildQueryString('/apps', params)
    
    return this.makeRequest<ApplicationListResponse>(endpoint, {
      method: 'GET'
    })
  }

  async createApplication(request: CreateApplicationRequest): Promise<ChatApplication> {
    const endpoint = '/app'
    
    return this.makeRequest<ChatApplication>(endpoint, {
      method: 'POST',
      body: JSON.stringify(request)
    })
  }

  async updateApplication(applicationId: string, request: UpdateApplicationRequest): Promise<ChatApplication> {
    const endpoint = `/app/${applicationId}`
    
    return this.makeRequest<ChatApplication>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(request)
    })
  }

  async removeApplication(applicationId: string): Promise<void> {
    const endpoint = `/app/${applicationId}`
    
    return this.makeRequest(endpoint, {
      method: 'DELETE'
    })
  }

  async cloneApplication(applicationId: string, newName: string): Promise<ChatApplication> {
    const endpoint = `/app/${applicationId}/copy`
    
    return this.makeRequest<ChatApplication>(endpoint, {
      method: 'POST',
      body: JSON.stringify({ name: newName })
    })
  }

  async synchronizeWithDify(applicationId: string): Promise<ChatApplication> {
    const endpoint = `/app/${applicationId}/sync`
    
    return this.makeRequest<ChatApplication>(endpoint, {
      method: 'POST'
    })
  }
}