# npm-agentskills

Bundle agent skills with your npm packages to help AI assistants understand your library.

## What Are Agent Skills?

Agent Skills provide contextual documentation that AI coding assistants load automatically. When developers use your library, their AI agent reads your skill to deliver accurate guidance on your API, patterns, and best practices.

Skills follow the [agentskills](https://agentskills.io) open format, supported by Claude Code, GitHub Copilot, Cursor, and other AI coding tools.

This package enables library authors to bundle skills with their npm packages. When users install your package, the skills are discovered and exported to the appropriate location for their AI agent.

## Installation

```bash
npm install npm-agentskills
```

## For Library Authors: Bundling Skills

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

Create skill directories with a `SKILL.md` file:

```
skills/my-skill/
├── SKILL.md           # Required: entry point with frontmatter
└── references/        # Optional: additional documentation files
    └── api.md
```

**Learn how to write skills:** See the [agentskills.io specification](https://agentskills.io/specification) for the complete guide on creating effective agent skills.

## For End Users: Installing Skills

### Nuxt Applications (Automatic)

Add the module to your Nuxt config. Skills are automatically discovered from `node_modules` and exported when you run `nuxi prepare` or `nuxi dev`:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['npm-agentskills/nuxt'],
  agentskills: {
    targets: ['claude', 'cursor'],
  },
})
```

The module scans your dependencies for packages with `agentskills` fields and exports their skills to project-local directories.

### Other Frameworks (CLI)

Run the CLI after installing packages that contain skills:

```bash
# Export skills to Claude Code
npx agentskills export --target claude

# Export to multiple agents
npx agentskills export --target cursor
npx agentskills export --target codex

# List all discovered skills
npx agentskills list
```

Add this to your `postinstall` script for automatic exports:

```json
{
  "scripts": {
    "postinstall": "agentskills export --target claude"
  }
}
```

## Supported Agents

All paths are project-local, keeping skills scoped to your project rather than polluting global configuration.

| Agent      | Directory            | Documentation |
|------------|----------------------|---------------|
| Claude     | `.claude/skills/`    | [docs](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/skills) |
| Copilot    | `.github/skills/`    | [docs](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills) |
| Cursor     | `.cursor/skills/`    | [docs](https://cursor.com/docs/context/skills) |
| Codex      | `.codex/skills/`     | [docs](https://developers.openai.com/codex/skills) |
| OpenCode   | `.opencode/skill/`   | [docs](https://opencode.ai/docs/skills) |
| Amp        | `.agents/skills/`    | [docs](https://ampcode.com/news/agent-skills) |
| Goose      | `.goose/skills/`     | [docs](https://block.github.io/goose/docs/guides/context-engineering/using-skills) |

### Cross-Agent Compatibility

Many agents read from multiple directories for compatibility:

- **Goose** also reads `.claude/skills/` and `.agents/skills/`
- **OpenCode** also reads `.claude/skills/`
- **Amp** uses the portable `.agents/skills/` convention

If you target `claude`, your skills will work with Goose and OpenCode automatically.

## Programmatic API

Use the core functions directly in build tools or custom integrations:

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

## CLI Reference

```bash
# List all discovered skills with their sources
agentskills list
agentskills list --json          # Output as JSON

# Export skills to agent directory
agentskills export --target claude
agentskills export --target cursor
agentskills export --dest ./custom-path  # Custom destination

# Options
--cwd <dir>      # Project root (default: current directory)
--dir <dir>      # Skills directory (default: .nuxt/skills)
```

## How It Works

1. **Discovery**: Scans `node_modules` for packages with an `agentskills` field in their `package.json`
2. **Resolution**: Reads each skill's `SKILL.md` file and parses the frontmatter metadata
3. **Export**: Copies skill directories to the appropriate agent location
4. **Manifest**: Generates a `manifest.json` file listing all discovered skills

For Nuxt, this happens automatically during `nuxi prepare`. For other frameworks, you run the CLI manually or via npm scripts.

## Testing Your Skills

Verify skills are discovered correctly:

```bash
# List discovered skills
npx agentskills list

# Export to agent directory
npx agentskills export --target claude

# Verify files exist
ls -la .claude/skills/your-skill/
```

## License

MIT
