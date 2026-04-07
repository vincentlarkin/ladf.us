# LADF Website

`ladf.us` is a Vite-powered static site for the Louisiana Data & Defense Foundation (LADF), a Louisiana civic information and education project. It ships with a parish-first map interface, synced public GIS data, launch-ready homepage content, and a first expanded parish directory for Caddo Parish.

## What is included

- Separate home page, parish map at `/map.html`, and parish directory pages at `/parish.html?parish=...`
- Dedicated service-routing lookup at `/services.html` for ZIP, city, or address searches
- Statewide Louisiana parish selection map covering all 64 parishes
- Dedicated parish directory page that can be expanded parish by parish
- First enriched parish page for Caddo with parish offices, district rosters, municipal contacts, and parish GOP link
- Statewide municipality and parish service-directory data for routing water, public works, permits, and parish office questions

## Prerequisites

- Node.js 20+ or 22+
- npm
- Internet access when running `npm run sync:data` because the layer files are generated from public sources

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Sync the GIS files into `public/data`:

```bash
npm run sync:data
```

3. Start the local dev server:

```bash
npm run dev
```

4. Open the localhost URL printed by Vite.
   The parish map lives at `/map.html`.
   Parish pages live at `/parish.html?parish=caddo`.
   The service-routing lookup lives at `/services.html`.

## Build for production

Generate a production bundle from the checked-in data files:

```bash
npm run build
```

If you want to pull fresh public GIS data first:

```bash
npm run build:refresh
```

Preview the built site locally:

```bash
npm run preview
```

## Refreshing the map data

Run this any time you want to pull the latest public boundary files:

```bash
npm run sync:data
```

The sync script is at `scripts/sync-district-data.mjs` and writes normalized GeoJSON plus a manifest into `public/data`.

The statewide service-directory sync script is at `scripts/sync-service-directory.mjs` and writes municipality/parish service routing data to `public/data/service-directory.json`.

## Static hosting

This project already builds to static files.

After `npm run build`, you can deploy the contents of `dist/` to any static host that can serve HTML, JavaScript, CSS, JSON, and image files.

Examples:

- Netlify
- Cloudflare Pages
- GitHub Pages
- An ordinary Nginx or Apache vhost
- Any CDN or object-storage bucket configured for static site hosting

No Node server is required in production once the build is finished.

## Docker

Docker is optional. It only packages the static `dist/` output behind Nginx.

Build the container image:

```bash
docker build -t ladf-us .
```

Run it on port `3911`:

```bash
docker run --rm -p 3911:3911 ladf-us
```

Then open [http://localhost:3911](http://localhost:3911).

If you prefer Docker Compose:

```bash
docker compose up --build
```

The included Compose service is named `ladf_web` and serves the static site on port `3911`.

## Reverse proxy

An external Nginx reverse-proxy template is included at `docker/ladf.us.conf`.

- Upstream container: `ladf_web`
- Upstream port: `3911`
- Domain names: `ladf.us` and `www.ladf.us`

Update the SSL certificate paths in that file to match your host before enabling it.

## Notes

- The Docker build does not resync data automatically. It uses the data already committed in `public/data`.
- Run `npm run sync:data` or `npm run build:refresh` only when you intentionally want to refresh the underlying public datasets.
- Caddo is currently the first parish with an expanded local directory page; other parishes currently use the official parish and statewide link directory until more local pages are added.
