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

document.title = 'LADF | Parish Map';

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
                and city links. If you already know the parish name, use the list on
                the right for a direct jump.
              </p>
            </div>

            <div class="cta-row">
              <a class="button" href="#directory-list">Browse all parishes</a>
              <a class="button button--secondary" href="/services.html">Open services by ZIP</a>
            </div>
          </section>

          <section class="section section--map" id="map-tool">
            <h2>Interactive Parish Map</h2>
            <div class="parish-map-shell">
              <div class="parish-map-stage">
                <div id="parish-map" class="district-map parish-map" aria-label="Louisiana parish map">
                  <div class="map-loading" id="map-loading">
                    <span class="loader"></span>
                    Loading parish boundaries...
                  </div>
                </div>
                <p class="status-line" id="map-status">
                  Hover a parish to preview it. Click to open the parish and city chooser.
                </p>
              </div>

              <aside class="panel parish-list-panel" id="directory-list">
                <div class="panel-heading">
                  <h3>All Parishes</h3>
                  <p>
                    Parish buttons open the parish page directly. Map clicks open the
                    simpler chooser with parish and city links.
                  </p>
                </div>
                <label class="field-label" for="parish-filter">Filter parishes</label>
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
const statusNode = document.querySelector('#map-status');
const loadingNode = document.querySelector('#map-loading');

const [parishIndex, parishDirectory] = await Promise.all([
  loadParishIndex(),
  fetchJson('/data/service-directory.json').catch(() => ({ parishes: [] })),
]);

const parishLookup = buildParishLookup(parishDirectory);

renderParishList(parishIndex);
initializeMap(parishIndex, parishLookup);

filterNode.addEventListener('input', () => {
  const query = filterNode.value.trim().toLowerCase();
  const filtered = parishIndex.filter((parish) =>
    parish.label.toLowerCase().includes(query),
  );
  renderParishList(filtered);
});

function initializeMap(parishes, parishLookup) {
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

  const geoJsonLayer = L.geoJSON(
    {
      type: 'FeatureCollection',
      features: parishes.map((parish) => parish.feature),
    },
    {
      style: () => ({
        color: '#0b2f5b',
        weight: 1.2,
        fillColor: '#d4af37',
        fillOpacity: 0.14,
      }),
      onEachFeature(feature, layer) {
        const parishLabel = feature.properties.__districtLabel ?? feature.properties.NAME;
        const parishKey = getParishKey(parishLabel);

        layer.on('mouseover', () => {
          if (selectedLayer === layer) {
            return;
          }

          if (hoverLayer && hoverLayer !== layer && hoverLayer !== selectedLayer) {
            geoJsonLayer.resetStyle(hoverLayer);
          }

          hoverLayer = layer;
          setActiveLayerStyle(layer, { selected: false });
          statusNode.textContent = `${parishLabel} selected. Click to open the parish and city chooser.`;
        });

        layer.on('mouseout', () => {
          if (hoverLayer === layer && selectedLayer !== layer) {
            geoJsonLayer.resetStyle(layer);
            hoverLayer = null;
          }

          if (!selectedLayer) {
            statusNode.textContent =
              'Hover a parish to preview it. Click to open the parish and city chooser.';
          }
        });

        layer.on('click', (event) => {
          if (selectedLayer && selectedLayer !== layer) {
            geoJsonLayer.resetStyle(selectedLayer);
          }

          selectedLayer = layer;
          hoverLayer = layer;
          setActiveLayerStyle(layer, { selected: true });
          statusNode.textContent = `${parishLabel} selected. Choose the parish page or a city in the popup.`;

          L.popup({
            closeButton: true,
            autoPan: true,
            maxWidth: 420,
          })
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
  ).addTo(map);

  map.on('popupclose', () => {
    if (selectedLayer) {
      geoJsonLayer.resetStyle(selectedLayer);
      selectedLayer = null;
    }

    if (hoverLayer && hoverLayer !== selectedLayer) {
      geoJsonLayer.resetStyle(hoverLayer);
      hoverLayer = null;
    }

    statusNode.textContent =
      'Hover a parish to preview it. Click to open the parish and city chooser.';
  });

  map.fitBounds(geoJsonLayer.getBounds().pad(0.04));
  loadingNode.classList.add('is-hidden');
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
  const cityLinks = parish.cityNames.length
    ? parish.cityNames
        .map(
          (cityName) => `
            <a
              class="quick-chip quick-chip--link"
              href="/services.html?lookup=${encodeURIComponent(`${cityName}, LA`)}"
            >
              ${escapeHtml(cityName)}
            </a>
          `,
        )
        .join('')
    : '<p class="parish-popup__empty">City links are still being added for this parish.</p>';

  return `
    <div class="parish-popup">
      <div>
        <div class="result-type">Parish</div>
        <h4>${escapeHtml(parish.label)}</h4>
        <p>Open the parish page or jump into a city lookup.</p>
      </div>

      <div class="parish-popup__actions">
        <a class="button" href="/parish.html?parish=${encodeURIComponent(parish.key)}">
          Go to ${escapeHtml(parish.label.replace(/\s+Parish$/i, ''))}
        </a>
      </div>

      <div class="parish-popup__cities">
        <div class="result-type">Cities</div>
        <div class="popup-chip-list">
          ${cityLinks}
        </div>
      </div>
    </div>
  `;
}

function setActiveLayerStyle(layer, { selected }) {
  layer.setStyle({
    weight: selected ? 2.6 : 2.2,
    fillOpacity: selected ? 0.36 : 0.28,
  });
}

function getParishKey(label) {
  return normalizeLookupName(label).replace(/parish$/, '');
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
