// renderer.js — Emily's design system v2
// 1080x1350px | Inter font | Mesh gradients | Left-aligned editorial layout
// Text wrapping via caption:@file for all multi-word content
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { brand, outputDir } = require('./config');

const W    = 1080;
const H    = 1350;
const FONT = path.join(__dirname, 'Inter.ttf');
const TW   = 880;   // usable text width: 1080 - 120 (left pad) - 80 (right pad)

const C = {
  bg:       '#08080F',
  purple:   '#A855F7',
  cyan:     '#00D9FF',
  white:    '#FFFFFF',
  offWhite: '#E8E8F0',
  gray:     '#8888AA',
};

function esc(str = '') {
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/`/g, '\\`')
    .replace(/%/g, '%%')
    .replace(/&/g, '\\&')
    .replace(/@/g, '\\@');
}

function run(cmd) {
  execSync(cmd, { stdio: 'pipe', shell: '/bin/bash' });
}

// ─── Background cache ─────────────────────────────────────────────────────────
const _bgCache = {};

function makeBg(file, accent, variant, secondary) {
  const key = `${accent}-${secondary}-${variant}`;
  if (_bgCache[key] && fs.existsSync(_bgCache[key])) {
    fs.copyFileSync(_bgCache[key], file);
    return;
  }
  const b1x = variant === 0 ? 150  : 900;
  const b1y = variant === 0 ? 200  : 150;
  const b2x = variant === 0 ? 850  : 200;
  const b2y = variant === 0 ? 1100 : 1200;
  run(`magick \
    -size ${W}x${H} xc:"${C.bg}" \
    \\( -size ${W}x${H} xc:none -fill "${accent}55" \
       -draw "circle ${b1x},${b1y} ${b1x + 350},${b1y}" \
       -blur 0x80 \\) -composite \
    \\( -size ${W}x${H} xc:none -fill "${secondary}33" \
       -draw "circle ${b2x},${b2y} ${b2x + 280},${b2y}" \
       -blur 0x70 \\) -composite \
    "${file}"`);
  _bgCache[key] = file + '.cached.png';
  fs.copyFileSync(file, _bgCache[key]);
}

// ─── Word-wrapping text image via caption:@file ───────────────────────────────
// Creates a transparent PNG of exact dimensions with auto-wrapped text.
// height should be generously large — transparent space is invisible on composite.
function makeTxt(text, { size, weight = 400, fill, width, height, gravity = 'NorthWest', tmpBase }) {
  if (!text) return null;
  const txtFile = `${tmpBase}.cap.txt`;
  const imgFile = `${tmpBase}.cap.png`;
  fs.writeFileSync(txtFile, String(text), 'utf8');
  run(`magick \
    -background none \
    -gravity ${gravity} \
    -fill "${fill}" \
    -font "${FONT}" \
    -pointsize ${size} \
    -weight ${weight} \
    -size ${width}x${height} \
    caption:@"${txtFile}" \
    "${imgFile}"`);
  try { fs.unlinkSync(txtFile); } catch (_) {}
  return imgFile;
}

// Returns an ImageMagick composite fragment, or '' if imgFile is null
function comp(imgFile, x, y) {
  if (!imgFile) return '';
  return `\\( "${imgFile}" \\) -gravity NorthWest -geometry +${x}+${y} -composite`;
}

function cleanup(...files) {
  for (const f of files) {
    if (f) try { fs.unlinkSync(f); } catch (_) {}
  }
}

// ─── HOOK (Slide 1) ──────────────────────────────────────────────────────────
function renderHook(slide, outFile, accent, secondary) {
  const bg = outFile + '.bg.png';
  makeBg(bg, accent, 0, secondary);

  const headImg = makeTxt(slide.headline || '', {
    size: 110, weight: 800, fill: C.white,
    width: TW, height: 700, tmpBase: outFile + '.h',
  });

  run(`magick "${bg}" \
    -fill "${accent}" -draw "rectangle 80,120 92,${H - 120}" \
    -fill "${C.white}" -font "${FONT}" -pointsize 26 -kerning 6 \
      -gravity NorthWest -annotate +120+130 "01 / 10" \
    -gravity NorthWest \
    ${comp(headImg, 120, 215)} \
    -gravity NorthWest \
    -fill "${accent}" -draw "rectangle 120,${H - 180} 420,${H - 176}" \
    -fill "${C.offWhite}" -font "${FONT}" -pointsize 34 -weight 500 \
      -gravity NorthWest -annotate +120+${H - 165} "SWIPE TO LEARN →" \
    -fill "${C.gray}" -font "${FONT}" -pointsize 28 \
      -gravity SouthWest -annotate +120+50 "${esc(brand.handle)}" \
    "${outFile}"`);

  cleanup(bg, headImg);
}

// ─── STAT ─────────────────────────────────────────────────────────────────────
function renderStat(slide, outFile, accent, secondary) {
  const bg = outFile + '.bg.png';
  makeBg(bg, accent, slide.slide % 2, secondary);

  const subImg = makeTxt(slide.subtext || '', {
    size: 44, weight: 400, fill: C.offWhite,
    width: TW, height: 200, tmpBase: outFile + '.s',
  });

  run(`magick "${bg}" \
    -fill "${accent}" -draw "rectangle 80,100 96,${H - 100}" \
    -fill "${accent}" -font "${FONT}" -pointsize 22 -kerning 4 \
      -gravity NorthWest -annotate +120+110 "${slide.slide} / 10" \
    -fill "${C.gray}" -font "${FONT}" -pointsize 36 -weight 500 -kerning 3 \
      -gravity NorthWest -annotate +120+230 "${esc(slide.statLabel || '')}" \
    -fill "${C.white}" -font "${FONT}" -pointsize 200 -weight 900 \
      -gravity NorthWest -annotate +110+280 "${esc(slide.stat || '')}" \
    -fill "${accent}" -draw "rectangle 120,680 480,686" \
    -gravity NorthWest \
    ${comp(subImg, 120, 710)} \
    -gravity SouthWest \
    -fill "${C.gray}" -font "${FONT}" -pointsize 28 \
      -annotate +120+50 "${esc(brand.handle)}" \
    "${outFile}"`);

  cleanup(bg, subImg);
}

// ─── QUOTE ───────────────────────────────────────────────────────────────────
function renderQuote(slide, outFile, accent, secondary) {
  const bg = outFile + '.bg.png';
  makeBg(bg, accent, slide.slide % 2, secondary);

  const headImg = makeTxt(slide.headline || '', {
    size: 74, weight: 700, fill: C.white,
    width: TW, height: 480, tmpBase: outFile + '.h',
  });

  run(`magick "${bg}" \
    -fill "${accent}20" -font "${FONT}" -pointsize 500 -weight 900 \
      -gravity NorthWest -annotate +40+-60 "\u201c" \
    -fill "${accent}" -draw "rectangle 80,100 96,${H - 100}" \
    -fill "${accent}" -font "${FONT}" -pointsize 22 -kerning 4 \
      -gravity NorthWest -annotate +120+110 "${slide.slide} / 10" \
    -gravity NorthWest \
    ${comp(headImg, 120, 310)} \
    -gravity NorthWest \
    -fill "${accent}" -draw "rectangle 120,830 180,836" \
    -fill "${C.gray}" -font "${FONT}" -pointsize 40 -weight 400 \
      -gravity NorthWest -annotate +120+860 "${esc(slide.subtext || '')}" \
    -fill "${C.gray}" -font "${FONT}" -pointsize 28 \
      -gravity SouthWest -annotate +120+50 "${esc(brand.handle)}" \
    "${outFile}"`);

  cleanup(bg, headImg);
}

// ─── LIST ─────────────────────────────────────────────────────────────────────
function renderList(slide, outFile, accent, secondary) {
  const bg    = outFile + '.bg.png';
  makeBg(bg, accent, slide.slide % 2, secondary);

  const items   = (slide.items || []).slice(0, 5);
  const startY  = 335;
  const lineH   = 145;

  const headImg  = makeTxt(slide.headline || '', {
    size: 60, weight: 800, fill: C.white,
    width: TW, height: 150, tmpBase: outFile + '.h',
  });
  const itemImgs = items.map((item, i) =>
    makeTxt(item, {
      size: 46, weight: 500, fill: C.offWhite,
      width: TW - 100, height: 130, tmpBase: outFile + `.i${i}`,
    })
  );

  // Build as a flat string — no newlines (newlines in template literals break bash command)
  let itemParts = '';
  items.forEach((_, i) => {
    const y = startY + i * lineH;
    itemParts += ` -fill "${accent}" -font "${FONT}" -pointsize 52 -weight 900 -gravity NorthWest -annotate +120+${y} "${i + 1}." ${comp(itemImgs[i], 210, y + 5)}`;
  });

  run(`magick "${bg}" \
    -fill "${accent}" -draw "rectangle 80,100 96,${H - 100}" \
    -fill "${accent}" -font "${FONT}" -pointsize 22 -kerning 4 \
      -gravity NorthWest -annotate +120+110 "${slide.slide} / 10" \
    -gravity NorthWest \
    ${comp(headImg, 120, 185)} \
    -gravity NorthWest \
    ${itemParts} \
    -gravity NorthWest \
    -fill "${C.gray}" -font "${FONT}" -pointsize 28 \
      -gravity SouthWest -annotate +120+50 "${esc(brand.handle)}" \
    "${outFile}"`);

  cleanup(bg, headImg, ...itemImgs);
}

// ─── VS ───────────────────────────────────────────────────────────────────────
function renderVS(slide, outFile, accent, secondary) {
  const bg   = outFile + '.bg.png';
  makeBg(bg, accent, slide.slide % 2, secondary);

  const divX = Math.floor(W / 2);

  const headImg = makeTxt(slide.headline || '', {
    size: 56, weight: 800, fill: C.white,
    width: TW, height: 150, tmpBase: outFile + '.h',
  });

  run(`magick "${bg}" \
    -fill "${accent}" -draw "rectangle 80,100 96,300" \
    -fill "${accent}" -font "${FONT}" -pointsize 22 -kerning 4 \
      -gravity NorthWest -annotate +120+110 "${slide.slide} / 10" \
    -gravity NorthWest \
    ${comp(headImg, 120, 185)} \
    -gravity NorthWest \
    -fill "${C.gray}" -draw "rectangle ${divX - 1},360 ${divX + 1},${H - 120}" \
    -fill "${C.gray}" -font "${FONT}" -pointsize 28 -kerning 4 \
      -gravity NorthWest -annotate +120+390 "${esc(slide.leftLabel  || 'BEFORE')}" \
    -fill "${C.offWhite}" -font "${FONT}" -pointsize 68 -weight 700 \
      -gravity NorthWest -annotate +120+440 "${esc(slide.leftValue  || '')}" \
    -fill "${C.gray}" -font "${FONT}" -pointsize 28 -kerning 4 \
      -gravity NorthWest -annotate +${divX + 40}+390 "${esc(slide.rightLabel || 'AFTER')}" \
    -fill "${accent}" -font "${FONT}" -pointsize 68 -weight 700 \
      -gravity NorthWest -annotate +${divX + 40}+440 "${esc(slide.rightValue || '')}" \
    -fill "${C.gray}" -font "${FONT}" -pointsize 28 \
      -gravity SouthWest -annotate +120+50 "${esc(brand.handle)}" \
    "${outFile}"`);

  cleanup(bg, headImg);
}

// ─── INSIGHT ─────────────────────────────────────────────────────────────────
function renderInsight(slide, outFile, accent, secondary) {
  const bg = outFile + '.bg.png';
  makeBg(bg, accent, slide.slide % 2, secondary);

  const fadeNum = String(slide.slide - 1);

  const headImg = makeTxt(slide.headline || '', {
    size: 92, weight: 800, fill: C.white,
    width: TW, height: 460, tmpBase: outFile + '.h',
  });
  const subImg = makeTxt(slide.subtext || '', {
    size: 42, weight: 400, fill: C.offWhite,
    width: TW - 40, height: 220, tmpBase: outFile + '.s',
  });

  run(`magick "${bg}" \
    -fill "${accent}18" -font "${FONT}" -pointsize 420 -weight 900 \
      -gravity SouthEast -annotate +40+-60 "${fadeNum}" \
    -fill "${accent}" -draw "rectangle 80,100 96,${H - 100}" \
    -fill "${accent}" -font "${FONT}" -pointsize 22 -kerning 4 \
      -gravity NorthWest -annotate +120+110 "${slide.slide} / 10" \
    -gravity NorthWest \
    ${comp(headImg, 120, 200)} \
    -gravity NorthWest \
    -fill "${accent}" -draw "rectangle 120,690 400,694" \
    ${comp(subImg, 120, 725)} \
    -gravity NorthWest \
    -fill "${C.gray}" -font "${FONT}" -pointsize 28 \
      -gravity SouthWest -annotate +120+50 "${esc(brand.handle)}" \
    "${outFile}"`);

  cleanup(bg, headImg, subImg);
}

// ─── CTA (Slide 9) ───────────────────────────────────────────────────────────
function renderCTA(slide, outFile, accent, secondary) {
  const bg = outFile + '.bg.png';
  makeBg(bg, accent, 1, secondary);

  const headImg = makeTxt(slide.headline || '', {
    size: 80, weight: 900, fill: accent,
    width: W - 160, height: 320, gravity: 'Center', tmpBase: outFile + '.h',
  });
  const subImg = makeTxt(slide.subtext || '', {
    size: 46, weight: 500, fill: C.white,
    width: W - 160, height: 200, gravity: 'Center', tmpBase: outFile + '.s',
  });

  run(`magick "${bg}" \
    -fill "${accent}"    -draw "rectangle 0,0 ${W},8" \
    -fill "${secondary}" -draw "rectangle 0,${H - 8} ${W},${H}" \
    -gravity NorthWest \
    ${comp(headImg, 80, 460)} \
    -gravity NorthWest \
    ${comp(subImg,  80, 800)} \
    -gravity NorthWest \
    -fill "${C.gray}" -font "${FONT}" -pointsize 28 \
      -gravity SouthWest -annotate +120+50 "${esc(brand.handle)}" \
    "${outFile}"`);

  cleanup(bg, headImg, subImg);
}

// ─── FOLLOW (Slide 10) ───────────────────────────────────────────────────────
function renderFollow(slide, outFile, accent, secondary) {
  const bg = outFile + '.bg.png';
  makeBg(bg, accent, 0, secondary);

  run(`magick "${bg}" \
    -fill "${accent}"    -draw "rectangle 0,0 ${W},8" \
    -fill "${secondary}" -draw "rectangle 0,${H - 8} ${W},${H}" \
    -fill "${C.gray}" -font "${FONT}" -pointsize 36 -weight 500 \
      -gravity Center -annotate +0-220 "Want more like this?" \
    -fill "${C.white}" -font "${FONT}" -pointsize 58 -weight 800 \
      -gravity Center -annotate +0-130 "Follow" \
    -fill "${accent}" -font "${FONT}" -pointsize 76 -weight 900 \
      -gravity Center -annotate +0+10 "${esc(brand.handle)}" \
    -fill "${C.offWhite}" -font "${FONT}" -pointsize 40 -weight 400 \
      -gravity Center -annotate +0+130 "Daily AI tools \\& insights" \
    -fill "${C.gray}" -font "${FONT}" -pointsize 28 \
      -gravity SouthWest -annotate +120+50 "${esc(brand.handle)}" \
    "${outFile}"`);

  cleanup(bg);
}

// ─── Accent resolution ────────────────────────────────────────────────────────
function resolveAccents(carousel) {
  const color = (carousel.accentColor || 'purple').toLowerCase();
  return color === 'cyan'
    ? { accent: C.cyan,   secondary: C.purple }
    : { accent: C.purple, secondary: C.cyan   };
}

// ─── Slide router ─────────────────────────────────────────────────────────────
function renderSlide(slide, sessionDir, accent, secondary) {
  const outFile  = path.join(sessionDir, `slide-${String(slide.slide).padStart(2, '0')}.png`);
  const template = (slide.template || 'INSIGHT').toUpperCase();

  switch (slide.slide) {
    case 1:  renderHook(slide, outFile, accent, secondary);   break;
    case 9:  renderCTA(slide, outFile, accent, secondary);    break;
    case 10: renderFollow(slide, outFile, accent, secondary); break;
    default:
      switch (template) {
        case 'STAT':    renderStat(slide, outFile, accent, secondary);    break;
        case 'QUOTE':   renderQuote(slide, outFile, accent, secondary);   break;
        case 'LIST':    renderList(slide, outFile, accent, secondary);    break;
        case 'VS':      renderVS(slide, outFile, accent, secondary);      break;
        case 'INSIGHT':
        default:        renderInsight(slide, outFile, accent, secondary); break;
      }
  }

  return outFile;
}

function renderCarousel(carousel) {
  const sessionDir = path.join(outputDir, `session-${Date.now()}`);
  fs.mkdirSync(sessionDir, { recursive: true });

  const { accent, secondary } = resolveAccents(carousel);
  console.log(`🎨 Rendering slides (Emily v2 — accent: ${accent})...`);

  const files = [];
  for (const slide of carousel.slides) {
    const file = renderSlide(slide, sessionDir, accent, secondary);
    files.push(file);
    console.log(`  ✓ Slide ${slide.slide}/10 [${(slide.template || 'HOOK/CTA/FOLLOW').toUpperCase()}]`);
  }

  console.log(`  Saved → ${sessionDir}`);
  return { files, sessionDir };
}

module.exports = { renderCarousel };
