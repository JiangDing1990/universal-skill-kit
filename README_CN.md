# Universal Skill Kit

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Test Coverage](https://img.shields.io/badge/coverage-90.59%25-brightgreen.svg)](https://github.com/JiangDing1990/universal-skill-kit)
[![Tests](https://img.shields.io/badge/tests-199%20passing-brightgreen.svg)](https://github.com/JiangDing1990/universal-skill-kit)

**跨平台AI CLI Skills开发和转换工具集**

[English](README.md) | [简体中文](#)

</div>

## ✨ 功能特性

- 🔄 **智能转换** - Claude ↔ Codex双向转换，保留关键信息
- 📁 **完整目录复制** - 🆕 自动复制整个 Skill 目录的所有文件和文件夹
  - 递归扫描所有子目录（templates/、scripts/、resources/、docs/ 等）
  - 智能文件过滤（自动排除 node_modules、.git、构建文件等）
  - 保持目录结构和文件权限
  - 无需在 SKILL.md 中明确引用文件
- ✅ **自动验证** - 转换前检查Skill质量和完整性
- 📦 **智能压缩** - 4种压缩策略，自动适配Codex 500字符限制
- 🎯 **批量处理** - 一次性转换多个Skills，支持并行处理
- 💡 **质量分析** - 提供详细的质量评分和改进建议
- 🎨 **美观输出** - 彩色进度提示和清晰的错误信息
- ⚡ **高性能** - 并行批量转换速度提升80%

## 📖 快速开始

### 安装

```bash
npm install -g @jiangding/usk-cli

# 或使用 pnpm
pnpm add -g @jiangding/usk-cli

# 或使用 yarn
yarn global add @jiangding/usk-cli
```

### 基本使用

#### 1. 转换单个Skill

```bash
# 转换到Codex平台
usk convert my-skill/ -t codex -o ./output

# 转换到Claude平台
usk convert my-skill.md -t claude -o ./output

# 使用交互模式
usk convert my-skill/ -t codex --interactive

# 启用详细日志
usk convert my-skill/ -t codex --verbose
```

#### 2. 分析Skill质量

```bash
# 分析Skill并获取建议
usk analyze my-skill/

# 输出JSON格式
usk analyze my-skill/ --json
```

#### 3. 批量转换

```bash
# 转换目录下所有Skills
usk batch "skills/**/*.md" -t codex -o ./output

# 使用特定压缩策略
usk batch "skills/*/" -t codex -s aggressive

# 并行处理（默认启用）
usk batch "skills/*/" -t codex --parallel
```

## 🎯 核心功能

### 1. 智能验证系统

转换前自动检查Skill质量：

```bash
$ usk convert my-skill/ -t codex

✔ Skill parsed
✔ Validation passed

⚠️  Validation Warnings:
  ⚠ [description] Description is 888 chars (Codex limit: 500)
  ℹ [body] Consider adding code examples

ℹ️  Platform-Specific Notes:
  • [description] Will be compressed to 409 chars (53.9% compression)

✔ Conversion completed!
```

**验证检查**：
- ❌ **Errors（错误）**：必填字段、资源文件存在性
- ⚠️ **Warnings（警告）**：质量建议、格式问题
- ℹ️ **Platform Notes（平台提示）**：Codex限制、压缩需求

### 2. 多文件Skills支持

完整支持复杂的Skill结构：

```
my-skill/
├── SKILL.md              # 主文件
├── templates/            # 模板文件
│   └── example.template.md
├── scripts/              # 脚本文件
│   ├── setup.sh
│   └── helper.ts
└── resources/            # 资源文件
    └── config.yaml
```

转换后保持完整的目录结构和文件权限。

### 3. 智能描述压缩

4种压缩策略自动适配Codex 500字符限制：

- **Conservative（保守）**：最小化修改，保留大部分内容
- **Balanced（平衡）**：适度压缩，移除示例代码（推荐）
- **Aggressive（激进）**：最大化压缩，提取关键词

```bash
# 指定压缩策略
usk convert my-skill/ -t codex -s aggressive
```

### 4. 质量分析

获取详细的质量评分和改进建议：

```bash
$ usk analyze my-skill/

📊 Skill Analysis Report
═══════════════════════════════════════════════

Basic Information:
  Name: my-skill
  Version: 1.0.0
  Author: Author Name
  Tags: react, typescript

Complexity Analysis:
  Level: MEDIUM
  Description Length: 450 chars
  Has Code Examples: ✓

Technical Keywords:
  React, TypeScript, API, GraphQL

Compression Strategy:
  Recommended: balanced

Quality Assessment:
  Score: 85/100

💡 Suggestions:
  ⚡ Add author information for better attribution
  ℹ Consider adding more code examples
```

### 5. 性能优化

并行批量转换，效率最大化：

```bash
$ usk batch "skills/**/*.md" -t codex

Converting 1/20: skill-1.md
Converting 2/20: skill-2.md
Converting 3/20: skill-3.md
...

✔ Converted all 20 skills successfully in 4s!

性能提升：并行处理5个文件，速度提升80%
```

### 6. 增强的错误处理

友好的错误消息和可操作的建议：

```bash
$ usk convert non-existent/

❌ Error:
  [SKILL_NOT_FOUND] Skill not found: non-existent/SKILL.md

💡 Suggestions:
  • 确保文件路径正确
  • 如果是目录，请确保其中包含 SKILL.md 文件
  • 使用绝对路径或相对于当前工作目录的路径
```

## 🏗️ 项目结构

```
universal-skill-kit/
├── packages/
│   ├── core/        # @usk/core - 核心转换引擎
│   │   ├── parser/      # Skill解析器
│   │   ├── optimizer/   # 智能压缩器
│   │   ├── analyzer/    # 质量分析器
│   │   ├── validator/   # 验证器 ✨
│   │   ├── converter/   # 转换器（支持多文件）
│   │   ├── errors/      # 错误处理 ✨ 新增
│   │   └── constants/   # 常量定义 ✨ 新增
│   ├── cli/         # @usk/cli - 命令行工具
│   └── utils/       # @usk/utils - 工具函数
│       ├── path-mapper/ # 路径映射
│       └── logger/      # 日志系统 ✨ 新增
├── docs/            # 文档
└── examples/        # 示例
```

## 📊 测试覆盖率

```
总体覆盖率: 90.59%
─────────────────────────────
Validator:   97.75% ⭐
Analyzer:    96.01%
Optimizer:   94.79%
Parser:      84.61%
Converter:   83.36%
─────────────────────────────
测试通过: 199/199 ✅
```

## 🔧 API使用

### 使用核心API

```typescript
import { SkillConverter, SkillValidator, SkillAnalyzer } from '@jiangding/usk-core'

// 1. 验证Skill
const validator = new SkillValidator()
const validation = await validator.validate(skill, skillPath)

if (!validation.valid) {
  console.log('Errors:', validation.errors)
}

// 2. 分析Skill
const analyzer = new SkillAnalyzer()
const report = analyzer.analyze(skill)
console.log('Quality Score:', report.estimatedQuality)
console.log('Recommended Strategy:', report.recommendedStrategy)

// 3. 转换Skill
const converter = new SkillConverter()
const result = await converter.convert(skillPath, {
  targetPlatform: 'codex',
  outputDir: './output',
  compressionStrategy: 'balanced',
  verbose: true  // 启用详细日志
})

console.log('Conversion successful:', result.success)
console.log('Output:', result.outputPath)
console.log('Compression rate:', result.statistics.compressionRate)
```

### 带进度回调的批量转换

```typescript
const results = await converter.convertBatch(
  files,
  options,
  (current, total, skillPath) => {
    console.log(`转换中 ${current}/${total}: ${skillPath}`)
  }
)
```

## 🎨 CLI选项

### convert命令

```bash
usk convert <input> [options]

选项:
  -t, --target <platform>      目标平台 (claude|codex) [默认: codex]
  -o, --output <dir>           输出目录
  -s, --strategy <strategy>    压缩策略 (conservative|balanced|aggressive)
  -i, --interactive            交互模式
  --verbose                    显示详细日志
```

### analyze命令

```bash
usk analyze <input> [options]

选项:
  -v, --verbose               显示详细分析
  --json                      JSON格式输出
```

### batch命令

```bash
usk batch <pattern> [options]

选项:
  -t, --target <platform>     目标平台 [默认: codex]
  -o, --output <dir>          输出目录
  -s, --strategy <strategy>   压缩策略
  --parallel                  启用并行处理 [默认: true]
  --verbose                   显示详细日志
```

## 🌟 亮点功能

### 自动验证

转换前自动检查Skill质量：
- 检查必填字段（name, description, body）
- 验证资源文件存在性
- 检测常见问题（空链接、TODO标记等）
- 平台特定要求检查（Codex 500字符限制）

### 智能压缩

保留关键技术信息的同时压缩描述：
- 提取技术关键词（版本号、框架名称等）
- 移除冗余示例代码
- 简化冗长表述
- 自动截断保持句子完整性

### 多文件支持

完整支持复杂Skill结构：
- 递归复制所有资源文件
- 保持目录结构和相对路径
- 脚本文件权限保留（755）
- 缺失文件警告提示

### 性能优化

- **并行处理**：默认5个文件并发
- **速度提升80%**：批量转换20个Skills：20s → 4s
- **实时进度**：批量转换时实时更新进度
- **智能错误处理**：单个失败不阻塞整体操作

## 📝 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详情。

## 📄 许可证

[MIT](LICENSE)

## 🔗 相关链接

- [技术设计文档](docs/TECHNICAL_DESIGN.md)
- [开发路线图](docs/ROADMAP.md)
- [更新日志](CHANGELOG.md)
- [贡献指南](CONTRIBUTING.md)
- [用户指南](docs/USER_GUIDE.md)

## 💬 反馈

遇到问题或有建议？请提交 [Issue](https://github.com/JiangDing1990/universal-skill-kit/issues)

---

<div align="center">

Made with ❤️ by [JiangDing1990](https://github.com/JiangDing1990)

</div>
