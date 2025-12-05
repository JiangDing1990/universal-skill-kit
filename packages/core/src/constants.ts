/**
 * Constants
 * 常量定义
 */

/**
 * Platform identifiers
 * 平台标识符
 */
export const PLATFORMS = {
  CLAUDE: 'claude',
  CODEX: 'codex'
} as const

/**
 * Compression strategies
 * 压缩策略
 */
export const COMPRESSION_STRATEGIES = {
  CONSERVATIVE: 'conservative',
  BALANCED: 'balanced',
  AGGRESSIVE: 'aggressive'
} as const

/**
 * File extensions
 * 文件扩展名
 */
export const FILE_EXTENSIONS = {
  MARKDOWN: '.md',
  YAML: '.yaml',
  JSON: '.json'
} as const

/**
 * Skill file names
 * Skill 文件名
 */
export const SKILL_FILES = {
  MAIN: 'SKILL.md',
  README: 'README.md'
} as const

/**
 * Platform paths
 * 平台路径
 */
export const PLATFORM_PATHS = {
  CLAUDE_SKILLS: '.claude/skills',
  CODEX_SKILLS: '.codex/skills'
} as const

/**
 * Limits and thresholds
 * 限制和阈值
 */
export const LIMITS = {
  CODEX_DESCRIPTION_MAX_LENGTH: 500,
  MIN_DESCRIPTION_LENGTH: 20,
  MAX_DESCRIPTION_LENGTH: 2000,
  MIN_BODY_LENGTH: 100,
  BATCH_CONCURRENCY: 5,
  MIN_SKILL_NAME_LENGTH: 3
} as const

/**
 * Quality thresholds
 * 质量阈值
 */
export const QUALITY_THRESHOLDS = {
  HIGH: 80,
  MEDIUM: 60,
  LOW: 40
} as const

/**
 * Error codes
 * 错误代码
 */
export const ERROR_CODES = {
  SKILL_NOT_FOUND: 'SKILL_NOT_FOUND',
  SKILL_VALIDATION_ERROR: 'SKILL_VALIDATION_ERROR',
  CONVERSION_ERROR: 'CONVERSION_ERROR',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  FILE_WRITE_ERROR: 'FILE_WRITE_ERROR'
} as const

/**
 * Script file extensions (for permission preservation)
 * 脚本文件扩展名（用于权限保留）
 */
export const SCRIPT_EXTENSIONS = ['.sh', '.bash', '.py', '.js', '.ts'] as const
