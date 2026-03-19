// Sends carousel preview to Telegram and waits for yes/no approval
const https = require('https');
const fs = require('fs');
const { telegram } = require('./config');

const { botToken, chatId } = telegram;
const BASE = `https://api.telegram.org/bot${botToken}`;

function apiGet(method, params = {}) {
  return new Promise((resolve, reject) => {
    const qs = new URLSearchParams(params).toString();
    https.get(`${BASE}/${method}?${qs}`, (res) => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch(e) { resolve({}); } });
    }).on('error', reject);
  });
}

function sendMessage(text, parseMode = 'HTML') {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ chat_id: chatId, text, parse_mode: parseMode });
    const req = https.request({
      hostname: 'api.telegram.org',
      path: `/bot${botToken}/sendMessage`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, (res) => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch(e) { resolve({}); } });
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

function sendPhoto(imagePath, caption = '') {
  return new Promise((resolve, reject) => {
    const fileData = fs.readFileSync(imagePath);
    const boundary = 'boundary' + Date.now();
    const chatPart = `--${boundary}\r\nContent-Disposition: form-data; name="chat_id"\r\n\r\n${chatId}\r\n`;
    const capPart = caption ? `--${boundary}\r\nContent-Disposition: form-data; name="caption"\r\n\r\n${caption.slice(0, 1024)}\r\n` : '';
    const fileHeader = `--${boundary}\r\nContent-Disposition: form-data; name="photo"; filename="slide.png"\r\nContent-Type: image/png\r\n\r\n`;
    const closing = `\r\n--${boundary}--\r\n`;
    const headerBuf = Buffer.from(chatPart + capPart + fileHeader);
    const closingBuf = Buffer.from(closing);
    const totalSize = headerBuf.length + fileData.length + closingBuf.length;

    const req = https.request({
      hostname: 'api.telegram.org',
      path: `/bot${botToken}/sendPhoto`,
      method: 'POST',
      headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}`, 'Content-Length': totalSize }
    }, (res) => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch(e) { resolve({}); } });
    });
    req.on('error', reject);
    req.write(headerBuf); req.write(fileData); req.write(closingBuf); req.end();
  });
}

async function waitForApproval(timeoutMs = 30 * 60 * 1000) {
  // Get current update offset to only read new messages
  const initial = await apiGet('getUpdates', { limit: 1, offset: -1 });
  let offset = 0;
  if (initial.result && initial.result.length > 0) {
    offset = initial.result[initial.result.length - 1].update_id + 1;
  }

  console.log('  Waiting for your approval on Telegram...');
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 3000));
    const updates = await apiGet('getUpdates', { offset, timeout: 5, limit: 5 });
    if (!updates.result || updates.result.length === 0) continue;

    for (const update of updates.result) {
      offset = update.update_id + 1;
      const text = update.message?.text?.toLowerCase().trim();
      const fromId = String(update.message?.from?.id || update.message?.chat?.id || '');

      // Only accept from the allowed chat
      if (fromId !== chatId && String(update.message?.chat?.id) !== chatId) continue;

      if (text === 'yes' || text === 'y' || text === '✅' || text === 'post') {
        return true;
      }
      if (text === 'no' || text === 'n' || text === '❌' || text === 'skip') {
        return false;
      }
    }
  }

  // Timeout — auto-skip
  await sendMessage('⏰ No response in 30 min — skipping this post.');
  return false;
}

async function sendCarouselPreview(carousel, slideFiles) {
  console.log('📱 Sending preview to Telegram...');

  // Send topic + caption preview
  await sendMessage(
    `🎠 <b>New Carousel Ready for Review</b>\n\n` +
    `📌 <b>Topic:</b> ${carousel.topic}\n\n` +
    `📝 <b>Caption preview:</b>\n${carousel.caption.slice(0, 600)}...\n\n` +
    `Sending ${slideFiles.length} slide previews now...`
  );

  // Send first 3 slides as preview (avoid spamming all 10)
  const previewSlides = [slideFiles[0], slideFiles[1], slideFiles[slideFiles.length - 1]];
  for (let i = 0; i < previewSlides.length; i++) {
    await sendPhoto(previewSlides[i], i === 0 ? `Slide 1 (Hook)` : i === 1 ? 'Slide 2' : 'Slide 10 (CTA)');
    await new Promise(r => setTimeout(r, 500));
  }

  await sendMessage(
    `\n✅ Reply <b>YES</b> to post this to @learnaiwithvijay\n` +
    `❌ Reply <b>NO</b> to skip\n\n` +
    `⏰ Auto-skips in 30 minutes if no reply.`
  );
}

module.exports = { sendMessage, sendCarouselPreview, waitForApproval };
