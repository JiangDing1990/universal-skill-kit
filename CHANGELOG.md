# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned for v0.2.0

- Complete Skill Parser implementation with resource extraction
- Description Compressor with 4 compression strategies
- Path Mapper utility
- Skill Analyzer with complexity evaluation
- Quality Checker with 5-dimensional scoring
- CLI commands implementation
- Interactive Optimizer
- Unit tests (coverage > 80%)

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

[Unreleased]: https://github.com/JiangDing1990/universal-skill-kit/compare/v0.1.0-alpha...HEAD
[0.1.0-alpha]: https://github.com/JiangDing1990/universal-skill-kit/releases/tag/v0.1.0-alpha
