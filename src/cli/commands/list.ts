import type { SkillsManifest } from '../../types'
import { existsSync, promises as fsp } from 'node:fs'
import process from 'node:process'
import { defineCommand } from 'citty'
import { consola } from 'consola'
import { join, resolve } from 'pathe'

export default defineCommand({
  meta: {
    name: 'list',
    description: 'List all bundled skills',
  },
  args: {
    cwd: { type: 'string', description: 'Project root directory', default: '.' },
    dir: { type: 'string', alias: 'd', description: 'Skills directory', default: 'node_modules/.cache/agentskills' },
    json: { type: 'boolean', alias: 'j', description: 'Output as JSON', default: false },
  },
  async run({ args }) {
    const cwd = resolve(args.cwd)
    const skillsDir = resolve(cwd, args.dir)
    const manifestPath = join(skillsDir, 'manifest.json')

    if (!existsSync(manifestPath)) {
      consola.warn(`No skills manifest found at ${manifestPath}`)
      consola.info('Run your build tool first (e.g., `nuxi prepare` for Nuxt)')
      process.exit(1)
    }

    let manifest: SkillsManifest
    try {
      manifest = JSON.parse(await fsp.readFile(manifestPath, 'utf-8'))
    }
    catch {
      consola.error(`Failed to parse manifest at ${manifestPath}`)
      process.exit(1)
    }

    if (args.json) {
      console.log(JSON.stringify(manifest, null, 2))
      return
    }

    if (manifest.skills.length === 0) {
      consola.info('No bundled skills found')
      return
    }

    consola.log('')
    consola.log('Bundled Skills:')
    consola.log('')

    const bySource = new Map<string, typeof manifest.skills>()
    for (const skill of manifest.skills) {
      const list = bySource.get(skill.source) || []
      list.push(skill)
      bySource.set(skill.source, list)
    }

    for (const [source, skills] of bySource) {
      consola.log(`  ${source}`)
      for (const skill of skills) {
        const desc = skill.description.length > 60 ? `${skill.description.slice(0, 60)}...` : skill.description
        consola.log(`    - ${skill.name}: ${desc}`)
      }
      consola.log('')
    }

    consola.log(`Total: ${manifest.skills.length} skill(s) from ${bySource.size} package(s)`)
  },
})
