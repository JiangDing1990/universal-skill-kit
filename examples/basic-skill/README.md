# Basic Skill Example

这是一个基础的Universal Skill Kit示例项目，展示了如何使用USK创建跨平台的AI Skill。

## 快速开始

### 1. 安装依赖（如果需要）

```bash
# 在项目根目录
pnpm install
```

### 2. 构建Skill

```bash
# 在当前目录
../../packages/cli/dist/cli.js build

# 或者如果已全局安装
usk build
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
│   └── SKILL.md          # Skill模板文件
├── templates/            # 额外模板文件（可选）
├── scripts/              # 脚本文件（可选）
├── resources/            # 资源文件（可选）
├── dist/                 # 构建输出目录
│   ├── claude/           # Claude平台输出
│   └── codex/            # Codex平台输出
├── usk.config.json       # USK配置文件
└── README.md
```

## 配置说明

### usk.config.json

```json
{
  "name": "basic-skill-example",
  "version": "1.0.0",
  "platforms": {
    "claude": {
      "enabled": true,
      "output": "dist/claude"
    },
    "codex": {
      "enabled": true,
      "output": "dist/codex"
    }
  },
  "source": {
    "entry": "src/SKILL.md"
  }
}
```

## 模板语法

Skill文件使用Handlebars模板语法：

### 变量

```handlebars
{{name}}          <!-- 项目名称 -->
{{version}}       <!-- 版本号 -->
{{description}}   <!-- 描述 -->
{{author}}        <!-- 作者 -->
```

### 平台条件

```handlebars
{{#if platform.claude}}
  这段内容只在Claude平台显示
{{/if}}

{{#if platform.codex}}
  这段内容只在Codex平台显示
{{/if}}
```

### 列表循环

```handlebars
{{#each tags}}
  - {{this}}
{{/each}}
```

## 常用命令

```bash
# 构建
usk build

# 监听模式
usk build --watch

# 强制重建
usk build --force

# 详细输出
usk build --verbose

# 验证配置
usk validate

# 诊断项目
usk doctor

# 缓存管理
usk cache status
usk cache clean --force
```

## 进阶使用

### 添加资源文件

1. 创建 `templates/`、`scripts/`、`resources/` 目录
2. 在配置中指定路径模式
3. 资源文件会自动复制到输出目录

### 使用插件

创建 `build.js` 文件：

```javascript
import { SkillBuilder, ConfigLoader, loggerPlugin } from '@jiangding/usk-builder'

const loader = new ConfigLoader()
const config = await loader.load('usk.config.json')

const builder = new SkillBuilder(config, {
  plugins: [
    {
      plugin: loggerPlugin({ verbose: true })
    }
  ]
})

await builder.build()
```

运行：

```bash
node build.js
```

## 学习资源

- [USK文档](../../README.md)
- [配置文件指南](../../docs/)
- [插件开发指南](../../packages/builder/src/plugin/)

## 许可证

MIT
