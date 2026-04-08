import { normalizeLookupName } from './locationLookup.js';
import {
  PARISH_STYLE_ENHANCEMENTS,
  STATEWIDE_OFFICE_BRANDS,
} from './parishEnhancements.js';

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

const CADDO_BRANDS = {
  parish: {
    src: '/org-logos/caddo-parish-crest.png',
    alt: 'Parish of Caddo crest',
    variant: 'seal',
    frame: 'soft',
  },
  clerk: {
    src: '/org-logos/caddo-clerk-title.jpg',
    alt: 'Caddo Parish Clerk of Court',
    variant: 'wide',
    frame: 'white',
  },
  assessor: {
    src: '/org-logos/louisiana-state-seal.png',
    alt: 'Louisiana state seal',
    variant: 'seal',
    frame: 'soft',
  },
  sheriff: {
    src: '/org-logos/caddo-sheriff-logo.png',
    alt: "Caddo Parish Sheriff's Office",
    variant: 'wide',
    frame: 'white',
  },
  schools: {
    src: '/org-logos/caddo-schools-star.png',
    alt: 'Caddo Parish Public Schools mark',
    variant: 'seal',
    frame: 'soft',
  },
  registrar: {
    src: '/org-logos/louisiana-sos-seal.png',
    alt: 'Louisiana Secretary of State seal',
    variant: 'seal',
    frame: 'soft',
  },
  library: {
    src: '/org-logos/shreve-memorial-library.ico',
    alt: 'Shreve Memorial Library mark',
    variant: 'seal',
    frame: 'white',
  },
  gop: {
    src: '/org-logos/caddo-gop-badge.png',
    alt: 'Republican Party of Caddo Parish logo',
    variant: 'seal',
    frame: 'white',
  },
};

const GENERIC_BRANDS = {
  official: {
    src: '/org-logos/louisiana-state-seal.png',
    alt: 'Louisiana state seal',
    variant: 'seal',
    frame: 'soft',
  },
  registrar: {
    src: '/org-logos/louisiana-sos-seal.png',
    alt: 'Louisiana Secretary of State seal',
    variant: 'seal',
    frame: 'soft',
  },
  clerk: STATEWIDE_OFFICE_BRANDS.clerk,
  assessor: STATEWIDE_OFFICE_BRANDS.assessor,
  sheriff: STATEWIDE_OFFICE_BRANDS.sheriff,
};

const CADDO_PROFILE = {
  brand: CADDO_BRANDS.parish,
  intro:
    'Caddo Parish includes parish government, core offices, local district rosters, municipalities inside the parish, and the parish GOP in one directory.',
  featuredContacts: [
    {
      label: 'Parish government',
      name: 'Caddo Parish Commission',
      role: 'Legislative body for parish policy, budgets, and ordinances',
      brand: CADDO_BRANDS.parish,
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
      brand: CADDO_BRANDS.parish,
      address: '505 Travis Street, Government Plaza\nShreveport, LA 71101',
      phone: '(318) 226-6596',
      email: 'jeverson@caddo.org',
      links: [['Clerk profile', 'https://caddo.gov/portfolio-item/jeff-everson/']],
    },
    {
      label: 'Clerk of court',
      name: 'Mike Spence',
      role: 'Caddo Parish Clerk of Court',
      brand: CADDO_BRANDS.clerk,
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
      brand: CADDO_BRANDS.assessor,
      address: '501 Texas Street, Room 102\nShreveport, LA 71101',
      phone: '(318) 226-6704',
      email: 'info@caddoassessor.org',
      links: [['Official site', 'https://www.caddoassessor.org/']],
    },
    {
      label: 'Sheriff',
      name: 'Henry Whitehorn, Sr.',
      role: "Caddo Parish Sheriff",
      brand: CADDO_BRANDS.sheriff,
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
      brand: CADDO_BRANDS.schools,
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
      brand: CADDO_BRANDS.registrar,
      address: '525 Marshall Street, Suite 103\nShreveport, LA 71101',
      phone: '(318) 226-6891',
      email: 'CADDOROV@SOS.LA.GOV',
      links: [['Registrar directory', 'https://voterportal.sos.la.gov/registrar']],
    },
    {
      label: 'Library',
      name: 'Shreve Memorial Library',
      role: 'Parish library system support center',
      brand: CADDO_BRANDS.library,
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
      brand: CADDO_BRANDS.gop,
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

  const [
    parishesGeojson,
    serviceDirectory,
    generatedEnhancements,
    commissionGeojson,
    schoolBoardGeojson,
  ] =
    await Promise.all([
      fetchJson('/data/louisiana-parishes.geojson'),
      fetchJson('/data/service-directory.json'),
      fetchJsonOrDefault('/data/parish-enhancements.json', { parishes: {} }),
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
  const styleEnhancement = mergeEnhancements(
    generatedEnhancements.parishes?.[key] ?? null,
    PARISH_STYLE_ENHANCEMENTS[key] ?? null,
  );
  const municipalityNames = mergeUniqueNames(
    parishRecord?.municipalityNames ?? [],
    enhancement?.municipalityNames ?? [],
    styleEnhancement?.municipalityNames ?? [],
  );

  return {
    key,
    label: parishLabel,
    brand: normalizeBrand(
      enhancement?.brand ??
        styleEnhancement?.brand ??
        styleEnhancement?.officeBrands?.parish ??
        GENERIC_BRANDS.official,
    ),
    seat: parishRecord?.seat ?? null,
    intro:
      enhancement?.intro ??
      styleEnhancement?.intro ??
      buildGenericIntro(parishLabel, parishRecord, municipalityNames),
    featuredContacts: (enhancement?.featuredContacts ??
      styleEnhancement?.featuredContacts ??
      buildGenericFeaturedContacts(
        parishLabel,
        parishRecord,
        serviceDirectory,
        styleEnhancement,
      ))
      .map(normalizeCard)
      .filter(hasUsefulCardContent),
    communityOrganizations: (
      enhancement?.communityOrganizations ??
      styleEnhancement?.communityOrganizations ??
      []
    ).map(
      normalizeCard,
    ),
    municipalities: buildMunicipalityCards(serviceDirectory, municipalityNames),
    resourceGroups: (
      enhancement?.resourceGroups ??
      styleEnhancement?.resourceGroups ??
      buildResourceGroups(parishRecord, serviceDirectory)
    ).map((group) => ({
      ...group,
      title: sanitizeText(group.title),
      links: buildLinks(group.links),
    })),
    districtGroups: (
      enhancement?.districtGroups ??
      styleEnhancement?.districtGroups ??
      buildDistrictGroups(key, commissionGeojson, schoolBoardGeojson)
    ).map((group) => ({
      ...group,
      title: sanitizeText(group.title),
      description: sanitizeText(group.description),
      brand: normalizeBrand(group.brand ?? null),
      cards: (group.cards ?? []).map(normalizeCard),
    })),
    hasEnhancedDirectory: Boolean(
      enhancement ||
        styleEnhancement ||
        parishRecord?.links?.length ||
        municipalityNames.length,
    ),
  };
}

function buildMunicipalityCards(serviceDirectory, names) {
  return names
    .map((name) => {
      const record = findMunicipalityRecord(serviceDirectory, name);
      const serviceLookupLink = `/services.html?lookup=${encodeURIComponent(
        `${name}, LA`,
      )}`;
      if (!record) {
        return {
          label: 'Municipality',
          name,
          role: 'Municipality listed in the parish boundary data',
          links: buildLinks([['Service lookup', serviceLookupLink]]),
        };
      }

      return {
        label: 'Municipality',
        name: record.name,
        role: formatMunicipalityGovernmentLabel(record.type),
        person: getMunicipalityLead(record),
        address: record.address,
        phone: record.phone,
        links: buildLinks([
          ['Municipal directory', record.sourceUrl],
          ['Service lookup', serviceLookupLink],
        ]),
      };
    })
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
      brand: CADDO_BRANDS.parish,
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
      brand: CADDO_BRANDS.schools,
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

function buildGenericIntro(parishLabel, parishRecord, municipalityNames) {
  const municipalityCount = municipalityNames.length;

  if (!parishRecord) {
    return `This page is a placeholder for ${parishLabel} while the statewide parish directory is still loading official office links.`;
  }

  if (municipalityCount) {
    return `${parishLabel} now uses the official Louisiana parish directory plus the municipal list published on the state parish page, so the core offices and incorporated places in this parish are all on one screen.`;
  }

  return `${parishLabel} now uses the official Louisiana parish directory for its core office links, with statewide fallback resources grouped below for the services people use most often.`;
}

function buildGenericFeaturedContacts(
  parishLabel,
  parishRecord,
  serviceDirectory,
  styleEnhancement = null,
) {
  if (!parishRecord) {
    return [];
  }

  const statewide = serviceDirectory.statewideLinks ?? {};
  const parishBase = stripParishSuffix(parishLabel);
  const parishGovernmentLink = getOfficeLink(
    styleEnhancement,
    'parish',
    parishRecord.linkMap?.localGovernment,
  );
  const assessorLink = getOfficeLink(
    styleEnhancement,
    'assessor',
    parishRecord.linkMap?.assessor,
  );
  const clerkLink = getOfficeLink(
    styleEnhancement,
    'clerk',
    parishRecord.linkMap?.clerk,
  );
  const registrarLink = getOfficeLink(
    styleEnhancement,
    'registrar',
    parishRecord.linkMap?.registrar,
  );
  const schoolLink = getOfficeLink(
    styleEnhancement,
    'schools',
    parishRecord.linkMap?.schools,
  );
  const libraryLink = getOfficeLink(
    styleEnhancement,
    'library',
    parishRecord.linkMap?.library,
  );
  const sheriffLink = getOfficeLink(
    styleEnhancement,
    'sheriff',
    parishRecord.linkMap?.sheriff ?? statewide.sheriffDirectory,
  );

  const cards = [
    {
      label: 'Parish government',
      name: getOfficeName(styleEnhancement, 'parish', parishLabel),
      role: parishRecord.seat
        ? `Parish seat: ${parishRecord.seat}`
        : 'Official parish reference page',
      brand: getOfficeBrand(
        styleEnhancement,
        'parish',
        GENERIC_BRANDS.official,
      ),
      links: buildLinks([
        ['Parish page', parishRecord.pageUrl],
        ['Local government', parishGovernmentLink],
      ]),
      note:
        'Official parish office links pulled from the Louisiana local-government directory.',
    },
    {
      label: 'Assessor',
      name: getOfficeName(
        styleEnhancement,
        'assessor',
        `${parishBase} Parish Assessor`,
      ),
      role: 'Property assessment and parcel records',
      brand: getOfficeBrand(
        styleEnhancement,
        'assessor',
        GENERIC_BRANDS.assessor,
      ),
      links: buildLinks([['Assessor office', assessorLink]]),
    },
    {
      label: 'Clerk of court',
      name: getOfficeName(
        styleEnhancement,
        'clerk',
        `${parishBase} Parish Clerk of Court`,
      ),
      role: 'Court filings, land records, and clerk services',
      brand: getOfficeBrand(
        styleEnhancement,
        'clerk',
        GENERIC_BRANDS.clerk,
      ),
      links: buildLinks([['Clerk of court', clerkLink]]),
    },
    {
      label: 'Registrar',
      name: getOfficeName(
        styleEnhancement,
        'registrar',
        `${parishBase} Parish Registrar of Voters`,
      ),
      role: 'Voter registration and election records',
      brand: getOfficeBrand(
        styleEnhancement,
        'registrar',
        GENERIC_BRANDS.registrar,
      ),
      links: buildLinks([
        ['Registrar of voters', registrarLink],
        ['Voting portal', statewide.voterPortal],
      ]),
    },
    {
      label: 'School district',
      name: getOfficeName(
        styleEnhancement,
        'schools',
        `${parishBase} Parish Schools`,
      ),
      role: 'Official school district information for this parish',
      brand: getOfficeBrand(
        styleEnhancement,
        'schools',
        GENERIC_BRANDS.official,
      ),
      links: buildLinks([['School district information', schoolLink]]),
    },
    {
      label: 'Library',
      name: getOfficeName(
        styleEnhancement,
        'library',
        `${parishBase} Parish Library`,
      ),
      role: 'Main parish library reference',
      brand: getOfficeBrand(
        styleEnhancement,
        'library',
        GENERIC_BRANDS.official,
      ),
      links: buildLinks([['Library main branch', libraryLink]]),
    },
    {
      label: 'Sheriff',
      name: getOfficeName(
        styleEnhancement,
        'sheriff',
        `${parishBase} Parish Sheriff's Office`,
      ),
      role: 'Parish sheriff office contact path',
      brand: getOfficeBrand(
        styleEnhancement,
        'sheriff',
        GENERIC_BRANDS.sheriff,
      ),
      links: buildLinks([["Sheriff's office", sheriffLink]]),
    },
  ];

  return cards.filter((card) => card.links?.length);
}

function getOfficeName(styleEnhancement, officeKey, fallback) {
  return sanitizeText(styleEnhancement?.officeNames?.[officeKey], fallback);
}

function getOfficeBrand(styleEnhancement, officeKey, fallbackBrand) {
  return styleEnhancement?.officeBrands?.[officeKey] ?? fallbackBrand;
}

function getOfficeLink(styleEnhancement, officeKey, fallbackLink) {
  return sanitizeHref(styleEnhancement?.officeLinks?.[officeKey]) || fallbackLink;
}

function stripParishSuffix(value) {
  return sanitizeText(value).replace(/\s+Parish$/i, '');
}

function findMunicipalityRecord(serviceDirectory, name) {
  const lookupKeys = buildMunicipalityLookupKeys(name);
  return (
    serviceDirectory.municipalities.find((record) =>
      lookupKeys.includes(record.normalizedName),
    ) ?? null
  );
}

function buildMunicipalityLookupKeys(name) {
  const raw = sanitizeText(name);
  const variants = new Set();

  if (!raw) {
    return [];
  }

  variants.add(normalizeLookupName(raw));
  variants.add(
    normalizeLookupName(
      raw.replace(/\b(city|town|village|municipality|parish)\b/gi, ' '),
    ),
  );

  if (/ city$/i.test(raw) && !/bossier city$/i.test(raw)) {
    variants.add(normalizeLookupName(raw.replace(/\s+city$/i, '')));
  }

  return [...variants].filter(Boolean);
}

function getMunicipalityLead(record) {
  const mayor =
    record.serviceContacts?.administration?.find((entry) =>
      /mayor/i.test(entry.title),
    ) ?? null;
  const clerk = record.serviceContacts?.clerk?.[0] ?? null;
  const administration = record.serviceContacts?.administration?.[0] ?? null;

  return mayor?.fullText ?? clerk?.fullText ?? administration?.fullText ?? '';
}

function formatMunicipalityGovernmentLabel(type) {
  const value = sanitizeText(type).toLowerCase();
  if (!value) {
    return 'Municipal government';
  }

  return `${value.charAt(0).toUpperCase()}${value.slice(1)} government`;
}

function mergeUniqueNames(primary, secondary) {
  const values = [...primary, ...secondary].map((value) => sanitizeText(value));
  const seen = new Set();

  return values.filter((value) => {
    if (!value) {
      return false;
    }

    const key = normalizeLookupName(value);
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function hasUsefulCardContent(card) {
  return Boolean(
    card.links?.length || card.phone || card.email || card.address || card.note,
  );
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
    .map((entry) => ({
      label: sanitizeText(entry?.label),
      href: sanitizeHref(entry?.href),
    }))
    .filter((entry) => entry.label && entry.href);
}

function normalizeCard(card) {
  return {
    ...card,
    label: sanitizeText(card.label, 'Directory'),
    name: sanitizeText(card.name, sanitizeText(card.label, 'Directory')),
    role: sanitizeText(card.role),
    person: sanitizeText(card.person),
    address: sanitizeText(card.address),
    phone: sanitizeText(card.phone),
    email: sanitizeText(card.email),
    note: sanitizeText(card.note),
    links: buildLinks(card.links ?? []),
    brand: normalizeBrand(card.brand ?? null),
  };
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
    alt: sanitizeText(brand.alt),
    variant: sanitizeText(brand.variant, 'seal'),
    frame: sanitizeText(brand.frame, 'white'),
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

function sanitizeText(value, fallback = '') {
  const text = String(value ?? '').trim();
  if (!text || text === 'undefined' || text === 'null') {
    return fallback;
  }

  return text;
}

function sanitizeHref(value) {
  const href = sanitizeText(value);
  if (!href) {
    return '';
  }

  if (href.startsWith('/')) {
    return href;
  }

  try {
    const url = new URL(href);
    if (['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol)) {
      return url.toString();
    }
  } catch (error) {
    return '';
  }

  return '';
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

function mergeEnhancements(base, override) {
  if (!base && !override) {
    return null;
  }

  return {
    ...(base ?? {}),
    ...(override ?? {}),
    officeNames: {
      ...(base?.officeNames ?? {}),
      ...(override?.officeNames ?? {}),
    },
    officeBrands: {
      ...(base?.officeBrands ?? {}),
      ...(override?.officeBrands ?? {}),
    },
    officeLinks: {
      ...(base?.officeLinks ?? {}),
      ...(override?.officeLinks ?? {}),
    },
    municipalityNames:
      override?.municipalityNames ?? base?.municipalityNames ?? undefined,
    featuredContacts:
      override?.featuredContacts ?? base?.featuredContacts ?? undefined,
    communityOrganizations:
      override?.communityOrganizations ??
      base?.communityOrganizations ??
      undefined,
    districtGroups: override?.districtGroups ?? base?.districtGroups ?? undefined,
    resourceGroups: override?.resourceGroups ?? base?.resourceGroups ?? undefined,
  };
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.json();
}

async function fetchJsonOrDefault(url, fallback) {
  try {
    return await fetchJson(url);
  } catch (error) {
    return fallback;
  }
}
