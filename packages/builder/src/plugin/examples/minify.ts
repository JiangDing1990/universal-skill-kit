/**
 * Minify Plugin - 压缩输出内容
 * 示例插件：展示如何修改渲染结果
 */

import type { Plugin, PluginContext } from '../../types/plugin'

/**
 * Minify插件选项
 */
export interface MinifyPluginOptions {
  /** 是否移除注释 */
  removeComments?: boolean
  /** 是否压缩空白 */
  compressWhitespace?: boolean
  /** 是否保留换行 */
  preserveNewlines?: boolean
}

/**
 * 简单的Markdown压缩
 */
function minifyMarkdown(content: string, options: MinifyPluginOptions): string {
  let result = content

  // 移除HTML注释
  if (options.removeComments) {
    result = result.replace(/<!--[\s\S]*?-->/g, '')
  }

  // 压缩空白
  if (options.compressWhitespace) {
    // 移除行尾空白
    result = result.replace(/[ \t]+$/gm, '')
    // 多个空行压缩为单个空行
    result = result.replace(/\n\n+/g, '\n\n')
  }

  // 如果不保留换行，移除多余的空行
  if (!options.preserveNewlines) {
    result = result.replace(/\n{3,}/g, '\n\n')
  }

  return result.trim()
}

/**
 * Minify插件
 */
export function minifyPlugin(options: MinifyPluginOptions = {}): Plugin {
  const opts: Required<MinifyPluginOptions> = {
    removeComments: options.removeComments ?? true,
    compressWhitespace: options.compressWhitespace ?? true,
    preserveNewlines: options.preserveNewlines ?? false
  }

  return {
    name: 'minify',
    version: '1.0.0',
    description: 'Minify generated skill files',

    onTemplateRendered(_context: PluginContext, content: string): string {
      return minifyMarkdown(content, opts)
    }
  }
}
