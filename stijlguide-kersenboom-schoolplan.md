# Stijlguide Kersenboom Schoolplanomgeving

Laatste update: 4 mei 2026

## Doel van de omgeving

De website is een besloten stuur- en rapportageomgeving voor het Schoolplan 2026-2029 van Brede School de Kersenboom. De omgeving ondersteunt twee routes:

- Intern: bijwerken, rapporteren, plannen volgen en rapporten genereren.
- Extern: voortgang, plannen en thema-informatie bekijken zonder invoervelden.

De kernzin op de landingspagina is: **Samen leren wij meer.**

## Identiteit

De uitstraling combineert De Kersenboom met Florente:

- Warm, herkenbaar en schoolnabij door het Kersenboom-logo, het gebouwbeeld en de Samen 1 School-afbeeldingen.
- Zakelijk genoeg voor inspectie, bestuur en MR door duidelijke thema-indeling, voortgangspercentages en rapportagevelden.
- Kleurrijk per thema, zodat pagina's onderscheidbaar blijven.

Kernwaarden op de landingspagina:

- Veiligheid
- Duurzaamheid
- Samen
- Verantwoordelijkheid
- Vakkundigheid

## Basiskleuren

| Naam | Hex | Gebruik |
| --- | --- | --- |
| Kersenrood | `#c91432` | Primaire actie, merkaccent, onderwijskwaliteit |
| Donker kersenrood | `#8a1730` | Foutmeldingen, sterke accenten |
| Bladgroen | `#6aa842` | Positieve accenten, Kersenboom-identiteit |
| Donkergroen | `#245b45` | Goed werkgeverschap, stevige groene vlakken |
| Florente blauw | `#086b86` | Navigatieaccent, communicatie, zakelijke rust |
| Luchtblauw | `#d9eff3` | Secundaire knoppen en zachte vlakken |
| Oranje | `#ff6b00` | Levendig accent, call-to-action ondersteuning |
| Paars | `#7a3f93` | Innovatie |
| Inkt | `#20313d` | Hoofdtekst |
| Gedempt grijsblauw | `#64727c` | Ondersteunende tekst |
| Lijnkleur | `#d9e2e4` | Randen, scheidingen |
| Papier | `#fbfaf6` | Pagina-achtergrond |
| Wit | `#ffffff` | Kaarten, panelen |

## Themakleuren

| Thema | Hoofdkleur | Accent | Achtergrond | Tekst |
| --- | --- | --- | --- | --- |
| Onderwijskwaliteit | `#c91432` | `#ff6b00` | `#fff3f3` | `#371822` |
| Goed werkgeverschap | `#245b45` | `#6aa842` | `#eef7ef` | `#14372c` |
| Communicatie | `#086b86` | `#d64b32` | `#eaf6f8` | `#123642` |
| Innovatie | `#7a3f93` | `#00a49a` | `#f4eef8` | `#31163d` |

## Typografie

Gebruik de systeemlettertypes via:

`Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

Richtlijn:

- Grote koppen zijn kort, duidelijk en functioneel.
- Rapportagevelden gebruiken compacte labels.
- Geen marketingtaal op interne pagina's; de pagina moet direct duidelijk maken wat je kunt doen.

## Vormgeving

- Border radius: meestal 6px.
- Kaarten worden gebruikt voor ambities, plannen en rapportageblokken.
- Geen zwevende decoratieve bollen of overdadige effecten.
- Foto's en illustraties zijn inhoudelijk: gebouw, logo en Samen 1 School-beeldtaal.
- Thema's mogen visueel duidelijk verschillen, maar blijven binnen dezelfde structuur.

## Navigatie

Hoofdmenu:

- Thema's: dropdown met vier themapagina's.
- Voortgang: alleen zichtbaar voor externe gebruikers.
- Plannenbank: zichtbaar voor intern en extern.
- Rapport: alleen zichtbaar voor interne gebruikers.

Dropdown-gedrag:

- Opent met klik.
- Sluit bij keuze of klik buiten het menu.
- Niet afhankelijk van hover, zodat het ook stabiel werkt op touchscreens.

## Rollen en toegang

Bij openen kiest de gebruiker eerst:

- Ik ben intern
- Ik ben extern

Daarna volgt het bijbehorende wachtwoord. De wachtwoorden horen als Environment variables in Netlify te staan en niet in de websitecode.

Let op: voor echte besloten toegang tot alle statische bestanden is Netlify Password Protection of een andere server-side beveiliging nodig.

## Opslag

Lokale versie:

- Gebruikt browseropslag.
- Geschikt voor testen zonder internet.

Online versie:

- Gebruikt Netlify Functions en Netlify Blobs.
- Interne wijzigingen worden online opgeslagen.
- Externe pagina's lezen dezelfde gedeelde voortgang.
- Netlify kan updates wereldwijd met enige vertraging tonen; reken op maximaal ongeveer 60 seconden.

## Bestanden

Belangrijkste sitebestanden:

- `index.html`
- `styles.css`
- `app.js`
- `assets/`
- `netlify/functions/auth.js`
- `netlify/functions/reporting.js`
- `package.json`
- `netlify.toml`

Belangrijkste beelden:

- `assets/bsd-k-logo.png`
- `assets/kersenboom-header.jpg`
- `assets/samen-1-school/`

## Publicatie

Voor de sync-versie is een gewone drag-and-drop upload niet ideaal. Gebruik bij voorkeur GitHub gekoppeld aan Netlify, zodat Netlify dependencies installeert en de functie meeneemt.

Instellingen:

- Build command: leeg laten.
- Publish directory: `.`
- Functions directory: standaard `netlify/functions`.

## Testscenario's

Na publicatie testen:

1. Log intern in.
2. Wijzig een ambitie op een themapagina.
3. Controleer of de header `Online opgeslagen` toont.
4. Log uit.
5. Log extern in.
6. Controleer of dezelfde voortgang zichtbaar is.
7. Test minimaal een ambitie op 25%, 50%, 75% en 100%.
8. Controleer of rapportagevelden alleen intern zichtbaar zijn.
