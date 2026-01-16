import type { ResolvedSkill, ScannedPackage } from './types'
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

/** Validate skill path doesn't use absolute paths */
function validateSkillPath(path: string): void {
  // Only block absolute paths - relative paths with '..' are allowed since resolve() handles them safely
  if (path.startsWith('/') || path.startsWith('\\') || /^[A-Z]:/i.test(path)) {
    throw new Error(`Invalid skill path (absolute path not allowed): ${path}`)
  }
}

/** Process skills from a scanned package array */
async function processSkillPackages(packages: ScannedPackage[], seen: Set<string>, resolved: ResolvedSkill[]): Promise<void> {
  for (const { pkg, skills, pkgDir } of packages) {
    if (!skills.skills)
      continue
    for (const entry of skills.skills) {
      if (seen.has(entry.name))
        continue
      validateSkillPath(entry.path)
      const skillDir = resolve(pkgDir, entry.path)
      const skillMdPath = join(skillDir, 'SKILL.md')
      if (!existsSync(skillMdPath)) {
        console.warn(`[agents] SKILL.md not found: ${skillMdPath}`)
        continue
      }
      const meta = await parseSkillMd(skillMdPath)
      seen.add(entry.name)
      resolved.push({ name: entry.name, description: meta.description, license: meta.license, source: pkg, dir: skillDir, references: await findReferences(skillDir) })
    }
  }
}

/** Resolve skills from packages and local package.json */
export async function resolveSkills(packageSkills: ScannedPackage[], localSkills: ScannedPackage[]): Promise<ResolvedSkill[]> {
  const resolved: ResolvedSkill[] = []
  const seen = new Set<string>()

  // Local skills take priority over node_modules
  await processSkillPackages(localSkills, seen, resolved)
  await processSkillPackages(packageSkills, seen, resolved)

  return resolved
}
