# Contributing to Universal Skill Kit

[English](#english-version) | [简体中文](#简体中文版本)

---

## 简体中文版本

感谢您考虑为 Universal Skill Kit 做出贡献！我们欢迎任何形式的贡献，包括但不限于：

- 🐛 报告 Bug
- 💡 提出新功能建议
- 📝 改进文档
- 🔧 提交代码修复
- ⚡ 性能优化
- 🌐 翻译文档

## 行为准则

### 我们的承诺

为了营造一个开放和友好的环境，我们作为贡献者和维护者承诺：无论年龄、体型、残疾、种族、性别认同和表达、经验水平、国籍、个人外貌、种族、宗教或性认同和性取向如何，参与我们的项目和社区都不会受到骚扰。

### 我们的标准

积极行为的例子包括：

- 使用友好和包容的语言
- 尊重不同的观点和经验
- 优雅地接受建设性批评
- 关注对社区最有利的事情
- 对其他社区成员表示同理心

不可接受的行为包括：

- 使用性化语言或图像，以及不受欢迎的性关注或挑逗
- 恶意评论、人身攻击或政治攻击
- 公开或私下骚扰
- 未经明确许可发布他人的私人信息
- 其他在专业环境中可能被合理认为不适当的行为

## 如何贡献

### 报告 Bug

在创建 Bug 报告之前，请先搜索现有的 Issues，看看问题是否已经被报告。如果没有，请创建一个新的 Issue 并包含以下信息：

**Bug 报告模板：**

````markdown
**描述问题**
清晰简洁地描述 bug。

**复现步骤**

1. 执行命令 '...'
2. 使用配置 '...'
3. 看到错误 '...'

**预期行为**
清晰简洁地描述您期望发生什么。

**实际行为**
清晰简洁地描述实际发生了什么。

**环境信息**

- OS: [例如 macOS 14.0]
- Node.js 版本: [例如 18.17.0]
- USK 版本: [例如 0.1.0]
- 平台: [Claude / Codex]

**额外信息**
添加任何其他有关问题的上下文或截图。

**错误日志**

```bash
# 粘贴完整的错误日志
```
````

````

### 提出功能建议

功能建议也通过 GitHub Issues 提交。请提供以下信息：

**功能建议模板：**

```markdown
**功能概述**
简要描述这个功能。

**使用场景**
描述这个功能解决了什么问题或满足了什么需求。

**建议的解决方案**
描述您希望如何实现这个功能。

**替代方案**
描述您考虑过的任何替代解决方案或功能。

**额外信息**
添加任何其他上下文、截图或示例。
````

### 提交代码

#### 开发流程

1. **Fork 仓库**

   ```bash
   # 在 GitHub 上 Fork 仓库
   # 克隆您的 Fork
   git clone https://github.com/YOUR_USERNAME/universal-skill-kit.git
   cd universal-skill-kit
   ```

2. **创建分支**

   ```bash
   # 从 main 分支创建功能分支
   git checkout -b feature/my-new-feature

   # 或修复分支
   git checkout -b fix/issue-123
   ```

   分支命名规范：
   - `feature/` - 新功能
   - `fix/` - Bug 修复
   - `docs/` - 文档改进
   - `refactor/` - 代码重构
   - `test/` - 测试相关
   - `chore/` - 构建工具、依赖更新等

3. **安装依赖**

   ```bash
   npm install
   ```

4. **开发**

   ```bash
   # 开发模式（自动编译）
   npm run dev

   # 运行测试（监听模式）
   npm run test:watch
   ```

5. **编写测试**

   所有新功能和 Bug 修复都应该包含测试：

   ```typescript
   // packages/core/__tests__/converter.test.ts
   import { describe, it, expect } from 'vitest'
   import { SkillConverter } from '../src/converter'

   describe('SkillConverter', () => {
     it('should convert Claude Skill to Codex', async () => {
       const converter = new SkillConverter()
       const result = await converter.convert('/path/to/skill', {
         targetPlatform: 'codex'
       })

       expect(result.metadata.description.length).toBeLessThanOrEqual(500)
       expect(result.success).toBe(true)
     })
   })
   ```

6. **运行测试**

   ```bash
   # 运行所有测试
   npm test

   # 运行特定测试
   npm test -- converter

   # 生成覆盖率报告
   npm run test:coverage
   ```

7. **代码检查**

   ```bash
   # ESLint 检查
   npm run lint

   # 自动修复
   npm run lint:fix

   # 类型检查
   npm run type-check

   # 格式化
   npm run format
   ```

8. **提交代码**

   我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

   ```bash
   # 提交格式
   <type>(<scope>): <subject>

   # 示例
   git commit -m "feat(converter): add description compression algorithm"
   git commit -m "fix(cli): handle missing config file gracefully"
   git commit -m "docs(readme): update installation instructions"
   ```

   **Type 类型：**
   - `feat`: 新功能
   - `fix`: Bug 修复
   - `docs`: 文档更新
   - `style`: 代码格式（不影响功能）
   - `refactor`: 重构
   - `perf`: 性能优化
   - `test`: 测试相关
   - `chore`: 构建、工具配置等
   - `ci`: CI/CD 相关

   **Scope 范围：**
   - `core`: 核心转换引擎
   - `cli`: 命令行工具
   - `builder`: 构建系统
   - `template`: 模板引擎
   - `config`: 配置系统
   - `docs`: 文档
   - `deps`: 依赖管理

9. **推送并创建 PR**

   ```bash
   # 推送分支到您的 Fork
   git push origin feature/my-new-feature

   # 在 GitHub 上创建 Pull Request
   ```

#### Pull Request 指南

**PR 标题格式：**

```
<type>(<scope>): <subject>
```

**PR 描述模板：**

```markdown
## 变更类型

- [ ] Bug 修复
- [ ] 新功能
- [ ] 重大变更
- [ ] 文档更新

## 变更说明

<!-- 描述这个 PR 的变更内容 -->

## 关联 Issue

Closes #123

## 测试

<!-- 描述如何测试这些变更 -->

- [ ] 添加了单元测试
- [ ] 添加了集成测试
- [ ] 手动测试通过

## 检查清单

- [ ] 代码遵循项目代码风格
- [ ] 通过所有测试
- [ ] 更新了相关文档
- [ ] 添加了必要的注释
- [ ] 没有引入新的警告
- [ ] 遵循 Conventional Commits 规范
```

#### Code Review 流程

1. **自动检查**
   - CI 会自动运行测试、Lint 和类型检查
   - 确保所有检查都通过

2. **人工审查**
   - 维护者会审查您的代码
   - 可能会提出修改建议

3. **修改和更新**
   - 根据反馈修改代码
   - 推送新的提交到同一分支

4. **合并**
   - 审查通过后，维护者会合并 PR
   - 使用 Squash and merge 保持历史清晰

### 改进文档

文档改进不需要本地开发环境，可以直接在 GitHub 上编辑：

1. 导航到要编辑的文档文件
2. 点击"编辑"按钮（铅笔图标）
3. 进行修改
4. 提交 PR

文档位置：

- 主文档: `README.md`, `README_CN.md`
- 详细文档: `docs/` 目录
- API 文档: 各包的 `src/` 目录内的 JSDoc 注释

### 翻译文档

我们欢迎将文档翻译成其他语言：

1. 复制英文文档
2. 翻译内容（保持格式和结构）
3. 使用语言后缀命名（例如 `README_CN.md`, `README_JP.md`）
4. 提交 PR

## 开发指南

### 项目结构

```
universal-skill-kit/
├── packages/
│   ├── core/                # 核心转换引擎
│   │   ├── src/
│   │   │   ├── converter/
│   │   │   ├── parser/
│   │   │   ├── validator/
│   │   │   └── optimizer/
│   │   ├── __tests__/
│   │   └── package.json
│   ├── cli/                 # 命令行工具
│   │   ├── src/
│   │   │   ├── commands/
│   │   │   ├── utils/
│   │   │   └── index.ts
│   │   ├── __tests__/
│   │   └── package.json
│   ├── builder/             # 构建系统
│   ├── template/            # 模板引擎
│   └── utils/               # 通用工具
├── templates/               # Skill 模板
├── examples/                # 示例项目
├── docs/                    # 文档
└── scripts/                 # 开发脚本
```

### 技术栈

- **语言**: TypeScript 5.3+
- **构建**: tsup (快速 TypeScript 打包)
- **测试**: Vitest
- **Lint**: ESLint + Prettier
- **包管理**: npm workspaces

### 代码风格

我们使用 ESLint 和 Prettier 来保持代码风格一致：

```typescript
// ✅ 好的
import { SkillConverter } from './converter'

export async function convertSkill(
  source: string,
  options: ConvertOptions
): Promise<ConvertResult> {
  const converter = new SkillConverter()
  return await converter.convert(source, options)
}

// ❌ 不好的
import { SkillConverter } from './converter'

export async function convertSkill(source: string, options: ConvertOptions) {
  const converter = new SkillConverter()
  return await converter.convert(source, options)
}
```

**关键规范：**

- 使用 2 空格缩进
- 使用单引号（字符串）
- 语句末尾加分号
- 使用 ESM imports（不使用 CommonJS require）
- 优先使用命名导入
- 使用 async/await（不使用 .then()）
- 函数和变量使用 camelCase
- 类和接口使用 PascalCase
- 常量使用 UPPER_SNAKE_CASE

### 测试指南

#### 单元测试

```typescript
// packages/core/__tests__/path-mapper.test.ts
import { describe, it, expect } from 'vitest'
import { PathMapper } from '../src/path-mapper'

describe('PathMapper', () => {
  describe('mapPaths', () => {
    it('should replace .claude with .codex', () => {
      const mapper = new PathMapper()
      const result = mapper.replace(
        { templates: ['~/.claude/skills/foo'] },
        '.claude',
        '.codex'
      )

      expect(result.templates[0]).toBe('~/.codex/skills/foo')
    })

    it('should handle multiple paths', () => {
      const mapper = new PathMapper()
      const result = mapper.replace(
        {
          templates: ['~/.claude/skills/a', '.claude/skills/b'],
          references: ['~/.claude/skills/c']
        },
        '.claude',
        '.codex'
      )

      expect(result.templates).toEqual(['~/.codex/skills/a', '.codex/skills/b'])
      expect(result.references).toEqual(['~/.codex/skills/c'])
    })
  })
})
```

#### 集成测试

```typescript
// packages/cli/__tests__/integration/convert.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { execSync } from 'child_process'
import fs from 'fs/promises'
import path from 'path'

describe('convert command', () => {
  const testDir = '/tmp/usk-test'

  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true })
  })

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true })
  })

  it('should convert Claude Skill to Codex', async () => {
    // 准备测试 Skill
    const skillDir = path.join(testDir, 'test-skill')
    await createTestSkill(skillDir, 'claude')

    // 执行转换
    execSync(`usk convert ${skillDir} --to codex --output ${testDir}`, {
      encoding: 'utf-8'
    })

    // 验证结果
    const outputDir = path.join(testDir, 'test-skill')
    const skillMd = await fs.readFile(path.join(outputDir, 'SKILL.md'), 'utf-8')

    expect(skillMd).toContain('name: test-skill')
    // 更多断言...
  })
})
```

### 性能注意事项

- 使用流式处理大文件
- 实现缓存避免重复计算
- 并行处理独立任务
- 避免不必要的文件读写

```typescript
// ✅ 好的 - 使用并行处理
async function convertAll(skills: string[]): Promise<Result[]> {
  const chunks = chunk(skills, 5) // 5 个并发
  const results = []

  for (const chunk of chunks) {
    const promises = chunk.map(skill => convertOne(skill))
    const chunkResults = await Promise.allSettled(promises)
    results.push(...chunkResults)
  }

  return results
}

// ❌ 不好的 - 串行处理
async function convertAll(skills: string[]): Promise<Result[]> {
  const results = []

  for (const skill of skills) {
    const result = await convertOne(skill)
    results.push(result)
  }

  return results
}
```

### 错误处理

提供清晰的错误消息和恢复建议：

```typescript
// ✅ 好的
if (!fs.existsSync(configPath)) {
  throw new Error(
    `Config file not found: ${configPath}\n\n` +
      `Please create a skill.config.json file in your project root.\n` +
      `Example: usk init --template universal`
  )
}

// ❌ 不好的
if (!fs.existsSync(configPath)) {
  throw new Error('File not found')
}
```

## 发布流程

> **注意**: 只有维护者可以发布新版本。

1. **更新版本号**

   ```bash
   npm version patch  # 0.1.0 -> 0.1.1
   npm version minor  # 0.1.0 -> 0.2.0
   npm version major  # 0.1.0 -> 1.0.0
   ```

2. **更新 CHANGELOG**

   ```markdown
   ## [0.2.0] - 2024-12-05

   ### Added

   - Template engine with conditional compilation
   - Build system for multi-platform

   ### Fixed

   - Description compression edge cases

   ### Changed

   - Improved error messages
   ```

3. **创建 Git Tag**

   ```bash
   git tag -a v0.2.0 -m "Release v0.2.0"
   git push origin v0.2.0
   ```

4. **发布到 NPM**

   ```bash
   npm run build
   npm publish --access public
   ```

5. **创建 GitHub Release**

   在 GitHub 上创建 Release，包含 CHANGELOG 内容。

## 获得帮助

如果您有任何问题或需要帮助：

- 📖 阅读[文档](docs/)
- 💬 在 [Discussions](https://github.com/yourusername/universal-skill-kit/discussions) 提问
- 🐛 在 [Issues](https://github.com/yourusername/universal-skill-kit/issues) 报告问题
- 💼 加入 [Discord 社区](https://discord.gg/universal-skill-kit)

## 感谢

感谢所有为本项目做出贡献的开发者！

<a href="https://github.com/yourusername/universal-skill-kit/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=yourusername/universal-skill-kit" />
</a>

---

## English Version

Thank you for considering contributing to Universal Skill Kit! We welcome all forms of contribution, including but not limited to:

- 🐛 Bug reports
- 💡 Feature suggestions
- 📝 Documentation improvements
- 🔧 Code fixes
- ⚡ Performance optimizations
- 🌐 Translations

## Code of Conduct

### Our Pledge

In the interest of fostering an open and welcoming environment, we pledge to make participation in our project and community a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment include:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

## How to Contribute

### Reporting Bugs

Before creating a bug report, please search existing Issues to see if the problem has already been reported. If not, create a new Issue with the following information:

**Bug Report Template:**

````markdown
**Describe the bug**
A clear and concise description of the bug.

**Steps to reproduce**

1. Run command '...'
2. Use configuration '...'
3. See error '...'

**Expected behavior**
A clear description of what you expected to happen.

**Actual behavior**
A clear description of what actually happened.

**Environment**

- OS: [e.g. macOS 14.0]
- Node.js version: [e.g. 18.17.0]
- USK version: [e.g. 0.1.0]
- Platform: [Claude / Codex]

**Additional context**
Add any other context or screenshots about the problem.

**Error logs**

```bash
# Paste complete error logs
```
````

````

### Suggesting Features

Feature suggestions are also submitted through GitHub Issues. Please provide:

**Feature Request Template:**

```markdown
**Feature overview**
Brief description of the feature.

**Use case**
Describe what problem this feature solves or what need it fulfills.

**Proposed solution**
Describe how you'd like this feature implemented.

**Alternatives**
Describe any alternative solutions or features you've considered.

**Additional context**
Add any other context, screenshots, or examples.
````

### Submitting Code

#### Development Workflow

1. **Fork the repository**

   ```bash
   # Fork the repository on GitHub
   # Clone your fork
   git clone https://github.com/YOUR_USERNAME/universal-skill-kit.git
   cd universal-skill-kit
   ```

2. **Create a branch**

   ```bash
   # Create feature branch from main
   git checkout -b feature/my-new-feature

   # Or fix branch
   git checkout -b fix/issue-123
   ```

   Branch naming conventions:
   - `feature/` - New features
   - `fix/` - Bug fixes
   - `docs/` - Documentation improvements
   - `refactor/` - Code refactoring
   - `test/` - Test-related
   - `chore/` - Build tools, dependency updates, etc.

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Develop**

   ```bash
   # Development mode (auto-compile)
   npm run dev

   # Run tests (watch mode)
   npm run test:watch
   ```

5. **Write tests**

   All new features and bug fixes should include tests:

   ```typescript
   // packages/core/__tests__/converter.test.ts
   import { describe, it, expect } from 'vitest'
   import { SkillConverter } from '../src/converter'

   describe('SkillConverter', () => {
     it('should convert Claude Skill to Codex', async () => {
       const converter = new SkillConverter()
       const result = await converter.convert('/path/to/skill', {
         targetPlatform: 'codex'
       })

       expect(result.metadata.description.length).toBeLessThanOrEqual(500)
       expect(result.success).toBe(true)
     })
   })
   ```

6. **Run tests**

   ```bash
   # Run all tests
   npm test

   # Run specific test
   npm test -- converter

   # Generate coverage report
   npm run test:coverage
   ```

7. **Check code**

   ```bash
   # ESLint check
   npm run lint

   # Auto-fix
   npm run lint:fix

   # Type check
   npm run type-check

   # Format
   npm run format
   ```

8. **Commit code**

   We use [Conventional Commits](https://www.conventionalcommits.org/) specification:

   ```bash
   # Commit format
   <type>(<scope>): <subject>

   # Examples
   git commit -m "feat(converter): add description compression algorithm"
   git commit -m "fix(cli): handle missing config file gracefully"
   git commit -m "docs(readme): update installation instructions"
   ```

   **Type:**
   - `feat`: New feature
   - `fix`: Bug fix
   - `docs`: Documentation update
   - `style`: Code formatting (no functional change)
   - `refactor`: Refactoring
   - `perf`: Performance optimization
   - `test`: Test-related
   - `chore`: Build, tool configuration, etc.
   - `ci`: CI/CD related

9. **Push and create PR**

   ```bash
   # Push branch to your fork
   git push origin feature/my-new-feature

   # Create Pull Request on GitHub
   ```

#### Pull Request Guidelines

**PR Title Format:**

```
<type>(<scope>): <subject>
```

**PR Description Template:**

```markdown
## Change Type

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes

<!-- Describe what this PR changes -->

## Related Issue

Closes #123

## Testing

<!-- Describe how to test these changes -->

- [ ] Added unit tests
- [ ] Added integration tests
- [ ] Manual testing passed

## Checklist

- [ ] Code follows project code style
- [ ] All tests pass
- [ ] Updated relevant documentation
- [ ] Added necessary comments
- [ ] No new warnings introduced
- [ ] Follows Conventional Commits spec
```

## Development Guide

### Project Structure

```
universal-skill-kit/
├── packages/
│   ├── core/                # Core conversion engine
│   ├── cli/                 # CLI tool
│   ├── builder/             # Build system
│   ├── template/            # Template engine
│   └── utils/               # Common utilities
├── templates/               # Skill templates
├── examples/                # Example projects
├── docs/                    # Documentation
└── scripts/                 # Development scripts
```

### Tech Stack

- **Language**: TypeScript 5.3+
- **Build**: tsup (fast TypeScript bundler)
- **Test**: Vitest
- **Lint**: ESLint + Prettier
- **Package Manager**: npm workspaces

### Code Style

We use ESLint and Prettier to maintain consistent code style:

```typescript
// ✅ Good
import { SkillConverter } from './converter'

export async function convertSkill(
  source: string,
  options: ConvertOptions
): Promise<ConvertResult> {
  const converter = new SkillConverter()
  return await converter.convert(source, options)
}

// ❌ Bad
import { SkillConverter } from './converter'

export async function convertSkill(source: string, options: ConvertOptions) {
  const converter = new SkillConverter()
  return await converter.convert(source, options)
}
```

**Key conventions:**

- Use 2 spaces for indentation
- Use single quotes for strings
- Always use semicolons
- Use ESM imports (not CommonJS require)
- Prefer named imports
- Use async/await (not .then())
- Use camelCase for functions and variables
- Use PascalCase for classes and interfaces
- Use UPPER_SNAKE_CASE for constants

## Getting Help

If you have questions or need help:

- 📖 Read the [documentation](docs/)
- 💬 Ask in [Discussions](https://github.com/yourusername/universal-skill-kit/discussions)
- 🐛 Report issues in [Issues](https://github.com/yourusername/universal-skill-kit/issues)
- 💼 Join [Discord community](https://discord.gg/universal-skill-kit)

## Acknowledgments

Thanks to all developers who contributed to this project!

<a href="https://github.com/yourusername/universal-skill-kit/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=yourusername/universal-skill-kit" />
</a>
