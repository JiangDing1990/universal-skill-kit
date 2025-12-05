/**
 * Skill Validator
 * Skill验证器 - 验证Skill定义的完整性和正确性
 */

import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import type {
  SkillDefinition,
  Platform,
  ValidationResult,
  ValidationError,
  ValidationWarning
} from '../types'

/**
 * Skill Validator
 * 验证Skill定义
 */
export class SkillValidator {
  /**
   * Validate a skill definition
   * 验证Skill定义
   *
   * @param skill - Skill definition to validate
   * @param skillPath - Path to skill file or directory
   * @returns Validation result
   */
  async validate(
    skill: SkillDefinition,
    skillPath: string
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // 1. Validate metadata
    this.validateMetadata(skill, errors, warnings)

    // 2. Validate description length
    this.validateDescriptionLength(skill, warnings)

    // 3. Validate body content
    this.validateBody(skill, errors, warnings)

    // 4. Validate resource file existence
    await this.validateResources(skill, skillPath, errors, warnings)

    // 5. Check for common issues
    this.checkCommonIssues(skill, warnings)

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Validate skill for conversion to specific platform
   * 验证Skill是否适合转换到特定平台
   */
  validateForConversion(
    skill: SkillDefinition,
    targetPlatform: Platform
  ): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    if (targetPlatform === 'codex') {
      const len = skill.metadata.description.length
      if (len > 500) {
        warnings.push({
          field: 'description',
          message: `Description is ${len} chars (Codex limit: 500). Will be compressed.`,
          severity: len > 1000 ? 'medium' : 'low'
        })
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Validate metadata fields
   */
  private validateMetadata(
    skill: SkillDefinition,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    // Check name
    if (!skill.metadata.name || skill.metadata.name.trim() === '') {
      errors.push({
        field: 'name',
        message: 'Skill name is required',
        code: 'MISSING_NAME'
      })
    } else if (skill.metadata.name.length < 3) {
      warnings.push({
        field: 'name',
        message: 'Skill name is very short (< 3 chars)',
        severity: 'low'
      })
    }

    // Check version
    if (!skill.metadata.version || skill.metadata.version.trim() === '') {
      warnings.push({
        field: 'version',
        message: 'Skill version is recommended',
        severity: 'low'
      })
    } else if (!/^\d+\.\d+\.\d+/.test(skill.metadata.version)) {
      warnings.push({
        field: 'version',
        message: 'Version should follow semantic versioning (e.g., 1.0.0)',
        severity: 'low'
      })
    }

    // Check description
    if (!skill.metadata.description || skill.metadata.description.trim() === '') {
      errors.push({
        field: 'description',
        message: 'Skill description is required',
        code: 'MISSING_DESCRIPTION'
      })
    }

    // Check author
    if (!skill.metadata.author) {
      warnings.push({
        field: 'author',
        message: 'Skill author is recommended',
        severity: 'low'
      })
    }

    // Check tags
    if (!skill.metadata.tags || skill.metadata.tags.length === 0) {
      warnings.push({
        field: 'tags',
        message: 'Tags are recommended for discoverability',
        severity: 'low'
      })
    }
  }

  /**
   * Validate description length
   */
  private validateDescriptionLength(
    skill: SkillDefinition,
    warnings: ValidationWarning[]
  ): void {
    const length = skill.metadata.description.length

    if (length < 20) {
      warnings.push({
        field: 'description',
        message: `Description is very short (${length} chars). Add more details.`,
        severity: 'medium'
      })
    }

    if (length > 500) {
      warnings.push({
        field: 'description',
        message: `Description is ${length} chars (Codex limit: 500).`,
        severity: 'low'
      })
    }

    if (length > 2000) {
      warnings.push({
        field: 'description',
        message: `Description is very long (${length} chars). Move details to body.`,
        severity: 'medium'
      })
    }
  }

  /**
   * Validate body content
   */
  private validateBody(
    skill: SkillDefinition,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    if (!skill.body || skill.body.trim() === '') {
      errors.push({
        field: 'body',
        message: 'Skill body is empty. Add usage instructions.',
        code: 'EMPTY_BODY'
      })
      return
    }

    if (skill.body.length < 100) {
      warnings.push({
        field: 'body',
        message: 'Skill body is very short. Add more documentation.',
        severity: 'medium'
      })
    }

    if (!skill.body.includes('#')) {
      warnings.push({
        field: 'body',
        message: 'Consider using markdown headings to structure documentation.',
        severity: 'low'
      })
    }

    if (!skill.body.includes('```')) {
      warnings.push({
        field: 'body',
        message: 'Consider adding code examples.',
        severity: 'low'
      })
    }
  }

  /**
   * Validate resource file existence
   */
  private async validateResources(
    skill: SkillDefinition,
    skillPath: string,
    errors: ValidationError[],
    _warnings: ValidationWarning[]
  ): Promise<void> {
    const stats = await fs.stat(skillPath).catch(() => null)
    const skillDir = stats?.isDirectory() ? skillPath : path.dirname(skillPath)

    const resourcePaths = [
      ...(skill.resources.templates || []),
      ...(skill.resources.scripts || []),
      ...(skill.resources.references || [])
    ]

    for (const resourcePath of resourcePaths) {
      const fullPath = path.isAbsolute(resourcePath)
        ? resourcePath
        : path.join(skillDir, resourcePath)

      try {
        await fs.access(fullPath)
      } catch {
        errors.push({
          field: 'resources',
          message: `Referenced file not found: ${resourcePath}`,
          code: 'MISSING_RESOURCE'
        })
      }
    }
  }

  /**
   * Check for common issues
   */
  private checkCommonIssues(
    skill: SkillDefinition,
    warnings: ValidationWarning[]
  ): void {
    // Check for broken links (allow empty URLs to detect them)
    const linkRegex = /\[([^\]]+)\]\(([^)]*)\)/g
    let match: RegExpExecArray | null

    while ((match = linkRegex.exec(skill.body)) !== null) {
      const url = match[2]

      if (!url || url.trim() === '') {
        warnings.push({
          field: 'body',
          message: `Empty link found: [${match[1]}]()`,
          severity: 'medium'
        })
        continue
      }

      if (!url.startsWith('http') && !url.startsWith('#') && url.includes(' ')) {
        warnings.push({
          field: 'body',
          message: `Local path contains spaces: ${url}`,
          severity: 'medium'
        })
      }
    }

    // Check for TODO markers
    if (skill.body.includes('TODO') || skill.body.includes('FIXME')) {
      warnings.push({
        field: 'body',
        message: 'Skill contains TODO/FIXME markers.',
        severity: 'low'
      })
    }
  }
}

/**
 * Create a new skill validator instance
 */
export function createSkillValidator(): SkillValidator {
  return new SkillValidator()
}
