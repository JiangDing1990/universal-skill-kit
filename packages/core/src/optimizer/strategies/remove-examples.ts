/**
 * Remove Examples Strategy
 * 移除示例代码策略
 */

import type { ICompressionStrategy } from '../compression-strategy'

/**
 * Strategy that removes code examples and sample content
 * 移除代码示例和样例内容的策略
 */
export class RemoveExamplesStrategy implements ICompressionStrategy {
  name = 'RemoveExamples'
  description = 'Remove code blocks, examples, and sample content'

  compress(text: string): string {
    let result = text

    // Remove code blocks: ```...```
    result = result.replace(/```[\s\S]*?```/g, '')

    // Remove inline code that looks like examples
    result = result.replace(/`[^`]{50,}`/g, '')

    // Remove common example markers
    result = result.replace(
      /\b(example|示例|样例|e\.g\.|例如)[:：][^\n]*/gi,
      ''
    )

    // Remove lines starting with // or # (comments as examples)
    result = result.replace(/^[\s]*[/#]{1,2}[\s].+$/gm, '')

    // Clean up excessive newlines
    result = result.replace(/\n{3,}/g, '\n\n')

    return result.trim()
  }
}
