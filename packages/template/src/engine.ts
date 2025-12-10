/**
 * Handlebars 模板引擎封装
 * 提供受控的 helper/partial 注册与文件渲染能力
 */

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import * as Handlebars from 'handlebars'
import type {
  TemplateContext,
  TemplatePartial,
  TemplateRenderOptions,
  TemplateRenderResult
} from './types'

/**
 * 模板引擎错误
 */
export class TemplateEngineError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'TemplateEngineError'
  }
}

/**
 * 模板引擎实现
 * 基于 Handlebars，限制 helper 注册范围确保安全性
 */
export class TemplateEngine {
  private readonly handlebars: typeof Handlebars
  private readonly partials: Map<string, string> = new Map()

  constructor() {
    this.handlebars = Handlebars.create()
    this.registerBuiltinHelpers()
  }

  /**
   * 注册内置 helpers，覆盖常用逻辑操作
   */
  private registerBuiltinHelpers(): void {
    this.handlebars.registerHelper('eq', (a: unknown, b: unknown) => a === b)
    this.handlebars.registerHelper('ne', (a: unknown, b: unknown) => a !== b)
    this.handlebars.registerHelper(
      'lt',
      (a: unknown, b: unknown) => (a as number) < (b as number)
    )
    this.handlebars.registerHelper(
      'gt',
      (a: unknown, b: unknown) => (a as number) > (b as number)
    )
    this.handlebars.registerHelper('and', (...args: unknown[]) => {
      const values = args.slice(0, -1)
      return values.every(value => Boolean(value))
    })
    this.handlebars.registerHelper('or', (...args: unknown[]) => {
      const values = args.slice(0, -1)
      return values.some(value => Boolean(value))
    })
    this.handlebars.registerHelper(
      'platform',
      function (this: TemplateContext, name: string) {
        const runtimePlatform = (this as Record<string, unknown>).platform as
          | { name?: unknown }
          | undefined
        return runtimePlatform?.name === name
      }
    )
    this.handlebars.registerHelper('uppercase', (value: unknown) =>
      typeof value === 'string' ? value.toUpperCase() : value
    )
    this.handlebars.registerHelper('lowercase', (value: unknown) =>
      typeof value === 'string' ? value.toLowerCase() : value
    )
    this.handlebars.registerHelper('capitalize', (value: unknown) => {
      if (typeof value !== 'string' || value.length === 0) return value
      return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
    })
    this.handlebars.registerHelper('join', (...args: unknown[]) => {
      const [value, separator] = args.slice(0, -1)
      if (!Array.isArray(value)) {
        return ''
      }
      return value.join((separator as string) ?? ', ')
    })
    this.handlebars.registerHelper('default', (...args: unknown[]) => {
      const [value, fallback] = args.slice(0, -1)
      return value !== null && value !== undefined && value !== ''
        ? value
        : fallback
    })
    this.handlebars.registerHelper('length', (value: unknown) => {
      if (typeof value === 'string' || Array.isArray(value)) {
        return value.length
      }
      return 0
    })
    this.handlebars.registerHelper('truncate', (...args: unknown[]) => {
      const [value, len, suffix] = args.slice(0, -1)
      if (typeof value !== 'string') {
        return value
      }
      const maxLength = parseInt(String(len), 10)
      if (Number.isNaN(maxLength) || value.length <= maxLength) {
        return value
      }
      return value.slice(0, maxLength) + (suffix ?? '...')
    })
    this.handlebars.registerHelper('replace', (...args: unknown[]) => {
      const [value, search, replacement] = args.slice(0, -1)
      if (typeof value !== 'string' || typeof search !== 'string') {
        return value
      }
      try {
        const pattern = new RegExp(search, 'g')
        return value.replace(pattern, String(replacement ?? ''))
      } catch {
        return value
      }
    })
  }

  /**
   * 注册自定义 helper
   */
  registerHelper(name: string, helper: Handlebars.HelperDelegate): void {
    this.handlebars.registerHelper(name, helper)
  }

  /**
   * 注册单个 partial
   */
  registerPartial(name: string, content: string): void {
    this.partials.set(name, content)
    this.handlebars.registerPartial(name, content)
  }

  /**
   * 批量注册 partial
   */
  registerPartials(partials: TemplatePartial[]): void {
    for (const partial of partials) {
      this.registerPartial(partial.name, partial.content)
    }
  }

  /**
   * 取消注册 partial
   */
  unregisterPartial(name: string): void {
    this.partials.delete(name)
    this.handlebars.unregisterPartial(name)
  }

  /**
   * 编译模板
   */
  compile(
    template: string,
    options?: TemplateRenderOptions
  ): Handlebars.TemplateDelegate {
    try {
      const compileOptions = {
        strict: options?.strict ?? true,
        noEscape: options?.noEscape ?? false,
        preventIndent: true
      }
      return this.handlebars.compile(template, compileOptions)
    } catch (error) {
      throw new TemplateEngineError(
        `模板编译失败: ${(error as Error).message}`,
        error as Error
      )
    }
  }

  /**
   * 渲染模板字符串
   */
  render(
    template: string,
    context: TemplateContext,
    options?: TemplateRenderOptions
  ): TemplateRenderResult {
    const startTime = Date.now()
    const usedPartials: string[] = []

    try {
      const originalPartials = this.handlebars.partials as
        | Record<string, unknown>
        | undefined

      const registry =
        originalPartials ?? (Object.create(null) as Record<string, unknown>)
      const trackingProxy = new Proxy(registry, {
        get: (
          target: Record<string, unknown>,
          property: string | symbol,
          receiver
        ) => {
          if (typeof property === 'string' && this.partials.has(property)) {
            usedPartials.push(property)
          }
          return Reflect.get(target, property, receiver)
        }
      })

      // @ts-expect-error: 将代理对象挂载到 Handlebars 实例以追踪 partial 使用情况
      this.handlebars.partials = trackingProxy

      try {
        const compiled = this.compile(template, options)
        const runtimeOverrides: Handlebars.RuntimeOptions = {}
        let hasOverrides = false

        if (options?.allowProtoMethodsByDefault !== undefined) {
          runtimeOverrides.allowProtoMethodsByDefault =
            options.allowProtoMethodsByDefault
          hasOverrides = true
        }
        if (options?.allowProtoPropertiesByDefault !== undefined) {
          runtimeOverrides.allowProtoPropertiesByDefault =
            options.allowProtoPropertiesByDefault
          hasOverrides = true
        }

        const content = hasOverrides
          ? compiled(context, runtimeOverrides)
          : compiled(context)

        return {
          content,
          usedPartials: Array.from(new Set(usedPartials)),
          duration: Date.now() - startTime
        }
      } finally {
        // @ts-expect-error: 恢复 Handlebars 实例原始 partials 引用
        this.handlebars.partials = originalPartials
      }
    } catch (error) {
      throw new TemplateEngineError(
        `模板渲染失败: ${(error as Error).message}`,
        error as Error
      )
    }
  }

  /**
   * 渲染文件模板
   */
  async renderFile(
    filePath: string | URL,
    context: TemplateContext,
    options?: TemplateRenderOptions
  ): Promise<TemplateRenderResult> {
    try {
      const resolvedPath =
        typeof filePath === 'string' ? filePath : fileURLToPath(filePath)
      const template = await readFile(resolvedPath, 'utf-8')
      return this.render(template, context, options)
    } catch (error) {
      throw new TemplateEngineError(
        `读取模板文件失败: ${
          typeof filePath === 'string' ? filePath : filePath.toString()
        }`,
        error as Error
      )
    }
  }

  /**
   * 获取已注册的 partial 名称
   */
  getPartials(): string[] {
    return Array.from(this.partials.keys())
  }

  /**
   * 清理所有注册的 partial 信息
   */
  clear(): void {
    for (const name of this.partials.keys()) {
      this.handlebars.unregisterPartial(name)
    }
    this.partials.clear()
  }
}
