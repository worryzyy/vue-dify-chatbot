// Application constants

// Environment variables
export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
  APP_TITLE: import.meta.env.VITE_APP_TITLE || 'Dify Chat',
  APP_DESCRIPTION: import.meta.env.VITE_APP_DESCRIPTION || 'A powerful AI chat application',
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  DEBUG: import.meta.env.DEV,
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0'
} as const

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  
  // Apps
  APPS: '/apps',
  APP_INFO: (appId: string) => `/external/dify/${appId}/info`,
  APP_META: (appId: string) => `/external/dify/${appId}/meta`,
  APP_SITE: (appId: string) => `/external/dify/${appId}/site`,
  APP_PARAMETERS: (appId: string) => `/external/dify/${appId}/parameters`,
  
  // Chat
  CHAT_MESSAGES: (appId: string) => `/external/dify/${appId}/chat-messages`,
  STOP_MESSAGE: (appId: string, taskId: string) => `/external/dify/${appId}/chat-messages/${taskId}/stop`,
  MESSAGE_FEEDBACK: (appId: string) => `/external/dify/${appId}/feedback`,
  SUGGESTED_QUESTIONS: (appId: string, messageId: string) => `/external/dify/${appId}/messages/${messageId}/suggested`,
  
  // Conversations
  CONVERSATIONS: (appId: string) => `/external/dify/${appId}/conversations`,
  CONVERSATION: (appId: string, conversationId: string) => `/external/dify/${appId}/conversation/${conversationId}`,
  CONVERSATION_MESSAGES: (appId: string, conversationId: string) => `/external/dify/${appId}/conversation/${conversationId}/messages`,
  CONVERSATION_RENAME: (appId: string, conversationId: string) => `/external/dify/${appId}/conversation/${conversationId}/name`,
  
  // Files
  FILE_UPLOAD: (appId: string) => `/external/dify/${appId}/files/upload`,
  AUDIO_TO_TEXT: (appId: string) => `/external/dify/${appId}/audio2text`,
  TEXT_TO_AUDIO: (appId: string) => `/external/dify/${appId}/text2audio`,
  
  // Workflows
  WORKFLOW_RUN: (appId: string) => `/external/dify/${appId}/workflows/run`
} as const

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_INFO: 'user_info',
  CURRENT_APP: 'current_app',
  RUNNING_MODE: 'running_mode',
  THEME_CONFIG: 'theme_config',
  APP_LIST: 'app_list',
  CONVERSATION_LIST: 'conversation_list',
  CHAT_MESSAGES: 'chat_messages',
  USER_PREFERENCES: 'user_preferences'
} as const

// Message roles
export const MESSAGE_ROLES = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system'
} as const

// App modes
export const APP_MODES = {
  CHAT: 'chat',
  COMPLETION: 'completion',
  WORKFLOW: 'workflow'
} as const

// Running modes
export const RUNNING_MODES = {
  SINGLE: 'single',
  MULTI: 'multi'
} as const

// Theme modes
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
} as const

// Color schemes
export const COLOR_SCHEMES = {
  BLUE: 'blue',
  GREEN: 'green',
  PURPLE: 'purple',
  ORANGE: 'orange'
} as const

// Font sizes
export const FONT_SIZES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large'
} as const

// Border radius options
export const BORDER_RADIUS = {
  NONE: 'none',
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large'
} as const

// Message status
export const MESSAGE_STATUS = {
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  FAILED: 'failed'
} as const

// File upload status
export const UPLOAD_STATUS = {
  PENDING: 'pending',
  UPLOADING: 'uploading',
  SUCCESS: 'success',
  ERROR: 'error'
} as const

// Conversation status
export const CONVERSATION_STATUS = {
  ACTIVE: 'active',
  ARCHIVED: 'archived'
} as const

// Feedback types
export const FEEDBACK_TYPES = {
  LIKE: 'like',
  DISLIKE: 'dislike'
} as const

// Event types for SSE
export const EVENT_TYPES = {
  MESSAGE: 'message',
  MESSAGE_END: 'message_end',
  MESSAGE_REPLACE: 'message_replace',
  ERROR: 'error',
  PING: 'ping',
  WORKFLOW_STARTED: 'workflow_started',
  WORKFLOW_FINISHED: 'workflow_finished',
  NODE_STARTED: 'node_started',
  NODE_FINISHED: 'node_finished'
} as const

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
} as const

// File type constants
export const FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/webm'],
  VIDEO: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'],
  DOCUMENT: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ],
  TEXT: ['text/plain', 'text/markdown', 'text/csv', 'application/json']
} as const

// File size limits (in MB)
export const FILE_SIZE_LIMITS = {
  IMAGE: 10,
  AUDIO: 50,
  VIDEO: 100,
  DOCUMENT: 25,
  TEXT: 5,
  DEFAULT: 10
} as const

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1
} as const

// Request timeouts (in milliseconds)
export const TIMEOUTS = {
  DEFAULT: 30000, // 30 seconds
  UPLOAD: 300000, // 5 minutes
  STREAM: 0, // No timeout for streaming
  SHORT: 10000 // 10 seconds
} as const

// Retry configuration
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_DELAY: 1000, // 1 second
  MAX_DELAY: 10000, // 10 seconds
  BACKOFF_FACTOR: 2
} as const

// WebSocket event types
export const WS_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  MESSAGE: 'message',
  ERROR: 'error',
  RECONNECT: 'reconnect'
} as const

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  SEND_MESSAGE: 'Enter',
  SEND_MESSAGE_WITH_SHIFT: 'Shift+Enter',
  NEW_CONVERSATION: 'Ctrl+N',
  TOGGLE_SIDEBAR: 'Ctrl+B',
  SEARCH: 'Ctrl+K',
  TOGGLE_THEME: 'Ctrl+Shift+T'
} as const

// Animation durations (in milliseconds)
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
} as const

// Breakpoints for responsive design
export const BREAKPOINTS = {
  XS: '480px',
  SM: '576px',
  MD: '768px',
  LG: '992px',
  XL: '1200px',
  XXL: '1400px'
} as const

// Z-index values
export const Z_INDEX = {
  DROPDOWN: 1000,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080,
  LOADING: 1090
} as const

// Regular expressions
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/.+$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
} as const

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'An internal server error occurred.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  INVALID_FILE_TYPE: 'This file type is not supported.',
  UPLOAD_FAILED: 'File upload failed. Please try again.',
  SEND_MESSAGE_FAILED: 'Failed to send message. Please try again.',
  LOAD_CONVERSATION_FAILED: 'Failed to load conversation.',
  GENERIC_ERROR: 'An unexpected error occurred.'
} as const

// Success messages
export const SUCCESS_MESSAGES = {
  MESSAGE_SENT: 'Message sent successfully',
  FILE_UPLOADED: 'File uploaded successfully',
  CONVERSATION_CREATED: 'New conversation created',
  CONVERSATION_DELETED: 'Conversation deleted',
  CONVERSATION_RENAMED: 'Conversation renamed',
  SETTINGS_SAVED: 'Settings saved successfully',
  FEEDBACK_SUBMITTED: 'Feedback submitted successfully'
} as const

// Default values
export const DEFAULTS = {
  APP_NAME: 'Untitled App',
  CONVERSATION_NAME: 'New Conversation',
  USER_NAME: 'Guest',
  AVATAR_SEED: 'default',
  THEME: THEME_MODES.AUTO,
  COLOR_SCHEME: COLOR_SCHEMES.BLUE,
  FONT_SIZE: FONT_SIZES.MEDIUM,
  BORDER_RADIUS: BORDER_RADIUS.MEDIUM,
  LANGUAGE: 'en',
  TIMEZONE: Intl.DateTimeFormat().resolvedOptions().timeZone
} as const

// Feature flags
export const FEATURES = {
  ENABLE_VOICE_INPUT: true,
  ENABLE_FILE_UPLOAD: true,
  ENABLE_CONVERSATION_HISTORY: true,
  ENABLE_FEEDBACK: true,
  ENABLE_SUGGESTED_QUESTIONS: true,
  ENABLE_WORKFLOW: true,
  ENABLE_MULTI_APP: true,
  ENABLE_THEME_CUSTOMIZATION: true,
  ENABLE_KEYBOARD_SHORTCUTS: true
} as const

// Rate limiting
export const RATE_LIMITS = {
  MESSAGES_PER_MINUTE: 30,
  FILES_PER_HOUR: 100,
  API_REQUESTS_PER_MINUTE: 300
} as const

// Cache configuration
export const CACHE_CONFIG = {
  APP_INFO_TTL: 5 * 60 * 1000, // 5 minutes
  CONVERSATION_LIST_TTL: 2 * 60 * 1000, // 2 minutes
  MESSAGE_LIST_TTL: 1 * 60 * 1000, // 1 minute
  USER_PREFERENCES_TTL: 24 * 60 * 60 * 1000 // 24 hours
} as const

export default {
  ENV,
  API_ENDPOINTS,
  STORAGE_KEYS,
  MESSAGE_ROLES,
  APP_MODES,
  RUNNING_MODES,
  THEME_MODES,
  COLOR_SCHEMES,
  FONT_SIZES,
  BORDER_RADIUS,
  MESSAGE_STATUS,
  UPLOAD_STATUS,
  CONVERSATION_STATUS,
  FEEDBACK_TYPES,
  EVENT_TYPES,
  HTTP_STATUS,
  FILE_TYPES,
  FILE_SIZE_LIMITS,
  PAGINATION,
  TIMEOUTS,
  RETRY_CONFIG,
  WS_EVENTS,
  KEYBOARD_SHORTCUTS,
  ANIMATION_DURATIONS,
  BREAKPOINTS,
  Z_INDEX,
  REGEX,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  DEFAULTS,
  FEATURES,
  RATE_LIMITS,
  CACHE_CONFIG
}