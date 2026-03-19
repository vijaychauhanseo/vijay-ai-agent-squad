import { crawlPage } from '../analyzers/crawler.js';
import { analyzeIntent } from '../analyzers/intent-matcher.js';
import { scanSubchunks } from '../analyzers/subchunk-scanner.js';

export const tool = {
  name: 'navboost_optimizer',
  description: 'Audit a page for NavBoost signal optimization. NavBoost is Google\'s confirmed click/interaction ranking system (from the 2024 Leak). Checks title intent match, meta description CTR score, Unicode manipulation, internal link PageRank dilution, and content satisfaction prediction.',
  inputSchema: {
    type: 'object',
    properties: {
      url: { type: 'string', description: 'Full URL of the page to audit' },
      keyword: { type: 'string', description: 'Target keyword (used for intent match analysis)' },
    },
    required: ['url', 'keyword'],
  },
  async handler({ url, keyword }) {
    const data = await crawlPage(url);
    const intent = analyzeIntent(keyword, data.title, data.metaDesc);
    const subchunks = scanSubchunks(data.paragraphs);

    // PageRank dilution
    const linkCount = data.internalLinks;
    const dilutionRisk = linkCount > 300 ? 'CRITICAL'
      : linkCount > 150 ? 'HIGH'
      : linkCount > 80 ? 'MEDIUM' : 'LOW';

    // OG image check (social NavBoost)
    const ogImage = data.ogTags['og:image'] || '';
    const ogImageIsTiny = /[?&](h|w)=\d{1,3}(&|$)/.test(ogImage) ||
      /logo|icon|favicon/i.test(ogImage);

    // OG site name check
    const ogSiteName = data.ogTags['og:site_name'] || '';
    const ogSiteNameIsUrl = ogSiteName.startsWith('http');

    const issues = [...intent.issues];
    const warnings = [...intent.warnings];

    if (dilutionRisk === 'CRITICAL' || dilutionRisk === 'HIGH') {
      issues.push(`PageRank dilution: ${linkCount} internal links on one page — each link passes ~${(100 / linkCount).toFixed(1)}% of page authority. Prune to <100 relevant links.`);
    }
    if (ogImageIsTiny) {
      issues.push(`OG image is tiny/logo (${ogImage.slice(-50)}) — social shares show a thumbnail, not a hero image. Kills social-driven NavBoost signals.`);
    }
    if (ogSiteNameIsUrl) {
      warnings.push(`og:site_name is a URL ("${ogSiteName}") not a brand name — template bug affecting all pages`);
    }

    // Satisfaction prediction
    const satisfactionScore = Math.round(
      (intent.ctr_score * 0.4) +
      ((100 - subchunks.filler_count * 10) * 0.3) +
      ((dilutionRisk === 'LOW' ? 100 : dilutionRisk === 'MEDIUM' ? 70 : dilutionRisk === 'HIGH' ? 40 : 20) * 0.3)
    );

    return {
      url,
      keyword,
      navboost_risk: intent.navboost_risk,
      ctr_score: intent.ctr_score,
      satisfaction_score: Math.max(0, Math.min(satisfactionScore, 100)),
      query_intent: intent.query_intent,
      pagerank_dilution: {
        internal_link_count: linkCount,
        risk: dilutionRisk,
        recommendation: linkCount > 150
          ? `Reduce internal links from ${linkCount} to <100 — move navigation/related links to lazy-loaded components`
          : 'Internal link count is acceptable',
      },
      social_navboost: {
        og_image_ok: !ogImageIsTiny,
        og_site_name_ok: !ogSiteNameIsUrl,
        risk: ogImageIsTiny ? 'HIGH — tiny logo kills social CTR' : 'LOW',
      },
      title_meta_issues: issues,
      warnings,
      suggested_title_format: intent.suggested_title_format,
      top_fixes: issues.slice(0, 4),
    };
  },
};
