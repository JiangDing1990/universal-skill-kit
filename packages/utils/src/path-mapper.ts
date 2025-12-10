/**
 * Path Mapper
 * 路径映射器 - 在Claude和Codex平台间转换路径
 */

import * as path from 'node:path'
import * as os from 'node:os'

/**
 * Platform type for path mapping
 * 平台类型
 */
export type Platform = 'claude' | 'codex'

/**
 * Path mapping result
 * 路径映射结果
 */
export interface PathMappingResult {
  originalPath: string
  mappedPath: string
  isChanged: boolean
  platform: Platform
}

/**
 * Path replacement patterns
 * 路径替换模式
 */
interface PathPattern {
  source: RegExp
  target: string
}

/**
 * Path Mapper
 * 自动转换Claude和Codex平台间的路径引用
 */
export class PathMapper {
  private homeDir: string

  // Claude-specific paths
  private readonly claudePaths = {
    skills: '.claude/skills',
    absolute: '~/.claude/skills'
  }

  // Codex-specific paths
  private readonly codexPaths = {
    skills: '.codex/skills',
    absolute: '~/.codex/skills'
  }

  constructor() {
    this.homeDir = os.homedir()
  }

  /**
   * Map a single path from one platform to another
   * 将单个路径从一个平台映射到另一个平台
   */
  mapPath(inputPath: string, targetPlatform: Platform): PathMappingResult {
    const originalPath = inputPath
    let mappedPath = inputPath

    // Determine patterns based on target platform
    const patterns = this.getReplacementPatterns(targetPlatform)

    // Apply all replacement patterns
    for (const pattern of patterns) {
      mappedPath = mappedPath.replace(pattern.source, pattern.target)
    }

    return {
      originalPath,
      mappedPath,
      isChanged: originalPath !== mappedPath,
      platform: targetPlatform
    }
  }

  /**
   * Map multiple paths in a text
   * 批量替换文本中的多个路径
   */
  mapPathsInText(text: string, targetPlatform: Platform): string {
    let result = text
    const patterns = this.getReplacementPatterns(targetPlatform)

    // Apply all patterns globally
    for (const pattern of patterns) {
      result = result.replace(new RegExp(pattern.source, 'g'), pattern.target)
    }

    return result
  }

  /**
   * Get replacement patterns for target platform
   * 获取目标平台的替换模式
   */
  private getReplacementPatterns(targetPlatform: Platform): PathPattern[] {
    if (targetPlatform === 'codex') {
      // Claude → Codex
      return [
        // ~/.claude/skills → ~/.codex/skills
        {
          source: /~\/\.claude\/skills/g,
          target: '~/.codex/skills'
        },
        // .claude/skills → .codex/skills
        {
          source: /\.claude\/skills/g,
          target: '.codex/skills'
        },
        // /path/to/.claude/ → /path/to/.codex/
        {
          source: /\/\.claude\//g,
          target: '/.codex/'
        },
        // Absolute home path
        {
          source: new RegExp(
            `${this.escapeRegExp(this.homeDir)}/\\.claude/`,
            'g'
          ),
          target: `${this.homeDir}/.codex/`
        }
      ]
    } else {
      // Codex → Claude
      return [
        // ~/.codex/skills → ~/.claude/skills
        {
          source: /~\/\.codex\/skills/g,
          target: '~/.claude/skills'
        },
        // .codex/skills → .claude/skills
        {
          source: /\.codex\/skills/g,
          target: '.claude/skills'
        },
        // /path/to/.codex/ → /path/to/.claude/
        {
          source: /\/\.codex\//g,
          target: '/.claude/'
        },
        // Absolute home path
        {
          source: new RegExp(
            `${this.escapeRegExp(this.homeDir)}/\\.codex/`,
            'g'
          ),
          target: `${this.homeDir}/.claude/`
        }
      ]
    }
  }

  /**
   * Expand tilde in path to home directory
   * 将路径中的波浪号展开为home目录
   */
  expandTilde(inputPath: string): string {
    if (inputPath.startsWith('~/')) {
      return path.join(this.homeDir, inputPath.slice(2))
    }
    return inputPath
  }

  /**
   * Contract home directory to tilde
   * 将home目录缩写为波浪号
   */
  contractTilde(inputPath: string): string {
    if (inputPath.startsWith(this.homeDir)) {
      return inputPath.replace(this.homeDir, '~')
    }
    return inputPath
  }

  /**
   * Normalize path separators to forward slashes
   * 规范化路径分隔符为正斜杠
   */
  normalizePath(inputPath: string): string {
    return inputPath.replace(/\\/g, '/')
  }

  /**
   * Convert absolute path to relative path
   * 将绝对路径转换为相对路径
   */
  toRelativePath(absolutePath: string, basePath: string): string {
    const expandedAbsolute = this.expandTilde(absolutePath)
    const expandedBase = this.expandTilde(basePath)
    return path.relative(expandedBase, expandedAbsolute)
  }

  /**
   * Convert relative path to absolute path
   * 将相对路径转换为绝对路径
   */
  toAbsolutePath(relativePath: string, basePath: string): string {
    const expandedBase = this.expandTilde(basePath)
    return path.resolve(expandedBase, relativePath)
  }

  /**
   * Detect platform from path
   * 从路径中检测平台
   */
  detectPlatform(inputPath: string): Platform | null {
    if (inputPath.includes('.claude')) {
      return 'claude'
    }
    if (inputPath.includes('.codex')) {
      return 'codex'
    }
    return null
  }

  /**
   * Get default skills directory for platform
   * 获取平台的默认skills目录
   */
  getDefaultSkillsDir(platform: Platform, absolute = true): string {
    const paths = platform === 'claude' ? this.claudePaths : this.codexPaths
    return absolute ? this.expandTilde(paths.absolute) : paths.skills
  }

  /**
   * Check if path is in skills directory
   * 检查路径是否在skills目录中
   */
  isInSkillsDir(inputPath: string, platform: Platform): boolean {
    const expandedPath = this.expandTilde(inputPath)
    const skillsDir = this.getDefaultSkillsDir(platform, true)
    return expandedPath.startsWith(skillsDir)
  }

  /**
   * Escape special regex characters in string
   * 转义正则表达式特殊字符
   */
  private escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }
}

/**
 * Create a new path mapper instance
 * 创建路径映射器实例
 */
export function createPathMapper(): PathMapper {
  return new PathMapper()
}
