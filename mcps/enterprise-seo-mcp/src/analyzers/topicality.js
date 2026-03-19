// T* Topicality Analyzer — based on Google Leak Site Radius + Site Focus Score
// ABC framework: Aboutness + Breadth + Coherence

// Known off-topic section patterns for travel/ecommerce/general sites
const OFF_TOPIC_PATTERNS = [
  /best domestic packages/i,
  /best international packages/i,
  /popular related destinations/i,
  /more things to do in/i,
  /trending destinations/i,
  /you may also like/i,
  /related articles/i,
  /footer/i,
];

// Query fan-out: common sub-topic clusters per vertical
const QUERY_FAN_OUT = {
  'things to do': ['romantic', 'free', 'adventure', 'kids', 'nightlife', 'beaches', 'indoor', 'outdoor', 'unique', 'hidden gems'],
  'tour packages': ['honeymoon', 'family', 'solo', 'budget', 'luxury', 'group', 'weekend', 'itinerary', 'best time', 'visa'],
  'ai tools': ['free', 'paid', 'for beginners', 'for business', 'for writing', 'for coding', 'alternatives', 'comparison', 'best', 'review'],
  'seo': ['on-page', 'off-page', 'technical', 'local', 'tools', 'audit', 'strategy', 'beginner', 'advanced', 'checklist'],
};

function detectFanOutCluster(keyword) {
  const lower = keyword.toLowerCase();
  for (const [cluster, subtopics] of Object.entries(QUERY_FAN_OUT)) {
    if (lower.includes(cluster)) return { cluster, subtopics };
  }
  // Generic fallback
  return {
    cluster: keyword,
    subtopics: ['what is', 'how to', 'best', 'guide', 'examples', 'tips', 'tools', 'cost', 'benefits', 'comparison'],
  };
}

export function analyzeTopicality(keyword, h1, h2s, paragraphs, wordCount) {
  const fanOut = detectFanOutCluster(keyword);
  const allText = [h1, ...h2s].join(' ').toLowerCase();
  const paraText = paragraphs.join(' ').toLowerCase();

  // ABOUTNESS: Does H1 + title clearly signal the primary topic?
  const keywordWords = keyword.toLowerCase().split(/\s+/);
  const h1Words = h1.toLowerCase();
  const aboutnessMatches = keywordWords.filter(w => h1Words.includes(w)).length;
  const aboutnessScore = Math.round((aboutnessMatches / keywordWords.length) * 100);

  // BREADTH: How many fan-out sub-topics does the content cover?
  const coveredSubtopics = fanOut.subtopics.filter(sub =>
    allText.includes(sub) || paraText.includes(sub)
  );
  const breadthScore = Math.round((coveredSubtopics.length / fanOut.subtopics.length) * 100);
  const missingSubs = fanOut.subtopics.filter(s => !coveredSubtopics.includes(s));

  // COHERENCE: Are there off-topic H2 sections diluting focus?
  const offTopicH2s = h2s.filter(h2 =>
    OFF_TOPIC_PATTERNS.some(p => p.test(h2))
  );
  const coherenceScore = Math.round(((h2s.length - offTopicH2s.length) / Math.max(h2s.length, 1)) * 100);

  // Overall T* score (weighted)
  const tStar = Math.round(aboutnessScore * 0.3 + breadthScore * 0.4 + coherenceScore * 0.3);

  // Content depth signal
  const avgWordsPerH2 = h2s.length > 0 ? Math.round(wordCount / h2s.length) : wordCount;
  const structureRisk = avgWordsPerH2 > 1200 ? 'HIGH — walls of text, poor subchunk structure'
    : avgWordsPerH2 > 800 ? 'MEDIUM — consider adding H3s to break sections'
    : 'LOW — well structured';

  return {
    t_star_score: tStar,
    t_star_rating: tStar >= 75 ? 'STRONG' : tStar >= 50 ? 'MODERATE' : 'WEAK',
    aboutness: {
      score: aboutnessScore,
      status: aboutnessScore >= 80 ? 'STRONG' : 'WEAK',
      detail: `H1 matches ${aboutnessMatches}/${keywordWords.length} keyword words`,
    },
    breadth: {
      score: breadthScore,
      covered_subtopics: coveredSubtopics,
      missing_subtopics: missingSubs,
      detail: `Covers ${coveredSubtopics.length}/${fanOut.subtopics.length} expected sub-topics for "${fanOut.cluster}"`,
    },
    coherence: {
      score: coherenceScore,
      off_topic_sections: offTopicH2s,
      detail: offTopicH2s.length > 0
        ? `${offTopicH2s.length} off-topic H2s diluting focus score: [${offTopicH2s.join(', ')}]`
        : 'No off-topic sections detected',
    },
    structure: {
      h2_count: h2s.length,
      avg_words_per_h2: avgWordsPerH2,
      risk: structureRisk,
    },
    recommendations: [
      ...(offTopicH2s.length > 0 ? [`Remove or relocate off-topic H2 sections: ${offTopicH2s.slice(0,3).join(', ')}`] : []),
      ...(missingSubs.length > 3 ? [`Add content covering missing sub-topics: ${missingSubs.slice(0,5).join(', ')}`] : []),
      ...(aboutnessScore < 70 ? [`Strengthen H1 to include full target keyword: "${keyword}"`] : []),
      ...(avgWordsPerH2 > 1000 ? ['Add H3 subheadings to break up long sections — improves subchunk quality signals'] : []),
    ],
  };
}
