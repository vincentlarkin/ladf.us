import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { loadParishIndex } from './parishData.js';
import './style.css';

document.querySelector('#app').innerHTML = `
  <div class="page">
    <header class="site-header">
      <div class="site-header__inner">
        <a class="brand" href="/index.html">
          <span class="brand__crest">LA</span>
          <span class="brand__text">
            <span class="brand__name">LADF</span>
            <span class="brand__descriptor">Louisiana Data & Defense Foundation</span>
          </span>
        </a>
      </div>
    </header>

    <div class="site-body">
      <aside class="sidebar">
        <nav class="nav" aria-label="Primary">
          <div class="nav__title">Sections</div>
          <ul class="nav__list">
            <li><a class="nav__link" href="/index.html">Home</a></li>
            <li><a class="nav__link is-active" href="/map.html">Parish Map</a></li>
            <li><a class="nav__link" href="/services.html">Services by ZIP</a></li>
            <li><a class="nav__link" href="#map-tool">Map</a></li>
            <li><a class="nav__link" href="#directory-list">All Parishes</a></li>
            <li><a class="nav__link" href="#why-this-flow">Why This Flow</a></li>
            <li><a class="nav__link" href="#hosting">Static Hosting</a></li>
          </ul>
        </nav>
      </aside>

      <main class="content content--wide">
        <div class="content__inner content__inner--wide">
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="/index.html">Home</a>
            <span class="breadcrumb__sep">/</span>
            <span>Parish Map</span>
          </nav>

          <div class="page-intro">
            <div class="eyebrow">Parish-first directory</div>
            <h1>Pick a parish, then open its contact page.</h1>
            <p class="lead">
              The map is now intentionally simpler. It shows all 64 Louisiana parishes.
              Click a parish or pick it from the list and we send you straight to that
              parish's directory page. Caddo is the first parish with a fuller build-out.
            </p>
            <div class="cta-row">
              <a class="button" href="/parish.html?parish=caddo">Open Caddo Parish</a>
              <a class="button button--secondary" href="#directory-list">Browse all parishes</a>
            </div>
          </div>

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
                  Hover a parish to preview it. Click to open its page.
                </p>
              </div>

              <aside class="panel parish-list-panel" id="directory-list">
                <div class="panel-heading">
                  <h3>All Parishes</h3>
                  <p>
                    One click opens the parish directory. Caddo currently has the
                    richest local directory in this build.
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

          <section class="section" id="why-this-flow">
            <h2>Why This Flow</h2>
            <div class="card-grid card-grid--two">
              <article class="info-card">
                <div class="result-type">Simpler</div>
                <h4>No inline directory clutter</h4>
                <p>
                  The map does one job now: pick a parish. The actual contacts live on a
                  dedicated parish page where we can organize them cleanly.
                </p>
              </article>
              <article class="info-card">
                <div class="result-type">Expandable</div>
                <h4>Parish pages can deepen over time</h4>
                <p>
                  We can enrich one parish at a time. Caddo is first, and the rest can
                  follow the same structure without rebuilding the map every time.
                </p>
              </article>
            </div>
          </section>

          <section class="section" id="hosting">
            <h2>Static Hosting</h2>
            <div class="card-grid card-grid--two">
              <article class="info-card">
                <div class="result-type">Yes</div>
                <h4>This can be static</h4>
                <p>
                  The site builds to plain HTML, CSS, JS, and JSON files. It can be hosted
                  from any normal static host or from the generated <code>dist</code> folder.
                </p>
              </article>
              <article class="info-card">
                <div class="result-type">Optional</div>
                <h4>Docker is only a wrapper</h4>
                <p>
                  Docker is not the app. It is only an optional Nginx container for serving
                  the already-static build when you want that deployment style.
                </p>
              </article>
            </div>
          </section>
        </div>
      </main>
    </div>

    <footer class="site-footer">
      <div class="site-footer__inner">
        <span class="flag-glyph">LA</span>
        <span>LADF is a private nonprofit civic education organization and is not affiliated with Louisiana state or local government.</span>
        <span><a href="/parish.html?parish=caddo">Caddo Parish</a> | <a href="/services.html">Services by ZIP</a></span>
      </div>
    </footer>
  </div>
`;

const parishListNode = document.querySelector('#parish-list');
const parishCountNode = document.querySelector('#parish-count');
const filterNode = document.querySelector('#parish-filter');
const statusNode = document.querySelector('#map-status');
const loadingNode = document.querySelector('#map-loading');

const parishIndex = await loadParishIndex();
renderParishList(parishIndex);
initializeMap(parishIndex);

filterNode.addEventListener('input', () => {
  const query = filterNode.value.trim().toLowerCase();
  const filtered = parishIndex.filter((parish) =>
    parish.label.toLowerCase().includes(query),
  );
  renderParishList(filtered);
});

function initializeMap(parishes) {
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

  let activeLayer = null;

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
        const parishKey = parishLabel
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '')
          .replace(/parish$/, '');

        layer.on('mouseover', () => {
          if (activeLayer && activeLayer !== layer) {
            geoJsonLayer.resetStyle(activeLayer);
          }

          activeLayer = layer;
          layer.setStyle({
            weight: 2.2,
            fillOpacity: 0.28,
          });
          statusNode.textContent = `${parishLabel} selected. Click to open its parish page.`;
        });

        layer.on('mouseout', () => {
          if (activeLayer === layer) {
            geoJsonLayer.resetStyle(layer);
            activeLayer = null;
          }

          statusNode.textContent = 'Hover a parish to preview it. Click to open its page.';
        });

        layer.on('click', () => {
          openParish(parishKey);
        });
      },
    },
  ).addTo(map);

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
