# Phase 2 设计评审和改进方案

深入评估架构设计，对比业内最佳实践，提出改进建议。

## 目录

- [评估方法](#评估方法)
- [问题分析](#问题分析)
- [业内最佳实践对比](#业内最佳实践对比)
- [改进方案](#改进方案)
- [关键决策](#关键决策)

---

## 评估方法

### 参考项目

对比以下优秀项目的设计：

| 项目           | 领域     | 学习要点                     |
| -------------- | -------- | ---------------------------- |
| **Vite**       | 构建工具 | 配置系统、插件架构、性能优化 |
| **Next.js**    | 框架     | 约定优于配置、开发体验       |
| **Rollup**     | 打包工具 | 插件系统、模块化设计         |
| **Turborepo**  | Monorepo | 缓存机制、增量构建           |
| **pnpm**       | 包管理   | CLI设计、错误处理            |
| **Handlebars** | 模板引擎 | 语法设计、安全性             |

### 评估维度

1. **架构设计** - 模块划分、依赖关系
2. **技术选型** - 工具选择、实现方式
3. **性能** - 构建速度、内存占用
4. **扩展性** - 插件系统、自定义能力
5. **开发体验** - 类型提示、错误信息
6. **安全性** - 输入验证、权限控制
7. **测试性** - 可测试性、测试覆盖
8. **文档** - API文档、示例项目

---

## 问题分析

### 🔴 严重问题

#### 1. 模板引擎重新造轮子

**当前设计**：

```typescript
// 自定义实现模板引擎
export class TemplateEngine {
  parse(template: string): AST
  render(ast: AST, context: Context): string
}
```

**问题**：

- ❌ **高维护成本** - 需要处理大量边界情况
- ❌ **测试困难** - 需要覆盖所有语法组合
- ❌ **功能不完整** - 缺少过滤器、helper等
- ❌ **错误处理弱** - 难以提供准确的错误定位
- ❌ **性能未知** - 没有经过生产环境验证

**业内做法**：

- **Vite**: 使用 Rollup 而不是自己实现打包
- **Next.js**: 使用 Webpack/Turbopack
- **Eleventy**: 支持多种模板引擎（Nunjucks, Handlebars等）

**改进建议** ⭐：

```typescript
// 使用成熟的模板引擎，但限制功能
import Handlebars from 'handlebars'

// 创建受限的实例
const handlebars = Handlebars.create()

// 只注册需要的 helpers
handlebars.registerHelper('if', ...)
handlebars.registerHelper('unless', ...)
handlebars.registerHelper('each', ...)

// 禁用不安全的特性
handlebars.compile(template, {
  strict: true,           // 严格模式
  noEscape: false,        // 总是转义
  preventIndent: true     // 防止缩进问题
})
```

---

#### 2. 缺少插件系统

**当前设计**：

```typescript
// 固定的构建流程，无法扩展
export class SkillBuilder {
  async build() {
    // 1. 渲染模板
    // 2. 转换
    // 3. 输出
  }
}
```

**问题**：

- ❌ **不可扩展** - 用户无法自定义转换逻辑
- ❌ **功能固化** - 难以添加新平台支持
- ❌ **代码耦合** - 所有逻辑写在核心代码中

**业内做法**：

**Vite 插件系统**：

```typescript
export interface Plugin {
  name: string
  transform?(code: string, id: string): TransformResult
  buildStart?(): void
  buildEnd?(): void
}

// 用户可以轻松扩展
const myPlugin: Plugin = {
  name: 'my-plugin',
  transform(code, id) {
    // 自定义转换逻辑
    return transformedCode
  }
}
```

**Rollup 的 hooks**：

```typescript
const plugin = {
  name: 'my-plugin',
  buildStart() {},
  resolveId(source) {},
  load(id) {},
  transform(code, id) {},
  buildEnd() {}
}
```

**改进建议** ⭐：

```typescript
// 定义插件接口
export interface USKPlugin {
  name: string

  // 生命周期钩子
  configResolved?(config: ResolvedConfig): void
  buildStart?(): void | Promise<void>

  // 转换钩子
  transformTemplate?(
    template: string,
    context: TemplateContext
  ): string | Promise<string>

  transformSkill?(
    skill: SkillDefinition,
    platform: Platform
  ): SkillDefinition | Promise<SkillDefinition>

  buildEnd?(result: BuildResult): void | Promise<void>
}

// 配置中使用
export default defineConfig({
  plugins: [
    myCustomPlugin(),
    compressionPlugin({ strategy: 'balanced' }),
    validationPlugin()
  ]
})
```

---

#### 3. 缺少缓存机制

**当前设计**：

```typescript
// 每次都重新构建所有内容
async build() {
  for (const platform of platforms) {
    await buildForPlatform(platform)  // 无缓存
  }
}
```

**问题**：

- ❌ **性能差** - 大型项目构建慢
- ❌ **资源浪费** - 重复编译未改变的文件
- ❌ **开发体验差** - watch 模式响应慢

**业内做法**：

**Turborepo 缓存**：

```typescript
// 基于文件哈希的缓存
const hash = computeHash([config, sourceFiles, dependencies])

const cached = await cache.get(hash)
if (cached) {
  return cached.result
}
```

**Vite 依赖预构建**：

```typescript
// 缓存依赖构建结果
const cacheDir = 'node_modules/.vite'
const metadata = {
  hash: depsHash,
  optimized: {
    /* ... */
  }
}
```

**改进建议** ⭐：

```typescript
// 实现构建缓存
export class BuildCache {
  private cacheDir: string = 'node_modules/.usk/cache'

  async get(key: string): Promise<CachedResult | null> {
    const cachePath = path.join(this.cacheDir, key)
    if (await exists(cachePath)) {
      return await readJSON(cachePath)
    }
    return null
  }

  async set(key: string, result: BuildResult): Promise<void> {
    const cachePath = path.join(this.cacheDir, key)
    await writeJSON(cachePath, result)
  }

  // 计算缓存键
  computeKey(platform: Platform, config: SkillConfig): string {
    return createHash('sha256')
      .update(JSON.stringify(config))
      .update(await readFile(config.source.entry))
      .update(platform)
      .digest('hex')
  }
}

// 构建时使用缓存
async buildForPlatform(platform: Platform) {
  const cacheKey = this.cache.computeKey(platform, this.config)
  const cached = await this.cache.get(cacheKey)

  if (cached && !this.options.force) {
    console.log(`Using cached build for ${platform}`)
    return cached
  }

  const result = await this.buildFresh(platform)
  await this.cache.set(cacheKey, result)
  return result
}
```

---

### 🟡 中等问题

#### 4. 配置系统不够灵活

**当前设计**：

```typescript
export default defineConfig({
  name: 'my-skill',
  platforms: {
    /* ... */
  }
})
```

**问题**：

- ⚠️ 缺少配置继承（extends）
- ⚠️ 缺少环境特定配置
- ⚠️ 缺少配置合并策略

**业内做法**：

**TypeScript extends**：

```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    /* 覆盖 */
  }
}
```

**Next.js 环境配置**：

```javascript
module.exports = {
  env: {
    customKey: 'value'
  }
}
```

**改进建议** ⭐：

```typescript
// 支持配置继承
export default defineConfig({
  extends: './usk.base.config.ts', // 继承基础配置

  // 环境特定配置
  environments: {
    development: {
      build: { sourcemap: true, minify: false }
    },
    production: {
      build: { sourcemap: false, minify: true }
    }
  },

  // 覆盖继承的配置
  platforms: {
    codex: {
      enabled: true,
      output: 'dist/codex',
      compressionStrategy: 'aggressive' // 覆盖
    }
  }
})

// 配置加载器支持合并
class ConfigLoader {
  async load(path: string): Promise<SkillConfig> {
    const config = await this.loadFile(path)

    // 处理 extends
    if (config.extends) {
      const baseConfig = await this.load(config.extends)
      return this.merge(baseConfig, config)
    }

    return config
  }

  merge(base: SkillConfig, override: SkillConfig): SkillConfig {
    return deepMerge(base, override, {
      // 自定义合并策略
      customMerge: {
        platforms: 'merge', // 平台配置合并
        plugins: 'concat', // 插件数组拼接
        tags: 'override' // 标签直接覆盖
      }
    })
  }
}
```

---

#### 5. CLI 命令不完整

**当前设计**：

```bash
usk init
usk build
usk watch
```

**问题**：

- ⚠️ 缺少验证命令
- ⚠️ 缺少诊断工具
- ⚠️ 缺少缓存管理

**业内做法**：

**pnpm 命令**：

```bash
pnpm install
pnpm store status    # 缓存状态
pnpm store prune     # 清理缓存
pnpm why <package>   # 依赖分析
```

**Next.js 命令**：

```bash
next dev
next build
next start
next lint      # 代码检查
next info      # 环境信息
```

**改进建议** ⭐：

```bash
# 基础命令
usk init [name]              # 初始化项目
usk build [--watch]          # 构建
usk dev                      # 开发模式

# 验证和诊断
usk validate                 # 验证配置文件
usk doctor                   # 诊断问题
usk info                     # 显示环境信息

# 缓存管理
usk cache status             # 缓存状态
usk cache clean              # 清理缓存
usk cache verify             # 验证缓存

# 实用工具
usk upgrade                  # 升级工具
usk migrate                  # 迁移配置
usk preview <platform>       # 预览构建结果
```

实现示例：

```typescript
// packages/cli/src/commands/doctor.ts
export async function doctorCommand() {
  const spinner = ora('Running diagnostics...').start()

  const checks = [
    checkNodeVersion(),
    checkDependencies(),
    checkConfigFile(),
    checkSourceFiles(),
    checkOutputPermissions(),
    checkCacheHealth()
  ]

  const results = await Promise.all(checks)

  // 漂亮的输出
  console.log('\n📊 Diagnostic Results:\n')

  for (const result of results) {
    const icon = result.passed ? '✅' : '❌'
    console.log(`${icon} ${result.name}`)
    if (!result.passed) {
      console.log(`   ${chalk.red(result.error)}`)
      console.log(`   💡 ${chalk.cyan(result.suggestion)}`)
    }
  }

  spinner.stop()
}
```

---

#### 6. 并行构建缺失

**当前设计**：

```typescript
// 串行构建
for (const platform of platforms) {
  await buildForPlatform(platform) // 等待完成
}
```

**问题**：

- ⚠️ 构建慢 - 多平台串行
- ⚠️ 资源未充分利用

**业内做法**：

**Turborepo 并行执行**：

```typescript
// 自动并行化任务
turbo run build --parallel
```

**Vite 并行优化**：

```typescript
// 并行处理依赖
const deps = await Promise.all(depIds.map(id => optimizeDep(id)))
```

**改进建议** ⭐：

```typescript
// 并行构建所有平台
async build(): Promise<BuildResult> {
  const platforms = Object.entries(this.config.platforms)
    .filter(([_, config]) => config.enabled)
    .map(([name]) => name as Platform)

  // 并行构建
  const results = await Promise.all(
    platforms.map(platform =>
      this.buildForPlatform(platform)
        .catch(error => ({
          platform,
          success: false,
          error
        }))
    )
  )

  return {
    success: results.every(r => r.success),
    platforms: results,
    duration: Date.now() - startTime
  }
}

// 添加并发控制（避免资源耗尽）
import pLimit from 'p-limit'

const limit = pLimit(this.options.concurrency || 5)

const results = await Promise.all(
  platforms.map(platform =>
    limit(() => this.buildForPlatform(platform))
  )
)
```

---

### 🟢 小问题

#### 7. 错误处理不够友好

**改进建议**：

```typescript
// 定义错误类型
export class USKError extends Error {
  constructor(
    public code: string,
    message: string,
    public suggestion?: string,
    public cause?: Error
  ) {
    super(message)
    this.name = 'USKError'
  }
}

// 具体错误类
export class ConfigValidationError extends USKError {
  constructor(errors: ValidationError[]) {
    super(
      'CONFIG_VALIDATION',
      `Configuration validation failed:\n${formatErrors(errors)}`,
      'Please check your usk.config.ts file against the schema'
    )
  }
}

// 使用
try {
  await builder.build()
} catch (error) {
  if (error instanceof USKError) {
    console.error(chalk.red(`❌ ${error.message}`))
    if (error.suggestion) {
      console.log(chalk.cyan(`💡 ${error.suggestion}`))
    }
    if (error.cause) {
      console.log(chalk.gray(`   Caused by: ${error.cause.message}`))
    }
  }
  process.exit(1)
}
```

#### 8. 类型提示优化

**改进建议**：

```typescript
// 导出配置类型供用户使用
export type { SkillConfig, PlatformConfig, BuildConfig }

// 提供更好的类型推导
export function defineConfig<T extends SkillConfig>(
  config: T | ((env: ConfigEnv) => T)
): T {
  return typeof config === 'function'
    ? config({ mode: process.env.NODE_ENV || 'development' })
    : config
}

// 用户使用时有完整类型提示
export default defineConfig({
  name: 'my-skill', // 自动补全和验证
  platforms: {
    claude: {
      enabled: true, // 类型检查
      output: 'dist' // 路径提示
    }
  }
})
```

---

## 业内最佳实践对比

### 1. Vite 的启发

**我们可以学习**：

1. **插件优先设计**

```typescript
// Vite 的插件系统非常强大
export default defineConfig({
  plugins: [react(), legacy(), customPlugin()]
})
```

2. **快速的开发服务器**

```typescript
// Vite 的 HMR 非常快
// 我们可以实现类似的 watch 模式优化
```

3. **依赖预构建**

```typescript
// Vite 会预构建依赖并缓存
// 我们可以缓存模板编译结果
```

### 2. Turborepo 的启发

**增量构建和缓存**：

```typescript
// Turborepo 的缓存键计算
const hash = createHash({
  task: 'build',
  inputs: glob('src/**'),
  dependencies: packageJson.dependencies
})
```

我们应该：

```typescript
// USK 缓存键计算
const cacheKey = computeCacheKey({
  config: configHash,
  template: templateHash,
  resources: resourcesHash,
  platform: platform
})
```

### 3. Rollup 的启发

**插件生命周期**：

```typescript
// Rollup 清晰的钩子顺序
buildStart → resolveId → load → transform → buildEnd
```

我们应该：

```typescript
// USK 构建生命周期
configResolved → buildStart →
transformTemplate → transformSkill →
copyResources → buildEnd
```

---

## 改进方案

### 方案1：最小改动（推荐）⭐

**目标**：修复严重问题，保持原有架构

**改动**：

1. ✅ 使用 Handlebars 替代自定义模板引擎
2. ✅ 添加基础插件系统
3. ✅ 实现文件级缓存
4. ✅ 并行构建多平台

**优点**：

- 实现成本低（2-3周）
- 风险小
- 向后兼容

**缺点**：

- 架构不够优雅
- 扩展性有限

---

### 方案2：重新设计（理想）

**目标**：参考 Vite/Rollup 设计插件化架构

**新架构**：

```
@jiangding/usk-core
  ├─→ plugin system (新)
  ├─→ cache manager (新)
  └─→ builder core (重构)

@jiangding/usk-plugins
  ├─→ template plugin (使用 Handlebars)
  ├─→ validation plugin
  ├─→ compression plugin
  └─→ converter plugin
```

**优点**：

- 架构清晰
- 高度可扩展
- 易于维护

**缺点**：

- 实现成本高（6-8周）
- 需要大量重构
- 有破坏性更改风险

---

### 方案3：渐进式改进（平衡）⭐⭐

**目标**：分阶段实现，每个阶段可独立发布

**Phase 2.1** - 基础功能（Week 1-3）

- ✅ 配置系统（基础）
- ✅ Handlebars 模板
- ✅ 简单构建流程

**Phase 2.2** - 优化（Week 4-5）

- ✅ 文件缓存
- ✅ 并行构建
- ✅ 错误处理优化

**Phase 2.3** - 扩展（Week 6-8）

- ✅ 插件系统
- ✅ 更多 CLI 命令
- ✅ 完善文档

**优点**：

- 分阶段交付
- 风险可控
- 可快速获得反馈

---

## 关键决策

### 决策1：模板引擎选择 ⭐⭐⭐

**选项A：自定义实现**

- ❌ 维护成本高
- ❌ 功能不完整
- ❌ Bug 风险大

**选项B：使用 Handlebars**（推荐）

- ✅ 成熟稳定
- ✅ 功能完整
- ✅ 社区支持好
- ⚠️ 稍重（~100KB）

**选项C：使用 Mustache**

- ✅ 轻量（~20KB）
- ⚠️ 功能简单
- ⚠️ 缺少 helper

**最终决策**：**选择 Handlebars**

理由：

1. 功能完整，满足所有需求
2. 已有大量生产环境验证
3. 可以通过限制 helpers 简化
4. 100KB 对CLI工具可接受

实现：

```typescript
import Handlebars from 'handlebars'

// 创建受限实例
const engine = Handlebars.create()

// 只注册必要的 helpers
engine.registerHelper('if', Handlebars.helpers.if)
engine.registerHelper('unless', Handlebars.helpers.unless)
engine.registerHelper('each', Handlebars.helpers.each)

// 自定义 helper
engine.registerHelper('eq', (a, b) => a === b)
engine.registerHelper('platform', name => context.platform.name === name)

export class TemplateEngine {
  render(template: string, context: TemplateContext): string {
    const compiled = engine.compile(template, {
      strict: true,
      noEscape: false
    })
    return compiled(context)
  }
}
```

---

### 决策2：插件系统实现 ⭐⭐

**选项A：完整插件系统（Rollup风格）**

- ✅ 高度灵活
- ❌ 实现复杂
- ❌ 学习曲线陡

**选项B：简化插件（钩子函数）**（推荐）

- ✅ 实现简单
- ✅ 易于理解
- ⚠️ 扩展性有限

**最终决策**：**Phase 2.1 不实现插件，Phase 2.3 添加简化插件**

理由：

1. 先完成核心功能
2. 根据实际需求设计插件
3. 避免过度设计

---

### 决策3：缓存策略 ⭐

**选项A：文件级缓存**（推荐Phase 2.1）

- ✅ 实现简单
- ✅ 效果明显
- ⚠️ 粒度粗

**选项B：AST级缓存**

- ✅ 粒度细
- ❌ 实现复杂
- ❌ 收益不高

**最终决策**：**先实现文件级缓存，后续优化**

---

### 决策4：技术选型调整

| 原方案     | 新方案            | 理由               |
| ---------- | ----------------- | ------------------ |
| 自定义模板 | **Handlebars**    | 成熟稳定，功能完整 |
| jiti       | **tsx**           | 更活跃，社区更大   |
| 无缓存     | **文件缓存**      | 性能提升明显       |
| 串行构建   | **并行构建**      | 充分利用资源       |
| 无插件     | **Phase 2.3添加** | 分阶段实现         |

---

## 修订后的实现计划

### 里程碑 2.1：核心功能（Week 1-3）

**Week 1：配置系统**

- [ ] SkillConfig 类型定义
- [ ] ConfigLoader（使用 tsx）
- [ ] ConfigValidator（Zod）
- [ ] `usk init` 命令

**Week 2：模板渲染**

- [ ] 集成 Handlebars
- [ ] 注册必要的 helpers
- [ ] 模板上下文管理
- [ ] 测试用例

**Week 3：基础构建**

- [ ] SkillBuilder 实现
- [ ] 平台构建逻辑
- [ ] 资源文件处理
- [ ] `usk build` 命令

---

### 里程碑 2.2：性能优化（Week 4-5）

**Week 4：缓存机制**

- [ ] 文件哈希计算
- [ ] 缓存存储和读取
- [ ] 缓存失效策略
- [ ] `usk cache` 命令

**Week 5：并行构建**

- [ ] Promise.all 并行化
- [ ] 并发控制（p-limit）
- [ ] 错误处理优化
- [ ] 性能测试

---

### 里程碑 2.3：完善和扩展（Week 6-8）

**Week 6：CLI 完善**

- [ ] `usk watch` 命令
- [ ] `usk doctor` 命令
- [ ] `usk validate` 命令
- [ ] 错误提示优化

**Week 7：插件系统（简化版）**

- [ ] Plugin 接口定义
- [ ] 生命周期钩子
- [ ] 插件注册和执行
- [ ] 示例插件

**Week 8：文档和发布**

- [ ] 用户文档
- [ ] API 文档
- [ ] 迁移指南
- [ ] 示例项目
- [ ] v0.2.0 Release

---

## 总结

### 主要改进

1. ✅ **使用 Handlebars** - 避免重新造轮子
2. ✅ **添加缓存机制** - 显著提升性能
3. ✅ **并行构建** - 充分利用资源
4. ✅ **完善 CLI** - 更好的开发体验
5. ✅ **插件系统** - Phase 2.3 添加（可选）

### 风险降低

1. ✅ 技术选型更稳妥
2. ✅ 分阶段实现，风险可控
3. ✅ 每个阶段可独立发布
4. ✅ 向后兼容 Phase 1

### 时间调整

- 原计划：8周
- 新计划：**8周**（保持不变）
- 质量更高：架构更合理，测试更充分

---

<div align="center">

**设计评审完成！修订方案更加稳健可靠！** 🎯

</div>
