/**
 * SimplifySyntaxStrategy Tests
 */

import { describe, it, expect } from 'vitest'
import { SimplifySyntaxStrategy } from '../../../src/optimizer/strategies/simplify-syntax'

describe('SimplifySyntaxStrategy', () => {
  const strategy = new SimplifySyntaxStrategy()

  describe('basic properties', () => {
    it('should have correct name', () => {
      expect(strategy.name).toBe('SimplifySyntax')
    })

    it('should have description', () => {
      expect(strategy.description).toBeTruthy()
    })
  })

  describe('compress', () => {
    it('should remove markdown bold formatting', () => {
      const input = 'This is **bold text** here.'
      const result = strategy.compress(input)
      expect(result).toBe('This is bold text here.')
    })

    it('should remove markdown italic formatting', () => {
      const input = 'This is *italic text* here.'
      const result = strategy.compress(input)
      expect(result).toBe('This is italic text here.')
    })

    it('should remove markdown strikethrough formatting', () => {
      const input = 'This is ~~strikethrough~~ text.'
      const result = strategy.compress(input)
      expect(result).toBe('This is strikethrough text.')
    })

    it('should simplify "in order to" to "to"', () => {
      const input = 'We do this in order to improve performance.'
      const result = strategy.compress(input)
      expect(result).toContain('We do this to improve performance')
    })

    it('should simplify "due to the fact that" to "because"', () => {
      const input = 'This fails due to the fact that the config is missing.'
      const result = strategy.compress(input)
      expect(result).toContain('This fails because the config is missing')
    })

    it('should simplify "at this point in time" to "now"', () => {
      const input = 'At this point in time, we are ready.'
      const result = strategy.compress(input)
      expect(result).toContain('now, we are ready')
    })

    it('should simplify "is able to" to "can"', () => {
      const input = 'The system is able to handle requests.'
      const result = strategy.compress(input)
      expect(result).toContain('The system can handle requests')
    })

    it('should simplify "make use of" to "use"', () => {
      const input = 'We make use of caching.'
      const result = strategy.compress(input)
      expect(result).toContain('We use caching')
    })

    it('should simplify Chinese verbose phrases', () => {
      const input = '由于这个原因，我们能够实现这个功能。'
      const result = strategy.compress(input)
      expect(result).toContain('因')
      expect(result).toContain('可')
    })

    it('should remove redundant articles', () => {
      const input = 'Use the same approach and the following steps.'
      const result = strategy.compress(input)
      expect(result).toContain('Use same approach')
      expect(result).toContain('following steps')
    })

    it('should normalize punctuation spacing', () => {
      const input = 'First   ,   second   ;   third   .   Done'
      const result = strategy.compress(input)
      expect(result).toContain('First, second, third. Done')
    })

    it('should clean up excessive whitespace', () => {
      const input = 'Too    many     spaces'
      const result = strategy.compress(input)
      expect(result).toBe('Too many spaces')
    })

    it('should clean up excessive newlines', () => {
      const input = 'Line 1\n\n\n\nLine 2'
      const result = strategy.compress(input)
      expect(result).toBe('Line 1\n\nLine 2')
    })

    it('should trim the result', () => {
      const input = '   Text with spaces   '
      const result = strategy.compress(input)
      expect(result).toBe('Text with spaces')
    })

    it('should handle multiple replacements in one text', () => {
      const input = 'In order to improve performance, we make use of caching. The system is able to handle a large number of requests.'
      const result = strategy.compress(input)
      expect(result).toContain('to improve performance')
      expect(result).toContain('we use caching')
      expect(result).toContain('system can handle')
      expect(result).toContain('many requests')
    })

    it('should handle empty input', () => {
      const result = strategy.compress('')
      expect(result).toBe('')
    })
  })
})
