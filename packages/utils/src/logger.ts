/**
 * Logger Utility
 * 日志工具 - 统一的日志输出管理
 */

/**
 * Log levels
 * 日志级别
 */
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4
}

/**
 * Logger configuration
 * 日志配置
 */
export interface LoggerConfig {
  level: LogLevel
  prefix?: string
  timestamp?: boolean
  colors?: boolean
}

/**
 * Default logger configuration
 * 默认日志配置
 */
const DEFAULT_CONFIG: LoggerConfig = {
  level: LogLevel.INFO,
  prefix: '',
  timestamp: false,
  colors: true
}

/**
 * Logger class
 * 日志记录器
 */
export class Logger {
  private config: LoggerConfig
  private static instance: Logger | null = null

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Get singleton instance
   * 获取单例实例
   */
  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  /**
   * Set log level
   * 设置日志级别
   */
  setLevel(level: LogLevel): void {
    this.config.level = level
  }

  /**
   * Set verbose mode
   * 设置详细模式
   */
  setVerbose(verbose: boolean): void {
    this.config.level = verbose ? LogLevel.DEBUG : LogLevel.INFO
  }

  /**
   * Check if level is enabled
   * 检查日志级别是否启用
   */
  private isLevelEnabled(level: LogLevel): boolean {
    return level <= this.config.level
  }

  /**
   * Format message
   * 格式化消息
   */
  private formatMessage(level: string, message: string): string {
    const parts: string[] = []

    if (this.config.timestamp) {
      parts.push(`[${new Date().toISOString()}]`)
    }

    if (this.config.prefix) {
      parts.push(`[${this.config.prefix}]`)
    }

    parts.push(`[${level}]`)
    parts.push(message)

    return parts.join(' ')
  }

  /**
   * Error log
   * 错误日志
   */
  error(message: string, ...args: unknown[]): void {
    if (this.isLevelEnabled(LogLevel.ERROR)) {
      console.error(this.formatMessage('ERROR', message), ...args)
    }
  }

  /**
   * Warning log
   * 警告日志
   */
  warn(message: string, ...args: unknown[]): void {
    if (this.isLevelEnabled(LogLevel.WARN)) {
      console.warn(this.formatMessage('WARN', message), ...args)
    }
  }

  /**
   * Info log
   * 信息日志
   */
  info(message: string, ...args: unknown[]): void {
    if (this.isLevelEnabled(LogLevel.INFO)) {
      console.log(this.formatMessage('INFO', message), ...args)
    }
  }

  /**
   * Debug log
   * 调试日志
   */
  debug(message: string, ...args: unknown[]): void {
    if (this.isLevelEnabled(LogLevel.DEBUG)) {
      console.log(this.formatMessage('DEBUG', message), ...args)
    }
  }

  /**
   * Trace log
   * 追踪日志
   */
  trace(message: string, ...args: unknown[]): void {
    if (this.isLevelEnabled(LogLevel.TRACE)) {
      console.log(this.formatMessage('TRACE', message), ...args)
    }
  }

  /**
   * Success log (always shown)
   * 成功日志（总是显示）
   */
  success(message: string, ...args: unknown[]): void {
    console.log(this.formatMessage('SUCCESS', message), ...args)
  }
}

/**
 * Create a new logger instance
 * 创建新的日志实例
 */
export function createLogger(config?: Partial<LoggerConfig>): Logger {
  return new Logger(config)
}

/**
 * Get default logger instance
 * 获取默认日志实例
 */
export function getLogger(): Logger {
  return Logger.getInstance()
}
