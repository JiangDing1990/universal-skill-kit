import { describe, it, expect, beforeEach } from 'vitest'
import { TemplateEngine, TemplateEngineError } from '../src/template'
import type { TemplateContext } from '../src/types/template'

describe('TemplateEngine', () => {
  let engine: TemplateEngine
  let context: TemplateContext

  beforeEach(() => {
    engine = new TemplateEngine()
    context = {
      name: 'test-skill',
      version: '1.0.0',
      author: 'Test Author',
      description: 'A test skill',
      tags: ['test', 'example'],
      platform: {
        name: 'claude',
        claude: true,
        codex: false
      }
    }
  })

  describe('render', () => {
    it('should render basic template with variables', () => {
      const template = 'Name: {{name}}, Version: {{version}}'
      const result = engine.render(template, context)

      expect(result.content).toBe('Name: test-skill, Version: 1.0.0')
      expect(result.duration).toBeGreaterThanOrEqual(0)
    })

    it('should render template with if block', () => {
      const template = '{{#if author}}Author: {{author}}{{/if}}'
      const result = engine.render(template, context)

      expect(result.content).toBe('Author: Test Author')
    })

    it('should render template with unless block', () => {
      const template = '{{#unless platform.codex}}Not Codex{{/unless}}'
      const result = engine.render(template, context)

      expect(result.content).toBe('Not Codex')
    })

    it('should render template with each block', () => {
      const template = '{{#each tags}}{{this}} {{/each}}'
      const result = engine.render(template, context)

      expect(result.content).toBe('test example ')
    })

    it('should support eq helper', () => {
      const template = '{{#if (eq platform.name "claude")}}Is Claude{{/if}}'
      const result = engine.render(template, context)

      expect(result.content).toBe('Is Claude')
    })

    it('should support ne helper', () => {
      const template = '{{#if (ne platform.name "codex")}}Not Codex{{/if}}'
      const result = engine.render(template, context)

      expect(result.content).toBe('Not Codex')
    })

    it('should support and helper', () => {
      const template = '{{#if (and author platform.claude)}}Both exist{{/if}}'
      const result = engine.render(template, context)

      expect(result.content).toBe('Both exist')
    })

    it('should support or helper', () => {
      const template =
        '{{#if (or platform.claude platform.codex)}}Has platform{{/if}}'
      const result = engine.render(template, context)

      expect(result.content).toBe('Has platform')
    })

    it('should support platform helper', () => {
      const template = '{{#if (platform "claude")}}Is Claude{{/if}}'
      const result = engine.render(template, context)

      expect(result.content).toBe('Is Claude')
    })

    it('should throw error for invalid template syntax', () => {
      const template = '{{#if unclosed'

      expect(() => engine.render(template, context)).toThrow(
        TemplateEngineError
      )
    })
  })

  describe('partials', () => {
    it('should register and use partial', () => {
      engine.registerPartial('header', '# {{name}}\n')

      const template = '{{> header}}Version: {{version}}'
      const result = engine.render(template, context)

      expect(result.content).toBe('# test-skill\nVersion: 1.0.0')
      expect(result.usedPartials).toContain('header')
    })

    it('should register multiple partials', () => {
      engine.registerPartials([
        { name: 'header', content: '# {{name}}' },
        { name: 'footer', content: '\nVersion: {{version}}' }
      ])

      const template = '{{> header}}{{> footer}}'
      const result = engine.render(template, context)

      expect(result.content).toBe('# test-skill\nVersion: 1.0.0')
      expect(result.usedPartials).toContain('header')
      expect(result.usedPartials).toContain('footer')
    })

    it('should unregister partial', () => {
      engine.registerPartial('test', 'Test content')
      expect(engine.getPartials()).toContain('test')

      engine.unregisterPartial('test')
      expect(engine.getPartials()).not.toContain('test')
    })

    it('should clear all partials', () => {
      engine.registerPartial('p1', 'Content 1')
      engine.registerPartial('p2', 'Content 2')

      engine.clear()

      expect(engine.getPartials()).toHaveLength(0)
    })
  })

  describe('custom helpers', () => {
    it('should register custom helper', () => {
      engine.registerHelper('uppercase', function (str: string) {
        return str.toUpperCase()
      })

      const template = '{{uppercase name}}'
      const result = engine.render(template, context)

      expect(result.content).toBe('TEST-SKILL')
    })

    it('should use custom helper with block', () => {
      engine.registerHelper(
        'repeat',
        function (this: any, count: number, options: any) {
          let result = ''
          for (let i = 0; i < count; i++) {
            result += options.fn(this)
          }
          return result
        }
      )

      const template = '{{#repeat 3}}*{{/repeat}}'
      const result = engine.render(template, context)

      expect(result.content).toBe('***')
    })
  })

  describe('compile', () => {
    it('should compile template once and reuse', () => {
      const template = 'Name: {{name}}'
      const compiled = engine.compile(template)

      const result1 = compiled(context)
      const result2 = compiled({ ...context, name: 'other-skill' })

      expect(result1).toBe('Name: test-skill')
      expect(result2).toBe('Name: other-skill')
    })

    it('should respect strict mode', () => {
      const template = '{{undefinedVar}}'

      expect(() => engine.compile(template, { strict: true })).not.toThrow()

      // 严格模式下渲染未定义变量会抛出错误
      const compiled = engine.compile(template, { strict: true })
      expect(() => compiled(context)).toThrow()
    })
  })
})
