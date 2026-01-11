import type { PackageAgentSkills } from './types'
import { existsSync, promises as fsp } from 'node:fs'
import { join } from 'pathe'
import { readPackageJSON } from 'pkg-types'

/** Scan node_modules for packages with agentskills field */
export async function scanForSkillPackages(modulesDir: string): Promise<Array<{ pkg: string, skills: PackageAgentSkills, pkgDir: string }>> {
  const results: Array<{ pkg: string, skills: PackageAgentSkills, pkgDir: string }> = []
  if (!existsSync(modulesDir))
    return results

  const entries = await fsp.readdir(modulesDir, { withFileTypes: true })
  for (const entry of entries) {
    if (!entry.isDirectory())
      continue

    // Handle scoped packages (@org/pkg)
    if (entry.name.startsWith('@')) {
      const scopeDir = join(modulesDir, entry.name)
      const scopedEntries = await fsp.readdir(scopeDir, { withFileTypes: true }).catch(() => [])
      for (const scopedEntry of scopedEntries) {
        if (!scopedEntry.isDirectory())
          continue
        const pkgDir = join(scopeDir, scopedEntry.name)
        await checkPackage(pkgDir, `${entry.name}/${scopedEntry.name}`, results)
      }
    }
    else {
      const pkgDir = join(modulesDir, entry.name)
      await checkPackage(pkgDir, entry.name, results)
    }
  }
  return results
}

async function checkPackage(pkgDir: string, pkgName: string, results: Array<{ pkg: string, skills: PackageAgentSkills, pkgDir: string }>): Promise<void> {
  try {
    const pkg = await readPackageJSON(pkgDir)
    if (pkg.agentskills && Array.isArray((pkg.agentskills as PackageAgentSkills).skills)) {
      results.push({ pkg: pkg.name || pkgName, skills: pkg.agentskills as PackageAgentSkills, pkgDir })
    }
  }
  catch { /* ignore packages without package.json */ }
}

/** Scan local project package.json for agentskills */
export async function scanLocalPackage(rootDir: string): Promise<Array<{ pkg: string, skills: PackageAgentSkills, pkgDir: string }>> {
  const results: Array<{ pkg: string, skills: PackageAgentSkills, pkgDir: string }> = []
  try {
    const pkg = await readPackageJSON(rootDir)
    if (pkg.agentskills && Array.isArray((pkg.agentskills as PackageAgentSkills).skills)) {
      results.push({ pkg: pkg.name || 'local', skills: pkg.agentskills as PackageAgentSkills, pkgDir: rootDir })
    }
  }
  catch { /* no package.json */ }
  return results
}
