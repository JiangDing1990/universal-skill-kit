/**
 * 缓存系统类型定义
 * @packageDocumentation
 */

/**
 * 缓存条目
 */
export interface CacheEntry<T = any> {
  /** 缓存的键 */
  key: string
  /** 缓存的值 */
  value: T
  /** 创建时间戳 */
  createdAt: number
  /** 最后访问时间戳 */
  accessedAt: number
  /** 访问次数 */
  hits: number
  /** 文件哈希值（用于验证） */
  hash?: string
  /** 依赖文件列表 */
  dependencies?: string[]
  /** 元数据 */
  metadata?: Record<string, any>
}

/**
 * 缓存存储
 */
export interface CacheStore {
  /** 缓存条目映射 */
  entries: Record<string, CacheEntry>
  /** 缓存版本 */
  version: string
  /** 创建时间 */
  createdAt: number
  /** 最后更新时间 */
  updatedAt: number
}

/**
 * 缓存配置
 */
export interface CacheConfig {
  /** 是否启用缓存 */
  enabled?: boolean
  /** 缓存目录 */
  cacheDir?: string
  /** 最大缓存大小（字节） */
  maxSize?: number
  /** 最大缓存时间（毫秒） */
  maxAge?: number
  /** 缓存策略 */
  strategy?: 'filesystem' | 'memory' | 'hybrid'
  /** 压缩缓存 */
  compress?: boolean
}

/**
 * 缓存选项
 */
export interface CacheOptions {
  /** 是否强制刷新 */
  force?: boolean
  /** 缓存TTL（毫秒） */
  ttl?: number
  /** 缓存标签 */
  tags?: string[]
}

/**
 * 缓存统计信息
 */
export interface CacheStats {
  /** 缓存条目数量 */
  entryCount: number
  /** 总缓存大小（字节） */
  totalSize: number
  /** 命中次数 */
  hits: number
  /** 未命中次数 */
  misses: number
  /** 命中率 */
  hitRate: number
  /** 最旧的条目时间 */
  oldestEntry?: number
  /** 最新的条目时间 */
  newestEntry?: number
}

/**
 * 缓存操作结果
 */
export interface CacheOperationResult {
  /** 是否成功 */
  success: boolean
  /** 操作类型 */
  operation: 'get' | 'set' | 'delete' | 'clear' | 'prune'
  /** 影响的条目数 */
  affectedEntries?: number
  /** 错误信息 */
  error?: string
  /** 操作耗时 */
  duration?: number
}

/**
 * 文件缓存键生成器选项
 */
export interface CacheKeyOptions {
  /** 基础路径 */
  basePath?: string
  /** 包含的文件模式 */
  include?: string[]
  /** 排除的文件模式 */
  exclude?: string[]
  /** 是否包含依赖 */
  includeDependencies?: boolean
}
