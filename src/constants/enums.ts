// 系统枚举定义

export enum UserRole {
  HUMAN = 'human',
  AI = 'ai',
  SYSTEM = 'system'
}

export enum ApplicationMode {
  CONVERSATION = 'conversation', 
  COMPLETION = 'completion',
  WORKFLOW_MODE = 'workflow'
}

export enum DifyAppMode {
  WORKFLOW = 'workflow',           // 工作流
  ADVANCED_CHAT = 'advanced-chat', // Chatflow
  CHAT = 'chat',                   // 聊天助手
  AGENT_CHAT = 'agent-chat',       // Agent
  COMPLETION = 'completion'        // 文本生成
}

export enum ApplicationStatus {
  ENABLED = 'enabled',
  DISABLED = 'disabled'
}

export enum ChatStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DELETED = 'deleted'
}

export enum FeedbackRating {
  POSITIVE = 'positive',
  NEGATIVE = 'negative'
}

export enum NodeStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum MediaType {
  IMAGE = 'image',
  AUDIO = 'audio', 
  VIDEO = 'video',
  DOCUMENT = 'document',
  TEXT = 'text'
}

export enum UploadState {
  WAITING = 'waiting',
  UPLOADING = 'uploading',
  DONE = 'done',
  ERROR = 'error'
}

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export enum StreamEventType {
  CHAT_MESSAGE = 'chat_message',
  MESSAGE_COMPLETE = 'message_complete', 
  MESSAGE_UPDATE = 'message_update',
  SYSTEM_ERROR = 'system_error',
  HEARTBEAT = 'heartbeat',
  WORKFLOW_START = 'workflow_start',
  WORKFLOW_END = 'workflow_end',
  NODE_EXECUTION_START = 'node_execution_start',
  NODE_EXECUTION_END = 'node_execution_end'
}