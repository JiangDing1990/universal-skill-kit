# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Introduced `@jiangding/usk-template` as a dedicated Handlebars runtime with strict helper registration, URL-aware `renderFile` 支持及使用追踪能力，并补充首批单元测试。
- Builder CLI 现在会在构建完成后输出模板渲染耗时、缓存命中等指标，便于快速诊断性能瓶颈。

### Changed

- `@jiangding/usk-builder` 完全依赖新的模板包，不再维护旧版内嵌引擎；类型定义通过模板引擎方法自动推断，消除了重复声明。
- 工作区依赖统一采用 `workspace:^` 引用策略，确保本地与发布构建使用一致的产物。

### Fixed

- 修复模板渲染在严格模式下访问 `platform` helper 的报错，以及 `renderFile` 对 `URL` 参数解析失败的问题。
- 构建流程重构后恢复 `pnpm build`/`pnpm test` 全量通过，解决之前 DTS 生成阶段的类型缺失报错。

### Planned for v0.4.0

- Integration tests and e2e testing
- Interactive Optimizer for manual description editing
- Advanced caching strategies
- Multi-language skill support

## [0.3.0] - 2024-12-10

### Added - Complete Directory Copy Support

**Core Engine Enhancement** (`@jiangding/usk-core@0.2.0`)

- **完整目录复制功能**: 转换 Skill 时现在默认自动复制整个目录的所有文件和文件夹
  - 递归扫描整个 Skill 目录
  - 自动复制所有子目录和文件（templates/, scripts/, resources/, docs/ 等）
  - 保持完整的目录结构
  - 保留脚本文件的执行权限（.sh, .py 等自动设置为 755）

- **智能文件过滤**: 自动排除不需要的文件和目录
  - 排除 `node_modules`, `.git`, `.gitignore`
  - 排除 `.DS_Store`, `dist`, `build`
  - 排除缓存目录 `.usk-cache`, `.cache`, `coverage`
  - 排除 IDE 配置 `.vscode`, `.idea`
  - 排除日志文件 `*.log`
  - 排除环境变量文件 `.env`, `.env.local`
  - 支持通配符模式匹配

- **用户体验改进**:
  - 无需在 SKILL.md 中明确引用资源文件
  - 一键转换即可完整复制所有相关文件
  - 适用于 `usk convert` 和 `usk batch` 命令

**Build System** (`@jiangding/usk-builder@0.2.0`)

- 更新依赖到最新版本的 core 包
- 继承完整目录复制功能

**CLI** (`@jiangding/usk-cli@0.3.0`)

- 更新依赖到最新版本
- 支持完整目录批量转换

### Changed

- **重要变更**: 资源文件复制逻辑从"基于引用"改为"完整扫描"
  - 之前：只复制 SKILL.md 中明确引用的文件
  - 现在：自动扫描并复制整个目录（除排除列表）
- 修复了 workspace 依赖问题
  - 开发时使用 `workspace:*` 引用本地包
  - 发布时使用具体版本号引用 NPM 包

### Technical Details

**新增代码**:

- `collectSkillFiles()` 方法完全重写
- 新增 `scanDirectory()` 递归扫描函数
- 新增智能排除模式匹配逻辑

**测试**:

- 创建完整测试 Skill 项目验证功能
- 验证文件数量：源 6 个文件 = 目标 6 个文件 ✅
- 验证目录结构保持完整
- 验证脚本执行权限保留

### Migration Guide

对于已有的 Skill 项目，无需任何修改即可享受新功能：

**之前** (v0.2.0):

```bash
# 只转换 SKILL.md 中引用的文件
usk convert ~/.claude/skills/my-skill --target codex
```

**现在** (v0.3.0):

```bash
# 自动转换整个目录的所有文件！
usk convert ~/.claude/skills/my-skill --target codex
# ✅ SKILL.md
# ✅ templates/ 目录
# ✅ scripts/ 目录
# ✅ resources/ 目录
# ✅ docs/ 目录
# ✅ 所有其他文件
```

**批量转换所有 Claude Skills**:

```bash
usk batch "$HOME/.claude/skills/**/SKILL.md" \
  --target codex \
  --output "$HOME/.codex/skills" \
  --strategy balanced
```

### Breaking Changes

无破坏性变更。所有现有功能保持兼容。

## [0.2.0] - 2024-12-09

### Added - Phase 2 Enhancement (Week 6-8)

**CLI Commands** (`@jiangding/usk-cli/src/commands/`)

- `usk init` - Interactive project initialization
  - Three project templates: basic, multi-platform, advanced
  - Interactive prompts for project configuration
  - Automatic directory structure creation
  - Configuration file generation (usk.config.json)
  - Template file scaffolding (SKILL.md)
  - Git initialization option
  - Dependency installation option

- `usk validate` - Configuration validation
  - Comprehensive config file validation
  - Strict mode for production environments
  - JSON output format support
  - Detailed error messages with suggestions
  - Platform-specific validation rules
  - File path existence checks

- `usk doctor` - Project health diagnostics
  - Configuration file analysis
  - Source file verification
  - Output directory checks
  - Cache status inspection
  - Dependency validation
  - Common issue detection
  - Auto-fix suggestions
  - Health score reporting

**Plugin System** (`@jiangding/usk-builder/src/plugin/`)

- Complete plugin lifecycle system
- 9 lifecycle hooks:
  - `onBuildStart` - Before build starts
  - `onBuildEnd` - After build completes
  - `onPlatformStart` - Before platform build
  - `onPlatformEnd` - After platform build
  - `onConfigLoaded` - After config loaded
  - `onTemplateLoaded` - After template loaded
  - `onTemplateRendered` - After template rendered
  - `onResourceCopied` - After resource copied
  - `onError` - On error occurred

**Plugin Manager** (`@jiangding/usk-builder/src/plugin/manager.ts`)

- Plugin registration and management
- Hook execution with error handling
- Async hook support
- Plugin context injection
- Error aggregation and reporting

**Example Plugins**

- `loggerPlugin` - Detailed build logging
  - Verbose mode support
  - Colorized output
  - Timing information
  - File size reporting

- `minifyPlugin` - Content minification
  - HTML comment removal
  - Whitespace compression
  - Newline preservation options
  - Markdown-aware processing

**Example Project** (`examples/basic-skill/`)

- Complete working example
- Demonstrates all USK features:
  - Multi-platform support (Claude + Codex)
  - Handlebars templates with conditionals
  - Platform-specific content
  - Resource file management
  - Build configuration
- Comprehensive README documentation
- Chinese documentation (README_CN.md)

### Changed

- Updated all package names from `@usk/*` to `@jiangding/usk-*`
- Enhanced builder to support plugin system
- Improved CLI output with better formatting
- Added workspace dependencies for builder

### Tests

**New Tests** (78 tests for builder):

- Plugin system: lifecycle hooks, manager, context
- Builder integration with plugins
- Cache manager with concurrency
- Template engine with conditionals
- Configuration loader validation

**Test Statistics**:

- Total tests: 359 passing ✅
- Core module: 199 tests
- Utils module: 82 tests
- Builder module: 78 tests
- Overall coverage: >85%

### Documentation

**New Documentation**:

- `examples/basic-skill/README.md` - Example project guide
- Plugin development guide in builder package
- CLI command documentation

**Updated Documentation**:

- README.md - Added Phase 2 features
- ROADMAP.md - Updated progress
- Package documentation

### Build & Distribution

- All packages successfully building
- Dual format output (CJS + ESM)
- Type declarations generated
- Published to npm as `@jiangding/usk-*`

### Project Status

**Phase 2 Progress: Enhanced Features (Week 1-8) - 100% Complete ✅**

- ✅ Week 1-3: Configuration, Template, Build systems
- ✅ Week 4-5: Cache and Performance optimization
- ✅ Week 6-7: CLI commands (init/validate/doctor)
- ✅ Week 8: Plugin system and examples

**Next Phase: Phase 3**

- Advanced features and ecosystem
- Community contributions
- Production optimization

## [0.2.0] - 2024-12-05

### Added - Phase 1 Core Modules

**Skill Parser** (`@usk/core/src/parser/`)

- Complete YAML frontmatter and markdown body parsing
- Resource extraction with regex patterns:
  - Markdown links: `[text](url)`
  - Code blocks: ` ```language ... ``` `
  - Script references: `.sh`, `.js`, `.ts` files
- Custom `SkillParseError` for detailed error messages
- Test coverage: 86.84%
- 15 unit tests, all passing

**Description Compressor** (`@usk/core/src/optimizer/`)

- 4 compression strategies:
  - `RemoveExamplesStrategy`: Remove code blocks, examples, and comments
  - `SimplifySyntaxStrategy`: Simplify verbose phrases (English & Chinese)
  - `ExtractKeywordsStrategy`: Extract technical keywords (languages, frameworks, versions)
  - `AbbreviateStrategy`: Abbreviate 40+ common technical terms
- 3 compression levels:
  - Conservative: Minimal changes, preserve most content
  - Balanced: Moderate compression with example removal
  - Aggressive: Maximum compression with keyword extraction
- Intelligent truncation algorithm:
  - Sentence boundary detection (English & Chinese)
  - Custom keyword preservation
  - Natural breakpoint selection
- Test coverage: 98.91%
- 89 unit tests, all passing

**Path Mapper** (`@usk/utils/src/path-mapper.ts`)

- Platform path conversion:
  - Claude: `~/.claude/skills` ↔ Codex: `~/.codex/skills`
  - Supports tilde (`~`), relative, and absolute paths
- Batch text replacement with `mapPathsInText()`
- Path utilities:
  - Tilde expansion/contraction
  - Relative ↔ Absolute conversion
  - Path normalization (forward slashes)
  - Platform detection from paths
- Skills directory helpers
- Test coverage: 100% ⭐
- 51 unit tests, all passing

**Skill Analyzer** (`@usk/core/src/analyzer/`)

- Complexity analysis (high/medium/low):
  - Description length factor
  - Body length factor
  - Code examples detection
  - Technical keywords count
  - Resources count
- Technical keyword extraction:
  - Programming languages (TypeScript, React, Python, etc.)
  - Frameworks (Express, FastAPI, Django, etc.)
  - Databases (PostgreSQL, MongoDB, Redis, etc.)
  - APIs (REST, GraphQL, WebSocket, etc.)
  - DevOps tools (Docker, Kubernetes, CI/CD, etc.)
  - Version numbers (v1.0.0, 5.9.3, etc.)
- Compression strategy recommendation:
  - Based on description length and complexity
  - Considers code examples presence
- Quality estimation (0-100 score):
  - Description quality (length, informativeness)
  - Body content completeness
  - Metadata completeness (version, author, tags)
  - Technical keywords bonus
  - Structured content bonus
- Warning generation:
  - Codex 500-char limit warnings
  - Missing metadata warnings
  - Content quality warnings
- Optimization suggestions:
  - Compression strategy recommendations
  - Metadata improvement suggestions
  - Structure optimization tips
  - Complexity reduction suggestions
- Test coverage: 97.47%
- 58 unit tests, all passing

### Changed

- Updated `CompressionOptions` interface with `customKeywords` field
- Updated core exports to include optimizer and analyzer modules
- Enhanced Skill Parser with better error handling

### Test Results

**Overall Statistics**

- Total tests: 162 passing (0 failing)
- Overall coverage: 92.43% (target: 80%)
- Branch coverage: 84.77%
- Function coverage: 87.87%
- Line coverage: 92.43%

**Module Coverage**

- Skill Parser: 86.84%
- Description Compressor: 98.91%
- Path Mapper: 100% ⭐
- Skill Analyzer: 97.47%
- Compression Strategies: 99.67%

### Files Added

**Source Files (12 files)**

- `packages/core/src/optimizer/description-compressor.ts`
- `packages/core/src/optimizer/compression-strategy.ts`
- `packages/core/src/optimizer/strategies/remove-examples.ts`
- `packages/core/src/optimizer/strategies/simplify-syntax.ts`
- `packages/core/src/optimizer/strategies/extract-keywords.ts`
- `packages/core/src/optimizer/strategies/abbreviate.ts`
- `packages/core/src/optimizer/index.ts`
- `packages/core/src/analyzer/skill-analyzer.ts`
- `packages/core/src/analyzer/index.ts`
- `packages/utils/src/path-mapper.ts`

**Test Files (11 files)**

- `packages/core/__tests__/optimizer/description-compressor.test.ts`
- `packages/core/__tests__/optimizer/fixtures.ts`
- `packages/core/__tests__/optimizer/strategies/remove-examples.test.ts`
- `packages/core/__tests__/optimizer/strategies/simplify-syntax.test.ts`
- `packages/core/__tests__/optimizer/strategies/extract-keywords.test.ts`
- `packages/core/__tests__/optimizer/strategies/abbreviate.test.ts`
- `packages/core/__tests__/analyzer/skill-analyzer.test.ts`
- `packages/core/__tests__/analyzer/fixtures.ts`
- `packages/utils/__tests__/path-mapper.test.ts`

### Technical Details

**Lines of Code**

- Production code: ~3,000 lines
- Test code: ~2,500 lines
- Total: ~5,500 lines

**Build Output**

- All packages build successfully with dual format (CJS + ESM)
- Type declarations generated (.d.ts)
- Source maps included

### Project Status

**Phase 1 Progress: Core Engine (Week 1-4) - 100% Complete ✅**

- ✅ Skill Parser implementation
- ✅ Description Compressor with 4 strategies
- ✅ Path Mapper utility
- ✅ Skill Analyzer with quality assessment
- ✅ Unit tests (92.43% coverage)

**Next Steps: Phase 1 Remaining (Week 5-12)**

- CLI commands implementation
- Converter module (Claude ↔ Codex)
- Validator module
- Integration tests
- Documentation website

### Notes

This release completes the core engine modules of Phase 1. All fundamental building blocks for skill conversion are now in place with excellent test coverage.

## [0.1.0-alpha] - 2024-12-05

### Added - Project Infrastructure

**Architecture & Configuration**

- TypeScript 5.9.3 + Monorepo structure with pnpm workspaces
- 5 packages created:
  - `@usk/core` - Core conversion engine
  - `@usk/cli` - Command-line interface
  - `@usk/builder` - Build system
  - `@usk/template` - Template engine
  - `@usk/utils` - Utility functions
- Complete TypeScript configuration with project references
- Build system using tsup (dual CJS/ESM output)
- Code quality tools (ESLint, Prettier)
- Testing framework (Vitest)

**Core Types & Foundation**

- Complete type definitions (300+ lines) in `@usk/core/src/types.ts`:
  - Platform types (Claude, Codex)
  - Skill definitions and metadata
  - Conversion and validation types
  - Quality assessment types
  - Analysis and history types
  - Configuration and preset types
- Basic SkillParser implementation with YAML frontmatter parsing
- Package export configuration

**Documentation**

- Comprehensive project documentation (80,000+ words):
  - Technical Design Document (15,000+ words, 1,500+ lines of code examples)
  - Features Documentation (detailed feature specifications)
  - Development Roadmap (3-phase plan)
  - Platform Comparison (Claude Code vs Codex)
  - Background guides for both platforms
- Development guides:
  - DEVELOPMENT.md - Setup and development workflow
  - CONTRIBUTING.md - Contribution guidelines
  - README.md (English) and README_CN.md (Chinese)
- Example projects and templates

**Build & Development**

- Dual format output (CommonJS + ES Modules)
- TypeScript declaration files generation (.d.ts)
- Source maps for debugging
- Development watch mode
- Automatic type checking
- Code formatting and linting
- Clean and rebuild scripts

### Technical Achievements

**Problem Solving**

- Fixed tsup dts generation conflict with TypeScript project references
  - Solution: Separate `tsconfig.build.json` for build (composite: false)
  - Kept original `tsconfig.json` for type checking
- Fixed ESLint parsing errors in monorepo
  - Solution: Updated parserOptions.project to support multiple tsconfigs
- Proper handling of unused parameters with underscore prefix

**Package Dependencies**

- 344 production and development dependencies installed
- Key dependencies:
  - gray-matter (YAML frontmatter parsing)
  - zod (runtime validation)
  - commander (CLI framework)
  - chalk, ora, inquirer (CLI UI)
  - diff (comparison tool)
  - yaml (YAML processing)

### Configuration Files

- 28 configuration files created:
  - 6 × package.json
  - 6 × tsconfig.json
  - 5 × tsconfig.build.json
  - 5 × tsup.config.ts
  - 1 × pnpm-workspace.yaml
  - 5 × other configs (.eslintrc, .prettierrc, etc.)

### Project Status

**Completed**

- ✅ Project initialization and planning
- ✅ Complete TypeScript + Monorepo architecture
- ✅ Development environment setup (100%)
- ✅ All packages build successfully
- ✅ Code quality tools configured
- ✅ Comprehensive documentation

**Current Phase**

- 🔄 Phase 1: MVP Development (Week 1-12)
  - Next: Complete Skill Parser implementation
  - Next: Description Compressor with compression strategies
  - Next: CLI commands and interactive features

### Notes

This is an alpha release focused on project infrastructure and foundation. Core features are planned for v0.2.0.

The project provides a complete TypeScript + Monorepo development environment ready for Phase 1 core feature development.

---

[Unreleased]: https://github.com/JiangDing1990/universal-skill-kit/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/JiangDing1990/universal-skill-kit/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/JiangDing1990/universal-skill-kit/compare/v0.1.0-alpha...v0.2.0
[0.1.0-alpha]: https://github.com/JiangDing1990/universal-skill-kit/releases/tag/v0.1.0-alpha
