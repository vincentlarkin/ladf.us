import fs from 'node:fs/promises';
import path from 'node:path';

const LA_GOV_SITES = [
  'https://www.la.gov/',
  'https://gov.louisiana.gov/',
  'https://www.sos.la.gov/',
  'https://www.doa.la.gov/',
  'https://house.louisiana.gov/',
  'https://senate.la.gov/',
  'https://www.shreveportla.gov/',
  'https://www.brla.gov/',
  'https://www.nola.gov/',
  'https://www.jeffparish.gov/',
  'https://www.bossiercity.org/',
  'https://www.stpgov.org/',
];

const OUTPUT_DIR = path.resolve('research', 'la-gov-style-audit-12');

await fs.mkdir(OUTPUT_DIR, { recursive: true });

const siteResults = [];
const aggregateColorCounts = new Map();

for (const site of LA_GOV_SITES) {
  const result = await auditSite(site);
  siteResults.push(result);

  if (result.ok && result.colorCounts) {
    for (const [color, count] of Object.entries(result.colorCounts)) {
      aggregateColorCounts.set(color, (aggregateColorCounts.get(color) ?? 0) + count);
    }
  }
}

const successfulMetrics = siteResults
  .filter((result) => result.ok && result.metrics)
  .map((result) => result.metrics);

const maxWidthMedians = successfulMetrics
  .map((metrics) => metrics.max_width_median)
  .filter((value) => Number.isFinite(value));

const aggregate = {
  sites_requested: LA_GOV_SITES.length,
  sites_successful: successfulMetrics.length,
  radius_avg_mean: mean(successfulMetrics.map((metrics) => metrics.border_radius_avg)),
  radius_median_mean: mean(successfulMetrics.map((metrics) => metrics.border_radius_median)),
  box_shadow_avg: mean(successfulMetrics.map((metrics) => metrics.box_shadow_count)),
  max_width_median_px: median(maxWidthMedians),
  max_width_mean_px: mean(maxWidthMedians),
  bg_decl_avg: mean(successfulMetrics.map((metrics) => metrics.bg_decl_count)),
  border_decl_avg: mean(successfulMetrics.map((metrics) => metrics.border_decl_count)),
  top_colors: [...aggregateColorCounts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 16),
};

const summary = {
  generated_at: new Date().toISOString(),
  sites: siteResults.map((result) => {
    const { colorCounts, ...withoutColorCounts } = result;
    return withoutColorCounts;
  }),
  aggregate,
};

await fs.writeFile(
  path.join(OUTPUT_DIR, 'summary.json'),
  `${JSON.stringify(summary, null, 2)}\n`,
  'utf8',
);

console.log(`Audited ${LA_GOV_SITES.length} sites. Successful: ${successfulMetrics.length}.`);
console.log(`Wrote ${path.join(OUTPUT_DIR, 'summary.json')}`);

async function auditSite(site) {
  const hostKey = toHostKey(site);
  const siteDir = path.join(OUTPUT_DIR, hostKey);
  await fs.mkdir(siteDir, { recursive: true });

  try {
    const homepageResponse = await fetch(site, {
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      },
      redirect: 'follow',
    });

    if (!homepageResponse.ok) {
      throw new Error(`Homepage request failed (${homepageResponse.status}).`);
    }

    const homepageHtml = await homepageResponse.text();
    await fs.writeFile(path.join(siteDir, 'homepage.html'), homepageHtml, 'utf8');

    const cssUrls = extractStylesheetUrls(homepageHtml, homepageResponse.url).slice(0, 12);
    const cssFiles = [];

    for (let index = 0; index < cssUrls.length; index += 1) {
      const cssUrl = cssUrls[index];
      try {
        const cssResponse = await fetch(cssUrl, {
          headers: {
            'user-agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
            referer: homepageResponse.url,
          },
          redirect: 'follow',
        });

        if (!cssResponse.ok) {
          continue;
        }

        const cssText = await cssResponse.text();
        if (!cssText.trim()) {
          continue;
        }

        const filePath = path.join(siteDir, `css_${cssFiles.length + 1}.css`);
        await fs.writeFile(filePath, cssText, 'utf8');
        cssFiles.push({
          url: cssResponse.url,
          path: toWindowsRelativePath(filePath),
          bytes: Buffer.byteLength(cssText, 'utf8'),
          text: cssText,
        });
      } catch {
        continue;
      }
    }

    if (!cssFiles.length) {
      throw new Error('No stylesheet files were downloaded.');
    }

    cssFiles.sort((left, right) => right.bytes - left.bytes);
    const mainCss = cssFiles[0];
    const metrics = computeCssMetrics(mainCss.text);

    return {
      site,
      ok: true,
      css_files_downloaded: cssFiles.length,
      main_css: {
        url: mainCss.url,
        path: mainCss.path,
        bytes: mainCss.bytes,
      },
      metrics,
      colorCounts: metrics.color_frequency,
    };
  } catch (error) {
    return {
      site,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function extractStylesheetUrls(html, baseUrl) {
  const urls = [];
  const seen = new Set();
  const linkPattern = /<link\b[^>]*>/gi;

  for (const match of html.matchAll(linkPattern)) {
    const tag = match[0];
    const rel = getAttribute(tag, 'rel').toLowerCase();
    if (!rel.includes('stylesheet')) {
      continue;
    }

    const href = getAttribute(tag, 'href');
    if (!href || href.startsWith('data:') || href.startsWith('javascript:')) {
      continue;
    }

    try {
      const absoluteUrl = new URL(href, baseUrl).toString();
      if (seen.has(absoluteUrl)) {
        continue;
      }

      seen.add(absoluteUrl);
      urls.push(absoluteUrl);
    } catch {
      continue;
    }
  }

  return urls;
}

function getAttribute(tag, name) {
  const doubleQuoteMatch = tag.match(new RegExp(`${name}\\s*=\\s*"([^"]*)"`, 'i'));
  if (doubleQuoteMatch) {
    return doubleQuoteMatch[1].trim();
  }

  const singleQuoteMatch = tag.match(new RegExp(`${name}\\s*=\\s*'([^']*)'`, 'i'));
  if (singleQuoteMatch) {
    return singleQuoteMatch[1].trim();
  }

  const bareMatch = tag.match(new RegExp(`${name}\\s*=\\s*([^\\s>]+)`, 'i'));
  if (bareMatch) {
    return bareMatch[1].trim();
  }

  return '';
}

function computeCssMetrics(cssText) {
  const borderRadiusValues = extractLengthValues(cssText, /border-radius\s*:\s*([^;{}]+)/gi);
  const maxWidthValues = extractLengthValues(cssText, /max-width\s*:\s*([^;{}]+)/gi);
  const boxShadowCount = countMatches(cssText, /box-shadow\s*:/gi);
  const backgroundCount = countMatches(cssText, /background(?:-[a-z-]+)?\s*:/gi);
  const borderCount = countMatches(cssText, /border(?:-[a-z-]+)?\s*:/gi);
  const colorFrequency = extractHexColors(cssText);
  const colorCount = Object.values(colorFrequency).reduce((sum, count) => sum + count, 0);

  return {
    border_radius_count: borderRadiusValues.length,
    border_radius_avg: round(mean(borderRadiusValues), 2),
    border_radius_median: round(median(borderRadiusValues), 2),
    box_shadow_count: boxShadowCount,
    max_width_count: maxWidthValues.length,
    max_width_median: round(median(maxWidthValues), 2),
    bg_decl_count: backgroundCount,
    border_decl_count: borderCount,
    color_count: colorCount,
    color_frequency: colorFrequency,
  };
}

function extractLengthValues(cssText, declarationPattern) {
  const values = [];

  for (const match of cssText.matchAll(declarationPattern)) {
    const declaration = match[1];
    const lengthPattern = /(-?\d*\.?\d+)(px|rem|em)\b/gi;

    for (const lengthMatch of declaration.matchAll(lengthPattern)) {
      const numeric = Number(lengthMatch[1]);
      const unit = lengthMatch[2].toLowerCase();
      if (!Number.isFinite(numeric)) {
        continue;
      }

      values.push(toPx(numeric, unit));
    }
  }

  return values;
}

function extractHexColors(cssText) {
  const counts = {};
  const colorPattern = /#([0-9a-f]{3,8})\b/gi;

  for (const match of cssText.matchAll(colorPattern)) {
    const normalized = `#${match[1].toLowerCase()}`;
    counts[normalized] = (counts[normalized] ?? 0) + 1;
  }

  return counts;
}

function toPx(value, unit) {
  switch (unit) {
    case 'rem':
    case 'em':
      return value * 16;
    case 'px':
    default:
      return value;
  }
}

function countMatches(text, pattern) {
  const matches = text.match(pattern);
  return matches ? matches.length : 0;
}

function mean(values) {
  const filtered = values.filter((value) => Number.isFinite(value));
  if (!filtered.length) {
    return 0;
  }

  return filtered.reduce((sum, value) => sum + value, 0) / filtered.length;
}

function median(values) {
  const filtered = values
    .filter((value) => Number.isFinite(value))
    .sort((left, right) => left - right);

  if (!filtered.length) {
    return 0;
  }

  const middle = Math.floor(filtered.length / 2);
  if (filtered.length % 2 === 0) {
    return (filtered[middle - 1] + filtered[middle]) / 2;
  }

  return filtered[middle];
}

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function toHostKey(url) {
  const host = new URL(url).hostname.replace(/^www\./i, '');
  return host.replaceAll('.', '_');
}

function toWindowsRelativePath(filePath) {
  return path
    .relative(process.cwd(), filePath)
    .split(path.sep)
    .join('\\');
}
