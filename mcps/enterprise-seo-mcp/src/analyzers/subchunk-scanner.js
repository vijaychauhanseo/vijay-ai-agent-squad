// Scans paragraphs for low-quality subchunk signals
// Based on Google Leak: QualityNsrPQData grades content at paragraph level

const FILLER_PATTERNS = [
  /in (this|the) (article|post|guide|blog)/i,
  /we (will|are going to) (discuss|cover|explore|look at)/i,
  /^(in conclusion|to summarize|to sum up|as you can see)/i,
  /without further ado/i,
  /^(so,? )?(let's|let us) (dive|get started|begin)/i,
  /it('s| is) (important|worth) (to )?(note|mention|know)/i,
  /\b(very|really|quite|basically|essentially|actually|literally)\b.*\b(very|really|quite|basically|essentially|actually|literally)\b/i,
];

const AI_GENERATED_PATTERNS = [
  /in today's (digital|fast-paced|modern) (world|age|era|landscape)/i,
  /when it comes to/i,
  /look no further/i,
  /in the realm of/i,
  /navigating the (complexities|challenges|landscape) of/i,
  /tailored to (your|their|our) (needs|requirements|preferences)/i,
  /seamless(ly)? (experience|integration|solution)/i,
  /leverage(ing)? (the power of|cutting-edge|state-of-the-art)/i,
  /delve into/i,
  /it's worth noting that/i,
  /as (an AI|a language model)/i,
];

export function scanSubchunks(paragraphs) {
  const issues = [];
  let fillerCount = 0;
  let aiCount = 0;
  let thinCount = 0;

  paragraphs.forEach((p, i) => {
    const wordCount = p.split(/\s+/).length;

    // Too thin
    if (wordCount < 20) {
      thinCount++;
      return;
    }

    // Filler patterns
    for (const pattern of FILLER_PATTERNS) {
      if (pattern.test(p)) {
        fillerCount++;
        issues.push({ index: i, type: 'filler', snippet: p.slice(0, 100) });
        break;
      }
    }

    // AI-generated patterns
    for (const pattern of AI_GENERATED_PATTERNS) {
      if (pattern.test(p)) {
        aiCount++;
        issues.push({ index: i, type: 'ai_generated', snippet: p.slice(0, 100) });
        break;
      }
    }
  });

  const total = paragraphs.length;
  const qualityRatio = total > 0 ? ((total - fillerCount - aiCount) / total) : 1;
  const score = Math.round(qualityRatio * 100);

  return {
    score,
    total_paragraphs: total,
    filler_count: fillerCount,
    ai_generated_count: aiCount,
    thin_count: thinCount,
    quality_ratio: `${Math.round(qualityRatio * 100)}%`,
    risk: score < 60 ? 'HIGH' : score < 80 ? 'MEDIUM' : 'LOW',
    issues: issues.slice(0, 10), // top 10 worst offenders
    recommendation: score < 70
      ? `Remove or rewrite ${fillerCount + aiCount} low-quality paragraphs to improve subchunk signals`
      : 'Subchunk quality is acceptable',
  };
}
