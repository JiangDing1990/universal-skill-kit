import { describe, it, expect } from 'vitest'
import { PluginManager } from '../src/plugin'
import type { PluginContext } from '../src/types/plugin'

describe('PluginManager metrics', () => {
  it('collects hook timings for executed plugins', async () => {
    const manager = new PluginManager()

    manager.register({
      name: 'test-plugin',
      async onBuildStart() {
        return Promise.resolve()
      }
    })

    await manager.initialize()

    const context = {
      config: {} as any,
      options: {},
      platform: undefined
    } satisfies PluginContext

    await manager.onBuildStart(context)
    const metrics = manager.getMetrics()

    expect(metrics).toHaveLength(1)
    expect(metrics[0].name).toBe('test-plugin')
    expect(metrics[0].hooks[0].calls).toBe(1)
  })
})
