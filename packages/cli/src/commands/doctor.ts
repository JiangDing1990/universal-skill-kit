/**
 * Doctor command - 诊断 USK 项目
 */

import { existsSync } from 'node:fs'
import { readdir, stat } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import chalk from 'chalk'
import ora from 'ora'
import { ConfigLoader } from '@jiangding/usk-builder'

/**
 * 诊断选项
 */
interface DoctorOptions {
  config?: string
  fix?: boolean
  verbose?: boolean
}

/**
 * 诊断项
 */
interface DiagnosticItem {
  name: string
  status: 'pass' | 'warn' | 'fail'
  message: string
  suggestion?: string
}

/**
 * 诊断结果
 */
interface DiagnosticResult {
  pass: DiagnosticItem[]
  warnings: DiagnosticItem[]
  errors: DiagnosticItem[]
}

/**
 * 检查Node版本
 */
function checkNodeVersion(): DiagnosticItem {
  const version = process.version
  const major = parseInt(version.slice(1).split('.')[0])

  if (major >= 18) {
    return {
      name: 'Node.js 版本',
      status: 'pass',
      message: `Node.js ${version} ✓`
    }
  } else if (major >= 16) {
    return {
      name: 'Node.js 版本',
      status: 'warn',
      message: `Node.js ${version}（建议使用 18+）`,
      suggestion: '升级到 Node.js 18 或更高版本以获得更好的性能'
    }
  } else {
    return {
      name: 'Node.js 版本',
      status: 'fail',
      message: `Node.js ${version}（需要 16+）`,
      suggestion: '请升级到 Node.js 16 或更高版本'
    }
  }
}

/**
 * 检查配置文件
 */
async function checkConfigFile(configPath: string): Promise<DiagnosticItem> {
  const fullPath = resolve(process.cwd(), configPath)

  if (!existsSync(fullPath)) {
    return {
      name: '配置文件',
      status: 'fail',
      message: `配置文件不存在: ${configPath}`,
      suggestion: '运行 usk init 创建新项目'
    }
  }

  try {
    const loader = new ConfigLoader()
    await loader.load(fullPath)

    return {
      name: '配置文件',
      status: 'pass',
      message: '配置文件有效 ✓'
    }
  } catch (error) {
    return {
      name: '配置文件',
      status: 'fail',
      message: `配置文件无效: ${(error as Error).message}`,
      suggestion: '运行 usk validate 查看详细错误'
    }
  }
}

/**
 * 检查项目结构
 */
async function checkProjectStructure(): Promise<DiagnosticItem[]> {
  const results: DiagnosticItem[] = []
  const requiredDirs = ['src']
  const optionalDirs = ['templates', 'scripts', 'resources']

  for (const dir of requiredDirs) {
    const dirPath = resolve(process.cwd(), dir)
    if (existsSync(dirPath)) {
      results.push({
        name: `目录: ${dir}/`,
        status: 'pass',
        message: '存在 ✓'
      })
    } else {
      results.push({
        name: `目录: ${dir}/`,
        status: 'fail',
        message: '缺失',
        suggestion: `创建 ${dir} 目录`
      })
    }
  }

  for (const dir of optionalDirs) {
    const dirPath = resolve(process.cwd(), dir)
    if (existsSync(dirPath)) {
      results.push({
        name: `目录: ${dir}/`,
        status: 'pass',
        message: '存在 ✓'
      })
    } else {
      results.push({
        name: `目录: ${dir}/`,
        status: 'warn',
        message: '不存在（可选）',
        suggestion: `如果需要，可以创建 ${dir} 目录`
      })
    }
  }

  return results
}

/**
 * 检查缓存状态
 */
async function checkCacheStatus(): Promise<DiagnosticItem> {
  const cacheDir = resolve(process.cwd(), '.usk/cache')

  if (!existsSync(cacheDir)) {
    return {
      name: '缓存系统',
      status: 'pass',
      message: '缓存未初始化（正常）'
    }
  }

  try {
    const files = await readdir(cacheDir)
    let totalSize = 0

    for (const file of files) {
      const filePath = join(cacheDir, file)
      const stats = await stat(filePath)
      if (stats.isFile()) {
        totalSize += stats.size
      }
    }

    const sizeInMB = totalSize / 1024 / 1024

    if (sizeInMB > 100) {
      return {
        name: '缓存系统',
        status: 'warn',
        message: `缓存较大: ${sizeInMB.toFixed(2)} MB`,
        suggestion: '运行 usk cache clean 清理缓存'
      }
    } else {
      return {
        name: '缓存系统',
        status: 'pass',
        message: `缓存正常: ${sizeInMB.toFixed(2)} MB ✓`
      }
    }
  } catch (error) {
    return {
      name: '缓存系统',
      status: 'warn',
      message: '无法读取缓存目录',
      suggestion: '检查文件系统权限'
    }
  }
}

/**
 * 检查依赖
 */
function checkDependencies(): DiagnosticItem {
  const packageJsonPath = resolve(process.cwd(), 'package.json')

  if (!existsSync(packageJsonPath)) {
    return {
      name: '依赖管理',
      status: 'warn',
      message: 'package.json 不存在',
      suggestion: '如果使用 npm/pnpm，建议创建 package.json'
    }
  }

  return {
    name: '依赖管理',
    status: 'pass',
    message: 'package.json 存在 ✓'
  }
}

/**
 * 格式化输出
 */
function printDiagnostics(result: DiagnosticResult, verbose: boolean): void {
  console.log()

  // 输出通过的检查
  if (verbose && result.pass.length > 0) {
    console.log(chalk.green.bold('✔ 通过的检查:\n'))
    for (const item of result.pass) {
      console.log(chalk.green(`  ✓ ${item.name}: ${item.message}`))
    }
    console.log()
  }

  // 输出警告
  if (result.warnings.length > 0) {
    console.log(chalk.yellow.bold('⚠ 警告:\n'))
    for (const item of result.warnings) {
      console.log(chalk.yellow(`  ⚠ ${item.name}: ${item.message}`))
      if (item.suggestion) {
        console.log(chalk.gray(`    💡 ${item.suggestion}`))
      }
    }
    console.log()
  }

  // 输出错误
  if (result.errors.length > 0) {
    console.log(chalk.red.bold('✖ 错误:\n'))
    for (const item of result.errors) {
      console.log(chalk.red(`  ✖ ${item.name}: ${item.message}`))
      if (item.suggestion) {
        console.log(chalk.gray(`    💡 ${item.suggestion}`))
      }
    }
    console.log()
  }

  // 总结
  const total = result.pass.length + result.warnings.length + result.errors.length
  const passCount = result.pass.length
  const warnCount = result.warnings.length
  const errorCount = result.errors.length

  console.log(chalk.bold('📊 诊断总结:\n'))
  console.log(chalk.cyan(`  总检查项: ${total}`))
  console.log(chalk.green(`  通过: ${passCount}`))
  console.log(chalk.yellow(`  警告: ${warnCount}`))
  console.log(chalk.red(`  错误: ${errorCount}`))
  console.log()

  if (errorCount === 0 && warnCount === 0) {
    console.log(chalk.green.bold('🎉 项目状态良好，没有问题！\n'))
  } else if (errorCount === 0) {
    console.log(chalk.yellow.bold('⚠ 项目可以运行，但存在一些警告\n'))
  } else {
    console.log(chalk.red.bold('✖ 项目存在问题，请修复错误后再构建\n'))
  }
}

/**
 * 诊断命令
 */
export async function doctorCommand(options: DoctorOptions = {}): Promise<void> {
  try {
    console.log(chalk.bold.cyan('\n🔍 Universal Skill Kit 项目诊断\n'))

    const spinner = ora('正在运行诊断...').start()

    const result: DiagnosticResult = {
      pass: [],
      warnings: [],
      errors: []
    }

    // 检查 Node.js 版本
    const nodeCheck = checkNodeVersion()
    if (nodeCheck.status === 'pass') result.pass.push(nodeCheck)
    else if (nodeCheck.status === 'warn') result.warnings.push(nodeCheck)
    else result.errors.push(nodeCheck)

    // 检查配置文件
    const configPath = options.config || 'usk.config.json'
    const configCheck = await checkConfigFile(configPath)
    if (configCheck.status === 'pass') result.pass.push(configCheck)
    else if (configCheck.status === 'warn') result.warnings.push(configCheck)
    else result.errors.push(configCheck)

    // 检查项目结构
    const structureChecks = await checkProjectStructure()
    for (const check of structureChecks) {
      if (check.status === 'pass') result.pass.push(check)
      else if (check.status === 'warn') result.warnings.push(check)
      else result.errors.push(check)
    }

    // 检查缓存状态
    const cacheCheck = await checkCacheStatus()
    if (cacheCheck.status === 'pass') result.pass.push(cacheCheck)
    else if (cacheCheck.status === 'warn') result.warnings.push(cacheCheck)
    else result.errors.push(cacheCheck)

    // 检查依赖
    const depsCheck = checkDependencies()
    if (depsCheck.status === 'pass') result.pass.push(depsCheck)
    else if (depsCheck.status === 'warn') result.warnings.push(depsCheck)
    else result.errors.push(depsCheck)

    spinner.stop()

    // 输出结果
    printDiagnostics(result, options.verbose || false)

    // 如果有错误，退出码为1
    if (result.errors.length > 0) {
      process.exit(1)
    }
  } catch (error) {
    console.error(chalk.red('\n✖ 诊断过程出错:'), (error as Error).message)
    process.exit(1)
  }
}
