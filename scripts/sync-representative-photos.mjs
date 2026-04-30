import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import https from 'node:https';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), 'public', 'data');
const PHOTO_DIR = path.join(process.cwd(), 'public', 'representative-photos');
const PHOTO_PUBLIC_DIR = '/representative-photos';
const CADDO_SCHOOL_BOARD_LIVE_FEED_URL =
  'https://thrillshare-cmsv2.services.thrillshare.com/api/v2/s/153276/live_feeds?page_no=1&page_size=100&max_images=10';

const DISTRICT_LAYERS = [
  'louisiana-congress',
  'louisiana-house',
  'louisiana-senate',
  'shreveport-council',
  'caddo-commission',
  'caddo-school-board',
];

const CONGRESSIONAL_PHOTOS = {
  1: 'https://bioguide.congress.gov/bioguide/photo/S/S001176.jpg',
  2: 'https://bioguide.congress.gov/bioguide/photo/C/C001125.jpg',
  3: 'https://bioguide.congress.gov/bioguide/photo/H/H001077.jpg',
  4: 'https://bioguide.congress.gov/bioguide/photo/J/J000299.jpg',
  5: 'https://bioguide.congress.gov/bioguide/photo/L/L000591.jpg',
  6: 'https://bioguide.congress.gov/bioguide/photo/F/F000470.jpg',
};

const CADDO_COMMISSION_PHOTOS = {
  1: 'https://caddo.gov/wp-content/uploads/2024/01/Kracman-Photo-1200x1331.jpg',
  2: 'https://caddo.gov/wp-content/uploads/2024/01/G-Young-with-Seal-1200x1500.jpg',
  3: 'https://caddo.gov/wp-content/uploads/2024/01/Thomas-with-Seal-1200x1500.jpg',
  4: 'https://caddo.gov/wp-content/uploads/2024/01/JPY-with-Seal-scaled.jpg',
  5: 'https://caddo.gov/wp-content/uploads/2022/03/2020-Burrell-Pic.jpg',
  6: 'https://caddo.gov/wp-content/uploads/2024/04/2021-Steffon-Jones-1200x1500.jpg',
  7: 'https://caddo.gov/wp-content/uploads/2024/05/S.-Gage-Watts-Photo-2024.jpg',
  8: 'https://caddo.gov/wp-content/uploads/2023/10/Blake-with-Seal-scaled.jpg',
  9: 'https://caddo.gov/wp-content/uploads/2022/03/District-9-Atkins-scaled.jpg',
  10: 'https://caddo.gov/wp-content/uploads/2023/02/dist-8-scaled.jpeg',
  11: 'https://caddo.gov/wp-content/uploads/2022/03/2020-Lazarus-Pic-scaled.jpg',
  12: 'https://caddo.gov/wp-content/uploads/2022/03/2020-Epperson-Pic-scaled.jpg',
};

const STATEWIDE_OFFICIALS = [
  {
    key: 'bill-cassidy',
    name: 'Bill Cassidy',
    office: 'U.S. Senator',
    sourceUrl: 'https://www.cassidy.senate.gov/about/about-bill/',
    focus: '50% 34%',
  },
  {
    key: 'john-kennedy',
    name: 'John Kennedy',
    office: 'U.S. Senator',
    sourceUrl: 'https://www.kennedy.senate.gov/public/about',
    focus: '50% 34%',
  },
  {
    key: 'shreveport-mayor-tom-arceneaux',
    name: 'M. Thomas Arceneaux',
    office: 'Mayor',
    sourceUrl: 'https://www.shreveportla.gov/Directory.aspx?EID=822',
    focus: '50% 34%',
  },
  {
    key: 'governor',
    name: 'Jeff Landry',
    office: 'Governor',
    sourceUrl: 'https://www.gov.louisiana.gov/page/meet-the-governor',
    imageUrl:
      'https://www.gov.louisiana.gov/assets/images/2024/JL-Headshot/Jeff-Landry-Headshot.jpeg',
    focus: '70% 38%',
  },
  {
    key: 'lieutenant-governor',
    name: 'Billy Nungesser',
    office: 'Lieutenant Governor',
    sourceUrl: 'https://www.crt.state.la.us/lt-governor/biography/',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/8/88/Billy_Nungesser_2_%28cropped%29.jpg',
    focus: '50% 34%',
  },
  {
    key: 'secretary-of-state',
    name: 'Nancy Landry',
    office: 'Secretary of State',
    sourceUrl: 'https://www.sos.la.gov/OurOffice/LearnAboutNancyLandry/Pages/default.aspx',
    imageUrl:
      'https://www.sos.la.gov/OurOffice/LearnAboutNancyLandry/Documents/NancyLandry.png',
    focus: '50% 35%',
  },
  {
    key: 'attorney-general',
    name: 'Liz Murrill',
    office: 'Attorney General',
    sourceUrl: 'https://ag.louisiana.gov/',
    imageUrl: 'https://ag.louisiana.gov/images/Liz/AgLizMurrillHeadshot.jpg',
    focus: '50% 34%',
  },
  {
    key: 'treasurer',
    name: 'John Fleming',
    office: 'Treasurer',
    sourceUrl: 'https://www.treasury.la.gov/about',
    focus: '50% 34%',
  },
  {
    key: 'insurance-commissioner',
    name: 'Tim Temple',
    office: 'Commissioner of Insurance',
    sourceUrl: 'https://www.ldi.la.gov/about-timtemple',
    imageUrl:
      'https://www.ldi.la.gov/images/default-source/default-album/tim-temple-official-headshot-%282%29.jpg?sfvrsn=4b2e5b52_0',
    focus: '50% 34%',
  },
  {
    key: 'agriculture-commissioner',
    name: 'Mike Strain',
    office: 'Commissioner of Agriculture and Forestry',
    sourceUrl: 'https://www.ldaf.la.gov/about/commissioner',
    imageUrl:
      'https://images.ctfassets.net/pc5e1rlgfrov/5hTIgqv2MqaR56Exoi22wO/70d3034fa34dd2c8fff0a3df63ce5f67/mikeStrain.png',
    focus: '50% 34%',
  },
];

const fetchOptions = {
  headers: {
    'user-agent':
      'Mozilla/5.0 (compatible; LADF representative photo sync; +https://ladf.us/)',
    accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/*,*/*;q=0.8',
  },
  redirect: 'follow',
};

const REQUEST_TIMEOUT_MS = 30000;

await mkdir(PHOTO_DIR, { recursive: true });

const photos = {};
const stats = {
  districtEntries: 0,
  statewideEntries: 0,
  downloaded: 0,
  skipped: 0,
};

let caddoSchoolBoardPhotoIndexPromise;

for (const layerId of DISTRICT_LAYERS) {
  const collection = await readJson(path.join(DATA_DIR, `${layerId}.geojson`));

  for (const feature of collection.features) {
    const properties = feature.properties ?? {};
    const name = sanitizeText(properties.__representative);
    const districtKey = sanitizeText(properties.__districtKey);

    if (!name || !districtKey || /vacant/i.test(name)) {
      continue;
    }

    const photo = await findDistrictPhoto(layerId, properties);
    if (!photo) {
      stats.skipped += 1;
      continue;
    }

    photos[makeLayerDistrictKey(layerId, districtKey)] = {
      ...photo,
      name,
      layerId,
      districtKey,
      districtLabel: sanitizeText(properties.__districtLabel),
    };
    photos[makePersonKey(name)] = {
      ...photo,
      name,
      layerId,
      districtKey,
      districtLabel: sanitizeText(properties.__districtLabel),
    };
    stats.districtEntries += 1;
  }
}

for (const official of STATEWIDE_OFFICIALS) {
  const imageUrl =
    sanitizeText(official.imageUrl) ||
    (await scrapeBestImage(official.sourceUrl, official.name));
  const photo = imageUrl
    ? await downloadPhoto({
        imageUrl,
        sourceUrl: official.sourceUrl,
        name: official.name,
        office: official.office,
        keyPrefix: `statewide-${official.key}`,
        focus: official.focus,
      })
    : null;

  if (!photo) {
    stats.skipped += 1;
    continue;
  }

  const entry = {
    ...photo,
    name: official.name,
    office: official.office,
  };
  photos[`statewide:${official.key}`] = entry;
  photos[`statewide-office:${normalizeNameForMatch(official.office)}`] = entry;
  photos[makePersonKey(official.name)] = entry;
  stats.statewideEntries += 1;
}

const output = {
  generatedAt: new Date().toISOString(),
  generator: 'scripts/sync-representative-photos.mjs',
  stats,
  photos,
};

await writeFile(
  path.join(DATA_DIR, 'representative-photos.json'),
  `${JSON.stringify(output, null, 2)}\n`,
);

console.log(
  `Representative photos: ${stats.districtEntries} district, ${stats.statewideEntries} statewide, ${stats.downloaded} downloaded, ${stats.skipped} skipped.`,
);

async function findDistrictPhoto(layerId, properties) {
  const name = sanitizeText(properties.__representative);
  const districtKey = sanitizeText(properties.__districtKey);
  const sourceUrl = sanitizeText(properties.__officialWebsite);

  let imageUrl = '';

  if (layerId === 'louisiana-congress') {
    imageUrl = CONGRESSIONAL_PHOTOS[districtKey] ?? '';
  } else if (layerId === 'louisiana-house') {
    imageUrl = new URL(`/H_Reps/RepPics/rep${districtKey}.jpg`, sourceUrl).toString();
  } else if (layerId === 'louisiana-senate') {
    imageUrl = new URL(`SenPics/Sen${districtKey}.jpg`, sourceUrl).toString();
  } else if (layerId === 'shreveport-council') {
    imageUrl =
      (sourceUrl ? await scrapeBestImage(sourceUrl, name) : '') ||
      sanitizeText(properties.Pic_URL);
  } else if (layerId === 'caddo-school-board') {
    const caddoSchoolBoardPhotos = await getCaddoSchoolBoardPhotoIndex();
    imageUrl =
      caddoSchoolBoardPhotos.byDistrict.get(districtKey) ??
      caddoSchoolBoardPhotos.byName.get(makePersonKey(name)) ??
      '';
  } else if (layerId === 'caddo-commission') {
    imageUrl = CADDO_COMMISSION_PHOTOS[districtKey] ?? '';
    if (!imageUrl && sourceUrl) {
      imageUrl = await scrapeBestImage(sourceUrl, name);
    }
  } else if (sourceUrl) {
    imageUrl = await scrapeBestImage(sourceUrl, name);
  }

  if (!imageUrl) {
    return null;
  }

  return downloadPhoto({
    imageUrl,
    sourceUrl,
    name,
    office: `${layerId} ${districtKey}`,
    keyPrefix: `${layerId}-${districtKey}`,
  });
}

async function getCaddoSchoolBoardPhotoIndex() {
  caddoSchoolBoardPhotoIndexPromise ??= fetchCaddoSchoolBoardPhotoIndex();
  return caddoSchoolBoardPhotoIndexPromise;
}

async function fetchCaddoSchoolBoardPhotoIndex() {
  const byDistrict = new Map();
  const byName = new Map();

  try {
    const data = await fetchJson(CADDO_SCHOOL_BOARD_LIVE_FEED_URL);
    for (const feed of data.live_feeds ?? []) {
      const status = sanitizeText(feed.status);
      if (!/Board Member Spotlight/i.test(status)) {
        continue;
      }

      const district = status.match(/District\s+(\d+)/i)?.[1] ?? '';
      const image = (feed.live_feed_images ?? []).find((item) => item?.url);
      if (!image?.url) {
        continue;
      }

      if (district) {
        byDistrict.set(district, image.url);
      }

      if (image.alt_text) {
        byName.set(makePersonKey(image.alt_text), image.url);
      }
    }
  } catch (error) {
    console.warn(`Could not fetch Caddo School Board photos: ${error.message}`);
  }

  return { byDistrict, byName };
}

async function scrapeBestImage(pageUrl, personName) {
  try {
    const html = await fetchText(pageUrl);
    const imageCandidates = collectImageCandidates(html, pageUrl);
    const best = imageCandidates
      .map((candidate) => ({
        ...candidate,
        score: scoreImageCandidate(candidate, personName),
      }))
      .filter((candidate) => candidate.score > 0)
      .sort((left, right) => right.score - left.score)[0];

    return best?.url ?? '';
  } catch (error) {
    console.warn(`Could not scrape photo from ${pageUrl}: ${error.message}`);
    return '';
  }
}

function collectImageCandidates(html, pageUrl) {
  const candidates = [];

  for (const match of html.matchAll(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]+content=["']([^"']+)["'][^>]*>/gi)) {
    candidates.push({
      url: normalizeUrl(match[1], pageUrl),
      alt: '',
      className: '',
      tag: match[0],
    });
  }

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0];
    const src =
      getAttribute(tag, 'src') ||
      getAttribute(tag, 'data-src') ||
      getAttribute(tag, 'data-image');

    if (!src) {
      continue;
    }

    candidates.push({
      url: normalizeUrl(src, pageUrl),
      alt: htmlDecode(getAttribute(tag, 'alt') || getAttribute(tag, 'title')),
      className: getAttribute(tag, 'class'),
      tag,
    });
  }

  return candidates.filter((candidate) => candidate.url);
}

function scoreImageCandidate(candidate, personName) {
  const person = normalizeNameForMatch(personName);
  const haystack = normalizeNameForMatch(
    `${candidate.url} ${candidate.alt} ${candidate.className}`,
  );
  const lowerHaystack = `${candidate.url} ${candidate.alt} ${candidate.className}`.toLowerCase();

  let score = 0;
  if (person && haystack.includes(person)) {
    score += 90;
  }

  const [firstName, lastName] = normalizeNameParts(personName);
  if (firstName && haystack.includes(firstName)) {
    score += 20;
  }
  if (lastName && haystack.includes(lastName)) {
    score += 35;
  }

  if (/facebook|instagram|youtube|twitter|\/maps?graphics|districtmap|partyicon|stateflag|state-seal/.test(lowerHaystack)) {
    return -20;
  }

  if (/\blogo\b|\bicon\b|slideshow|carousel|banner|hero-bg|seal|flag|map|chennault|military/.test(lowerHaystack)) {
    score -= 80;
  }

  if (/\bseal\b/.test(lowerHaystack)) {
    score -= score >= 40 ? 20 : 80;
  }

  if (/headshot|portrait|rep|senpic|member|commissioner|council|featured-image|featured image|bio|profile|picture|photo/.test(lowerHaystack)) {
    score += 25;
  }

  if (/official|bio|about|learnabout|profile-pic/.test(lowerHaystack)) {
    score += 18;
  }

  if (/\.(jpe?g|png|webp|avif)(?:\?|$)/i.test(candidate.url)) {
    score += 8;
  }

  if (/document\?documentid=/i.test(candidate.url)) {
    score += 14;
  }

  return score;
}

async function downloadPhoto({ imageUrl, sourceUrl, name, office, keyPrefix, focus }) {
  try {
    const { bytes, contentType } = await downloadImage(imageUrl);
    if (!/^image\//i.test(contentType)) {
      throw new Error(`not an image (${contentType || 'unknown content type'})`);
    }
    if (bytes.length < 600) {
      throw new Error(`image too small (${bytes.length} bytes)`);
    }

    const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 10);
    const extension = extensionFromContentType(contentType) ?? extensionFromUrl(imageUrl) ?? 'jpg';
    const fileName = `${slugify(keyPrefix)}-${hash}.${extension}`;
    await writeFile(path.join(PHOTO_DIR, fileName), bytes);
    stats.downloaded += 1;

    return {
      src: `${PHOTO_PUBLIC_DIR}/${fileName}`,
      alt: `${name} portrait`,
      sourceUrl,
      imageSourceUrl: imageUrl,
      credit: office,
      objectPosition: normalizeObjectPosition(focus),
    };
  } catch (error) {
    console.warn(`Could not download ${name} photo from ${imageUrl}: ${error.message}`);
    return null;
  }
}

function normalizeObjectPosition(value) {
  const focus = sanitizeText(value);
  if (!focus) {
    return '';
  }

  return /^\d{1,3}% \d{1,3}%$/.test(focus) ? focus : '';
}

async function downloadImage(imageUrl) {
  try {
    const response = await fetchWithTimeout(imageUrl);
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    return {
      contentType: response.headers.get('content-type')?.split(';')[0]?.trim() ?? '',
      bytes: Buffer.from(await response.arrayBuffer()),
    };
  } catch (error) {
    if (!imageUrl.startsWith('https://')) {
      throw error;
    }

    return downloadImageViaHttps(imageUrl);
  }
}

async function downloadImageViaHttps(imageUrl, redirects = 0) {
  return new Promise((resolve, reject) => {
    const request = https.get(
      imageUrl,
      {
        headers: fetchOptions.headers,
        timeout: REQUEST_TIMEOUT_MS,
      },
      (response) => {
        const statusCode = response.statusCode ?? 0;
        const location = response.headers.location;

        if (statusCode >= 300 && statusCode < 400 && location && redirects < 3) {
          response.resume();
          resolve(downloadImageViaHttps(new URL(location, imageUrl).toString(), redirects + 1));
          return;
        }

        if (statusCode < 200 || statusCode >= 300) {
          response.resume();
          reject(new Error(`${statusCode} ${response.statusMessage ?? ''}`.trim()));
          return;
        }

        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () =>
          resolve({
            contentType: String(response.headers['content-type'] ?? '')
              .split(';')[0]
              .trim(),
            bytes: Buffer.concat(chunks),
          }),
        );
      },
    );

    request.on('timeout', () => request.destroy(new Error('image request timed out')));
    request.on('error', reject);
  });
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function fetchText(url) {
  const response = await fetchWithTimeout(url);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.text();
}

async function fetchJson(url) {
  const response = await fetchWithTimeout(url);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function makeLayerDistrictKey(layerId, districtKey) {
  return `${layerId}:${districtKey}`;
}

function makePersonKey(name) {
  return `person:${normalizeNameForMatch(name)}`;
}

function getAttribute(tag, attribute) {
  return (
    tag.match(new RegExp(`\\b${attribute}=["']([^"']*)`, 'i'))?.[1]?.trim() ?? ''
  );
}

function normalizeUrl(value, baseUrl) {
  const text = htmlDecode(value);
  if (!text) {
    return '';
  }

  try {
    return new URL(text, baseUrl).toString();
  } catch (error) {
    return '';
  }
}

function normalizeNameParts(value) {
  const parts = sanitizeText(value)
    .replace(/\b(mr|mrs|ms|dr|honorable|president|vice|first|second|jr|sr)\.?\b/gi, ' ')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/["'.]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  return [parts[0]?.toLowerCase() ?? '', parts.at(-1)?.toLowerCase() ?? ''];
}

function normalizeNameForMatch(value) {
  return sanitizeText(value)
    .replace(/&amp;/g, '&')
    .replace(/\b(mr|mrs|ms|dr|honorable|president|vice|first|second|jr|sr)\.?\b/gi, ' ')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^a-z0-9]+/gi, '')
    .toLowerCase();
}

function htmlDecode(value) {
  return sanitizeText(value)
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&apos;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

function extensionFromContentType(contentType) {
  switch (contentType.toLowerCase()) {
    case 'image/jpeg':
    case 'image/jpg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/avif':
      return 'avif';
    case 'image/gif':
      return 'gif';
    default:
      return '';
  }
}

function extensionFromUrl(url) {
  return url.match(/\.([a-z0-9]{3,4})(?:\?|$)/i)?.[1]?.toLowerCase() ?? '';
}

function slugify(value) {
  return sanitizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function sanitizeText(value) {
  return String(value ?? '').trim();
}
