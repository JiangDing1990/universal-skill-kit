# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

**Bilingual User Interface** (`@usk/core/src/errors.ts`, `@usk/cli/src/commands/`)

- Chinese-English bilingual output for all user-facing messages
- Bilingual error messages (SkillNotFoundError, ConversionError, etc.)
- Bilingual error suggestions for better user experience
- Bilingual CLI prompts (interactive mode, spinners, status messages)
- Bilingual statistics display (compression rate, duration, etc.)
- Supports both English and Chinese-speaking users without configuration
- Improves accessibility for international users

**Performance Optimization** (`@usk/core/src/converter/`)

- Parallel batch conversion with configurable concurrency (default: 5 files at a time)
- Real-time progress callbacks for batch operations
- Intelligent error handling that doesn't block other conversions
- 80% performance improvement for batch operations (20 Skills: 20s → 4s)

**Error Handling System** (`@usk/core/src/errors.ts`)

- Unified error class hierarchy (`USKError` base class)
- Specific error types: `SkillNotFoundError`, `ConversionError`, `ResourceNotFoundError`, etc.
- Automatic error suggestion system based on error type
- Formatted error messages with clear actionable suggestions
- Error code constants for programmatic error handling

**Logging System** (`@usk/utils/src/logger.ts`)

- Configurable log levels (ERROR, WARN, INFO, DEBUG, TRACE)
- `--verbose` flag for detailed conversion logs
- Automatic log level management
- Structured logging with timestamps and prefixes
- Debug logs for every conversion step

**Constants and Type Safety** (`@usk/core/src/constants.ts`)

- Centralized constant definitions (platforms, limits, paths, etc.)
- Type-safe constants using `as const`
- Elimination of magic numbers and strings throughout codebase
- Improved code maintainability and readability

**CLI Enhancements**

- `--verbose` option for all commands
- Real-time progress display in batch convert (shows current file)
- Detailed error messages with suggestions
- Parallel batch processing enabled by default

**Multi-File Skill Support** (`@usk/core/src/converter/`)

- Full support for directory-based skills with multiple files
- Automatic collection of resource files (templates, scripts, references)
- Recursive file copying with structure preservation
- Executable permission preservation for script files (.sh, .bash, .py, .js, .ts)
- Smart output path determination for both files and directories
- Warning messages for missing resource files

**Key Features**:
- Input can be either a file path or directory path
- Automatically searches for SKILL.md in directories
- Copies all referenced files maintaining relative paths
- Handles nested folder structures (templates/, scripts/, resources/)

**Skill Validator** (`@usk/core/src/validator/`)

- Complete validation system for skill definitions
- Metadata validation (name, version, description, author, tags)
- Description length validation with platform-specific checks
- Body content validation (structure, examples, documentation quality)
- Resource file existence verification
- Common issue detection (broken links, TODO markers, placeholder text)
- Platform-specific validation for Codex (500 char description limit)

**Validation Features**:
- Error detection for critical issues (missing name, empty body, missing resources)
- Warning system for quality improvements (short descriptions, missing author, etc.)
- Severity levels: low, medium, high
- Detailed error messages with field identification
- Async validation for resource file checking

**Validator CLI Integration** (`@usk/cli/src/commands/`)

- Automatic validation before conversion
- Beautiful colored output with icons (✓, ⚠, ✗)
- Three-level validation display:
  - Errors (red ❌): Block conversion unless --interactive override
  - Warnings (yellow/gray ⚠): Quality suggestions with severity indicators
  - Platform-specific notes (cyan ℹ️): Codex compression warnings
- Interactive mode: Allow users to continue despite errors
- Non-interactive mode: Require --interactive flag to override
- Validation steps clearly shown in spinner progress

**CLI Commands** (`@usk/cli/src/`)

- Command-line interface with Commander.js
- Three core commands:
  - `usk convert <input>` - Convert single skill
  - `usk analyze <input>` - Analyze skill and show recommendations
  - `usk batch <pattern>` - Batch convert multiple skills
- Interactive mode with inquirer prompts
- Beautiful output with chalk colors
- Progress indicators with ora spinners
- Conversion statistics display
- Quality score reporting
- Keyword preservation tracking
- Error handling and user-friendly messages

**Convert Command**

- Platform selection (claude|codex)
- Compression strategy selection
- Output directory specification
- Interactive mode with prompts
- Detailed conversion statistics
- Success/failure indicators

**Analyze Command**

- Complexity analysis display
- Technical keywords extraction
- Strategy recommendations
- Quality score with color coding
- Warnings and suggestions
- Verbose mode for detailed info
- JSON output support

**Batch Convert Command**

- Glob pattern matching for multiple files
- Batch processing with progress tracking
- Overall statistics aggregation
- Individual result reporting
- Continue on error
- Success/failure summary

**Skill Converter** (`@usk/core/src/converter/`)

- Bidirectional conversion: Claude ↔ Codex
- Automatic source platform detection from file paths
- Smart description compression for Codex (500 char limit)
- Path mapping integration (.claude → .codex)
- Batch conversion support for multiple skills
- Conversion statistics:
  - Compression rate calculation
  - Preserved/lost keywords tracking
  - Duration measurement
  - Quality score reporting
- YAML frontmatter generation
- File I/O operations with error handling
- Integration of all core modules:
  - SkillParser for file parsing
  - DescriptionCompressor for text optimization
  - SkillAnalyzer for strategy recommendation
  - PathMapper for path transformation

### Changed

- **Breaking**: `convertBatch()` now returns immediately on individual failures instead of blocking
- `ConvertOptions` interface now includes `parallel` and `verbose` flags
- `ConversionResult` interface now includes optional `error` field for failed conversions
- Replaced magic numbers and strings with constants from `constants.ts`
- Improved script file detection using `SCRIPT_EXTENSIONS` constant
- Batch concurrency now configurable via `LIMITS.BATCH_CONCURRENCY`
- Updated `@usk/core` package dependencies: added `@usk/utils` workspace dependency
- Fixed `@usk/utils` package.json exports configuration
- Updated core module exports to include converter, validator, errors, and constants
- Enhanced README with comprehensive feature documentation
- Fixed Validator regex to properly detect empty links

### Tests

**New Tests** (25 new tests):
- Validator module: 25 comprehensive test cases
  - Metadata validation: 7 tests
  - Description length: 3 tests
  - Body content: 4 tests
  - Resource files: 3 tests
  - Common issues: 3 tests
  - Platform-specific: 3 tests
  - Severity levels: 2 tests

**Test Statistics**:
- Total tests: 199 passing ✅
- Overall coverage: 90.59%
- Validator coverage: 97.75% ⭐

### Documentation

**New Documentation**:
- USER_GUIDE.md - Comprehensive user guide (580+ lines)
  - Quick start tutorials
  - Advanced usage examples
  - FAQ section
  - Best practices
  - Troubleshooting guide

**Updated Documentation**:
- README.md - Complete rewrite with actual features
  - Feature showcase
  - Installation guide
  - Usage examples
  - API documentation

### Planned for v0.3.0

- Skill Validator with schema validation
- CLI commands implementation
- Interactive Optimizer
- Integration tests and documentation

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

[Unreleased]: https://github.com/JiangDing1990/universal-skill-kit/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/JiangDing1990/universal-skill-kit/compare/v0.1.0-alpha...v0.2.0
[0.1.0-alpha]: https://github.com/JiangDing1990/universal-skill-kit/releases/tag/v0.1.0-alpha
