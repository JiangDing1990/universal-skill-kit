/**
 * Plugin Manager
 * 管理插件的注册和生命周期钩子执行
 */

import { performance } from 'node:perf_hooks'
import type {
  Plugin,
  PluginContext,
  PluginManagerOptions,
  PluginHooks,
  PluginMetricSummary
} from '../types/plugin'
import type { BuildResult, PlatformBuildResult } from '../types/builder'
import type { TemplateContext } from '../types/template'

interface HookRuntimeMetric {
  totalDuration: number
  maxDuration: number
  calls: number
  failures: number
}

/**
 * 插件管理器
 */
export class PluginManager {
  private plugins: Plugin[] = []
  private options: Required<PluginManagerOptions>
  private metrics: Map<string, Map<string, HookRuntimeMetric>> = new Map()

  constructor(options: PluginManagerOptions = {}) {
    this.options = {
      plugins: options.plugins || [],
      allowAsync: options.allowAsync ?? true,
      timeout: options.timeout || 30000 // 30秒
    }
  }

  /**
   * 初始化插件管理器
   */
  async initialize(): Promise<void> {
    for (const pluginConfig of this.options.plugins) {
      if (pluginConfig.enabled === false) {
        continue
      }

      let plugin: Plugin

      if (typeof pluginConfig.plugin === 'function') {
        plugin = await pluginConfig.plugin()
      } else {
        plugin = pluginConfig.plugin
      }

      // 初始化插件
      if (plugin.init) {
        await plugin.init()
      }

      this.plugins.push(plugin)
    }
  }

  /**
   * 注册插件
   */
  register(plugin: Plugin): void {
    this.plugins.push(plugin)
  }

  /**
   * 获取所有插件
   */
  getPlugins(): Plugin[] {
    return [...this.plugins]
  }

  /**
   * 记录钩子执行数据
   */
  private recordHookMetric(
    plugin: Plugin,
    hookName: keyof PluginHooks,
    duration: number,
    failed: boolean
  ): void {
    const pluginName = plugin.name || 'anonymous-plugin'
    const hookKey = String(hookName)

    if (!this.metrics.has(pluginName)) {
      this.metrics.set(pluginName, new Map())
    }

    const pluginMetrics = this.metrics.get(pluginName)!

    if (!pluginMetrics.has(hookKey)) {
      pluginMetrics.set(hookKey, {
        totalDuration: 0,
        maxDuration: 0,
        calls: 0,
        failures: 0
      })
    }

    const hookMetric = pluginMetrics.get(hookKey)!
    hookMetric.totalDuration += duration
    hookMetric.calls += 1
    hookMetric.maxDuration = Math.max(hookMetric.maxDuration, duration)
    if (failed) {
      hookMetric.failures += 1
    }
  }

  /**
   * 获取插件指标
   */
  getMetrics(): PluginMetricSummary[] {
    const summaries: PluginMetricSummary[] = []

    for (const [pluginName, hookMetrics] of this.metrics.entries()) {
      let totalDuration = 0
      const hooks = Array.from(hookMetrics.entries()).map(
        ([hookName, metric]) => {
          totalDuration += metric.totalDuration
          return {
            hook: hookName as keyof PluginHooks,
            calls: metric.calls,
            totalDuration: metric.totalDuration,
            averageDuration:
              metric.calls > 0 ? metric.totalDuration / metric.calls : 0,
            maxDuration: metric.maxDuration,
            failures: metric.failures
          }
        }
      )

      hooks.sort((a, b) => b.totalDuration - a.totalDuration)

      summaries.push({
        name: pluginName,
        totalDuration,
        hooks
      })
    }

    summaries.sort((a, b) => b.totalDuration - a.totalDuration)

    return summaries
  }

  /**
   * 重置指标
   */
  resetMetrics(): void {
    this.metrics.clear()
  }

  /**
   * 执行单个钩子并记录耗时
   */
  private async invokeHook<T>(
    plugin: Plugin,
    hookName: keyof PluginHooks,
    handler: () => Promise<T> | T
  ): Promise<T | undefined> {
    const start = performance.now()
    let failed = false
    let timeoutId: NodeJS.Timeout | undefined
    const timeoutMessage = `Plugin ${plugin.name} hook ${String(hookName)} timeout`

    try {
      if (this.options.allowAsync) {
        const timeoutPromise = new Promise<T>((_, reject) => {
          timeoutId = setTimeout(
            () => reject(new Error(timeoutMessage)),
            this.options.timeout
          )
        })
        const result = await Promise.race([
          Promise.resolve(handler()),
          timeoutPromise
        ])
        return result
      }

      return await Promise.resolve(handler())
    } catch (error) {
      failed = true
      console.error(
        `Error in plugin ${plugin.name} hook ${String(hookName)}:`,
        error
      )
      return undefined
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      const duration = performance.now() - start
      this.recordHookMetric(plugin, hookName, duration, failed)
    }
  }

  /**
   * 执行钩子
   */
  private async runHook<K extends keyof PluginHooks>(
    hookName: K,
    ...args: Parameters<NonNullable<PluginHooks[K]>>
  ): Promise<void> {
    for (const plugin of this.plugins) {
      const hook = plugin[hookName]
      if (!hook) continue

      await this.invokeHook(plugin, hookName, () =>
        // @ts-expect-error - 类型系统无法正确推断
        hook.apply(plugin, args)
      )
    }
  }

  /**
   * 执行转换钩子（可以修改数据）
   */
  private async runTransformHook<T>(
    hookName: keyof PluginHooks,
    context: PluginContext,
    initialValue: T
  ): Promise<T> {
    let value: any = initialValue

    for (const plugin of this.plugins) {
      const hook = plugin[hookName]
      if (!hook) continue

      const result = await this.invokeHook(plugin, hookName, () =>
        // @ts-expect-error - 类型系统无法正确推断
        hook.call(plugin, context, value)
      )

      if (result !== undefined && result !== null) {
        value = result as T
      }
    }

    return value as T
  }

  /**
   * 构建开始
   */
  async onBuildStart(context: PluginContext): Promise<void> {
    await this.runHook('onBuildStart', context)
  }

  /**
   * 构建结束
   */
  async onBuildEnd(context: PluginContext, result: BuildResult): Promise<void> {
    await this.runHook('onBuildEnd', context, result)
  }

  /**
   * 平台构建开始
   */
  async onPlatformBuildStart(context: PluginContext): Promise<void> {
    await this.runHook('onPlatformBuildStart', context)
  }

  /**
   * 平台构建结束
   */
  async onPlatformBuildEnd(
    context: PluginContext,
    result: PlatformBuildResult
  ): Promise<void> {
    await this.runHook('onPlatformBuildEnd', context, result)
  }

  /**
   * 模板渲染前
   */
  async onTemplateRender(
    context: PluginContext,
    templateContext: TemplateContext
  ): Promise<TemplateContext> {
    return this.runTransformHook(
      'onTemplateRender',
      context,
      templateContext
    ) as Promise<TemplateContext>
  }

  /**
   * 模板渲染后
   */
  async onTemplateRendered(
    context: PluginContext,
    content: string
  ): Promise<string> {
    return this.runTransformHook(
      'onTemplateRendered',
      context,
      content
    ) as Promise<string>
  }

  /**
   * 资源文件复制前
   */
  async onResourceCopy(
    context: PluginContext,
    files: string[]
  ): Promise<string[]> {
    return this.runTransformHook('onResourceCopy', context, files) as Promise<
      string[]
    >
  }

  /**
   * 清理输出目录前
   */
  async onClean(context: PluginContext): Promise<void> {
    await this.runHook('onClean', context)
  }

  /**
   * 错误发生时
   */
  async onError(context: PluginContext, error: Error): Promise<void> {
    await this.runHook('onError', context, error)
  }

  /**
   * 清理所有插件
   */
  async cleanup(): Promise<void> {
    for (const plugin of this.plugins) {
      if (plugin.cleanup) {
        try {
          await plugin.cleanup()
        } catch (error) {
          console.error(`Error cleaning up plugin ${plugin.name}:`, error)
        }
      }
    }
  }
}

/**
 * 创建插件管理器
 */
export function createPluginManager(
  options?: PluginManagerOptions
): PluginManager {
  return new PluginManager(options)
}
