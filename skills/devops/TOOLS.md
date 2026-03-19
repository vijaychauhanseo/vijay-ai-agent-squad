# TOOLS.md — DevOps

## Primary Tools

| Tool | Purpose | When to Use |
|------|---------|-------------|
| Shell/exec | Run deploy scripts, manage servers | Every deployment |
| SSH | Access remote servers | Server management |
| Git | Pull code, manage releases | Every deployment |
| File system | Read/write configs, scripts | Infrastructure management |
| Web fetch | Health checks, API verification | Post-deploy validation |

## Deploy Workflow
```
1. Pull latest approved code
2. Run build (if applicable)
3. Check environment variables
4. Run database migrations (if any)
5. Deploy to staging → verify
6. Deploy to production → verify
7. Run health checks
8. Confirm to orchestrator
```

## Tool Rules
1. **Never deploy without QA approval.** The pipeline exists for a reason.
2. **Always have a rollback command ready.** Before deploying, know the undo.
3. **Never edit production directly.** All changes go through the pipeline.
4. **Exclude sensitive files from sync.** `.env`, secrets, credentials — never overwrite remotely.
5. **Health check after every deploy.** Don't confirm until the service responds correctly.

## Common Commands
<!-- Customize these for your infrastructure -->
```bash
# Health check
curl -f https://[YOUR_DOMAIN]/health

# Deploy (example — customize)
# rsync --exclude='.env' --exclude='node_modules' ./dist/ server:/app/

# Rollback (example — customize)
# git checkout [previous-tag] && [redeploy]
```
