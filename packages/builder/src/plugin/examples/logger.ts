/**
 * Logger Plugin - 记录构建过程
 * 示例插件：展示如何使用生命周期钩子
 */

import type { Plugin, PluginContext } from '../../types/plugin'
import type { BuildResult, PlatformBuildResult } from '../../types/builder'

/**
 * Logger插件选项
 */
export interface LoggerPluginOptions {
  /** 是否记录详细信息 */
  verbose?: boolean
  /** 日志输出函数 */
  log?: (message: string) => void
}

/**
 * Logger插件
 */
export function loggerPlugin(options: LoggerPluginOptions = {}): Plugin {
  const log = options.log || console.log
  const verbose = options.verbose ?? false

  return {
    name: 'logger',
    version: '1.0.0',
    description: 'Log build process information',

    onBuildStart(context: PluginContext) {
      log(`[Logger] Build started for project: ${context.config.name}`)
      if (verbose) {
        log(`[Logger] Platforms: ${Object.keys(context.config.platforms).join(', ')}`)
      }
    },

    onBuildEnd(_context: PluginContext, result: BuildResult) {
      const status = result.success ? '✓' : '✖'
      log(`[Logger] Build ${status} completed in ${result.duration}ms`)

      if (verbose) {
        for (const platform of result.platforms) {
          const platformStatus = platform.success ? '✓' : '✖'
          log(`[Logger]   ${platformStatus} ${platform.platform}: ${platform.size} bytes (${platform.duration}ms)`)
        }
      }
    },

    onPlatformBuildStart(_context: PluginContext) {
      if (verbose && _context.platform) {
        log(`[Logger] Building platform: ${_context.platform}`)
      }
    },

    onPlatformBuildEnd(_context: PluginContext, result: PlatformBuildResult) {
      if (verbose) {
        const status = result.success ? '✓' : '✖'
        log(`[Logger] Platform ${result.platform} ${status} built (${result.duration}ms)`)
      }
    },

    onError(_context: PluginContext, error: Error) {
      log(`[Logger] ✖ Error: ${error.message}`)
      if (verbose && error.stack) {
        log(`[Logger] Stack: ${error.stack}`)
      }
    }
  }
}
