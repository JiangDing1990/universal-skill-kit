#!/usr/bin/env node
/**
 * Universal Skill Kit CLI
 * 命令行工具入口
 */

import { Command } from 'commander'
import { convertCommand } from './commands/convert.js'
import { analyzeCommand } from './commands/analyze.js'
import { batchConvertCommand } from './commands/batch-convert.js'

const program = new Command()

program
  .name('usk')
  .description('Universal Skill Kit - Convert skills between Claude Code and Codex')
  .version('0.2.0')

// Convert command
program
  .command('convert')
  .description('Convert a skill from one platform to another')
  .argument('<input>', 'Input skill file path')
  .option('-t, --target <platform>', 'Target platform (claude|codex)', 'codex')
  .option('-o, --output <dir>', 'Output directory')
  .option('-s, --strategy <strategy>', 'Compression strategy (conservative|balanced|aggressive)')
  .option('-i, --interactive', 'Interactive mode with prompts', false)
  .option('--verbose', 'Show detailed logs', false)
  .action(convertCommand)

// Analyze command
program
  .command('analyze')
  .description('Analyze a skill and provide optimization suggestions')
  .argument('<input>', 'Input skill file path')
  .option('-v, --verbose', 'Show detailed analysis', false)
  .option('--json', 'Output as JSON', false)
  .action(analyzeCommand)

// Batch convert command
program
  .command('batch')
  .description('Convert multiple skills at once')
  .argument('<pattern>', 'File pattern (e.g., "skills/*.md")')
  .option('-t, --target <platform>', 'Target platform (claude|codex)', 'codex')
  .option('-o, --output <dir>', 'Output directory')
  .option('-s, --strategy <strategy>', 'Compression strategy')
  .option('--parallel', 'Process files in parallel', false)
  .action(batchConvertCommand)

// Parse command line arguments
program.parse(process.argv)

// Show help if no command provided
if (process.argv.length === 2) {
  program.help()
}
