import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

import { tool as eeatScorer } from './tools/eeat-scorer.js';
import { tool as topicalityAnalyzer } from './tools/topicality-analyzer.js';
import { tool as navboostOptimizer } from './tools/navboost-optimizer.js';
import { tool as aiOverviewChecker } from './tools/ai-overview-checker.js';
import { tool as fullAudit } from './tools/full-audit.js';

const TOOLS = [eeatScorer, topicalityAnalyzer, navboostOptimizer, aiOverviewChecker, fullAudit];

const server = new Server(
  { name: 'enterprise-seo-mcp', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })),
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const tool = TOOLS.find(t => t.name === name);

  if (!tool) {
    return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
  }

  try {
    const result = await tool.handler(args);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (err) {
    return {
      content: [{ type: 'text', text: `Error running ${name}: ${err.message}` }],
      isError: true,
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
