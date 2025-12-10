# Real-World Skill Example

这个示例展示了如何使用Universal Skill Kit转换一个真实的企业级React开发Skill。

## 📋 关于这个示例

这是一个完整的企业级Skill，包含：

- 详细的技术栈说明（React 16.14, DVA 2.x）
- 完整的代码示例
- 最佳实践指南
- 故障排除说明
- **描述长度**: 1018字符（超过Codex 500字符限制）

## 🎯 学习目标

通过这个示例，你将学会：

1. 如何编写高质量的Skill描述
2. 如何处理超长描述的压缩
3. 如何保留关键技术信息
4. 如何验证转换质量

## 🚀 快速体验

### 1. 分析Skill质量

```bash
cd examples/real-world-skill
usk analyze SKILL.md
```

**预期输出**：

```
📊 Skill Analysis Report
══════════════════════════════════════════════════

Basic Information:
  Name: senior-frontend-engineer-react
  Version: 2.1.0
  Author: USK Team
  Tags: react, dva, typescript, crud, enterprise, frontend

Complexity Analysis:
  Level: HIGH
  Description Length: 1018 chars
  Has Code Examples: ✓

Technical Keywords:
  React, 16.14, DVA, 2.x, TypeScript, async/await, ...

Compression Strategy:
  Recommended: aggressive

Quality Assessment:
  Score: 95/100
```

### 2. 转换到Codex（使用推荐策略）

```bash
usk convert SKILL.md -t codex -o ./codex-output --verbose
```

**观察要点**：

- 压缩率应该在 50-60% 之间
- 保留了关键版本号（React 16.14, DVA 2.x）
- 保留了"NOT compatible with React 18"警告
- 技术关键词完整保留

### 3. 尝试不同压缩策略

#### 保守压缩

```bash
usk convert SKILL.md -t codex -s conservative -o ./test-conservative
```

#### 均衡压缩

```bash
usk convert SKILL.md -t codex -s balanced -o ./test-balanced
```

#### 激进压缩

```bash
usk convert SKILL.md -t codex -s aggressive -o ./test-aggressive
```

### 4. 对比压缩结果

```bash
# 查看压缩后的描述
head -10 ./test-conservative/SKILL.md
head -10 ./test-balanced/SKILL.md
head -10 ./test-aggressive/SKILL.md
```

## 📊 预期结果

| 策略         | 描述长度   | 压缩率 | 信息保留度 |
| ------------ | ---------- | ------ | ---------- |
| Original     | 1018 chars | -      | 100%       |
| Conservative | ~900 chars | ~12%   | 95%        |
| Balanced     | ~600 chars | ~41%   | 85%        |
| Aggressive   | ~495 chars | ~51%   | 75%        |

## 🎓 学习要点

### 1. 好的描述结构

```markdown
---
description: |
  [简短概述] + [核心能力列表]

  [技术栈明确说明]

  [重要兼容性说明]
---
```

### 2. 关键信息必须保留

- ✅ 版本号：React 16.14, DVA 2.x
- ✅ 技术栈：TypeScript, @lianjia/antd-life
- ✅ 约束条件：NOT compatible with React 18
- ✅ 核心功能：CRUD, pagination, validation

### 3. 可以删减的内容

- ❌ 冗余词汇："amazing", "powerful", "awesome"
- ❌ 详细示例：代码片段（body中有）
- ❌ 重复信息：已在其他地方说明的内容

## 🔍 深入分析

### 查看压缩详情（verbose模式）

```bash
usk convert SKILL.md -t codex -s aggressive --verbose
```

输出会显示：

- 原始描述长度
- 每个压缩步骤的结果
- 保留的关键词列表
- 最终压缩率

### JSON输出用于自动化

```bash
usk analyze SKILL.md --json > analysis.json
cat analysis.json | jq
```

## 📝 最佳实践总结

### ✅ DO（推荐）

1. **明确版本约束**

   ```markdown
   React 16.14, NOT compatible with React 18
   ```

2. **列举核心能力**

   ```markdown
   (1) List pages, (2) Form dialogs, (3) Detail views
   ```

3. **简洁技术栈**
   ```markdown
   Tech: React 16.14, DVA 2.x, TypeScript
   ```

### ❌ DON'T（避免）

1. **避免冗长废话**

   ```markdown
   ❌ This is an absolutely amazing and incredibly powerful skill...
   ✅ Enterprise React development skill for CRUD applications
   ```

2. **避免过多细节**

   ```markdown
   ❌ [包含5页代码示例]
   ✅ See examples in body
   ```

3. **避免模糊表述**
   ```markdown
   ❌ Works with React and other libraries
   ✅ React 16.14, DVA 2.x, Ant Design 3.x
   ```

## 🧪 实验建议

尝试修改SKILL.md中的描述，观察压缩效果：

1. **删除版本号** - 看看是否还能保留关键信息
2. **增加废话** - 看看压缩是否能自动移除
3. **改变描述结构** - 测试不同写法的压缩效果

## 📚 相关资源

- [用户指南](../../docs/USER_GUIDE.md)
- [技术设计](../../docs/TECHNICAL_DESIGN.md)
- [其他示例](../)

## 💡 提示

这个示例也展示了：

- 完整的代码示例（在body中）
- 良好的文档结构
- 清晰的版本兼容性说明
- 实用的故障排除指南

这些都是高质量Skill应该具备的特征！

---

试试转换这个Skill，看看效果如何吧！🚀
