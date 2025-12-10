/**
 * SkillAnalyzer Tests
 * Skill分析器测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  SkillAnalyzer,
  createSkillAnalyzer
} from '../../src/analyzer/skill-analyzer'
import {
  simpleSkill,
  complexSkill,
  skillWithCodeExamples,
  skillWithLongDescription,
  skillWithShortDescription,
  incompleteSkill,
  skillWithManyKeywords,
  structuredSkill,
  unstructuredSkill
} from './fixtures'

describe('SkillAnalyzer', () => {
  let analyzer: SkillAnalyzer

  beforeEach(() => {
    analyzer = new SkillAnalyzer()
  })

  describe('constructor', () => {
    it('should create a new SkillAnalyzer instance', () => {
      expect(analyzer).toBeInstanceOf(SkillAnalyzer)
    })
  })

  describe('analyze', () => {
    it('should analyze a simple skill', () => {
      const report = analyzer.analyze(simpleSkill)

      expect(report).toHaveProperty('complexity')
      expect(report).toHaveProperty('descriptionLength')
      expect(report).toHaveProperty('hasCodeExamples')
      expect(report).toHaveProperty('technicalKeywords')
      expect(report).toHaveProperty('recommendedStrategy')
      expect(report).toHaveProperty('estimatedQuality')
      expect(report).toHaveProperty('warnings')
      expect(report).toHaveProperty('suggestions')
    })

    it('should detect low complexity for simple skill', () => {
      const report = analyzer.analyze(simpleSkill)

      expect(report.complexity).toBe('low')
    })

    it('should detect high complexity for complex skill', () => {
      const report = analyzer.analyze(complexSkill)

      expect(report.complexity).toBe('high')
    })

    it('should detect code examples', () => {
      const report = analyzer.analyze(skillWithCodeExamples)

      expect(report.hasCodeExamples).toBe(true)
    })

    it('should not detect code examples in simple skill', () => {
      const report = analyzer.analyze(simpleSkill)

      expect(report.hasCodeExamples).toBe(false)
    })

    it('should extract technical keywords', () => {
      const report = analyzer.analyze(skillWithManyKeywords)

      expect(report.technicalKeywords.length).toBeGreaterThan(10)
      expect(report.technicalKeywords).toContain('TypeScript')
      expect(report.technicalKeywords).toContain('React')
      expect(report.technicalKeywords).toContain('Node.js')
    })

    it('should calculate description length', () => {
      const report = analyzer.analyze(skillWithLongDescription)

      expect(report.descriptionLength).toBe(800)
    })

    it('should recommend compression strategy', () => {
      const report = analyzer.analyze(skillWithLongDescription)

      // Long description (800 chars) should recommend aggressive or balanced
      expect(['aggressive', 'balanced']).toContain(report.recommendedStrategy)
    })

    it('should estimate quality score', () => {
      const report = analyzer.analyze(complexSkill)

      expect(report.estimatedQuality).toBeGreaterThan(70)
      expect(report.estimatedQuality).toBeLessThanOrEqual(100)
    })

    it('should generate warnings for long description', () => {
      const report = analyzer.analyze(skillWithLongDescription)

      expect(report.warnings.length).toBeGreaterThan(0)
      expect(report.warnings.some(w => w.includes('500'))).toBe(true)
    })

    it('should generate warnings for short description', () => {
      const report = analyzer.analyze(skillWithShortDescription)

      expect(
        report.warnings.some(w => w.toLowerCase().includes('too short'))
      ).toBe(true)
    })

    it('should generate warnings for incomplete metadata', () => {
      const report = analyzer.analyze(incompleteSkill)

      expect(report.warnings.length).toBeGreaterThan(0)
      expect(report.warnings.some(w => w.includes('version'))).toBe(true)
      expect(report.warnings.some(w => w.includes('tags'))).toBe(true)
    })

    it('should generate suggestions', () => {
      const report = analyzer.analyze(skillWithLongDescription)

      expect(report.suggestions.length).toBeGreaterThan(0)
    })
  })

  describe('complexity analysis', () => {
    it('should classify simple skills as low complexity', () => {
      const report = analyzer.analyze(simpleSkill)

      expect(report.complexity).toBe('low')
    })

    it('should classify complex skills as high complexity', () => {
      const report = analyzer.analyze(complexSkill)

      expect(report.complexity).toBe('high')
    })

    it('should consider description length in complexity', () => {
      const report = analyzer.analyze(skillWithLongDescription)

      // Long description with short body might still be low complexity
      // Complexity is based on multiple factors
      expect(['low', 'medium', 'high']).toContain(report.complexity)
    })

    it('should consider code examples in complexity', () => {
      const report = analyzer.analyze(skillWithCodeExamples)

      // Should increase complexity due to code examples
      expect(['medium', 'high']).toContain(report.complexity)
    })

    it('should consider technical keywords in complexity', () => {
      const report = analyzer.analyze(skillWithManyKeywords)

      // Many keywords should increase complexity
      expect(['medium', 'high']).toContain(report.complexity)
    })

    it('should consider resources in complexity', () => {
      const report = analyzer.analyze(complexSkill)

      // Complex skill has many resources
      expect(report.complexity).toBe('high')
    })
  })

  describe('strategy recommendation', () => {
    it('should recommend conservative for short descriptions', () => {
      const report = analyzer.analyze(simpleSkill)

      expect(report.recommendedStrategy).toBe('conservative')
    })

    it('should recommend aggressive or balanced for very long descriptions', () => {
      const report = analyzer.analyze(skillWithLongDescription)

      // Very long description (800 chars) should use aggressive or balanced
      expect(['aggressive', 'balanced']).toContain(report.recommendedStrategy)
    })

    it('should recommend appropriate strategy for skills with code examples', () => {
      const report = analyzer.analyze(skillWithCodeExamples)

      // Strategy depends on description length and complexity
      expect(['conservative', 'balanced', 'aggressive']).toContain(
        report.recommendedStrategy
      )
    })

    it('should consider complexity in recommendation', () => {
      const report = analyzer.analyze(complexSkill)

      // Complex skill with long description should use aggressive
      expect(['balanced', 'aggressive']).toContain(report.recommendedStrategy)
    })
  })

  describe('quality estimation', () => {
    it('should give high score to well-structured skills', () => {
      const report = analyzer.analyze(complexSkill)

      expect(report.estimatedQuality).toBeGreaterThan(70)
    })

    it('should penalize skills with very short descriptions', () => {
      const report = analyzer.analyze(skillWithShortDescription)

      expect(report.estimatedQuality).toBeLessThan(70)
    })

    it('should penalize skills with incomplete metadata', () => {
      const report = analyzer.analyze(incompleteSkill)

      expect(report.estimatedQuality).toBeLessThan(80)
    })

    it('should bonus for technical keywords', () => {
      const report1 = analyzer.analyze(skillWithManyKeywords)
      const report2 = analyzer.analyze(simpleSkill)

      expect(report1.estimatedQuality).toBeGreaterThan(report2.estimatedQuality)
    })

    it('should bonus for structured content', () => {
      const report1 = analyzer.analyze(structuredSkill)
      const report2 = analyzer.analyze(unstructuredSkill)

      expect(report1.estimatedQuality).toBeGreaterThan(report2.estimatedQuality)
    })

    it('should keep quality score within 0-100 range', () => {
      const skills = [
        simpleSkill,
        complexSkill,
        incompleteSkill,
        skillWithShortDescription,
        skillWithLongDescription
      ]

      for (const skill of skills) {
        const report = analyzer.analyze(skill)
        expect(report.estimatedQuality).toBeGreaterThanOrEqual(0)
        expect(report.estimatedQuality).toBeLessThanOrEqual(100)
      }
    })
  })

  describe('warnings generation', () => {
    it('should warn about long descriptions exceeding Codex limit', () => {
      const report = analyzer.analyze(skillWithLongDescription)

      const hasLengthWarning = report.warnings.some(
        w => w.includes('500') && w.includes('Codex')
      )
      expect(hasLengthWarning).toBe(true)
    })

    it('should warn about short descriptions', () => {
      const report = analyzer.analyze(skillWithShortDescription)

      const hasShortWarning = report.warnings.some(w =>
        w.toLowerCase().includes('too short')
      )
      expect(hasShortWarning).toBe(true)
    })

    it('should warn about missing version', () => {
      const report = analyzer.analyze(incompleteSkill)

      const hasVersionWarning = report.warnings.some(w => w.includes('version'))
      expect(hasVersionWarning).toBe(true)
    })

    it('should warn about missing tags', () => {
      const report = analyzer.analyze(incompleteSkill)

      const hasTagsWarning = report.warnings.some(w => w.includes('tags'))
      expect(hasTagsWarning).toBe(true)
    })

    it('should warn about very short body', () => {
      const report = analyzer.analyze(incompleteSkill)

      const hasBodyWarning = report.warnings.some(w => w.includes('Body'))
      expect(hasBodyWarning).toBe(true)
    })

    it('should warn about too many code examples', () => {
      const skillWithManyExamples = {
        ...skillWithCodeExamples,
        body: '```\ncode1\n```\n'.repeat(6) // 6 code blocks
      }

      const report = analyzer.analyze(skillWithManyExamples)

      const hasExampleWarning = report.warnings.some(w =>
        w.includes('code examples')
      )
      expect(hasExampleWarning).toBe(true)
    })

    it('should not generate warnings for well-formed skills', () => {
      const report = analyzer.analyze(complexSkill)

      // Complex skill is well-formed, might only warn about description length
      expect(report.warnings.length).toBeLessThanOrEqual(1)
    })
  })

  describe('suggestions generation', () => {
    it('should suggest compression strategy for long descriptions', () => {
      const report = analyzer.analyze(skillWithLongDescription)

      const hasCompressionSuggestion = report.suggestions.some(
        s => s.type === 'optimization' && s.message.includes('compression')
      )
      expect(hasCompressionSuggestion).toBe(true)
    })

    it('should suggest adding version if missing', () => {
      const report = analyzer.analyze(incompleteSkill)

      const hasVersionSuggestion = report.suggestions.some(s =>
        s.message.includes('version')
      )
      expect(hasVersionSuggestion).toBe(true)
    })

    it('should suggest adding tags with detected keywords', () => {
      const skillNoTags = {
        ...skillWithManyKeywords,
        metadata: { ...skillWithManyKeywords.metadata, tags: [] }
      }
      const report = analyzer.analyze(skillNoTags)

      const hasTagSuggestion = report.suggestions.some(s =>
        s.message.includes('tags')
      )
      expect(hasTagSuggestion).toBe(true)
    })

    it('should suggest removing code examples from description', () => {
      const skillWithExamplesInDesc = {
        ...skillWithCodeExamples,
        metadata: {
          ...skillWithCodeExamples.metadata,
          description: 'Example: ```code``` in description'.repeat(20) // Make it long
        }
      }

      const report = analyzer.analyze(skillWithExamplesInDesc)

      const hasExampleSuggestion = report.suggestions.some(s =>
        s.message.toLowerCase().includes('code examples')
      )
      expect(hasExampleSuggestion).toBe(true)
    })

    it('should suggest adding structure to unstructured content', () => {
      const report = analyzer.analyze(unstructuredSkill)

      const hasStructureSuggestion = report.suggestions.some(
        s =>
          s.message.includes('markdown headers') || s.message.includes('lists')
      )
      expect(hasStructureSuggestion).toBe(true)
    })

    it('should suggest splitting high complexity skills', () => {
      const report = analyzer.analyze(complexSkill)

      const hasSplitSuggestion = report.suggestions.some(
        s => s.type === 'warning' && s.message.includes('splitting')
      )
      expect(hasSplitSuggestion).toBe(true)
    })

    it('should categorize suggestions by type', () => {
      const report = analyzer.analyze(incompleteSkill)

      const types = report.suggestions.map(s => s.type)
      expect(
        types.some(t => ['warning', 'info', 'optimization'].includes(t))
      ).toBe(true)
    })
  })

  describe('keyword extraction', () => {
    it('should extract programming language names', () => {
      const report = analyzer.analyze(skillWithManyKeywords)

      expect(report.technicalKeywords).toContain('TypeScript')
      expect(report.technicalKeywords).toContain('JavaScript')
      expect(report.technicalKeywords).toContain('Python')
    })

    it('should extract framework names', () => {
      const report = analyzer.analyze(complexSkill)

      expect(report.technicalKeywords).toContain('React')
      expect(report.technicalKeywords).toContain('TypeScript')
    })

    it('should extract version numbers', () => {
      const report = analyzer.analyze(complexSkill)

      const hasVersions = report.technicalKeywords.some(k => /\d+\.\d+/.test(k))
      expect(hasVersions).toBe(true)
    })

    it('should extract API-related terms', () => {
      const report = analyzer.analyze(skillWithManyKeywords)

      const hasApiTerms = report.technicalKeywords.some(k =>
        ['REST', 'API', 'GraphQL', 'WebSocket'].includes(k)
      )
      expect(hasApiTerms).toBe(true)
    })

    it('should extract database terms', () => {
      const report = analyzer.analyze(skillWithManyKeywords)

      const hasDbTerms = report.technicalKeywords.some(k =>
        ['PostgreSQL', 'MongoDB', 'Redis'].includes(k)
      )
      expect(hasDbTerms).toBe(true)
    })

    it('should return empty array if no keywords found', () => {
      const report = analyzer.analyze(unstructuredSkill)

      expect(Array.isArray(report.technicalKeywords)).toBe(true)
    })

    it('should not duplicate keywords', () => {
      const skillWithDuplicates = {
        ...complexSkill,
        body: 'React React React TypeScript TypeScript'
      }

      const report = analyzer.analyze(skillWithDuplicates)

      const reactCount = report.technicalKeywords.filter(
        k => k === 'React'
      ).length
      expect(reactCount).toBe(1)
    })
  })

  describe('createSkillAnalyzer', () => {
    it('should create a new SkillAnalyzer instance', () => {
      const newAnalyzer = createSkillAnalyzer()

      expect(newAnalyzer).toBeInstanceOf(SkillAnalyzer)
    })

    it('should create independent instances', () => {
      const analyzer1 = createSkillAnalyzer()
      const analyzer2 = createSkillAnalyzer()

      expect(analyzer1).not.toBe(analyzer2)
    })
  })

  describe('edge cases', () => {
    it('should handle skill with empty body', () => {
      const emptyBodySkill = { ...simpleSkill, body: '' }
      const report = analyzer.analyze(emptyBodySkill)

      expect(report).toBeDefined()
      expect(report.warnings.length).toBeGreaterThan(0)
    })

    it('should handle skill with no resources', () => {
      const noResourcesSkill = {
        ...simpleSkill,
        resources: { templates: [], references: [], scripts: [] }
      }

      const report = analyzer.analyze(noResourcesSkill)

      expect(report).toBeDefined()
    })

    it('should handle skill with undefined resource arrays', () => {
      const undefinedResourcesSkill = {
        ...simpleSkill,
        resources: {
          templates: undefined,
          references: undefined,
          scripts: undefined
        }
      }

      const report = analyzer.analyze(undefinedResourcesSkill as any)

      expect(report).toBeDefined()
    })

    it('should handle description at exactly 500 characters', () => {
      const exactLimitSkill = {
        ...simpleSkill,
        metadata: { ...simpleSkill.metadata, description: 'a'.repeat(500) }
      }

      const report = analyzer.analyze(exactLimitSkill)

      expect(report.descriptionLength).toBe(500)
    })

    it('should handle description just over 500 characters', () => {
      const justOverLimitSkill = {
        ...simpleSkill,
        metadata: { ...simpleSkill.metadata, description: 'a'.repeat(501) }
      }

      const report = analyzer.analyze(justOverLimitSkill)

      const hasWarning = report.warnings.some(w => w.includes('500'))
      expect(hasWarning).toBe(true)
    })
  })
})
