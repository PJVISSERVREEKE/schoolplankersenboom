# Schoolplan Kersenboom

Besloten schoolplan- en rapportageomgeving voor Brede School de Kersenboom.

## Publicatie via Netlify

Aanbevolen instellingen:

- Build command: leeg laten
- Publish directory: `.`
- Functions directory: `netlify/functions`

De gedeelde online opslag loopt via:

- `netlify/functions/reporting.js`
- `@netlify/blobs`

## Let op met wachtwoorden

De wachtwoorden in `app.js` zijn prototype-wachtwoorden voor de rolkeuze in de website. Gebruik voor echte besloten toegang altijd ook Netlify Password Protection of een andere server-side beveiliging.

De spreadsheet met wachtwoorden staat bewust niet in deze repository en wordt via `.gitignore` uitgesloten.
