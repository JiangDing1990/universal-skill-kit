/**
 * Configuration validator
 */

import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import type { SkillConfig } from '../types/config'
import { validateConfig } from './schema'

/**
 * 验证结果
 */
export interface ValidationResult {
  /**
   * 是否有效
   */
  valid: boolean

  /**
   * 错误列表
   */
  errors: ValidationError[]

  /**
   * 警告列表
   */
  warnings: ValidationWarning[]
}

/**
 * 验证错误
 */
export interface ValidationError {
  /**
   * 错误类型
   */
  type: 'schema' | 'file' | 'logic'

  /**
   * 错误字段路径
   */
  path: string

  /**
   * 错误消息
   */
  message: string

  /**
   * 建议
   */
  suggestion?: string
}

/**
 * 验证警告
 */
export interface ValidationWarning {
  /**
   * 警告类型
   */
  type: 'deprecated' | 'best-practice' | 'suggestion'

  /**
   * 警告字段路径
   */
  path: string

  /**
   * 警告消息
   */
  message: string
}

/**
 * 配置验证器
 */
export class ConfigValidator {
  /**
   * 验证配置
   */
  validate(config: unknown, configDir: string): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // 1. Schema验证
    const schemaResult = validateConfig(config)
    if (!schemaResult.success) {
      for (const issue of schemaResult.error.issues) {
        errors.push({
          type: 'schema',
          path: issue.path.join('.'),
          message: issue.message,
          suggestion: this.getSuggestionForSchemaError(issue)
        })
      }
      // Schema验证失败，直接返回
      return { valid: false, errors, warnings }
    }

    const validConfig = schemaResult.data as SkillConfig

    // 2. 文件存在性验证
    this.validateFiles(validConfig, configDir, errors)

    // 3. 逻辑验证
    this.validateLogic(validConfig, warnings)

    // 4. 最佳实践检查
    this.checkBestPractices(validConfig, warnings)

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * 验证文件存在性
   */
  private validateFiles(config: SkillConfig, configDir: string, errors: ValidationError[]): void {
    // 检查入口文件
    const entryPath = resolve(configDir, config.source.entry)
    if (!existsSync(entryPath)) {
      errors.push({
        type: 'file',
        path: 'source.entry',
        message: `入口文件不存在: ${config.source.entry}`,
        suggestion: `确保文件 ${config.source.entry} 存在于配置文件所在目录`
      })
    }

    // 检查输出目录的父目录是否存在
    for (const [platform, platformConfig] of Object.entries(config.platforms)) {
      if (platformConfig && platformConfig.enabled) {
        const outputPath = resolve(configDir, platformConfig.output)
        const parentDir = resolve(outputPath, '..')

        if (!existsSync(parentDir)) {
          errors.push({
            type: 'file',
            path: `platforms.${platform}.output`,
            message: `输出目录的父目录不存在: ${platformConfig.output}`,
            suggestion: `创建父目录或修改输出路径`
          })
        }
      }
    }
  }

  /**
   * 逻辑验证
   */
  private validateLogic(config: SkillConfig, warnings: ValidationWarning[]): void {
    // 检查Codex平台的描述长度
    if (config.platforms.codex?.enabled) {
      const description = this.getDescriptionForPlatform(config.description, 'codex')

      if (description.length > 500) {
        warnings.push({
          type: 'suggestion',
          path: 'description',
          message: `Codex平台描述过长 (${description.length}字符，限制500字符)，将自动压缩`
        })
      }
    }

    // 检查版本号格式建议
    const version = config.version
    if (version.startsWith('0.')) {
      warnings.push({
        type: 'suggestion',
        path: 'version',
        message: '版本号以0开头，表示项目处于开发阶段，发布正式版本时建议升级到1.0.0'
      })
    }
  }

  /**
   * 检查最佳实践
   */
  private checkBestPractices(config: SkillConfig, warnings: ValidationWarning[]): void {
    // 建议添加作者信息
    if (!config.author) {
      warnings.push({
        type: 'best-practice',
        path: 'author',
        message: '建议添加作者信息以便用户联系'
      })
    }

    // 建议添加标签
    if (!config.tags || config.tags.length === 0) {
      warnings.push({
        type: 'best-practice',
        path: 'tags',
        message: '建议添加标签以提高Skill的可发现性'
      })
    }

    // 建议启用source map（开发环境）
    if (config.build && !config.build.sourcemap) {
      warnings.push({
        type: 'suggestion',
        path: 'build.sourcemap',
        message: '开发环境建议启用sourcemap以便调试'
      })
    }
  }

  /**
   * 获取平台特定描述
   */
  private getDescriptionForPlatform(description: string | { common: string; [key: string]: string | undefined }, platform: string): string {
    if (typeof description === 'string') {
      return description
    }

    return description[platform] || description.common
  }

  /**
   * 获取Schema错误的建议
   */
  private getSuggestionForSchemaError(issue: any): string | undefined {
    const path = issue.path.join('.')

    if (path === 'name') {
      return 'Skill名称应该使用kebab-case格式，例如: my-awesome-skill'
    }

    if (path === 'version') {
      return '版本号格式应该为: major.minor.patch，例如: 1.0.0'
    }

    if (path.includes('output')) {
      return '输出目录路径应该为相对路径，例如: dist/claude'
    }

    return undefined
  }
}
