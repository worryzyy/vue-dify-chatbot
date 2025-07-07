import type { FeedbackRating, NodeStatus, UserRole } from '@/constants/enums';

export interface ChatMessage {
  messageId: string;
  content: string;
  role: UserRole;
  createdAt: number;
  conversationId?: string;
  attachments?: MessageAttachment[];
  metadata?: Record<string, any>;
  userFeedback?: MessageFeedback;
  workflowData?: WorkflowExecutionData;
}

export interface MessageAttachment {
  attachmentId: string;
  filename: string;
  mimeType: string;
  fileSize: number;
  downloadUrl: string;
}

export interface MessageFeedback {
  messageId: string;
  rating: FeedbackRating;
  comment?: string;
}

export interface WorkflowExecutionData {
  nodeId: string;
  nodeName: string;
  executionStatus: NodeStatus;
  executionLogs?: WorkflowExecutionLog[];
}

export interface WorkflowExecutionLog {
  timestamp: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
}

export interface SendMessageRequest {
  content: string;
  conversationId?: string;
  attachments?: File[];
  userId?: string;
  inputVariables?: Record<string, any>;
}

export interface SendMessageResponse {
  messageId: string;
  content: string;
  conversationId: string;
  responseId: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface MessageHistoryResponse {
  messages: ChatMessage[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
}
