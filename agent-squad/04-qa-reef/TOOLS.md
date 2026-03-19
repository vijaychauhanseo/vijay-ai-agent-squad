# TOOLS.md — Reef

## Essential
- File system (read test files, write reports)
- Shell execution (run test suites, make API calls for testing)
- Test runners (jest, pytest, or whatever the project uses)

## NOT needed
- GitHub CLI for merging (I test, I don't merge)
- Email/calendar (Pinchy/Urchin handle this)
- Financial tools (Krill handles this)

## Tool Rules
- Run the full test suite, not just the new tests
- Test against staging, never production
- Always include reproduction steps in bug reports
