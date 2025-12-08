/**
 * Plugin Manager
 * 管理插件的注册和生命周期钩子执行
 */

import type {
  Plugin,
  PluginContext,
  PluginManagerOptions,
  PluginHooks
} from '../types/plugin'
import type { BuildResult, PlatformBuildResult } from '../types/builder'
import type { TemplateContext } from '../types/template'

/**
 * 插件管理器
 */
export class PluginManager {
  private plugins: Plugin[] = []
  private options: Required<PluginManagerOptions>

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
   * 执行钩子
   */
  private async runHook<K extends keyof PluginHooks>(
    hookName: K,
    ...args: Parameters<NonNullable<PluginHooks[K]>>
  ): Promise<void> {
    for (const plugin of this.plugins) {
      const hook = plugin[hookName]
      if (!hook) continue

      try {
        if (this.options.allowAsync) {
          // 异步执行，带超时
          await Promise.race([
            // @ts-ignore - 类型系统无法正确推断
            hook.apply(plugin, args),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error(`Plugin ${plugin.name} hook ${hookName} timeout`)), this.options.timeout)
            )
          ])
        } else {
          // @ts-ignore - 类型系统无法正确推断
          await hook.apply(plugin, args)
        }
      } catch (error) {
        console.error(`Error in plugin ${plugin.name} hook ${hookName}:`, error)
        // 继续执行其他插件
      }
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

      try {
        // @ts-ignore - 类型系统无法正确推断
        const result = await hook.call(plugin, context, value)
        if (result !== undefined && result !== null) {
          value = result
        }
      } catch (error) {
        console.error(`Error in plugin ${plugin.name} hook ${hookName}:`, error)
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
  async onPlatformBuildEnd(context: PluginContext, result: PlatformBuildResult): Promise<void> {
    await this.runHook('onPlatformBuildEnd', context, result)
  }

  /**
   * 模板渲染前
   */
  async onTemplateRender(context: PluginContext, templateContext: TemplateContext): Promise<TemplateContext> {
    return this.runTransformHook('onTemplateRender', context, templateContext) as Promise<TemplateContext>
  }

  /**
   * 模板渲染后
   */
  async onTemplateRendered(context: PluginContext, content: string): Promise<string> {
    return this.runTransformHook('onTemplateRendered', context, content) as Promise<string>
  }

  /**
   * 资源文件复制前
   */
  async onResourceCopy(context: PluginContext, files: string[]): Promise<string[]> {
    return this.runTransformHook('onResourceCopy', context, files) as Promise<string[]>
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
export function createPluginManager(options?: PluginManagerOptions): PluginManager {
  return new PluginManager(options)
}
