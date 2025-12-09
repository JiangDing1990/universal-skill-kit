# Multi-Platform Skill Example

这是一个高级的 Universal Skill Kit 示例项目,展示了如何使用条件编译、资源管理和模板系统创建适配多个平台的 AI Skill。

## 特性展示

### 🎯 核心特性

1. **平台条件编译**
   - 为 Claude 和 Codex 提供差异化内容
   - 使用 `{{#if platform.xxx}}` 实现条件渲染
   - Claude: 详细文档 + 完整示例
   - Codex: 精简内容 + 快速参考

2. **丰富的模板变量**
   - 基础变量: name, version, author, description
   - 数组操作: tags, join, length
   - 文本转换: uppercase, lowercase, capitalize
   - 字符串处理: truncate, replace, default

3. **资源文件管理**
   - Templates: 可重用的模板片段
   - Scripts: Shell 脚本 (setup, deploy)
   - Resources: 配置文件 (YAML, JSON)
   - 自动复制到输出目录

4. **高级构建功能**
   - Watch 模式自动重建
   - 智能缓存加速构建
   - 并发构建多平台
   - 详细的错误报告

## 项目结构

```
multi-platform/
├── src/
│   └── SKILL.md              # 主模板文件
├── templates/                # 可重用模板
│   ├── header.md
│   └── footer.md
├── scripts/                  # Shell 脚本
│   ├── setup.sh
│   └── deploy.sh
├── resources/                # 资源文件
│   ├── config.yaml
│   └── metadata.json
├── dist/                     # 构建输出
│   ├── claude/
│   │   ├── SKILL.md
│   │   ├── templates/
│   │   ├── scripts/
│   │   └── resources/
│   └── codex/
│       ├── SKILL.md
│       ├── templates/
│       ├── scripts/
│       └── resources/
├── usk.config.json           # USK 配置文件
└── README.md
```

## 快速开始

### 1. 安装 USK CLI

```bash
npm install -g @jiangding/usk-cli
```

或者使用项目根目录的本地构建:

```bash
cd ../../
pnpm install
pnpm build
```

### 2. 运行 Setup 脚本

```bash
cd examples/multi-platform
chmod +x scripts/*.sh
./scripts/setup.sh
```

### 3. 构建项目

```bash
# 使用全局安装的 CLI
usk build

# 或者使用本地构建的 CLI
node ../../packages/cli/dist/cli.js build

# 详细输出
usk build --verbose

# Watch 模式
usk build --watch
```

### 4. 查看输出

```bash
# 查看 Claude 平台输出
cat dist/claude/SKILL.md

# 查看 Codex 平台输出
cat dist/codex/SKILL.md

# 比较两个平台的差异
diff dist/claude/SKILL.md dist/codex/SKILL.md
```

## 配置说明

### usk.config.json

```json
{
  "name": "multi-platform-skill",
  "version": "2.0.0",
  "author": "USK Development Team",
  "description": "An advanced multi-platform skill...",
  "tags": ["multi-platform", "advanced", "example"],

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
    "entry": "src/SKILL.md",
    "templates": "templates/**/*.md",
    "scripts": "scripts/**/*.sh",
    "resources": "resources/**/*"
  },

  "build": {
    "clean": true,
    "sourcemap": false,
    "minify": false
  }
}
```

### 关键配置项

- **`source.templates`**: 模板文件路径模式 (glob)
- **`source.scripts`**: 脚本文件路径模式
- **`source.resources`**: 资源文件路径模式
- **`build.clean`**: 构建前清理输出目录

## 模板语法示例

### 平台条件编译

```handlebars
{{#if platform.claude}}
  这段内容只在 Claude 平台显示
  可以包含详细的技术文档和代码示例
{{/if}}

{{#if platform.codex}}
  这段内容只在 Codex 平台显示
  保持简洁,快速上手
{{/if}}
```

### 变量和 Helpers

```handlebars
<!-- 基础变量 -->
名称: {{name}}
版本: {{version}}

<!-- 文本转换 -->
大写: {{uppercase name}}
小写: {{lowercase name}}
首字母大写: {{capitalize name}}

<!-- 数组操作 -->
标签: {{join tags ", "}}
标签数量: {{length tags}}

<!-- 字符串处理 -->
截断: {{truncate description 100}}
替换: {{replace name "-" " "}}
默认值: {{default author "Unknown"}}

<!-- 条件逻辑 -->
{{#if (eq version "2.0.0")}}
  版本是 2.0.0
{{/if}}

{{#if (gt (length tags) 3)}}
  有很多标签
{{/if}}

{{#if (and name version)}}
  名称和版本都已定义
{{/if}}
```

### 循环遍历

```handlebars
{{#each tags}}
  - {{this}}
{{/each}}
```

## 常用命令

```bash
# 构建
usk build                    # 构建所有平台
usk build --verbose          # 详细输出
usk build --force            # 强制重建 (忽略缓存)
usk build --no-clean         # 不清理输出目录
usk build --watch            # Watch 模式
usk build --concurrency 10   # 设置并发数

# 验证
usk validate                 # 验证配置文件
usk validate --strict        # 严格模式

# 诊断
usk doctor                   # 诊断项目健康状态
usk doctor --verbose         # 显示详细信息

# 缓存
usk cache status             # 查看缓存状态
usk cache clean              # 清理缓存
usk cache clean --force      # 强制清理所有缓存

# 部署 (使用自定义脚本)
./scripts/deploy.sh          # 部署到本地 Skills 目录
```

## 输出对比

### Claude 平台输出特点

- **文件大小**: ~15-20 KB
- **描述长度**: 完整,无限制
- **内容深度**: 详细的技术文档
- **代码示例**: 丰富的代码片段
- **适用场景**: 深入学习和参考

### Codex 平台输出特点

- **文件大小**: ~5-8 KB
- **描述长度**: 精简,≤500 字符
- **内容深度**: 核心要点
- **代码示例**: 简洁的示例
- **适用场景**: 快速查阅和使用

## 高级特性演示

### 1. 资源文件管理

项目包含多种类型的资源文件:

- **Templates** (`templates/`): 可重用的 Handlebars 模板片段
- **Scripts** (`scripts/`): Shell 脚本 (setup.sh, deploy.sh)
- **Resources** (`resources/`): 配置文件 (config.yaml, metadata.json)

这些文件会自动复制到输出目录,保持相对路径结构。

### 2. 条件编译策略

**Claude 平台** (详细模式):
- 完整的安装步骤
- 详细的 API 文档
- 丰富的代码示例
- 深入的架构说明
- 完整的命令参考

**Codex 平台** (精简模式):
- 快速安装指南
- 核心命令列表
- 简洁的使用示例
- 关键配置说明

### 3. 性能优化

- **缓存机制**: 自动缓存已渲染的模板
- **并发构建**: 多平台并行处理 (默认 5 个并发)
- **增量更新**: Watch 模式下只重建变化的内容
- **智能失效**: 基于文件哈希的缓存失效

### 4. 开发工作流

```bash
# 1. 启动 Watch 模式
usk build --watch

# 2. 编辑源文件
# 修改 src/SKILL.md 或其他文件

# 3. 自动重建
# Watch 模式检测到变化并自动重建

# 4. 查看结果
cat dist/claude/SKILL.md
```

## 学习路径

1. **从 basic-skill 开始** - 了解基础用法
2. **学习 multi-platform** (当前) - 掌握高级特性
3. **探索 advanced** - 了解插件和自定义构建

## 常见问题

### Q: 如何添加新的资源文件?

A: 在 `usk.config.json` 中添加路径模式:

```json
{
  "source": {
    "resources": [
      "resources/**/*",
      "assets/**/*.png",
      "data/**/*.json"
    ]
  }
}
```

### Q: 如何为不同平台提供完全不同的内容?

A: 使用条件编译:

```handlebars
{{#if platform.claude}}
  Claude 专属内容
{{/if}}

{{#if platform.codex}}
  Codex 专属内容
{{/if}}
```

### Q: 资源文件过多导致构建慢怎么办?

A: 优化资源配置:

1. 使用更精确的 glob 模式
2. 排除不必要的文件
3. 考虑只复制必需的资源

### Q: 如何调试模板渲染问题?

A: 使用详细输出模式:

```bash
usk build --verbose
```

这会显示:
- 模板渲染过程
- 使用的 partials
- 资源复制详情
- 缓存使用情况

### Q: 描述长度超过 500 字符怎么办?

A: 对于 Codex 平台,使用条件编译提供简短版本:

```handlebars
description: {{#if platform.codex}}{{truncate description 450}}{{else}}{{description}}{{/if}}
```

## 相关链接

- **USK 主仓库**: https://github.com/JiangDing1990/universal-skill-kit
- **文档**: https://github.com/JiangDing1990/universal-skill-kit/tree/main/docs
- **示例**: https://github.com/JiangDing1990/universal-skill-kit/tree/main/examples
- **问题反馈**: https://github.com/JiangDing1990/universal-skill-kit/issues

## 许可证

MIT

---

**Built with ❤️ using Universal Skill Kit**
