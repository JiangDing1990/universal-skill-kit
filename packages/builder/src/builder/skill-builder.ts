/**
 * Skill Builder
 * 核心构建器，协调配置、模板和转换
 */

import { mkdir, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import type { ResolvedConfig, Platform } from '../types/config'
import type { BuildOptions, BuildResult, PlatformBuildResult, BuildStatistics } from '../types/builder'
import { ConfigLoader } from '../config'
import { TemplateEngine, TemplateContextManager } from '../template'

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
  private statistics: BuildStatistics

  constructor(config: ResolvedConfig) {
    this.config = config
    this.templateEngine = new TemplateEngine()
    this.contextManager = new TemplateContextManager()
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
  static async fromConfig(configPath?: string): Promise<SkillBuilder> {
    const loader = new ConfigLoader()
    const config = await loader.load(configPath)
    return new SkillBuilder(config)
  }

  /**
   * 构建所有启用的平台
   */
  async build(options: BuildOptions = {}): Promise<BuildResult> {
    const startTime = Date.now()
    const results: PlatformBuildResult[] = []
    const errors: Error[] = []
    const warnings: string[] = []

    // 获取启用的平台
    const enabledPlatforms = this.getEnabledPlatforms()

    if (enabledPlatforms.length === 0) {
      throw new BuildError('没有启用的平台，请检查配置文件')
    }

    // 清理输出目录（如果需要）
    if (options.clean ?? this.config.build.clean) {
      await this.cleanOutputDirs(enabledPlatforms)
    }

    // 并行构建所有平台
    const buildPromises = enabledPlatforms.map((platform) =>
      this.buildForPlatform(platform, options).catch((error) => {
        errors.push(error)
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

    const platformResults = await Promise.all(buildPromises)
    results.push(...platformResults)

    // 收集警告
    for (const result of results) {
      if (result.warnings) {
        warnings.push(...result.warnings)
      }
    }

    return {
      success: results.every((r) => r.success) && errors.length === 0,
      platforms: results,
      duration: Date.now() - startTime,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined
    }
  }

  /**
   * 构建特定平台
   */
  async buildForPlatform(platform: Platform, options: BuildOptions = {}): Promise<PlatformBuildResult> {
    const startTime = Date.now()
    const warnings: string[] = []

    try {
      if (options.verbose) {
        console.log(`\n🔨 Building for ${platform}...`)
      }

      // 1. 创建输出目录
      const outputPath = this.getOutputPath(platform)
      await mkdir(outputPath, { recursive: true })

      // 2. 渲染模板
      const renderedContent = await this.renderTemplate(platform, options)
      this.statistics.templatesRendered++

      // 3. 写入主文件
      const mainFile = resolve(outputPath, 'SKILL.md')
      await writeFile(mainFile, renderedContent, 'utf-8')

      // 4. 复制资源文件
      await this.copyResources(platform, outputPath, options)

      // 5. 计算输出大小
      const size = Buffer.byteLength(renderedContent, 'utf-8')
      this.statistics.totalSize += size

      if (options.verbose) {
        console.log(`✅ Built for ${platform} (${this.formatSize(size)})`)
      }

      return {
        platform,
        success: true,
        outputPath,
        size,
        duration: Date.now() - startTime,
        warnings: warnings.length > 0 ? warnings : undefined
      }
    } catch (error) {
      throw new BuildError(`构建 ${platform} 平台失败: ${(error as Error).message}`, platform, error as Error)
    }
  }

  /**
   * 渲染模板
   */
  private async renderTemplate(platform: Platform, options: BuildOptions): Promise<string> {
    try {
      // 创建模板上下文
      const context = this.contextManager.createContext(this.config, platform)

      // 读取入口模板
      const entryPath = resolve(this.config.root, this.config.source.entry)

      if (!existsSync(entryPath)) {
        throw new Error(`入口文件不存在: ${this.config.source.entry}`)
      }

      if (options.verbose) {
        console.log(`  📝 Rendering template: ${this.config.source.entry}`)
      }

      // 渲染模板
      const result = await this.templateEngine.renderFile(entryPath, context)

      if (options.verbose && result.usedPartials.length > 0) {
        console.log(`  📦 Used partials: ${result.usedPartials.join(', ')}`)
      }

      return result.content
    } catch (error) {
      throw new BuildError(`模板渲染失败: ${(error as Error).message}`, platform, error as Error)
    }
  }

  /**
   * 复制资源文件
   */
  private async copyResources(_platform: Platform, outputPath: string, options: BuildOptions): Promise<void> {
    const resources = this.getResourcePaths()

    if (resources.length === 0) {
      return
    }

    if (options.verbose) {
      console.log(`  📁 Copying ${resources.length} resource file(s)...`)
    }

    const { copyFile } = await import('node:fs/promises')
    const { glob } = await import('glob')

    for (const pattern of resources) {
      const files = await glob(pattern, {
        cwd: this.config.root,
        nodir: true,
        absolute: false
      })

      for (const file of files) {
        const sourcePath = resolve(this.config.root, file)
        const destPath = resolve(outputPath, file)

        // 确保目标目录存在
        await mkdir(dirname(destPath), { recursive: true })

        // 复制文件
        await copyFile(sourcePath, destPath)
        this.statistics.filesCopied++

        if (options.verbose) {
          console.log(`    → ${file}`)
        }
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
    const cleanPromises = platforms.map(async (platform) => {
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
}
