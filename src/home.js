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

document.querySelector('#app').innerHTML = `
  <div class="page">
    ${renderSiteHeader({ activePage: 'home' })}

    <div class="site-body">
      ${renderSidebar({
        sections: [
          { href: '#overview', label: 'Overview' },
          { href: '#directory', label: 'Parish Directory' },
          { href: '#services', label: 'Services by ZIP' },
          { href: '#disclaimer', label: 'Disclaimer' },
        ],
      })}

      <main class="content">
        <div class="content__inner">
          ${renderBreadcrumb([{ label: 'Home' }])}

          <section class="page-intro page-intro--compact" id="overview">
            <div class="page-intro__title-block">
              <div class="eyebrow">Louisiana civic directories</div>
              <p class="page-intro__meta">Updated as of ${escapeHtml(HOME_UPDATED_AS)}</p>
              <h1>Find the parish office or local service link you need.</h1>
              <p class="lead">
                LADF keeps Louisiana local government information simple: pick a parish,
                open official office links, and use the ZIP lookup when you just need the
                right place to start.
              </p>
            </div>

            <div class="summary-metrics parish-summary-grid">
              <article class="summary-metric">
                <span class="metric-label">Parishes</span>
                <strong>64</strong>
              </article>
              <article class="summary-metric">
                <span class="metric-label">Municipalities</span>
                <strong>300+</strong>
              </article>
              <article class="summary-metric">
                <span class="metric-label">Coverage</span>
                <strong>Statewide</strong>
              </article>
            </div>

            <div class="cta-row">
              <a class="button" href="/map.html">Browse parish map</a>
              <a class="button button--secondary" href="/services.html">Open services by ZIP</a>
            </div>
          </section>

          <section class="section" id="directory">
            <h2>Parish Directory</h2>
            <div class="card-grid card-grid--two">
              <article class="info-card">
                <div class="result-type">Parish pages</div>
                <h4>Open a parish and get straight to the important offices</h4>
                <p>
                  Each parish page groups official contacts, municipal governments, and
                  parish-level links into one cleaner view.
                </p>
              </article>
              <article class="info-card">
                <div class="result-type">Quick access</div>
                <h4>Use the map when you know the parish name or just want to browse</h4>
                <p>
                  The parish map is the fastest way to jump into a parish page without
                  digging through multiple government sites.
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
            <div class="card-grid card-grid--two">
              <article class="info-card">
                <div class="result-type">Lookup</div>
                <h4>Search by ZIP, city, or address</h4>
                <p>
                  Start with the place you live, and the lookup points you toward likely
                  local contacts for things like water, trash, permits, and parish offices.
                </p>
              </article>
              <article class="info-card">
                <div class="result-type">Routing</div>
                <h4>Get a better first stop for everyday local questions</h4>
                <p>
                  The goal is not to replace official offices. It is to help people reach
                  the right official office faster.
                </p>
              </article>
            </div>
            <div class="cta-row">
              <a class="button" href="/services.html">Go to services by ZIP</a>
            </div>
          </section>

          <section class="section" id="disclaimer">
            <h2>Disclaimer</h2>
            <div class="disclaimer-box">
              <p>
                LADF is a private civic education project and is not affiliated with the
                State of Louisiana, any parish or municipality, or any public agency.
              </p>
              <p>
                Official government websites, clerks, agencies, and elected offices remain
                the controlling sources for legal notices, filings, and government action.
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

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
