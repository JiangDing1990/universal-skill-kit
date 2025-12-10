import { describe, it, expect, beforeEach } from 'vitest'
import { TemplateContextManager } from '../src/template'
import type { SkillConfig } from '../src/types/config'
import type { TemplateContext } from '../src/types/template'

describe('TemplateContextManager', () => {
  let manager: TemplateContextManager
  let config: SkillConfig

  beforeEach(() => {
    manager = new TemplateContextManager()
    config = {
      name: 'test-skill',
      version: '1.0.0',
      author: 'Test Author',
      description: 'A test skill',
      tags: ['test', 'example'],
      platforms: {
        claude: {
          enabled: true,
          output: 'dist/claude'
        },
        codex: {
          enabled: true,
          output: 'dist/codex'
        }
      },
      source: {
        entry: 'src/SKILL.md'
      }
    }
  })

  describe('createContext', () => {
    it('should create context for claude platform', () => {
      const context = manager.createContext(config, 'claude')

      expect(context.name).toBe('test-skill')
      expect(context.version).toBe('1.0.0')
      expect(context.author).toBe('Test Author')
      expect(context.description).toBe('A test skill')
      expect(context.tags).toEqual(['test', 'example'])
      expect(context.platform.name).toBe('claude')
      expect(context.platform.claude).toBe(true)
      expect(context.platform.codex).toBe(false)
    })

    it('should create context for codex platform', () => {
      const context = manager.createContext(config, 'codex')

      expect(context.platform.name).toBe('codex')
      expect(context.platform.claude).toBe(false)
      expect(context.platform.codex).toBe(true)
    })

    it('should handle platform-specific description', () => {
      const configWithPlatformDesc: SkillConfig = {
        ...config,
        description: {
          common: 'Common description',
          claude: 'Claude-specific description',
          codex: 'Codex-specific description'
        }
      }

      const claudeContext = manager.createContext(
        configWithPlatformDesc,
        'claude'
      )
      const codexContext = manager.createContext(
        configWithPlatformDesc,
        'codex'
      )

      expect(claudeContext.description).toBe('Claude-specific description')
      expect(codexContext.description).toBe('Codex-specific description')
    })

    it('should fallback to common description if platform-specific not found', () => {
      const configWithPlatformDesc: SkillConfig = {
        ...config,
        description: {
          common: 'Common description'
        }
      }

      const context = manager.createContext(configWithPlatformDesc, 'claude')

      expect(context.description).toBe('Common description')
    })
  })

  describe('mergeContext', () => {
    it('should merge contexts', () => {
      const baseContext: TemplateContext = {
        name: 'base-skill',
        version: '1.0.0',
        description: 'Base description',
        platform: {
          name: 'claude',
          claude: true,
          codex: false
        }
      }

      const overrideContext: Partial<TemplateContext> = {
        name: 'merged-skill',
        author: 'New Author'
      }

      const merged = manager.mergeContext(baseContext, overrideContext)

      expect(merged.name).toBe('merged-skill')
      expect(merged.version).toBe('1.0.0')
      expect(merged.author).toBe('New Author')
      expect(merged.description).toBe('Base description')
    })

    it('should merge platform info', () => {
      const baseContext: TemplateContext = {
        name: 'base-skill',
        version: '1.0.0',
        description: 'Base description',
        platform: {
          name: 'claude',
          claude: true,
          codex: false
        }
      }

      const merged = manager.mergeContext(baseContext, {
        platform: {
          name: 'codex',
          claude: false,
          codex: true
        }
      })

      expect(merged.platform.name).toBe('codex')
      expect(merged.platform.codex).toBe(true)
    })
  })

  describe('extendContext', () => {
    it('should extend context with custom variables', () => {
      const context = manager.createContext(config, 'claude')

      const extended = manager.extendContext(context, {
        customVar: 'custom value',
        anotherVar: 123
      })

      expect(extended.name).toBe('test-skill')
      expect(extended.customVar).toBe('custom value')
      expect(extended.anotherVar).toBe(123)
    })
  })

  describe('validateContext', () => {
    it('should validate valid context', () => {
      const context = manager.createContext(config, 'claude')

      expect(manager.validateContext(context)).toBe(true)
    })

    it('should reject context without name', () => {
      const invalidContext: any = {
        version: '1.0.0',
        description: 'Test',
        platform: { name: 'claude' }
      }

      expect(manager.validateContext(invalidContext)).toBe(false)
    })

    it('should reject context without version', () => {
      const invalidContext: any = {
        name: 'test-skill',
        description: 'Test',
        platform: { name: 'claude' }
      }

      expect(manager.validateContext(invalidContext)).toBe(false)
    })

    it('should reject context without description', () => {
      const invalidContext: any = {
        name: 'test-skill',
        version: '1.0.0',
        platform: { name: 'claude' }
      }

      expect(manager.validateContext(invalidContext)).toBe(false)
    })

    it('should reject context without platform', () => {
      const invalidContext: any = {
        name: 'test-skill',
        version: '1.0.0',
        description: 'Test'
      }

      expect(manager.validateContext(invalidContext)).toBe(false)
    })
  })
})
