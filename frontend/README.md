# AI Security Vendor Logbook — front end

A Vite + React front end for the AI Security taxonomy. At load time it fetches
the live published feed from this repo:

```
https://raw.githubusercontent.com/madgeenger-stack/ai-security-taxonomy-feed/refs/heads/main/vendors.json
```

so it always reflects the latest merged sweep — no rebuild needed when the
data changes.

## Hosting on GitHub Pages

`.github/workflows/deploy-pages.yml` builds the app and publishes it to
GitHub Pages on every push to `main` that touches `frontend/`. One-time setup:
in this repo go to **Settings → Pages** and set **Source** to
**GitHub Actions**. The site is served at:

```
https://madgeenger-stack.github.io/ai-security-taxonomy-feed/
```

Data updates (regenerated `vendors.json`) do NOT require a redeploy — the app
fetches the feed live on every page load.

## Running on Replit

1. In Replit, choose **Create Repl → Import from GitHub** and import
   `madgeenger-stack/ai-security-taxonomy-feed` (public, so the free tier
   works).
2. The root `.replit` file configures everything — press **Run**. It installs
   dependencies and starts the Vite dev server on port 3000 (exposed on 80).

## Running locally

```sh
cd frontend
npm install
npm run dev      # dev server
npm run build    # production build → dist/
```

## How it fits together

- **`ai-security-taxonomy`** (private) — system of record: vendor YAML,
  schema, CI validation.
- **n8n sweep workflow** — weekly Brave Search + RSS + Claude API sweep that
  opens PRs against the taxonomy repo.
- **This repo** — published `vendors.json` (regenerated on merge to the
  taxonomy repo's main) plus this read-only front end over it.
