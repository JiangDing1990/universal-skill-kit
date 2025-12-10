import { describe, it, expect } from 'vitest'
import { TemplateEngine } from '../src/engine'

describe('TemplateEngine', () => {
  it('renders template with default helpers and partials', async () => {
    const engine = new TemplateEngine()
    engine.registerPartial('header', '# {{uppercase title}}')

    const template = `{{> header }}
作者：{{default author 'Unknown'}}`
    const result = engine.render(template, {
      title: 'universal skill kit',
      author: 'USK Team'
    })

    expect(result.content).toContain('# UNIVERSAL SKILL KIT')
    expect(result.content).toContain('作者：USK Team')
    expect(result.usedPartials).toEqual(['header'])
  })

  it('supports rendering template file', async () => {
    const engine = new TemplateEngine()
    const result = await engine.renderFile(
      new URL('./fixtures/simple.template.md', import.meta.url),
      { name: 'USK' }
    )

    expect(result.content.trim()).toBe('Hello, USK')
  })
})
