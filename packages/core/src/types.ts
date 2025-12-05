/**
 * Universal Skill Kit - Core Types
 * 核心类型定义
 */

// ============================================================================
// Platform Types
// ============================================================================

/**
 * Supported platforms
 * 支持的平台
 */
export type Platform = 'claude' | 'codex'

/**
 * Compression strategy
 * 压缩策略
 */
export type CompressionStrategy = 'conservative' | 'balanced' | 'aggressive'

/**
 * Quality status
 * 质量状态
 */
export type QualityStatus = 'excellent' | 'good' | 'fair' | 'poor'

// ============================================================================
// Skill Definition
// ============================================================================

/**
 * Skill metadata
 * Skill 元数据
 */
export interface SkillMetadata {
  name: string
  version: string
  description: string
  author?: string
  tags?: string[]
}

/**
 * Skill resources
 * Skill 资源
 */
export interface SkillResources {
  templates: string[]
  references: string[]
  scripts: string[]
}

/**
 * Complete skill definition
 * 完整的 Skill 定义
 */
export interface SkillDefinition {
  metadata: SkillMetadata
  body: string
  resources: SkillResources
}

// ============================================================================
// Conversion
// ============================================================================

/**
 * Compression options
 * 压缩选项
 */
export interface CompressionOptions {
  maxLength: number
  preserveKeywords: boolean
  removeExamples: boolean
  strategy?: CompressionStrategy
}

/**
 * Conversion options
 * 转换选项
 */
export interface ConvertOptions {
  targetPlatform: Platform
  outputDir?: string
  compressionStrategy?: CompressionStrategy
  interactive?: boolean
  aiOptimize?: boolean
}

/**
 * Conversion result
 * 转换结果
 */
export interface ConversionResult {
  success: boolean
  platform: Platform
  outputPath: string
  metadata: SkillMetadata
  quality: number
  statistics: ConversionStatistics
}

/**
 * Conversion statistics
 * 转换统计
 */
export interface ConversionStatistics {
  originalLength: number
  finalLength: number
  compressionRate: number
  preservedKeywords: string[]
  lostInformation: string[]
  duration: number
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validation result
 * 验证结果
 */
export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

/**
 * Validation error
 * 验证错误
 */
export interface ValidationError {
  field: string
  message: string
  code: string
}

/**
 * Validation warning
 * 验证警告
 */
export interface ValidationWarning {
  field: string
  message: string
  severity: 'low' | 'medium' | 'high'
}

// ============================================================================
// Quality Assessment
// ============================================================================

/**
 * Quality score
 * 质量评分
 */
export interface QualityScore {
  overall: number // 0-100
  dimensions: {
    description: number
    structure: number
    examples: number
    documentation: number
    crossPlatform: number
  }
  ranking: string
  improvements: Improvement[]
}

/**
 * Improvement suggestion
 * 改进建议
 */
export interface Improvement {
  priority: 'high' | 'medium' | 'low'
  category: string
  message: string
  action?: string
}

/**
 * Dimension score
 * 维度评分
 */
export interface DimensionScore {
  score: number // 0-100
  stars: number // 1-5
  status: QualityStatus
  issues: Issue[]
  suggestions: string[]
}

/**
 * Issue
 * 问题
 */
export interface Issue {
  type: 'error' | 'warning' | 'info'
  message: string
  fix?: string
}

// ============================================================================
// Analysis
// ============================================================================

/**
 * Analysis report
 * 分析报告
 */
export interface AnalysisReport {
  complexity: 'high' | 'medium' | 'low'
  descriptionLength: number
  hasCodeExamples: boolean
  technicalKeywords: string[]
  recommendedStrategy: CompressionStrategy
  estimatedQuality: number // 0-100
  warnings: string[]
  suggestions: Suggestion[]
}

/**
 * Suggestion
 * 建议
 */
export interface Suggestion {
  type: 'warning' | 'info' | 'optimization'
  message: string
  fix?: AutoFixFunction
}

/**
 * Auto fix function
 * 自动修复函数
 */
export type AutoFixFunction = (skill: SkillDefinition) => SkillDefinition

// ============================================================================
// History
// ============================================================================

/**
 * Conversion history entry
 * 转换历史记录
 */
export interface Conversion {
  id: string
  timestamp: Date
  source: {
    path: string
    platform: Platform
    hash: string
  }
  target: {
    path: string
    platform: Platform
    hash: string
  }
  strategy: CompressionOptions
  result: ConversionResult
  metadata: {
    duration: number
    success: boolean
    quality: number
  }
}

/**
 * History filters
 * 历史筛选
 */
export interface HistoryFilters {
  platform?: Platform
  since?: Date
  successOnly?: boolean
}

// ============================================================================
// Configuration
// ============================================================================

/**
 * Skill configuration
 * Skill 配置
 */
export interface SkillConfig {
  name: string
  version: string
  author?: string
  platforms: {
    claude?: PlatformConfig
    codex?: PlatformConfig
  }
  description: {
    full: string
    short?: string
    keywords?: string[]
  }
  body: {
    source: string
    sections: {
      claude?: string[]
      codex?: string[]
    }
  }
  resources: {
    templates: string[]
    references: string[]
    scripts: string[]
  }
  build: {
    validate: boolean
    minify: boolean
    sourcemap: boolean
  }
}

/**
 * Platform configuration
 * 平台配置
 */
export interface PlatformConfig {
  enabled: boolean
  output: string
}

// ============================================================================
// Build
// ============================================================================

/**
 * Build result
 * 构建结果
 */
export interface BuildResult {
  success: boolean
  platform: Platform
  outputPath: string
  metadata: SkillMetadata
}

// ============================================================================
// Preset
// ============================================================================

/**
 * Preset
 * 预设
 */
export interface Preset {
  name: string
  description: string
  author: string
  tags: string[]
  config: PresetConfig
  downloads: number
  rating: number
}

/**
 * Preset configuration
 * 预设配置
 */
export interface PresetConfig {
  description: DescriptionTemplate
  compression: CompressionOptions
  structure: StructureTemplate
  examples: ExampleTemplate[]
}

/**
 * Description template
 * 描述模板
 */
export interface DescriptionTemplate {
  template: string
  variables: Record<string, string>
}

/**
 * Structure template
 * 结构模板
 */
export interface StructureTemplate {
  sections: string[]
}

/**
 * Example template
 * 示例模板
 */
export interface ExampleTemplate {
  title: string
  language: string
  code: string
}
