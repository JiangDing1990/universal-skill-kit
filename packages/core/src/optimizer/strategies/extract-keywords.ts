/**
 * Extract Keywords Strategy
 * 提取关键词策略
 */

import type { ICompressionStrategy } from '../compression-strategy'

/**
 * Strategy that extracts and keeps only key technical terms
 * 提取并保留关键技术术语的策略
 */
export class ExtractKeywordsStrategy implements ICompressionStrategy {
  name = 'ExtractKeywords'
  description = 'Extract and keep only key technical terms and phrases'

  private technicalTermsRegex = [
    // Programming languages and frameworks
    /\b(TypeScript|JavaScript|React|Vue|Angular|Node\.js|Python|Java|Go|Rust)\b/gi,
    // Version numbers
    /\b(v?\d+\.\d+(?:\.\d+)?(?:-\w+)?)\b/g,
    // Technical concepts
    /\b(API|CLI|REST|GraphQL|WebSocket|HTTP|HTTPS|JSON|YAML|XML)\b/gi,
    /\b(database|auth|authentication|authorization|JWT|OAuth)\b/gi,
    /\b(component|module|service|middleware|plugin|hook)\b/gi,
    // File extensions and paths
    /\b[\w-]+\.(ts|js|tsx|jsx|json|yaml|yml|md|css|scss)\b/gi,
    // Common technical actions
    /\b(install|build|deploy|compile|test|lint|format)\b/gi
  ]

  compress(text: string): string {
    const sentences = this.splitIntoSentences(text)
    const keywordSentences: string[] = []
    const extractedKeywords = new Set<string>()

    // Extract sentences containing technical terms
    for (const sentence of sentences) {
      let hasTechnicalTerm = false

      for (const regex of this.technicalTermsRegex) {
        if (regex.test(sentence)) {
          hasTechnicalTerm = true
          // Extract the technical terms
          const matches = sentence.match(regex)
          if (matches) {
            matches.forEach(term => extractedKeywords.add(term))
          }
        }
      }

      if (hasTechnicalTerm) {
        keywordSentences.push(sentence.trim())
      }
    }

    // If we extracted enough content, return it
    if (keywordSentences.length > 0) {
      return keywordSentences.join(' ')
    }

    // Fallback: return first few sentences with keywords list
    const firstSentences = sentences.slice(0, 2).join(' ')
    const keywords = Array.from(extractedKeywords).slice(0, 10).join(', ')

    return keywords ? `${firstSentences} Keywords: ${keywords}` : firstSentences
  }

  private splitIntoSentences(text: string): string[] {
    // Simple sentence splitting
    return text
      .split(/[.!?。！？]\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 0)
  }
}
