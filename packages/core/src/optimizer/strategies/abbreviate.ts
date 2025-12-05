/**
 * Abbreviate Strategy
 * 缩写策略
 */

import type { ICompressionStrategy } from '../compression-strategy'

/**
 * Strategy that abbreviates common long phrases
 * 缩写常见长词组的策略
 */
export class AbbreviateStrategy implements ICompressionStrategy {
  name = 'Abbreviate'
  description = 'Abbreviate common long phrases and words'

  private abbreviations: Record<string, string> = {
    // Common technical terms
    application: 'app',
    applications: 'apps',
    configuration: 'config',
    configurations: 'configs',
    database: 'DB',
    databases: 'DBs',
    development: 'dev',
    environment: 'env',
    environments: 'envs',
    documentation: 'docs',
    information: 'info',
    repository: 'repo',
    repositories: 'repos',
    directory: 'dir',
    directories: 'dirs',
    implementation: 'impl',
    authentication: 'auth',
    authorization: 'authz',
    administrator: 'admin',
    command: 'cmd',
    commands: 'cmds',
    specification: 'spec',
    specifications: 'specs',
    maximum: 'max',
    minimum: 'min',
    parameter: 'param',
    parameters: 'params',
    argument: 'arg',
    arguments: 'args',
    message: 'msg',
    messages: 'msgs',
    synchronize: 'sync',
    asynchronous: 'async',
    initialize: 'init',
    utilities: 'utils',
    library: 'lib',
    libraries: 'libs',
    execute: 'exec',
    temporary: 'temp',
    reference: 'ref',
    references: 'refs',

    // Common phrases
    'and so on': 'etc',
    'for example': 'e.g.',
    'that is': 'i.e.',
    'and others': 'et al.'
  }

  compress(text: string): string {
    let result = text

    // Apply abbreviations
    for (const [full, abbr] of Object.entries(this.abbreviations)) {
      // Use word boundaries for whole word replacement
      const regex = new RegExp(`\\b${full}\\b`, 'gi')
      result = result.replace(regex, abbr)
    }

    // Remove common filler words
    const fillerWords = [
      'basically',
      'actually',
      'really',
      'very',
      'quite',
      'just',
      'simply',
      'literally',
      '基本上',
      '实际上',
      '真的',
      '非常',
      '确实',
      '只是'
    ]

    for (const filler of fillerWords) {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi')
      result = result.replace(regex, '')
    }

    // Clean up multiple spaces
    result = result.replace(/\s{2,}/g, ' ')

    return result.trim()
  }
}
