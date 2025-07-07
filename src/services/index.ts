export * from './http/base'
export * from './dify/chat-service'
export * from './dify/application-service'
export * from './dify/conversation-service'
export * from './dify/upload-service'
export * from './auth'

import { ChatService } from './dify/chat-service'
import { ApplicationService } from './dify/application-service'
import { ConversationService } from './dify/conversation-service'
import { UploadService } from './dify/upload-service'
import type { DifyClientOptions } from './http/base'

export class DifyServiceManager {
  public chatService: ChatService
  public applicationService: ApplicationService
  public conversationService: ConversationService
  public uploadService: UploadService

  constructor(options: DifyClientOptions) {
    this.chatService = new ChatService(options)
    this.applicationService = new ApplicationService(options)
    this.conversationService = new ConversationService(options)
    this.uploadService = new UploadService(options)
  }

  updateApiToken(apiToken: string) {
    this.chatService.updateApiToken(apiToken)
    this.applicationService.updateApiToken(apiToken)
    this.conversationService.updateApiToken(apiToken)
    this.uploadService.updateApiToken(apiToken)
  }

  updateApplicationId(applicationId: string) {
    this.chatService.updateApplicationId(applicationId)
    this.applicationService.updateApplicationId(applicationId)
    this.conversationService.updateApplicationId(applicationId)
    this.uploadService.updateApplicationId(applicationId)
  }
}

// 创建服务管理器实例的工厂函数
export function createDifyServices(options: DifyClientOptions): DifyServiceManager {
  return new DifyServiceManager(options)
}

// 用于依赖注入的符号
export const DIFY_SERVICES_KEY = Symbol('dify-services')