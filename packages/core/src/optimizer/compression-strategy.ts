/**
 * Compression Strategy Interface
 * 压缩策略接口
 */

import type { CompressionStrategy as CompressionStrategyType } from '../types'

export type { CompressionStrategyType }

/**
 * Compression result
 * 压缩结果
 */
export interface CompressionResult {
  /** Compressed text */
  text: string
  /** Original length */
  originalLength: number
  /** Compressed length */
  compressedLength: number
  /** Compression ratio (0-1) */
  ratio: number
}

/**
 * Base compression strategy interface
 * 基础压缩策略接口
 */
export interface ICompressionStrategy {
  /** Strategy name */
  name: string
  /** Strategy description */
  description: string
  /** Apply compression to text */
  compress(text: string): string
}
