// Fetches and parses a page into structured data for all analyzers
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

export async function crawlPage(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; EnterpriseSEO-MCP/1.0)',
    },
    timeout: 15000,
  });

  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  // Remove script/style noise
  $('script, style, noscript').remove();

  const title = $('title').text().trim();
  const metaDesc = $('meta[name="description"]').attr('content') || '';
  const canonical = $('link[rel="canonical"]').attr('href') || '';
  const h1 = $('h1').first().text().replace(/\s+/g, ' ').trim();
  const h2s = $('h2').map((_, el) => $(el).text().replace(/\s+/g, ' ').trim()).get();
  const h3s = $('h3').map((_, el) => $(el).text().replace(/\s+/g, ' ').trim()).get();

  // All paragraphs for subchunk analysis
  const paragraphs = $('p').map((_, el) => $(el).text().replace(/\s+/g, ' ').trim()).get().filter(p => p.length > 50);

  // Internal vs external links
  const allLinks = $('a[href]').map((_, el) => $(el).attr('href')).get();
  const host = new URL(url).hostname;
  const internalLinks = allLinks.filter(h => h.startsWith('/') || (h.startsWith('http') && h.includes(host)));
  const externalLinks = allLinks.filter(h => h.startsWith('http') && !h.includes(host));

  // Images
  const images = $('img').map((_, el) => ({ src: $(el).attr('src'), alt: $(el).attr('alt') })).get();
  const imagesMissingAlt = images.filter(i => !i.alt || i.alt.trim() === '').length;

  // Schema
  const schemas = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try { schemas.push(JSON.parse($(el).html())); } catch (_) {}
  });

  // Author signals
  const bodyText = $('body').text().replace(/\s+/g, ' ');
  const authorSignals = {
    hasAuthorTag: $('[rel="author"], .author, [itemprop="author"]').length > 0,
    hasByline: /by\s+[A-Z][a-z]+\s+[A-Z][a-z]+/.test(bodyText),
    hasExpertCredentials: /years? of experience|certified|expert|specialist/i.test(bodyText),
  };

  // OG tags
  const ogTags = {};
  $('meta[property^="og:"]').each((_, el) => {
    ogTags[$(el).attr('property')] = $(el).attr('content');
  });

  // Raw word count
  const wordCount = bodyText.split(/\s+/).filter(Boolean).length;

  return {
    url, title, metaDesc, canonical, h1, h2s, h3s, paragraphs,
    internalLinks: internalLinks.length, externalLinks: externalLinks.length,
    externalLinkUrls: externalLinks.slice(0, 20),
    images: images.length, imagesMissingAlt,
    schemas, authorSignals, ogTags, wordCount, bodyText,
  };
}
