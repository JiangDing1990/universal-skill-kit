/**
 * PathMapper Tests
 * 路径映射器测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import * as os from 'node:os'
import * as path from 'node:path'
import { PathMapper, createPathMapper } from '../src/path-mapper'

describe('PathMapper', () => {
  let mapper: PathMapper
  let homeDir: string

  beforeEach(() => {
    mapper = new PathMapper()
    homeDir = os.homedir()
  })

  describe('constructor', () => {
    it('should create a new PathMapper instance', () => {
      expect(mapper).toBeInstanceOf(PathMapper)
    })
  })

  describe('mapPath', () => {
    describe('Claude to Codex', () => {
      it('should map tilde path from Claude to Codex', () => {
        const result = mapper.mapPath('~/.claude/skills/my-skill', 'codex')

        expect(result.originalPath).toBe('~/.claude/skills/my-skill')
        expect(result.mappedPath).toBe('~/.codex/skills/my-skill')
        expect(result.isChanged).toBe(true)
        expect(result.platform).toBe('codex')
      })

      it('should map relative path from Claude to Codex', () => {
        const result = mapper.mapPath('.claude/skills/my-skill', 'codex')

        expect(result.mappedPath).toBe('.codex/skills/my-skill')
        expect(result.isChanged).toBe(true)
      })

      it('should map absolute path from Claude to Codex', () => {
        const inputPath = `${homeDir}/.claude/skills/my-skill`
        const result = mapper.mapPath(inputPath, 'codex')

        expect(result.mappedPath).toBe(`${homeDir}/.codex/skills/my-skill`)
        expect(result.isChanged).toBe(true)
      })

      it('should map nested Claude paths', () => {
        const result = mapper.mapPath('/some/path/.claude/data', 'codex')

        expect(result.mappedPath).toBe('/some/path/.codex/data')
        expect(result.isChanged).toBe(true)
      })

      it('should not change non-Claude paths', () => {
        const result = mapper.mapPath('/some/random/path', 'codex')

        expect(result.mappedPath).toBe('/some/random/path')
        expect(result.isChanged).toBe(false)
      })
    })

    describe('Codex to Claude', () => {
      it('should map tilde path from Codex to Claude', () => {
        const result = mapper.mapPath('~/.codex/skills/my-skill', 'claude')

        expect(result.mappedPath).toBe('~/.claude/skills/my-skill')
        expect(result.isChanged).toBe(true)
        expect(result.platform).toBe('claude')
      })

      it('should map relative path from Codex to Claude', () => {
        const result = mapper.mapPath('.codex/skills/my-skill', 'claude')

        expect(result.mappedPath).toBe('.claude/skills/my-skill')
        expect(result.isChanged).toBe(true)
      })

      it('should map absolute path from Codex to Claude', () => {
        const inputPath = `${homeDir}/.codex/skills/my-skill`
        const result = mapper.mapPath(inputPath, 'claude')

        expect(result.mappedPath).toBe(`${homeDir}/.claude/skills/my-skill`)
        expect(result.isChanged).toBe(true)
      })

      it('should map nested Codex paths', () => {
        const result = mapper.mapPath('/some/path/.codex/data', 'claude')

        expect(result.mappedPath).toBe('/some/path/.claude/data')
        expect(result.isChanged).toBe(true)
      })
    })
  })

  describe('mapPathsInText', () => {
    it('should replace multiple Claude paths in text to Codex', () => {
      const text = `
Check the skill at ~/.claude/skills/my-skill
Also see .claude/skills/another-skill
And ${homeDir}/.claude/config.json
`
      const result = mapper.mapPathsInText(text, 'codex')

      expect(result).toContain('~/.codex/skills/my-skill')
      expect(result).toContain('.codex/skills/another-skill')
      expect(result).toContain(`${homeDir}/.codex/config.json`)
      expect(result).not.toContain('.claude')
    })

    it('should replace multiple Codex paths in text to Claude', () => {
      const text = `
Check the skill at ~/.codex/skills/my-skill
Also see .codex/skills/another-skill
`
      const result = mapper.mapPathsInText(text, 'claude')

      expect(result).toContain('~/.claude/skills/my-skill')
      expect(result).toContain('.claude/skills/another-skill')
      expect(result).not.toContain('.codex')
    })

    it('should handle text with no paths', () => {
      const text = 'Just some regular text without any paths'
      const result = mapper.mapPathsInText(text, 'codex')

      expect(result).toBe(text)
    })

    it('should handle empty text', () => {
      const result = mapper.mapPathsInText('', 'codex')

      expect(result).toBe('')
    })

    it('should replace all occurrences of paths', () => {
      const text = '~/.claude/skills and ~/.claude/skills again'
      const result = mapper.mapPathsInText(text, 'codex')

      const matches = result.match(/\.codex\/skills/g)
      expect(matches).toHaveLength(2)
    })
  })

  describe('expandTilde', () => {
    it('should expand tilde to home directory', () => {
      const result = mapper.expandTilde('~/Documents')

      expect(result).toBe(path.join(homeDir, 'Documents'))
    })

    it('should not change path without tilde', () => {
      const inputPath = '/absolute/path'
      const result = mapper.expandTilde(inputPath)

      expect(result).toBe(inputPath)
    })

    it('should not expand tilde in middle of path', () => {
      const inputPath = '/path/~/middle'
      const result = mapper.expandTilde(inputPath)

      expect(result).toBe(inputPath)
    })
  })

  describe('contractTilde', () => {
    it('should contract home directory to tilde', () => {
      const inputPath = path.join(homeDir, 'Documents')
      const result = mapper.contractTilde(inputPath)

      expect(result).toBe('~/Documents')
    })

    it('should not change path not starting with home', () => {
      const inputPath = '/some/other/path'
      const result = mapper.contractTilde(inputPath)

      expect(result).toBe(inputPath)
    })

    it('should handle home directory exactly', () => {
      const result = mapper.contractTilde(homeDir)

      expect(result).toBe('~')
    })
  })

  describe('normalizePath', () => {
    it('should convert backslashes to forward slashes', () => {
      const result = mapper.normalizePath('C:\\Users\\Name\\file.txt')

      expect(result).toBe('C:/Users/Name/file.txt')
    })

    it('should not change paths with forward slashes', () => {
      const inputPath = '/unix/style/path'
      const result = mapper.normalizePath(inputPath)

      expect(result).toBe(inputPath)
    })

    it('should handle mixed slashes', () => {
      const result = mapper.normalizePath('C:\\Users/Name\\file.txt')

      expect(result).toBe('C:/Users/Name/file.txt')
    })
  })

  describe('toRelativePath', () => {
    it('should convert absolute to relative path', () => {
      const absolute = path.join(homeDir, 'projects', 'my-skill')
      const base = path.join(homeDir, 'projects')
      const result = mapper.toRelativePath(absolute, base)

      expect(result).toBe('my-skill')
    })

    it('should handle tilde in paths', () => {
      const absolute = '~/projects/my-skill'
      const base = '~/projects'
      const result = mapper.toRelativePath(absolute, base)

      expect(result).toBe('my-skill')
    })

    it('should handle parent directory navigation', () => {
      const absolute = path.join(homeDir, 'projects', 'skill-a')
      const base = path.join(homeDir, 'projects', 'skill-b')
      const result = mapper.toRelativePath(absolute, base)

      expect(result).toBe(path.join('..', 'skill-a'))
    })
  })

  describe('toAbsolutePath', () => {
    it('should convert relative to absolute path', () => {
      const relative = 'my-skill'
      const base = path.join(homeDir, 'projects')
      const result = mapper.toAbsolutePath(relative, base)

      expect(result).toBe(path.join(homeDir, 'projects', 'my-skill'))
    })

    it('should handle tilde in base path', () => {
      const relative = 'my-skill'
      const base = '~/projects'
      const result = mapper.toAbsolutePath(relative, base)

      expect(result).toBe(path.join(homeDir, 'projects', 'my-skill'))
    })

    it('should resolve parent directory references', () => {
      const relative = '../other-skill'
      const base = path.join(homeDir, 'projects', 'current')
      const result = mapper.toAbsolutePath(relative, base)

      expect(result).toBe(path.join(homeDir, 'projects', 'other-skill'))
    })
  })

  describe('detectPlatform', () => {
    it('should detect Claude platform', () => {
      const result = mapper.detectPlatform('~/.claude/skills/my-skill')

      expect(result).toBe('claude')
    })

    it('should detect Codex platform', () => {
      const result = mapper.detectPlatform('~/.codex/skills/my-skill')

      expect(result).toBe('codex')
    })

    it('should return null for unknown platform', () => {
      const result = mapper.detectPlatform('/some/random/path')

      expect(result).toBeNull()
    })

    it('should detect platform in relative paths', () => {
      expect(mapper.detectPlatform('.claude/skills')).toBe('claude')
      expect(mapper.detectPlatform('.codex/skills')).toBe('codex')
    })
  })

  describe('getDefaultSkillsDir', () => {
    it('should get absolute Claude skills directory', () => {
      const result = mapper.getDefaultSkillsDir('claude', true)

      expect(result).toBe(path.join(homeDir, '.claude', 'skills'))
    })

    it('should get absolute Codex skills directory', () => {
      const result = mapper.getDefaultSkillsDir('codex', true)

      expect(result).toBe(path.join(homeDir, '.codex', 'skills'))
    })

    it('should get relative Claude skills directory', () => {
      const result = mapper.getDefaultSkillsDir('claude', false)

      expect(result).toBe('.claude/skills')
    })

    it('should get relative Codex skills directory', () => {
      const result = mapper.getDefaultSkillsDir('codex', false)

      expect(result).toBe('.codex/skills')
    })

    it('should default to absolute path', () => {
      const result = mapper.getDefaultSkillsDir('claude')

      expect(result).toBe(path.join(homeDir, '.claude', 'skills'))
    })
  })

  describe('isInSkillsDir', () => {
    it('should return true for path in Claude skills dir', () => {
      const skillPath = path.join(homeDir, '.claude', 'skills', 'my-skill')
      const result = mapper.isInSkillsDir(skillPath, 'claude')

      expect(result).toBe(true)
    })

    it('should return true for path in Codex skills dir', () => {
      const skillPath = path.join(homeDir, '.codex', 'skills', 'my-skill')
      const result = mapper.isInSkillsDir(skillPath, 'codex')

      expect(result).toBe(true)
    })

    it('should return false for path outside skills dir', () => {
      const result = mapper.isInSkillsDir('/some/other/path', 'claude')

      expect(result).toBe(false)
    })

    it('should handle tilde paths', () => {
      const result = mapper.isInSkillsDir('~/.claude/skills/my-skill', 'claude')

      expect(result).toBe(true)
    })

    it('should return false for wrong platform', () => {
      const skillPath = path.join(homeDir, '.claude', 'skills', 'my-skill')
      const result = mapper.isInSkillsDir(skillPath, 'codex')

      expect(result).toBe(false)
    })
  })

  describe('createPathMapper', () => {
    it('should create a new PathMapper instance', () => {
      const newMapper = createPathMapper()

      expect(newMapper).toBeInstanceOf(PathMapper)
    })

    it('should create independent instances', () => {
      const mapper1 = createPathMapper()
      const mapper2 = createPathMapper()

      expect(mapper1).not.toBe(mapper2)
    })
  })

  describe('edge cases', () => {
    it('should handle paths with special characters', () => {
      const result = mapper.mapPath('~/.claude/skills/my-skill (special)', 'codex')

      expect(result.mappedPath).toBe('~/.codex/skills/my-skill (special)')
    })

    it('should handle paths with spaces', () => {
      const result = mapper.mapPath('~/.claude/skills/my skill name', 'codex')

      expect(result.mappedPath).toBe('~/.codex/skills/my skill name')
    })

    it('should handle paths with unicode characters', () => {
      const result = mapper.mapPath('~/.claude/skills/我的技能', 'codex')

      expect(result.mappedPath).toBe('~/.codex/skills/我的技能')
    })

    it('should handle very long paths', () => {
      const longPath = `~/.claude/skills/${'a'.repeat(100)}/${'b'.repeat(100)}`
      const result = mapper.mapPath(longPath, 'codex')

      expect(result.mappedPath).toContain('.codex/skills')
      expect(result.isChanged).toBe(true)
    })

    it('should handle empty path', () => {
      const result = mapper.mapPath('', 'codex')

      expect(result.mappedPath).toBe('')
      expect(result.isChanged).toBe(false)
    })
  })
})
