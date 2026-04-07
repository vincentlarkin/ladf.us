import './style.css';

const LOCAL_DEMO_LAYER_IDS = new Set([
  'caddo-commission',
  'shreveport-council',
  'caddo-school-board',
]);

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
            <li><a class="nav__link is-active" href="/index.html">Home</a></li>
            <li><a class="nav__link" href="/map.html">Parish Map</a></li>
            <li><a class="nav__link" href="/services.html">Services by ZIP</a></li>
            <li><a class="nav__link" href="#overview">Overview</a></li>
            <li><a class="nav__link" href="#coverage">Coverage</a></li>
            <li><a class="nav__link" href="#workflow">Workflow</a></li>
            <li><a class="nav__link" href="#standards">Standards</a></li>
            <li><a class="nav__link" href="#sources">Sources</a></li>
            <li><a class="nav__link" href="#disclaimer">Disclaimer</a></li>
          </ul>
        </nav>
      </aside>

      <main class="content">
        <div class="content__inner">
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <span>Home</span>
          </nav>

          <div class="page-intro hero-grid" id="start">
            <div>
              <div class="eyebrow">Louisiana civic infrastructure</div>
              <h1>Plain-language Louisiana civics with parish-first directories.</h1>
              <p class="lead">
                Louisiana Data & Defense Foundation (LADF) is an independent,
                nonpartisan civic education project focused on one thing:
                turning public Louisiana government data into tools regular
                people can actually use.
              </p>
              <p class="lead">
                The current launch build centers on parish directories, contact
                routing, public-source transparency, and a structure that can
                expand into laws, guides, meeting tracking, and records access.
              </p>
              <div class="cta-row">
                <a class="button" href="/map.html">Browse parish directories</a>
                <a class="button button--secondary" href="#coverage">See launch coverage</a>
              </div>
            </div>

            <aside class="hero-aside hero-aside--metrics">
              <div>
                <div class="summary-kicker">Live snapshot</div>
                <h4>Data-backed from the first load.</h4>
                <p>
                  The homepage reads the same sync manifest the map uses, so the
                  launch scope stays tied to the actual district files bundled
                  with the site.
                </p>
              </div>
              <div class="stats-grid">
                <article class="stat-card">
                  <span class="stat-card__value" id="home-layer-count">--</span>
                  <span class="stat-card__label">Published layers</span>
                </article>
                <article class="stat-card">
                  <span class="stat-card__value" id="home-feature-count">--</span>
                  <span class="stat-card__label">Saved features</span>
                </article>
                <article class="stat-card">
                  <span class="stat-card__value" id="home-place-count">--</span>
                  <span class="stat-card__label">Municipal boundaries</span>
                </article>
                <article class="stat-card">
                  <span class="stat-card__value" id="home-local-count">--</span>
                  <span class="stat-card__label">Local demo layers</span>
                </article>
              </div>
              <p class="mini-meta" id="home-sync-stamp">Loading sync details...</p>
            </aside>
          </div>

          <section class="section" id="overview">
            <h2>What You Can Do Here</h2>
            <div class="card-grid">
              <article class="info-card">
                <div class="result-type">Launch feature</div>
                <h4>Open a parish directory</h4>
                <p>
                  Click a parish on the Louisiana map and jump straight to a
                  dedicated contact page for that parish.
                </p>
              </article>
              <article class="info-card">
                <div class="result-type">Launch feature</div>
                <h4>Route local services</h4>
                <p>
                  Search by ZIP, city, or address to see who likely handles water,
                  trash, permits, parish offices, and other local-service questions.
                </p>
              </article>
              <article class="info-card">
                <div class="result-type">Launch feature</div>
                <h4>Start with Caddo Parish</h4>
                <p>
                  The first expanded parish page is Caddo, with parish offices,
                  district rosters, municipal contacts, and the parish GOP.
                </p>
              </article>
              <article class="info-card">
                <div class="result-type">Launch feature</div>
                <h4>Trace the source data</h4>
                <p>
                  Review the manifest, layer sources, and refresh workflow so
                  the map is not a black box. The site is designed to stay
                  primary-source first.
                </p>
              </article>
            </div>
          </section>

          <section class="section" id="coverage">
            <h2>Launch Coverage</h2>
            <p>
              The current launch scope is statewide for reference and
              parish selection, with a deeper first local directory in
              Caddo Parish.
            </p>
            <div class="card-grid card-grid--two">
              <article class="info-card">
                <div class="result-type">Statewide</div>
                <h4>All 64 parishes</h4>
                <p>
                  The new parish map shows every parish and opens a dedicated
                  parish page instead of trying to show every directory inline.
                </p>
              </article>
              <article class="info-card">
                <div class="result-type">Local depth</div>
                <h4>Caddo first</h4>
                <p>
                  Caddo includes parish government, core offices, district
                  rosters, and municipal contacts as the first fuller template.
                </p>
              </article>
            </div>
            <div class="link-list">
              <a href="/map.html">Open the parish map</a>
              <a href="/parish.html?parish=caddo">Open Caddo Parish</a>
              <a href="/services.html">Open the services-by-ZIP lookup</a>
              <a href="/map.html#hosting">Read the static-hosting note</a>
              <a href="/map.html#directory-list">Browse all parishes</a>
            </div>
          </section>

          <section class="section" id="workflow">
            <h2>How the Site Works</h2>
            <div class="workflow-grid">
              <article class="workflow-step">
                <div class="result-type">1. Sync</div>
                <h4>Collect public GIS and directory data</h4>
                <p>
                  Public district and boundary files are normalized into local
                  GeoJSON so the deployed site can serve them quickly and
                  consistently.
                </p>
              </article>
              <article class="workflow-step">
                <div class="result-type">2. Verify</div>
                <h4>Document what the map is using</h4>
                <p>
                  Each refresh writes a manifest with timestamps, feature
                  counts, and upstream source links so the build can expose its
                  own provenance.
                </p>
              </article>
              <article class="workflow-step">
                <div class="result-type">3. Publish</div>
                <h4>Ship a static site that is easy to host</h4>
                <p>
                  The app builds into plain static assets and can sit behind
                  Nginx on its own or inside Docker without needing a running
                  app server.
                </p>
              </article>
            </div>
            <div class="disclaimer-box">
              <h4>Why "Defense" is in the name</h4>
              <p>
                LADF is not a law-enforcement, military, or private security
                service. "Defense" here means defending transparency, due
                process, and accountable government through public information
                and civic education.
              </p>
            </div>
          </section>

          <section class="section" id="standards">
            <h2>Operating Standards</h2>
            <ul class="principles-list">
              <li>
                <strong>Nonpartisan by design.</strong> The site explains who
                governs what and where to find the source record. It does not
                tell people how to vote.
              </li>
              <li>
                <strong>Primary-source first.</strong> Every mapped layer should
                point back to the official district file, agency page, or public
                directory that supports it.
              </li>
              <li>
                <strong>Corrections should be visible.</strong> When source data
                changes, the refresh date and file counts should change with it.
              </li>
              <li>
                <strong>Static-first deployment.</strong> This build favors a
                static output so hosting stays simple, cheap, and easy to mirror.
              </li>
            </ul>
          </section>

          <section class="section" id="sources">
            <h2>Source and Build Notes</h2>
            <p>
              The map bundle already includes synced GeoJSON in
              <code>public/data</code>, so the site can build and deploy without
              reaching back out to upstream GIS endpoints during every Docker
              build.
            </p>
            <div class="card-grid card-grid--two">
              <article class="info-card">
                <div class="result-type">Current build</div>
                <h4>Static output</h4>
                <p>
                  Vite compiles the site into plain files that Nginx can serve
                  directly. No Node process is needed in production after the
                  image is built.
                </p>
              </article>
              <article class="info-card">
                <div class="result-type">Refresh path</div>
                <h4>Optional data resync</h4>
                <p>
                  When you want new public boundary files, run
                  <code>npm run sync:data</code>, review the changed GeoJSON, and
                  rebuild the site.
                </p>
              </article>
            </div>
            <p class="mini-meta" id="home-source-note">
              The source manifest is loaded from this build at runtime.
            </p>
          </section>

          <section class="section" id="disclaimer">
            <h2>Disclaimer</h2>
            <div class="disclaimer-box">
              <p>
                LADF is a private civic education project and is not affiliated
                with the State of Louisiana, any parish or municipality, or any
                public agency.
              </p>
              <p>
                The site is informational and educational. Official government
                websites, clerks, agencies, and elected offices remain the
                controlling sources for legal notices, filings, and government
                action.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>

    <footer class="site-footer">
      <div class="site-footer__inner">
        <span class="flag-glyph">LA</span>
        <span>LADF is a private nonprofit civic education organization and is not affiliated with Louisiana state or local government.</span>
        <span><a href="/map.html">Parish Map</a> | <a href="/services.html">Services by ZIP</a></span>
      </div>
    </footer>
  </div>
`;

hydrateHomeStats();

async function hydrateHomeStats() {
  const layerCountNode = document.querySelector('#home-layer-count');
  const featureCountNode = document.querySelector('#home-feature-count');
  const placeCountNode = document.querySelector('#home-place-count');
  const localCountNode = document.querySelector('#home-local-count');
  const syncStampNode = document.querySelector('#home-sync-stamp');
  const sourceNoteNode = document.querySelector('#home-source-note');

  try {
    const response = await fetch('/data/manifest.json');
    if (!response.ok) {
      throw new Error(`Failed to load manifest: ${response.status}`);
    }

    const manifest = await response.json();
    const layers = manifest.layers ?? [];
    const totalFeatures = layers.reduce(
      (sum, layer) => sum + (Number(layer.featureCount) || 0),
      0,
    );
    const placeLayer = layers.find((layer) => layer.id === 'louisiana-places');
    const localLayerCount = layers.filter((layer) =>
      LOCAL_DEMO_LAYER_IDS.has(layer.id),
    ).length;

    layerCountNode.textContent = formatNumber(layers.length);
    featureCountNode.textContent = formatNumber(totalFeatures);
    placeCountNode.textContent = formatNumber(placeLayer?.featureCount ?? 0);
    localCountNode.textContent = formatNumber(localLayerCount);
    syncStampNode.textContent = `Last synced ${new Date(
      manifest.generatedAt,
    ).toLocaleString()}`;
    sourceNoteNode.textContent = `${formatNumber(
      layers.length,
    )} published layer manifests are bundled with this build.`;
  } catch (error) {
    console.error(error);
    syncStampNode.textContent = 'Sync metadata is unavailable in this build.';
    sourceNoteNode.textContent =
      'Runtime manifest details could not be loaded from /data/manifest.json.';
  }
}

function formatNumber(value) {
  return Number(value).toLocaleString();
}
