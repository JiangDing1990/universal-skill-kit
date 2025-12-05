/**
 * Batch Convert Command
 * 批量转换命令
 */

import { glob } from 'glob'
import chalk from 'chalk'
import ora from 'ora'
import { SkillConverter } from '@jiangding/usk-core'
import type { Platform, ConvertOptions } from '@jiangding/usk-core'

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
  const spinner = ora('Finding skills / 查找 Skills...').start()

  try {
    // Find matching files
    const files = await glob(pattern, {
      absolute: true,
      nodir: true
    })

    if (files.length === 0) {
      spinner.fail('No files found matching pattern / 未找到匹配的文件')
      console.log(chalk.yellow('Pattern / 匹配模式:'), pattern)
      return
    }

    spinner.succeed(`Found ${files.length} skill(s) / 找到 ${files.length} 个 Skill`)

    // Validate target platform
    const targetPlatform = options.target as Platform
    if (!['claude', 'codex'].includes(targetPlatform)) {
      throw new Error(`Invalid target platform / 无效的目标平台: ${options.target}`)
    }

    // Create converter
    const converter = new SkillConverter()

    // Prepare conversion options
    const convertOptions: ConvertOptions = {
      targetPlatform,
      outputDir: options.output,
      compressionStrategy: options.strategy
    }

    // Convert files with progress tracking
    const progressSpinner = ora(`Converting 0/${files.length} skills / 转换 0/${files.length} 个 Skills...`).start()

    const results = await converter.convertBatch(
      files,
      convertOptions,
      (current, total, skillPath) => {
        // Update spinner with current progress
        const filename = skillPath.split('/').pop() || skillPath
        progressSpinner.text = `Converting ${current}/${total} / 转换 ${current}/${total}: ${chalk.cyan(filename)}`
      }
    )

    const successCount = results.filter((r) => r.success).length
    const failCount = results.length - successCount

    if (failCount === 0) {
      progressSpinner.succeed(`Converted all ${successCount} skills successfully / 成功转换所有 ${successCount} 个 Skills!`)
    } else {
      progressSpinner.warn(
        `Converted ${successCount}/${results.length} skills (${failCount} failed) / 转换了 ${successCount}/${results.length} 个 Skills (${failCount} 个失败)`
      )
    }

    // Display summary
    console.log('\n' + chalk.bold.blue('📊 Batch Conversion Summary / 批量转换总结'))
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

    console.log('\n' + chalk.bold('Overall Statistics / 总体统计:'))
    console.log(chalk.cyan('  Total Files / 文件总数:'), results.length)
    console.log(chalk.green('  Successful / 成功:'), successCount)
    if (failCount > 0) {
      console.log(chalk.red('  Failed / 失败:'), failCount)
    }
    console.log(chalk.cyan('  Original Size / 原始大小:'), totalOriginal, 'chars')
    console.log(chalk.cyan('  Final Size / 最终大小:'), totalFinal, 'chars')
    console.log(chalk.cyan('  Avg Compression / 平均压缩率:'), `${avgCompression.toFixed(1)}%`)
    console.log(chalk.cyan('  Total Time / 总耗时:'), `${totalDuration}ms`)

    // Show individual results
    console.log('\n' + chalk.bold('Individual Results / 单个结果:'))

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
      console.log('\n' + chalk.bold.red('❌ Failed Conversions / 转换失败:'))
      results.forEach((result, index) => {
        if (!result.success) {
          const filename = files[index]
          console.log(chalk.red('  ✗'), filename)
          if (result.error) {
            console.log(chalk.gray(`    ${result.error}`))
          }
        }
      })
    }

    console.log('\n' + chalk.gray('─'.repeat(50)))
    console.log(
      failCount === 0
        ? chalk.green('✓ All conversions completed! / 所有转换完成!')
        : chalk.yellow(`⚠ Completed with ${failCount} error(s) / 完成但有 ${failCount} 个错误`)
    )
  } catch (error) {
    spinner.fail('Batch conversion failed / 批量转换失败')
    throw error
  }
}
