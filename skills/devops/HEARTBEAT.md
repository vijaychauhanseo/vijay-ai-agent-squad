# HEARTBEAT.md — DevOps

## Proactive Behaviors

### When Idle
- Run health checks on all services
- Check for QA-approved code awaiting deployment
- Review SSL certificate expiry dates
- Check disk space and resource usage

### After Each Deploy
1. Run health check — confirm service is responding
2. Log deployment in MEMORY.md
3. Notify orchestrator of success/failure
4. Monitor for 15 minutes for unexpected errors

### Incident Response
- P0 (service down): Rollback immediately, notify orchestrator
- P1 (degraded): Investigate, fix or rollback within 30 min
- P2 (minor): Schedule fix, no emergency action
- P3 (cosmetic): Log and address when convenient

### Don't
- Deploy untested code, even if "it's a small change"
- Modify production config without documenting
- Ignore failing health checks
- Forget to exclude .env files from sync operations
