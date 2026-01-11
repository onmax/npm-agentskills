import type { Nuxt, NuxtModule } from '@nuxt/schema'
import type { NuxtModuleOptions, ResolvedSkill } from './types'
import { addTemplate, defineNuxtModule } from '@nuxt/kit'
import { consola } from 'consola'
import { join, resolve } from 'pathe'
import { copySkillDir, exportToTargets } from './export'
import { generateManifest } from './manifest'
import { resolveSkills } from './resolve'
import { scanForSkillPackages, scanLocalPackage } from './scan'

const logger = consola.withTag('agentskills')

// Store resolved skills in nuxt.options for cross-hook access
const RESOLVED_KEY = '__agentskillsResolved'

function setResolved(nuxt: Nuxt, skills: ResolvedSkill[]): void {
  (nuxt.options as unknown as Record<string, unknown>)[RESOLVED_KEY] = skills
}

function getResolved(nuxt: Nuxt): ResolvedSkill[] {
  return ((nuxt.options as unknown as Record<string, unknown>)[RESOLVED_KEY] || []) as ResolvedSkill[]
}

const module: NuxtModule<NuxtModuleOptions> = defineNuxtModule<NuxtModuleOptions>({
  meta: {
    name: 'npm-agentskills',
    configKey: 'agentskills',
    compatibility: { nuxt: '>=3.14.0' },
  },
  defaults: { enabled: true },
  async setup(options, nuxt) {
    if (!options.enabled)
      return

    const outputDir = resolve(nuxt.options.buildDir, 'skills')
    const targets = options.targets || []

    // Scan for skills
    const modulesDir = join(nuxt.options.rootDir, 'node_modules')
    const packageSkills = await scanForSkillPackages(modulesDir)
    const localSkills = await scanLocalPackage(nuxt.options.rootDir)

    const skills = await resolveSkills(packageSkills, localSkills)
    setResolved(nuxt, skills)

    if (skills.length === 0) {
      logger.info('No bundled skills found')
      return
    }

    logger.info(`Found ${skills.length} skill(s)`)

    // Register manifest as Nuxt template
    addTemplate({
      filename: 'skills/manifest.json',
      write: true,
      getContents: () => {
        const resolved = getResolved(nuxt)
        return JSON.stringify(generateManifest(resolved), null, 2)
      },
    })

    // Copy skill directories after templates generated
    nuxt.hook('app:templatesGenerated', async () => {
      const resolved = getResolved(nuxt)

      for (const skill of resolved) {
        const destDir = join(outputDir, skill.name)
        await copySkillDir(skill.dir, destDir)
        logger.success(`  ${skill.name} (from ${skill.source})`)
      }
      logger.success(`Generated .nuxt/skills/manifest.json`)

      // Export to agent targets
      if (targets.length > 0) {
        const exported = await exportToTargets(resolved, targets, nuxt.options.rootDir)
        for (const dest of exported) {
          logger.success(`Exported to ${dest}`)
        }
      }
    })

    // Dev mode: watch for skill file changes
    if (nuxt.options.dev) {
      nuxt.hook('builder:watch', async (_event, path) => {
        if (path.includes('SKILL.md') || path.includes('/skills/')) {
          logger.info('Skill files changed, regenerating...')
          const freshSkills = await resolveSkills(packageSkills, localSkills)
          setResolved(nuxt, freshSkills)

          for (const skill of freshSkills) {
            await copySkillDir(skill.dir, join(outputDir, skill.name))
          }

          if (targets.length > 0) {
            await exportToTargets(freshSkills, targets, nuxt.options.rootDir)
          }
        }
      })
    }
  },
})

export default module
