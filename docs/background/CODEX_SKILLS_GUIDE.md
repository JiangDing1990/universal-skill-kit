# Codex Skills 开发指南

## 概述

Codex Skills 是 Codex CLI 提供的扩展机制，允许用户定义特定领域的知识和工作流程，增强 Codex 在特定任务上的能力。

**官方文档**: https://github.com/openai/codex/blob/main/docs/skills.md

## 与 Claude Skills 的关键差异

| 特性          | Claude Skills       | Codex Skills         |
| ------------- | ------------------- | -------------------- |
| **描述长度**  | 无限制              | **最多 500 字符** ⚠️ |
| **Body 内容** | 注入到上下文        | **保留在磁盘** ⚠️    |
| **存储位置**  | `~/.claude/skills/` | `~/.codex/skills/`   |
| **文件结构**  | 相同 (YAML + MD)    | 相同 (YAML + MD)     |
| **复杂度**    | 支持详细文档        | 要求精简内容         |

### ⚠️ 重要限制

1. **描述必须 ≤ 500 字符**
   - 这是 Codex 的硬性限制
   - 超出会导致 Skill 加载失败
   - 需要精心提炼关键信息

2. **Body 不自动注入**
   - Codex 默认不将 body 内容注入到上下文
   - 用户需要显式请求才会读取详细内容
   - 描述需要自包含核心信息

## Skill 文件结构

### 基本结构（与 Claude 相同）

```
my-skill/
├── SKILL.md              # 核心文件
├── assets/               # 可选 - 资源文件
├── references/           # 可选 - 参考文档
└── scripts/              # 可选 - 辅助脚本
```

### SKILL.md 格式

```markdown
---
name: my-skill
version: 1.0.0
description: 精简的描述（最多 500 字符）⚠️
---

# Skill 标题

## 核心内容（精简版）

重要：这部分内容需要特别精简，因为 Codex 可能不会主动读取。
```

## YAML Frontmatter

### 必需字段（与 Claude 相同）

- **name**: Skill 唯一标识符
- **version**: 语义化版本号
- **description**: **最多 500 字符** ⚠️

### Description 编写规则

**字符计数**:

```bash
# 检查描述长度
echo -n "你的描述内容" | wc -c
```

**示例 - 480 字符（✅ 合格）**:

```yaml
description: 专用于 React 16.14 + DVA 2.x + @lianjia/antd-life 技术栈。创建列表页（CRUD）、详情页、表单弹窗或编写 DVA Model 时使用。不适用于 React 18 或 Ant Design 5 项目。提供完整模板、代码示例和质量检查清单。支持函数组件、Hooks、CSS Modules 和 ESM 模块。包含 useModalFactory、pageModelFactory 等常用工具。
```

**示例 - 520 字符（❌ 超限）**:

```yaml
description: 这是一个专门用于构建基于 React 16.14 版本以及 DVA 2.x 状态管理库和 @lianjia/antd-life 组件库的前端应用开发技能包。当您需要创建包含增删改查功能的列表页面、展示详细信息的详情页面、用于数据输入的表单弹窗，或者编写 DVA Model 进行状态管理时，应该使用此技能。请注意，本技能不适用于 React 18 或 Ant Design 5 版本的项目。技能包提供了完整的代码模板文件、详细的使用示例代码以及全面的代码质量检查清单。
```

## 编写精简描述的策略

### 1. 移除冗余词汇

**❌ 冗余版本**:

```
这是一个专门用于构建基于 React 技术栈的前端应用的技能包
```

**✅ 精简版本**:

```
React 技术栈前端开发技能包
```

### 2. 使用简写

| 冗长表达          | 简写     |
| ----------------- | -------- |
| 当用户需要创建... | 创建...  |
| 用于构建基于...   | 基于...  |
| 请注意，本技能... | 注意:... |
| 应该使用此技能    | 使用     |
| 提供了完整的...   | 提供...  |

### 3. 技术关键词优先

保留：

- 技术栈名称和版本 (React 16.14, DVA 2.x)
- 核心功能 (CRUD, Model, Modal)
- 重要限制 (不适用于 React 18)

省略：

- 详细说明和背景介绍
- 次要功能列表
- 冗长的使用场景描述

### 4. 使用标点符号分隔

使用 `.`、`,`、`、` 等符号，而不是完整句子：

**❌ 完整句子（冗长）**:

```
这个技能包支持创建列表页面，也支持创建详情页面，还支持创建表单弹窗。
```

**✅ 简洁列表**:

```
支持：列表页、详情页、表单弹窗。
```

### 5. 数字和符号

使用符号代替文字：

```
✅ 支持: React 16.14+
✅ 不支持: React 18
✅ 包含: CRUD、Modal、Form
```

## Description 压缩示例

### 示例 1: React Skill

**原始版本（800 字符）**:

```
这是一个专门用于构建基于 React 16.14 + DVA 2.x + @lianjia/antd-life 技术栈的前端应用的技能包。
当用户需要创建包含增删改查功能的列表页面、展示详细信息的详情页面、用于数据输入的表单弹窗，
或者编写用于状态管理的 DVA Model 时，应该使用此技能。请注意，本技能不适用于 React 18 版本
或 Ant Design 5 版本的项目。技能包提供了完整的代码模板文件、详细的使用示例代码、项目最佳
实践指南以及全面的代码质量检查清单，帮助开发者快速构建高质量的前端应用。支持使用函数组件、
React Hooks、CSS Modules 样式方案和 ESM 模块化方案。包含 useModalFactory、
pageModelFactory 等常用工具函数的使用说明。
```

**压缩版本（480 字符）**:

```
专用于 React 16.14 + DVA 2.x + @lianjia/antd-life 技术栈。创建列表页（CRUD）、详情页、
表单弹窗或编写 DVA Model 时使用。不适用于 React 18 或 Ant Design 5 项目。提供完整模板、
代码示例和质量检查清单。支持函数组件、Hooks、CSS Modules 和 ESM 模块。包含
useModalFactory、pageModelFactory 等常用工具。
```

**压缩比**: 800 → 480 字符（40% 压缩）

### 示例 2: API Generator Skill

**原始版本（650 字符）**:

```
API Generator 是一个用于自动生成 RESTful API 接口定义和类型声明的技能包。支持从 OpenAPI/Swagger
规范文件自动生成 TypeScript 类型定义和 API 调用函数。可以生成包含完整类型安全的 HTTP 请求封装，
支持 GET、POST、PUT、DELETE 等常见 HTTP 方法。生成的代码包含请求参数验证、响应数据转换、错误处理
等完整功能。支持自定义请求拦截器和响应拦截器。适用于前端项目中需要调用后端 RESTful API 的场景。
与 axios、fetch 等 HTTP 客户端库兼容。生成的代码遵循 TypeScript 最佳实践，包含完整的 JSDoc 注释。
```

**压缩版本（320 字符）**:

```
从 OpenAPI/Swagger 生成 TypeScript API 定义和调用函数。支持 GET/POST/PUT/DELETE 方法，
包含类型安全、参数验证、错误处理。兼容 axios、fetch。生成代码含完整类型定义、拦截器支持和
JSDoc 注释。适用于前端调用 RESTful API 场景。
```

**压缩比**: 650 → 320 字符（51% 压缩）

## Body 内容组织

### 精简原则

由于 Codex 可能不会主动读取 body 内容，应该：

1. **Description 自包含**
   - Description 应包含最核心的信息
   - 即使不读 body 也能理解基本用途

2. **Body 作为补充**
   - 提供详细的使用说明
   - 包含完整的代码示例
   - 但不要假设一定会被读取

3. **关键信息前置**
   - 最重要的内容放在 body 开头
   - 使用清晰的标题标识

### 推荐 Body 结构

````markdown
---
name: my-skill
version: 1.0.0
description: 精简但完整的描述（≤ 500 字符）
---

# Skill 标题

## 快速开始（最重要）

最核心的使用方法，一目了然。

## 核心功能

- 功能 1: 简要说明
- 功能 2: 简要说明

## 使用示例

```code
// 最常用的示例
```
````

## 详细文档

更详细的说明（如果用户需要）

## 参考资料

- [链接](url)

````

## 存储位置

### 全局 Skills

```bash
~/.codex/skills/my-skill/
└── SKILL.md
````

### 项目 Skills

```bash
/path/to/project/.codex/skills/my-skill/
└── SKILL.md
```

**注意**: 目录名从 `.claude` 改为 `.codex`。

## 安装 Skill

### 手动安装

```bash
# 全局安装
mkdir -p ~/.codex/skills/my-skill
cp -r /path/to/my-skill/* ~/.codex/skills/my-skill/

# 项目安装
mkdir -p .codex/skills/my-skill
cp -r /path/to/my-skill/* .codex/skills/my-skill/
```

### 从 Claude Skill 转换

如果已有 Claude Skill，需要：

1. **压缩 description**

   ```bash
   # 检查当前长度
   grep "^description:" SKILL.md | wc -c

   # 需要压缩到 500 字符以内
   ```

2. **更新存储路径**

   ```bash
   # 复制到 Codex 目录
   cp -r ~/.claude/skills/my-skill ~/.codex/skills/my-skill
   ```

3. **测试验证**
   ```bash
   # 在 Codex 中验证 Skill 是否正常加载
   ```

## 使用 Skill

### 在 Codex 中使用

Codex 会：

1. 读取 frontmatter（包括 description）
2. 根据 description 判断是否相关
3. **仅在需要时才读取 body 内容**

### 显式调用

```
请使用 my-skill Skill 帮我完成这个任务
```

### 查看 Skills

```
列出所有可用的 Skills
```

## 测试和验证

### Description 长度验证

```bash
# 提取 description 并计数
description=$(grep "^description:" SKILL.md | sed 's/^description: //')
echo -n "$description" | wc -c

# 应该输出 ≤ 500
```

### 自动化验证脚本

```bash
#!/bin/bash
# validate-codex-skill.sh

SKILL_FILE="SKILL.md"

# 检查文件存在
if [ ! -f "$SKILL_FILE" ]; then
  echo "❌ SKILL.md not found"
  exit 1
fi

# 提取 description
description=$(grep "^description:" "$SKILL_FILE" | sed 's/^description: //')

# 计数
length=$(echo -n "$description" | wc -c | tr -d ' ')

echo "Description length: $length characters"

if [ "$length" -le 500 ]; then
  echo "✅ Description length OK (≤ 500)"
  exit 0
else
  echo "❌ Description too long (> 500)"
  echo "   Need to reduce by $((length - 500)) characters"
  exit 1
fi
```

使用：

```bash
chmod +x validate-codex-skill.sh
./validate-codex-skill.sh
```

## 从 Claude Skill 迁移

### 迁移清单

- [ ] 压缩 description 到 500 字符以内
- [ ] 更新存储路径 (`.claude` → `.codex`)
- [ ] 精简 body 内容（可选但推荐）
- [ ] 测试验证 Skill 加载
- [ ] 更新文档和 README

### 压缩策略应用

使用 [Universal Skill Kit](../../README.md) 工具自动压缩：

```bash
# 自动转换（推荐）
usk convert ~/.claude/skills/my-skill --to codex --output ~/.codex/skills

# 手动压缩
# 参考前面的"编写精简描述的策略"章节
```

### 验证转换结果

```bash
# 检查描述长度
usk validate ~/.codex/skills/my-skill --platform codex

# 应该显示
# ✅ Description length: 480/500 characters
# ✅ Validation passed
```

## Codex 特定的最佳实践

### ✅ 应该做的

1. **Description 自包含**
   - 包含核心技术栈信息
   - 说明主要功能
   - 标注重要限制

2. **关键词优化**
   - 使用准确的技术术语
   - 包含版本号
   - 突出核心功能

3. **精简表达**
   - 去掉冗余词汇
   - 使用符号和缩写
   - 优先保留技术信息

4. **Body 结构化**
   - 清晰的章节标题
   - 快速开始放在前面
   - 详细内容放在后面

### ❌ 不应该做的

1. **Description 超过 500 字符**
   - 会导致加载失败
   - 必须严格控制长度

2. **Description 过于简略**
   - 虽然有 500 字符限制，但也要充分利用
   - 包含足够的关键信息

3. **依赖 Body 内容**
   - 不要假设 body 一定会被读取
   - Description 必须自包含核心信息

4. **路径使用 `.claude`**
   - 必须使用 `.codex` 目录
   - 否则 Codex 无法识别

## 常见问题

### Q: 如何判断描述是否过长？

A: 使用命令检查：

```bash
echo -n "你的描述" | wc -c
# 输出必须 ≤ 500
```

### Q: 描述压缩后还能保留足够信息吗？

A: 可以的，关键是：

- 使用技术术语（简洁但精确）
- 去掉冗余表达
- 保留版本号、核心功能、重要限制
- 参考本文档的压缩示例

### Q: Body 内容应该多详细？

A: 建议：

- **基础内容**: 保留核心使用指南
- **详细内容**: 可以保留，但不强制精简
- **原则**: Description 够用，Body 作为补充

### Q: Claude Skill 转换到 Codex 会丢失信息吗？

A: 主要影响：

- Description 需要压缩（信息密度更高）
- Body 内容完整保留（但可能不会被主动读取）
- 使用 Universal Skill Kit 可以智能压缩，最大程度保留关键信息

### Q: 如何测试 Skill 在 Codex 中是否有效？

A: 测试步骤：

1. 使用 `validate-codex-skill.sh` 验证格式
2. 在 Codex 中打开项目
3. 尝试激活 Skill
4. 验证是否能正确理解和使用

## 工具推荐

### Universal Skill Kit

专门用于 Claude 和 Codex Skills 互相转换的工具：

```bash
# 安装
npm install -g universal-skill-kit

# 转换 Claude Skill 到 Codex
usk convert ~/.claude/skills/my-skill --to codex

# 批量转换
usk batch-convert ~/.claude/skills --to codex

# 验证 Codex Skill
usk validate ~/.codex/skills/my-skill --platform codex
```

功能：

- ✅ 自动压缩 description（智能算法）
- ✅ 保留关键技术信息
- ✅ 更新路径 (`.claude` → `.codex`)
- ✅ 验证格式和长度

详见：[Universal Skill Kit 项目](../../README.md)

## 参考资源

### 官方文档

- **Codex Skills 官方文档**: https://github.com/openai/codex/blob/main/docs/skills.md
- **Codex CLI 文档**: https://github.com/openai/codex/blob/main/docs/

### 相关项目

- **Universal Skill Kit**: Claude ↔ Codex Skills 转换工具（本项目）
- **Claude Skills 指南**: [CLAUDE_SKILLS_GUIDE.md](CLAUDE_SKILLS_GUIDE.md)
- **平台对比**: [PLATFORM_COMPARISON.md](PLATFORM_COMPARISON.md)

### 社区

- GitHub Topics: `codex-skill`
- Codex Discord 社区

---

**重要提醒**: Codex Skills 的 **500 字符限制**是硬性要求，请务必验证！

使用 [Universal Skill Kit](../../README.md) 可以自动处理转换，无需手动压缩。🚀
