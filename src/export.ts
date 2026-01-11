import type { AgentTarget, ResolvedSkill } from './types'
import { promises as fsp } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'pathe'
import { AGENT_DESTINATIONS } from './types'

/** Expand ~ to home directory */
export function expandHome(path: string): string {
  return path.startsWith('~') ? path.replace('~', homedir()) : path
}

/** Copy skill directory recursively */
export async function copySkillDir(srcDir: string, destDir: string): Promise<void> {
  await fsp.mkdir(destDir, { recursive: true })
  const entries = await fsp.readdir(srcDir, { withFileTypes: true })
  for (const entry of entries) {
    const srcPath = join(srcDir, entry.name)
    const destPath = join(destDir, entry.name)
    if (entry.isDirectory()) {
      await copySkillDir(srcPath, destPath)
    }
    else {
      await fsp.copyFile(srcPath, destPath)
    }
  }
}

/** Export skills to agent target destinations */
export async function exportToTargets(skills: ResolvedSkill[], targets: AgentTarget[], cwd: string): Promise<string[]> {
  const exported: string[] = []
  for (const target of targets) {
    const destPath = AGENT_DESTINATIONS[target]
    const destDir = destPath.startsWith('.') ? resolve(cwd, destPath) : expandHome(destPath)

    for (const skill of skills) {
      await copySkillDir(skill.dir, join(destDir, skill.name))
    }
    exported.push(destDir)
  }
  return exported
}
