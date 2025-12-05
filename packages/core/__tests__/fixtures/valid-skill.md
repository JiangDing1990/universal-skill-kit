---
name: test-skill
version: 1.0.0
description: A test skill for unit testing
author: Test Author
tags:
  - test
  - example
---

# Test Skill

This is a test skill with various resource references.

## Links

- [Template file](./templates/example.template.md)
- [Reference doc](./docs/reference.md)
- [Script file](./scripts/setup.sh)
- [External link](https://example.com) - should be ignored
- [Anchor link](#section) - should be ignored
- [Regular file](./config.json)

## Code Blocks

```typescript:src/index.ts
export function hello() {
  return 'world'
}
```

```bash {scripts/deploy.sh}
#!/bin/bash
echo "Deploying..."
```

```python
# Regular code block without file reference
print("Hello")
```

## More Content

Some additional content here.
