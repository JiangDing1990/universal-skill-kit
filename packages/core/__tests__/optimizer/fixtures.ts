/**
 * Test Fixtures for Description Compressor
 * 测试夹具
 */

export const longDescription = `
This is a comprehensive skill for building React applications using React 16.14, DVA 2.x, and @lianjia/antd-life component library.
It provides advanced functionality for creating CRUD list pages, detail pages, and form modals with optimized performance.

Example usage:
\`\`\`typescript
import { createList } from '@lianjia/antd-life'
const MyList = createList({
  columns: [],
  dataSource: []
})
\`\`\`

Key features include:
- Automatic form validation
- Built-in pagination
- Responsive design
- Accessibility support

Note: This skill is specifically designed for React 16.14 and is not compatible with React 18 or newer versions.
For the purpose of maintaining backward compatibility, we recommend using this approach in order to ensure smooth migration.
`

export const shortDescription = 'A simple skill for React development.'

export const descriptionWithKeywords = `
TypeScript 5.9.3 monorepo skill for Node.js v18+ development.
Supports ESM/CJS dual format output with tsup builder.
API: REST, GraphQL, WebSocket. Database: PostgreSQL, MongoDB.
`

export const descriptionWithExamples = `
A skill for API development.

Example:
\`\`\`javascript
fetch('/api/users')
  .then(res => res.json())
  .then(data => console.log(data))
\`\`\`

e.g., You can use it like this: GET /api/users
示例：发送请求获取用户列表
`

export const descriptionWithVerbosePhrases = `
Due to the fact that the system needs to be able to handle a large number of requests,
we need to make use of caching in order to improve performance.
At this point in time, the implementation is able to process requests on a regular basis.
In the event that errors occur, the system has the ability to recover automatically.
`

export const chineseDescription = `
这是一个用于开发现代化Web应用的技能。能够帮助开发者进行快速开发，
可以实现各种复杂的功能。为了更好地满足需求，系统在处理数据的时候会进行优化。
由于架构的特殊性，需要特别注意性能问题。
`

export const descriptionAt500Chars = 'a'.repeat(500)
export const descriptionAt600Chars = 'a'.repeat(600)
