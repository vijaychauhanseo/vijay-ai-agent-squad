// Detects intent mismatch between title/meta and the target keyword
// Based on NavBoost: intent mismatch = bad clicks = ranking suppression

const INTENT_SIGNALS = {
  informational: {
    query: ['how to', 'what is', 'why does', 'guide', 'tutorial', 'tips', 'examples', 'things to do', 'best', 'top', 'ideas'],
    title: ['guide', 'how to', 'tutorial', 'tips', 'examples', 'complete', 'ultimate', 'best', 'top'],
    bad_in_title: ['book now', 'buy', 'shop', 'order', 'deals', '% off', 'discount', 'price', '₹', '$', '£', '€'],
  },
  transactional: {
    query: ['buy', 'book', 'order', 'purchase', 'price', 'deal', 'cheap', 'affordable', 'packages', 'tour packages'],
    title: ['book', 'buy', 'order', 'deal', 'price', 'package', 'affordable', 'lowest'],
    bad_in_title: [],
  },
  commercial: {
    query: ['best', 'review', 'vs', 'compare', 'alternative', 'top', 'recommended'],
    title: ['best', 'review', 'comparison', 'vs', 'top', 'rated'],
    bad_in_title: ['book now', '% off'],
  },
  navigational: {
    query: ['login', 'website', 'official', 'contact', 'about'],
    title: [],
    bad_in_title: [],
  },
};

// Detect Unicode manipulation (bold math chars, etc.)
function detectUnicodeManipulation(text) {
  // Unicode bold/italic math chars range: 𝐀-𝒛, 𝘼-𝙯
  return /[\u{1D400}-\u{1D7FF}]/u.test(text);
}

function detectIntent(text) {
  const lower = text.toLowerCase();
  const scores = {};
  for (const [intent, signals] of Object.entries(INTENT_SIGNALS)) {
    scores[intent] = signals.query.filter(s => lower.includes(s)).length;
  }
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

export function analyzeIntent(keyword, title, metaDesc) {
  const queryIntent = detectIntent(keyword);
  const titleLower = title.toLowerCase();
  const issues = [];
  const warnings = [];

  // Check for Unicode manipulation
  if (detectUnicodeManipulation(title)) {
    issues.push('Unicode character manipulation detected in title (bold/italic math chars) — Google spam signal');
  }

  // Check hardcoded price in title
  if (/[@₹$£€]\s*[\d,]+/.test(title)) {
    issues.push('Hardcoded price in title — will become stale, creates trust issues');
  }

  // Check intent mismatch
  const badSignals = INTENT_SIGNALS[queryIntent]?.bad_in_title || [];
  const foundBad = badSignals.filter(s => titleLower.includes(s.toLowerCase()));
  if (foundBad.length > 0) {
    issues.push(`Intent mismatch: "${keyword}" is ${queryIntent} intent but title contains transactional signals: [${foundBad.join(', ')}] → predicts high bad-click rate (NavBoost penalty)`);
  }

  // Title length check
  if (title.length > 60) warnings.push(`Title is ${title.length} chars — Google truncates at ~60. Rewrite to fit`);
  if (title.length < 30) warnings.push('Title too short — missing keyword context');

  // Meta description checks
  if (/<[^>]+>/.test(metaDesc)) {
    issues.push('Raw HTML tags in meta description — template rendering bug, shows to users in SERP');
  }
  if (metaDesc.length > 160) warnings.push(`Meta description ${metaDesc.length} chars — truncated in SERPs at ~155`);
  if (metaDesc.length < 50) warnings.push('Meta description too short — missing click-through opportunity');

  // CTR score (0-100)
  const ctrPenalties = issues.length * 20 + warnings.length * 5;
  const ctrScore = Math.max(0, 100 - ctrPenalties);

  return {
    query_intent: queryIntent,
    ctr_score: ctrScore,
    navboost_risk: ctrScore < 50 ? 'HIGH' : ctrScore < 75 ? 'MEDIUM' : 'LOW',
    issues,
    warnings,
    title_length: title.length,
    meta_length: metaDesc.length,
    suggested_title_format: queryIntent === 'informational'
      ? `"[Number] Best [Topic] + Year" or "[Topic]: The Complete Guide [Year]"`
      : queryIntent === 'transactional'
      ? `"[Topic] Packages | [Brand] — Book [Destination] Tours"`
      : `"Best [Topic] [Year] | Reviewed & Compared"`,
  };
}
