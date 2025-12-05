/**
 * Batch Convert Command
 * 批量转换命令
 */

import { glob } from 'glob'
import chalk from 'chalk'
import ora from 'ora'
import { SkillConverter } from '@usk/core'
import type { Platform, ConvertOptions } from '@usk/core'

interface BatchConvertCommandOptions {
  target: string
  output?: string
  strategy?: 'conservative' | 'balanced' | 'aggressive'
  parallel: boolean
}

export async function batchConvertCommand(
  pattern: string,
  options: BatchConvertCommandOptions
): Promise<void> {
  const spinner = ora('Finding skills...').start()

  try {
    // Find matching files
    const files = await glob(pattern, {
      absolute: true,
      nodir: true
    })

    if (files.length === 0) {
      spinner.fail('No files found matching pattern')
      console.log(chalk.yellow('Pattern:'), pattern)
      return
    }

    spinner.succeed(`Found ${files.length} skill(s)`)

    // Validate target platform
    const targetPlatform = options.target as Platform
    if (!['claude', 'codex'].includes(targetPlatform)) {
      throw new Error(`Invalid target platform: ${options.target}`)
    }

    // Create converter
    const converter = new SkillConverter()

    // Prepare conversion options
    const convertOptions: ConvertOptions = {
      targetPlatform,
      outputDir: options.output,
      compressionStrategy: options.strategy
    }

    // Convert files
    const progressSpinner = ora(
      `Converting 0/${files.length} skills...`
    ).start()

    const results = await converter.convertBatch(files, convertOptions)

    const successCount = results.filter((r) => r.success).length
    const failCount = results.length - successCount

    if (failCount === 0) {
      progressSpinner.succeed(`Converted all ${successCount} skills successfully!`)
    } else {
      progressSpinner.warn(
        `Converted ${successCount}/${results.length} skills (${failCount} failed)`
      )
    }

    // Display summary
    console.log('\n' + chalk.bold.blue('📊 Batch Conversion Summary'))
    console.log(chalk.gray('═'.repeat(50)))

    // Statistics
    const totalOriginal = results.reduce(
      (sum, r) => sum + r.statistics.originalLength,
      0
    )
    const totalFinal = results.reduce((sum, r) => sum + r.statistics.finalLength, 0)
    const avgCompression =
      results.reduce((sum, r) => sum + r.statistics.compressionRate, 0) /
      results.length
    const totalDuration = results.reduce((sum, r) => sum + r.statistics.duration, 0)

    console.log('\n' + chalk.bold('Overall Statistics:'))
    console.log(chalk.cyan('  Total Files:'), results.length)
    console.log(chalk.green('  Successful:'), successCount)
    if (failCount > 0) {
      console.log(chalk.red('  Failed:'), failCount)
    }
    console.log(chalk.cyan('  Original Size:'), totalOriginal, 'chars')
    console.log(chalk.cyan('  Final Size:'), totalFinal, 'chars')
    console.log(chalk.cyan('  Avg Compression:'), `${avgCompression.toFixed(1)}%`)
    console.log(chalk.cyan('  Total Time:'), `${totalDuration}ms`)

    // Show individual results
    console.log('\n' + chalk.bold('Individual Results:'))

    results.forEach((result, index) => {
      const status = result.success ? chalk.green('✓') : chalk.red('✗')
      const filename = files[index]?.split('/').pop() || files[index] || 'unknown'

      if (result.success) {
        console.log(
          `  ${status} ${filename} ${chalk.gray(`(${result.statistics.compressionRate.toFixed(1)}% compression)`)}`
        )
      } else {
        console.log(`  ${status} ${filename} ${chalk.red('(failed)')}`)
      }
    })

    // Failed files details
    if (failCount > 0) {
      console.log('\n' + chalk.bold.yellow('⚠️  Failed Conversions:'))
      results.forEach((result, index) => {
        if (!result.success) {
          console.log(chalk.yellow('  •'), files[index])
        }
      })
    }

    console.log('\n' + chalk.gray('─'.repeat(50)))
    console.log(
      failCount === 0
        ? chalk.green('✓ All conversions completed!')
        : chalk.yellow(`⚠ Completed with ${failCount} error(s)`)
    )
  } catch (error) {
    spinner.fail('Batch conversion failed')
    throw error
  }
}
