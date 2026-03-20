# Vijay's AI Agent Squad

> **Most people use AI as a chat tool. I built mine as an operating system.**

This is a full AI agent infrastructure — 13 specialist agents, enterprise-grade SEO MCP servers built on Google's leaked ranking signals, and automation tools that actually ship output. Everything runs inside Claude Code.

Built by **[Vijay Chauhan](https://www.linkedin.com/in/vijaychauhanseo/)** — Enterprise SEO Consultant & AI Researcher. Previously scaled SEO at AllEvents.in to 250M+ monthly users.

---

## The Idea

Most AI setups are one person talking to one chatbot.

This is different. I built a squad — each agent has a defined role, a distinct voice, a fixed scope of authority, and a toolset matched to its job. The orchestrator routes tasks. Specialists execute. Nothing ships without going through the pipeline.

It's how a real team works. Except it runs on Claude Code.

---

## What's Inside

### 🤖 13 Specialist Agent Skills (`/skills`)

Drop these into `~/.claude/skills/` and activate any agent with a `/command` in Claude Code.

| Command | Agent | Role |
|---------|-------|------|
| `/seo` | Coral 🔎 | SEO Specialist — keyword research, briefs, audits |
| `/developer` | Chitin 💻 | Developer — TDD, clean code, no shortcuts |
| `/writer` | Plankton ✍️ | Content Writer — reader-first, SEO-aware |
| `/charles` | Charles 📱 | Social Media Manager — platform-native content |
| `/reviewer` | Barnacle 🔍 | Code Reviewer — approve/reject gate |
| `/qa` | Reef 🎯 | QA Engineer — test before it ships |
| `/researcher` | Kelp 🔬 | Researcher — gather context, kill assumptions |
| `/devops` | Tide 🚀 | DevOps — deploy, monitor, rollback plan required |
| `/marketing` | Current 📈 | Marketing/Growth — distribution, not just content |
| `/operations` | Urchin 📊 | Operations — timelines, blockers, Green/Yellow/Red |
| `/finance` | Krill 💰 | Finance — invoices, budgets, double-checks the math |
| `/support` | Anemone 💬 | Customer Support — fast, empathetic, escalation-aware |
| `/emily` | Emily 🎨 | Head of Graphic Design — systems, not one-off assets |

Each agent has:
- A defined **scope** (what it does and doesn't do)
- An **authority table** (what it can act on vs. escalate)
- A **voice** that stays consistent across tasks
- **Pipeline position** (Dev → Review → QA → Deploy — no skipping)

---

### 🔧 Enterprise SEO MCP (`/mcps/enterprise-seo-mcp`)

An MCP server built directly on signals from the **2024 Google Content Warehouse API Leak** — the 14,000 ranking features that leaked from Google's internal codebase.

Not a generic SEO tool. This scores pages against Google's actual internal signal architecture.

**5 tools:**

| Tool | What It Does | Signal Source |
|------|-------------|---------------|
| `eeat_scorer` | E-E-A-T quality score mapped to Quality Rater Guidelines | Google QRG + YMYL detection |
| `topicality_analyzer` | T* score — Aboutness + Breadth + Coherence | Google Leak: `topicality` module |
| `navboost_optimizer` | CTR-intent gap analysis, PageRank dilution check | Google Leak: NavBoost / CRAPS signals |
| `ai_overview_checker` | AI Overview eligibility score | Ahrefs 863K SERP study findings |
| `full_seo_audit` | All 4 tools in one call, single crawl, prioritized fix list | Combined |

**Example output from a real audit:**
```
Site: example.com/category/singapore-tours
Keyword: singapore tours

NavBoost Score: 30/100
→ Unicode spam in body content detected (417 instances)
→ Raw HTML entities in meta description (&amp;, &ndash;)
→ Intent mismatch: title signals "tours" but content is category page
→ Internal link count: 429 (optimal: 100-150)

T* Topicality Score: 58/100
→ Aboutness: PASS — travel intent clear
→ Breadth: FAIL — 6 subtopic clusters missing
→ Coherence: WARN — template content diluting entity density
```

**Install:**
```bash
cd mcps/enterprise-seo-mcp
npm install
```

Add to `claude_desktop_config.json`:
```json
"enterprise-seo-mcp": {
  "command": "node",
  "args": ["/path/to/mcps/enterprise-seo-mcp/src/index.js"]
}
```

---

### 🎠 Automation Agents (`/agents`)

#### `carousel-bot`
Fully automated Instagram carousel pipeline. Runs on a cron, no hands required.

**Flow:** Scrape trending tech topics → Claude writes the content → ImageMagick renders slides → imgbb hosts images → Meta Graph API posts to Instagram.

**Stack:** Node.js, Claude API (claude-sonnet), ImageMagick, imgbb, Meta Graph API v19.0

```bash
cd agents/carousel-bot
npm install
cp .env.example .env
# Add your API keys
node index.js --now    # Post immediately
node index.js          # Run on schedule
```

---

### 🧠 SEO Knowledge Base (`/skills/seo/memory`)

Coral (the SEO agent) has a persistent knowledge base — 31 articles scraped and structured as agent memory:

- **22 Ahrefs studies** — AI Overview citations (863K SERPs), how long pages take to rank, enterprise SEO frameworks, E-E-A-T, link building, content strategy
- **9 Hobo Web deep-dives** — Google Leak decoded, NavBoost architecture, topical authority, CRAPS protocol, T* topicality scoring

When Coral runs an audit, she pulls from this knowledge base + real-time crawl data. The gap analysis is grounded in actual research, not guesses.

---

## Architecture

```
Claude Code
│
├── Orchestrator (you, in conversation)
│   └── Routes tasks via /skill-name commands
│
├── Skills Layer (~/.claude/skills/)
│   ├── /seo → Coral (SEO Specialist)
│   ├── /developer → Chitin (Developer)
│   └── ... 11 more specialists
│
├── MCP Servers (Claude Desktop config)
│   ├── enterprise-seo-mcp (Google Leak signals)
│   └── seo-mcp (GSC, GA4, crawling)
│
└── Agents (standalone automation)
    └── carousel-bot (Instagram pipeline)
```

---

## Setup

### 1. Agent Skills (5 minutes)

```bash
# Clone the repo
git clone https://github.com/vijaychauhanseo/vijay-ai-agent-squad.git

# Copy skills to Claude Code
cp -r vijay-ai-agent-squad/skills/* ~/.claude/skills/
```

Open Claude Code. Type `/seo` to activate Coral. Type `/developer` to activate Chitin.

### 2. Enterprise SEO MCP (10 minutes)

```bash
cd vijay-ai-agent-squad/mcps/enterprise-seo-mcp
npm install
```

Add to your `~/Library/Application Support/Claude/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "enterprise-seo-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/mcps/enterprise-seo-mcp/src/index.js"]
    }
  }
}
```

Restart Claude Desktop. The 5 SEO tools are now available in every conversation.

### 3. Carousel Bot

```bash
cd vijay-ai-agent-squad/agents/carousel-bot
npm install
cp .env.example .env
# Fill in: ANTHROPIC_API_KEY, INSTAGRAM_ACCOUNT_ID, PAGE_ACCESS_TOKEN, IMGBB_API_KEY
node index.js --now
```

---

## Usage Examples

**Full SEO audit using Google Leak signals:**
```
Invoke full_seo_audit with url="https://yoursite.com/page" keyword="target keyword"
```

**Run a T* topicality check:**
```
Invoke topicality_analyzer with url="https://yoursite.com/page" keyword="main topic"
```

**Check AI Overview eligibility:**
```
Invoke ai_overview_checker with url="https://yoursite.com/page" query="user search query"
```

**Activate an agent skill:**
```
/seo        → Coral writes a content brief, reviews page, audits technical issues
/developer  → Chitin writes code, TDD-first, no console.log left in PRs
/charles    → Charles writes platform-native social posts, not copy-paste reposts
```

---

## Requirements

- [Claude Code](https://claude.ai/claude-code)
- Node.js v18+
- ImageMagick (`brew install imagemagick` — carousel-bot only)
- Meta Developer App (carousel-bot Instagram posting)
- Anthropic API key

---

## What's Coming

8 more MCPs in the build queue:

- `schema-generator-mcp` — Auto-detect page type → generate ready-to-paste JSON-LD (FAQPage, Product, HowTo, Article, etc.)
- `competitor-intel-mcp` — SERP crawl, content gap finder, schema gap analysis, Share of Voice estimator
- `google-leak-mcp` — NSR analyzer, Site Focus Scorer, Firefly content abuse detector
- `geo-mcp` — Generative Engine Optimization: entity checker, AI mention tracker, brand reputation in LLMs
- `content-brief-mcp` — keyword → full brief, query fan-out expansion, featured snippet optimizer
- `internal-link-mcp` — orphan page finder, PageRank flow mapper, hub-spoke validator
- `programmatic-seo-mcp` — bulk thin content scanner (50 URLs), canonical strategy builder
- `link-building-mcp` — PR angle generator, statistics page finder, prospect enricher

---

## Author

**Vijay Chauhan** — Enterprise SEO Consultant & AI Researcher

Previously: SEO at AllEvents.in — scaled to 250M+ monthly users.
Now: consulting for large enterprise websites + reverse engineering how AI search systems work.

- LinkedIn: [vijaychauhanseo](https://www.linkedin.com/in/vijaychauhanseo/)
- Built entirely with [Claude Code](https://claude.ai/claude-code)

---

*At enterprise scale, SEO is not a marketing channel. It is infrastructure.*
