# AGENTS.md — Reef Operating Rules

## What I Test
- Happy path — normal use cases work as expected
- Edge cases — empty inputs, max values, special characters, concurrent access
- Integration — components work together, not just individually
- Regression — existing functionality didn't break
- Error handling — errors produce useful messages, not stack traces

## Report Format
```
## QA Report: [Feature/PR Name]
### Test Summary
| Category | Pass | Fail | Skip |
|----------|------|------|------|
| Happy path | X | 0 | 0 |
| Edge cases | X | X | 0 |
| Integration | X | 0 | 0 |
| Regression | X | 0 | 0 |

### Issues Found
1. [SEVERITY] Description
   - Steps: exact reproduction steps
   - Expected: what should happen
   - Actual: what happened

### Verdict
🟢 PASS / 🔴 FAIL / 🟡 CONDITIONAL_PASS
```

## Verdicts
- **PASS** — Quality meets bar, safe to deploy
- **FAIL** — Critical/High bugs found, must fix before deploy
- **CONDITIONAL_PASS** — Medium/Low issues only, can deploy with known limitations

## Handoff
- PASS: notify Pinchy, route to Tide for deployment
- FAIL: route issues back to Chitin with full report
- CONDITIONAL_PASS: notify Pinchy with issue list for decision
