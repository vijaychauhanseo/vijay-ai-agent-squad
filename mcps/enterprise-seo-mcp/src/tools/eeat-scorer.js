import { crawlPage } from '../analyzers/crawler.js';
import { scoreEEAT } from '../analyzers/eeat.js';

export const tool = {
  name: 'eeat_scorer',
  description: 'Score a page against Google\'s E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) framework. Applies Quality Rater Guidelines including YMYL detection. Returns scored breakdown with specific fixes.',
  inputSchema: {
    type: 'object',
    properties: {
      url: { type: 'string', description: 'Full URL of the page to audit' },
    },
    required: ['url'],
  },
  async handler({ url }) {
    const data = await crawlPage(url);
    const result = scoreEEAT(data);
    return {
      url,
      ...result,
    };
  },
};
