import type { ResolvedSkill, SkillsManifest } from './types'

/** Generate manifest.json from resolved skills */
export function generateManifest(skills: ResolvedSkill[]): SkillsManifest {
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    skills: skills.map(s => ({
      name: s.name,
      description: s.description,
      source: s.source,
      path: s.name,
      license: s.license,
      references: s.references,
    })),
  }
}
