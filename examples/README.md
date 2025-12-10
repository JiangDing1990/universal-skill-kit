# Universal Skill Kit - Examples

示例项目集合，展示USK的各种用法和最佳实践。

## 📚 示例列表

### 1. [Real-World Skill](./real-world-skill/)

真实的企业级React开发Skill示例。

**特点**：

- ✅ 完整的技术栈描述（1018字符）
- ✅ 详细的代码示例
- ✅ 压缩策略对比
- ✅ 最佳实践展示

**学习内容**：

- 如何编写高质量Skill
- 如何处理超长描述
- 如何选择压缩策略
- 如何保留关键信息

**快速开始**：

```bash
cd real-world-skill
usk analyze SKILL.md
usk convert SKILL.md -t codex -o ./output
```

---

## 🎯 按场景浏览

### 场景1：首次使用USK

推荐：

1. 先看[Quick Start](../README.md#-quick-start)
2. 然后试试[Real-World Skill](./real-world-skill/)

### 场景2：学习压缩策略

推荐：

1. [Real-World Skill](./real-world-skill/) - 对比三种策略

### 场景3：多文件Skill

待添加（Phase 2）

### 场景4：批量转换

待添加（Phase 2）

---

## 📖 示例结构说明

每个示例都包含：

```
example-name/
├── README.md          # 示例说明和学习指南
├── SKILL.md           # 示例Skill文件
├── expected-output/   # 预期输出（可选）
└── notes.md           # 额外说明（可选）
```

---

## 🚀 如何使用这些示例

### 方式1：直接运行

```bash
# 进入示例目录
cd examples/real-world-skill

# 运行USK命令
usk analyze SKILL.md
usk convert SKILL.md -t codex -o ./output
```

### 方式2：复制修改

```bash
# 复制示例到你的项目
cp -r examples/real-world-skill ./my-skill

# 修改内容
vim my-skill/SKILL.md

# 测试转换
usk convert my-skill/SKILL.md -t codex
```

### 方式3：作为模板

```bash
# 使用示例作为起点
cp examples/real-world-skill/SKILL.md ./new-skill.md

# 根据你的需求修改
# - 更新描述
# - 更新代码示例
# - 更新技术栈
```

---

## 💡 学习路径建议

### 初学者

1. **阅读** [Quick Start](../README.md#-quick-start)
2. **运行** [Real-World Skill](./real-world-skill/) 示例
3. **修改** 示例内容，观察变化
4. **创建** 自己的第一个Skill

### 进阶用户

1. **对比** 不同压缩策略的效果
2. **实验** 描述写法对压缩的影响
3. **集成** USK到CI/CD流程
4. **贡献** 更多示例到项目

---

## 🎓 关键概念

通过这些示例，你将掌握：

### 1. Skill结构

```markdown
---
name: skill-name
description: Skill description here
version: 1.0.0
tags: [tag1, tag2]
---

# Skill Body

Content goes here...
```

### 2. 压缩策略选择

| 描述长度 | 推荐策略     |
| -------- | ------------ |
| < 500    | 无需压缩     |
| 500-600  | conservative |
| 600-800  | balanced ⭐  |
| 800+     | aggressive   |

### 3. 关键信息保留

USK自动保留：

- ✅ 版本号（16.14, v2.x）
- ✅ 技术栈名称（React, TypeScript）
- ✅ 重要约束（NOT compatible with）

### 4. 质量评估

```bash
usk analyze your-skill.md
```

关注：

- Quality Score (>80为优秀)
- Technical Keywords
- Recommended Strategy

---

## 📝 贡献示例

欢迎贡献更多示例！

### 示例要求

1. **真实性** - 基于真实场景
2. **完整性** - 包含完整的README和说明
3. **教育性** - 清晰的学习目标
4. **可运行** - 能直接使用USK命令

### 提交流程

1. Fork项目
2. 在`examples/`下创建新示例
3. 编写README说明学习要点
4. 提交Pull Request

---

## 🔗 相关资源

- [用户指南](../docs/USER_GUIDE.md) - 完整的使用文档
- [技术设计](../docs/TECHNICAL_DESIGN.md) - 了解内部实现
- [开发路线图](../docs/ROADMAP.md) - 未来计划

---

## ❓ 常见问题

### Q: 示例可以直接用于生产吗？

A: 示例主要用于学习和参考。在生产环境使用前，请：

- 根据实际需求修改
- 测试转换结果
- 验证质量评分

### Q: 如何知道选择哪个示例？

A: 参考上面的"按场景浏览"部分，或直接查看各示例的README。

### Q: 示例会更新吗？

A: 会的！我们会持续添加新示例，并更新现有示例。

---

<div align="center">

**Happy Learning! 🎓**

[返回主页](../README.md) | [查看文档](../docs/)

</div>
