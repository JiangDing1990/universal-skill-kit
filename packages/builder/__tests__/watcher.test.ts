/**
 * Watcher 测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mkdir, writeFile, rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import { SkillBuilder } from '../src/builder/skill-builder'
import { SkillWatcher } from '../src/builder/watcher'

describe('SkillWatcher', () => {
  const testRoot = resolve(__dirname, 'fixtures', 'watcher-test')
  const configPath = resolve(testRoot, 'usk.config.json')
  let builder: SkillBuilder
  let watcher: SkillWatcher

  beforeEach(async () => {
    // 创建测试目录结构
    await mkdir(testRoot, { recursive: true })
    await mkdir(resolve(testRoot, 'src'), { recursive: true })
    await mkdir(resolve(testRoot, 'dist'), { recursive: true })

    // 创建配置文件
    const config = {
      name: 'watcher-test',
      version: '1.0.0',
      description: 'Watcher test',
      platforms: {
        claude: {
          enabled: true,
          output: './dist/claude'
        }
      },
      source: {
        entry: 'src/SKILL.md'
      },
      build: {
        clean: true,
        sourcemap: false,
        minify: false
      }
    }

    await writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8')

    // 创建入口文件
    await writeFile(
      resolve(testRoot, 'src', 'SKILL.md'),
      `---
name: {{name}}
version: {{version}}
---

# {{name}}

{{description}}
`,
      'utf-8'
    )

    // 创建 builder
    builder = await SkillBuilder.fromConfig(configPath)

    // 创建 watcher
    const builderConfig = (builder as any).config
    watcher = new SkillWatcher(builderConfig, builder)
  })

  afterEach(async () => {
    // 停止 watcher
    if (watcher && watcher.isWatching()) {
      await watcher.stop()
    }

    // 清理测试目录
    await rm(testRoot, { recursive: true, force: true })
  })

  describe('constructor', () => {
    it('should create watcher instance', () => {
      expect(watcher).toBeDefined()
      expect(watcher.isWatching()).toBe(false)
      expect(watcher.isCurrentlyBuilding()).toBe(false)
    })
  })

  describe('start', () => {
    it('should start watching files', async () => {
      const onChange = vi.fn()
      const onBuildComplete = vi.fn()

      // 启动 watcher（不等待，因为它会一直运行）
      const startPromise = watcher.start({
        verbose: false,
        onChange,
        onBuildComplete
      })

      // 等待初始构建完成
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 验证状态
      expect(watcher.isWatching()).toBe(true)
      expect(onBuildComplete).toHaveBeenCalledWith(true, expect.any(Number))

      // 停止 watcher
      await watcher.stop()

      // 确保 start promise 完成
      await Promise.race([
        startPromise,
        new Promise((resolve) => setTimeout(resolve, 100))
      ])
    }, 10000)

    it('should detect file changes and rebuild', async () => {
      const onChange = vi.fn()
      const onBuildComplete = vi.fn()

      // 启动 watcher
      const startPromise = watcher.start({
        verbose: false,
        debounceDelay: 100,
        onChange,
        onBuildComplete
      })

      // 等待初始构建完成
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 重置 mock
      onChange.mockClear()
      onBuildComplete.mockClear()

      // 修改文件
      await writeFile(
        resolve(testRoot, 'src', 'SKILL.md'),
        `---
name: {{name}}
version: {{version}}
---

# {{name}} Updated

{{description}}
`,
        'utf-8'
      )

      // 等待文件变化检测和重新构建
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // 验证回调被调用
      expect(onChange).toHaveBeenCalledWith(
        expect.stringContaining('SKILL.md')
      )
      expect(onBuildComplete).toHaveBeenCalledWith(true, expect.any(Number))

      // 停止 watcher
      await watcher.stop()

      // 确保 start promise 完成
      await Promise.race([
        startPromise,
        new Promise((resolve) => setTimeout(resolve, 100))
      ])
    }, 15000)

    it('should handle errors gracefully', async () => {
      const onError = vi.fn()
      const onBuildComplete = vi.fn()

      // 启动 watcher
      const startPromise = watcher.start({
        verbose: false,
        onError,
        onBuildComplete
      })

      // 等待初始构建完成
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 删除入口文件以触发错误
      await rm(resolve(testRoot, 'src', 'SKILL.md'), { force: true })

      // 等待错误检测
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // 停止 watcher
      await watcher.stop()

      // 确保 start promise 完成
      await Promise.race([
        startPromise,
        new Promise((resolve) => setTimeout(resolve, 100))
      ])
    }, 15000)
  })

  describe('stop', () => {
    it('should stop watching', async () => {
      // 启动 watcher
      const startPromise = watcher.start({
        verbose: false
      })

      // 等待初始构建完成
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 验证正在监听
      expect(watcher.isWatching()).toBe(true)

      // 停止 watcher
      await watcher.stop()

      // 验证已停止
      expect(watcher.isWatching()).toBe(false)

      // 确保 start promise 完成
      await Promise.race([
        startPromise,
        new Promise((resolve) => setTimeout(resolve, 100))
      ])
    }, 10000)
  })
})
