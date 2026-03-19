#!/usr/bin/env node
/**
 * Carousel Bot — @learnaiwithvijay
 *
 * Runs once per invocation (triggered by system crontab 3x daily).
 * Flow: scrape → generate → render → Telegram preview → approval → post
 *
 * Schedule (set via crontab):
 *   9:00 AM IST  (3:30 AM UTC)
 *   1:00 PM IST  (7:30 AM UTC)
 *   6:00 PM IST  (12:30 PM UTC)
 *
 * Topic dedup: skips topics already posted today (tracked in /tmp/carousel-used-YYYY-MM-DD.txt)
 */

const fs = require('fs');
const path = require('path');
const { outputDir } = require('./config');
const { getTrendingTopics } = require('./scraper');
const { generateCarousel } = require('./generator');
const { renderCarousel } = require('./renderer');
const { sendMessage, sendCarouselPreview, waitForApproval } = require('./telegram');
const { postCarousel } = require('./poster');

fs.mkdirSync(outputDir, { recursive: true });

// ─── Daily topic dedup ────────────────────────────────────────────────────────
function getTodayLogPath() {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return `/tmp/carousel-used-${date}.txt`;
}

function loadUsedTopics() {
  const logPath = getTodayLogPath();
  if (!fs.existsSync(logPath)) return [];
  return fs.readFileSync(logPath, 'utf8').split('\n').filter(Boolean);
}

function saveUsedTopic(topic) {
  fs.appendFileSync(getTodayLogPath(), topic + '\n', 'utf8');
}

// ─── Main run ─────────────────────────────────────────────────────────────────
async function run() {
  const startTime = new Date().toISOString();
  console.log(`\n🚀 Carousel Bot started at ${startTime}`);

  try {
    // 1. Fetch trending topics
    const topics = await getTrendingTopics();
    if (topics.length === 0) {
      await sendMessage('⚠️ Carousel Bot: No trending topics found today. Skipping.');
      return;
    }

    // 2. Load already-used topics today to avoid duplicates
    const usedTopics = loadUsedTopics();
    if (usedTopics.length > 0) {
      console.log(`  ℹ️  Already posted today: ${usedTopics.length} topic(s) — will skip those`);
    }

    // 3. Generate carousel content (excluding today's already-used topics)
    const carousel = await generateCarousel(topics, usedTopics);

    // 4. Render slides
    const { files: slideFiles, sessionDir } = renderCarousel(carousel);

    // 5. Send to Telegram for review
    await sendCarouselPreview(carousel, slideFiles);

    // 6. Wait for approval (30 min timeout)
    const approved = await waitForApproval();

    if (!approved) {
      console.log('  ❌ Not approved — skipping post.');
      await sendMessage('❌ Skipped. Next post scheduled later today.');
      return;
    }

    // 7. Post to Instagram
    console.log('  ✅ Approved! Posting to Instagram...');
    await sendMessage('✅ Approved! Posting to @learnaiwithvijay now...');

    const postId = await postCarousel(carousel, slideFiles, sessionDir);

    // 8. Log topic as used so next run picks a different story
    saveUsedTopic(carousel.topic);

    await sendMessage(
      `🎉 Posted! Post ID: ${postId}\n\n` +
      `📌 Topic: ${carousel.topic}\n\n` +
      `Check it live: https://www.instagram.com/learnaiwithvijay/`
    );

    console.log(`\n✅ Done! Post ID: ${postId}`);

  } catch (err) {
    console.error('❌ Carousel Bot error:', err.message);
    try {
      await sendMessage(`❌ Carousel Bot error:\n${err.message}`);
    } catch (_) {}
    process.exit(1);
  }
}

run();
