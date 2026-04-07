import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const serviceDirectoryFile = path.join(
  rootDir,
  'public',
  'data',
  'service-directory.json',
);
const outputFile = path.join(
  rootDir,
  'public',
  'data',
  'parish-enhancements.json',
);
const logoDir = path.join(rootDir, 'public', 'org-logos', 'generated');

const OFFICE_DESCRIPTORS = [
  {
    key: 'parish',
    linkKey: 'localGovernment',
    keywords: ['police jury', 'parish council', 'parish government', 'city-parish'],
    fallback: (baseName) => `${baseName} Parish Government`,
  },
  {
    key: 'clerk',
    linkKey: 'clerk',
    keywords: ['clerk of court', 'clerk'],
    fallback: (baseName) => `${baseName} Parish Clerk of Court`,
  },
  {
    key: 'assessor',
    linkKey: 'assessor',
    keywords: ['assessor'],
    fallback: (baseName) => `${baseName} Parish Assessor`,
  },
  {
    key: 'schools',
    linkKey: 'schools',
    keywords: [
      'school board',
      'public schools',
      'school district',
      'school system',
      'schools',
    ],
    fallback: (baseName) => `${baseName} Parish Schools`,
  },
  {
    key: 'library',
    linkKey: 'library',
    keywords: ['library'],
    fallback: (baseName) => `${baseName} Parish Library`,
  },
];

const GENERIC_OFFICE_PATTERNS = {
  parish: [/la\.gov\/local-louisiana/i, /lpgov\.org\/page\/parishinfo/i],
  clerk: [/laclerksofcourt\.org/i],
  assessor: [/louisianaassessors\.org/i],
  schools: [/apsbonline\.org/i],
  library: [],
};

const RPEC_INDEX_URL = 'https://www.lagop.com/rpec';
const MANUAL_ALIAS_MAP = {
  ebr: 'eastbatonrouge',
  wbr: 'westbatonrouge',
  'st-john': 'stjohnthebaptist',
  vermillion: 'vermilion',
};

const manifest = {
  generatedAt: new Date().toISOString(),
  generator: 'scripts/sync-parish-enhancements.mjs',
  sources: {
    serviceDirectory: '/public/data/service-directory.json',
    lagopRpec: RPEC_INDEX_URL,
  },
  parishes: {},
};

await fs.mkdir(path.dirname(outputFile), { recursive: true });
await fs.rm(logoDir, { recursive: true, force: true });
await fs.mkdir(logoDir, { recursive: true });

const serviceDirectory = JSON.parse(
  await fs.readFile(serviceDirectoryFile, 'utf8'),
);
const rpecEntries = await fetchRpecEntries();
const rpecByParish = new Map(
  rpecEntries.map((entry) => [entry.parishKey, entry]),
);

await mapWithConcurrency(serviceDirectory.parishes, 5, async (parish, index) => {
  const parishKey = normalizeParishKey(parish.name);
  const baseName = stripParishSuffix(parish.name);
  console.log(`Enhancing parish ${index + 1}/${serviceDirectory.parishes.length}: ${parish.name}`);

  const officeNames = {};
  const officeBrands = {};
  const communityOrganizations = [];

  for (const descriptor of OFFICE_DESCRIPTORS) {
    const officeUrl = parish.linkMap?.[descriptor.linkKey];
    if (!isUsefulOfficeUrl(descriptor.key, officeUrl)) {
      continue;
    }

    const siteInfo = await scrapeSiteInfo(officeUrl);
    const officeName = deriveOfficeName(
      baseName,
      descriptor,
      siteInfo.title,
    );

    if (officeName) {
      officeNames[descriptor.key] = officeName;
    }

    const officeBrand = await downloadBestBrand(
      siteInfo.candidates,
      parishKey,
      descriptor.key,
      officeName || descriptor.fallback(baseName),
    );

    if (officeBrand) {
      officeBrands[descriptor.key] = officeBrand;
    }
  }

  const rpecEntry = rpecByParish.get(parishKey) ?? null;
  if (rpecEntry) {
    const orgName = `${baseName} Parish Republican Executive Committee`;
    const orgBrand = await downloadBestBrand(
      rpecEntry.imageUrl ? [{ url: rpecEntry.imageUrl, type: 'logo' }] : [],
      parishKey,
      'gop',
      orgName,
    );

    communityOrganizations.push({
      label: 'Parish GOP',
      name: orgName,
      role: 'Local parish Republican executive committee',
      links: [[rpecEntry.linkLabel, rpecEntry.linkUrl]],
      ...(orgBrand ? { brand: orgBrand } : {}),
      note:
        'Listed in the Republican Party of Louisiana parish chapter directory.',
    });
  }

  const parishEnhancement = pruneEmpty({
    officeNames,
    officeBrands,
    ...(communityOrganizations.length
      ? { communityOrganizations }
      : {}),
  });

  if (Object.keys(parishEnhancement).length) {
    manifest.parishes[parishKey] = parishEnhancement;
  }
});

await fs.writeFile(outputFile, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

console.log(
  `Saved enhancements for ${Object.keys(manifest.parishes).length} parishes to ${outputFile}`,
);

async function fetchRpecEntries() {
  const html = await fetchText(RPEC_INDEX_URL);
  const entryRegex =
    /<figure[\s\S]*?(?:<a[^>]+href="([^"]+)"[^>]*>)?[\s\S]*?<img[^>]+src="([^"]+)"[^>]*>[\s\S]*?<\/figure>[\s\S]*?<h3[^>]+id="h-([^"]+)"[^>]*>(?:<a[^>]+href="([^"]+)"[^>]*>)?([^<]+)/gi;
  const entries = [];

  for (const match of html.matchAll(entryRegex)) {
    const headingKey = normalizeSlug(match[3]);
    const parishKey = MANUAL_ALIAS_MAP[headingKey] ?? headingKey;
    const linkUrl = sanitizeUrl(match[4]) || sanitizeUrl(match[1]) || `${RPEC_INDEX_URL}#h-${match[3]}`;

    entries.push({
      parishKey,
      displayName: decodeHtml(match[5]),
      imageUrl: sanitizeUrl(match[2]),
      linkUrl,
      linkLabel: sanitizeUrl(match[4]) || sanitizeUrl(match[1]) ? 'Official chapter page' : 'Louisiana GOP chapter listing',
    });
  }

  return entries;
}

function isUsefulOfficeUrl(officeKey, url) {
  const href = sanitizeUrl(url);
  if (!href) {
    return false;
  }

  return !GENERIC_OFFICE_PATTERNS[officeKey].some((pattern) => pattern.test(href));
}

async function scrapeSiteInfo(url) {
  let html = '';

  try {
    html = await fetchText(url);
  } catch (error) {
    return {
      title: '',
      candidates: [{ url: buildFaviconUrl(url), type: 'icon' }],
      error: error.message,
    };
  }

  const title = selectTitle(html);
  const candidates = collectBrandCandidates(html, url);

  return {
    title,
    candidates: candidates.length
      ? candidates
      : [{ url: buildFaviconUrl(url), type: 'icon' }],
  };
}

function collectBrandCandidates(html, baseUrl) {
  const candidates = [];
  const seen = new Set();

  for (const match of html.matchAll(/<img\b([^>]*?)>/gi)) {
    const tag = match[0];
    const src = extractAttribute(tag, 'src');
    const className = `${extractAttribute(tag, 'class')} ${extractAttribute(tag, 'id')} ${extractAttribute(tag, 'alt')} ${src}`.toLowerCase();

    if (!src || !/(logo|seal|crest|brand)/i.test(className)) {
      continue;
    }

    const resolved = resolveUrl(src, baseUrl);
    if (!resolved || seen.has(resolved)) {
      continue;
    }

    seen.add(resolved);
    candidates.push({
      url: resolved,
      type: 'logo',
      width: parseInteger(extractAttribute(tag, 'width')),
      height: parseInteger(extractAttribute(tag, 'height')),
    });
  }

  for (const match of html.matchAll(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/gi)) {
    const resolved = resolveUrl(match[1], baseUrl);
    if (!resolved || seen.has(resolved)) {
      continue;
    }

    seen.add(resolved);
    candidates.push({ url: resolved, type: 'og' });
  }

  for (const match of html.matchAll(/<link[^>]+rel="([^"]*icon[^"]*)"[^>]+href="([^"]+)"/gi)) {
    const resolved = resolveUrl(match[2], baseUrl);
    if (!resolved || seen.has(resolved)) {
      continue;
    }

    seen.add(resolved);
    candidates.push({ url: resolved, type: 'icon' });
  }

  const favicon = buildFaviconUrl(baseUrl);
  if (!seen.has(favicon)) {
    candidates.push({ url: favicon, type: 'icon' });
  }

  return candidates;
}

async function downloadBestBrand(candidates, parishKey, officeKey, label) {
  for (const candidate of candidates) {
    const asset = await downloadAsset(candidate.url, parishKey, officeKey);
    if (!asset) {
      continue;
    }

    return {
      src: asset.src,
      alt: `${label} logo`,
      variant: pickVariant(candidate),
      frame: 'white',
    };
  }

  return null;
}

async function downloadAsset(url, parishKey, officeKey) {
  const href = sanitizeUrl(url);
  if (!href) {
    return null;
  }

  try {
    const response = await fetchWithHeaders(href);
    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('text/html')) {
      return null;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (!buffer.length) {
      return null;
    }

    const extension = determineExtension(href, contentType);
    const hash = crypto
      .createHash('sha1')
      .update(`${href}:${contentType}`)
      .digest('hex')
      .slice(0, 10);
    const fileName = `${parishKey}-${officeKey}-${hash}.${extension}`;
    const outputPath = path.join(logoDir, fileName);

    await fs.writeFile(outputPath, buffer);

    return {
      src: `/org-logos/generated/${fileName}`,
    };
  } catch (error) {
    return null;
  }
}

function deriveOfficeName(baseName, descriptor, rawTitle) {
  const title = cleanTitle(rawTitle);
  const segments = title
    .split(/\s*[|:\-]\s*/)
    .map((segment) => normalizeWhitespace(segment))
    .filter(
      (segment) =>
        segment &&
        !/^(official|website|government)$/i.test(segment) &&
        !/our library offers/i.test(segment),
    );
  const keywordPattern = new RegExp(descriptor.keywords.join('|'), 'i');
  const preferred = segments.find((segment) => keywordPattern.test(segment)) ?? title;

  if (!preferred) {
    return descriptor.fallback(baseName);
  }

  if (descriptor.key === 'parish') {
    if (/police jury/i.test(preferred) && !/parish/i.test(preferred)) {
      return `${baseName} Parish Police Jury`;
    }
    if (/parish council/i.test(preferred)) {
      return `${baseName} Parish Council`;
    }
    if (/city-parish/i.test(preferred) || /police jury/i.test(preferred) || /parish/i.test(preferred)) {
      return cleanupOfficeName(preferred);
    }
  }

  if (keywordPattern.test(preferred)) {
    return cleanupOfficeName(preferred);
  }

  return descriptor.fallback(baseName);
}

function cleanTitle(rawTitle) {
  return normalizeWhitespace(
    decodeHtml(String(rawTitle ?? ''))
      .replace(/home\s*page\s*[»>-]*/gi, '')
      .replace(/\bhome\b\s*[»>-]*/gi, '')
      .replace(/\bofficial website\b/gi, '')
      .replace(/\bweb site\b/gi, '')
      .replace(/\bwelcome to\b/gi, '')
      .replace(/\bthe heart of i-10\b/gi, '')
      .replace(/,\s*la\b/gi, '')
      .replace(/\s+[|>]+\s+/g, ' | '),
  );
}

function cleanupOfficeName(value) {
  return normalizeWhitespace(
    String(value ?? '')
      .replace(/^(to)\s+/i, '')
      .replace(/\s*[|>]\s*official website$/i, '')
      .replace(/\s+(home|homepage)$/i, '')
      .replace(/,\s*la\b/gi, '')
      .replace(/\s*\|\s*$/g, '')
      .replace(/^government\s*\|\s*/i, '')
      .replace(/\s*[|]\s*/g, ' ')
      .replace(/\s+[–-]\s+.*$/i, '')
      .replace(/\bour library offers.*$/i, ''),
  );
}

function selectTitle(html) {
  return (
    html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i)?.[1] ??
    html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ??
    ''
  );
}

function buildFaviconUrl(baseUrl) {
  try {
    return new URL('/favicon.ico', baseUrl).href;
  } catch (error) {
    return '';
  }
}

function pickVariant(candidate) {
  if (candidate.type === 'icon') {
    return 'seal';
  }

  if (candidate.width && candidate.height) {
    if (candidate.width >= candidate.height * 1.4) {
      return 'wide';
    }
    if (Math.abs(candidate.width - candidate.height) <= Math.min(candidate.width, candidate.height) * 0.16) {
      return 'seal';
    }
  }

  return candidate.type === 'og' ? 'wide' : 'square';
}

function determineExtension(url, contentType) {
  const pathname = new URL(url).pathname;
  const rawExtension = path.extname(pathname).replace('.', '').toLowerCase();
  if (rawExtension) {
    return rawExtension === 'jpeg' ? 'jpg' : rawExtension;
  }

  if (contentType.includes('svg')) {
    return 'svg';
  }
  if (contentType.includes('png')) {
    return 'png';
  }
  if (contentType.includes('avif')) {
    return 'avif';
  }
  if (contentType.includes('webp')) {
    return 'webp';
  }
  if (contentType.includes('icon')) {
    return 'ico';
  }

  return 'jpg';
}

function resolveUrl(value, baseUrl) {
  const href = String(value ?? '').trim();
  if (!href || href.startsWith('data:')) {
    return '';
  }

  try {
    return new URL(href, baseUrl).href;
  } catch (error) {
    return '';
  }
}

function extractAttribute(tag, attribute) {
  return (
    tag.match(new RegExp(`${attribute}="([^"]*)"`, 'i'))?.[1] ??
    tag.match(new RegExp(`${attribute}='([^']*)'`, 'i'))?.[1] ??
    ''
  );
}

function parseInteger(value) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function pruneEmpty(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => {
      if (!entry) {
        return false;
      }
      if (Array.isArray(entry)) {
        return entry.length > 0;
      }
      return Object.keys(entry).length > 0;
    }),
  );
}

function normalizeParishKey(value) {
  return normalizeSlug(stripParishSuffix(value));
}

function stripParishSuffix(value) {
  return normalizeWhitespace(String(value ?? '').replace(/\s+parish$/i, ''));
}

function normalizeSlug(value) {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '')
    .trim();
}

function normalizeWhitespace(value) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();
}

function sanitizeUrl(value) {
  const href = String(value ?? '').trim();
  if (!href) {
    return '';
  }

  try {
    const parsed = new URL(href);
    if (['http:', 'https:'].includes(parsed.protocol)) {
      return parsed.href;
    }
  } catch (error) {
    return '';
  }

  return '';
}

function decodeHtml(value) {
  return String(value ?? '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&rsquo;/gi, "'")
    .replace(/&ldquo;/gi, '"')
    .replace(/&rdquo;/gi, '"')
    .replace(/&ndash;/gi, '-')
    .replace(/&mdash;/gi, '-')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .trim();
}

async function fetchText(url) {
  const response = await fetchWithHeaders(url);
  if (!response.ok) {
    throw new Error(`${response.status} for ${url}`);
  }

  return response.text();
}

function fetchWithHeaders(url) {
  return fetch(url, {
    headers: {
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
    },
    signal: AbortSignal.timeout(15000),
  });
}

async function mapWithConcurrency(items, concurrency, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      while (nextIndex < items.length) {
        const currentIndex = nextIndex;
        nextIndex += 1;
        results[currentIndex] = await worker(items[currentIndex], currentIndex);
      }
    }),
  );

  return results;
}
