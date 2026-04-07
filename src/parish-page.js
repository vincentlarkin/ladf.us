import './style.css';
import { loadParishProfile } from './parishData.js';
import {
  bindSiteChrome,
  renderBreadcrumb,
  renderSidebar,
  renderSiteFooter,
  renderSiteHeader,
} from './siteChrome.js';

const requestedParish =
  new URLSearchParams(window.location.search).get('parish') ?? 'caddo';

let profile = null;
let hasBoundHashHandler = false;

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

  const districtCardCount = parish.districtGroups.reduce(
    (count, group) => count + group.cards.length,
    0,
  );
  const officialLinkCount = parish.resourceGroups.reduce(
    (count, group) => count + group.links.length,
    0,
  );

  document.querySelector('#app').innerHTML = `
    <div class="page">
      ${renderSiteHeader({ activePage: 'map' })}

      <div class="site-body">
        ${renderSidebar({
          sections: [
            { href: '#overview', label: 'Overview' },
            { href: '#contacts', label: 'Key Contacts' },
            ...(parish.districtGroups.length
              ? [{ href: '#districts', label: 'District Directories' }]
              : []),
            ...(parish.municipalities.length
              ? [{ href: '#municipalities', label: 'Municipal Governments' }]
              : []),
            ...(parish.communityOrganizations.length
              ? [{ href: '#organizations', label: 'Organizations' }]
              : []),
            { href: '#links', label: 'Official Links' },
          ],
        })}

        <main class="content">
          <div class="content__inner content__inner--wide">
            ${renderBreadcrumb([
              { label: 'Home', href: '/index.html' },
              { label: 'Parish Map', href: '/map.html' },
              { label: parish.label },
            ])}

            <section class="page-intro page-intro--compact" id="overview">
              <div class="page-intro__heading">
                ${
                  parish.brand
                    ? renderBrandLogo(parish.brand, parish.label, {
                        className: 'page-intro__brand',
                        loading: 'eager',
                      })
                    : ''
                }
                <div class="page-intro__title-block">
                  <div class="eyebrow">Parish directory</div>
                  <h1>${escapeHtml(parish.label)}</h1>
                  <p class="lead">${escapeHtml(parish.intro)}</p>
                </div>
              </div>

              <div class="summary-metrics parish-summary-grid">
                <article class="summary-metric">
                  <span class="metric-label">Parish seat</span>
                  <strong>${escapeHtml(sanitizeText(parish.seat, 'Unavailable'))}</strong>
                </article>
                <article class="summary-metric">
                  <span class="metric-label">Official office cards</span>
                  <strong>${parish.featuredContacts.length}</strong>
                </article>
                <article class="summary-metric">
                  <span class="metric-label">Municipal governments</span>
                  <strong>${parish.municipalities.length}</strong>
                </article>
              </div>

              <div class="cta-row">
                <a class="button" href="/map.html">Back to parish map</a>
                <a class="button button--secondary" href="/services.html">Services by ZIP</a>
              </div>

              <div class="section-chip-row">
                ${renderSectionChip(
                  'contacts',
                  'Key Contacts',
                  formatCountLabel(parish.featuredContacts.length, 'contact'),
                )}
                ${
                  parish.districtGroups.length
                    ? renderSectionChip(
                        'districts',
                        'District Directories',
                        formatCountLabel(districtCardCount, 'district'),
                      )
                    : ''
                }
                ${
                  parish.municipalities.length
                    ? renderSectionChip(
                        'municipalities',
                        'Municipal Governments',
                        formatCountLabel(parish.municipalities.length, 'municipality', 'municipalities'),
                      )
                    : ''
                }
                ${
                  parish.communityOrganizations.length
                    ? renderSectionChip(
                        'organizations',
                        'Organizations',
                        formatCountLabel(parish.communityOrganizations.length, 'organization'),
                      )
                    : ''
                }
                ${renderSectionChip(
                  'links',
                  'Official Links',
                  formatCountLabel(officialLinkCount, 'link'),
                )}
              </div>
            </section>

            ${renderSectionAccordion({
              id: 'contacts',
              title: 'Key Contacts',
              description:
                'Primary offices and official starting points for people trying to reach parish government quickly.',
              countLabel: formatCountLabel(parish.featuredContacts.length, 'contact'),
              open: true,
              content: parish.featuredContacts.length
                ? `<div class="directory-grid directory-grid--cards">
                    ${parish.featuredContacts.map(renderDirectoryCard).join('')}
                  </div>`
                : `<article class="info-card">
                    <div class="result-type">No local directory yet</div>
                    <h4>This parish is still on the lightweight profile.</h4>
                    <p>Use the official links below for the current parish contact path.</p>
                  </article>`,
            })}

            ${
              parish.districtGroups.length
                ? renderSectionAccordion({
                    id: 'districts',
                    title: 'District Directories',
                    description:
                      'Commission and school-board districts are grouped into their own dropdowns so the page stays short until you need them.',
                    countLabel: formatCountLabel(districtCardCount, 'district'),
                    content: `<div class="accordion-stack">
                      ${parish.districtGroups.map(renderDirectoryGroupAccordion).join('')}
                    </div>`,
                  })
                : ''
            }

            ${
              parish.municipalities.length
                ? renderSectionAccordion({
                    id: 'municipalities',
                    title: 'Municipal Governments In This Parish',
                    description:
                      'These municipal government contacts are pulled from the Louisiana Municipal Association directory for the places currently included in this parish profile.',
                    countLabel: formatCountLabel(
                      parish.municipalities.length,
                      'municipality',
                      'municipalities',
                    ),
                    content: `<div class="directory-grid directory-grid--cards">
                      ${parish.municipalities.map(renderDirectoryCard).join('')}
                    </div>`,
                  })
                : ''
            }

            ${
              parish.communityOrganizations.length
                ? renderSectionAccordion({
                    id: 'organizations',
                    title: 'Community Organizations',
                    description:
                      'Local organizations stay visible in their own dropdown and now carry logos when we have a reliable mark for them.',
                    countLabel: formatCountLabel(
                      parish.communityOrganizations.length,
                      'organization',
                    ),
                    open: true,
                    content: `<div class="directory-grid directory-grid--cards">
                      ${parish.communityOrganizations.map(renderDirectoryCard).join('')}
                    </div>`,
                  })
                : ''
            }

            ${renderSectionAccordion({
              id: 'links',
              title: 'Official Links',
              description:
                'Official parish, state, and emergency resources are grouped into smaller dropdowns instead of one long link wall.',
              countLabel: formatCountLabel(officialLinkCount, 'link'),
              content: `<div class="accordion-stack">
                ${parish.resourceGroups.map(renderResourceGroupAccordion).join('')}
              </div>`,
            })}
          </div>
        </main>
      </div>

      ${renderSiteFooter()}
    </div>
  `;

  bindSiteChrome();
  bindSectionLinks();

  if (!hasBoundHashHandler) {
    window.addEventListener('hashchange', openHashTarget);
    hasBoundHashHandler = true;
  }

  openHashTarget();
}

function renderMissingParish() {
  document.title = 'LADF | Parish Not Found';

  document.querySelector('#app').innerHTML = `
    <div class="page">
      ${renderSiteHeader({ activePage: 'map' })}

      <div class="site-body">
        ${renderSidebar()}

        <main class="content">
          <div class="content__inner">
            ${renderBreadcrumb([
              { label: 'Home', href: '/index.html' },
              { label: 'Parish Map', href: '/map.html' },
              { label: 'Parish Not Found' },
            ])}

            <div class="page-intro">
              <div class="eyebrow">Parish directory</div>
              <h1>Parish not found</h1>
              <p class="lead">
                We could not match that parish. Start from the map and pick a parish again.
              </p>
              <div class="cta-row">
                <a class="button" href="/map.html">Open parish map</a>
                <a class="button button--secondary" href="/services.html">Services by ZIP</a>
              </div>
            </div>
          </div>
        </main>
      </div>

      ${renderSiteFooter()}
    </div>
  `;

  bindSiteChrome();
}

function renderSectionAccordion({
  id,
  title,
  description,
  countLabel,
  content,
  open = false,
}) {
  return `
    <details class="section section-accordion" id="${escapeAttribute(id)}" ${
      open ? 'open' : ''
    }>
      <summary class="section-accordion__summary">
        <span class="section-accordion__summary-main">
          <span class="section-accordion__heading">${escapeHtml(title)}</span>
          ${
            description
              ? `<span class="section-accordion__description">${escapeHtml(description)}</span>`
              : ''
          }
        </span>
        <span class="section-accordion__summary-side">
          ${
            countLabel
              ? `<span class="section-badge">${escapeHtml(countLabel)}</span>`
              : ''
          }
          <span class="section-accordion__chevron" aria-hidden="true"></span>
        </span>
      </summary>
      <div class="section-accordion__content">
        ${content}
      </div>
    </details>
  `;
}

function renderDirectoryGroupAccordion(group) {
  return `
    <details class="subsection-accordion">
      <summary class="subsection-accordion__summary">
        <span class="subsection-accordion__summary-main">
          ${
            group.brand
              ? renderBrandLogo(group.brand, group.title, {
                  className: 'subsection-accordion__brand',
                })
              : ''
          }
          <span class="subsection-accordion__title-block">
            <span class="result-type">District group</span>
            <span class="subsection-accordion__heading">${escapeHtml(group.title)}</span>
            ${
              group.description
                ? `<span class="subsection-accordion__description">${escapeHtml(group.description)}</span>`
                : ''
            }
          </span>
        </span>
        <span class="section-accordion__summary-side">
          <span class="section-badge">${escapeHtml(
            formatCountLabel(group.cards.length, 'district'),
          )}</span>
          <span class="section-accordion__chevron" aria-hidden="true"></span>
        </span>
      </summary>
      <div class="subsection-accordion__content">
        <div class="directory-grid directory-grid--cards">
          ${group.cards.map(renderDirectoryCard).join('')}
        </div>
      </div>
    </details>
  `;
}

function renderDirectoryCard(card) {
  const name = sanitizeText(card.name, card.label ?? 'Directory');
  const label = sanitizeText(card.label, 'Directory');
  const role = sanitizeText(card.role);
  const person = sanitizeText(card.person);
  const note = sanitizeText(card.note);

  return `
    <article class="directory-card">
      <div class="directory-card__header">
        ${
          card.brand
            ? renderBrandLogo(card.brand, name, {
                className: 'directory-card__brand',
              })
            : ''
        }
        <div class="directory-card__heading">
          <div class="result-type">${escapeHtml(label)}</div>
          <h4>${escapeHtml(name)}</h4>
        </div>
      </div>

      ${role ? `<p class="directory-meta">${escapeHtml(role)}</p>` : ''}
      ${person ? `<p class="directory-meta">${escapeHtml(person)}</p>` : ''}

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
                      <span class="contact-value"><a href="tel:${escapeAttribute(
                        sanitizePhone(card.phone),
                      )}">${escapeHtml(card.phone)}</a></span>
                    </div>
                  `
                  : ''
              }
              ${
                card.email
                  ? `
                    <div class="contact-field">
                      <span class="contact-label">Email</span>
                      <span class="contact-value"><a href="mailto:${escapeAttribute(
                        card.email,
                      )}">${escapeHtml(card.email)}</a></span>
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
              ${card.links.map(renderTextLink).join('')}
            </div>
          `
          : ''
      }

      ${note ? `<p class="contact-note">${escapeHtml(note)}</p>` : ''}
    </article>
  `;
}

function renderResourceGroupAccordion(group) {
  return `
    <details class="subsection-accordion">
      <summary class="subsection-accordion__summary">
        <span class="subsection-accordion__summary-main">
          <span class="subsection-accordion__title-block">
            <span class="result-type">Official links</span>
            <span class="subsection-accordion__heading">${escapeHtml(group.title)}</span>
          </span>
        </span>
        <span class="section-accordion__summary-side">
          <span class="section-badge">${escapeHtml(
            formatCountLabel(group.links.length, 'link'),
          )}</span>
          <span class="section-accordion__chevron" aria-hidden="true"></span>
        </span>
      </summary>
      <div class="subsection-accordion__content">
        <div class="resource-link-grid">
          ${group.links.map(renderResourceLink).join('')}
        </div>
      </div>
    </details>
  `;
}

function renderResourceLink(link) {
  return `
    <a class="resource-link" href="${escapeAttribute(link.href)}" target="_blank" rel="noreferrer">
      ${escapeHtml(link.label)}
    </a>
  `;
}

function renderTextLink(link) {
  return `
    <a href="${escapeAttribute(link.href)}" target="_blank" rel="noreferrer">
      ${escapeHtml(link.label)}
    </a>
  `;
}

function renderSectionChip(id, label, countLabel) {
  return `
    <a class="section-chip" href="#${escapeAttribute(id)}">
      <span class="section-chip__label">${escapeHtml(label)}</span>
      <span class="section-chip__count">${escapeHtml(countLabel)}</span>
    </a>
  `;
}

function renderBrandLogo(brand, fallbackLabel, { className = '', loading = 'lazy' } = {}) {
  if (!brand?.src) {
    return '';
  }

  const variant = sanitizeText(brand.variant, 'seal');
  const frame = sanitizeText(brand.frame, 'white');
  const classes = ['logo-badge', className, `logo-badge--${variant}`, `logo-badge--${frame}`]
    .filter(Boolean)
    .join(' ');

  return `
    <span class="${classes}">
      <img
        src="${escapeAttribute(brand.src)}"
        alt="${escapeAttribute(sanitizeText(brand.alt, `${fallbackLabel} logo`))}"
        loading="${escapeAttribute(loading)}"
      />
    </span>
  `;
}

function bindSectionLinks() {
  document
    .querySelectorAll('.nav__link[href^="#"], .section-chip[href^="#"]')
    .forEach((link) => {
      link.addEventListener('click', () => {
        const hash = link.getAttribute('href');
        if (!hash) {
          return;
        }

        const target = document.querySelector(hash);
        if (target) {
          openAccordionAncestors(target);
        }
      });
    });
}

function openHashTarget() {
  const hash = window.location.hash;
  if (!hash) {
    return;
  }

  const target = document.querySelector(hash);
  if (target) {
    openAccordionAncestors(target);
  }
}

function openAccordionAncestors(target) {
  let current = target;

  while (current) {
    if (current.tagName === 'DETAILS') {
      current.open = true;
    }

    current = current.parentElement;
  }
}

function formatCountLabel(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function formatMultiline(value) {
  return sanitizeText(value)
    .split('\n')
    .map((line) => escapeHtml(line.trim()))
    .filter(Boolean)
    .join('<br>');
}

function sanitizePhone(value) {
  return String(value ?? '').replace(/\D/g, '');
}

function sanitizeText(value, fallback = '') {
  const text = String(value ?? '').trim();
  if (!text || text === 'undefined' || text === 'null') {
    return fallback;
  }

  return text;
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
