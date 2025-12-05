# Claude Skills 开发指南

## 概述

Claude Skills 是 Claude Code 提供的扩展机制，允许用户定义特定领域的知识和工作流程，增强 Claude 在特定任务上的能力。

## Skills 是什么？

Skills 是包含领域知识、工作流程指南、代码模板和最佳实践的文档包。当用户在特定场景下工作时，Claude 可以加载相关的 Skill 来提供更专业的协助。

### 使用场景

- **框架专家**: React、Vue、Next.js 等框架的最佳实践
- **代码生成**: 特定模板的代码生成器
- **工作流程**: Git 工作流、CI/CD 流程等
- **领域知识**: 特定业务领域的规范和模式

## Skill 文件结构

### 基本结构

```
my-skill/
├── SKILL.md              # 核心文件 - Skill 定义
├── assets/               # 可选 - 资源文件
│   ├── templates/        # 代码模板
│   └── images/           # 图片资源
├── references/           # 可选 - 参考文档
│   ├── api.md
│   └── examples.md
└── scripts/              # 可选 - 辅助脚本
    └── setup.sh
```

### SKILL.md 格式

SKILL.md 使用 YAML frontmatter + Markdown body 格式：

````markdown
---
name: my-skill
version: 1.0.0
description: 简短的 Skill 描述
author: Your Name
tags: [tag1, tag2, tag3]
---

# Skill 标题

## 核心内容

这里是 Skill 的主体内容...

### 使用指南

详细的使用说明...

### 代码示例

```typescript
// 示例代码
```
````

### 最佳实践

- 实践 1
- 实践 2

````

## YAML Frontmatter 字段

### 必需字段

- **name** (string): Skill 的唯一标识符
  - 格式: 小写字母、数字、连字符
  - 示例: `react-hooks-expert`, `api-generator`

- **version** (string): 语义化版本号
  - 格式: `major.minor.patch`
  - 示例: `1.0.0`, `2.1.3`

- **description** (string): Skill 的简短描述
  - 说明 Skill 的用途和适用场景
  - **无长度限制** (这是 Claude 的优势)

### 可选字段

- **author** (string): 作者名称
- **tags** (array): 标签列表，用于分类和搜索
- **license** (string): 许可证类型（如 MIT, Apache-2.0）
- **homepage** (string): 项目主页 URL
- **repository** (string): 源代码仓库 URL

### 示例

```yaml
---
name: react-hooks-expert
version: 2.1.0
description: React Hooks 最佳实践指南，包含常用 Hooks 模式、性能优化技巧和错误处理方案。适用于 React 16.8+ 项目。
author: Jane Doe
tags: [react, hooks, javascript, frontend]
license: MIT
homepage: https://example.com/react-hooks-expert
repository: https://github.com/example/react-hooks-expert
---
````

## Body 内容组织

### 推荐结构

````markdown
# Skill 标题

## 概述

简要介绍这个 Skill 的用途。

## 适用场景

- 场景 1
- 场景 2

## 核心概念

关键概念的解释。

## 使用指南

### 场景 A

具体使用方法...

### 场景 B

具体使用方法...

## 代码模板

### 模板 1

```code
// 模板代码
```
````

### 模板 2

```code
// 模板代码
```

## 最佳实践

- 实践 1
- 实践 2

## 常见问题

**Q: 问题 1?**
A: 回答 1

## 参考资料

- [文档链接](url)

````

### 内容编写建议

1. **清晰的标题层级**
   - 使用 `##` 作为主要章节
   - 使用 `###` 作为子章节
   - 避免过深的嵌套

2. **丰富的代码示例**
   - 使用代码围栏标记语言
   - 提供完整可运行的示例
   - 添加注释说明关键点

3. **详细的说明**
   - Claude 支持长文档，可以详细说明
   - 包含背景知识和原理
   - 提供多个使用场景

4. **结构化组织**
   - 使用列表、表格等格式
   - 逻辑清晰，易于查找
   - 关键信息突出显示

## 存储位置

### 全局 Skills

存储在用户主目录：

```bash
~/.claude/skills/my-skill/
└── SKILL.md
````

全局 Skills 在所有项目中都可用。

### 项目 Skills

存储在项目目录：

```bash
/path/to/project/.claude/skills/my-skill/
└── SKILL.md
```

项目 Skills 仅在该项目中可用，优先级高于全局 Skills。

## 安装 Skill

### 手动安装

```bash
# 全局安装
mkdir -p ~/.claude/skills/my-skill
cp -r /path/to/my-skill/* ~/.claude/skills/my-skill/

# 项目安装
mkdir -p .claude/skills/my-skill
cp -r /path/to/my-skill/* .claude/skills/my-skill/
```

### 从 Git 仓库安装

```bash
# 克隆到全局目录
git clone https://github.com/user/my-skill.git ~/.claude/skills/my-skill

# 克隆到项目目录
git clone https://github.com/user/my-skill.git .claude/skills/my-skill
```

## 使用 Skill

### 在 Claude Code 中使用

Claude Code 会自动识别和加载 Skills：

1. **自动加载**: 打开项目时自动加载项目和全局 Skills
2. **按需激活**: 根据用户意图激活相关 Skills
3. **上下文感知**: 根据当前工作场景选择合适的 Skill

### 显式调用

用户可以在对话中明确提及 Skill：

```
请使用 react-hooks-expert Skill 帮我优化这段代码
```

### 列出可用 Skills

```
显示所有可用的 Skills
```

## 编写高质量 Skill

### 内容质量

1. **准确性**
   - 确保技术信息准确无误
   - 引用官方文档和权威资源
   - 及时更新过时的内容

2. **完整性**
   - 覆盖常见使用场景
   - 提供足够的代码示例
   - 包含错误处理和边界情况

3. **可读性**
   - 使用清晰的语言
   - 合理的章节划分
   - 适当的代码注释

### 代码示例

**✅ 好的示例**:

```typescript
// ✅ 使用 useCallback 优化事件处理函数
const handleClick = useCallback((id: string) => {
  // 避免在每次渲染时创建新函数
  setSelectedId(id)
}, []) // 空依赖数组，因为 setSelectedId 是稳定的

return (
  <button onClick={() => handleClick(item.id)}>
    Click me
  </button>
)
```

**❌ 不好的示例**:

```typescript
// ❌ 每次渲染都创建新函数
const handleClick = (id: string) => {
  setSelectedId(id)
}

return <button onClick={() => handleClick(item.id)}>Click me</button>
```

### 结构化信息

使用表格对比不同方案：

| 方案       | 优点       | 缺点       | 适用场景 |
| ---------- | ---------- | ---------- | -------- |
| useState   | 简单直接   | 不支持异步 | 简单状态 |
| useReducer | 逻辑集中   | 代码较多   | 复杂状态 |
| useContext | 跨组件共享 | 性能问题   | 全局状态 |

### 实用的辅助材料

1. **决策树**

   ```
   需要管理状态？
   ├─ 简单状态 → useState
   ├─ 复杂状态
   │  ├─ 局部使用 → useReducer
   │  └─ 跨组件共享 → Context + useReducer
   └─ 需要持久化 → useState + localStorage
   ```

2. **检查清单**

   ```markdown
   ## 性能优化检查清单

   - [ ] 使用 React.memo 包裹纯组件
   - [ ] 使用 useCallback 缓存函数
   - [ ] 使用 useMemo 缓存计算结果
   - [ ] 避免在渲染函数中创建对象/数组
   - [ ] 使用 key 优化列表渲染
   ```

3. **常见错误和解决方案**

   ````markdown
   ### 错误: 无限循环渲染

   **原因**: useEffect 依赖数组包含每次都变化的对象

   ```typescript
   // ❌ 错误
   useEffect(() => {
     fetchData(config)
   }, [config]) // config 是对象，每次都是新引用

   // ✅ 正确
   useEffect(() => {
     fetchData(config)
   }, [config.id, config.type]) // 只依赖具体的值
   ```
   ````

   ```

   ```

## 资源文件管理

### 代码模板

在 `assets/templates/` 目录下存放可复用的代码模板：

```typescript
// assets/templates/custom-hook.template.ts
import { useState, useEffect } from 'react'

export function use{{HookName}}({{parameters}}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // 实现逻辑
  }, [{{dependencies}}])

  return { data, loading, error }
}
```

### 参考文档

在 `references/` 目录下存放详细的参考文档：

```
references/
├── api-reference.md      # API 参考
├── advanced-patterns.md  # 高级模式
├── performance.md        # 性能优化
└── migration-guide.md    # 迁移指南
```

在主 SKILL.md 中引用：

```markdown
详细的 API 参考见 [API Reference](references/api-reference.md)
```

## 版本管理

### 语义化版本

遵循语义化版本规范 (Semver)：

- **Major** (1.0.0 → 2.0.0): 不兼容的 API 变更
- **Minor** (1.0.0 → 1.1.0): 向后兼容的功能新增
- **Patch** (1.0.0 → 1.0.1): 向后兼容的问题修复

### 更新日志

在 Skill 目录中维护 CHANGELOG.md：

```markdown
# Changelog

## [2.0.0] - 2024-12-05

### Breaking Changes

- 移除对 React 16.7 的支持

### Added

- 新增 Concurrent Mode 使用指南
- 新增 Suspense 模式说明

### Fixed

- 修复 useEffect 示例中的内存泄漏问题

## [1.1.0] - 2024-11-01

### Added

- 新增 useTransition Hook 示例
- 新增性能优化章节
```

## 测试和验证

### 内容验证清单

- [ ] 所有代码示例都能正常运行
- [ ] 链接都有效且指向正确的资源
- [ ] YAML frontmatter 格式正确
- [ ] 没有拼写错误和语法错误
- [ ] 版本号符合语义化版本规范

### 功能测试

1. **安装测试**

   ```bash
   # 测试安装到全局
   cp -r my-skill ~/.claude/skills/

   # 验证文件结构
   ls -la ~/.claude/skills/my-skill/
   ```

2. **使用测试**
   - 在 Claude Code 中打开项目
   - 验证 Skill 是否被正确加载
   - 测试各种使用场景

## 发布和分享

### GitHub 仓库

推荐的仓库结构：

```
react-hooks-expert/
├── SKILL.md              # Skill 主文件
├── README.md             # 项目说明
├── LICENSE               # 许可证
├── CHANGELOG.md          # 更新日志
├── assets/
├── references/
├── scripts/
└── .github/
    └── workflows/
        └── validate.yml  # 自动验证
```

### README.md 内容

````markdown
# React Hooks Expert Skill

React Hooks 最佳实践指南。

## 安装

```bash
# 全局安装
git clone https://github.com/user/react-hooks-expert.git ~/.claude/skills/react-hooks-expert

# 项目安装
git clone https://github.com/user/react-hooks-expert.git .claude/skills/react-hooks-expert
```
````

## 使用

在 Claude Code 中打开项目，Skill 会自动加载。

## 内容

- React Hooks 基础概念
- 常用 Hooks 最佳实践
- 性能优化技巧
- 常见问题解决方案

## 许可证

MIT

```

### 添加 Topics

在 GitHub 上添加相关 topics：
- `claude-skill`
- `claude-code`
- `react`
- `hooks`
- `developer-tools`

## 最佳实践总结

### ✅ 应该做的

1. **详细的文档** - Claude 支持长文档，充分利用这个优势
2. **丰富的示例** - 提供多个完整的代码示例
3. **清晰的结构** - 使用标题、列表、表格等组织内容
4. **及时更新** - 保持内容与最新技术同步
5. **版本管理** - 使用语义化版本和更新日志

### ❌ 不应该做的

1. **内容过于简略** - 不要省略重要的细节
2. **缺少示例** - 纯文字说明难以理解
3. **结构混乱** - 没有清晰的章节划分
4. **过时内容** - 包含已废弃的 API 或模式
5. **缺少维护** - 长期不更新

## 常见问题

### Q: Skill 文件大小有限制吗？

A: 没有严格的大小限制，但建议：
- SKILL.md 主文件: 控制在 10,000 行以内
- 总大小: 不超过 50MB
- 如果内容很多，拆分到 references/ 目录

### Q: 如何组织多个相关的 Skills？

A: 有两种方案：
1. **单个大 Skill**: 将所有内容放在一个 Skill 中
2. **多个小 Skills**: 每个 Skill 专注于一个特定主题

推荐方案 2，更灵活和模块化。

### Q: 可以在 Skill 中引用外部资源吗？

A: 可以，但注意：
- 使用稳定的 URL（避免链接失效）
- 优先引用官方文档
- 重要内容最好复制到 Skill 中

### Q: 如何让 Claude 更好地使用我的 Skill？

A: 关键技巧：
1. **明确的场景描述** - 在 description 中清楚说明适用场景
2. **结构化内容** - 使用清晰的标题和章节
3. **关键词优化** - 在内容中包含相关的技术关键词
4. **实用的示例** - 提供完整可用的代码示例

## 参考资源

### 官方文档

- Claude Code 文档: https://code.claude.com/docs
- Claude Skills 指南: https://code.claude.com/docs/en/skills

### 示例 Skills

- claude-code/examples: Claude Code 官方示例仓库

### 社区资源

- GitHub Topics: 搜索 `claude-skill` topic
- Discord 社区: Claude Code 用户社区

---

**祝您创建出优秀的 Claude Skills！** 🚀
```
