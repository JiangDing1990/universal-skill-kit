/**
 * Template engine types
 */

import type { TemplateEngine } from '@jiangding/usk-template'
import type { Platform } from './config'

type BaseContext = Parameters<TemplateEngine['render']>[1]
type BaseOptions = Parameters<TemplateEngine['render']>[2]
type BaseResult = ReturnType<TemplateEngine['render']>
type EnginePartial = Parameters<TemplateEngine['registerPartials']>[0][number]

/**
 * 模板上下文
 */
export interface TemplateContext extends BaseContext {
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
 * 模板渲染选项（使用模板引擎默认定义）
 */
export type TemplateRenderOptions = BaseOptions

/**
 * Partial 定义
 */
export type PartialDefinition = EnginePartial

/**
 * 模板渲染结果
 */
export type TemplateRenderResult = BaseResult
