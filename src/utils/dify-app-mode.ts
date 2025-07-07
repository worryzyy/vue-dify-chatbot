import { DifyAppMode } from '../constants/enums'

/**
 * Dify 应用模式中文名称映射
 */
export const DIFY_APP_MODE_NAMES: Record<DifyAppMode, string> = {
  [DifyAppMode.WORKFLOW]: '工作流',
  [DifyAppMode.ADVANCED_CHAT]: 'Chatflow',
  [DifyAppMode.CHAT]: '聊天助手',
  [DifyAppMode.AGENT_CHAT]: 'Agent',
  [DifyAppMode.COMPLETION]: '文本生成'
}

/**
 * 获取 Dify 应用模式的中文名称
 * @param mode Dify 应用模式
 * @returns 中文名称，如果模式不存在则返回原始值
 */
export function getDifyAppModeName(mode: string): string {
  const difyMode = mode as DifyAppMode
  return DIFY_APP_MODE_NAMES[difyMode] || mode
}

/**
 * 检查是否为有效的 Dify 应用模式
 * @param mode 要检查的模式字符串
 * @returns 是否为有效的 Dify 应用模式
 */
export function isValidDifyAppMode(mode: string): mode is DifyAppMode {
  return Object.values(DifyAppMode).includes(mode as DifyAppMode)
}

/**
 * 获取所有支持的 Dify 应用模式列表
 * @returns Dify 应用模式列表，包含模式值和中文名称
 */
export function getDifyAppModeList(): Array<{ value: DifyAppMode; label: string }> {
  return Object.values(DifyAppMode).map(mode => ({
    value: mode,
    label: DIFY_APP_MODE_NAMES[mode]
  }))
}