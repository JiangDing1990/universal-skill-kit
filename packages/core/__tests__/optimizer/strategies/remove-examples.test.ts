/**
 * RemoveExamplesStrategy Tests
 */

import { describe, it, expect } from 'vitest'
import { RemoveExamplesStrategy } from '../../../src/optimizer/strategies/remove-examples'

describe('RemoveExamplesStrategy', () => {
  const strategy = new RemoveExamplesStrategy()

  describe('basic properties', () => {
    it('should have correct name', () => {
      expect(strategy.name).toBe('RemoveExamples')
    })

    it('should have description', () => {
      expect(strategy.description).toBeTruthy()
      expect(typeof strategy.description).toBe('string')
    })
  })

  describe('compress', () => {
    it('should remove code blocks', () => {
      const input = `
Some text here.
\`\`\`typescript
const foo = 'bar'
\`\`\`
More text after.
`
      const result = strategy.compress(input)
      expect(result).not.toContain('```')
      expect(result).not.toContain('const foo')
      expect(result).toContain('Some text here.')
      expect(result).toContain('More text after.')
    })

    it('should remove long inline code', () => {
      const input = `Text with ${'`' + 'a'.repeat(60) + '`'} long code.`
      const result = strategy.compress(input)
      expect(result).not.toContain('a'.repeat(60))
    })

    it('should keep short inline code', () => {
      const input = 'Use `npm install` to install.'
      const result = strategy.compress(input)
      expect(result).toContain('`npm install`')
    })

    it('should remove example markers in English', () => {
      const input = 'Some text. Example: This is an example. More text.'
      const result = strategy.compress(input)
      expect(result).not.toContain('Example:')
      expect(result).not.toContain('This is an example')
    })

    it('should remove example markers in Chinese', () => {
      const input = '一些文本。 example: 这是一个示例。更多文本。'
      const result = strategy.compress(input)
      expect(result).not.toContain('example:')
      expect(result).not.toContain('这是一个示例')
    })

    it('should remove e.g. examples', () => {
      const input = 'You can use it, e.g.: like this example here.'
      const result = strategy.compress(input)
      expect(result).not.toContain('e.g.:')
      expect(result).not.toContain('like this example here')
    })

    it('should remove comment lines', () => {
      const input = `
Line 1
// This is a comment
# This is also a comment
Line 2
`
      const result = strategy.compress(input)
      expect(result).not.toContain('// This is a comment')
      expect(result).not.toContain('# This is also a comment')
      expect(result).toContain('Line 1')
      expect(result).toContain('Line 2')
    })

    it('should clean up excessive newlines', () => {
      const input = 'Line 1\n\n\n\n\nLine 2'
      const result = strategy.compress(input)
      expect(result).toBe('Line 1\n\nLine 2')
    })

    it('should trim the result', () => {
      const input = '   Some text   '
      const result = strategy.compress(input)
      expect(result).toBe('Some text')
    })

    it('should handle empty input', () => {
      const result = strategy.compress('')
      expect(result).toBe('')
    })

    it('should handle text with no examples', () => {
      const input = 'Just regular text without any examples or code.'
      const result = strategy.compress(input)
      expect(result).toBe(input)
    })
  })
})
