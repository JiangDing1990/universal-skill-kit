/**
 * 通用模板类型定义
 * 为 Handlebars 封装提供统一类型
 */

/**
 * 模板上下文
 * 默认使用宽泛的键值对结构，具体字段由上层系统定义
 */
export type TemplateContext = Record<string, unknown>

/**
 * 模板渲染选项
 */
export interface TemplateRenderOptions {
  /**
   * 是否启用严格模式
   * @default true
   */
  strict?: boolean

  /**
   * 渲染时是否禁用 HTML 转义
   * @default false
   */
  noEscape?: boolean

  /**
   * 是否允许访问原型属性
   * @default false
   */
  allowProtoPropertiesByDefault?: boolean

  /**
   * 是否允许访问原型方法
   * @default false
   */
  allowProtoMethodsByDefault?: boolean
}

/**
 * Partial 定义
 */
export interface TemplatePartial {
  /**
   * Partial 名称
   */
  name: string

  /**
   * Partial 内容
   */
  content: string
}

/**
 * 模板渲染结果
 */
export interface TemplateRenderResult {
  /**
   * 渲染后的内容
   */
  content: string

  /**
   * 渲染过程中引用的 partial 名称
   */
  usedPartials: string[]

  /**
   * 渲染耗时（毫秒）
   */
  duration: number
}
