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
  'municipality-enhancements.json',
);
const logoDir = path.join(rootDir, 'public', 'org-logos', 'municipal');

const MANUAL_OFFICIAL_SITES = {
  alexandria: 'https://www.cityofalexandriala.com/',
  batonrouge: 'https://www.brla.gov/',
  bossiercity: 'https://www.bossiercity.org/',
  breauxbridge: 'https://breauxbridgela.net/',
  broussard: 'https://www.livebroussard.com/',
  central: 'https://www.centralgov.com/',
  carencro: 'https://carencro.org/',
  covington: 'https://www.covla.com/',
  deridder: 'https://www.cityofderidder.org/',
  donaldsonville: 'https://www.donaldsonville-la.gov/',
  franklin: 'https://www.franklin-la.com/',
  hammond: 'https://hammond.org/',
  kenner: 'https://www.kenner.la.us/',
  lafayette: 'https://www.lafayettela.gov/',
  lakecharles: 'https://www.cityoflakecharles.com/',
  leesville: 'https://www.leesvillela.net/',
  mandeville: 'https://www.cityofmandeville.com/',
  mansfield: 'https://www.cityofmansfield.net/',
  minden: 'https://mindenla.org/',
  monroe: 'https://monroela.us/',
  neworleans: 'https://nola.gov/',
  pineville: 'https://www.pineville.net/',
  ruston: 'https://www.ruston.org/',
  shreveport: 'https://www.shreveportla.gov/',
  slidell: 'https://myslidell.com/',
  thibodaux: 'https://ci.thibodaux.la.us/',
  westmonroe: 'https://www.cityofwestmonroe.com/',
  zachary: 'https://www.cityofzachary.org/',
};

const MANUAL_LOGO_URLS = {
  breauxbridge:
    'https://breauxbridgela.net/wp-content/uploads/2023/08/cropped-Logo-optimized.png',
  broussard:
    'https://www.livebroussard.com/assets/images/City%20of%20Broussard%20Logo%20%26%20Slogan_Digital_With%20Transparency.png',
  donaldsonville:
    'https://www.donaldsonville-la.gov/api/blob/viewBlob?i=KjG0b%2FU7jWvCMTig2pUV7u%2FPmLG3n7bqlksGUQH9xPDf6ygN7oU4sV8u7UO9m%2FxN&s=xlarge',
  hammond:
    'https://hammond.org/wp-content/themes/city-of-hammond/assets/images/coh-logo-red-border.png',
};

const CITY_LINK_CATEGORIES = [
  {
    category: 'pay',
    label: 'Pay bills',
    patterns: [
      /\bpay\b/i,
      /\bbill/i,
      /utility\s+payment/i,
      /online\s+payment/i,
      /payments?/i,
    ],
    reject: [/disbursement/i, /budget/i, /audit/i],
  },
  {
    category: 'permits',
    label: 'Permits and code',
    patterns: [
      /permit/i,
      /building\s+(permit|official|department|code|inspection)/i,
      /code\s+enforcement/i,
      /planning/i,
      /zoning/i,
      /inspection/i,
      /occupational\s+license/i,
    ],
    reject: [/historic\s+building/i, /history/i, /tourism/i],
  },
  {
    category: 'publicWorks',
    label: 'Public works',
    patterns: [
      /public\s+works/i,
      /garbage/i,
      /trash/i,
      /recycling/i,
      /drainage/i,
      /water/i,
      /sewer/i,
      /roads?/i,
      /stormwater/i,
      /sanitation/i,
    ],
    reject: [/main\s+street/i],
  },
  {
    category: 'report',
    label: 'Report a problem',
    patterns: [
      /report/i,
      /request/i,
      /work\s+order/i,
      /service\s+request/i,
      /citizen\s+request/i,
      /311/i,
    ],
    reject: [
      /report\s+fraud/i,
      /fraud/i,
      /request\s+for\s+proposal/i,
      /\brfp\b/i,
      /bids?/i,
      /^news$/i,
      /press\s+release/i,
    ],
  },
  {
    category: 'meetings',
    label: 'Meetings and agendas',
    patterns: [
      /agenda/i,
      /meeting/i,
      /minutes/i,
      /city\s+council/i,
      /mayor\s+(and|&)\s+city\s+council/i,
      /board/i,
      /commission/i,
    ],
    reject: [/council\s+on\s+aging/i],
  },
  {
    category: 'police',
    label: 'Police department',
    patterns: [/police/i, /marshal/i, /law\s+enforcement/i],
  },
  {
    category: 'fire',
    label: 'Fire department',
    patterns: [/fire\s+(department|dept|chief|station|prevention|marshal)/i],
    reject: [/grant/i, /news/i, /blog/i],
  },
  {
    category: 'parks',
    label: 'Parks and recreation',
    patterns: [/parks?/i, /recreation/i, /events?/i],
  },
];

const BLOCKED_LINK_PATTERNS = [
  /facebook\.com/i,
  /instagram\.com/i,
  /twitter\.com/i,
  /x\.com/i,
  /youtube\.com/i,
  /linkedin\.com/i,
  /linktr\.ee/i,
  /mailto:/i,
  /tel:/i,
  /javascript:/i,
];

const BLOCKED_HOST_PATTERNS = [
  /facebook\.com$/i,
  /wikipedia\.org$/i,
  /wikimedia\.org$/i,
  /lma\.org$/i,
  /municode/i,
  /city-data\.com$/i,
  /mapquest\.com$/i,
  /tripadvisor\.com$/i,
  /yelp\.com$/i,
  /yellowpages\.com$/i,
  /countyoffice\.org$/i,
  /officialusa\.com$/i,
  /homefacts\.com$/i,
  /bestplaces\.net$/i,
  /seeklogo\.com$/i,
];

const manifest = {
  generatedAt: new Date().toISOString(),
  generator: 'scripts/sync-municipality-enhancements.mjs',
  sources: {
    serviceDirectory: '/public/data/service-directory.json',
    search: 'https://duckduckgo.com/html/',
  },
  municipalities: {},
};

await fs.mkdir(path.dirname(outputFile), { recursive: true });
await fs.rm(logoDir, { recursive: true, force: true });
await fs.mkdir(logoDir, { recursive: true });

const serviceDirectory = JSON.parse(
  await fs.readFile(serviceDirectoryFile, 'utf8'),
);
const cities = serviceDirectory.municipalities
  .filter((record) => record.type === 'CITY')
  .filter((record) => !/\bparish$/i.test(record.name))
  .sort((left, right) => left.name.localeCompare(right.name));

await mapWithConcurrency(cities, 3, async (city, index) => {
  const cityKey = normalizeName(city.normalizedName ?? city.name);
  console.log(`Finding city info ${index + 1}/${cities.length}: ${city.name}`);

  const officialSite = MANUAL_OFFICIAL_SITES[cityKey] ?? await findOfficialSite(city.name);
  if (!officialSite) {
    console.log(`  No official site found for ${city.name}`);
    return;
  }

  const siteInfo = await scrapeSiteInfo(officialSite);
  const manualLogoUrl = MANUAL_LOGO_URLS[cityKey];
  const candidates = [
    ...(manualLogoUrl ? [{ url: manualLogoUrl, type: 'logo', score: 20 }] : []),
    ...siteInfo.candidates,
  ];
  const brand = await downloadBestBrand(candidates, cityKey, city.name);
  const quickLinks = siteInfo.quickLinks;

  if (!brand && !quickLinks.length) {
    console.log(`  No logo found at ${officialSite}`);
    return;
  }

  manifest.municipalities[cityKey] = removeEmpty({
    officialSite,
    brand,
    quickLinks,
  });
});

await fs.writeFile(outputFile, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

const logoCount = Object.values(manifest.municipalities).filter(
  (entry) => entry.brand,
).length;
const quickLinkCount = Object.values(manifest.municipalities).filter(
  (entry) => entry.quickLinks?.length,
).length;

console.log(
  `Saved municipality info for ${Object.keys(manifest.municipalities).length} cities (${logoCount} logos, ${quickLinkCount} quick-link sets) to ${outputFile}`,
);

async function findOfficialSite(cityName) {
  const candidateSite = await tryCandidateSites(cityName);
  if (candidateSite) {
    return candidateSite;
  }

  const query = `${cityName} Louisiana official city website`;
  let html = '';
  try {
    html = await fetchText(
      `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
    );
  } catch (error) {
    return null;
  }
  const resultUrls = [...html.matchAll(/class="result__a" href="([^"]+)"/gi)]
    .map((match) => decodeDuckDuckGoUrl(match[1]))
    .filter(Boolean);

  return resultUrls.find((url) => isPlausibleOfficialSite(url, cityName)) ?? null;
}

async function tryCandidateSites(cityName) {
  const variants = buildDomainVariants(cityName);

  for (const variant of variants) {
    const url = await fetchReachableHomepage(variant, cityName);
    if (url) {
      return url;
    }
  }

  return null;
}

function buildDomainVariants(cityName) {
  const compact = normalizeName(cityName);
  const dashed = cityName
    .toLowerCase()
    .replace(/\b(st)\.\s*/g, 'st')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const withoutCity = compact.replace(/city$/, '');
  const bases = [
    `cityof${compact}`,
    `cityof${compact}la`,
    `${compact}la`,
    `${compact}`,
    `${dashed}`,
    `${dashed}-la`,
    `cityof${withoutCity}`,
    `cityof${withoutCity}la`,
    `${withoutCity}la`,
    `${withoutCity}`,
  ].filter(Boolean);
  const domains = [];

  for (const base of [...new Set(bases)]) {
    domains.push(
      `${base}.gov`,
      `${base}.org`,
      `${base}.com`,
      `${base}.net`,
      `${base}.us`,
    );
  }

  domains.push(`ci.${compact}.la.us`);

  return [...new Set(domains)].flatMap((domain) => [
    `https://www.${domain}/`,
    `https://${domain}/`,
  ]);
}

async function fetchReachableHomepage(url, cityName) {
  let response;

  try {
    response = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(3500),
      headers: {
        'user-agent': 'Mozilla/5.0',
      },
    });
  } catch (error) {
    return null;
  }

  if (!response.ok) {
    return null;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!/html/i.test(contentType)) {
    return null;
  }

  const finalUrl = response.url;
  if (!isPlausibleOfficialSite(finalUrl, cityName)) {
    return null;
  }

  return finalUrl;
}

function isPlausibleOfficialSite(url, cityName) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch (error) {
    return false;
  }

  const host = parsed.hostname.replace(/^www\./i, '').toLowerCase();
  const compactCity = normalizeName(cityName);
  const compactHost = normalizeName(host);

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return false;
  }

  if (BLOCKED_HOST_PATTERNS.some((pattern) => pattern.test(host))) {
    return false;
  }

  if (parsed.pathname.split('/').length > 4 && !/\.gov$/i.test(host)) {
    return false;
  }

  return (
    /\.gov$/i.test(host) ||
    compactHost.includes(compactCity) ||
    compactHost.includes(`cityof${compactCity}`) ||
    compactHost.includes(`${compactCity}city`) ||
    compactHost.includes(`${compactCity}la`) ||
    compactHost.includes(`${compactCity}gov`) ||
    /brla|nola|bossiercity/i.test(host)
  );
}

async function scrapeSiteInfo(url) {
  let html = '';

  try {
    html = await fetchText(url);
  } catch (error) {
    return {
      candidates: [],
      quickLinks: [],
      error: error.message,
    };
  }

  const candidates = collectBrandCandidates(html, url);
  const quickLinks = collectQuickLinks(html, url);

  return {
    candidates,
    quickLinks,
  };
}

function collectBrandCandidates(html, baseUrl) {
  const candidates = [];
  const seen = new Set();

  for (const match of html.matchAll(/<img\b([^>]*?)>/gi)) {
    const tag = match[0];
    const src = [
      extractAttribute(tag, 'data-src'),
      extractAttribute(tag, 'data-delay-load'),
      extractAttribute(tag, 'src'),
    ].find((value) => sanitizeUrl(value, baseUrl));
    const className = `${extractAttribute(tag, 'class')} ${extractAttribute(tag, 'id')} ${extractAttribute(tag, 'alt')} ${src}`.toLowerCase();

    if (!src || !/(logo|seal|crest|brand|city|bannerobject|homepage)/i.test(className)) {
      continue;
    }

    const url = sanitizeUrl(src, baseUrl);
    if (!url || seen.has(url)) {
      continue;
    }

    seen.add(url);
    candidates.push({
      url,
      type: /(seal|crest)/i.test(className) ? 'seal' : 'logo',
      score: scoreCandidate(className, url),
    });
  }

  for (const match of html.matchAll(/<meta\b([^>]*?)>/gi)) {
    const tag = match[0];
    const property = `${extractAttribute(tag, 'property')} ${extractAttribute(tag, 'name')}`.toLowerCase();
    const content = extractAttribute(tag, 'content');

    if (!content || !/(og:image|twitter:image)/i.test(property)) {
      continue;
    }

    const url = sanitizeUrl(content, baseUrl);
    if (!url || seen.has(url)) {
      continue;
    }

    seen.add(url);
    candidates.push({ url, type: 'logo', score: 5 });
  }

  for (const match of html.matchAll(/url\((['"]?)([^'")]+)\1\)/gi)) {
    const src = match[2];
    if (!/(logo|seal|crest|brand)/i.test(src)) {
      continue;
    }

    const url = sanitizeUrl(src, baseUrl);
    if (!url || seen.has(url)) {
      continue;
    }

    seen.add(url);
    candidates.push({ url, type: /seal|crest/i.test(src) ? 'seal' : 'logo', score: 4 });
  }

  return candidates.sort((left, right) => right.score - left.score);
}

function collectQuickLinks(html, baseUrl) {
  const links = [];
  const seenCategories = new Set();
  const seenUrls = new Set();

  for (const match of html.matchAll(/<a\b([^>]*?)>([\s\S]*?)<\/a>/gi)) {
    const tag = match[0];
    const href = extractAttribute(tag, 'href');
    const text = normalizeWhitespace(stripTags(match[2]));
    const title = normalizeWhitespace(extractAttribute(tag, 'title'));
    const ariaLabel = normalizeWhitespace(extractAttribute(tag, 'aria-label'));
    const searchable = `${text} ${title} ${ariaLabel} ${href}`;
    const url = sanitizeUrl(href, baseUrl);

    if (!url || !text && !title && !ariaLabel) {
      continue;
    }

    if (BLOCKED_LINK_PATTERNS.some((pattern) => pattern.test(url))) {
      continue;
    }

    const category = matchQuickLinkCategory(searchable);

    if (!category || seenCategories.has(category.category) || seenUrls.has(url)) {
      continue;
    }

    if (
      category.category === 'report' &&
      !/(report|request|work\s+order|311|concern|issue)/i.test(
        `${text} ${title} ${ariaLabel}`,
      )
    ) {
      continue;
    }

    seenCategories.add(category.category);
    seenUrls.add(url);
    links.push({
      category: category.category,
      label: category.label,
      href: url,
      sourceText: shortenLinkText(text || title || ariaLabel || category.label),
    });

    if (links.length >= 8) {
      break;
    }
  }

  return links;
}

function matchQuickLinkCategory(searchable) {
  return CITY_LINK_CATEGORIES.find((candidate) => {
    if (candidate.reject?.some((pattern) => pattern.test(searchable))) {
      return false;
    }

    return candidate.patterns.some((pattern) => pattern.test(searchable));
  });
}

function scoreCandidate(text, url) {
  let score = 0;
  if (/logo/i.test(text)) score += 8;
  if (/seal|crest/i.test(text)) score += 6;
  if (/bannerobject|homepage/i.test(text)) score += 5;
  if (/brand|header|site/i.test(text)) score += 4;
  if (/footer|facebook|instagram|twitter|youtube|icon/i.test(text)) score -= 4;
  if (/\.(svg|png|webp)(?:$|\?)/i.test(url)) score += 2;
  return score;
}

async function downloadBestBrand(candidates, cityKey, label) {
  for (const candidate of candidates) {
    const brand = await downloadBrandCandidate(candidate, cityKey, label);
    if (brand) {
      return brand;
    }
  }

  return null;
}

async function downloadBrandCandidate(candidate, cityKey, label) {
  let response;

  try {
    response = await fetch(candidate.url, {
      headers: {
        'user-agent': 'Mozilla/5.0',
      },
    });
  } catch (error) {
    return null;
  }

  if (!response.ok) {
    return null;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!/^image\//i.test(contentType) && !/svg/i.test(contentType)) {
    return null;
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.length < 300) {
    return null;
  }

  const hash = crypto.createHash('sha1').update(bytes).digest('hex').slice(0, 10);
  const extension = getExtension(candidate.url, contentType);
  const fileName = `${cityKey}-${hash}${extension}`;
  const outputPath = path.join(logoDir, fileName);

  await fs.writeFile(outputPath, bytes);

  return {
    src: `/org-logos/municipal/${fileName}`,
    alt: `${label} logo`,
    variant: candidate.type === 'logo' ? 'wide' : 'seal',
    frame: 'white',
  };
}

function getExtension(url, contentType) {
  const pathname = new URL(url).pathname;
  const extension = path.extname(pathname).toLowerCase();

  if (/^\.(png|jpe?g|gif|webp|svg|ico|avif)$/.test(extension)) {
    return extension;
  }

  if (/svg/i.test(contentType)) return '.svg';
  if (/png/i.test(contentType)) return '.png';
  if (/jpeg|jpg/i.test(contentType)) return '.jpg';
  if (/gif/i.test(contentType)) return '.gif';
  if (/webp/i.test(contentType)) return '.webp';
  if (/avif/i.test(contentType)) return '.avif';
  if (/icon|ico/i.test(contentType)) return '.ico';
  return '.png';
}

function decodeDuckDuckGoUrl(value) {
  const href = decodeHtml(value);
  try {
    const url = href.startsWith('//') ? new URL(`https:${href}`) : new URL(href);
    return url.searchParams.get('uddg') ?? url.toString();
  } catch (error) {
    return '';
  }
}

function sanitizeUrl(value, baseUrl = undefined) {
  const text = decodeHtml(String(value ?? '').trim());
  if (!text || text.startsWith('data:')) {
    return '';
  }

  try {
    return new URL(text, baseUrl).href;
  } catch (error) {
    return '';
  }
}

function removeEmpty(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => {
      if (Array.isArray(entry)) {
        return entry.length > 0;
      }

      return Boolean(entry);
    }),
  );
}

function stripTags(value) {
  return decodeHtml(String(value ?? '').replace(/<[^>]+>/g, ' '));
}

function normalizeWhitespace(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function shortenLinkText(value) {
  const text = normalizeWhitespace(value);
  if (text.length <= 64) {
    return text;
  }

  return `${text.slice(0, 61).trim()}...`;
}

function extractAttribute(tag, name) {
  const pattern = new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, 'i');
  return decodeHtml(tag.match(pattern)?.[1] ?? '');
}

function decodeHtml(value) {
  return String(value ?? '')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

function normalizeName(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/\bsaint\b/g, 'st')
    .replace(/[^a-z0-9]+/g, '')
    .trim();
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Fetch failed for ${url}: ${response.status}`);
  }

  return response.text();
}

async function mapWithConcurrency(items, concurrency, worker) {
  let index = 0;

  async function runNext() {
    const itemIndex = index;
    index += 1;

    if (itemIndex >= items.length) {
      return;
    }

    await worker(items[itemIndex], itemIndex);
    await runNext();
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => runNext()),
  );
}
