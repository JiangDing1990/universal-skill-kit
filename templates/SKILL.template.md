---
name: { { SKILL_NAME } }
version: 1.0.0
description: { { DESCRIPTION } }
---

# {{SKILL_NAME}}

<!-- @if platform=claude -->

## 详细说明（Claude）

这是 Claude Code 版本，包含完整的文档和详细示例。

### 功能特性

1. **特性 A**
   - 详细说明特性 A
   - 使用场景
   - 示例代码

2. **特性 B**
   - 详细说明特性 B
   - 使用场景
   - 示例代码

### 完整示例

```typescript
// 详细的示例代码
class Example {
  // 实现细节
}
```

### 最佳实践

- 实践 1: 详细说明
- 实践 2: 详细说明
- 实践 3: 详细说明

### 参考资料

- [文档 A](references/doc-a.md)
- [文档 B](references/doc-b.md)
<!-- @endif -->

<!-- @if platform=codex -->

## 快速指南（Codex）

Codex 优化版本，精简内容。

### 核心功能

- 特性 A: 简要说明
- 特性 B: 简要说明

### 快速示例

```typescript
// 核心代码
const result = quickExample()
```

<!-- @endif -->

<!-- @if platform=claude,codex -->

## 通用内容

这部分内容在两个平台都显示。

### 基本用法

```typescript
// 基本使用示例
function basicUsage() {
  // 通用代码
}
```

### 常见问题

**Q: 问题 1?**
A: 回答 1

**Q: 问题 2?**
A: 回答 2

<!-- @endif -->

## 版本信息

当前版本: {{VERSION}}
作者: {{AUTHOR}}
