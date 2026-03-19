---
source: https://www.hobo-web.co.uk/navboost-how-google-uses-large-scale-user-interaction-data-to-rank-websites/
title: Navboost: How User Interactions Rank Websites In Google
scraped: 2026-03-18
tags: navboost, user signals, click data, ranking factors, google leak, user interaction, CTR
---

## Core Concept
Navboost is Google's large-scale user interaction data system that uses aggregated click signals to directly influence search rankings — redefining relevance from inferred (links/content) to observed (actual user behaviour).

## Key Takeaways
- Navboost stores and processes click data at massive scale — it's not a minor signal, it's a core ranking input
- Clicks are collected, anonymised, and aggregated — individual clicks don't move rankings, patterns do
- Good clicks (long dwell time, no pogo-sticking) push rankings up; bad clicks (quick returns to SERP) push them down
- Navboost data feeds into the CRAPS protocol buffer — which tracks click quality at document level
- The system also powers the SERP as a whole through "Glue" — adjacent results influence each other
- Historical click data (stored for up to 13 months) means past performance has compounding effects
- User satisfaction is now the primary ranking signal — content must genuinely satisfy intent, not just match keywords
- Navboost explains why new pages struggle: they have no click history, so Google relies on other signals temporarily

## Frameworks/Methods Covered
- **NavBoost architecture**: Click collection → anonymisation → aggregation → ranking adjustment loop
- **CRAPS data**: The per-document protocol buffer that stores click quality metrics (good clicks, bad clicks, last longest clicks)
- **Glue system**: How NavBoost extends beyond individual pages to whole-SERP quality assessment
- **Click Signal Economy**: Differentiation between raw clicks vs. quality clicks (lastLongestClicks, goodClicks, badClicks, unsquashedClicks)
- **Privacy model**: How Google anonymises user data before incorporating into NavBoost

## Data/Stats
- Word count: 8,698
- 10 major sections covering genesis, architecture, signal economy, privacy, limitations, and strategy
- 99 external reference links — highly cited piece
- Navboost data window: up to 13 months of historical click data retained

## How The Team Should Use This
- **Coral (SEO)**: Optimise page titles and meta descriptions for CTR — these are the first click signals. A higher CTR = more NavBoost data = positive ranking spiral
- **Plankton (Writer)**: Write content that satisfies intent fully — the "last longest click" signal means users must not need to return to SERP after reading your page
- **Charles (Social)**: Social traffic that clicks through and engages helps build NavBoost signals even from non-organic sources (Chrome data feeds in)
- **Current (Marketing)**: Brand awareness campaigns increase direct navigational clicks — the strongest positive NavBoost signal there is
- **Key insight for @learnaiwithvijay**: Every piece of content should target a specific intent so completely that no user needs to go back to Google
