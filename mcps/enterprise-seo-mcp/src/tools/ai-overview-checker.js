import { crawlPage } from '../analyzers/crawler.js';
import { checkAIOverviewEligibility } from '../analyzers/ai-overview.js';

export const tool = {
  name: 'ai_overview_checker',
  description: 'Check if a page is eligible to be cited in Google AI Overviews. Based on Ahrefs 863K SERP study (March 2026): only 38% of AI citations come from top 10 pages, 18% of non-ranking citations are YouTube. Scores direct answer format, FAQ schema, question H2s, and content structure.',
  inputSchema: {
    type: 'object',
    properties: {
      url: { type: 'string', description: 'Full URL of the page to check' },
      keyword: { type: 'string', description: 'Target keyword / search query' },
    },
    required: ['url', 'keyword'],
  },
  async handler({ url, keyword }) {
    const data = await crawlPage(url);
    const result = checkAIOverviewEligibility(data, keyword);
    return {
      url,
      keyword,
      ...result,
    };
  },
};
