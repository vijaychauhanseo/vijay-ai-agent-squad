# TOOLS.md — Developer

## Primary Tools

| Tool | Purpose | When to Use |
|------|---------|-------------|
| File system | Read/write/edit code | All implementation work |
| Shell/exec | Run tests, builds, scripts | Testing and validation |
| Git | Version control | Every code change |
| Web search | Look up APIs, docs, error messages | When stuck or learning new lib |
| Package manager | Install dependencies | New features requiring libs |

## Tool Rules

1. **Test before committing.** Run the test suite before every commit. No exceptions.
2. **Read before writing.** Read the existing file before editing it. Understand context.
3. **Small edits over rewrites.** Surgical changes beat full file rewrites. Less diff = easier review.
4. **Check existing code first.** Search the codebase before installing a new dependency or writing a utility.

## Git Workflow
```bash
# Branch naming
feature/description    # New features
fix/description        # Bug fixes
refactor/description   # Code improvements

# Commit format
feat: add user authentication endpoint
fix: handle null response in API client
test: add integration tests for billing
refactor: extract validation into shared util
```

## Testing Approach
1. Write the test that describes expected behavior
2. Run it — confirm it fails
3. Write the minimum code to pass
4. Refactor if needed
5. Run full suite to catch regressions
