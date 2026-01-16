import type { Nuxt } from '@nuxt/schema'
import type { PackageAgents, ScannedPackage } from './types'
import { existsSync, promises as fsp } from 'node:fs'
import { dirname, join } from 'pathe'
import { readPackageJSON } from 'pkg-types'

interface InstalledModule {
  meta?: { name?: string, agents?: PackageAgents, [key: string]: unknown }
  entryPath?: string
}

/** Check if entry is a directory (follows symlinks) */
function isDir(entry: { isDirectory: () => boolean, isSymbolicLink: () => boolean }): boolean {
  return entry.isDirectory() || entry.isSymbolicLink()
}

/** Scan node_modules for packages with agents field */
export async function scanForSkillPackages(modulesDir: string): Promise<ScannedPackage[]> {
  const results: ScannedPackage[] = []
  if (!existsSync(modulesDir))
    return results

  const entries = await fsp.readdir(modulesDir, { withFileTypes: true })
  for (const entry of entries) {
    if (!isDir(entry))
      continue

    // Handle scoped packages (@org/pkg)
    if (entry.name.startsWith('@')) {
      const scopeDir = join(modulesDir, entry.name)
      const scopedEntries = await fsp.readdir(scopeDir, { withFileTypes: true }).catch(() => [])
      for (const scopedEntry of scopedEntries) {
        if (!isDir(scopedEntry))
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

async function checkPackage(pkgDir: string, pkgName: string, results: ScannedPackage[]): Promise<void> {
  try {
    const pkg = await readPackageJSON(pkgDir)
    if (pkg.agents && Array.isArray((pkg.agents as PackageAgents).skills)) {
      results.push({ pkg: pkg.name || pkgName, skills: pkg.agents as PackageAgents, pkgDir })
    }
  }
  catch { /* ignore packages without package.json */ }
}

/** Scan local project package.json for agents */
export async function scanLocalPackage(rootDir: string): Promise<ScannedPackage[]> {
  const results: ScannedPackage[] = []
  try {
    const pkg = await readPackageJSON(rootDir)
    if (pkg.agents && Array.isArray((pkg.agents as PackageAgents).skills)) {
      results.push({ pkg: pkg.name || 'local', skills: pkg.agents as PackageAgents, pkgDir: rootDir })
    }
  }
  catch { /* no package.json */ }
  return results
}

/** Scan installed Nuxt modules for meta.agents field */
export function scanInstalledModules(nuxt: Nuxt): ScannedPackage[] {
  const results: ScannedPackage[] = []
  const installed = (nuxt.options as unknown as Record<string, unknown>)._installedModules as InstalledModule[] || []

  for (const mod of installed) {
    if (mod.meta?.agents?.skills && mod.entryPath) {
      results.push({ pkg: mod.meta.name || 'unknown-module', skills: mod.meta.agents, pkgDir: dirname(mod.entryPath) })
    }
  }
  return results
}
