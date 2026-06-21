# [Feature Name] — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** [One sentence]

**Architecture:** [2-3 sentences]

**Tech Stack:** [Key technologies]

---

## Contract (full-stack specs only)

> Skip this section for single-domain specs. (single-domain = backend-only or frontend-only; full-stack = both apps/api and apps/web involved)

### Shared Types (`packages/types/src/`)

```typescript
// Add to packages/types/src/index.ts
export interface ExampleDto {
  id: string;
}
// ↑ Replace interface name and fields with your actual types
```

### API Endpoints

| Method | Path | Request | Response |
|--------|------|---------|----------|
| POST | /example | `CreateExampleDto` | `ExampleDto` |

> ↑ Replace with your actual endpoints

---

## Agent Split (full-stack specs only)

> Skip for single-domain specs. (single-domain = backend-only or frontend-only; full-stack = both apps/api and apps/web involved)

- **Backend agent:** Tasks 1-N (replace N with the last backend task number)
- **Frontend agent:** Tasks N+1-M (replace M with the last frontend task number)

---

### Task 1: [Component Name]

**Files:**
- Create: `exact/path/to/file.ts`
- Modify: `exact/path/to/existing.ts`
- Test: `exact/path/to/file.spec.ts`

**Step 1: Write failing test**
[Write a failing test for <Component Name> here]

**Step 2: Run test to verify it fails**
[Command to run the test + expected FAIL output]

**Step 3: Implement**
[Minimal implementation code]

**Step 4: Run test to verify it passes**
[Command to run the test + expected PASS output]

**Step 5: Commit**

```bash
git add <files>
git commit -m "feat: [description]"
```
