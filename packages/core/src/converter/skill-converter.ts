/**
 * Skill Converter
 * Skill转换器 - 在Claude和Codex平台间转换
 */

import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { SkillParser } from '../parser/skill-parser'
import { DescriptionCompressor } from '../optimizer/description-compressor'
import { SkillAnalyzer } from '../analyzer/skill-analyzer'
import { PathMapper, getLogger } from '@jiangding/usk-utils'
import { SkillNotFoundError, ConversionError } from '../errors'
import { LIMITS, SKILL_FILES, SCRIPT_EXTENSIONS } from '../constants'
import type {
  Platform,
  SkillDefinition,
  ConvertOptions,
  ConversionResult,
  CompressionOptions
} from '../types'

/**
 * Skill Converter
 * 转换Skill在不同平台间
 */
export class SkillConverter {
  private parser: SkillParser
  private compressor: DescriptionCompressor
  private analyzer: SkillAnalyzer
  private pathMapper: PathMapper
  private logger = getLogger()

  constructor() {
    this.parser = new SkillParser()
    this.compressor = new DescriptionCompressor()
    this.analyzer = new SkillAnalyzer()
    this.pathMapper = new PathMapper()
  }

  /**
   * Convert a skill to target platform
   * 转换Skill到目标平台
   *
   * @param skillPath - Path to skill file or directory
   * @param options - Conversion options
   */
  async convert(
    skillPath: string,
    options: ConvertOptions
  ): Promise<ConversionResult> {
    const startTime = Date.now()

    try {
      this.logger.debug(`开始转换: ${skillPath}`)
      this.logger.debug(`目标平台: ${options.targetPlatform}`)

      // 1. Detect input type (file or directory)
      const stats = await fs.stat(skillPath)
      const isDirectory = stats.isDirectory()
      this.logger.debug(`输入类型: ${isDirectory ? '目录' : '文件'}`)

      // 2. Determine work directory and main file
      let workDir: string
      let mainFile: string

      if (isDirectory) {
        workDir = skillPath
        mainFile = path.join(skillPath, SKILL_FILES.MAIN)

        // Verify main file exists
        try {
          await fs.access(mainFile)
        } catch {
          throw new SkillNotFoundError(mainFile)
        }
      } else {
        workDir = path.dirname(skillPath)
        mainFile = skillPath
      }

      // 3. Parse skill
      this.logger.debug(`解析 Skill: ${mainFile}`)
      const skill = await this.parser.parse(mainFile)
      this.logger.debug(`Skill 名称: ${skill.metadata.name}`)

      // 4. Analyze skill
      this.logger.debug('分析 Skill 质量')
      const analysis = this.analyzer.analyze(skill)
      this.logger.debug(`质量分数: ${analysis.estimatedQuality}/100`)
      this.logger.debug(`推荐策略: ${analysis.recommendedStrategy}`)

      // 5. Determine source platform
      const sourcePlatform = this.detectSourcePlatform(mainFile)
      this.logger.debug(`源平台: ${sourcePlatform}`)

      // 6. Collect all skill files (main file + resources)
      this.logger.debug('收集资源文件')
      const allFiles = await this.collectSkillFiles(workDir, skill)
      this.logger.debug(`找到 ${allFiles.length} 个资源文件`)

      // 7. Convert skill definition
      const convertedSkill = await this.convertSkill(
        skill,
        sourcePlatform,
        options.targetPlatform,
        options.compressionStrategy || analysis.recommendedStrategy
      )

      // 8. Determine output paths
      const outputPath = this.determineOutputPath(
        skillPath, // Use original skillPath instead of mainFile
        options.targetPlatform,
        options.outputDir,
        isDirectory
      )
      const outputDir = isDirectory ? outputPath : path.dirname(outputPath)
      const outputFilePath = isDirectory
        ? path.join(outputPath, 'SKILL.md')
        : outputPath

      // 9. Write converted skill
      await this.writeSkill(convertedSkill, outputFilePath)

      // 10. Copy resource files
      if (allFiles.length > 0) {
        this.logger.debug(`复制 ${allFiles.length} 个资源文件`)
        await this.copyResources(
          allFiles,
          workDir,
          outputDir,
          options.targetPlatform
        )
      }

      // 11. Calculate statistics
      const duration = Date.now() - startTime
      const statistics = this.calculateStatistics(
        skill,
        convertedSkill,
        duration
      )

      this.logger.debug(`转换完成，耗时: ${duration}ms`)
      this.logger.debug(`压缩率: ${statistics.compressionRate.toFixed(1)}%`)
      this.logger.debug(`保留关键词: ${statistics.preservedKeywords.length} 个`)

      return {
        success: true,
        platform: options.targetPlatform,
        outputPath: outputFilePath,
        metadata: convertedSkill.metadata,
        quality: analysis.estimatedQuality,
        statistics
      }
    } catch (error) {
      // Re-throw USK errors as-is
      if (
        error instanceof SkillNotFoundError ||
        error instanceof ConversionError
      ) {
        throw error
      }

      // Wrap other errors in ConversionError
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      throw new ConversionError(skillPath, errorMessage, error as Error)
    }
  }

  /**
   * Convert skill definition to target platform
   * 转换Skill定义到目标平台
   */
  private async convertSkill(
    skill: SkillDefinition,
    sourcePlatform: Platform,
    targetPlatform: Platform,
    strategy: string
  ): Promise<SkillDefinition> {
    // If same platform, return as-is
    if (sourcePlatform === targetPlatform) {
      return skill
    }

    const converted = { ...skill }

    // Convert description if targeting Codex (500 char limit)
    if (targetPlatform === 'codex') {
      converted.metadata = {
        ...skill.metadata,
        description: this.compressDescription(
          skill.metadata.description,
          strategy as 'conservative' | 'balanced' | 'aggressive'
        )
      }
    }

    // Convert paths in body
    converted.body = this.pathMapper.mapPathsInText(skill.body, targetPlatform)

    // Convert resource paths
    converted.resources = {
      templates: skill.resources.templates?.map(
        t => this.pathMapper.mapPath(t, targetPlatform).mappedPath
      ),
      references: skill.resources.references?.map(
        r => this.pathMapper.mapPath(r, targetPlatform).mappedPath
      ),
      scripts: skill.resources.scripts?.map(
        s => this.pathMapper.mapPath(s, targetPlatform).mappedPath
      )
    }

    return converted
  }

  /**
   * Compress description for Codex platform
   * 为Codex平台压缩描述
   */
  private compressDescription(
    description: string,
    strategy: 'conservative' | 'balanced' | 'aggressive'
  ): string {
    const options: CompressionOptions = {
      maxLength: LIMITS.CODEX_DESCRIPTION_MAX_LENGTH,
      preserveKeywords: true,
      removeExamples: true,
      strategy
    }

    const result = this.compressor.compress(description, options)
    return result.text
  }

  /**
   * Detect source platform from skill path
   * 从路径检测源平台
   */
  private detectSourcePlatform(skillPath: string): Platform {
    const detected = this.pathMapper.detectPlatform(skillPath)
    return detected || 'claude' // Default to Claude
  }

  /**
   * Collect all files associated with a skill
   * 收集Skill相关的所有文件
   *
   * @param skillDir - Skill directory
   * @param _skill - Parsed skill definition (not used in new implementation)
   * @returns List of resource file paths
   */
  private async collectSkillFiles(
    skillDir: string,
    _skill: SkillDefinition
  ): Promise<string[]> {
    // Files and directories to exclude
    const excludePatterns = [
      'node_modules',
      '.git',
      '.gitignore',
      '.DS_Store',
      'dist',
      'build',
      '.usk-cache',
      '.cache',
      'coverage',
      '.vscode',
      '.idea',
      '*.log',
      '.env',
      '.env.local'
    ]

    // Capture 'this' context for use in nested function
    const logger = this.logger

    /**
     * Recursively scan directory for all files
     * 递归扫描目录获取所有文件
     */
    async function scanDirectory(dir: string): Promise<string[]> {
      const foundFiles: string[] = []

      try {
        const entries = await fs.readdir(dir, { withFileTypes: true })

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name)
          const relativePath = path.relative(skillDir, fullPath)

          // Skip if matches exclude patterns
          const shouldExclude = excludePatterns.some(pattern => {
            if (pattern.includes('*')) {
              // Handle wildcard patterns
              const regex = new RegExp(
                '^' + pattern.replace(/\*/g, '.*').replace(/\./g, '\\.') + '$'
              )
              return regex.test(entry.name)
            }
            // Exact match or directory match
            return (
              entry.name === pattern ||
              relativePath === pattern ||
              relativePath.startsWith(pattern + path.sep)
            )
          })

          if (shouldExclude) {
            continue
          }

          // Skip SKILL.md (main file, handled separately)
          if (entry.name === 'SKILL.md' && dir === skillDir) {
            continue
          }

          if (entry.isDirectory()) {
            // Recursively scan subdirectory
            const subFiles = await scanDirectory(fullPath)
            foundFiles.push(...subFiles)
          } else if (entry.isFile()) {
            foundFiles.push(fullPath)
          }
        }
      } catch (error) {
        logger.warn(
          `Failed to scan directory ${dir}: ${error instanceof Error ? error.message : String(error)}`
        )
      }

      return foundFiles
    }

    // Scan the entire skill directory
    this.logger.debug(`扫描目录: ${skillDir}`)
    const allFiles = await scanDirectory(skillDir)
    this.logger.debug(`找到 ${allFiles.length} 个文件`)

    return allFiles
  }

  /**
   * Copy resource files to target directory
   * 复制资源文件到目标目录
   *
   * @param files - List of source file paths
   * @param sourceDir - Source directory
   * @param targetDir - Target directory
   * @param _targetPlatform - Target platform for path mapping (reserved for future use)
   */
  private async copyResources(
    files: string[],
    sourceDir: string,
    targetDir: string,
    _targetPlatform: Platform
  ): Promise<void> {
    for (const file of files) {
      try {
        // Calculate relative path from source directory
        const relativePath = path.relative(sourceDir, file)

        // Map to target platform path structure
        const targetPath = path.join(targetDir, relativePath)

        // Ensure target directory exists
        await fs.mkdir(path.dirname(targetPath), { recursive: true })

        // Copy file
        await fs.copyFile(file, targetPath)

        // If it's a script file, preserve executable permissions
        const isScript = SCRIPT_EXTENSIONS.some(ext => file.endsWith(ext))
        if (isScript) {
          try {
            await fs.chmod(targetPath, 0o755)
          } catch {
            // Ignore chmod errors (e.g., on Windows)
          }
        }
      } catch (error) {
        console.warn(
          `Warning: Failed to copy resource file ${file}: ${error instanceof Error ? error.message : String(error)}`
        )
      }
    }
  }

  /**
   * Determine output path for converted skill
   * 确定转换后的输出路径
   *
   * @param sourcePath - Source file or directory path
   * @param targetPlatform - Target platform
   * @param outputDir - Optional output directory
   * @param isDirectory - Whether source is a directory
   */
  private determineOutputPath(
    sourcePath: string,
    targetPlatform: Platform,
    outputDir?: string,
    isDirectory?: boolean
  ): string {
    if (outputDir) {
      // Use provided output directory
      if (isDirectory) {
        // Keep directory name
        const dirName = path.basename(sourcePath)
        return path.join(outputDir, dirName)
      } else {
        const basename = path.basename(sourcePath)
        return path.join(outputDir, basename)
      }
    }

    // Convert path to target platform's default location
    const result = this.pathMapper.mapPath(sourcePath, targetPlatform)
    return result.mappedPath
  }

  /**
   * Write converted skill to file
   * 写入转换后的Skill
   *
   * @param skill - Skill definition to write
   * @param outputPath - Output path (file or directory)
   */
  private async writeSkill(
    skill: SkillDefinition,
    outputPath: string
  ): Promise<void> {
    // Determine actual file path
    let filePath: string
    try {
      const stats = await fs.stat(outputPath).catch(() => null)
      if (stats?.isDirectory()) {
        filePath = path.join(outputPath, 'SKILL.md')
      } else {
        filePath = outputPath
      }
    } catch {
      // If path doesn't exist yet, check if it has an extension
      if (path.extname(outputPath)) {
        filePath = outputPath
      } else {
        // Assume it's a directory
        filePath = path.join(outputPath, 'SKILL.md')
      }
    }

    // Ensure output directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true })

    // Generate YAML frontmatter
    const frontmatter = this.generateFrontmatter(skill.metadata)

    // Combine frontmatter and body
    const content = `---\n${frontmatter}---\n\n${skill.body}`

    // Write to file
    await fs.writeFile(filePath, content, 'utf-8')
  }

  /**
   * Generate YAML frontmatter from metadata
   * 从metadata生成YAML frontmatter
   */
  private generateFrontmatter(metadata: SkillDefinition['metadata']): string {
    const lines: string[] = []

    lines.push(`name: ${metadata.name}`)

    if (metadata.version) {
      lines.push(`version: ${metadata.version}`)
    }

    lines.push(`description: ${JSON.stringify(metadata.description)}`)

    if (metadata.author) {
      lines.push(`author: ${metadata.author}`)
    }

    if (metadata.tags && metadata.tags.length > 0) {
      lines.push(`tags:`)
      metadata.tags.forEach(tag => {
        lines.push(`  - ${tag}`)
      })
    }

    return lines.join('\n') + '\n'
  }

  /**
   * Calculate conversion statistics
   * 计算转换统计
   */
  private calculateStatistics(
    original: SkillDefinition,
    converted: SkillDefinition,
    duration: number
  ) {
    const originalLength = original.metadata.description.length
    const finalLength = converted.metadata.description.length
    const compressionRate =
      originalLength > 0
        ? ((originalLength - finalLength) / originalLength) * 100
        : 0

    // Extract keywords from original
    const originalKeywords = this.extractKeywords(
      original.metadata.description + ' ' + original.body
    )

    // Check which keywords were preserved
    const convertedText = converted.metadata.description + ' ' + converted.body
    const preservedKeywords = originalKeywords.filter(kw =>
      convertedText.includes(kw)
    )

    // Find lost keywords
    const lostInformation = originalKeywords.filter(
      kw => !convertedText.includes(kw)
    )

    return {
      originalLength,
      finalLength,
      compressionRate,
      preservedKeywords,
      lostInformation,
      duration
    }
  }

  /**
   * Extract basic keywords from text
   * 从文本提取基本关键词
   */
  private extractKeywords(text: string): string[] {
    const keywords = new Set<string>()

    // Extract version numbers
    const versions = text.match(/\b(v?\d+\.\d+(?:\.\d+)?)\b/g)
    if (versions) {
      versions.forEach(v => keywords.add(v))
    }

    // Extract common tech terms
    const techTerms =
      /\b(TypeScript|JavaScript|React|Vue|Angular|Node\.js|Python|Java|API|REST|GraphQL)\b/gi
    const matches = text.match(techTerms)
    if (matches) {
      matches.forEach(m => keywords.add(m))
    }

    return Array.from(keywords)
  }

  /**
   * Batch convert multiple skills
   * 批量转换多个Skills
   *
   * @param skillPaths - Array of skill paths to convert
   * @param options - Conversion options
   * @param onProgress - Optional progress callback (currentIndex, total, skillPath)
   */
  async convertBatch(
    skillPaths: string[],
    options: ConvertOptions,
    onProgress?: (current: number, total: number, skillPath: string) => void
  ): Promise<ConversionResult[]> {
    // Use parallel processing with concurrency limit
    const concurrency =
      options.parallel !== false ? LIMITS.BATCH_CONCURRENCY : 1
    const results: ConversionResult[] = []

    // Process in batches to avoid overwhelming the system
    for (let i = 0; i < skillPaths.length; i += concurrency) {
      const batch = skillPaths.slice(i, i + concurrency)

      const batchResults = await Promise.allSettled(
        batch.map(async (skillPath, batchIndex) => {
          const currentIndex = i + batchIndex

          // Call progress callback if provided
          if (onProgress) {
            onProgress(currentIndex + 1, skillPaths.length, skillPath)
          }

          try {
            return await this.convert(skillPath, options)
          } catch (error) {
            // Return error result for failed conversion
            throw new Error(
              `Conversion failed: ${error instanceof Error ? error.message : String(error)}`
            )
          }
        })
      )

      // Process batch results
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value)
        } else {
          // Handle failed conversion
          const errorMessage =
            result.reason instanceof Error
              ? result.reason.message
              : String(result.reason)

          results.push({
            success: false,
            platform: options.targetPlatform,
            outputPath: '',
            metadata: {
              name: 'unknown',
              version: '0.0.0',
              description: ''
            },
            quality: 0,
            statistics: {
              originalLength: 0,
              finalLength: 0,
              compressionRate: 0,
              preservedKeywords: [],
              lostInformation: [],
              duration: 0
            },
            error: errorMessage
          })
        }
      }
    }

    return results
  }
}

/**
 * Create a new skill converter instance
 * 创建Skill转换器实例
 */
export function createSkillConverter(): SkillConverter {
  return new SkillConverter()
}
