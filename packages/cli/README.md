# @usk/cli

Command-line interface for Universal Skill Kit.

## Installation

```bash
npm install -g @usk/cli
```

## Usage

### Convert a Skill

```bash
# Convert to Codex platform
usk convert my-skill/ -t codex -o ./output

# Convert to Claude platform
usk convert my-skill.md -t claude -o ./output

# Interactive mode
usk convert my-skill/ -t codex --interactive

# Verbose logging
usk convert my-skill/ -t codex --verbose
```

### Analyze Skill Quality

```bash
# Analyze skill
usk analyze my-skill/

# JSON output
usk analyze my-skill/ --json
```

### Batch Convert

```bash
# Convert all skills in directory
usk batch "skills/**/*.md" -t codex -o ./output

# With specific compression strategy
usk batch "skills/*/" -t codex -s aggressive

# Parallel processing (default)
usk batch "skills/*/" -t codex --parallel
```

## Features

- 🔄 **Smart Conversion** - Claude ↔ Codex bidirectional conversion
- ✅ **Automatic Validation** - Pre-conversion quality checks
- 📦 **Intelligent Compression** - 4 strategies for Codex 500-char limit
- 🎯 **Batch Processing** - Convert multiple skills with 80% speed boost
- 💡 **Quality Analysis** - Detailed scoring and suggestions
- 🌐 **Bilingual UI** - English & Chinese output

## Documentation

See the [main repository](https://github.com/JiangDing1990/universal-skill-kit#readme) for full documentation.

## License

MIT
