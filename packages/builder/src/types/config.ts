/**
 * Configuration types for USK Builder
 */

/**
 * 平台类型
 */
export type Platform = 'claude' | 'codex'

/**
 * 压缩策略
 */
export type CompressionStrategy = 'conservative' | 'balanced' | 'aggressive'

/**
 * 描述配置
 * 支持两种方式：
 * 1. 字符串 - 所有平台共享
 * 2. 对象 - 平台特定描述
 */
export type DescriptionConfig =
  | string
  | {
      common: string
      claude?: string
      codex?: string
      [platform: string]: string | undefined
    }

/**
 * 平台配置
 */
export interface PlatformConfig {
  /**
   * 是否启用该平台
   */
  enabled: boolean

  /**
   * 输出目录
   */
  output: string

  /**
   * 压缩策略（仅Codex平台需要）
   * @default 'balanced'
   */
  compressionStrategy?: CompressionStrategy

  /**
   * 继承其他平台配置
   */
  extends?: string
}

/**
 * 平台配置集合
 */
export interface PlatformsConfig {
  claude?: PlatformConfig
  codex?: PlatformConfig
  [platform: string]: PlatformConfig | undefined
}

/**
 * 源文件配置
 */
export interface SourceConfig {
  /**
   * 主入口文件（模板文件）
   * @default 'src/SKILL.md'
   */
  entry: string

  /**
   * 模板文件路径模式
   */
  templates?: string | string[]

  /**
   * 脚本文件路径模式
   */
  scripts?: string | string[]

  /**
   * 资源文件路径模式
   */
  resources?: string | string[]
}

/**
 * 构建配置
 */
export interface BuildConfig {
  /**
   * 构建前清理输出目录
   * @default true
   */
  clean?: boolean

  /**
   * 生成source map
   * @default false
   */
  sourcemap?: boolean

  /**
   * 压缩输出
   * @default false
   */
  minify?: boolean

  /**
   * 监听模式
   * @default false
   */
  watch?: boolean
}

/**
 * 环境特定配置
 */
export interface EnvironmentConfig {
  build?: Partial<BuildConfig>
  platforms?: Partial<PlatformsConfig>
}

/**
 * Skill配置
 */
export interface SkillConfig {
  /**
   * Skill名称
   */
  name: string

  /**
   * 版本号
   */
  version: string

  /**
   * 作者
   */
  author?: string

  /**
   * 描述
   * 支持字符串或平台特定对象
   */
  description: DescriptionConfig

  /**
   * 标签
   */
  tags?: string[]

  /**
   * 平台配置
   */
  platforms: PlatformsConfig

  /**
   * 源文件配置
   */
  source: SourceConfig

  /**
   * 构建配置
   */
  build?: BuildConfig

  /**
   * 继承基础配置
   */
  extends?: string

  /**
   * 环境特定配置
   */
  environments?: {
    development?: EnvironmentConfig
    production?: EnvironmentConfig
    [env: string]: EnvironmentConfig | undefined
  }
}

/**
 * 已解析的配置（处理了继承和默认值）
 */
export interface ResolvedConfig extends Omit<
  SkillConfig,
  'extends' | 'environments'
> {
  /**
   * 配置文件路径
   */
  configPath: string

  /**
   * 项目根目录
   */
  root: string

  /**
   * 当前环境
   */
  env: string

  /**
   * 已合并的构建配置
   */
  build: Required<BuildConfig>

  /**
   * 已合并的源文件配置
   */
  source: Required<SourceConfig>
}

/**
 * 配置环境
 */
export interface ConfigEnv {
  /**
   * 当前模式
   */
  mode: string

  /**
   * 命令行参数
   */
  command?: 'build' | 'watch' | 'dev'
}

/**
 * defineConfig辅助函数的参数类型
 */
export type UserConfig =
  | SkillConfig
  | ((env: ConfigEnv) => SkillConfig | Promise<SkillConfig>)
