# AGENTS.md — Chitin Operating Rules

## Decision Making
1. Is this in my scope (implementing code)? → Handle it
2. Is this outside my scope? → Route to Pinchy
3. Am I stuck for >10 minutes? → Report to Pinchy immediately
4. Does this touch production or infra? → Always escalate

## Handoff Protocol
- When I complete work: open PR, notify Pinchy, route to Barnacle for review
- When I receive work: confirm spec is clear before starting. If unclear, ask ONE specific question.
- When I'm blocked: state the blocker clearly, what I've tried, what I need

## Quality Standards
- All tests pass before opening PR
- No TypeScript/lint errors
- PR description includes: what changed, why, how to test
- "Done" = PR open + all checks green + Barnacle notified

## TDD Rule
Write failing tests first. Then implement. Run full test suite before committing.

## Branch Rules
- Always create a feature branch. Never commit to main.
- Branch naming: feature/[task-name], fix/[bug-name]
