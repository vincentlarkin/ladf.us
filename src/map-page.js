import './style.css';
import { initDistrictMap } from './districtMap.js';

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
            <li><a class="nav__link is-active" href="/map.html">Find Your Districts</a></li>
            <li><a class="nav__link" href="/services.html">Services by ZIP</a></li>
            <li><a class="nav__link" href="#map-tool">Map Tool</a></li>
            <li><a class="nav__link" href="#how-overlap-works">How It Works</a></li>
            <li><a class="nav__link" href="#directory">Contact Directory</a></li>
            <li><a class="nav__link" href="#sources">Sources</a></li>
          </ul>
        </nav>
      </aside>

      <main class="content content--wide">
        <div class="content__inner content__inner--wide">
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="/index.html">Home</a>
            <span class="breadcrumb__sep">/</span>
            <span>Find Your Districts</span>
          </nav>

          <div class="page-intro">
            <div class="eyebrow">District and representation lookup</div>
            <h1>Find Your Districts</h1>
            <p class="lead">
              Click a point in Louisiana to see the overlapping districts at that
              location. The map shows the stack. The directory on the right expands
              the same point into exact district names, office holders, and direct
              contact paths from official source pages where available.
            </p>
            <div class="disclaimer-box disclaimer-box--compact">
              <p>
                This tool is part of LADF, a private nonprofit civic education
                project. It is not an official government service and does not
                provide legal representation.
              </p>
            </div>
          </div>

          <section class="section section--map" id="map-tool">
            <h2>Interactive District Tool</h2>
            <p>
              Pinned lookups use the active layers at that point inside Louisiana,
              even when some of those layers are still waiting on a closer zoom to
              draw. Use the Shreveport demo button when you want the local district
              outlines drawn directly on the map.
            </p>

            <div class="map-shell">
              <div class="map-stage">
                <div class="map-view">
                  <div id="district-map" class="district-map" aria-label="Interactive district map">
                    <div class="map-loading" id="map-loading">
                      <span class="loader"></span>
                      Loading verified district layers...
                    </div>
                  </div>

                  <aside class="map-flyout" aria-live="polite">
                    <div id="quicklook-summary" class="quicklook-summary">
                      <div class="summary-kicker">Map quicklook</div>
                      <h4>Move over the map.</h4>
                      <p>Click to pin a point and open a district popup plus the contact directory.</p>
                    </div>
                    <div id="quicklook-results" class="quicklook-results"></div>
                  </aside>
                </div>

                <div class="map-caption">
                  <span>Default statewide stack: municipality, parish, House, Senate, Congress</span>
                  <span>Shreveport local layers can be loaded when you want the current city demo</span>
                  <span>Use the full map area to click and pin exact locations</span>
                </div>
              </div>

              <aside class="map-sidebar">
                <section class="panel">
                  <div class="panel-heading">
                    <h3>Layer Controls</h3>
                    <p>Choose the layers to inspect. Local demo layers are off by default.</p>
                  </div>
                  <div id="layer-controls" class="layer-controls"></div>
                </section>

                <section class="panel">
                  <div class="panel-heading">
                    <h3>Lookup Tools</h3>
                    <p>Jump to a city, search an address, or open the Shreveport demo stack.</p>
                  </div>

                  <label class="field-label" for="city-jump">Quick city zoom</label>
                  <select id="city-jump" class="city-select">
                    <option value="">Jump to a city</option>
                  </select>

                  <form id="search-form" class="search-form">
                    <label class="sr-only" for="address-search">Address search</label>
                    <input
                      id="address-search"
                      name="address-search"
                      type="search"
                      placeholder="Search a Louisiana address"
                      autocomplete="street-address"
                    />
                    <button class="button" type="submit">Find</button>
                  </form>

                  <div class="tool-row">
                    <button class="button" id="use-location" type="button">Use my location</button>
                    <button class="button" id="clear-pin" type="button">Clear pin</button>
                  </div>

                  <div class="tool-row">
                    <button class="button" id="view-statewide" type="button">Statewide view</button>
                    <button class="button" id="view-caddo" type="button">Shreveport demo</button>
                  </div>

                  <label class="toggle">
                    <input id="basemap-toggle" type="checkbox" checked />
                    <span>Reference basemap</span>
                  </label>

                  <p class="control-hint">
                    Hover updates the small in-map module. Clicking a point inside
                    Louisiana opens the map popup and locks the side directory to that
                    location. Layer toggles control both the popup and the directory.
                    Mouse wheel page scrolling stays with the page instead of zooming
                    the map.
                  </p>

                  <p class="status-line" id="map-status">
                    Hover for a quick preview. Click any Louisiana location to pin the district overlap.
                  </p>
                </section>

                <section class="panel" id="directory">
                  <div class="panel-heading">
                    <h3>Contact Directory</h3>
                    <p>Pinned lookup for the current map location.</p>
                  </div>
                  <div id="contact-summary" class="contact-summary">
                    <div class="summary-kicker">Awaiting pin</div>
                    <h4>Click a point on the map.</h4>
                    <p>The directory fills with the exact overlap stack, what each layer does, and who to contact for the pinned location.</p>
                  </div>
                  <div id="contact-results" class="contact-results"></div>
                </section>
              </aside>
            </div>
          </section>

          <section class="section" id="how-overlap-works">
            <h2>Why One Address Can Have Many Districts</h2>
            <p>
              In Louisiana, one location can sit inside several layers of
              government at the same time. That is not overkill in itself. It means
              different bodies handle different responsibilities, and the map helps
              separate who controls which issue.
            </p>
            <div class="table-wrap">
              <table class="info-table">
                <thead>
                  <tr>
                    <th>Level</th>
                    <th>Example body in Shreveport</th>
                    <th>What it generally handles</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>City</td>
                    <td>Shreveport City Council</td>
                    <td>City ordinances, local police, sanitation, zoning, and municipal services.</td>
                  </tr>
                  <tr>
                    <td>Parish</td>
                    <td>Caddo Parish Commission</td>
                    <td>Parish roads, the jail, animal control, and parish administration.</td>
                  </tr>
                  <tr>
                    <td>School</td>
                    <td>Caddo Parish School Board</td>
                    <td>School governance, district policy, and education tax representation.</td>
                  </tr>
                  <tr>
                    <td>State</td>
                    <td>Louisiana House and Senate</td>
                    <td>State laws, the state budget, major infrastructure policy, and statewide oversight.</td>
                  </tr>
                  <tr>
                    <td>Federal</td>
                    <td>U.S. House district</td>
                    <td>Congressional representation and federal constituent-service routing.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="card-grid card-grid--two">
              <article class="info-card">
                <div class="result-type">Map flow</div>
                <h4>How to use this page</h4>
                <p>
                  Click a point on the map, review the popup for the immediate
                  stack, then use the contact directory to see office names,
                  purposes, and direct contact details for that exact location.
                </p>
              </article>
              <article class="info-card">
                <div class="result-type">LADF standard</div>
                <h4>What this page is aiming to be</h4>
                <p>
                  A primary-source-first Louisiana civics reference: maps, district
                  lookup, and plain-language routing so residents can tell which body
                  actually governs the issue in front of them.
                </p>
              </article>
            </div>
          </section>

          <section class="section" id="sources">
            <h2>Sources</h2>
            <p>
              The map serves normalized local GeoJSON files, but the source data comes from
              public census, legislative, and civic GIS feeds and can be refreshed locally.
            </p>
            <div class="source-meta">
              <span id="sync-stamp">Waiting for sync metadata...</span>
            </div>
            <div class="source-list" id="source-list"></div>
          </section>
        </div>
      </main>
    </div>

    <footer class="site-footer">
      <div class="site-footer__inner">
        <span class="flag-glyph">LA</span>
        <span>LADF is a private nonprofit civic education organization and is not affiliated with Louisiana state or local government.</span>
        <span><a href="/services.html">Services by ZIP</a> | <a href="/index.html#disclaimer">Disclaimer</a></span>
      </div>
    </footer>
  </div>
`;

initDistrictMap();
