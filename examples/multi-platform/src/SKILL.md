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

# {{uppercase name}}

> {{description}}

**Version:** {{version}} | **Author:** {{author}}

---

## 平台特性演示

{{#if platform.claude}}

### 🎯 Claude Code 平台

**Claude 专属功能:**

- 详细的文档说明
- 完整的配置指南
- 丰富的使用示例
  {{/if}}

{{#if platform.codex}}

### ⚡ Codex 平台

**Codex 优化:**

- 精简高效
- 快速响应
- 核心功能
  {{/if}}

---

## 模板变量

- Name: {{name}}
- Version: {{version}}
- Author: {{author}}
- Tags: {{join tags ", "}}
- Tag Count: {{length tags}}

---

## 安装使用

{{#if platform.claude}}

### Claude 详细步骤

1. 安装 USK CLI
2. 初始化项目
3. 配置平台
4. 构建输出
   {{/if}}

{{#if platform.codex}}

### Codex 快速开始

快速安装、配置、构建三步完成。
{{/if}}

---

MIT License
