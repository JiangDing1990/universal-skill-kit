/**
 * Build command
 * 构建 USK 项目
 */

import { existsSync } from 'node:fs'
import { resolve, relative } from 'node:path'
import chalk from 'chalk'
import ora from 'ora'
import { SkillBuilder, SkillWatcher } from '@jiangding/usk-builder'

export interface BuildCommandOptions {
  config?: string
  platforms?: string
  clean?: boolean
  force?: boolean
  verbose?: boolean
  watch?: boolean
  concurrency?: number
}

/**
 * Build command implementation
 */
export async function buildCommand(options: BuildCommandOptions = {}): Promise<void> {
  const configPath = resolve(process.cwd(), options.config || 'usk.config.json')

  // 检查配置文件是否存在
  if (!existsSync(configPath)) {
    console.error(chalk.red(`✗ 配置文件不存在: ${configPath}`))
    console.error(chalk.gray(`  请先运行 ${chalk.cyan('usk init')} 初始化项目`))
    process.exit(1)
  }

  let spinner: ora.Ora | undefined

  try {
    if (!options.verbose) {
      spinner = ora('Loading configuration...').start()
    } else {
      console.log(chalk.cyan('🔧 Loading configuration...'))
    }

    // 创建 builder
    const builder = await SkillBuilder.fromConfig(configPath)

    if (spinner) {
      spinner.succeed('Configuration loaded')
    } else {
      console.log(chalk.green('✓ Configuration loaded'))
    }

    // Watch 模式
    if (options.watch) {
      await runWatchMode(builder, configPath, options)
      return
    }

    // 普通构建模式
    if (!options.verbose) {
      spinner = ora('Building skill...').start()
    } else {
      console.log(chalk.cyan('\n🔨 Building skill...\n'))
    }

    const buildResult = await builder.build({
      clean: options.clean ?? true,
      force: options.force,
      verbose: options.verbose,
      concurrency: options.concurrency
    })

    if (spinner) {
      spinner.stop()
    }

    // 显示构建结果
    console.log()
    if (buildResult.success) {
      console.log(chalk.green('✨ Build completed successfully!\n'))

      // 显示平台构建结果
      for (const platform of buildResult.platforms) {
        if (platform.success) {
          const size = formatSize(platform.size)
          const duration = platform.duration.toFixed(0)

          console.log(
            chalk.green('✓'),
            chalk.bold(platform.platform),
            chalk.gray(`(${size}, ${duration}ms)`)
          )
          console.log(chalk.gray(`  → ${platform.outputPath}`))
        } else {
          console.log(chalk.red('✗'), chalk.bold(platform.platform), chalk.red('failed'))
          if (platform.error) {
            console.log(chalk.red(`  ${platform.error.message}`))
          }
        }
      }

      console.log()
      console.log(chalk.gray(`Total duration: ${buildResult.duration}ms`))

      // 显示警告
      if (buildResult.warnings && buildResult.warnings.length > 0) {
        console.log()
        console.log(chalk.yellow(`⚠️  ${buildResult.warnings.length} warning(s):`))
        buildResult.warnings.forEach((warning) => {
          console.log(chalk.yellow(`  • ${warning}`))
        })
      }
    } else {
      console.log(chalk.red('✗ Build failed\n'))

      // 显示错误
      if (buildResult.errors && buildResult.errors.length > 0) {
        buildResult.errors.forEach((error) => {
          console.log(chalk.red(`  ${error.message}`))
        })
      }

      process.exit(1)
    }
  } catch (error) {
    if (spinner) {
      spinner.fail('Build failed')
    }

    console.error()
    console.error(chalk.red('✗ Build failed:'))
    console.error(chalk.red(`  ${(error as Error).message}`))

    if (options.verbose && (error as Error).stack) {
      console.error()
      console.error(chalk.gray((error as Error).stack))
    }

    process.exit(1)
  }
}

/**
 * 格式化文件大小
 */
function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = (bytes / Math.pow(1024, i)).toFixed(1)

  return `${size} ${units[i]}`
}

/**
 * 运行 watch 模式
 */
async function runWatchMode(
  builder: SkillBuilder,
  configPath: string,
  options: BuildCommandOptions
): Promise<void> {
  const cwd = process.cwd()

  console.log(chalk.cyan('\n👀 Watch mode enabled'))
  console.log(chalk.gray('Press Ctrl+C to stop\n'))

  // 创建 watcher
  const config = (builder as any).config
  const watcher = new SkillWatcher(config, builder)

  // 处理 Ctrl+C 信号
  process.on('SIGINT', async () => {
    console.log(chalk.yellow('\n\n⏹  Stopping watcher...'))
    await watcher.stop()
    console.log(chalk.green('✓ Watcher stopped'))
    process.exit(0)
  })

  // 处理 SIGTERM 信号
  process.on('SIGTERM', async () => {
    await watcher.stop()
    process.exit(0)
  })

  // 启动 watcher
  await watcher.start({
    verbose: options.verbose,
    force: options.force,
    concurrency: options.concurrency,
    debounceDelay: 300,

    // 文件变化回调
    onChange: (file) => {
      const relativePath = relative(cwd, file)
      if (!options.verbose) {
        console.log(chalk.blue('📝 Changed:'), chalk.gray(relativePath))
      }
    },

    // 构建完成回调
    onBuildComplete: (success, duration) => {
      if (!options.verbose) {
        if (success) {
          console.log(chalk.green(`✅ Rebuild completed in ${duration}ms\n`))
        } else {
          console.log(chalk.red(`❌ Rebuild failed in ${duration}ms\n`))
        }
      }
    },

    // 错误回调
    onError: (error) => {
      console.error(chalk.red('\n❌ Build error:'))
      console.error(chalk.red(`  ${error.message}`))
      if (options.verbose && error.stack) {
        console.error()
        console.error(chalk.gray(error.stack))
      }
      console.log()
    }
  })
}
