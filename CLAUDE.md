# Foolio — Claude Code Conventions

## Spec-Driven Development Workflow

All feature work follows a spec-driven workflow. Specs live in `docs/specs/`.

### Folder Structure

```
docs/
  specs/
    <id>-<name>/          e.g. 001-portfolio-positions/
      spec.md             Requirements + acceptance criteria (you write this)
      plan.md             Approved implementation plan (you write + approve this)
      output.md           Written by the agent when work is complete
  plans/
    *.md                  Design documents
  _TEMPLATE/              Copy this when creating a new spec
```

### Naming

- `<id>` is zero-padded: `001`, `002`, …
- `<name>` is kebab-case: `portfolio-positions`, `auth-flow`

### File Purposes

- **`spec.md`** — requirements and acceptance criteria only. No implementation details.
- **`plan.md`** — approved implementation plan. Must exist and be approved before an agent
  starts work. For full-stack specs, includes a **Contract** section that defines API
  endpoints and shared types committed to `packages/types`.
- **`output.md`** — written by the agent on completion. Summarizes what was built,
  decisions made, deviations from plan, and anything unresolved.

### Skills

- `/write-spec` — guides you through writing `spec.md` + `plan.md` for a new spec.
- `/work-on-spec <id>` — executes a spec: creates a worktree + branch, runs the plan,
  writes `output.md`.

### Full-Stack Specs

When a spec involves both `apps/api` and `apps/web`:

1. `plan.md` defines the API contract (endpoints + types) and assigns tasks to each agent.
2. Agreed types are committed to `packages/types` before agents start — this is the
   shared source of truth.
3. Two agents run in parallel: `work-on-spec <id> --scope backend` and
   `work-on-spec <id> --scope frontend`.
4. Each agent works on its own git worktree and writes its section of `output.md`.
5. Agents do not communicate directly — `packages/types` and `plan.md` are the interface.

### Branch Naming

`feat/<id>-<name>` — e.g. `feat/001-portfolio-positions`

For scoped agents: `feat/<id>-<name>-backend` and `feat/<id>-<name>-frontend`.

## Monorepo Structure

- `apps/api` — NestJS + Prisma + Postgres
- `apps/web` — Vite + MUI
- `packages/types` — shared TypeScript types (source of truth for full-stack contracts)
