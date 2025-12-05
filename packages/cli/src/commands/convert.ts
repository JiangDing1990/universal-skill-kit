/**
 * Convert Command
 * 转换命令
 */

import * as fs from 'node:fs/promises'
import chalk from 'chalk'
import ora from 'ora'
import inquirer from 'inquirer'
import { SkillConverter, SkillParser, SkillValidator } from '@usk/core'
import type { Platform, ConvertOptions } from '@usk/core'

interface ConvertCommandOptions {
  target: string
  output?: string
  strategy?: 'conservative' | 'balanced' | 'aggressive'
  interactive: boolean
}

export async function convertCommand(
  input: string,
  options: ConvertCommandOptions
): Promise<void> {
  const spinner = ora('Initializing conversion...').start()

  try {
    // Validate input file exists
    await fs.access(input)
    spinner.succeed('Input file found')

    // Interactive mode
    if (options.interactive) {
      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'target',
          message: 'Target platform:',
          choices: ['claude', 'codex'],
          default: options.target
        },
        {
          type: 'list',
          name: 'strategy',
          message: 'Compression strategy:',
          choices: ['conservative', 'balanced', 'aggressive'],
          default: options.strategy || 'balanced'
        },
        {
          type: 'input',
          name: 'output',
          message: 'Output directory (leave empty for default):',
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
      throw new Error(`Invalid target platform: ${options.target}`)
    }

    // Step 1: Parse skill
    spinner.start('Parsing skill...')
    const parser = new SkillParser()
    const skill = await parser.parse(input)
    spinner.succeed('Skill parsed')

    // Step 2: Validate skill
    spinner.start('Validating skill...')
    const validator = new SkillValidator()
    const validation = await validator.validate(skill, input)

    if (!validation.valid) {
      spinner.fail('Validation failed')
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
            message: 'Skill has validation errors. Continue anyway?',
            default: false
          }
        ])

        if (!continueAnyway) {
          console.log(chalk.yellow('\nConversion cancelled.'))
          process.exit(1)
        }
      } else {
        console.log(chalk.red('\nUse --interactive to override validation errors.'))
        process.exit(1)
      }
    } else {
      spinner.succeed('Validation passed')
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
      compressionStrategy: options.strategy
    }

    // Step 5: Perform conversion
    spinner.start('Converting skill...')
    const result = await converter.convert(input, convertOptions)
    spinner.succeed('Conversion completed!')

    // Display results
    console.log('\n' + chalk.bold.green('✓ Conversion Successful'))
    console.log(chalk.gray('─'.repeat(50)))
    console.log(chalk.cyan('Platform:'), result.platform)
    console.log(chalk.cyan('Output:'), result.outputPath)
    console.log(chalk.cyan('Quality Score:'), `${result.quality}/100`)
    console.log(chalk.gray('─'.repeat(50)))

    // Statistics
    console.log('\n' + chalk.bold('Statistics:'))
    console.log(
      chalk.cyan('  Original Length:'),
      result.statistics.originalLength,
      'chars'
    )
    console.log(
      chalk.cyan('  Final Length:'),
      result.statistics.finalLength,
      'chars'
    )
    console.log(
      chalk.cyan('  Compression:'),
      `${result.statistics.compressionRate.toFixed(1)}%`
    )
    console.log(
      chalk.cyan('  Duration:'),
      `${result.statistics.duration}ms`
    )

    // Keyword preservation
    if (result.statistics.preservedKeywords.length > 0) {
      console.log(
        '\n' +
          chalk.green('✓ Preserved Keywords:'),
        result.statistics.preservedKeywords.slice(0, 10).join(', ')
      )
      if (result.statistics.preservedKeywords.length > 10) {
        console.log(
          chalk.gray(
            `  ... and ${result.statistics.preservedKeywords.length - 10} more`
          )
        )
      }
    }

    // Lost information warning
    if (result.statistics.lostInformation.length > 0) {
      console.log(
        '\n' + chalk.yellow('⚠ Lost Keywords:'),
        result.statistics.lostInformation.slice(0, 5).join(', ')
      )
      if (result.statistics.lostInformation.length > 5) {
        console.log(
          chalk.gray(
            `  ... and ${result.statistics.lostInformation.length - 5} more`
          )
        )
      }
    }

    console.log('\n' + chalk.green('Done! ✨'))
  } catch (error) {
    spinner.fail('Conversion failed')
    throw error
  }
}
