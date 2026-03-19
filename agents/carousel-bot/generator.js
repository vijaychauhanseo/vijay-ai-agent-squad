// Uses Claude Code CLI to pick best topic + write 10-slide carousel content
const { execSync } = require('child_process');
const { brand } = require('./config');

async function generateCarousel(topics, excludeTopics = []) {
  console.log('🤖 Generating carousel with Claude Code...');

  const topicList = topics.map((t, i) => `${i + 1}. ${t.title} (${t.source})`).join('\n');

  const excludeBlock = excludeTopics.length > 0
    ? `\nALREADY USED TODAY — do NOT pick these:\n${excludeTopics.map(t => `- ${t}`).join('\n')}\n`
    : '';

  const prompt = `You are a viral Instagram content creator for ${brand.handle} — an AI education page targeting creators and tech professionals.

Here are today's trending AI topics:
${topicList}
${excludeBlock}
Pick the SINGLE most viral-worthy topic (that hasn't been used today) and create a 10-slide Instagram carousel.

CONTENT RULES:
- Write for saves and shares — every slide must deliver real value, not fluff
- Use specific numbers, real claims, and named sources. No vague statements.
- Be educational, not promotional
- Hook headline: MAX 8 words — must include a specific number OR a contrarian claim
- Content slide headlines: MAX 12 words each
- Content slide subtext: MAX 25 words each
- List items: MAX 8 words each

ACCENT COLOR:
- If the topic is data-heavy, factual, or technical: set accentColor to "cyan"
- If the topic is opinion, trend, prediction, or cultural: set accentColor to "purple"

SLIDE STRUCTURE (follow exactly):
- Slide 1: HOOK — stops the scroll. Max 8 words with a number or bold claim. subtext: ""
- Slide 2: STAT — the biggest, most shocking number from this story
- Slides 3–4: two different templates from [LIST, QUOTE, VS, INSIGHT] — no two the same in a row
- Slides 5–6: two different templates from [LIST, QUOTE, VS, INSIGHT] — no two the same in a row
- Slides 7–8: INSIGHT or LIST — slide 8 must be a single actionable takeaway
- Slide 9: CTA — restate the most shocking insight as a bold question (max 10 words). NOT "Save this." Make the reader think.
- Slide 10: FOLLOW — fixed text

TEMPLATE-SPECIFIC FIELDS:
STAT: requires "stat" (the number/value, e.g. "10x" or "$4.7B"), "statLabel" (short ALL-CAPS label, e.g. "FASTER THAN HUMANS"), "subtext" (1-line context, max 20 words)
LIST: requires "items" array of 3–5 strings, max 8 words each
VS: requires "leftLabel" (ALL-CAPS), "leftValue" (short), "rightLabel" (ALL-CAPS), "rightValue" (short) — plus headline and optional subtext
QUOTE: headline IS the quote (max 15 words), subtext is "— Source or Person"
INSIGHT: requires "headline" and "subtext" (standard layout)
CTA: requires "headline" (bold question, max 10 words) and "subtext" (1 short supporting line)
FOLLOW: headline and subtext are fixed

Return ONLY valid JSON, no explanation, no markdown fences:
{
  "topic": "the chosen topic headline",
  "accentColor": "cyan",
  "caption": "full Instagram caption with emojis and hashtags (max 2200 chars)",
  "slides": [
    { "slide": 1, "template": "HOOK", "headline": "HOOK TEXT MAX 8 WORDS", "subtext": "" },
    { "slide": 2, "template": "STAT", "headline": "context headline", "stat": "10x", "statLabel": "SPEED INCREASE", "subtext": "one line of context under the stat" },
    { "slide": 3, "template": "LIST", "headline": "List headline here", "items": ["Item one max 8 words", "Item two", "Item three", "Item four"] },
    { "slide": 4, "template": "QUOTE", "headline": "The actual quote max 15 words", "subtext": "— Source Name" },
    { "slide": 5, "template": "VS", "headline": "VS headline", "leftLabel": "OLD WAY", "leftValue": "3 days", "rightLabel": "WITH AI", "rightValue": "4 mins" },
    { "slide": 6, "template": "INSIGHT", "headline": "Insight headline", "subtext": "Supporting detail max 25 words" },
    { "slide": 7, "template": "LIST", "headline": "Another list headline", "items": ["Point one", "Point two", "Point three"] },
    { "slide": 8, "template": "INSIGHT", "headline": "Actionable takeaway headline", "subtext": "One clear thing to do or remember" },
    { "slide": 9, "template": "CTA", "headline": "Bold question max 10 words?", "subtext": "Short supporting line to prompt reflection" },
    { "slide": 10, "template": "FOLLOW", "headline": "Follow ${brand.handle}", "subtext": "Daily AI tools & insights" }
  ]
}`;

  // Write prompt to temp file to avoid shell escaping issues
  const tmpPrompt = '/tmp/carousel-prompt.txt';
  require('fs').writeFileSync(tmpPrompt, prompt, 'utf8');

  // Call claude CLI in print mode (non-interactive, no streaming UI)
  const raw = execSync(
    `claude --print --output-format text < "${tmpPrompt}"`,
    { encoding: 'utf8', timeout: 300000, maxBuffer: 1024 * 1024 }
  );

  // Extract JSON — claude may wrap in markdown fences
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Claude returned no valid JSON:\n' + raw.slice(0, 300));

  const carousel = JSON.parse(jsonMatch[0]);
  console.log(`  ✓ Topic: "${carousel.topic}"`);
  console.log(`  ✓ Accent: ${carousel.accentColor}`);
  console.log(`  ✓ ${carousel.slides.length} slides generated`);
  return carousel;
}

module.exports = { generateCarousel };
