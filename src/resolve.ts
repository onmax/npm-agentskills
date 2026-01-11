import type { PackageAgentSkills, ResolvedSkill } from './types'
import { existsSync, promises as fsp } from 'node:fs'
import matter from 'gray-matter'
import { join, resolve } from 'pathe'

/** Parse SKILL.md frontmatter */
export async function parseSkillMd(skillMdPath: string): Promise<{ name: string, description: string, license?: string }> {
  const content = await fsp.readFile(skillMdPath, 'utf-8')
  const { data } = matter(content)
  if (!data.name || !data.description) {
    throw new Error(`SKILL.md missing required frontmatter (name, description): ${skillMdPath}`)
  }
  return { name: data.name, description: data.description, license: data.license }
}

/** Find reference files in skill directory */
export async function findReferences(skillDir: string): Promise<string[]> {
  const refsDir = join(skillDir, 'references')
  if (!existsSync(refsDir))
    return []
  const files = await fsp.readdir(refsDir)
  return files.filter(f => f.endsWith('.md')).map(f => `references/${f}`)
}

/** Resolve skills from packages and local package.json */
export async function resolveSkills(
  packageSkills: Array<{ pkg: string, skills: PackageAgentSkills, pkgDir: string }>,
  localSkills: Array<{ pkg: string, skills: PackageAgentSkills, pkgDir: string }>,
): Promise<ResolvedSkill[]> {
  const resolved: ResolvedSkill[] = []
  const seen = new Set<string>()

  // Process local package.json agentskills (priority over node_modules)
  for (const { pkg, skills, pkgDir } of localSkills) {
    for (const entry of skills.skills) {
      if (seen.has(entry.name))
        continue
      const skillDir = resolve(pkgDir, entry.path)
      const skillMdPath = join(skillDir, 'SKILL.md')
      if (!existsSync(skillMdPath)) {
        console.warn(`[agentskills] SKILL.md not found: ${skillMdPath}`)
        continue
      }
      const meta = await parseSkillMd(skillMdPath)
      seen.add(entry.name)
      resolved.push({ name: entry.name, description: meta.description, license: meta.license, source: pkg, dir: skillDir, references: await findReferences(skillDir) })
    }
  }

  // Process node_modules package.json agentskills
  for (const { pkg, skills, pkgDir } of packageSkills) {
    for (const entry of skills.skills) {
      if (seen.has(entry.name))
        continue
      const skillDir = resolve(pkgDir, entry.path)
      const skillMdPath = join(skillDir, 'SKILL.md')
      if (!existsSync(skillMdPath)) {
        console.warn(`[agentskills] SKILL.md not found: ${skillMdPath}`)
        continue
      }
      const meta = await parseSkillMd(skillMdPath)
      seen.add(entry.name)
      resolved.push({ name: entry.name, description: meta.description, license: meta.license, source: pkg, dir: skillDir, references: await findReferences(skillDir) })
    }
  }

  return resolved
}
