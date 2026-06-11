# AI Security Taxonomy — Published Feed

Public, machine-readable feed of the AI Security taxonomy, plus the Vendor
Logbook front end that renders it.

- **`vendors.json`** — the published vendor dataset, regenerated automatically
  when changes merge to the (private) `ai-security-taxonomy` system-of-record
  repo. Consume it directly at:

  ```
  https://raw.githubusercontent.com/madgeenger-stack/ai-security-taxonomy-feed/refs/heads/main/vendors.json
  ```

- **`frontend/`** — Vite + React Vendor Logbook UI that fetches the feed live
  at page load. Hosted on GitHub Pages at
  <https://madgeenger-stack.github.io/ai-security-taxonomy-feed/>; also
  Replit-ready via the root `.replit` (import this repo, press Run). See
  `frontend/README.md` for details.
