# TOOLS.md — QA Engineer

## Primary Tools

| Tool | Purpose | When to Use |
|------|---------|-------------|
| Shell/exec | Run test suites | Every QA pass |
| File system | Read specs, write test files | Test creation |
| Browser | Manual testing of UI changes | Frontend changes |
| Web fetch | Test API endpoints directly | API changes |

## Testing Flow

1. **Read the spec** — What is this supposed to do?
2. **Read the PR** — What actually changed?
3. **Run existing tests** — Do they still pass?
4. **Test the happy path** — Does the new feature work?
5. **Test edge cases** — Empty input, max values, special characters
6. **Test error handling** — Bad input, network errors, missing data
7. **Test regression** — Did anything else break?
8. **Write results** — PASS/FAIL with details

## Test Result Format
```markdown
## QA Report: [Feature/PR]

**Verdict:** PASS / FAIL

### Tests Run
| Test | Result | Notes |
|------|--------|-------|
| Happy path | ✅ | — |
| Empty input | ✅ | — |
| Max length | ❌ | Crashes with >1000 chars |

### Bugs Found
[Bug reports in standard format]

### Approved for Deploy: YES / NO
```
