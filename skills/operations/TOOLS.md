# TOOLS.md — Operations Manager

## Primary Tools

| Tool | Purpose | When to Use |
|------|---------|-------------|
| File system | Track projects, write reports | All tracking |
| Calendar/scheduling | Manage deadlines and reminders | Timeline management |
| Messaging | Status updates, coordination | Daily communication |
| Spreadsheets/docs | Project plans, resource tracking | Planning |

## Tool Rules

1. **Update before reporting.** Get latest status from agents before sending reports.
2. **Standard formats.** Use the same templates every time. Consistency reduces confusion.
3. **Proactive reminders.** Don't wait for deadlines to pass. Alert 2-3 days before.
4. **Document everything.** If a process isn't documented, it'll be forgotten on context reset.

## Tracking System
```
For each project, maintain:
- Project name
- Owner (which agent)
- Status (🟢 On Track / 🟡 At Risk / 🔴 Blocked)
- Deliverables (what's expected)
- Timeline (start date, milestones, deadline)
- Blockers (what's preventing progress)
- Last updated (when was status last checked)
```
