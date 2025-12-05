# Universal Skill Kit

<div align="center">

[![npm version](https://img.shields.io/npm/v/universal-skill-kit.svg)](https://www.npmjs.com/package/universal-skill-kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

**A unified toolkit for developing and converting AI CLI Skills across platforms**

[English](README.md) | [简体中文](README_CN.md)

</div>

## Overview

Universal Skill Kit (USK) is a comprehensive toolset for developing, converting, and managing AI CLI Skills across different platforms including Claude Code and Codex. It solves the challenge of maintaining Skills for multiple AI CLI platforms by providing smart conversion tools and a unified development framework.

### Key Features

- 🔄 **One-Click Conversion** - Convert Skills between Claude and Codex formats instantly
- 🛠️ **Unified Development** - Write once, deploy to multiple platforms
- 📦 **Smart Optimization** - Automatic description compression and structure optimization
- ✅ **Syntax Validation** - Built-in TypeScript/TSX validation for templates
- 🎯 **Template Engine** - Conditional compilation for platform-specific content
- 🚀 **Batch Processing** - Convert multiple Skills in parallel
- 🔌 **Extensible** - Plugin system for custom transformations

## Why Universal Skill Kit?

**Problem**: AI CLI platforms like Claude Code and Codex have different Skill formats:

- **Claude**: Allows detailed documentation (no length limit), stores in `~/.claude/skills/`
- **Codex**: Requires concise descriptions (500 char max), stores in `~/.codex/skills/`

**Solution**: USK bridges these differences by:

1. Intelligently compressing descriptions while preserving key information
2. Adapting directory structures and paths automatically
3. Providing a unified configuration format for cross-platform development

## Quick Start

### Installation

```bash
npm install -g universal-skill-kit

# Or use with npx
npx universal-skill-kit --help
```

### Convert Existing Skill

```bash
# Convert Claude Skill to Codex
usk convert ~/.claude/skills/my-skill --to codex --output ~/.codex/skills

# Convert Codex Skill to Claude
usk convert ~/.codex/skills/my-skill --to claude --output ~/.claude/skills

# Batch convert all Skills
usk batch-convert ~/.claude/skills --from claude --to codex
```

### Create Cross-Platform Skill

```bash
# 1. Initialize project
usk init my-awesome-skill --template universal

# 2. Edit configuration
cd my-awesome-skill
# Edit skill.config.json and SKILL.md

# 3. Build for all platforms
usk build --platform all

# Output:
# ✓ .claude/skills/my-awesome-skill/
# ✓ .codex/skills/my-awesome-skill/
```

### Validate Skill

```bash
# Validate Claude Skill
usk validate ~/.claude/skills/my-skill --platform claude

# Validate Codex Skill
usk validate ~/.codex/skills/my-skill --platform codex
```

## CLI Commands

### `convert`

Convert a Skill from one platform to another.

```bash
usk convert <source> --to <platform> [options]

Options:
  -t, --to <platform>    Target platform (claude|codex)
  -o, --output <dir>     Output directory
```

### `build`

Build Skills from unified configuration.

```bash
usk build [options]

Options:
  -p, --platform <platform>  Target platform (claude|codex|all) [default: all]
  -c, --config <file>        Config file path [default: skill.config.json]
```

### `validate`

Validate Skill format and syntax.

```bash
usk validate <dir> [options]

Options:
  -p, --platform <platform>  Platform to validate against (claude|codex)
```

### `init`

Initialize a new Skill project.

```bash
usk init <name> [options]

Options:
  -t, --template <name>  Template name (basic|universal|react) [default: basic]
```

### `batch-convert`

Convert multiple Skills in batch.

```bash
usk batch-convert <dir> [options]

Options:
  --from <platform>  Source platform [default: claude]
  --to <platform>    Target platform [default: codex]
```

## Configuration

### skill.config.json

A unified configuration file for cross-platform Skill development:

```json
{
  "name": "my-skill",
  "version": "1.0.0",
  "author": "Your Name",
  "platforms": {
    "claude": {
      "enabled": true,
      "output": ".claude/skills"
    },
    "codex": {
      "enabled": true,
      "output": ".codex/skills"
    }
  },
  "description": {
    "full": "Complete detailed description for Claude...",
    "short": "Concise description for Codex (max 500 chars)",
    "keywords": ["React", "TypeScript", "DVA"]
  },
  "body": {
    "source": "SKILL.md",
    "sections": {
      "claude": ["all"],
      "codex": ["Core Guide", "Common Scenarios", "Tech Stack"]
    }
  },
  "resources": {
    "templates": ["assets/templates/**/*.tsx"],
    "references": ["references/**/*.md"],
    "scripts": ["scripts/**/*.sh"]
  },
  "build": {
    "validate": true,
    "minify": false
  }
}
```

## Template Engine

Use conditional compilation to write platform-specific content:

```markdown
---
name: my-skill
version: 1.0.0
---

# {{name}}

<!-- @if platform=claude -->

This detailed content only appears in Claude Skills.
Can include extensive documentation, examples, and references.

<!-- @endif -->

<!-- @if platform=codex -->

This concise content appears in Codex Skills.
Optimized for the 500-character description limit.

<!-- @endif -->

<!-- @if platform=claude,codex -->

This content appears on both platforms.

<!-- @endif -->

## Common Usage

<!-- @unless platform=codex -->

Extended examples and detailed explanations...

<!-- @endunless -->
```

## Architecture

```
universal-skill-kit/
├── packages/
│   ├── core/                    # Core conversion engine
│   │   ├── converter/           # Platform converters
│   │   ├── parser/              # Skill parsers
│   │   ├── validator/           # Syntax validators
│   │   └── optimizer/           # Smart optimizers
│   ├── cli/                     # CLI tool
│   ├── builder/                 # Unified build tool
│   └── utils/                   # Common utilities
├── templates/                   # Skill templates
│   ├── claude/
│   ├── codex/
│   └── universal/
└── docs/                        # Documentation
    ├── en/
    └── zh-CN/
```

## Examples

### Example 1: Quick Migration

Migrate an existing Claude Skill to Codex:

```bash
# Before: Skill in ~/.claude/skills/react-helper/
usk convert ~/.claude/skills/react-helper --to codex

# After: Skill in ~/.codex/skills/react-helper/
# ✓ Description compressed to 480 characters
# ✓ Paths updated (.claude → .codex)
# ✓ Body optimized for Codex format
```

### Example 2: Universal Skill Development

Develop a Skill that works on both platforms:

```bash
# 1. Initialize
usk init frontend-helper --template universal

# 2. Structure created
frontend-helper/
├── SKILL.md              # Source with conditional blocks
├── skill.config.json     # Unified config
├── assets/
│   └── templates/
└── references/

# 3. Build for both platforms
cd frontend-helper
usk build --platform all

# 4. Output
.claude/skills/frontend-helper/   # Full version
.codex/skills/frontend-helper/    # Optimized version
```

### Example 3: Batch Migration

Migrate all your Claude Skills to Codex:

```bash
# Convert all Skills in directory
usk batch-convert ~/.claude/skills --from claude --to codex

# Output
✓ Converting react-helper... Done
✓ Converting vue-assistant... Done
✓ Converting api-generator... Done

✓ Successfully converted 3 Skills
✗ Failed: 0
```

## API Reference

### Converter API

```typescript
import { SkillConverter } from 'universal-skill-kit'

const converter = new SkillConverter()

// Convert a Skill
const result = await converter.convert('/path/to/skill', {
  targetPlatform: 'codex',
  outputDir: '/output/path'
})

console.log(result.outputPath) // Converted Skill location
console.log(result.metadata) // Skill metadata
```

### Builder API

```typescript
import { SkillBuilder } from 'universal-skill-kit'

const builder = new SkillBuilder()

// Build from config
const result = await builder.build('skill.config.json', 'codex')

console.log(result.success) // true
console.log(result.outputPath) // Output directory
```

### Validator API

```typescript
import { SkillValidator } from 'universal-skill-kit'

const validator = new SkillValidator()

// Validate a Skill
const result = await validator.validate('/path/to/skill', 'claude')

if (result.valid) {
  console.log('✓ Validation passed')
} else {
  console.error('Errors:', result.errors)
  console.warn('Warnings:', result.warnings)
}
```

## Advanced Features

### Description Compression

USK uses intelligent algorithms to compress descriptions:

```typescript
// Original (800 characters)
"专用于构建基于 React 16.14 + DVA 2.x + @lianjia/antd-life 技术栈的前端应用。
当用户需要创建列表页（CRUD）、详情页、表单弹窗或编写 DVA Model 时应使用此技能。
提供完整的代码模板、最佳实践指南和质量检查清单。
不适用于 React 18 或 Ant Design 5 项目..."

// Compressed (480 characters)
"专用于 React 16.14 + DVA 2.x + @lianjia/antd-life 技术栈。
创建列表页（CRUD）、详情页、表单弹窗或编写 DVA Model 时使用。
不适用于 React 18 或 Ant Design 5 项目。
提供完整模板、代码示例和质量检查清单。"
```

**Compression strategies**:

- Remove redundant examples
- Simplify sentence structure
- Preserve technical keywords
- Maintain essential information

### Path Mapping

Automatically updates paths when converting:

```typescript
// Claude paths
~/.claude/skills/my-skill/
.claude/skills/my-skill/

// Codex paths (auto-mapped)
~/.codex/skills/my-skill/
.codex/skills/my-skill/
```

### Plugin System

Extend functionality with plugins:

```typescript
import { Plugin } from 'universal-skill-kit'

const customPlugin: Plugin = {
  name: 'my-plugin',
  version: '1.0.0',
  hooks: {
    beforeConvert: skill => {
      // Modify skill before conversion
      return skill
    },
    afterConvert: skill => {
      // Modify skill after conversion
      return skill
    }
  }
}

const converter = new SkillConverter()
converter.use(customPlugin)
```

## Testing

```bash
# Run all tests
npm test

# Run specific tests
npm test -- converter
npm test -- validator

# Run with coverage
npm run test:coverage

# Integration tests
npm run test:integration
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone repository
git clone https://github.com/yourusername/universal-skill-kit.git
cd universal-skill-kit

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build
npm run build

# Run tests
npm test
```

### Code Style

- **Language**: TypeScript 5.3+
- **Format**: Prettier
- **Lint**: ESLint
- **Commit**: Conventional Commits

## Roadmap

See [ROADMAP.md](docs/ROADMAP.md) for detailed development plans.

**Phase 1 (MVP)** - Q1 2024

- ✅ Core conversion engine
- ✅ CLI tool with basic commands
- ✅ Description compression
- ✅ Path mapping

**Phase 2** - Q2 2024

- 🔄 Template engine with conditional compilation
- 🔄 Unified build system
- 🔄 Syntax validation
- 🔄 Batch processing

**Phase 3** - Q3 2024

- 📋 Plugin system
- 📋 Support for more platforms
- 📋 Web UI
- 📋 VS Code extension

## FAQ

### Q: What's the difference between conversion and building?

**Conversion** takes an existing Skill and transforms it to another platform format. It's for migrating existing Skills.

**Building** uses a unified configuration to generate Skills for multiple platforms simultaneously. It's for developing new cross-platform Skills.

### Q: Will conversion lose information?

USK uses intelligent compression that preserves essential information:

- Technical keywords are always preserved
- Key usage instructions remain intact
- Only redundant examples and verbose text are simplified

### Q: Can I customize the conversion process?

Yes! Use the plugin system to add custom transformation logic:

```typescript
const myPlugin = {
  name: 'custom-transformer',
  hooks: {
    beforeConvert: skill => {
      // Your custom logic
      return modifiedSkill
    }
  }
}

converter.use(myPlugin)
```

### Q: Does it support other AI CLI platforms?

Currently supports Claude Code and Codex. The architecture is designed to be extensible - adding support for new platforms requires implementing a platform adapter.

## License

[MIT License](LICENSE) © 2024

## Acknowledgments

- Claude Code team for the excellent AI CLI
- Codex team for Skill support
- All contributors to this project

## Links

- [Documentation](docs/)
- [Technical Design](docs/TECHNICAL_DESIGN.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Issue Tracker](https://github.com/yourusername/universal-skill-kit/issues)
- [Changelog](CHANGELOG.md)

---

<div align="center">

**Made with ❤️ for the AI CLI community**

[⭐ Star us on GitHub](https://github.com/yourusername/universal-skill-kit)

</div>
