/**
 * Skill Analyzer
 * Skill分析器 - 分析skill的复杂度、质量和优化建议
 */

import type {
  SkillDefinition,
  AnalysisReport,
  Suggestion,
  CompressionStrategy
} from '../types'

/**
 * Skill Analyzer
 * 分析Skill并提供优化建议
 */
export class SkillAnalyzer {
  /**
   * Analyze a skill definition
   * 分析Skill定义
   */
  analyze(skill: SkillDefinition): AnalysisReport {
    const description = skill.metadata.description
    const body = skill.body

    // Analyze description length
    const descriptionLength = description.length

    // Detect code examples
    const hasCodeExamples = this.detectCodeExamples(body)

    // Extract technical keywords
    const technicalKeywords = this.extractTechnicalKeywords(
      description + ' ' + body
    )

    // Calculate complexity
    const complexity = this.calculateComplexity(skill)

    // Recommend compression strategy
    const recommendedStrategy = this.recommendCompressionStrategy(
      descriptionLength,
      complexity,
      hasCodeExamples
    )

    // Estimate quality
    const estimatedQuality = this.estimateQuality(skill)

    // Generate warnings and suggestions
    const warnings = this.generateWarnings(skill, descriptionLength)
    const suggestions = this.generateSuggestions(
      skill,
      complexity,
      descriptionLength,
      hasCodeExamples
    )

    return {
      complexity,
      descriptionLength,
      hasCodeExamples,
      technicalKeywords,
      recommendedStrategy,
      estimatedQuality,
      warnings,
      suggestions
    }
  }

  /**
   * Detect if skill contains code examples
   * 检测是否包含代码示例
   */
  private detectCodeExamples(text: string): boolean {
    // Check for code blocks
    if (/```[\s\S]*?```/g.test(text)) {
      return true
    }

    // Check for inline code with significant length
    if (/`[^`]{30,}`/g.test(text)) {
      return true
    }

    // Check for example markers
    if (/\b(example|示例|样例|e\.g\.|例如)[:：]/gi.test(text)) {
      return true
    }

    return false
  }

  /**
   * Extract technical keywords from text
   * 提取技术关键词
   */
  private extractTechnicalKeywords(text: string): string[] {
    const keywords = new Set<string>()

    // Programming languages and frameworks
    const techPatterns = [
      /\b(TypeScript|JavaScript|React|Vue|Angular|Node\.js|Python|Java|Go|Rust|Ruby|PHP|Swift|Kotlin)\b/gi,
      /\b(Express|FastAPI|Django|Flask|Spring|Rails|Laravel)\b/gi,
      /\b(API|REST|GraphQL|WebSocket|HTTP|HTTPS|JSON|YAML|XML|CSV)\b/gi,
      /\b(database|DB|SQL|NoSQL|PostgreSQL|MySQL|MongoDB|Redis|Elasticsearch)\b/gi,
      /\b(Docker|Kubernetes|CI\/CD|GitHub|GitLab|Jenkins|AWS|Azure|GCP)\b/gi,
      /\b(authentication|authorization|JWT|OAuth|SAML|SSO)\b/gi,
      /\b(frontend|backend|fullstack|serverless|microservices)\b/gi,
      /\b(component|module|service|middleware|plugin|hook|utility)\b/gi
    ]

    // Version numbers
    const versionPattern = /\b(v?\d+\.\d+(?:\.\d+)?(?:-\w+)?)\b/g

    for (const pattern of techPatterns) {
      const matches = text.match(pattern)
      if (matches) {
        matches.forEach(match => keywords.add(match))
      }
    }

    // Extract version numbers
    const versions = text.match(versionPattern)
    if (versions) {
      versions.forEach(v => keywords.add(v))
    }

    return Array.from(keywords)
  }

  /**
   * Calculate skill complexity
   * 计算复杂度
   */
  private calculateComplexity(
    skill: SkillDefinition
  ): 'high' | 'medium' | 'low' {
    let score = 0

    // Description length factor
    const descLen = skill.metadata.description.length
    if (descLen > 500) score += 3
    else if (descLen > 200) score += 2
    else score += 1

    // Body length factor
    const bodyLen = skill.body.length
    if (bodyLen > 2000) score += 3
    else if (bodyLen > 1000) score += 2
    else score += 1

    // Code examples factor
    if (this.detectCodeExamples(skill.body)) {
      score += 2
    }

    // Technical keywords factor
    const keywords = this.extractTechnicalKeywords(
      skill.metadata.description + ' ' + skill.body
    )
    if (keywords.length > 15) score += 3
    else if (keywords.length > 8) score += 2
    else if (keywords.length > 0) score += 1

    // Resources factor
    const resourceCount =
      (skill.resources.templates?.length || 0) +
      (skill.resources.references?.length || 0) +
      (skill.resources.scripts?.length || 0)
    if (resourceCount > 5) score += 2
    else if (resourceCount > 2) score += 1

    // Determine complexity level
    if (score >= 9) return 'high'
    if (score >= 5) return 'medium'
    return 'low'
  }

  /**
   * Recommend compression strategy based on analysis
   * 根据分析推荐压缩策略
   */
  private recommendCompressionStrategy(
    descriptionLength: number,
    complexity: 'high' | 'medium' | 'low',
    hasCodeExamples: boolean
  ): CompressionStrategy {
    // If description is short, use conservative
    if (descriptionLength <= 300) {
      return 'conservative'
    }

    // If description is very long, use aggressive
    if (descriptionLength > 800) {
      return 'aggressive'
    }

    // If has code examples, balanced or aggressive
    if (hasCodeExamples) {
      return descriptionLength > 600 ? 'aggressive' : 'balanced'
    }

    // Based on complexity
    if (complexity === 'high') {
      return descriptionLength > 500 ? 'aggressive' : 'balanced'
    }

    // Default to balanced
    return 'balanced'
  }

  /**
   * Estimate skill quality score
   * 评估质量分数 (0-100)
   */
  private estimateQuality(skill: SkillDefinition): number {
    let score = 100

    // Check description quality
    const desc = skill.metadata.description
    if (desc.length < 50) {
      score -= 20 // Too short
    } else if (desc.length > 1000) {
      score -= 10 // Too long
    }

    // Check if description is informative
    if (desc.split(' ').length < 10) {
      score -= 15 // Too few words
    }

    // Check body content
    const body = skill.body
    if (body.length < 100) {
      score -= 20 // Insufficient content
    }

    // Check metadata completeness
    if (!skill.metadata.version) score -= 5
    if (!skill.metadata.author) score -= 5
    if (!skill.metadata.tags || skill.metadata.tags.length === 0) score -= 5

    // Bonus for technical keywords
    const keywords = this.extractTechnicalKeywords(desc + ' ' + body)
    if (keywords.length >= 5) score += 10
    else if (keywords.length >= 3) score += 5

    // Bonus for structured body
    if (this.hasStructuredContent(body)) {
      score += 10
    }

    // Bonus for examples (but not too many)
    if (this.detectCodeExamples(body)) {
      const exampleCount = (body.match(/```/g) || []).length / 2
      if (exampleCount >= 1 && exampleCount <= 3) {
        score += 5
      } else if (exampleCount > 3) {
        score -= 5 // Too many examples
      }
    }

    // Ensure score is within range
    return Math.max(0, Math.min(100, score))
  }

  /**
   * Check if body has structured content
   * 检查是否有结构化内容
   */
  private hasStructuredContent(body: string): boolean {
    // Check for markdown headers
    const hasHeaders = /^#{1,6}\s+.+$/m.test(body)

    // Check for lists
    const hasLists = /^[-*+]\s+.+$/m.test(body) || /^\d+\.\s+.+$/m.test(body)

    return hasHeaders || hasLists
  }

  /**
   * Generate warnings based on analysis
   * 生成警告信息
   */
  private generateWarnings(
    skill: SkillDefinition,
    descriptionLength: number
  ): string[] {
    const warnings: string[] = []

    // Description length warnings
    if (descriptionLength > 500) {
      warnings.push(
        `Description is ${descriptionLength} characters (Codex limit: 500). Compression required.`
      )
    }

    if (descriptionLength < 50) {
      warnings.push('Description is too short. Consider adding more details.')
    }

    // Metadata warnings
    if (!skill.metadata.version) {
      warnings.push('Missing version number in metadata.')
    }

    if (!skill.metadata.tags || skill.metadata.tags.length === 0) {
      warnings.push('No tags specified. Tags help with discoverability.')
    }

    // Body warnings
    if (skill.body.length < 100) {
      warnings.push(
        'Body content is very short. Consider adding more information.'
      )
    }

    // Code examples warning
    const exampleCount = (skill.body.match(/```/g) || []).length / 2
    if (exampleCount > 5) {
      warnings.push(
        `Found ${exampleCount} code examples. Consider reducing for better compression.`
      )
    }

    return warnings
  }

  /**
   * Generate optimization suggestions
   * 生成优化建议
   */
  private generateSuggestions(
    skill: SkillDefinition,
    complexity: 'high' | 'medium' | 'low',
    descriptionLength: number,
    hasCodeExamples: boolean
  ): Suggestion[] {
    const suggestions: Suggestion[] = []

    // Description optimization
    if (descriptionLength > 500) {
      suggestions.push({
        type: 'optimization',
        message: `Use ${this.recommendCompressionStrategy(descriptionLength, complexity, hasCodeExamples)} compression strategy to reduce description to Codex limit (500 chars).`
      })
    }

    // Add version if missing
    if (!skill.metadata.version) {
      suggestions.push({
        type: 'info',
        message: 'Add a version number to track skill updates (e.g., "1.0.0").'
      })
    }

    // Add tags if missing
    if (!skill.metadata.tags || skill.metadata.tags.length === 0) {
      const keywords = this.extractTechnicalKeywords(
        skill.metadata.description + ' ' + skill.body
      )
      if (keywords.length > 0) {
        suggestions.push({
          type: 'info',
          message: `Consider adding tags based on detected keywords: ${keywords.slice(0, 5).join(', ')}`
        })
      }
    }

    // Code examples optimization
    if (hasCodeExamples && descriptionLength > 400) {
      suggestions.push({
        type: 'optimization',
        message:
          'Remove code examples from description to improve compression. Keep examples in body only.'
      })
    }

    // Structure optimization
    if (!this.hasStructuredContent(skill.body)) {
      suggestions.push({
        type: 'info',
        message:
          'Consider adding markdown headers or lists to improve readability.'
      })
    }

    // Complexity-based suggestions
    if (complexity === 'high') {
      suggestions.push({
        type: 'warning',
        message:
          'High complexity detected. Consider splitting into multiple smaller skills.'
      })
    }

    return suggestions
  }
}

/**
 * Create a new skill analyzer instance
 * 创建Skill分析器实例
 */
export function createSkillAnalyzer(): SkillAnalyzer {
  return new SkillAnalyzer()
}
