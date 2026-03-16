import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

const LOUISIANA_SEARCH_EXTENT = '-94.05,28.82,-88.72,33.12';

const lookupDefinitions = [
  {
    id: 'louisiana-places',
    label: 'Municipality',
    file: '/data/louisiana-places.geojson',
    sortOrder: 10,
  },
  {
    id: 'louisiana-parishes',
    label: 'Parish',
    file: '/data/louisiana-parishes.geojson',
    sortOrder: 20,
  },
  {
    id: 'caddo-commission',
    label: 'Parish commission',
    file: '/data/caddo-commission.geojson',
    sortOrder: 25,
  },
  {
    id: 'shreveport-council',
    label: 'City council',
    file: '/data/shreveport-council.geojson',
    sortOrder: 30,
  },
  {
    id: 'caddo-school-board',
    label: 'School board',
    file: '/data/caddo-school-board.geojson',
    sortOrder: 35,
  },
  {
    id: 'louisiana-house',
    label: 'State House',
    file: '/data/louisiana-house.geojson',
    sortOrder: 40,
  },
  {
    id: 'louisiana-senate',
    label: 'State Senate',
    file: '/data/louisiana-senate.geojson',
    sortOrder: 50,
  },
  {
    id: 'louisiana-congress',
    label: 'Congress',
    file: '/data/louisiana-congress.geojson',
    sortOrder: 60,
  },
];

export async function loadLookupContext() {
  const [serviceDirectory, ...collections] = await Promise.all([
    fetchJson('/data/service-directory.json'),
    ...lookupDefinitions.map((definition) => fetchJson(definition.file)),
  ]);

  const layers = lookupDefinitions.map((definition, index) => ({
    definition,
    featureCollection: collections[index],
    entries: collections[index].features.map((feature) => ({
      feature,
      bbox: getBoundingBox(feature.geometry),
    })),
  }));

  return {
    serviceDirectory,
    layers,
  };
}

export async function geocodeLouisianaQuery(query) {
  const url = new URL(
    'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates',
  );

  url.searchParams.set('SingleLine', query);
  url.searchParams.set('maxLocations', '1');
  url.searchParams.set('outFields', 'Match_addr,Addr_type');
  url.searchParams.set('sourceCountry', 'USA');
  url.searchParams.set('searchExtent', LOUISIANA_SEARCH_EXTENT);
  url.searchParams.set('f', 'pjson');

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Geocoder failed with ${response.status}`);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];

  if (!candidate?.location) {
    throw new Error('No geocoding result.');
  }

  return {
    address: candidate.address,
    latitude: candidate.location.y,
    longitude: candidate.location.x,
    score: candidate.score ?? null,
    matchType: candidate.attributes?.Addr_type ?? null,
  };
}

export function lookupLocation(context, latLng) {
  const point = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Point',
      coordinates: [latLng.lng, latLng.lat],
    },
  };

  return context.layers
    .flatMap((layer) =>
      layer.entries
        .filter(
          (entry) =>
            entry.bbox &&
            pointInsideBounds(entry.bbox, latLng) &&
            booleanPointInPolygon(point, entry.feature),
        )
        .map((entry) => ({
          ...layer.definition,
          feature: entry.feature,
        })),
    )
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

export function normalizeLookupName(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/\bsaint\b/g, 'st')
    .replace(/[^a-z0-9]+/g, '')
    .trim();
}

export function formatDistrictLabel(match) {
  return match.feature.properties.__districtLabel ?? match.label;
}

export function getMunicipalityMatch(matches) {
  return matches.find((match) => match.id === 'louisiana-places') ?? null;
}

export function getParishMatch(matches) {
  return matches.find((match) => match.id === 'louisiana-parishes') ?? null;
}

export function findMunicipalityServiceRecord(context, municipalityName) {
  const key = normalizeLookupName(municipalityName);
  return (
    context.serviceDirectory.municipalities.find(
      (record) => record.normalizedName === key,
    ) ?? null
  );
}

export function findParishServiceRecord(context, parishName) {
  const key = normalizeLookupName(parishName);
  return (
    context.serviceDirectory.parishes.find(
      (record) => record.normalizedName === key,
    ) ?? null
  );
}

export function renderAddressLines(value) {
  return String(value ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.json();
}

function pointInsideBounds(bounds, latLng) {
  return (
    latLng.lng >= bounds.minLng &&
    latLng.lng <= bounds.maxLng &&
    latLng.lat >= bounds.minLat &&
    latLng.lat <= bounds.maxLat
  );
}

function getBoundingBox(geometry) {
  const initialBounds = {
    minLng: Number.POSITIVE_INFINITY,
    minLat: Number.POSITIVE_INFINITY,
    maxLng: Number.NEGATIVE_INFINITY,
    maxLat: Number.NEGATIVE_INFINITY,
  };

  walkCoordinates(geometry.coordinates, ([lng, lat]) => {
    initialBounds.minLng = Math.min(initialBounds.minLng, lng);
    initialBounds.minLat = Math.min(initialBounds.minLat, lat);
    initialBounds.maxLng = Math.max(initialBounds.maxLng, lng);
    initialBounds.maxLat = Math.max(initialBounds.maxLat, lat);
  });

  return initialBounds.minLng === Number.POSITIVE_INFINITY
    ? null
    : initialBounds;
}

function walkCoordinates(coordinates, visitor) {
  if (!Array.isArray(coordinates)) {
    return;
  }

  if (typeof coordinates[0] === 'number') {
    visitor(coordinates);
    return;
  }

  coordinates.forEach((value) => walkCoordinates(value, visitor));
}
