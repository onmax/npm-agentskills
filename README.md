# npm-agentskills

Framework-agnostic skill discovery and export for AI coding agents.

## What It Does

This package allows library authors to bundle "skills" (contextual documentation for AI coding assistants) with their npm packages. When users install your package, the skills are automatically discovered and exported to the appropriate location for their AI agent.

Skills follow the [agentskills](https://agentskills.io) open format, which is supported by Claude Code, GitHub Copilot, Cursor, and other AI coding tools.

## Installation

```bash
npm install npm-agentskills
```

## Defining Skills

Add an `agentskills` field to your `package.json` that points to skill directories:

```json
{
  "name": "my-awesome-library",
  "agentskills": {
    "skills": [
      { "name": "my-skill", "path": "./skills/my-skill" }
    ]
  }
}
```

Each skill directory must contain a `SKILL.md` file with frontmatter metadata:

```
skills/my-skill/
├── SKILL.md           # Required: entry point with frontmatter
└── references/        # Optional: additional documentation files
    └── api.md
```

### SKILL.md Format

The `SKILL.md` file requires YAML frontmatter with `name` and `description` fields:

```md
---
name: my-skill
description: Short description that helps the AI decide when to load this skill
license: MIT
---

# My Skill

Main documentation content that the AI reads when working with your library...
```

The `description` field is important because AI agents use it to decide when to automatically activate the skill based on the user's current context.

## Nuxt Integration

For Nuxt applications, add the module to your config. Skills are automatically discovered and exported when you run `nuxi prepare` or `nuxi dev`:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['npm-agentskills/nuxt'],
  agentskills: {
    targets: ['claude', 'cursor'], // Export to these agents
  },
})
```

The module scans your `node_modules` for packages with `agentskills` fields and exports their skills to project-local directories that your AI agent reads.

## CLI

The CLI provides commands for listing and exporting skills manually:

```bash
# List all discovered skills and their sources
agentskills list

# Export skills to a specific agent's directory
agentskills export --target claude
agentskills export --target cursor

# Export to a custom directory
agentskills export --dest ./custom-path
```

## Programmatic API

Use the core functions directly in your build tools:

```ts
import {
  exportToTargets,
  generateManifest,
  resolveSkills,
  scanForSkillPackages,
  scanLocalPackage,
} from 'npm-agentskills'

// Scan node_modules for packages with agentskills field
const packageSkills = await scanForSkillPackages('./node_modules')

// Scan local package.json for skills defined in this project
const localSkills = await scanLocalPackage('./')

// Resolve and deduplicate skills
const skills = await resolveSkills(packageSkills, localSkills)

// Export to agent directories
await exportToTargets(skills, ['claude', 'cursor'], './')

// Generate manifest for debugging
const manifest = generateManifest(skills)
```

## Supported Agents

Skills are exported to project-local directories where possible. This keeps skills scoped to the project rather than polluting the user's global configuration.

| Agent    | Destination             | Scope   |
|----------|-------------------------|---------|
| claude   | .claude/skills/         | Project |
| copilot  | .github/skills/         | Project |
| cursor   | .cursor/skills/         | Project |
| codex    | .codex/skills/          | Project |
| opencode | .opencode/skill/        | Project |
| amp      | ~/.amp/skills/          | Global  |
| goose    | ~/.config/goose/skills/ | Global  |

For agents that only support global directories (amp, goose), skills are exported to the user's home directory.

## License

MIT
