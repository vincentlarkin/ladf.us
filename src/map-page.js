import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { normalizeLookupName } from './locationLookup.js';
import { loadParishIndex } from './parishData.js';
import './style.css';
import {
  bindSiteChrome,
  renderBreadcrumb,
  renderSidebar,
  renderSiteFooter,
  renderSiteHeader,
} from './siteChrome.js';

document.title = 'Louisiana Data Force | Parish Map';

document.querySelector('#app').innerHTML = `
  <div class="page">
    ${renderSiteHeader({ activePage: 'map' })}

    <div class="site-body">
      ${renderSidebar({
        sections: [
          { href: '#overview', label: 'Overview' },
          { href: '#map-tool', label: 'Interactive Map' },
          { href: '#directory-list', label: 'All Parishes' },
        ],
      })}

      <main class="content content--wide">
        <div class="content__inner content__inner--wide">
          ${renderBreadcrumb([
            { label: 'Home', href: '/index.html' },
            { label: 'Parish Map' },
          ])}

          <section class="page-intro page-intro--compact" id="overview">
            <div class="page-intro__title-block">
              <div class="eyebrow">Parish-first directory</div>
              <h1>Pick a parish, then choose the parish page or one of its cities.</h1>
              <p class="lead">
                Click a parish on the map to open a small chooser with the parish page
                and city or town links, switch into city boundaries, or open
                legislative districts for a representative-first view of Louisiana.
              </p>
            </div>

            <div class="summary-metrics parish-summary-grid">
              <article class="summary-metric">
                <span class="metric-label">Parish pages</span>
                <strong>64</strong>
              </article>
              <article class="summary-metric">
                <span class="metric-label">Local places</span>
                <strong>300+</strong>
              </article>
              <article class="summary-metric">
                <span class="metric-label">Map layers</span>
                <strong>4</strong>
              </article>
            </div>

            <div class="cta-row">
              <a class="button" href="#directory-list">Browse all parishes</a>
              <a class="button button--secondary" href="/services.html">Open services by ZIP</a>
            </div>
          </section>

          <section class="section section--map" id="map-tool">
            <h2>Interactive Louisiana Map</h2>
            <div class="parish-map-shell">
              <div class="parish-map-stage">
                <div class="map-mode-bar" role="group" aria-label="Map layer">
                  <button class="map-mode-button is-active" type="button" data-map-mode="parishes">
                    Parishes
                  </button>
                  <button class="map-mode-button" type="button" data-map-mode="house">
                    See House districts
                  </button>
                  <button class="map-mode-button" type="button" data-map-mode="congress">
                    Congressional districts
                  </button>
                  <button class="map-mode-button" type="button" data-map-mode="cities">
                    Cities
                  </button>
                </div>
                <div id="parish-map" class="district-map parish-map" aria-label="Louisiana parish map">
                  <div class="map-loading" id="map-loading">
                    <span class="loader"></span>
                    Loading Louisiana boundaries...
                  </div>
                </div>
                <p class="status-line" id="map-status">
                  Hover a parish to preview it. Click to open the parish and city chooser.
                </p>
              </div>

              <aside class="panel parish-list-panel" id="directory-list">
                <div class="panel-heading">
                  <h3 id="map-list-title">All Parishes</h3>
                  <p id="map-list-description">
                    Parish buttons open the parish page directly. Map clicks open the
                    simpler chooser with parish and local place links.
                  </p>
                </div>
                <label class="field-label" for="parish-filter" id="map-filter-label">Filter parishes</label>
                <input
                  id="parish-filter"
                  type="search"
                  class="city-select"
                  placeholder="Start typing a parish name"
                  autocomplete="off"
                />
                <div class="parish-count" id="parish-count">Loading parishes...</div>
                <div class="parish-list-grid" id="parish-list"></div>
              </aside>
            </div>
          </section>
        </div>
      </main>
    </div>

    ${renderSiteFooter()}
  </div>
`;

bindSiteChrome();

const parishListNode = document.querySelector('#parish-list');
const parishCountNode = document.querySelector('#parish-count');
const filterNode = document.querySelector('#parish-filter');
const filterLabelNode = document.querySelector('#map-filter-label');
const listTitleNode = document.querySelector('#map-list-title');
const listDescriptionNode = document.querySelector('#map-list-description');
const statusNode = document.querySelector('#map-status');
const loadingNode = document.querySelector('#map-loading');
const modeButtons = Array.from(document.querySelectorAll('[data-map-mode]'));

const [
  parishIndex,
  parishDirectory,
  cityBoundaryCollection,
  houseDistrictCollection,
  congressionalDistrictCollection,
] = await Promise.all([
  loadParishIndex(),
  fetchJson('/data/service-directory.json').catch(() => ({ parishes: [] })),
  fetchJson('/data/louisiana-places.geojson').catch(() => ({
    type: 'FeatureCollection',
    features: [],
  })),
  fetchJson('/data/louisiana-house.geojson').catch(() => ({
    type: 'FeatureCollection',
    features: [],
  })),
  fetchJson('/data/louisiana-congress.geojson').catch(() => ({
    type: 'FeatureCollection',
    features: [],
  })),
]);

const parishLookup = buildParishLookup(parishDirectory);
const cities = buildCities(cityBoundaryCollection);
const houseDistricts = buildHouseDistricts(houseDistrictCollection);
const congressionalDistricts = buildCongressionalDistricts(
  congressionalDistrictCollection,
);
const mapController = initializeMap(
  parishIndex,
  parishLookup,
  cities,
  houseDistricts,
  congressionalDistricts,
);
let activeMapMode = 'parishes';

renderDirectoryList();

filterNode.addEventListener('input', () => {
  renderDirectoryList();
});

modeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const nextMode = button.getAttribute('data-map-mode');
    if (!nextMode || nextMode === activeMapMode) {
      return;
    }

    activeMapMode = nextMode;
    filterNode.value = '';
    mapController.setMode(nextMode);
    renderDirectoryList();
    renderModeButtons();
  });
});

function initializeMap(
  parishes,
  parishLookup,
  cities,
  houseDistricts,
  congressionalDistricts,
) {
  const map = L.map('parish-map', {
    zoomControl: true,
    attributionControl: true,
    minZoom: 6,
    maxZoom: 10,
    scrollWheelZoom: false,
  });

  L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    {
      attribution: 'Basemap Esri',
    },
  ).addTo(map);

  let hoverLayer = null;
  let selectedLayer = null;
  let currentMode = 'parishes';
  const layerByMode = new Map();

  const parishLayer = L.geoJSON(
    {
      type: 'FeatureCollection',
      features: parishes.map((parish) => parish.feature),
    },
    {
      style: () => ({
        color: '#162e51',
        weight: 1.2,
        fillColor: '#D4AD42',
        fillOpacity: 0.14,
      }),
      onEachFeature(feature, layer) {
        const parishLabel = feature.properties.__districtLabel ?? feature.properties.NAME;
        const parishKey = getParishKey(parishLabel);

        layer.on('mouseover', () => {
          if (currentMode !== 'parishes') {
            return;
          }

          if (selectedLayer === layer) {
            return;
          }

          if (hoverLayer && hoverLayer !== layer && hoverLayer !== selectedLayer) {
            resetLayerStyle(hoverLayer);
          }

          hoverLayer = layer;
          setActiveLayerStyle(layer, { mode: 'parishes', selected: false });
          statusNode.textContent = `${parishLabel} selected. Click to open the parish and local place chooser.`;
        });

        layer.on('mouseout', () => {
          if (currentMode !== 'parishes') {
            return;
          }

          if (hoverLayer === layer && selectedLayer !== layer) {
            resetLayerStyle(layer);
            hoverLayer = null;
          }

          if (!selectedLayer) {
            statusNode.textContent = getIdleStatus(currentMode);
          }
        });

        layer.on('click', (event) => {
          if (currentMode !== 'parishes') {
            return;
          }

          if (selectedLayer && selectedLayer !== layer) {
            resetLayerStyle(selectedLayer);
          }

          selectedLayer = layer;
          hoverLayer = layer;
          setActiveLayerStyle(layer, { mode: 'parishes', selected: true });
          statusNode.textContent = `${parishLabel} selected. Choose the parish page or a local place in the popup.`;

          buildMapPopup()
            .setLatLng(event.latlng)
            .setContent(
              renderParishPopup(
                parishLookup.get(parishKey) ?? {
                  key: parishKey,
                  label: parishLabel,
                  cityNames: [],
                },
              ),
            )
            .openOn(map);
        });
      },
    },
  );

  const houseLayer = L.geoJSON(
    {
      type: 'FeatureCollection',
      features: houseDistricts.map((district) => district.feature),
    },
    {
      style: () => ({
        color: '#005ea2',
        weight: 1,
        fillColor: '#73b3e7',
        fillOpacity: 0.1,
      }),
      onEachFeature(feature, layer) {
        const district = getHouseDistrict(feature);

        layer.on('mouseover', () => {
          if (currentMode !== 'house') {
            return;
          }

          if (selectedLayer === layer) {
            return;
          }

          if (hoverLayer && hoverLayer !== layer && hoverLayer !== selectedLayer) {
            resetLayerStyle(hoverLayer);
          }

          hoverLayer = layer;
          setActiveLayerStyle(layer, { mode: 'house', selected: false });
          statusNode.textContent = `${district.label} selected. Click to open representative contact details.`;
        });

        layer.on('mouseout', () => {
          if (currentMode !== 'house') {
            return;
          }

          if (hoverLayer === layer && selectedLayer !== layer) {
            resetLayerStyle(layer);
            hoverLayer = null;
          }

          if (!selectedLayer) {
            statusNode.textContent = getIdleStatus(currentMode);
          }
        });

        layer.on('click', (event) => {
          if (currentMode !== 'house') {
            return;
          }

          selectHouseDistrictLayer(layer, event.latlng);
        });
      },
    },
  );

  const cityLayer = L.geoJSON(
    {
      type: 'FeatureCollection',
      features: cities.map((city) => city.feature),
    },
    {
      style: () => ({
        color: '#4d7f37',
        weight: 1,
        fillColor: '#83b85b',
        fillOpacity: 0.1,
      }),
      onEachFeature(feature, layer) {
        const city = getCity(feature);

        layer.on('mouseover', () => {
          if (currentMode !== 'cities') {
            return;
          }

          if (selectedLayer === layer) {
            return;
          }

          if (hoverLayer && hoverLayer !== layer && hoverLayer !== selectedLayer) {
            resetLayerStyle(hoverLayer);
          }

          hoverLayer = layer;
          setActiveLayerStyle(layer, { mode: 'cities', selected: false });
          statusNode.textContent = `${city.label} selected. Click to open city links and local lookup.`;
        });

        layer.on('mouseout', () => {
          if (currentMode !== 'cities') {
            return;
          }

          if (hoverLayer === layer && selectedLayer !== layer) {
            resetLayerStyle(layer);
            hoverLayer = null;
          }

          if (!selectedLayer) {
            statusNode.textContent = getIdleStatus(currentMode);
          }
        });

        layer.on('click', (event) => {
          if (currentMode !== 'cities') {
            return;
          }

          selectCityLayer(layer, event.latlng);
        });
      },
    },
  );

  const congressLayer = L.geoJSON(
    {
      type: 'FeatureCollection',
      features: congressionalDistricts.map((district) => district.feature),
    },
    {
      style: () => ({
        color: '#a0411e',
        weight: 1.2,
        fillColor: '#fa9441',
        fillOpacity: 0.1,
      }),
      onEachFeature(feature, layer) {
        const district = getCongressionalDistrict(feature);

        layer.on('mouseover', () => {
          if (currentMode !== 'congress') {
            return;
          }

          if (selectedLayer === layer) {
            return;
          }

          if (hoverLayer && hoverLayer !== layer && hoverLayer !== selectedLayer) {
            resetLayerStyle(hoverLayer);
          }

          hoverLayer = layer;
          setActiveLayerStyle(layer, { mode: 'congress', selected: false });
          statusNode.textContent = `${district.label} selected. Click to open congressional representative details.`;
        });

        layer.on('mouseout', () => {
          if (currentMode !== 'congress') {
            return;
          }

          if (hoverLayer === layer && selectedLayer !== layer) {
            resetLayerStyle(layer);
            hoverLayer = null;
          }

          if (!selectedLayer) {
            statusNode.textContent = getIdleStatus(currentMode);
          }
        });

        layer.on('click', (event) => {
          if (currentMode !== 'congress') {
            return;
          }

          selectCongressionalDistrictLayer(layer, event.latlng);
        });
      },
    },
  );

  layerByMode.set('parishes', parishLayer);
  layerByMode.set('cities', cityLayer);
  layerByMode.set('house', houseLayer);
  layerByMode.set('congress', congressLayer);
  parishLayer.addTo(map);

  map.on('popupclose', () => {
    if (selectedLayer) {
      resetLayerStyle(selectedLayer);
      selectedLayer = null;
    }

    if (hoverLayer && hoverLayer !== selectedLayer) {
      resetLayerStyle(hoverLayer);
      hoverLayer = null;
    }

    statusNode.textContent = getIdleStatus(currentMode);
  });

  map.fitBounds(parishLayer.getBounds().pad(0.04));
  loadingNode.classList.add('is-hidden');

  function setMode(nextMode) {
    if (!layerByMode.has(nextMode) || nextMode === currentMode) {
      return;
    }

    map.closePopup();
    resetSelection();
    map.removeLayer(layerByMode.get(currentMode));
    currentMode = nextMode;
    const nextLayer = layerByMode.get(currentMode);
    nextLayer.addTo(map);
    map.fitBounds(nextLayer.getBounds().pad(currentMode === 'parishes' ? 0.04 : 0.02));
    statusNode.textContent = getIdleStatus(currentMode);
  }

  function resetSelection() {
    if (selectedLayer) {
      resetLayerStyle(selectedLayer);
      selectedLayer = null;
    }

    if (hoverLayer) {
      resetLayerStyle(hoverLayer);
      hoverLayer = null;
    }
  }

  function resetLayerStyle(layer) {
    const activeLayer = layerByMode.get(currentMode);
    if (activeLayer?.hasLayer(layer)) {
      activeLayer.resetStyle(layer);
    }
  }

  function selectHouseDistrictLayer(layer, latLng = layer.getBounds().getCenter()) {
    if (currentMode !== 'house') {
      setMode('house');
    }

    if (selectedLayer && selectedLayer !== layer) {
      resetLayerStyle(selectedLayer);
    }

    selectedLayer = layer;
    hoverLayer = layer;
    setActiveLayerStyle(layer, { mode: 'house', selected: true });
    const district = getHouseDistrict(layer.feature);
    statusNode.textContent = `${district.label} selected. Representative contact details are open.`;

    buildMapPopup()
      .setLatLng(latLng)
      .setContent(renderHouseDistrictPopup(district))
      .openOn(map);
  }

  function openHouseDistrict(districtKey) {
    if (currentMode !== 'house') {
      setMode('house');
    }

    let districtLayer = null;
    houseLayer.eachLayer((layer) => {
      if (layer.feature?.properties?.__districtKey === districtKey) {
        districtLayer = layer;
      }
    });

    if (!districtLayer) {
      return;
    }

    map.fitBounds(districtLayer.getBounds().pad(0.18), { maxZoom: 9 });
    selectHouseDistrictLayer(districtLayer);
  }

  function selectCityLayer(layer, latLng = layer.getBounds().getCenter()) {
    if (currentMode !== 'cities') {
      setMode('cities');
    }

    if (selectedLayer && selectedLayer !== layer) {
      resetLayerStyle(selectedLayer);
    }

    selectedLayer = layer;
    hoverLayer = layer;
    setActiveLayerStyle(layer, { mode: 'cities', selected: true });
    const city = getCity(layer.feature);
    statusNode.textContent = `${city.label} selected. City links and local lookup are open.`;

    buildMapPopup()
      .setLatLng(latLng)
      .setContent(renderCityPopup(city))
      .openOn(map);
  }

  function openCity(cityKey) {
    if (currentMode !== 'cities') {
      setMode('cities');
    }

    let selectedCityLayer = null;
    cityLayer.eachLayer((layer) => {
      if (layer.feature?.properties?.__districtKey === cityKey) {
        selectedCityLayer = layer;
      }
    });

    if (!selectedCityLayer) {
      return;
    }

    map.fitBounds(selectedCityLayer.getBounds().pad(0.18), { maxZoom: 10 });
    selectCityLayer(selectedCityLayer);
  }

  function selectCongressionalDistrictLayer(
    layer,
    latLng = layer.getBounds().getCenter(),
  ) {
    if (currentMode !== 'congress') {
      setMode('congress');
    }

    if (selectedLayer && selectedLayer !== layer) {
      resetLayerStyle(selectedLayer);
    }

    selectedLayer = layer;
    hoverLayer = layer;
    setActiveLayerStyle(layer, { mode: 'congress', selected: true });
    const district = getCongressionalDistrict(layer.feature);
    statusNode.textContent = `${district.label} selected. Congressional representative details are open.`;

    buildMapPopup()
      .setLatLng(latLng)
      .setContent(renderCongressionalDistrictPopup(district))
      .openOn(map);
  }

  function openCongressionalDistrict(districtKey) {
    if (currentMode !== 'congress') {
      setMode('congress');
    }

    let districtLayer = null;
    congressLayer.eachLayer((layer) => {
      if (layer.feature?.properties?.__districtKey === districtKey) {
        districtLayer = layer;
      }
    });

    if (!districtLayer) {
      return;
    }

    map.fitBounds(districtLayer.getBounds().pad(0.16), { maxZoom: 8.5 });
    selectCongressionalDistrictLayer(districtLayer);
  }

  return {
    setMode,
    openCity,
    openHouseDistrict,
    openCongressionalDistrict,
  };
}

function renderDirectoryList() {
  const query = filterNode.value.trim().toLowerCase();

  if (activeMapMode === 'cities') {
    const filtered = cities.filter((city) =>
      [city.label, city.placeType, city.contactOrganization]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query)),
    );

    renderModePanel({
      title: 'Cities And Towns',
      description:
        'City buttons focus municipal boundaries and open local lookup links.',
      filterLabel: 'Filter cities and towns',
      placeholder: 'City, town, or village name',
    });
    renderCityList(filtered);
    return;
  }

  if (activeMapMode === 'house') {
    const filtered = houseDistricts.filter((district) =>
      [district.label, district.representative, district.party]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query)),
    );

    renderModePanel({
      title: 'House Districts',
      description:
        'District buttons focus the map and open representative contact details.',
      filterLabel: 'Filter districts',
      placeholder: 'District number or representative',
    });
    renderHouseDistrictList(filtered);
    return;
  }

  if (activeMapMode === 'congress') {
    const filtered = congressionalDistricts.filter((district) =>
      [district.label, district.representative, district.party]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query)),
    );

    renderModePanel({
      title: 'Congressional Districts',
      description:
        'District buttons focus the map and open U.S. House representative details.',
      filterLabel: 'Filter congressional districts',
      placeholder: 'District number or representative',
    });
    renderCongressionalDistrictList(filtered);
    return;
  }

  const filtered = parishIndex.filter((parish) =>
    parish.label.toLowerCase().includes(query),
  );

  renderModePanel({
    title: 'All Parishes',
    description:
      'Parish buttons open the parish page directly. Map clicks open the simpler chooser with parish and local place links.',
    filterLabel: 'Filter parishes',
    placeholder: 'Start typing a parish name',
  });
  renderParishList(filtered);
}

function renderModePanel({ title, description, filterLabel, placeholder }) {
  listTitleNode.textContent = title;
  listDescriptionNode.textContent = description;
  filterLabelNode.textContent = filterLabel;
  filterNode.setAttribute('placeholder', placeholder);
}

function renderModeButtons() {
  modeButtons.forEach((button) => {
    button.classList.toggle(
      'is-active',
      button.getAttribute('data-map-mode') === activeMapMode,
    );
  });
}

function renderParishList(parishes) {
  parishCountNode.textContent = `${parishes.length} parish${parishes.length === 1 ? '' : 'es'}`;

  parishListNode.innerHTML = parishes
    .map(
      (parish) => `
        <button class="parish-button" type="button" data-parish-key="${escapeAttribute(parish.key)}">
          ${escapeHtml(parish.label)}
        </button>
      `,
    )
    .join('');

  parishListNode.querySelectorAll('[data-parish-key]').forEach((button) => {
    button.addEventListener('click', () => {
      openParish(button.getAttribute('data-parish-key'));
    });
  });
}

function renderCityList(cities) {
  parishCountNode.textContent = `${cities.length} place${cities.length === 1 ? '' : 's'}`;

  parishListNode.innerHTML = cities
    .map(
      (city) => `
        <button class="parish-button parish-button--district" type="button" data-city-key="${escapeAttribute(city.key)}">
          <span>${escapeHtml(city.label)}</span>
          ${
            city.placeType
              ? `<span class="parish-button__meta">${escapeHtml(city.placeType)}</span>`
              : ''
          }
        </button>
      `,
    )
    .join('');

  parishListNode.querySelectorAll('[data-city-key]').forEach((button) => {
    button.addEventListener('click', () => {
      mapController.openCity(button.getAttribute('data-city-key'));
    });
  });
}

function renderHouseDistrictList(districts) {
  parishCountNode.textContent = `${districts.length} district${districts.length === 1 ? '' : 's'}`;

  parishListNode.innerHTML = districts
    .map(
      (district) => `
        <button class="parish-button parish-button--district" type="button" data-house-district="${escapeAttribute(district.key)}">
          <span>${escapeHtml(district.label)}</span>
          ${
            district.representative
              ? `<span class="parish-button__meta">${escapeHtml(district.representative)}</span>`
              : ''
          }
        </button>
      `,
    )
    .join('');

  parishListNode.querySelectorAll('[data-house-district]').forEach((button) => {
    button.addEventListener('click', () => {
      mapController.openHouseDistrict(button.getAttribute('data-house-district'));
    });
  });
}

function renderCongressionalDistrictList(districts) {
  parishCountNode.textContent = `${districts.length} district${districts.length === 1 ? '' : 's'}`;

  parishListNode.innerHTML = districts
    .map(
      (district) => `
        <button class="parish-button parish-button--district" type="button" data-congress-district="${escapeAttribute(district.key)}">
          <span>${escapeHtml(district.label)}</span>
          ${
            district.representative
              ? `<span class="parish-button__meta">${escapeHtml(district.representative)}</span>`
              : ''
          }
        </button>
      `,
    )
    .join('');

  parishListNode.querySelectorAll('[data-congress-district]').forEach((button) => {
    button.addEventListener('click', () => {
      mapController.openCongressionalDistrict(
        button.getAttribute('data-congress-district'),
      );
    });
  });
}

function openParish(parishKey) {
  window.location.href = `/parish.html?parish=${encodeURIComponent(parishKey)}`;
}

function buildParishLookup(serviceDirectory) {
  return new Map(
    (serviceDirectory.parishes ?? []).map((record) => [
      getParishKey(record.name),
      {
        key: getParishKey(record.name),
        label: record.name,
        cityNames: getCityNames(record),
        seat: record.seat ?? '',
      },
    ]),
  );
}

function getCityNames(record) {
  return Array.from(
    new Set(
      (record?.municipalityNames ?? [])
        .map((name) => String(name ?? '').trim())
        .filter(Boolean),
    ),
  ).sort((left, right) => left.localeCompare(right));
}

function renderParishPopup(parish) {
  const placeLinks = parish.cityNames.length
    ? parish.cityNames
        .map(
          (cityName) => `
            <a
              class="quick-chip quick-chip--link"
              href="/services.html?lookup=${encodeURIComponent(`${cityName}, LA`)}#results"
            >
              ${escapeHtml(cityName)}
            </a>
          `,
        )
        .join('')
    : '<p class="parish-popup__empty">Open the parish page for the best local starting point here.</p>';

  return `
    <div class="parish-popup">
      <div>
        <div class="result-type">Parish</div>
        <h4>${escapeHtml(parish.label)}</h4>
        <p>Open the parish page or jump into a city, town, or local area lookup.</p>
      </div>

      <div class="parish-popup__actions">
        <a class="button" href="/parish.html?parish=${encodeURIComponent(parish.key)}">
          Go to ${escapeHtml(parish.label.replace(/\s+Parish$/i, ''))}
        </a>
      </div>

      <div class="parish-popup__cities">
        <div class="result-type">Local places</div>
        <div class="popup-chip-list">
          ${placeLinks}
        </div>
      </div>
    </div>
  `;
}

function renderCityPopup(city) {
  const contactRows = [
    ['Place type', city.placeType],
    ['Office', city.contactOrganization],
    ['Address', city.address],
    ['Phone', city.phone],
    ['Fax', city.fax],
    ['Email', city.email],
  ]
    .filter(([, value]) => Boolean(value))
    .map(
      ([label, value]) => `
        <div class="contact-field">
          <span class="contact-label">${escapeHtml(label)}</span>
          <span class="contact-value">${renderContactValue(value)}</span>
        </div>
      `,
    )
    .join('');

  return `
    <div class="parish-popup district-mode-popup">
      <div>
        <div class="result-type">City view</div>
        <h4>${escapeHtml(city.label)}</h4>
        <p>Open a local services lookup or use the official municipal links where available.</p>
      </div>

      ${
        contactRows
          ? `<div class="contact-field-list">${contactRows}</div>`
          : ''
      }

      <div class="parish-popup__actions">
        <a class="button" href="/services.html?lookup=${encodeURIComponent(`${city.label}, LA`)}#results">
          Local services
        </a>
        ${
          city.website
            ? `<a class="button button--secondary" href="${escapeAttribute(city.website)}" target="_blank" rel="noreferrer">Official page</a>`
            : ''
        }
        ${
          city.directoryUrl
            ? `<a class="button button--secondary" href="${escapeAttribute(city.directoryUrl)}" target="_blank" rel="noreferrer">Directory</a>`
            : ''
        }
      </div>
    </div>
  `;
}

function renderHouseDistrictPopup(district) {
  const contactRows = [
    ['Representative', district.representative],
    ['Party', district.party],
    ['District office', district.address],
    ['Phone', district.phone],
    ['Email', district.email],
  ]
    .filter(([, value]) => Boolean(value))
    .map(
      ([label, value]) => `
        <div class="contact-field">
          <span class="contact-label">${escapeHtml(label)}</span>
          <span class="contact-value">${renderContactValue(value)}</span>
        </div>
      `,
    )
    .join('');

  return `
    <div class="parish-popup district-mode-popup">
      <div>
        <div class="result-type">State House</div>
        <h4>${escapeHtml(district.label)}</h4>
        <p>${escapeHtml(
          district.representative
            ? `${district.representative} represents this Louisiana House district.`
            : 'Representative details are not available for this district yet.',
        )}</p>
      </div>

      ${
        contactRows
          ? `<div class="contact-field-list">${contactRows}</div>`
          : ''
      }

      <div class="parish-popup__actions">
        ${
          district.website
            ? `<a class="button" href="${escapeAttribute(district.website)}" target="_blank" rel="noreferrer">Representative page</a>`
            : ''
        }
        <a class="button button--secondary" href="https://legis.la.gov/legis/FindMyLegislators.aspx" target="_blank" rel="noreferrer">
          Legislator lookup
        </a>
      </div>
    </div>
  `;
}

function renderCongressionalDistrictPopup(district) {
  const contactRows = [
    ['Representative', district.representative],
    ['Party', district.party],
    ['Office room', district.officeRoom],
    ['Phone', district.phone],
  ]
    .filter(([, value]) => Boolean(value))
    .map(
      ([label, value]) => `
        <div class="contact-field">
          <span class="contact-label">${escapeHtml(label)}</span>
          <span class="contact-value">${renderContactValue(value)}</span>
        </div>
      `,
    )
    .join('');

  return `
    <div class="parish-popup district-mode-popup">
      <div>
        <div class="result-type">Congress</div>
        <h4>${escapeHtml(district.label)}</h4>
        <p>${escapeHtml(
          district.representative
            ? `${district.representative} represents this U.S. House district.`
            : 'Representative details are not available for this district yet.',
        )}</p>
      </div>

      ${
        contactRows
          ? `<div class="contact-field-list">${contactRows}</div>`
          : ''
      }

      <div class="parish-popup__actions">
        ${
          district.website
            ? `<a class="button" href="${escapeAttribute(district.website)}" target="_blank" rel="noreferrer">Member site</a>`
            : ''
        }
        <a class="button button--secondary" href="https://www.house.gov/representatives/find-your-representative" target="_blank" rel="noreferrer">
          House lookup
        </a>
      </div>
    </div>
  `;
}

function setActiveLayerStyle(layer, { mode, selected }) {
  if (mode === 'cities') {
    layer.setStyle({
      color: '#315f25',
      weight: selected ? 2.8 : 2,
      fillColor: selected ? '#D4AD42' : '#83b85b',
      fillOpacity: selected ? 0.38 : 0.24,
    });
    return;
  }

  if (mode === 'house') {
    layer.setStyle({
      color: '#162e51',
      weight: selected ? 2.8 : 2,
      fillColor: selected ? '#D4AD42' : '#73b3e7',
      fillOpacity: selected ? 0.38 : 0.24,
    });
    return;
  }

  if (mode === 'congress') {
    layer.setStyle({
      color: '#7f2f16',
      weight: selected ? 3 : 2.2,
      fillColor: selected ? '#D4AD42' : '#fa9441',
      fillOpacity: selected ? 0.38 : 0.24,
    });
    return;
  }

  layer.setStyle({
    weight: selected ? 2.6 : 2.2,
    fillOpacity: selected ? 0.36 : 0.28,
  });
}

function getParishKey(label) {
  return normalizeLookupName(label).replace(/parish$/, '');
}

function buildCities(featureCollection) {
  return (featureCollection.features ?? [])
    .map((feature) => getCity(feature))
    .sort((left, right) => left.label.localeCompare(right.label));
}

function buildHouseDistricts(featureCollection) {
  return (featureCollection.features ?? [])
    .map((feature) => getHouseDistrict(feature))
    .sort((left, right) => Number(left.key) - Number(right.key));
}

function buildCongressionalDistricts(featureCollection) {
  return (featureCollection.features ?? [])
    .map((feature) => getCongressionalDistrict(feature))
    .sort((left, right) => Number(left.key) - Number(right.key));
}

function getCity(feature) {
  const properties = feature.properties ?? {};
  const key = String(properties.__districtKey ?? properties.GEOID ?? '').trim();
  const name = properties.__districtLabel ?? properties.BASENAME ?? properties.NAME ?? key;
  const placeType = getPlaceType(properties.NAME, name);

  return {
    key,
    label: name,
    placeType,
    contactOrganization: properties.__contactOrganization ?? '',
    address: properties.__contactAddress ?? '',
    phone: properties.__contactPhone ?? '',
    fax: properties.__contactFax ?? '',
    email: properties.__contactEmail ?? '',
    website: properties.__officialWebsite ?? '',
    directoryUrl: properties.__officeDirectoryUrl ?? '',
    feature,
  };
}

function getHouseDistrict(feature) {
  const properties = feature.properties ?? {};
  const key = String(properties.__districtKey ?? properties.DISTRICT_I ?? '').trim();

  return {
    key,
    label: properties.__districtLabel ?? properties.NAME ?? `District ${key}`,
    representative: properties.__representative ?? '',
    party: properties.__party ?? '',
    address: properties.__contactAddress ?? '',
    phone: properties.__contactPhone ?? '',
    email: properties.__contactEmail ?? '',
    website: properties.__officialWebsite ?? '',
    feature,
  };
}

function getCongressionalDistrict(feature) {
  const properties = feature.properties ?? {};
  const key = String(properties.__districtKey ?? properties.DISTRICT_I ?? '').trim();

  return {
    key,
    label: properties.__districtLabel ?? properties.NAME ?? `District ${key}`,
    representative: properties.__representative ?? '',
    party: properties.__party ?? '',
    officeRoom: properties.__officeRoom ?? '',
    phone: properties.__contactPhone ?? '',
    website: properties.__officialWebsite ?? '',
    feature,
  };
}

function getPlaceType(fullName, label) {
  const suffix = String(fullName ?? '')
    .replace(label, '')
    .trim();

  return suffix ? suffix[0].toUpperCase() + suffix.slice(1) : 'Municipality';
}

function getIdleStatus(mode) {
  if (mode === 'cities') {
    return 'Hover a city, town, or village to preview its municipal boundary. Click to open local links.';
  }

  if (mode === 'house') {
    return 'Hover a House district to preview it. Click to open representative contact details.';
  }

  if (mode === 'congress') {
    return 'Hover a congressional district to preview it. Click to open U.S. House representative details.';
  }

  return 'Hover a parish to preview it. Click to open the parish and city chooser.';
}

function buildMapPopup() {
  return L.popup({
    closeButton: true,
    autoPan: true,
    maxWidth: 420,
  });
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
    return `<a href="mailto:${escapeAttribute(trimmed)}">${escapeHtml(trimmed)}</a>`;
  }

  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 10 || digits.length === 11) {
    return `<a href="tel:${escapeAttribute(digits)}">${escapeHtml(trimmed)}</a>`;
  }

  return escapeHtml(trimmed);
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.json();
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
