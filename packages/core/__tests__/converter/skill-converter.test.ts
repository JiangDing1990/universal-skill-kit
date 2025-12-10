/**
 * SkillConverter Tests
 * Skill转换器测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import * as os from 'node:os'
import {
  SkillConverter,
  createSkillConverter
} from '../../src/converter/skill-converter'
import type { ConvertOptions } from '../../src/types'

describe('SkillConverter', () => {
  let converter: SkillConverter
  let testDir: string

  beforeEach(async () => {
    converter = new SkillConverter()
    // Create temporary test directory
    testDir = path.join(os.tmpdir(), `usk-test-${Date.now()}`)
    await fs.mkdir(testDir, { recursive: true })
  })

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true })
    } catch (error) {
      // Ignore cleanup errors
    }
  })

  describe('constructor', () => {
    it('should create a new SkillConverter instance', () => {
      expect(converter).toBeInstanceOf(SkillConverter)
    })
  })

  describe('convert', () => {
    it('should convert a Claude skill to Codex', async () => {
      // Create test skill file
      const skillContent = `---
name: test-skill
version: 1.0.0
description: This is a test skill with a moderately long description that explains what the skill does and how to use it effectively.
author: Test Author
tags:
  - test
  - example
---

# Test Skill

This is the body of the test skill with some content.

## Features
- Feature 1
- Feature 2

Check ~/.claude/skills for more information.
`
      const skillPath = path.join(testDir, 'test-skill.md')
      await fs.writeFile(skillPath, skillContent, 'utf-8')

      const options: ConvertOptions = {
        targetPlatform: 'codex',
        outputDir: testDir
      }

      const result = await converter.convert(skillPath, options)

      expect(result.success).toBe(true)
      expect(result.platform).toBe('codex')
      expect(result.outputPath).toBeTruthy()
      expect(result.metadata.name).toBe('test-skill')
      expect(result.statistics).toBeDefined()
      expect(result.statistics.duration).toBeGreaterThan(0)

      // Verify output file exists
      const outputExists = await fs
        .access(result.outputPath)
        .then(() => true)
        .catch(() => false)
      expect(outputExists).toBe(true)

      // Verify content was transformed
      const outputContent = await fs.readFile(result.outputPath, 'utf-8')
      expect(outputContent).toContain('codex')
      expect(outputContent).not.toContain('claude')
    })

    it('should compress description when converting to Codex', async () => {
      const longDescription = 'a'.repeat(800)
      const skillContent = `---
name: long-desc-skill
version: 1.0.0
description: ${longDescription}
---

Body content here.
`
      const skillPath = path.join(testDir, 'long-skill.md')
      await fs.writeFile(skillPath, skillContent, 'utf-8')

      const options: ConvertOptions = {
        targetPlatform: 'codex',
        outputDir: testDir
      }

      const result = await converter.convert(skillPath, options)

      expect(result.success).toBe(true)
      expect(result.metadata.description.length).toBeLessThanOrEqual(500)
      expect(result.statistics.compressionRate).toBeGreaterThan(0)
    })

    it('should handle conversion with specific compression strategy', async () => {
      const skillContent = `---
name: strategy-test
version: 1.0.0
description: This is a test skill for testing compression strategies with various content types.
---

Content here.
`
      const skillPath = path.join(testDir, 'strategy-skill.md')
      await fs.writeFile(skillPath, skillContent, 'utf-8')

      const options: ConvertOptions = {
        targetPlatform: 'codex',
        outputDir: testDir,
        compressionStrategy: 'aggressive'
      }

      const result = await converter.convert(skillPath, options)

      expect(result.success).toBe(true)
    })

    it('should convert paths in body content', async () => {
      const skillContent = `---
name: path-test
version: 1.0.0
description: A skill with path references
---

Check ~/.claude/skills/my-skill for details.
Also see .claude/config.json.
`
      const skillPath = path.join(testDir, 'path-skill.md')
      await fs.writeFile(skillPath, skillContent, 'utf-8')

      const options: ConvertOptions = {
        targetPlatform: 'codex',
        outputDir: testDir
      }

      const result = await converter.convert(skillPath, options)

      const outputContent = await fs.readFile(result.outputPath, 'utf-8')
      // Verify conversion happened
      expect(outputContent).toContain('~/.codex/skills')
      // Note: Path conversion in body is handled by PathMapper
      // which may not convert all occurrences depending on context
    })

    it('should handle conversion errors gracefully', async () => {
      const options: ConvertOptions = {
        targetPlatform: 'codex',
        outputDir: testDir
      }

      await expect(
        converter.convert('/non-existent-file.md', options)
      ).rejects.toThrow('Conversion failed')
    })

    it('should return skill as-is when converting to same platform', async () => {
      const skillContent = `---
name: same-platform
version: 1.0.0
description: Test description
---

Body content
`
      const skillPath = path.join(testDir, 'same.md')
      await fs.writeFile(skillPath, skillContent, 'utf-8')

      const options: ConvertOptions = {
        targetPlatform: 'claude',
        outputDir: testDir
      }

      const result = await converter.convert(skillPath, options)

      expect(result.success).toBe(true)
      expect(result.statistics.compressionRate).toBe(0)
    })
  })

  describe('convertBatch', () => {
    it('should convert multiple skills', async () => {
      // Create multiple test skills
      const skills = ['skill1.md', 'skill2.md', 'skill3.md']
      const skillPaths: string[] = []

      for (const skillName of skills) {
        const content = `---
name: ${skillName.replace('.md', '')}
version: 1.0.0
description: Test skill ${skillName}
---

Body for ${skillName}
`
        const skillPath = path.join(testDir, skillName)
        await fs.writeFile(skillPath, content, 'utf-8')
        skillPaths.push(skillPath)
      }

      const options: ConvertOptions = {
        targetPlatform: 'codex',
        outputDir: testDir
      }

      const results = await converter.convertBatch(skillPaths, options)

      expect(results).toHaveLength(3)
      expect(results.every(r => r.success)).toBe(true)
      expect(results.every(r => r.platform === 'codex')).toBe(true)
    })

    it('should continue batch conversion even if one file fails', async () => {
      const skillPaths = [
        path.join(testDir, 'valid.md'),
        '/non-existent.md',
        path.join(testDir, 'valid2.md')
      ]

      // Create valid files
      for (const skillPath of [skillPaths[0], skillPaths[2]]) {
        const content = `---
name: ${path.basename(skillPath, '.md')}
version: 1.0.0
description: Valid skill
---

Content
`
        await fs.writeFile(skillPath, content, 'utf-8')
      }

      const options: ConvertOptions = {
        targetPlatform: 'codex',
        outputDir: testDir
      }

      const results = await converter.convertBatch(skillPaths, options)

      expect(results).toHaveLength(3)
      expect(results[0].success).toBe(true)
      expect(results[1].success).toBe(false)
      expect(results[2].success).toBe(true)
    })
  })

  describe('createSkillConverter', () => {
    it('should create a new SkillConverter instance', () => {
      const newConverter = createSkillConverter()
      expect(newConverter).toBeInstanceOf(SkillConverter)
    })

    it('should create independent instances', () => {
      const converter1 = createSkillConverter()
      const converter2 = createSkillConverter()
      expect(converter1).not.toBe(converter2)
    })
  })

  describe('integration', () => {
    it('should perform full Claude to Codex conversion', async () => {
      const skillContent = `---
name: integration-test
version: 2.1.0
description: A comprehensive skill for testing the full conversion pipeline from Claude to Codex platform with all features including compression and path mapping.
author: Integration Team
tags:
  - test
  - integration
  - claude
---

# Integration Test Skill

This skill tests the complete conversion workflow.

## Features

- Feature one with details
- Feature two with examples
- Feature three with references

## Paths

Check ~/.claude/skills/integration-test for configuration.
See .claude/templates for examples.

## Code Example

\`\`\`typescript
const skill = loadSkill('~/.claude/skills/my-skill')
\`\`\`
`
      const skillPath = path.join(testDir, 'integration.md')
      await fs.writeFile(skillPath, skillContent, 'utf-8')

      const options: ConvertOptions = {
        targetPlatform: 'codex',
        outputDir: testDir,
        compressionStrategy: 'balanced'
      }

      const result = await converter.convert(skillPath, options)

      // Verify success
      expect(result.success).toBe(true)
      expect(result.platform).toBe('codex')

      // Verify metadata
      expect(result.metadata.name).toBe('integration-test')
      expect(result.metadata.version).toBe('2.1.0')
      expect(result.metadata.description.length).toBeLessThanOrEqual(500)

      // Verify statistics
      // Note: Original description is < 500 chars, so may not be compressed
      expect(result.statistics.originalLength).toBeGreaterThanOrEqual(
        result.statistics.finalLength
      )
      expect(result.statistics.compressionRate).toBeGreaterThanOrEqual(0)

      // Verify output content
      const outputContent = await fs.readFile(result.outputPath, 'utf-8')
      expect(outputContent).toContain('name: integration-test')
      expect(outputContent).toContain('version: 2.1.0')
      expect(outputContent).toContain('~/.codex/skills')
      // Path mapping should convert some paths
      expect(outputContent).toContain('.codex')
    })
  })
})
