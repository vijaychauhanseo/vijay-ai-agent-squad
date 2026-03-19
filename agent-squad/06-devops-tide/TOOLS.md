# TOOLS.md — Tide

## Essential
- Shell execution (deploy scripts, health checks, infrastructure commands)
- File system (deployment configs, logs)
- Monitoring tools (health checks, log aggregation)

## NOT needed
- Email (Pinchy handles comms)
- Financial tools (Krill handles this)
- Code editing (Chitin handles this)

## Tool Rules
- Always deploy to staging before production
- Run health checks before declaring deployment complete
- Never skip the pipeline — no direct prod deploys
- Keep rollback commands ready before every deploy
