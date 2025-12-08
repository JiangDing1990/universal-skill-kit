/**
 * Init command - 初始化 USK 项目
 */

import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import chalk from 'chalk'
import ora from 'ora'
import prompts from 'prompts'

/**
 * 项目模板类型
 */
type TemplateType = 'basic' | 'multi-platform' | 'advanced'

/**
 * 初始化选项
 */
interface InitOptions {
  name?: string
  template?: TemplateType
  yes?: boolean
  force?: boolean
}

/**
 * 默认配置模板
 */
const DEFAULT_CONFIGS = {
  basic: {
    name: 'my-skill',
    version: '1.0.0',
    author: '',
    description: 'A new skill for AI assistants',
    tags: ['skill'],
    platforms: {
      claude: {
        enabled: true,
        output: 'dist/claude'
      }
    },
    source: {
      entry: 'src/SKILL.md',
      templates: 'templates/**/*',
      scripts: 'scripts/**/*',
      resources: 'resources/**/*'
    },
    build: {
      clean: true,
      sourcemap: false,
      minify: false
    }
  },
  'multi-platform': {
    name: 'my-skill',
    version: '1.0.0',
    author: '',
    description: {
      common: 'A cross-platform skill for AI assistants',
      claude: 'Detailed description for Claude Code',
      codex: 'Concise description for Codex (max 500 chars)'
    },
    tags: ['skill', 'cross-platform'],
    platforms: {
      claude: {
        enabled: true,
        output: 'dist/claude'
      },
      codex: {
        enabled: true,
        output: 'dist/codex'
      }
    },
    source: {
      entry: 'src/SKILL.md',
      templates: 'templates/**/*',
      scripts: 'scripts/**/*',
      resources: 'resources/**/*'
    },
    build: {
      clean: true,
      sourcemap: false,
      minify: false
    }
  },
  advanced: {
    name: 'my-skill',
    version: '1.0.0',
    author: '',
    description: {
      common: 'An advanced skill with custom configuration',
      claude: 'Detailed description for Claude Code with advanced features',
      codex: 'Concise description for Codex (max 500 chars)'
    },
    tags: ['skill', 'advanced'],
    platforms: {
      claude: {
        enabled: true,
        output: 'dist/claude',
        description: 'Claude-specific build configuration'
      },
      codex: {
        enabled: true,
        output: 'dist/codex',
        description: 'Codex-specific build configuration'
      }
    },
    source: {
      entry: 'src/SKILL.md',
      templates: ['templates/**/*.md', 'templates/**/*.txt'],
      scripts: 'scripts/**/*.{sh,js}',
      resources: 'resources/**/*',
      include: ['assets/**/*'],
      exclude: ['**/*.test.*', '**/__tests__/**']
    },
    build: {
      clean: true,
      sourcemap: true,
      minify: false,
      cache: {
        enabled: true,
        strategy: 'filesystem'
      }
    },
    environments: {
      development: {
        build: {
          sourcemap: true,
          minify: false
        }
      },
      production: {
        build: {
          sourcemap: false,
          minify: true
        }
      }
    }
  }
}

/**
 * SKILL.md 模板
 */
const SKILL_TEMPLATE = `---
name: {{name}}
version: {{version}}
author: {{author}}
description: {{description}}
tags:
{{#each tags}}
  - {{this}}
{{/each}}
---

# {{name}}

{{description}}

## 功能特性

- 功能 1: 描述你的第一个功能
- 功能 2: 描述你的第二个功能
- 功能 3: 描述你的第三个功能

## 使用方法

\`\`\`bash
# 示例命令
usk build
\`\`\`

## 平台支持

{{#if platform.claude}}
### Claude Code

此 Skill 支持 Claude Code 平台。

特性：
- 支持详细文档
- 无描述长度限制
- 丰富的上下文

{{/if}}

{{#if platform.codex}}
### Codex

此 Skill 支持 Codex 平台。

特性：
- 简洁的描述（≤500字符）
- 高效的执行
- 快速响应

{{/if}}

## 配置选项

参考 \`usk.config.json\` 文件查看完整配置选项。

## 许可证

MIT
`

/**
 * README 模板
 */
const README_TEMPLATE = (name: string, description: string) => `# ${name}

${description}

## 快速开始

1. 安装依赖：
   \`\`\`bash
   pnpm install
   \`\`\`

2. 构建 Skill：
   \`\`\`bash
   usk build
   \`\`\`

3. 查看输出：
   \`\`\`bash
   ls dist/
   \`\`\`

## 项目结构

\`\`\`
.
├── src/
│   └── SKILL.md          # Skill 主文件（模板）
├── templates/            # 模板文件
├── scripts/              # 脚本文件
├── resources/            # 资源文件
├── dist/                 # 构建输出
├── usk.config.json       # USK 配置文件
└── README.md
\`\`\`

## 命令

- \`usk build\` - 构建 Skill
- \`usk build --watch\` - 监听模式
- \`usk cache status\` - 查看缓存状态
- \`usk cache clean\` - 清空缓存
- \`usk validate\` - 验证配置
- \`usk doctor\` - 诊断问题

## 文档

查看完整文档：https://github.com/JiangDing1990/universal-skill-kit

## 许可证

MIT
`

/**
 * .gitignore 模板
 */
const GITIGNORE_TEMPLATE = `# 构建输出
dist/
*.log

# 缓存
.usk/

# 依赖
node_modules/

# IDE
.vscode/
.idea/

# 系统文件
.DS_Store
Thumbs.db
`

/**
 * 初始化命令
 */
export async function initCommand(options: InitOptions = {}): Promise<void> {
  try {
    console.log(chalk.bold.cyan('\n🚀 初始化 Universal Skill Kit 项目\n'))

    // 获取项目信息
    const answers = options.yes
      ? {
          name: options.name || 'my-skill',
          template: options.template || 'basic',
          author: '',
          description: 'A new skill for AI assistants'
        }
      : await prompts([
          {
            type: 'text',
            name: 'name',
            message: '项目名称',
            initial: options.name || 'my-skill',
            validate: (value: string) =>
              /^[a-z0-9-]+$/.test(value) ? true : '项目名称只能包含小写字母、数字和连字符'
          },
          {
            type: 'select',
            name: 'template',
            message: '选择模板',
            choices: [
              { title: 'Basic - 基础模板（单平台）', value: 'basic' },
              { title: 'Multi-Platform - 多平台模板', value: 'multi-platform' },
              { title: 'Advanced - 高级模板（完整配置）', value: 'advanced' }
            ],
            initial: 0
          },
          {
            type: 'text',
            name: 'author',
            message: '作者',
            initial: ''
          },
          {
            type: 'text',
            name: 'description',
            message: '描述',
            initial: 'A new skill for AI assistants'
          }
        ])

    // 用户取消
    if (!answers.name) {
      console.log(chalk.yellow('\n✖ 已取消初始化'))
      return
    }

    const projectDir = resolve(process.cwd(), answers.name)

    // 检查目录是否存在
    if (existsSync(projectDir) && !options.force) {
      console.error(
        chalk.red(`\n✖ 目录已存在: ${answers.name}`)
      )
      console.log(chalk.yellow('  使用 --force 选项强制覆盖\n'))
      return
    }

    const spinner = ora('正在创建项目...').start()

    // 创建项目目录
    await mkdir(projectDir, { recursive: true })
    await mkdir(resolve(projectDir, 'src'), { recursive: true })
    await mkdir(resolve(projectDir, 'templates'), { recursive: true })
    await mkdir(resolve(projectDir, 'scripts'), { recursive: true })
    await mkdir(resolve(projectDir, 'resources'), { recursive: true })

    // 生成配置文件
    const config = {
      ...DEFAULT_CONFIGS[answers.template as TemplateType],
      name: answers.name,
      author: answers.author,
      description: typeof DEFAULT_CONFIGS[answers.template as TemplateType].description === 'string'
        ? answers.description
        : {
            ...DEFAULT_CONFIGS[answers.template as TemplateType].description,
            common: answers.description
          }
    }

    await writeFile(
      resolve(projectDir, 'usk.config.json'),
      JSON.stringify(config, null, 2),
      'utf-8'
    )

    // 生成 SKILL.md
    await writeFile(
      resolve(projectDir, 'src/SKILL.md'),
      SKILL_TEMPLATE,
      'utf-8'
    )

    // 生成 README.md
    await writeFile(
      resolve(projectDir, 'README.md'),
      README_TEMPLATE(answers.name, answers.description),
      'utf-8'
    )

    // 生成 .gitignore
    await writeFile(
      resolve(projectDir, '.gitignore'),
      GITIGNORE_TEMPLATE,
      'utf-8'
    )

    // 生成示例文件
    await writeFile(
      resolve(projectDir, 'templates/example.md'),
      '# Example Template\n\nThis is an example template file.\n',
      'utf-8'
    )

    await writeFile(
      resolve(projectDir, 'scripts/setup.sh'),
      '#!/bin/bash\necho "Setup script"\n',
      'utf-8'
    )

    await writeFile(
      resolve(projectDir, 'resources/config.yaml'),
      'key: value\n',
      'utf-8'
    )

    spinner.succeed(chalk.green('✔ 项目创建成功！'))

    // 输出下一步提示
    console.log(chalk.bold('\n📝 下一步：\n'))
    console.log(chalk.cyan(`  cd ${answers.name}`))
    console.log(chalk.cyan('  usk build'))
    console.log()
    console.log(chalk.gray('💡 提示：'))
    console.log(chalk.gray('  - 编辑 src/SKILL.md 来定义你的 Skill'))
    console.log(chalk.gray('  - 修改 usk.config.json 来配置构建选项'))
    console.log(chalk.gray('  - 运行 usk doctor 来检查项目配置'))
    console.log()
  } catch (error) {
    console.error(chalk.red('\n✖ 初始化失败:'), (error as Error).message)
    process.exit(1)
  }
}
