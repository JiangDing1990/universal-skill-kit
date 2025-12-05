/**
 * Template context manager
 */

import type { SkillConfig, Platform, DescriptionConfig } from '../types/config'
import type { TemplateContext } from '../types/template'

/**
 * 模板上下文管理器
 */
export class TemplateContextManager {
  /**
   * 从SkillConfig创建模板上下文
   */
  createContext(config: SkillConfig, platform: Platform): TemplateContext {
    return {
      name: config.name,
      version: config.version,
      author: config.author,
      description: this.resolveDescription(config.description, platform),
      tags: config.tags,
      platform: {
        name: platform,
        claude: platform === 'claude',
        codex: platform === 'codex'
      }
    }
  }

  /**
   * 解析平台特定描述
   */
  private resolveDescription(description: DescriptionConfig, platform: Platform): string {
    if (typeof description === 'string') {
      return description
    }

    // 优先使用平台特定描述，否则使用common
    return description[platform] || description.common
  }

  /**
   * 合并上下文
   */
  mergeContext(base: TemplateContext, override: Partial<TemplateContext>): TemplateContext {
    return {
      ...base,
      ...override,
      platform: {
        ...base.platform,
        ...(override.platform || {})
      }
    }
  }

  /**
   * 扩展上下文
   * 添加自定义变量
   */
  extendContext(context: TemplateContext, variables: Record<string, any>): TemplateContext {
    return {
      ...context,
      ...variables
    }
  }

  /**
   * 验证上下文
   * 确保所有必需字段都存在
   */
  validateContext(context: TemplateContext): boolean {
    if (!context.name || typeof context.name !== 'string') {
      return false
    }

    if (!context.version || typeof context.version !== 'string') {
      return false
    }

    if (!context.description || typeof context.description !== 'string') {
      return false
    }

    if (!context.platform || typeof context.platform !== 'object') {
      return false
    }

    if (!context.platform.name) {
      return false
    }

    return true
  }
}
