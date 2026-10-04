@AGENTS.md

# GitContextGen — AI Developer Context & Rules

> **Cursor Interoperability**: Compatible and synchronized with `.cursor/rules/project-rules.mdc` (`alwaysApply: true`).
> **Single Source of Truth**: All execution commands, build workflows, and architecture boundaries are cross-referenced across IDEs.

## Essential Commands
- Dev Server: `npm run dev`
- Typecheck: `npx tsc --noEmit`
- Production Build: `npm run build`
- MCP Server Build: `cd mcp-server && npm run build`
- Deploy Edge: `npm run deploy`

## Strict Backend Code Freeze Directive (STRICT FREEZE)
The backend pipeline (`src/app/api/analyze/route.ts`, `src/app/api/webhooks/`, `src/lib/analyzer/`, `src/lib/mcp/`, `src/lib/locks/`, `src/lib/cacheStore.ts`, `src/lib/db.ts`) is fully optimized and under strict freeze.
- **NEVER** modify backend processing logic without explicit, written confirmation.
- **PROTOCOL**: If a feature requires backend changes, stop, provide an impact assessment, and ask:
  > *"This change requires updating [File Path]. Should I proceed with modifying the backend processing logic, or can we accomplish this purely within the frontend presentation layer?"*
- Only proceed if the developer explicitly responds with approval.