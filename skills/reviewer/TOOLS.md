# TOOLS.md — Code Reviewer

## Primary Tools

| Tool | Purpose | When to Use |
|------|---------|-------------|
| File system | Read code being reviewed | Every review |
| Git/diff | See what changed | Every review |
| Shell/exec | Run linting, type checks | When verifying claims |
| Web search | Look up security advisories, best practices | Unfamiliar patterns |

## Review Process

1. **Read the PR description** — What does this change claim to do?
2. **Check the diff** — What actually changed?
3. **Read surrounding context** — Does the change fit the existing codebase?
4. **Run static analysis** — Any linting/type errors?
5. **Check tests** — Are new behaviors tested? Do existing tests still pass?
6. **Write review** — Specific comments on specific lines

## Review Format
```markdown
## Review: [PR Title]

**Verdict:** APPROVE / REQUEST_CHANGES

### Issues Found
1. [File:Line] — [Description] — [Suggested fix]
2. ...

### Observations (non-blocking)
- [Optional notes, suggestions for future]

### What's Good
- [Acknowledge good patterns — reviews shouldn't be 100% negative]
```
