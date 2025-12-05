# @jiangding/usk-utils

Utility functions for Universal Skill Kit.

## Installation

```bash
npm install @jiangding/usk-utils
```

## Usage

```typescript
import { PathMapper, getLogger } from '@jiangding/usk-utils'

// Path mapping
const mapper = new PathMapper()
const result = mapper.mapPath('~/.claude/skills/my-skill', 'codex')
// → ~/.codex/skills/my-skill

// Logging
const logger = getLogger()
logger.setVerbose(true)
logger.debug('Debug message')
logger.info('Info message')
```

## Features

- 🗺️ **Path Mapper** - Convert paths between platforms
- 📝 **Logger** - 5-level structured logging
- 🛠️ **Utilities** - Common helper functions

## Documentation

See the [main repository](https://github.com/JiangDing1990/universal-skill-kit#readme) for full documentation.

## License

MIT
