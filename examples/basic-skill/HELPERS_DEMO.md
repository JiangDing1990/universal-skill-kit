# Template Helpers 演示

这个文件展示了 USK 模板引擎支持的所有 Handlebars helpers。

## 基本变量

- Name: {{name}}
- Version: {{version}}
- Author: {{default author "Unknown Author"}}
- Description length: {{length description}}

## 文本转换 Helpers

### uppercase - 转大写

- 原始: {{name}}
- 大写: {{uppercase name}}

### lowercase - 转小写

- 原始: {{name}}
- 小写: {{lowercase name}}

### capitalize - 首字母大写

- 原始: example text
- 首字母大写: {{capitalize "example text"}}

## 字符串操作 Helpers

### truncate - 截断字符串

- 原始: {{description}}
- 截断 (30 chars): {{truncate description 30}}
- 截断 (30 chars, 自定义后缀): {{truncate description 30 "..."}}

### replace - 替换字符串

- 原始: {{name}}
- 替换 (-): {{replace name "-" " "}}

## 数组 Helpers

### join - 数组连接

- Tags: {{join tags ", "}}
- Tags (with |): {{join tags " | "}}

### length - 数组长度

- Tags count: {{length tags}}

### each - 循环

Tags list:
{{#each tags}}
{{@index}}. {{this}}
{{/each}}

## 比较 Helpers

### eq - 相等

{{#if (eq version "1.0.0")}}
✓ Version is 1.0.0
{{else}}
✗ Version is not 1.0.0
{{/if}}

### ne - 不等

{{#if (ne version "2.0.0")}}
✓ Version is not 2.0.0
{{/if}}

### gt - 大于

{{#if (gt (length tags) 2)}}
✓ Has more than 2 tags
{{/if}}

### lt - 小于

{{#if (lt (length tags) 10)}}
✓ Has less than 10 tags
{{/if}}

## 逻辑 Helpers

### and - 逻辑与

{{#if (and name version)}}
✓ Both name and version are defined
{{/if}}

### or - 逻辑或

{{#if (or author "Default Author")}}
✓ Has author or default
{{/if}}

## 平台 Helpers

### platform - 平台判断

{{#if platform.claude}}
✓ Building for Claude platform
{{/if}}

{{#if platform.codex}}
✓ Building for Codex platform
{{/if}}

### Platform name

Current platform: {{platform.name}}

## 默认值 Helper

### default - 提供默认值

- Author: {{default author "Unknown"}}
- Tags: {{default tags "no tags"}}

## 组合使用

### 复杂示例

Project "{{uppercase name}}" (v{{version}}) has {{length tags}} tags: {{join tags ", "}}.

{{#if (gt (length description) 50)}}
Description (truncated): {{truncate description 50}}
{{else}}
Description: {{description}}
{{/if}}

---

💡 这些 helpers 可以组合使用，创建强大的模板逻辑！
