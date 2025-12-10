/**
 * Validate command - 验证 USK 配置文件
 */

import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import chalk from 'chalk'
import ora from 'ora'
import { ConfigLoader } from '@jiangding/usk-builder'

/**
 * 验证选项
 */
interface ValidateOptions {
  config?: string
  json?: boolean
  strict?: boolean
}

/**
 * 验证结果
 */
interface ValidationResult {
  valid: boolean
  configPath: string
  errors: string[]
  warnings: string[]
  info: {
    name: string
    version: string
    platforms: string[]
    entryFile: string
  }
}

/**
 * 验证命令
 */
export async function validateCommand(
  options: ValidateOptions = {}
): Promise<void> {
  try {
    const configPath = options.config || 'usk.config.json'
    const fullPath = resolve(process.cwd(), configPath)

    if (!existsSync(fullPath)) {
      console.error(chalk.red(`\n✖ 配置文件不存在: ${configPath}\n`))
      console.log(chalk.yellow('💡 提示: 运行 usk init 创建新项目'))
      process.exit(1)
    }

    const spinner = ora('正在验证配置...').start()

    const loader = new ConfigLoader()
    let config

    try {
      config = await loader.load(fullPath)
      spinner.succeed(chalk.green('✔ 配置文件有效'))
    } catch (error) {
      spinner.fail(chalk.red('✖ 配置验证失败'))

      if (!options.json) {
        console.log()
        console.error(chalk.red('错误信息:'))
        console.error(chalk.red(`  ${(error as Error).message}`))
        console.log()
      } else {
        const result: ValidationResult = {
          valid: false,
          configPath: fullPath,
          errors: [(error as Error).message],
          warnings: [],
          info: {
            name: '',
            version: '',
            platforms: [],
            entryFile: ''
          }
        }
        console.log(JSON.stringify(result, null, 2))
      }

      process.exit(1)
    }

    // 收集信息
    const errors: string[] = []
    const warnings: string[] = []

    // 检查入口文件
    const entryPath = resolve(config.root, config.source.entry)
    if (!existsSync(entryPath)) {
      errors.push(`入口文件不存在: ${config.source.entry}`)
    }

    // 检查平台配置
    const enabledPlatforms = Object.entries(config.platforms)
      .filter(([_, cfg]) => cfg?.enabled)
      .map(([name]) => name)

    if (enabledPlatforms.length === 0) {
      warnings.push('没有启用的平台')
    }

    // 检查描述长度（Codex限制）
    if (config.platforms.codex?.enabled) {
      const description =
        typeof config.description === 'string'
          ? config.description
          : config.description.codex || config.description.common || ''

      if (description.length > 500) {
        errors.push(
          `Codex 描述过长: ${description.length} 字符（最大 500 字符）`
        )
      }
    }

    // 检查版本格式
    if (!/^\d+\.\d+\.\d+$/.test(config.version)) {
      warnings.push(
        `版本号格式不规范: ${config.version}（建议使用语义化版本，如 1.0.0）`
      )
    }

    // 检查名称格式
    if (!/^[a-z0-9-]+$/.test(config.name)) {
      errors.push(
        `项目名称格式无效: ${config.name}（只能包含小写字母、数字和连字符）`
      )
    }

    // 输出结果
    if (options.json) {
      const result: ValidationResult = {
        valid: errors.length === 0,
        configPath: fullPath,
        errors,
        warnings,
        info: {
          name: config.name,
          version: config.version,
          platforms: enabledPlatforms,
          entryFile: config.source.entry
        }
      }
      console.log(JSON.stringify(result, null, 2))
    } else {
      console.log()
      console.log(chalk.bold('📋 配置信息:\n'))
      console.log(chalk.cyan('  项目名称:'), config.name)
      console.log(chalk.cyan('  版本:'), config.version)
      console.log(chalk.cyan('  入口文件:'), config.source.entry)
      console.log(
        chalk.cyan('  启用平台:'),
        enabledPlatforms.join(', ') || chalk.gray('无')
      )
      console.log()

      if (errors.length > 0) {
        console.log(chalk.red.bold('✖ 错误:\n'))
        for (const error of errors) {
          console.log(chalk.red(`  • ${error}`))
        }
        console.log()
      }

      if (warnings.length > 0) {
        console.log(chalk.yellow.bold('⚠ 警告:\n'))
        for (const warning of warnings) {
          console.log(chalk.yellow(`  • ${warning}`))
        }
        console.log()
      }

      if (errors.length === 0 && warnings.length === 0) {
        console.log(chalk.green('✔ 配置完全正确，没有问题！\n'))
      } else if (errors.length === 0) {
        console.log(chalk.yellow('⚠ 配置有效，但存在一些警告\n'))
      }

      if (!options.strict && errors.length === 0) {
        console.log(chalk.gray('💡 提示: 使用 --strict 进行更严格的验证'))
        console.log()
      }
    }

    // 严格模式：警告也算失败
    if (options.strict && warnings.length > 0) {
      process.exit(1)
    }

    // 有错误则退出
    if (errors.length > 0) {
      process.exit(1)
    }
  } catch (error) {
    console.error(chalk.red('\n✖ 验证过程出错:'), (error as Error).message)
    process.exit(1)
  }
}
