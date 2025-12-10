/**
 * File Watcher for incremental builds
 * 监听文件变化并触发重新构建
 */

import { watch, type FSWatcher } from 'chokidar'
import { resolve } from 'node:path'
import type { ResolvedConfig } from '../types/config'
import type { BuildOptions } from '../types/builder'
import type { SkillBuilder } from './skill-builder'

/**
 * 监听器选项
 */
export interface WatcherOptions extends BuildOptions {
  /**
   * 防抖延迟时间（毫秒）
   * @default 300
   */
  debounceDelay?: number

  /**
   * 是否监听配置文件变化
   * @default true
   */
  watchConfig?: boolean

  /**
   * 自定义监听路径模式
   */
  watchPaths?: string[]

  /**
   * 忽略的路径模式
   */
  ignored?: string[]

  /**
   * 变化回调
   */
  onChange?: (file: string) => void

  /**
   * 构建完成回调
   */
  onBuildComplete?: (success: boolean, duration: number) => void

  /**
   * 错误回调
   */
  onError?: (error: Error) => void
}

/**
 * 监听器事件
 */
export type WatcherEvent = 'change' | 'add' | 'unlink'

/**
 * 文件监听器
 */
export class SkillWatcher {
  private config: ResolvedConfig
  private builder: SkillBuilder
  private watcher?: FSWatcher
  private debounceTimer?: NodeJS.Timeout
  private isBuilding = false
  private pendingRebuild = false

  constructor(config: ResolvedConfig, builder: SkillBuilder) {
    this.config = config
    this.builder = builder
  }

  /**
   * 启动监听
   */
  async start(options: WatcherOptions = {}): Promise<void> {
    const {
      debounceDelay = 300,
      watchConfig = true,
      watchPaths,
      ignored = [],
      onChange,
      onBuildComplete,
      onError,
      verbose = false
    } = options

    // 收集需要监听的文件路径
    const pathsToWatch = this.collectWatchPaths(watchConfig, watchPaths)

    if (pathsToWatch.length === 0) {
      throw new Error('没有找到需要监听的文件')
    }

    if (verbose) {
      console.log('\n👀 Watching files:')
      pathsToWatch.forEach(path => {
        console.log(`   ${path}`)
      })
      if (ignored.length > 0) {
        console.log('\n🚫 Ignored patterns:')
        ignored.forEach(pattern => {
          console.log(`   ${pattern}`)
        })
      }
      console.log()
    }

    // 创建监听器
    this.watcher = watch(pathsToWatch, {
      persistent: true,
      ignoreInitial: true,
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/.usk-cache/**',
        ...ignored
      ],
      awaitWriteFinish: {
        stabilityThreshold: 200,
        pollInterval: 100
      }
    })

    // 监听文件变化事件
    this.watcher.on('change', path => {
      this.handleFileChange('change', path, debounceDelay, {
        onChange,
        onBuildComplete,
        onError,
        verbose,
        ...options
      })
    })

    this.watcher.on('add', path => {
      this.handleFileChange('add', path, debounceDelay, {
        onChange,
        onBuildComplete,
        onError,
        verbose,
        ...options
      })
    })

    this.watcher.on('unlink', path => {
      this.handleFileChange('unlink', path, debounceDelay, {
        onChange,
        onBuildComplete,
        onError,
        verbose,
        ...options
      })
    })

    this.watcher.on('error', error => {
      if (onError) {
        onError(error)
      } else {
        console.error('文件监听错误:', error)
      }
    })

    // 初始构建
    if (verbose) {
      console.log('🚀 Starting initial build...\n')
    }

    try {
      const result = await this.builder.build(options)
      if (onBuildComplete) {
        onBuildComplete(result.success, result.duration)
      }
    } catch (error) {
      if (onError) {
        onError(error as Error)
      }
    }
  }

  /**
   * 停止监听
   */
  async stop(): Promise<void> {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = undefined
    }

    if (this.watcher) {
      await this.watcher.close()
      this.watcher = undefined
    }
  }

  /**
   * 处理文件变化
   */
  private handleFileChange(
    event: WatcherEvent,
    filePath: string,
    debounceDelay: number,
    options: WatcherOptions
  ): void {
    const { onChange, verbose } = options

    // 触发回调
    if (onChange) {
      onChange(filePath)
    }

    // 显示变化信息
    if (verbose) {
      const eventMap = {
        change: '📝 Changed',
        add: '➕ Added',
        unlink: '🗑️  Removed'
      }
      console.log(`${eventMap[event]}: ${filePath}`)
    }

    // 如果正在构建，标记需要重新构建
    if (this.isBuilding) {
      this.pendingRebuild = true
      return
    }

    // 防抖处理
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }

    this.debounceTimer = setTimeout(() => {
      void this.rebuild(options)
    }, debounceDelay)
  }

  /**
   * 重新构建
   */
  private async rebuild(options: WatcherOptions): Promise<void> {
    const { onBuildComplete, onError, verbose } = options

    if (this.isBuilding) {
      this.pendingRebuild = true
      return
    }

    this.isBuilding = true
    this.pendingRebuild = false

    const startTime = Date.now()

    if (verbose) {
      console.log('\n🔄 Rebuilding...\n')
    }

    try {
      const result = await this.builder.build({
        ...options,
        clean: false // watch 模式下不清理输出目录
      })

      const duration = Date.now() - startTime

      if (onBuildComplete) {
        onBuildComplete(result.success, duration)
      }

      if (verbose) {
        if (result.success) {
          console.log(`\n✅ Rebuild completed in ${duration}ms\n`)
        } else {
          console.log(`\n❌ Rebuild failed in ${duration}ms\n`)
        }
      }
    } catch (error) {
      if (onError) {
        onError(error as Error)
      } else {
        console.error('构建失败:', error)
      }
    } finally {
      this.isBuilding = false

      // 如果在构建过程中有新的文件变化，立即触发重新构建
      if (this.pendingRebuild) {
        setTimeout(() => {
          void this.rebuild(options)
        }, 100)
      }
    }
  }

  /**
   * 收集需要监听的文件路径
   */
  private collectWatchPaths(
    watchConfig: boolean,
    customPaths?: string[]
  ): string[] {
    const paths: string[] = []

    // 配置文件
    if (watchConfig && this.config.configPath) {
      paths.push(this.config.configPath)
    }

    // 入口模板
    const entryPath = resolve(this.config.root, this.config.source.entry)
    paths.push(entryPath)

    // 模板目录
    if (this.config.source.templates) {
      const templates = Array.isArray(this.config.source.templates)
        ? this.config.source.templates
        : [this.config.source.templates]

      for (const template of templates) {
        const templatePath = resolve(this.config.root, template)
        paths.push(templatePath)
      }
    }

    // 脚本目录
    if (this.config.source.scripts) {
      const scripts = Array.isArray(this.config.source.scripts)
        ? this.config.source.scripts
        : [this.config.source.scripts]

      for (const script of scripts) {
        const scriptPath = resolve(this.config.root, script)
        paths.push(scriptPath)
      }
    }

    // 资源目录
    if (this.config.source.resources) {
      const resources = Array.isArray(this.config.source.resources)
        ? this.config.source.resources
        : [this.config.source.resources]

      for (const resource of resources) {
        const resourcePath = resolve(this.config.root, resource)
        paths.push(resourcePath)
      }
    }

    // 自定义路径
    if (customPaths && customPaths.length > 0) {
      for (const customPath of customPaths) {
        const fullPath = resolve(this.config.root, customPath)
        paths.push(fullPath)
      }
    }

    return paths
  }

  /**
   * 获取监听状态
   */
  isWatching(): boolean {
    return this.watcher !== undefined
  }

  /**
   * 获取构建状态
   */
  isCurrentlyBuilding(): boolean {
    return this.isBuilding
  }
}
