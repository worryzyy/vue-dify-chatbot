export * from './application';
export * from './auth';
export * from './chat';
export * from './conversation';
export * from './upload';
export * from './dify-app';

export interface ApiResponse<T = any> {
  statusCode: number;
  message: string;
  data: T;
  success: boolean;
}

export interface ApiError {
  statusCode: number;
  message: string;
  details?: Record<string, any>;
}

export interface PaginationRequest {
  page?: number;
  pageSize?: number;
}

export interface BaseApiResponse {
  result: 'success' | 'failure';
  message?: string;
}

export interface StreamMessage {
  eventType: string;
  data: any;
  messageId?: string;
  retryDelay?: number;
}
