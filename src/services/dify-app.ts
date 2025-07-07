import { supabase } from '../config/supabase'
import type { DifyApp, DifyApiAppInfo, CreateDifyAppRequest, UpdateDifyAppRequest, DifyAppResponse } from '@/interfaces/dify-app'
import { getDifyAppModeName } from '../utils/dify-app-mode'

export class DifyAppService {
  /**
   * 获取当前用户的所有 Dify 应用
   */
  static async getUserApps(): Promise<DifyAppResponse> {
    try {
      const { data: session } = await supabase.auth.getSession()
      
      if (!session.session) {
        return {
          success: false,
          error: '用户未登录'
        }
      }

      const { data, error } = await supabase
        .from('dify_apps')
        .select('*')
        .eq('auth_user_id', session.session.user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('获取 Dify 应用失败:', error)
        return {
          success: false,
          error: '获取应用列表失败'
        }
      }

      return {
        success: true,
        data: data || []
      }
    } catch (error) {
      console.error('获取 Dify 应用异常:', error)
      return {
        success: false,
        error: '获取应用列表异常'
      }
    }
  }

  /**
   * 创建新的 Dify 应用
   */
  static async createApp(appData: CreateDifyAppRequest): Promise<DifyAppResponse> {
    try {
      const { data: session } = await supabase.auth.getSession()
      
      if (!session.session) {
        return {
          success: false,
          error: '用户未登录'
        }
      }

      // 首先从 Dify API 获取应用信息
      const appInfoResult = await this.fetchAppInfo(appData.base_url, appData.api_key)
      if (!appInfoResult.success) {
        return appInfoResult
      }

      const appInfo = appInfoResult.data
      
      // 检查 appInfo 是否存在
      if (!appInfo) {
        return {
          success: false,
          error: '获取应用信息失败：数据为空'
        }
      }
      
      // 使用从 API 获取的信息创建应用记录
      const { data, error } = await supabase
        .from('dify_apps')
        .insert({
          auth_user_id: session.session.user.id,
          name: appInfo.name || `Dify应用_${Date.now()}`,
          description: appInfo.description || '', 
          base_url: appData.base_url,
          api_key: appData.api_key,
          icon_url: appInfo.icon || '🤖',
          app_type: getDifyAppModeName(appInfo.mode || 'chat')
        })
        .select()
        .single()

      if (error) {
        console.error('创建 Dify 应用失败:', error)
        return {
          success: false,
          error: '创建应用失败'
        }
      }

      return {
        success: true,
        data: data,
        message: '应用创建成功'
      }
    } catch (error) {
      console.error('创建 Dify 应用异常:', error)
      return {
        success: false,
        error: '创建应用异常'
      }
    }
  }

  /**
   * 更新 Dify 应用
   */
  static async updateApp(appId: string, updates: UpdateDifyAppRequest): Promise<DifyAppResponse> {
    try {
      const { data: session } = await supabase.auth.getSession()
      
      if (!session.session) {
        return {
          success: false,
          error: '用户未登录'
        }
      }

      const { data, error } = await supabase
        .from('dify_apps')
        .update(updates)
        .eq('id', appId)
        .eq('auth_user_id', session.session.user.id)
        .select()
        .single()

      if (error) {
        console.error('更新 Dify 应用失败:', error)
        return {
          success: false,
          error: '更新应用失败'
        }
      }

      return {
        success: true,
        data: data,
        message: '应用更新成功'
      }
    } catch (error) {
      console.error('更新 Dify 应用异常:', error)
      return {
        success: false,
        error: '更新应用异常'
      }
    }
  }

  /**
   * 删除 Dify 应用（软删除）
   */
  static async deleteApp(appId: string): Promise<DifyAppResponse> {
    try {
      const { data: session } = await supabase.auth.getSession()
      
      if (!session.session) {
        return {
          success: false,
          error: '用户未登录'
        }
      }

      const { error } = await supabase
        .from('dify_apps')
        .update({ is_active: false })
        .eq('id', appId)
        .eq('auth_user_id', session.session.user.id)

      if (error) {
        console.error('删除 Dify 应用失败:', error)
        return {
          success: false,
          error: '删除应用失败'
        }
      }

      return {
        success: true,
        message: '应用删除成功'
      }
    } catch (error) {
      console.error('删除 Dify 应用异常:', error)
      return {
        success: false,
        error: '删除应用异常'
      }
    }
  }

  /**
   * 获取单个 Dify 应用
   */
  static async getApp(appId: string): Promise<DifyAppResponse> {
    try {
      const { data: session } = await supabase.auth.getSession()
      
      if (!session.session) {
        return {
          success: false,
          error: '用户未登录'
        }
      }

      const { data, error } = await supabase
        .from('dify_apps')
        .select('*')
        .eq('id', appId)
        .eq('auth_user_id', session.session.user.id)
        .eq('is_active', true)
        .single()

      if (error) {
        console.error('获取 Dify 应用失败:', error)
        return {
          success: false,
          error: '获取应用失败'
        }
      }

      return {
        success: true,
        data: data
      }
    } catch (error) {
      console.error('获取 Dify 应用异常:', error)
      return {
        success: false,
        error: '获取应用异常'
      }
    }
  }

  /**
   * 从 Dify API 获取应用信息
   */
  static async fetchAppInfo(baseUrl: string, apiKey: string): Promise<{ success: boolean; data?: DifyApiAppInfo; error?: string; message?: string }> {
    try {
      // 构建应用信息 API 端点
      const infoUrl = `${baseUrl.replace(/\/$/, '')}/info`
      
      const response = await fetch(infoUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        return {
          success: false,
          error: `获取应用信息失败: ${response.status} ${response.statusText}`
        }
      }

      const data = await response.json() as DifyApiAppInfo
      
      return {
        success: true,
        data: data,
        message: '应用信息获取成功'
      }
    } catch (error) {
      console.error('获取 Dify 应用信息异常:', error)
      return {
        success: false,
        error: '获取应用信息异常'
      }
    }
  }
  static async testAppConnection(baseUrl: string, apiKey: string): Promise<DifyAppResponse> {
    try {
      // 构建测试 API 端点
      const testUrl = `${baseUrl.replace(/\/$/, '')}/v1/parameters`
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        return {
          success: false,
          error: `连接测试失败: ${response.status} ${response.statusText}`
        }
      }

      return {
        success: true,
        message: '连接测试成功'
      }
    } catch (error) {
      console.error('测试 Dify 应用连接异常:', error)
      return {
        success: false,
        error: '连接测试异常'
      }
    }
  }
}