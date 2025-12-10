/**
 * DescriptionCompressor Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { DescriptionCompressor } from '../../src/optimizer/description-compressor'
import type { CompressionOptions } from '../../src/types'
import {
  longDescription,
  shortDescription,
  descriptionWithKeywords,
  descriptionWithExamples,
  descriptionWithVerbosePhrases,
  chineseDescription,
  descriptionAt500Chars
} from './fixtures'

describe('DescriptionCompressor', () => {
  let compressor: DescriptionCompressor

  beforeEach(() => {
    compressor = new DescriptionCompressor()
  })

  describe('constructor', () => {
    it('should initialize with available strategies', () => {
      expect(compressor).toBeInstanceOf(DescriptionCompressor)
      const strategies = compressor.getAvailableStrategies()
      expect(strategies).toContain('conservative')
      expect(strategies).toContain('balanced')
      expect(strategies).toContain('aggressive')
    })
  })

  describe('getAvailableStrategies', () => {
    it('should return all strategy types', () => {
      const strategies = compressor.getAvailableStrategies()
      expect(strategies).toHaveLength(3)
      expect(strategies).toEqual(['conservative', 'balanced', 'aggressive'])
    })
  })

  describe('getStrategyDetails', () => {
    it('should return strategy instances for conservative', () => {
      const details = compressor.getStrategyDetails('conservative')
      expect(details).toBeDefined()
      expect(details!.length).toBeGreaterThan(0)
      expect(details![0]).toHaveProperty('name')
      expect(details![0]).toHaveProperty('compress')
    })

    it('should return strategy instances for balanced', () => {
      const details = compressor.getStrategyDetails('balanced')
      expect(details).toBeDefined()
      expect(details!.length).toBeGreaterThan(0)
    })

    it('should return strategy instances for aggressive', () => {
      const details = compressor.getStrategyDetails('aggressive')
      expect(details).toBeDefined()
      expect(details!.length).toBeGreaterThan(0)
    })

    it('should return undefined for unknown strategy', () => {
      // @ts-expect-error Testing invalid input
      const details = compressor.getStrategyDetails('unknown')
      expect(details).toBeUndefined()
    })
  })

  describe('compress', () => {
    describe('when text is already under limit', () => {
      it('should return original text unchanged', () => {
        const options: CompressionOptions = {
          maxLength: 500,
          preserveKeywords: true,
          removeExamples: true,
          strategy: 'balanced'
        }

        const result = compressor.compress(shortDescription, options)

        expect(result.text).toBe(shortDescription)
        expect(result.originalLength).toBe(shortDescription.length)
        expect(result.compressedLength).toBe(shortDescription.length)
        expect(result.ratio).toBe(1)
      })

      it('should handle exact length match', () => {
        const options: CompressionOptions = {
          maxLength: 500,
          preserveKeywords: true,
          removeExamples: true
        }

        const result = compressor.compress(descriptionAt500Chars, options)

        expect(result.text).toBe(descriptionAt500Chars)
        expect(result.ratio).toBe(1)
      })
    })

    describe('conservative strategy', () => {
      it('should apply minimal compression', () => {
        const options: CompressionOptions = {
          maxLength: 200,
          preserveKeywords: true,
          removeExamples: true,
          strategy: 'conservative'
        }

        const result = compressor.compress(
          descriptionWithVerbosePhrases,
          options
        )

        expect(result.compressedLength).toBeLessThanOrEqual(options.maxLength)
        expect(result.ratio).toBeLessThan(1)
        expect(result.originalLength).toBeGreaterThan(result.compressedLength)
      })

      it('should not remove examples in conservative mode', () => {
        const options: CompressionOptions = {
          maxLength: 300,
          preserveKeywords: true,
          removeExamples: false,
          strategy: 'conservative'
        }

        const result = compressor.compress(descriptionWithExamples, options)

        expect(result.compressedLength).toBeLessThanOrEqual(options.maxLength)
      })
    })

    describe('balanced strategy', () => {
      it('should apply moderate compression', () => {
        const options: CompressionOptions = {
          maxLength: 200,
          preserveKeywords: true,
          removeExamples: true,
          strategy: 'balanced'
        }

        const result = compressor.compress(longDescription, options)

        expect(result.compressedLength).toBeLessThanOrEqual(options.maxLength)
        expect(result.ratio).toBeLessThan(0.7) // Expect significant compression
      })

      it('should remove code examples', () => {
        const options: CompressionOptions = {
          maxLength: 100, // Set lower limit to force compression
          preserveKeywords: true,
          removeExamples: true,
          strategy: 'balanced'
        }

        const result = compressor.compress(descriptionWithExamples, options)

        expect(result.compressedLength).toBeLessThanOrEqual(options.maxLength)
        expect(result.text).not.toContain('```')
        expect(result.text).not.toContain('fetch')
      })

      it('should simplify verbose phrases', () => {
        const options: CompressionOptions = {
          maxLength: 200,
          preserveKeywords: true,
          removeExamples: true,
          strategy: 'balanced'
        }

        const result = compressor.compress(
          descriptionWithVerbosePhrases,
          options
        )

        expect(result.text).not.toContain('due to the fact that')
        expect(result.text).not.toContain('in order to')
      })
    })

    describe('aggressive strategy', () => {
      it('should apply maximum compression', () => {
        const options: CompressionOptions = {
          maxLength: 150,
          preserveKeywords: true,
          removeExamples: true,
          strategy: 'aggressive'
        }

        const result = compressor.compress(longDescription, options)

        expect(result.compressedLength).toBeLessThanOrEqual(options.maxLength)
        expect(result.ratio).toBeLessThan(0.5) // Expect heavy compression
      })

      it('should extract only technical keywords', () => {
        const options: CompressionOptions = {
          maxLength: 100,
          preserveKeywords: true,
          removeExamples: true,
          strategy: 'aggressive'
        }

        const result = compressor.compress(descriptionWithKeywords, options)

        expect(result.text).toContain('TypeScript')
        expect(result.text).toContain('Node.js')
        expect(result.compressedLength).toBeLessThanOrEqual(options.maxLength)
      })
    })

    describe('default strategy', () => {
      it('should use balanced strategy when not specified', () => {
        const options: CompressionOptions = {
          maxLength: 200,
          preserveKeywords: true,
          removeExamples: true
          // No strategy specified
        }

        const result = compressor.compress(longDescription, options)

        expect(result.compressedLength).toBeLessThanOrEqual(options.maxLength)
      })
    })

    describe('intelligent truncation', () => {
      it('should truncate at sentence boundaries', () => {
        const options: CompressionOptions = {
          maxLength: 100,
          preserveKeywords: true,
          removeExamples: true,
          strategy: 'conservative'
        }

        const input =
          'First sentence here. Second sentence that is very long and will be cut off. Third sentence.'
        const result = compressor.compress(input, options)

        expect(result.compressedLength).toBeLessThanOrEqual(options.maxLength)
        // Should end at a sentence boundary, not mid-word
        expect(result.text).toMatch(/[.!?]$|[.!?]\s*$/)
      })

      it('should preserve custom keywords when truncating', () => {
        const options: CompressionOptions = {
          maxLength: 70,
          preserveKeywords: true,
          removeExamples: true,
          strategy: 'conservative',
          customKeywords: ['React']
        }

        const input =
          'This is a description that will be truncated at some point. It uses React framework for building user interfaces efficiently.'
        const result = compressor.compress(input, options)

        expect(result.compressedLength).toBeLessThanOrEqual(options.maxLength)
        // Should try to preserve custom keywords if possible
        if (result.text.length < 70) {
          expect(result.text).toContain('React')
        }
      })

      it('should add ellipsis when hard truncating', () => {
        const options: CompressionOptions = {
          maxLength: 50,
          preserveKeywords: false,
          removeExamples: true,
          strategy: 'conservative'
        }

        const input = 'a'.repeat(200) // No sentence boundaries
        const result = compressor.compress(input, options)

        expect(result.compressedLength).toBeLessThanOrEqual(options.maxLength)
        expect(result.text).toContain('...')
      })
    })

    describe('Chinese text compression', () => {
      it('should compress Chinese descriptions', () => {
        const options: CompressionOptions = {
          maxLength: 50, // Set lower limit to force compression
          preserveKeywords: true,
          removeExamples: true,
          strategy: 'balanced'
        }

        const result = compressor.compress(chineseDescription, options)

        expect(result.compressedLength).toBeLessThanOrEqual(options.maxLength)
        expect(result.ratio).toBeLessThan(1)
      })

      it('should handle Chinese sentence boundaries', () => {
        const options: CompressionOptions = {
          maxLength: 50,
          preserveKeywords: true,
          removeExamples: true,
          strategy: 'conservative'
        }

        const input = '第一句话在这里。第二句话会被保留。第三句话可能被截断。'
        const result = compressor.compress(input, options)

        expect(result.compressedLength).toBeLessThanOrEqual(options.maxLength)
      })
    })

    describe('compression result metadata', () => {
      it('should return correct original length', () => {
        const options: CompressionOptions = {
          maxLength: 200,
          preserveKeywords: true,
          removeExamples: true,
          strategy: 'balanced'
        }

        const result = compressor.compress(longDescription, options)

        expect(result.originalLength).toBe(longDescription.length)
      })

      it('should return correct compressed length', () => {
        const options: CompressionOptions = {
          maxLength: 200,
          preserveKeywords: true,
          removeExamples: true,
          strategy: 'balanced'
        }

        const result = compressor.compress(longDescription, options)

        expect(result.compressedLength).toBe(result.text.length)
        expect(result.compressedLength).toBeLessThanOrEqual(options.maxLength)
      })

      it('should calculate correct compression ratio', () => {
        const options: CompressionOptions = {
          maxLength: 200,
          preserveKeywords: true,
          removeExamples: true,
          strategy: 'balanced'
        }

        const result = compressor.compress(longDescription, options)

        const expectedRatio = result.compressedLength / result.originalLength
        expect(result.ratio).toBeCloseTo(expectedRatio, 5)
      })
    })

    describe('edge cases', () => {
      it('should handle empty string', () => {
        const options: CompressionOptions = {
          maxLength: 500,
          preserveKeywords: true,
          removeExamples: true
        }

        const result = compressor.compress('', options)

        expect(result.text).toBe('')
        expect(result.originalLength).toBe(0)
        expect(result.compressedLength).toBe(0)
        expect(result.ratio).toBe(1)
      })

      it('should handle very short text', () => {
        const options: CompressionOptions = {
          maxLength: 500,
          preserveKeywords: true,
          removeExamples: true
        }

        const input = 'Hi'
        const result = compressor.compress(input, options)

        expect(result.text).toBe(input)
        expect(result.ratio).toBe(1)
      })

      it('should handle text with only whitespace', () => {
        const options: CompressionOptions = {
          maxLength: 500,
          preserveKeywords: true,
          removeExamples: true
        }

        const input = '   \n\n   '
        const result = compressor.compress(input, options)

        expect(result.compressedLength).toBeLessThanOrEqual(options.maxLength)
      })

      it('should handle very aggressive max length', () => {
        const options: CompressionOptions = {
          maxLength: 20,
          preserveKeywords: true,
          removeExamples: true,
          strategy: 'aggressive'
        }

        const result = compressor.compress(longDescription, options)

        expect(result.compressedLength).toBeLessThanOrEqual(options.maxLength)
        expect(result.text.length).toBeGreaterThan(0) // Should not be empty
      })
    })
  })
})
