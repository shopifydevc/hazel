# AGENTS.md

Agent configuration for the Hazel Chat monorepo.

## Commands
- `bun run dev` - Start all apps in dev mode
- `bun run build` - Build all apps and typecheck
- `bun run typecheck` - Run TypeScript checking across packages
- `bun run format:fix` - Format and lint with Biome
- `bun run test` - Run tests in watch mode (Vitest)
- `bun run test:once` - Run all tests once
- `bun run test:debug` - Debug tests with inspector

## Architecture
- Monorepo with `apps/web` (React + Vite), `apps/backendv2` (Bun + Effect-TS), `packages/db` (Drizzle + PostgreSQL)
- Backend uses Effect-TS functional patterns with RPC-style HTTP APIs
- Database schema in `packages/db/src/schema/` with Drizzle ORM
- Real-time via Cloudflare Realtimekit, auth via WorkOS

## Code Style (Biome)
- Tab indentation (4 spaces), double quotes, trailing commas, 110 char line width
- Import organization enabled, use `import type` for types only
- Effect-TS patterns: yield* for effects, pipe() for composition, Option/Either for error handling
- Repository pattern for data access, policy functions for authorization
- File-based routing in frontend with TanStack Router
