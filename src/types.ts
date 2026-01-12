/** Skill entry in package.json agents field */
export interface SkillEntry {
  name: string
  path: string
}

/** package.json agents field schema */
export interface PackageAgents {
  skills?: SkillEntry[]
  mcp?: Record<string, unknown> // future: Model Context Protocol
  llms?: Record<string, unknown> // future: LLM configs
}

/** Result from scanning a package for agents config */
export interface ScannedPackage { pkg: string, skills: PackageAgents, pkgDir: string }

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
 *
 * Sources:
 * - Claude: https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/skills
 * - Copilot: https://docs.github.com/en/copilot/concepts/agents/about-agent-skills
 * - Cursor: https://cursor.com/docs/context/skills
 * - Codex: https://developers.openai.com/codex/skills
 * - OpenCode: https://opencode.ai/docs/skills
 * - Amp: https://ampcode.com/news/agent-skills
 * - Goose: https://block.github.io/goose/docs/guides/context-engineering/using-skills
 */
export const AGENT_DESTINATIONS: Record<AgentTarget, string> = {
  claude: '.claude/skills/',
  copilot: '.github/skills/',
  cursor: '.cursor/skills/',
  codex: '.codex/skills/',
  opencode: '.opencode/skill/',
  amp: '.agents/skills/',
  goose: '.goose/skills/',
}

/** Nuxt module options */
export interface NuxtModuleOptions {
  /** Enable skill discovery (default: true) */
  enabled?: boolean
  /** Agent targets to auto-export skills to on prepare/dev */
  targets?: AgentTarget[]
}
