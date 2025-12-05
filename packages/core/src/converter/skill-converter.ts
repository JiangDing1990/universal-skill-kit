/**
 * Skill Converter
 * Skill转换器 - 在Claude和Codex平台间转换
 */

import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { SkillParser } from '../parser/skill-parser'
import { DescriptionCompressor } from '../optimizer/description-compressor'
import { SkillAnalyzer } from '../analyzer/skill-analyzer'
import { PathMapper } from '@usk/utils'
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

  constructor() {
    this.parser = new SkillParser()
    this.compressor = new DescriptionCompressor()
    this.analyzer = new SkillAnalyzer()
    this.pathMapper = new PathMapper()
  }

  /**
   * Convert a skill to target platform
   * 转换Skill到目标平台
   */
  async convert(
    skillPath: string,
    options: ConvertOptions
  ): Promise<ConversionResult> {
    const startTime = Date.now()

    try {
      // 1. Read and parse skill
      const content = await fs.readFile(skillPath, 'utf-8')
      const skill = await this.parser.parse(content)

      // 2. Analyze skill
      const analysis = this.analyzer.analyze(skill)

      // 3. Determine source platform
      const sourcePlatform = this.detectSourcePlatform(skillPath)

      // 4. Convert to target platform
      const convertedSkill = await this.convertSkill(
        skill,
        sourcePlatform,
        options.targetPlatform,
        options.compressionStrategy || analysis.recommendedStrategy
      )

      // 5. Determine output path
      const outputPath = this.determineOutputPath(
        skillPath,
        options.targetPlatform,
        options.outputDir
      )

      // 6. Write converted skill
      await this.writeSkill(convertedSkill, outputPath)

      // 7. Calculate statistics
      const duration = Date.now() - startTime
      const statistics = this.calculateStatistics(
        skill,
        convertedSkill,
        duration
      )

      return {
        success: true,
        platform: options.targetPlatform,
        outputPath,
        metadata: convertedSkill.metadata,
        quality: analysis.estimatedQuality,
        statistics
      }
    } catch (error) {
      throw new Error(
        `Conversion failed: ${error instanceof Error ? error.message : String(error)}`
      )
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
    converted.body = this.pathMapper.mapPathsInText(
      skill.body,
      targetPlatform
    )

    // Convert resource paths
    converted.resources = {
      templates: skill.resources.templates?.map((t) =>
        this.pathMapper.mapPath(t, targetPlatform).mappedPath
      ),
      references: skill.resources.references?.map((r) =>
        this.pathMapper.mapPath(r, targetPlatform).mappedPath
      ),
      scripts: skill.resources.scripts?.map((s) =>
        this.pathMapper.mapPath(s, targetPlatform).mappedPath
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
      maxLength: 500,
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
   * Determine output path for converted skill
   * 确定转换后的输出路径
   */
  private determineOutputPath(
    sourcePath: string,
    targetPlatform: Platform,
    outputDir?: string
  ): string {
    if (outputDir) {
      // Use provided output directory
      const basename = path.basename(sourcePath)
      return path.join(outputDir, basename)
    }

    // Convert path to target platform's default location
    const result = this.pathMapper.mapPath(sourcePath, targetPlatform)
    return result.mappedPath
  }

  /**
   * Write converted skill to file
   * 写入转换后的Skill
   */
  private async writeSkill(
    skill: SkillDefinition,
    outputPath: string
  ): Promise<void> {
    // Ensure output directory exists
    const dir = path.dirname(outputPath)
    await fs.mkdir(dir, { recursive: true })

    // Generate YAML frontmatter
    const frontmatter = this.generateFrontmatter(skill.metadata)

    // Combine frontmatter and body
    const content = `---\n${frontmatter}---\n\n${skill.body}`

    // Write to file
    await fs.writeFile(outputPath, content, 'utf-8')
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
      metadata.tags.forEach((tag) => {
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
    const convertedText =
      converted.metadata.description + ' ' + converted.body
    const preservedKeywords = originalKeywords.filter((kw) =>
      convertedText.includes(kw)
    )

    // Find lost keywords
    const lostInformation = originalKeywords.filter(
      (kw) => !convertedText.includes(kw)
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
      versions.forEach((v) => keywords.add(v))
    }

    // Extract common tech terms
    const techTerms =
      /\b(TypeScript|JavaScript|React|Vue|Angular|Node\.js|Python|Java|API|REST|GraphQL)\b/gi
    const matches = text.match(techTerms)
    if (matches) {
      matches.forEach((m) => keywords.add(m))
    }

    return Array.from(keywords)
  }

  /**
   * Batch convert multiple skills
   * 批量转换多个Skills
   */
  async convertBatch(
    skillPaths: string[],
    options: ConvertOptions
  ): Promise<ConversionResult[]> {
    const results: ConversionResult[] = []

    for (const skillPath of skillPaths) {
      try {
        const result = await this.convert(skillPath, options)
        results.push(result)
      } catch (error) {
        // Continue with other files even if one fails
        console.error(
          `Failed to convert ${skillPath}: ${error instanceof Error ? error.message : String(error)}`
        )
        results.push({
          success: false,
          platform: options.targetPlatform,
          outputPath: '',
          metadata: {
            name: path.basename(skillPath),
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
          }
        })
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
