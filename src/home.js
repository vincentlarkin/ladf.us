import './style.css';
import {
  bindSiteChrome,
  renderBreadcrumb,
  renderSidebar,
  renderSiteFooter,
  renderSiteHeader,
} from './siteChrome.js';

const HOME_UPDATED_AS = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
}).format(new Date());

const HOME_LOGOS = [
  {
    src: '/org-logos/louisiana-state-seal.png',
    alt: 'Louisiana state seal',
    label: 'Statewide',
  },
  {
    src: '/org-logos/louisiana-sos-seal.png',
    alt: 'Louisiana Secretary of State seal',
    label: 'Elections',
  },
  {
    src: '/org-logos/louisiana-sheriffs-logo.jpeg',
    alt: 'Louisiana Sheriffs Association logo',
    label: 'Sheriffs',
  },
  {
    src: '/org-logos/louisiana-clerks-logo.png',
    alt: 'Louisiana Clerks of Court Association logo',
    label: 'Clerks',
  },
  {
    src: '/org-logos/louisiana-assessors-logo.jpg',
    alt: 'Louisiana Assessors Association logo',
    label: 'Assessors',
  },
  {
    src: '/org-logos/municipal/batonrouge-83e4480ee0.png',
    alt: 'Baton Rouge logo',
    label: 'Cities',
  },
];

document.querySelector('#app').innerHTML = `
  <div class="page">
    ${renderSiteHeader({ activePage: 'home' })}

    <div class="site-body">
      ${renderSidebar({
        sections: [
          { href: '#overview', label: 'Overview' },
          { href: '#directory', label: 'Parish Directory' },
          { href: '#services', label: 'Services by ZIP' },
          { href: '#disclaimer', label: 'Quick Note' },
        ],
      })}

      <main class="content">
        <div class="content__inner">
          ${renderBreadcrumb([{ label: 'Home' }])}

          <section class="page-intro page-intro--compact" id="overview">
            <div class="home-hero">
              <div class="page-intro__title-block">
                <div class="eyebrow">Louisiana Data Force</div>
                <p class="page-intro__meta">Updated as of ${escapeHtml(HOME_UPDATED_AS)}</p>
                <h1>Find the parish page, city contact, or local link you need.</h1>
                <p class="lead">
                  Pick a parish, jump into the main local links, or use the ZIP lookup
                  when you just need the best place to start.
                </p>
                <div class="cta-row">
                  <a class="button" href="/services.html">Search by ZIP or city</a>
                  <a class="button button--secondary" href="/map.html">Browse parish map</a>
                </div>
              </div>

              <div class="home-hero__panel" aria-label="Louisiana directory coverage">
                <div class="home-hero__seal">
                  <img src="/org-logos/louisiana-state-seal.png" alt="Louisiana state seal" />
                </div>
                <div class="home-hero__metrics">
                  <article>
                    <span>Parishes</span>
                    <strong>64</strong>
                  </article>
                  <article>
                    <span>Municipalities</span>
                    <strong>300+</strong>
                  </article>
                  <article>
                    <span>City logos</span>
                    <strong>60</strong>
                  </article>
                </div>
              </div>
            </div>

            <div class="home-logo-strip" aria-label="Directory source categories">
              ${HOME_LOGOS.map(renderHomeLogo).join('')}
            </div>
          </section>

          <section class="section" id="directory">
            <h2>Parish Directory</h2>
            <div class="card-grid card-grid--two">
              <article class="info-card">
                <div class="result-type">Parish pages</div>
                <h4>Open a parish and get straight to the main local contacts</h4>
                <p>
                  Each parish page pulls the main parish contacts, cities and towns,
                  and parish-level links into one cleaner view.
                </p>
              </article>
              <article class="info-card">
                <div class="result-type">Quick access</div>
                <h4>Use the map when you know the parish name or just want to browse</h4>
                <p>
                  The parish map is the fastest way to jump into a parish page without
                  digging through a bunch of scattered pages first.
                </p>
              </article>
            </div>
            <div class="link-list">
              <a href="/map.html">Open parish map</a>
              <a href="/map.html#directory-list">Browse all parishes</a>
            </div>
          </section>

          <section class="section" id="services">
            <h2>Services by ZIP</h2>
            <div class="home-action-grid">
              <a class="home-action-card" href="/services.html">
                <div class="result-type">Lookup</div>
                <h4>Search by ZIP, city, or address</h4>
                <p>
                  Start with the place you live, and the lookup points you toward likely
                  local contacts for things like water, trash, permits, and parish offices.
                </p>
              </a>
              <a class="home-action-card" href="/services.html?lookup=Shreveport%2C%20LA#results">
                <div class="result-type">Routing</div>
                <h4>See a city directory in context</h4>
                <p>
                  City, parish, and service cards sit together so the right first call is
                  easier to compare.
                </p>
              </a>
              <a class="home-action-card" href="/map.html#directory-list">
                <div class="result-type">Directory</div>
                <h4>Jump from parish to local places</h4>
                <p>
                  The parish map opens pages and local place links without making you
                  remember every jurisdiction boundary.
                </p>
              </a>
            </div>
          </section>

          <section class="section" id="disclaimer">
            <h2>A Quick Note</h2>
            <div class="disclaimer-box">
              <p>
                This is an independent Louisiana guide built to make local links easier
                to find.
              </p>
              <p>
                Hours, staff names, forms, and service details can change, so double-check
                the office page before you go.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>

    ${renderSiteFooter()}
  </div>
`;

bindSiteChrome();

function renderHomeLogo(logo) {
  return `
    <div class="home-logo-tile">
      <span class="logo-badge logo-badge--white">
        <img src="${escapeAttribute(logo.src)}" alt="${escapeAttribute(logo.alt)}" loading="lazy" />
      </span>
      <span>${escapeHtml(logo.label)}</span>
    </div>
  `;
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
