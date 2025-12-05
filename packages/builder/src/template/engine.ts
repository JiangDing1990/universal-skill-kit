/**
 * Template engine wrapper for Handlebars
 *
 * 根据PHASE2_DESIGN_REVIEW.md决策：
 * - 使用Handlebars而不是自定义实现
 * - 限制功能，只注册必要的helpers
 * - 严格模式，防止安全问题
 */

import Handlebars from 'handlebars'
import type { TemplateContext, TemplateRenderOptions, PartialDefinition, TemplateRenderResult } from '../types/template'

/**
 * 模板引擎错误
 */
export class TemplateEngineError extends Error {
  constructor(
    message: string,
    public cause?: Error
  ) {
    super(message)
    this.name = 'TemplateEngineError'
  }
}

/**
 * 模板引擎
 * 基于Handlebars的受限实现
 */
export class TemplateEngine {
  private handlebars: typeof Handlebars
  private partials: Map<string, string> = new Map()

  constructor() {
    // 创建独立的Handlebars实例
    this.handlebars = Handlebars.create()

    // 注册内置helpers
    this.registerBuiltinHelpers()
  }

  /**
   * 注册内置helpers
   */
  private registerBuiltinHelpers(): void {
    // 1. if helper (已内置)
    // 使用Handlebars原生的if

    // 2. unless helper (已内置)
    // 使用Handlebars原生的unless

    // 3. each helper (已内置)
    // 使用Handlebars原生的each

    // 4. eq helper - 相等比较
    this.handlebars.registerHelper('eq', function (a: any, b: any) {
      return a === b
    })

    // 5. ne helper - 不等比较
    this.handlebars.registerHelper('ne', function (a: any, b: any) {
      return a !== b
    })

    // 6. lt helper - 小于
    this.handlebars.registerHelper('lt', function (a: any, b: any) {
      return a < b
    })

    // 7. gt helper - 大于
    this.handlebars.registerHelper('gt', function (a: any, b: any) {
      return a > b
    })

    // 8. and helper - 逻辑与
    this.handlebars.registerHelper('and', function (...args: any[]) {
      // 最后一个参数是options对象，需要排除
      const values = args.slice(0, -1)
      return values.every((v) => !!v)
    })

    // 9. or helper - 逻辑或
    this.handlebars.registerHelper('or', function (...args: any[]) {
      const values = args.slice(0, -1)
      return values.some((v) => !!v)
    })

    // 10. platform helper - 平台判断
    this.handlebars.registerHelper('platform', function (this: any, name: string) {
      return this.platform?.name === name
    })
  }

  /**
   * 注册自定义helper
   */
  registerHelper(name: string, helper: Handlebars.HelperDelegate): void {
    this.handlebars.registerHelper(name, helper)
  }

  /**
   * 注册partial
   */
  registerPartial(name: string, content: string): void {
    this.partials.set(name, content)
    this.handlebars.registerPartial(name, content)
  }

  /**
   * 批量注册partials
   */
  registerPartials(partials: PartialDefinition[]): void {
    for (const partial of partials) {
      this.registerPartial(partial.name, partial.content)
    }
  }

  /**
   * 取消注册partial
   */
  unregisterPartial(name: string): void {
    this.partials.delete(name)
    this.handlebars.unregisterPartial(name)
  }

  /**
   * 编译模板
   */
  compile(template: string, options?: TemplateRenderOptions): Handlebars.TemplateDelegate {
    try {
      return this.handlebars.compile(template, {
        strict: options?.strict ?? true,
        noEscape: options?.noEscape ?? false,
        preventIndent: true, // 防止缩进问题
        ...options
      })
    } catch (error) {
      throw new TemplateEngineError(`模板编译失败: ${(error as Error).message}`, error as Error)
    }
  }

  /**
   * 渲染模板
   */
  render(template: string, context: TemplateContext, options?: TemplateRenderOptions): TemplateRenderResult {
    const startTime = Date.now()
    const usedPartials: string[] = []

    try {
      // 追踪使用的partials
      const originalPartial = this.handlebars.partials
      const trackedPartials = new Proxy(originalPartial, {
        get: (target: any, prop: string) => {
          if (typeof prop === 'string' && this.partials.has(prop)) {
            usedPartials.push(prop)
          }
          return target[prop]
        }
      })

      // @ts-ignore - 临时替换partials以追踪使用
      this.handlebars.partials = trackedPartials

      // 编译并渲染
      const compiled = this.compile(template, options)
      const content = compiled(context)

      // 恢复原始partials
      // @ts-ignore
      this.handlebars.partials = originalPartial

      return {
        content,
        usedPartials: Array.from(new Set(usedPartials)),
        duration: Date.now() - startTime
      }
    } catch (error) {
      throw new TemplateEngineError(`模板渲染失败: ${(error as Error).message}`, error as Error)
    }
  }

  /**
   * 渲染文件模板
   */
  async renderFile(filePath: string, context: TemplateContext, options?: TemplateRenderOptions): Promise<TemplateRenderResult> {
    try {
      const { readFile } = await import('node:fs/promises')
      const template = await readFile(filePath, 'utf-8')
      return this.render(template, context, options)
    } catch (error) {
      throw new TemplateEngineError(`读取模板文件失败: ${filePath}`, error as Error)
    }
  }

  /**
   * 清理所有注册的内容
   */
  clear(): void {
    // 清理partials
    for (const name of this.partials.keys()) {
      this.handlebars.unregisterPartial(name)
    }
    this.partials.clear()

    // 注意：helpers不能轻易清理，因为可能影响内置helpers
    // 如果需要重置，建议创建新的实例
  }

  /**
   * 获取已注册的partials
   */
  getPartials(): string[] {
    return Array.from(this.partials.keys())
  }
}
