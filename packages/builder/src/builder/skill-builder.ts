/**
 * Skill Builder
 * 核心构建器，协调配置、模板和转换
 */

import { mkdir, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import type { ResolvedConfig, Platform } from '../types/config'
import type {
  BuildOptions,
  BuildResult,
  PlatformBuildResult,
  BuildStatistics,
  BuildMetrics
} from '../types/builder'
import { ConfigLoader } from '../config'
import { TemplateEngine, TemplateContextManager } from '../template'
import { CacheManager } from '../cache'
import type { CacheConfig } from '../types/cache'
import {
  createErrorReporter,
  type ErrorReporter
} from '../utils/error-reporter'
import { PluginManager } from '../plugin'
import type { PluginContext } from '../types/plugin'

/**
 * 构建错误
 */
export class BuildError extends Error {
  constructor(
    message: string,
    public platform?: Platform,
    public cause?: Error
  ) {
    super(message)
    this.name = 'BuildError'
  }
}

/**
 * Skill构建器
 */
export class SkillBuilder {
  private config: ResolvedConfig
  private templateEngine: TemplateEngine
  private contextManager: TemplateContextManager
  private cacheManager: CacheManager
  private pluginManager: PluginManager
  private errorReporter: ErrorReporter
  private statistics: BuildStatistics

  constructor(config: ResolvedConfig, cacheConfig?: CacheConfig) {
    this.config = config
    this.templateEngine = new TemplateEngine()
    this.contextManager = new TemplateContextManager()
    this.cacheManager = new CacheManager(cacheConfig)
    this.pluginManager = new PluginManager()
    this.errorReporter = createErrorReporter()
    this.statistics = {
      templatesRendered: 0,
      filesCopied: 0,
      descriptionsCompressed: 0,
      totalSize: 0
    }
  }

  /**
   * 从配置文件创建Builder
   */
  static async fromConfig(
    configPath?: string,
    cacheConfig?: CacheConfig
  ): Promise<SkillBuilder> {
    const loader = new ConfigLoader()
    const config = await loader.load(configPath)
    const builder = new SkillBuilder(config, cacheConfig)
    await builder.cacheManager.initialize()
    await builder.pluginManager.initialize()
    return builder
  }

  /**
   * 构建所有启用的平台
   */
  async build(options: BuildOptions = {}): Promise<BuildResult> {
    const startTime = Date.now()
    const results: PlatformBuildResult[] = []
    const errors: Error[] = []
    const warnings: string[] = []

    const pluginContext = this.createPluginContext(undefined, options)
    this.pluginManager.resetMetrics()
    await this.pluginManager.onBuildStart(pluginContext)

    try {
      const enabledPlatforms = this.getEnabledPlatforms()

      if (enabledPlatforms.length === 0) {
        throw new BuildError('没有启用的平台，请检查配置文件')
      }

      if (options.clean ?? this.config.build.clean) {
        await this.cleanOutputDirs(enabledPlatforms)
      }

      const pLimit = (await import('p-limit')).default
      const concurrency = options.concurrency ?? 5
      const limit = pLimit(concurrency)

      if (options.verbose) {
        console.log(
          `\n🚀 Building ${enabledPlatforms.length} platform(s) with concurrency limit: ${concurrency}`
        )
      }

      const buildPromises = enabledPlatforms.map(platform =>
        limit(() =>
          this.buildForPlatform(platform, options).catch(error => {
            errors.push(error)
            this.errorReporter.fromError(error as Error, platform)
            return {
              platform,
              success: false,
              outputPath: this.getOutputPath(platform),
              size: 0,
              duration: 0,
              error: error as Error
            }
          })
        )
      )

      const platformResults = await Promise.all(buildPromises)
      results.push(...platformResults)

      for (const result of results) {
        if (result.warnings) {
          warnings.push(...result.warnings)
          for (const warning of result.warnings) {
            this.errorReporter.addWarning(warning, { file: result.platform })
          }
        }
      }

      if (this.errorReporter.hasErrors() || warnings.length > 0) {
        this.errorReporter.print({ verbose: options.verbose, colors: true })
      }

      const duration = Date.now() - startTime
      const metrics = await this.collectMetrics()

      const buildResult: BuildResult = {
        success: results.every(r => r.success) && errors.length === 0,
        platforms: results,
        duration,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
        metrics
      }

      await this.pluginManager.onBuildEnd(pluginContext, buildResult)

      return buildResult
    } catch (error) {
      await this.pluginManager.onError(pluginContext, error as Error)
      throw error
    }
  }

  /**
   * 构建特定平台
   */
  async buildForPlatform(
    platform: Platform,
    options: BuildOptions = {}
  ): Promise<PlatformBuildResult> {
    const startTime = Date.now()
    const warnings: string[] = []
    const pluginContext = this.createPluginContext(platform, options)

    try {
      await this.pluginManager.onPlatformBuildStart(pluginContext)

      if (options.verbose) {
        console.log(`\n🔨 Building for ${platform}...`)
      }

      // 1. 创建输出目录
      const outputPath = this.getOutputPath(platform)
      await mkdir(outputPath, { recursive: true })

      // 2. 渲染模板
      const renderResult = await this.renderTemplate(
        platform,
        options,
        pluginContext
      )
      const renderedContent = renderResult.content
      this.statistics.templatesRendered++

      // 3. 写入主文件
      const mainFile = resolve(outputPath, 'SKILL.md')
      await writeFile(mainFile, renderedContent, 'utf-8')

      // 4. 复制资源文件
      await this.copyResources(platform, outputPath, options, pluginContext)

      // 5. 计算输出大小
      const size = Buffer.byteLength(renderedContent, 'utf-8')
      this.statistics.totalSize += size

      if (options.verbose) {
        console.log(`✅ Built for ${platform} (${this.formatSize(size)})`)
      }

      const platformResult: PlatformBuildResult = {
        platform,
        success: true,
        outputPath,
        size,
        duration: Date.now() - startTime,
        warnings: warnings.length > 0 ? warnings : undefined
      }

      await this.pluginManager.onPlatformBuildEnd(pluginContext, platformResult)

      return platformResult
    } catch (error) {
      await this.pluginManager.onError(pluginContext, error as Error)
      throw new BuildError(
        `构建 ${platform} 平台失败: ${(error as Error).message}`,
        platform,
        error as Error
      )
    }
  }

  /**
   * 渲染模板
   */
  private async renderTemplate(
    platform: Platform,
    options: BuildOptions,
    pluginContext: PluginContext
  ): Promise<{ content: string; usedPartials: string[]; duration: number }> {
    try {
      // 读取入口模板
      const entryPath = resolve(this.config.root, this.config.source.entry)

      if (!existsSync(entryPath)) {
        throw new Error(`入口文件不存在: ${this.config.source.entry}`)
      }

      // 生成缓存键
      const templateHash = await this.cacheManager.generateFileHash(entryPath)
      const cacheKey = await this.cacheManager.generateCacheKey(entryPath, {
        include: this.getTemplateDependencies()
      })
      // 将平台信息添加到缓存键中
      const platformCacheKey = `${cacheKey}:${platform}`

      // 尝试从缓存获取
      if (!options.force) {
        const cached = await this.cacheManager.get<string>(platformCacheKey)
        if (cached) {
          if (options.verbose) {
            console.log(`  ✨ Using cached template for ${platform}`)
          }
          const adjusted = await this.pluginManager.onTemplateRendered(
            pluginContext,
            cached
          )
          return {
            content: adjusted ?? cached,
            usedPartials: [],
            duration: 0
          }
        }
      }

      // 创建模板上下文
      let templateContext = this.contextManager.createContext(
        this.config,
        platform
      )
      templateContext = await this.pluginManager.onTemplateRender(
        pluginContext,
        templateContext
      )

      if (options.verbose) {
        console.log(`  📝 Rendering template: ${this.config.source.entry}`)
      }

      // 渲染模板
      const result = await this.templateEngine.renderFile(
        entryPath,
        templateContext
      )
      let content = result.content

      const transformedContent = await this.pluginManager.onTemplateRendered(
        pluginContext,
        result.content
      )
      if (typeof transformedContent === 'string') {
        content = transformedContent
      }

      if (options.verbose && result.usedPartials.length > 0) {
        console.log(`  📦 Used partials: ${result.usedPartials.join(', ')}`)
      }

      // 缓存渲染结果
      await this.cacheManager.set(platformCacheKey, content, {
        hash: templateHash,
        dependencies: this.getTemplateDependencies(),
        tags: [platform, 'template']
      })

      return {
        content,
        usedPartials: result.usedPartials,
        duration: result.duration
      }
    } catch (error) {
      throw new BuildError(
        `模板渲染失败: ${(error as Error).message}`,
        platform,
        error as Error
      )
    }
  }

  /**
   * 获取模板依赖文件列表
   */
  private getTemplateDependencies(): string[] {
    const dependencies: string[] = []

    // 添加配置文件
    if (this.config.configPath) {
      dependencies.push(this.config.configPath)
    }

    // 添加入口模板
    const entryPath = resolve(this.config.root, this.config.source.entry)
    dependencies.push(entryPath)

    // 添加模板目录下的所有文件（如果有）
    if (this.config.source.templates) {
      const templates = Array.isArray(this.config.source.templates)
        ? this.config.source.templates
        : [this.config.source.templates]

      for (const template of templates) {
        const templatePath = resolve(this.config.root, template)
        dependencies.push(templatePath)
      }
    }

    return dependencies
  }

  /**
   * 复制资源文件
   */
  private async copyResources(
    platform: Platform,
    outputPath: string,
    options: BuildOptions,
    pluginContext: PluginContext
  ): Promise<void> {
    const patterns = this.getResourcePaths()

    const { copyFile } = await import('node:fs/promises')
    const { glob } = await import('glob')
    const discoveredFiles = new Set<string>()

    for (const pattern of patterns) {
      const files = await glob(pattern, {
        cwd: this.config.root,
        nodir: true,
        absolute: false
      })
      files.forEach(file => discoveredFiles.add(file))
    }

    let filesToCopy = Array.from(discoveredFiles)
    const modifiedFiles = await this.pluginManager.onResourceCopy(
      pluginContext,
      filesToCopy
    )
    if (Array.isArray(modifiedFiles)) {
      filesToCopy = Array.from(new Set(modifiedFiles))
    }

    if (filesToCopy.length === 0) {
      if (options.verbose && patterns.length > 0) {
        console.log(`  📁 No resource files to copy for ${platform}`)
      }
      return
    }

    if (options.verbose) {
      console.log(`  📁 Copying ${filesToCopy.length} resource file(s)...`)
    }

    for (const file of filesToCopy) {
      const sourcePath = resolve(this.config.root, file)
      const destPath = resolve(outputPath, file)

      await mkdir(dirname(destPath), { recursive: true })
      await copyFile(sourcePath, destPath)
      this.statistics.filesCopied++

      if (options.verbose) {
        console.log(`    → ${file}`)
      }
    }
  }

  /**
   * 获取资源文件路径模式
   */
  private getResourcePaths(): string[] {
    const paths: string[] = []

    const addPaths = (value: string | string[] | undefined) => {
      if (Array.isArray(value)) {
        paths.push(...value)
      } else if (typeof value === 'string' && value) {
        paths.push(value)
      }
    }

    addPaths(this.config.source.templates)
    addPaths(this.config.source.scripts)
    addPaths(this.config.source.resources)

    return paths
  }

  /**
   * 清理输出目录
   */
  private async cleanOutputDirs(platforms: Platform[]): Promise<void> {
    const cleanPromises = platforms.map(async platform => {
      const outputPath = this.getOutputPath(platform)
      if (existsSync(outputPath)) {
        await rm(outputPath, { recursive: true, force: true })
      }
    })

    await Promise.all(cleanPromises)
  }

  /**
   * 获取启用的平台
   */
  private getEnabledPlatforms(): Platform[] {
    return Object.entries(this.config.platforms)
      .filter(([_, config]) => config?.enabled)
      .map(([name]) => name as Platform)
  }

  /**
   * 获取平台输出路径
   */
  private getOutputPath(platform: Platform): string {
    const platformConfig = this.config.platforms[platform]
    if (!platformConfig) {
      throw new BuildError(`平台配置不存在: ${platform}`)
    }
    return resolve(this.config.root, platformConfig.output)
  }

  /**
   * 格式化文件大小
   */
  private formatSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`
    } else {
      return `${(bytes / 1024 / 1024).toFixed(2)} MB`
    }
  }

  /**
   * 获取构建统计信息
   */
  getStatistics(): BuildStatistics {
    return { ...this.statistics }
  }

  /**
   * 获取缓存管理器
   */
  getCacheManager(): CacheManager {
    return this.cacheManager
  }

  /**
   * 获取构建配置
   */
  getConfig(): ResolvedConfig {
    return this.config
  }

  /**
   * 获取插件管理器
   */
  getPluginManager(): PluginManager {
    return this.pluginManager
  }

  /**
   * 获取错误报告器
   */
  getErrorReporter(): ErrorReporter {
    return this.errorReporter
  }

  /**
   * 创建插件上下文
   */
  private createPluginContext(
    platform?: Platform,
    options: BuildOptions = {}
  ): PluginContext {
    return {
      config: this.config,
      options,
      platform
    }
  }

  /**
   * 汇总构建指标
   */
  private async collectMetrics(): Promise<BuildMetrics> {
    const metrics: BuildMetrics = {
      statistics: this.getStatistics()
    }

    try {
      metrics.cache = await this.cacheManager.getStats()
    } catch {
      // 缓存统计失败时忽略，不影响构建结果
    }

    const pluginMetrics = this.pluginManager.getMetrics()
    if (pluginMetrics.length > 0) {
      metrics.plugins = pluginMetrics
    }

    return metrics
  }
}
