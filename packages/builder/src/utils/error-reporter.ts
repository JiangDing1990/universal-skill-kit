/**
 * 错误报告工具
 * 提供友好的错误信息和诊断建议
 */

import type { Platform } from '../types/config'

/**
 * 错误级别
 */
export enum ErrorLevel {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

/**
 * 错误报告
 */
export interface ErrorReport {
  /** 错误级别 */
  level: ErrorLevel
  /** 错误消息 */
  message: string
  /** 错误代码 */
  code?: string
  /** 文件路径 */
  file?: string
  /** 行号 */
  line?: number
  /** 列号 */
  column?: number
  /** 堆栈跟踪 */
  stack?: string
  /** 建议 */
  suggestions?: string[]
  /** 相关文档链接 */
  docs?: string
}

/**
 * 错误报告器
 */
export class ErrorReporter {
  private reports: ErrorReport[] = []

  /**
   * 添加错误报告
   */
  addError(message: string, options: Partial<ErrorReport> = {}): void {
    this.reports.push({
      level: ErrorLevel.ERROR,
      message,
      ...options
    })
  }

  /**
   * 添加警告
   */
  addWarning(message: string, options: Partial<ErrorReport> = {}): void {
    this.reports.push({
      level: ErrorLevel.WARNING,
      message,
      ...options
    })
  }

  /**
   * 添加信息
   */
  addInfo(message: string, options: Partial<ErrorReport> = {}): void {
    this.reports.push({
      level: ErrorLevel.INFO,
      message,
      ...options
    })
  }

  /**
   * 从错误对象创建报告
   */
  fromError(error: Error, platform?: Platform): void {
    const report: ErrorReport = {
      level: ErrorLevel.ERROR,
      message: error.message,
      stack: error.stack
    }

    // 根据错误类型提供建议
    if (
      error.message.includes('不存在') ||
      error.message.includes('not found')
    ) {
      report.code = 'FILE_NOT_FOUND'
      report.suggestions = [
        '检查文件路径是否正确',
        '确认文件是否存在于配置的source目录中',
        '检查配置文件中的路径设置'
      ]
    } else if (error.message.includes('模板渲染失败')) {
      report.code = 'TEMPLATE_RENDER_ERROR'
      report.suggestions = [
        '检查模板语法是否正确',
        '确认所有变量都已定义',
        '查看模板引擎文档了解正确的语法'
      ]
      report.docs = 'https://handlebarsjs.com/guide/'
    } else if (error.message.includes('配置验证失败')) {
      report.code = 'CONFIG_VALIDATION_ERROR'
      report.suggestions = [
        '检查配置文件格式是否正确',
        '确认所有必需字段都已填写',
        '参考配置文件示例进行修正'
      ]
    } else if (error.message.includes('缓存')) {
      report.code = 'CACHE_ERROR'
      report.suggestions = [
        '尝试清空缓存: usk cache clean --force',
        '检查缓存目录权限',
        '使用 --force 选项忽略缓存'
      ]
    }

    if (platform) {
      report.message = `[${platform}] ${report.message}`
    }

    this.reports.push(report)
  }

  /**
   * 获取所有报告
   */
  getReports(): ErrorReport[] {
    return [...this.reports]
  }

  /**
   * 获取错误数量
   */
  getErrorCount(): number {
    return this.reports.filter(r => r.level === ErrorLevel.ERROR).length
  }

  /**
   * 获取警告数量
   */
  getWarningCount(): number {
    return this.reports.filter(r => r.level === ErrorLevel.WARNING).length
  }

  /**
   * 是否有错误
   */
  hasErrors(): boolean {
    return this.getErrorCount() > 0
  }

  /**
   * 清空报告
   */
  clear(): void {
    this.reports = []
  }

  /**
   * 格式化报告为字符串
   */
  format(options: { verbose?: boolean; colors?: boolean } = {}): string {
    const { verbose = false, colors = true } = options
    const lines: string[] = []

    // 按级别分组
    const errors = this.reports.filter(r => r.level === ErrorLevel.ERROR)
    const warnings = this.reports.filter(r => r.level === ErrorLevel.WARNING)
    const infos = this.reports.filter(r => r.level === ErrorLevel.INFO)

    // 输出错误
    if (errors.length > 0) {
      lines.push(
        colors
          ? '\n\x1b[31m✖ 错误 (' + errors.length + ')\x1b[0m\n'
          : `\n✖ 错误 (${errors.length})\n`
      )
      for (const report of errors) {
        lines.push(this.formatReport(report, { verbose, colors }))
      }
    }

    // 输出警告
    if (warnings.length > 0) {
      lines.push(
        colors
          ? '\n\x1b[33m⚠ 警告 (' + warnings.length + ')\x1b[0m\n'
          : `\n⚠ 警告 (${warnings.length})\n`
      )
      for (const report of warnings) {
        lines.push(this.formatReport(report, { verbose, colors }))
      }
    }

    // 输出信息
    if (verbose && infos.length > 0) {
      lines.push(
        colors
          ? '\n\x1b[36mℹ 信息 (' + infos.length + ')\x1b[0m\n'
          : `\nℹ 信息 (${infos.length})\n`
      )
      for (const report of infos) {
        lines.push(this.formatReport(report, { verbose, colors }))
      }
    }

    return lines.join('\n')
  }

  /**
   * 格式化单个报告
   */
  private formatReport(
    report: ErrorReport,
    options: { verbose?: boolean; colors?: boolean } = {}
  ): string {
    const { verbose = false, colors = true } = options
    const lines: string[] = []

    // 消息
    let message = report.message
    if (report.code) {
      message = `[${report.code}] ${message}`
    }
    if (report.file) {
      message += ` (${report.file}`
      if (report.line) {
        message += `:${report.line}`
        if (report.column) {
          message += `:${report.column}`
        }
      }
      message += ')'
    }
    lines.push(`  ${message}`)

    // 建议
    if (report.suggestions && report.suggestions.length > 0) {
      lines.push('')
      lines.push(colors ? '  \x1b[36m💡 建议:\x1b[0m' : '  💡 建议:')
      for (const suggestion of report.suggestions) {
        lines.push(`    • ${suggestion}`)
      }
    }

    // 文档链接
    if (report.docs) {
      lines.push('')
      lines.push(
        colors
          ? '  \x1b[36m📖 文档:\x1b[0m ' + report.docs
          : `  📖 文档: ${report.docs}`
      )
    }

    // 堆栈跟踪
    if (verbose && report.stack) {
      lines.push('')
      lines.push(
        colors ? '  \x1b[90m' + report.stack + '\x1b[0m' : `  ${report.stack}`
      )
    }

    lines.push('')

    return lines.join('\n')
  }

  /**
   * 输出到控制台
   */
  print(options: { verbose?: boolean; colors?: boolean } = {}): void {
    const output = this.format(options)
    if (output) {
      console.log(output)
    }
  }
}

/**
 * 创建错误报告器
 */
export function createErrorReporter(): ErrorReporter {
  return new ErrorReporter()
}
