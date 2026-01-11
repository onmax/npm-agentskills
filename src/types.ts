/** Skill entry in package.json agentskills field */
export interface SkillEntry {
  name: string
  path: string
}

/** package.json agentskills field schema */
export interface PackageAgentSkills {
  skills: SkillEntry[]
}

/** Resolved skill after processing */
export interface ResolvedSkill {
  name: string
  description: string
  source: string
  dir: string
  license?: string
  references: string[]
}

/** manifest.json schema */
export interface SkillsManifest {
  version: 1
  generatedAt: string
  skills: Array<{
    name: string
    description: string
    source: string
    path: string
    license?: string
    references: string[]
  }>
}

/** Agent targets for export */
export type AgentTarget = 'claude' | 'copilot' | 'cursor' | 'codex' | 'opencode' | 'amp' | 'goose'

/**
 * Agent destination paths.
 * Paths starting with '.' are project-local (relative to cwd).
 * Paths starting with '~' are global (user home directory).
 */
export const AGENT_DESTINATIONS: Record<AgentTarget, string> = {
  claude: '.claude/skills/',
  copilot: '.github/skills/',
  cursor: '.cursor/skills/',
  codex: '.codex/skills/',
  opencode: '.opencode/skill/',
  amp: '~/.amp/skills/',
  goose: '~/.config/goose/skills/',
}

/** Nuxt module options */
export interface NuxtModuleOptions {
  /** Enable skill discovery (default: true) */
  enabled?: boolean
  /** Agent targets to auto-export skills to on prepare/dev */
  targets?: AgentTarget[]
}
