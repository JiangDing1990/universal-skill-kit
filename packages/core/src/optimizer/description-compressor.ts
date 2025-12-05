/**
 * Description Compressor
 * 描述压缩器
 */

import type {
  ICompressionStrategy,
  CompressionStrategyType,
  CompressionResult
} from './compression-strategy'
import type { CompressionOptions } from '../types'
import {
  RemoveExamplesStrategy,
  SimplifySyntaxStrategy,
  ExtractKeywordsStrategy,
  AbbreviateStrategy
} from './strategies'

/**
 * Description Compressor
 * 智能压缩描述文本到指定长度
 */
export class DescriptionCompressor {
  private strategies: Map<CompressionStrategyType, ICompressionStrategy[]>

  constructor() {
    this.strategies = new Map([
      // Conservative: minimal changes, preserve most content
      ['conservative', [new SimplifySyntaxStrategy(), new AbbreviateStrategy()]],
      // Balanced: moderate compression
      [
        'balanced',
        [
          new RemoveExamplesStrategy(),
          new SimplifySyntaxStrategy(),
          new AbbreviateStrategy()
        ]
      ],
      // Aggressive: maximum compression
      [
        'aggressive',
        [
          new RemoveExamplesStrategy(),
          new SimplifySyntaxStrategy(),
          new ExtractKeywordsStrategy(),
          new AbbreviateStrategy()
        ]
      ]
    ])
  }

  /**
   * Compress description to target length
   * 压缩描述到目标长度
   */
  compress(text: string, options: CompressionOptions): CompressionResult {
    const originalLength = text.length
    let result = text
    const strategy = options.strategy || 'balanced'

    // If already under limit, return as-is
    if (originalLength <= options.maxLength) {
      return {
        text: result,
        originalLength,
        compressedLength: originalLength,
        ratio: 1
      }
    }

    // Apply compression strategies
    const strategiesToApply = this.strategies.get(strategy) || []

    for (const compressionStrategy of strategiesToApply) {
      result = compressionStrategy.compress(result)

      // Check if we've reached the target
      if (result.length <= options.maxLength) {
        break
      }
    }

    // If still too long, apply intelligent truncation
    if (result.length > options.maxLength) {
      result = this.truncateIntelligently(
        result,
        options.maxLength,
        options.customKeywords
      )
    }

    const compressedLength = result.length
    const ratio = compressedLength / originalLength

    return {
      text: result,
      originalLength,
      compressedLength,
      ratio
    }
  }

  /**
   * Intelligently truncate text to max length
   * 智能截断文本到最大长度
   */
  private truncateIntelligently(
    text: string,
    maxLength: number,
    customKeywords?: string[]
  ): string {
    if (text.length <= maxLength) {
      return text
    }

    // Try to find a natural break point (sentence end) near the limit
    const targetLength = maxLength - 3 // Reserve space for "..."

    // Look for sentence endings within the target range
    const sentenceEndMarkers = ['. ', '! ', '? ', '。', '！', '？']
    let bestBreakPoint = -1

    // Search backwards from target length for a sentence end
    for (let i = targetLength; i > targetLength * 0.7 && i > 0; i--) {
      const char = text[i]
      const nextChar = text[i + 1]

      if (
        sentenceEndMarkers.some((marker) =>
          marker === `${char}${nextChar}` || marker === char
        )
      ) {
        bestBreakPoint = i + 1
        break
      }
    }

    // If found a good break point, use it
    if (bestBreakPoint > 0) {
      let truncated = text.substring(0, bestBreakPoint).trim()

      // Preserve custom keywords if any were cut off
      if (customKeywords && customKeywords.length > 0) {
        const cutOffText = text.substring(bestBreakPoint)
        const missingKeywords = customKeywords.filter(
          (kw) => cutOffText.includes(kw) && !truncated.includes(kw)
        )

        if (missingKeywords.length > 0) {
          const keywordsText = ` [${missingKeywords.join(', ')}]`
          if (truncated.length + keywordsText.length <= maxLength) {
            truncated += keywordsText
          }
        }
      }

      return truncated
    }

    // No natural break found, hard truncate at word boundary
    const words = text.substring(0, targetLength).split(/\s+/)
    words.pop() // Remove last potentially incomplete word

    return words.join(' ') + '...'
  }

  /**
   * Get available compression strategies
   * 获取可用的压缩策略
   */
  getAvailableStrategies(): CompressionStrategyType[] {
    return Array.from(this.strategies.keys())
  }

  /**
   * Get strategy details
   * 获取策略详情
   */
  getStrategyDetails(
    strategy: CompressionStrategyType
  ): ICompressionStrategy[] | undefined {
    return this.strategies.get(strategy)
  }
}
