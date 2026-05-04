# Schoolplan Kersenboom

Besloten schoolplan- en rapportageomgeving voor Brede School de Kersenboom.

## Publicatie via Netlify

Aanbevolen instellingen:

- Build command: leeg laten
- Publish directory: `.`
- Functions directory: `netlify/functions`

De beveiligde login en gedeelde online opslag lopen via:

- `netlify/functions/auth.js`
- `netlify/functions/reporting.js`
- `@netlify/blobs`

## Wachtwoorden

De wachtwoorden staan niet in de websitecode. Zet ze in Netlify bij Environment variables:

- `KERSENBOOM_INTERNAL_PASSWORD`
- `KERSENBOOM_EXTERNAL_PASSWORD`
- `KERSENBOOM_AUTH_SECRET`

Gebruik voor `KERSENBOOM_AUTH_SECRET` een lange willekeurige tekst. Gebruik voor echte site-brede afscherming daarnaast Netlify Password Protection of een andere server-side beveiliging.
