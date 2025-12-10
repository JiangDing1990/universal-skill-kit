/**
 * Unit tests for SkillParser
 * SkillParser 单元测试
 */

import { describe, it, expect } from 'vitest'
import { join } from 'node:path'
import { SkillParser, SkillParseError } from '../../src/parser/skill-parser'

const fixturesDir = join(__dirname, '..', 'fixtures')

describe('SkillParser', () => {
  const parser = new SkillParser()

  describe('parse()', () => {
    it('should parse a valid skill file', async () => {
      const skillPath = join(fixturesDir, 'valid-skill.md')
      const result = await parser.parse(skillPath)

      expect(result).toBeDefined()
      expect(result.metadata).toBeDefined()
      expect(result.body).toBeDefined()
      expect(result.resources).toBeDefined()
    })

    it('should extract metadata correctly', async () => {
      const skillPath = join(fixturesDir, 'valid-skill.md')
      const result = await parser.parse(skillPath)

      expect(result.metadata.name).toBe('test-skill')
      expect(result.metadata.version).toBe('1.0.0')
      expect(result.metadata.description).toBe('A test skill for unit testing')
      expect(result.metadata.author).toBe('Test Author')
      expect(result.metadata.tags).toEqual(['test', 'example'])
    })

    it('should extract markdown body', async () => {
      const skillPath = join(fixturesDir, 'valid-skill.md')
      const result = await parser.parse(skillPath)

      expect(result.body).toContain('# Test Skill')
      expect(result.body).toContain('This is a test skill')
    })

    it('should extract template resources', async () => {
      const skillPath = join(fixturesDir, 'valid-skill.md')
      const result = await parser.parse(skillPath)

      expect(result.resources.templates).toHaveLength(1)
      expect(result.resources.templates[0]).toContain('example.template.md')
    })

    it('should extract reference resources', async () => {
      const skillPath = join(fixturesDir, 'valid-skill.md')
      const result = await parser.parse(skillPath)

      expect(result.resources.references.length).toBeGreaterThan(0)
      expect(
        result.resources.references.some(ref => ref.includes('reference.md'))
      ).toBe(true)
      expect(
        result.resources.references.some(ref => ref.includes('config.json'))
      ).toBe(true)
    })

    it('should extract script resources', async () => {
      const skillPath = join(fixturesDir, 'valid-skill.md')
      const result = await parser.parse(skillPath)

      expect(result.resources.scripts.length).toBeGreaterThan(0)
      expect(
        result.resources.scripts.some(script => script.includes('setup.sh'))
      ).toBe(true)
    })

    it('should extract scripts from code blocks', async () => {
      const skillPath = join(fixturesDir, 'valid-skill.md')
      const result = await parser.parse(skillPath)

      const hasTypeScriptFile = result.resources.scripts.some(script =>
        script.includes('index.ts')
      )
      const hasBashFile = result.resources.scripts.some(script =>
        script.includes('deploy.sh')
      )

      expect(hasTypeScriptFile || hasBashFile).toBe(true)
    })

    it('should ignore external URLs', async () => {
      const skillPath = join(fixturesDir, 'valid-skill.md')
      const result = await parser.parse(skillPath)

      const allResources = [
        ...result.resources.templates,
        ...result.resources.references,
        ...result.resources.scripts
      ]

      expect(allResources.some(res => res.includes('example.com'))).toBe(false)
    })

    it('should ignore anchor links', async () => {
      const skillPath = join(fixturesDir, 'valid-skill.md')
      const result = await parser.parse(skillPath)

      const allResources = [
        ...result.resources.templates,
        ...result.resources.references,
        ...result.resources.scripts
      ]

      expect(allResources.some(res => res.startsWith('#'))).toBe(false)
    })

    it('should handle minimal skill without resources', async () => {
      const skillPath = join(fixturesDir, 'minimal-skill.md')
      const result = await parser.parse(skillPath)

      expect(result.metadata.name).toBe('minimal')
      expect(result.resources.templates).toHaveLength(0)
      expect(result.resources.references).toHaveLength(0)
      expect(result.resources.scripts).toHaveLength(0)
    })

    it('should throw error when file not found', async () => {
      const skillPath = join(fixturesDir, 'non-existent.md')

      await expect(parser.parse(skillPath)).rejects.toThrow(SkillParseError)
      await expect(parser.parse(skillPath)).rejects.toThrow(
        'Skill file not found'
      )
    })

    it('should handle default values for missing metadata', async () => {
      const skillPath = join(fixturesDir, 'minimal-skill.md')
      const result = await parser.parse(skillPath)

      expect(result.metadata.name).toBe('minimal')
      expect(result.metadata.version).toBe('0.1.0')
      expect(result.metadata.description).toBeDefined()
      expect(result.metadata.author).toBeUndefined()
      expect(result.metadata.tags).toBeUndefined()
    })

    it('should resolve relative paths correctly', async () => {
      const skillPath = join(fixturesDir, 'valid-skill.md')
      const result = await parser.parse(skillPath)

      // All paths should be absolute
      const allResources = [
        ...result.resources.templates,
        ...result.resources.references,
        ...result.resources.scripts
      ]

      allResources.forEach(resource => {
        expect(resource).toMatch(/^\//) // Unix absolute path
      })
    })
  })

  describe('SkillParseError', () => {
    it('should create error with message', () => {
      const error = new SkillParseError('Test error')

      expect(error).toBeInstanceOf(Error)
      expect(error.name).toBe('SkillParseError')
      expect(error.message).toBe('Test error')
    })

    it('should create error with cause', () => {
      const cause = new Error('Original error')
      const error = new SkillParseError('Wrapper error', cause)

      expect(error.cause).toBe(cause)
      expect(error.message).toBe('Wrapper error')
    })
  })
})
