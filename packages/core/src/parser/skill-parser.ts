/**
 * Skill Parser Implementation
 * Skill 解析器实现
 */

import { readFile, access } from 'node:fs/promises'
import { resolve, dirname, join, isAbsolute } from 'node:path'
import { constants } from 'node:fs'
import matter from 'gray-matter'
import type { SkillDefinition, SkillMetadata, SkillResources } from '../types'

/**
 * Custom error for Skill parsing failures
 * Skill 解析失败的自定义错误
 */
export class SkillParseError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'SkillParseError'
  }
}

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
   * @throws {SkillParseError} When file not found or parsing fails
   */
  async parse(skillPath: string): Promise<SkillDefinition> {
    try {
      // Resolve full path
      const fullPath = resolve(skillPath)

      // Determine if path is file or directory
      const filePath = fullPath.endsWith('.md')
        ? fullPath
        : join(fullPath, 'SKILL.md')

      // Check if file exists
      try {
        await access(filePath, constants.R_OK)
      } catch {
        throw new SkillParseError(
          `Skill file not found or not readable: ${filePath}`
        )
      }

      // Read file content
      let content: string
      try {
        content = await readFile(filePath, 'utf-8')
      } catch (error) {
        throw new SkillParseError(
          `Failed to read skill file: ${filePath}`,
          error as Error
        )
      }

      // Parse frontmatter and body
      let data: Record<string, unknown>
      let body: string
      try {
        const parsed = matter(content)
        data = parsed.data
        body = parsed.content
      } catch (error) {
        throw new SkillParseError(
          `Failed to parse YAML frontmatter in: ${filePath}`,
          error as Error
        )
      }

      // Extract metadata
      const metadata = this.extractMetadata(data)

      // Extract resources
      const resources = this.extractResources(body, dirname(filePath))

      return {
        metadata,
        body,
        resources
      }
    } catch (error) {
      if (error instanceof SkillParseError) {
        throw error
      }
      throw new SkillParseError(
        `Unexpected error parsing skill: ${skillPath}`,
        error as Error
      )
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
  private extractResources(body: string, baseDir: string): SkillResources {
    const resources: SkillResources = {
      templates: [],
      references: [],
      scripts: []
    }

    // Extract markdown links: [text](path)
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
    let match: RegExpExecArray | null

    while ((match = markdownLinkRegex.exec(body)) !== null) {
      const linkPath = match[2]

      if (!linkPath) {
        continue
      }

      // Skip external URLs (http://, https://, mailto:, etc.)
      if (/^[a-z]+:\/\//i.test(linkPath) || linkPath.startsWith('mailto:')) {
        continue
      }

      // Skip anchors
      if (linkPath.startsWith('#')) {
        continue
      }

      // Resolve relative paths
      const resolvedPath = isAbsolute(linkPath)
        ? linkPath
        : join(baseDir, linkPath)

      // Categorize by file extension
      if (
        linkPath.endsWith('.template.md') ||
        linkPath.endsWith('.template.json')
      ) {
        resources.templates.push(resolvedPath)
      } else if (
        linkPath.endsWith('.md') ||
        linkPath.endsWith('.json') ||
        linkPath.endsWith('.yaml') ||
        linkPath.endsWith('.yml')
      ) {
        resources.references.push(resolvedPath)
      } else if (
        linkPath.endsWith('.js') ||
        linkPath.endsWith('.ts') ||
        linkPath.endsWith('.sh') ||
        linkPath.endsWith('.bash')
      ) {
        resources.scripts.push(resolvedPath)
      } else {
        // Other files go to references
        resources.references.push(resolvedPath)
      }
    }

    // Extract code blocks with file references
    // ```language:path/to/file or ```language {path/to/file}
    const codeBlockRegex = /```(\w+)[\s:]{0,2}([^\n`]+)?/g

    while ((match = codeBlockRegex.exec(body)) !== null) {
      const language = match[1]
      const pathInfo = match[2]?.trim()

      if (!language || !pathInfo) {
        continue
      }

      // Remove curly braces if present: {path/to/file}
      const filePath = pathInfo.replace(/^[{[]|[}\]]$/g, '').trim()

      // Skip if it doesn't look like a file path
      if (!filePath || filePath.includes(' ') || filePath.startsWith('http')) {
        continue
      }

      // Resolve path
      const resolvedPath = isAbsolute(filePath)
        ? filePath
        : join(baseDir, filePath)

      // Categorize as script or reference based on language
      if (
        [
          'javascript',
          'js',
          'typescript',
          'ts',
          'bash',
          'sh',
          'python',
          'py'
        ].includes(language.toLowerCase())
      ) {
        if (!resources.scripts.includes(resolvedPath)) {
          resources.scripts.push(resolvedPath)
        }
      } else {
        if (!resources.references.includes(resolvedPath)) {
          resources.references.push(resolvedPath)
        }
      }
    }

    return resources
  }
}
