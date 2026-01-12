import { join } from 'pathe'
import { describe, expect, it } from 'vitest'
import { scanLocalPackage } from '../src/scan'

describe('agents field scanning', () => {
  it('reads agents.skills from package.json', async () => {
    const fixtureDir = join(__dirname, 'fixtures', 'pkg-with-agents')
    const results = await scanLocalPackage(fixtureDir)

    expect(results).toHaveLength(1)
    expect(results[0].pkg).toBe('test-pkg-with-agents')
    expect(results[0].skills.skills).toBeDefined()
    expect(results[0].skills.skills).toHaveLength(1)
    expect(results[0].skills.skills![0].name).toBe('test-skill')
  })

  it('ignores packages without agents field', async () => {
    const fixtureDir = join(__dirname, 'fixtures', 'pkg-without-agents')
    const results = await scanLocalPackage(fixtureDir)

    expect(results).toHaveLength(0)
  })

  it('handles agents field with only skills (no mcp/llms)', async () => {
    const fixtureDir = join(__dirname, 'fixtures', 'pkg-skills-only')
    const results = await scanLocalPackage(fixtureDir)

    expect(results).toHaveLength(1)
    expect(results[0].pkg).toBe('test-pkg-skills-only')
    expect(results[0].skills.skills).toBeDefined()
    expect(results[0].skills.mcp).toBeUndefined()
    expect(results[0].skills.llms).toBeUndefined()
  })
})
