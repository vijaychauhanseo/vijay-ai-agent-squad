# Vijay's AI Agent Squad

A full AI agent system built on Claude Code — 13 specialist agents, custom MCP servers, and automation tools for SEO, content, social media, and marketing.

Built by [Vijay Chauhan](https://www.linkedin.com/in/vijaychauhanseo/) — Enterprise SEO Consultant & AI Researcher.

---

## What's Inside

### 🤖 Agent Skills (`/skills`)
13 specialist agent personas for Claude Code. Each agent has a defined role, voice, authority level, and toolset.

| Agent | Role |
|-------|------|
| Coral | SEO Specialist |
| Chitin | Developer |
| Plankton | Content Writer |
| Charles | Social Media Manager |
| Barnacle | Code Reviewer |
| Reef | QA Engineer |
| Kelp | Researcher |
| Tide | DevOps |
| Current | Marketing/Growth |
| Urchin | Operations |
| Krill | Finance |
| Anemone | Customer Support |
| Emily | Head of Graphic Design |

### 🔧 MCP Servers (`/mcps`)

#### `enterprise-seo-mcp`
Enterprise-level SEO auditing MCP built on the Google Content Warehouse API Leak signals.

**5 tools:**
- `eeat_scorer` — E-E-A-T scoring mapped to Google Quality Rater Guidelines
- `topicality_analyzer` — T* score (Aboutness + Breadth + Coherence) from the Google Leak
- `navboost_optimizer` — NavBoost signal optimization (CTR, intent match, PageRank dilution)
- `ai_overview_checker` — AI Overview eligibility based on Ahrefs 863K SERP study
- `full_seo_audit` — All 4 tools in one call, single crawl, prioritized fix list

### 🎠 Agents (`/agents`)

#### `carousel-bot`
Automated Instagram carousel generator. Scrapes trending tech topics, generates AI-written content, renders slides with ImageMagick, and posts to Instagram via the Meta Graph API.

**Stack:** Node.js, Claude API, ImageMagick, imgbb, Meta Graph API v19.0

---

## Setup

### Agent Skills
Copy the `/skills` folder to `~/.claude/skills/` and invoke with `/skill-name` in Claude Code.

### Enterprise SEO MCP
```bash
cd mcps/enterprise-seo-mcp
npm install
```

Add to your `claude_desktop_config.json`:
```json
"enterprise-seo-mcp": {
  "command": "node",
  "args": ["/path/to/mcps/enterprise-seo-mcp/src/index.js"]
}
```

### Carousel Bot
```bash
cd agents/carousel-bot
npm install
cp .env.example .env
# Fill in your API keys in .env
node index.js --now
```

---

## Usage Examples

**Run a full SEO audit:**
```
Invoke full_seo_audit with url="https://yoursite.com/page" keyword="target keyword"
```

**Activate an agent skill:**
```
/seo     → activates Coral (SEO Specialist)
/developer → activates Chitin (Developer)
/writer  → activates Plankton (Content Writer)
```

---

## Requirements
- [Claude Code](https://claude.ai/claude-code)
- Node.js v18+
- ImageMagick (for carousel-bot)
- Meta Developer App (for carousel-bot Instagram posting)
- Anthropic API key

---

## Author
**Vijay Chauhan** — Enterprise SEO Consultant & AI Researcher
- LinkedIn: [vijaychauhanseo](https://www.linkedin.com/in/vijaychauhanseo/)
- Built with Claude Code
