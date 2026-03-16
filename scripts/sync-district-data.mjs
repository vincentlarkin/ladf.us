import fs from 'node:fs/promises';
import path from 'node:path';
import shp from 'shpjs';
import simplify from '@turf/simplify';

const rootDir = process.cwd();
const dataDir = path.join(rootDir, 'public', 'data');

const SOURCES = {
  louisianaOutline:
    "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/38/query?where=GEOID%3D%2722%27&outFields=NAME%2CBASENAME%2CGEOID&returnGeometry=true&f=geojson",
  louisianaParishes:
    "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/39/query?where=STATE%3D%2722%27&outFields=NAME%2CBASENAME%2CSTATE%2CCOUNTY%2CGEOID&returnGeometry=true&f=geojson",
  louisianaPlaces:
    "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Places_CouSub_ConCity_SubMCD/MapServer/18/query?where=STATE%3D%2722%27&outFields=NAME%2CBASENAME%2CSTATE%2CGEOID%2CPLACE&returnGeometry=true&f=geojson",
  shreveportBoundary:
    "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Places_CouSub_ConCity_SubMCD/MapServer/18/query?where=STATE%3D%2722%27%20AND%20BASENAME%3D%27Shreveport%27&outFields=NAME%2CBASENAME%2CSTATE%2CGEOID%2CPLACE&returnGeometry=true&f=geojson",
  louisianaHouse:
    "https://redist.legis.la.gov/2023_07/Adopted%20Plans%20From%20the%202022%201st%20Extraordinary%20Session/House/Shapefiles%20and%20KML%20Files/HB14_House_221ES.zip",
  louisianaSenate:
    "https://redist.legis.la.gov/2023_07/Adopted%20Plans%20From%20the%202022%201st%20Extraordinary%20Session/Senate/Shapefiles%20and%20KML%20Files/SB1_Senate_221ES.zip",
  louisianaCongress:
    "https://redist.legis.la.gov/2024_Files/Act2Congress/Shapefile/Act_2_1st_ES_%282024%29_-_Congress.zip",
  caddoCommission:
    "https://www.arcgis.com/sharing/rest/content/items/eed539128bac4942b8572b0daa308114/data?f=json",
  shreveportCouncil:
    "https://services3.arcgis.com/cEsSI6IR59h5UGE4/arcgis/rest/services/Shreveport_City_Council_Districts/FeatureServer/37/query?where=1%3D1&outFields=*&returnGeometry=true&f=geojson",
  caddoSchoolBoard:
    "https://utility.arcgis.com/usrsvcs/servers/c4f9a0d0704a487ca45b89f883887696/rest/services/Educational/Caddo_Parish_School_Board_Districts/MapServer/0/query?where=1%3D1&outFields=*&returnGeometry=true&f=geojson",
  houseRoster: 'https://house.louisiana.gov/H_Reps/H_Reps_FullInfo',
  senateRoster: 'https://senate.la.gov/Senators_FullInfo',
  usHouseDirectory: 'https://www.house.gov/representatives',
  caddoSchoolBoardMembers: 'https://www.caddoschools.org/page/board-members',
  shreveportCouncilPage: 'https://www.shreveportla.gov/201/City-Council',
  shreveportCouncilOffice: 'https://www.shreveportla.gov/directory.aspx?DID=4',
};

const SHREVEPORT_CITY_CONTACT = {
  __contactOrganization: 'Shreveport City Council Office',
  __contactAddress: '505 Travis St.\nShreveport, LA 71101',
  __contactPhone: '318-673-5262',
  __contactFax: '318-673-5270',
  __contactEmail: 'council@shreveportla.gov',
  __officialWebsite: SOURCES.shreveportCouncilPage,
  __officeDirectoryUrl: SOURCES.shreveportCouncilOffice,
};

const CADDO_PARISH_CONTACT = {
  __contactOrganization: 'Caddo Parish Commission',
  __contactAddress: '505 Travis Street, Suite 110\nShreveport, LA 71101',
  __officialWebsite: 'https://caddo.gov/commissioners/',
};

// Based on the official Caddo Parish Commission contact sheet published at:
// https://caddo.gov/wp-content/uploads/2025/02/2024-Commissioner-Contact-Info-Public.pdf
const CADDO_COMMISSION_CONTACTS = new Map(
  Object.entries({
    1: {
      __contactAddress: '505 Travis Street, Suite 110\nShreveport, LA 71101',
      __contactEmail: 'ckracman@caddo.org',
      __officialWebsite: 'https://caddo.gov/commissioners/district-1/',
    },
    2: {
      __contactAddress: '505 Travis Street, Suite 110\nShreveport, LA 71101',
      __contactEmail: 'gyoung@caddo.org',
      __officialWebsite: 'https://caddo.gov/commissioners/district-2/',
    },
    3: {
      __contactAddress: '505 Travis Street, Suite 110\nShreveport, LA 71101',
      __contactEmail: 'vthomas@caddo.org',
      __officialWebsite: 'https://caddo.gov/commissioners/district-3/',
    },
    4: {
      __contactAddress: '505 Travis Street, Suite 110\nShreveport, LA 71101',
      __contactEmail: 'jpyoung@caddo.org',
      __officialWebsite: 'https://caddo.gov/commissioners/district-4/',
    },
    5: {
      __contactAddress: '505 Travis Street, Suite 110\nShreveport, LA 71101',
      __contactPhone: '318-207-0540',
      __contactEmail: 'rburrell@caddo.org',
      __officialWebsite: 'https://caddo.gov/commissioners/district-5/',
    },
    6: {
      __contactAddress: '505 Travis Street, Suite 110\nShreveport, LA 71101',
      __contactEmail: 'sjones@caddo.org',
      __officialWebsite: 'https://caddo.gov/commissioners/district-6/',
    },
    7: {
      __contactAddress: '505 Travis Street, Suite 110\nShreveport, LA 71101',
      __contactPhone: '318-364-0334',
      __contactEmail: 'sgagewatts@caddo.org',
      __officialWebsite: 'https://caddo.gov/commissioners/district-7/',
    },
    8: {
      __contactAddress: '505 Travis Street, Suite 110\nShreveport, LA 71101',
      __contactEmail: 'gblake@caddo.org',
      __officialWebsite: 'https://caddo.gov/commissioners/district-8/',
    },
    9: {
      __contactAddress: '505 Travis Street, Suite 110\nShreveport, LA 71101',
      __contactEmail: 'john.atkins@caddo.org',
      __officialWebsite: 'https://caddo.gov/commissioners/district-9/',
    },
    10: {
      __contactAddress: '505 Travis Street, Suite 110\nShreveport, LA 71101',
      __contactPhone: '318-402-2793',
      __contactEmail: 'rcothran@caddo.org',
      __officialWebsite: 'https://caddo.gov/commissioners/district-10/',
    },
    11: {
      __contactAddress: '505 Travis Street, Suite 110\nShreveport, LA 71101',
      __contactPhone: '318-426-7554',
      __contactEmail: 'elazarus@caddo.org',
      __officialWebsite: 'https://caddo.gov/commissioners/district-11/',
    },
    12: {
      __contactAddress: '505 Travis Street, Suite 110\nShreveport, LA 71101',
      __contactPhone: '318-773-2654',
      __contactEmail: 'kepperson@caddo.org',
      __officialWebsite: 'https://caddo.gov/commissioners/district-12/',
    },
  }),
);

const manifest = {
  generatedAt: new Date().toISOString(),
  generator: 'scripts/sync-district-data.mjs',
  layers: [],
};

await fs.mkdir(dataDir, { recursive: true });

const supplementalContacts = await loadSupplementalContacts();

await syncLayer({
  id: 'louisiana-outline',
  label: 'Louisiana Outline',
  source: SOURCES.louisianaOutline,
  fileName: 'louisiana-outline.geojson',
  fetcher: fetchGeoJson,
  tolerance: 0.00004,
  transform: (featureCollection) =>
    enrichFeatures(featureCollection, () => ({
      __layerId: 'louisiana-outline',
      __districtKey: '22',
      __districtLabel: 'Louisiana',
      __representative: null,
      __interactive: false,
    })),
});

await syncLayer({
  id: 'louisiana-parishes',
  label: 'Louisiana Parishes',
  source: SOURCES.louisianaParishes,
  fileName: 'louisiana-parishes.geojson',
  fetcher: fetchGeoJson,
  tolerance: 0.00008,
  transform: (featureCollection) =>
    enrichFeatures(featureCollection, (properties) => ({
      __layerId: 'louisiana-parishes',
      __districtKey: properties.GEOID,
      __districtLabel: properties.NAME,
      __representative: null,
      __interactive: true,
      ...(properties.NAME === 'Caddo Parish' ? CADDO_PARISH_CONTACT : {}),
    })),
});

await syncLayer({
  id: 'louisiana-places',
  label: 'Louisiana Municipal Boundaries',
  source: SOURCES.louisianaPlaces,
  fileName: 'louisiana-places.geojson',
  fetcher: fetchGeoJson,
  tolerance: 0.00008,
  transform: (featureCollection) =>
    enrichFeatures(featureCollection, (properties) => ({
      __layerId: 'louisiana-places',
      __districtKey: properties.GEOID,
      __districtLabel: properties.BASENAME ?? properties.NAME,
      __representative: null,
      __interactive: true,
      ...(normalizeText(properties.BASENAME ?? properties.NAME) === 'Shreveport'
        ? supplementalContacts.shreveportMunicipality
        : {}),
    })),
});

await syncLayer({
  id: 'shreveport-boundary',
  label: 'Shreveport Boundary',
  source: SOURCES.shreveportBoundary,
  fileName: 'shreveport-boundary.geojson',
  fetcher: fetchGeoJson,
  tolerance: 0.00004,
  transform: (featureCollection) =>
    enrichFeatures(featureCollection, (properties) => ({
      __layerId: 'shreveport-boundary',
      __districtKey: properties.GEOID,
      __districtLabel: properties.NAME,
      __representative: null,
      __interactive: false,
    })),
});

await syncLayer({
  id: 'louisiana-house',
  label: 'Louisiana House Districts',
  source: SOURCES.louisianaHouse,
  fileName: 'louisiana-house.geojson',
  fetcher: fetchShapefileGeoJson,
  tolerance: 0.00004,
  transform: (featureCollection) =>
    enrichFeatures(featureCollection, (properties) => ({
      __layerId: 'louisiana-house',
      __districtKey: String(properties.DISTRICT_I),
      __districtLabel: properties.NAME,
      __representative: null,
      __interactive: true,
      ...supplementalContacts.house.get(String(properties.DISTRICT_I)),
    })),
});

await syncLayer({
  id: 'louisiana-senate',
  label: 'Louisiana Senate Districts',
  source: SOURCES.louisianaSenate,
  fileName: 'louisiana-senate.geojson',
  fetcher: fetchShapefileGeoJson,
  tolerance: 0.00004,
  transform: (featureCollection) =>
    enrichFeatures(featureCollection, (properties) => ({
      __layerId: 'louisiana-senate',
      __districtKey: String(properties.DISTRICT_I),
      __districtLabel: properties.NAME,
      __representative: null,
      __interactive: true,
      ...supplementalContacts.senate.get(String(properties.DISTRICT_I)),
    })),
});

await syncLayer({
  id: 'louisiana-congress',
  label: 'Louisiana Congressional Districts',
  source: SOURCES.louisianaCongress,
  fileName: 'louisiana-congress.geojson',
  fetcher: fetchShapefileGeoJson,
  tolerance: 0.00004,
  transform: (featureCollection) =>
    enrichFeatures(featureCollection, (properties) => ({
      __layerId: 'louisiana-congress',
      __districtKey: String(properties.DISTRICT_I),
      __districtLabel: properties.NAME,
      __representative: null,
      __interactive: true,
      ...supplementalContacts.congress.get(String(properties.DISTRICT_I)),
    })),
});

await syncLayer({
  id: 'caddo-commission',
  label: 'Caddo Parish Commission Districts',
  source: SOURCES.caddoCommission,
  fileName: 'caddo-commission.geojson',
  fetcher: fetchCaddoCommissionGeoJson,
  tolerance: 0.00003,
  transform: (featureCollection) =>
    enrichFeatures(featureCollection, (properties) => ({
      __layerId: 'caddo-commission',
      __districtKey: String(properties.DISTRICT),
      __districtLabel: properties.NAME ?? `District ${properties.DISTRICT}`,
      __representative: properties.Commission ?? null,
      __interactive: true,
      ...CADDO_COMMISSION_CONTACTS.get(String(properties.DISTRICT)),
    })),
});

await syncLayer({
  id: 'shreveport-council',
  label: 'Shreveport City Council Districts',
  source: SOURCES.shreveportCouncil,
  fileName: 'shreveport-council.geojson',
  fetcher: fetchGeoJson,
  tolerance: 0.00003,
  transform: (featureCollection) =>
    enrichFeatures(featureCollection, (properties) => ({
      __layerId: 'shreveport-council',
      __districtKey: String(properties.DISTRICT),
      __districtLabel: `District ${properties.DISTRICT}`,
      __representative: properties.MEMBER ?? null,
      __interactive: true,
      __contactOrganization: 'Shreveport City Council',
      __contactAddress: normalizeAddressHtml(properties.ADDRESS),
      __contactPhone: normalizePhone(properties.PHONE),
      __contactFax: normalizePhone(properties.FAX),
      __contactEmail: normalizeEmail(properties.EMAIL),
      __officialWebsite:
        supplementalContacts.shreveportCouncilDirectory.get(
          String(properties.DISTRICT).trim().toUpperCase(),
        ) ?? SOURCES.shreveportCouncilPage,
      __officeAddress: supplementalContacts.shreveportCouncilOffice.__contactAddress,
      __officePhone: supplementalContacts.shreveportCouncilOffice.__contactPhone,
      __officeFax: supplementalContacts.shreveportCouncilOffice.__contactFax,
      __officeEmail: supplementalContacts.shreveportCouncilOffice.__contactEmail,
      __officeDirectoryUrl:
        supplementalContacts.shreveportCouncilOffice.__officeDirectoryUrl,
    })),
});

await syncLayer({
  id: 'caddo-school-board',
  label: 'Caddo Parish School Board Districts',
  source: SOURCES.caddoSchoolBoard,
  fileName: 'caddo-school-board.geojson',
  fetcher: fetchGeoJson,
  tolerance: 0.00003,
  transform: (featureCollection) =>
    enrichFeatures(featureCollection, (properties) => ({
      __layerId: 'caddo-school-board',
      __districtKey: String(properties.DISTRICT),
      __districtLabel: `District ${properties.DISTRICT}`,
      __representative: properties.NAME ?? null,
      __interactive: true,
      ...supplementalContacts.schoolBoard.get(String(properties.DISTRICT)),
    })),
});

await fs.writeFile(
  path.join(dataDir, 'manifest.json'),
  JSON.stringify(manifest),
  'utf8',
);

console.log(`Saved ${manifest.layers.length} layer files to ${dataDir}`);

async function loadSupplementalContacts() {
  const results = await Promise.allSettled([
    fetchLouisianaHouseContacts(),
    fetchLouisianaSenateContacts(),
    fetchUsHouseContacts(),
    fetchCaddoSchoolBoardContacts(),
    fetchShreveportCouncilDirectoryLinks(),
    fetchShreveportCouncilOffice(),
  ]);

  const [
    houseResult,
    senateResult,
    congressResult,
    schoolBoardResult,
    shreveportDirectoryResult,
    shreveportOfficeResult,
  ] = results;

  return {
    house: unwrapMapResult(houseResult, 'Louisiana House roster'),
    senate: unwrapMapResult(senateResult, 'Louisiana Senate roster'),
    congress: unwrapMapResult(congressResult, 'U.S. House directory'),
    schoolBoard: unwrapMapResult(schoolBoardResult, 'Caddo school board page'),
    shreveportCouncilDirectory: unwrapMapResult(
      shreveportDirectoryResult,
      'Shreveport council page',
    ),
    shreveportCouncilOffice: unwrapObjectResult(
      shreveportOfficeResult,
      'Shreveport council office',
    ),
    shreveportMunicipality: {
      ...SHREVEPORT_CITY_CONTACT,
      ...unwrapObjectResult(shreveportOfficeResult, 'Shreveport council office'),
    },
  };
}

function unwrapMapResult(result, label) {
  if (result.status === 'fulfilled') {
    return result.value;
  }

  console.warn(`${label} sync failed:`, result.reason);
  return new Map();
}

function unwrapObjectResult(result, label) {
  if (result.status === 'fulfilled') {
    return result.value;
  }

  console.warn(`${label} sync failed:`, result.reason);
  return {};
}

async function syncLayer(config) {
  console.log(`Syncing ${config.label}...`);

  const rawFeatureCollection = await config.fetcher(config.source);
  const transformedFeatureCollection = config.transform
    ? config.transform(rawFeatureCollection)
    : rawFeatureCollection;
  const simplifiedFeatureCollection = config.tolerance
    ? simplify(structuredClone(transformedFeatureCollection), {
        tolerance: config.tolerance,
        highQuality: false,
        mutate: true,
      })
    : structuredClone(transformedFeatureCollection);
  const normalizedFeatureCollection = roundGeoJson(
    simplifiedFeatureCollection,
    6,
  );

  await fs.writeFile(
    path.join(dataDir, config.fileName),
    JSON.stringify(normalizedFeatureCollection),
    'utf8',
  );

  manifest.layers.push({
    id: config.id,
    label: config.label,
    file: `/data/${config.fileName}`,
    source: config.source,
    featureCount: normalizedFeatureCollection.features.length,
  });
}

async function fetchGeoJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.json();
}

async function fetchText(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.text();
}

async function fetchShapefileGeoJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  const parsed = await shp(await response.arrayBuffer());
  return Array.isArray(parsed) ? parsed[0] : parsed;
}

async function fetchCaddoCommissionGeoJson(url) {
  const webMap = await fetchGeoJson(url);
  const collection =
    webMap?.operationalLayers?.[0]?.featureCollection?.layers?.[0];

  if (!collection?.featureSet?.features) {
    throw new Error('Caddo commission feature collection missing geometry.');
  }

  return {
    type: 'FeatureCollection',
    features: collection.featureSet.features.map((feature) => ({
      type: 'Feature',
      geometry: arcgisPolygonToGeoJson(feature.geometry),
      properties: feature.attributes,
    })),
  };
}

async function fetchLouisianaHouseContacts() {
  const html = await fetchText(SOURCES.houseRoster);
  return parseLegislatorCards(html, SOURCES.houseRoster);
}

async function fetchLouisianaSenateContacts() {
  const html = await fetchText(SOURCES.senateRoster);
  return parseLegislatorCards(html, SOURCES.senateRoster);
}

async function fetchUsHouseContacts() {
  const html = await fetchText(SOURCES.usHouseDirectory);
  const louisianaTable = html.match(
    /<caption[^>]*>\s*Louisiana\s*<\/caption>[\s\S]*?<tbody>([\s\S]*?)<\/tbody>/i,
  )?.[1];

  if (!louisianaTable) {
    throw new Error('Louisiana delegation table not found on house.gov.');
  }

  const contacts = new Map();
  const rows = louisianaTable.split('<tr>').slice(1);

  for (const row of rows) {
    const district = normalizeDistrictOrdinal(
      row.match(/views-field-value-2[^>]*>([^<]+)/i)?.[1],
    );
    if (!district) {
      continue;
    }

    contacts.set(district, {
      __representative: normalizeOfficeHolderName(
        row.match(/views-field-value-4[\s\S]*?<a href="([^"]+)">([^<]+)/i)?.[2],
      ),
      __party: normalizeParty(
        row.match(/views-field-value-7[^>]*>([^<]+)/i)?.[1],
      ),
      __contactPhone: normalizeText(
        row.match(/views-field-value-10[^>]*>([^<]+)/i)?.[1],
      ),
      __officeRoom: normalizeText(
        row.match(/views-field-value-9[^>]*>([^<]+)/i)?.[1],
      ),
      __officialWebsite: normalizeUrl(
        row.match(/views-field-value-4[\s\S]*?<a href="([^"]+)">/i)?.[1],
        SOURCES.usHouseDirectory,
      ),
    });
  }

  return contacts;
}

async function fetchCaddoSchoolBoardContacts() {
  let html = await fetchText(SOURCES.caddoSchoolBoardMembers);
  html = decodeCmsEscapedContent(html);

  const contacts = new Map();

  for (let district = 1; district <= 12; district += 1) {
    const marker = `District ${district}`;
    const index = html.indexOf(marker);

    if (index < 0) {
      continue;
    }

    const headingStart = html.lastIndexOf('<h3', index);
    const snippetStart = headingStart >= 0 ? headingStart : index;
    const snippet = html.slice(snippetStart, index + 1600);

    const name = snippet.match(/<h3(?:><span>|>)([^<]+)(?:<\/span>)?<\/h3>/i)?.[1];
    const addressHtml =
      snippet.match(
        new RegExp(`District\\s*${district}<br>([\\s\\S]*?)<\\/p><p>Tel:`, 'i'),
      )?.[1] ?? '';
    const cleanedAddressHtml = addressHtml
      .replace(/<a[^>]*>[\s\S]*?<\/a>/gi, '')
      .replace(/<\/?em>/gi, '');
    const address = normalizeAddressHtml(cleanedAddressHtml);
    const phone = normalizePhone(snippet.match(/Tel:\s*([^<"]+)/i)?.[1]);
    const email = normalizeEmail(snippet.match(/mailto:([^"]+)/i)?.[1]);
    const mapUrl = normalizeUrl(
      snippet.match(/https:\/\/www\.google\.com\/maps[^"\\]+/i)?.[0],
      SOURCES.caddoSchoolBoardMembers,
    );

    contacts.set(String(district), {
      __representative: normalizeOfficeHolderName(name),
      __contactAddress: address,
      __contactPhone: phone,
      __contactEmail: email,
      __officialWebsite: SOURCES.caddoSchoolBoardMembers,
      __districtMapUrl: mapUrl,
      __contactOrganization: 'Caddo Parish School Board',
    });
  }

  return contacts;
}

async function fetchShreveportCouncilDirectoryLinks() {
  const html = await fetchText(SOURCES.shreveportCouncilPage);
  const links = new Map();
  const matches = html.matchAll(
    /href="(https:\/\/www\.shreveportla\.gov\/directory\.aspx\?EID=\d+)"[^>]*>\s*District\s*([A-G])\s*-\s*([^<]+)/gi,
  );

  for (const match of matches) {
    links.set(match[2].trim().toUpperCase(), match[1]);
  }

  return links;
}

async function fetchShreveportCouncilOffice() {
  const html = await fetchText(SOURCES.shreveportCouncilOffice);
  const address = normalizeAddressHtml(
    html.match(
      /<label>Physical Address:<\/label><p>([\s\S]*?)<\/p><label>Phone:/i,
    )?.[1] ?? '',
  );
  const phone = normalizePhone(
    html.match(/<label>Phone:<\/label><p><a href="tel:[^"]+">([^<]+)<\/a>/i)?.[1],
  );
  const fax = normalizePhone(
    html.match(/<label>Fax:<\/label><p>([^<]+)<\/p>/i)?.[1],
  );
  const mailbox = html.match(/var wsd="([^"]+)";[\s\S]*?var xsd="([^"]+)";/i);
  const email =
    mailbox?.[1] && mailbox?.[2]
      ? `${mailbox[1].trim()}@${mailbox[2].trim()}`
      : null;

  return {
    __contactAddress: address,
    __contactPhone: phone,
    __contactFax: fax,
    __contactEmail: email,
    __officialWebsite: SOURCES.shreveportCouncilPage,
    __officeDirectoryUrl: SOURCES.shreveportCouncilOffice,
  };
}

function parseLegislatorCards(html, baseUrl) {
  const fieldsets = html.split('<fieldset>').slice(1);
  const contacts = new Map();

  for (const fieldset of fieldsets) {
    const district = normalizeDistrictNumber(
      fieldset.match(/DISTRICTNUMBERLabel[^>]*>([^<]*)/i)?.[1],
    );

    if (!district) {
      continue;
    }

    const name = normalizeOfficeHolderName(
      fieldset.match(/LASTFIRSTLabel[^>]*>([^<]*)/i)?.[1],
    );
    const party = normalizeParty(
      fieldset.match(/PARTYAFFILIATIONLabel[^>]*>([^<]*)/i)?.[1],
    );
    const address = normalizeAddressHtml(
      fieldset.match(/OFFICEADDRESSLabel[^>]*>([\s\S]*?)<\/span>/i)?.[1],
    );
    const phone = normalizePhone(
      fieldset.match(/DISTRICTOFFICEPHONELabel[^>]*>([^<]*)/i)?.[1],
    );
    const email = normalizeEmail(fieldset.match(/href="mailto:([^"]*)"/i)?.[1]);
    const memberUrl = normalizeUrl(
      fieldset.match(/<a class="legnamelink" href="([^"]+)"/i)?.[1],
      baseUrl,
    );

    contacts.set(district, {
      __representative: name,
      __party: party,
      __contactAddress: address,
      __contactPhone: phone,
      __contactEmail: email,
      __officialWebsite: memberUrl ?? baseUrl,
      __contactStatus:
        name?.toLowerCase().includes('vacant') ? 'Vacant seat' : null,
    });
  }

  return contacts;
}

function enrichFeatures(featureCollection, decorate) {
  return {
    ...featureCollection,
    features: featureCollection.features.map((feature, index) => ({
      ...feature,
      properties: {
        ...feature.properties,
        ...decorate(feature.properties, index),
      },
    })),
  };
}

function roundGeoJson(featureCollection, precision = 6) {
  return {
    ...featureCollection,
    features: featureCollection.features.map((feature) => ({
      ...feature,
      geometry: roundGeometry(feature.geometry, precision),
    })),
  };
}

function roundGeometry(geometry, precision) {
  if (!geometry) {
    return geometry;
  }

  return {
    ...geometry,
    coordinates: roundCoordinates(geometry.coordinates, precision),
  };
}

function roundCoordinates(coordinates, precision) {
  if (!Array.isArray(coordinates)) {
    return coordinates;
  }

  if (typeof coordinates[0] === 'number') {
    return coordinates.map((value) => Number(value.toFixed(precision)));
  }

  return coordinates.map((value) => roundCoordinates(value, precision));
}

function arcgisPolygonToGeoJson(geometry) {
  const polygons = [];
  let currentPolygon = null;

  for (const ring of geometry.rings ?? []) {
    const convertedRing = closeRing(
      ring.map(([x, y]) => mercatorToLngLat(x, y)),
    );

    if (convertedRing.length < 4) {
      continue;
    }

    if (signedRingArea(convertedRing) < 0 || !currentPolygon) {
      currentPolygon = [convertedRing];
      polygons.push(currentPolygon);
    } else {
      currentPolygon.push(convertedRing);
    }
  }

  if (!polygons.length) {
    throw new Error('No valid polygon rings found in ArcGIS geometry.');
  }

  return polygons.length === 1
    ? {
        type: 'Polygon',
        coordinates: polygons[0],
      }
    : {
        type: 'MultiPolygon',
        coordinates: polygons,
      };
}

function closeRing(ring) {
  if (!ring.length) {
    return ring;
  }

  const [firstLng, firstLat] = ring[0];
  const [lastLng, lastLat] = ring[ring.length - 1];

  if (firstLng === lastLng && firstLat === lastLat) {
    return ring;
  }

  return [...ring, ring[0]];
}

function signedRingArea(ring) {
  let area = 0;

  for (let index = 0; index < ring.length - 1; index += 1) {
    const [x1, y1] = ring[index];
    const [x2, y2] = ring[index + 1];
    area += x1 * y2 - x2 * y1;
  }

  return area / 2;
}

function mercatorToLngLat(x, y) {
  const originShift = 20037508.342789244;
  const lng = (x / originShift) * 180;
  const lat =
    (180 / Math.PI) *
    (2 * Math.atan(Math.exp((y / originShift) * Math.PI)) - Math.PI / 2);

  return [lng, lat];
}

function normalizeText(value) {
  if (!value) {
    return null;
  }

  return decodeHtmlEntities(String(value))
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeAddressHtml(value) {
  if (!value) {
    return null;
  }

  const lines = decodeHtmlEntities(String(value))
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  return lines.length ? lines.join('\n') : null;
}

function normalizeDistrictNumber(value) {
  const text = normalizeText(value);
  if (!text) {
    return null;
  }

  const match = text.match(/\d+/);
  return match ? String(Number(match[0])) : null;
}

function normalizeDistrictOrdinal(value) {
  const text = normalizeText(value);
  if (!text) {
    return null;
  }

  const match = text.match(/\d+/);
  return match ? String(Number(match[0])) : null;
}

function normalizeParty(value) {
  const text = normalizeText(value);
  if (!text) {
    return null;
  }

  if (text === 'R') {
    return 'Republican';
  }

  if (text === 'D') {
    return 'Democrat';
  }

  return text;
}

function normalizePhone(value) {
  const text = normalizeText(value);
  if (!text) {
    return null;
  }

  const digits = text.replace(/\D/g, '');
  if (digits.length === 7) {
    return `318-${digits.slice(0, 3)}-${digits.slice(3)}`;
  }

  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return text;
}

function normalizeEmail(value) {
  const text = normalizeText(value)?.replace(/\\+$/g, '');
  return text || null;
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

function normalizeOfficeHolderName(value) {
  const text = normalizeText(value);

  if (!text) {
    return null;
  }

  if (!text.includes(',') || text.toLowerCase().includes('vacant')) {
    return text;
  }

  const [last, ...rest] = text.split(',');
  const given = rest.join(',').trim();
  return given ? `${given} ${last.trim()}` : text;
}

function decodeCmsEscapedContent(value) {
  return value
    .replaceAll('\\u002F', '/')
    .replaceAll('\\u003C', '<')
    .replaceAll('\\u003E', '>')
    .replaceAll('\\u0026', '&')
    .replace(/\\"/g, '"');
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
