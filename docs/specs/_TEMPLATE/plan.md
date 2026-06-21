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
