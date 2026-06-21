# Spec-Driven Workflow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Bootstrap the spec-driven development workflow — folder structure, CLAUDE.md conventions, and two skills (`write-spec` and `work-on-spec`).

**Architecture:** Specs live in `docs/specs/<id>-<name>/` with `spec.md`, `plan.md`, and `output.md`. Two skills manage the lifecycle: `write-spec` guides creation of a spec, `work-on-spec` executes it in an isolated git worktree. Conventions are documented in `CLAUDE.md` so every Claude Code session understands the system without invoking a skill.

**Tech Stack:** Markdown files, git worktrees, Claude Code skills (`~/.claude/skills/`), CLAUDE.md.

---

### Task 1: Create `docs/specs/` folder structure with a template

**Files:**
- Create: `docs/specs/_TEMPLATE/spec.md`
- Create: `docs/specs/_TEMPLATE/plan.md`
- Create: `docs/specs/_TEMPLATE/output.md`

**Step 1: Create `docs/specs/_TEMPLATE/spec.md`**

```markdown
# [Feature Name]

## Context

[Why this feature is needed. 2-3 sentences max.]

## Requirements

- [ ] Requirement 1
- [ ] Requirement 2

## Acceptance Criteria

- [ ] Given X, when Y, then Z
- [ ] ...

## Out of Scope

- [Explicitly list what is NOT included]
```

**Step 2: Create `docs/specs/_TEMPLATE/plan.md`**

```markdown
# [Feature Name] — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** [One sentence]

**Architecture:** [2-3 sentences]

**Tech Stack:** [Key technologies]

---

## Contract (full-stack specs only)

> Skip this section for single-domain specs.

### Shared Types (`packages/types/src/`)

```typescript
// Add to packages/types/src/index.ts
export interface ExampleDto {
  id: string;
}
```

### API Endpoints

| Method | Path | Request | Response |
|--------|------|---------|----------|
| POST | /example | `CreateExampleDto` | `ExampleDto` |

---

## Agent Split (full-stack specs only)

> Skip for single-domain specs.

- **Backend agent:** Tasks 1-N
- **Frontend agent:** Tasks N+1-M

---

### Task 1: [Component Name]

**Files:**
- Create: `exact/path/to/file.ts`
- Modify: `exact/path/to/existing.ts`
- Test: `exact/path/to/file.spec.ts`

**Step 1: Write failing test**
...

**Step 2: Run test to verify it fails**
...

**Step 3: Implement**
...

**Step 4: Run test to verify it passes**
...

**Step 5: Commit**

```bash
git add <files>
git commit -m "feat: [description]"
```
```

**Step 3: Create `docs/specs/_TEMPLATE/output.md`**

```markdown
# [Feature Name] — Output

**Spec:** `docs/specs/<id>-<name>/spec.md`
**Branch:** `feat/<id>-<name>`
**Completed:** YYYY-MM-DD

## Summary

[What was built. 2-3 sentences.]

## Decisions Made

- [Decision and rationale]

## Deviations from Plan

- [What changed and why — or "None"]

## Unresolved / Follow-up

- [Anything left open for the next spec — or "None"]
```

**Step 4: Commit**

```bash
git add docs/specs/
git commit -m "docs: add spec template structure"
```

---

### Task 2: Create/update `CLAUDE.md` with workflow conventions

**Files:**
- Create: `CLAUDE.md` (at repo root, if it doesn't exist)

**Step 1: Write `CLAUDE.md`**

```markdown
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
```

**Step 2: Verify the file was created**

```bash
cat CLAUDE.md
```

**Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add CLAUDE.md with spec-driven workflow conventions"
```

---

### Task 3: Create `write-spec` skill

**Files:**
- Create: `~/.claude/skills/write-spec/SKILL.md`

**Step 1: Create skill directory**

```bash
mkdir -p ~/.claude/skills/write-spec
```

**Step 2: Write `~/.claude/skills/write-spec/SKILL.md`**

```markdown
---
name: write-spec
description: >
  Guides the user through creating a new spec in docs/specs/. Trigger when the user
  says "write a spec", "create a spec", "new spec", "spec for X", or wants to plan
  a feature. Produces spec.md and plan.md in docs/specs/<id>-<name>/.
---

# Write-Spec Skill

You are helping the user create a well-formed spec for the foolio project's
spec-driven workflow. The output is two files: `spec.md` (requirements) and
`plan.md` (approved implementation plan) inside `docs/specs/<id>-<name>/`.

**Announce at start:** "I'm using the write-spec skill to guide you through
creating a new spec."

## Step 1 — Determine the spec ID and name

List existing specs to find the next available ID:

```bash
ls docs/specs/ | grep -v _TEMPLATE | sort
```

Assign the next zero-padded ID (e.g. `001`, `002`). Ask the user for a short
kebab-case name for the feature (e.g. `portfolio-positions`).

## Step 2 — Determine the domain

Ask: **Is this spec backend-only, frontend-only, or full-stack?**
- a) Backend only
- b) Frontend only
- c) Full-stack (involves both `apps/api` and `apps/web`)

## Step 3 — Gather requirements (one question at a time)

Ask clarifying questions to understand:
1. What problem does this solve? (user-facing goal)
2. What are the specific requirements? (concrete behaviours)
3. What are the acceptance criteria? (how will you know it's done?)
4. What is explicitly out of scope?

Ask one question at a time. Prefer multiple choice when possible.

## Step 4 — Define the contract (full-stack specs only)

For full-stack specs, define the API contract before writing the plan:

1. Propose the API endpoints (method, path, request, response shapes)
2. Propose the shared TypeScript types to add to `packages/types`
3. Ask the user to confirm or modify
4. Remind the user: "Once we start agents, this contract must be committed to
   `packages/types` first — it's the shared source of truth."

## Step 5 — Write `spec.md`

Copy `docs/specs/_TEMPLATE/spec.md`, fill in the content, save to
`docs/specs/<id>-<name>/spec.md`. Show the user the file and ask for approval.

## Step 6 — Write `plan.md`

Use the `superpowers:writing-plans` skill to create a detailed implementation plan.
Save to `docs/specs/<id>-<name>/plan.md`.

For full-stack specs:
- Include a **Contract** section with the agreed types and endpoints
- Include an **Agent Split** section showing which tasks go to backend vs frontend

## Step 7 — Commit

```bash
git add docs/specs/<id>-<name>/
git commit -m "docs: add spec <id>-<name>"
```

## Step 8 — Hand off

Tell the user:

> "Spec `<id>-<name>` is ready. To execute it, run:
> `/work-on-spec <id>`
>
> For full-stack specs, first commit the contract types to `packages/types`, then run:
> `/work-on-spec <id> --scope backend` and `/work-on-spec <id> --scope frontend`"
```

**Step 3: Verify the skill file exists**

```bash
ls ~/.claude/skills/write-spec/SKILL.md
```

**Step 4: No git commit needed** — skill files live in `~/.claude/`, not in the repo.

---

### Task 4: Create `work-on-spec` skill

**Files:**
- Create: `~/.claude/skills/work-on-spec/SKILL.md`

**Step 1: Create skill directory**

```bash
mkdir -p ~/.claude/skills/work-on-spec
```

**Step 2: Write `~/.claude/skills/work-on-spec/SKILL.md`**

```markdown
---
name: work-on-spec
description: >
  Executes a spec from docs/specs/. Trigger when the user says "work on spec",
  "execute spec", "implement spec <id>", or "run spec <id>". Creates a git worktree,
  executes plan.md, writes output.md. Accepts an optional --scope flag (backend or
  frontend) for full-stack specs.
---

# Work-On-Spec Skill

You are executing a spec from the foolio project's spec-driven workflow.

**Announce at start:** "I'm using the work-on-spec skill to execute spec `<id>`."

## Parse the invocation

The user will say something like:
- `/work-on-spec 001`
- `/work-on-spec 001 --scope backend`
- `/work-on-spec 001 --scope frontend`

Extract:
- `<id>` — the spec ID (e.g. `001`)
- `--scope` — optional: `backend` or `frontend`

## Step 1 — Find the spec

```bash
ls docs/specs/ | grep "^<id>-"
```

This gives you `<id>-<name>`. Verify both files exist:

```bash
ls docs/specs/<id>-<name>/spec.md docs/specs/<id>-<name>/plan.md
```

If `plan.md` does not exist, stop: "No plan.md found for spec `<id>`. Please write and
approve a plan before executing. Use `/write-spec` to create one."

## Step 2 — Read the spec and plan

Read `docs/specs/<id>-<name>/spec.md` and `docs/specs/<id>-<name>/plan.md` in full.

For full-stack specs with `--scope`:
- Only execute the tasks assigned to your scope in the **Agent Split** section.
- Implement strictly against the contract defined in plan.md — do not change types or
  endpoints. The other agent depends on the same contract.

## Step 3 — Create a git worktree

Determine branch name:
- No scope: `feat/<id>-<name>`
- With scope: `feat/<id>-<name>-<scope>`

```bash
git worktree add ../foolio-<id>-<name>[-<scope>] -b feat/<id>-<name>[-<scope>]
```

Work exclusively inside the new worktree directory for all implementation.

## Step 4 — Execute the plan

Use the `superpowers:executing-plans` skill to implement the plan task-by-task.

Follow the plan exactly. If you encounter a blocker or need to deviate, note it — do
not silently change the plan.

## Step 5 — Write `output.md`

When all tasks are complete, write `docs/specs/<id>-<name>/output.md` (or
`output-<scope>.md` for scoped agents) inside the worktree:

```markdown
# <Feature Name> — Output

**Spec:** `docs/specs/<id>-<name>/spec.md`
**Branch:** `feat/<id>-<name>[-<scope>]`
**Completed:** <today's date>

## Summary

[What was built.]

## Decisions Made

- [Decision and rationale]

## Deviations from Plan

- [What changed and why, or "None"]

## Unresolved / Follow-up

- [Anything left open, or "None"]
```

Commit output.md:

```bash
git add docs/specs/<id>-<name>/output[-<scope>].md
git commit -m "docs: add output for spec <id>-<name>[-<scope>]"
```

## Step 6 — Open a PR

```bash
gh pr create \
  --title "feat(<id>): <feature name>" \
  --body "Implements spec docs/specs/<id>-<name>/spec.md" \
  --base main
```

Tell the user the PR URL and that output.md is available at
`docs/specs/<id>-<name>/output.md`.
```

**Step 3: Verify the skill file exists**

```bash
ls ~/.claude/skills/work-on-spec/SKILL.md
```

---

### Task 5: Smoke test the workflow end-to-end

**Step 1: Verify folder structure**

```bash
ls docs/specs/_TEMPLATE/
# Expected: spec.md  plan.md  output.md
```

**Step 2: Verify CLAUDE.md exists and mentions the skills**

```bash
grep -l "write-spec\|work-on-spec" CLAUDE.md
# Expected: CLAUDE.md
```

**Step 3: Verify skills exist**

```bash
ls ~/.claude/skills/write-spec/SKILL.md
ls ~/.claude/skills/work-on-spec/SKILL.md
```

**Step 4: Verify git status is clean**

```bash
git status
```

**Step 5: Final commit if anything remains unstaged**

```bash
git add -p
git commit -m "chore: finalize spec-driven workflow scaffolding"
```
