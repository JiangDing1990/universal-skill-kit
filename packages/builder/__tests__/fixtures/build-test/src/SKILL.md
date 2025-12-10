---
name: {{name}}
version: {{version}}
author: {{author}}
description: {{description}}
tags:
{{#each tags}}
  - {{this}}
{{/each}}
---

# {{name}}

{{description}}

## Platform

This skill is built for: **{{platform.name}}**

{{#if platform.claude}}

### Claude Platform

This is additional content for Claude platform.
{{/if}}

{{#if platform.codex}}

### Codex Platform

This is content for Codex platform.
{{/if}}

## Features

- Feature 1
- Feature 2
- Feature 3

## Tags

{{#each tags}}

- {{this}}
  {{/each}}
