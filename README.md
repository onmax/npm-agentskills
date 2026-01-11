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

### Add Skills to Your Package

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

Each skill directory must contain a `SKILL.md` file with YAML frontmatter:

```
skills/my-skill/
├── SKILL.md           # Required: entry point with frontmatter
└── references/        # Optional: additional documentation files
    ├── api.md
    ├── examples.md
    └── patterns.md
```

### SKILL.md Format

Your `SKILL.md` file requires YAML frontmatter with `name`, `description`, and `license`:

```md
---
name: awesome-module
description: Use when working with nuxt-awesome-module - provides configuration patterns, composables, and component usage
license: MIT
---

# Awesome Module

Use this skill when working with `nuxt-awesome-module`.

## Installation

Add the module to your Nuxt config:

\`\`\`ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['nuxt-awesome-module']
})
\`\`\`

## Configuration

Configure module options in `nuxt.config.ts`:

\`\`\`ts [nuxt.config.ts]
export default defineNuxtConfig({
  awesomeModule: {
    apiKey: process.env.AWESOME_API_KEY,
    enabled: true
  }
})
\`\`\`

## Composables

### useAwesome()

Returns reactive state and methods for awesome functionality:

\`\`\`ts
const { data, fetch, reset } = useAwesome()
\`\`\`

## Common Patterns

Load `references/patterns.md` for integration examples.
```

### Writing Effective Descriptions

The `description` field is critical. AI agents use it to decide when to activate your skill automatically. Make it specific and actionable.

**Good descriptions:**
- `"Use when working with nuxt-auth-utils - provides server-side auth patterns, useSession composable, and middleware configuration"`
- `"Use when implementing payment flows with nuxt-stripe - covers checkout sessions, webhooks, and TypeScript types"`
- `"Use when building with Reka UI - provides component API, accessibility patterns, and composition with asChild"`

**Poor descriptions:**
- `"A great authentication module"` (too vague)
- `"Provides auth functionality"` (doesn't explain when to activate)
- `"Documentation for my library"` (no context about features)

### Content Structure

Organize content by task to help AI agents find relevant information quickly:

```md
## Installation
[Quick setup steps with code]

## Configuration
[Module options with examples and defaults]

## Composables
[Auto-imported functions with signatures and examples]

## Components
[Available components with props and slots]

## Server Utilities
[Server-only imports and patterns]

## Common Patterns
[Real-world integration examples]

## Troubleshooting
[Common issues and solutions]
```

### Code Examples

Include practical, copy-paste examples with file path labels:

```md
## Authentication Flow

Set up protected routes with middleware:

\`\`\`ts [server/middleware/auth.ts]
export default defineEventHandler((event) => {
  const session = await useSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401 })
  }
})
\`\`\`

Use the session in components:

\`\`\`vue [pages/dashboard.vue]
<script setup lang="ts">
const { user, clear } = useSession()

async function logout() {
  await clear()
  navigateTo('/login')
}
</script>
\`\`\`
```

### Reference Files

Split long documentation into focused reference files:

```
skills/awesome-module/
├── SKILL.md                    # Overview and common usage
└── references/
    ├── configuration.md        # All module options
    ├── composables.md          # Detailed API documentation
    ├── components.md           # Component props and slots
    ├── server.md               # Server utilities
    └── examples.md             # Integration patterns
```

Reference them from SKILL.md using clear instructions:

```md
## Advanced Configuration

Load `references/configuration.md` for all available options and defaults.

## Server Integration

Load `references/server.md` for server-side patterns and utilities.
```

### Module Configuration

Document all available options with defaults and types:

```md
## Module Options

Configure in `nuxt.config.ts`:

\`\`\`ts [nuxt.config.ts]
export default defineNuxtConfig({
  awesomeModule: {
    // API credentials
    apiKey: process.env.AWESOME_API_KEY,    // required
    apiSecret: process.env.AWESOME_SECRET,  // required

    // Feature flags
    enabled: true,                          // default: true
    debug: false,                           // default: false

    // Runtime options
    timeout: 5000,                          // default: 5000 ms
    retries: 3,                             // default: 3 attempts
  }
})
\`\`\`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | required | API key for authentication |
| `enabled` | `boolean` | `true` | Enable or disable the module |
| `timeout` | `number` | `5000` | Request timeout in milliseconds |
```

### Auto-imports

List what gets auto-imported to help AI agents understand available utilities:

```md
## Auto-imports

The module provides these auto-imported utilities:

**Composables:**
- `useAwesome()` - Main composable for reactive state
- `useAwesomeData(id)` - Data fetching with caching
- `useAwesomeConfig()` - Access module configuration

**Components:**
- `<AwesomeCard>` - Display card component
- `<AwesomeButton>` - Action button component

**Server utilities:**
- `getAwesomeClient()` - Server-side client instance
- `validateAwesomeWebhook(event)` - Webhook validation
```

### Integration Patterns

Show how your module works with common tools and patterns:

```md
## Database Integration

Use with Drizzle ORM:

\`\`\`ts [server/database/schema.ts]
import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  awesomeId: text('awesome_id').notNull()
})
\`\`\`

\`\`\`ts [server/api/sync.post.ts]
export default defineEventHandler(async (event) => {
  const { data } = await useAwesomeData(event)
  await useDrizzle().insert(users).values({
    id: data.id,
    awesomeId: data.awesomeId
  })
})
\`\`\`

## Testing

Test components with `@nuxt/test-utils`:

\`\`\`ts
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

mockNuxtImport('useAwesome', () => {
  return () => ({
    data: ref({ id: 1 }),
    fetch: vi.fn()
  })
})
\`\`\`
```

### TypeScript Types

Document exported types for better IDE support:

```md
## TypeScript

The module exports types for configuration and runtime:

\`\`\`ts
import type { ModuleOptions, SessionData } from 'nuxt-awesome-module'

export default defineNuxtConfig<{ awesomeModule: ModuleOptions }>({
  awesomeModule: {
    // Fully typed options
  }
})
\`\`\`
```

### Multiple Skills Per Package

You can bundle multiple skills for different use cases:

```json
{
  "agentskills": {
    "skills": [
      { "name": "main-skill", "path": "./skills/main" },
      { "name": "advanced", "path": "./skills/advanced" }
    ]
  }
}
```

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

## Checklist for Module Authors

Before publishing your package with skills:

- [ ] Add `agentskills` field to `package.json`
- [ ] Create `SKILL.md` with frontmatter (`name`, `description`, `license`)
- [ ] Write specific `description` that explains when to activate
- [ ] Include installation and configuration examples
- [ ] Document all composables with signatures and examples
- [ ] List all components with props and slots
- [ ] Document server utilities and patterns
- [ ] Add integration examples with common tools
- [ ] Include environment variables and deployment notes
- [ ] Add troubleshooting section for common issues
- [ ] Test skills locally with `npx agentskills list`
- [ ] Commit skills to your repository

## Testing Your Skills Locally

Create a test project and verify skills are discovered correctly:

```bash
# Install your module
npm install your-module

# List discovered skills
npx agentskills list
# Output: your-skill (from your-module)

# Export to agent directory
npx agentskills export --target claude

# Verify files exist
ls -la .claude/skills/your-skill/
```

## Best Practices

### Keep Skills Updated

Update your skills when you:
- Add new composables or components
- Change configuration options
- Add integration patterns
- Receive feedback about AI assistance accuracy

### Focus on Common Tasks

Document the most frequent use cases first:
- Quick start and installation
- Basic configuration
- Common composables and components
- Typical integration patterns

### Use Clear Language

Write for AI agents to parse effectively:
- Active voice and present tense
- Clear, complete sentences
- Specific examples with file paths
- Consistent terminology

### Avoid External Dependencies

Keep all documentation local:
- Use markdown files in `references/`
- Avoid links to external documentation
- Include code examples inline
- Keep content self-contained

## Examples from the Ecosystem

Reference these Nuxt modules for skill patterns:

- **nuxt-auth-utils** - Authentication patterns with session management
- **@nuxt/ui** - Component library with extensive props documentation
- **@nuxthub/core** - Platform-specific deployment patterns
- **nuxt-stripe** - Third-party API integration examples

## FAQ

**Q: Can I include multiple skills in one package?**

Yes. Add multiple entries to the `skills` array in your `package.json`:

```json
{
  "agentskills": {
    "skills": [
      { "name": "main-skill", "path": "./skills/main" },
      { "name": "advanced", "path": "./skills/advanced" }
    ]
  }
}
```

**Q: Should I commit skills to my repository?**

Yes. Skills are part of your package's documentation. Users shouldn't need extra packages to get AI assistance with your module.

**Q: How do I test skills with my AI agent?**

Export skills to your agent's directory and ask questions about your module. Verify the AI provides accurate guidance based on your skill content.

**Q: Can skills reference external URLs?**

Avoid external links. AI agents work best with local markdown files. Use `references/` to split content into focused files instead.

**Q: What if my module has many features?**

Split documentation across multiple reference files or create separate skills for distinct feature sets. Keep SKILL.md focused on common tasks.

**Q: Do skills work with all AI agents?**

Skills use the agentskills open format, supported by Claude Code, GitHub Copilot, Cursor, and other AI coding tools. The export paths are standardized across agents.

## License

MIT
