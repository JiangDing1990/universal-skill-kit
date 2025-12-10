# Advanced Skill Example

这是 Universal Skill Kit 的高级示例项目,展示了插件系统、自定义构建脚本和性能优化技巧。

## 特性展示

### 🎯 核心特性

1. **插件系统**
   - 内置插件使用 (loggerPlugin, minifyPlugin)
   - 自定义插件开发
   - 生命周期钩子
   - 构建流程控制

2. **自定义构建脚本**
   - 编程式 API 使用
   - 自定义 Handlebars helpers
   - 构建选项配置
   - 错误处理和报告

3. **性能优化**
   - 智能缓存系统
   - 并发构建控制
   - 增量更新支持
   - 性能监控和分析

4. **高级配置**
   - 缓存策略配置
   - 构建流程定制
   - 错误处理策略
   - 调试和诊断

## 项目结构

```
advanced/
├── src/
│   └── SKILL.md              # 主模板文件
├── dist/                     # 构建输出
│   ├── claude/
│   └── codex/
├── build.js                  # 自定义构建脚本
├── package.json              # 项目配置
├── usk.config.json           # USK 配置
└── README.md
```

## 快速开始

### 1. 安装依赖

此示例项目需要安装 USK 的依赖:

```bash
# 在项目根目录
cd examples/advanced

# 安装依赖 (使用工作区的本地包)
pnpm install
```

### 2. 使用自定义构建脚本

```bash
# 使用自定义 build.js
node build.js

# 或使用 npm script
npm run build
```

### 3. 使用标准 USK CLI

```bash
# 使用全局安装的 CLI
usk build

# 使用本地构建的 CLI
node ../../packages/cli/dist/cli.js build

# 或使用 npm script
npm run build:usk
```

### 4. Watch 模式

```bash
npm run build:watch
# 或
usk build --watch
```

## 自定义构建脚本详解

### build.js 核心功能

```javascript
import {
  SkillBuilder,
  loggerPlugin,
  minifyPlugin
} from '@jiangding/usk-builder'

async function main() {
  // 1. 创建 Builder
  const builder = await SkillBuilder.fromConfig('usk.config.json')

  // 2. 注册插件
  builder.use(loggerPlugin({ verbose: true }))
  builder.use(minifyPlugin({ removeComments: true }))

  // 3. 注册自定义 Helper
  builder.templateEngine?.registerHelper('formatDate', date => {
    return new Date(date).toLocaleDateString('zh-CN')
  })

  // 4. 执行构建
  const result = await builder.build({
    clean: true,
    verbose: true,
    concurrency: 5
  })

  // 5. 处理结果
  if (result.success) {
    // 显示统计信息
    const stats = builder.getStatistics()
    console.log('Templates rendered:', stats.templatesRendered)
    console.log('Total size:', stats.totalSize)
  }
}
```

### 构建选项

| 选项          | 类型    | 默认值 | 说明               |
| ------------- | ------- | ------ | ------------------ |
| `clean`       | boolean | true   | 构建前清理输出目录 |
| `force`       | boolean | false  | 强制重建,忽略缓存  |
| `verbose`     | boolean | false  | 显示详细输出       |
| `concurrency` | number  | 5      | 并发构建数量       |

## 插件系统

### 内置插件

#### 1. loggerPlugin

详细的构建日志插件:

```javascript
builder.use(
  loggerPlugin({
    verbose: true, // 显示详细信息
    colors: true, // 使用颜色
    timestamps: true // 显示时间戳
  })
)
```

输出示例:

```
[15:30:45] 📝 Rendering template: src/SKILL.md
[15:30:45] ✨ Using cached template for claude
[15:30:45] 📦 Copying 0 resource file(s)...
[15:30:45] ✅ Built for claude (1.2 KB)
```

#### 2. minifyPlugin

Markdown 内容压缩插件:

```javascript
builder.use(
  minifyPlugin({
    removeComments: true, // 移除 HTML 注释
    removeEmptyLines: true, // 移除空行
    trimWhitespace: true // 修剪空白字符
  })
)
```

### 自定义插件开发

创建自定义插件:

```javascript
const customPlugin = () => {
  return {
    name: 'custom-plugin',

    // 构建开始前
    beforeBuild: async config => {
      console.log('Starting build for:', config.name)
    },

    // 模板渲染后
    afterTemplateRender: async (content, platform) => {
      // 修改渲染后的内容
      return content.replace(/TODO/g, '✅')
    },

    // 构建完成后
    afterBuild: async result => {
      console.log('Build completed:', result.success)
    },

    // 错误处理
    onError: async (error, context) => {
      console.error('Build error:', error.message)
    }
  }
}

// 使用自定义插件
builder.use(customPlugin())
```

### 插件生命周期钩子

| 钩子                  | 触发时机     | 参数              | 返回值         |
| --------------------- | ------------ | ----------------- | -------------- |
| `beforeBuild`         | 构建开始前   | config            | void           |
| `afterConfigLoad`     | 配置加载后   | config            | void           |
| `beforePlatformBuild` | 平台构建前   | platform, config  | void           |
| `afterTemplateRender` | 模板渲染后   | content, platform | string (可选)  |
| `beforeFileWrite`     | 文件写入前   | path, content     | content (可选) |
| `afterFileWrite`      | 文件写入后   | path, size        | void           |
| `afterPlatformBuild`  | 平台构建后   | result            | void           |
| `afterBuild`          | 所有构建完成 | result            | void           |
| `onError`             | 发生错误时   | error, context    | void           |

## 自定义 Helpers

### 注册 Helper

```javascript
// 简单 helper
builder.templateEngine?.registerHelper('uppercase', str => {
  return str.toUpperCase()
})

// 带选项的 helper
builder.templateEngine?.registerHelper('formatDate', function (date, format) {
  // this 指向模板上下文
  return new Date(date).toLocaleDateString(format || 'zh-CN')
})

// 块级 helper
builder.templateEngine?.registerHelper('section', function (options) {
  return `<section>\n${options.fn(this)}\n</section>`
})
```

### Helper 使用示例

```handlebars
<!-- 简单 helper -->
{{uppercase name}}

<!-- 带参数 -->
{{formatDate buildTime 'en-US'}}

<!-- 块级 helper -->
{{#section}}
  内容...
{{/section}}
```

## 性能优化

### 1. 缓存策略

```javascript
// 配置缓存
const builder = await SkillBuilder.fromConfig('usk.config.json', {
  enabled: true, // 启用缓存
  directory: './.usk-cache', // 缓存目录
  ttl: 1000 * 60 * 60 // 缓存 TTL (1小时)
})

// 获取缓存统计
const cacheManager = builder.getCacheManager()
const stats = await cacheManager.getStats()
console.log('Cache entries:', stats.entryCount)
console.log('Cache size:', stats.totalSize)

// 清理缓存
await cacheManager.clean()
```

### 2. 并发控制

```javascript
// 根据 CPU 核心数调整并发
import os from 'os'

const cpuCount = os.cpus().length
const concurrency = Math.max(2, Math.min(cpuCount, 10))

await builder.build({
  concurrency
})
```

### 3. 增量构建

Watch 模式下自动使用增量构建:

```javascript
import { SkillWatcher } from '@jiangding/usk-builder'

const watcher = new SkillWatcher(builder.config, builder)

await watcher.start({
  debounceDelay: 300, // 防抖延迟
  verbose: true
})
```

### 4. 性能监控

```javascript
// 获取构建统计
const stats = builder.getStatistics()
console.log('Templates rendered:', stats.templatesRendered)
console.log('Files copied:', stats.filesCopied)
console.log('Total size:', stats.totalSize)

// 获取错误报告
const errorReporter = builder.getErrorReporter()
if (errorReporter.hasErrors()) {
  errorReporter.print({ verbose: true })
}
```

## 错误处理

### 错误类型

```javascript
try {
  await builder.build()
} catch (error) {
  if (error.name === 'ConfigValidationError') {
    // 配置验证错误
    console.error('Config errors:', error.errors)
  } else if (error.name === 'TemplateEngineError') {
    // 模板错误
    console.error('Template error:', error.message)
  } else if (error.name === 'BuildError') {
    // 构建错误
    console.error('Build failed:', error.platform, error.message)
  }
}
```

### 错误报告

```javascript
const errorReporter = builder.getErrorReporter()

// 添加自定义错误
errorReporter.addError('CUSTOM_ERROR', 'Error message', {
  file: 'src/SKILL.md',
  line: 42
})

// 添加警告
errorReporter.addWarning('Warning message', {
  file: 'usk.config.json'
})

// 打印错误报告
errorReporter.print({
  verbose: true,
  colors: true
})
```

## 高级配置

### 环境变量

```bash
# 设置缓存目录
USK_CACHE_DIR=./.cache usk build

# 禁用缓存
USK_NO_CACHE=1 usk build

# 设置并发数
USK_CONCURRENCY=10 usk build

# 详细输出
USK_VERBOSE=1 usk build
```

### 条件构建

```javascript
// 根据环境变量选择平台
const platforms = process.env.PLATFORMS?.split(',') || ['claude', 'codex']

// 修改配置
const config = await ConfigLoader.load('usk.config.json')
for (const [name, platform] of Object.entries(config.platforms)) {
  platform.enabled = platforms.includes(name)
}

const builder = new SkillBuilder(config)
await builder.build()
```

### 多环境配置

```javascript
// 加载环境特定的配置
const env = process.env.NODE_ENV || 'development'
const configFile = `usk.config.${env}.json`

const builder = await SkillBuilder.fromConfig(configFile)
await builder.build()
```

## CI/CD 集成

### GitHub Actions

```yaml
name: Build Skills

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Validate config
        run: npm run validate

      - name: Build skills
        run: npm run build

      - name: Run diagnostics
        run: npm run doctor
```

### GitLab CI

```yaml
build:
  image: node:18
  script:
    - npm install
    - npm run validate
    - npm run build
    - npm run doctor
  artifacts:
    paths:
      - dist/
```

## 调试技巧

### 1. 详细输出模式

```bash
# 启用详细输出
node build.js --verbose
# 或
usk build --verbose
```

### 2. 检查缓存

```bash
# 查看缓存状态
usk cache status

# 清理缓存
usk cache clean --force
```

### 3. 验证配置

```bash
# 验证配置文件
usk validate --strict

# JSON 格式输出
usk validate --json
```

### 4. 诊断项目

```bash
# 诊断项目健康状态
usk doctor --verbose
```

### 5. 查看构建日志

构建日志保存在 `.usk-cache/` 目录:

```bash
ls -la .usk-cache/
cat .usk-cache/build.log
```

## 常见问题

### Q: 如何开发自定义插件?

A: 参考上面的"自定义插件开发"部分,实现所需的生命周期钩子。

### Q: 如何注册全局 Helper?

A: 在 build.js 中使用 `builder.templateEngine?.registerHelper()` 注册。

### Q: 如何优化构建性能?

A:

1. 启用缓存 (默认启用)
2. 合理设置并发数
3. 使用 Watch 模式开发
4. 避免不必要的资源文件

### Q: 如何处理构建错误?

A:

1. 使用 `--verbose` 查看详细日志
2. 运行 `usk validate` 验证配置
3. 运行 `usk doctor` 诊断问题
4. 查看错误报告和建议

### Q: 如何在 CI/CD 中使用?

A: 参考上面的"CI/CD 集成"部分,配置 GitHub Actions 或 GitLab CI。

## 学习资源

### 示例项目

1. **basic-skill** - 基础功能入门
2. **multi-platform** - 多平台特性演示
3. **advanced** (当前) - 高级功能和插件

### 学习路径

1. 从 basic-skill 了解基础用法
2. 学习 multi-platform 掌握条件编译
3. 深入 advanced 了解插件和自定义构建
4. 阅读源码理解实现细节
5. 开发自己的插件和工具

### 相关文档

- **插件系统**: packages/builder/src/plugin/
- **API 文档**: packages/builder/src/types/
- **缓存系统**: packages/builder/src/cache/
- **模板引擎**: packages/builder/src/template/

## 相关链接

- **USK 仓库**: https://github.com/JiangDing1990/universal-skill-kit
- **文档**: https://github.com/JiangDing1990/universal-skill-kit/tree/main/docs
- **示例**: https://github.com/JiangDing1990/universal-skill-kit/tree/main/examples
- **问题反馈**: https://github.com/JiangDing1990/universal-skill-kit/issues

## 许可证

MIT

---

**Advanced features powered by Universal Skill Kit**

💡 建议先学习 basic-skill 和 multi-platform 示例,再深入本示例。
