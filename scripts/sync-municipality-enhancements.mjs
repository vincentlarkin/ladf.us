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
  mandeville: 'https://www.cityofmandeville.com/',
  mansfield: 'https://www.cityofmansfield.net/',
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
  console.log(`Finding city logo ${index + 1}/${cities.length}: ${city.name}`);

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

  if (!brand) {
    console.log(`  No logo found at ${officialSite}`);
    return;
  }

  manifest.municipalities[cityKey] = {
    officialSite,
    brand,
  };
});

await fs.writeFile(outputFile, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

console.log(
  `Saved municipality logos for ${Object.keys(manifest.municipalities).length} cities to ${outputFile}`,
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
      error: error.message,
    };
  }

  const candidates = collectBrandCandidates(html, url);

  return {
    candidates,
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
