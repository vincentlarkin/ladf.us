# LADF Website

`ladf.us` is a Vite-powered static site for the Louisiana Data & Defense Foundation (LADF), a Louisiana civic information and education project. It ships with a district map interface, synced public GIS data, launch-ready homepage content, and a first local overlap stack for Caddo Parish and Shreveport.

## What is included

- Separate home page and dedicated full-size map page at `/map.html`
- Statewide Louisiana outline, parishes, House, Senate, and congressional districts
- Municipal boundary reference layer for Louisiana cities and towns
- Local Caddo / Shreveport stack for city council, parish commission, and school board districts
- Address search, geolocation, hover inspection, click-to-pin lookup, and city jump presets

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
   The map tool lives at `/map.html`.

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

## Docker

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

- The Docker build does not resync data automatically. It uses the GeoJSON already committed in `public/data`.
- Run `npm run sync:data` or `npm run build:refresh` only when you intentionally want to refresh the underlying public datasets.
- Local municipal district coverage is currently strongest in Shreveport / Caddo; other cities currently use statewide municipal boundary reference plus state/parish/federal overlays until more official city GIS feeds are added.
