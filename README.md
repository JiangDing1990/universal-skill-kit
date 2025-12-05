# Universal Skill Kit

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Test Coverage](https://img.shields.io/badge/coverage-90.59%25-brightgreen.svg)](https://github.com/JiangDing1990/universal-skill-kit)
[![Tests](https://img.shields.io/badge/tests-199%20passing-brightgreen.svg)](https://github.com/JiangDing1990/universal-skill-kit)

**Cross-platform AI CLI Skills Development and Conversion Toolkit**

[English](#) | [简体中文](README_CN.md)

</div>

## ✨ Features

- 🔄 **Smart Conversion** - Bidirectional Claude ↔ Codex conversion with key information preservation
- 📁 **Multi-File Support** - Full support for directory structures, templates, scripts, and resource files
- ✅ **Automatic Validation** - Pre-conversion quality and completeness checks
- 📦 **Intelligent Compression** - 4 compression strategies, auto-adapting to Codex 500-character limit
- 🎯 **Batch Processing** - Convert multiple Skills at once with parallel processing
- 💡 **Quality Analysis** - Detailed quality scoring and improvement suggestions
- 🎨 **Beautiful Output** - Colorful progress indicators and clear error messages
- ⚡ **High Performance** - 80% faster with parallel batch conversion

## 📖 Quick Start

### Installation

```bash
npm install -g @usk/cli

# Or using pnpm
pnpm add -g @usk/cli
```

### Basic Usage

#### 1. Convert a Single Skill

```bash
# Convert to Codex platform
usk convert my-skill/ -t codex -o ./output

# Convert to Claude platform
usk convert my-skill.md -t claude -o ./output

# Use interactive mode
usk convert my-skill/ -t codex --interactive

# With verbose logging
usk convert my-skill/ -t codex --verbose
```

#### 2. Analyze Skill Quality

```bash
# Analyze skill and get recommendations
usk analyze my-skill/

# Output as JSON
usk analyze my-skill/ --json
```

#### 3. Batch Convert

```bash
# Convert all skills in directory
usk batch "skills/**/*.md" -t codex -o ./output

# Use specific compression strategy
usk batch "skills/*/" -t codex -s aggressive

# Parallel processing (default)
usk batch "skills/*/" -t codex --parallel
```

## 🎯 Core Features

### 1. Intelligent Validation System

Automatic quality checks before conversion:

```bash
$ usk convert my-skill/ -t codex

✔ Skill parsed
✔ Validation passed

⚠️  Validation Warnings:
  ⚠ [description] Description is 888 chars (Codex limit: 500)
  ℹ [body] Consider adding code examples

ℹ️  Platform-Specific Notes:
  • [description] Will be compressed to 409 chars (53.9% compression)

✔ Conversion completed!
```

**Validation Checks**:
- ❌ **Errors**: Required fields, resource file existence
- ⚠️ **Warnings**: Quality suggestions, formatting issues
- ℹ️ **Platform Notes**: Codex limits, compression requirements

### 2. Multi-File Skills Support

Full support for complex Skill structures:

```
my-skill/
├── SKILL.md              # Main file
├── templates/            # Template files
│   └── example.template.md
├── scripts/              # Script files
│   ├── setup.sh
│   └── helper.ts
└── resources/            # Resource files
    └── config.yaml
```

Maintains complete directory structure and file permissions after conversion.

### 3. Intelligent Description Compression

4 compression strategies auto-adapt to Codex 500-character limit:

- **Conservative**: Minimal changes, preserves most content
- **Balanced**: Moderate compression, removes example code (recommended)
- **Aggressive**: Maximum compression, extracts keywords

```bash
# Specify compression strategy
usk convert my-skill/ -t codex -s aggressive
```

### 4. Quality Analysis

Get detailed quality scoring and improvement suggestions:

```bash
$ usk analyze my-skill/

📊 Skill Analysis Report
═══════════════════════════════════════════════

Basic Information:
  Name: my-skill
  Version: 1.0.0
  Author: Author Name
  Tags: react, typescript

Complexity Analysis:
  Level: MEDIUM
  Description Length: 450 chars
  Has Code Examples: ✓

Technical Keywords:
  React, TypeScript, API, GraphQL

Compression Strategy:
  Recommended: balanced

Quality Assessment:
  Score: 85/100

💡 Suggestions:
  ⚡ Add author information for better attribution
  ℹ Consider adding more code examples
```

### 5. Performance Optimization

Parallel batch conversion for maximum efficiency:

```bash
$ usk batch "skills/**/*.md" -t codex

Converting 1/20: skill-1.md
Converting 2/20: skill-2.md
Converting 3/20: skill-3.md
...

✔ Converted all 20 skills successfully in 4s!

Performance: 80% faster with 5-file parallel processing
```

### 6. Enhanced Error Handling

Friendly error messages with actionable suggestions:

```bash
$ usk convert non-existent/

❌ Error:
  [SKILL_NOT_FOUND] Skill not found: non-existent/SKILL.md

💡 Suggestions:
  • Ensure the file path is correct
  • If it's a directory, make sure it contains SKILL.md
  • Use absolute path or path relative to current working directory
```

## 🏗️ Project Structure

```
universal-skill-kit/
├── packages/
│   ├── core/        # @usk/core - Core conversion engine
│   │   ├── parser/      # Skill parser
│   │   ├── optimizer/   # Smart compressor
│   │   ├── analyzer/    # Quality analyzer
│   │   ├── validator/   # Validator ✨
│   │   ├── converter/   # Converter (multi-file support)
│   │   ├── errors/      # Error handling ✨ NEW
│   │   └── constants/   # Constants ✨ NEW
│   ├── cli/         # @usk/cli - Command-line tool
│   └── utils/       # @usk/utils - Utilities
│       ├── path-mapper/ # Path mapping
│       └── logger/      # Logging system ✨ NEW
├── docs/            # Documentation
└── examples/        # Examples
```

## 📊 Test Coverage

```
Overall Coverage: 90.59%
─────────────────────────────
Validator:   97.75% ⭐
Analyzer:    96.01%
Optimizer:   94.79%
Parser:      84.61%
Converter:   83.36%
─────────────────────────────
Tests Passing: 199/199 ✅
```

## 🔧 API Usage

### Using Core APIs

```typescript
import { SkillConverter, SkillValidator, SkillAnalyzer } from '@usk/core'

// 1. Validate Skill
const validator = new SkillValidator()
const validation = await validator.validate(skill, skillPath)

if (!validation.valid) {
  console.log('Errors:', validation.errors)
}

// 2. Analyze Skill
const analyzer = new SkillAnalyzer()
const report = analyzer.analyze(skill)
console.log('Quality Score:', report.estimatedQuality)
console.log('Recommended Strategy:', report.recommendedStrategy)

// 3. Convert Skill
const converter = new SkillConverter()
const result = await converter.convert(skillPath, {
  targetPlatform: 'codex',
  outputDir: './output',
  compressionStrategy: 'balanced',
  verbose: true  // Enable detailed logs
})

console.log('Conversion successful:', result.success)
console.log('Output:', result.outputPath)
console.log('Compression rate:', result.statistics.compressionRate)
```

### Batch Conversion with Progress Callback

```typescript
const results = await converter.convertBatch(
  files,
  options,
  (current, total, skillPath) => {
    console.log(`Converting ${current}/${total}: ${skillPath}`)
  }
)
```

## 🎨 CLI Options

### convert Command

```bash
usk convert <input> [options]

Options:
  -t, --target <platform>      Target platform (claude|codex) [default: codex]
  -o, --output <dir>           Output directory
  -s, --strategy <strategy>    Compression strategy (conservative|balanced|aggressive)
  -i, --interactive            Interactive mode
  --verbose                    Show detailed logs
```

### analyze Command

```bash
usk analyze <input> [options]

Options:
  -v, --verbose               Show detailed analysis
  --json                      Output as JSON
```

### batch Command

```bash
usk batch <pattern> [options]

Options:
  -t, --target <platform>     Target platform [default: codex]
  -o, --output <dir>          Output directory
  -s, --strategy <strategy>   Compression strategy
  --parallel                  Enable parallel processing [default: true]
  --verbose                   Show detailed logs
```

## 🌟 Highlights

### Automatic Validation

Pre-conversion Skill quality checks:
- Validates required fields (name, description, body)
- Verifies resource file existence
- Detects common issues (empty links, TODO markers, etc.)
- Platform-specific requirement checks (Codex 500-character limit)

### Intelligent Compression

Compresses descriptions while preserving key technical information:
- Extracts technical keywords (version numbers, framework names, etc.)
- Removes redundant example code
- Simplifies verbose expressions
- Intelligent truncation maintaining sentence integrity

### Multi-File Support

Complete support for complex Skill structures:
- Recursively copies all resource files
- Maintains directory structure and relative paths
- Preserves script file permissions (755)
- Warning messages for missing files

### Performance Optimization

- **Parallel Processing**: Default 5-file concurrency
- **80% Faster**: Batch conversion of 20 Skills: 20s → 4s
- **Real-time Progress**: Live updates during batch conversion
- **Smart Error Handling**: Individual failures don't block batch operations

## 📝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## 📄 License

[MIT](LICENSE)

## 🔗 Related Links

- [Technical Design](docs/TECHNICAL_DESIGN.md)
- [Development Roadmap](docs/ROADMAP.md)
- [Changelog](CHANGELOG.md)
- [Contributing Guide](CONTRIBUTING.md)
- [User Guide](docs/USER_GUIDE.md)

## 💬 Feedback

Have questions or suggestions? Please submit an [Issue](https://github.com/JiangDing1990/universal-skill-kit/issues)

---

<div align="center">

Made with ❤️ by [JiangDing1990](https://github.com/JiangDing1990)

</div>
