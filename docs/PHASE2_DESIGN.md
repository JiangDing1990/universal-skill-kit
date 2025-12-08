# Phase 2 技术设计文档

Universal Skill Kit Phase 2: 统一开发工作流

## 目录

- [设计目标](#设计目标)
- [核心功能](#核心功能)
- [架构设计](#架构设计)
- [实现计划](#实现计划)
- [技术选型](#技术选型)

---

## 设计目标

### 当前问题

Phase 1解决了**转换**问题，但开发体验仍有不足：

1. ❌ **重复维护** - Claude和Codex需要两份描述
2. ❌ **手动转换** - 每次修改后需要重新转换
3. ❌ **平台差异** - 难以处理平台特定内容
4. ❌ **工作流分散** - 编辑→转换→验证→部署各自独立

### Phase 2目标

解决**开发**问题，实现：

1. ✅ **单一数据源** - 一份配置，多平台发布
2. ✅ **自动构建** - 修改即构建，监听模式
3. ✅ **条件编译** - 平台特定内容自动处理
4. ✅ **统一工作流** - 开发→构建→部署一体化

### 用户体验提升

**Before (Phase 1)**:
```bash
# 1. 手动编辑两份文件
vim claude-skill/SKILL.md
vim codex-skill/SKILL.md

# 2. 手动转换
usk convert claude-skill/ -t codex -o ./dist

# 3. 手动验证
usk analyze dist/codex-skill/
```

**After (Phase 2)**:
```bash
# 1. 编辑一份模板
vim src/SKILL.md

# 2. 自动构建多平台
usk build

# 输出:
# ✔ Built for claude → dist/claude/
# ✔ Built for codex → dist/codex/
```

---

## 核心功能

### 1. 统一配置格式

#### 设计：`usk.config.ts`

```typescript
// usk.config.ts
import { defineConfig } from '@jiangding/usk-builder'

export default defineConfig({
  // 基本信息
  name: 'my-skill',
  version: '2.0.0',
  author: 'Your Name',

  // 统一描述（支持平台特定覆盖）
  description: {
    // 所有平台共享的基础描述
    common: 'Enterprise CRUD toolkit for React applications.',

    // Claude平台扩展（可选）
    claude: `
      Enterprise CRUD toolkit for React 16.14 and DVA 2.x applications.

      Features: Auto-generate list pages with pagination, form dialogs,
      detail views, DVA state management, and API service layers.

      Tech stack: React 16.14, DVA 2.x, TypeScript, @lianjia/antd-life.

      Note: NOT compatible with React 18 or Ant Design 5.
    `,

    // Codex平台会自动压缩（或手动指定短版本）
    codex: 'React 16.14 + DVA 2.x CRUD toolkit for enterprise apps.'
  },

  // 或使用模板语法
  description: `
    Enterprise CRUD toolkit for React applications.
    {{#if platform.claude}}
    Detailed features: pagination, form dialogs, state management...
    {{/if}}
  `,

  // 标签
  tags: ['react', 'dva', 'crud', 'typescript'],

  // 平台配置
  platforms: {
    claude: {
      enabled: true,
      output: 'dist/claude'
    },
    codex: {
      enabled: true,
      output: 'dist/codex',
      compressionStrategy: 'balanced'
    }
  },

  // 源文件配置
  source: {
    // 主入口（模板文件）
    entry: 'src/SKILL.md',

    // 资源文件
    templates: 'src/templates/**/*',
    scripts: 'src/scripts/**/*',
    resources: 'src/resources/**/*'
  },

  // 构建选项
  build: {
    // 清理输出目录
    clean: true,

    // 生成source map
    sourcemap: false,

    // 压缩选项
    minify: false
  }
})
```

#### 类型定义

```typescript
// packages/builder/src/types.ts

export interface SkillConfig {
  name: string
  version: string
  author?: string
  description: string | DescriptionConfig
  tags?: string[]
  platforms: PlatformsConfig
  source: SourceConfig
  build?: BuildConfig
}

export interface DescriptionConfig {
  common: string
  claude?: string
  codex?: string
  [platform: string]: string | undefined
}

export interface PlatformsConfig {
  [platform: string]: PlatformConfig
}

export interface PlatformConfig {
  enabled: boolean
  output: string
  compressionStrategy?: 'conservative' | 'balanced' | 'aggressive'
  extends?: string  // 继承其他平台配置
}

export interface SourceConfig {
  entry: string
  templates?: string | string[]
  scripts?: string | string[]
  resources?: string | string[]
}

export interface BuildConfig {
  clean?: boolean
  sourcemap?: boolean
  minify?: boolean
  watch?: boolean
}
```

---

### 2. 模板引擎

#### 语法设计

基于Handlebars风格，但简化实现。

**支持的指令**：

1. **变量替换** `{{variable}}`
```markdown
---
name: {{name}}
version: {{version}}
---
```

2. **条件块** `{{#if condition}}...{{/if}}`
```markdown
{{#if platform.claude}}
This content only appears in Claude builds.
{{/if}}

{{#if platform.codex}}
Short version for Codex.
{{/if}}
```

3. **反向条件** `{{#unless condition}}...{{/unless}}`
```markdown
{{#unless platform.codex}}
Extended documentation (not for Codex).
{{/unless}}
```

4. **循环** `{{#each items}}...{{/each}}`
```markdown
{{#each tags}}
- {{this}}
{{/each}}
```

5. **包含** `{{> partial}}`
```markdown
{{> partials/examples}}
{{> partials/api-reference}}
```

#### 示例：通用Skill模板

```markdown
---
name: {{name}}
version: {{version}}
description: {{description}}
author: {{author}}
tags:
{{#each tags}}
  - {{this}}
{{/each}}
platform: {{platform.name}}
---

# {{name}}

{{description.common}}

{{#if platform.claude}}
## Detailed Documentation

This section provides comprehensive documentation for Claude users.

### Installation

\`\`\`bash
npm install {{name}}
\`\`\`

### Examples

{{> partials/examples}}

### API Reference

{{> partials/api}}
{{/if}}

{{#if platform.codex}}
## Quick Start

Quick usage guide for Codex users.

\`\`\`bash
npm install {{name}}
\`\`\`
{{/if}}

## Features

- Feature 1
- Feature 2
{{#if platform.claude}}
- Extended feature (Claude only)
{{/if}}

{{#unless platform.codex}}
## Advanced Usage

Detailed advanced usage information...
{{/unless}}
```

#### 架构设计

```
@jiangding/usk-template
├── src/
│   ├── engine.ts           # 模板引擎核心
│   ├── parser.ts           # 语法解析器
│   ├── context.ts          # 上下文管理
│   ├── renderer.ts         # 渲染器
│   └── directives/         # 指令处理器
│       ├── base.ts
│       ├── if.ts
│       ├── unless.ts
│       ├── each.ts
│       └── include.ts
```

**核心类**：

```typescript
// engine.ts
export class TemplateEngine {
  private directives: Map<string, Directive>

  constructor() {
    this.registerDirective('if', new IfDirective())
    this.registerDirective('unless', new UnlessDirective())
    this.registerDirective('each', new EachDirective())
    this.registerDirective('include', new IncludeDirective())
  }

  registerDirective(name: string, directive: Directive): void

  async render(
    template: string,
    context: TemplateContext
  ): Promise<string>

  async renderFile(
    filePath: string,
    context: TemplateContext
  ): Promise<string>
}

// context.ts
export class TemplateContext {
  constructor(
    private data: Record<string, any>,
    private helpers: Record<string, Function>
  ) {}

  get(path: string): any
  set(path: string, value: any): void
  has(path: string): boolean

  createChild(data: Record<string, any>): TemplateContext
}

// directives/base.ts
export interface Directive {
  parse(content: string, params: string): DirectiveNode
  render(node: DirectiveNode, context: TemplateContext): Promise<string>
}
```

---

### 3. 构建系统

#### 工作流程

```
usk build
  ↓
┌─────────────────────────┐
│ 1. 加载 usk.config.ts   │
└──────────┬──────────────┘
           ↓
┌─────────────────────────┐
│ 2. 验证配置             │
└──────────┬──────────────┘
           ↓
┌─────────────────────────┐
│ 3. 清理输出目录         │
└──────────┬──────────────┘
           ↓
┌─────────────────────────────────────┐
│ 4. 对每个启用的平台：               │
│    ┌──────────────────────────┐    │
│    │ 4.1 创建平台上下文       │    │
│    │ 4.2 渲染模板 → 临时文件  │    │
│    │ 4.3 使用Converter转换    │    │
│    │ 4.4 复制资源文件         │    │
│    │ 4.5 输出到目标目录       │    │
│    └──────────────────────────┘    │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────┐
│ 5. 生成构建报告         │
└──────────┬──────────────┘
           ↓
         完成
```

#### Builder API

```typescript
// packages/builder/src/builder.ts

export class SkillBuilder {
  constructor(
    private config: SkillConfig,
    private options: BuilderOptions = {}
  ) {}

  /**
   * 构建所有启用的平台
   */
  async build(): Promise<BuildResult> {
    const results: PlatformBuildResult[] = []

    for (const [platform, config] of Object.entries(this.config.platforms)) {
      if (!config.enabled) continue

      const result = await this.buildForPlatform(platform as Platform)
      results.push(result)
    }

    return {
      success: results.every(r => r.success),
      platforms: results,
      duration: Date.now() - startTime
    }
  }

  /**
   * 构建特定平台
   */
  async buildForPlatform(platform: Platform): Promise<PlatformBuildResult> {
    // 1. 创建构建上下文
    const context = this.createContext(platform)

    // 2. 渲染模板
    const rendered = await this.renderTemplate(context)

    // 3. 使用Converter转换
    const converted = await this.convert(rendered, platform)

    // 4. 输出文件
    await this.writeOutput(converted, platform)

    // 5. 复制资源
    await this.copyResources(platform)

    return {
      platform,
      success: true,
      outputPath: this.getOutputPath(platform),
      size: await this.calculateSize(platform)
    }
  }

  /**
   * 监听模式
   */
  async watch(): Promise<void> {
    const watcher = chokidar.watch(this.config.source.entry, {
      ignor edPattern: ['**/node_modules/**', '**/dist/**']
    })

    watcher.on('change', async (path) => {
      console.log(`File changed: ${path}`)
      await this.build()
      console.log('Rebuild completed!')
    })
  }

  /**
   * 清理输出目录
   */
  async clean(): Promise<void> {
    for (const platformConfig of Object.values(this.config.platforms)) {
      await fs.rm(platformConfig.output, { recursive: true, force: true })
    }
  }

  private createContext(platform: Platform): TemplateContext {
    return new TemplateContext({
      name: this.config.name,
      version: this.config.version,
      author: this.config.author,
      description: this.resolveDescription(platform),
      tags: this.config.tags,
      platform: {
        name: platform,
        claude: platform === 'claude',
        codex: platform === 'codex'
      }
    })
  }

  private resolveDescription(platform: Platform): string {
    if (typeof this.config.description === 'string') {
      return this.config.description
    }

    // 优先使用平台特定描述，否则使用common
    return this.config.description[platform] || this.config.description.common
  }
}
```

#### 类型定义

```typescript
export interface BuildResult {
  success: boolean
  platforms: PlatformBuildResult[]
  duration: number
  errors?: Error[]
  warnings?: string[]
}

export interface PlatformBuildResult {
  platform: Platform
  success: boolean
  outputPath: string
  size: number
  error?: Error
}

export interface BuilderOptions {
  verbose?: boolean
  watch?: boolean
  clean?: boolean
}
```

---

### 4. CLI集成

#### 新增命令

**`usk init`** - 初始化项目

```bash
$ usk init my-skill

? Skill name: my-skill
? Version: 1.0.0
? Author: Your Name
? Target platforms: (Use arrow keys)
  ◉ Claude
  ◉ Codex
  ◯ Cursor (coming soon)

✔ Created usk.config.ts
✔ Created src/SKILL.md
✔ Created src/partials/
✔ Created package.json

Next steps:
  cd my-skill
  usk build
```

**`usk build`** - 构建Skill

```bash
$ usk build

Building my-skill v1.0.0...

  ✔ Loaded configuration
  ✔ Validated source files

  Building for claude...
    ✔ Rendered template (45ms)
    ✔ Validated output
    ✔ Copied resources
    → Output: dist/claude/ (125 KB)

  Building for codex...
    ✔ Rendered template (42ms)
    ✔ Compressed description (820 → 495 chars, 39.6%)
    ✔ Validated output
    ✔ Copied resources
    → Output: dist/codex/ (98 KB)

✨ Built successfully in 1.2s
```

**`usk watch`** - 监听模式

```bash
$ usk watch

👀 Watching for changes...

src/SKILL.md changed
  ⚡ Rebuilding...
  ✔ Built for claude (52ms)
  ✔ Built for codex (48ms)

src/partials/examples.md changed
  ⚡ Rebuilding...
  ✔ Built for claude (45ms)
  ✔ Built for codex (43ms)
```

**`usk dev`** - 开发模式（watch + 本地预览）

```bash
$ usk dev

🚀 Development server running...

  Local:    http://localhost:3000
  Preview:  http://localhost:3000/preview

  👀 Watching src/
  📦 Auto-rebuilding on change
```

---

## 架构设计

### 整体架构

```
┌─────────────────────────────────────────────────┐
│                  CLI Layer                       │
│  (usk build, usk watch, usk dev, usk init)      │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│              Builder Layer                       │
│  (@jiangding/usk-builder)                       │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │ SkillBuilder                              │  │
│  │  - build()                                │  │
│  │  - buildForPlatform()                     │  │
│  │  - watch()                                │  │
│  └───────────┬──────────────────────────────┘  │
└──────────────┼──────────────────────────────────┘
               │
       ┌───────┴───────┐
       ↓               ↓
┌─────────────┐ ┌──────────────┐
│  Template   │ │  Converter   │
│   Engine    │ │   (Phase 1)  │
│  (Phase 2)  │ │              │
└─────────────┘ └──────────────┘
```

### 模块依赖关系

```
@jiangding/usk-cli
  ├─→ @jiangding/usk-builder (新)
  │     ├─→ @jiangding/usk-template (新)
  │     ├─→ @jiangding/usk-core
  │     └─→ @jiangding/usk-utils
  └─→ @jiangding/usk-core (现有)
```

### 数据流

```
usk.config.ts
     ↓
ConfigLoader → SkillConfig
     ↓
SkillBuilder
     ├─→ TemplateEngine.render(src/SKILL.md, context)
     │        ↓
     │   Rendered Skill (临时)
     │        ↓
     ├─→ SkillConverter.convert(rendered, platform)
     │        ↓
     │   Converted Skill
     │        ↓
     └─→ 输出到 dist/platform/
```

---

## 实现计划

### 里程碑 2.1: 配置系统（Week 1-2）

**目标**：实现配置文件加载和验证

**任务**：
- [ ] 定义 SkillConfig 类型（TypeScript）
- [ ] 实现配置加载器
  - [ ] 支持 .ts 文件（使用 jiti/tsx）
  - [ ] 支持 .js 文件
  - [ ] 支持 .json 文件
- [ ] 实现配置验证器（Zod schema）
- [ ] 实现 `usk init` 命令
  - [ ] 交互式问答
  - [ ] 生成 usk.config.ts
  - [ ] 生成项目结构
- [ ] 编写单元测试（目标：90%+）

**交付物**：
- `packages/builder/src/config/`
  - loader.ts
  - validator.ts
  - schema.ts
- `packages/cli/src/commands/init.ts`
- 测试用例

---

### 里程碑 2.2: 模板引擎（Week 3-5）

**目标**：实现简化版模板引擎

**任务**：

**Week 3: 核心解析**
- [ ] 实现模板解析器
  - [ ] 词法分析（Tokenizer）
  - [ ] 语法分析（Parser）
  - [ ] AST生成
- [ ] 实现上下文管理器
  - [ ] 变量存储和读取
  - [ ] 嵌套作用域支持

**Week 4: 指令实现**
- [ ] 实现基础指令
  - [ ] 变量替换 `{{var}}`
  - [ ] if指令 `{{#if}}...{{/if}}`
  - [ ] unless指令 `{{#unless}}...{{/unless}}`
- [ ] 实现高级指令
  - [ ] each指令 `{{#each}}...{{/each}}`
  - [ ] include指令 `{{> partial}}`

**Week 5: 渲染和测试**
- [ ] 实现渲染器
  - [ ] AST遍历
  - [ ] 输出生成
- [ ] 编写单元测试（目标：95%+）
- [ ] 集成测试

**交付物**：
- `packages/template/src/`
  - engine.ts
  - parser.ts
  - context.ts
  - renderer.ts
  - directives/
- 测试用例和文档

---

### 里程碑 2.3: 构建系统（Week 6-7）

**目标**：实现完整构建流程

**任务**：

**Week 6: 核心构建**
- [ ] 实现 SkillBuilder 类
  - [ ] build() 方法
  - [ ] buildForPlatform() 方法
  - [ ] 上下文创建
  - [ ] 模板渲染集成
  - [ ] Converter集成
- [ ] 实现资源文件处理
  - [ ] 复制templates/scripts/resources
  - [ ] 保持目录结构
  - [ ] 处理文件权限

**Week 7: 高级功能**
- [ ] 实现文件监听（watch mode）
  - [ ] 使用 chokidar
  - [ ] 增量构建优化
  - [ ] 错误恢复
- [ ] 实现清理功能
- [ ] 实现构建报告
  - [ ] 统计信息
  - [ ] 错误和警告
- [ ] 集成测试

**交付物**：
- `packages/builder/src/`
  - builder.ts
  - watcher.ts
  - reporter.ts
- 测试用例

---

### 里程碑 2.4: CLI集成和文档（Week 8）

**目标**：完善CLI命令和文档

**任务**：
- [ ] 实现 `usk build` 命令
- [ ] 实现 `usk watch` 命令
- [ ] 改进 `usk init` 命令
- [ ] 编写文档
  - [ ] Phase 2用户指南
  - [ ] 配置文件参考
  - [ ] 模板语法文档
  - [ ] 迁移指南（Phase 1 → Phase 2）
- [ ] 创建示例项目
  - [ ] 简单示例
  - [ ] 复杂示例（多文件）
- [ ] 端到端测试

**交付物**：
- CLI命令实现
- 完整文档
- 示例项目
- v0.2.0 Release

---

## 技术选型

### 1. 配置加载

**选择**：`jiti`

**理由**：
- ✅ 支持TypeScript无需编译
- ✅ 支持ESM和CJS
- ✅ 轻量级
- ✅ 无需额外配置

**替代方案**：
- tsx - 功能类似，但稍重
- ts-node - 需要配置，较重

**使用示例**：
```typescript
import { createJiti } from 'jiti'

const jiti = createJiti(import.meta.url)
const config = await jiti.import('./usk.config.ts')
```

---

### 2. 模板引擎

**选择**：自定义实现

**理由**：
- ✅ 完全控制语法
- ✅ 轻量级（< 10KB）
- ✅ 针对Skill优化
- ✅ 易于调试

**不选现有方案**：
- Handlebars - 过重（~100KB），功能过多
- Mustache - 功能不足
- EJS - 语法不够清晰

**实现策略**：
- 词法分析：正则表达式匹配
- 语法分析：递归下降解析
- 渲染：AST遍历

---

### 3. 文件监听

**选择**：`chokidar`

**理由**：
- ✅ 已在builder包中使用
- ✅ 跨平台兼容性好
- ✅ 性能优秀
- ✅ 功能完善

---

### 4. 配置验证

**选择**：`zod`

**理由**：
- ✅ 已在core包中使用
- ✅ TypeScript原生支持
- ✅ 运行时类型检查
- ✅ 详细错误信息

**配置Schema示例**：
```typescript
import { z } from 'zod'

export const SkillConfigSchema = z.object({
  name: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  author: z.string().optional(),
  description: z.union([
    z.string(),
    z.object({
      common: z.string(),
      claude: z.string().optional(),
      codex: z.string().optional()
    })
  ]),
  tags: z.array(z.string()).optional(),
  platforms: z.record(z.object({
    enabled: z.boolean(),
    output: z.string(),
    compressionStrategy: z.enum(['conservative', 'balanced', 'aggressive']).optional()
  })),
  source: z.object({
    entry: z.string(),
    templates: z.union([z.string(), z.array(z.string())]).optional(),
    scripts: z.union([z.string(), z.array(z.string())]).optional(),
    resources: z.union([z.string(), z.array(z.string())]).optional()
  })
})
```

---

## 向后兼容性

### 兼容性保证

Phase 2完全向后兼容Phase 1：

1. ✅ **现有命令保持不变**
   - `usk convert`
   - `usk analyze`
   - `usk batch`

2. ✅ **单文件Skill继续支持**
   - 不强制使用配置文件
   - 可以混合使用

3. ✅ **API保持稳定**
   - @jiangding/usk-core 不破坏性更改
   - 新功能通过新包提供

### 迁移路径

**Phase 1用户可以选择**：
- 继续使用现有方式
- 逐步迁移到配置文件
- 只在新项目使用Phase 2

---

## 设计原则

### 1. 渐进增强

不强制使用新功能，保持灵活性：

```bash
# Phase 1方式仍然有效
usk convert my-skill.md -t codex

# Phase 2方式是可选增强
usk build  # 需要usk.config.ts
```

### 2. 约定优于配置

提供合理默认值：

```typescript
// 最小配置
export default {
  name: 'my-skill',
  version: '1.0.0',
  platforms: {
    claude: { enabled: true, output: 'dist/claude' },
    codex: { enabled: true, output: 'dist/codex' }
  }
}

// 自动推断：
// - source.entry = 'src/SKILL.md'
// - description = 从entry读取
// - compressionStrategy = 'balanced'
```

### 3. 开发体验优先

- 清晰的错误提示
- 快速的构建速度
- 实时的反馈

### 4. 类型安全

充分利用TypeScript：
```typescript
import { defineConfig } from '@jiangding/usk-builder'

// ✅ 类型提示和检查
export default defineConfig({
  name: 'my-skill',
  platforms: {
    claude: {
      enabled: true,
      output: 'dist/claude'
      // 自动补全和类型检查
    }
  }
})
```

### 5. 测试驱动

- 先写测试，后写实现
- 目标覆盖率：90%+
- 集成测试覆盖关键场景

---

## 风险评估

### 技术风险

| 风险 | 影响 | 可能性 | 缓解措施 |
|------|------|--------|----------|
| 模板引擎复杂度超预期 | 高 | 中 | 简化语法，分阶段实现 |
| 配置加载兼容性问题 | 中 | 低 | 使用成熟库（jiti） |
| 构建性能问题 | 中 | 低 | 增量构建，缓存优化 |
| 向后兼容性破坏 | 高 | 低 | 严格API版本管理 |

### 时间风险

**总计8周**，风险因素：
- 模板引擎实现可能需要更多时间
- 测试覆盖率要求高
- 文档编写工作量大

**缓解措施**：
- 优先实现MVP功能
- 并行开发和测试
- 提前规划文档结构

---

## 成功标准

### 功能完整性

- ✅ 支持统一配置文件
- ✅ 模板引擎正常工作
- ✅ 构建系统稳定
- ✅ CLI命令完善

### 质量标准

- ✅ 测试覆盖率 > 90%
- ✅ 所有测试通过
- ✅ 无已知严重bug
- ✅ 文档完整

### 性能标准

- ✅ 单平台构建 < 1s
- ✅ 多平台构建 < 3s
- ✅ watch模式响应 < 500ms

### 用户体验

- ✅ 清晰的错误提示
- ✅ 快速的构建反馈
- ✅ 完善的文档和示例

---

## 下一步行动

### 立即开始

1. **创建新分支**：`git checkout -b feature/phase-2`
2. **设置项目结构**：创建必要的文件和目录
3. **开始里程碑2.1**：实现配置系统

### 第一周任务

- [ ] 定义SkillConfig类型
- [ ] 实现ConfigLoader
- [ ] 实现ConfigValidator
- [ ] 编写单元测试
- [ ] 实现基础的`usk init`命令

---

<div align="center">

**Phase 2设计完成！准备开始实现！** 🚀

[返回主页](../README.md) | [查看ROADMAP](ROADMAP.md)

</div>
