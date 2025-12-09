# Watch Mode 使用指南

Watch 模式允许你在开发过程中自动监听文件变化并重新构建项目。

## 启动 Watch 模式

```bash
# 基本用法
usk build --watch

# 简写
usk build -w

# 详细输出模式
usk build --watch --verbose

# 指定配置文件
usk build --watch --config custom.config.json
```

## 工作原理

Watch 模式会监听以下文件的变化:

1. **配置文件** - `usk.config.json`
2. **入口模板** - `source.entry` 指定的文件
3. **模板目录** - `source.templates` 指定的文件
4. **脚本目录** - `source.scripts` 指定的文件
5. **资源目录** - `source.resources` 指定的文件

### 自动忽略的目录

以下目录会被自动忽略,不会触发重新构建:

- `node_modules/`
- `.git/`
- `dist/` (输出目录)
- `.usk-cache/` (缓存目录)

## 功能特性

### 1. 防抖处理

Watch 模式使用防抖机制避免频繁的重新构建。默认延迟 300ms。

### 2. 智能缓存

Watch 模式下构建时会使用增量缓存,只重新渲染发生变化的内容。

### 3. 错误处理

构建错误不会停止 Watch 模式,只会显示错误信息并继续监听。

### 4. 实时反馈

文件变化时会立即显示:

```
📝 Changed: src/SKILL.md
🔄 Rebuilding...
✅ Rebuild completed in 50ms
```

## 使用示例

### 开发工作流

1. **启动 Watch 模式**

   ```bash
   cd examples/basic-skill
   usk build --watch
   ```

   输出:
   ```
   ✓ Configuration loaded

   👀 Watch mode enabled
   Press Ctrl+C to stop

   🚀 Starting initial build...

   ✨ Build completed successfully!

   ✓ claude (2.4 KB, 1ms)
     → ./dist/claude
   ✓ codex (2.4 KB, 1ms)
     → ./dist/codex

   Total duration: 2ms
   ```

2. **编辑源文件**

   修改 `src/SKILL.md`:
   ```markdown
   # {{name}} - Updated!
   ```

   Watch 输出:
   ```
   📝 Changed: src/SKILL.md
   🔄 Rebuilding...

   ✅ Rebuild completed in 50ms
   ```

3. **查看构建结果**

   ```bash
   cat dist/claude/SKILL.md
   # 查看更新后的内容
   ```

4. **停止 Watch**

   按 `Ctrl+C`:
   ```
   ^C
   ⏹  Stopping watcher...
   ✓ Watcher stopped
   ```

### 多文件同时编辑

Watch 模式会自动合并短时间内的多个文件变化,只触发一次重新构建:

```
📝 Changed: src/SKILL.md
📝 Changed: templates/header.md
📝 Changed: usk.config.json
🔄 Rebuilding...  ← 只构建一次
✅ Rebuild completed in 75ms
```

### 详细输出模式

使用 `--verbose` 可以看到更多构建细节:

```bash
usk build --watch --verbose
```

输出:
```
🔧 Loading configuration...
✓ Configuration loaded

👀 Watch mode enabled
Press Ctrl+C to stop

👀 Watching files:
   /path/to/usk.config.json
   /path/to/src/SKILL.md

🚀 Starting initial build...

🚀 Building 2 platform(s) with concurrency limit: 5

🔨 Building for claude...
  📝 Rendering template: src/SKILL.md

🔨 Building for codex...
  📝 Rendering template: src/SKILL.md

✅ Rebuild completed in 50ms
```

## 配置选项

### 自定义防抖延迟

虽然 CLI 不直接暴露此选项,但在编程方式使用时可以配置:

```typescript
import { SkillBuilder, SkillWatcher } from '@jiangding/usk-builder'

const builder = await SkillBuilder.fromConfig('usk.config.json')
const watcher = new SkillWatcher(builder.config, builder)

await watcher.start({
  debounceDelay: 500, // 自定义延迟
  verbose: true
})
```

### 自定义监听路径

```typescript
await watcher.start({
  watchPaths: [
    'custom-dir/**/*.md',
    'extra-templates/**/*'
  ]
})
```

### 自定义忽略模式

```typescript
await watcher.start({
  ignored: [
    '**/backup/**',
    '**/*.backup.md'
  ]
})
```

## 常见问题

### Q: Watch 模式会监听输出目录吗?

A: 不会。输出目录 (如 `dist/`) 会被自动忽略,避免循环构建。

### Q: 修改配置文件后会发生什么?

A: Watch 模式会检测到配置文件变化并重新构建。但某些配置变化 (如修改监听路径) 可能需要重启 Watch 模式才能生效。

### Q: 构建错误后 Watch 会停止吗?

A: 不会。Watch 模式会捕获错误并显示,但继续监听文件变化。修复错误后保存文件即可触发重新构建。

### Q: 如何在 Watch 模式下清理输出目录?

A: Watch 模式默认不清理输出目录以提高性能。如果需要完全重新构建,请停止 Watch 并运行:

```bash
usk build --clean
usk build --watch  # 然后重新启动 Watch
```

### Q: 能同时监听多个项目吗?

A: 每个 Watch 进程只能监听一个项目。如果需要监听多个项目,请在不同的终端窗口中分别运行。

## 性能建议

1. **使用增量构建** - Watch 模式已经优化为增量构建,但大型项目可能需要更多时间
2. **限制监听范围** - 只监听必要的文件和目录
3. **使用缓存** - 确保缓存功能已启用 (默认启用)
4. **避免频繁修改** - 批量修改后再保存,减少重新构建次数

## 故障排查

### Watch 模式无法启动

1. 检查配置文件是否正确
2. 确认监听的文件路径是否存在
3. 检查是否有权限访问文件

### 文件变化未触发重新构建

1. 确认文件在监听范围内
2. 检查文件是否在忽略列表中
3. 尝试重启 Watch 模式

### 重新构建太慢

1. 使用 `--verbose` 查看构建详情
2. 检查是否有大量资源文件需要复制
3. 考虑禁用某些平台的构建
4. 使用 `--force` 强制跳过缓存 (仅用于调试)

---

💡 **提示**: Watch 模式非常适合开发阶段使用。生产构建请使用 `usk build` 以获得最佳性能和完整的输出验证。
