import { normalizeLookupName } from './locationLookup.js';

const CADDO_MUNICIPALITY_NAMES = [
  'Belcher',
  'Blanchard',
  'Dixie Inn',
  'Greenwood',
  'Hosston',
  'Ida',
  'Mooringsport',
  'Oil City',
  'Shreveport',
  'Vivian',
];

const CADDO_RESOURCE_GROUPS = [
  {
    title: 'Parish Government',
    links: [
      ['Parish of Caddo', 'https://caddo.gov/'],
      ['Commission Clerk office', 'https://caddo.gov/commission-clerks-office/'],
      ['Commission district map', 'https://caddo.gov/commissioner-districts-map/'],
      ['Parish contact directory', 'https://caddo.gov/contact/'],
    ],
  },
  {
    title: 'Core Parish Offices',
    links: [
      ['Caddo Parish Clerk of Court', 'https://www.caddoclerk.com/'],
      ['Clerk contacts', 'https://www.caddoclerk.com/contacts.htm'],
      ['Caddo Parish Assessor', 'https://www.caddoassessor.org/'],
      ["Caddo Parish Sheriff's Office", 'https://www.caddosheriff.org/contact-us.php'],
      ['Registrar of voters', 'https://voterportal.sos.la.gov/registrar'],
      ['Caddo Parish Public Schools', 'https://www.caddoschools.org/'],
      ['School board members', 'https://www.caddoschools.org/page/board-members'],
      ['Shreve Memorial Library', 'https://www.shreve-lib.org/'],
    ],
  },
  {
    title: 'State and Emergency Links',
    links: [
      ['Office of Motor Vehicles', 'https://offices.omv.la.gov/'],
      [
        'Parish emergency preparedness contacts',
        'https://gohsep.la.gov/about/contact-us/parish-ohsep-contacts/',
      ],
      ['Fire protection districts', 'https://ose.louisiana.gov/jurisdictions/'],
      ['Justice courts and constables', 'https://www.ag.state.la.us/JusticeCourt/Directory'],
      ['Find your legislators', 'https://www.legis.la.gov/legis/FindMyLegislators.aspx'],
    ],
  },
];

const CADDO_PROFILE = {
  intro:
    'Caddo is the first parish with a fuller directory in this build: parish government, core offices, local district rosters, municipalities inside the parish, and the parish GOP.',
  featuredContacts: [
    {
      label: 'Parish government',
      name: 'Caddo Parish Commission',
      role: 'Legislative body for parish policy, budgets, and ordinances',
      address: '505 Travis Street, Government Plaza\nShreveport, LA 71101',
      phone: '(318) 226-6900',
      links: [
        ['Commission home', 'https://caddo.gov/commission-clerks-office/'],
        ['Commissioners', 'https://caddo.gov/commissioners/'],
        ['District map', 'https://caddo.gov/commissioner-districts-map/'],
      ],
    },
    {
      label: 'Commission clerk',
      name: 'Jeff Everson',
      role: 'Commission Clerk',
      address: '505 Travis Street, Government Plaza\nShreveport, LA 71101',
      phone: '(318) 226-6596',
      email: 'jeverson@caddo.org',
      links: [['Clerk profile', 'https://caddo.gov/portfolio-item/jeff-everson/']],
    },
    {
      label: 'Clerk of court',
      name: 'Mike Spence',
      role: 'Caddo Parish Clerk of Court',
      address: '501 Texas Street, Room 103\nShreveport, LA 71101',
      phone: '(318) 226-6780',
      links: [
        ['Official site', 'https://www.caddoclerk.com/'],
        ['Department contacts', 'https://www.caddoclerk.com/contacts.htm'],
      ],
    },
    {
      label: 'Assessor',
      name: 'Dr. Regina Webb',
      role: 'Caddo Parish Assessor',
      address: '501 Texas Street, Room 102\nShreveport, LA 71101',
      phone: '(318) 226-6704',
      email: 'info@caddoassessor.org',
      links: [['Official site', 'https://www.caddoassessor.org/']],
    },
    {
      label: 'Sheriff',
      name: 'Henry Whitehorn, Sr.',
      role: "Caddo Parish Sheriff",
      address: '501 Texas Street, Room 101\nShreveport, LA 71101',
      phone: '(318) 675-2170',
      links: [
        ['Contact page', 'https://www.caddosheriff.org/contact-us.php'],
        ['Sheriff office site', 'https://www.caddosheriff.org/'],
      ],
    },
    {
      label: 'School board',
      name: 'Caddo Parish Public Schools',
      role: 'District and school-board administration',
      address: '1961 Midway Avenue\nShreveport, LA 71108',
      phone: '(318) 603-6300',
      links: [
        ['District site', 'https://www.caddoschools.org/'],
        ['Board members', 'https://www.caddoschools.org/page/board-members'],
      ],
    },
    {
      label: 'Registrar',
      name: 'Dale L. Sibley',
      role: 'Caddo Parish Registrar of Voters',
      address: '525 Marshall Street, Suite 103\nShreveport, LA 71101',
      phone: '(318) 226-6891',
      email: 'CADDOROV@SOS.LA.GOV',
      links: [['Registrar directory', 'https://voterportal.sos.la.gov/registrar']],
    },
    {
      label: 'Library',
      name: 'Shreve Memorial Library',
      role: 'Parish library system support center',
      address: '885 Bert Kouns Industrial Loop\nShreveport, LA 71118',
      phone: '(318) 212-1011',
      links: [['Library site', 'https://www.shreve-lib.org/']],
    },
  ],
  communityOrganizations: [
    {
      label: 'Parish GOP',
      name: 'Republican Party of Caddo Parish',
      role: 'Local parish Republican executive committee',
      person: 'Chairman Matt Kay',
      note:
        'The official site says the group meets for lunch on the first Tuesday of each month from 11:30 AM to 1:00 PM at Superior Grill and publishes updates through its website and Facebook page.',
      links: [['Official site', 'https://www.caddogop.com/']],
    },
  ],
  municipalityNames: CADDO_MUNICIPALITY_NAMES,
  resourceGroups: CADDO_RESOURCE_GROUPS,
};

export async function loadParishIndex() {
  const geojson = await fetchJson('/data/louisiana-parishes.geojson');

  return geojson.features
    .map((feature) => {
      const label = getParishLabel(feature);
      return {
        feature,
        key: getParishKey(label),
        label,
      };
    })
    .sort((left, right) => left.label.localeCompare(right.label));
}

export async function loadParishProfile(parishKey) {
  const key = normalizeKey(parishKey);
  const shouldLoadCaddoDistricts = key === 'caddo';

  const [parishesGeojson, serviceDirectory, commissionGeojson, schoolBoardGeojson] =
    await Promise.all([
      fetchJson('/data/louisiana-parishes.geojson'),
      fetchJson('/data/service-directory.json'),
      shouldLoadCaddoDistricts
        ? fetchJson('/data/caddo-commission.geojson')
        : Promise.resolve(null),
      shouldLoadCaddoDistricts
        ? fetchJson('/data/caddo-school-board.geojson')
        : Promise.resolve(null),
    ]);

  const parishFeature = parishesGeojson.features.find(
    (feature) => getParishKey(getParishLabel(feature)) === key,
  );

  if (!parishFeature) {
    return null;
  }

  const parishLabel = getParishLabel(parishFeature);
  const parishRecord =
    serviceDirectory.parishes.find(
      (record) => getParishKey(record.name) === key,
    ) ?? null;
  const enhancement = key === 'caddo' ? CADDO_PROFILE : null;

  return {
    key,
    label: parishLabel,
    seat: parishRecord?.seat ?? null,
    intro:
      enhancement?.intro ??
      'This parish page is using the official parish and statewide link directory. Caddo is the first parish with an expanded local contact set.',
    featuredContacts: (enhancement?.featuredContacts ??
      buildGenericFeaturedContacts(parishLabel, parishRecord)).map(normalizeCard),
    communityOrganizations: (enhancement?.communityOrganizations ?? []).map(
      normalizeCard,
    ),
    municipalities: enhancement
      ? buildMunicipalityCards(serviceDirectory, enhancement.municipalityNames)
      : [],
    resourceGroups: (enhancement?.resourceGroups ?? buildResourceGroups(
      parishRecord,
      serviceDirectory,
    )).map((group) => ({
      ...group,
      links: buildLinks(group.links),
    })),
    districtGroups: buildDistrictGroups(key, commissionGeojson, schoolBoardGeojson),
    hasEnhancedDirectory: Boolean(enhancement),
  };
}

function buildMunicipalityCards(serviceDirectory, names) {
  return names
    .map((name) =>
      serviceDirectory.municipalities.find((record) => record.name === name),
    )
    .filter(Boolean)
    .map((record) => ({
      label: 'Municipality',
      name: record.name,
      role: `${record.type} government`,
      address: record.address,
      phone: record.phone,
      links: buildLinks([['Municipal directory', record.sourceUrl]]),
    }))
    .map(normalizeCard);
}

function buildDistrictGroups(parishKey, commissionGeojson, schoolBoardGeojson) {
  if (parishKey !== 'caddo') {
    return [];
  }

  const districtGroups = [];

  if (commissionGeojson?.features?.length) {
    districtGroups.push({
      title: 'Caddo Parish Commission Districts',
      description:
        'Each commissioner card links back to the official district page. Emails and mailing addresses come from the published district layer.',
      cards: commissionGeojson.features
        .map((feature) => feature.properties)
        .sort(sortDistrictProperties)
        .map((properties) => ({
          label: 'Commission district',
          name: properties.__districtLabel,
          role: properties.__representative,
          address: properties.__contactAddress,
          email: properties.__contactEmail,
          links: [['Official district page', properties.__officialWebsite]],
        })),
    });
  }

  if (schoolBoardGeojson?.features?.length) {
    districtGroups.push({
      title: 'Caddo School Board Districts',
      description:
        'School-board member cards are driven from the local district layer and the official board-members page.',
      cards: schoolBoardGeojson.features
        .map((feature) => feature.properties)
        .sort(sortDistrictProperties)
        .map((properties) => ({
          label: 'School board district',
          name: properties.__districtLabel,
          role: properties.__representative,
          address: properties.__contactAddress,
          phone: properties.__contactPhone,
          email: properties.__contactEmail,
          links: buildLinks([
            ['Board members', properties.__officialWebsite],
            ['District map', properties.__districtMapUrl],
          ]),
        })),
    });
  }

  return districtGroups;
}

function buildGenericFeaturedContacts(parishLabel, parishRecord) {
  if (!parishRecord) {
    return [];
  }

  return [
    {
      label: 'Parish reference',
      name: parishLabel,
      role: parishRecord.seat
        ? `Parish seat: ${parishRecord.seat}`
        : 'Official parish reference page',
      links: buildLinks([
        ['Parish page', parishRecord.pageUrl],
        ['Local government', parishRecord.linkMap?.localGovernment],
      ]),
      note:
        'This parish still uses the broader official link directory in this build. Caddo is the first fully expanded parish page.',
    },
  ];
}

function buildResourceGroups(parishRecord, serviceDirectory) {
  const specificGroups = (parishRecord?.links ?? [])
    .map((group) => ({
      title: group.label,
      links: (group.links ?? []).filter((link) => link?.label && link?.href),
    }))
    .filter((group) => group.links.length);

  if (specificGroups.length) {
    return specificGroups;
  }

  const statewide = serviceDirectory.statewideLinks ?? {};

  return [
    {
      title: 'Statewide Official Links',
      links: buildLinks([
        ['Office of Motor Vehicles', statewide.omv],
        ['Registrar of voters', statewide.registrar],
        ['Emergency preparedness', statewide.emergencyPreparedness],
        ['Fire protection districts', statewide.fireDistricts],
        ['Justice courts and constables', statewide.justicesOfPeace],
        ['School district information', statewide.schoolDistricts],
        ['Find your legislators', statewide.legislatorLookup],
      ]),
    },
  ];
}

function buildLinks(entries) {
  return entries
    .map((entry) =>
      Array.isArray(entry)
        ? {
            label: entry[0],
            href: entry[1],
          }
        : entry,
    )
    .filter((entry) => entry.label && entry.href);
}

function normalizeCard(card) {
  return {
    ...card,
    links: buildLinks(card.links ?? []),
  };
}

function sortDistrictProperties(left, right) {
  return Number(left.__districtKey) - Number(right.__districtKey);
}

function getParishLabel(feature) {
  return feature.properties.__districtLabel ?? feature.properties.NAME;
}

function getParishKey(label) {
  return normalizeLookupName(label).replace(/parish$/, '');
}

function normalizeKey(value) {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.json();
}
