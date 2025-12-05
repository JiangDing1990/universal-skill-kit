# 常见问题解答（FAQ）

Universal Skill Kit的常见问题和解决方案。

## 目录

- [安装和配置](#安装和配置)
- [使用问题](#使用问题)
- [转换相关](#转换相关)
- [压缩策略](#压缩策略)
- [错误处理](#错误处理)
- [性能问题](#性能问题)
- [高级用法](#高级用法)

---

## 安装和配置

### Q1: 安装后提示"command not found: usk"

**问题**：
```bash
$ usk --version
command not found: usk
```

**解决方案**：

1. **检查是否安装成功**：
```bash
npm list -g @jiangding/usk-cli
```

2. **检查全局bin目录是否在PATH中**：
```bash
npm config get prefix
echo $PATH
```

3. **如果不在PATH中，添加它**：
```bash
# 对于bash
echo 'export PATH="$(npm config get prefix)/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# 对于zsh
echo 'export PATH="$(npm config get prefix)/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

4. **或者使用npx**：
```bash
npx @jiangding/usk-cli --version
```

---

### Q2: 权限错误 EACCES

**问题**：
```bash
Error: EACCES: permission denied
```

**解决方案**：

**方法1：修改npm全局目录（推荐）**：
```bash
# 创建全局目录
mkdir ~/.npm-global

# 配置npm使用新目录
npm config set prefix '~/.npm-global'

# 添加到PATH
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# 重新安装
npm install -g @jiangding/usk-cli
```

**方法2：使用sudo（不推荐）**：
```bash
sudo npm install -g @jiangding/usk-cli
```

---

### Q3: 版本冲突或安装失败

**问题**：
```bash
npm ERR! peer dep missing
```

**解决方案**：

1. **清除npm缓存**：
```bash
npm cache clean --force
```

2. **使用特定版本的Node.js**：
```bash
# 使用nvm切换到Node.js 18+
nvm use 18
```

3. **重新安装**：
```bash
npm uninstall -g @jiangding/usk-cli
npm install -g @jiangding/usk-cli@latest
```

---

## 使用问题

### Q4: 为什么转换后描述变短了很多？

**原因**：
当源Skill的描述超过500字符时，USK会自动压缩以满足Codex平台限制。

**检查原始长度**：
```bash
usk analyze my-skill.md
# 查看 "Description Length" 字段
```

**控制压缩**：
```bash
# 使用保守策略（压缩较少）
usk convert my-skill.md -t codex -s conservative

# 查看压缩详情
usk convert my-skill.md -t codex --verbose
```

**优化建议**：
- 手动精简原始描述
- 移除冗余词汇
- 保留关键技术信息

---

### Q5: 转换失败，提示文件不存在

**问题**：
```bash
❌ Skill file not found or not readable
```

**原因**：
1. 文件路径不正确
2. 目录中缺少SKILL.md
3. 权限问题

**解决方案**：

1. **检查文件是否存在**：
```bash
ls -la my-skill.md
# 或对于目录
ls -la my-skill/SKILL.md
```

2. **使用绝对路径**：
```bash
usk convert /absolute/path/to/my-skill.md -t codex
```

3. **检查权限**：
```bash
chmod 644 my-skill.md
```

---

### Q6: batch命令找不到任何文件

**问题**：
```bash
✔ Found 0 skill(s)
```

**原因**：
Glob模式未正确引用或路径不对。

**解决方案**：

1. **使用引号包裹pattern**：
```bash
# ❌ 错误
usk batch skills/**/*.md -t codex

# ✅ 正确
usk batch "skills/**/*.md" -t codex
```

2. **使用相对路径**：
```bash
cd /path/to/project
usk batch "skills/**/*.md" -t codex
```

3. **测试pattern**：
```bash
# 使用ls测试
ls skills/**/*.md
```

---

## 转换相关

### Q7: 转换后信息丢失了重要内容

**检查是否被压缩**：
```bash
usk convert my-skill.md -t codex --verbose
# 查看 "Compression Rate"
```

**解决方案**：

1. **使用更保守的策略**：
```bash
usk convert my-skill.md -t codex -s conservative
```

2. **优化原始描述**：
   - 移除示例代码（放到body中）
   - 删除重复信息
   - 使用简洁表达

3. **检查保留的关键词**：
```bash
usk convert my-skill.md -t codex --verbose
# 查看 "Preserved Keywords"
```

---

### Q8: 多文件Skill某些文件没有被复制

**问题**：
```bash
⚠️ Warning: Referenced file not found: templates/foo.md
```

**原因**：
引用的文件不存在或路径不正确。

**解决方案**：

1. **检查文件是否存在**：
```bash
ls -la my-skill/templates/foo.md
```

2. **检查路径引用**：
```markdown
<!-- ✅ 正确 -->
See templates/example.md

<!-- ❌ 错误 -->
See /absolute/path/templates/example.md
```

3. **使用详细日志**：
```bash
usk convert my-skill/ -t codex --verbose
```

---

### Q9: 转换Codex到Claude时描述被截断

**原因**：
Codex Skill的描述通常很短（≤500字符），转换时保持原样。

**这是正常的**：
- Codex → Claude不需要扩展描述
- 原始信息已完整保留
- 可以手动补充详细说明

**手动补充**：
转换后编辑输出文件，在body中添加详细说明。

---

## 压缩策略

### Q10: 如何选择合适的压缩策略？

**参考表格**：

| 原始长度 | 推荐策略 | 预期压缩率 | 适用场景 |
|---------|---------|-----------|----------|
| < 500 | 无需压缩 | 0% | 简短描述 |
| 500-600 | conservative | ~10% | 稍长描述 |
| 600-800 | balanced ⭐ | ~40% | 中等描述 |
| 800-1000 | aggressive | ~60% | 很长描述 |
| > 1000 | 手动优化 | - | 需重写 |

**测试方法**：
```bash
# 尝试所有策略
usk convert my-skill.md -t codex -s conservative -o ./test1
usk convert my-skill.md -t codex -s balanced -o ./test2
usk convert my-skill.md -t codex -s aggressive -o ./test3

# 对比结果
head -15 ./test1/my-skill.md
head -15 ./test2/my-skill.md
head -15 ./test3/my-skill.md
```

---

### Q11: 压缩后关键版本号丢失了

**原因**：
压缩算法应该保留版本号，如果丢失，可能是描述结构问题。

**解决方案**：

1. **在描述前部提及版本**：
```markdown
---
description: |
  React 16.14 and DVA 2.x development skill...
---
```

2. **使用明确格式**：
```markdown
React 16.14  ✅
React v16    ✅
React 16     ⚠️ 可能被识别为普通数字
```

3. **报告bug**：
如果确认是bug，请提Issue并提供完整示例。

---

### Q12: 能否自定义压缩规则？

**当前**：
USK使用内置的4种策略，暂不支持自定义规则。

**建议**：
1. 选择最接近的策略
2. 转换后手动微调

**未来计划**：
Phase 2可能支持自定义压缩配置。

---

## 错误处理

### Q13: 遇到YAML解析错误

**问题**：
```bash
❌ Error: Invalid YAML frontmatter
```

**常见原因**：

1. **缩进错误**：
```yaml
# ❌ 错误
---
tags:
- tag1
  - tag2  # 缩进不一致
---

# ✅ 正确
---
tags:
  - tag1
  - tag2
---
```

2. **引号问题**：
```yaml
# ❌ 错误
description: It's a test  # 单引号未转义

# ✅ 正确
description: "It's a test"
# 或
description: It\'s a test
```

3. **特殊字符**：
```yaml
# ❌ 错误
name: skill:test  # 冒号后需要空格

# ✅ 正确
name: "skill:test"
```

**验证YAML**：
使用在线工具验证：https://www.yamllint.com/

---

### Q14: 模块解析错误

**问题**：
```bash
Error [ERR_MODULE_NOT_FOUND]: Cannot find package
```

**解决方案**：

1. **更新到最新版本**：
```bash
npm install -g @jiangding/usk-cli@latest
```

2. **清除缓存**：
```bash
npm cache clean --force
```

3. **重新安装**：
```bash
npm uninstall -g @jiangding/usk-cli
npm install -g @jiangding/usk-cli
```

---

## 性能问题

### Q15: 批量转换很慢

**原因**：
- 大量文件
- 单线程处理
- 网络问题（如有）

**优化方法**：

1. **确保并行处理开启**（默认）：
```bash
usk batch "skills/**/*.md" -t codex --parallel
```

2. **分批处理**：
```bash
# 分目录处理
usk batch "skills/group1/**/*.md" -t codex -o ./output1
usk batch "skills/group2/**/*.md" -t codex -o ./output2
```

3. **使用SSD**：
磁盘I/O性能影响较大。

**预期性能**：
- 单文件：< 100ms
- 20文件批量：~4s（并行）
- 100文件批量：~20s（并行）

---

### Q16: analyze命令响应慢

**原因**：
大型Skill文件分析需要时间。

**正常范围**：
- 简单Skill: < 50ms
- 复杂Skill（含代码示例）: < 200ms
- 超大Skill（10000+ chars）: < 500ms

**如果超过这个范围**：
1. 检查文件大小
2. 使用`--verbose`查看详细日志
3. 报告性能问题

---

## 高级用法

### Q17: 如何在CI/CD中使用？

**GitHub Actions示例**：

```yaml
name: Validate Skills

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install USK
        run: npm install -g @jiangding/usk-cli

      - name: Analyze Skill Quality
        run: |
          REPORT=$(usk analyze skills/my-skill.md --json)
          SCORE=$(echo "$REPORT" | jq '.estimatedQuality')

          echo "Quality Score: $SCORE"

          if [ "$SCORE" -lt "80" ]; then
            echo "❌ Quality score too low"
            exit 1
          fi

      - name: Convert to Codex
        run: usk convert skills/my-skill.md -t codex -o ./dist
```

---

### Q18: 如何批量验证所有Skills？

**Bash脚本示例**：

```bash
#!/bin/bash

FAILED=0
SKILLS=$(find skills -name "*.md" -o -name "SKILL.md")

for skill in $SKILLS; do
  echo "Validating $skill..."

  # 分析质量
  REPORT=$(usk analyze "$skill" --json 2>/dev/null)

  if [ $? -ne 0 ]; then
    echo "❌ Failed to analyze: $skill"
    FAILED=$((FAILED + 1))
    continue
  fi

  # 检查质量分数
  SCORE=$(echo "$REPORT" | jq '.estimatedQuality')

  if [ "$SCORE" -lt "70" ]; then
    echo "⚠️  Low quality ($SCORE): $skill"
    FAILED=$((FAILED + 1))
  else
    echo "✅ Passed ($SCORE): $skill"
  fi
done

echo ""
echo "Results: $FAILED failed"
exit $FAILED
```

---

### Q19: 如何集成到现有构建流程？

**示例（package.json）**：

```json
{
  "scripts": {
    "validate:skills": "node scripts/validate-skills.js",
    "build:skills": "usk batch 'skills/**/*.md' -t codex -o dist/codex",
    "prebuild": "npm run validate:skills",
    "build": "npm run build:skills"
  }
}
```

**验证脚本（scripts/validate-skills.js）**：

```javascript
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function validateSkill(skillPath) {
  try {
    const { stdout } = await execAsync(
      `usk analyze "${skillPath}" --json`
    );
    const report = JSON.parse(stdout);

    if (report.estimatedQuality < 80) {
      console.error(`❌ Low quality: ${skillPath}`);
      process.exit(1);
    }

    console.log(`✅ Passed: ${skillPath}`);
  } catch (error) {
    console.error(`❌ Error: ${skillPath}`, error.message);
    process.exit(1);
  }
}

// Run validation
await validateSkill('skills/my-skill.md');
```

---

### Q20: 如何处理多语言Skill？

**目录结构**：

```
my-skill/
├── SKILL.en.md          # 英文
├── SKILL.zh-CN.md       # 简体中文
├── SKILL.ja.md          # 日文
└── resources/
    └── shared.yaml      # 共享资源
```

**分别转换**：

```bash
# 英文
usk convert my-skill/SKILL.en.md -t codex -o ./dist/en/my-skill

# 中文
usk convert my-skill/SKILL.zh-CN.md -t codex -o ./dist/zh-CN/my-skill

# 日文
usk convert my-skill/SKILL.ja.md -t codex -o ./dist/ja/my-skill
```

**批量处理脚本**：

```bash
#!/bin/bash

LANGS=("en" "zh-CN" "ja")

for lang in "${LANGS[@]}"; do
  echo "Converting $lang..."
  usk batch "skills/**/SKILL.$lang.md" -t codex -o "./dist/$lang"
done
```

---

## 其他问题

### Q21: 支持哪些平台？

**当前支持**：
- ✅ Claude Code
- ✅ Codex

**计划支持**（Phase 2+）：
- ⏳ Cursor
- ⏳ 其他AI CLI平台

---

### Q22: 可以贡献代码吗？

**当然欢迎！**

请参考：
- [贡献指南](../CONTRIBUTING.md)
- [技术设计](TECHNICAL_DESIGN.md)
- [开发路线图](ROADMAP.md)

**建议从这些开始**：
- 报告bug
- 改进文档
- 添加测试
- 提供示例

---

### Q23: 有问题该如何反馈？

**方式**：

1. **GitHub Issues**（推荐）：
   https://github.com/JiangDing1990/universal-skill-kit/issues

2. **GitHub Discussions**：
   https://github.com/JiangDing1990/universal-skill-kit/discussions

3. **Pull Request**：
   直接提交改进

**提Issue建议**：
- 描述清晰
- 提供复现步骤
- 附上错误日志
- 说明环境信息（OS, Node版本等）

---

## 没有找到答案？

- 查看[用户指南](USER_GUIDE.md)
- 阅读[技术文档](TECHNICAL_DESIGN.md)
- 提交[GitHub Issue](https://github.com/JiangDing1990/universal-skill-kit/issues)

---

<div align="center">

**持续更新中...** 📚

[返回主页](../README.md) | [查看示例](../examples/)

</div>
