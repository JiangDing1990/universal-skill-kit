/**
 * AbbreviateStrategy Tests
 */

import { describe, it, expect } from 'vitest'
import { AbbreviateStrategy } from '../../../src/optimizer/strategies/abbreviate'

describe('AbbreviateStrategy', () => {
  const strategy = new AbbreviateStrategy()

  describe('basic properties', () => {
    it('should have correct name', () => {
      expect(strategy.name).toBe('Abbreviate')
    })

    it('should have description', () => {
      expect(strategy.description).toBeTruthy()
    })
  })

  describe('compress', () => {
    it('should abbreviate "application" to "app"', () => {
      const input = 'This is a web application for users.'
      const result = strategy.compress(input)
      expect(result).toContain('app')
      expect(result).not.toContain('application')
    })

    it('should abbreviate "configuration" to "config"', () => {
      const input = 'Update the configuration file.'
      const result = strategy.compress(input)
      expect(result).toContain('config')
      expect(result).not.toContain('configuration')
    })

    it('should abbreviate "database" to "DB"', () => {
      const input = 'Connect to the database server.'
      const result = strategy.compress(input)
      expect(result).toContain('DB')
      expect(result).not.toContain('database')
    })

    it('should abbreviate "documentation" to "docs"', () => {
      const input = 'Read the documentation for details.'
      const result = strategy.compress(input)
      expect(result).toContain('docs')
      expect(result).not.toContain('documentation')
    })

    it('should abbreviate "repository" to "repo"', () => {
      const input = 'Clone the repository from GitHub.'
      const result = strategy.compress(input)
      expect(result).toContain('repo')
      expect(result).not.toContain('repository')
    })

    it('should abbreviate "environment" to "env"', () => {
      const input = 'Set the environment variables.'
      const result = strategy.compress(input)
      expect(result).toContain('env')
      expect(result).not.toContain('environment')
    })

    it('should handle multiple abbreviations in one text', () => {
      const input =
        'The application configuration connects to the database and provides documentation.'
      const result = strategy.compress(input)
      expect(result).toContain('app')
      expect(result).toContain('config')
      expect(result).toContain('DB')
      expect(result).toContain('docs')
    })

    it('should be case-insensitive', () => {
      const input = 'Application, APPLICATION, and ApPlIcAtIoN.'
      const result = strategy.compress(input)
      expect(result.toLowerCase()).not.toContain('application')
    })

    it('should remove filler words', () => {
      const input =
        'Actually, basically, the system just really works very well.'
      const result = strategy.compress(input)
      expect(result).not.toContain('Actually')
      expect(result).not.toContain('basically')
      expect(result).not.toContain('just')
      expect(result).not.toContain('really')
      expect(result).not.toContain('very')
      expect(result).toContain('system')
      expect(result).toContain('works')
    })

    it('should abbreviate multiple terms in one sentence', () => {
      const input = 'The application configuration uses the database.'
      const result = strategy.compress(input)
      expect(result).toContain('app')
      expect(result).toContain('config')
      expect(result).toContain('DB')
    })

    it('should clean up extra spaces after removals', () => {
      const input = 'The    application    uses    the    database.'
      const result = strategy.compress(input)
      expect(result).not.toMatch(/\s{2,}/)
    })

    it('should trim the result', () => {
      const input = '   application configuration   '
      const result = strategy.compress(input)
      expect(result).toBe('app config')
    })

    it('should handle empty input', () => {
      const result = strategy.compress('')
      expect(result).toBe('')
    })

    it('should handle text with no abbreviatable words', () => {
      const input = 'Simple text here.'
      const result = strategy.compress(input)
      expect(result).toBe('Simple text here.')
    })

    it('should abbreviate Chinese technical terms', () => {
      const input = '应用程序使用数据库和文档系统。'
      const result = strategy.compress(input)
      expect(result).toContain('应用')
      expect(result).toContain('文档')
    })
  })
})
