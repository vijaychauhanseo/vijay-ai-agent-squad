// Full enterprise SEO audit — runs all 4 tools in parallel on one URL
import { crawlPage } from '../analyzers/crawler.js';
import { scoreEEAT } from '../analyzers/eeat.js';
import { analyzeTopicality } from '../analyzers/topicality.js';
import { scanSubchunks } from '../analyzers/subchunk-scanner.js';
import { analyzeIntent } from '../analyzers/intent-matcher.js';
import { checkAIOverviewEligibility } from '../analyzers/ai-overview.js';

export const tool = {
  name: 'full_seo_audit',
  description: 'Run a complete enterprise SEO audit: E-E-A-T scoring, T* Topicality analysis, NavBoost optimization, AI Overview eligibility, and subchunk quality scan — all in one call. Returns a prioritized fix list mapped to Google Leak signals.',
  inputSchema: {
    type: 'object',
    properties: {
      url: { type: 'string', description: 'Full URL to audit' },
      keyword: { type: 'string', description: 'Primary target keyword for this page' },
    },
    required: ['url', 'keyword'],
  },
  async handler({ url, keyword }) {
    // Single crawl — share data across all analyzers
    const data = await crawlPage(url);

    const [eeat, topicality, subchunks, intent, aiOverview] = await Promise.all([
      Promise.resolve(scoreEEAT(data)),
      Promise.resolve(analyzeTopicality(keyword, data.h1, data.h2s, data.paragraphs, data.wordCount)),
      Promise.resolve(scanSubchunks(data.paragraphs)),
      Promise.resolve(analyzeIntent(keyword, data.title, data.metaDesc)),
      Promise.resolve(checkAIOverviewEligibility(data, keyword)),
    ]);

    // Internal link dilution
    const linkDilution = data.internalLinks > 300 ? 'CRITICAL'
      : data.internalLinks > 150 ? 'HIGH'
      : data.internalLinks > 80 ? 'MEDIUM' : 'LOW';

    // Aggregate priority fixes across all modules
    const allFixes = [
      ...eeat.issues.map(i => ({ source: 'E-E-A-T', severity: 'HIGH', fix: i })),
      ...intent.issues.map(i => ({ source: 'NavBoost', severity: 'CRITICAL', fix: i })),
      ...topicality.recommendations.map(r => ({ source: 'Topicality', severity: 'MEDIUM', fix: r })),
      ...aiOverview.quick_wins.map(w => ({ source: 'AI Overview', severity: 'MEDIUM', fix: w })),
      ...(subchunks.risk === 'HIGH' ? [{
        source: 'Subchunk Quality',
        severity: 'HIGH',
        fix: `Remove ${subchunks.filler_count} filler + ${subchunks.ai_generated_count} AI-generated paragraphs`,
      }] : []),
      ...(linkDilution === 'CRITICAL' || linkDilution === 'HIGH' ? [{
        source: 'PageRank',
        severity: linkDilution,
        fix: `Reduce internal links from ${data.internalLinks} to <100 to concentrate PageRank`,
      }] : []),
    ];

    // Sort: CRITICAL → HIGH → MEDIUM
    const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    allFixes.sort((a, b) => (order[a.severity] ?? 3) - (order[b.severity] ?? 3));

    // Overall health score
    const healthScore = Math.round(
      eeat.overall_score * 0.25 +
      topicality.t_star_score * 0.25 +
      intent.ctr_score * 0.2 +
      aiOverview.eligibility_score * 0.15 +
      subchunks.score * 0.15
    );

    return {
      url,
      keyword,
      overall_health: healthScore,
      health_rating: healthScore >= 75 ? 'GOOD' : healthScore >= 50 ? 'NEEDS WORK' : 'POOR',
      summary: {
        eeat: `${eeat.overall_score}/100 (${eeat.rating})${eeat.ymyl ? ' [YMYL]' : ''}`,
        topicality: `T*: ${topicality.t_star_score}/100 (${topicality.t_star_rating})`,
        navboost: `CTR Score: ${intent.ctr_score}/100 | Risk: ${intent.navboost_risk}`,
        ai_overview: `${aiOverview.eligibility_score}/100 (${aiOverview.rating})`,
        subchunk_quality: `${subchunks.score}/100 | Risk: ${subchunks.risk}`,
        internal_links: `${data.internalLinks} links | Dilution: ${linkDilution}`,
      },
      page_stats: {
        word_count: data.wordCount,
        h2_count: data.h2s.length,
        internal_links: data.internalLinks,
        external_links: data.externalLinks,
        images_missing_alt: data.imagesMissingAlt,
        schema_types: data.schemas.map(s => s['@type']).filter(Boolean),
      },
      priority_fixes: allFixes.slice(0, 10),
      full_results: { eeat, topicality, subchunks, intent, aiOverview },
    };
  },
};
