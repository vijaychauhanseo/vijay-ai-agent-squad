// Fetches trending AI topics from RSS feeds
const Parser = require('rss-parser');
const { rssFeeds } = require('./config');

const parser = new Parser({ timeout: 10000 });

async function fetchFeed(url) {
  try {
    const feed = await parser.parseURL(url);
    return feed.items.slice(0, 5).map(item => ({
      title: item.title || '',
      summary: item.contentSnippet || item.content || '',
      link: item.link || '',
      date: item.pubDate || item.isoDate || '',
      source: new URL(url).hostname,
    }));
  } catch (e) {
    console.warn(`Feed failed (${url}): ${e.message}`);
    return [];
  }
}

async function getTrendingTopics() {
  console.log('📡 Fetching trending AI topics...');

  const results = await Promise.allSettled(rssFeeds.map(fetchFeed));
  const items = results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value);

  // Deduplicate by title similarity, take most recent 15
  const seen = new Set();
  const unique = items.filter(item => {
    const key = item.title.toLowerCase().slice(0, 40);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const top = unique.slice(0, 15);
  console.log(`  Found ${top.length} topics from ${rssFeeds.length} feeds`);
  return top;
}

module.exports = { getTrendingTopics };
