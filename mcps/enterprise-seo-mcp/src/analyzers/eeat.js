// E-E-A-T Scorer — maps to Google Quality Rater Guidelines Section 2.5.2
// YMYL pages scored at highest standard

const YMYL_VERTICALS = [
  'tour', 'travel', 'hotel', 'flight', 'book', 'insurance', 'health', 'medical',
  'finance', 'legal', 'investment', 'crypto', 'loan', 'mortgage', 'pharmacy',
];

function isYMYL(url, title) {
  const text = (url + ' ' + title).toLowerCase();
  return YMYL_VERTICALS.some(v => text.includes(v));
}

export function scoreEEAT(data) {
  const { url, title, h2s, paragraphs, schemas, authorSignals,
    externalLinks, externalLinkUrls, wordCount, ogTags, bodyText } = data;

  const ymyl = isYMYL(url, title);
  const scores = {};
  const issues = [];
  const strengths = [];

  // ── EXPERIENCE (E) ──────────────────────────────────────────
  let expScore = 0;
  if (authorSignals.hasAuthorTag) { expScore += 30; strengths.push('Author tag/byline present'); }
  else issues.push('[Experience] No author name or byline — who wrote this content?');

  if (authorSignals.hasExpertCredentials) { expScore += 30; strengths.push('Expert credentials mentioned'); }
  else issues.push('[Experience] No credentials/expertise signals (years of experience, certifications)');

  if (/first.hand|personal(ly)?|I (visited|tested|used|tried)|our team/i.test(bodyText)) {
    expScore += 40; strengths.push('First-hand experience language detected');
  } else {
    issues.push('[Experience] No first-hand experience signals — content reads as third-party compilation');
  }
  scores.experience = Math.min(expScore, 100);

  // ── EXPERTISE (E) ──────────────────────────────────────────
  let exptScore = 0;
  const authorSchema = schemas.find(s => s['@type'] === 'Person' || s['@type'] === 'Author');
  if (authorSchema) { exptScore += 40; strengths.push('Person/Author schema present'); }
  else issues.push('[Expertise] No Person/Author schema — Google cannot identify the content creator');

  if (wordCount > 2000) { exptScore += 20; }
  if (h2s.length >= 5) { exptScore += 20; strengths.push('Well-structured content with multiple H2s'); }
  if (externalLinks >= 5) { exptScore += 20; strengths.push(`${externalLinks} external citations — evidence of research`); }
  else issues.push(`[Expertise] Only ${externalLinks} external citations — experts cite their sources`);

  scores.expertise = Math.min(exptScore, 100);

  // ── AUTHORITATIVENESS (A) ──────────────────────────────────
  let authScore = 0;
  const orgSchema = schemas.find(s => s['@type'] === 'Organization');
  if (orgSchema) {
    authScore += 25;
    if (orgSchema.sameAs?.length > 0) { authScore += 15; strengths.push('Organization sameAs (social profiles) declared'); }
    strengths.push('Organization schema present');
  } else {
    issues.push('[Authoritativeness] No Organization schema — brand identity not declared to Google');
  }

  if (externalLinks >= 3) authScore += 20;
  if (/award|partner|certif|accredit|featured in|as seen|press/i.test(bodyText)) {
    authScore += 25; strengths.push('Authority signals (awards/press/partnerships) detected');
  } else {
    issues.push('[Authoritativeness] No awards, partnerships, or press mentions — missed authority signals');
  }

  const hasLinkedInOrPress = externalLinkUrls?.some(u =>
    /linkedin|crunchbase|forbes|techcrunch|bbc|guardian|nytimes/i.test(u)
  );
  if (hasLinkedInOrPress) { authScore += 15; strengths.push('Links to authoritative external sources'); }

  scores.authoritativeness = Math.min(authScore, 100);

  // ── TRUSTWORTHINESS (T) ──────────────────────────────────
  let trustScore = 50; // base trust for live, crawlable page

  if (/<[^>]+>/.test(data.metaDesc)) {
    trustScore -= 20; issues.push('[Trust] Raw HTML tags in meta description — technical sloppiness visible to users');
  }
  if (/[\u{1D400}-\u{1D7FF}]/u.test(title)) {
    trustScore -= 20; issues.push('[Trust] Unicode character manipulation in title — spam signal');
  }
  if (orgSchema?.contactPoint || /contact|support|help/i.test(bodyText)) {
    trustScore += 15; strengths.push('Contact information accessible');
  }
  if (schemas.find(s => s['@type'] === 'AggregateRating' || s['@type'] === 'Review')) {
    trustScore += 15; strengths.push('Review/rating schema present');
  }
  if (/privacy policy|terms of (service|use)|refund/i.test(bodyText)) {
    trustScore += 10; strengths.push('Legal/policy pages referenced');
  } else {
    issues.push('[Trust] No visible links to Privacy Policy, Terms, or Refund policy');
  }

  scores.trustworthiness = Math.max(0, Math.min(trustScore, 100));

  // ── FINAL SCORE ──────────────────────────────────────────
  const weights = ymyl
    ? { experience: 0.2, expertise: 0.25, authoritativeness: 0.25, trustworthiness: 0.3 }
    : { experience: 0.25, expertise: 0.3, authoritativeness: 0.25, trustworthiness: 0.2 };

  const overall = Math.round(
    scores.experience * weights.experience +
    scores.expertise * weights.expertise +
    scores.authoritativeness * weights.authoritativeness +
    scores.trustworthiness * weights.trustworthiness
  );

  const rating = overall >= 75 ? 'HIGH' : overall >= 50 ? 'MEDIUM' : overall >= 30 ? 'LOW' : 'VERY LOW';

  return {
    overall_score: overall,
    rating,
    ymyl: ymyl,
    ymyl_note: ymyl ? 'YMYL page — Google applies highest E-E-A-T scrutiny' : 'Non-YMYL page',
    scores,
    strengths,
    issues,
    priority_fixes: issues.slice(0, 5),
  };
}
