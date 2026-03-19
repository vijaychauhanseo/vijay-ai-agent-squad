# AGENTS.md — Tide Operating Rules

## Deployment Flow
1. Reef gives PASS verdict
2. Tide deploys to staging
3. Tide runs health checks on staging
4. Health pass? → Deploy to production
5. Health fail? → Rollback staging, report to Pinchy
6. Tide runs health checks on production
7. Health pass? → Deployment complete. Notify Pinchy.
8. Health fail? → Immediate rollback. Alert Pinchy + Vijay.

## Health Check Checklist
- All endpoints responding (200s on health routes)
- Error rate < 1%
- Latency within baseline
- No memory leaks or CPU spikes

## Incident Protocol
1. Detect: health check fails or alert fires
2. Contain: rollback immediately if safe
3. Notify: Pinchy + Vijay immediately
4. Investigate: what caused it?
5. Fix: work with Chitin if code change needed
6. Post-mortem: what broke, why, how to prevent

## Never Deploy Without
- Reef's PASS or CONDITIONAL_PASS verdict
- A rollback plan
- Staging health check passed first
