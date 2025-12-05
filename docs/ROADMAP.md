# Universal Skill Kit - 开发路线图

[English](#english-version) | [简体中文](#简体中文版本)

---

## 简体中文版本

### 项目愿景

打造最专业、最易用的 AI CLI Skills 开发工具集，成为 AI CLI 生态系统中不可或缺的基础设施。

### 总体目标

1. **降低门槛** - 让任何人都能轻松创建和管理 Skills
2. **提升效率** - 大幅减少跨平台 Skills 的开发和维护成本
3. **保证质量** - 通过自动化工具确保 Skills 的质量和一致性
4. **推动创新** - 为 AI CLI 生态系统提供标准化基础

---

## Phase 1: MVP (最小可行产品)

**时间线**: 2024 Q1 (3 个月)
**目标**: 实现核心转换功能，验证技术方案可行性

### 里程碑 1.1: 核心引擎 (Week 1-4)

#### 功能清单

- [ ] **Skill 解析器**
  - 支持解析 Claude Skills (YAML frontmatter + markdown)
  - 支持解析 Codex Skills (相同格式但限制不同)
  - 提取元数据和 body 内容
  - 识别资源文件引用

- [ ] **描述压缩算法**
  - 实现基础压缩策略（移除示例、简化语法）
  - 关键词提取和保留
  - 智能截断（保持句子完整性）
  - 压缩质量评估

- [ ] **路径映射器**
  - `.claude` ↔ `.codex` 路径转换
  - 相对路径和绝对路径处理
  - 批量文件路径更新

- [ ] **Skill Analyzer（智能分析器）** ⭐ 新增
  - 分析 Skill 复杂度（high/medium/low）
  - 评估质量分数（0-100）
  - 推荐压缩策略（aggressive/balanced/conservative）
  - 生成警告和优化建议

- [ ] **Quality Checker（质量检查器）** ⭐ 新增
  - 5 维度质量评估（描述/结构/示例/文档/跨平台）
  - 星级评分（1-5 星）
  - 详细问题报告
  - 改进建议生成

#### 技术任务

```typescript
// 核心类型定义
interface SkillDefinition {
  metadata: SkillMetadata
  body: string
  resources: SkillResources
}

// 核心接口
class SkillParser {
  parse(path: string): Promise<SkillDefinition>
}

class DescriptionCompressor {
  compress(text: string, maxLength: number): string
}

class PathMapper {
  mapPaths(resources: SkillResources, from: string, to: string): SkillResources
}
```

#### 交付物

- ✅ `@usk/core` 包（核心转换引擎）
- ✅ 单元测试覆盖率 > 80%
- ✅ 技术文档和 API 文档

### 里程碑 1.2: CLI 工具 (Week 5-8)

#### 功能清单

- [ ] **convert 命令**

  ```bash
  usk convert <source> --to <platform> --output <dir>
  usk convert <source> --to <platform> --interactive  # ⭐ 交互式优化
  usk convert <source> --to <platform> --ai-optimize  # ⭐ AI 辅助
  ```

  - 单个 Skill 转换
  - 进度显示和错误处理
  - 详细的转换报告
  - 交互式压缩策略选择 ⭐
  - 手动编辑支持 ⭐
  - 自动转换历史记录 ⭐

- [ ] **validate 命令**

  ```bash
  usk validate <dir> --platform <platform>
  ```

  - YAML 格式验证
  - 描述长度验证（Codex 500 字符限制）
  - 路径有效性检查

- [ ] **batch-convert 命令**

  ```bash
  usk batch-convert <dir> --from <platform> --to <platform>
  ```

  - 目录扫描和批量转换
  - 并行处理（5 个并发）
  - 成功/失败统计报告

- [ ] **analyze 命令** ⭐ 新增

  ```bash
  usk analyze <skill-dir>
  ```

  - 显示 Skill 复杂度
  - 推荐优化策略
  - 质量评分
  - 生成分析报告

- [ ] **quality-check 命令** ⭐ 新增

  ```bash
  usk quality-check <skill-dir>
  ```

  - 多维度质量评估
  - 星级评分和排名
  - 详细改进建议
  - 社区基准对比

- [ ] **diff 命令** ⭐ 新增

  ```bash
  usk diff <skill-dir> --platforms claude,codex
  ```

  - 可视化平台差异
  - 压缩率统计
  - 关键词保留分析
  - 信息丢失警告

- [ ] **history 命令** ⭐ 新增

  ```bash
  usk history list
  usk history rollback <id>
  usk history diff <id1> <id2>
  ```

  - 列出转换历史
  - 回滚到历史版本
  - 对比不同版本

- [ ] **preset 命令** ⭐ 新增

  ```bash
  usk preset list
  usk preset apply <skill-dir> <preset-name>
  usk preset create <name>
  ```

  - 列出可用预设
  - 应用预设配置
  - 创建自定义预设

#### 技术任务

```typescript
// CLI 框架
import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'

class CLI {
  setupCommands(): void
  handleConvert(source: string, options: ConvertOptions): Promise<void>
  handleValidate(dir: string, options: ValidateOptions): Promise<void>
  handleBatchConvert(dir: string, options: BatchOptions): Promise<void>
}
```

#### 交付物

- ✅ `@usk/cli` 包（命令行工具）
- ✅ NPM 发布配置和 CI/CD
- ✅ CLI 使用文档

### 里程碑 1.3: 测试和文档 (Week 9-12)

#### 功能清单

- [x] **集成测试**
  - 端到端转换场景测试
  - 真实 Skill 转换测试
  - 边界情况和错误处理测试

- [x] **文档完善**
  - 快速开始指南
  - CLI 命令参考
  - API 文档
  - 常见问题解答

- [x] **示例和模板**
  - 简单 Skill 示例
  - 复杂 Skill 示例（带资源文件）
  - 转换前后对比示例

#### 技术任务

- 集成测试框架搭建
- 文档网站搭建（VitePress/Docusaurus）
- GitHub Actions CI/CD 配置

#### 交付物

- ✅ 完整的测试套件
- ✅ 文档网站上线
- ✅ MVP 版本发布 (v0.1.0)

---

## Phase 2: 统一开发框架

**时间线**: 2024 Q2 (3 个月)
**目标**: 实现跨平台 Skill 统一开发体验

### 里程碑 2.1: 配置系统 (Week 13-16)

#### 功能清单

- [ ] **skill.config.json**

  ```json
  {
    "name": "my-skill",
    "version": "1.0.0",
    "platforms": {
      "claude": { "enabled": true },
      "codex": { "enabled": true }
    },
    "description": {
      "full": "...",
      "short": "..."
    }
  }
  ```

- [ ] **配置验证器**
  - JSON Schema 验证
  - 语义验证（版本号、路径等）
  - 配置继承和合并

- [ ] **配置加载器**
  - 支持 JSON 和 YAML 格式
  - 环境变量替换
  - 相对路径解析

#### 技术任务

```typescript
interface SkillConfig {
  name: string
  version: string
  platforms: Record<Platform, PlatformConfig>
  description: DescriptionConfig
  body: BodyConfig
  resources: ResourcesConfig
  build: BuildConfig
}

class ConfigLoader {
  load(path: string): Promise<SkillConfig>
  validate(config: any): ValidationResult
  resolve(config: SkillConfig): ResolvedConfig
}
```

#### 交付物

- [ ] `@usk/config` 包
- [ ] 配置 Schema 定义
- [ ] 配置文档和示例

### 里程碑 2.2: 模板引擎 (Week 17-20)

#### 功能清单

- [ ] **条件编译**

  ```markdown
  <!-- @if platform=claude -->

  Claude 专属内容

  <!-- @endif -->

  <!-- @if platform=codex -->

  Codex 专属内容

  <!-- @endif -->

  <!-- @unless platform=codex -->

  非 Codex 内容

  <!-- @endunless -->
  ```

- [ ] **变量替换**

  ```markdown
  # {{name}} v{{version}}

  作者: {{author}}
  ```

- [ ] **文件包含**
  ```markdown
  <!-- @include references/api-guide.md -->
  ```

#### 技术任务

```typescript
class TemplateEngine {
  constructor(platform: Platform)
  render(template: string, context: RenderContext): string
  processDirectives(content: string): string
  replaceVariables(content: string, vars: Record<string, string>): string
}

interface Directive {
  name: string
  handler: DirectiveHandler
}
```

#### 交付物

- [ ] `@usk/template` 包
- [ ] 模板语法文档
- [ ] 模板示例库

### 里程碑 2.3: 构建系统 (Week 21-24)

#### 功能清单

- [ ] **build 命令**

  ```bash
  usk build --platform all
  usk build --platform claude
  usk build --platform codex
  ```

- [ ] **init 命令**

  ```bash
  usk init my-skill --template universal
  usk init my-skill --template react
  usk init my-skill --template basic
  ```

- [ ] **watch 模式**

  ```bash
  usk build --watch
  ```

  - 监听文件变化
  - 自动重新构建
  - 增量构建优化

#### 技术任务

```typescript
class SkillBuilder {
  build(configPath: string, platform: Platform): Promise<BuildResult>
  buildAll(configPath: string): Promise<BuildResult[]>
  watch(configPath: string, options: WatchOptions): Watcher
}

class SkillInitializer {
  init(name: string, options: InitOptions): Promise<InitResult>
  createFromTemplate(template: string, name: string): Promise<void>
}
```

#### 交付物

- [ ] `@usk/builder` 包
- [ ] Skill 模板库
- [ ] 构建和初始化文档

---

## Phase 3: 生态完善

**时间线**: 2024 Q3 (3 个月)
**目标**: 完善工具链，扩展生态系统

### 里程碑 3.1: 插件系统 (Week 25-28)

#### 功能清单

- [ ] **插件 API**

  ```typescript
  interface Plugin {
    name: string
    hooks: {
      beforeConvert?: HookFunction
      afterConvert?: HookFunction
      beforeBuild?: HookFunction
      afterBuild?: HookFunction
    }
  }
  ```

- [ ] **官方插件**
  - `@usk/plugin-minify` - 压缩优化
  - `@usk/plugin-typescript` - TypeScript 验证
  - `@usk/plugin-markdown` - Markdown 格式化
  - `@usk/plugin-analytics` - 转换统计

- [ ] **插件管理**
  ```bash
  usk plugin install @usk/plugin-typescript
  usk plugin list
  usk plugin uninstall @usk/plugin-minify
  ```

#### 技术任务

```typescript
class PluginManager {
  use(plugin: Plugin): void
  runHook<T>(hookName: string, data: T): Promise<T>
  loadPlugin(name: string): Promise<Plugin>
}

interface HookContext {
  platform: Platform
  config: SkillConfig
  logger: Logger
}
```

#### 交付物

- [ ] `@usk/plugin-api` 包
- [ ] 官方插件集合
- [ ] 插件开发文档

### 里程碑 3.2: 多平台支持 (Week 29-32)

#### 功能清单

- [ ] **平台适配器架构**

  ```typescript
  interface PlatformAdapter {
    name: string
    validate(skill: SkillDefinition): ValidationResult
    transform(skill: SkillDefinition): SkillDefinition
  }
  ```

- [ ] **新平台支持**
  - Cursor (如果支持 Skills)
  - Windsurf (如果支持 Skills)
  - 预留扩展接口

- [ ] **平台注册中心**
  ```typescript
  class PlatformRegistry {
    register(platform: Platform, adapter: PlatformAdapter): void
    get(platform: Platform): PlatformAdapter
    list(): Platform[]
  }
  ```

#### 技术任务

- 抽象平台差异
- 实现适配器模式
- 提供适配器开发指南

#### 交付物

- [ ] 平台适配器 SDK
- [ ] 新平台支持（如有）
- [ ] 适配器开发文档

### 里程碑 3.3: 可视化工具 (Week 33-36)

#### 功能清单

- [ ] **Web UI**
  - Skill 上传和转换
  - 在线配置编辑器
  - 转换结果预览
  - 转换历史记录

- [ ] **VS Code 扩展**
  - Skill 项目模板
  - skill.config.json 智能提示
  - 一键构建和转换
  - Skill 预览和验证

- [ ] **Desktop App** (可选)
  - 批量管理 Skills
  - 本地转换无需网络
  - 跨平台支持 (Electron)

#### 技术任务

- Web UI: React + Vite + Tailwind CSS
- VS Code 扩展: TypeScript + VS Code API
- Desktop App: Electron (可选)

#### 交付物

- [ ] Web UI 上线 (https://usk.dev)
- [ ] VS Code 扩展发布
- [ ] Desktop App (可选)

---

## Phase 4: 优化和推广 (持续进行)

**时间线**: 2024 Q4 及以后
**目标**: 优化性能，扩大用户群，建立社区

### 性能优化

- [ ] **转换性能**
  - 并行处理优化
  - 缓存机制改进
  - 内存使用优化

- [ ] **构建性能**
  - 增量构建
  - 依赖图分析
  - 智能缓存

- [ ] **体积优化**
  - Tree shaking
  - 按需加载
  - 外部依赖优化

### 社区建设

- [ ] **文档完善**
  - 视频教程
  - 博客文章
  - 案例研究

- [ ] **社区运营**
  - Discord 社区
  - 定期技术分享
  - 用户案例征集

- [ ] **开源协作**
  - Contributor 指南
  - Good first issue 标注
  - 定期 Release

### 生态扩展

- [ ] **集成工具**
  - GitHub Actions
  - GitLab CI
  - npm scripts

- [ ] **第三方插件**
  - 鼓励社区开发插件
  - 插件市场
  - 插件质量认证

- [ ] **企业版** (可选)
  - 私有平台支持
  - 团队协作功能
  - 技术支持服务

---

## 技术债务管理

### 持续关注的技术债务

1. **测试覆盖率**
   - 目标: 90% 以上
   - 关键模块 100% 覆盖

2. **文档完整性**
   - 所有公开 API 有文档
   - 中英文文档同步更新

3. **依赖管理**
   - 定期更新依赖
   - 安全漏洞及时修复

4. **向后兼容**
   - 主版本更新前做好迁移指南
   - 废弃功能提前通知

---

## 成功指标

### Phase 1 (MVP)

- ✅ 成功转换 10+ 真实 Skills
- ✅ GitHub Stars > 50
- ✅ NPM 下载量 > 100/week

### Phase 2 (统一框架)

- [ ] 5+ 用户使用统一配置开发 Skills
- [ ] GitHub Stars > 200
- [ ] NPM 下载量 > 500/week

### Phase 3 (生态完善)

- [ ] 10+ 第三方插件
- [ ] 支持 3+ AI CLI 平台
- [ ] GitHub Stars > 500
- [ ] NPM 下载量 > 1000/week

### Phase 4 (持续优化)

- [ ] 100+ 活跃用户
- [ ] 50+ Contributors
- [ ] GitHub Stars > 1000
- [ ] NPM 下载量 > 5000/week

---

## 风险和缓解

### 风险 1: 平台 API 变化

**影响**: 高
**可能性**: 中

**缓解措施**:

- 抽象层隔离平台差异
- 版本适配器支持多个平台版本
- 及时跟进平台更新

### 风险 2: 用户采用度低

**影响**: 高
**可能性**: 中

**缓解措施**:

- 降低使用门槛（一键转换）
- 提供详细文档和示例
- 积极推广和社区运营

### 风险 3: 竞品出现

**影响**: 中
**可能性**: 低

**缓解措施**:

- 持续创新和功能迭代
- 建立强大的社区护城河
- 保持技术领先性

---

## 贡献机会

我们欢迎社区贡献！以下是一些可以参与的方向:

### 初学者友好

- [ ] 编写示例 Skills
- [ ] 改进文档和教程
- [ ] 翻译文档
- [ ] 报告 Bug

### 中级贡献者

- [ ] 实现新的压缩策略
- [ ] 添加单元测试
- [ ] 优化性能
- [ ] 开发插件

### 高级贡献者

- [ ] 设计新架构模块
- [ ] 实现平台适配器
- [ ] Code Review
- [ ] 技术方案设计

---

## 更新日志

### 2024-12-05

- 初始路线图发布
- Phase 1 规划完成

---

<div align="center">

**让我们一起打造最好的 AI CLI Skills 工具！**

[参与贡献](../CONTRIBUTING.md) | [提出建议](https://github.com/yourusername/universal-skill-kit/issues)

</div>

---

## English Version

### Project Vision

Build the most professional and user-friendly AI CLI Skills development toolkit, becoming essential infrastructure in the AI CLI ecosystem.

### Overall Goals

1. **Lower Barriers** - Enable anyone to easily create and manage Skills
2. **Boost Efficiency** - Significantly reduce costs of developing and maintaining cross-platform Skills
3. **Ensure Quality** - Guarantee Skills quality and consistency through automation
4. **Drive Innovation** - Provide standardized foundation for AI CLI ecosystem

---

## Phase 1: MVP (Minimum Viable Product)

**Timeline**: Q1 2024 (3 months)
**Goal**: Implement core conversion functionality, validate technical feasibility

### Milestone 1.1: Core Engine (Week 1-4)

#### Feature List

- [x] **Skill Parser**
  - Parse Claude Skills (YAML frontmatter + markdown)
  - Parse Codex Skills (same format, different constraints)
  - Extract metadata and body content
  - Identify resource file references

- [x] **Description Compression Algorithm**
  - Implement basic compression strategies (remove examples, simplify syntax)
  - Keyword extraction and preservation
  - Intelligent truncation (maintain sentence integrity)
  - Compression quality assessment

- [x] **Path Mapper**
  - `.claude` ↔ `.codex` path conversion
  - Relative and absolute path handling
  - Batch file path updates

#### Deliverables

- ✅ `@usk/core` package (core conversion engine)
- ✅ Unit test coverage > 80%
- ✅ Technical and API documentation

### Milestone 1.2: CLI Tool (Week 5-8)

#### Feature List

- [x] **convert command**

  ```bash
  usk convert <source> --to <platform> --output <dir>
  ```

- [x] **validate command**

  ```bash
  usk validate <dir> --platform <platform>
  ```

- [x] **batch-convert command**
  ```bash
  usk batch-convert <dir> --from <platform> --to <platform>
  ```

#### Deliverables

- ✅ `@usk/cli` package (CLI tool)
- ✅ NPM publish config and CI/CD
- ✅ CLI usage documentation

### Milestone 1.3: Testing and Documentation (Week 9-12)

#### Deliverables

- ✅ Complete test suite
- ✅ Documentation site online
- ✅ MVP release (v0.1.0)

---

## Phase 2: Unified Development Framework

**Timeline**: Q2 2024 (3 months)
**Goal**: Achieve unified cross-platform Skill development experience

### Milestone 2.1: Configuration System (Week 13-16)

### Milestone 2.2: Template Engine (Week 17-20)

### Milestone 2.3: Build System (Week 21-24)

---

## Phase 3: Ecosystem Enhancement

**Timeline**: Q3 2024 (3 months)
**Goal**: Complete toolchain, expand ecosystem

### Milestone 3.1: Plugin System (Week 25-28)

### Milestone 3.2: Multi-Platform Support (Week 29-32)

### Milestone 3.3: Visual Tools (Week 33-36)

---

## Phase 4: Optimization and Promotion (Ongoing)

**Timeline**: Q4 2024 and beyond
**Goal**: Optimize performance, expand user base, build community

---

<div align="center">

**Let's build the best AI CLI Skills toolkit together!**

[Contribute](../CONTRIBUTING.md) | [Suggest](https://github.com/yourusername/universal-skill-kit/issues)

</div>
