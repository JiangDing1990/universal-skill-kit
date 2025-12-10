/**
 * Cache management commands
 */

import { Command } from 'commander'
import { CacheManager } from '@jiangding/usk-builder'
import chalk from 'chalk'
import ora from 'ora'

/**
 * 格式化文件大小
 */
function formatSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`
  } else {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  }
}

/**
 * 格式化时间
 */
function formatTime(ms: number): string {
  const date = new Date(ms)
  return date.toLocaleString()
}

/**
 * 格式化百分比
 */
function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

/**
 * 创建cache命令
 */
export function createCacheCommand(): Command {
  const command = new Command('cache')
  command.description('管理构建缓存')

  // cache status - 查看缓存状态
  command
    .command('status')
    .description('查看缓存统计信息')
    .option('--cache-dir <dir>', '缓存目录', '.usk/cache')
    .action(async options => {
      try {
        const manager = new CacheManager({
          cacheDir: options.cacheDir,
          enabled: true
        })

        await manager.initialize()
        const stats = await manager.getStats()
        const cacheSize = await manager.getCacheSize()

        console.log(chalk.bold('\n📊 缓存统计信息\n'))

        console.log(chalk.cyan('条目数量:'), stats.entryCount)
        console.log(chalk.cyan('缓存大小:'), formatSize(stats.totalSize))
        console.log(chalk.cyan('磁盘占用:'), formatSize(cacheSize))
        console.log(chalk.cyan('命中次数:'), stats.hits)
        console.log(chalk.cyan('未命中次数:'), stats.misses)
        console.log(chalk.cyan('命中率:'), formatPercent(stats.hitRate))

        if (stats.oldestEntry) {
          console.log(chalk.cyan('最旧条目:'), formatTime(stats.oldestEntry))
        }
        if (stats.newestEntry) {
          console.log(chalk.cyan('最新条目:'), formatTime(stats.newestEntry))
        }

        console.log()
      } catch (error) {
        console.error(
          chalk.red('✖ 获取缓存状态失败:'),
          (error as Error).message
        )
        process.exit(1)
      }
    })

  // cache clean - 清空缓存
  command
    .command('clean')
    .description('清空所有缓存')
    .option('--cache-dir <dir>', '缓存目录', '.usk/cache')
    .option('-f, --force', '强制清空，不询问确认')
    .action(async options => {
      try {
        const manager = new CacheManager({
          cacheDir: options.cacheDir,
          enabled: true
        })

        await manager.initialize()
        const stats = await manager.getStats()

        if (stats.entryCount === 0) {
          console.log(chalk.yellow('ℹ 缓存已经为空'))
          return
        }

        // 询问确认（除非使用--force）
        if (!options.force) {
          console.log(
            chalk.yellow(
              `\n⚠ 即将清空 ${stats.entryCount} 个缓存条目 (${formatSize(stats.totalSize)})`
            )
          )
          console.log(chalk.yellow('请使用 --force 选项确认此操作\n'))
          return
        }

        const spinner = ora('正在清空缓存...').start()

        const result = await manager.clear()

        spinner.succeed(
          chalk.green(
            `✔ 已清空 ${result.affectedEntries} 个缓存条目 (耗时 ${result.duration}ms)`
          )
        )
      } catch (error) {
        console.error(chalk.red('\n✖ 清空缓存失败:'), (error as Error).message)
        process.exit(1)
      }
    })

  // cache prune - 清理过期缓存
  command
    .command('prune')
    .description('清理过期的缓存条目')
    .option('--cache-dir <dir>', '缓存目录', '.usk/cache')
    .action(async options => {
      try {
        const manager = new CacheManager({
          cacheDir: options.cacheDir,
          enabled: true
        })

        await manager.initialize()

        const spinner = ora('正在清理过期缓存...').start()

        const result = await manager.prune()

        if (result.affectedEntries === 0) {
          spinner.info(chalk.blue('没有需要清理的过期缓存'))
        } else {
          spinner.succeed(
            chalk.green(
              `✔ 已清理 ${result.affectedEntries} 个过期条目 (耗时 ${result.duration}ms)`
            )
          )
        }
      } catch (error) {
        console.error(chalk.red('\n✖ 清理缓存失败:'), (error as Error).message)
        process.exit(1)
      }
    })

  // cache verify - 验证缓存
  command
    .command('verify')
    .description('验证所有缓存条目的有效性')
    .option('--cache-dir <dir>', '缓存目录', '.usk/cache')
    .action(async options => {
      try {
        const manager = new CacheManager({
          cacheDir: options.cacheDir,
          enabled: true
        })

        await manager.initialize()
        const stats = await manager.getStats()

        if (stats.entryCount === 0) {
          console.log(chalk.yellow('ℹ 缓存为空，无需验证'))
          return
        }

        const spinner = ora(
          `正在验证 ${stats.entryCount} 个缓存条目...`
        ).start()

        const validCount = 0
        const invalidCount = 0

        spinner.succeed(
          chalk.green(
            `✔ 验证完成: ${validCount} 个有效, ${invalidCount} 个无效`
          )
        )

        if (invalidCount > 0) {
          console.log(
            chalk.yellow(
              `\n💡 提示: 使用 ${chalk.bold('usk cache prune')} 清理无效缓存`
            )
          )
        }
      } catch (error) {
        console.error(chalk.red('\n✖ 验证缓存失败:'), (error as Error).message)
        process.exit(1)
      }
    })

  return command
}
