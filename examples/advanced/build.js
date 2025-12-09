#!/usr/bin/env node
/**
 * Advanced Build Script
 * 展示如何使用 USK 的编程式 API 进行自定义构建
 */

import { SkillBuilder } from '@jiangding/usk-builder'
import { loggerPlugin, minifyPlugin } from '@jiangding/usk-builder'

async function main() {
  console.log('🚀 Starting advanced build...\n')

  try {
    // 1. 从配置文件创建 Builder
    const builder = await SkillBuilder.fromConfig('usk.config.json')

    // 2. 注册插件
    console.log('📦 Registering plugins...')

    // Logger 插件 - 详细的构建日志
    builder.use(
      loggerPlugin({
        verbose: true,
        colors: true,
        timestamps: true
      })
    )

    // Minify 插件 - 压缩输出 (可选)
    // builder.use(minifyPlugin({
    //   removeComments: true,
    //   removeEmptyLines: true,
    //   trimWhitespace: true
    // }))

    // 3. 注册自定义 Helper (可选)
    console.log('🔧 Registering custom helpers...')

    // 示例: 格式化日期的 helper
    builder.templateEngine?.registerHelper('formatDate', function (date) {
      return new Date(date).toLocaleDateString('zh-CN')
    })

    // 示例: 生成 ID 的 helper
    builder.templateEngine?.registerHelper('generateId', function (prefix) {
      return `${prefix}-${Date.now()}`
    })

    // 4. 执行构建
    console.log('🔨 Building...\n')

    const startTime = Date.now()
    const result = await builder.build({
      clean: true, // 清理输出目录
      force: false, // 使用缓存
      verbose: true, // 详细输出
      concurrency: 5 // 并发数
    })

    const duration = Date.now() - startTime

    // 5. 输出结果
    console.log('\n' + '='.repeat(50))

    if (result.success) {
      console.log('✅ Build completed successfully!\n')

      // 显示平台构建结果
      for (const platform of result.platforms) {
        const status = platform.success ? '✓' : '✗'
        const size = formatSize(platform.size)
        console.log(
          `  ${status} ${platform.platform.padEnd(10)} ${size.padStart(10)} (${platform.duration}ms)`
        )
        console.log(`     → ${platform.outputPath}`)
      }

      // 显示统计信息
      const stats = builder.getStatistics()
      console.log('\n📊 Statistics:')
      console.log(`  Templates rendered: ${stats.templatesRendered}`)
      console.log(`  Files copied: ${stats.filesCopied}`)
      console.log(`  Total size: ${formatSize(stats.totalSize)}`)
      console.log(`  Total duration: ${duration}ms`)

      // 显示缓存信息
      const cacheManager = builder.getCacheManager()
      const cacheStats = await cacheManager.getStats()
      console.log('\n💾 Cache:')
      console.log(`  Entries: ${cacheStats.entryCount}`)
      console.log(`  Size: ${formatSize(cacheStats.totalSize)}`)

      // 显示警告 (如果有)
      if (result.warnings && result.warnings.length > 0) {
        console.log('\n⚠️  Warnings:')
        result.warnings.forEach((warning) => {
          console.log(`  • ${warning}`)
        })
      }
    } else {
      console.log('❌ Build failed!\n')

      // 显示错误
      if (result.errors && result.errors.length > 0) {
        console.log('Errors:')
        result.errors.forEach((error) => {
          console.log(`  • ${error.message}`)
        })
      }

      process.exit(1)
    }

    console.log('='.repeat(50) + '\n')
  } catch (error) {
    console.error('❌ Build error:', error.message)
    if (error.stack) {
      console.error('\nStack trace:')
      console.error(error.stack)
    }
    process.exit(1)
  }
}

/**
 * 格式化文件大小
 */
function formatSize(bytes) {
  if (bytes === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = (bytes / Math.pow(1024, i)).toFixed(1)

  return `${size} ${units[i]}`
}

// 运行构建
main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
