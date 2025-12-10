/**
 * Zod schema for configuration validation
 */

import { z } from 'zod'

/**
 * 平台枚举
 */
export const PlatformSchema = z.enum(['claude', 'codex'])

/**
 * 压缩策略枚举
 */
export const CompressionStrategySchema = z.enum([
  'conservative',
  'balanced',
  'aggressive'
])

/**
 * 描述配置schema
 */
export const DescriptionConfigSchema = z.union([
  z.string().min(1, '描述不能为空'),
  z
    .object({
      common: z.string().min(1, '公共描述不能为空'),
      claude: z.string().optional(),
      codex: z.string().optional()
    })
    .catchall(z.string())
])

/**
 * 平台配置schema
 */
export const PlatformConfigSchema = z.object({
  enabled: z.boolean(),
  output: z.string().min(1, '输出目录不能为空'),
  compressionStrategy: CompressionStrategySchema.optional(),
  extends: z.string().optional()
})

/**
 * 平台配置集合schema
 */
export const PlatformsConfigSchema = z
  .object({
    claude: PlatformConfigSchema.optional(),
    codex: PlatformConfigSchema.optional()
  })
  .catchall(PlatformConfigSchema)
  .refine(
    data => {
      // 至少启用一个平台
      const platforms = Object.values(data)
      return platforms.some(config => config?.enabled)
    },
    {
      message: '至少需要启用一个平台'
    }
  )

/**
 * 源文件配置schema
 */
export const SourceConfigSchema = z.object({
  entry: z.string().min(1, '入口文件不能为空'),
  templates: z.union([z.string(), z.array(z.string())]).optional(),
  scripts: z.union([z.string(), z.array(z.string())]).optional(),
  resources: z.union([z.string(), z.array(z.string())]).optional()
})

/**
 * 构建配置schema
 */
export const BuildConfigSchema = z.object({
  clean: z.boolean().optional(),
  sourcemap: z.boolean().optional(),
  minify: z.boolean().optional(),
  watch: z.boolean().optional()
})

/**
 * 环境配置schema
 */
export const EnvironmentConfigSchema = z.object({
  build: BuildConfigSchema.partial().optional(),
  platforms: z.record(PlatformConfigSchema.partial()).optional()
})

/**
 * Skill配置schema
 */
export const SkillConfigSchema = z.object({
  name: z
    .string()
    .min(1, 'Skill名称不能为空')
    .regex(/^[a-z0-9-]+$/, 'Skill名称只能包含小写字母、数字和连字符'),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, '版本号格式必须为 x.y.z'),
  author: z.string().optional(),
  description: DescriptionConfigSchema,
  tags: z.array(z.string()).optional(),
  platforms: PlatformsConfigSchema,
  source: SourceConfigSchema,
  build: BuildConfigSchema.optional(),
  extends: z.string().optional(),
  environments: z
    .object({
      development: EnvironmentConfigSchema.optional(),
      production: EnvironmentConfigSchema.optional()
    })
    .catchall(EnvironmentConfigSchema)
    .optional()
})

/**
 * 配置环境schema
 */
export const ConfigEnvSchema = z.object({
  mode: z.string(),
  command: z.enum(['build', 'watch', 'dev']).optional()
})

/**
 * 验证配置
 */
export function validateConfig(
  config: unknown
): z.SafeParseReturnType<unknown, z.infer<typeof SkillConfigSchema>> {
  return SkillConfigSchema.safeParse(config)
}

/**
 * 配置验证错误
 */
export class ConfigValidationError extends Error {
  constructor(public errors: z.ZodIssue[]) {
    const errorMessages = errors
      .map(err => `  • ${err.path.join('.')}: ${err.message}`)
      .join('\n')

    super(`配置验证失败:\n${errorMessages}`)
    this.name = 'ConfigValidationError'
  }
}
