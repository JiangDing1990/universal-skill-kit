# @jiangding/usk-core

Core conversion engine for Universal Skill Kit.

## Installation

```bash
npm install @jiangding/usk-core
```

## Usage

```typescript
import { SkillConverter, SkillValidator, SkillAnalyzer } from '@jiangding/usk-core'

// Validate Skill
const validator = new SkillValidator()
const validation = await validator.validate(skill, skillPath)

// Analyze Skill
const analyzer = new SkillAnalyzer()
const report = analyzer.analyze(skill)

// Convert Skill
const converter = new SkillConverter()
const result = await converter.convert(skillPath, {
  targetPlatform: 'codex',
  outputDir: './output',
  compressionStrategy: 'balanced'
})
```

## Features

- 🔄 **Skill Parser** - Parse Claude & Codex Skills
- 📦 **Description Compressor** - 4 compression strategies
- 🗺️ **Path Mapper** - Convert paths between platforms
- 📊 **Skill Analyzer** - Quality analysis and recommendations
- ✅ **Skill Validator** - Comprehensive validation
- 🔀 **Skill Converter** - Bidirectional conversion

## Documentation

See the [main repository](https://github.com/JiangDing1990/universal-skill-kit#readme) for full documentation.

## License

MIT
