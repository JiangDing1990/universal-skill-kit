# Universal Skill Kit

<div align="center">

[![npm version](https://img.shields.io/npm/v/universal-skill-kit.svg)](https://www.npmjs.com/package/universal-skill-kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

**统一的 AI CLI Skills 开发和转换工具集**

[English](README.md) | [简体中文](README_CN.md)

</div>

## 项目概述

Universal Skill Kit (USK) 是一个用于开发、转换和管理 AI CLI Skills 的综合工具集，支持 Claude Code 和 Codex 等多个平台。它通过提供智能转换工具和统一开发框架，解决了为多个 AI CLI 平台维护 Skills 的挑战。

### 核心特性

- 🔄 **一键转换** - 在 Claude 和 Codex 格式之间快速转换 Skills
- 🛠️ **统一开发** - 编写一次，部署到多个平台
- 📦 **智能优化** - 自动压缩描述和优化结构
- ✅ **语法验证** - 内置 TypeScript/TSX 模板验证
- 🎯 **模板引擎** - 支持平台特定内容的条件编译
- 🚀 **批量处理** - 并行转换多个 Skills
- 🔌 **可扩展** - 插件系统支持自定义转换

## 为什么需要 Universal Skill Kit?

**问题**: AI CLI 平台如 Claude Code 和 Codex 的 Skill 格式不同:

- **Claude**: 允许详细文档（无长度限制），存储在 `~/.claude/skills/`
- **Codex**: 要求简洁描述（最多 500 字符），存储在 `~/.codex/skills/`

**解决方案**: USK 通过以下方式弥合这些差异:

1. 智能压缩描述，同时保留关键信息
2. 自动适配目录结构和路径
3. 提供统一的跨平台开发配置格式

## 快速开始

### 安装

```bash
npm install -g universal-skill-kit

# 或使用 npx
npx universal-skill-kit --help
```

### 转换现有 Skill

```bash
# 将 Claude Skill 转换为 Codex
usk convert ~/.claude/skills/my-skill --to codex --output ~/.codex/skills

# 将 Codex Skill 转换为 Claude
usk convert ~/.codex/skills/my-skill --to claude --output ~/.claude/skills

# 批量转换所有 Skills
usk batch-convert ~/.claude/skills --from claude --to codex
```

### 创建跨平台 Skill

```bash
# 1. 初始化项目
usk init my-awesome-skill --template universal

# 2. 编辑配置
cd my-awesome-skill
# 编辑 skill.config.json 和 SKILL.md

# 3. 构建所有平台
usk build --platform all

# 输出:
# ✓ .claude/skills/my-awesome-skill/
# ✓ .codex/skills/my-awesome-skill/
```

### 验证 Skill

```bash
# 验证 Claude Skill
usk validate ~/.claude/skills/my-skill --platform claude

# 验证 Codex Skill
usk validate ~/.codex/skills/my-skill --platform codex
```

## CLI 命令

### `convert` - 转换命令

将 Skill 从一个平台转换到另一个平台。

```bash
usk convert <source> --to <platform> [options]

选项:
  -t, --to <platform>    目标平台 (claude|codex)
  -o, --output <dir>     输出目录
```

### `build` - 构建命令

从统一配置构建 Skills。

```bash
usk build [options]

选项:
  -p, --platform <platform>  目标平台 (claude|codex|all) [默认: all]
  -c, --config <file>        配置文件路径 [默认: skill.config.json]
```

### `validate` - 验证命令

验证 Skill 格式和语法。

```bash
usk validate <dir> [options]

选项:
  -p, --platform <platform>  验证目标平台 (claude|codex)
```

### `init` - 初始化命令

初始化新的 Skill 项目。

```bash
usk init <name> [options]

选项:
  -t, --template <name>  模板名称 (basic|universal|react) [默认: basic]
```

### `batch-convert` - 批量转换命令

批量转换多个 Skills。

```bash
usk batch-convert <dir> [options]

选项:
  --from <platform>  源平台 [默认: claude]
  --to <platform>    目标平台 [默认: codex]
```

## 配置文件

### skill.config.json

跨平台 Skill 开发的统一配置文件:

```json
{
  "name": "my-skill",
  "version": "1.0.0",
  "author": "你的名字",
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
    "full": "Claude 的完整详细描述...",
    "short": "Codex 的简洁描述（最多 500 字符）",
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
    "templates": ["assets/templates/**/*.tsx"],
    "references": ["references/**/*.md"],
    "scripts": ["scripts/**/*.sh"]
  },
  "build": {
    "validate": true,
    "minify": false
  }
}
```

## 模板引擎

使用条件编译编写平台特定内容:

```markdown
---
name: my-skill
version: 1.0.0
---

# {{name}}

<!-- @if platform=claude -->

这段详细内容只在 Claude Skills 中显示。
可以包含大量文档、示例和参考资料。

<!-- @endif -->

<!-- @if platform=codex -->

这段简洁内容在 Codex Skills 中显示。
为 500 字符描述限制优化。

<!-- @endif -->

<!-- @if platform=claude,codex -->

这段内容在两个平台都显示。

<!-- @endif -->

## 常用场景

<!-- @unless platform=codex -->

扩展示例和详细说明...

<!-- @endunless -->
```

## 架构

```
universal-skill-kit/
├── packages/
│   ├── core/                    # 核心转换引擎
│   │   ├── converter/           # 平台转换器
│   │   ├── parser/              # Skill 解析器
│   │   ├── validator/           # 语法验证器
│   │   └── optimizer/           # 智能优化器
│   ├── cli/                     # 命令行工具
│   ├── builder/                 # 统一构建工具
│   └── utils/                   # 通用工具
├── templates/                   # Skill 模板
│   ├── claude/
│   ├── codex/
│   └── universal/
└── docs/                        # 文档
    ├── en/
    └── zh-CN/
```

## 使用示例

### 示例 1: 快速迁移

将现有的 Claude Skill 迁移到 Codex:

```bash
# 之前: Skill 在 ~/.claude/skills/react-helper/
usk convert ~/.claude/skills/react-helper --to codex

# 之后: Skill 在 ~/.codex/skills/react-helper/
# ✓ 描述压缩到 480 字符
# ✓ 路径更新 (.claude → .codex)
# ✓ Body 为 Codex 格式优化
```

### 示例 2: 通用 Skill 开发

开发一个可在两个平台工作的 Skill:

```bash
# 1. 初始化
usk init frontend-helper --template universal

# 2. 创建的结构
frontend-helper/
├── SKILL.md              # 带条件块的源文件
├── skill.config.json     # 统一配置
├── assets/
│   └── templates/
└── references/

# 3. 为两个平台构建
cd frontend-helper
usk build --platform all

# 4. 输出
.claude/skills/frontend-helper/   # 完整版本
.codex/skills/frontend-helper/    # 优化版本
```

### 示例 3: 批量迁移

将所有 Claude Skills 迁移到 Codex:

```bash
# 转换目录中的所有 Skills
usk batch-convert ~/.claude/skills --from claude --to codex

# 输出
✓ 转换 react-helper... 完成
✓ 转换 vue-assistant... 完成
✓ 转换 api-generator... 完成

✓ 成功转换 3 个 Skills
✗ 失败: 0
```

## API 参考

### Converter API

```typescript
import { SkillConverter } from 'universal-skill-kit'

const converter = new SkillConverter()

// 转换 Skill
const result = await converter.convert('/path/to/skill', {
  targetPlatform: 'codex',
  outputDir: '/output/path'
})

console.log(result.outputPath) // 转换后的 Skill 位置
console.log(result.metadata) // Skill 元数据
```

### Builder API

```typescript
import { SkillBuilder } from 'universal-skill-kit'

const builder = new SkillBuilder()

// 从配置构建
const result = await builder.build('skill.config.json', 'codex')

console.log(result.success) // true
console.log(result.outputPath) // 输出目录
```

### Validator API

```typescript
import { SkillValidator } from 'universal-skill-kit'

const validator = new SkillValidator()

// 验证 Skill
const result = await validator.validate('/path/to/skill', 'claude')

if (result.valid) {
  console.log('✓ 验证通过')
} else {
  console.error('错误:', result.errors)
  console.warn('警告:', result.warnings)
}
```

## 高级特性

### 智能描述压缩

USK 使用智能算法压缩描述:

```typescript
// 原始 (800 字符)
"专用于构建基于 React 16.14 + DVA 2.x + @lianjia/antd-life 技术栈的前端应用。
当用户需要创建列表页（CRUD）、详情页、表单弹窗或编写 DVA Model 时应使用此技能。
提供完整的代码模板、最佳实践指南和质量检查清单。
不适用于 React 18 或 Ant Design 5 项目..."

// 压缩后 (480 字符)
"专用于 React 16.14 + DVA 2.x + @lianjia/antd-life 技术栈。
创建列表页（CRUD）、详情页、表单弹窗或编写 DVA Model 时使用。
不适用于 React 18 或 Ant Design 5 项目。
提供完整模板、代码示例和质量检查清单。"
```

**压缩策略**:

- 移除冗余示例
- 简化句子结构
- 保留技术关键词
- 维持核心信息

### 路径映射

转换时自动更新路径:

```typescript
// Claude 路径
~/.claude/skills/my-skill/
.claude/skills/my-skill/

// Codex 路径（自动映射）
~/.codex/skills/my-skill/
.codex/skills/my-skill/
```

### 插件系统

通过插件扩展功能:

```typescript
import { Plugin } from 'universal-skill-kit'

const customPlugin: Plugin = {
  name: 'my-plugin',
  version: '1.0.0',
  hooks: {
    beforeConvert: skill => {
      // 转换前修改 skill
      return skill
    },
    afterConvert: skill => {
      // 转换后修改 skill
      return skill
    }
  }
}

const converter = new SkillConverter()
converter.use(customPlugin)
```

## 测试

```bash
# 运行所有测试
npm test

# 运行特定测试
npm test -- converter
npm test -- validator

# 带覆盖率
npm run test:coverage

# 集成测试
npm run test:integration
```

## 贡献

欢迎贡献！详情请见 [CONTRIBUTING.md](CONTRIBUTING.md)。

### 开发环境设置

```bash
# 克隆仓库
git clone https://github.com/yourusername/universal-skill-kit.git
cd universal-skill-kit

# 安装依赖
npm install

# 开发模式运行
npm run dev

# 构建
npm run build

# 运行测试
npm test
```

### 代码风格

- **语言**: TypeScript 5.3+
- **格式化**: Prettier
- **代码检查**: ESLint
- **提交**: Conventional Commits

## 开发路线图

详细开发计划见 [ROADMAP.md](docs/ROADMAP.md)。

**Phase 1 (MVP)** - 2024 Q1

- ✅ 核心转换引擎
- ✅ 基本命令的 CLI 工具
- ✅ 描述压缩
- ✅ 路径映射

**Phase 2** - 2024 Q2

- 🔄 带条件编译的模板引擎
- 🔄 统一构建系统
- 🔄 语法验证
- 🔄 批量处理

**Phase 3** - 2024 Q3

- 📋 插件系统
- 📋 支持更多平台
- 📋 Web UI
- 📋 VS Code 扩展

## 常见问题

### Q: 转换和构建有什么区别?

**转换** 获取现有的 Skill 并将其转换为另一个平台格式。用于迁移现有 Skills。

**构建** 使用统一配置同时为多个平台生成 Skills。用于开发新的跨平台 Skills。

### Q: 转换会丢失信息吗?

USK 使用智能压缩来保留核心信息:

- 技术关键词始终保留
- 关键使用说明保持完整
- 只简化冗余示例和冗长文本

### Q: 可以自定义转换过程吗?

可以！使用插件系统添加自定义转换逻辑:

```typescript
const myPlugin = {
  name: 'custom-transformer',
  hooks: {
    beforeConvert: skill => {
      // 你的自定义逻辑
      return modifiedSkill
    }
  }
}

converter.use(myPlugin)
```

### Q: 是否支持其他 AI CLI 平台?

目前支持 Claude Code 和 Codex。架构设计具有可扩展性 - 添加新平台支持需要实现一个平台适配器。

## 许可证

[MIT License](LICENSE) © 2024

## 致谢

- Claude Code 团队提供优秀的 AI CLI
- Codex 团队提供 Skill 支持
- 所有对本项目的贡献者

## 链接

- [文档](docs/)
- [技术设计](docs/TECHNICAL_DESIGN.md)
- [贡献指南](CONTRIBUTING.md)
- [问题追踪](https://github.com/yourusername/universal-skill-kit/issues)
- [更新日志](CHANGELOG.md)

---

<div align="center">

**用 ❤️ 为 AI CLI 社区打造**

[⭐ 在 GitHub 上给我们星标](https://github.com/yourusername/universal-skill-kit)

</div>
