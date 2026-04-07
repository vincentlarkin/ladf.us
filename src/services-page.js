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
  normalizeLookupName,
  renderAddressLines,
} from './locationLookup.js';

const DRINKING_WATER_VIEWER_URL = 'https://sdw.ldh.la.gov/';
const SHREVEPORT_DIRECTORY_URL = 'https://www.shreveportla.gov/Directory.aspx';
const SHREVEPORT_CITY_HALL_ADDRESS = '505 Travis Street\nShreveport, LA 71101';
const SHREVEPORT_WATER_SEWER_URL = 'https://www.shreveportla.gov/131/4088/Water-Sewerage';
const SHREVEPORT_WATER_BILL_URL = 'https://www.shreveportla.gov/2474/16127/Pay-Your-Water-Bill';
const SWEPCO_URL = 'https://www.swepco.com/';
const DELTA_UTILITIES_URL = 'https://deltautilities.com/';

const QUICK_SEARCHES = ['70301', 'Thibodaux, LA', 'Shreveport, LA', 'Alexandria, LA'];
const initialLookup = new URLSearchParams(window.location.search).get('lookup')?.trim() ?? '';

const MUNICIPALITY_OVERRIDES = {
  shreveport: {
    sourceUrl: SHREVEPORT_DIRECTORY_URL,
    phone: '318-673-7300',
    address: SHREVEPORT_CITY_HALL_ADDRESS,
    utilityPortalUrl: 'https://utility.shreveportla.gov/',
    serviceContacts: {
      administration: [
        {
          name: 'Tom Arceneaux',
          title: 'Mayor',
          phone: '318-673-5010',
          address: SHREVEPORT_CITY_HALL_ADDRESS,
          sourceUrl: 'https://www.shreveportla.gov/Directory.aspx?EID=822',
        },
        {
          name: 'Tom Dark',
          title: 'Chief Administrative Officer',
          phone: '318-673-5061',
          address: SHREVEPORT_CITY_HALL_ADDRESS,
          sourceUrl: 'https://www.shreveportla.gov/Directory.aspx?EID=826',
        },
        {
          name: 'Alexis James',
          title: 'Assistant Chief Administrative Officer',
          phone: '318-673-5023',
          address: SHREVEPORT_CITY_HALL_ADDRESS,
          sourceUrl: 'https://www.shreveportla.gov/Directory.aspx?EID=825',
        },
        {
          name: 'Leigh Anne Evensky',
          title: 'Director of Communications',
          phone: '318-673-7515',
          address: SHREVEPORT_CITY_HALL_ADDRESS,
          sourceUrl: 'https://www.shreveportla.gov/Directory.aspx?EID=897',
        },
      ],
      clerk: [
        {
          name: 'Tonya Bogan',
          title: 'Clerk of Council',
          phone: '318-673-5669',
          address: SHREVEPORT_CITY_HALL_ADDRESS,
          sourceUrl: 'https://www.shreveportla.gov/Directory.aspx?EID=4',
        },
        {
          name: 'Terri Sanders',
          title: 'Deputy Clerk of Council',
          phone: '318-673-5262',
          address: SHREVEPORT_CITY_HALL_ADDRESS,
          sourceUrl: 'https://www.shreveportla.gov/Directory.aspx?EID=324',
        },
        {
          name: 'RJ Johnson',
          title: 'Director of Council Affairs',
          phone: '318-673-5257',
          address: SHREVEPORT_CITY_HALL_ADDRESS,
          sourceUrl: 'https://www.shreveportla.gov/Directory.aspx?EID=727',
        },
      ],
      publicWorks: [
        {
          name: 'Jarvis Morgan',
          title: 'Public Works Director',
          phone: '318-673-6300',
          address: SHREVEPORT_CITY_HALL_ADDRESS,
          sourceUrl: 'https://www.shreveportla.gov/Directory.aspx?EID=653',
        },
        {
          name: 'Allen Pierce',
          title: 'Superintendent',
          phone: '318-673-6181',
          address: SHREVEPORT_CITY_HALL_ADDRESS,
          sourceUrl: 'https://www.shreveportla.gov/Directory.aspx?EID=240',
        },
        {
          name: 'Christopher Wilder',
          title: 'Superintendent of Fleet Services',
          phone: '318-216-0827',
          address: SHREVEPORT_CITY_HALL_ADDRESS,
          sourceUrl: 'https://www.shreveportla.gov/Directory.aspx?EID=188',
        },
        {
          name: 'James Smiley',
          title: 'Chief Supervisor, Signals',
          phone: '318-673-6181',
          address: SHREVEPORT_CITY_HALL_ADDRESS,
          sourceUrl: 'https://www.shreveportla.gov/Directory.aspx?EID=791',
        },
        {
          name: 'Leonardo Carter',
          title: 'Chief Supervisor, Signs and Barricades',
          phone: '318-673-6181',
          address: SHREVEPORT_CITY_HALL_ADDRESS,
          sourceUrl: 'https://www.shreveportla.gov/Directory.aspx?EID=965',
        },
      ],
      water: [
        {
          name: 'Water & Sewerage Customer Service',
          title: 'Service setup and account questions',
          phone: '318-673-6097',
          address: SHREVEPORT_CITY_HALL_ADDRESS,
          sourceUrl: SHREVEPORT_WATER_SEWER_URL,
        },
        {
          name: 'Water Billing Line',
          title: 'Water and sewer bill balance information',
          phone: '318-673-5463',
          address: SHREVEPORT_CITY_HALL_ADDRESS,
          sourceUrl: SHREVEPORT_WATER_SEWER_URL,
        },
        {
          name: 'William Daniel',
          title: 'Director',
          phone: '318-673-7660',
          address: SHREVEPORT_CITY_HALL_ADDRESS,
          sourceUrl: 'https://www.shreveportla.gov/Directory.aspx?EID=701',
        },
        {
          name: 'Brandon Snead',
          title: 'Deputy Director',
          phone: '318-673-7658',
          address: SHREVEPORT_CITY_HALL_ADDRESS,
          sourceUrl: 'https://www.shreveportla.gov/Directory.aspx?EID=703',
        },
        {
          name: 'Karena Thomas',
          title: 'Superintendent of Customer Service',
          phone: '318-673-5510',
          address: SHREVEPORT_CITY_HALL_ADDRESS,
          sourceUrl: 'https://www.shreveportla.gov/Directory.aspx?EID=608',
        },
        {
          name: 'Qiana Maple-Lars',
          title: 'Superintendent, Water Purification',
          phone: '318-673-7651',
          address: SHREVEPORT_CITY_HALL_ADDRESS,
          sourceUrl: 'https://www.shreveportla.gov/Directory.aspx?EID=184',
        },
        {
          name: 'Kedrick Chism',
          title: 'Assistant Superintendent',
          phone: '318-673-6551',
          address: SHREVEPORT_CITY_HALL_ADDRESS,
          sourceUrl: 'https://www.shreveportla.gov/Directory.aspx?EID=582',
        },
      ],
      utilities: [],
      electric: [
        {
          name: 'SWEPCO',
          title: 'Electric utility provider (service varies by address)',
          phone: '1-888-216-3523',
          sourceUrl: SWEPCO_URL,
        },
      ],
      gas: [
        {
          name: 'Delta Utilities',
          title: 'Natural gas utility provider (service varies by address)',
          sourceUrl: DELTA_UTILITIES_URL,
        },
      ],
      permits: [
        {
          name: 'Mike Sepulvado',
          title: 'Chief Building Official',
          phone: '318-673-6111',
          address: SHREVEPORT_CITY_HALL_ADDRESS,
          sourceUrl: 'https://www.shreveportla.gov/Directory.aspx?EID=520',
        },
        {
          name: 'Steven Knotts',
          title: 'Civil Permits Manager',
          phone: '318-673-5013',
          address: SHREVEPORT_CITY_HALL_ADDRESS,
          sourceUrl: 'https://www.shreveportla.gov/Directory.aspx?EID=892',
        },
        {
          name: 'Rhonda Moore',
          title: 'Chief of Office Administrations',
          phone: '318-673-6120',
          address: SHREVEPORT_CITY_HALL_ADDRESS,
          sourceUrl: 'https://www.shreveportla.gov/Directory.aspx?EID=535',
        },
        {
          name: 'Kimberly Colvin',
          title: 'Project Management Assistant',
          phone: '318-673-6108',
          address: SHREVEPORT_CITY_HALL_ADDRESS,
          sourceUrl: 'https://www.shreveportla.gov/Directory.aspx?EID=514',
        },
      ],
      police: [
        {
          name: 'Wayne Smith',
          title: 'Chief of Police',
          phone: '318-673-6900',
          address: SHREVEPORT_CITY_HALL_ADDRESS,
          sourceUrl: 'https://www.shreveportla.gov/Directory.aspx?EID=787',
        },
        {
          name: 'Stephen Pfender',
          title: 'Assistant Chief of Police, Investigations',
          phone: '318-673-7210',
          address: SHREVEPORT_CITY_HALL_ADDRESS,
          sourceUrl: 'https://www.shreveportla.gov/Directory.aspx?EID=575',
        },
        {
          name: 'Renee Davis',
          title: 'Assistant Chief of Police, Uniformed Services',
          phone: '318-673-7221',
          address: SHREVEPORT_CITY_HALL_ADDRESS,
          sourceUrl: 'https://www.shreveportla.gov/Directory.aspx?EID=651',
        },
        {
          name: 'Timothy Beckius',
          title: 'Assistant Chief of Support Division',
          phone: '318-673-7079',
          address: SHREVEPORT_CITY_HALL_ADDRESS,
          sourceUrl: 'https://www.shreveportla.gov/Directory.aspx?EID=262',
        },
      ],
      fire: [
        {
          name: 'Clarence Reese, Jr.',
          title: 'Fire Chief',
          phone: '318-673-6650',
          address: SHREVEPORT_CITY_HALL_ADDRESS,
          sourceUrl: 'https://www.shreveportla.gov/Directory.aspx?EID=148',
        },
        {
          name: 'Carolyn Henderson',
          title: 'Deputy Fire Chief',
          phone: '318-673-6658',
          address: SHREVEPORT_CITY_HALL_ADDRESS,
          sourceUrl: 'https://www.shreveportla.gov/Directory.aspx?EID=149',
        },
        {
          name: 'Daniel McDonnell',
          title: 'Chief of Administration to Fire Chief',
          phone: '318-673-6652',
          address: SHREVEPORT_CITY_HALL_ADDRESS,
          sourceUrl: 'https://www.shreveportla.gov/Directory.aspx?EID=1007',
        },
        {
          name: 'Christopher Pascoe',
          title: 'Assistant Chief of Training',
          phone: '318-673-6766',
          address: SHREVEPORT_CITY_HALL_ADDRESS,
          sourceUrl: 'https://www.shreveportla.gov/Directory.aspx?EID=979',
        },
      ],
    },
  },
};

document.querySelector('#app').innerHTML = `
  <div class="page">
    ${renderSiteHeader({ activePage: 'services' })}

    <div class="site-body">
      ${renderSidebar({
        sections: [
          { href: '#overview', label: 'Overview' },
          { href: '#lookup', label: 'Search' },
          { href: '#results', label: 'Your Match' },
          { href: '#services', label: 'Who To Call' },
          { href: '#districts', label: 'Districts' },
        ],
      })}

      <main class="content">
        <div class="content__inner content__inner--wide">
          ${renderBreadcrumb([
            { label: 'Home', href: '/index.html' },
            { label: 'Services by ZIP' },
          ])}

          <section class="page-intro" id="overview">
            <div class="eyebrow">Local Help</div>
            <h1>Enter a ZIP code, city, or address.</h1>
            <p class="lead">
              We will show the city, parish, and the best official places to start
              for common local questions like water, trash, permits, schools, and
              parish offices.
            </p>
            <div class="disclaimer-box disclaimer-box--compact">
              <p>
                A full street address gives the best match. ZIP codes and city names
                are close, but not always exact.
              </p>
            </div>
          </section>

          <section class="section" id="lookup">
            <h2>Search</h2>
            <div class="lookup-shell lookup-shell--single">
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
                  Getting the page ready...
                </p>
              </form>
            </div>
          </section>

          <section class="section" id="results">
            <h2>Your Match</h2>
            <div id="service-summary" class="contact-summary">
              <div class="summary-kicker">Start Here</div>
              <h4>Search a place to see the right local offices.</h4>
              <p>
                Your result will show the city, parish, and a simple top-to-bottom
                order for who to contact first.
              </p>
            </div>
          </section>

          <section class="section" id="services">
            <h2>Who To Call</h2>
            <div id="service-card-grid" class="service-card-grid"></div>
          </section>

          <section class="section" id="districts">
            <h2>Districts</h2>
            <div id="district-card-grid" class="card-grid card-grid--two"></div>
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

const form = document.querySelector('#service-lookup-form');
const queryInput = document.querySelector('#service-query');
const statusNode = document.querySelector('#service-status');
const summaryNode = document.querySelector('#service-summary');
const serviceGridNode = document.querySelector('#service-card-grid');
const districtGridNode = document.querySelector('#district-card-grid');
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
    setStatus('Ready. Enter a Louisiana ZIP code, city, or address.');
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
  const municipalityRecordRaw = municipalityMatch
    ? findMunicipalityServiceRecord(
        state.context,
        municipalityMatch.feature.properties.__districtLabel,
      )
    : null;
  const municipalityRecord = applyMunicipalityOverrides(municipalityRecordRaw);
  const parishRecord = parishMatch
    ? findParishServiceRecord(
        state.context,
        parishMatch.feature.properties.__districtLabel,
      )
    : null;

  renderSummary({
    result,
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

  setStatus(`Showing local results for ${result.address ?? result.query}.`);
}

function renderSummary({
  result,
  municipalityMatch,
  parishMatch,
  municipalityRecord,
  parishRecord,
}) {
  const municipalityName =
    municipalityMatch?.feature.properties.__districtLabel ?? 'Outside a city or town';
  const parishName =
    parishMatch?.feature.properties.__districtLabel ?? 'Parish not found';
  const precisionNote = getPrecisionNote(result);
  const municipalHierarchy = buildMunicipalHierarchy(municipalityRecord);
  const parishHierarchy = buildParishHierarchy(parishRecord);

  summaryNode.innerHTML = `
    <div class="summary-kicker">Match</div>
    <h4>${escapeHtml(result.address ?? result.query)}</h4>
    <p>
      Closest match: <strong>${escapeHtml(municipalityName)}</strong> in
      <strong>${escapeHtml(parishName)}</strong>.
    </p>
    <p class="mini-meta">${escapeHtml(precisionNote)}</p>
    <div class="routing-ladder-grid">
      ${renderHierarchyPanel({
        kicker: 'City Hall',
        title: municipalityRecord
          ? `${municipalityRecord.name} who to call first`
          : 'City or town contacts',
        description: municipalityRecord
          ? 'Top to bottom local contacts for the city or town that matched.'
          : 'No city or town contact list was found for this result.',
        entries: municipalHierarchy,
        emptyMessage:
          'No city or town list was found here. Use the parish offices below.',
      })}
      ${renderHierarchyPanel({
        kicker: 'Parish Offices',
        title: parishRecord
          ? `${parishRecord.name} parish offices`
          : 'Parish offices',
        description: parishRecord
          ? 'Common parish offices people usually need, in a simple order.'
          : 'A parish office list was not found for this result.',
        entries: parishHierarchy,
        emptyMessage:
          'No parish office list is available for this result yet.',
      })}
    </div>
  `;
}

function renderServiceCards({
  municipalityMatch,
  parishMatch,
  municipalityRecord,
  parishRecord,
}) {
  const municipalityKey = municipalityRecord ? getMunicipalityKey(municipalityRecord) : null;
  const isShreveport = municipalityKey === 'shreveport';
  const localGovernmentLink =
    parishRecord?.linkMap.localGovernment ?? parishRecord?.pageUrl ?? null;
  const localEntityName =
    municipalityMatch?.feature.properties.__districtLabel ??
    parishMatch?.feature.properties.__districtLabel ??
    'this area';

  const cards = [
    {
      type: 'Water / Sewer',
      title: 'Water, sewer, and utility billing',
      description:
        municipalityMatch
          ? `${municipalityMatch.feature.properties.__districtLabel} is the first local place to check for water, sewer, or utility billing questions.`
          : 'Outside a city or town, water and sewer may be handled by a parish office, a utility district, or a local water system.',
      contacts: buildRoutingContacts(
        municipalityRecord,
        ['water', 'utilities', 'publicWorks'],
        [],
      ),
      links: compactLinks([
        ...(isShreveport
          ? [
              {
                label: 'Shreveport Water & Sewerage',
                href: SHREVEPORT_WATER_SEWER_URL,
              },
              {
                label: 'Pay your water bill',
                href: SHREVEPORT_WATER_BILL_URL,
              },
            ]
          : []),
        municipalityRecord && {
          label: `${municipalityRecord.name} municipal profile`,
          href: municipalityRecord.sourceUrl,
        },
        municipalityRecord?.utilityPortalUrl && {
          label: `${municipalityRecord.name} utility portal`,
          href: municipalityRecord.utilityPortalUrl,
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
        isShreveport
          ? 'Shreveport water and sewer billing is handled through the city water and sewerage office.'
          : municipalityRecord
          ? 'If a dedicated water or utility role is listed, start there. Otherwise start with the municipal main office.'
          : 'If you are outside a city or town, start with the parish office page.',
    },
    {
      type: 'Trash / Streets',
      title: 'Garbage, recycling, streets, drainage, and public works',
      description:
        municipalityMatch
          ? `${municipalityMatch.feature.properties.__districtLabel} usually handles routine local service issues like trash pickup schedules, drainage, streets, and similar public-works concerns.`
          : `${localEntityName} likely routes these issues through parish government or a local service district.`,
      contacts: buildRoutingContacts(
        municipalityRecord,
        ['publicWorks'],
        ['clerk'],
      ),
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
          : 'Rural trash, roads, and drainage can vary by area, so the parish government link is the best place to start.',
    },
    {
      type: 'Permits / Code',
      title: 'Permits, zoning, code, inspections, and local admin',
      description:
        municipalityMatch
          ? 'Building permits, code questions, and municipal paperwork usually start with city hall, the clerk, code office, or local inspections staff.'
          : 'Outside an incorporated city or town, permitting can shift to parish offices or special districts depending on the issue.',
      contacts: buildRoutingContacts(
        municipalityRecord,
        ['permits', 'clerk'],
        ['publicWorks'],
      ),
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
        'Start with the first office listed here. Permit steps can still vary by city limits and local rules.',
    },
    {
      type: 'Power / Gas',
      title: 'Electricity and natural gas',
      description:
        'Utility providers vary by address. When a city lists its own utility contact, it will appear here. Otherwise start with the local office and use the state utility commission for provider questions or complaints.',
      contacts: buildRoutingContacts(
        municipalityRecord,
        ['electric', 'gas', 'utilities'],
        [],
      ),
      links: compactLinks([
        ...(isShreveport
          ? [
              {
                label: 'SWEPCO electric service',
                href: SWEPCO_URL,
              },
              {
                label: 'Delta Utilities natural gas service',
                href: DELTA_UTILITIES_URL,
              },
            ]
          : []),
        municipalityRecord?.utilityPortalUrl && {
          label: `${municipalityRecord.name} utility portal`,
          href: municipalityRecord.utilityPortalUrl,
        },
        municipalityRecord && {
          label: `${municipalityRecord.name} municipal profile`,
          href: municipalityRecord.sourceUrl,
        },
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
        isShreveport
          ? 'Shreveport electric and gas providers can differ by address, so confirm your exact service location.'
          : 'Power and gas providers can still change from one part of town to another.',
    },
    {
      type: 'Public Safety',
      title: 'Police, fire, sheriff, and emergency preparedness',
      description:
        municipalityMatch
          ? 'When the city or town lists police or fire contacts, they appear here. Sheriff and parish emergency links stay here too.'
          : 'Outside a city or town, parish sheriff and parish emergency resources are often the right first stop.',
      contacts: buildRoutingContacts(
        municipalityRecord,
        ['police', 'fire'],
        [],
      ),
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
        'Emergency needs still belong on 911. This section is for routine office and directory contact information.',
    },
    {
      type: 'Parish Offices',
      title: 'Assessor, clerk, registrar, schools, and OMV',
      description:
        parishRecord
          ? `${parishRecord.name} has official links for the parish offices people often need most.`
          : 'These parish office links help with common needs like records, assessments, schools, and driver services.',
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
        'These are common offices people often need even when the address is inside a city.',
    },
  ];

  serviceGridNode.innerHTML = cards.map((card) => renderServiceCard(card)).join('');
}

function renderDistrictCards(matches) {
  if (!matches.length) {
    districtGridNode.innerHTML = `
      <article class="info-card">
        <div class="result-type">No match</div>
        <h4>No districts were found for this point.</h4>
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

function collectMunicipalContacts(record, keys, routingBand = 1) {
  if (!record) {
    return [];
  }

  return keys.flatMap((key) =>
    (record.serviceContacts[key] ?? []).map((entry) => ({
      name: sanitizeText(entry.name, record.name),
      title: sanitizeText(
        entry.title,
        `${formatMunicipalityType(record.type)} office`,
      ),
      phone: sanitizeText(entry.phone, record.phone),
      address: sanitizeText(entry.address, record.address),
      sourceUrl: sanitizeText(entry.sourceUrl, record.sourceUrl),
      sourceKey: key,
      routingBand,
    })),
  );
}

function buildRoutingContacts(
  record,
  primaryKeys,
  fallbackKeys = [],
  {
    limit = 6,
    includeExecutive = false,
    includeMainOffice = true,
    includeMainOfficeWhenEmpty = true,
  } = {},
) {
  if (!record) {
    return [];
  }

  const executiveContact = createExecutiveContact(record);
  const primaryContacts = collectMunicipalContacts(record, primaryKeys, 0);
  const fallbackContacts = collectMunicipalContacts(record, fallbackKeys, 1);
  const serviceSpecificContacts = dedupeContacts(
    [...primaryContacts, ...fallbackContacts],
    limit,
    compareHierarchyOnly,
  );
  const needsExecutiveContact =
    includeExecutive &&
    executiveContact &&
    !serviceSpecificContacts.some((contact) =>
      isSameContact(contact, executiveContact),
    );
  const shouldIncludeMainOffice =
    includeMainOffice &&
    (!includeMainOfficeWhenEmpty || serviceSpecificContacts.length === 0);

  return dedupeContacts(
    [
      ...serviceSpecificContacts,
      needsExecutiveContact ? executiveContact : null,
      shouldIncludeMainOffice ? createMainOfficeContact(record) : null,
    ],
    limit,
    compareHierarchyOnly,
  );
}

function createExecutiveContact(record) {
  if (!record) {
    return null;
  }

  const topAdministrationContact = dedupeContacts(
    collectMunicipalContacts(record, ['administration']),
  )[0];

  return topAdministrationContact
    ? {
        ...topAdministrationContact,
        sourceKey: 'executive',
        routingBand: 0,
      }
    : null;
}

function createMainOfficeContact(record) {
  if (!record) {
    return null;
  }

  return {
    name: record.name,
    title: `${formatMunicipalityType(record.type)} hall main office`,
    phone: sanitizeText(record.phone),
    address: sanitizeText(record.address),
    sourceUrl: sanitizeText(record.sourceUrl),
    sourceKey: 'mainOffice',
    routingBand: 3,
  };
}

function applyMunicipalityOverrides(record) {
  if (!record) {
    return null;
  }

  const override = MUNICIPALITY_OVERRIDES[getMunicipalityKey(record)];
  if (!override) {
    return record;
  }

  const overridePhone = sanitizeText(override.phone, record.phone);
  const overrideAddress = sanitizeText(override.address, record.address);
  const overrideSourceUrl = sanitizeText(override.sourceUrl, record.sourceUrl);
  const serviceContacts = normalizeServiceContacts({
    ...record.serviceContacts,
    ...override.serviceContacts,
  }, {
    phone: overridePhone,
    address: overrideAddress,
    sourceUrl: overrideSourceUrl,
  });

  return {
    ...record,
    ...override,
    phone: overridePhone,
    address: overrideAddress,
    sourceUrl: overrideSourceUrl,
    serviceContacts,
  };
}

function normalizeServiceContacts(serviceContacts = {}, fallback = {}) {
  return Object.fromEntries(
    Object.entries(serviceContacts).map(([key, contacts]) => [
      key,
      (Array.isArray(contacts) ? contacts : [])
        .filter((contact) => contact && (contact.name || contact.title))
        .map((contact) => ({
          ...contact,
          name: sanitizeText(contact.name),
          title: sanitizeText(contact.title),
          phone: sanitizeText(contact.phone, fallback.phone),
          address: sanitizeText(contact.address, fallback.address),
          sourceUrl: sanitizeText(contact.sourceUrl, fallback.sourceUrl),
        })),
    ]),
  );
}

function getMunicipalityKey(record) {
  return normalizeLookupName(record.normalizedName ?? record.name);
}

function isSameContact(left, right) {
  if (!left || !right) {
    return false;
  }

  return (
    sanitizeText(left.name).toLowerCase() === sanitizeText(right.name).toLowerCase() &&
    sanitizeText(left.title).toLowerCase() === sanitizeText(right.title).toLowerCase()
  );
}

function dedupeContacts(contacts, limit = 4, comparator = compareContactPriority) {
  const seen = new Set();
  return contacts
    .filter(Boolean)
    .sort(comparator)
    .filter((contact) => {
      const key = `${sanitizeText(contact.name)}|${sanitizeText(contact.title)}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .slice(0, limit);
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
                  (contact, index) => `
                    <article class="service-contact">
                      <div class="service-contact__header">
                        <span class="service-contact__rank">${index + 1}</span>
                        <div class="service-contact__heading">
                          <div class="service-contact__title">${escapeHtml(contact.name)}</div>
                          <div class="service-contact__role">${escapeHtml(contact.title)}</div>
                        </div>
                      </div>
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
              No specific local contact was listed here. Use the links below or start with the main office.
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

function getPrecisionNote(result) {
  if (result.query === 'Current location') {
    return 'This lookup used your device location.';
  }

  if (/^\d{5}(?:-\d{4})?$/.test(result.query.trim())) {
    return 'ZIP-only lookups are close, but a full street address is more exact.';
  }

  if (result.matchType && result.matchType !== 'PointAddress') {
    return 'This search looks close, but a full street address is more exact.';
  }

  return 'This result is based on the matched search location.';
}

function buildMunicipalHierarchy(record) {
  if (!record) {
    return [];
  }

  return dedupeContacts(
    [
      createExecutiveContact(record),
      ...collectMunicipalContacts(record, [
        'administration',
        'clerk',
        'publicWorks',
        'permits',
        'police',
        'fire',
        'water',
        'utilities',
        'electric',
        'gas',
      ], 1),
      createMainOfficeContact(record),
    ],
    6,
    compareHierarchyOnly,
  );
}

function buildParishHierarchy(record) {
  if (!record) {
    return [];
  }

  return [
    {
      name: record.name,
      title: record.seat
        ? `Parish government and seat at ${record.seat}`
        : 'Parish government',
      href: record.linkMap.localGovernment ?? record.pageUrl,
    },
    {
      name: "Sheriff's Office",
      title: 'Public safety, jail, and sheriff services',
      href:
        record.linkMap.sheriff ?? state.context.serviceDirectory.statewideLinks.sheriffDirectory,
    },
    {
      name: 'Assessor',
      title: 'Property assessment and parcel records',
      href: record.linkMap.assessor,
    },
    {
      name: 'Clerk of Court',
      title: 'Court filings, land records, and clerk services',
      href: record.linkMap.clerk,
    },
    {
      name: 'Registrar of Voters',
      title: 'Voter registration and election records',
      href:
        record.linkMap.registrar ?? state.context.serviceDirectory.statewideLinks.registrar,
    },
    {
      name: 'School District',
      title: 'School board and district administration',
      href:
        record.linkMap.schools ?? state.context.serviceDirectory.statewideLinks.schoolDistricts,
    },
  ].filter((entry) => entry.href);
}

function renderHierarchyPanel({
  kicker,
  title,
  description,
  entries,
  emptyMessage,
}) {
  return `
    <article class="routing-ladder-card">
      <div class="result-type">${escapeHtml(kicker)}</div>
      <h5>${escapeHtml(title)}</h5>
      <p class="routing-ladder-card__description">${escapeHtml(description)}</p>
      ${
        entries.length
          ? `<div class="routing-ladder-list">
              ${entries
                .map(
                  (entry, index) => `
                    <div class="routing-ladder-row">
                      <span class="routing-ladder-rank">${index + 1}</span>
                      <div class="routing-ladder-body">
                        <div class="routing-ladder-name">${escapeHtml(entry.name)}</div>
                        <div class="routing-ladder-role">${escapeHtml(entry.title)}</div>
                        ${
                          entry.phone
                            ? `<div class="routing-ladder-meta">${renderLinkValue(
                                `tel:${sanitizePhone(entry.phone)}`,
                                entry.phone,
                              )}</div>`
                            : entry.href
                              ? `<div class="routing-ladder-meta"><a href="${escapeAttribute(
                                  entry.href,
                                )}" target="_blank" rel="noreferrer">Open office</a></div>`
                              : ''
                        }
                      </div>
                    </div>
                  `,
                )
                .join('')}
            </div>`
          : `<div class="routing-ladder-empty">${escapeHtml(emptyMessage)}</div>`
      }
    </article>
  `;
}

function getDistrictDescription(layerId) {
  switch (layerId) {
    case 'louisiana-places':
      return 'Your city, town, or village when the search point falls inside one.';
    case 'louisiana-parishes':
      return 'The parish government area for this point.';
    case 'caddo-commission':
      return 'Parish commission district.';
    case 'shreveport-council':
      return 'City council district.';
    case 'caddo-school-board':
      return 'School board district.';
    case 'louisiana-house':
      return 'Louisiana House district for state representation.';
    case 'louisiana-senate':
      return 'Louisiana Senate district for state representation.';
    case 'louisiana-congress':
      return 'U.S. House district for federal representation.';
    default:
      return 'Matched district.';
  }
}

function sanitizePhone(value) {
  return String(value ?? '').replace(/\D/g, '');
}

function compareContactPriority(left, right) {
  return (
    (left.routingBand ?? 1) - (right.routingBand ?? 1) ||
    getHierarchyRank(left.title) - getHierarchyRank(right.title) ||
    getSourcePriority(left.sourceKey) - getSourcePriority(right.sourceKey) ||
    sanitizeText(left.name).localeCompare(sanitizeText(right.name))
  );
}

function compareHierarchyOnly(left, right) {
  return (
    getHierarchyRank(left.title) - getHierarchyRank(right.title) ||
    getSourcePriority(left.sourceKey) - getSourcePriority(right.sourceKey) ||
    sanitizeText(left.name).localeCompare(sanitizeText(right.name))
  );
}

function getHierarchyRank(title) {
  const value = sanitizeText(title).toLowerCase();

  if (!value) {
    return 99;
  }

  if (
    /\bmayor\b/.test(value) &&
    !/\bpro tem\b|\bpro-tempore\b|\bassistant\b|\bdeputy\b|\bsecretary\b/.test(value)
  ) {
    return 0;
  }

  if (/\bparish president\b|\bpresident\b|\bchief executive\b|\bjudge\b/.test(value)) {
    return 4;
  }

  if (/\bmayor pro tem\b|\bmayor pro-tempore\b|\bpro tem\b|\bvice president\b/.test(value)) {
    return 8;
  }

  if (
    /\bcity manager\b|\btown manager\b|\bcity administrator\b|\bparish administrator\b|\bchief administrative\b|\bchief of staff\b/.test(
      value,
    )
  ) {
    return 12;
  }

  if (/\bclerk of council\b|\bcity clerk\b|\btown clerk\b|\bvillage clerk\b|\bclerk\b/.test(value)) {
    return 28;
  }

  if (/\basst\b|\bassistant\b|\bdeputy\b|\binterim\b/.test(value)) {
    return 34;
  }

  if (/\bdirector\b|\bchief\b|\bmarshal\b|\bsuperintendent\b/.test(value)) {
    return 24;
  }

  if (/\bmanager\b|\bcoordinator\b|\bengineer\b|\binspector\b|\battorney\b|\bcouncil(member|man|woman)\b|\balder(man|woman)\b/.test(value)) {
    return 42;
  }

  if (/\bsecretary\b|\badministrative\b|\bstaff\b|\bemployee\b/.test(value)) {
    return 58;
  }

  return 48;
}

function getSourcePriority(sourceKey) {
  switch (sourceKey) {
    case 'executive':
      return 0;
    case 'administration':
      return 1;
    case 'clerk':
      return 2;
    case 'publicWorks':
    case 'water':
    case 'utilities':
    case 'electric':
    case 'gas':
    case 'permits':
    case 'police':
    case 'fire':
      return 3;
    case 'mainOffice':
      return 5;
    default:
      return 4;
  }
}

function formatMunicipalityType(value) {
  const text = sanitizeText(value).toLowerCase();
  if (!text) {
    return 'Local';
  }

  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
}

function renderLinkValue(href, label) {
  return `<a href="${escapeAttribute(href)}">${escapeHtml(label)}</a>`;
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
