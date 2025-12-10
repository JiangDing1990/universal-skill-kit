/**
 * Plugin system types
 * 简化的插件系统，基于生命周期钩子
 */

import type { ResolvedConfig, Platform } from './config'
import type { BuildOptions, BuildResult, PlatformBuildResult } from './builder'
import type { TemplateContext } from './template'

/**
 * 插件上下文
 */
export interface PluginContext {
  /** 配置对象 */
  config: ResolvedConfig
  /** 构建选项 */
  options: BuildOptions
  /** 当前平台 */
  platform?: Platform
}

/**
 * 插件钩子
 */
export interface PluginHooks {
  /**
   * 构建开始前
   * @param context 插件上下文
   */
  onBuildStart?(context: PluginContext): void | Promise<void>

  /**
   * 构建结束后
   * @param context 插件上下文
   * @param result 构建结果
   */
  onBuildEnd?(context: PluginContext, result: BuildResult): void | Promise<void>

  /**
   * 平台构建开始前
   * @param context 插件上下文
   */
  onPlatformBuildStart?(context: PluginContext): void | Promise<void>

  /**
   * 平台构建结束后
   * @param context 插件上下文
   * @param result 平台构建结果
   */
  onPlatformBuildEnd?(
    context: PluginContext,
    result: PlatformBuildResult
  ): void | Promise<void>

  /**
   * 模板渲染前
   * @param context 插件上下文
   * @param templateContext 模板上下文
   * @returns 修改后的模板上下文（可选）
   */
  onTemplateRender?(
    context: PluginContext,
    templateContext: TemplateContext
  ): TemplateContext | void | Promise<TemplateContext | void>

  /**
   * 模板渲染后
   * @param context 插件上下文
   * @param content 渲染后的内容
   * @returns 修改后的内容（可选）
   */
  onTemplateRendered?(
    context: PluginContext,
    content: string
  ): string | void | Promise<string | void>

  /**
   * 资源文件复制前
   * @param context 插件上下文
   * @param files 要复制的文件列表
   * @returns 修改后的文件列表（可选）
   */
  onResourceCopy?(
    context: PluginContext,
    files: string[]
  ): string[] | void | Promise<string[] | void>

  /**
   * 清理输出目录前
   * @param context 插件上下文
   */
  onClean?(context: PluginContext): void | Promise<void>

  /**
   * 错误发生时
   * @param context 插件上下文
   * @param error 错误对象
   */
  onError?(context: PluginContext, error: Error): void | Promise<void>
}

/**
 * 插件定义
 */
export interface Plugin extends PluginHooks {
  /** 插件名称 */
  name: string

  /** 插件版本 */
  version?: string

  /** 插件描述 */
  description?: string

  /**
   * 插件初始化（可选）
   * 在插件注册时调用一次
   */
  init?(): void | Promise<void>

  /**
   * 插件清理（可选）
   * 在构建完成后调用
   */
  cleanup?(): void | Promise<void>
}

/**
 * 插件配置
 */
export interface PluginConfig {
  /** 插件实例或插件工厂函数 */
  plugin: Plugin | (() => Plugin) | (() => Promise<Plugin>)

  /** 插件选项 */
  options?: Record<string, any>

  /** 是否启用 */
  enabled?: boolean
}

/**
 * 插件管理器选项
 */
export interface PluginManagerOptions {
  /** 插件列表 */
  plugins?: PluginConfig[]

  /** 是否允许异步钩子 */
  allowAsync?: boolean

  /** 钩子执行超时（毫秒） */
  timeout?: number
}

/**
 * 插件钩子耗时数据
 */
export interface PluginHookMetric {
  /** 钩子名称 */
  hook: keyof PluginHooks
  /** 调用次数 */
  calls: number
  /** 总耗时（毫秒） */
  totalDuration: number
  /** 平均耗时（毫秒） */
  averageDuration: number
  /** 单次最大耗时（毫秒） */
  maxDuration: number
  /** 失败次数 */
  failures: number
}

/**
 * 插件指标汇总
 */
export interface PluginMetricSummary {
  /** 插件名称 */
  name: string
  /** 总耗时（毫秒） */
  totalDuration: number
  /** 各钩子耗时 */
  hooks: PluginHookMetric[]
}
