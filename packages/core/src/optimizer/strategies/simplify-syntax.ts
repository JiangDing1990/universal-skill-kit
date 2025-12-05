/**
 * Simplify Syntax Strategy
 * 简化语法策略
 */

import type { ICompressionStrategy } from '../compression-strategy'

/**
 * Strategy that simplifies verbose syntax and removes redundant words
 * 简化冗长语法并移除冗余词汇的策略
 */
export class SimplifySyntaxStrategy implements ICompressionStrategy {
  name = 'SimplifySyntax'
  description = 'Simplify verbose syntax and remove redundant words'

  compress(text: string): string {
    let result = text

    // Remove markdown formatting
    result = result.replace(/\*\*([^*]+)\*\*/g, '$1') // Bold
    result = result.replace(/\*([^*]+)\*/g, '$1') // Italic
    result = result.replace(/~~([^~]+)~~/g, '$1') // Strikethrough

    // Simplify common verbose phrases (English)
    const replacements: Record<string, string> = {
      'in order to': 'to',
      'due to the fact that': 'because',
      'at this point in time': 'now',
      'for the purpose of': 'for',
      'with the exception of': 'except',
      'in the event that': 'if',
      'on a regular basis': 'regularly',
      'in the near future': 'soon',
      'at the present time': 'now',
      'is able to': 'can',
      'has the ability to': 'can',
      'make use of': 'use',
      'a number of': 'several',
      'a large number of': 'many',
      'prior to': 'before',
      'subsequent to': 'after'
    }

    // Simplify Chinese verbose phrases
    const chineseReplacements: Record<string, string> = {
      由于: '因',
      为了: '为',
      能够: '可',
      可以: '可',
      进行: '',
      实现: '',
      的话: '',
      的时候: '时'
    }

    // Apply English replacements
    for (const [verbose, simple] of Object.entries(replacements)) {
      const regex = new RegExp(`\\b${verbose}\\b`, 'gi')
      result = result.replace(regex, simple)
    }

    // Apply Chinese replacements
    for (const [verbose, simple] of Object.entries(chineseReplacements)) {
      result = result.replace(new RegExp(verbose, 'g'), simple)
    }

    // Remove redundant articles when safe
    result = result.replace(/\b(a|an|the)\s+(same|following|above)\b/gi, '$2')

    // Simplify punctuation
    result = result.replace(/\s*[,;]\s*/g, ', ')
    result = result.replace(/\s*\.\s+/g, '. ')

    // Clean up whitespace
    result = result.replace(/\n{3,}/g, '\n\n') // Clean excessive newlines first
    result = result.replace(/[^\S\n]{2,}/g, ' ') // Clean multiple spaces, but not newlines

    return result.trim()
  }
}
