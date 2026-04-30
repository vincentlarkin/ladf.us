import './style.css';
import {
  bindSiteChrome,
  renderBreadcrumb,
  renderSidebar,
  renderSiteFooter,
  renderSiteHeader,
} from './siteChrome.js';
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

const QUICK_SEARCHES = [
  '505 Travis Street, Shreveport, LA',
  '900 North Third Street, Baton Rouge, LA',
  'New Orleans, LA',
  'Minden, LA',
];

const initialLookup = new URLSearchParams(window.location.search).get('lookup')?.trim() ?? '';

const OFFICIAL_SOURCES = {
  legislature: 'https://www.legis.la.gov/legis/FindMyLegislators.aspx',
  house: 'https://www.house.gov/representatives/find-your-representative',
  senate: 'https://www.senate.gov/senators/senators-contact.htm',
  stateOfficials: 'https://www.louisiana.gov/government/executive-branch-elected-officials/',
  governor: 'https://www.gov.louisiana.gov/page/meet-the-governor',
  lpsc: 'https://www.lpsc.louisiana.gov/Commissioners',
};

const LOUISIANA_STATE_BRAND = {
  src: '/org-logos/louisiana-state-seal.png',
  alt: 'Louisiana state seal',
  variant: 'seal',
  frame: 'soft',
};

const MUNICIPALITY_BRAND_OVERRIDES = {
  shreveport: {
    src: '/org-logos/shreveport-city-logo.png',
    alt: 'City of Shreveport logo',
    variant: 'wide',
    frame: 'dark',
  },
};

const FEDERAL_STATEWIDE_OFFICIALS = [
  {
    section: 'federal',
    type: 'Federal',
    office: 'U.S. Senator',
    name: 'Bill Cassidy',
    party: 'Republican',
    precision: 'Statewide',
    website: 'https://www.cassidy.senate.gov/',
    sourceLabel: 'U.S. Senator Bill Cassidy',
    sourceUrl: 'https://www.cassidy.senate.gov/',
    description: 'Louisiana statewide U.S. Senate seat.',
    brand: LOUISIANA_STATE_BRAND,
    photoKey: 'statewide:bill-cassidy',
  },
  {
    section: 'federal',
    type: 'Federal',
    office: 'U.S. Senator',
    name: 'John Kennedy',
    party: 'Republican',
    precision: 'Statewide',
    website: 'https://www.kennedy.senate.gov/public/',
    sourceLabel: 'U.S. Senator John Kennedy',
    sourceUrl: 'https://www.kennedy.senate.gov/public/',
    description: 'Louisiana statewide U.S. Senate seat.',
    brand: LOUISIANA_STATE_BRAND,
    photoKey: 'statewide:john-kennedy',
  },
];

const STATEWIDE_OFFICIALS = [
  {
    key: 'governor',
    office: 'Governor',
    name: 'Jeff Landry',
    website: OFFICIAL_SOURCES.governor,
    sourceLabel: 'Office of Governor Jeff Landry',
    sourceUrl: OFFICIAL_SOURCES.governor,
  },
  {
    key: 'lieutenant-governor',
    office: 'Lieutenant Governor',
    name: 'Billy Nungesser',
    website: 'https://www.crt.state.la.us/lt-governor/',
    sourceLabel: 'Louisiana Office of Lt. Governor',
    sourceUrl: 'https://www.crt.state.la.us/lt-governor/biography/',
  },
  {
    key: 'secretary-of-state',
    office: 'Secretary of State',
    name: 'Nancy Landry',
    website: 'https://www.sos.la.gov/',
    sourceLabel: 'Louisiana Secretary of State',
    sourceUrl: 'https://www.sos.la.gov/',
  },
  {
    key: 'attorney-general',
    office: 'Attorney General',
    name: 'Liz Murrill',
    website: 'https://ag.louisiana.gov/',
    sourceLabel: 'Louisiana Department of Justice',
    sourceUrl: 'https://ag.louisiana.gov/',
  },
  {
    key: 'treasurer',
    office: 'Treasurer',
    name: 'John Fleming',
    website: 'https://www.treasury.la.gov/',
    sourceLabel: 'Louisiana Department of Treasury',
    sourceUrl: 'https://www.treasury.la.gov/about',
  },
  {
    key: 'insurance-commissioner',
    office: 'Commissioner of Insurance',
    name: 'Tim Temple',
    website: 'https://www.ldi.la.gov/',
    sourceLabel: 'Louisiana Department of Insurance',
    sourceUrl: 'https://www.ldi.la.gov/about-timtemple',
  },
  {
    key: 'agriculture-commissioner',
    office: 'Commissioner of Agriculture and Forestry',
    name: 'Mike Strain',
    website: 'https://www.ldaf.la.gov/',
    sourceLabel: 'Louisiana Department of Agriculture and Forestry',
    sourceUrl: 'https://www.ldaf.la.gov/about/commissioner',
  },
].map((official) => ({
  ...official,
  section: 'statewide',
  type: 'Statewide',
  party: 'Republican',
  precision: 'Statewide',
  description: 'Elected statewide executive office for every Louisiana address.',
  brand: LOUISIANA_STATE_BRAND,
  photoKey: `statewide:${official.key}`,
}));

document.querySelector('#app').innerHTML = `
  <div class="page">
    ${renderSiteHeader({ activePage: 'represent' })}

    <div class="site-body">
      ${renderSidebar({
        sections: [
          { href: '#overview', label: 'Overview' },
          { href: '#lookup', label: 'Search' },
          { href: '#results', label: 'Representatives' },
          { href: '#sources', label: 'Sources' },
        ],
      })}

      <main class="content">
        <div class="content__inner content__inner--wide">
          ${renderBreadcrumb([
            { label: 'Home', href: '/index.html' },
            { label: 'Who Represents Me' },
          ])}

          <section class="page-intro" id="overview">
            <div class="represent-hero">
              <div class="page-intro__title-block">
                <div class="eyebrow">Representation Lookup</div>
                <h1>Find the people and districts tied to a Louisiana address.</h1>
                <p class="lead">
                  Enter an address to see federal, state legislative, statewide, parish,
                  and city representation together with official source links.
                </p>
                <div class="cta-row">
                  <a class="button" href="#lookup">Start lookup</a>
                  <a class="button button--secondary" href="/services.html">Local services</a>
                </div>
              </div>
              <div class="represent-hero__panel">
                <article>
                  <span>Exact districts</span>
                  <strong>Congress + Legislature</strong>
                </article>
                <article>
                  <span>Local context</span>
                  <strong>Parish + City</strong>
                </article>
                <article>
                  <span>Cross-checks</span>
                  <strong>Official sources</strong>
                </article>
              </div>
            </div>
            <div class="disclaimer-box disclaimer-box--compact">
              <p>
                Full street addresses are best. City-only or ZIP-only searches can land
                near the center of a place and may miss district boundaries.
              </p>
            </div>
          </section>

          <section class="section" id="lookup">
            <h2>Search</h2>
            <div class="lookup-shell lookup-shell--single">
              <form id="represent-lookup-form" class="service-lookup-form represent-lookup-form">
                <label class="field-label" for="represent-query">Louisiana address, city, or ZIP</label>
                <div class="service-lookup-row">
                  <input
                    id="represent-query"
                    name="represent-query"
                    type="search"
                    placeholder="Street address, city, or ZIP"
                    autocomplete="street-address"
                  />
                  <button class="button" type="submit">Lookup</button>
                </div>
                <div class="quick-chip-row" id="quick-chip-row"></div>
                <div class="tool-row">
                  <button class="button button--secondary" id="use-current-location" type="button">Use my location</button>
                  <a class="button button--secondary" href="${OFFICIAL_SOURCES.legislature}" target="_blank" rel="noreferrer">Official LA lookup</a>
                </div>
                <p class="status-line" id="represent-status">
                  Getting the page ready...
                </p>
              </form>
            </div>
          </section>

          <section class="section" id="results">
            <h2>Representatives</h2>
            <div id="represent-summary" class="represent-summary">
              <div class="lookup-result lookup-result--empty">
                <div class="summary-kicker">Start Here</div>
                <h4>Search an address to build a representation profile.</h4>
                <p>
                  The result separates exact address-based districts from statewide and
                  directory-level matches.
                </p>
              </div>
            </div>
            <div id="represent-results" class="represent-results"></div>
          </section>

          <section class="section" id="sources">
            <h2>Official Cross-Checks</h2>
            <div id="represent-sources" class="represent-source-grid">
              ${renderSourceLinks(getBaseSources())}
            </div>
          </section>
        </div>
      </main>
    </div>

    ${renderSiteFooter()}
  </div>
`;

bindSiteChrome();

const state = {
  context: null,
};

const form = document.querySelector('#represent-lookup-form');
const queryInput = document.querySelector('#represent-query');
const statusNode = document.querySelector('#represent-status');
const summaryNode = document.querySelector('#represent-summary');
const resultsNode = document.querySelector('#represent-results');
const sourcesNode = document.querySelector('#represent-sources');
const useLocationButton = document.querySelector('#use-current-location');
const chipRow = document.querySelector('#quick-chip-row');

renderQuickChips();
await initializePage();

if (initialLookup) {
  queryInput.value = initialLookup;
  await runLookup(initialLookup);
}

async function initializePage() {
  try {
    state.context = await loadLookupContext();
    setStatus('Ready. Enter a Louisiana address, city, or ZIP.');
  } catch (error) {
    console.error(error);
    setStatus('This page could not load right now. Refresh and try again.');
  }

  form.addEventListener('submit', handleSubmit);
  useLocationButton.addEventListener('click', handleUseLocation);
}

async function handleSubmit(event) {
  event.preventDefault();
  const query = queryInput.value.trim();

  if (!query) {
    setStatus('Enter a Louisiana address, city, or ZIP first.');
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
      setStatus('Location access failed. Try a street address instead.');
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
    setStatus('No clear Louisiana match came back. Try a full street address or a nearby city.');
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

  const profile = buildRepresentationProfile({
    result,
    matches,
    municipalityMatch,
    parishMatch,
    municipalityRecord,
    parishRecord,
  });

  renderSummary(profile);
  renderResults(profile);
  sourcesNode.innerHTML = renderSourceLinks(profile.sources);
  updateLookupUrl(result.query === 'Current location' ? '' : result.query);
  setStatus(`Showing representation for ${result.address ?? result.query}.`);
}

function buildRepresentationProfile({
  result,
  matches,
  municipalityMatch,
  parishMatch,
  municipalityRecord,
  parishRecord,
}) {
  const municipalityName =
    municipalityMatch?.feature.properties.__districtLabel ?? 'Outside a city or town';
  const parishName = parishMatch?.feature.properties.__districtLabel ?? 'Parish not found';
  const exactDistrictCards = [
    districtCard(getMatch(matches, 'louisiana-congress'), {
      section: 'federal',
      type: 'Federal',
      office: 'U.S. Representative',
      sourceLabel: 'U.S. House official website',
      sourceUrl: OFFICIAL_SOURCES.house,
      description: 'Address-based U.S. House district match.',
    }),
    districtCard(getMatch(matches, 'louisiana-house'), {
      section: 'state',
      type: 'State Legislature',
      office: 'Louisiana House Representative',
      sourceLabel: 'Louisiana House member page',
      sourceUrl: OFFICIAL_SOURCES.legislature,
      description: 'Address-based Louisiana House district match.',
    }),
    districtCard(getMatch(matches, 'louisiana-senate'), {
      section: 'state',
      type: 'State Legislature',
      office: 'Louisiana State Senator',
      sourceLabel: 'Louisiana Senate member page',
      sourceUrl: OFFICIAL_SOURCES.legislature,
      description: 'Address-based Louisiana Senate district match.',
    }),
    districtCard(getMatch(matches, 'shreveport-council'), {
      section: 'local',
      type: 'City',
      office: 'Shreveport City Council',
      sourceLabel: 'Shreveport City Council directory',
      sourceUrl: 'https://www.shreveportla.gov/directory.aspx?DID=4',
      description: 'Address-based city council district match where Shreveport boundaries are available.',
    }),
    districtCard(getMatch(matches, 'caddo-commission'), {
      section: 'local',
      type: 'Parish',
      office: 'Caddo Parish Commissioner',
      sourceLabel: 'Caddo Parish Commission',
      sourceUrl: 'https://caddo.gov/commission/',
      description: 'Address-based parish commission district match where Caddo boundaries are available.',
    }),
    districtCard(getMatch(matches, 'caddo-school-board'), {
      section: 'local',
      type: 'School Board',
      office: 'Caddo Parish School Board',
      sourceLabel: 'Caddo Parish School Board',
      sourceUrl: 'https://www.caddoschools.org/page/board-members',
      description: 'Address-based school board district match where Caddo boundaries are available.',
    }),
  ].filter(Boolean);

  const localCards = [
    buildMunicipalExecutiveCard(municipalityRecord, municipalityName),
    buildMunicipalRosterCard(municipalityRecord, municipalityName, exactDistrictCards),
    buildParishGovernmentCard(parishRecord, parishName),
  ].filter(Boolean);

  const cards = [
    ...exactDistrictCards,
    ...FEDERAL_STATEWIDE_OFFICIALS,
    ...STATEWIDE_OFFICIALS,
    ...localCards,
  ].map(attachRepresentativePhoto);

  return {
    result,
    matches,
    municipalityName,
    parishName,
    cards,
    sources: buildSources(cards, municipalityRecord, parishRecord),
  };
}

function districtCard(match, fallback) {
  if (!match) {
    return null;
  }

  const properties = match.feature.properties;
  const name = sanitizeText(properties.__representative);
  if (!name) {
    return null;
  }

  return {
    ...fallback,
    name,
    district: formatDistrictLabel(match),
    party: sanitizeText(properties.__party),
    phone: sanitizeText(properties.__contactPhone),
    email: sanitizeText(properties.__contactEmail),
    address: sanitizeText(properties.__contactAddress ?? properties.__officeAddress),
    website: sanitizeText(properties.__officialWebsite, fallback.sourceUrl),
    sourceUrl: sanitizeText(properties.__officialWebsite, fallback.sourceUrl),
    precision: 'Matched to address',
    layerId: match.id,
    districtKey: sanitizeText(properties.__districtKey),
  };
}

function buildMunicipalExecutiveCard(record, municipalityName) {
  if (!record || municipalityName === 'Outside a city or town') {
    return null;
  }

  const executive = findRosterContact(record, [
    /\bmayor\b/i,
    /\bparish president\b/i,
    /\bchief executive\b/i,
    /\bcity manager\b/i,
    /\btown manager\b/i,
  ]);
  const name = executive?.name ?? record.name;
  const office = executive?.title ?? `${formatMunicipalityType(record.type)} hall`;

  return {
    section: 'local',
    type: 'City',
    office,
    name,
    phone: sanitizeText(record.phone),
    address: sanitizeText(record.address),
    website: sanitizeText(record.sourceUrl),
    sourceLabel: `${record.name} municipal profile`,
    sourceUrl: sanitizeText(record.sourceUrl),
    precision: 'Municipality match',
    description: `${record.name} is the municipality matched for this point.`,
    brand: getMunicipalityBrand(record, municipalityName),
  };
}

function buildMunicipalRosterCard(record, municipalityName, exactDistrictCards) {
  if (!record || municipalityName === 'Outside a city or town') {
    return null;
  }

  const hasExactCityDistrict = exactDistrictCards.some((card) => card.office.includes('City Council'));
  if (hasExactCityDistrict) {
    return null;
  }

  const roster = (record.roster ?? [])
    .filter((person) =>
      /\bcouncil(member|man|woman)\b|\balder(man|woman)\b|\bcommissioner\b|\bselectman\b|\bmayor\b/i.test(
        `${person.title} ${person.fullText}`,
      ),
    )
    .map((person) => ({
      name: sanitizeText(person.name),
      title: sanitizeText(person.title),
    }))
    .filter((person) => person.name && person.title)
    .slice(0, 8);

  if (!roster.length) {
    return null;
  }

  return {
    section: 'local',
    type: 'City',
    office: `${record.name} elected roster`,
    name: `${roster.length} listed local officials`,
    people: roster,
    website: sanitizeText(record.sourceUrl),
    sourceLabel: `${record.name} municipal profile`,
    sourceUrl: sanitizeText(record.sourceUrl),
    precision: 'Citywide roster',
    description:
      'Directory-level city officials are useful starting points; use the official city site for exact district wards when applicable.',
    brand: getMunicipalityBrand(record, municipalityName),
  };
}

function buildParishGovernmentCard(record, parishName) {
  if (!record) {
    return null;
  }

  const governmentUrl = sanitizeText(record.linkMap?.localGovernment, record.pageUrl);
  return {
    section: 'local',
    type: 'Parish',
    office: 'Parish government',
    name: record.name,
    website: governmentUrl,
    sourceLabel: `${record.name} local government`,
    sourceUrl: governmentUrl,
    precision: 'Parish match',
    description: record.seat
      ? `${parishName} parish government, with parish seat at ${record.seat}.`
      : `${parishName} parish government.`,
    brand: getParishBrand(record),
  };
}

function renderSummary(profile) {
  const addressLines = renderAddressLines(profile.result.address ?? profile.result.query);
  const exactCount = profile.cards.filter((card) => card.precision === 'Matched to address').length;
  const localCount = profile.cards.filter((card) => card.section === 'local').length;

  summaryNode.innerHTML = `
    <div class="represent-summary-card">
      <div>
        <div class="summary-kicker">Matched Location</div>
        <h3>${addressLines.map(escapeHtml).join('<br />')}</h3>
        <p>${escapeHtml(getPrecisionNote(profile.result))}</p>
      </div>
      <div class="represent-summary-card__meta">
        <article>
          <span>Parish</span>
          <strong>${escapeHtml(profile.parishName)}</strong>
        </article>
        <article>
          <span>Municipality</span>
          <strong>${escapeHtml(profile.municipalityName)}</strong>
        </article>
        <article>
          <span>Address-based districts</span>
          <strong>${exactCount}</strong>
        </article>
        <article>
          <span>Local entries</span>
          <strong>${localCount}</strong>
        </article>
      </div>
    </div>
  `;
}

function renderResults(profile) {
  const groups = [
    {
      key: 'federal',
      title: 'Federal',
      description: 'U.S. House is matched by district; U.S. Senators represent the full state.',
    },
    {
      key: 'state',
      title: 'State Legislature',
      description: 'Louisiana House and Senate are address-based district matches.',
    },
    {
      key: 'statewide',
      title: 'Statewide Offices',
      description: 'These elected offices represent every Louisiana resident statewide.',
    },
    {
      key: 'local',
      title: 'Local',
      description: 'Parish, city, school board, and local district entries where data is available.',
    },
  ];

  resultsNode.innerHTML = groups
    .map((group) => {
      const cards = profile.cards.filter((card) => card.section === group.key);
      if (!cards.length) {
        return '';
      }

      return `
        <section class="represent-result-group" aria-labelledby="represent-${group.key}">
          <div class="represent-group-header">
            <div>
              <h3 id="represent-${group.key}">${escapeHtml(group.title)}</h3>
              <p>${escapeHtml(group.description)}</p>
            </div>
          </div>
          <div class="represent-card-grid">
            ${cards.map(renderRepresentativeCard).join('')}
          </div>
        </section>
      `;
    })
    .join('');
}

function renderRepresentativeCard(card) {
  const links = compactLinks([
    card.website ? { label: 'Official page', href: card.website } : null,
    card.sourceUrl && card.sourceUrl !== card.website
      ? { label: 'Source', href: card.sourceUrl }
      : null,
  ]);

  return `
    <article class="represent-card">
      <div class="represent-card__header">
        <div>
          <div class="result-type">${escapeHtml(card.type)}</div>
          <h4>${escapeHtml(card.office)}</h4>
        </div>
        <span class="represent-precision">${escapeHtml(card.precision)}</span>
      </div>
      <div class="represent-person${card.photo ? ' represent-person--photo' : ''}">
        ${renderRepresentativeMark(card)}
        <div>
          <strong>${escapeHtml(card.name)}</strong>
          ${card.district ? `<span>${escapeHtml(card.district)}</span>` : ''}
          ${card.party ? `<span>${escapeHtml(card.party)}</span>` : ''}
        </div>
      </div>
      <p>${escapeHtml(card.description)}</p>
      ${renderPeopleList(card.people)}
      ${renderContactRows(card)}
      ${
        links.length
          ? `<div class="contact-links">${links
              .map(
                (link) => `
                  <a href="${escapeAttribute(link.href)}" target="_blank" rel="noreferrer">
                    ${escapeHtml(link.label)}
                  </a>
                `,
              )
              .join('')}</div>`
          : ''
      }
    </article>
  `;
}

function renderRepresentativeMark(card) {
  const photo = normalizePhoto(card.photo);
  if (photo?.src) {
    const objectPosition = photo.objectPosition
      ? ` style="object-position: ${escapeAttribute(photo.objectPosition)}"`
      : '';
    return `
      <span class="represent-person__mark represent-person__mark--photo">
        <img src="${escapeAttribute(photo.src)}" alt="${escapeAttribute(photo.alt)}" loading="lazy"${objectPosition} />
      </span>
    `;
  }

  const brand = normalizeBrand(card.brand);

  if (brand?.src) {
    const variantClass = brand.variant === 'wide' ? ' represent-person__mark--wide' : '';
    return `
      <span class="represent-person__mark represent-person__mark--image${variantClass}" aria-label="${escapeAttribute(brand.alt)}">
        <img src="${escapeAttribute(brand.src)}" alt="" loading="lazy" />
      </span>
    `;
  }

  return `<span class="represent-person__mark" aria-hidden="true">${escapeHtml(getInitials(card.name))}</span>`;
}

function renderPeopleList(people = []) {
  if (!people.length) {
    return '';
  }

  return `
    <div class="represent-people-list">
      ${people
        .map(
          (person) => `
            <div class="represent-people-list__row">
              <strong>${escapeHtml(person.name)}</strong>
              <span>${escapeHtml(person.title)}</span>
            </div>
          `,
        )
        .join('')}
    </div>
  `;
}

function renderContactRows(card) {
  const rows = [
    card.phone
      ? {
          label: 'Phone',
          value: `<a href="tel:${escapeAttribute(sanitizePhone(card.phone))}">${escapeHtml(card.phone)}</a>`,
        }
      : null,
    card.email
      ? {
          label: 'Email',
          value: `<a href="mailto:${escapeAttribute(card.email)}">${escapeHtml(card.email)}</a>`,
        }
      : null,
    card.address
      ? {
          label: 'Office',
          value: renderAddressLines(card.address).map(escapeHtml).join('<br />'),
        }
      : null,
  ].filter(Boolean);

  if (!rows.length) {
    return '';
  }

  return `
    <dl class="represent-contact-list">
      ${rows
        .map(
          (row) => `
            <div>
              <dt>${escapeHtml(row.label)}</dt>
              <dd>${row.value}</dd>
            </div>
          `,
        )
        .join('')}
    </dl>
  `;
}

function renderSourceLinks(sources) {
  return compactSources(sources)
    .map(
      (source) => `
        <a class="represent-source-card" href="${escapeAttribute(source.href)}" target="_blank" rel="noreferrer">
          <span>${escapeHtml(source.label)}</span>
          <small>${escapeHtml(source.note)}</small>
        </a>
      `,
    )
    .join('');
}

function attachRepresentativePhoto(card) {
  const photos = state.context?.representativePhotos?.photos ?? {};
  const candidates = [
    card.photoKey,
    card.layerId && card.districtKey ? `${card.layerId}:${card.districtKey}` : '',
    card.name ? makePersonPhotoKey(card.name) : '',
    card.office ? `statewide-office:${normalizeNameForPhoto(card.office)}` : '',
  ].filter(Boolean);

  const photo = candidates.map((key) => photos[key]).find(Boolean);
  return photo ? { ...card, photo } : card;
}

function buildSources(cards, municipalityRecord, parishRecord) {
  return [
    ...getBaseSources(),
    municipalityRecord?.sourceUrl
      ? {
          label: `${municipalityRecord.name} municipal profile`,
          href: municipalityRecord.sourceUrl,
          note: 'Mayor and municipal roster starting point',
        }
      : null,
    parishRecord?.pageUrl
      ? {
          label: `${parishRecord.name} page`,
          href: parishRecord.pageUrl,
          note: 'Parish directory and local government links',
        }
      : null,
    ...cards
      .filter((card) => card.sourceUrl && (card.precision === 'Matched to address' || card.section === 'local'))
      .map((card) => ({
        label: card.sourceLabel ?? card.office,
        href: card.sourceUrl,
        note: card.precision,
      })),
  ].filter(Boolean);
}

function getBaseSources() {
  return [
    {
      label: 'Louisiana Legislature Find My Legislators',
      href: OFFICIAL_SOURCES.legislature,
      note: 'Official state legislative address lookup',
    },
    {
      label: 'U.S. House Find Your Representative',
      href: OFFICIAL_SOURCES.house,
      note: 'Official congressional lookup cross-check',
    },
    {
      label: 'U.S. Senate senator directory',
      href: OFFICIAL_SOURCES.senate,
      note: 'Official U.S. Senate contact directory',
    },
    {
      label: 'Louisiana executive branch elected officials',
      href: OFFICIAL_SOURCES.stateOfficials,
      note: 'Official statewide office links',
    },
    {
      label: 'Louisiana Public Service Commission',
      href: OFFICIAL_SOURCES.lpsc,
      note: 'Utility regulator district cross-check',
    },
  ];
}

function renderQuickChips() {
  chipRow.innerHTML = QUICK_SEARCHES.map(
    (query) => `
      <button class="quick-chip" type="button" data-query="${escapeAttribute(query)}">
        ${escapeHtml(query)}
      </button>
    `,
  ).join('');

  chipRow.querySelectorAll('[data-query]').forEach((button) => {
    button.addEventListener('click', async () => {
      const query = button.dataset.query;
      queryInput.value = query;
      await runLookup(query);
    });
  });
}

function getMatch(matches, layerId) {
  return matches.find((match) => match.id === layerId) ?? null;
}

function findRosterContact(record, patterns) {
  return (record.roster ?? []).find((person) =>
    patterns.some((pattern) => pattern.test(`${person.title} ${person.fullText}`)),
  );
}

function getMunicipalityBrand(record, fallbackName) {
  const override = MUNICIPALITY_BRAND_OVERRIDES[normalizeLookupNameLocal(record?.normalizedName ?? record?.name ?? fallbackName)];
  if (override) {
    return override;
  }

  const enhancement = getMunicipalityEnhancement(record, fallbackName);
  if (enhancement?.brand) {
    return enhancement.brand;
  }

  return null;
}

function getMunicipalityEnhancement(record, fallbackName) {
  const name = sanitizeText(record?.normalizedName ?? record?.name, fallbackName);
  if (!name || name === 'Outside a city or town') {
    return null;
  }

  const municipalityKey = normalizeParishKey(name);
  return state.context?.municipalityEnhancements?.municipalities?.[municipalityKey] ?? null;
}

function getParishBrand(record) {
  if (!record) {
    return LOUISIANA_STATE_BRAND;
  }

  const parishKey = normalizeParishKey(record.normalizedName ?? record.name);
  return state.context?.parishEnhancements?.parishes?.[parishKey]?.brand ?? LOUISIANA_STATE_BRAND;
}

function getPrecisionNote(result) {
  if (result.query === 'Current location') {
    return 'This lookup used your device location.';
  }

  if (/^\d{5}(?:-\d{4})?$/.test(result.query.trim())) {
    return 'ZIP-only searches are approximate. Use a street address for district boundaries.';
  }

  if (result.matchType && result.matchType !== 'PointAddress') {
    return 'This search may be approximate. A full street address gives the strongest match.';
  }

  return 'This result is based on the matched address point.';
}

function updateLookupUrl(query) {
  const url = new URL(window.location.href);

  if (query) {
    url.searchParams.set('lookup', query);
  } else {
    url.searchParams.delete('lookup');
  }

  url.hash = 'results';
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

function compactLinks(links) {
  const seen = new Set();

  return links.filter((link) => {
    if (!link?.label || !link?.href) {
      return false;
    }

    const key = `${link.label}|${link.href}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function compactSources(sources) {
  const seen = new Set();

  return sources.filter((source) => {
    if (!source?.label || !source?.href) {
      return false;
    }

    const key = source.href;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function formatMunicipalityType(value) {
  const text = sanitizeText(value).toLowerCase();
  if (!text) {
    return 'Local';
  }

  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
}

function normalizeBrand(brand) {
  if (!brand) {
    return null;
  }

  const src = sanitizeAssetPath(brand.src);
  if (!src) {
    return null;
  }

  return {
    src,
    alt: sanitizeText(brand.alt, 'Official logo'),
    variant: sanitizeText(brand.variant),
  };
}

function normalizePhoto(photo) {
  if (!photo) {
    return null;
  }

  const src = sanitizeAssetPath(photo.src);
  if (!src) {
    return null;
  }

  return {
    src,
    alt: sanitizeText(photo.alt, 'Representative portrait'),
    objectPosition: sanitizeObjectPosition(photo.objectPosition),
  };
}

function sanitizeObjectPosition(value) {
  const position = sanitizeText(value);
  if (!position) {
    return '';
  }

  return /^\d{1,3}% \d{1,3}%$/.test(position) ? position : '';
}

function sanitizeAssetPath(value) {
  const src = sanitizeText(value);
  if (!src) {
    return '';
  }

  if (src.startsWith('/')) {
    return src;
  }

  try {
    const url = new URL(src);
    if (['http:', 'https:'].includes(url.protocol)) {
      return url.toString();
    }
  } catch (error) {
    return '';
  }

  return '';
}

function normalizeParishKey(value) {
  return normalizeLookupNameLocal(value).replace(/parish$/, '');
}

function normalizeLookupNameLocal(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/\bsaint\b/g, 'st')
    .replace(/[^a-z0-9]+/g, '')
    .trim();
}

function makePersonPhotoKey(name) {
  return `person:${normalizeNameForPhoto(name)}`;
}

function normalizeNameForPhoto(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/\b(mr|mrs|ms|dr|honorable|president|vice|first|second|jr|sr)\.?\b/g, ' ')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^a-z0-9]+/g, '')
    .trim();
}

function getInitials(value) {
  const words = sanitizeText(value)
    .replace(/\b(city|town|village|municipality|of|the|listed|local|officials)\b/gi, ' ')
    .split(/\s+/)
    .filter(Boolean);

  return words.slice(0, 2).map((word) => word.charAt(0)).join('').toUpperCase() || 'LA';
}

function sanitizePhone(value) {
  return String(value ?? '').replace(/\D/g, '');
}

function setStatus(message) {
  statusNode.textContent = message;
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
