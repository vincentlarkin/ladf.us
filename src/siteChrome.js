const PAGE_LINKS = [
  { key: 'home', label: 'Home', href: '/index.html' },
  { key: 'map', label: 'Parish Map', href: '/map.html' },
  { key: 'services', label: 'Services by ZIP', href: '/services.html' },
];

export function renderSiteHeader({ activePage = null } = {}) {
  return `
    <header class="site-header">
      <div class="site-trust-strip" role="note" aria-label="Site identity">
        <div class="site-trust-strip__inner">
          <span class="site-trust-strip__badge">LADF</span>
          <span>Louisiana Data Force</span>
          <span class="site-trust-strip__sep" aria-hidden="true">|</span>
          <span>Independent, not a government website</span>
        </div>
      </div>
      <div class="site-header__inner">
        <a class="brand" href="/index.html">
          <span class="brand__crest">LA</span>
          <span class="brand__text">
            <span class="brand__name">LADF</span>
            <span class="brand__descriptor">Louisiana Data Force</span>
          </span>
        </a>
        <nav class="site-primary-nav" aria-label="Main">
          <ul class="site-primary-nav__list">
            ${PAGE_LINKS.map((page) => renderHeaderLink(page, activePage)).join('')}
          </ul>
        </nav>
      </div>
    </header>
  `;
}

export function renderSidebar({ sections = [] } = {}) {
  const sectionMarkup = sections
    .filter((section) => section?.href && section?.label)
    .map(
      (section) => `
        <li>
          <a class="nav__link nav__link--section" href="${escapeAttribute(section.href)}">
            ${escapeHtml(section.label)}
          </a>
        </li>
      `,
    )
    .join('');

  if (!sectionMarkup) {
    return '';
  }

  return `
    <aside class="sidebar" data-sidebar>
      <div class="sidebar__controls">
        <button
          class="sidebar__toggle"
          type="button"
          data-sidebar-toggle
          aria-expanded="true"
          aria-controls="site-sidebar-nav"
          aria-label="Hide sidebar menu"
        >
          <span class="sidebar__toggle-icon" aria-hidden="true"></span>
          <span data-sidebar-toggle-label>Hide Menu</span>
        </button>
      </div>

      <nav class="nav" id="site-sidebar-nav" aria-label="On This Page">
        <div class="nav__group nav__group--sections">
          <div class="nav__title">On This Page</div>
          <ul class="nav__list nav__list--sections">
            ${sectionMarkup}
          </ul>
        </div>
      </nav>
    </aside>
  `;
}

export function bindSiteChrome() {
  const page = document.querySelector('.page');
  const sidebar = document.querySelector('[data-sidebar]');
  const toggle = document.querySelector('[data-sidebar-toggle]');
  const toggleLabel = document.querySelector('[data-sidebar-toggle-label]');

  if (!page || !sidebar || !toggle) {
    return;
  }

  const storageKey = 'ladf-sidebar-collapsed';

  const applyState = (collapsed) => {
    page.classList.toggle('page--sidebar-collapsed', collapsed);
    toggle.setAttribute('aria-expanded', String(!collapsed));
    toggle.setAttribute(
      'aria-label',
      collapsed ? 'Show sidebar menu' : 'Hide sidebar menu',
    );

    if (toggleLabel) {
      toggleLabel.textContent = collapsed ? 'Show Menu' : 'Hide Menu';
    }
  };

  let collapsed = false;

  try {
    collapsed = window.localStorage.getItem(storageKey) === 'true';
  } catch (error) {
    collapsed = false;
  }

  applyState(collapsed);

  toggle.addEventListener('click', () => {
    collapsed = !page.classList.contains('page--sidebar-collapsed');
    applyState(collapsed);

    try {
      window.localStorage.setItem(storageKey, String(collapsed));
    } catch (error) {
      console.warn('Could not persist sidebar state.', error);
    }
  });
}

export function renderBreadcrumb(items = []) {
  const breadcrumbItems = items
    .filter((item) => item?.label)
    .map((item) =>
      item.href
        ? `<a href="${escapeAttribute(item.href)}">${escapeHtml(item.label)}</a>`
        : `<span>${escapeHtml(item.label)}</span>`,
    )
    .join('<span class="breadcrumb__sep">/</span>');

  return `
    <nav class="breadcrumb" aria-label="Breadcrumb">
      ${breadcrumbItems}
    </nav>
  `;
}

export function renderSiteFooter() {
  return `
    <footer class="site-footer">
      <div class="site-footer__inner">
        <span class="flag-glyph">LA</span>
        <span>Louisiana Data Force &mdash; parish, city, and service links in one place.</span>
        <span class="site-footer__sep" aria-hidden="true">&middot;</span>
        <span>Always verify details with the office you need.</span>
        <span class="site-footer__sep" aria-hidden="true">&middot;</span>
        <span><a href="/map.html">Parish Map</a></span>
        <span><a href="/services.html">Services by ZIP</a></span>
      </div>
    </footer>
  `;
}

function renderPageLink(page, activePage) {
  const isActive = page.key === activePage;
  return `
    <li>
      <a
        class="nav__link nav__link--page${isActive ? ' is-active' : ''}"
        href="${escapeAttribute(page.href)}"
      >
        ${escapeHtml(page.label)}
      </a>
    </li>
  `;
}

function renderHeaderLink(page, activePage) {
  const isActive = page.key === activePage;
  return `
    <li>
      <a
        class="site-primary-nav__link${isActive ? ' is-active' : ''}"
        href="${escapeAttribute(page.href)}"
      >
        ${escapeHtml(page.label)}
      </a>
    </li>
  `;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeAttribute(value) {
  return escapeHtml(value);
}
