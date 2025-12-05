/**
 * Skill Parser Implementation
 * Skill 解析器实现
 */

import { readFile } from 'node:fs/promises'
import { resolve, dirname, join } from 'node:path'
import matter from 'gray-matter'
import type { SkillDefinition, SkillMetadata, SkillResources } from '../types'

/**
 * Skill Parser Class
 * Skill 解析器类
 */
export class SkillParser {
  /**
   * Parse a skill from file path
   * 从文件路径解析 Skill
   *
   * @param skillPath - Path to SKILL.md file or skill directory
   * @returns Parsed skill definition
   */
  async parse(skillPath: string): Promise<SkillDefinition> {
    // Resolve full path
    const fullPath = resolve(skillPath)

    // Determine if path is file or directory
    const filePath = fullPath.endsWith('.md')
      ? fullPath
      : join(fullPath, 'SKILL.md')

    // Read file content
    const content = await readFile(filePath, 'utf-8')

    // Parse frontmatter and body
    const { data, content: body } = matter(content)

    // Extract metadata
    const metadata = this.extractMetadata(data)

    // Extract resources
    const resources = this.extractResources(body, dirname(filePath))

    return {
      metadata,
      body,
      resources
    }
  }

  /**
   * Extract metadata from frontmatter
   * 从 frontmatter 提取元数据
   */
  private extractMetadata(data: Record<string, unknown>): SkillMetadata {
    const metadata: SkillMetadata = {
      name: String(data.name || 'unnamed-skill'),
      version: String(data.version || '0.0.0'),
      description: String(data.description || ''),
      author: data.author ? String(data.author) : undefined,
      tags: Array.isArray(data.tags) ? data.tags.map(t => String(t)) : undefined
    }

    return metadata
  }

  /**
   * Extract resource file references from body
   * 从 body 提取资源文件引用
   */
  private extractResources(_body: string, _baseDir: string): SkillResources {
    const resources: SkillResources = {
      templates: [],
      references: [],
      scripts: []
    }

    // Extract markdown links and code blocks
    // TODO: Implement resource extraction logic

    return resources
  }
}
