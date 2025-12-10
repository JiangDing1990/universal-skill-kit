import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { rm, readFile, mkdir } from 'node:fs/promises'
import { SkillBuilder, BuildError } from '../src/builder'
import { ConfigLoader } from '../src/config'

describe('SkillBuilder', () => {
  const fixturesDir = resolve(__dirname, 'fixtures/build-test')
  const distDir = resolve(fixturesDir, 'dist')

  // 每次测试前确保dist目录存在
  beforeEach(async () => {
    if (!existsSync(distDir)) {
      await mkdir(distDir, { recursive: true })
    }
  })

  // 每次测试后清理输出目录
  afterEach(async () => {
    if (existsSync(distDir)) {
      await rm(distDir, { recursive: true, force: true })
    }
  })

  describe('fromConfig', () => {
    it('should create builder from config file', async () => {
      const configPath = resolve(fixturesDir, 'usk.config.json')
      const builder = await SkillBuilder.fromConfig(configPath)

      expect(builder).toBeInstanceOf(SkillBuilder)
    })

    it('should throw error for non-existent config', async () => {
      await expect(
        SkillBuilder.fromConfig('/non/existent/path')
      ).rejects.toThrow()
    })
  })

  describe('build', () => {
    it('should build all enabled platforms', async () => {
      const configPath = resolve(fixturesDir, 'usk.config.json')
      const builder = await SkillBuilder.fromConfig(configPath)

      const result = await builder.build()

      expect(result.success).toBe(true)
      expect(result.platforms).toHaveLength(2)
      expect(result.duration).toBeGreaterThan(0)

      // 检查Claude平台
      const claudeResult = result.platforms.find(p => p.platform === 'claude')
      expect(claudeResult).toBeDefined()
      expect(claudeResult?.success).toBe(true)
      expect(claudeResult?.size).toBeGreaterThan(0)

      // 检查Codex平台
      const codexResult = result.platforms.find(p => p.platform === 'codex')
      expect(codexResult).toBeDefined()
      expect(codexResult?.success).toBe(true)
      expect(codexResult?.size).toBeGreaterThan(0)
    })

    it('should create output directories', async () => {
      const configPath = resolve(fixturesDir, 'usk.config.json')
      const builder = await SkillBuilder.fromConfig(configPath)

      await builder.build()

      expect(existsSync(resolve(distDir, 'claude'))).toBe(true)
      expect(existsSync(resolve(distDir, 'codex'))).toBe(true)
    })

    it('should generate SKILL.md for each platform', async () => {
      const configPath = resolve(fixturesDir, 'usk.config.json')
      const builder = await SkillBuilder.fromConfig(configPath)

      await builder.build()

      const claudeSkill = resolve(distDir, 'claude/SKILL.md')
      const codexSkill = resolve(distDir, 'codex/SKILL.md')

      expect(existsSync(claudeSkill)).toBe(true)
      expect(existsSync(codexSkill)).toBe(true)

      // 验证内容
      const claudeContent = await readFile(claudeSkill, 'utf-8')
      const codexContent = await readFile(codexSkill, 'utf-8')

      expect(claudeContent).toContain('build-test-skill')
      expect(claudeContent).toContain('Claude Platform')
      expect(claudeContent).not.toContain('Codex Platform')

      expect(codexContent).toContain('build-test-skill')
      expect(codexContent).toContain('Codex Platform')
      expect(codexContent).not.toContain('Claude Platform')
    })

    it('should copy resource files', async () => {
      const configPath = resolve(fixturesDir, 'usk.config.json')
      const builder = await SkillBuilder.fromConfig(configPath)

      await builder.build()

      // 检查Claude平台的资源
      expect(existsSync(resolve(distDir, 'claude/templates/example.md'))).toBe(
        true
      )
      expect(existsSync(resolve(distDir, 'claude/scripts/setup.sh'))).toBe(true)
      expect(existsSync(resolve(distDir, 'claude/resources/config.yaml'))).toBe(
        true
      )

      // 检查Codex平台的资源
      expect(existsSync(resolve(distDir, 'codex/templates/example.md'))).toBe(
        true
      )
      expect(existsSync(resolve(distDir, 'codex/scripts/setup.sh'))).toBe(true)
      expect(existsSync(resolve(distDir, 'codex/resources/config.yaml'))).toBe(
        true
      )
    })

    it('should clean output directory when clean option is true', async () => {
      const configPath = resolve(fixturesDir, 'usk.config.json')
      const builder = await SkillBuilder.fromConfig(configPath)

      // 第一次构建
      await builder.build()
      expect(existsSync(resolve(distDir, 'claude'))).toBe(true)

      // 第二次构建（应该清理）
      await builder.build({ clean: true })
      expect(existsSync(resolve(distDir, 'claude'))).toBe(true)
    })

    it('should handle build with verbose option', async () => {
      const configPath = resolve(fixturesDir, 'usk.config.json')
      const builder = await SkillBuilder.fromConfig(configPath)

      // 不抛出错误即可
      await expect(builder.build({ verbose: true })).resolves.toBeDefined()
    })

    it('should expose build metrics', async () => {
      const configPath = resolve(fixturesDir, 'usk.config.json')
      const builder = await SkillBuilder.fromConfig(configPath)

      const result = await builder.build()

      expect(result.metrics).toBeDefined()
      expect(result.metrics?.statistics.templatesRendered).toBeGreaterThan(0)
      expect(result.metrics?.statistics.totalSize).toBeGreaterThan(0)
      expect(result.metrics?.cache).toBeDefined()
      expect(result.metrics?.plugins?.length ?? 0).toBe(0)
    })
  })

  describe('buildForPlatform', () => {
    it('should build single platform', async () => {
      const configPath = resolve(fixturesDir, 'usk.config.json')
      const loader = new ConfigLoader()
      const config = await loader.load(configPath)
      const builder = new SkillBuilder(config)

      const result = await builder.buildForPlatform('claude')

      expect(result.success).toBe(true)
      expect(result.platform).toBe('claude')
      expect(result.size).toBeGreaterThan(0)
      expect(result.duration).toBeGreaterThan(0)
      expect(existsSync(resolve(distDir, 'claude/SKILL.md'))).toBe(true)
    })

    it('should throw error for invalid platform', async () => {
      const configPath = resolve(fixturesDir, 'usk.config.json')
      const loader = new ConfigLoader()
      const config = await loader.load(configPath)
      const builder = new SkillBuilder(config)

      // @ts-ignore - 测试无效平台
      await expect(builder.buildForPlatform('invalid')).rejects.toThrow(
        BuildError
      )
    })
  })

  describe('getStatistics', () => {
    it('should return build statistics', async () => {
      const configPath = resolve(fixturesDir, 'usk.config.json')
      const builder = await SkillBuilder.fromConfig(configPath)

      await builder.build()

      const stats = builder.getStatistics()

      expect(stats.templatesRendered).toBe(2) // claude + codex
      expect(stats.filesCopied).toBeGreaterThan(0) // 资源文件
      expect(stats.totalSize).toBeGreaterThan(0)
    })
  })
})
