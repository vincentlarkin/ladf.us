import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

const LOUISIANA_SEARCH_EXTENT = '-94.05,28.82,-88.72,33.12';
const MAJOR_CITY_PRESETS = [
  'Shreveport',
  'New Orleans',
  'Baton Rouge',
  'Lafayette',
  'Lake Charles',
  'Monroe',
  'Alexandria',
];

const DIRECTORY_LINKS = {
  louisianaLegislators: 'https://legis.la.gov/legis/FindMyLegislators.aspx',
  usHouse: 'https://www.house.gov/representatives/find-your-representative',
  shreveportCouncil: 'https://www.shreveportla.gov/201/City-Council',
  caddoCommission: 'https://caddo.gov/commissioners/',
  caddoSchoolBoard: 'https://www.caddoschools.org/page/board-members',
};

const localDemoLayerIds = [
  'caddo-commission',
  'shreveport-council',
  'caddo-school-board',
];

const layerDefinitions = [
  {
    id: 'louisiana-outline',
    label: 'Louisiana outline',
    group: 'Reference',
    file: '/data/louisiana-outline.geojson',
    visible: true,
    interactive: false,
    pane: 'outline',
    sortOrder: 0,
    style: {
      color: '#111111',
      weight: 1.6,
      fillOpacity: 0,
    },
  },
  {
    id: 'shreveport-boundary',
    label: 'Shreveport boundary',
    group: 'Reference',
    file: '/data/shreveport-boundary.geojson',
    visible: true,
    interactive: false,
    pane: 'boundary',
    minZoom: 9.25,
    sortOrder: 12,
    style: {
      color: '#555555',
      weight: 1.2,
      dashArray: '6 6',
      fillOpacity: 0,
    },
  },
  {
    id: 'louisiana-places',
    label: 'Municipal boundaries',
    group: 'Zoomed reference',
    file: '/data/louisiana-places.geojson',
    visible: true,
    interactive: true,
    pane: 'places',
    minZoom: 8.5,
    sortOrder: 10,
    style: {
      color: '#6f6f6f',
      weight: 0.9,
      dashArray: '2 4',
      fillOpacity: 0,
    },
    cardTitle: (feature) => feature.properties.__districtLabel,
    cardType: 'Municipality',
    purpose:
      'Shows the city or town that governs local ordinances, zoning, sanitation, and municipal services at this point.',
    contactFields: (feature) =>
      buildContactFields([
        ['Municipality', feature.properties.__districtLabel],
        ['Office', feature.properties.__contactOrganization],
        ['Address', feature.properties.__contactAddress],
        ['Phone', feature.properties.__contactPhone],
        ['Fax', feature.properties.__contactFax],
        ['Email', feature.properties.__contactEmail],
      ]),
    links: (feature) =>
      buildContactLinks([
        ['Official page', feature.properties.__officialWebsite],
        ['Office directory', feature.properties.__officeDirectoryUrl],
      ]),
    contactNote: (feature) =>
      feature.properties.__contactOrganization
        ? 'This is the citywide municipal jurisdiction. Separate city-council district lines can overlap inside the same city.'
        : 'Municipal boundaries are synced statewide, but direct city hall contacts are only wired where official directory data is available.',
  },
  {
    id: 'louisiana-parishes',
    label: 'Parishes',
    group: 'Statewide stack',
    file: '/data/louisiana-parishes.geojson',
    visible: true,
    interactive: true,
    pane: 'parishes',
    sortOrder: 20,
    style: {
      color: '#8b8b8b',
      weight: 0.8,
      fillColor: '#bbbbbb',
      fillOpacity: 0.03,
    },
    cardTitle: (feature) => feature.properties.__districtLabel,
    cardType: 'Parish',
    purpose:
      'Parish governments cover local administration, roads, courts, and other parish-level services.',
    contactFields: (feature) =>
      buildContactFields([
        ['Parish', feature.properties.__districtLabel],
        ['Office', feature.properties.__contactOrganization],
        ['Address', feature.properties.__contactAddress],
      ]),
    links: (feature) =>
      buildContactLinks([
        ['Official parish page', feature.properties.__officialWebsite],
      ]),
    contactNote: (feature) =>
      feature.properties.__contactOrganization
        ? 'This card shows the parishwide jurisdiction itself. Parish commission districts are listed separately where district lines are available.'
        : 'Parish boundaries are synced statewide, but parish contact directories are not wired statewide yet.',
  },
  {
    id: 'caddo-commission',
    label: 'Caddo commission',
    group: 'Shreveport demo layers',
    file: '/data/caddo-commission.geojson',
    visible: false,
    interactive: true,
    pane: 'local',
    minZoom: 9.75,
    sortOrder: 25,
    style: {
      color: '#bf7b30',
      weight: 1.7,
      fillColor: '#bf7b30',
      fillOpacity: 0.05,
    },
    cardTitle: (feature) => feature.properties.__districtLabel,
    cardType: 'Parish commission',
    purpose:
      'Parish commission districts affect parish roads, jail oversight, and parish administration in Caddo.',
    contactFields: (feature) =>
      buildContactFields([
        ['District', feature.properties.__districtLabel],
        ['Commissioner', feature.properties.__representative],
        ['Address', feature.properties.__contactAddress],
        ['Phone', feature.properties.__contactPhone],
        ['Email', feature.properties.__contactEmail],
      ]),
    links: (feature) =>
      buildContactLinks([
        ['Official district page', feature.properties.__officialWebsite],
        ['Commission directory', DIRECTORY_LINKS.caddoCommission],
      ]),
    contactNote:
      'Commission contact data is synced from the official public commissioner contact sheet and district pages where available.',
  },
  {
    id: 'shreveport-council',
    label: 'Shreveport council',
    group: 'Shreveport demo layers',
    file: '/data/shreveport-council.geojson',
    visible: false,
    interactive: true,
    pane: 'local',
    minZoom: 9.75,
    sortOrder: 30,
    style: {
      color: '#0055aa',
      weight: 1.8,
      fillColor: '#0055aa',
      fillOpacity: 0.06,
    },
    cardTitle: (feature) => feature.properties.__districtLabel,
    cardType: 'City council',
    purpose:
      'City council districts shape zoning, city ordinances, and local service priorities inside Shreveport.',
    contactFields: (feature) =>
      buildContactFields([
        ['District', feature.properties.__districtLabel],
        ['Council member', feature.properties.__representative],
        ['Address', feature.properties.__contactAddress],
        ['Phone', feature.properties.__contactPhone],
        ['Fax', feature.properties.__contactFax],
        ['Email', feature.properties.__contactEmail],
        ['Council office', feature.properties.__officeAddress],
        ['Office phone', feature.properties.__officePhone],
        ['Office email', feature.properties.__officeEmail],
      ]),
    links: (feature) =>
      buildContactLinks([
        ['Official member directory', feature.properties.__officialWebsite],
        ['Council office directory', feature.properties.__officeDirectoryUrl],
        ['Council page', DIRECTORY_LINKS.shreveportCouncil],
        ['District sheet', feature.properties.Pic_URL],
      ]),
  },
  {
    id: 'caddo-school-board',
    label: 'Caddo school board',
    group: 'Shreveport demo layers',
    file: '/data/caddo-school-board.geojson',
    visible: false,
    interactive: true,
    pane: 'local',
    minZoom: 9.75,
    sortOrder: 35,
    style: {
      color: '#4d7f37',
      weight: 1.7,
      fillColor: '#4d7f37',
      fillOpacity: 0.05,
    },
    cardTitle: (feature) => feature.properties.__districtLabel,
    cardType: 'School board',
    purpose:
      'School-board districts govern school leadership and education-tax representation in Caddo Parish.',
    contactFields: (feature) =>
      buildContactFields([
        ['District', feature.properties.__districtLabel],
        ['Board member', feature.properties.__representative],
        ['Address', feature.properties.__contactAddress],
        ['Phone', feature.properties.__contactPhone],
        ['Email', feature.properties.__contactEmail],
      ]),
    links: (feature) =>
      buildContactLinks([
        ['Board member page', feature.properties.__officialWebsite],
        ['District map', feature.properties.__districtMapUrl],
        ['Board members', DIRECTORY_LINKS.caddoSchoolBoard],
      ]),
    contactNote:
      'Board member addresses, direct phones, and emails are pulled from the official board-members page.',
  },
  {
    id: 'louisiana-house',
    label: 'LA House',
    group: 'Statewide stack',
    file: '/data/louisiana-house.geojson',
    visible: true,
    interactive: true,
    pane: 'house',
    sortOrder: 40,
    style: {
      color: '#0055aa',
      weight: 1.2,
      dashArray: '4 5',
      fillColor: '#0055aa',
      fillOpacity: 0.02,
    },
    cardTitle: (feature) => feature.properties.__districtLabel,
    cardType: 'State House',
    purpose:
      'Louisiana House districts shape state law, budget decisions, and constituent representation.',
    contactFields: (feature) =>
      buildContactFields([
        ['District', feature.properties.__districtLabel],
        ['Representative', feature.properties.__representative],
        ['Party', feature.properties.__party],
        ['Address', feature.properties.__contactAddress],
        ['Phone', feature.properties.__contactPhone],
        ['Email', feature.properties.__contactEmail],
        ['Status', feature.properties.__contactStatus],
      ]),
    links: (feature) =>
      buildContactLinks([
        ['Representative page', feature.properties.__officialWebsite],
        ['Louisiana legislator lookup', DIRECTORY_LINKS.louisianaLegislators],
      ]),
    contactNote:
      'Member names and district office contacts are synced from the Louisiana House full-information roster.',
  },
  {
    id: 'louisiana-senate',
    label: 'LA Senate',
    group: 'Statewide stack',
    file: '/data/louisiana-senate.geojson',
    visible: true,
    interactive: true,
    pane: 'senate',
    sortOrder: 50,
    style: {
      color: '#7a5b00',
      weight: 1.4,
      dashArray: '7 4',
      fillColor: '#7a5b00',
      fillOpacity: 0.02,
    },
    cardTitle: (feature) => feature.properties.__districtLabel,
    cardType: 'State Senate',
    purpose:
      'Louisiana Senate districts govern another layer of state representation and statewide legislation.',
    contactFields: (feature) =>
      buildContactFields([
        ['District', feature.properties.__districtLabel],
        ['Senator', feature.properties.__representative],
        ['Party', feature.properties.__party],
        ['Address', feature.properties.__contactAddress],
        ['Phone', feature.properties.__contactPhone],
        ['Email', feature.properties.__contactEmail],
        ['Status', feature.properties.__contactStatus],
      ]),
    links: (feature) =>
      buildContactLinks([
        ['Senator page', feature.properties.__officialWebsite],
        ['Louisiana legislator lookup', DIRECTORY_LINKS.louisianaLegislators],
      ]),
    contactNote:
      'Member names and district office contacts are synced from the Louisiana Senate full-information roster.',
  },
  {
    id: 'louisiana-congress',
    label: 'Congress',
    group: 'Statewide stack',
    file: '/data/louisiana-congress.geojson',
    visible: true,
    interactive: true,
    pane: 'congress',
    sortOrder: 60,
    style: {
      color: '#a0411e',
      weight: 1.6,
      fillColor: '#a0411e',
      fillOpacity: 0.03,
    },
    cardTitle: (feature) => feature.properties.__districtLabel,
    cardType: 'Congress',
    purpose:
      'Congressional districts determine U.S. House representation and federal constituent service.',
    contactFields: (feature) =>
      buildContactFields([
        ['District', feature.properties.__districtLabel],
        ['Representative', feature.properties.__representative],
        ['Party', feature.properties.__party],
        ['Office room', feature.properties.__officeRoom],
        ['Phone', feature.properties.__contactPhone],
      ]),
    links: (feature) =>
      buildContactLinks([
        ['Official member site', feature.properties.__officialWebsite],
        ['U.S. House representative lookup', DIRECTORY_LINKS.usHouse],
      ]),
    contactNote:
      'Congressional member names, Washington office rooms, and phones are synced from the official U.S. House directory.',
  },
];

const defaultActiveLayerIds = new Set(
  layerDefinitions.filter((layer) => layer.visible).map((layer) => layer.id),
);

const esriBaseLayer = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
  {
    attribution: 'Basemap Esri',
  },
);

const esriReferenceLayer = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
  {
    attribution: 'Labels Esri',
    pane: 'labels',
  },
);

export async function initDistrictMap() {
  const dom = getDomNodes();

  renderLayerControls(dom.layerControls);

  const map = L.map(dom.mapElement, {
    zoomControl: false,
    attributionControl: true,
    minZoom: 6,
    maxZoom: 13,
    zoomSnap: 0.25,
    scrollWheelZoom: false,
    maxBoundsViscosity: 1,
  });

  L.control.zoom({ position: 'topright' }).addTo(map);
  L.control.scale({ position: 'bottomright', imperial: true }).addTo(map);

  setupPanes(map);
  esriBaseLayer.addTo(map);
  esriReferenceLayer.addTo(map);

  const state = {
    map,
    dom,
    activeLayerIds: new Set(defaultActiveLayerIds),
    loadedLayers: new Map(),
    manifest: null,
    pinned: null,
    markerLayer: L.layerGroup().addTo(map),
    highlightLayer: L.layerGroup().addTo(map),
    popup: L.popup({
      autoPan: true,
      maxWidth: 420,
      offset: L.point(0, -10),
      className: 'district-popup-shell',
    }),
    statewideBounds: null,
    caddoBounds: null,
    shreveportBounds: null,
    cityPresetBounds: new Map(),
  };

  map.setView([31.08, -91.95], 6.65);

  bindUi(state);
  bindMapInteractions(state);

  return initializeMapData(state);
}

async function initializeMapData(state) {
  try {
    state.manifest = await fetchJson('/data/manifest.json');
    hydrateMetrics(state);
    renderSourceList(state);
    await loadAllLayers(state);
    if (state.statewideBounds) {
      state.map.setMaxBounds(state.statewideBounds.pad(0.22));
      state.map.panInsideBounds(state.statewideBounds, { animate: false });
    }
    updateZoomDrivenLayers(state);
    renderQuickLookIdle(state);
    renderContactIdle(state);
    state.dom.mapLoading.classList.add('is-hidden');
    updateStatus(
      state,
      'Hover the map for a quick overlap preview. Click to lock a location and open the contact directory.',
    );
  } catch (error) {
    console.error(error);
    state.dom.mapLoading.innerHTML =
      '<span class="loader loader-error"></span>Layer sync files are missing. Run <code>npm run sync:data</code> and refresh.';
    updateStatus(
      state,
      'Layer files are missing locally. Run npm run sync:data to generate them.',
    );
  }
}

function getDomNodes() {
  return {
    mapElement: document.querySelector('#district-map'),
    mapLoading: document.querySelector('#map-loading'),
    layerControls: document.querySelector('#layer-controls'),
    quicklookSummary: document.querySelector('#quicklook-summary'),
    quicklookResults: document.querySelector('#quicklook-results'),
    contactSummary: document.querySelector('#contact-summary'),
    contactResults: document.querySelector('#contact-results'),
    status: document.querySelector('#map-status'),
    sourceList: document.querySelector('#source-list'),
    syncStamp: document.querySelector('#sync-stamp'),
    cityJump: document.querySelector('#city-jump'),
    searchForm: document.querySelector('#search-form'),
    searchInput: document.querySelector('#address-search'),
    useLocationButton: document.querySelector('#use-location'),
    clearPinButton: document.querySelector('#clear-pin'),
    statewideButton: document.querySelector('#view-statewide'),
    caddoButton: document.querySelector('#view-caddo'),
    basemapToggle: document.querySelector('#basemap-toggle'),
    metricLayerCount: document.querySelector('#metric-layer-count'),
    metricPlaceCount: document.querySelector('#metric-place-count'),
  };
}

function setupPanes(map) {
  const paneOrder = [
    ['labels', 300],
    ['outline', 360],
    ['boundary', 370],
    ['parishes', 380],
    ['places', 385],
    ['house', 390],
    ['senate', 400],
    ['congress', 410],
    ['local', 420],
    ['highlight', 650],
  ];

  paneOrder.forEach(([name, zIndex]) => {
    map.createPane(name);
    map.getPane(name).style.zIndex = String(zIndex);
  });

  map.getPane('highlight').style.pointerEvents = 'none';
}

async function loadAllLayers(state) {
  await Promise.all(
    layerDefinitions.map(async (definition) => {
      const featureCollection = await fetchJson(definition.file);
      const layer = L.geoJSON(featureCollection, {
        pane: definition.pane,
        interactive: false,
        style: () => ({ ...definition.style }),
      });

      state.loadedLayers.set(definition.id, {
        definition,
        featureCollection,
        lookupEntries: prepareLookupEntries(featureCollection, definition),
        leafletLayer: layer,
      });

      if (shouldRenderLayer(state, definition)) {
        layer.addTo(state.map);
      }

      if (definition.id === 'louisiana-outline') {
        state.statewideBounds = layer.getBounds().pad(0.06);
      }

      if (definition.id === 'louisiana-places') {
        buildCityPresetBounds(state, featureCollection);
      }

      if (definition.id === 'caddo-commission') {
        state.caddoBounds = layer.getBounds().pad(0.08);
      }

      if (definition.id === 'shreveport-boundary') {
        state.shreveportBounds = layer.getBounds().pad(0.12);
      }
    }),
  );

  populateCityJump(state);
}

function prepareLookupEntries(featureCollection, definition) {
  if (!definition.interactive) {
    return [];
  }

  return featureCollection.features.map((feature) => ({
    feature,
    bbox: getBoundingBox(feature.geometry),
  }));
}

function bindUi(state) {
  const {
    cityJump,
    searchForm,
    searchInput,
    useLocationButton,
    clearPinButton,
    statewideButton,
    caddoButton,
    basemapToggle,
  } = state.dom;

  searchForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const query = searchInput.value.trim();
    if (!query) {
      updateStatus(state, 'Enter a Louisiana address to search the district stack.');
      return;
    }

    updateStatus(state, `Searching for ${query}...`);

    try {
      const location = await geocodeAddress(query);
      const latLng = L.latLng(location.latitude, location.longitude);
      if (!isInsideLouisiana(state, latLng)) {
        updateStatus(
          state,
          'That search result falls outside Louisiana. Search a Louisiana address instead.',
        );
        return;
      }
      state.map.flyTo(latLng, Math.max(state.map.getZoom(), 11), {
        duration: 0.8,
      });
      setPinnedLocation(state, latLng, location.address);
    } catch (error) {
      console.error(error);
      updateStatus(
        state,
        'No clear geocoding result came back for that search. Try a full street address.',
      );
    }
  });

  cityJump.addEventListener('change', () => {
    const selectedCity = cityJump.value;
    if (!selectedCity) {
      return;
    }

    const bounds = state.cityPresetBounds.get(selectedCity);
    if (!bounds) {
      updateStatus(state, `No saved municipal boundary was found for ${selectedCity}.`);
      return;
    }

    state.map.fitBounds(bounds, {
      padding: [24, 24],
      maxZoom: 10.75,
    });
    updateStatus(state, `Showing ${selectedCity} at city scale.`);
  });

  useLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
      updateStatus(state, 'This browser does not expose geolocation.');
      return;
    }

    updateStatus(state, 'Requesting your current location...');

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const latLng = L.latLng(coords.latitude, coords.longitude);
        if (!isInsideLouisiana(state, latLng)) {
          updateStatus(
            state,
            'Your current location appears to be outside Louisiana, so the map did not pin it.',
          );
          return;
        }
        state.map.flyTo(latLng, Math.max(state.map.getZoom(), 11), {
          duration: 0.8,
        });
        setPinnedLocation(state, latLng, 'Current location');
      },
      () => {
        updateStatus(
          state,
          'Location access was denied or unavailable. You can still search or click the map.',
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  });

  clearPinButton.addEventListener('click', () => {
    state.pinned = null;
    state.markerLayer.clearLayers();
    state.highlightLayer.clearLayers();
    state.map.closePopup();
    renderQuickLookIdle(state);
    renderContactIdle(state);
    updateStatus(state, 'Pin cleared. Hover the map to preview the stack again.');
  });

  statewideButton.addEventListener('click', () => {
    localDemoLayerIds.forEach((layerId) => setLayerChecked(state, layerId, false));
    if (state.pinned) {
      renderPinnedLookup(state, state.pinned.latLng, state.pinned.label);
    }

    if (state.statewideBounds) {
      state.map.fitBounds(state.statewideBounds, { padding: [24, 24] });
      updateStatus(
        state,
        'Showing statewide district coverage with the Shreveport demo layers turned back off.',
      );
    }
  });

  caddoButton.addEventListener('click', () => {
    const focusBounds = state.shreveportBounds ?? state.caddoBounds;

    localDemoLayerIds.forEach((layerId) => setLayerChecked(state, layerId, true));
    if (state.pinned) {
      renderPinnedLookup(state, state.pinned.latLng, state.pinned.label);
    }

    if (focusBounds) {
      state.map.fitBounds(focusBounds, { padding: [24, 24] });
      updateStatus(
        state,
        'Showing the Shreveport demo stack with local city, parish, and school-board layers turned on.',
      );
    }
  });

  basemapToggle.addEventListener('change', () => {
    if (basemapToggle.checked) {
      esriBaseLayer.addTo(state.map);
      esriReferenceLayer.addTo(state.map);
      updateStatus(state, 'Reference basemap turned on.');
      return;
    }

    state.map.removeLayer(esriBaseLayer);
    state.map.removeLayer(esriReferenceLayer);
    updateStatus(state, 'Reference basemap turned off.');
  });

  state.dom.layerControls
    .querySelectorAll('[data-layer-toggle]')
    .forEach((input) =>
      input.addEventListener('change', () => toggleLayer(state, input)),
    );
}

function bindMapInteractions(state) {
  let pendingFrame = null;
  let pendingLatLng = null;

  state.map.on('mousemove', (event) => {
    if (state.pinned) {
      return;
    }

    if (!isInsideLouisiana(state, event.latlng)) {
      state.highlightLayer.clearLayers();
      renderQuickLookIdle(state);
      updateStatus(state, 'Move inside Louisiana to inspect the district stack.');
      return;
    }

    pendingLatLng = event.latlng;
    if (pendingFrame) {
      return;
    }

    pendingFrame = window.requestAnimationFrame(() => {
      pendingFrame = null;

      if (pendingLatLng) {
        renderQuickLookAtPoint(state, pendingLatLng, {
          label: null,
          isPinned: false,
        });
      }
    });
  });

  state.map.on('click', (event) => {
    if (!isInsideLouisiana(state, event.latlng)) {
      updateStatus(
        state,
        'Click a point inside Louisiana to pin the district stack.',
      );
      return;
    }

    setPinnedLocation(state, event.latlng, 'Pinned map point');
  });

  state.map.on('zoomend', () => {
    updateZoomDrivenLayers(state);

    if (state.pinned) {
      renderPinnedLookup(state, state.pinned.latLng, state.pinned.label);
      return;
    }

    renderQuickLookIdle(state);
    renderContactIdle(state);
  });
}

function toggleLayer(state, input) {
  const layerId = input.getAttribute('data-layer-toggle');
  const record = state.loadedLayers.get(layerId);

  if (!record) {
    return;
  }

  if (input.checked) {
    state.activeLayerIds.add(layerId);
  } else {
    state.activeLayerIds.delete(layerId);
  }

  updateZoomDrivenLayers(state);

  if (state.pinned) {
    renderPinnedLookup(state, state.pinned.latLng, state.pinned.label);
    return;
  }

  renderQuickLookIdle(state);
  renderContactIdle(state);
}

function setLayerChecked(state, layerId, isChecked) {
  const input = state.dom.layerControls.querySelector(
    `[data-layer-toggle="${layerId}"]`,
  );

  if (!input) {
    return;
  }

  input.checked = isChecked;

  if (isChecked) {
    state.activeLayerIds.add(layerId);
  } else {
    state.activeLayerIds.delete(layerId);
  }

  updateZoomDrivenLayers(state);
}

function setPinnedLocation(state, latLng, label) {
  if (!isInsideLouisiana(state, latLng)) {
    updateStatus(state, 'Pinned lookups are limited to points inside Louisiana.');
    return;
  }

  state.pinned = { latLng, label };
  state.markerLayer.clearLayers();

  L.circleMarker(latLng, {
    radius: 5,
    color: '#111111',
    weight: 2,
    fillColor: '#ffffcc',
    fillOpacity: 1,
    pane: 'highlight',
  }).addTo(state.markerLayer);

  renderPinnedLookup(state, latLng, label);
}

function renderPinnedLookup(state, latLng, label) {
  const contextMatches = findMatches(state, latLng, {
    includeInactive: true,
    includeZoomGated: true,
  });
  const exactMatches = contextMatches.filter((match) => match.isActive);
  const visibleMatches = exactMatches.filter((match) => match.isVisible);
  const hiddenMatches = exactMatches.filter((match) => !match.isVisible);
  const descriptor = describePinnedLocation(latLng, contextMatches, label);

  renderQuickLook(state, latLng, exactMatches, hiddenMatches, {
    label: descriptor,
    isPinned: true,
    mode: 'exact',
    visibleCount: visibleMatches.length,
  });
  renderContactDirectory(
    state,
    latLng,
    exactMatches,
    hiddenMatches,
    descriptor,
    visibleMatches.length,
  );
  renderHighlight(state, exactMatches);
  renderPinnedPopup(
    state,
    latLng,
    exactMatches,
    hiddenMatches,
    descriptor,
    visibleMatches.length,
  );

  updateStatus(
    state,
    `Pinned location: ${descriptor}. ${exactMatches.length} exact layer${exactMatches.length === 1 ? '' : 's'} matched.`,
  );
}

function renderQuickLookAtPoint(state, latLng, { label, isPinned }) {
  const matches = findMatches(state, latLng);
  const gatedLayers = getZoomGatedLayers(state);

  renderQuickLook(state, latLng, matches, gatedLayers, {
    label,
    isPinned,
  });
  renderHighlight(state, matches);

  const descriptor = label ?? `${latLng.lat.toFixed(5)}, ${latLng.lng.toFixed(5)}`;
  updateStatus(
    state,
    `Live hover: ${descriptor}. ${matches.length} active layer${matches.length === 1 ? '' : 's'} matched.`,
  );
}

function findMatches(
  state,
  latLng,
  { includeInactive = false, includeZoomGated = false } = {},
) {
  const point = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Point',
      coordinates: [latLng.lng, latLng.lat],
    },
  };

  return layerDefinitions
    .filter(
      (definition) =>
        definition.interactive &&
        (includeInactive || state.activeLayerIds.has(definition.id)) &&
        (includeZoomGated || isLayerZoomEligible(state.map.getZoom(), definition)),
    )
    .map((definition) => {
      const record = state.loadedLayers.get(definition.id);
      if (!record) {
        return null;
      }

      const match = record.lookupEntries.find(
        (entry) =>
          entry.bbox &&
          pointInsideBounds(entry.bbox, latLng) &&
          booleanPointInPolygon(point, entry.feature),
      );

      return match
        ? {
            definition,
            feature: match.feature,
            isActive: state.activeLayerIds.has(definition.id),
            isZoomEligible: isLayerZoomEligible(state.map.getZoom(), definition),
            isVisible: shouldRenderLayer(state, definition),
          }
        : null;
    })
    .filter(Boolean)
    .sort((left, right) => left.definition.sortOrder - right.definition.sortOrder);
}

function renderQuickLook(
  state,
  latLng,
  matches,
  gatedLayers,
  { label, isPinned, mode = 'visible', visibleCount = matches.length },
) {
  const descriptor = label ?? `${latLng.lat.toFixed(5)}, ${latLng.lng.toFixed(5)}`;
  const summaryNote =
    mode === 'exact'
      ? buildSuppressedSummary(gatedLayers)
      : getGatedSummary(gatedLayers);
  const summaryCopy =
    mode === 'exact'
      ? `${matches.length} exact jurisdiction${matches.length === 1 ? '' : 's'} overlap this point. ${visibleCount} ${visibleCount === 1 ? 'is' : 'are'} currently drawn on the map.${summaryNote}`
      : `${matches.length} active layer${matches.length === 1 ? '' : 's'} matched this point.${summaryNote}`;

  state.dom.quicklookSummary.innerHTML = `
    <div class="summary-kicker">${isPinned ? 'Pinned quicklook' : 'Live quicklook'}</div>
    <h4>${escapeHtml(descriptor)}</h4>
    <p>${escapeHtml(summaryCopy)}</p>
  `;

  if (!matches.length) {
    state.dom.quicklookResults.innerHTML = `
      <div class="quicklook-empty">
        ${
          mode === 'exact'
            ? 'No known jurisdiction layers matched this point. Move inside Louisiana or try another location.'
            : 'No active polygons matched here. Move inside Louisiana, turn on more layers, or zoom closer for local detail.'
        }
      </div>
    `;
    return;
  }

  state.dom.quicklookResults.innerHTML = matches
    .map((match) => renderQuickLookRow(match, { showAvailability: mode === 'exact' }))
    .join('');
}

function renderQuickLookRow(match, { showAvailability = false } = {}) {
  const { definition, feature } = match;
  const detailLine = getPrimaryDetailLine(match);
  const availability = showAvailability ? getMatchStateLabel(match) : null;

  return `
    <article class="quicklook-row">
      <div class="quicklook-row-header">
        <span class="swatch" style="--swatch:${definition.style.color}"></span>
        <div>
          <div class="result-type">${escapeHtml(definition.cardType)}</div>
          <h5>${escapeHtml(definition.cardTitle(feature))}</h5>
        </div>
      </div>
      ${detailLine ? `<div class="quicklook-detail">${escapeHtml(detailLine)}</div>` : ''}
      <p>${escapeHtml(getDefinitionText(definition, 'purpose', feature))}</p>
      ${
        availability
          ? `<div class="match-state">${escapeHtml(availability)}</div>`
          : ''
      }
    </article>
  `;
}

function renderContactDirectory(
  state,
  latLng,
  matches,
  hiddenMatches,
  label,
  visibleCount,
) {
  const descriptor = label ?? `${latLng.lat.toFixed(5)}, ${latLng.lng.toFixed(5)}`;
  const hiddenNote = buildSuppressedSummary(hiddenMatches);

  state.dom.contactSummary.innerHTML = `
    <div class="summary-kicker">Pinned directory</div>
    <h4>${escapeHtml(descriptor)}</h4>
    <p>${matches.length} exact jurisdiction${matches.length === 1 ? '' : 's'} are locked for this point. ${visibleCount} ${visibleCount === 1 ? 'is' : 'are'} currently drawn on the map.${escapeHtml(hiddenNote)}</p>
  `;

  if (!matches.length) {
    state.dom.contactResults.innerHTML = `
      <div class="contact-empty">
        No jurisdiction layers matched this pinned point. Move the pin or try another location.
      </div>
    `;
    return;
  }

  state.dom.contactResults.innerHTML = matches
    .map((match) => renderContactCard(match))
    .join('');
}

function renderPinnedPopup(
  state,
  latLng,
  matches,
  hiddenMatches,
  label,
  visibleCount,
) {
  const descriptor = label ?? `${latLng.lat.toFixed(5)}, ${latLng.lng.toFixed(5)}`;

  if (!matches.length) {
    state.popup
      .setLatLng(latLng)
      .setContent(`
        <div class="district-popup">
          <h4>${escapeHtml(descriptor)}</h4>
          <p>No active polygons matched this point. Try another location, a closer zoom, or more layers.</p>
        </div>
      `)
      .openOn(state.map);
    return;
  }

  const hiddenNote = hiddenMatches.length
    ? `<p>${escapeHtml(
        `${hiddenMatches.length} exact layer${hiddenMatches.length === 1 ? '' : 's'} are loaded for this point but not currently drawn on the map.`,
      )}</p>`
    : '';

  state.popup
    .setLatLng(latLng)
    .setContent(`
      <div class="district-popup">
        <h4>${escapeHtml(descriptor)}</h4>
        <p>${escapeHtml(
          `${matches.length} exact jurisdiction${matches.length === 1 ? '' : 's'} overlap here. ${visibleCount} ${visibleCount === 1 ? 'is' : 'are'} currently drawn.`,
        )}</p>
        <ul>
          ${matches.map((match) => renderPopupRow(match)).join('')}
        </ul>
        ${hiddenNote}
      </div>
    `)
    .openOn(state.map);
}

function renderContactCard(match) {
  const { definition, feature } = match;
  const fields = definition.contactFields?.(feature) ?? [];
  const links = definition.links?.(feature) ?? [];
  const note = getDefinitionText(definition, 'contactNote', feature);
  const matchState = getMatchStateLabel(match);

  return `
    <article class="contact-card">
      <div class="contact-card-header">
        <div>
          <div class="result-type">${escapeHtml(definition.cardType)}</div>
          <h5>${escapeHtml(definition.cardTitle(feature))}</h5>
        </div>
        ${
          matchState
            ? `<span class="contact-status">${escapeHtml(matchState)}</span>`
            : ''
        }
      </div>
      <p class="contact-purpose">${escapeHtml(getDefinitionText(definition, 'purpose', feature))}</p>
      ${
        fields.length
          ? `
            <div class="contact-field-list">
              ${fields
                .map(
                  ({ label, value }) => `
                    <div class="contact-field">
                      <span class="contact-label">${escapeHtml(label)}</span>
                      <span class="contact-value">${renderContactValue(value)}</span>
                    </div>
                  `,
                )
                .join('')}
            </div>
          `
          : ''
      }
      ${
        links.length
          ? `
            <div class="contact-links">
              ${links
                .map(
                  ({ label, href }) => `
                    <a href="${escapeAttribute(href)}" target="_blank" rel="noreferrer">
                      ${escapeHtml(label)}
                    </a>
                  `,
                )
                .join('')}
            </div>
          `
          : ''
      }
      ${note ? `<p class="contact-note">${escapeHtml(note)}</p>` : ''}
    </article>
  `;
}

function renderPopupRow(match) {
  const { definition, feature } = match;
  const detailLines = [
    feature.properties.__representative
      ? `${getOfficeHolderLabel(definition)}: ${feature.properties.__representative}`
      : null,
    feature.properties.__contactOrganization &&
    feature.properties.__contactOrganization !== definition.cardType
      ? `Office: ${feature.properties.__contactOrganization}`
      : null,
    feature.properties.__contactPhone
      ? `Phone: ${feature.properties.__contactPhone}`
      : null,
  ].filter(Boolean);
  const matchState = getMatchStateLabel(match);

  return `
    <li>
      <div class="popup-row-header">
        <span class="swatch" style="--swatch:${definition.style.color}"></span>
        <div>
          <strong>${escapeHtml(definition.cardType)}</strong>
          <div>${escapeHtml(definition.cardTitle(feature))}</div>
        </div>
      </div>
      ${
        detailLines.length
          ? `<div class="popup-detail-list">${detailLines
              .map((line) => `<div class="popup-detail">${escapeHtml(line)}</div>`)
              .join('')}</div>`
          : ''
      }
      <p>${escapeHtml(getDefinitionText(definition, 'purpose', feature))}</p>
      ${
        matchState
          ? `<div class="match-state">${escapeHtml(matchState)}</div>`
          : ''
      }
    </li>
  `;
}

function renderQuickLookIdle(state) {
  const gatedLayers = getZoomGatedLayers(state);
  const gatedNote = gatedLayers.length
    ? ` ${gatedLayers.length} checked layer${gatedLayers.length === 1 ? '' : 's'} will appear when you zoom closer.`
    : '';

  state.dom.quicklookSummary.innerHTML = `
    <div class="summary-kicker">Map quicklook</div>
    <h4>Move over the map.</h4>
    <p>Hover previews the visible overlap.${gatedNote} Click to lock a point and open the exact district stack plus contact directory.</p>
  `;

  state.dom.quicklookResults.innerHTML = '';
}

function renderContactIdle(state) {
  const gatedLayers = getZoomGatedLayers(state);
  const gatedNote = gatedLayers.length
    ? ` ${gatedLayers.length} checked layer${gatedLayers.length === 1 ? '' : 's'} are still waiting for a closer zoom.`
    : '';

  state.dom.contactSummary.innerHTML = `
    <div class="summary-kicker">Awaiting pin</div>
    <h4>Click a point on the map.</h4>
    <p>The contact directory expands into the exact jurisdictions at the pinned point, plus their contact info.${gatedNote}</p>
  `;

  state.dom.contactResults.innerHTML = '';
}

function renderHighlight(state, matches) {
  state.highlightLayer.clearLayers();

  matches.forEach(({ definition, feature }) => {
    L.geoJSON(feature, {
      pane: 'highlight',
      interactive: false,
      style: {
        color: definition.style.color,
        weight: Math.max(definition.style.weight + 0.9, 2.1),
        dashArray: definition.style.dashArray,
        fillOpacity: 0,
      },
    }).addTo(state.highlightLayer);
  });
}

function renderLayerControls(container) {
  const groups = Array.from(
    layerDefinitions.reduce((map, definition) => {
      const list = map.get(definition.group) ?? [];
      list.push(definition);
      map.set(definition.group, list);
      return map;
    }, new Map()),
  );

  container.innerHTML = groups
    .map(
      ([groupName, definitions]) => `
        <section class="layer-group">
          <h4>${escapeHtml(groupName)}</h4>
          ${definitions
            .map(
              (definition) => `
                <label class="layer-row" data-layer-row="${definition.id}">
                  <input
                    type="checkbox"
                    data-layer-toggle="${definition.id}"
                    ${definition.visible ? 'checked' : ''}
                  />
                  <span class="swatch" style="--swatch:${definition.style.color}"></span>
                  <span class="layer-copy">
                    <span>${escapeHtml(definition.label)}</span>
                    ${
                      definition.minZoom
                        ? `<span class="layer-meta">Zoom ${formatMinZoom(definition.minZoom)}+</span>`
                        : ''
                    }
                  </span>
                </label>
              `,
            )
            .join('')}
        </section>
      `,
    )
    .join('');
}

function renderSourceList(state) {
  const manifest = state.manifest;

  if (!manifest?.layers?.length) {
    state.dom.sourceList.innerHTML =
      '<div class="source-card">No sync manifest found yet.</div>';
    return;
  }

  state.dom.syncStamp.textContent = `Last synced ${new Date(
    manifest.generatedAt,
  ).toLocaleString()}`;

  state.dom.sourceList.innerHTML = manifest.layers
    .map(
      (layer) => `
        <article class="source-card">
          <h3>${escapeHtml(layer.label)}</h3>
          <p>${layer.featureCount} feature${layer.featureCount === 1 ? '' : 's'} saved locally.</p>
          <a href="${escapeAttribute(layer.source)}" target="_blank" rel="noreferrer">Open source</a>
        </article>
      `,
    )
    .join('');
}

function hydrateMetrics(state) {
  if (!state.manifest?.layers?.length) {
    return;
  }

  if (state.dom.metricLayerCount) {
    state.dom.metricLayerCount.textContent = String(state.manifest.layers.length);
  }

  const placeLayer = state.manifest.layers.find(
    (layer) => layer.id === 'louisiana-places',
  );

  if (state.dom.metricPlaceCount) {
    state.dom.metricPlaceCount.textContent = placeLayer
      ? String(placeLayer.featureCount)
      : '--';
  }
}

function updateStatus(state, message) {
  state.dom.status.textContent = message;
}

async function geocodeAddress(query) {
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
  };
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.json();
}

function isInsideLouisiana(state, latLng) {
  const record = state.loadedLayers.get('louisiana-outline');

  if (!record?.featureCollection?.features?.length) {
    return true;
  }

  const entries =
    record.lookupEntries?.length
      ? record.lookupEntries
      : record.featureCollection.features.map((feature) => ({
          feature,
          bbox: getBoundingBox(feature.geometry),
        }));

  const point = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Point',
      coordinates: [latLng.lng, latLng.lat],
    },
  };

  return entries.some(
    (entry) =>
      entry.bbox &&
      pointInsideBounds(entry.bbox, latLng) &&
      booleanPointInPolygon(point, entry.feature),
  );
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

function shouldRenderLayer(state, definition) {
  return (
    state.activeLayerIds.has(definition.id) &&
    isLayerZoomEligible(state.map.getZoom(), definition)
  );
}

function isLayerZoomEligible(zoom, definition) {
  return definition.minZoom ? zoom >= definition.minZoom : true;
}

function updateZoomDrivenLayers(state) {
  state.loadedLayers.forEach(({ definition, leafletLayer }) => {
    const shouldShow = shouldRenderLayer(state, definition);
    const isShown = state.map.hasLayer(leafletLayer);

    if (shouldShow && !isShown) {
      leafletLayer.addTo(state.map);
      return;
    }

    if (!shouldShow && isShown) {
      state.map.removeLayer(leafletLayer);
    }
  });

  renderLayerControlStates(state);
}

function renderLayerControlStates(state) {
  state.dom.layerControls.querySelectorAll('[data-layer-row]').forEach((row) => {
    const layerId = row.getAttribute('data-layer-row');
    const definition = layerDefinitions.find((layer) => layer.id === layerId);

    if (!definition?.minZoom) {
      row.classList.remove('is-muted');
      return;
    }

    row.classList.toggle(
      'is-muted',
      state.activeLayerIds.has(layerId) &&
        !isLayerZoomEligible(state.map.getZoom(), definition),
    );
  });
}

function getZoomGatedLayers(state) {
  return layerDefinitions
    .filter(
      (definition) =>
        definition.minZoom &&
        state.activeLayerIds.has(definition.id) &&
        !isLayerZoomEligible(state.map.getZoom(), definition),
    )
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

function formatMinZoom(value) {
  return Number.isInteger(value) ? value : value.toFixed(1);
}

function buildCityPresetBounds(state, featureCollection) {
  featureCollection.features.forEach((feature) => {
    const placeName = feature.properties.BASENAME ?? feature.properties.NAME;
    if (!MAJOR_CITY_PRESETS.includes(placeName)) {
      return;
    }

    const bounds = getBoundingBox(feature.geometry);
    if (!bounds) {
      return;
    }

    state.cityPresetBounds.set(
      placeName,
      L.latLngBounds(
        [bounds.minLat, bounds.minLng],
        [bounds.maxLat, bounds.maxLng],
      ).pad(0.14),
    );
  });
}

function populateCityJump(state) {
  const options = MAJOR_CITY_PRESETS.filter((name) =>
    state.cityPresetBounds.has(name),
  );

  state.dom.cityJump.innerHTML = `
    <option value="">Jump to a city</option>
    ${options.map((name) => `<option value="${escapeAttribute(name)}">${escapeHtml(name)}</option>`).join('')}
  `;
}

function describePinnedLocation(latLng, matches, label) {
  if (label && !['Pinned map point', 'Current location'].includes(label)) {
    return label;
  }

  const municipalityMatch = matches.find(
    (match) => match.definition.id === 'louisiana-places',
  );
  const parishMatch = matches.find(
    (match) => match.definition.id === 'louisiana-parishes',
  );

  if (municipalityMatch && parishMatch) {
    return `${municipalityMatch.feature.properties.__districtLabel}, ${parishMatch.feature.properties.__districtLabel}`;
  }

  if (municipalityMatch) {
    return `${municipalityMatch.feature.properties.__districtLabel}, Louisiana`;
  }

  if (parishMatch) {
    return `${parishMatch.feature.properties.__districtLabel}, Louisiana`;
  }

  return label ?? `${latLng.lat.toFixed(5)}, ${latLng.lng.toFixed(5)}`;
}

function getGatedSummary(gatedLayers) {
  if (!gatedLayers.length) {
    return '';
  }

  return ` ${gatedLayers.length} checked layer${gatedLayers.length === 1 ? '' : 's'} still need a closer zoom.`;
}

function buildSuppressedSummary(matches) {
  if (!matches.length) {
    return '';
  }

  const toggledOffCount = matches.filter((match) => !match.isActive).length;
  const zoomHiddenCount = matches.filter(
    (match) => match.isActive && !match.isZoomEligible,
  ).length;
  const reasons = [];

  if (toggledOffCount) {
    reasons.push(
      `${toggledOffCount} layer${toggledOffCount === 1 ? '' : 's'} are toggled off`,
    );
  }

  if (zoomHiddenCount) {
    reasons.push(
      `${zoomHiddenCount} layer${zoomHiddenCount === 1 ? '' : 's'} need a closer zoom`,
    );
  }

  return reasons.length
    ? ` ${matches.length} exact layer${matches.length === 1 ? '' : 's'} are loaded but hidden because ${reasons.join(' and ')}.`
    : '';
}

function getDefinitionText(definition, key, feature) {
  const value = definition[key];
  return typeof value === 'function' ? value(feature) : value;
}

function getPrimaryDetailLine(match) {
  const { definition, feature } = match;

  if (feature.properties.__representative) {
    return `${getOfficeHolderLabel(definition)}: ${feature.properties.__representative}`;
  }

  if (feature.properties.__contactOrganization) {
    return `Office: ${feature.properties.__contactOrganization}`;
  }

  if (feature.properties.__contactPhone) {
    return `Phone: ${feature.properties.__contactPhone}`;
  }

  return null;
}

function getOfficeHolderLabel(definition) {
  switch (definition.id) {
    case 'louisiana-house':
      return 'Representative';
    case 'louisiana-senate':
      return 'Senator';
    case 'louisiana-congress':
      return 'Representative';
    case 'shreveport-council':
      return 'Council member';
    case 'caddo-school-board':
      return 'Board member';
    case 'caddo-commission':
      return 'Commissioner';
    default:
      return 'Official';
  }
}

function getMatchStateLabel(match) {
  if (match.isVisible) {
    return '';
  }

  if (!match.isActive) {
    return 'Layer toggle off';
  }

  if (!match.isZoomEligible) {
    return `Zoom ${formatMinZoom(match.definition.minZoom)}+ to draw`;
  }

  return 'Loaded but hidden';
}

function buildContactFields(entries) {
  return entries
    .map(([label, value]) => ({
      label,
      value,
    }))
    .filter((entry) => Boolean(entry.value));
}

function buildContactLinks(entries) {
  return entries
    .map(([label, href]) => ({
      label,
      href,
    }))
    .filter((entry) => Boolean(entry.href));
}

function renderContactValue(value) {
  if (typeof value !== 'string') {
    return escapeHtml(String(value));
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return '';
  }

  if (trimmed.includes('\n')) {
    return trimmed
      .split('\n')
      .map((line) => renderContactValue(line))
      .join('<br>');
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return `<a href="${escapeAttribute(trimmed)}" target="_blank" rel="noreferrer">${escapeHtml(trimmed)}</a>`;
  }

  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) {
    const email = trimmed;
    return `<a href="mailto:${escapeAttribute(email)}">${escapeHtml(email)}</a>`;
  }

  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 10 || digits.length === 11) {
    return `<a href="tel:${escapeAttribute(digits)}">${escapeHtml(trimmed)}</a>`;
  }

  if (trimmed.includes('@')) {
    const email = value.trim();
    return `<a href="mailto:${escapeAttribute(email)}">${escapeHtml(email)}</a>`;
  }

  return escapeHtml(trimmed);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeAttribute(value) {
  return escapeHtml(value);
}
