import { crawlPage } from '../analyzers/crawler.js';
import { analyzeTopicality } from '../analyzers/topicality.js';
import { scanSubchunks } from '../analyzers/subchunk-scanner.js';

export const tool = {
  name: 'topicality_analyzer',
  description: 'Analyze page topicality using T* framework from the Google Content Warehouse Leak. Scores Aboutness, Breadth (query fan-out coverage), and Coherence (off-topic section detection). Also runs subchunk quality scan and detects keyword cannibalization signals.',
  inputSchema: {
    type: 'object',
    properties: {
      url: { type: 'string', description: 'Full URL of the page to analyze' },
      keyword: { type: 'string', description: 'Target keyword for this page (e.g. "things to do in dubai")' },
    },
    required: ['url', 'keyword'],
  },
  async handler({ url, keyword }) {
    const data = await crawlPage(url);
    const topicality = analyzeTopicality(keyword, data.h1, data.h2s, data.paragraphs, data.wordCount);
    const subchunks = scanSubchunks(data.paragraphs);

    return {
      url,
      keyword,
      word_count: data.wordCount,
      topicality,
      subchunk_quality: subchunks,
      combined_risk: topicality.t_star_score < 50 || subchunks.risk === 'HIGH' ? 'HIGH' : 'MEDIUM',
      summary: `T* Score: ${topicality.t_star_score}/100 (${topicality.t_star_rating}) | Subchunk quality: ${subchunks.risk} | ${topicality.recommendations.length} fixes recommended`,
    };
  },
};
