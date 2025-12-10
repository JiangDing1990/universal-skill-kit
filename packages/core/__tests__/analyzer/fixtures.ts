/**
 * Test Fixtures for Skill Analyzer
 * 测试夹具
 */

import type { SkillDefinition } from '../../src/types'

export const simpleSkill: SkillDefinition = {
  metadata: {
    name: 'simple-skill',
    version: '1.0.0',
    description: 'A simple skill for testing purposes.',
    author: 'Test Author',
    tags: ['test', 'simple']
  },
  body: 'This is a simple skill body with minimal content.',
  resources: {
    templates: [],
    references: [],
    scripts: []
  }
}

export const complexSkill: SkillDefinition = {
  metadata: {
    name: 'complex-skill',
    version: '2.1.0',
    description:
      'A comprehensive skill for building React 16.14 applications using TypeScript 5.9.3, DVA 2.x state management, and @lianjia/antd-life component library. This skill provides advanced functionality for creating CRUD list pages, detail pages, and form modals with optimized performance and accessibility support. Perfect for enterprise-level applications requiring scalable architecture and maintainable codebase.',
    author: 'Enterprise Team',
    tags: ['react', 'typescript', 'dva', 'enterprise', 'crud', 'antd']
  },
  body: `
# Overview
This is a comprehensive skill for enterprise React development.

## Features
- Component generation with TypeScript
- State management with DVA 2.x
- Form handling with validation
- API integration patterns
- Performance optimization techniques

## Code Examples

\`\`\`typescript
import { connect } from 'dva'
import { Form, Input, Button } from '@lianjia/antd-life'

const MyComponent = () => {
  return <Form>...</Form>
}
\`\`\`

## Technical Stack
- React 16.14
- TypeScript 5.9.3
- DVA 2.x
- Node.js v18+
- Webpack 5

## Best Practices
1. Use functional components
2. Implement proper error handling
3. Follow accessibility guidelines
4. Optimize bundle size

## Resources
- Official documentation
- Code examples repository
- Community tutorials
`,
  resources: {
    templates: [
      'list-template.tsx',
      'form-template.tsx',
      'detail-template.tsx'
    ],
    references: ['react-docs.md', 'dva-guide.md'],
    scripts: ['generate-component.sh', 'build-prod.sh']
  }
}

export const skillWithCodeExamples: SkillDefinition = {
  metadata: {
    name: 'code-example-skill',
    version: '1.0.0',
    description: 'A skill demonstrating API integration with examples.',
    tags: ['api', 'examples']
  },
  body: `
Example usage:
\`\`\`javascript
fetch('/api/users')
  .then(res => res.json())
  .then(data => console.log(data))
\`\`\`

Another example:
\`\`\`typescript
const result = await api.get('/users')
\`\`\`
`,
  resources: {
    templates: [],
    references: [],
    scripts: []
  }
}

export const skillWithLongDescription: SkillDefinition = {
  metadata: {
    name: 'long-desc-skill',
    version: '1.0.0',
    description: 'a'.repeat(800), // 800 characters
    tags: ['test']
  },
  body: 'Simple body content.',
  resources: {
    templates: [],
    references: [],
    scripts: []
  }
}

export const skillWithShortDescription: SkillDefinition = {
  metadata: {
    name: 'short-desc-skill',
    version: '1.0.0',
    description: 'Too short.',
    tags: ['test']
  },
  body: 'Minimal content here.',
  resources: {
    templates: [],
    references: [],
    scripts: []
  }
}

export const incompleteSkill: SkillDefinition = {
  metadata: {
    name: 'incomplete-skill',
    description: 'Missing some metadata fields.'
    // Missing: version, author, tags
  },
  body: 'Very short body.',
  resources: {
    templates: [],
    references: [],
    scripts: []
  }
}

export const skillWithManyKeywords: SkillDefinition = {
  metadata: {
    name: 'keywords-skill',
    version: '1.0.0',
    description:
      'Skill using TypeScript, JavaScript, React, Vue, Angular, Node.js, Python, Java, Go, Rust, Docker, Kubernetes, AWS, PostgreSQL, MongoDB, Redis, GraphQL, REST API, WebSocket.',
    tags: ['multi-tech']
  },
  body: 'Body with additional tech: Express, FastAPI, Django, JWT, OAuth.',
  resources: {
    templates: [],
    references: [],
    scripts: []
  }
}

export const structuredSkill: SkillDefinition = {
  metadata: {
    name: 'structured-skill',
    version: '1.0.0',
    description: 'A well-structured skill with proper formatting.',
    tags: ['structured']
  },
  body: `
# Main Heading

## Section 1
Content for section 1.

## Section 2
Content for section 2.

### Subsection
- List item 1
- List item 2
- List item 3

1. Numbered item 1
2. Numbered item 2
`,
  resources: {
    templates: [],
    references: [],
    scripts: []
  }
}

export const unstructuredSkill: SkillDefinition = {
  metadata: {
    name: 'unstructured-skill',
    version: '1.0.0',
    description: 'A skill without structured formatting.',
    tags: ['unstructured']
  },
  body: 'Just plain text without any markdown formatting or structure. No headers, no lists, nothing organized.',
  resources: {
    templates: [],
    references: [],
    scripts: []
  }
}
