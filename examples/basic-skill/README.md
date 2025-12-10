# Basic Skill Example

这是一个基础的 Universal Skill Kit 示例项目，展示了如何使用 USK 创建跨平台的 AI Skill。

## 快速开始

### 1. 安装 USK CLI

```bash
npm install -g @jiangding/usk-cli
```

或者使用本地构建：

```bash
# 在项目根目录
pnpm install
pnpm build
```

### 2. 构建 Skill

```bash
# 在当前目录（examples/basic-skill）
usk build

# 或者使用本地 CLI
node ../../packages/cli/dist/cli.js build
```

### 3. 查看输出

```bash
ls dist/
# 输出:
# dist/claude/SKILL.md
# dist/codex/SKILL.md
```

## 项目结构

```
basic-skill/
├── src/
│   └── SKILL.md          # Skill 模板文件
├── dist/                 # 构建输出目录
│   ├── claude/           # Claude 平台输出
│   └── codex/            # Codex 平台输出
├── usk.config.json       # USK 配置文件
└── README.md
```

## 配置说明

### usk.config.json

```json
{
  "name": "basic-skill-example",
  "version": "1.0.0",
  "author": "USK Team",
  "description": "A basic skill example demonstrating Universal Skill Kit",
  "tags": ["example", "basic", "demo"],
  "platforms": {
    "claude": {
      "enabled": true,
      "output": "./dist/claude"
    },
    "codex": {
      "enabled": true,
      "output": "./dist/codex"
    }
  },
  "source": {
    "entry": "src/SKILL.md"
  },
  "build": {
    "clean": true,
    "sourcemap": false,
    "minify": false
  }
}
```

## 模板语法

### 变量

```handlebars
{{name}}
<!-- 项目名称 -->
{{version}}
<!-- 版本号 -->
{{description}}
<!-- 描述 -->
{{author}}
<!-- 作者 -->
```

### 平台条件

```handlebars
{{#if platform.claude}}
  这段内容只在 Claude 平台显示
{{/if}}

{{#if platform.codex}}
  这段内容只在 Codex 平台显示
{{/if}}
```

### 列表循环

```handlebars
{{#each tags}}
  -
  {{this}}
{{/each}}
```

### 转义 Handlebars 语法

在文档中展示 Handlebars 语法时，需要使用反斜杠转义：

```markdown
\{{#if platform.claude}}
...
\{{/if}}
```

## 常用命令

```bash
# 构建
usk build

# 构建并查看详细输出
usk build --verbose

# 强制重建（忽略缓存）
usk build --force

# 不清理输出目录
usk build --no-clean

# Watch 模式 - 监听文件变化自动重新构建
usk build --watch
usk build -w --verbose  # 详细输出

# 验证配置
usk validate

# 诊断项目
usk doctor

# 缓存管理
usk cache status
usk cache clean --force
```

## 构建输出

### Claude 平台

生成的 `dist/claude/SKILL.md` 包含：

- 完整的 YAML frontmatter
- 渲染后的变量（name, version 等）
- 只包含 Claude 平台特定内容

### Codex 平台

生成的 `dist/codex/SKILL.md` 包含：

- 完整的 YAML frontmatter
- 渲染后的变量（name, version 等）
- 只包含 Codex 平台特定内容

## 特性演示

### ✅ 变量替换

模板中的 `{{name}}` 会被替换为配置中的实际值。

### ✅ 平台条件编译

使用 `{{#if platform.xxx}}` 可以为不同平台生成不同内容。

### ✅ 列表循环

使用 `{{#each tags}}` 可以遍历数组。

### ✅ 自动缓存

USK 会自动缓存构建结果，加速后续构建。

## 进阶使用

### 添加资源文件

1. 创建 `templates/`、`scripts/`、`resources/` 目录
2. 在配置中指定路径模式：

```json
{
  "source": {
    "entry": "src/SKILL.md",
    "templates": "templates/**/*",
    "scripts": "scripts/**/*",
    "resources": "resources/**/*"
  }
}
```

3. 资源文件会自动复制到输出目录

### 使用插件

创建 `build.js` 文件：

```javascript
import {
  SkillBuilder,
  loggerPlugin,
  minifyPlugin
} from '@jiangding/usk-builder'

const builder = await SkillBuilder.fromConfig('usk.config.json')

// 注册插件
builder.use(loggerPlugin({ verbose: true }))
builder.use(minifyPlugin({ removeComments: true }))

await builder.build()
```

运行：

```bash
node build.js
```

## 学习资源

- [USK 文档](../../README.md)
- [配置文件指南](../../docs/)
- [插件开发指南](../../packages/builder/src/plugin/)
- [模板语法](https://handlebarsjs.com/guide/)

## 许可证

MIT
