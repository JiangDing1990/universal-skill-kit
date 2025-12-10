/**
 * 缓存管理器
 * 提供文件级缓存功能，支持基于哈希的缓存键和依赖追踪
 * @packageDocumentation
 */

import { existsSync } from 'node:fs'
import { readFile, writeFile, mkdir, rm, stat, readdir } from 'node:fs/promises'
import { resolve, dirname, join } from 'node:path'
import { createHash } from 'node:crypto'
import type {
  CacheEntry,
  CacheStore,
  CacheConfig,
  CacheOptions,
  CacheStats,
  CacheOperationResult,
  CacheKeyOptions
} from '../types/cache'

/**
 * 默认缓存配置
 */
const DEFAULT_CACHE_CONFIG: Required<CacheConfig> = {
  enabled: true,
  cacheDir: '.usk/cache',
  maxSize: 100 * 1024 * 1024, // 100MB
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
  strategy: 'filesystem',
  compress: false
}

/**
 * 缓存管理器类
 */
export class CacheManager {
  private config: Required<CacheConfig>
  private store: CacheStore
  private memoryCache: Map<string, CacheEntry> = new Map()
  private stats = {
    hits: 0,
    misses: 0
  }

  constructor(config: CacheConfig = {}) {
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config }
    this.store = this.createEmptyStore()
  }

  /**
   * 创建空缓存存储
   */
  private createEmptyStore(): CacheStore {
    return {
      entries: {},
      version: '1.0.0',
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  }

  /**
   * 初始化缓存管理器
   */
  async initialize(): Promise<void> {
    if (!this.config.enabled) {
      return
    }

    const cacheFile = this.getCacheFilePath()
    const cacheDir = dirname(cacheFile)

    // 确保缓存目录存在
    if (!existsSync(cacheDir)) {
      await mkdir(cacheDir, { recursive: true })
    }

    // 加载现有缓存
    if (existsSync(cacheFile)) {
      try {
        const content = await readFile(cacheFile, 'utf-8')
        this.store = JSON.parse(content)
      } catch (error) {
        console.warn('Failed to load cache, creating new cache store:', error)
        this.store = this.createEmptyStore()
        await this.saveStore()
      }
    } else {
      // 创建新的缓存文件
      await this.saveStore()
    }
  }

  /**
   * 获取缓存文件路径
   */
  private getCacheFilePath(): string {
    return resolve(this.config.cacheDir, 'cache.json')
  }

  /**
   * 生成文件内容哈希
   */
  async generateFileHash(filePath: string): Promise<string> {
    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`)
    }

    const content = await readFile(filePath)
    return createHash('sha256').update(content).digest('hex')
  }

  /**
   * 生成缓存键
   */
  async generateCacheKey(
    filePath: string,
    options: CacheKeyOptions = {}
  ): Promise<string> {
    const hash = await this.generateFileHash(filePath)
    const parts = [filePath, hash]

    if (options.includeDependencies && options.include) {
      const depHashes = await Promise.all(
        options.include.map(dep => this.generateFileHash(dep).catch(() => ''))
      )
      parts.push(...depHashes)
    }

    return createHash('sha256').update(parts.join(':')).digest('hex')
  }

  /**
   * 获取缓存条目
   */
  async get<T = any>(
    key: string,
    options: CacheOptions = {}
  ): Promise<T | null> {
    if (!this.config.enabled) {
      return null
    }

    // 检查内存缓存
    if (
      this.config.strategy === 'memory' ||
      this.config.strategy === 'hybrid'
    ) {
      const memEntry = this.memoryCache.get(key)
      if (memEntry && this.isValidEntry(memEntry, options)) {
        this.updateEntryAccess(memEntry)
        this.stats.hits++
        return memEntry.value as T
      }
    }

    // 检查文件系统缓存
    if (
      this.config.strategy === 'filesystem' ||
      this.config.strategy === 'hybrid'
    ) {
      const entry = this.store.entries[key]
      if (entry && this.isValidEntry(entry, options)) {
        this.updateEntryAccess(entry)

        // 更新内存缓存
        if (this.config.strategy === 'hybrid') {
          this.memoryCache.set(key, entry)
        }

        this.stats.hits++
        await this.saveStore()
        return entry.value as T
      }
    }

    this.stats.misses++
    return null
  }

  /**
   * 设置缓存条目
   */
  async set<T = any>(
    key: string,
    value: T,
    options: CacheOptions & { hash?: string; dependencies?: string[] } = {}
  ): Promise<void> {
    if (!this.config.enabled) {
      return
    }

    const now = Date.now()
    const entry: CacheEntry<T> = {
      key,
      value,
      createdAt: now,
      accessedAt: now,
      hits: 0,
      hash: options.hash,
      dependencies: options.dependencies,
      metadata: {
        tags: options.tags,
        ttl: options.ttl
      }
    }

    // 更新内存缓存
    if (
      this.config.strategy === 'memory' ||
      this.config.strategy === 'hybrid'
    ) {
      this.memoryCache.set(key, entry)
    }

    // 更新文件系统缓存
    if (
      this.config.strategy === 'filesystem' ||
      this.config.strategy === 'hybrid'
    ) {
      this.store.entries[key] = entry
      this.store.updatedAt = now
      await this.saveStore()
    }

    // 检查缓存大小限制
    await this.pruneIfNeeded()
  }

  /**
   * 删除缓存条目
   */
  async delete(key: string): Promise<boolean> {
    if (!this.config.enabled) {
      return false
    }

    let deleted = false

    // 从内存缓存删除
    if (this.memoryCache.has(key)) {
      this.memoryCache.delete(key)
      deleted = true
    }

    // 从文件系统缓存删除
    if (this.store.entries[key]) {
      delete this.store.entries[key]
      deleted = true
      await this.saveStore()
    }

    return deleted
  }

  /**
   * 清空所有缓存
   */
  async clear(): Promise<CacheOperationResult> {
    const startTime = Date.now()
    const entryCount =
      Object.keys(this.store.entries).length + this.memoryCache.size

    this.memoryCache.clear()
    this.store = this.createEmptyStore()
    this.stats = { hits: 0, misses: 0 }

    await this.saveStore()

    return {
      success: true,
      operation: 'clear',
      affectedEntries: entryCount,
      duration: Date.now() - startTime
    }
  }

  /**
   * 清理过期缓存
   */
  async prune(): Promise<CacheOperationResult> {
    const startTime = Date.now()
    let prunedCount = 0

    const now = Date.now()
    const entries = Object.values(this.store.entries)

    for (const entry of entries) {
      const age = now - entry.createdAt
      const ttl = entry.metadata?.ttl || this.config.maxAge

      if (age > ttl) {
        await this.delete(entry.key)
        prunedCount++
      }
    }

    return {
      success: true,
      operation: 'prune',
      affectedEntries: prunedCount,
      duration: Date.now() - startTime
    }
  }

  /**
   * 获取缓存统计信息
   */
  async getStats(): Promise<CacheStats> {
    const entries = Object.values(this.store.entries)
    let totalSize = 0

    for (const entry of entries) {
      totalSize += JSON.stringify(entry.value).length
    }

    const timestamps = entries.map(e => e.createdAt)
    const hitRate =
      this.stats.hits + this.stats.misses > 0
        ? this.stats.hits / (this.stats.hits + this.stats.misses)
        : 0

    return {
      entryCount: entries.length,
      totalSize,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate,
      oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : undefined,
      newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : undefined
    }
  }

  /**
   * 验证缓存条目
   */
  async validate(key: string): Promise<boolean> {
    const entry = this.store.entries[key]
    if (!entry) {
      return false
    }

    // 检查是否过期
    if (!this.isValidEntry(entry)) {
      await this.delete(key)
      return false
    }

    // 验证依赖文件
    if (entry.dependencies) {
      for (const dep of entry.dependencies) {
        if (!existsSync(dep)) {
          await this.delete(key)
          return false
        }

        // 验证依赖文件的哈希
        try {
          const currentHash = await this.generateFileHash(dep)
          if (entry.hash && entry.hash !== currentHash) {
            await this.delete(key)
            return false
          }
        } catch {
          await this.delete(key)
          return false
        }
      }
    }

    return true
  }

  /**
   * 检查缓存条目是否有效
   */
  private isValidEntry(entry: CacheEntry, options: CacheOptions = {}): boolean {
    const now = Date.now()
    const age = now - entry.createdAt
    const ttl = options.ttl || entry.metadata?.ttl || this.config.maxAge

    // 如果强制刷新，视为无效
    if (options.force) {
      return false
    }

    // 检查是否过期
    return age < ttl
  }

  /**
   * 更新条目访问信息
   */
  private updateEntryAccess(entry: CacheEntry): void {
    entry.accessedAt = Date.now()
    entry.hits++
  }

  /**
   * 保存缓存存储到文件
   */
  private async saveStore(): Promise<void> {
    if (this.config.strategy === 'memory') {
      return
    }

    const cacheFile = this.getCacheFilePath()
    const content = JSON.stringify(this.store, null, 2)
    await writeFile(cacheFile, content, 'utf-8')
  }

  /**
   * 检查并清理超出大小限制的缓存
   */
  private async pruneIfNeeded(): Promise<void> {
    const stats = await this.getStats()

    if (stats.totalSize > this.config.maxSize) {
      // 按访问时间排序，删除最旧的条目
      const entries = Object.values(this.store.entries).sort(
        (a, b) => a.accessedAt - b.accessedAt
      )

      let freedSize = 0
      const targetSize = this.config.maxSize * 0.8 // 清理到80%

      for (const entry of entries) {
        if (stats.totalSize - freedSize <= targetSize) {
          break
        }

        const entrySize = JSON.stringify(entry.value).length
        await this.delete(entry.key)
        freedSize += entrySize
      }
    }
  }

  /**
   * 获取缓存目录大小
   */
  async getCacheSize(): Promise<number> {
    const cacheDir = dirname(this.getCacheFilePath())

    if (!existsSync(cacheDir)) {
      return 0
    }

    let totalSize = 0
    const files = await readdir(cacheDir, { recursive: true })

    for (const file of files) {
      const filePath = join(cacheDir, file.toString())
      try {
        const stats = await stat(filePath)
        if (stats.isFile()) {
          totalSize += stats.size
        }
      } catch {
        // 忽略无法访问的文件
      }
    }

    return totalSize
  }

  /**
   * 删除缓存目录
   */
  async destroy(): Promise<void> {
    this.memoryCache.clear()
    this.store = this.createEmptyStore()
    this.stats = { hits: 0, misses: 0 }

    const cacheDir = dirname(this.getCacheFilePath())
    if (existsSync(cacheDir)) {
      await rm(cacheDir, { recursive: true, force: true })
    }
  }
}
