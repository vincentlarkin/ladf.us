import fs from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const dataDir = path.join(rootDir, 'public', 'data');
const outputFile = path.join(dataDir, 'service-directory.json');

const SOURCES = {
  municipalDirectory:
    'https://www.lma.org/LMA/LMA/About_LMA/directory_search.aspx',
  municipalProfileBase:
    'https://www.lma.org/LMA/About_LMA/Organization_Profile.aspx?id=',
  parishIndex: 'https://www.la.gov/local-louisiana/',
};

const MUNICIPAL_SHOW_ALL_EVENT =
  'ctl01$TemplateBody$WebPartManager1$gwpciNewQueryMenuCommon$ciNewQueryMenuCommon$ResultsGrid$Grid1$ctl00$ctl03$ctl01$ShowAll';
const PROFILE_ROSTER_SHOW_ALL_EVENT =
  'ctl01$TemplateBody$WebPartManager1$gwpciNewQueryMenuCommon$ciNewQueryMenuCommon$ResultsGrid$Grid1$ctl00$ctl02$ctl00$ShowAll';

const serviceDirectory = {
  generatedAt: new Date().toISOString(),
  generator: 'scripts/sync-service-directory.mjs',
  sources: SOURCES,
  municipalities: [],
  parishes: [],
  statewideLinks: {
    utilityConsumerHub: 'https://www.lpsc.louisiana.gov/Consumers',
    utilityComplaints: 'https://www.lpsc.louisiana.gov/Complaints',
    utilityDivision: 'https://www.lpsc.louisiana.gov/Utilities',
    sheriffDirectory: 'https://lsa.org/sheriffs-directory/?view=grid',
    omv: 'https://offices.omv.la.gov/',
    registrar: 'https://voterportal.sos.la.gov/Registrar',
    voterPortal: 'https://voterportal.sos.la.gov/',
    emergencyPreparedness:
      'https://gohsep.la.gov/about/contact-us/parish-ohsep-contacts/',
    fireDistricts: 'https://ose.louisiana.gov/jurisdictions/',
    justicesOfPeace: 'https://www.ag.state.la.us/JusticeCourt/Directory',
    schoolDistricts: 'https://www.apsbonline.org/',
    legislatorLookup: 'https://www.legis.la.gov/legis/FindMyLegislators.aspx',
    houseByParish: 'https://house.louisiana.gov/H_Reps/H_Reps_ByParish',
    senateFullInfo: 'https://senate.la.gov/Senators_FullInfo',
  },
};

await fs.mkdir(dataDir, { recursive: true });

const municipalityEntries = await fetchMunicipalityDirectoryEntries();
serviceDirectory.municipalities = await mapWithConcurrency(
  municipalityEntries,
  6,
  (entry, index) =>
    fetchMunicipalityProfile(entry, index + 1, municipalityEntries.length),
);

const parishEntries = await fetchParishEntries();
serviceDirectory.parishes = await mapWithConcurrency(
  parishEntries,
  6,
  (entry, index) =>
    fetchParishProfile(entry, index + 1, parishEntries.length),
);

await fs.writeFile(outputFile, JSON.stringify(serviceDirectory), 'utf8');
console.log(
  `Saved ${serviceDirectory.municipalities.length} municipalities and ${serviceDirectory.parishes.length} parishes to ${outputFile}`,
);

async function fetchMunicipalityDirectoryEntries() {
  const initial = await fetchHtml(SOURCES.municipalDirectory);
  const expandedHtml = await postBackShowAll(
    SOURCES.municipalDirectory,
    initial,
    MUNICIPAL_SHOW_ALL_EVENT,
  );

  const rowRegex =
    /<tr class="rg(?:Alt)?Row"[^>]*>[\s\S]*?<td><a[^>]+title="([^"]+)" href="([^"]+id=(\d+))">[\s\S]*?<\/a><\/td><td>([\s\S]*?)<\/td><td>([\s\S]*?)<\/td><td>([\s\S]*?)<\/td><td>([\s\S]*?)<\/td>/g;

  const entries = [];
  let match;
  while ((match = rowRegex.exec(expandedHtml.html))) {
    entries.push({
      id: match[3],
      name: decodeHtmlEntities(match[1]),
      profileUrl: new URL(match[2], SOURCES.municipalDirectory).href,
      address: normalizeInlineHtml(match[4]),
      phone: normalizePhone(match[5]),
      type: normalizeText(match[6]),
      form: normalizeText(match[7]),
    });
  }

  return entries;
}

async function fetchMunicipalityProfile(entry, index, total) {
  console.log(`Syncing municipality ${index}/${total}: ${entry.name}`);
  const profileResponse = await fetchHtml(entry.profileUrl);
  let profileHtml = profileResponse.html;

  const rosterCount = Number.parseInt(
    profileHtml.match(/Show all (\d+)<\/a>/i)?.[1] ?? '0',
    10,
  );

  if (rosterCount > 20) {
    try {
      const expanded = await postBackShowAll(
        entry.profileUrl,
        profileResponse,
        PROFILE_ROSTER_SHOW_ALL_EVENT,
      );
      profileHtml = expanded.html;
    } catch (error) {
      console.warn(`Roster expansion failed for ${entry.name}:`, error.message);
    }
  }

  const roster = parseMunicipalityRoster(profileHtml);

  return {
    ...entry,
    normalizedName: normalizeName(entry.name),
    sourceUrl: entry.profileUrl,
    roster,
    serviceContacts: classifyMunicipalContacts(roster),
  };
}

async function fetchParishEntries() {
  const response = await fetchHtml(SOURCES.parishIndex);
  const matches = [
    ...response.html.matchAll(
      /<li><a href="(\/local-louisiana\/[^"]+)">([^<]+ Parish)<\/a><\/li>/gi,
    ),
  ];

  return matches.map((match) => ({
    name: decodeHtmlEntities(match[2]),
    pageUrl: new URL(match[1], SOURCES.parishIndex).href,
  }));
}

async function fetchParishProfile(entry, index, total) {
  console.log(`Syncing parish ${index}/${total}: ${entry.name}`);
  const response = await fetchHtml(entry.pageUrl);
  const seat = normalizeText(
    response.html.match(
      /<li><strong>Parish Seat<\/strong>:\s*(?:<span>.*?<\/span>)?\s*(?:<a[^>]*>)?([^<]+)/i,
    )?.[1],
  );

  const localLinksBlock =
    response.html.match(
      /<h1>Local Contact Information<\/h1>\s*<ul>([\s\S]*?)<\/ul>/i,
    )?.[1] ?? '';

  const links = [...localLinksBlock.matchAll(/<li>([\s\S]*?)<\/li>/gi)]
    .map((match) => {
      const itemHtml = match[1];
      const anchors = [...itemHtml.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)]
        .map((anchorMatch) => ({
          label: normalizeText(anchorMatch[2]),
          href: normalizeUrl(anchorMatch[1], entry.pageUrl),
        }))
        .filter((anchor) => anchor.label && anchor.href);

      const label = anchors[0]?.label ?? normalizeInlineHtml(itemHtml);
      return {
        label,
        links: anchors,
      };
    })
    .filter((item) => item.label && item.links.length);

  return {
    ...entry,
    normalizedName: normalizeName(entry.name),
    seat,
    links,
    linkMap: buildParishLinkMap(links),
  };
}

function parseMunicipalityRoster(html) {
  const markerIndex = html.indexOf('btn_ResultsGrid_2_Sort_Roster');
  if (markerIndex < 0) {
    return [];
  }

  const afterMarker = html.slice(markerIndex);
  const tbodyMatches = [...afterMarker.matchAll(/<tbody>([\s\S]*?)<\/tbody>/g)];
  const rosterBlock = tbodyMatches.at(-1)?.[1] ?? '';

  return [...rosterBlock.matchAll(/<td>([\s\S]*?)<\/td>/g)]
    .map((match) => normalizeInlineHtml(match[1]))
    .filter((value) => value && !/there are no records/i.test(value))
    .map((value) => {
      const [rawName, ...rawTitle] = value.split(' - ');
      const title = rawTitle.join(' - ').trim();

      return {
        name: rawName?.replace(/^Honorable\s+/i, '').trim() ?? value,
        title: title || 'Staff',
        fullText: value,
      };
    });
}

function classifyMunicipalContacts(roster) {
  const categories = {
    administration: pickEntries(
      roster,
      /(mayor|administrator|manager|chief administrative|chief of staff|administrative|executive assistant|secretary|revenue|finance|business office|personnel|human resources)/i,
    ),
    clerk: pickEntries(roster, /(city clerk|town clerk|village clerk|clerk)/i),
    publicWorks: pickEntries(
      roster,
      /(public works|traffic|drainage|sanitation|waste|wastewater|sewer|\bstreets?\b|\broads?\b)/i,
      /main street/i,
    ),
    water: pickEntries(
      roster,
      /(water|sewer|wastewater|utility clerk|utilities sec|utility superintendent|water operator|water plant|public works)/i,
    ),
    utilities: pickEntries(
      roster,
      /(utility|utilities|electrical|electric|gas|power)/i,
    ),
    electric: pickEntries(roster, /(electric|electrical|power)/i),
    gas: pickEntries(roster, /\bgas\b/i),
    permits: pickEntries(
      roster,
      /(codes?|permit|inspector|inspection|building|zoning|planning|development)/i,
    ),
    police: pickEntries(roster, /(police|marshal)/i),
    fire: pickEntries(roster, /\bfire\b/i),
  };

  return categories;
}

function buildParishLinkMap(links) {
  const getHref = (pattern) =>
    links.find((entry) => pattern.test(entry.label))?.links?.[0]?.href ?? null;

  return {
    assessor: getHref(/assessor/i),
    clerk: getHref(/clerk/i),
    emergency: getHref(/emergency preparedness/i),
    fireDistricts: getHref(/fire protection district/i),
    justiceCourt: getHref(/justices of the peace/i),
    library: getHref(/library/i),
    localGovernment: getHref(/local government/i),
    omv: getHref(/motor vehicles/i),
    registrar: getHref(/registrar of voters/i),
    schools: getHref(/school district/i),
    sheriff: getHref(/sheriff/i),
    house: getHref(/state representatives/i),
    senate: getHref(/state senators/i),
  };
}

function pickEntries(roster, pattern, excludePattern = null) {
  return roster.filter(
    (entry) =>
      (pattern.test(entry.title) || pattern.test(entry.fullText)) &&
      !(excludePattern && (excludePattern.test(entry.title) || excludePattern.test(entry.fullText))),
  );
}

async function postBackShowAll(url, initialResponse, eventTarget) {
  const html =
    typeof initialResponse === 'string' ? initialResponse : initialResponse.html;
  const cookies =
    typeof initialResponse === 'string'
      ? ''
      : initialResponse.cookies.map((value) => value.split(';')[0]).join('; ');

  const fields = {
    __VIEWSTATE: getHiddenInput(html, '__VIEWSTATE'),
    __VIEWSTATEGENERATOR: getHiddenInput(html, '__VIEWSTATEGENERATOR'),
    __EVENTVALIDATION: getHiddenInput(html, '__EVENTVALIDATION'),
    __VIEWSTATEENCRYPTED: getHiddenInput(html, '__VIEWSTATEENCRYPTED'),
    __EVENTTARGET: eventTarget,
    __EVENTARGUMENT: '',
    'ctl01$lastClickedElementId': '',
    'ctl01$ScriptManager1': '',
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      referer: url,
      cookie: cookies,
    },
    body: new URLSearchParams(fields),
  });

  if (!response.ok) {
    throw new Error(`Postback failed for ${url}: ${response.status}`);
  }

  return {
    html: await response.text(),
    cookies: response.headers.getSetCookie?.() ?? [],
  };
}

async function fetchHtml(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return {
    html: await response.text(),
    cookies: response.headers.getSetCookie?.() ?? [],
  };
}

function getHiddenInput(html, name) {
  return (
    html.match(
      new RegExp(
        `<input[^>]+name="${name.replace(/[$]/g, '\\$&')}"[^>]+value="([\\s\\S]*?)"`,
        'i',
      ),
    )?.[1] ?? ''
  );
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const results = new Array(items.length);
  let currentIndex = 0;

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (currentIndex < items.length) {
      const itemIndex = currentIndex;
      currentIndex += 1;

      try {
        results[itemIndex] = await mapper(items[itemIndex], itemIndex);
      } catch (error) {
        console.warn(`Failed item ${itemIndex + 1}:`, error.message);
        results[itemIndex] = null;
      }
    }
  });

  await Promise.all(workers);
  return results.filter(Boolean);
}

function normalizeName(value) {
  const normalized = normalizeText(value)?.toLowerCase() ?? '';

  return normalized
    .replace(/\bsaint\b/g, 'st')
    .replace(/[^a-z0-9]+/g, '')
    .trim();
}

function normalizeInlineHtml(value) {
  return decodeHtmlEntities(String(value))
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .replace(/[>\u00a0]+/g, ' ')
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');
}

function normalizeText(value) {
  if (!value) {
    return null;
  }

  return decodeHtmlEntities(String(value))
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeUrl(value, baseUrl) {
  const text = normalizeText(value);
  if (!text) {
    return null;
  }

  try {
    return new URL(text, baseUrl).href;
  } catch {
    return null;
  }
}

function normalizePhone(value) {
  const text = normalizeText(value);
  if (!text) {
    return null;
  }

  const digits = text.replace(/\D/g, '');
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return text;
}

function decodeHtmlEntities(value) {
  return String(value)
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, number) =>
      String.fromCodePoint(Number.parseInt(number, 10)),
    )
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'")
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&hellip;', '...');
}
