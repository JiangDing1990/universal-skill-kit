/**
 * Analyze Command
 * 分析命令
 */

import * as fs from 'node:fs/promises'
import chalk from 'chalk'
import ora from 'ora'
import { SkillParser, SkillAnalyzer } from '@jiangding/usk-core'

interface AnalyzeCommandOptions {
  verbose: boolean
  json: boolean
}

export async function analyzeCommand(
  input: string,
  options: AnalyzeCommandOptions
): Promise<void> {
  const spinner = ora('Analyzing skill...').start()

  try {
    // Read and parse skill
    const content = await fs.readFile(input, 'utf-8')
    const parser = new SkillParser()
    const skill = await parser.parse(content)

    // Analyze skill
    const analyzer = new SkillAnalyzer()
    const report = analyzer.analyze(skill)

    spinner.succeed('Analysis completed!')

    // JSON output
    if (options.json) {
      console.log(JSON.stringify(report, null, 2))
      return
    }

    // Human-readable output
    console.log('\n' + chalk.bold.blue('📊 Skill Analysis Report'))
    console.log(chalk.gray('═'.repeat(50)))

    // Basic info
    console.log('\n' + chalk.bold('Basic Information:'))
    console.log(chalk.cyan('  Name:'), skill.metadata.name)
    if (skill.metadata.version) {
      console.log(chalk.cyan('  Version:'), skill.metadata.version)
    }
    if (skill.metadata.author) {
      console.log(chalk.cyan('  Author:'), skill.metadata.author)
    }
    if (skill.metadata.tags && skill.metadata.tags.length > 0) {
      console.log(chalk.cyan('  Tags:'), skill.metadata.tags.join(', '))
    }

    // Complexity
    console.log('\n' + chalk.bold('Complexity Analysis:'))
    const complexityColor =
      report.complexity === 'high'
        ? chalk.red
        : report.complexity === 'medium'
          ? chalk.yellow
          : chalk.green
    console.log(chalk.cyan('  Level:'), complexityColor(report.complexity.toUpperCase()))
    console.log(chalk.cyan('  Description Length:'), report.descriptionLength, 'chars')
    console.log(chalk.cyan('  Has Code Examples:'), report.hasCodeExamples ? '✓' : '✗')

    // Technical keywords
    if (report.technicalKeywords.length > 0) {
      console.log('\n' + chalk.bold('Technical Keywords:'))
      const keywords = report.technicalKeywords.slice(0, 15)
      console.log('  ' + keywords.join(', '))
      if (report.technicalKeywords.length > 15) {
        console.log(chalk.gray(`  ... and ${report.technicalKeywords.length - 15} more`))
      }
    }

    // Strategy recommendation
    console.log('\n' + chalk.bold('Compression Strategy:'))
    console.log(chalk.cyan('  Recommended:'), chalk.bold(report.recommendedStrategy))

    // Quality score
    console.log('\n' + chalk.bold('Quality Assessment:'))
    const qualityColor =
      report.estimatedQuality >= 80
        ? chalk.green
        : report.estimatedQuality >= 60
          ? chalk.yellow
          : chalk.red
    console.log(
      chalk.cyan('  Score:'),
      qualityColor(`${report.estimatedQuality}/100`)
    )

    // Warnings
    if (report.warnings.length > 0) {
      console.log('\n' + chalk.bold.yellow('⚠️  Warnings:'))
      report.warnings.forEach((warning) => {
        console.log(chalk.yellow('  • ' + warning))
      })
    }

    // Suggestions
    if (report.suggestions.length > 0) {
      console.log('\n' + chalk.bold.cyan('💡 Suggestions:'))
      report.suggestions.forEach((suggestion) => {
        const icon =
          suggestion.type === 'warning'
            ? chalk.yellow('⚠')
            : suggestion.type === 'optimization'
              ? chalk.blue('⚡')
              : chalk.cyan('ℹ')
        console.log(`  ${icon} ${suggestion.message}`)
      })
    }

    // Verbose mode
    if (options.verbose) {
      console.log('\n' + chalk.bold('Detailed Information:'))
      console.log(chalk.cyan('  Body Length:'), skill.body.length, 'chars')
      console.log(
        chalk.cyan('  Resources:'),
        (skill.resources.templates?.length || 0) +
          (skill.resources.references?.length || 0) +
          (skill.resources.scripts?.length || 0)
      )

      if (skill.resources.templates && skill.resources.templates.length > 0) {
        console.log(chalk.gray('    Templates:'), skill.resources.templates.join(', '))
      }
      if (skill.resources.references && skill.resources.references.length > 0) {
        console.log(chalk.gray('    References:'), skill.resources.references.join(', '))
      }
      if (skill.resources.scripts && skill.resources.scripts.length > 0) {
        console.log(chalk.gray('    Scripts:'), skill.resources.scripts.join(', '))
      }
    }

    console.log('\n' + chalk.gray('─'.repeat(50)))
    console.log(chalk.green('✓ Analysis complete!'))
  } catch (error) {
    spinner.fail('Analysis failed')
    throw error
  }
}
