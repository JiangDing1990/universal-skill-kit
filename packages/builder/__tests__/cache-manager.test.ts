import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { rm, writeFile, mkdir } from 'node:fs/promises'
import { CacheManager } from '../src/cache'

describe('CacheManager', () => {
  const testCacheDir = resolve(__dirname, 'fixtures/cache-test/.usk/cache')
  const testFilesDir = resolve(__dirname, 'fixtures/cache-test/files')

  beforeEach(async () => {
    // 创建测试目录
    await mkdir(testFilesDir, { recursive: true })

    // 创建测试文件
    await writeFile(resolve(testFilesDir, 'test1.txt'), 'content1', 'utf-8')
    await writeFile(resolve(testFilesDir, 'test2.txt'), 'content2', 'utf-8')
  })

  afterEach(async () => {
    // 清理测试目录
    const cacheTestDir = resolve(__dirname, 'fixtures/cache-test')
    if (existsSync(cacheTestDir)) {
      await rm(cacheTestDir, { recursive: true, force: true })
    }
  })

  describe('initialization', () => {
    it('should initialize cache manager', async () => {
      const manager = new CacheManager({
        cacheDir: testCacheDir,
        enabled: true
      })

      await manager.initialize()

      const cacheFile = resolve(testCacheDir, 'cache.json')
      expect(existsSync(cacheFile)).toBe(true)
    })

    it('should load existing cache', async () => {
      const manager1 = new CacheManager({ cacheDir: testCacheDir })
      await manager1.initialize()
      await manager1.set('key1', 'value1')

      // 创建新实例，应该加载现有缓存
      const manager2 = new CacheManager({ cacheDir: testCacheDir })
      await manager2.initialize()

      const value = await manager2.get('key1')
      expect(value).toBe('value1')
    })
  })

  describe('file hashing', () => {
    it('should generate consistent hash for same file', async () => {
      const manager = new CacheManager({ cacheDir: testCacheDir })
      const filePath = resolve(testFilesDir, 'test1.txt')

      const hash1 = await manager.generateFileHash(filePath)
      const hash2 = await manager.generateFileHash(filePath)

      expect(hash1).toBe(hash2)
      expect(hash1).toHaveLength(64) // SHA256 hash length
    })

    it('should generate different hashes for different files', async () => {
      const manager = new CacheManager({ cacheDir: testCacheDir })
      const file1 = resolve(testFilesDir, 'test1.txt')
      const file2 = resolve(testFilesDir, 'test2.txt')

      const hash1 = await manager.generateFileHash(file1)
      const hash2 = await manager.generateFileHash(file2)

      expect(hash1).not.toBe(hash2)
    })

    it('should throw error for non-existent file', async () => {
      const manager = new CacheManager({ cacheDir: testCacheDir })
      const filePath = resolve(testFilesDir, 'non-existent.txt')

      await expect(manager.generateFileHash(filePath)).rejects.toThrow()
    })
  })

  describe('cache key generation', () => {
    it('should generate cache key from file path', async () => {
      const manager = new CacheManager({ cacheDir: testCacheDir })
      const filePath = resolve(testFilesDir, 'test1.txt')

      const key = await manager.generateCacheKey(filePath)

      expect(key).toBeTruthy()
      expect(key).toHaveLength(64) // SHA256 hash length
    })

    it('should generate different keys for different files', async () => {
      const manager = new CacheManager({ cacheDir: testCacheDir })
      const file1 = resolve(testFilesDir, 'test1.txt')
      const file2 = resolve(testFilesDir, 'test2.txt')

      const key1 = await manager.generateCacheKey(file1)
      const key2 = await manager.generateCacheKey(file2)

      expect(key1).not.toBe(key2)
    })

    it('should include dependencies in cache key', async () => {
      const manager = new CacheManager({ cacheDir: testCacheDir })
      const file1 = resolve(testFilesDir, 'test1.txt')
      const file2 = resolve(testFilesDir, 'test2.txt')

      const key1 = await manager.generateCacheKey(file1)
      const key2 = await manager.generateCacheKey(file1, {
        include: [file2],
        includeDependencies: true
      })

      expect(key1).not.toBe(key2)
    })
  })

  describe('get/set operations', () => {
    it('should set and get cache value', async () => {
      const manager = new CacheManager({ cacheDir: testCacheDir })
      await manager.initialize()

      await manager.set('key1', 'value1')
      const value = await manager.get('key1')

      expect(value).toBe('value1')
    })

    it('should return null for non-existent key', async () => {
      const manager = new CacheManager({ cacheDir: testCacheDir })
      await manager.initialize()

      const value = await manager.get('non-existent-key')
      expect(value).toBeNull()
    })

    it('should support complex values', async () => {
      const manager = new CacheManager({ cacheDir: testCacheDir })
      await manager.initialize()

      const complexValue = {
        name: 'test',
        version: '1.0.0',
        tags: ['a', 'b', 'c']
      }

      await manager.set('key1', complexValue)
      const value = await manager.get('key1')

      expect(value).toEqual(complexValue)
    })

    it('should track access statistics', async () => {
      const manager = new CacheManager({ cacheDir: testCacheDir })
      await manager.initialize()

      await manager.set('key1', 'value1')
      await manager.get('key1')
      await manager.get('key1')
      await manager.get('non-existent')

      const stats = await manager.getStats()
      expect(stats.hits).toBe(2)
      expect(stats.misses).toBe(1)
      expect(stats.hitRate).toBeCloseTo(0.667, 2)
    })
  })

  describe('cache expiration', () => {
    it('should expire cache after TTL', async () => {
      const manager = new CacheManager({
        cacheDir: testCacheDir,
        maxAge: 100 // 100ms
      })
      await manager.initialize()

      await manager.set('key1', 'value1')
      const value1 = await manager.get('key1')
      expect(value1).toBe('value1')

      // 等待超过TTL
      await new Promise((resolve) => setTimeout(resolve, 150))

      const value2 = await manager.get('key1')
      expect(value2).toBeNull()
    })

    it('should support custom TTL per entry', async () => {
      const manager = new CacheManager({ cacheDir: testCacheDir })
      await manager.initialize()

      await manager.set('key1', 'value1', { ttl: 100 })
      const value1 = await manager.get('key1')
      expect(value1).toBe('value1')

      await new Promise((resolve) => setTimeout(resolve, 150))

      const value2 = await manager.get('key1')
      expect(value2).toBeNull()
    })

    it('should respect force option', async () => {
      const manager = new CacheManager({ cacheDir: testCacheDir })
      await manager.initialize()

      await manager.set('key1', 'value1')
      const value1 = await manager.get('key1')
      expect(value1).toBe('value1')

      const value2 = await manager.get('key1', { force: true })
      expect(value2).toBeNull()
    })
  })

  describe('delete operations', () => {
    it('should delete cache entry', async () => {
      const manager = new CacheManager({ cacheDir: testCacheDir })
      await manager.initialize()

      await manager.set('key1', 'value1')
      const deleted = await manager.delete('key1')
      expect(deleted).toBe(true)

      const value = await manager.get('key1')
      expect(value).toBeNull()
    })

    it('should return false when deleting non-existent key', async () => {
      const manager = new CacheManager({ cacheDir: testCacheDir })
      await manager.initialize()

      const deleted = await manager.delete('non-existent')
      expect(deleted).toBe(false)
    })
  })

  describe('clear operations', () => {
    it('should clear all cache entries', async () => {
      const manager = new CacheManager({ cacheDir: testCacheDir })
      await manager.initialize()

      await manager.set('key1', 'value1')
      await manager.set('key2', 'value2')
      await manager.set('key3', 'value3')

      const result = await manager.clear()
      expect(result.success).toBe(true)
      expect(result.affectedEntries).toBe(3)

      const stats = await manager.getStats()
      expect(stats.entryCount).toBe(0)
    })
  })

  describe('prune operations', () => {
    it('should prune expired entries', async () => {
      const manager = new CacheManager({
        cacheDir: testCacheDir,
        maxAge: 100
      })
      await manager.initialize()

      await manager.set('key1', 'value1')
      await manager.set('key2', 'value2')

      await new Promise((resolve) => setTimeout(resolve, 150))

      const result = await manager.prune()
      expect(result.success).toBe(true)
      expect(result.affectedEntries).toBe(2)

      const stats = await manager.getStats()
      expect(stats.entryCount).toBe(0)
    })

    it('should not prune non-expired entries', async () => {
      const manager = new CacheManager({
        cacheDir: testCacheDir,
        maxAge: 10000 // 10s
      })
      await manager.initialize()

      await manager.set('key1', 'value1')
      await manager.set('key2', 'value2')

      const result = await manager.prune()
      expect(result.success).toBe(true)
      expect(result.affectedEntries).toBe(0)

      const stats = await manager.getStats()
      expect(stats.entryCount).toBe(2)
    })
  })

  describe('cache statistics', () => {
    it('should provide cache statistics', async () => {
      const manager = new CacheManager({ cacheDir: testCacheDir })
      await manager.initialize()

      await manager.set('key1', 'value1')
      await manager.set('key2', 'value2')
      await manager.get('key1')

      const stats = await manager.getStats()

      expect(stats.entryCount).toBe(2)
      expect(stats.totalSize).toBeGreaterThan(0)
      expect(stats.hits).toBe(1)
      expect(stats.misses).toBe(0)
      expect(stats.hitRate).toBe(1)
      expect(stats.oldestEntry).toBeTruthy()
      expect(stats.newestEntry).toBeTruthy()
    })
  })

  describe('cache validation', () => {
    it('should validate cache entry', async () => {
      const manager = new CacheManager({ cacheDir: testCacheDir })
      await manager.initialize()
      const filePath = resolve(testFilesDir, 'test1.txt')

      const key = await manager.generateCacheKey(filePath)
      const hash = await manager.generateFileHash(filePath)

      await manager.set(key, 'cached-content', {
        hash,
        dependencies: [filePath]
      })

      const isValid = await manager.validate(key)
      expect(isValid).toBe(true)
    })

    it('should invalidate cache when file changes', async () => {
      const manager = new CacheManager({ cacheDir: testCacheDir })
      await manager.initialize()
      const filePath = resolve(testFilesDir, 'test1.txt')

      const key = await manager.generateCacheKey(filePath)
      const hash = await manager.generateFileHash(filePath)

      await manager.set(key, 'cached-content', {
        hash,
        dependencies: [filePath]
      })

      // 修改文件
      await writeFile(filePath, 'modified-content', 'utf-8')

      const isValid = await manager.validate(key)
      expect(isValid).toBe(false)

      // 缓存应该被删除
      const value = await manager.get(key)
      expect(value).toBeNull()
    })

    it('should invalidate cache when dependency is missing', async () => {
      const manager = new CacheManager({ cacheDir: testCacheDir })
      await manager.initialize()
      const filePath = resolve(testFilesDir, 'test1.txt')
      const depPath = resolve(testFilesDir, 'dep.txt')

      await writeFile(depPath, 'dependency', 'utf-8')

      const key = await manager.generateCacheKey(filePath)
      await manager.set(key, 'cached-content', {
        dependencies: [depPath]
      })

      // 删除依赖文件
      await rm(depPath)

      const isValid = await manager.validate(key)
      expect(isValid).toBe(false)
    })
  })

  describe('cache strategies', () => {
    it('should work with filesystem strategy', async () => {
      const manager = new CacheManager({
        cacheDir: testCacheDir,
        strategy: 'filesystem'
      })
      await manager.initialize()

      await manager.set('key1', 'value1')
      const value = await manager.get('key1')

      expect(value).toBe('value1')

      const cacheFile = resolve(testCacheDir, 'cache.json')
      expect(existsSync(cacheFile)).toBe(true)
    })

    it('should work with memory strategy', async () => {
      const manager = new CacheManager({
        cacheDir: testCacheDir,
        strategy: 'memory'
      })
      await manager.initialize()

      await manager.set('key1', 'value1')
      const value = await manager.get('key1')

      expect(value).toBe('value1')

      // 不应该创建缓存文件
      const cacheFile = resolve(testCacheDir, 'cache.json')
      expect(existsSync(cacheFile)).toBe(false)
    })

    it('should work with hybrid strategy', async () => {
      const manager = new CacheManager({
        cacheDir: testCacheDir,
        strategy: 'hybrid'
      })
      await manager.initialize()

      await manager.set('key1', 'value1')
      const value = await manager.get('key1')

      expect(value).toBe('value1')

      // 应该同时有内存缓存和文件缓存
      const cacheFile = resolve(testCacheDir, 'cache.json')
      expect(existsSync(cacheFile)).toBe(true)
    })
  })

  describe('cache size management', () => {
    it('should get cache size', async () => {
      const manager = new CacheManager({ cacheDir: testCacheDir })
      await manager.initialize()

      await manager.set('key1', 'value1')
      await manager.set('key2', 'value2')

      const size = await manager.getCacheSize()
      expect(size).toBeGreaterThan(0)
    })

    it('should prune cache when exceeding max size', async () => {
      const manager = new CacheManager({
        cacheDir: testCacheDir,
        maxSize: 100 // Very small size
      })
      await manager.initialize()

      // 添加大量数据
      for (let i = 0; i < 10; i++) {
        await manager.set(`key${i}`, `value${i}`.repeat(100))
      }

      const stats = await manager.getStats()
      expect(stats.totalSize).toBeLessThanOrEqual(100)
    })
  })

  describe('destroy operations', () => {
    it('should destroy cache completely', async () => {
      const manager = new CacheManager({ cacheDir: testCacheDir })
      await manager.initialize()

      await manager.set('key1', 'value1')
      await manager.destroy()

      const stats = await manager.getStats()
      expect(stats.entryCount).toBe(0)

      const cacheFile = resolve(testCacheDir, 'cache.json')
      expect(existsSync(cacheFile)).toBe(false)
    })
  })

  describe('disabled cache', () => {
    it('should not cache when disabled', async () => {
      const manager = new CacheManager({
        cacheDir: testCacheDir,
        enabled: false
      })
      await manager.initialize()

      await manager.set('key1', 'value1')
      const value = await manager.get('key1')

      expect(value).toBeNull()
    })
  })
})
