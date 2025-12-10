/**
 * Configuration loader
 * Supports .ts, .js, .json, .mjs config files
 */

import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { dirname, resolve, extname } from 'node:path'
import { pathToFileURL } from 'node:url'
import type {
  SkillConfig,
  ResolvedConfig,
  UserConfig,
  ConfigEnv
} from '../types/config'
import { ConfigValidator } from './validator'
import { ConfigValidationError } from './schema'

/**
 * 配置文件名
 */
const CONFIG_FILES = [
  'usk.config.ts',
  'usk.config.mts',
  'usk.config.js',
  'usk.config.mjs',
  'usk.config.cjs',
  'usk.config.json'
]

/**
 * 默认配置
 */
const DEFAULT_CONFIG: Partial<SkillConfig> = {
  source: {
    entry: 'src/SKILL.md'
  },
  build: {
    clean: true,
    sourcemap: false,
    minify: false,
    watch: false
  }
}

/**
 * 配置加载错误
 */
export class ConfigLoadError extends Error {
  constructor(
    message: string,
    public cause?: Error
  ) {
    super(message)
    this.name = 'ConfigLoadError'
  }
}

/**
 * 配置加载器
 */
export class ConfigLoader {
  private validator = new ConfigValidator()

  /**
   * 加载配置文件
   */
  async load(
    configPath?: string,
    env: ConfigEnv = { mode: 'development' }
  ): Promise<ResolvedConfig> {
    // 1. 查找配置文件
    const resolvedPath = await this.resolveConfigPath(configPath)

    if (!resolvedPath) {
      throw new ConfigLoadError(
        `配置文件未找到。请在项目根目录创建以下文件之一:\n${CONFIG_FILES.map(f => `  • ${f}`).join('\n')}`
      )
    }

    // 2. 加载配置
    const rawConfig = await this.loadConfigFile(resolvedPath, env)

    // 3. 处理继承
    const mergedConfig = await this.processExtends(
      rawConfig,
      dirname(resolvedPath)
    )

    // 4. 验证配置
    const validationResult = this.validator.validate(
      mergedConfig,
      dirname(resolvedPath)
    )

    if (!validationResult.valid) {
      throw new ConfigValidationError(
        validationResult.errors.map(err => ({
          code: 'custom',
          path: err.path.split('.'),
          message: err.message
        })) as any
      )
    }

    // 5. 解析为最终配置
    const resolved = await this.resolve(
      mergedConfig as SkillConfig,
      resolvedPath,
      env
    )

    return resolved
  }

  /**
   * 解析配置文件路径
   */
  private async resolveConfigPath(configPath?: string): Promise<string | null> {
    // 如果指定了路径，直接使用
    if (configPath) {
      const resolved = resolve(process.cwd(), configPath)
      if (existsSync(resolved)) {
        return resolved
      }
      throw new ConfigLoadError(`指定的配置文件不存在: ${configPath}`)
    }

    // 在当前目录查找配置文件
    const cwd = process.cwd()
    for (const filename of CONFIG_FILES) {
      const filePath = resolve(cwd, filename)
      if (existsSync(filePath)) {
        return filePath
      }
    }

    return null
  }

  /**
   * 加载配置文件
   */
  private async loadConfigFile(
    filePath: string,
    env: ConfigEnv
  ): Promise<SkillConfig> {
    const ext = extname(filePath)

    try {
      switch (ext) {
        case '.json':
          return await this.loadJsonConfig(filePath)

        case '.ts':
        case '.mts':
        case '.js':
        case '.mjs':
        case '.cjs':
          return await this.loadEsmConfig(filePath, env)

        default:
          throw new ConfigLoadError(`不支持的配置文件格式: ${ext}`)
      }
    } catch (error) {
      if (error instanceof ConfigLoadError) {
        throw error
      }
      throw new ConfigLoadError(`加载配置文件失败: ${filePath}`, error as Error)
    }
  }

  /**
   * 加载JSON配置
   */
  private async loadJsonConfig(filePath: string): Promise<SkillConfig> {
    const content = await readFile(filePath, 'utf-8')
    return JSON.parse(content)
  }

  /**
   * 加载ESM配置（使用tsx）
   */
  private async loadEsmConfig(
    filePath: string,
    env: ConfigEnv
  ): Promise<SkillConfig> {
    // 使用tsx注册TypeScript支持
    const { register } = await import('tsx/esm/api')
    const unregister = register()

    try {
      // 动态导入配置文件
      const fileUrl = pathToFileURL(filePath).href
      const mod = await import(`${fileUrl}?t=${Date.now()}`)

      const configExport = mod.default || mod.config

      if (!configExport) {
        throw new ConfigLoadError(
          `配置文件必须导出default或config: ${filePath}`
        )
      }

      // 如果是函数，调用它
      if (typeof configExport === 'function') {
        const result = await configExport(env)
        return result
      }

      return configExport
    } finally {
      // 清理tsx注册
      await unregister()
    }
  }

  /**
   * 处理extends继承
   */
  private async processExtends(
    config: SkillConfig,
    configDir: string
  ): Promise<SkillConfig> {
    if (!config.extends) {
      return config
    }

    // 加载基础配置
    const baseConfigPath = resolve(configDir, config.extends)
    if (!existsSync(baseConfigPath)) {
      throw new ConfigLoadError(`继承的配置文件不存在: ${config.extends}`)
    }

    const baseConfig = await this.loadConfigFile(baseConfigPath, {
      mode: 'development'
    })

    // 递归处理基础配置的extends
    const resolvedBaseConfig = await this.processExtends(
      baseConfig,
      dirname(baseConfigPath)
    )

    // 合并配置
    return this.mergeConfig(resolvedBaseConfig, config)
  }

  /**
   * 合并配置
   */
  private mergeConfig(base: SkillConfig, override: SkillConfig): SkillConfig {
    return {
      ...base,
      ...override,
      // platforms 合并
      platforms: {
        ...base.platforms,
        ...override.platforms
      },
      // source 合并
      source: {
        ...base.source,
        ...override.source
      },
      // build 合并
      build: {
        ...base.build,
        ...override.build
      },
      // tags 拼接
      tags: [...(base.tags || []), ...(override.tags || [])],
      // 移除extends字段
      extends: undefined
    }
  }

  /**
   * 解析为最终配置
   */
  private async resolve(
    config: SkillConfig,
    configPath: string,
    env: ConfigEnv
  ): Promise<ResolvedConfig> {
    const configDir = dirname(configPath)

    // 应用环境特定配置
    const envConfig = config.environments?.[env.mode]
    if (envConfig) {
      if (envConfig.build) {
        config.build = { ...config.build, ...envConfig.build }
      }
      if (envConfig.platforms) {
        config.platforms = { ...config.platforms, ...envConfig.platforms }
      }
    }

    // 应用默认值
    const resolved: ResolvedConfig = {
      ...config,
      configPath,
      root: configDir,
      env: env.mode,
      build: {
        clean: config.build?.clean ?? DEFAULT_CONFIG.build!.clean!,
        sourcemap: config.build?.sourcemap ?? DEFAULT_CONFIG.build!.sourcemap!,
        minify: config.build?.minify ?? DEFAULT_CONFIG.build!.minify!,
        watch: config.build?.watch ?? DEFAULT_CONFIG.build!.watch!
      },
      source: {
        entry: config.source.entry,
        templates: config.source.templates ?? [],
        scripts: config.source.scripts ?? [],
        resources: config.source.resources ?? []
      }
    }

    return resolved
  }
}

/**
 * defineConfig辅助函数
 * 提供类型提示和IDE支持
 */
export function defineConfig(config: UserConfig): UserConfig {
  return config
}
