# Universal Skill Kit 使用指南

## 目录

- [快速开始](#快速开始)
- [详细教程](#详细教程)
- [高级用法](#高级用法)
- [常见问题](#常见问题)
- [最佳实践](#最佳实践)

## 快速开始

### 安装

```bash
# 使用npm
npm install -g @usk/cli

# 使用pnpm（推荐）
pnpm add -g @usk/cli

# 验证安装
usk --version
```

### 第一次转换

```bash
# 1. 准备Skill文件
cd ~/.claude/skills/my-skill/

# 2. 转换到Codex
usk convert . -t codex -o ~/converted-skills/

# 3. 查看结果
ls ~/converted-skills/my-skill/
```

## 详细教程

### 教程1：转换单个Skill

#### 步骤1：检查Skill结构

确保你的Skill包含必要的文件：

```
my-skill/
├── SKILL.md          # 必需
├── templates/        # 可选
├── scripts/          # 可选
└── resources/        # 可选
```

#### 步骤2：分析Skill质量

```bash
usk analyze my-skill/
```

输出示例：
```
📊 Skill Analysis Report
═══════════════════════════════════════════════

Complexity Analysis:
  Level: MEDIUM
  Description Length: 450 chars

Quality Assessment:
  Score: 85/100

💡 Suggestions:
  ⚡ Consider adding author information
```

#### 步骤3：执行转换

```bash
usk convert my-skill/ -t codex -o ./output/
```

#### 步骤4：验证结果

```bash
# 检查输出目录
ls -R ./output/my-skill/

# 查看转换后的SKILL.md
cat ./output/my-skill/SKILL.md
```

---

### 教程2：批量转换Skills

#### 场景：转换多个Skills到Codex

```bash
# 转换所有Skill目录
usk batch "~/.claude/skills/*/" -t codex -o ~/codex-skills/

# 输出
📊 Batch Conversion Summary
═══════════════════════════════════════════════

Overall Statistics:
  Total Files: 15
  Successful: 14
  Failed: 1
  Avg Compression: 35.2%
  Total Time: 450ms

Individual Results:
  ✓ skill-1 (42.3% compression)
  ✓ skill-2 (28.1% compression)
  ✗ skill-3 (failed)
  ...
```

---

### 教程3：处理验证错误

#### 场景：Skill缺少资源文件

```bash
$ usk convert my-skill/ -t codex

✖ Validation failed

❌ Validation Errors:
  • [resources] Referenced file not found: templates/missing.txt

Use --interactive to override validation errors.
```

**解决方案1：修复错误**
```bash
# 创建缺失的文件
touch my-skill/templates/missing.txt

# 重新转换
usk convert my-skill/ -t codex
```

**解决方案2：强制转换（不推荐）**
```bash
# 使用交互模式
usk convert my-skill/ -t codex --interactive

# 系统会询问：
? Skill has validation errors. Continue anyway? (y/N)
```

---

### 教程4：优化长描述

#### 场景：描述超过500字符

```bash
$ usk convert my-skill/ -t codex

⚠️  Validation Warnings:
  ℹ [description] Description is 888 chars (Codex limit: 500)

ℹ️  Platform-Specific Notes:
  • [description] Will be compressed to 409 chars (53.9% compression)
```

**选择合适的压缩策略**：

```bash
# 1. Conservative（保守）- 尽量保留内容
usk convert my-skill/ -t codex -s conservative

# 2. Balanced（平衡）- 推荐
usk convert my-skill/ -t codex -s balanced

# 3. Aggressive（激进）- 最大压缩
usk convert my-skill/ -t codex -s aggressive
```

**手动优化描述**：
```yaml
# 优化前（888字符）
description: "这是一个非常详细的Skill描述，包含了完整的技术栈信息和使用说明。本Skill基于React 16.14和DVA 2.x架构..."

# 优化后（<500字符）
description: "React 16.14 + DVA 2.x 技术栈Skill，快速生成CRUD页面和表单组件。支持数据验证、状态管理、路由配置。"
```

---

## 高级用法

### 使用交互模式

交互模式提供友好的问答式界面：

```bash
usk convert my-skill/ -t codex --interactive
```

会依次询问：
1. 目标平台 (claude/codex)
2. 压缩策略 (conservative/balanced/aggressive)
3. 输出目录
4. 是否覆盖验证错误（如果有）

### JSON格式输出

适合脚本自动化处理：

```bash
# 分析Skill并输出JSON
usk analyze my-skill/ --json > report.json

# 使用jq处理
usk analyze my-skill/ --json | jq '.estimatedQuality'
```

### 结合Shell脚本

批量自动化处理：

```bash
#!/bin/bash
# convert-all.sh

SKILLS_DIR=~/.claude/skills
OUTPUT_DIR=~/codex-skills

for skill in "$SKILLS_DIR"/*; do
  if [ -d "$skill" ]; then
    echo "Converting $(basename "$skill")..."
    usk convert "$skill" -t codex -o "$OUTPUT_DIR"
  fi
done

echo "All conversions completed!"
```

### 自定义关键词保留

通过API使用自定义关键词保留：

```typescript
import { DescriptionCompressor } from '@usk/core'

const compressor = new DescriptionCompressor()
const result = compressor.compress(longDescription, {
  maxLength: 500,
  strategy: 'balanced',
  customKeywords: ['React 16.14', 'DVA 2.x', '@lianjia/antd-life']
})

console.log('Compressed:', result.text)
console.log('Preserved keywords:', result.preservedKeywords)
```

---

## 常见问题

### Q1: 支持哪些Skill结构？

**A**: 支持以下结构：

✅ **单文件Skill**
```
my-skill.md
```

✅ **目录Skill（推荐）**
```
my-skill/
├── SKILL.md
├── templates/
├── scripts/
└── resources/
```

✅ **嵌套子目录**
```
my-skill/
└── components/
    └── templates/
        └── template.md
```

---

### Q2: 如何处理描述压缩？

**A**: 系统会自动处理：

1. **分析阶段**：分析描述复杂度，推荐压缩策略
2. **验证阶段**：检查描述长度，提示压缩需求
3. **转换阶段**：应用压缩策略，生成符合限制的描述

**压缩策略对比**：

| 策略 | 原长度 | 压缩后 | 保留信息 | 适用场景 |
|------|--------|--------|----------|---------|
| Conservative | 888 | ~600 | 90% | 描述接近限制 |
| Balanced | 888 | ~409 | 70% | 一般场景（推荐）|
| Aggressive | 888 | ~280 | 50% | 描述极长 |

---

### Q3: 如何知道哪些信息丢失了？

**A**: 转换完成后会显示统计信息：

```bash
Statistics:
  Original Length: 888 chars
  Final Length: 409 chars
  Compression: 53.9%

✓ Preserved Keywords: React, TypeScript, API, DVA, 16.14, 2.x

⚠ Lost Keywords: example, tutorial, detailed
```

---

### Q4: 转换失败怎么办？

**A**: 检查错误信息并修复：

**常见错误及解决方案**：

1. **SKILL.md not found**
   ```bash
   # 确保目录中有SKILL.md文件
   ls my-skill/SKILL.md
   ```

2. **Referenced file not found**
   ```bash
   # 检查资源文件是否存在
   ls my-skill/templates/

   # 或移除SKILL.md中的引用
   ```

3. **Invalid YAML frontmatter**
   ```bash
   # 检查YAML语法
   usk analyze my-skill/
   ```

---

### Q5: 如何保证转换质量？

**A**: 使用以下检查流程：

1. **转换前分析**
   ```bash
   usk analyze my-skill/
   ```

2. **检查质量分数**
   - > 80分：高质量，直接转换
   - 60-80分：中等质量，注意警告
   - < 60分：低质量，建议优化

3. **对比转换前后**
   ```bash
   # 查看统计信息
   # 检查保留/丢失的关键词
   ```

4. **手动验证**
   ```bash
   # 查看转换后的文件
   cat output/my-skill/SKILL.md

   # 检查资源文件
   ls -R output/my-skill/
   ```

---

### Q6: 支持远程GitHub仓库吗？

**A**: 当前版本（v0.3.0）暂不支持，但已在路线图中：

**临时方案**：
```bash
# 1. 先克隆仓库
git clone https://github.com/user/awesome-skills.git

# 2. 然后批量转换
usk batch "awesome-skills/**/*.md" -t codex
```

**计划支持**（v1.0.0）：
```bash
# 直接从GitHub转换（未来功能）
usk convert https://github.com/user/repo/tree/main/my-skill -t codex
```

---

## 最佳实践

### 1. Skill开发最佳实践

#### 编写高质量的Description

✅ **好的做法**：
```yaml
description: "React 16.14 + DVA 2.x Skill，快速生成CRUD页面和表单组件。支持数据验证、状态管理、路由配置。适合企业级应用开发。"
```

❌ **不好的做法**：
```yaml
description: "这是一个非常厉害的Skill，可以帮助你做很多事情，包括但不限于创建组件、管理状态、配置路由等等等等..."
```

**原则**：
- 开门见山，先说技术栈和版本
- 列出核心功能（3-5个）
- 说明适用场景
- 避免废话和重复

---

#### 组织文件结构

**推荐结构**：
```
my-skill/
├── SKILL.md              # 主文档
├── templates/            # 模板文件（统一后缀.template.md）
│   ├── component.template.md
│   └── page.template.md
├── scripts/              # 脚本文件
│   ├── setup.sh          # 设置脚本
│   └── helper.ts         # 辅助函数
└── resources/            # 配置文件
    └── config.yaml       # 配置信息
```

**命名规范**：
- 模板文件：`*.template.md` 或 `*.template.json`
- 脚本文件：`*.sh`, `*.js`, `*.ts`
- 配置文件：`config.yaml`, `settings.json`

---

### 2. 转换最佳实践

#### 转换前检查

```bash
# 1. 分析Skill
usk analyze my-skill/

# 2. 检查质量分数
# Quality Score: 85/100 ✅

# 3. 查看建议
# 💡 Suggestions: ...

# 4. 根据建议优化Skill
# (修改SKILL.md)

# 5. 重新分析确认
usk analyze my-skill/
```

#### 选择合适的压缩策略

根据描述长度选择：

| 描述长度 | 推荐策略 | 说明 |
|---------|---------|------|
| < 500 | 无需压缩 | 直接转换 |
| 500-800 | Conservative | 轻度压缩 |
| 800-1500 | Balanced | 适度压缩（推荐）|
| > 1500 | Aggressive | 激进压缩 |

```bash
# 根据分析结果选择策略
usk convert my-skill/ -t codex -s balanced
```

---

### 3. 批量转换最佳实践

#### 使用合适的glob模式

```bash
# 转换所有.md文件
usk batch "skills/**/*.md" -t codex

# 只转换特定目录
usk batch "skills/react/*/" -t codex

# 排除某些文件（使用shell）
find skills/ -name "SKILL.md" -not -path "*/draft/*" | \
  xargs -I {} usk convert {} -t codex
```

#### 处理失败的转换

```bash
# 批量转换会继续处理，即使某些失败
usk batch "skills/*/" -t codex -o output/

# 查看失败的文件
📊 Batch Conversion Summary
─────────────────────────────
Successful: 14
Failed: 1

⚠️  Failed Conversions:
  • skills/broken-skill/
```

**处理策略**：
1. 记录失败的Skills
2. 单独分析失败原因
3. 修复后重新转换

---

### 4. 团队协作最佳实践

#### 统一配置

创建团队配置文件：

```bash
# .uskrc.json
{
  "defaultPlatform": "codex",
  "compressionStrategy": "balanced",
  "outputDir": "./dist",
  "validation": {
    "strictMode": false,
    "ignoreWarnings": ["missing_author"]
  }
}
```

#### CI/CD集成

```yaml
# .github/workflows/convert-skills.yml
name: Convert Skills

on:
  push:
    paths:
      - 'skills/**'

jobs:
  convert:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install USK
        run: npm install -g @usk/cli

      - name: Convert Skills
        run: usk batch "skills/**/*.md" -t codex -o ./dist

      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: converted-skills
          path: ./dist
```

---

## 高级用法

### 使用编程API

#### 完整转换流程

```typescript
import {
  SkillParser,
  SkillValidator,
  SkillAnalyzer,
  SkillConverter
} from '@usk/core'

async function convertWithValidation(skillPath: string) {
  // 1. 解析
  const parser = new SkillParser()
  const skill = await parser.parse(skillPath)

  // 2. 验证
  const validator = new SkillValidator()
  const validation = await validator.validate(skill, skillPath)

  if (!validation.valid) {
    console.error('Validation failed:', validation.errors)
    return
  }

  // 3. 分析
  const analyzer = new SkillAnalyzer()
  const report = analyzer.analyze(skill)

  console.log('Quality:', report.estimatedQuality)
  console.log('Strategy:', report.recommendedStrategy)

  // 4. 转换
  const converter = new SkillConverter()
  const result = await converter.convert(skillPath, {
    targetPlatform: 'codex',
    compressionStrategy: report.recommendedStrategy
  })

  console.log('Done:', result.outputPath)
  return result
}
```

#### 自定义验证规则

```typescript
import { SkillValidator } from '@usk/core'

class CustomValidator extends SkillValidator {
  async validate(skill, skillPath) {
    const result = await super.validate(skill, skillPath)

    // 添加自定义规则
    if (!skill.metadata.license) {
      result.warnings.push({
        field: 'metadata',
        message: 'License field is missing',
        severity: 'low'
      })
    }

    return result
  }
}
```

---

### 错误处理

#### 捕获和处理错误

```typescript
try {
  const result = await converter.convert(skillPath, options)
  console.log('Success:', result.outputPath)
} catch (error) {
  if (error.message.includes('SKILL.md not found')) {
    console.error('Skill directory must contain SKILL.md')
  } else if (error.message.includes('not found')) {
    console.error('Input path does not exist')
  } else {
    console.error('Conversion failed:', error.message)
  }
}
```

---

## 常见问题

### 使用问题

#### Q: 如何知道工具是否正常工作？

A: 运行测试命令：
```bash
# 转换示例Skill
usk convert examples/simple-skill/ -t codex -o /tmp/test
```

---

#### Q: 转换速度慢怎么办？

A: 优化建议：
```bash
# 1. 使用并行模式（批量转换）
usk batch "skills/*/" -t codex --parallel

# 2. 减少不必要的文件引用
# (移除SKILL.md中不需要的资源引用)

# 3. 使用更快的压缩策略
usk convert my-skill/ -s conservative
```

---

#### Q: 如何跳过验证？

A: 当前版本验证是强制的，但可以：
```bash
# 交互模式下选择继续
usk convert my-skill/ --interactive
# 然后选择 "y" 继续

# 或修复验证错误后再转换
```

---

### 技术问题

#### Q: 路径没有正确转换？

A: 确认路径格式：
```yaml
# ✅ 支持的路径格式
~/.claude/skills/my-skill
.claude/config.json
/Users/name/.claude/skills

# ⚠️ 可能不转换的格式
某些特殊上下文中的.claude
```

---

#### Q: 资源文件没有复制？

A: 检查资源引用格式：
```markdown
# ✅ 正确的引用格式
[Template](templates/example.md)
[Script](scripts/setup.sh)

# ❌ 错误的引用格式
[Template](../other-skill/template.md)  # 外部引用
[Script](http://example.com/script.sh)  # 远程URL
```

---

#### Q: 权限问题（Windows）？

A: Windows上脚本权限处理：
```bash
# USK会尝试设置可执行权限
# 但Windows可能忽略chmod

# 手动添加权限（WSL）
chmod +x output/my-skill/scripts/*.sh
```

---

## 最佳实践总结

### ✅ 推荐做法

1. **转换前先分析**
   ```bash
   usk analyze my-skill/
   ```

2. **使用目录结构**
   ```
   my-skill/
   └── SKILL.md  # 而不是单个.md文件
   ```

3. **编写清晰的描述**
   - 先说技术栈和版本
   - 列出核心功能
   - 说明适用场景

4. **添加完整metadata**
   ```yaml
   name: my-skill
   version: 1.0.0
   description: "..."
   author: Your Name
   tags: [react, typescript]
   ```

5. **验证资源引用**
   - 确保所有引用的文件存在
   - 使用相对路径

---

### ❌ 避免做法

1. **不要跳过验证**
   - 验证可以发现90%的问题

2. **不要使用绝对路径**
   ```markdown
   ❌ [Template](/Users/me/template.md)
   ✅ [Template](templates/template.md)
   ```

3. **不要在描述中写长篇大论**
   - 详细内容放在body中
   - 描述控制在2-3句话

4. **不要忽略警告**
   - 警告通常指出潜在问题
   - 根据建议优化Skill

5. **不要引用外部文件**
   - 所有资源应在Skill目录内
   - 避免依赖外部路径

---

## 更多资源

- 📖 [技术设计文档](../TECHNICAL_DESIGN.md)
- 🗺️ [开发路线图](../ROADMAP.md)
- 📝 [贡献指南](../CONTRIBUTING.md)
- 📋 [更新日志](../CHANGELOG.md)
- 💡 [示例项目](../examples/)

---

## 获取帮助

- 🐛 [提交Bug](https://github.com/JiangDing1990/universal-skill-kit/issues)
- 💬 [讨论](https://github.com/JiangDing1990/universal-skill-kit/discussions)
- 📧 联系维护者

---

<div align="center">

**Universal Skill Kit** - 让Skill开发更简单

Made with ❤️ by [JiangDing1990](https://github.com/JiangDing1990)

</div>
