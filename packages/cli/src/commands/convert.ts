/**
 * Convert Command
 * 转换命令
 */

import * as fs from 'node:fs/promises'
import chalk from 'chalk'
import ora from 'ora'
import inquirer from 'inquirer'
import {
  SkillConverter,
  SkillParser,
  SkillValidator,
  formatErrorMessage,
  getErrorSuggestions,
  isUSKError
} from '@jiangding/usk-core'
import { getLogger } from '@jiangding/usk-utils'
import type { Platform, ConvertOptions } from '@jiangding/usk-core'

interface ConvertCommandOptions {
  target: string
  output?: string
  strategy?: 'conservative' | 'balanced' | 'aggressive'
  interactive: boolean
  verbose: boolean
}

export async function convertCommand(
  input: string,
  options: ConvertCommandOptions
): Promise<void> {
  // Set verbose mode if requested
  const logger = getLogger()
  if (options.verbose) {
    logger.setVerbose(true)
    console.log(chalk.gray('🔍 Verbose mode enabled / 详细模式已启用\n'))
  }

  const spinner = ora('Initializing conversion / 初始化转换...').start()

  try {
    // Validate input file exists
    await fs.access(input)
    spinner.succeed('Input file found / 输入文件已找到')

    // Interactive mode
    if (options.interactive) {
      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'target',
          message: 'Target platform / 目标平台:',
          choices: ['claude', 'codex'],
          default: options.target
        },
        {
          type: 'list',
          name: 'strategy',
          message: 'Compression strategy / 压缩策略:',
          choices: ['conservative', 'balanced', 'aggressive'],
          default: options.strategy || 'balanced'
        },
        {
          type: 'input',
          name: 'output',
          message: 'Output directory (leave empty for default) / 输出目录（留空使用默认）:',
          default: options.output || ''
        }
      ])

      options.target = answers.target
      options.strategy = answers.strategy
      if (answers.output) {
        options.output = answers.output
      }
    }

    // Validate target platform
    const targetPlatform = options.target as Platform
    if (!['claude', 'codex'].includes(targetPlatform)) {
      throw new Error(`Invalid target platform / 无效的目标平台: ${options.target}`)
    }

    // Step 1: Parse skill
    spinner.start('Parsing skill / 解析 Skill...')
    const parser = new SkillParser()
    const skill = await parser.parse(input)
    spinner.succeed('Skill parsed / Skill 已解析')

    // Step 2: Validate skill
    spinner.start('Validating skill / 验证 Skill...')
    const validator = new SkillValidator()
    const validation = await validator.validate(skill, input)

    if (!validation.valid) {
      spinner.fail('Validation failed / 验证失败')
      console.log('\n' + chalk.bold.red('❌ Validation Errors:'))
      validation.errors.forEach((error) => {
        console.log(chalk.red(`  • [${error.field}] ${error.message}`))
      })

      // Ask if user wants to continue anyway
      if (options.interactive) {
        const { continueAnyway } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'continueAnyway',
            message: 'Skill has validation errors. Continue anyway? / Skill 存在验证错误，是否继续？',
            default: false
          }
        ])

        if (!continueAnyway) {
          console.log(chalk.yellow('\nConversion cancelled / 转换已取消。'))
          process.exit(1)
        }
      } else {
        console.log(chalk.red('\nUse --interactive to override validation errors / 使用 --interactive 覆盖验证错误。'))
        process.exit(1)
      }
    } else {
      spinner.succeed('Validation passed / 验证通过')
    }

    // Display warnings if any
    if (validation.warnings.length > 0) {
      console.log('\n' + chalk.bold.yellow('⚠️  Validation Warnings:'))
      validation.warnings.forEach((warning) => {
        const icon = warning.severity === 'high'
          ? chalk.red('⚠')
          : warning.severity === 'medium'
            ? chalk.yellow('⚠')
            : chalk.gray('ℹ')
        console.log(`  ${icon} [${warning.field}] ${warning.message}`)
      })
    }

    // Step 3: Check platform-specific requirements
    const conversionValidation = validator.validateForConversion(skill, targetPlatform)
    if (conversionValidation.warnings.length > 0) {
      console.log('\n' + chalk.bold.cyan('ℹ️  Platform-Specific Notes:'))
      conversionValidation.warnings.forEach((warning) => {
        console.log(chalk.cyan(`  • [${warning.field}] ${warning.message}`))
      })
    }

    // Step 4: Create converter
    const converter = new SkillConverter()

    // Prepare conversion options
    const convertOptions: ConvertOptions = {
      targetPlatform,
      outputDir: options.output,
      compressionStrategy: options.strategy,
      verbose: options.verbose
    }

    // Step 5: Perform conversion
    spinner.start('Converting skill / 转换 Skill...')
    const result = await converter.convert(input, convertOptions)
    spinner.succeed('Conversion completed / 转换完成!')

    // Display results
    console.log('\n' + chalk.bold.green('✓ Conversion Successful / 转换成功'))
    console.log(chalk.gray('─'.repeat(50)))
    console.log(chalk.cyan('Platform / 平台:'), result.platform)
    console.log(chalk.cyan('Output / 输出:'), result.outputPath)
    console.log(chalk.cyan('Quality Score / 质量分数:'), `${result.quality}/100`)
    console.log(chalk.gray('─'.repeat(50)))

    // Statistics
    console.log('\n' + chalk.bold('Statistics / 统计信息:'))
    console.log(
      chalk.cyan('  Original Length / 原始长度:'),
      result.statistics.originalLength,
      'chars'
    )
    console.log(
      chalk.cyan('  Final Length / 最终长度:'),
      result.statistics.finalLength,
      'chars'
    )
    console.log(
      chalk.cyan('  Compression / 压缩率:'),
      `${result.statistics.compressionRate.toFixed(1)}%`
    )
    console.log(
      chalk.cyan('  Duration / 耗时:'),
      `${result.statistics.duration}ms`
    )

    // Keyword preservation
    if (result.statistics.preservedKeywords.length > 0) {
      console.log(
        '\n' +
          chalk.green('✓ Preserved Keywords / 保留的关键词:'),
        result.statistics.preservedKeywords.slice(0, 10).join(', ')
      )
      if (result.statistics.preservedKeywords.length > 10) {
        console.log(
          chalk.gray(
            `  ... and ${result.statistics.preservedKeywords.length - 10} more / 还有 ${result.statistics.preservedKeywords.length - 10} 个`
          )
        )
      }
    }

    // Lost information warning
    if (result.statistics.lostInformation.length > 0) {
      console.log(
        '\n' + chalk.yellow('⚠ Lost Keywords / 丢失的关键词:'),
        result.statistics.lostInformation.slice(0, 5).join(', ')
      )
      if (result.statistics.lostInformation.length > 5) {
        console.log(
          chalk.gray(
            `  ... and ${result.statistics.lostInformation.length - 5} more / 还有 ${result.statistics.lostInformation.length - 5} 个`
          )
        )
      }
    }

    console.log('\n' + chalk.green('Done! / 完成! ✨'))
  } catch (error) {
    spinner.fail('Conversion failed / 转换失败')

    // Display formatted error message
    console.log('\n' + chalk.bold.red('❌ Error / 错误:'))
    console.log(chalk.red('  ' + formatErrorMessage(error)))

    // Display suggestions if available
    if (isUSKError(error)) {
      const suggestions = getErrorSuggestions(error)
      if (suggestions.length > 0) {
        console.log('\n' + chalk.bold.yellow('💡 Suggestions / 建议:'))
        suggestions.forEach((suggestion) => {
          console.log(chalk.yellow('  • ' + suggestion))
        })
      }
    }

    // Display stack trace in verbose mode
    if (error instanceof Error && error.stack) {
      console.log('\n' + chalk.gray(error.stack))
    }

    process.exit(1)
  }
}
