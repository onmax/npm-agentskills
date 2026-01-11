# npm-agentskills

Framework-agnostic skill discovery and export for AI coding agents.

## Installation

```bash
npm install npm-agentskills
```

## Usage

### Define skills in package.json

```json
{
  "agentskills": {
    "skills": [
      { "name": "my-skill", "path": "./skills/my-skill" }
    ]
  }
}
```

### Skill structure

```
skills/my-skill/
├── SKILL.md           # Required: frontmatter with name, description
└── references/        # Optional: additional documentation
    └── api.md
```

### SKILL.md format

```md
---
name: my-skill
description: Short description of what this skill does
license: MIT
---

# My Skill

Main documentation content...
```

## Nuxt Integration

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['npm-agentskills/nuxt'],
  agentskills: {
    targets: ['claude', 'cursor'], // Auto-export on prepare/dev
  },
})
```

## CLI

```bash
# List discovered skills
agentskills list

# Export to agent directory
agentskills export --target claude
agentskills export --target cursor
agentskills export --dest ./custom-path
```

## API

```ts
import {
  scanForSkillPackages,
  scanLocalPackage,
  resolveSkills,
  exportToTargets,
  generateManifest,
} from 'npm-agentskills'

// Scan for skills
const packages = await scanForSkillPackages('./node_modules')
const local = await scanLocalPackage('./')

// Resolve and export
const skills = await resolveSkills(packages, local)
await exportToTargets(skills, ['claude'], './')
```

## Supported Agents

| Agent    | Destination           |
|----------|-----------------------|
| claude   | ~/.claude/skills/     |
| copilot  | .github/skills/       |
| cursor   | .cursor/skills/       |
| codex    | .codex/skills/        |
| opencode | ~/.opencode/skills/   |
| amp      | ~/.amp/skills/        |
| goose    | ~/.config/goose/skills/ |

## License

MIT
