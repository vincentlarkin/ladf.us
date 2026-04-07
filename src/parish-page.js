import './style.css';
import { loadParishProfile } from './parishData.js';

const requestedParish =
  new URLSearchParams(window.location.search).get('parish') ?? 'caddo';

let profile = null;

try {
  profile = await loadParishProfile(requestedParish);
} catch (error) {
  console.error(error);
}

if (!profile) {
  renderMissingParish();
} else {
  renderParishPage(profile);
}

function renderParishPage(parish) {
  document.title = `LADF | ${parish.label}`;

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
              <li><a class="nav__link" href="/map.html">Parish Map</a></li>
              <li><a class="nav__link" href="/services.html">Services by ZIP</a></li>
              <li><a class="nav__link" href="#overview">Overview</a></li>
              <li><a class="nav__link" href="#contacts">Key Contacts</a></li>
              ${
                parish.districtGroups.length
                  ? '<li><a class="nav__link" href="#districts">District Directories</a></li>'
                  : ''
              }
              ${
                parish.municipalities.length
                  ? '<li><a class="nav__link" href="#municipalities">Municipal Governments</a></li>'
                  : ''
              }
              ${
                parish.communityOrganizations.length
                  ? '<li><a class="nav__link" href="#organizations">Organizations</a></li>'
                  : ''
              }
              <li><a class="nav__link" href="#links">Official Links</a></li>
            </ul>
          </nav>
        </aside>

        <main class="content">
          <div class="content__inner content__inner--wide">
            <nav class="breadcrumb" aria-label="Breadcrumb">
              <a href="/index.html">Home</a>
              <span class="breadcrumb__sep">/</span>
              <a href="/map.html">Parish Map</a>
              <span class="breadcrumb__sep">/</span>
              <span>${escapeHtml(parish.label)}</span>
            </nav>

            <div class="page-intro" id="overview">
              <div class="eyebrow">Parish directory</div>
              <h1>${escapeHtml(parish.label)}</h1>
              <p class="lead">${escapeHtml(parish.intro)}</p>
              <div class="summary-metrics parish-summary-grid">
                <article class="summary-metric">
                  <span class="metric-label">Parish seat</span>
                  <strong>${escapeHtml(parish.seat ?? 'Unavailable')}</strong>
                </article>
                <article class="summary-metric">
                  <span class="metric-label">Expanded local directory</span>
                  <strong>${parish.hasEnhancedDirectory ? 'Yes' : 'Not yet'}</strong>
                </article>
                <article class="summary-metric">
                  <span class="metric-label">District rosters on page</span>
                  <strong>${parish.districtGroups.length ? 'Yes' : 'No'}</strong>
                </article>
              </div>
              <div class="cta-row">
                <a class="button" href="/map.html">Back to parish map</a>
                <a class="button button--secondary" href="/services.html">Services by ZIP</a>
              </div>
            </div>

            <section class="section" id="contacts">
              <h2>Key Contacts</h2>
              <div class="directory-grid">
                ${
                  parish.featuredContacts.length
                    ? parish.featuredContacts.map(renderDirectoryCard).join('')
                    : `<article class="info-card">
                        <div class="result-type">No local directory yet</div>
                        <h4>This parish is still on the lightweight profile.</h4>
                        <p>Use the official links below for the current parish contact path.</p>
                      </article>`
                }
              </div>
            </section>

            ${
              parish.districtGroups.length
                ? `
                  <section class="section" id="districts">
                    <h2>District Directories</h2>
                    ${parish.districtGroups
                      .map(
                        (group) => `
                          <div class="directory-section">
                            <div class="panel-heading">
                              <h3>${escapeHtml(group.title)}</h3>
                              <p>${escapeHtml(group.description)}</p>
                            </div>
                            <div class="directory-grid">
                              ${group.cards.map(renderDirectoryCard).join('')}
                            </div>
                          </div>
                        `,
                      )
                      .join('')}
                  </section>
                `
                : ''
            }

            ${
              parish.municipalities.length
                ? `
                  <section class="section" id="municipalities">
                    <h2>Municipal Governments In This Parish</h2>
                    <p>
                      These municipal government contacts are pulled from the Louisiana Municipal Association directory for the places currently included in this parish profile.
                    </p>
                    <div class="directory-grid">
                      ${parish.municipalities.map(renderDirectoryCard).join('')}
                    </div>
                  </section>
                `
                : ''
            }

            ${
              parish.communityOrganizations.length
                ? `
                  <section class="section" id="organizations">
                    <h2>Community Organizations</h2>
                    <div class="directory-grid">
                      ${parish.communityOrganizations.map(renderDirectoryCard).join('')}
                    </div>
                  </section>
                `
                : ''
            }

            <section class="section" id="links">
              <h2>Official Links</h2>
              <div class="resource-group-grid">
                ${parish.resourceGroups.map(renderResourceGroup).join('')}
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
}

function renderMissingParish() {
  document.title = 'LADF | Parish Not Found';

  document.querySelector('#app').innerHTML = `
    <div class="page">
      <main class="content">
        <div class="content__inner">
          <div class="page-intro">
            <div class="eyebrow">Parish directory</div>
            <h1>Parish not found</h1>
            <p class="lead">
              We could not match that parish. Start from the map and pick a parish again.
            </p>
            <div class="cta-row">
              <a class="button" href="/map.html">Open parish map</a>
              <a class="button button--secondary" href="/parish.html?parish=caddo">Open Caddo Parish</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  `;
}

function renderDirectoryCard(card) {
  return `
    <article class="directory-card">
      <div class="directory-card__header">
        <div class="result-type">${escapeHtml(card.label ?? 'Directory')}</div>
        <h4>${escapeHtml(card.name)}</h4>
      </div>
      ${card.role ? `<p class="directory-meta">${escapeHtml(card.role)}</p>` : ''}
      ${card.person ? `<p class="directory-meta">${escapeHtml(card.person)}</p>` : ''}
      ${
        card.address
          ? `
            <div class="contact-field-list">
              <div class="contact-field">
                <span class="contact-label">Address</span>
                <span class="contact-value">${formatMultiline(card.address)}</span>
              </div>
            </div>
          `
          : ''
      }
      ${
        card.phone || card.email
          ? `
            <div class="contact-field-list">
              ${
                card.phone
                  ? `
                    <div class="contact-field">
                      <span class="contact-label">Phone</span>
                      <span class="contact-value"><a href="tel:${escapeAttribute(sanitizePhone(card.phone))}">${escapeHtml(card.phone)}</a></span>
                    </div>
                  `
                  : ''
              }
              ${
                card.email
                  ? `
                    <div class="contact-field">
                      <span class="contact-label">Email</span>
                      <span class="contact-value"><a href="mailto:${escapeAttribute(card.email)}">${escapeHtml(card.email)}</a></span>
                    </div>
                  `
                  : ''
              }
            </div>
          `
          : ''
      }
      ${
        card.links?.length
          ? `
            <div class="contact-links">
              ${card.links
                .map(
                  (link) => `
                    <a href="${escapeAttribute(link.href)}" target="_blank" rel="noreferrer">
                      ${escapeHtml(link.label)}
                    </a>
                  `,
                )
                .join('')}
            </div>
          `
          : ''
      }
      ${card.note ? `<p class="contact-note">${escapeHtml(card.note)}</p>` : ''}
    </article>
  `;
}

function renderResourceGroup(group) {
  return `
    <article class="resource-group-card">
      <h4>${escapeHtml(group.title)}</h4>
      <div class="resource-link-grid">
        ${group.links
          .map(
            (link) => `
              <a class="resource-link" href="${escapeAttribute(link.href)}" target="_blank" rel="noreferrer">
                ${escapeHtml(link.label)}
              </a>
            `,
          )
          .join('')}
      </div>
    </article>
  `;
}

function formatMultiline(value) {
  return String(value)
    .split('\n')
    .map((line) => escapeHtml(line.trim()))
    .filter(Boolean)
    .join('<br>');
}

function sanitizePhone(value) {
  return String(value ?? '').replace(/\D/g, '');
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
