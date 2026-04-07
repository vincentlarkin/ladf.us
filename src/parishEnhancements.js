function brand(src, alt, variant = 'seal', frame = 'white') {
  return {
    src,
    alt,
    variant,
    frame,
  };
}

function directoryCard(label, name, role, links = [], extras = {}) {
  return {
    label,
    name,
    role,
    links,
    ...extras,
  };
}

function directoryGroup(title, description, groupBrand, cards) {
  return {
    title,
    description,
    brand: groupBrand,
    cards,
  };
}

export const STATEWIDE_OFFICE_BRANDS = {
  clerk: brand(
    '/org-logos/louisiana-clerks-logo.png',
    'Louisiana Clerks of Court mark',
    'wide',
    'white',
  ),
  assessor: brand(
    '/org-logos/louisiana-assessors-logo.jpg',
    'Louisiana Assessors Association logo',
    'wide',
    'white',
  ),
  sheriff: brand(
    '/org-logos/louisiana-sheriffs-logo.jpeg',
    'Louisiana Sheriffs Association logo',
    'square',
    'white',
  ),
};

const CALCASIEU_POLICE_JURY_PAGE =
  'https://www.calcasieu.gov/residents/for-teachers-and-civics-classes/your-police-jurors-hidden';
const CALCASIEU_POLICE_JURY_MAP =
  'https://gisportal.cppj.net/portal/apps/webappviewer/index.html?id=a4dafefd416a4200a19657ddd64ea543';
const CALCASIEU_BOARD_PAGE = 'https://www.cpsb.org/our-district/board';
const CALCASIEU_RPEC_PAGE = 'https://www.swlarepublicans.org/about-us.html';
const CALCASIEU_RPEC_CALENDAR =
  'https://www.swlarepublicans.org/calendar-of-public-community-meetings.html';
const EBR_METRO_COUNCIL_PAGE = 'https://www.brla.gov/1097/Contact-Us';
const EBR_BOARD_PAGE = 'https://ebrschools.org/CAPS/Other_files/board.htm';
const IBERIA_COUNCIL_PAGE = 'https://iberiaparishgovernment.com/parish-council/';
const IBERIA_BOARD_PAGE = 'https://www.iberiaschools.org/126523_2';
const IBERIA_RPEC_PAGE = 'https://www.iberiarepublicans.com/';
const IBERIA_LIBRARY_FRIENDS_PAGE =
  'https://iberialibrary.org/wp/friends-of-the-library/';

const CALCASIEU_PARISH_BRAND = brand(
  '/org-logos/calcasieu-parish-favicon.ico',
  'Calcasieu Parish Police Jury mark',
  'seal',
  'white',
);
const CALCASIEU_CLERK_BRAND = brand(
  '/org-logos/calcasieu-clerk-logo.png',
  'Calcasieu Clerk of Court logo',
  'square',
  'white',
);
const CALCASIEU_SCHOOLS_BRAND = brand(
  '/org-logos/calcasieu-schools-favicon.ico',
  'Calcasieu Parish School Board mark',
  'seal',
  'white',
);
const CALCASIEU_LIBRARY_BRAND = brand(
  '/org-logos/calcasieu-library-logo.png',
  'Calcasieu Parish Public Library logo',
  'seal',
  'white',
);

const EBR_PARISH_BRAND = brand(
  '/org-logos/ebr-parish-logo.png',
  'Baton Rouge / East Baton Rouge Parish mark',
  'square',
  'white',
);
const EBR_CLERK_BRAND = brand(
  '/org-logos/ebr-clerk-logo.png',
  'EBR Clerk of Court logo',
  'wide',
  'white',
);
const EBR_ASSESSOR_BRAND = brand(
  '/org-logos/ebr-assessor-logo.png',
  "East Baton Rouge Parish Assessor's Office logo",
  'wide',
  'white',
);
const EBR_SCHOOLS_BRAND = brand(
  '/org-logos/ebr-schools-logo.png',
  'EBR Schools logo',
  'wide',
  'dark',
);
const EBR_LIBRARY_BRAND = brand(
  '/org-logos/ebr-library-logo.png',
  'East Baton Rouge Parish Library logo',
  'wide',
  'white',
);

const IBERIA_PARISH_BRAND = brand(
  '/org-logos/iberia-parish-logo.png',
  'Iberia Parish Government logo',
  'wide',
  'white',
);
const IBERIA_CLERK_BRAND = brand(
  '/org-logos/iberia-clerk-icon.png',
  'Iberia Parish Clerk of Court mark',
  'seal',
  'white',
);
const IBERIA_ASSESSOR_BRAND = brand(
  '/org-logos/iberia-assessor-seal.png',
  'Iberia Parish Assessor seal',
  'seal',
  'soft',
);
const IBERIA_SCHOOLS_BRAND = brand(
  '/org-logos/iberia-schools-logo.png',
  'Iberia Parish School District logo',
  'seal',
  'white',
);
const IBERIA_LIBRARY_BRAND = brand(
  '/org-logos/iberia-library-logo.png',
  'Iberia Parish Library logo',
  'wide',
  'white',
);
const IBERIA_RPEC_BRAND = brand(
  '/org-logos/iberia-rpec-logo.png',
  'Iberia Parish Republican Executive Committee logo',
  'seal',
  'white',
);

const CALCASIEU_DISTRICT_GROUPS = [
  directoryGroup(
    'Calcasieu Parish Police Jury Districts',
    'Current juror roster published by the Calcasieu Parish Police Jury, with the official district map linked on every card.',
    CALCASIEU_PARISH_BRAND,
    [
      directoryCard('Police jury district', 'Shannon Spell', 'District 1 Juror', [
        ['Official juror roster', CALCASIEU_POLICE_JURY_PAGE],
        ['District map', CALCASIEU_POLICE_JURY_MAP],
      ]),
      directoryCard('Police jury district', 'Linda Monceaux', 'District 2 Juror', [
        ['Official juror roster', CALCASIEU_POLICE_JURY_PAGE],
        ['District map', CALCASIEU_POLICE_JURY_MAP],
      ]),
      directoryCard('Police jury district', 'Anthony Bartie', 'District 3 Juror', [
        ['Official juror roster', CALCASIEU_POLICE_JURY_PAGE],
        ['District map', CALCASIEU_POLICE_JURY_MAP],
      ]),
      directoryCard('Police jury district', 'Mary Morris Pierce', 'District 4 Juror', [
        ['Official juror roster', CALCASIEU_POLICE_JURY_PAGE],
        ['District map', CALCASIEU_POLICE_JURY_MAP],
      ]),
      directoryCard('Police jury district', 'Harry Forest', 'District 5 Juror', [
        ['Official juror roster', CALCASIEU_POLICE_JURY_PAGE],
        ['District map', CALCASIEU_POLICE_JURY_MAP],
      ]),
      directoryCard('Police jury district', 'Joe Andrepont', 'District 6 Juror', [
        ['Official juror roster', CALCASIEU_POLICE_JURY_PAGE],
        ['District map', CALCASIEU_POLICE_JURY_MAP],
      ]),
      directoryCard('Police jury district', 'Hal McMillin', 'District 7 Juror', [
        ['Official juror roster', CALCASIEU_POLICE_JURY_PAGE],
        ['District map', CALCASIEU_POLICE_JURY_MAP],
      ]),
      directoryCard('Police jury district', 'Chris Landry', 'District 8 Juror', [
        ['Official juror roster', CALCASIEU_POLICE_JURY_PAGE],
        ['District map', CALCASIEU_POLICE_JURY_MAP],
      ]),
      directoryCard('Police jury district', 'Kevin Guidry', 'District 9 Juror', [
        ['Official juror roster', CALCASIEU_POLICE_JURY_PAGE],
        ['District map', CALCASIEU_POLICE_JURY_MAP],
      ]),
      directoryCard('Police jury district', 'Greg Hamby', 'District 10 Juror', [
        ['Official juror roster', CALCASIEU_POLICE_JURY_PAGE],
        ['District map', CALCASIEU_POLICE_JURY_MAP],
      ]),
      directoryCard('Police jury district', 'Bill Rase', 'District 11 Juror', [
        ['Official juror roster', CALCASIEU_POLICE_JURY_PAGE],
        ['District map', CALCASIEU_POLICE_JURY_MAP],
      ]),
      directoryCard('Police jury district', 'Tony Stelly', 'District 12 Juror', [
        ['Official juror roster', CALCASIEU_POLICE_JURY_PAGE],
        ['District map', CALCASIEU_POLICE_JURY_MAP],
      ]),
      directoryCard('Police jury district', 'Mike Smith', 'District 13 Juror', [
        ['Official juror roster', CALCASIEU_POLICE_JURY_PAGE],
        ['District map', CALCASIEU_POLICE_JURY_MAP],
      ]),
      directoryCard('Police jury district', 'Keith Bellard', 'District 14 Juror', [
        ['Official juror roster', CALCASIEU_POLICE_JURY_PAGE],
        ['District map', CALCASIEU_POLICE_JURY_MAP],
      ]),
      directoryCard('Police jury district', 'Robin LaFargue', 'District 15 Juror', [
        ['Official juror roster', CALCASIEU_POLICE_JURY_PAGE],
        ['District map', CALCASIEU_POLICE_JURY_MAP],
      ]),
    ],
  ),
  directoryGroup(
    'Calcasieu Parish School Board Members',
    'Board roster and published home phone numbers from the official CPSB board page.',
    CALCASIEU_SCHOOLS_BRAND,
    [
      directoryCard(
        'School board member',
        'Phyllis Ayo',
        'School Board Member',
        [['Official board page', CALCASIEU_BOARD_PAGE]],
        { phone: '(337) 794-8851' },
      ),
      directoryCard(
        'School board member',
        'Shawn Baumgarten',
        'School Board Member',
        [['Official board page', CALCASIEU_BOARD_PAGE]],
        { phone: '(337) 400-0466' },
      ),
      directoryCard(
        'School board member',
        'Billy Breaux',
        'School Board Member',
        [['Official board page', CALCASIEU_BOARD_PAGE]],
        { phone: '(337) 625-9861' },
      ),
      directoryCard(
        'School board member',
        'Russell Castille',
        'School Board Member',
        [['Official board page', CALCASIEU_BOARD_PAGE]],
        { phone: '(337) 526-6064' },
      ),
      directoryCard(
        'School board member',
        'Marye Fontenot',
        'School Board Member',
        [['Official board page', CALCASIEU_BOARD_PAGE]],
        { phone: '(337) 304-2089' },
      ),
      directoryCard(
        'School board member',
        'Glenda Gay',
        'School Board Member',
        [['Official board page', CALCASIEU_BOARD_PAGE]],
        { phone: '(337) 515-5443' },
      ),
      directoryCard(
        'School board member',
        'Damon Hardesty',
        'School Board Member',
        [['Official board page', CALCASIEU_BOARD_PAGE]],
        { phone: '(337) 313-8502' },
      ),
      directoryCard(
        'School board member',
        'Karen Hardy-McReynolds',
        'School Board Member',
        [['Official board page', CALCASIEU_BOARD_PAGE]],
        { phone: '(337) 802-9791' },
      ),
      directoryCard(
        'School board member',
        'Aaron Natali',
        'Board President',
        [['Official board page', CALCASIEU_BOARD_PAGE]],
        { phone: '(337) 540-2695' },
      ),
      directoryCard(
        'School board member',
        "Tony O'Banion",
        'Board Vice President',
        [['Official board page', CALCASIEU_BOARD_PAGE]],
        { phone: '(337) 660-7678' },
      ),
      directoryCard(
        'School board member',
        'Patrick Pichon',
        'School Board Member',
        [['Official board page', CALCASIEU_BOARD_PAGE]],
        { phone: '(337) 764-1474' },
      ),
      directoryCard(
        'School board member',
        'Dean Roberts',
        'School Board Member',
        [['Official board page', CALCASIEU_BOARD_PAGE]],
        { phone: '(337) 515-4724' },
      ),
      directoryCard(
        'School board member',
        'Eric Tarver',
        'School Board Member',
        [['Official board page', CALCASIEU_BOARD_PAGE]],
        { phone: '(337) 965-8095' },
      ),
      directoryCard(
        'School board member',
        'Desmond Wallace',
        'School Board Member',
        [['Official board page', CALCASIEU_BOARD_PAGE]],
        { phone: '(337) 302-6184' },
      ),
      directoryCard(
        'School board member',
        'Betty Washington',
        'School Board Member',
        [['Official board page', CALCASIEU_BOARD_PAGE]],
        { phone: '(337) 526-4774' },
      ),
    ],
  ),
];
const EAST_BATON_ROUGE_DISTRICT_GROUPS = [
  directoryGroup(
    'Metro Council Districts',
    'Current council member names and district phone numbers from Baton Rouge city-parish government.',
    EBR_PARISH_BRAND,
    [
      directoryCard(
        'Metro council district',
        'Brandon Noel',
        'District 1 Council Member',
        [['Official council contacts', EBR_METRO_COUNCIL_PAGE]],
        { phone: '(225) 389-5170' },
      ),
      directoryCard(
        'Metro council district',
        'Anthony Kenney',
        'District 2 Council Member',
        [['Official council contacts', EBR_METRO_COUNCIL_PAGE]],
        { phone: '(225) 389-4699' },
      ),
      directoryCard(
        'Metro council district',
        'Rowdy Gaudet',
        'District 3 Council Member',
        [['Official council contacts', EBR_METRO_COUNCIL_PAGE]],
        { phone: '(225) 389-5162' },
      ),
      directoryCard(
        'Metro council district',
        'Aaron Moak',
        'District 4 Council Member',
        [['Official council contacts', EBR_METRO_COUNCIL_PAGE]],
        { phone: '(225) 389-5166' },
      ),
      directoryCard(
        'Metro council district',
        'Darryl Hurst',
        'District 5 Council Member',
        [['Official council contacts', EBR_METRO_COUNCIL_PAGE]],
        { phone: '(225) 389-5171' },
      ),
      directoryCard(
        'Metro council district',
        'Cleve Dunn Jr.',
        'District 6 Council Member',
        [['Official council contacts', EBR_METRO_COUNCIL_PAGE]],
        { phone: '(225) 389-5165' },
      ),
      directoryCard(
        'Metro council district',
        'Twahna P. Harris',
        'District 7 Council Member',
        [['Official council contacts', EBR_METRO_COUNCIL_PAGE]],
        { phone: '(225) 389-4691' },
      ),
      directoryCard(
        'Metro council district',
        'Denise Amoroso',
        'District 8 Council Member',
        [['Official council contacts', EBR_METRO_COUNCIL_PAGE]],
        { phone: '(225) 389-5168' },
      ),
      directoryCard(
        'Metro council district',
        'Dwight Hudson',
        'District 9 Council Member',
        [['Official council contacts', EBR_METRO_COUNCIL_PAGE]],
        { phone: '(225) 389-4688' },
      ),
      directoryCard(
        'Metro council district',
        'Carolyn Coleman',
        'District 10 Council Member',
        [['Official council contacts', EBR_METRO_COUNCIL_PAGE]],
        { phone: '(225) 389-5140' },
      ),
      directoryCard(
        'Metro council district',
        'Laurie Adams',
        'District 11 Council Member',
        [['Official council contacts', EBR_METRO_COUNCIL_PAGE]],
        { phone: '(225) 389-5169' },
      ),
      directoryCard(
        'Metro council district',
        'Jennifer Racca',
        'District 12 Council Member',
        [['Official council contacts', EBR_METRO_COUNCIL_PAGE]],
        { phone: '(225) 389-4697' },
      ),
    ],
  ),
  directoryGroup(
    'East Baton Rouge Parish School Board',
    'District-by-district school board roster from the official East Baton Rouge Parish School System board page.',
    EBR_SCHOOLS_BRAND,
    [
      directoryCard('School board district', 'Mark Bellue', 'District 1 School Board Member', [
        ['Official board page', EBR_BOARD_PAGE],
      ]),
      directoryCard('School board district', 'Dadrius Lanus', 'District 2 School Board Member', [
        ['Official board page', EBR_BOARD_PAGE],
      ]),
      directoryCard('School board district', 'Carla Powell', 'District 3 School Board Member', [
        ['Official board page', EBR_BOARD_PAGE],
      ]),
      directoryCard(
        'School board district',
        'Shashonnie Steward',
        'District 4 School Board Member',
        [['Official board page', EBR_BOARD_PAGE]],
      ),
      directoryCard('School board district', 'Cliff Lewis', 'District 5 School Board Member', [
        ['Official board page', EBR_BOARD_PAGE],
      ]),
      directoryCard('School board district', 'Nathan Rust', 'District 6 School Board Member', [
        ['Official board page', EBR_BOARD_PAGE],
      ]),
      directoryCard(
        'School board district',
        'Michael Gaudet',
        'District 7 School Board Member',
        [['Official board page', EBR_BOARD_PAGE]],
      ),
      directoryCard('School board district', 'Emily Soule', 'District 8 School Board Member', [
        ['Official board page', EBR_BOARD_PAGE],
      ]),
      directoryCard(
        'School board district',
        'Patrick Martin',
        'District 9 School Board Member',
        [['Official board page', EBR_BOARD_PAGE]],
      ),
    ],
  ),
];
const IBERIA_DISTRICT_GROUPS = [
  directoryGroup(
    'Iberia Parish Council Districts',
    'Current parish council districts, contact information, and council office links pulled from Iberia Parish Government.',
    IBERIA_PARISH_BRAND,
    [
      directoryCard(
        'Parish council district',
        'Francis "Tommy" Pollard, Sr.',
        'District 1 Council Member',
        [['Official council page', IBERIA_COUNCIL_PAGE]],
        {
          address: 'PO Box 13384\nNew Iberia, LA 70562',
          email: 'fpollard@iberiaparishgovernment.com',
          phone: '(337) 339-8898',
        },
      ),
      directoryCard(
        'Parish council district',
        'Michael R. Landry',
        'District 2 Council Member',
        [['Official council page', IBERIA_COUNCIL_PAGE]],
        {
          address: '2305 Agnes Broussard Road\nNew Iberia, LA 70560',
          email: 'mlandry@iberiaparishgovernment.com',
          phone: '(337) 967-0942',
        },
      ),
      directoryCard(
        'Parish council district',
        'Marcus "Bruce" Broussard',
        'District 3 Council Member',
        [['Official council page', IBERIA_COUNCIL_PAGE]],
        {
          address: '713 Mallard Cove\nNew Iberia, LA 70560',
          email: 'mbroussard@iberiaparishgovernment.com',
          phone: '(337) 250-1200',
        },
      ),
      directoryCard(
        'Parish council district',
        'Lloyd Brown',
        'District 4 Council Member',
        [['Official council page', IBERIA_COUNCIL_PAGE]],
        {
          address: '813 Francis Street\nNew Iberia, LA 70560',
          email: 'lbrown@iberiaparishgovernment.com',
          phone: '(337) 280-6377',
        },
      ),
      directoryCard(
        'Parish council district',
        'Warren P. Gachassin, Jr.',
        'District 5 Council Member',
        [['Official council page', IBERIA_COUNCIL_PAGE]],
        {
          address: '809 Briarwood Drive\nNew Iberia, LA 70560',
          email: 'wgachassin@iberiaparishgovernment.com',
          phone: '(337) 256-1460',
        },
      ),
      directoryCard(
        'Parish council district',
        'Natalie Broussard',
        'District 6 Council Member',
        [['Official council page', IBERIA_COUNCIL_PAGE]],
        {
          address: '1803-D E. Main Street\nNew Iberia, LA 70560',
          email: 'nbroussard@iberiaparishgovernment.com',
          phone: '(337) 367-9245',
        },
      ),
      directoryCard(
        'Parish council district',
        'Dustin Suire',
        'District 7 Council Member',
        [['Official council page', IBERIA_COUNCIL_PAGE]],
        {
          address: '306 McIlhenny Street\nNew Iberia, LA 70563',
          email: 'dsuire@iberiaparishgovernment.com',
          phone: '(337) 523-6239',
        },
      ),
      directoryCard(
        'Parish council district',
        'James P. Trahan',
        'District 8 Council Member',
        [['Official council page', IBERIA_COUNCIL_PAGE]],
        {
          address: '101 Estate Drive\nNew Iberia, LA 70563',
          email: 'jtrahan@iberiaparishgovernment.com',
          phone: '(337) 367-8005',
        },
      ),
      directoryCard(
        'Parish council district',
        'Scott Ransonet',
        'District 9 Council Member',
        [['Official council page', IBERIA_COUNCIL_PAGE]],
        {
          address: '8010 Sugar Oaks Road\nNew Iberia, LA 70563',
          email: 'sransonet@iberiaparishgovernment.com',
          phone: '(337) 380-8433',
        },
      ),
      directoryCard(
        'Parish council district',
        'Brock Pellerin',
        'District 10 Council Member',
        [['Official council page', IBERIA_COUNCIL_PAGE]],
        {
          address: '5203 E. Admiral Doyle Drive\nJeanerette, LA 70544',
          email: 'bpellerin@iberiaparishgovernment.com',
          phone: '(337) 380-9347',
        },
      ),
      directoryCard(
        'Parish council district',
        'Brian P. Napier',
        'District 11 Council Member',
        [['Official council page', IBERIA_COUNCIL_PAGE]],
        {
          address: '401 Romona Street\nJeanerette, LA 70544',
          email: 'bnapier@iberiaparishgovernment.com',
          phone: '(337) 519-6059',
        },
      ),
      directoryCard(
        'Parish council district',
        'Lady Fontenette Brown',
        'District 12 Council Member',
        [['Official council page', IBERIA_COUNCIL_PAGE]],
        {
          address: 'P. O. Box 987\nJeanerette, LA 70544',
          email: 'lbrown@iberiaparishgovernment.com',
          phone: '(337) 627-5348',
        },
      ),
      directoryCard(
        'Parish council district',
        'Caymen Crappell',
        'District 13 Council Member',
        [['Official council page', IBERIA_COUNCIL_PAGE]],
        {
          address: '601 S. Railroad Street\nDelcambre, LA 70528',
          email: 'ccrappell@iberiaparishgovernment.com',
          phone: '(337) 339-0502',
        },
      ),
      directoryCard(
        'Parish council district',
        'Chad Maturin',
        'District 14 Council Member',
        [['Official council page', IBERIA_COUNCIL_PAGE]],
        {
          address: '3912 Melancon Road\nBroussard, LA 70518',
          email: 'cmaturin@iberiaparishgovernment.com',
          phone: '(337) 256-3443',
        },
      ),
    ],
  ),
  directoryGroup(
    'Iberia Parish School Board',
    'School board roster from the official Iberia Parish School District board page.',
    IBERIA_SCHOOLS_BRAND,
    [
      directoryCard('School board district', 'Nursey O. McNeal', 'District 1 School Board Member', [
        ['Official board page', IBERIA_BOARD_PAGE],
      ]),
      directoryCard(
        'School board district',
        'Elvin "Dee" Pradia',
        'Past President - District 2',
        [['Official board page', IBERIA_BOARD_PAGE]],
      ),
      directoryCard('School board district', 'Danny D. Segura', 'Executive Committee - District 2', [
        ['Official board page', IBERIA_BOARD_PAGE],
      ]),
      directoryCard('School board district', 'Jesse J. McDonald', 'District 3 School Board Member', [
        ['Official board page', IBERIA_BOARD_PAGE],
      ]),
      directoryCard(
        'School board district',
        'Raymond "Shoe-Do" Lewis',
        'District 4 School Board Member',
        [['Official board page', IBERIA_BOARD_PAGE]],
      ),
      directoryCard('School board district', 'Debra A. Savoie', 'District 5 School Board Member', [
        ['Official board page', IBERIA_BOARD_PAGE],
      ]),
      directoryCard('School board district', 'Mike Mayeux', 'District 6 School Board Member', [
        ['Official board page', IBERIA_BOARD_PAGE],
      ]),
      directoryCard(
        'School board district',
        'Dan L. LeBlanc, Sr.',
        'First Vice President - District 7',
        [['Official board page', IBERIA_BOARD_PAGE]],
      ),
      directoryCard('School board district', 'Brad M. Norris', 'President - District 8', [
        ['Official board page', IBERIA_BOARD_PAGE],
      ]),
      directoryCard('School board district', 'Dana P. Dugas', 'District 9 School Board Member', [
        ['Official board page', IBERIA_BOARD_PAGE],
      ]),
      directoryCard(
        'School board district',
        'Suzette B. Charpentier',
        'District 10 School Board Member',
        [['Official board page', IBERIA_BOARD_PAGE]],
      ),
      directoryCard(
        'School board district',
        'Kathleen B. Rosamond',
        'District 11 School Board Member',
        [['Official board page', IBERIA_BOARD_PAGE]],
      ),
      directoryCard(
        'School board district',
        'Rev. Arthur L. Alexander',
        'District 12 School Board Member',
        [['Official board page', IBERIA_BOARD_PAGE]],
      ),
      directoryCard(
        'School board district',
        'Rachael L. Toups',
        'Second Vice President - District 14',
        [['Official board page', IBERIA_BOARD_PAGE]],
      ),
    ],
  ),
];
const CALCASIEU_COMMUNITY_ORGANIZATIONS = [
  directoryCard(
    'Parish GOP',
    'Calcasieu Republican Parish Executive Committee',
    'Local parish Republican executive committee',
    [
      ['Official site', CALCASIEU_RPEC_PAGE],
      ['Public meetings calendar', CALCASIEU_RPEC_CALENDAR],
    ],
    {
      person: 'Chairman Roby Dyer',
      note:
        'The CRPEC says it has one member from each police jury district plus five at-large members and works alongside the SWLA Republican Roundtable, TARS, Young Republicans, McNeese College Republicans, and Republican Women of Calcasieu Parish.',
    },
  ),
];
const IBERIA_COMMUNITY_ORGANIZATIONS = [
  directoryCard(
    'Parish GOP',
    'Iberia Parish Republican Executive Committee',
    'Local parish Republican executive committee',
    [['Official site', IBERIA_RPEC_PAGE]],
    {
      brand: IBERIA_RPEC_BRAND,
      note:
        'The official Iberia RPEC site says the committee focuses on grassroots organizing, candidate support, fundraising, election oversight, and community engagement across the parish.',
    },
  ),
  directoryCard(
    'Library support',
    'Friends of the Iberia Parish Library',
    'Library support organization',
    [['Friends of the Library', IBERIA_LIBRARY_FRIENDS_PAGE]],
    {
      brand: IBERIA_LIBRARY_BRAND,
      note:
        'The Iberia Parish Library highlights the Friends group as a longtime support organization for programs, collections, and community events.',
    },
  ),
];

export const PARISH_STYLE_ENHANCEMENTS = {
  calcasieu: {
    brand: CALCASIEU_PARISH_BRAND,
    intro:
      'Calcasieu Parish now includes the Police Jury roster, school board roster, municipalities, and local organizing links instead of just a generic statewide office rollup.',
    officeNames: {
      parish: 'Calcasieu Parish Police Jury',
      clerk: 'Calcasieu Clerk of Court',
      schools: 'Calcasieu Parish School Board',
      library: 'Calcasieu Parish Public Library',
    },
    officeBrands: {
      parish: CALCASIEU_PARISH_BRAND,
      clerk: CALCASIEU_CLERK_BRAND,
      schools: CALCASIEU_SCHOOLS_BRAND,
      library: CALCASIEU_LIBRARY_BRAND,
    },
    officeLinks: {
      parish: 'https://www.calcasieu.gov/',
      sheriff: 'https://www.cpso.com/',
      schools: CALCASIEU_BOARD_PAGE,
      library: 'https://www.calcasieulibrary.org/',
    },
    districtGroups: CALCASIEU_DISTRICT_GROUPS,
    communityOrganizations: CALCASIEU_COMMUNITY_ORGANIZATIONS,
  },
  caldwell: {
    officeNames: {
      schools: 'Caldwell Parish School District',
    },
    officeBrands: {
      schools: brand(
        '/org-logos/caldwell-schools-icon.png',
        'Caldwell Parish School District mark',
        'seal',
        'white',
      ),
    },
  },
  cameron: {
    officeNames: {
      parish: 'Parish of Cameron',
      schools: 'Cameron Parish School District',
      library: 'Cameron Parish Library',
    },
    officeBrands: {
      schools: brand(
        '/org-logos/cameron-schools-favicon.ico',
        'Cameron Parish School District mark',
        'seal',
        'white',
      ),
      library: brand(
        '/org-logos/cameron-library-logo.jpg',
        'Cameron Parish Library logo',
        'square',
        'white',
      ),
    },
  },
  catahoula: {
    officeNames: {
      clerk: 'Catahoula Parish Clerk of Court',
      schools: 'Catahoula Parish Schools',
      library: 'Catahoula Parish Library',
    },
    officeBrands: {
      schools: brand(
        '/org-logos/catahoula-schools-logo.png',
        'Catahoula Parish Schools logo',
        'seal',
        'white',
      ),
    },
  },
  claiborne: {
    brand: brand(
      '/org-logos/claiborne-parish-logo.jpg',
      'Claiborne Parish Police Jury logo',
      'wide',
      'white',
    ),
    officeNames: {
      parish: 'Claiborne Parish Police Jury',
      assessor: 'Claiborne Parish Assessor',
      schools: 'Claiborne Parish School District',
      library: 'Claiborne Parish Library',
    },
    officeBrands: {
      parish: brand(
        '/org-logos/claiborne-parish-logo.jpg',
        'Claiborne Parish Police Jury logo',
        'wide',
        'white',
      ),
      assessor: brand(
        '/org-logos/claiborne-assessor-seal.png',
        'Claiborne Parish Assessor seal',
        'seal',
        'soft',
      ),
      schools: brand(
        '/org-logos/claiborne-schools-favicon.ico',
        'Claiborne Parish School District mark',
        'seal',
        'white',
      ),
      library: brand(
        '/org-logos/claiborne-library-logo.png',
        'Claiborne Parish Library logo',
        'wide',
        'white',
      ),
    },
  },
  concordia: {
    brand: brand(
      '/org-logos/concordia-parish-logo.png',
      'Concordia Parish Police Jury logo',
      'square',
      'white',
    ),
    officeNames: {
      parish: 'Concordia Parish Police Jury',
      schools: 'Concordia Parish School Board',
      library: 'Concordia Parish Library',
    },
    officeBrands: {
      parish: brand(
        '/org-logos/concordia-parish-logo.png',
        'Concordia Parish Police Jury logo',
        'square',
        'white',
      ),
      schools: brand(
        '/org-logos/concordia-schools-logo.png',
        'Concordia Parish School Board logo',
        'square',
        'white',
      ),
      library: brand(
        '/org-logos/concordia-library-logo.png',
        'Concordia Parish Library logo',
        'wide',
        'white',
      ),
    },
  },
  desoto: {
    officeNames: {
      clerk: 'DeSoto Parish Clerk of Court',
      assessor: 'DeSoto Parish Assessor',
      schools: 'DeSoto Parish Schools',
      library: 'DeSoto Parish Library',
    },
    officeBrands: {
      clerk: brand(
        '/org-logos/desoto-clerk-logo.png',
        'DeSoto Parish Clerk of Court logo',
        'wide',
        'white',
      ),
      assessor: brand(
        '/org-logos/desoto-assessor-seal.png',
        'DeSoto Parish Assessor seal',
        'square',
        'white',
      ),
      schools: brand(
        '/org-logos/desoto-schools-logo.png',
        'DeSoto Parish Schools logo',
        'wide',
        'white',
      ),
      library: brand(
        '/org-logos/desoto-library-logo.png',
        'DeSoto Parish Library logo',
        'wide',
        'white',
      ),
    },
  },
  eastbatonrouge: {
    brand: EBR_PARISH_BRAND,
    intro:
      'East Baton Rouge Parish now includes Metro Council districts, the school board district roster, municipalities, and the main parish office links in one compact page.',
    officeNames: {
      parish: 'Baton Rouge / Parish of East Baton Rouge',
      clerk: 'EBR Clerk of Court',
      assessor: "East Baton Rouge Parish Assessor's Office",
      schools: 'EBR Schools',
      library: 'East Baton Rouge Parish Library',
    },
    officeBrands: {
      parish: EBR_PARISH_BRAND,
      clerk: EBR_CLERK_BRAND,
      assessor: EBR_ASSESSOR_BRAND,
      schools: EBR_SCHOOLS_BRAND,
      library: EBR_LIBRARY_BRAND,
    },
    officeLinks: {
      parish: 'https://www.brla.gov/',
      sheriff: 'https://www.ebrso.org/',
      schools: EBR_BOARD_PAGE,
      library: 'https://www.ebrpl.com/',
    },
    districtGroups: EAST_BATON_ROUGE_DISTRICT_GROUPS,
  },
  eastcarroll: {
    officeNames: {
      schools: 'East Carroll Parish School District',
    },
  },
  eastfeliciana: {
    officeNames: {
      assessor: 'East Feliciana Parish Assessor',
      schools: 'East Feliciana Public Schools',
      library: 'Audubon Regional Library',
    },
    officeBrands: {
      assessor: brand(
        '/org-logos/ef-assessor-logo.png',
        'East Feliciana Parish Assessor logo',
        'square',
        'white',
      ),
      schools: brand(
        '/org-logos/ef-schools-logo.jpg',
        'East Feliciana Public Schools logo',
        'wide',
        'white',
      ),
      library: brand(
        '/org-logos/audubon-library-logo.png',
        'Audubon Regional Library logo',
        'wide',
        'white',
      ),
    },
  },
  evangeline: {
    brand: brand(
      '/org-logos/evangeline-parish-logo.jpg',
      'Evangeline Parish Police Jury mark',
      'seal',
      'white',
    ),
    officeNames: {
      parish: 'Evangeline Parish Police Jury',
      clerk: 'Evangeline Parish Clerk of Court',
      schools: 'Evangeline Parish School District',
      library: 'Evangeline Parish Library',
    },
    officeBrands: {
      parish: brand(
        '/org-logos/evangeline-parish-logo.jpg',
        'Evangeline Parish Police Jury mark',
        'seal',
        'white',
      ),
      clerk: brand(
        '/org-logos/evangeline-clerk-logo.svg',
        'Evangeline Parish Clerk of Court logo',
        'wide',
        'white',
      ),
      schools: brand(
        '/org-logos/evangeline-schools-logo.png',
        'Evangeline Parish School District logo',
        'wide',
        'white',
      ),
      library: brand(
        '/org-logos/evangeline-library-logo.png',
        'Evangeline Parish Library logo',
        'seal',
        'white',
      ),
    },
  },
  franklin: {
    officeNames: {
      clerk: 'Franklin Parish Clerk of Court',
      schools: 'Franklin Parish School Board',
      library: 'Franklin Parish Library',
    },
    officeBrands: {
      schools: brand(
        '/org-logos/franklin-schools-logo.png',
        'Franklin Parish School Board logo',
        'wide',
        'white',
      ),
      library: brand(
        '/org-logos/franklin-library-logo.png',
        'Franklin Parish Library logo',
        'wide',
        'white',
      ),
    },
  },
  grant: {
    brand: brand(
      '/org-logos/grant-parish-logo.jpg',
      'Grant Parish Police Jury mark',
      'seal',
      'white',
    ),
    officeNames: {
      parish: 'Grant Parish Police Jury',
      clerk: 'Grant Parish Clerk of Court',
      schools: 'Grant Parish School Board',
      library: 'Grant Parish Library',
    },
    officeBrands: {
      parish: brand(
        '/org-logos/grant-parish-logo.jpg',
        'Grant Parish Police Jury mark',
        'seal',
        'white',
      ),
    },
  },
  iberia: {
    brand: IBERIA_PARISH_BRAND,
    intro:
      'Iberia Parish now includes the full parish council roster, school board roster, municipalities, and local organization links instead of a thin statewide placeholder.',
    officeNames: {
      parish: 'Iberia Parish Government',
      clerk: 'Iberia Parish Clerk of Court',
      assessor: 'Iberia Parish Assessor',
      schools: 'Iberia Parish School District',
      library: 'Iberia Parish Library',
    },
    officeBrands: {
      parish: IBERIA_PARISH_BRAND,
      clerk: IBERIA_CLERK_BRAND,
      assessor: IBERIA_ASSESSOR_BRAND,
      schools: IBERIA_SCHOOLS_BRAND,
      library: IBERIA_LIBRARY_BRAND,
    },
    officeLinks: {
      parish: 'http://www.iberiaparishgovernment.com/',
      sheriff: 'https://www.iberiaso.org/',
      schools: IBERIA_BOARD_PAGE,
      library: 'https://iberialibrary.org/wp/',
    },
    districtGroups: IBERIA_DISTRICT_GROUPS,
    communityOrganizations: IBERIA_COMMUNITY_ORGANIZATIONS,
  },
};
