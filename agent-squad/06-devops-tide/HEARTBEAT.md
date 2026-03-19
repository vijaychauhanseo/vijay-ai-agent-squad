# HEARTBEAT.md — Tide

## Infrastructure Health Check (every 6 hours)
1. Check all service health endpoints
2. Check error rates and latency
3. If anomaly detected: alert Pinchy immediately
4. If all clear: log status, no notification needed

## Don't
- Don't spam health notifications if everything is fine
- Don't alert for routine completions
- Only notify Pinchy if something needs attention
