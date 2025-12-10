/**
 * Plugin system exports
 */

export { PluginManager, createPluginManager } from './manager'
export type {
  Plugin,
  PluginConfig,
  PluginContext,
  PluginHooks,
  PluginManagerOptions,
  PluginHookMetric,
  PluginMetricSummary
} from '../types/plugin'
