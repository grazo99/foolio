# Spec-Driven Development Workflow

## Overview

A structured workflow where specs live in `docs/specs/`, agents work in isolated git worktrees, and communicate results via `output.md` files.

## Folder Structure

```
docs/
  specs/
    <id>-<name>/
      spec.md      ← requirements + acceptance criteria
      plan.md      ← approved implementation plan with contract
      output.md    ← written by agent(s) when done
  plans/
    *.md           ← design docs (like this file)
```

Naming convention: `<id>` is a zero-padded number (e.g. `001`), `<name>` is kebab-case.

## Spec Files

### `spec.md`
- Requirements and acceptance criteria
- No implementation details
- Written by the user (optionally assisted by `write-spec` skill)

### `plan.md`
- Approved implementation plan with discrete steps
- **Contract section** (for full-stack specs): API endpoints, request/response shapes, types to add to `packages/types`
- Agent split: which tasks go to backend, which to frontend
- Must be explicitly approved before agents act on it

### `output.md`
- Written by the agent when work is complete
- Summarizes what was done, decisions made, anything unresolved
- For full-stack specs: sections `## Backend` and `## Frontend` written by respective agents

## Workflow

### Single-domain spec (API-only or UI-only)

1. Write `spec.md` + `plan.md`
2. Invoke: *"work on spec 001"*
3. Agent reads both files, creates worktree + branch (`feat/001-<name>`)
4. Agent executes plan steps
5. Agent writes `output.md`
6. Review and merge PR

### Full-stack spec

1. Write `spec.md` + `plan.md` with contract section
2. Commit agreed types to `packages/types` (this is the source of truth)
3. Invoke two parallel sessions:
   - *"work on spec 001 — backend"*
   - *"work on spec 001 — frontend"*
4. Each agent works on its own worktree against the shared contract
5. Each agent writes its section of `output.md`
6. Review two PRs (or merge to a shared feature branch)

Agents do not communicate directly — `packages/types` and the contract in `plan.md` are the shared interface.

## Skills

### `write-spec`

Guides the user through creating a well-formed spec:
- Asks clarifying questions about requirements and acceptance criteria
- For full-stack specs: proposes and validates the API contract
- Produces `spec.md` and `plan.md` ready for agent execution

### `work-on-spec`

Executes a spec:
- Reads `spec.md` + `plan.md`
- Creates a git worktree and branch
- Executes the plan (delegates to `superpowers:executing-plans`)
- Writes `output.md` on completion

## Conventions (CLAUDE.md)

The following is documented in `CLAUDE.md` so any session understands the system:
- Folder structure and file purposes
- Naming conventions
- That `plan.md` must exist and be approved before work begins
- That `packages/types` is the contract source of truth for full-stack specs
