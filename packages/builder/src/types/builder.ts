/**
 * Builder types
 */

import type { Platform } from './config'
import type { CacheStats } from './cache'
import type { PluginMetricSummary } from './plugin'

/**
 * 构建选项
 */
export interface BuildOptions {
  /**
   * 是否清理输出目录
   */
  clean?: boolean

  /**
   * 是否生成sourcemap
   */
  sourcemap?: boolean

  /**
   * 是否压缩
   */
  minify?: boolean

  /**
   * 详细输出
   */
  verbose?: boolean

  /**
   * 强制重新构建（忽略缓存）
   */
  force?: boolean

  /**
   * 监听模式
   */
  watch?: boolean

  /**
   * 并发构建数量限制
   * @default 5
   */
  concurrency?: number
}

/**
 * 平台构建结果
 */
export interface PlatformBuildResult {
  /**
   * 平台名称
   */
  platform: Platform

  /**
   * 是否成功
   */
  success: boolean

  /**
   * 输出路径
   */
  outputPath: string

  /**
   * 输出大小（字节）
   */
  size: number

  /**
   * 构建时长（毫秒）
   */
  duration: number

  /**
   * 错误信息
   */
  error?: Error

  /**
   * 警告信息
   */
  warnings?: string[]
}

/**
 * 构建结果
 */
export interface BuildResult {
  /**
   * 是否全部成功
   */
  success: boolean

  /**
   * 各平台构建结果
   */
  platforms: PlatformBuildResult[]

  /**
   * 总构建时长（毫秒）
   */
  duration: number

  /**
   * 错误列表
   */
  errors?: Error[]

  /**
   * 警告列表
   */
  warnings?: string[]

  /**
   * 构建指标
   */
  metrics?: BuildMetrics
}

/**
 * 资源文件信息
 */
export interface ResourceFile {
  /**
   * 源路径
   */
  source: string

  /**
   * 目标路径
   */
  destination: string

  /**
   * 文件类型
   */
  type: 'template' | 'script' | 'resource'
}

/**
 * 构建统计信息
 */
export interface BuildStatistics {
  /**
   * 渲染的模板数量
   */
  templatesRendered: number

  /**
   * 复制的文件数量
   */
  filesCopied: number

  /**
   * 压缩的描述数量
   */
  descriptionsCompressed: number

  /**
   * 总输出大小（字节）
   */
  totalSize: number
}

/**
 * 构建指标
 */
export interface BuildMetrics {
  /**
   * 统计信息
   */
  statistics: BuildStatistics

  /**
   * 缓存统计
   */
  cache?: CacheStats

  /**
   * 插件耗时统计
   */
  plugins?: PluginMetricSummary[]
}
