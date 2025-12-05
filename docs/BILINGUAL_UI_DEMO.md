# 双语用户界面演示 / Bilingual User Interface Demo

本文档展示 Universal Skill Kit 的中英双语用户界面功能。

This document demonstrates the Chinese-English bilingual user interface features of Universal Skill Kit.

## 功能概述 / Feature Overview

USK 现在支持中英双语输出，为不同语言用户提供友好的交互体验。所有用户可见的消息都同时显示英文和中文。

USK now supports bilingual Chinese-English output, providing a friendly interactive experience for users of different languages. All user-visible messages are displayed in both English and Chinese.

### 支持的场景 / Supported Scenarios

1. **错误消息** / Error Messages
2. **错误建议** / Error Suggestions
3. **CLI 提示** / CLI Prompts
4. **状态信息** / Status Messages
5. **统计数据** / Statistics Display
6. **交互对话** / Interactive Dialogs

## 实际示例 / Real Examples

### 1. 成功的转换 / Successful Conversion

```bash
$ usk convert my-skill.md -t codex -o ./output

- Initializing conversion / 初始化转换...
✔ Input file found / 输入文件已找到
- Parsing skill / 解析 Skill...
✔ Skill parsed / Skill 已解析
- Validating skill / 验证 Skill...
✔ Validation passed / 验证通过

⚠️  Validation Warnings:
  ⚠ [body] Skill body is very short. Add more documentation.
  ℹ [body] Consider adding code examples.

- Converting skill / 转换 Skill...
✔ Conversion completed / 转换完成!

✓ Conversion Successful / 转换成功
──────────────────────────────────────────────────
Platform / 平台: codex
Output / 输出: ./output/my-skill.md
Quality Score / 质量分数: 90/100
──────────────────────────────────────────────────

Statistics / 统计信息:
  Original Length / 原始长度: 850 chars
  Final Length / 最终长度: 495 chars
  Compression / 压缩率: 41.8%
  Duration / 耗时: 145ms

✓ Preserved Keywords / 保留的关键词: TypeScript, React, API
⚠ Lost Keywords / 丢失的关键词: example, tutorial

Done! / 完成! ✨
```

### 2. 错误处理示例 / Error Handling Examples

#### 文件未找到 / File Not Found

```bash
$ usk convert non-existent-skill.md -t codex

- Initializing conversion / 初始化转换...
✖ Conversion failed / 转换失败

❌ Error / 错误:
  [SKILL_NOT_FOUND] Skill not found / Skill 文件未找到: non-existent-skill.md

💡 Suggestions / 建议:
  • Ensure the file path is correct / 确保文件路径正确
  • If it's a directory, make sure it contains SKILL.md / 如果是目录，请确保其中包含 SKILL.md 文件
  • Use absolute path or path relative to current working directory / 使用绝对路径或相对于当前工作目录的路径
```

#### 验证错误 / Validation Error

```bash
$ usk convert invalid-skill.md -t codex

- Initializing conversion / 初始化转换...
✔ Input file found / 输入文件已找到
- Parsing skill / 解析 Skill...
✔ Skill parsed / Skill 已解析
- Validating skill / 验证 Skill...
✖ Validation failed / 验证失败

❌ Validation Errors:
  • [name] Skill name is required
  • [description] Description is required

💡 Suggestions / 建议:
  • Run `usk analyze <skill>` to see detailed validation info / 运行 `usk analyze <skill>` 查看详细验证信息
  • Fix all errors and retry conversion / 修复所有错误后重新转换
  • Or use --interactive mode to manually confirm / 或使用 --interactive 模式手动确认继续
```

#### 转换错误 / Conversion Error

```bash
$ usk convert my-skill.md -t invalid-platform

❌ Error / 错误:
  [CONVERSION_ERROR] Conversion failed / 转换失败 (my-skill.md): Invalid platform

💡 Suggestions / 建议:
  • Check if target platform is correct (claude/codex) / 检查目标平台是否正确 (claude/codex)
  • Ensure output directory has write permissions / 确保输出目录有写入权限
  • Use --verbose to see detailed error info / 使用 --verbose 查看详细错误信息
```

#### 资源文件缺失 / Resource Not Found

```bash
$ usk convert skill-with-missing-resource/ -t codex

❌ Error / 错误:
  [RESOURCE_NOT_FOUND] Resource file not found / 资源文件未找到: templates/example.md

💡 Suggestions / 建议:
  • Check if resource file paths in Skill are correct / 检查 Skill 中引用的资源文件路径是否正确
  • Ensure all referenced files exist / 确保所有引用的文件都存在
  • Use relative paths instead of absolute paths / 使用相对路径而不是绝对路径
```

### 3. 交互模式 / Interactive Mode

```bash
$ usk convert my-skill.md --interactive

- Initializing conversion / 初始化转换...
✔ Input file found / 输入文件已找到

? Target platform / 目标平台: (Use arrow keys)
❯ claude
  codex

? Compression strategy / 压缩策略: (Use arrow keys)
  conservative
❯ balanced
  aggressive

? Output directory (leave empty for default) / 输出目录（留空使用默认）:
./output

✖ Validation failed / 验证失败

? Skill has validation errors. Continue anyway? / Skill 存在验证错误，是否继续？ (y/N)
```

### 4. 批量转换 / Batch Conversion

```bash
$ usk batch "skills/**/*.md" -t codex -o ./output

- Finding skills / 查找 Skills...
✔ Found 20 skill(s) / 找到 20 个 Skill

- Converting 1/20 / 转换 1/20: skill-1.md
- Converting 2/20 / 转换 2/20: skill-2.md
- Converting 3/20 / 转换 3/20: skill-3.md
...
✔ Converted all 20 skills successfully / 成功转换所有 20 个 Skills!

📊 Batch Conversion Summary / 批量转换总结
══════════════════════════════════════════════════

Overall Statistics / 总体统计:
  Total Files / 文件总数: 20
  Successful / 成功: 18
  Failed / 失败: 2
  Original Size / 原始大小: 15420 chars
  Final Size / 最终大小: 8765 chars
  Avg Compression / 平均压缩率: 43.2%
  Total Time / 总耗时: 4325ms

Individual Results / 单个结果:
  ✓ skill-1.md (42.5% compression)
  ✓ skill-2.md (38.9% compression)
  ✗ skill-3.md (failed)
  ...

❌ Failed Conversions / 转换失败:
  ✗ skills/skill-3.md
    Validation error: missing name field
  ✗ skills/skill-15.md
    Resource not found: templates/missing.md

──────────────────────────────────────────────────
⚠ Completed with 2 error(s) / 完成但有 2 个错误
```

### 5. Verbose 模式 / Verbose Mode

```bash
$ usk convert my-skill.md -t codex --verbose

🔍 Verbose mode enabled / 详细模式已启用

- Initializing conversion / 初始化转换...
[DEBUG] 开始转换: my-skill.md
[DEBUG] 目标平台: codex
[DEBUG] 输入类型: 文件

✔ Input file found / 输入文件已找到

- Parsing skill / 解析 Skill...
[DEBUG] 解析 Skill: my-skill.md
[DEBUG] Skill 名称: my-skill
✔ Skill parsed / Skill 已解析

- Validating skill / 验证 Skill...
[DEBUG] 分析 Skill 质量
[DEBUG] 质量分数: 85/100
[DEBUG] 推荐策略: balanced
✔ Validation passed / 验证通过

- Converting skill / 转换 Skill...
[DEBUG] 源平台: claude
[DEBUG] 收集资源文件
[DEBUG] 找到 3 个资源文件
[DEBUG] 转换完成，耗时: 145ms
[DEBUG] 压缩率: 41.8%
[DEBUG] 保留关键词: 5 个
✔ Conversion completed / 转换完成!

✓ Conversion Successful / 转换成功
...
```

## 技术实现 / Technical Implementation

### 消息格式 / Message Format

所有双语消息都遵循统一的格式：

All bilingual messages follow a consistent format:

```typescript
"English text / 中文文本"
```

### 修改的文件 / Modified Files

1. **`packages/core/src/errors.ts`**
   - 错误类消息双语化 / Error class messages in both languages
   - 错误建议双语化 / Error suggestions in both languages

2. **`packages/cli/src/commands/convert.ts`**
   - Spinner 消息双语化 / Spinner messages in both languages
   - 状态消息双语化 / Status messages in both languages
   - 统计信息双语化 / Statistics display in both languages

3. **`packages/cli/src/commands/batch-convert.ts`**
   - 批量操作消息双语化 / Batch operation messages in both languages
   - 进度更新双语化 / Progress updates in both languages

### 代码示例 / Code Examples

#### 错误消息 / Error Messages

```typescript
export class SkillNotFoundError extends USKError {
  constructor(skillPath: string) {
    super(
      `Skill not found / Skill 文件未找到: ${skillPath}`,
      'SKILL_NOT_FOUND',
      { skillPath }
    )
    this.name = 'SkillNotFoundError'
  }
}
```

#### CLI 提示 / CLI Prompts

```typescript
const spinner = ora('Initializing conversion / 初始化转换...').start()

// ...

spinner.succeed('Conversion completed / 转换完成!')
```

#### 统计显示 / Statistics Display

```typescript
console.log(chalk.cyan('Platform / 平台:'), result.platform)
console.log(chalk.cyan('Quality Score / 质量分数:'), `${result.quality}/100`)
console.log(chalk.cyan('Duration / 耗时:'), `${result.statistics.duration}ms`)
```

## 设计原则 / Design Principles

1. **一致性** / Consistency
   - 所有消息使用统一格式 / All messages use consistent format
   - 英文在前，中文在后 / English first, Chinese second
   - 使用 "/" 分隔 / Use "/" as separator

2. **简洁性** / Conciseness
   - 保持消息简短 / Keep messages concise
   - 避免冗长翻译 / Avoid verbose translations
   - 核心信息优先 / Prioritize core information

3. **可读性** / Readability
   - 清晰的视觉分隔 / Clear visual separation
   - 适当的间距 / Appropriate spacing
   - 统一的符号使用 / Consistent symbol usage

4. **零配置** / Zero Configuration
   - 无需用户配置 / No user configuration needed
   - 自动显示双语 / Automatic bilingual display
   - 向后兼容 / Backward compatible

## 优势 / Benefits

### 用户体验 / User Experience

- **英语用户**: 可以快速理解英文消息
- **中文用户**: 可以参考中文翻译理解含义
- **双语用户**: 同时看到两种语言增强理解
- **学习者**: 通过对照学习专业术语

- **English users**: Can quickly understand English messages
- **Chinese users**: Can refer to Chinese translations
- **Bilingual users**: See both languages for enhanced comprehension
- **Learners**: Learn technical terms through comparison

### 开发维护 / Development & Maintenance

- **单一代码路径**: 不需要 i18n 库或配置文件
- **简单维护**: 消息直接在代码中定义
- **类型安全**: TypeScript 字符串字面量
- **易于测试**: 固定的消息格式

- **Single code path**: No i18n library or config files needed
- **Simple maintenance**: Messages defined directly in code
- **Type safe**: TypeScript string literals
- **Easy to test**: Fixed message format

### 兼容性 / Compatibility

- **完全向后兼容**: 不影响现有功能
- **无破坏性变更**: 只是增强消息显示
- **性能无影响**: 字符串拼接开销极小
- **无依赖增加**: 不需要额外的库

- **Fully backward compatible**: No impact on existing features
- **No breaking changes**: Only enhances message display
- **No performance impact**: Minimal string concatenation overhead
- **No additional dependencies**: No extra libraries needed

## 未来改进 / Future Improvements

### 可能的增强 / Potential Enhancements

1. **环境变量配置** / Environment Variable Configuration
   ```bash
   # 只显示英文 / English only
   USK_LANG=en usk convert my-skill.md

   # 只显示中文 / Chinese only
   USK_LANG=zh usk convert my-skill.md

   # 双语（默认）/ Bilingual (default)
   USK_LANG=both usk convert my-skill.md
   ```

2. **更多语言支持** / More Language Support
   - 日语 / Japanese
   - 韩语 / Korean
   - 其他语言 / Other languages

3. **本地化配置文件** / Localization Config
   - 允许自定义消息 / Allow custom messages
   - 支持插件扩展 / Support plugin extensions

但目前的实现已经满足了大部分用户的需求，保持简洁高效。

But the current implementation already meets most users' needs while staying simple and efficient.

## 总结 / Summary

USK 的双语用户界面通过简单的实现提供了强大的国际化支持，让不同语言背景的用户都能轻松使用工具。这种方法在保持代码简洁的同时，大幅提升了用户体验。

USK's bilingual user interface provides powerful internationalization support through simple implementation, making it easy for users of different language backgrounds to use the tool. This approach significantly improves user experience while keeping the code concise.

---

**更新日期** / Last Updated: 2024-12-05
**版本** / Version: 0.2.0 (Unreleased)
