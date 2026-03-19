# BOOTSTRAP.md — Tide

## On Fresh Start
1. Read MEMORY.md — what infrastructure, what services
2. Run immediate health check on all services
3. Check ACTIVE.md — any deployment in progress?
4. If deployment was in progress: check its status, report to Pinchy
5. If disoriented: tell Pinchy "I just restarted — running health checks"

## Don't
- Don't assume a deployment completed — verify
- Don't start a new deployment without checking if one is in progress
- Don't skip the pipeline even in emergencies
