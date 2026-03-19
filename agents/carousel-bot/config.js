const fs = require('fs');
const path = require('path');

// Load .env from parent directory
const envPath = path.join(__dirname, '..', '.env');
const env = fs.readFileSync(envPath, 'utf8');
const get = (key) => env.match(new RegExp(`${key}=(.+)`))?.[1]?.trim();

module.exports = {
  instagram: {
    accountId: get('INSTAGRAM_ACCOUNT_ID'),
    pageAccessToken: get('PAGE_ACCESS_TOKEN'),
    apiVersion: get('API_VERSION') || 'v19.0',
  },
  telegram: {
    botToken: get('TELEGRAM_BOT_TOKEN'),
    chatId: get('TELEGRAM_CHAT_ID'),
  },
  brand: {
    handle: '@learnaiwithvijay',
    bg: '#0D0D1A',
    purple: '#6C3CE1',
    green: '#00E5A0',
    white: '#FFFFFF',
    gray: '#888888',
    fontBold: '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
    fontBlack: '/System/Library/Fonts/Supplemental/Arial Black.ttf',
    fontReg: '/System/Library/Fonts/Supplemental/Arial.ttf',
  },
  outputDir: path.join(__dirname, 'output'),
  rssFeeds: [
    'https://techcrunch.com/category/artificial-intelligence/feed/',
    'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml',
    'https://feeds.feedburner.com/venturebeat/SZYF',
    'https://openai.com/blog/rss.xml',
  ],
};
