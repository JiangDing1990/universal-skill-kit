/**
 * ExtractKeywordsStrategy Tests
 */

import { describe, it, expect } from 'vitest'
import { ExtractKeywordsStrategy } from '../../../src/optimizer/strategies/extract-keywords'

describe('ExtractKeywordsStrategy', () => {
  const strategy = new ExtractKeywordsStrategy()

  describe('basic properties', () => {
    it('should have correct name', () => {
      expect(strategy.name).toBe('ExtractKeywords')
    })

    it('should have description', () => {
      expect(strategy.description).toBeTruthy()
    })
  })

  describe('compress', () => {
    it('should extract sentences with programming language names', () => {
      const input = `
Some random text here.
This skill supports TypeScript and JavaScript development.
More random content.
Works with React and Vue frameworks.
Even more text.
`
      const result = strategy.compress(input)
      expect(result).toContain('TypeScript')
      expect(result).toContain('JavaScript')
      expect(result).toContain('React')
      expect(result).toContain('Vue')
      expect(result).not.toContain('Some random text')
    })

    it('should extract sentences with version numbers', () => {
      const input = `
Generic description.
Supports Node.js v18.0.0 and later.
More generic text.
Compatible with TypeScript 5.9.3.
`
      const result = strategy.compress(input)
      expect(result).toContain('v18.0.0')
      expect(result).toContain('5.9.3')
    })

    it('should extract sentences with API-related terms', () => {
      const input = `
Some text.
Provides REST API and GraphQL endpoints.
Other content.
Supports WebSocket connections.
`
      const result = strategy.compress(input)
      expect(result).toContain('REST')
      expect(result).toContain('GraphQL')
      expect(result).toContain('WebSocket')
    })

    it('should extract sentences with authentication terms', () => {
      const input = `
Generic info.
Implements JWT authentication and OAuth authorization.
More info.
Includes database integration.
`
      const result = strategy.compress(input)
      expect(result).toContain('JWT')
      expect(result).toContain('OAuth')
      expect(result).toContain('database')
    })

    it('should extract sentences with component-related terms', () => {
      const input = `
Some description.
Creates reusable components and custom hooks.
Other text.
Provides middleware and plugin support.
`
      const result = strategy.compress(input)
      // Should extract sentences containing technical terms
      const hasTechnicalTerms =
        result.includes('component') || result.includes('hook') ||
        result.includes('middleware') || result.includes('plugin')
      expect(hasTechnicalTerms).toBe(true)
      // Should not contain generic descriptions
      expect(result).not.toContain('Some description')
    })

    it('should extract sentences with file extensions', () => {
      const input = `
Generic content.
Supports .ts, .tsx, and .json files.
More content.
Also handles .yaml and .md files.
`
      const result = strategy.compress(input)
      expect(result).toContain('.ts')
      expect(result).toContain('.tsx')
      expect(result).toContain('.json')
    })

    it('should extract sentences with technical action verbs', () => {
      const input = `
Description here.
Use npm install to setup and build the project.
Random text.
Run tests and deploy to production.
`
      const result = strategy.compress(input)
      expect(result).toContain('install')
      expect(result).toContain('build')
      expect(result).toContain('test')
      expect(result).toContain('deploy')
    })

    it('should return first sentences with keywords list if no technical sentences', () => {
      const input = 'Just some plain text without any technical terms.'
      const result = strategy.compress(input)
      expect(result).toContain('Just some plain text')
    })

    it('should handle text with mixed technical and non-technical content', () => {
      const input = `
This is a comprehensive tool.
Built with TypeScript 5.9 for Node.js development.
It provides many features.
Supports REST API and GraphQL.
Works great for all projects.
`
      const result = strategy.compress(input)
      expect(result).toContain('TypeScript')
      expect(result).toContain('Node.js')
      expect(result).toContain('REST')
      expect(result).toContain('GraphQL')
      // Should exclude generic sentences
      expect(result.length).toBeLessThan(input.length)
    })

    it('should handle empty input', () => {
      const result = strategy.compress('')
      expect(result).toBe('')
    })

    it('should handle text with only technical terms', () => {
      const input = 'TypeScript. JavaScript. React. Node.js. API. GraphQL.'
      const result = strategy.compress(input)
      expect(result).toContain('TypeScript')
      expect(result).toContain('JavaScript')
      expect(result).toContain('React')
    })
  })
})
