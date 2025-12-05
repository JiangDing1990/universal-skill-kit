/**
 * Template engine types
 */

import type { Platform } from './config'

/**
 * 模板上下文
 */
export interface TemplateContext {
  /**
   * Skill名称
   */
  name: string

  /**
   * 版本号
   */
  version: string

  /**
   * 作者
   */
  author?: string

  /**
   * 描述
   */
  description: string

  /**
   * 标签
   */
  tags?: string[]

  /**
   * 平台信息
   */
  platform: {
    /**
     * 平台名称
     */
    name: Platform

    /**
     * 是否为Claude平台
     */
    claude: boolean

    /**
     * 是否为Codex平台
     */
    codex: boolean
  }

  /**
   * 自定义变量
   */
  [key: string]: any
}

/**
 * 模板渲染选项
 */
export interface TemplateRenderOptions {
  /**
   * 严格模式
   * @default true
   */
  strict?: boolean

  /**
   * 是否转义HTML
   * @default true
   */
  noEscape?: boolean

  /**
   * 是否允许原型属性访问
   * @default false
   */
  allowProtoPropertiesByDefault?: boolean

  /**
   * 是否允许原型方法访问
   * @default false
   */
  allowProtoMethodsByDefault?: boolean
}

/**
 * Partial定义
 */
export interface PartialDefinition {
  /**
   * Partial名称
   */
  name: string

  /**
   * Partial内容
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
   * 使用的partials
   */
  usedPartials: string[]

  /**
   * 渲染时长(ms)
   */
  duration: number
}
