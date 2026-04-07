import './style.css';
import {
  findMunicipalityServiceRecord,
  findParishServiceRecord,
  formatDistrictLabel,
  geocodeLouisianaQuery,
  getMunicipalityMatch,
  getParishMatch,
  loadLookupContext,
  lookupLocation,
  renderAddressLines,
} from './locationLookup.js';

const DRINKING_WATER_VIEWER_URL = 'https://sdw.ldh.la.gov/';

const QUICK_SEARCHES = ['70301', 'Thibodaux, LA', 'Shreveport, LA', 'Alexandria, LA'];

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
            <li><a class="nav__link is-active" href="/services.html">Services by ZIP</a></li>
            <li><a class="nav__link" href="#lookup">Lookup</a></li>
            <li><a class="nav__link" href="#services">Service Routing</a></li>
            <li><a class="nav__link" href="#districts">District Stack</a></li>
            <li><a class="nav__link" href="#notes">Notes</a></li>
          </ul>
        </nav>
      </aside>

      <main class="content">
        <div class="content__inner content__inner--wide">
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="/index.html">Home</a>
            <span class="breadcrumb__sep">/</span>
            <span>Services by ZIP</span>
          </nav>

          <div class="page-intro">
            <div class="eyebrow">Local service routing</div>
            <h1>Enter a ZIP code, city, or address and see who handles what.</h1>
            <p class="lead">
              This page turns one Louisiana location into a practical routing sheet:
              who likely handles water, trash, streets, permits, police, fire,
              assessor, clerk, schools, and your district stack.
            </p>
            <div class="disclaimer-box disclaimer-box--compact">
              <p>
                ZIP-only and city-only searches are approximate because they use a
                geocoded point, not every address in the area. A full street address
                is the most exact way to route districts and local services.
              </p>
            </div>
          </div>

          <section class="section" id="lookup">
            <h2>Lookup</h2>
            <div class="lookup-shell">
              <form id="service-lookup-form" class="service-lookup-form">
                <label class="field-label" for="service-query">ZIP code, city, or address</label>
                <div class="service-lookup-row">
                  <input
                    id="service-query"
                    name="service-query"
                    type="search"
                    placeholder="70301, Thibodaux, LA, or a full street address"
                    autocomplete="street-address"
                  />
                  <button class="button" type="submit">Lookup</button>
                </div>
                <div class="quick-chip-row" id="quick-chip-row"></div>
                <div class="tool-row">
                    <button class="button button--secondary" id="use-current-location" type="button">Use my location</button>
                  <a class="button button--secondary" href="/map.html">Open parish map</a>
                </div>
                <p class="status-line" id="service-status">
                  Loading statewide service and district datasets...
                </p>
              </form>

              <aside class="hero-aside">
                <div class="summary-kicker">What this page returns</div>
                <h4>Operational, not abstract.</h4>
                <p>
                  The result is meant to answer questions like: who do I call about
                  water, trash, streets, permits, local records, or school governance
                  here?
                </p>
                <div class="tag-row">
                  <span class="tag-chip">ZIP, city, or address</span>
                  <span class="tag-chip">Municipality + parish routing</span>
                  <span class="tag-chip">District stack included</span>
                </div>
              </aside>
            </div>
          </section>

          <section class="section" id="results">
            <h2>Results</h2>
            <div id="service-summary" class="contact-summary">
              <div class="summary-kicker">Awaiting lookup</div>
              <h4>Run a search to build the routing sheet.</h4>
              <p>
                The result will show your matched municipality, parish, district
                layers, and the best local service contacts LADF can route from the
                current statewide datasets.
              </p>
            </div>
          </section>

          <section class="section" id="services">
            <h2>Service Routing</h2>
            <div id="service-card-grid" class="service-card-grid"></div>
          </section>

          <section class="section" id="districts">
            <h2>District Stack</h2>
            <div id="district-card-grid" class="card-grid card-grid--two"></div>
          </section>

          <section class="section" id="notes">
            <h2>Notes</h2>
            <div id="lookup-notes" class="card-grid card-grid--two"></div>
          </section>
        </div>
      </main>
    </div>

    <footer class="site-footer">
      <div class="site-footer__inner">
        <span class="flag-glyph">LA</span>
        <span>LADF is a private nonprofit civic education organization and is not affiliated with Louisiana state or local government.</span>
        <span><a href="/map.html">Parish Map</a> | <a href="/index.html#disclaimer">Disclaimer</a></span>
      </div>
    </footer>
  </div>
`;

const state = {
  context: null,
};

const form = document.querySelector('#service-lookup-form');
const queryInput = document.querySelector('#service-query');
const statusNode = document.querySelector('#service-status');
const summaryNode = document.querySelector('#service-summary');
const serviceGridNode = document.querySelector('#service-card-grid');
const districtGridNode = document.querySelector('#district-card-grid');
const notesNode = document.querySelector('#lookup-notes');
const useLocationButton = document.querySelector('#use-current-location');
const chipRow = document.querySelector('#quick-chip-row');

renderQuickChips();
await initializePage();

async function initializePage() {
  try {
    state.context = await loadLookupContext();
    setStatus(
      'Service routing is ready. Enter a ZIP code, city, or full address anywhere in Louisiana.',
    );
  } catch (error) {
    console.error(error);
    setStatus(
      'Service routing data could not be loaded. Refresh the page or rebuild the site data locally.',
    );
  }

  form.addEventListener('submit', handleSubmit);
  useLocationButton.addEventListener('click', handleUseLocation);
}

async function handleSubmit(event) {
  event.preventDefault();
  const query = queryInput.value.trim();

  if (!query) {
    setStatus('Enter a ZIP code, city, or Louisiana address first.');
    return;
  }

  await runLookup(query);
}

async function handleUseLocation() {
  if (!navigator.geolocation) {
    setStatus('Geolocation is not available in this browser.');
    return;
  }

  setStatus('Getting your current location...');

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      await renderLookupResult({
        query: 'Current location',
        address: 'Current location',
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        matchType: 'Location',
        score: null,
      });
    },
    (error) => {
      console.error(error);
      setStatus('Location access failed. Try a ZIP code, city, or full address instead.');
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
    },
  );
}

async function runLookup(query) {
  if (!state.context) {
    setStatus('Lookup data is still loading. Try again in a moment.');
    return;
  }

  setStatus(`Searching for ${query}...`);

  try {
    const result = await geocodeLouisianaQuery(query);
    await renderLookupResult({
      query,
      ...result,
    });
  } catch (error) {
    console.error(error);
    setStatus(
      'No clear Louisiana match came back for that search. Try a more specific city or a full street address.',
    );
  }
}

async function renderLookupResult(result) {
  const matches = lookupLocation(state.context, {
    lat: result.latitude,
    lng: result.longitude,
  });

  const municipalityMatch = getMunicipalityMatch(matches);
  const parishMatch = getParishMatch(matches);
  const municipalityRecord = municipalityMatch
    ? findMunicipalityServiceRecord(
        state.context,
        municipalityMatch.feature.properties.__districtLabel,
      )
    : null;
  const parishRecord = parishMatch
    ? findParishServiceRecord(
        state.context,
        parishMatch.feature.properties.__districtLabel,
      )
    : null;

  renderSummary({
    result,
    matches,
    municipalityMatch,
    parishMatch,
    municipalityRecord,
    parishRecord,
  });

  renderServiceCards({
    municipalityMatch,
    parishMatch,
    municipalityRecord,
    parishRecord,
  });

  renderDistrictCards(matches);
  renderNotes({
    result,
    matches,
    municipalityRecord,
    parishRecord,
  });

  setStatus(
    `Built a service routing sheet for ${result.address ?? result.query}.`,
  );
}

function renderSummary({
  result,
  matches,
  municipalityMatch,
  parishMatch,
  municipalityRecord,
  parishRecord,
}) {
  const municipalityName =
    municipalityMatch?.feature.properties.__districtLabel ?? 'Unincorporated area';
  const parishName =
    parishMatch?.feature.properties.__districtLabel ?? 'Parish match unavailable';
  const precisionNote = getPrecisionNote(result);

  summaryNode.innerHTML = `
    <div class="summary-kicker">Lookup summary</div>
    <h4>${escapeHtml(result.address ?? result.query)}</h4>
    <p>
      Matched to <strong>${escapeHtml(municipalityName)}</strong> in
      <strong>${escapeHtml(parishName)}</strong>.
    </p>
    <div class="summary-metrics">
      <article class="summary-metric">
        <span class="metric-label">Matched layers</span>
        <strong>${matches.length}</strong>
      </article>
      <article class="summary-metric">
        <span class="metric-label">Municipal contact</span>
        <strong>${municipalityRecord ? 'Found' : 'Fallback routing'}</strong>
      </article>
      <article class="summary-metric">
        <span class="metric-label">Parish service page</span>
        <strong>${parishRecord ? 'Found' : 'Fallback routing'}</strong>
      </article>
    </div>
    <p class="mini-meta">${escapeHtml(precisionNote)}</p>
  `;
}

function renderServiceCards({
  municipalityMatch,
  parishMatch,
  municipalityRecord,
  parishRecord,
}) {
  const localGovernmentLink =
    parishRecord?.linkMap.localGovernment ?? parishRecord?.pageUrl ?? null;
  const localEntityName =
    municipalityMatch?.feature.properties.__districtLabel ??
    parishMatch?.feature.properties.__districtLabel ??
    'this area';
  const mainMunicipalContact = municipalityRecord
    ? createMainOfficeContact(municipalityRecord)
    : null;

  const cards = [
    {
      type: 'Water / Sewer',
      title: 'Water, sewer, and utility billing',
      description:
        municipalityMatch
          ? `${municipalityMatch.feature.properties.__districtLabel} is the first local place to check for water, sewer, or utility billing questions.`
          : 'Outside an incorporated municipality, water and sewer can be handled by a parish office, utility district, or another local water system.',
      contacts: dedupeContacts([
        ...collectMunicipalContacts(municipalityRecord, ['water', 'utilities', 'publicWorks']),
        mainMunicipalContact,
      ]),
      links: compactLinks([
        municipalityRecord && {
          label: `${municipalityRecord.name} municipal profile`,
          href: municipalityRecord.sourceUrl,
        },
        parishRecord && {
          label: `${parishRecord.name} local contacts`,
          href: parishRecord.pageUrl,
        },
        {
          label: 'Louisiana drinking water viewer',
          href: DRINKING_WATER_VIEWER_URL,
        },
      ]),
      note:
        municipalityRecord
          ? 'If a dedicated water or utility role is listed, start there. Otherwise start with the municipal main office.'
          : 'For unincorporated areas, the parish contact page is the best statewide first stop in this build.',
    },
    {
      type: 'Trash / Streets',
      title: 'Garbage, recycling, streets, drainage, and public works',
      description:
        municipalityMatch
          ? `${municipalityMatch.feature.properties.__districtLabel} usually handles routine local service issues like trash pickup schedules, drainage, streets, and similar public-works concerns.`
          : `${localEntityName} likely routes these issues through parish government or a local service district.`,
      contacts: dedupeContacts([
        ...collectMunicipalContacts(municipalityRecord, ['publicWorks', 'administration', 'clerk']),
        mainMunicipalContact,
      ]),
      links: compactLinks([
        municipalityRecord && {
          label: `${municipalityRecord.name} municipal profile`,
          href: municipalityRecord.sourceUrl,
        },
        localGovernmentLink && {
          label: `${parishRecord?.name ?? 'Parish'} local government`,
          href: localGovernmentLink,
        },
      ]),
      note:
        municipalityMatch
          ? 'If no public-works role is listed, the city or town hall number is still the right first routing point.'
          : 'Rural trash, roads, and drainage can vary by district or contractor, so the parish government link is the best starting route.',
    },
    {
      type: 'Permits / Code',
      title: 'Permits, zoning, code, inspections, and local admin',
      description:
        municipalityMatch
          ? 'Building permits, code questions, and municipal paperwork usually start with city hall, the clerk, code office, or local inspections staff.'
          : 'Outside an incorporated city or town, permitting can shift to parish offices or special districts depending on the issue.',
      contacts: dedupeContacts([
        ...collectMunicipalContacts(municipalityRecord, ['permits', 'clerk', 'administration']),
        mainMunicipalContact,
      ]),
      links: compactLinks([
        municipalityRecord && {
          label: `${municipalityRecord.name} municipal profile`,
          href: municipalityRecord.sourceUrl,
        },
        localGovernmentLink && {
          label: `${parishRecord?.name ?? 'Parish'} local government`,
          href: localGovernmentLink,
        },
      ]),
      note:
        'This page routes the first likely office. Specific permit workflows can still depend on annexation, zoning, and local charter rules.',
    },
    {
      type: 'Power / Gas',
      title: 'Electricity and natural gas',
      description:
        'Utility providers vary by address. When a city maintains its own utility or electrical contact, that is shown here. Otherwise use the local office first and the state utility commission for provider-level questions or complaints.',
      contacts: dedupeContacts([
        ...collectMunicipalContacts(municipalityRecord, ['electric', 'gas', 'utilities']),
        mainMunicipalContact,
      ]),
      links: compactLinks([
        {
          label: 'Louisiana PSC consumer hub',
          href: state.context.serviceDirectory.statewideLinks.utilityConsumerHub,
        },
        {
          label: 'Louisiana PSC utility complaints',
          href: state.context.serviceDirectory.statewideLinks.utilityComplaints,
        },
        {
          label: 'Louisiana PSC utility division',
          href: state.context.serviceDirectory.statewideLinks.utilityDivision,
        },
      ]),
      note:
        'This build does not yet resolve every electric or gas provider polygon statewide, so provider-specific routing can still vary block by block.',
    },
    {
      type: 'Public Safety',
      title: 'Police, fire, sheriff, and emergency preparedness',
      description:
        municipalityMatch
          ? 'Municipal police and fire contacts are shown when the municipality roster lists them. Sheriff and parish emergency resources stay linked here too.'
          : 'For unincorporated areas, parish sheriff and parish emergency resources are often the right first stop.',
      contacts: dedupeContacts([
        ...collectMunicipalContacts(municipalityRecord, ['police', 'fire', 'administration']),
        mainMunicipalContact,
      ]),
      links: compactLinks([
        {
          label: "Sheriff's directory",
          href: parishRecord?.linkMap.sheriff ?? state.context.serviceDirectory.statewideLinks.sheriffDirectory,
        },
        {
          label: 'Parish emergency contacts',
          href:
            parishRecord?.linkMap.emergency ??
            state.context.serviceDirectory.statewideLinks.emergencyPreparedness,
        },
        {
          label: 'Fire district contacts',
          href:
            parishRecord?.linkMap.fireDistricts ??
            state.context.serviceDirectory.statewideLinks.fireDistricts,
        },
      ]),
      note:
        'Emergency needs still belong on 911. This section is for routine contact routing, directories, and office lookup.',
    },
    {
      type: 'Parish Offices',
      title: 'Assessor, clerk, registrar, schools, and OMV',
      description:
        parishRecord
          ? `${parishRecord.name} has a dedicated state page with official links into the parish-level offices people often need most.`
          : 'Parish-level office routing is provided through statewide official directories when a parish page is not available.',
      contacts: dedupeContacts([
        parishRecord && {
          name: parishRecord.name,
          title: parishRecord.seat
            ? `Parish reference page, seat: ${parishRecord.seat}`
            : 'Parish reference page',
          phone: null,
          address: null,
          sourceUrl: parishRecord.pageUrl,
        },
      ]),
      links: compactLinks([
        {
          label: 'Assessor',
          href: parishRecord?.linkMap.assessor,
        },
        {
          label: 'Clerk of court',
          href: parishRecord?.linkMap.clerk,
        },
        {
          label: 'Registrar of voters',
          href:
            parishRecord?.linkMap.registrar ??
            state.context.serviceDirectory.statewideLinks.registrar,
        },
        {
          label: 'School district info',
          href:
            parishRecord?.linkMap.schools ??
            state.context.serviceDirectory.statewideLinks.schoolDistricts,
        },
        {
          label: 'Office of Motor Vehicles',
          href: parishRecord?.linkMap.omv ?? state.context.serviceDirectory.statewideLinks.omv,
        },
      ]),
      note:
        'These are common statewide office types that often sit outside city hall even when the address is inside a municipality.',
    },
  ];

  serviceGridNode.innerHTML = cards.map((card) => renderServiceCard(card)).join('');
}

function renderDistrictCards(matches) {
  if (!matches.length) {
    districtGridNode.innerHTML = `
      <article class="info-card">
        <div class="result-type">No match</div>
        <h4>No district layers matched this point.</h4>
        <p>Try a fuller street address or use the parish map page for a visual check.</p>
      </article>
    `;
    return;
  }

  districtGridNode.innerHTML = matches
    .map((match) => {
      const rep = match.feature.properties.__representative;
      const phone = match.feature.properties.__contactPhone;
      const email = match.feature.properties.__contactEmail;
      const website = match.feature.properties.__officialWebsite;

      return `
        <article class="info-card">
          <div class="result-type">${escapeHtml(match.label)}</div>
          <h4>${escapeHtml(formatDistrictLabel(match))}</h4>
          <p>${escapeHtml(getDistrictDescription(match.id))}</p>
          <div class="contact-field-list">
            ${
              rep
                ? `
                  <div class="contact-field">
                    <span class="contact-label">Representative</span>
                    <span class="contact-value">${escapeHtml(rep)}</span>
                  </div>
                `
                : ''
            }
            ${
              phone
                ? `
                  <div class="contact-field">
                    <span class="contact-label">Phone</span>
                    <span class="contact-value">${renderLinkValue(`tel:${sanitizePhone(phone)}`, phone)}</span>
                  </div>
                `
                : ''
            }
            ${
              email
                ? `
                  <div class="contact-field">
                    <span class="contact-label">Email</span>
                    <span class="contact-value">${renderLinkValue(`mailto:${email}`, email)}</span>
                  </div>
                `
                : ''
            }
          </div>
          ${
            website
              ? `<div class="contact-links"><a href="${escapeAttribute(website)}" target="_blank" rel="noreferrer">Official page</a></div>`
              : ''
          }
        </article>
      `;
    })
    .join('');
}

function renderNotes({ result, matches, municipalityRecord, parishRecord }) {
  const notes = [
    {
      type: 'Precision',
      title: 'How exact this lookup is',
      body: getPrecisionNote(result),
    },
    {
      type: 'Service scope',
      title: 'Why some services still vary by address',
      body:
        'Electricity, natural gas, rural water districts, and contracted trash service can change by neighborhood, annexation line, or utility territory. This page gives the strongest statewide first-contact route available in the current dataset.',
    },
    {
      type: 'Municipal source',
      title: municipalityRecord
        ? `${municipalityRecord.name} municipal profile`
        : 'Municipal fallback',
      body: municipalityRecord
        ? `This result is backed by the Louisiana Municipal Association directory plus the municipality roster fields available for ${municipalityRecord.name}.`
        : 'No municipality-specific roster was matched for this point, so the routing sheet falls back to parish and statewide official links.',
    },
    {
      type: 'Parish source',
      title: parishRecord ? `${parishRecord.name} service links` : 'Parish fallback',
      body: parishRecord
        ? `This parish result uses the official Louisiana local-government reference page for ${parishRecord.name}.`
        : 'No parish-specific page was matched, so the routing sheet uses statewide official directory links where possible.',
    },
    {
      type: 'Next step',
      title: 'Need more exact district detail?',
      body:
        matches.length
          ? 'Use the parish map if you want to jump straight to the parish contact page or visually confirm the parish boundary.'
          : 'If this lookup came back empty, open the parish map and inspect the location visually from there.',
    },
  ];

  notesNode.innerHTML = notes.map((note) => renderNoteCard(note)).join('');
}

function renderQuickChips() {
  chipRow.innerHTML = QUICK_SEARCHES.map(
    (value) =>
      `<button class="quick-chip" type="button" data-quick-query="${escapeAttribute(value)}">${escapeHtml(value)}</button>`,
  ).join('');

  chipRow.querySelectorAll('[data-quick-query]').forEach((button) => {
    button.addEventListener('click', async () => {
      const query = button.getAttribute('data-quick-query');
      queryInput.value = query;
      await runLookup(query);
    });
  });
}

function collectMunicipalContacts(record, keys) {
  if (!record) {
    return [];
  }

  return keys.flatMap((key) =>
    (record.serviceContacts[key] ?? []).map((entry) => ({
      name: entry.name,
      title: entry.title,
      phone: record.phone,
      address: record.address,
      sourceUrl: record.sourceUrl,
    })),
  );
}

function createMainOfficeContact(record) {
  if (!record) {
    return null;
  }

  return {
    name: record.name,
    title: `${record.type} hall`,
    phone: record.phone,
    address: record.address,
    sourceUrl: record.sourceUrl,
  };
}

function dedupeContacts(contacts) {
  const seen = new Set();
  return contacts
    .filter(Boolean)
    .filter((contact) => {
      const key = `${contact.name}|${contact.title}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .slice(0, 4);
}

function compactLinks(links) {
  return links.filter((link) => link?.label && link?.href);
}

function renderServiceCard(card) {
  return `
    <article class="service-card">
      <div class="result-type">${escapeHtml(card.type)}</div>
      <h4>${escapeHtml(card.title)}</h4>
      <p>${escapeHtml(card.description)}</p>
      ${
        card.contacts.length
          ? `
            <div class="service-contact-list">
              ${card.contacts
                .map(
                  (contact) => `
                    <article class="service-contact">
                      <div class="service-contact__title">${escapeHtml(contact.name)}</div>
                      <div class="service-contact__role">${escapeHtml(contact.title)}</div>
                      ${
                        contact.phone
                          ? `<div class="service-contact__meta">${renderLinkValue(`tel:${sanitizePhone(contact.phone)}`, contact.phone)}</div>`
                          : ''
                      }
                      ${
                        contact.address
                          ? `<div class="service-contact__meta">${renderAddressLines(contact.address)
                              .map((line) => escapeHtml(line))
                              .join('<br>')}</div>`
                          : ''
                      }
                    </article>
                  `,
                )
                .join('')}
            </div>
          `
          : `
            <div class="contact-empty">
              No dedicated local role was identified in the current statewide contact dataset for this category.
            </div>
          `
      }
      ${
        card.links.length
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
      <p class="contact-note">${escapeHtml(card.note)}</p>
    </article>
  `;
}

function renderNoteCard(note) {
  return `
    <article class="info-card">
      <div class="result-type">${escapeHtml(note.type)}</div>
      <h4>${escapeHtml(note.title)}</h4>
      <p>${escapeHtml(note.body)}</p>
    </article>
  `;
}

function getPrecisionNote(result) {
  if (result.query === 'Current location') {
    return 'This lookup used your device location.';
  }

  if (/^\d{5}(?:-\d{4})?$/.test(result.query.trim())) {
    return 'ZIP-only lookups use a geocoded point inside the ZIP area. Enter a street address for exact district boundaries.';
  }

  if (result.matchType && result.matchType !== 'PointAddress') {
    return `This search matched as ${result.matchType}, which can be approximate compared with a full street address.`;
  }

  return 'This result is based on the matched search point returned by the geocoder.';
}

function getDistrictDescription(layerId) {
  switch (layerId) {
    case 'louisiana-places':
      return 'Your incorporated municipality, if the searched point falls inside a city, town, or village boundary.';
    case 'louisiana-parishes':
      return 'The parish government area for this point.';
    case 'caddo-commission':
      return 'Parish commission district for the Caddo local demo stack.';
    case 'shreveport-council':
      return 'City council district for the Shreveport local demo stack.';
    case 'caddo-school-board':
      return 'School-board district for the Caddo local demo stack.';
    case 'louisiana-house':
      return 'Louisiana House district for state representation.';
    case 'louisiana-senate':
      return 'Louisiana Senate district for state representation.';
    case 'louisiana-congress':
      return 'U.S. House district for federal representation.';
    default:
      return 'Matched district layer.';
  }
}

function sanitizePhone(value) {
  return String(value ?? '').replace(/\D/g, '');
}

function renderLinkValue(href, label) {
  return `<a href="${escapeAttribute(href)}">${escapeHtml(label)}</a>`;
}

function setStatus(message) {
  statusNode.textContent = message;
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
