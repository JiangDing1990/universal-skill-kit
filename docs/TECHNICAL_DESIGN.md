# Universal Skill Kit - 技术方案文档

## 项目概述

Universal Skill Kit 是一个跨平台的 AI CLI Skill 开发工具集，旨在解决 Claude Code 和 Codex 两大 AI CLI 平台的 Skill 开发、转换和管理问题。

### 核心目标

1. **一键转换**：快速将 Claude Skills 转换为 Codex Skills，反之亦然
2. **统一开发**：使用单一配置文件开发适配多平台的 Skill
3. **智能优化**：自动压缩描述、优化结构、验证语法
4. **易于扩展**：模块化架构，支持未来更多 AI CLI 平台

## 架构设计

### 整体架构

```
universal-skill-kit/
├── packages/
│   ├── core/                    # 核心转换引擎
│   │   ├── converter/           # 平台转换器
│   │   ├── parser/              # Skill 解析器
│   │   ├── validator/           # 语法验证器
│   │   └── optimizer/           # 智能优化器
│   ├── cli/                     # 命令行工具
│   │   ├── commands/            # CLI 命令实现
│   │   ├── prompts/             # 交互式提示
│   │   └── reporters/           # 结果输出
│   ├── builder/                 # 统一构建工具
│   │   ├── template-engine/    # 模板引擎
│   │   ├── config-loader/       # 配置加载器
│   │   └── bundler/             # 打包器
│   └── utils/                   # 通用工具
│       ├── description-compressor/  # 描述压缩
│       ├── path-mapper/            # 路径映射
│       └── yaml-processor/         # YAML 处理
├── templates/                   # Skill 模板
│   ├── claude/                  # Claude 模板
│   ├── codex/                   # Codex 模板
│   └── universal/               # 通用模板
├── examples/                    # 示例项目
│   ├── simple-skill/            # 简单示例
│   ├── complex-skill/           # 复杂示例
│   └── migration/               # 迁移示例
└── docs/                        # 文档
    ├── en/                      # 英文文档
    └── zh-CN/                   # 中文文档
```

## 核心模块设计

### 1. Converter（转换器）

负责在不同平台格式之间转换 Skill。

#### 接口设计

```typescript
interface SkillConverter {
  // 转换 Skill 到目标平台
  convert(source: SkillDefinition, target: Platform): SkillDefinition

  // 验证转换结果
  validate(skill: SkillDefinition, platform: Platform): ValidationResult
}

interface SkillDefinition {
  metadata: {
    name: string
    version: string
    description: string
    author?: string
    tags?: string[]
  }
  body: string
  resources: {
    templates?: string[]
    references?: string[]
    scripts?: string[]
  }
}

type Platform = 'claude' | 'codex'

interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}
```

#### 实现示例

```typescript
class ClaudeToCodexConverter implements SkillConverter {
  convert(source: SkillDefinition, target: Platform): SkillDefinition {
    if (target !== 'codex') {
      throw new Error('This converter only supports Codex target')
    }

    return {
      metadata: {
        ...source.metadata,
        description: this.compressDescription(source.metadata.description)
      },
      body: this.optimizeBody(source.body),
      resources: this.mapPaths(source.resources, '.claude', '.codex')
    }
  }

  private compressDescription(desc: string): string {
    // 智能压缩描述到 500 字符以内
    if (desc.length <= 500) return desc

    const compressor = new DescriptionCompressor()
    return compressor.compress(desc, {
      maxLength: 500,
      preserveKeywords: true,
      removeExamples: true
    })
  }

  private optimizeBody(body: string): string {
    // 优化 body 内容
    const optimizer = new BodyOptimizer()
    return optimizer.optimize(body, {
      platform: 'codex',
      minifyWhitespace: false,
      removeComments: false,
      extractSections: ['核心使用指南', '常见场景', '技术栈限制']
    })
  }

  private mapPaths(resources: any, from: string, to: string): any {
    const mapper = new PathMapper()
    return mapper.replace(resources, from, to)
  }
}
```

### 2. Template Engine（模板引擎）

支持条件编译，实现一套代码适配多平台。

#### 语法设计

```markdown
<!-- @if platform=claude -->

这段内容只在 Claude 平台显示

<!-- @endif -->

<!-- @if platform=codex -->

这段内容只在 Codex 平台显示

<!-- @endif -->

<!-- @if platform=claude,codex -->

这段内容在两个平台都显示

<!-- @endif -->

<!-- @unless platform=claude -->

这段内容在非 Claude 平台显示

<!-- @endunless -->
```

#### 实现示例

```typescript
class TemplateEngine {
  private platform: Platform
  private directives: Map<string, DirectiveHandler>

  constructor(platform: Platform) {
    this.platform = platform
    this.directives = new Map([
      ['if', this.handleIf.bind(this)],
      ['unless', this.handleUnless.bind(this)],
      ['include', this.handleInclude.bind(this)]
    ])
  }

  render(template: string, context: Record<string, any>): string {
    let result = template

    // 处理条件指令
    result = this.processDirectives(result, context)

    // 替换变量
    result = this.replaceVariables(result, context)

    return result
  }

  private processDirectives(
    content: string,
    context: Record<string, any>
  ): string {
    const directivePattern =
      /<!-- @(\w+)\s+(.*?)\s*-->([\s\S]*?)<!-- @end\1 -->/g

    return content.replace(directivePattern, (match, directive, args, body) => {
      const handler = this.directives.get(directive)
      if (!handler) return match

      return handler(args, body, context)
    })
  }

  private handleIf(
    args: string,
    body: string,
    context: Record<string, any>
  ): string {
    const condition = this.parseCondition(args)

    if (this.evaluateCondition(condition, context)) {
      return body
    }

    return ''
  }

  private parseCondition(args: string): Condition {
    // 解析 platform=claude,codex 这样的条件
    const match = args.match(/platform=(.+)/)
    if (!match) throw new Error(`Invalid condition: ${args}`)

    return {
      type: 'platform',
      values: match[1].split(',').map(v => v.trim())
    }
  }

  private evaluateCondition(
    condition: Condition,
    context: Record<string, any>
  ): boolean {
    if (condition.type === 'platform') {
      return condition.values.includes(this.platform)
    }
    return false
  }

  private replaceVariables(
    content: string,
    context: Record<string, any>
  ): string {
    return content.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
      return context[varName] || match
    })
  }
}

interface Condition {
  type: string
  values: string[]
}

interface DirectiveHandler {
  (args: string, body: string, context: Record<string, any>): string
}
```

### 3. Description Compressor（描述压缩器）

智能压缩 Skill 描述，保留关键信息。

#### 实现示例

````typescript
class DescriptionCompressor {
  private strategies: CompressionStrategy[]

  constructor() {
    this.strategies = [
      new RemoveExamplesStrategy(),
      new SimplifySyntaxStrategy(),
      new ExtractKeywordsStrategy(),
      new AbbreviateStrategy()
    ]
  }

  compress(text: string, options: CompressionOptions): string {
    let result = text

    // 应用所有压缩策略
    for (const strategy of this.strategies) {
      if (result.length <= options.maxLength) break
      result = strategy.apply(result, options)
    }

    // 如果仍然超长，使用截断策略
    if (result.length > options.maxLength) {
      result = this.truncateIntelligently(result, options.maxLength)
    }

    return result
  }

  private truncateIntelligently(text: string, maxLength: number): string {
    // 保留句子完整性
    if (text.length <= maxLength) return text

    const sentences = text.match(/[^。！？.!?]+[。！？.!?]/g) || []
    let result = ''

    for (const sentence of sentences) {
      if ((result + sentence).length > maxLength - 3) break
      result += sentence
    }

    return result.trim() + '...'
  }
}

interface CompressionOptions {
  maxLength: number
  preserveKeywords: boolean
  removeExamples: boolean
}

interface CompressionStrategy {
  apply(text: string, options: CompressionOptions): string
}

class RemoveExamplesStrategy implements CompressionStrategy {
  apply(text: string, options: CompressionOptions): string {
    if (!options.removeExamples) return text

    // 移除示例代码块
    return text
      .replace(/```[\s\S]*?```/g, '')
      .replace(/例如[:：].*?[。.]/g, '')
      .replace(/\(如.*?\)/g, '')
  }
}

class SimplifySyntaxStrategy implements CompressionStrategy {
  apply(text: string, options: CompressionOptions): string {
    return text
      .replace(/，/g, '、') // 顿号替换逗号
      .replace(/；/g, '，') // 逗号替换分号
      .replace(/\s+/g, ' ') // 压缩空格
      .replace(/[（(].*?[)）]/g, '') // 移除括号内容
  }
}

class ExtractKeywordsStrategy implements CompressionStrategy {
  apply(text: string, options: CompressionOptions): string {
    if (!options.preserveKeywords) return text

    // 提取并保留技术关键词
    const keywords = this.extractTechKeywords(text)
    const summary = this.summarize(text)

    return `${summary}。关键技术：${keywords.join('、')}`
  }

  private extractTechKeywords(text: string): string[] {
    const techPatterns = [
      /React\s+[\d.]+/g,
      /TypeScript\s+[\d.]+/g,
      /DVA\s+[\d.]+/g,
      /@[\w-]+\/[\w-]+/g
    ]

    const keywords = new Set<string>()

    for (const pattern of techPatterns) {
      const matches = text.match(pattern)
      if (matches) {
        matches.forEach(m => keywords.add(m))
      }
    }

    return Array.from(keywords)
  }

  private summarize(text: string): string {
    // 提取第一句话作为摘要
    const firstSentence = text.match(/^[^。！？.!?]+[。！？.!?]/)
    return firstSentence ? firstSentence[0] : text.slice(0, 50)
  }
}
````

### 4. Config Loader（配置加载器）

统一配置文件格式，支持多平台构建。

#### skill.config.json 结构

```json
{
  "name": "my-skill",
  "version": "1.0.0",
  "author": "Your Name",
  "platforms": {
    "claude": {
      "enabled": true,
      "output": ".claude/skills"
    },
    "codex": {
      "enabled": true,
      "output": ".codex/skills"
    }
  },
  "description": {
    "full": "完整的技能描述，支持多行，包含详细信息和示例...",
    "short": "简短描述（用于 Codex）",
    "keywords": ["React", "TypeScript", "DVA"]
  },
  "body": {
    "source": "SKILL.md",
    "sections": {
      "claude": ["all"],
      "codex": ["核心使用指南", "常见场景", "技术栈限制"]
    }
  },
  "resources": {
    "templates": ["assets/templates/**/*.tsx", "assets/templates/**/*.ts"],
    "references": ["references/**/*.md"],
    "scripts": ["scripts/**/*.sh", "scripts/**/*.js"]
  },
  "build": {
    "validate": true,
    "minify": false,
    "sourcemap": false
  }
}
```

#### 实现示例

```typescript
class ConfigLoader {
  async load(configPath: string): Promise<SkillConfig> {
    const rawConfig = await this.readConfig(configPath)
    const validatedConfig = this.validate(rawConfig)
    const resolvedConfig = this.resolveReferences(validatedConfig, configPath)

    return resolvedConfig
  }

  private async readConfig(path: string): Promise<any> {
    const content = await fs.readFile(path, 'utf-8')
    return JSON.parse(content)
  }

  private validate(config: any): SkillConfig {
    const schema = {
      type: 'object',
      required: ['name', 'version', 'platforms'],
      properties: {
        name: { type: 'string', pattern: '^[a-z0-9-]+$' },
        version: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+$' },
        platforms: {
          type: 'object',
          properties: {
            claude: { type: 'object' },
            codex: { type: 'object' }
          }
        }
      }
    }

    const validator = new JSONSchemaValidator()
    const result = validator.validate(config, schema)

    if (!result.valid) {
      throw new Error(`Invalid config: ${result.errors.join(', ')}`)
    }

    return config as SkillConfig
  }

  private resolveReferences(
    config: SkillConfig,
    basePath: string
  ): SkillConfig {
    const baseDir = path.dirname(basePath)

    return {
      ...config,
      body: {
        ...config.body,
        source: path.resolve(baseDir, config.body.source)
      },
      resources: {
        templates: this.resolveGlobs(config.resources.templates, baseDir),
        references: this.resolveGlobs(config.resources.references, baseDir),
        scripts: this.resolveGlobs(config.resources.scripts, baseDir)
      }
    }
  }

  private resolveGlobs(patterns: string[], baseDir: string): string[] {
    const files: string[] = []

    for (const pattern of patterns) {
      const absolutePattern = path.resolve(baseDir, pattern)
      const matches = glob.sync(absolutePattern)
      files.push(...matches)
    }

    return files
  }
}

interface SkillConfig {
  name: string
  version: string
  author?: string
  platforms: {
    claude?: PlatformConfig
    codex?: PlatformConfig
  }
  description: {
    full: string
    short?: string
    keywords?: string[]
  }
  body: {
    source: string
    sections: {
      claude?: string[]
      codex?: string[]
    }
  }
  resources: {
    templates: string[]
    references: string[]
    scripts: string[]
  }
  build: {
    validate: boolean
    minify: boolean
    sourcemap: boolean
  }
}

interface PlatformConfig {
  enabled: boolean
  output: string
}
```

### 5. Builder（构建器）

将配置和源文件构建为目标平台的 Skill。

#### 实现示例

```typescript
class SkillBuilder {
  private configLoader: ConfigLoader
  private templateEngine: TemplateEngine
  private converter: SkillConverter
  private validator: SkillValidator

  constructor() {
    this.configLoader = new ConfigLoader()
    this.validator = new SkillValidator()
  }

  async build(configPath: string, platform: Platform): Promise<BuildResult> {
    // 1. 加载配置
    const config = await this.configLoader.load(configPath)

    // 2. 检查平台是否启用
    const platformConfig = config.platforms[platform]
    if (!platformConfig?.enabled) {
      throw new Error(`Platform ${platform} is not enabled in config`)
    }

    // 3. 读取源文件
    const source = await this.readSource(config)

    // 4. 使用模板引擎渲染
    this.templateEngine = new TemplateEngine(platform)
    const rendered = this.templateEngine.render(source.body, {
      platform,
      version: config.version,
      name: config.name
    })

    // 5. 转换为目标平台格式
    this.converter = this.getConverter(platform)
    const converted = this.converter.convert(
      {
        metadata: {
          name: config.name,
          version: config.version,
          description:
            platform === 'codex'
              ? config.description.short || config.description.full
              : config.description.full,
          author: config.author,
          tags: config.description.keywords
        },
        body: rendered,
        resources: config.resources
      },
      platform
    )

    // 6. 验证结果
    if (config.build.validate) {
      const validation = this.validator.validate(converted, platform)
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
      }
    }

    // 7. 输出到目标目录
    const outputPath = await this.writeOutput(
      converted,
      platformConfig.output,
      config.name
    )

    return {
      success: true,
      platform,
      outputPath,
      metadata: converted.metadata
    }
  }

  private async readSource(config: SkillConfig): Promise<SkillDefinition> {
    const body = await fs.readFile(config.body.source, 'utf-8')

    return {
      metadata: {
        name: config.name,
        version: config.version,
        description: config.description.full,
        author: config.author,
        tags: config.description.keywords
      },
      body,
      resources: config.resources
    }
  }

  private getConverter(platform: Platform): SkillConverter {
    switch (platform) {
      case 'claude':
        return new CodexToClaudeConverter()
      case 'codex':
        return new ClaudeToCodexConverter()
      default:
        throw new Error(`Unsupported platform: ${platform}`)
    }
  }

  private async writeOutput(
    skill: SkillDefinition,
    outputDir: string,
    skillName: string
  ): Promise<string> {
    const skillDir = path.join(outputDir, skillName)
    await fs.mkdir(skillDir, { recursive: true })

    // 写入 SKILL.md
    const skillMd = this.generateSkillMd(skill)
    await fs.writeFile(path.join(skillDir, 'SKILL.md'), skillMd)

    // 复制资源文件
    await this.copyResources(skill.resources, skillDir)

    return skillDir
  }

  private generateSkillMd(skill: SkillDefinition): string {
    const metadata = [
      '---',
      `name: ${skill.metadata.name}`,
      `version: ${skill.metadata.version}`,
      `description: ${skill.metadata.description}`,
      skill.metadata.author ? `author: ${skill.metadata.author}` : '',
      skill.metadata.tags ? `tags: ${skill.metadata.tags.join(', ')}` : '',
      '---',
      '',
      skill.body
    ]

    return metadata.filter(Boolean).join('\n')
  }

  private async copyResources(
    resources: any,
    targetDir: string
  ): Promise<void> {
    const allFiles = [
      ...resources.templates,
      ...resources.references,
      ...resources.scripts
    ]

    for (const file of allFiles) {
      const relativePath = this.getRelativePath(file)
      const targetPath = path.join(targetDir, relativePath)

      await fs.mkdir(path.dirname(targetPath), { recursive: true })
      await fs.copyFile(file, targetPath)
    }
  }

  private getRelativePath(absolutePath: string): string {
    // 从绝对路径提取相对路径
    // 例如: /path/to/project/assets/templates/foo.tsx -> assets/templates/foo.tsx
    const segments = absolutePath.split(path.sep)
    const assetsIndex = segments.lastIndexOf('assets')
    const referencesIndex = segments.lastIndexOf('references')
    const scriptsIndex = segments.lastIndexOf('scripts')

    const startIndex = Math.max(assetsIndex, referencesIndex, scriptsIndex)

    return segments.slice(startIndex).join(path.sep)
  }
}

interface BuildResult {
  success: boolean
  platform: Platform
  outputPath: string
  metadata: any
}
```

## CLI 设计

### 命令结构

```bash
# 转换命令
usk convert <source> --to <platform> --output <dir>

# 构建命令
usk build --platform <platform> --config <config-file>

# 验证命令
usk validate <skill-dir> --platform <platform>

# 初始化命令
usk init <skill-name> --template <template-name>

# 批量转换命令
usk batch-convert <dir> --from claude --to codex
```

### CLI 实现示例

```typescript
import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'

class CLI {
  private program: Command

  constructor() {
    this.program = new Command()
    this.setupCommands()
  }

  private setupCommands(): void {
    this.program
      .name('usk')
      .description('Universal Skill Kit - AI CLI Skill 开发工具集')
      .version('1.0.0')

    // convert 命令
    this.program
      .command('convert')
      .description('转换 Skill 到目标平台')
      .argument('<source>', 'Skill 源目录')
      .option('-t, --to <platform>', '目标平台 (claude|codex)', 'codex')
      .option('-o, --output <dir>', '输出目录')
      .action(async (source, options) => {
        await this.handleConvert(source, options)
      })

    // build 命令
    this.program
      .command('build')
      .description('从配置文件构建 Skill')
      .option('-p, --platform <platform>', '目标平台 (claude|codex|all)', 'all')
      .option('-c, --config <file>', '配置文件路径', 'skill.config.json')
      .action(async options => {
        await this.handleBuild(options)
      })

    // validate 命令
    this.program
      .command('validate')
      .description('验证 Skill 格式和语法')
      .argument('<dir>', 'Skill 目录')
      .option('-p, --platform <platform>', '平台 (claude|codex)')
      .action(async (dir, options) => {
        await this.handleValidate(dir, options)
      })

    // init 命令
    this.program
      .command('init')
      .description('初始化新的 Skill 项目')
      .argument('<name>', 'Skill 名称')
      .option('-t, --template <name>', '模板名称', 'basic')
      .action(async (name, options) => {
        await this.handleInit(name, options)
      })

    // batch-convert 命令
    this.program
      .command('batch-convert')
      .description('批量转换目录下的所有 Skills')
      .argument('<dir>', '包含多个 Skills 的目录')
      .option('--from <platform>', '源平台', 'claude')
      .option('--to <platform>', '目标平台', 'codex')
      .action(async (dir, options) => {
        await this.handleBatchConvert(dir, options)
      })
  }

  private async handleConvert(source: string, options: any): Promise<void> {
    const spinner = ora('正在转换 Skill...').start()

    try {
      const converter = new SkillConverter()
      const result = await converter.convert(source, {
        targetPlatform: options.to,
        outputDir: options.output
      })

      spinner.succeed(chalk.green('转换完成!'))
      console.log(chalk.blue(`输出目录: ${result.outputPath}`))
      console.log(chalk.gray(`平台: ${result.platform}`))
      console.log(chalk.gray(`版本: ${result.metadata.version}`))
    } catch (error) {
      spinner.fail(chalk.red('转换失败'))
      console.error(chalk.red(error.message))
      process.exit(1)
    }
  }

  private async handleBuild(options: any): Promise<void> {
    const spinner = ora('正在构建 Skill...').start()

    try {
      const builder = new SkillBuilder()
      const platforms =
        options.platform === 'all' ? ['claude', 'codex'] : [options.platform]

      const results = []
      for (const platform of platforms) {
        const result = await builder.build(options.config, platform as Platform)
        results.push(result)
      }

      spinner.succeed(chalk.green('构建完成!'))

      for (const result of results) {
        console.log(chalk.blue(`\n${result.platform}:`))
        console.log(chalk.gray(`  输出: ${result.outputPath}`))
      }
    } catch (error) {
      spinner.fail(chalk.red('构建失败'))
      console.error(chalk.red(error.message))
      process.exit(1)
    }
  }

  private async handleValidate(dir: string, options: any): Promise<void> {
    const spinner = ora('正在验证 Skill...').start()

    try {
      const validator = new SkillValidator()
      const result = await validator.validate(dir, options.platform)

      if (result.valid) {
        spinner.succeed(chalk.green('验证通过!'))
      } else {
        spinner.fail(chalk.red('验证失败'))

        if (result.errors.length > 0) {
          console.log(chalk.red('\n错误:'))
          result.errors.forEach(err => console.log(chalk.red(`  - ${err}`)))
        }

        if (result.warnings.length > 0) {
          console.log(chalk.yellow('\n警告:'))
          result.warnings.forEach(warn =>
            console.log(chalk.yellow(`  - ${warn}`))
          )
        }

        process.exit(1)
      }
    } catch (error) {
      spinner.fail(chalk.red('验证失败'))
      console.error(chalk.red(error.message))
      process.exit(1)
    }
  }

  private async handleInit(name: string, options: any): Promise<void> {
    const spinner = ora('正在初始化 Skill...').start()

    try {
      const initializer = new SkillInitializer()
      const result = await initializer.init(name, {
        template: options.template
      })

      spinner.succeed(chalk.green('初始化完成!'))
      console.log(chalk.blue(`\n项目已创建: ${result.path}`))
      console.log(chalk.gray('\n下一步:'))
      console.log(chalk.gray(`  cd ${name}`))
      console.log(chalk.gray(`  编辑 SKILL.md 和 skill.config.json`))
      console.log(chalk.gray(`  usk build --platform all`))
    } catch (error) {
      spinner.fail(chalk.red('初始化失败'))
      console.error(chalk.red(error.message))
      process.exit(1)
    }
  }

  private async handleBatchConvert(dir: string, options: any): Promise<void> {
    const spinner = ora('正在扫描目录...').start()

    try {
      const batchConverter = new BatchConverter()
      const skills = await batchConverter.findSkills(dir, options.from)

      spinner.text = `发现 ${skills.length} 个 Skills，开始转换...`

      const results = await batchConverter.convertAll(skills, {
        from: options.from,
        to: options.to
      })

      spinner.succeed(chalk.green('批量转换完成!'))

      console.log(chalk.blue(`\n成功: ${results.succeeded.length}`))
      console.log(chalk.red(`失败: ${results.failed.length}`))

      if (results.failed.length > 0) {
        console.log(chalk.red('\n失败的 Skills:'))
        results.failed.forEach(fail => {
          console.log(chalk.red(`  - ${fail.name}: ${fail.error}`))
        })
      }
    } catch (error) {
      spinner.fail(chalk.red('批量转换失败'))
      console.error(chalk.red(error.message))
      process.exit(1)
    }
  }

  run(): void {
    this.program.parse()
  }
}

// 启动 CLI
const cli = new CLI()
cli.run()
```

## 技术选型

### 开发语言和框架

- **语言**: TypeScript 5.x
- **运行时**: Node.js 18+
- **构建工具**: tsup (快速 TypeScript 打包)
- **CLI 框架**: Commander.js
- **测试框架**: Vitest
- **代码规范**: ESLint + Prettier

### 核心依赖

```json
{
  "dependencies": {
    "commander": "^11.0.0",
    "chalk": "^5.3.0",
    "ora": "^7.0.1",
    "glob": "^10.3.10",
    "yaml": "^2.3.4",
    "gray-matter": "^4.0.3",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "tsup": "^8.0.0",
    "vitest": "^1.0.0",
    "@types/node": "^20.10.0"
  }
}
```

## 使用场景

### 场景 1: 快速转换现有 Skill

```bash
# 将 Claude Skill 转换为 Codex
usk convert ~/.claude/skills/my-skill --to codex --output ~/.codex/skills

# 批量转换所有 Claude Skills
usk batch-convert ~/.claude/skills --from claude --to codex
```

### 场景 2: 开发跨平台 Skill

```bash
# 1. 初始化项目
usk init my-awesome-skill --template universal

# 2. 编辑配置和内容
cd my-awesome-skill
# 编辑 skill.config.json 和 SKILL.md

# 3. 构建所有平台
usk build --platform all

# 4. 验证输出
usk validate .claude/skills/my-awesome-skill --platform claude
usk validate .codex/skills/my-awesome-skill --platform codex
```

### 场景 3: 使用模板引擎

SKILL.md 内容:

```markdown
---
name: my-skill
version: 1.0.0
description: { { description } }
---

# {{name}}

<!-- @if platform=claude -->

这是 Claude 专属内容，包含详细的 8000 字文档

<!-- @endif -->

<!-- @if platform=codex -->

这是 Codex 优化后的精简版本（500 字）

<!-- @endif -->

<!-- @if platform=claude,codex -->

这部分内容在两个平台都显示

<!-- @endif -->
```

skill.config.json:

```json
{
  "name": "my-skill",
  "version": "1.0.0",
  "platforms": {
    "claude": { "enabled": true, "output": ".claude/skills" },
    "codex": { "enabled": true, "output": ".codex/skills" }
  },
  "description": {
    "full": "完整描述用于 Claude",
    "short": "精简描述用于 Codex（< 500 字符）"
  }
}
```

## 质量保证

### 自动化测试

```typescript
// 测试示例
describe('SkillConverter', () => {
  it('should convert Claude Skill to Codex', async () => {
    const converter = new ClaudeToCodexConverter()
    const source = await loadTestSkill('claude-sample')

    const result = converter.convert(source, 'codex')

    expect(result.metadata.description.length).toBeLessThanOrEqual(500)
    expect(result.body).toContain('核心使用指南')
    expect(result.resources.templates[0]).toContain('.codex')
  })

  it('should preserve essential information', async () => {
    const converter = new ClaudeToCodexConverter()
    const source = await loadTestSkill('complex-skill')

    const result = converter.convert(source, 'codex')

    // 验证关键信息未丢失
    expect(result.metadata.description).toContain('React 16.14')
    expect(result.metadata.description).toContain('DVA 2.x')
    expect(result.body).toContain('useModalFactory')
  })
})
```

### 持续集成

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build

  integration-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:integration
      - name: Test conversion
        run: |
          npm run build
          ./bin/usk convert examples/claude-skill --to codex
          ./bin/usk validate examples/codex-skill --platform codex
```

## 未来扩展

### 支持更多平台

```typescript
// 预留扩展接口
type Platform = 'claude' | 'codex' | 'cursor' | 'windsurf' | string

interface PlatformAdapter {
  name: string
  validate(skill: SkillDefinition): ValidationResult
  transform(skill: SkillDefinition): SkillDefinition
}

class PlatformRegistry {
  private adapters = new Map<Platform, PlatformAdapter>()

  register(platform: Platform, adapter: PlatformAdapter): void {
    this.adapters.set(platform, adapter)
  }

  get(platform: Platform): PlatformAdapter {
    const adapter = this.adapters.get(platform)
    if (!adapter) {
      throw new Error(`Unknown platform: ${platform}`)
    }
    return adapter
  }
}
```

### 插件系统

```typescript
interface Plugin {
  name: string
  version: string
  hooks: {
    beforeConvert?: (skill: SkillDefinition) => SkillDefinition
    afterConvert?: (skill: SkillDefinition) => SkillDefinition
    beforeBuild?: (config: SkillConfig) => SkillConfig
    afterBuild?: (result: BuildResult) => BuildResult
  }
}

class PluginManager {
  private plugins: Plugin[] = []

  use(plugin: Plugin): void {
    this.plugins.push(plugin)
  }

  async runHook<T>(hookName: string, data: T): Promise<T> {
    let result = data

    for (const plugin of this.plugins) {
      const hook = plugin.hooks[hookName]
      if (hook) {
        result = await hook(result)
      }
    }

    return result
  }
}
```

## 性能优化

### 并行处理

```typescript
class BatchConverter {
  async convertAll(
    skills: string[],
    options: ConvertOptions
  ): Promise<BatchResult> {
    const concurrency = 5 // 并发数
    const chunks = this.chunk(skills, concurrency)

    const results = []
    for (const chunk of chunks) {
      const promises = chunk.map(skill => this.convertOne(skill, options))
      const chunkResults = await Promise.allSettled(promises)
      results.push(...chunkResults)
    }

    return this.aggregateResults(results)
  }

  private chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }
}
```

### 缓存机制

```typescript
class CachedConverter {
  private cache = new Map<string, SkillDefinition>()

  async convert(source: string, target: Platform): Promise<SkillDefinition> {
    const cacheKey = `${source}:${target}`

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    const result = await this.doConvert(source, target)
    this.cache.set(cacheKey, result)

    return result
  }

  clearCache(): void {
    this.cache.clear()
  }
}
```

## 扩展模块设计

### 6. Skill Analyzer（智能分析器）

负责分析 Skill 的复杂度和质量，为转换提供建议。

#### 接口设计

```typescript
interface SkillAnalyzer {
  analyze(skill: SkillDefinition): Promise<AnalysisReport>
  assessQuality(skill: SkillDefinition): QualityScore
  suggestOptimizations(report: AnalysisReport): Suggestion[]
}

interface AnalysisReport {
  complexity: 'high' | 'medium' | 'low'
  descriptionLength: number
  hasCodeExamples: boolean
  technicalKeywords: string[]
  recommendedStrategy: 'aggressive' | 'balanced' | 'conservative'
  estimatedQuality: number // 0-100
  warnings: string[]
  suggestions: Suggestion[]
}

interface QualityScore {
  overall: number // 0-100
  dimensions: {
    description: number
    structure: number
    examples: number
    documentation: number
    crossPlatform: number
  }
  ranking: string // 'Top 10%', 'Top 25%', etc.
  improvements: Improvement[]
}

interface Suggestion {
  type: 'warning' | 'info' | 'optimization'
  message: string
  fix?: AutoFixFunction
}
```

#### 实现示例

````typescript
class SkillAnalyzer implements SkillAnalyzer {
  async analyze(skill: SkillDefinition): Promise<AnalysisReport> {
    const complexity = this.assessComplexity(skill)
    const keywords = this.extractKeywords(skill)
    const strategy = this.recommendStrategy(skill, complexity)

    return {
      complexity,
      descriptionLength: skill.metadata.description.length,
      hasCodeExamples: this.detectCodeExamples(skill.body),
      technicalKeywords: keywords,
      recommendedStrategy: strategy,
      estimatedQuality: await this.estimateQuality(skill),
      warnings: this.generateWarnings(skill),
      suggestions: this.generateSuggestions(skill)
    }
  }

  assessQuality(skill: SkillDefinition): QualityScore {
    const scores = {
      description: this.scoreDescription(skill.metadata.description),
      structure: this.scoreStructure(skill.body),
      examples: this.scoreExamples(skill.body),
      documentation: this.scoreDocumentation(skill.body),
      crossPlatform: this.scoreCrossPlatform(skill)
    }

    const overall = Object.values(scores).reduce((a, b) => a + b) / 5

    return {
      overall,
      dimensions: scores,
      ranking: this.calculateRanking(overall),
      improvements: this.suggestImprovements(scores)
    }
  }

  private assessComplexity(skill: SkillDefinition): 'high' | 'medium' | 'low' {
    const factors = {
      descriptionLength: skill.metadata.description.length,
      bodyLength: skill.body.length,
      codeBlocks: (skill.body.match(/```/g) || []).length / 2,
      sections: (skill.body.match(/^#{1,3}\s/gm) || []).length,
      resources: Object.values(skill.resources).flat().length
    }

    const score =
      factors.descriptionLength / 100 +
      factors.bodyLength / 1000 +
      factors.codeBlocks * 5 +
      factors.sections * 2 +
      factors.resources * 3

    if (score > 100) return 'high'
    if (score > 50) return 'medium'
    return 'low'
  }

  private recommendStrategy(
    skill: SkillDefinition,
    complexity: string
  ): 'aggressive' | 'balanced' | 'conservative' {
    if (complexity === 'high' && skill.metadata.description.length > 800) {
      return 'aggressive'
    }
    if (complexity === 'low' && skill.metadata.description.length < 600) {
      return 'conservative'
    }
    return 'balanced'
  }
}
````

### 7. Conversion History（转换历史）

负责记录和管理转换历史，支持回滚和对比。

#### 接口设计

```typescript
interface ConversionHistory {
  record(conversion: Conversion): Promise<string>
  list(filters?: HistoryFilters): Promise<Conversion[]>
  get(id: string): Promise<Conversion>
  rollback(id: string): Promise<void>
  diff(id1: string, id2: string): Promise<ConversionDiff>
  export(id: string, format: 'json' | 'markdown'): Promise<string>
}

interface Conversion {
  id: string
  timestamp: Date
  source: {
    path: string
    platform: Platform
    hash: string
  }
  target: {
    path: string
    platform: Platform
    hash: string
  }
  strategy: CompressionOptions
  result: ConversionResult
  metadata: {
    duration: number
    success: boolean
    quality: number
  }
}

interface ConversionDiff {
  descriptionDiff: TextDiff
  bodyDiff: TextDiff
  metadataDiff: ObjectDiff
  statistics: {
    descriptionCompressionRate: number
    bodyChanges: number
    preservedKeywords: string[]
    lostInformation: string[]
  }
}
```

#### 实现示例

```typescript
class ConversionHistory implements ConversionHistory {
  private storage: HistoryStorage

  constructor(storagePath: string) {
    this.storage = new HistoryStorage(storagePath)
  }

  async record(conversion: Conversion): Promise<string> {
    const id = this.generateId(conversion)
    conversion.id = id

    await this.storage.save(id, conversion)
    await this.storage.createSnapshot(conversion.source.path)

    return id
  }

  async list(filters?: HistoryFilters): Promise<Conversion[]> {
    const all = await this.storage.listAll()

    if (!filters) return all

    return all.filter(conv => {
      if (filters.platform && conv.target.platform !== filters.platform) {
        return false
      }
      if (filters.since && conv.timestamp < filters.since) {
        return false
      }
      if (filters.successOnly && !conv.metadata.success) {
        return false
      }
      return true
    })
  }

  async rollback(id: string): Promise<void> {
    const conversion = await this.get(id)
    const snapshot = await this.storage.getSnapshot(conversion.source.path)

    // 恢复源文件
    await fs.writeFile(conversion.source.path, snapshot)

    // 删除目标文件
    await fs.unlink(conversion.target.path)

    logger.info(`Rolled back conversion ${id}`)
  }

  async diff(id1: string, id2: string): Promise<ConversionDiff> {
    const conv1 = await this.get(id1)
    const conv2 = await this.get(id2)

    const descriptionDiff = this.diffText(
      conv1.result.metadata.description,
      conv2.result.metadata.description
    )

    const bodyDiff = this.diffText(conv1.result.body, conv2.result.body)

    return {
      descriptionDiff,
      bodyDiff,
      metadataDiff: this.diffObject(
        conv1.result.metadata,
        conv2.result.metadata
      ),
      statistics: this.calculateDiffStats(conv1, conv2)
    }
  }

  private generateId(conversion: Conversion): string {
    const timestamp = Date.now()
    const hash = crypto
      .createHash('md5')
      .update(`${conversion.source.path}-${timestamp}`)
      .digest('hex')
      .slice(0, 8)
    return `conv-${hash}-${timestamp}`
  }
}
```

### 8. AI Optimizer（AI 辅助优化器）

使用 LLM 辅助优化 Skill 描述和内容。

#### 接口设计

```typescript
interface AIOptimizer {
  optimize(
    description: string,
    options: OptimizeOptions
  ): Promise<OptimizedResult>
  suggestImprovements(skill: SkillDefinition): Promise<Improvement[]>
  generateDescription(skill: SkillDefinition, length: number): Promise<string>
}

interface OptimizeOptions {
  maxLength: number
  preserveKeywords?: string[]
  targetPlatform: Platform
  style?: 'professional' | 'casual' | 'technical'
  llmProvider?: 'claude' | 'openai' | 'local'
}

interface OptimizedResult {
  original: string
  optimized: string
  changes: Change[]
  quality: number
  preservedKeywords: string[]
  suggestions: string[]
}
```

#### 实现示例

```typescript
class AIOptimizer implements AIOptimizer {
  private llmClient: LLMClient

  constructor(apiKey?: string) {
    this.llmClient = new LLMClient(apiKey)
  }

  async optimize(
    description: string,
    options: OptimizeOptions
  ): Promise<OptimizedResult> {
    if (!this.llmClient.isConfigured()) {
      throw new Error(
        'AI Optimizer requires API key. Set USK_AI_API_KEY environment variable.'
      )
    }

    const prompt = this.buildOptimizationPrompt(description, options)
    const response = await this.llmClient.complete(prompt)

    const optimized = this.extractOptimizedText(response)
    const changes = this.detectChanges(description, optimized)

    return {
      original: description,
      optimized,
      changes,
      quality: this.assessQuality(optimized, options),
      preservedKeywords: this.extractPreservedKeywords(description, optimized),
      suggestions: this.extractSuggestions(response)
    }
  }

  private buildOptimizationPrompt(
    description: string,
    options: OptimizeOptions
  ): string {
    return `
You are a technical writing expert specializing in AI CLI Skills documentation.

Task: Optimize the following Skill description to exactly ${options.maxLength} characters or less.

Original description:
${description}

Requirements:
1. Target length: ${options.maxLength} characters maximum
2. Target platform: ${options.targetPlatform}
3. Preserve ALL technical keywords and version numbers
4. Keep the core functionality clear
5. Remove redundant expressions and examples
6. Style: ${options.style || 'professional'}
${options.preserveKeywords ? `7. Must preserve: ${options.preserveKeywords.join(', ')}` : ''}

Please provide:
1. The optimized description (within character limit)
2. List of preserved keywords
3. Suggestions for further improvement

Format your response as JSON:
{
  "optimized": "optimized description here",
  "preserved": ["keyword1", "keyword2"],
  "suggestions": ["suggestion1", "suggestion2"]
}
    `.trim()
  }

  async suggestImprovements(skill: SkillDefinition): Promise<Improvement[]> {
    const prompt = `
Analyze this Skill and suggest improvements:

Name: ${skill.metadata.name}
Description: ${skill.metadata.description}
Body length: ${skill.body.length} characters

Provide 3-5 concrete suggestions for improvement.
    `

    const response = await this.llmClient.complete(prompt)
    return this.parseSuggestions(response)
  }
}
```

### 9. Interactive Optimizer（交互式优化器）

提供交互式的压缩和优化体验。

#### 接口设计

```typescript
interface InteractiveOptimizer {
  run(
    skill: SkillDefinition,
    options: InteractiveOptions
  ): Promise<SkillDefinition>
}

interface InteractiveOptions {
  targetPlatform: Platform
  autoSave?: boolean
  showDiff?: boolean
}
```

#### 实现示例

```typescript
import inquirer from 'inquirer'
import chalk from 'chalk'

class InteractiveOptimizer implements InteractiveOptimizer {
  private compressor: DescriptionCompressor
  private analyzer: SkillAnalyzer

  async run(
    skill: SkillDefinition,
    options: InteractiveOptions
  ): Promise<SkillDefinition> {
    console.log(chalk.blue('🎨 Interactive Skill Optimizer\n'))

    // 1. 分析当前 Skill
    const analysis = await this.analyzer.analyze(skill)
    this.displayAnalysis(analysis)

    // 2. 压缩描述
    const compressed = await this.compressWithFeedback(skill, options)

    // 3. 优化 Body
    const optimized = await this.optimizeBodyInteractive(compressed, options)

    // 4. 最终确认
    const confirmed = await this.confirmChanges(skill, optimized)

    if (confirmed && options.autoSave) {
      await this.saveSkill(optimized)
    }

    return optimized
  }

  private async compressWithFeedback(
    skill: SkillDefinition,
    options: InteractiveOptions
  ): Promise<SkillDefinition> {
    const original = skill.metadata.description

    // 尝试多种策略
    const strategies = ['conservative', 'balanced', 'aggressive'] as const
    const results = await Promise.all(
      strategies.map(async strategy => ({
        strategy,
        result: this.compressor.compress(original, {
          maxLength: 500,
          preserveKeywords: true,
          strategy
        })
      }))
    )

    // 展示选项
    console.log(chalk.yellow('\n📊 Compression Options:\n'))
    results.forEach(({ strategy, result }, i) => {
      console.log(chalk.cyan(`${i + 1}. ${strategy} (${result.length} chars)`))
      console.log(chalk.gray(`   ${result.substring(0, 100)}...`))
      console.log()
    })

    const { choice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'choice',
        message: 'Select compression strategy:',
        choices: [
          ...results.map((r, i) => ({
            name: `${r.strategy} (${r.result.length} chars)`,
            value: i
          })),
          { name: 'Edit manually', value: -1 }
        ]
      }
    ])

    let finalDescription: string

    if (choice === -1) {
      // 手动编辑
      const { edited } = await inquirer.prompt([
        {
          type: 'editor',
          name: 'edited',
          message: 'Edit description:',
          default: results[1].result // balanced
        }
      ])
      finalDescription = edited
    } else {
      finalDescription = results[choice].result
    }

    return {
      ...skill,
      metadata: {
        ...skill.metadata,
        description: finalDescription
      }
    }
  }

  private displayAnalysis(analysis: AnalysisReport): void {
    console.log(chalk.yellow('📈 Analysis Report:\n'))
    console.log(`Complexity: ${chalk.cyan(analysis.complexity)}`)
    console.log(
      `Description Length: ${chalk.cyan(analysis.descriptionLength)} chars`
    )
    console.log(
      `Code Examples: ${chalk.cyan(analysis.hasCodeExamples ? 'Yes' : 'No')}`
    )
    console.log(
      `Estimated Quality: ${chalk.cyan(analysis.estimatedQuality)}/100`
    )
    console.log(
      `Recommended Strategy: ${chalk.cyan(analysis.recommendedStrategy)}`
    )

    if (analysis.warnings.length > 0) {
      console.log(chalk.red('\n⚠️  Warnings:'))
      analysis.warnings.forEach(w => console.log(chalk.red(`   - ${w}`)))
    }

    console.log()
  }
}
```

### 10. Quality Checker（质量检查器）

全面评估 Skill 质量并提供改进建议。

#### 接口设计

```typescript
interface QualityChecker {
  check(skill: SkillDefinition): Promise<QualityReport>
  benchmark(
    skill: SkillDefinition,
    community: SkillDefinition[]
  ): Promise<BenchmarkResult>
}

interface QualityReport {
  overall: QualityScore
  dimensions: {
    description: DimensionScore
    structure: DimensionScore
    examples: DimensionScore
    documentation: DimensionScore
    crossPlatform: DimensionScore
  }
  improvements: Improvement[]
  ranking?: string
}

interface DimensionScore {
  score: number // 0-100
  stars: number // 1-5
  status: 'excellent' | 'good' | 'fair' | 'poor'
  issues: Issue[]
  suggestions: string[]
}
```

#### 实现示例

```typescript
class QualityChecker implements QualityChecker {
  async check(skill: SkillDefinition): Promise<QualityReport> {
    const dimensions = {
      description: await this.checkDescription(skill),
      structure: await this.checkStructure(skill),
      examples: await this.checkExamples(skill),
      documentation: await this.checkDocumentation(skill),
      crossPlatform: await this.checkCrossPlatform(skill)
    }

    const overall = this.calculateOverall(dimensions)
    const improvements = this.generateImprovements(dimensions)

    return {
      overall,
      dimensions,
      improvements
    }
  }

  private async checkDescription(
    skill: SkillDefinition
  ): Promise<DimensionScore> {
    const desc = skill.metadata.description
    const issues: Issue[] = []
    const suggestions: string[] = []

    let score = 100

    // 检查长度
    if (desc.length < 100) {
      issues.push({
        type: 'warning',
        message: 'Description is too short (< 100 chars)'
      })
      suggestions.push('Add more details about the Skill purpose and usage')
      score -= 15
    }

    // 检查关键词
    const hasKeywords = /React|Vue|Angular|TypeScript|JavaScript|Python/.test(
      desc
    )
    if (!hasKeywords) {
      issues.push({
        type: 'info',
        message: 'No technical keywords detected'
      })
      suggestions.push('Include relevant technology stack keywords')
      score -= 10
    }

    // 检查使用场景
    const hasUsage = /when|use|for|适用于|用于/.test(desc)
    if (!hasUsage) {
      issues.push({
        type: 'warning',
        message: 'Missing usage scenario description'
      })
      suggestions.push('Describe when and how to use this Skill')
      score -= 10
    }

    return {
      score: Math.max(0, score),
      stars: this.scoreToStars(score),
      status: this.scoreToStatus(score),
      issues,
      suggestions
    }
  }

  private async checkStructure(
    skill: SkillDefinition
  ): Promise<DimensionScore> {
    const body = skill.body
    const issues: Issue[] = []
    const suggestions: string[] = []

    let score = 100

    // 检查章节结构
    const sections = body.match(/^#{1,3}\s+(.+)$/gm) || []
    if (sections.length < 3) {
      issues.push({
        type: 'warning',
        message: 'Too few sections (< 3)'
      })
      suggestions.push('Add more sections to organize content better')
      score -= 20
    }

    // 检查目录层次
    const hasH1 = /^#\s+/.test(body)
    const hasH2 = /^##\s+/.test(body)
    const hasH3 = /^###\s+/.test(body)

    if (!hasH1 || !hasH2) {
      issues.push({
        type: 'info',
        message: 'Missing proper heading hierarchy'
      })
      suggestions.push(
        'Use H1 for title, H2 for main sections, H3 for subsections'
      )
      score -= 10
    }

    return {
      score: Math.max(0, score),
      stars: this.scoreToStars(score),
      status: this.scoreToStatus(score),
      issues,
      suggestions
    }
  }

  async benchmark(
    skill: SkillDefinition,
    community: SkillDefinition[]
  ): Promise<BenchmarkResult> {
    const report = await this.check(skill)
    const communityScores = await Promise.all(
      community.map(s => this.check(s).then(r => r.overall.score))
    )

    const sortedScores = communityScores.sort((a, b) => b - a)
    const rank = sortedScores.findIndex(s => s <= report.overall.score) + 1
    const percentile = (1 - rank / sortedScores.length) * 100

    return {
      skill: report,
      ranking: `Top ${Math.ceil(percentile)}%`,
      betterThan: Math.floor(percentile),
      totalSkills: community.length
    }
  }

  private scoreToStars(score: number): number {
    if (score >= 90) return 5
    if (score >= 80) return 4
    if (score >= 70) return 3
    if (score >= 60) return 2
    return 1
  }

  private scoreToStatus(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (score >= 90) return 'excellent'
    if (score >= 75) return 'good'
    if (score >= 60) return 'fair'
    return 'poor'
  }
}
```

### 11. Diff Tool（差异对比工具）

可视化对比不同版本或平台的 Skill。

#### 接口设计

```typescript
interface DiffTool {
  diffPlatforms(
    skill: SkillDefinition,
    platforms: Platform[]
  ): Promise<PlatformDiff>
  diffVersions(
    skill1: SkillDefinition,
    skill2: SkillDefinition
  ): Promise<VersionDiff>
  visualize(diff: Diff, format: 'terminal' | 'html'): string
}

interface PlatformDiff {
  platforms: Platform[]
  differences: {
    description: TextDiff
    body: TextDiff
    metadata: ObjectDiff
  }
  statistics: DiffStatistics
}

interface DiffStatistics {
  descriptionCompressionRate: number
  bodyChangePercentage: number
  preservedKeywords: string[]
  lostInformation: string[]
  addedContent: string[]
}
```

#### 实现示例

```typescript
import * as diff from 'diff'
import chalk from 'chalk'

class DiffTool implements DiffTool {
  async diffPlatforms(
    skill: SkillDefinition,
    platforms: Platform[]
  ): Promise<PlatformDiff> {
    // 为每个平台生成版本
    const versions = await Promise.all(
      platforms.map(async platform => {
        const converter = this.getConverter(platform)
        return {
          platform,
          skill: await converter.convert(skill, platform)
        }
      })
    )

    // 对比第一个和其他平台
    const base = versions[0]
    const diffs = versions.slice(1).map(v => ({
      platform: v.platform,
      diff: this.compareSkills(base.skill, v.skill)
    }))

    return {
      platforms,
      differences: diffs[0]?.diff || this.emptyDiff(),
      statistics: this.calculateStatistics(base.skill, diffs[0]?.skill)
    }
  }

  visualize(platformDiff: PlatformDiff, format: 'terminal'): string {
    if (format !== 'terminal') {
      throw new Error('Only terminal format is currently supported')
    }

    const lines: string[] = []

    lines.push(chalk.bold.blue('📝 Platform Differences\n'))
    lines.push(chalk.gray('='.repeat(60)))

    // Description diff
    lines.push(chalk.bold.yellow('\n📄 Description Differences:\n'))
    const descDiff = platformDiff.differences.description
    descDiff.changes.forEach(change => {
      if (change.added) {
        lines.push(chalk.green(`+ ${change.value}`))
      } else if (change.removed) {
        lines.push(chalk.red(`- ${change.value}`))
      } else {
        lines.push(chalk.gray(`  ${change.value.substring(0, 80)}...`))
      }
    })

    // Statistics
    lines.push(chalk.bold.yellow('\n📊 Statistics:\n'))
    const stats = platformDiff.statistics
    lines.push(
      `Compression Rate: ${chalk.cyan(`${stats.descriptionCompressionRate.toFixed(1)}%`)}`
    )
    lines.push(
      `Body Changes: ${chalk.cyan(`${stats.bodyChangePercentage.toFixed(1)}%`)}`
    )

    if (stats.preservedKeywords.length > 0) {
      lines.push(chalk.green(`\n✅ Preserved Keywords:`))
      lines.push(chalk.green(`   ${stats.preservedKeywords.join(', ')}`))
    }

    if (stats.lostInformation.length > 0) {
      lines.push(chalk.red(`\n⚠️  Lost Information:`))
      stats.lostInformation.forEach(info => {
        lines.push(chalk.red(`   - ${info}`))
      })
    }

    return lines.join('\n')
  }

  private compareSkills(
    skill1: SkillDefinition,
    skill2: SkillDefinition
  ): Diff {
    return {
      description: this.diffText(
        skill1.metadata.description,
        skill2.metadata.description
      ),
      body: this.diffText(skill1.body, skill2.body),
      metadata: this.diffObject(skill1.metadata, skill2.metadata)
    }
  }

  private diffText(text1: string, text2: string): TextDiff {
    const changes = diff.diffWords(text1, text2)
    return {
      changes: changes.map(c => ({
        value: c.value,
        added: c.added || false,
        removed: c.removed || false
      })),
      similarity: this.calculateSimilarity(text1, text2)
    }
  }
}
```

### 12. Preset Manager（预设管理器）

管理和应用配置预设。

#### 接口设计

```typescript
interface PresetManager {
  list(): Promise<Preset[]>
  get(name: string): Promise<Preset>
  apply(skillPath: string, presetName: string): Promise<void>
  create(name: string, config: PresetConfig): Promise<void>
  publish(preset: Preset, registry: 'official' | 'community'): Promise<void>
}

interface Preset {
  name: string
  description: string
  author: string
  tags: string[]
  config: PresetConfig
  downloads: number
  rating: number
}

interface PresetConfig {
  description: DescriptionTemplate
  compression: CompressionOptions
  structure: StructureTemplate
  examples: ExampleTemplate[]
}
```

#### 实现示例

```typescript
class PresetManager implements PresetManager {
  private presets: Map<string, Preset>

  constructor() {
    this.presets = new Map()
    this.loadBuiltinPresets()
  }

  private loadBuiltinPresets(): void {
    // React 18 Full Stack
    this.presets.set('react-18-full', {
      name: 'react-18-full',
      description: 'Complete preset for React 18 full-stack applications',
      author: 'USK Team',
      tags: ['react', 'typescript', 'fullstack'],
      config: {
        description: {
          template:
            'Specialized for ${techStack}. Use when ${useCase}. ${features}.',
          variables: {
            techStack: 'React 18 + TypeScript + Next.js',
            useCase: 'building modern web applications',
            features: 'Includes hooks, SSR, and API routes support'
          }
        },
        compression: {
          maxLength: 500,
          preserveKeywords: true,
          strategy: 'balanced'
        },
        structure: {
          sections: [
            'Quick Start',
            'Core Concepts',
            'API Reference',
            'Examples',
            'Best Practices'
          ]
        },
        examples: [
          {
            title: 'Basic Component',
            language: 'typescript',
            code: 'export function MyComponent() { return <div>Hello</div> }'
          }
        ]
      },
      downloads: 0,
      rating: 0
    })

    // Backend API
    this.presets.set('backend-api', {
      name: 'backend-api',
      description: 'Preset for backend API development',
      author: 'USK Team',
      tags: ['backend', 'api', 'rest'],
      config: {
        description: {
          template:
            'API development tool for ${framework}. Generates ${output}.',
          variables: {
            framework: 'FastAPI/Express/Django',
            output: 'RESTful endpoints with validation'
          }
        },
        compression: {
          maxLength: 400,
          preserveKeywords: true,
          strategy: 'aggressive'
        },
        structure: {
          sections: [
            'Installation',
            'API Endpoints',
            'Request/Response',
            'Error Handling'
          ]
        },
        examples: []
      },
      downloads: 0,
      rating: 0
    })

    // Tutorial
    this.presets.set('tutorial', {
      name: 'tutorial',
      description: 'Preset for tutorial and learning-focused Skills',
      author: 'USK Team',
      tags: ['tutorial', 'learning', 'education'],
      config: {
        description: {
          template:
            'Interactive tutorial for ${topic}. Learn ${skills} through ${method}.',
          variables: {
            topic: 'web development',
            skills: 'key concepts and patterns',
            method: 'hands-on examples'
          }
        },
        compression: {
          maxLength: 500,
          preserveKeywords: false,
          strategy: 'conservative'
        },
        structure: {
          sections: [
            'Introduction',
            'Prerequisites',
            'Step-by-Step Guide',
            'Practice Exercises',
            'Summary',
            'Next Steps'
          ]
        },
        examples: []
      },
      downloads: 0,
      rating: 0
    })
  }

  async apply(skillPath: string, presetName: string): Promise<void> {
    const preset = await this.get(presetName)
    const config = preset.config

    // 读取现有 Skill
    const skill = await this.loadSkill(skillPath)

    // 应用预设
    skill.metadata.description = this.applyTemplate(
      config.description.template,
      config.description.variables
    )

    // 重构 Body 结构
    skill.body = this.applyStructure(skill.body, config.structure)

    // 保存
    await this.saveSkill(skillPath, skill)

    logger.info(`Applied preset "${presetName}" to ${skillPath}`)
  }

  private applyTemplate(
    template: string,
    variables: Record<string, string>
  ): string {
    let result = template
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value)
    })
    return result
  }
}
```

## 总结

Universal Skill Kit 通过模块化架构、智能转换、统一配置等核心能力，为 AI CLI Skill 开发提供了完整的工具链。新增的扩展模块进一步增强了：

### 核心能力

1. **智能分析** - Skill Analyzer 提供质量评估和优化建议
2. **历史管理** - Conversion History 支持版本回滚和对比
3. **AI 辅助** - AI Optimizer 利用 LLM 提升压缩质量
4. **交互体验** - Interactive Optimizer 提供友好的优化流程
5. **质量保证** - Quality Checker 全面评估 Skill 质量
6. **可视化对比** - Diff Tool 清晰展示平台差异
7. **预设系统** - Preset Manager 降低上手门槛

### 开源特性

- **社区驱动** - 支持社区贡献压缩策略和预设
- **可扩展** - 插件系统允许第三方扩展
- **透明** - 详细的分析报告和质量评分
- **易用** - 交互式工具和可视化界面

下一步将基于此完整方案实施开发，预计分四个阶段：

1. **Phase 1 (MVP)**: 核心转换 + 智能分析 + 质量检查
2. **Phase 2**: 模板引擎 + 交互式优化 + 历史管理
3. **Phase 3**: 插件系统 + AI 辅助 + 社区功能
4. **Phase 4**: 生态完善 + 多平台支持 + 可视化工具
