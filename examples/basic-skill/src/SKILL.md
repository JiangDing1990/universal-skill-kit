---
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

这是一个基础的Skill示例，展示了Universal Skill Kit的基本用法。

## 功能特性

- ✅ 跨平台支持（Claude Code和Codex）
- ✅ 模板化配置
- ✅ 自动构建和缓存
- ✅ 智能错误处理

## 平台支持

{{#if platform.claude}}
### Claude Code

此Skill支持Claude Code平台。

**特性:**
- 支持详细的文档说明
- 无描述长度限制
- 丰富的上下文支持
- Handlebars模板引擎

{{/if}}

{{#if platform.codex}}
### Codex

此Skill支持Codex平台。

**特性:**
- 简洁的描述（≤500字符）
- 高效执行
- 快速响应
- 自动优化

{{/if}}

## 使用方法

### 构建Skill

\`\`\`bash
# 构建所有平台
usk build

# 构建并监听变化
usk build --watch

# 强制重新构建（忽略缓存）
usk build --force

# 详细输出
usk build --verbose
\`\`\`

### 验证配置

\`\`\`bash
# 验证配置文件
usk validate

# 严格模式验证
usk validate --strict

# JSON格式输出
usk validate --json
\`\`\`

### 诊断项目

\`\`\`bash
# 诊断项目健康状态
usk doctor

# 显示详细信息
usk doctor --verbose
\`\`\`

### 缓存管理

\`\`\`bash
# 查看缓存状态
usk cache status

# 清理缓存
usk cache clean --force

# 清理过期缓存
usk cache prune
\`\`\`

## 配置说明

查看 \`usk.config.json\` 文件了解完整配置选项：

- \`name\` - 项目名称
- \`version\` - 版本号
- \`platforms\` - 平台配置
- \`source\` - 源文件配置
- \`build\` - 构建选项

## 插件使用

可以使用插件扩展构建功能：

\`\`\`typescript
import { SkillBuilder, loggerPlugin, minifyPlugin } from '@jiangding/usk-builder'

const builder = new SkillBuilder(config, {
  plugins: [
    { plugin: loggerPlugin({ verbose: true }) },
    { plugin: minifyPlugin({ removeComments: true }) }
  ]
})
\`\`\`

## 开发建议

1. **使用模板变量** - 充分利用Handlebars模板语法
2. **平台条件编译** - 使用 \`{{#if platform.xxx}}\` 区分平台
3. **描述优化** - Codex平台保持描述简洁（≤500字符）
4. **定期验证** - 运行 \`usk validate\` 检查配置
5. **使用缓存** - 利用缓存加速构建

## 许可证

MIT

---

💡 提示：这只是一个基础示例。你可以根据需要添加更多功能、资源文件和配置选项。

📖 更多信息请访问：https://github.com/JiangDing1990/universal-skill-kit
