// AI Overview Eligibility Checker
// Based on: Ahrefs 38% study (863K SERPs) + Query Fan-Out framework
// Only 38% of AI Overview citations come from top 10 — 18% are YouTube

function hasDirectAnswerParagraph(h2s, paragraphs) {
  // Direct answers: short paragraph immediately after a question H2
  const questionH2s = h2s.filter(h => /\?$|^(what|how|why|when|where|who|which|can|is|are|does)\s/i.test(h));
  return questionH2s.length >= 3;
}

function hasFAQSchema(schemas) {
  return schemas.some(s =>
    s['@type'] === 'FAQPage' ||
    (Array.isArray(s['@type']) && s['@type'].includes('FAQPage'))
  );
}

function hasQuestionH2s(h2s) {
  return h2s.filter(h => /\?$/.test(h.trim()) || /^(what|how|why|when|where|who|which)\s/i.test(h)).length;
}

function hasStructuredAnswerFormat(paragraphs) {
  // Look for definition-style paragraphs: "[X] is a/an..."
  const definitionCount = paragraphs.filter(p => /^[A-Z][^.]{5,50} (is|are|refers to|means|can be defined as)/i.test(p)).length;
  return definitionCount >= 2;
}

export function checkAIOverviewEligibility(data, keyword) {
  const { h2s, paragraphs, schemas, wordCount, externalLinks, bodyText } = data;

  const checks = [];
  let score = 0;

  // Check 1: FAQ Schema (highest impact — +25pts)
  const hasFaq = hasFAQSchema(schemas);
  checks.push({
    check: 'FAQPage Schema',
    passed: hasFaq,
    impact: 25,
    detail: hasFaq
      ? 'FAQPage schema present — AI can parse Q&A structure'
      : 'No FAQPage schema — biggest blocker for AI Overview eligibility',
    fix: 'Add FAQPage schema to all question/answer sections',
  });
  if (hasFaq) score += 25;

  // Check 2: Question H2s (direct answer format)
  const questionH2Count = hasQuestionH2s(h2s);
  const hasQuestions = questionH2Count >= 3;
  checks.push({
    check: 'Question-format H2s',
    passed: hasQuestions,
    impact: 20,
    detail: `${questionH2Count} question-format H2s found — AI Overviews prefer Q&A structure`,
    fix: 'Restructure H2s as questions: "What is X?", "How does Y work?", "Why should you Z?"',
  });
  if (hasQuestions) score += 20;

  // Check 3: Direct answer paragraphs
  const hasDirect = hasDirectAnswerParagraph(h2s, paragraphs);
  checks.push({
    check: 'Direct answer paragraphs',
    passed: hasDirect,
    impact: 20,
    detail: hasDirect
      ? 'Direct answer format detected after question headings'
      : 'No direct answer format — answers buried in long paragraphs',
    fix: 'Add a 2-3 sentence direct answer immediately after each question H2 before elaborating',
  });
  if (hasDirect) score += 20;

  // Check 4: Definition-style content
  const hasDefinitions = hasStructuredAnswerFormat(paragraphs);
  checks.push({
    check: 'Definition-style sentences',
    passed: hasDefinitions,
    impact: 10,
    detail: hasDefinitions
      ? 'Definition-style sentences found — AI loves citable definitions'
      : 'No definition patterns — add clear definitions for key terms',
    fix: 'Add "[Keyword] is a/an..." style sentences for key concepts on the page',
  });
  if (hasDefinitions) score += 10;

  // Check 5: External citations (E-E-A-T for AI)
  const hasCitations = externalLinks >= 5;
  checks.push({
    check: 'External citations',
    passed: hasCitations,
    impact: 10,
    detail: `${externalLinks} external links — AI systems prefer citing authoritative, well-referenced sources`,
    fix: 'Add 5-10 citations to authoritative external sources (official bodies, research, major publications)',
  });
  if (hasCitations) score += 10;

  // Check 6: Content comprehensiveness (query fan-out coverage)
  const isComprehensive = wordCount >= 2000 && h2s.length >= 8;
  checks.push({
    check: 'Content comprehensiveness',
    passed: isComprehensive,
    impact: 15,
    detail: `${wordCount} words, ${h2s.length} H2s — AI Overviews cite comprehensive sources that cover the full topic cluster`,
    fix: wordCount < 2000
      ? 'Expand content to 2000+ words covering all sub-topics'
      : h2s.length < 8
      ? 'Add more H2 sections to cover the full semantic cluster'
      : 'Content depth is sufficient',
  });
  if (isComprehensive) score += 15;

  const eligible = score >= 60;
  const rating = score >= 75 ? 'HIGH' : score >= 50 ? 'MEDIUM' : score >= 30 ? 'LOW' : 'NOT ELIGIBLE';

  // YouTube opportunity
  const youtubeOpportunity = `18% of AI Overview citations (non-ranking pages) come from YouTube. A companion video for "${keyword}" could earn AI citations without needing to rank top 10.`;

  return {
    eligibility_score: score,
    rating,
    eligible,
    checks,
    youtube_opportunity: youtubeOpportunity,
    key_insight: `Only 38% of AI Overview citations come from top 10 pages (Ahrefs 2026, 863K SERPs). Score ${score}/100 — ${eligible ? 'this page CAN be cited' : 'significant fixes needed before AI citation is likely'}.`,
    quick_wins: checks
      .filter(c => !c.passed)
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 3)
      .map(c => `[+${c.impact}pts] ${c.fix}`),
  };
}
