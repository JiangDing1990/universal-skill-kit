#!/usr/bin/env node
/**
 * Universal Skill Kit CLI
 * 命令行工具入口
 */

import { Command } from 'commander'
import { convertCommand } from './commands/convert.js'
import { analyzeCommand } from './commands/analyze.js'
import { batchConvertCommand } from './commands/batch-convert.js'
import { createCacheCommand } from './commands/cache.js'
import { initCommand } from './commands/init.js'
import { validateCommand } from './commands/validate.js'
import { doctorCommand } from './commands/doctor.js'
import { buildCommand } from './commands/build.js'

const program = new Command()

program
  .name('usk')
  .description('Universal Skill Kit - Convert skills between Claude Code and Codex')
  .version('0.2.0')

// Init command
program
  .command('init [name]')
  .description('Initialize a new USK project')
  .option('-t, --template <type>', 'Template type (basic|multi-platform|advanced)', 'basic')
  .option('-y, --yes', 'Skip prompts and use defaults', false)
  .option('-f, --force', 'Force overwrite existing directory', false)
  .action(initCommand)

// Build command
program
  .command('build')
  .description('Build USK project for all enabled platforms')
  .option('-c, --config <path>', 'Configuration file path', 'usk.config.json')
  .option('-p, --platforms <platforms>', 'Platforms to build (comma-separated)')
  .option('--clean', 'Clean output directories before build', true)
  .option('--no-clean', 'Do not clean output directories')
  .option('-f, --force', 'Force rebuild (ignore cache)', false)
  .option('-w, --watch', 'Watch mode - rebuild on file changes', false)
  .option('--concurrency <number>', 'Number of concurrent builds', (val) => parseInt(val, 10))
  .option('-v, --verbose', 'Show detailed build logs', false)
  .action(buildCommand)

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

// Cache management command
program.addCommand(createCacheCommand())

// Validate command
program
  .command('validate')
  .description('Validate USK configuration file')
  .option('-c, --config <path>', 'Configuration file path', 'usk.config.json')
  .option('--json', 'Output as JSON', false)
  .option('--strict', 'Strict mode (warnings are errors)', false)
  .action(validateCommand)

// Doctor command
program
  .command('doctor')
  .description('Diagnose USK project and check for issues')
  .option('-c, --config <path>', 'Configuration file path', 'usk.config.json')
  .option('-v, --verbose', 'Show all checks including passed ones', false)
  .action(doctorCommand)

// Parse command line arguments
program.parse(process.argv)

// Show help if no command provided
if (process.argv.length === 2) {
  program.help()
}
