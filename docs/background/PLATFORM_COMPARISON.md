# Claude Code vs Codex - Skills 平台对比

## 快速对比表

| 特性              | Claude Code         | Codex              | 影响 |
| ----------------- | ------------------- | ------------------ | ---- |
| **描述长度限制**  | ❌ 无限制           | ⚠️ **500 字符**    | 高   |
| **Body 内容处理** | ✅ 注入到上下文     | ⚠️ 保留在磁盘      | 高   |
| **存储位置**      | `~/.claude/skills/` | `~/.codex/skills/` | 中   |
| **文件格式**      | YAML + Markdown     | YAML + Markdown    | -    |
| **资源文件支持**  | ✅ 完整支持         | ✅ 完整支持        | -    |
| **版本管理**      | ✅ 语义化版本       | ✅ 语义化版本      | -    |
| **文档复杂度**    | ✅ 支持详细文档     | ⚠️ 需要精简        | 高   |
| **适用场景**      | 详细指南、教程      | 快速参考、工具     | 中   |

## 详细对比

### 1. 描述长度限制 ⭐⭐⭐

#### Claude Code: 无限制 ✅

```yaml
---
description: |
  这是一个非常详细的 Skill 描述，可以包含大量的背景信息、技术细节、
  使用场景说明、代码示例参考、最佳实践指南等等内容。没有字符数限制，
  可以充分表达 Skill 的功能和用途。可以包含多个段落，详细说明各种
  使用场景和注意事项...（可以继续写很长）
---
```

**优点**:

- 可以详细说明功能和用途
- 包含丰富的背景信息
- 提供使用场景和示例

**缺点**:

- 可能过于冗长
- 关键信息可能被淹没

#### Codex: 最多 500 字符 ⚠️

```yaml
---
description: 专用于 React 16.14 + DVA 2.x + @lianjia/antd-life 技术栈。创建列表页（CRUD）、详情页、表单弹窗或编写 DVA Model 时使用。不适用于 React 18 或 Ant Design 5 项目。提供完整模板、代码示例和质量检查清单。支持函数组件、Hooks、CSS Modules 和 ESM 模块。包含 useModalFactory、pageModelFactory 等常用工具。
---
```

**字符数**: 254 字符（✅ 符合限制）

**优点**:

- 强制精简，突出重点
- 信息密度高
- 加载更快

**缺点**:

- 必须精心设计
- 可能难以表达复杂功能
- 需要压缩技巧

#### 对比总结

| 方面         | Claude   | Codex  | 建议                     |
| ------------ | -------- | ------ | ------------------------ |
| **表达空间** | 充足     | 有限   | Codex 需要精心设计       |
| **信息密度** | 可高可低 | 必须高 | Codex 需要每个字都有价值 |
| **设计难度** | 简单     | 较高   | Codex 需要反复打磨       |

### 2. Body 内容处理 ⭐⭐⭐

#### Claude Code: 注入到上下文 ✅

```markdown
---
name: my-skill
description: 简短描述
---

# 详细内容

这里的所有内容都会被注入到 Claude 的上下文中，
Claude 可以直接引用和使用这些信息。

## 章节 1

详细说明...

## 章节 2

更多内容...
```

**特点**:

- Body 内容自动加载到上下文
- Claude 可以直接引用 body 中的信息
- 支持长文档和详细说明

**适合**:

- 详细的教程和指南
- 复杂的工作流程
- 大量的代码示例

#### Codex: 保留在磁盘 ⚠️

```markdown
---
name: my-skill
description: 完整的描述（需要自包含核心信息）
---

# 补充内容

这些内容默认不会被加载，
只有在用户显式请求时才会读取。

Description 必须包含足够的信息让 Codex 理解用途。
```

**特点**:

- Body 默认不注入上下文
- Description 必须自包含核心信息
- Body 作为参考文档

**适合**:

- 快速参考工具
- 简洁的代码生成器
- 核心功能明确的 Skill

#### 对比总结

| 方面          | Claude    | Codex            | 影响                          |
| ------------- | --------- | ---------------- | ----------------------------- |
| **Body 加载** | 自动      | 按需             | Codex 需要 description 自包含 |
| **文档长度**  | 可以很长  | 建议精简         | Codex 不鼓励长文档            |
| **设计策略**  | Body 为主 | Description 为主 | 完全不同的设计思路            |

### 3. 存储位置 ⭐

#### Claude Code

```bash
# 全局 Skills
~/.claude/skills/
├── skill-1/
│   └── SKILL.md
└── skill-2/
    └── SKILL.md

# 项目 Skills
/path/to/project/.claude/skills/
├── skill-a/
│   └── SKILL.md
└── skill-b/
    └── SKILL.md
```

#### Codex

```bash
# 全局 Skills
~/.codex/skills/
├── skill-1/
│   └── SKILL.md
└── skill-2/
    └── SKILL.md

# 项目 Skills
/path/to/project/.codex/skills/
├── skill-a/
│   └── SKILL.md
└── skill-b/
    └── SKILL.md
```

**差异**: 只是目录名不同（`.claude` vs `.codex`）

**影响**:

- 需要分别维护两套 Skills
- 或使用工具自动转换

### 4. 文件格式和结构

#### 完全相同 ✅

两个平台使用相同的文件格式：

```markdown
---
name: skill-name
version: 1.0.0
description: 描述内容
---

# Markdown Body

内容...
```

**好处**:

- 易于在平台间转换
- 学习成本低
- 可以使用相同的工具

### 5. 使用体验对比

#### Claude Code

**特点**:

- 🎯 自动识别和加载 Skills
- 📚 支持详细的文档和教程
- 💡 可以包含大量的代码示例
- 🔍 上下文感知，智能激活

**适合场景**:

- 需要详细说明的复杂工作流
- 包含大量示例的教程型 Skill
- 需要背景知识的专业领域

**示例 Skill**:

- React 全栈开发指南（详细教程）
- 算法和数据结构手册（理论+实践）
- 企业级架构设计指南（复杂流程）

#### Codex

**特点**:

- ⚡ 快速加载（description-only）
- 🎯 精准定位（精简描述）
- 📦 轻量级（最小上下文占用）
- 🔧 工具导向（快速生成）

**适合场景**:

- 代码生成工具
- 快速参考手册
- 简单明确的任务

**示例 Skill**:

- API 代码生成器（明确输入输出）
- Git 命令快速参考（常用命令）
- 代码格式化工具（单一功能）

## 转换策略

### Claude → Codex

**挑战**:

1. 压缩 description 到 500 字符
2. 确保 description 自包含核心信息
3. 精简 body 内容（可选）

**策略**:

1. **Description 压缩** ⭐⭐⭐

   ```
   原文 (800 字符):
   这是一个专门用于构建基于 React 16.14 + DVA 2.x...（详细描述）

   压缩后 (480 字符):
   专用于 React 16.14 + DVA 2.x + @lianjia/antd-life...（精简版）
   ```

   **技巧**:
   - 去掉冗余词汇（"这是一个"、"专门用于"）
   - 使用简写和符号
   - 保留技术关键词和版本号
   - 移除详细说明，保留核心信息

2. **路径更新**

   ```bash
   # 从
   ~/.claude/skills/my-skill/

   # 到
   ~/.codex/skills/my-skill/
   ```

3. **Body 优化**（可选）
   - 提炼核心内容
   - 移除冗长说明
   - 保留关键示例

### Codex → Claude

**挑战**:
几乎没有挑战，因为 Claude 限制更少。

**策略**:

1. **扩展 description**

   ```
   原文 (480 字符):
   专用于 React 16.14...

   扩展后 (800+ 字符):
   这是一个专门用于构建基于 React 16.14...（可以添加更多细节）
   ```

2. **丰富 body 内容**
   - 添加更多示例
   - 补充详细说明
   - 包含背景知识

3. **路径更新**

   ```bash
   # 从
   ~/.codex/skills/my-skill/

   # 到
   ~/.claude/skills/my-skill/
   ```

## Universal Skill Kit 如何解决差异

### 智能转换

```bash
# Claude → Codex（自动压缩）
usk convert ~/.claude/skills/my-skill --to codex

# 自动完成：
# ✅ Description 智能压缩（保留关键信息）
# ✅ 路径自动更新（.claude → .codex）
# ✅ 验证格式和长度
```

### 双向支持

```bash
# Codex → Claude（自动扩展）
usk convert ~/.codex/skills/my-skill --to claude

# 自动完成：
# ✅ Description 可以保留或扩展
# ✅ 路径自动更新（.codex → .claude）
```

### 统一开发

使用 `skill.config.json` 一次编写，两个平台都支持：

```json
{
  "name": "my-skill",
  "platforms": {
    "claude": { "enabled": true },
    "codex": { "enabled": true }
  },
  "description": {
    "full": "详细描述（Claude）",
    "short": "精简描述（Codex，≤ 500）"
  }
}
```

```bash
# 一次构建，生成两个版本
usk build --platform all

# 输出：
# ✅ .claude/skills/my-skill/  （详细版）
# ✅ .codex/skills/my-skill/   （精简版）
```

## 选择建议

### 选择 Claude Code 当...

✅ 需要详细的文档和教程
✅ Skill 功能复杂，需要大量说明
✅ 包含丰富的代码示例
✅ 需要背景知识和理论说明
✅ 面向学习和理解

**示例**: React 全栈开发指南、算法手册、架构设计指南

### 选择 Codex 当...

✅ Skill 功能明确且简单
✅ 快速代码生成工具
✅ 简洁的参考手册
✅ 单一职责的实用工具
✅ 面向快速执行

**示例**: API 生成器、Git 命令参考、代码格式化工具

### 两个平台都支持 ⭐推荐

使用 **Universal Skill Kit** 同时支持两个平台：

```bash
# 一次开发
vi SKILL.md
vi skill.config.json

# 构建两个版本
usk build --platform all

# 两个平台都能用！
```

**优点**:

- 最大化用户覆盖
- 统一维护
- 自动适配平台特性

## 实战案例

### 案例 1: React Hooks Expert

**Claude 版本**:

- Description: 详细的 800 字说明
- Body: 10000+ 行教程和示例
- 包含：理论、原理、最佳实践、常见问题

**Codex 版本**:

- Description: 精简的 480 字核心信息
- Body: 5000 行快速参考
- 包含：核心用法、常用模式、快速示例

**转换**:

```bash
usk convert ~/.claude/skills/react-hooks-expert --to codex
# ✅ Description 自动压缩
# ✅ 保留关键技术信息
# ✅ Body 保持完整（可选精简）
```

### 案例 2: API Generator

**原始（适合两个平台）**:

- Description: 320 字简洁说明
- Body: 2000 行使用指南
- 功能：从 OpenAPI 生成代码

**部署**:

```bash
# 同时部署两个平台
cp -r api-generator ~/.claude/skills/
cp -r api-generator ~/.codex/skills/

# 两个平台都能完美使用
```

**原因**: 功能明确，description 本来就简洁，符合两个平台要求。

## 总结

### 核心差异

| 差异点   | Claude Code | Codex     |
| -------- | ----------- | --------- |
| **哲学** | 详细完整    | 精简高效  |
| **限制** | 宽松        | 严格      |
| **适用** | 教程/指南   | 工具/参考 |

### 最佳实践

1. **了解差异** - 理解两个平台的不同特点
2. **选择合适** - 根据 Skill 特点选择平台
3. **使用工具** - 利用 Universal Skill Kit 自动转换
4. **双平台支持** - 尽可能同时支持两个平台

### 工具支持

```bash
# 安装 Universal Skill Kit
npm install -g universal-skill-kit

# 查看帮助
usk --help

# 转换
usk convert <source> --to <platform>

# 验证
usk validate <skill-dir> --platform <platform>

# 统一开发
usk init my-skill --template universal
usk build --platform all
```

## 参考文档

### 官方文档

- **Claude Code Skills**: https://code.claude.com/docs/en/skills
- **Codex Skills**: https://github.com/openai/codex/blob/main/docs/skills.md

### 本项目文档

- [Claude Skills 开发指南](CLAUDE_SKILLS_GUIDE.md)
- [Codex Skills 开发指南](CODEX_SKILLS_GUIDE.md)
- [Universal Skill Kit 主文档](../../README.md)
- [技术设计文档](../TECHNICAL_DESIGN.md)

---

**让 Skills 在两个平台无缝运行！** 🚀
