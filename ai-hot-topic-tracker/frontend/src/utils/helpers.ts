/**
 * 工具函数集合
 */

// 生成唯一ID的函数 - 使用时间戳 + 计数器 + 随机数确保唯一性
let idCounter = 0
export const generateUniqueId = (): string => {
  const timestamp = Date.now()
  const counter = ++idCounter
  const random = Math.random().toString(36).substr(2, 5)
  return `${timestamp}-${counter}-${random}`
}

// 重置ID计数器（用于测试或特殊情况）
export const resetIdCounter = (): void => {
  idCounter = 0
}

// 格式化时间显示
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 格式化消息内容（支持Markdown样式）
export const formatMessage = (content: string): string => {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    .replace(/\n/g, '<br>')
}

// 防抖函数
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: number
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// 节流函数
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// 检查字符串是否为空（包括空格）
export const isEmpty = (str: string): boolean => {
  return !str || str.trim().length === 0
}

// 安全的JSON解析
export const safeJsonParse = <T = any>(str: string, fallback: T): T => {
  try {
    return JSON.parse(str)
  } catch {
    return fallback
  }
}

// 延迟函数
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 重试函数
export const retry = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  try {
    return await fn()
  } catch (error) {
    if (retries > 0) {
      await delay(delayMs)
      return retry(fn, retries - 1, delayMs)
    }
    throw error
  }
}
