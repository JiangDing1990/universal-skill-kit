/**
 * Skill Validator Tests
 * Validator模块单元测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { SkillValidator } from '../../src/validator/skill-validator'
import type { SkillDefinition } from '../../src/types'

describe('SkillValidator', () => {
  let validator: SkillValidator
  const testDir = '/tmp/usk-test-validator'

  beforeEach(() => {
    validator = new SkillValidator()
  })

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true })
    } catch {
      // Ignore errors
    }
  })

  describe('validate()', () => {
    describe('Metadata validation', () => {
      it('should pass with valid metadata', async () => {
        const skill: SkillDefinition = {
          metadata: {
            name: 'test-skill',
            version: '1.0.0',
            description: 'A valid test skill description'
          },
          body: '# Test Skill\n\nThis is a test skill with valid content.\n\n```javascript\nconst test = true;\n```',
          resources: {
            templates: [],
            scripts: [],
            references: []
          }
        }

        const result = await validator.validate(skill, testDir)

        expect(result.valid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })

      it('should fail with missing name', async () => {
        const skill: SkillDefinition = {
          metadata: {
            name: '',
            version: '1.0.0',
            description: 'Test description'
          },
          body: 'Test body',
          resources: {}
        }

        const result = await validator.validate(skill, testDir)

        expect(result.valid).toBe(false)
        expect(result.errors).toHaveLength(1)
        expect(result.errors[0]?.code).toBe('MISSING_NAME')
        expect(result.errors[0]?.field).toBe('name')
      })

      it('should fail with missing description', async () => {
        const skill: SkillDefinition = {
          metadata: {
            name: 'test-skill',
            version: '1.0.0',
            description: ''
          },
          body: 'Test body',
          resources: {}
        }

        const result = await validator.validate(skill, testDir)

        expect(result.valid).toBe(false)
        expect(result.errors).toHaveLength(1)
        expect(result.errors[0]?.code).toBe('MISSING_DESCRIPTION')
      })

      it('should warn on short name', async () => {
        const skill: SkillDefinition = {
          metadata: {
            name: 'ab',
            version: '1.0.0',
            description: 'Test description with enough length'
          },
          body: 'Test body with enough content to pass validation',
          resources: {}
        }

        const result = await validator.validate(skill, testDir)

        expect(result.valid).toBe(true)
        expect(result.warnings.some(w => w.field === 'name')).toBe(true)
      })

      it('should warn on invalid version format', async () => {
        const skill: SkillDefinition = {
          metadata: {
            name: 'test-skill',
            version: 'v1',
            description: 'Test description with enough length'
          },
          body: 'Test body with enough content',
          resources: {}
        }

        const result = await validator.validate(skill, testDir)

        expect(result.valid).toBe(true)
        expect(result.warnings.some(w => w.field === 'version')).toBe(true)
      })

      it('should warn on missing author', async () => {
        const skill: SkillDefinition = {
          metadata: {
            name: 'test-skill',
            version: '1.0.0',
            description: 'Test description'
          },
          body: 'Test body',
          resources: {}
        }

        const result = await validator.validate(skill, testDir)

        expect(result.warnings.some(w => w.field === 'author')).toBe(true)
      })

      it('should warn on missing tags', async () => {
        const skill: SkillDefinition = {
          metadata: {
            name: 'test-skill',
            version: '1.0.0',
            description: 'Test description'
          },
          body: 'Test body',
          resources: {}
        }

        const result = await validator.validate(skill, testDir)

        expect(result.warnings.some(w => w.field === 'tags')).toBe(true)
      })
    })

    describe('Description length validation', () => {
      it('should warn on short description', async () => {
        const skill: SkillDefinition = {
          metadata: {
            name: 'test-skill',
            version: '1.0.0',
            description: 'Short'
          },
          body: 'Test body',
          resources: {}
        }

        const result = await validator.validate(skill, testDir)

        expect(result.warnings.some(w =>
          w.field === 'description' && w.message.includes('very short')
        )).toBe(true)
      })

      it('should warn on description exceeding Codex limit', async () => {
        const skill: SkillDefinition = {
          metadata: {
            name: 'test-skill',
            version: '1.0.0',
            description: 'a'.repeat(600)
          },
          body: 'Test body',
          resources: {}
        }

        const result = await validator.validate(skill, testDir)

        expect(result.warnings.some(w =>
          w.field === 'description' && w.message.includes('500')
        )).toBe(true)
      })

      it('should warn on very long description', async () => {
        const skill: SkillDefinition = {
          metadata: {
            name: 'test-skill',
            version: '1.0.0',
            description: 'a'.repeat(2500)
          },
          body: 'Test body',
          resources: {}
        }

        const result = await validator.validate(skill, testDir)

        expect(result.warnings.some(w =>
          w.field === 'description' && w.message.includes('very long')
        )).toBe(true)
      })
    })

    describe('Body validation', () => {
      it('should fail with empty body', async () => {
        const skill: SkillDefinition = {
          metadata: {
            name: 'test-skill',
            version: '1.0.0',
            description: 'Test description'
          },
          body: '',
          resources: {}
        }

        const result = await validator.validate(skill, testDir)

        expect(result.valid).toBe(false)
        expect(result.errors.some(e => e.code === 'EMPTY_BODY')).toBe(true)
      })

      it('should warn on short body', async () => {
        const skill: SkillDefinition = {
          metadata: {
            name: 'test-skill',
            version: '1.0.0',
            description: 'Test description'
          },
          body: 'Short',
          resources: {}
        }

        const result = await validator.validate(skill, testDir)

        expect(result.warnings.some(w =>
          w.field === 'body' && w.message.includes('very short')
        )).toBe(true)
      })

      it('should warn on missing headings', async () => {
        const skill: SkillDefinition = {
          metadata: {
            name: 'test-skill',
            version: '1.0.0',
            description: 'Test description'
          },
          body: 'This is a body without any markdown headings. It has enough content but no structure.',
          resources: {}
        }

        const result = await validator.validate(skill, testDir)

        expect(result.warnings.some(w =>
          w.field === 'body' && w.message.includes('heading')
        )).toBe(true)
      })

      it('should warn on missing code examples', async () => {
        const skill: SkillDefinition = {
          metadata: {
            name: 'test-skill',
            version: '1.0.0',
            description: 'Test description'
          },
          body: '# Test\n\nThis is a body without code examples but with enough content to pass length check.',
          resources: {}
        }

        const result = await validator.validate(skill, testDir)

        expect(result.warnings.some(w =>
          w.field === 'body' && w.message.includes('code example')
        )).toBe(true)
      })
    })

    describe('Resource validation', () => {
      it('should fail when referenced file does not exist', async () => {
        await fs.mkdir(testDir, { recursive: true })

        const skill: SkillDefinition = {
          metadata: {
            name: 'test-skill',
            version: '1.0.0',
            description: 'Test description'
          },
          body: 'Test body',
          resources: {
            templates: ['missing-template.txt']
          }
        }

        const result = await validator.validate(skill, testDir)

        expect(result.valid).toBe(false)
        expect(result.errors.some(e =>
          e.code === 'MISSING_RESOURCE' && e.message.includes('missing-template.txt')
        )).toBe(true)
      })

      it('should pass when referenced file exists', async () => {
        await fs.mkdir(testDir, { recursive: true })
        await fs.writeFile(path.join(testDir, 'template.txt'), 'test')

        const skill: SkillDefinition = {
          metadata: {
            name: 'test-skill',
            version: '1.0.0',
            description: 'Test description'
          },
          body: '# Test\n\nContent with code:\n\n```js\ntest\n```',
          resources: {
            templates: ['template.txt']
          }
        }

        const result = await validator.validate(skill, testDir)

        expect(result.valid).toBe(true)
      })

      it('should handle absolute paths', async () => {
        await fs.mkdir(testDir, { recursive: true })
        const absolutePath = path.join(testDir, 'absolute-template.txt')
        await fs.writeFile(absolutePath, 'test')

        const skill: SkillDefinition = {
          metadata: {
            name: 'test-skill',
            version: '1.0.0',
            description: 'Test description'
          },
          body: '# Test\n\n```js\ntest\n```',
          resources: {
            templates: [absolutePath]
          }
        }

        const result = await validator.validate(skill, testDir)

        expect(result.valid).toBe(true)
      })
    })

    describe('Common issues detection', () => {
      it('should warn on empty links', async () => {
        const skill: SkillDefinition = {
          metadata: {
            name: 'test-skill',
            version: '1.0.0',
            description: 'Test description'
          },
          body: '# Test\n\nThis has an empty link: [click here]()\n\n```js\ntest\n```',
          resources: {}
        }

        const result = await validator.validate(skill, testDir)

        expect(result.warnings.some(w =>
          w.field === 'body' && w.message.includes('Empty link')
        )).toBe(true)
      })

      it('should warn on paths with spaces', async () => {
        const skill: SkillDefinition = {
          metadata: {
            name: 'test-skill',
            version: '1.0.0',
            description: 'Test description'
          },
          body: '# Test\n\nLink: [file](path with spaces.txt)\n\n```js\ntest\n```',
          resources: {}
        }

        const result = await validator.validate(skill, testDir)

        expect(result.warnings.some(w =>
          w.field === 'body' && w.message.includes('spaces')
        )).toBe(true)
      })

      it('should warn on TODO markers', async () => {
        const skill: SkillDefinition = {
          metadata: {
            name: 'test-skill',
            version: '1.0.0',
            description: 'Test description'
          },
          body: '# Test\n\nTODO: Add more content\n\n```js\ntest\n```',
          resources: {}
        }

        const result = await validator.validate(skill, testDir)

        expect(result.warnings.some(w =>
          w.field === 'body' && w.message.includes('TODO')
        )).toBe(true)
      })
    })
  })

  describe('validateForConversion()', () => {
    it('should warn when description exceeds Codex limit', () => {
      const skill: SkillDefinition = {
        metadata: {
          name: 'test-skill',
          version: '1.0.0',
          description: 'a'.repeat(600)
        },
        body: 'Test body',
        resources: {}
      }

      const result = validator.validateForConversion(skill, 'codex')

      expect(result.warnings).toHaveLength(1)
      expect(result.warnings[0]?.field).toBe('description')
      expect(result.warnings[0]?.message).toContain('500')
    })

    it('should have higher severity for very long descriptions', () => {
      const skill: SkillDefinition = {
        metadata: {
          name: 'test-skill',
          version: '1.0.0',
          description: 'a'.repeat(1500)
        },
        body: 'Test body',
        resources: {}
      }

      const result = validator.validateForConversion(skill, 'codex')

      expect(result.warnings[0]?.severity).toBe('medium')
    })

    it('should not warn for Claude platform', () => {
      const skill: SkillDefinition = {
        metadata: {
          name: 'test-skill',
          version: '1.0.0',
          description: 'a'.repeat(600)
        },
        body: 'Test body',
        resources: {}
      }

      const result = validator.validateForConversion(skill, 'claude')

      expect(result.warnings).toHaveLength(0)
    })

    it('should pass when description is within limit', () => {
      const skill: SkillDefinition = {
        metadata: {
          name: 'test-skill',
          version: '1.0.0',
          description: 'A valid description within limits'
        },
        body: 'Test body',
        resources: {}
      }

      const result = validator.validateForConversion(skill, 'codex')

      expect(result.valid).toBe(true)
      expect(result.warnings).toHaveLength(0)
    })
  })

  describe('Severity levels', () => {
    it('should use correct severity for warnings', async () => {
      const skill: SkillDefinition = {
        metadata: {
          name: 'ab',  // Short name
          version: 'v1',  // Invalid version
          description: 'Short',  // Short description
          author: undefined,  // Missing author
          tags: []  // Missing tags
        },
        body: 'Short body',  // Short body
        resources: {}
      }

      const result = await validator.validate(skill, testDir)

      // Check that different warnings have appropriate severity levels
      const nameSeverity = result.warnings.find(w => w.field === 'name')?.severity
      const descSeverity = result.warnings.find(w =>
        w.field === 'description' && w.message.includes('short')
      )?.severity

      expect(nameSeverity).toBeDefined()
      expect(descSeverity).toBe('medium')
    })
  })
})
