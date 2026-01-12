# Changelog

## v1.0.0 (2026-01-12)

### BREAKING CHANGES

- `agentskills` field renamed to `agents` in package.json
- Nuxt module configKey changed from `agentskills` to `agents`
- CLI binary renamed from `agentskills` to `agents`
- No backward compatibility - clean break per RFC feedback

### Features

- Future-proof structure for MCP and LLM configs
- Aligned with [Nuxt RFC discussion](https://github.com/nuxt/nuxt/discussions/34059)

### Migration Guide

**package.json:**
```diff
- "agentskills": { "skills": [...] }
+ "agents": { "skills": [...] }
```

**nuxt.config.ts:**
```diff
export default defineNuxtConfig({
- agentskills: { targets: ['claude'] }
+ agents: { targets: ['claude'] }
})
```

**CLI:**
```bash
# Before
npx agentskills export --target claude

# After
npx agents export --target claude
```

## v0.1.0 (2025-01-11)

Initial release
