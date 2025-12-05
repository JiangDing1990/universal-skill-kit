# Skills 平台背景文档

这个目录包含 Claude Code 和 Codex 两个 AI CLI 平台的 Skills 开发背景资料。

## 📚 文档列表

### 1. [Claude Skills 开发指南](CLAUDE_SKILLS_GUIDE.md)

**适合**: Claude Code 用户和 Skill 开发者

**内容**:

- Claude Skills 基础概念
- SKILL.md 文件格式详解
- YAML frontmatter 字段说明
- Body 内容组织最佳实践
- 存储位置和安装方法
- 编写高质量 Skill 的技巧
- 资源文件管理
- 版本管理和发布流程

**特点**:

- ✅ 无 description 长度限制
- ✅ Body 内容注入到上下文
- ✅ 支持详细文档和教程

**官方文档**: https://code.claude.com/docs/en/skills

---

### 2. [Codex Skills 开发指南](CODEX_SKILLS_GUIDE.md)

**适合**: Codex 用户和跨平台开发者

**内容**:

- Codex Skills 基础概念
- 与 Claude Skills 的关键差异
- **500 字符 description 限制** 应对策略
- Description 压缩技巧和示例
- Body 内容精简建议
- 从 Claude Skill 迁移的完整流程
- 验证工具和脚本
- Codex 特定的最佳实践

**特点**:

- ⚠️ Description 最多 500 字符
- ⚠️ Body 内容保留在磁盘（按需加载）
- ✅ 强制精简，信息密度高

**官方文档**: https://github.com/openai/codex/blob/main/docs/skills.md

---

### 3. [平台对比文档](PLATFORM_COMPARISON.md)

**适合**: 所有开发者，特别是需要跨平台支持的

**内容**:

- Claude Code vs Codex 详细对比表
- 核心差异分析（5 个方面）
  - 描述长度限制
  - Body 内容处理
  - 存储位置
  - 文件格式
  - 使用体验
- 转换策略（双向）
- Universal Skill Kit 如何解决差异
- 平台选择建议
- 实战案例分析

**适用场景**:

- 🔄 需要在两个平台间转换 Skills
- 📊 评估选择哪个平台
- 🛠️ 开发跨平台 Skills
- 📈 理解平台差异对 Skill 设计的影响

---

## 🎯 快速导航

### 我是新手，想了解 Skills

1. 先读 [Claude Skills 开发指南](CLAUDE_SKILLS_GUIDE.md)
   - 了解基础概念
   - 学习文件格式
   - 掌握编写方法

2. 再读 [Codex Skills 开发指南](CODEX_SKILLS_GUIDE.md)
   - 了解 Codex 的特殊限制
   - 学习描述压缩技巧

3. 最后看 [平台对比文档](PLATFORM_COMPARISON.md)
   - 理解两个平台的差异
   - 选择适合的平台

### 我有 Claude Skill，想转到 Codex

1. 读 [Codex Skills 开发指南](CODEX_SKILLS_GUIDE.md)
   - 重点看"500 字符限制"部分
   - 学习压缩策略

2. 读 [平台对比文档](PLATFORM_COMPARISON.md)
   - 看"Claude → Codex 转换策略"
   - 了解 Universal Skill Kit 的自动转换功能

3. 使用工具转换
   ```bash
   usk convert ~/.claude/skills/my-skill --to codex
   ```

### 我有 Codex Skill，想转到 Claude

1. 读 [Claude Skills 开发指南](CLAUDE_SKILLS_GUIDE.md)
   - 了解 Claude 的优势（无长度限制）
   - 学习如何扩展内容

2. 使用工具转换（几乎无需修改）
   ```bash
   usk convert ~/.codex/skills/my-skill --to claude
   ```

### 我想同时支持两个平台

1. 读 [平台对比文档](PLATFORM_COMPARISON.md)
   - 看"Universal Skill Kit 如何解决差异"
   - 了解统一开发模式

2. 使用 skill.config.json 统一开发

   ```bash
   usk init my-skill --template universal
   usk build --platform all
   ```

3. 结果
   ```
   ✅ .claude/skills/my-skill/  (Claude 版本)
   ✅ .codex/skills/my-skill/   (Codex 版本)
   ```

### 我想选择合适的平台

阅读 [平台对比文档](PLATFORM_COMPARISON.md) 的"选择建议"章节：

**选择 Claude Code 当**:

- 需要详细文档和教程
- Skill 功能复杂
- 包含大量示例

**选择 Codex 当**:

- 功能明确简单
- 快速代码生成
- 单一职责工具

**两个都支持**（推荐）:

- 使用 Universal Skill Kit
- 最大化用户覆盖

## 📊 对比速查表

| 特性      | Claude Code | Codex      | 工具支持    |
| --------- | ----------- | ---------- | ----------- |
| 描述长度  | 无限制      | ≤ 500 字符 | ✅ 自动压缩 |
| Body 处理 | 注入上下文  | 磁盘保留   | ✅ 自动优化 |
| 存储位置  | `.claude/`  | `.codex/`  | ✅ 自动映射 |
| 适用场景  | 教程/指南   | 工具/参考  | ✅ 双平台   |

## 🔧 Universal Skill Kit 工具

本项目（Universal Skill Kit）提供完整的工具链：

### 核心功能

1. **一键转换**

   ```bash
   usk convert <source> --to <platform>
   ```

   - 智能压缩 description
   - 自动更新路径
   - 保留关键信息

2. **批量转换**

   ```bash
   usk batch-convert ~/.claude/skills --to codex
   ```

   - 并行处理
   - 进度显示
   - 错误报告

3. **格式验证**

   ```bash
   usk validate <skill-dir> --platform <platform>
   ```

   - 检查 description 长度
   - 验证 YAML 格式
   - 检查路径有效性

4. **统一开发**

   ```bash
   usk init my-skill --template universal
   usk build --platform all
   ```

   - 一次编写
   - 多平台部署
   - 自动适配

### 安装

```bash
npm install -g universal-skill-kit
```

### 使用示例

```bash
# 转换单个 Skill
usk convert ~/.claude/skills/react-expert --to codex

# 验证 Codex Skill
usk validate ~/.codex/skills/react-expert --platform codex

# 创建跨平台 Skill
usk init my-awesome-skill --template universal
cd my-awesome-skill
usk build --platform all
```

## 📖 更多资源

### 本项目文档

- [项目主页](../../README.md) - Universal Skill Kit 介绍
- [技术设计](../TECHNICAL_DESIGN.md) - 详细的技术方案
- [开发路线图](../ROADMAP.md) - 三阶段开发计划
- [贡献指南](../../CONTRIBUTING.md) - 如何参与贡献

### 官方文档

- **Claude Code**: https://code.claude.com/docs
  - Skills 文档: https://code.claude.com/docs/en/skills
- **Codex**: https://github.com/openai/codex
  - Skills 文档: https://github.com/openai/codex/blob/main/docs/skills.md

### 示例

查看本项目的 [examples/](../../examples/) 目录：

- `simple-skill/` - 简单示例
- `universal-skill/` - 跨平台示例（使用模板引擎）

## 🤝 贡献

发现文档错误或有改进建议？欢迎：

1. 提交 Issue: https://github.com/yourusername/universal-skill-kit/issues
2. 提交 PR: https://github.com/yourusername/universal-skill-kit/pulls
3. 参与讨论: https://github.com/yourusername/universal-skill-kit/discussions

## 📝 文档维护

### 更新频率

- 跟随官方文档更新
- 每月检查链接有效性
- 根据社区反馈改进

### 版本历史

| 日期       | 版本  | 更新内容                   |
| ---------- | ----- | -------------------------- |
| 2024-12-05 | 1.0.0 | 初始版本，包含三个核心文档 |

---

**让 Skills 开发更简单！** 🚀

[返回主文档](../../README.md) | [查看技术设计](../TECHNICAL_DESIGN.md)
