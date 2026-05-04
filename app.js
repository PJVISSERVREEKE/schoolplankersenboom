const STORAGE_KEY = "kersenboom-schoolplan-rapportage-v1";
const API_ENDPOINT = "/.netlify/functions/reporting";
const AUTH_ENDPOINT = "/.netlify/functions/auth";
const AUTH_TOKEN_KEY = "kersenboom-auth-token";
const planningYears = ["2026-2027", "2027-2028", "2028-2029", "2029-2030"];
let selectedRole = null;
let currentRole = sessionStorage.getItem("kersenboom-role") || null;
let saveTimer = null;
let isApplyingRemoteState = false;
let latestRemoteUpdate = null;

const themes = [
  {
    id: "onderwijskwaliteit",
    title: "Onderwijskwaliteit",
    short: "Zichtbaar leren, basisvaardigheden, passend onderwijs en cyclische kwaliteitszorg.",
    color: "#c91432",
    accent: "#ff6b00",
    bg: "#fff3f3",
    text: "#371822",
    visual: "bars",
    keywords: ["1F en 1S/2F", "HGW-cyclus", "KiVa", "Partnerschap"],
    image: "assets/samen-1-school/luisteren.jpg",
  },
  {
    id: "werkgeverschap",
    title: "Goed werkgeverschap",
    short: "Een professionele, veilige en waarderende werkomgeving waarin medewerkers floreren.",
    color: "#245b45",
    accent: "#6aa842",
    bg: "#eef7ef",
    text: "#14372c",
    visual: "people",
    keywords: ["DDGC", "Onboarding", "Werkgeluk", "Duurzame inzetbaarheid"],
    image: "assets/samen-1-school/helpen-elkaar.jpg",
  },
  {
    id: "communicatie",
    title: "Communicatie",
    short: "Duidelijke, tijdige en begrijpelijke communicatie die vertrouwen en samenwerking versterkt.",
    color: "#086b86",
    accent: "#d64b32",
    bg: "#eaf6f8",
    text: "#123642",
    visual: "messages",
    keywords: ["B1-taal", "Ouderportaal", "Wiki", "Feedback"],
    image: "assets/samen-1-school/respect.jpg",
  },
  {
    id: "innovatie",
    title: "Innovatie",
    short: "Toekomstgericht onderwijs met STEAM, digitale geletterdheid, duurzaamheid en buitenwereld.",
    color: "#7a3f93",
    accent: "#00a49a",
    bg: "#f4eef8",
    text: "#31163d",
    visual: "lab",
    keywords: ["STEAM", "AI", "Dynamische Schooldag", "IBP"],
    image: "assets/samen-1-school/leerplein.jpg",
  },
];

const ambitions = [
  {
    id: "ok-1",
    theme: "onderwijskwaliteit",
    title: "Basisvaardigheden versterken",
    goal: "Taal, lezen en rekenen groeien naar 100% 1F en 1S/2F ligt 1% boven het verwachte niveau.",
    results: [
      "Alle leerlingen behalen 1F voor taal, lezen en rekenen.",
      "Er is een stijgende lijn richting het landelijk gemiddelde op 1S/2F.",
      "Een leescoordinator bewaakt het leesverbeterplan en meet leesplezier.",
    ],
    actions: ["0-meting leesonderwijs", "Leesverbeterplan", "Vervolgmetingen", "Analyse schoolweging"],
  },
  {
    id: "ok-2",
    theme: "onderwijskwaliteit",
    title: "Datagedreven inclusief onderwijs",
    goal: "Passende ondersteuning start trapsgewijs vanuit de korte en lange HGW-cyclus.",
    results: [
      "LVS-data en korte HGW-cyclus sturen het onderwijsaanbod.",
      "Alle leerlingen met specifieke onderwijsbehoeften doorlopen de zorgroute.",
      "OPP-hoorrecht is passend uitgevoerd.",
    ],
    actions: ["Zorgroute aanscherpen", "Routekaarten per vakgebied", "OPP-hoorrecht vastleggen", "Doorverwijzingsroute SBO/SO"],
  },
  {
    id: "ok-3",
    theme: "onderwijskwaliteit",
    title: "Cyclische kwaliteitszorg",
    goal: "De PDCA-cyclus is zichtbaar op school- en groepsniveau.",
    results: [
      "Het jaarplan wordt vier keer per jaar geevalueerd.",
      "Twee keer per jaar vindt een schoolanalyse op LVS plaats.",
      "Conclusies leiden aantoonbaar tot bijstelling en borging.",
    ],
    actions: ["PDCA-kalender", "Schoolanalyse", "Borgingsafspraken", "Teamterugkoppeling"],
  },
  {
    id: "ok-4",
    theme: "onderwijskwaliteit",
    title: "Veilige school en positief klimaat",
    goal: "De school is veilig voor leerlingen, ouders en medewerkers met groeiende maatschappelijke competenties.",
    results: [
      "KiVa-monitor laat positieve scores op veiligheid en welbevinden zien.",
      "Pestbeleving en incidentpatronen dalen op schoolniveau.",
      "Leerkrachtcoaches borgen positieve en concrete leertaal.",
    ],
    actions: ["KiVa-monitor", "Incidentanalyse", "Coaching op leertaal", "Burgerschapsmeting"],
  },
  {
    id: "ok-5",
    theme: "onderwijskwaliteit",
    title: "Partnerschap met ouders, opvang en gemeenschap",
    goal: "Samenwerking met ouders en opvang wordt planmatig en zichtbaar verbonden aan de pedagogische visie.",
    results: [
      "De samenwerking met de opvangpartner is afgestemd op gezamenlijke schoolregels.",
      "MR en AC zijn stabiel bezet en dragen bij aan dialoog.",
      "Ouders ervaren meer transparantie over continuiteit in onderwijs.",
    ],
    actions: ["Gezamenlijke schoolregels", "MR/AC-dialoog", "Ouderpeiling", "Afstemming Kind & Co Ludens"],
  },
  {
    id: "ok-6",
    theme: "onderwijskwaliteit",
    title: "Doelgerichte professionalisering",
    goal: "Professionalisering versterkt aantoonbaar de onderwijskwaliteit in lessen en opbrengsten.",
    results: [
      "Het nascholingsplan ligt vast in het jaarplan.",
      "Deelname aan scholing wordt geregistreerd in DDGC.",
      "Leerkrachtcoaches begeleiden planmatig via coaching en consultatie.",
    ],
    actions: ["Nascholingsplan", "DDGC-registratie", "Coaching on the job", "Collegiale consultatie"],
  },
  {
    id: "wg-1",
    theme: "werkgeverschap",
    title: "Jaarlijkse professionele ontwikkeling",
    goal: "Alle medewerkers ontwikkelen zich jaarlijks aantoonbaar professioneel.",
    results: [
      "Iedere medewerker neemt deel aan scholing, intervisie of coaching.",
      "Ontwikkeling is zichtbaar in de DDGC-gesprekkencyclus.",
      "Signalen uit medewerkerstevredenheid leiden tot bijsturing.",
    ],
    actions: ["Scholingsaanbod", "Intervisie", "Coaching", "Medewerkerstevredenheidsmeting"],
  },
  {
    id: "wg-2",
    theme: "werkgeverschap",
    title: "Sterke onboarding",
    goal: "Nieuwe medewerkers krijgen binnen zes weken begeleiding, rust en helderheid.",
    results: [
      "Nieuwe medewerkers spreken binnen zes weken met de schoolleiding.",
      "Starters ontvangen begeleiding door schoolleiding of BBT.",
      "Interne communicatie en afspraken scoren boven 80%.",
    ],
    actions: ["Welkomsroute", "Startgesprek", "Buddy of BBT", "Afsprakenkaart"],
  },
  {
    id: "wg-3",
    theme: "werkgeverschap",
    title: "Werkplezier en balans",
    goal: "Werkgeluk is structureel onderdeel van de gesprekkencyclus en signalen leiden tijdig tot actie.",
    results: [
      "Werkgeluk wordt besproken in de gesprekkencyclus.",
      "Maatregelen tegen preventieve uitval zijn traceerbaar.",
      "In 2030 voelen alle medewerkers zich gewaardeerd.",
    ],
    actions: ["Werkdrukscan", "Gesprekkencyclus", "Waarderingsmomenten", "Preventieve maatregelen"],
  },
  {
    id: "wg-4",
    theme: "werkgeverschap",
    title: "Duurzame inzetbaarheid",
    goal: "Verzuim en inzetbaarheid worden gevolgd en gebruikt om gericht te ondersteunen.",
    results: [
      "Verzuimsignalen worden in afstemming met HR opgevolgd.",
      "Ziekteverzuim is lager dan of gelijk aan het landelijk gemiddelde voor primair onderwijs.",
      "Ondersteuning is preventief en navolgbaar.",
    ],
    actions: ["Verzuimmonitor", "HR-afstemming", "Preventieve gesprekken", "Werkbaarheid acties"],
  },
  {
    id: "wg-5",
    theme: "werkgeverschap",
    title: "Inclusie en diversiteit in het team",
    goal: "Instroom, doorstroom en herkenbaarheid van het team worden planmatig versterkt.",
    results: [
      "Jaarlijks wordt minstens een zij-instromer begeleid.",
      "Jaarlijks stroomt een interne medewerker door richting leerkracht.",
      "In 2030 is de man-vrouwverdeling 30/70 en is discriminatie afwezig.",
    ],
    actions: ["Zij-instroomroute", "Doorstroom OOP naar leerkracht", "Diversiteitsmonitor", "Teamcultuurgesprekken"],
  },
  {
    id: "wg-6",
    theme: "werkgeverschap",
    title: "Transparante arbeidsvoorwaarden",
    goal: "Arbeidsvoorwaarden, maatwerkafspraken en werkafspraken zijn bekend en vindbaar.",
    results: [
      "Maatwerkafspraken staan in medewerkerdossiers.",
      "De interne wiki bevat arbeidsvoorwaarden en werkafspraken.",
      "Medewerkers weten welke regelingen beschikbaar zijn.",
    ],
    actions: ["Wiki vullen", "Dossiercontrole", "Teamcommunicatie", "Takenpakket inzichtelijk"],
  },
  {
    id: "co-1",
    theme: "communicatie",
    title: "Toegankelijke oudercommunicatie",
    goal: "Oudercommunicatie is begrijpelijk, voorspelbaar en herstelt vertrouwen.",
    results: [
      "Communicatie is toegankelijk op B1-niveau.",
      "Het ouderportaal wordt structureel gebruikt.",
      "Oudertevredenheid over communicatie en betrokkenheid is minstens 80% positief.",
    ],
    actions: ["B1-redactie", "Ouderportaalritme", "Besluitvorming zichtbaar", "Ouderpeiling"],
  },
  {
    id: "co-2",
    theme: "communicatie",
    title: "Intranet en kennisdeling",
    goal: "Intranet en wiki zijn de primaire bron voor beleid, afspraken en kennisdeling.",
    results: [
      "Intranet is de primaire bron voor beleid en informatie.",
      "Kennisdeling via inspiratieplatform is actief.",
      "Schoolafspraken, beleid en protocollen staan in de wiki.",
    ],
    actions: ["Wiki-structuur", "Intranet opschonen", "Florente Cafes", "Kennismiddagen"],
  },
  {
    id: "co-3",
    theme: "communicatie",
    title: "Zichtbaar profiel van De Kersenboom",
    goal: "De school laat consequent zien waar zij voor staat.",
    results: [
      "Social media wordt onderhouden conform protocol.",
      "Input voor campagnes, storytelling en blogs wordt geleverd.",
      "Bereik en instroom worden op Florente-niveau gemonitord.",
    ],
    actions: ["Storytellingkalender", "Social protocol", "Beeldbank", "Instroommonitor"],
  },
  {
    id: "co-4",
    theme: "communicatie",
    title: "Incidentcommunicatie",
    goal: "Bij incidenten wordt eenduidig, tijdig en volgens protocol gecommuniceerd.",
    results: [
      "Het Florente-communicatieprotocol en Samen 1 School worden gevolgd.",
      "Input voor ondersteuningsteam en responsteam is vastgelegd.",
      "Handelen en communicatie worden geevalueerd.",
    ],
    actions: ["Protocolkaart", "Responsteamroute", "Bestuursmelding", "Evaluatieformat"],
  },
  {
    id: "co-5",
    theme: "communicatie",
    title: "Meten en verbeteren",
    goal: "Communicatie wordt structureel gemeten en aantoonbaar verbeterd.",
    results: [
      "Communicatie is onderdeel van visitaties en tevredenheidsonderzoeken.",
      "Er is tweejaarlijks feedback met medewerkers, ouders en stakeholders.",
      "Verbeterpunten worden opgevolgd.",
    ],
    actions: ["Feedbackmoment", "Visitatievragen", "Verbeterregister", "Terugkoppeling ouders"],
  },
  {
    id: "in-1",
    theme: "innovatie",
    title: "Leren met de buitenwereld",
    goal: "Het leren wordt structureel verbonden met maatschappij, gemeente en externe partners.",
    results: [
      "Externe partners verbinden het leren aantoonbaar met de maatschappij.",
      "Leerlingenparticipatie via de leerlingenraad is geborgd.",
      "Samenwerking met gemeente draagt bij aan schooldoelen en kernwaarden.",
    ],
    actions: ["Partnerkaart", "Leerlingenraad", "Gemeenteprojecten", "Maatschappelijke opdrachten"],
  },
  {
    id: "in-2",
    theme: "innovatie",
    title: "Spelenderwijs en game-based learning",
    goal: "Spelenderwijs leren en game-based learning worden doelgericht ingezet.",
    results: [
      "Minimaal twee vakgebieden gebruiken spelenderwijs leren of game-based learning.",
      "De inzet is verbonden aan onderwijsdoelen.",
      "Effecten worden geevalueerd.",
    ],
    actions: ["Vakgebiedselectie", "Pilotlessen", "Evaluatie leerlingen", "Borging in aanbod"],
  },
  {
    id: "in-3",
    theme: "innovatie",
    title: "STEAM, technologie en digitale geletterdheid",
    goal: "STEAM-lab, AI en digitale geletterdheid versterken het onderwijs.",
    results: [
      "Pilots met AI, VR, AR of smart classrooms zijn beschreven.",
      "Teams gebruiken AI effectief binnen heldere kaders.",
      "In 2030 is geintegreerd en thematisch onderwijs zichtbaar.",
    ],
    actions: ["STEAM-lab route", "AI-kaders", "Pilotportfolio", "Thematisch curriculum"],
  },
  {
    id: "in-4",
    theme: "innovatie",
    title: "Dynamische Schooldag",
    goal: "Bewegend leren en buitenonderwijs zijn structureel onderdeel van het lesaanbod.",
    results: [
      "De Dynamische Schooldag is concreet uitgewerkt en geborgd.",
      "Bewegend leren en buitenonderwijs zijn zichtbaar in het aanbod.",
      "Flexibele roosteropties worden bewust benut.",
    ],
    actions: ["Roostervarianten", "Buitenlessen", "Bewegend leren", "Borgingsafspraken"],
  },
  {
    id: "in-5",
    theme: "innovatie",
    title: "Duurzame technologie",
    goal: "Duurzame technologie wordt zichtbaar in school en onderwijsaanbod.",
    results: [
      "Invulling van duurzame technologie past bij de huisvesting.",
      "Leerlingen leren over verduurzaming.",
      "Leerlingen worden betrokken bij verduurzamingsprojecten.",
    ],
    actions: ["Duurzame installaties zichtbaar", "Leerlingprojecten", "Huisvesting koppelen", "Projectkalender"],
  },
  {
    id: "in-6",
    theme: "innovatie",
    title: "Digitale veiligheid en AVG",
    goal: "Digitale veiligheid, AVG en IBP worden geborgd met vaste controles en jaarlijkse training.",
    results: [
      "Structurele controles sluiten aan op Florente-afspraken.",
      "Tweejaarlijks vindt een cybersecurity-audit plaats.",
      "In 2029 is volwassenheidsniveau 4 van het Normenkader IBP bereikt.",
    ],
    actions: ["Systeemcontroles", "Cybersecurity-audit", "AVG-training", "Privacyafspraken innovaties"],
  },
];

const defaultProgress = {
  "ok-1": 18, "ok-2": 12, "ok-3": 22, "ok-4": 34, "ok-5": 16, "ok-6": 14,
  "wg-1": 25, "wg-2": 28, "wg-3": 18, "wg-4": 20, "wg-5": 10, "wg-6": 15,
  "co-1": 14, "co-2": 20, "co-3": 24, "co-4": 16, "co-5": 8,
  "in-1": 12, "in-2": 8, "in-3": 18, "in-4": 26, "in-5": 10, "in-6": 14,
};

const state = loadState();

const byId = (id) => document.getElementById(id);
const themeById = (id) => themes.find((theme) => theme.id === id);

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return createState(stored);
  } catch {
    return createState({});
  }
}

function createState(source = {}) {
  return ambitions.reduce((next, ambition) => {
      next[ambition.id] = {
        status: "Aandacht nodig",
        progress: defaultProgress[ambition.id] || 0,
        owner: "",
        deadline: "",
        explanation: "",
        nextStep: "",
        evidenceNotes: "",
        planningYears: [],
        planningNotes: "",
        visible: [],
        ...source[ambition.id],
      };
      return next;
  }, {});
}

function applyState(nextState) {
  Object.keys(state).forEach((key) => delete state[key]);
  Object.assign(state, createState(nextState));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  renderThemePages();
  renderAmbitions();
  updateMetrics();
  renderPlans();
  renderExternalProgress();
  generateReport();
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  updateMetrics();
  renderPlans();
  renderExternalProgress();
  queueRemoteSave();
}

function canUseRemoteStorage() {
  return location.protocol === "http:" || location.protocol === "https:";
}

function setSyncStatus(text, status = "local") {
  const element = byId("sync-status");
  if (!element) return;
  element.textContent = text;
  element.dataset.status = status;
}

async function loadRemoteState() {
  if (!canUseRemoteStorage()) {
    setSyncStatus("Lokale opslag", "local");
    return;
  }

  setSyncStatus("Online laden...", "loading");
  try {
    const response = await fetch(API_ENDPOINT, {
      headers: {
        Accept: "application/json",
        ...authHeaders(),
      },
    });
    if (!response.ok) throw new Error(`Online opslag gaf ${response.status}`);
    const payload = await response.json();
    if (payload.reporting && Object.keys(payload.reporting).length) {
      isApplyingRemoteState = true;
      applyState(payload.reporting);
      isApplyingRemoteState = false;
    }
    latestRemoteUpdate = payload.updatedAt || null;
    setSyncStatus(latestRemoteUpdate ? "Online bijgewerkt" : "Online opslag klaar", "online");
  } catch {
    setSyncStatus("Offline bewaard", "error");
  }
}

function queueRemoteSave() {
  if (isApplyingRemoteState || !canUseRemoteStorage() || currentRole !== "internal") return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveRemoteState, 700);
}

async function saveRemoteState() {
  setSyncStatus("Online opslaan...", "loading");
  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Kersenboom-Role": currentRole || "external",
        ...authHeaders(),
      },
      body: JSON.stringify({ reporting: state }),
    });
    if (!response.ok) throw new Error(`Online opslag gaf ${response.status}`);
    const payload = await response.json();
    latestRemoteUpdate = payload.updatedAt || null;
    setSyncStatus("Online opgeslagen", "online");
  } catch {
    setSyncStatus("Alleen lokaal bewaard", "error");
  }
}

function setThemeVars(element, theme) {
  element.style.setProperty("--theme-color", theme.color);
  element.style.setProperty("--theme-accent", theme.accent);
  element.style.setProperty("--theme-bg", theme.bg);
  element.style.setProperty("--theme-text", theme.text);
}

function renderThemes() {
  const grid = byId("theme-grid");
  grid.innerHTML = themes.map((theme) => {
    const count = ambitions.filter((ambition) => ambition.theme === theme.id).length;
    return `
      <article class="theme-card" data-theme-card="${theme.id}">
        <div>
          <p class="section-label">${count} ambities</p>
          <h3>${escapeHtml(theme.title)}</h3>
          <p>${escapeHtml(theme.short)}</p>
        </div>
        <a class="theme-card__link" href="#thema-${theme.id}">Open thema</a>
      </article>
    `;
  }).join("");

  grid.querySelectorAll(".theme-card").forEach((card) => {
    setThemeVars(card, themeById(card.dataset.themeCard));
  });
}

function renderThemeMenu() {
  const menu = byId("theme-menu");
  menu.innerHTML = themes.map((theme) => `
    <a href="#thema-${theme.id}" data-theme-menu="${theme.id}">
      <strong>${escapeHtml(theme.title)}</strong>
      <small>${escapeHtml(theme.short)}</small>
    </a>
  `).join("");
  menu.querySelectorAll("[data-theme-menu]").forEach((link) => {
    setThemeVars(link, themeById(link.dataset.themeMenu));
  });
}

function roleLabel(role) {
  return role === "internal" ? "Interne omgeving" : "Externe voortgang";
}

function applyRole(role, token = sessionStorage.getItem(AUTH_TOKEN_KEY)) {
  currentRole = role;
  document.body.dataset.role = role;
  sessionStorage.setItem("kersenboom-role", role);
  sessionStorage.setItem("kersenboom-auth", "true");
  if (token) sessionStorage.setItem(AUTH_TOKEN_KEY, token);
}

function authHeaders() {
  const token = sessionStorage.getItem(AUTH_TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function authenticate(role, password) {
  if (!canUseRemoteStorage()) {
    return {
      ok: false,
      message: "Deze beveiligde login werkt op de online Netlify-versie.",
    };
  }

  const response = await fetch(AUTH_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ role, password }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.token) {
    return {
      ok: false,
      message: payload.error || "Dat wachtwoord klopt niet.",
    };
  }

  return { ok: true, token: payload.token };
}

function visualMarkup(type) {
  if (type === "people") {
    return `<div class="visual-people">${[1, 2, 3, 4, 5].map((i) => `<span style="--i:${i}"></span>`).join("")}</div>`;
  }
  if (type === "messages") {
    return `<div class="visual-messages">${[1, 2, 3, 4, 5].map(() => "<span></span>").join("")}</div>`;
  }
  if (type === "lab") {
    return `<div class="visual-lab">${Array.from({ length: 12 }).map(() => "<span></span>").join("")}</div>`;
  }
  return `<div class="visual-bars">${[1, 2, 3, 4].map(() => "<span></span>").join("")}</div>`;
}

function renderThemePages() {
  const section = byId("theme-pages");
  section.innerHTML = themes.map((theme) => {
    const related = ambitions.filter((ambition) => ambition.theme === theme.id);
    return `
    <article class="theme-page" id="thema-${theme.id}" data-theme-page="${theme.id}">
      <div class="theme-page__intro">
        <p class="section-label">Themapagina</p>
        <h2>${escapeHtml(theme.title)}</h2>
        <p>${escapeHtml(theme.short)}</p>
        <div class="theme-pill-row">
          ${theme.keywords.map((keyword) => `<span>${escapeHtml(keyword)}</span>`).join("")}
        </div>
        <div class="theme-page__ambitions">
          ${related.map((ambition) => `
            <article>
              <h3>${escapeHtml(ambition.title)}</h3>
              <p>${escapeHtml(ambition.goal)}</p>
            </article>
          `).join("")}
        </div>
      </div>
      <div class="theme-page__visual">
        <img class="theme-page__image" src="${theme.image}" alt="" />
        ${visualMarkup(theme.visual)}
        <p><strong>${related.length} ambities</strong> gekoppeld aan rapportagevelden, acties, bewijs en zichtbare resultaten.</p>
      </div>
      <div class="theme-page__reporting">
        <div class="section-heading">
          <p class="section-label">Rapportage ${escapeHtml(theme.title)}</p>
          <h2>Werk de voortgang bij op deze themapagina.</h2>
          <p>
            Planning, zichtbare resultaten, bewijs en status blijven per ambitie bewaard en worden
            meegenomen in de rapportgenerator.
          </p>
        </div>
        <div class="planning-note">
          <strong>Planning volgt later.</strong>
          <span>Gebruik de schooljaarvelden alvast als voorbereiding op het definitieve schoolplan.</span>
        </div>
        <div class="theme-ambition-list">
          ${related.map((ambition) => ambitionCard(ambition)).join("")}
        </div>
      </div>
      <div class="theme-page__external">
        <div class="section-heading">
          <p class="section-label">Voortgang ${escapeHtml(theme.title)}</p>
          <h2>Actuele stand van dit thema.</h2>
          <p>Alle ambities zijn zichtbaar; interne invoervelden blijven verborgen.</p>
        </div>
        <div class="external-ambition-list">
          ${related.map((ambition) => externalAmbitionCard(ambition)).join("")}
        </div>
      </div>
    </article>
  `;
  }).join("");
  section.querySelectorAll(".theme-page").forEach((page) => {
    setThemeVars(page, themeById(page.dataset.themePage));
  });
  section.querySelectorAll(".ambition-card").forEach((card) => {
    setThemeVars(card, themeById(card.dataset.theme));
    hydrateCardInputs(card);
  });
}

function externalAmbitionCard(ambition) {
  const current = state[ambition.id];
  const theme = themeById(ambition.theme);
  const visibleResults = ambition.results.filter((_, index) => current.visible.includes(String(index)));
  return `
    <article class="external-ambition-card" data-theme="${theme.id}">
      <div>
        <p class="section-label">${escapeHtml(theme.title)}</p>
        <h3>${escapeHtml(ambition.title)}</h3>
        <p>${escapeHtml(ambition.goal)}</p>
      </div>
      <div class="external-progress-line">
        <span class="status-pill" data-status="${escapeHtml(current.status)}">${escapeHtml(current.status)}</span>
        <strong>${Number(current.progress)}%</strong>
      </div>
      <div class="progress-track" style="--progress:${Number(current.progress)}%"><span></span></div>
      <dl>
        <div>
          <dt>Planning</dt>
          <dd>${current.planningYears.length ? escapeHtml(current.planningYears.join(", ")) : "Nog niet gepland"}</dd>
        </div>
        <div>
          <dt>Volgende stap</dt>
          <dd>${escapeHtml(current.nextStep || "Nog aan te vullen")}</dd>
        </div>
        <div>
          <dt>Zichtbare resultaten</dt>
          <dd>${visibleResults.length ? visibleResults.map(escapeHtml).join("<br>") : "Nog niet zichtbaar gemarkeerd"}</dd>
        </div>
      </dl>
    </article>
  `;
}

function renderFilters() {
  const filter = byId("theme-filter");
  filter.innerHTML = `<option value="all">Alle thema's</option>${themes
    .map((theme) => `<option value="${theme.id}">${escapeHtml(theme.title)}</option>`)
    .join("")}`;
}

function renderAmbitions() {
  const themeFilter = byId("theme-filter").value;
  const statusFilter = byId("status-filter").value;
  const search = byId("search-input").value.trim().toLowerCase();
  const list = byId("ambition-list");

  const filtered = ambitions.filter((ambition) => {
    const current = state[ambition.id];
    const haystack = [
      ambition.title,
      ambition.goal,
      ambition.results.join(" "),
      ambition.actions.join(" "),
      current.explanation,
      current.nextStep,
      current.evidenceNotes,
      current.planningNotes,
      current.planningYears.join(" "),
    ].join(" ").toLowerCase();
    return (themeFilter === "all" || ambition.theme === themeFilter)
      && (statusFilter === "all" || current.status === statusFilter)
      && (!search || haystack.includes(search));
  });

  list.innerHTML = filtered.map((ambition) => ambitionCard(ambition)).join("");
  list.querySelectorAll(".ambition-card").forEach((card) => {
    setThemeVars(card, themeById(card.dataset.theme));
    hydrateCardInputs(card);
  });
}

function ambitionCard(ambition) {
  const current = state[ambition.id];
  const theme = themeById(ambition.theme);
  return `
    <article class="ambition-card" data-ambition-id="${ambition.id}" data-theme="${theme.id}">
      <div class="ambition-card__header">
        <div>
          <p class="section-label">${escapeHtml(theme.title)}</p>
          <h3>${escapeHtml(ambition.title)}</h3>
          <p>${escapeHtml(ambition.goal)}</p>
          <div class="ambition-meta">
            <span class="status-pill" data-status="${escapeHtml(current.status)}">${escapeHtml(current.status)}</span>
            ${ambition.actions.map((action) => `<span class="status-pill">${escapeHtml(action)}</span>`).join("")}
          </div>
        </div>
        <div class="progress-shell">
          <span class="progress-number">${Number(current.progress)}%</span>
          <div class="progress-track" style="--progress:${Number(current.progress)}%"><span></span></div>
        </div>
      </div>
      <form class="ambition-form">
        <label>Status
          <select name="status">
            ${["Op koers", "Aandacht nodig", "Risico", "Afgerond"].map((status) => `<option>${status}</option>`).join("")}
          </select>
        </label>
        <label>Voortgang
          <span class="range-row">
            <input name="progress" type="range" min="0" max="100" step="5" />
            <output>${Number(current.progress)}%</output>
          </span>
        </label>
        <label>Eigenaar
          <input name="owner" placeholder="Naam of projectgroep" />
        </label>
        <label>Deadline
          <input name="deadline" type="date" />
        </label>
        <fieldset class="planning-list">
          <legend>Planning schooljaren</legend>
          ${planningYears.map((year) => `
            <label>
              <input type="checkbox" name="planningYears" value="${year}" />
              <span>${year}</span>
            </label>
          `).join("")}
        </fieldset>
        <label class="span-2">Uitleg status
          <textarea name="explanation" placeholder="Wat is de actuele stand, waarom, en wat vraagt aandacht?"></textarea>
        </label>
        <label class="span-2">Volgende stap
          <textarea name="nextStep" placeholder="Welke actie volgt, door wie en wanneer?"></textarea>
        </label>
        <label class="span-2">Planningnotitie
          <textarea name="planningNotes" placeholder="Nog te bepalen: wanneer start dit, welke mijlpalen horen erbij, en wat schuift door?"></textarea>
        </label>
        <label class="span-2">Bewijs en bronnen
          <textarea name="evidenceNotes" placeholder="Bijv. LVS-analyse, KiVa-monitor, ouderpeiling, visitatie, notulen, observaties"></textarea>
        </label>
        <div class="evidence-list" aria-label="Zichtbare resultaten">
          ${ambition.results.map((result, index) => `
            <label>
              <input type="checkbox" name="visible" value="${index}" />
              <span>${escapeHtml(result)}</span>
            </label>
          `).join("")}
        </div>
      </form>
    </article>
  `;
}

function hydrateCardInputs(card) {
  const id = card.dataset.ambitionId;
  const current = state[id];
  const form = card.querySelector(".ambition-form");
  form.status.value = current.status;
  form.progress.value = current.progress;
  form.owner.value = current.owner;
  form.deadline.value = current.deadline;
  form.explanation.value = current.explanation;
  form.nextStep.value = current.nextStep;
  form.evidenceNotes.value = current.evidenceNotes;
  form.planningNotes.value = current.planningNotes;
  form.querySelectorAll('input[name="planningYears"]').forEach((input) => {
    input.checked = current.planningYears.includes(input.value);
  });
  form.querySelectorAll('input[name="visible"]').forEach((input) => {
    input.checked = current.visible.includes(input.value);
  });
}

function updateCard(id) {
  const current = state[id];
  document.querySelectorAll(`[data-ambition-id="${id}"]`).forEach((card) => {
    card.querySelector(".progress-number").textContent = `${Number(current.progress)}%`;
    card.querySelector(".progress-track").style.setProperty("--progress", `${Number(current.progress)}%`);
    const pill = card.querySelector(".ambition-meta .status-pill");
    pill.textContent = current.status;
    pill.dataset.status = current.status;
  });
}

function renderPlans() {
  const board = byId("plans-board");
  const statuses = ["Risico", "Aandacht nodig", "Op koers", "Afgerond"];
  board.innerHTML = statuses.map((status) => {
    const cards = ambitions.filter((ambition) => state[ambition.id].status === status);
    return `
      <section class="plan-column">
        <h3>${escapeHtml(status)}</h3>
        ${cards.map((ambition) => {
          const theme = themeById(ambition.theme);
          const current = state[ambition.id];
          return `
            <article class="plan-card" data-theme="${theme.id}">
              <small>${escapeHtml(theme.title)} | ${Number(current.progress)}%</small>
              <h3>${escapeHtml(ambition.title)}</h3>
              <p>${escapeHtml(current.nextStep || ambition.actions[0])}</p>
            </article>
          `;
        }).join("") || "<p>Nog geen plannen in deze kolom.</p>"}
      </section>
    `;
  }).join("");
  board.querySelectorAll(".plan-card").forEach((card) => setThemeVars(card, themeById(card.dataset.theme)));
}

function renderExternalProgress() {
  const container = byId("external-theme-list");
  if (!container) return;
  container.innerHTML = themes.map((theme) => {
    const related = ambitions.filter((ambition) => ambition.theme === theme.id);
    const average = Math.round(related.reduce((sum, ambition) => sum + Number(state[ambition.id].progress), 0) / related.length);
    return `
      <section class="external-theme" data-theme="${theme.id}">
        <div class="external-theme__header">
          <div>
            <p class="section-label">${escapeHtml(theme.title)}</p>
            <h2>${escapeHtml(theme.title)}</h2>
            <p>${escapeHtml(theme.short)}</p>
          </div>
          <div class="external-theme__score">
            <strong>${average}%</strong>
            <span>${escapeHtml(progressInterpretation(average))}</span>
          </div>
        </div>
        <div class="external-ambition-list">
          ${related.map((ambition) => externalAmbitionCard(ambition)).join("")}
        </div>
      </section>
    `;
  }).join("");
  container.querySelectorAll("[data-theme]").forEach((element) => {
    setThemeVars(element, themeById(element.dataset.theme));
  });
  updateExternalMetrics();
}

function updateMetrics() {
  const values = Object.values(state);
  const totalProgress = Math.round(values.reduce((sum, item) => sum + Number(item.progress || 0), 0) / values.length);
  const risks = values.filter((item) => item.status === "Risico" || (item.status === "Aandacht nodig" && Number(item.progress) < 20)).length;
  const evidence = values.reduce((sum, item) => sum + item.visible.length, 0);
  byId("metric-ambitions").textContent = ambitions.length;
  byId("metric-progress").textContent = `${totalProgress}%`;
  byId("metric-risks").textContent = risks;
  byId("metric-evidence").textContent = evidence;
  updateExternalMetrics();
}

function updateExternalMetrics() {
  if (!byId("external-metric-progress")) return;
  const values = Object.values(state);
  const totalProgress = Math.round(values.reduce((sum, item) => sum + Number(item.progress || 0), 0) / values.length);
  const onTrack = values.filter((item) => item.status === "Op koers" || item.status === "Afgerond").length;
  const attention = values.filter((item) => item.status === "Risico" || item.status === "Aandacht nodig").length;
  const evidence = values.reduce((sum, item) => sum + item.visible.length, 0);
  byId("external-metric-progress").textContent = `${totalProgress}%`;
  byId("external-metric-ontrack").textContent = onTrack;
  byId("external-metric-attention").textContent = attention;
  byId("external-metric-evidence").textContent = evidence;
}

function progressInterpretation(progress) {
  if (progress >= 100) return "De uitvoering is afgerond; de nadruk ligt nu op borging, bewijsvoering en blijvend monitoren.";
  if (progress >= 75) return "De uitvoering is vergevorderd; de belangrijkste aandacht ligt bij afronding, zichtbaarheid van resultaten en borging.";
  if (progress >= 50) return "De uitvoering is halverwege; keuzes, planning en opvolging moeten scherp blijven om het beoogde resultaat te halen.";
  if (progress >= 25) return "De uitvoering is gestart, maar vraagt duidelijke prioritering en eigenaarschap om tempo te maken.";
  return "De uitvoering staat nog aan het begin; planning, eigenaarschap en eerste acties moeten concreet worden gemaakt.";
}

function audienceFocus(audience) {
  if (audience === "Inspectie") {
    return "Focus voor inspectie: onderbouw de voortgang met kwaliteitszorg, zicht op ontwikkeling, evaluaties, meetgegevens en aantoonbare bijstelling.";
  }
  if (audience === "Bestuur") {
    return "Focus voor bestuur: maak bestuurlijke risico's, voortgang op koersdoelen, inzet van mensen en middelen en benodigde besluiten expliciet.";
  }
  return "Focus voor MR: schrijf helder wat merkbaar is voor leerlingen, ouders en medewerkers, welke keuzes voorliggen en waar instemming of advies relevant kan zijn.";
}

function generateReport() {
  const audience = byId("audience").value;
  const period = byId("period").value;
  const tone = byId("tone").value;
  const date = new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
  const values = Object.values(state);
  const averageProgress = Math.round(values.reduce((sum, item) => sum + Number(item.progress || 0), 0) / values.length);
  const statusCounts = values.reduce((counts, item) => {
    counts[item.status] = (counts[item.status] || 0) + 1;
    return counts;
  }, {});
  const lines = [
    `Conceptrapport schoolplan 2026-2029`,
    `Doelgroep: ${audience}`,
    `Periode: ${period}`,
    `Toon: ${tone}`,
    `Aangemaakt: ${date}`,
    ``,
    `Samenvatting`,
    `De Kersenboom werkt aan ${ambitions.length} ambities binnen vier Florente-thema's. De gemiddelde voortgang is ${averageProgress}%. ${progressInterpretation(averageProgress)}`,
    `Statusbeeld: ${statusCounts["Afgerond"] || 0} afgerond, ${statusCounts["Op koers"] || 0} op koers, ${statusCounts["Aandacht nodig"] || 0} met aandacht nodig en ${statusCounts["Risico"] || 0} met risico.`,
    `Er zijn ${byId("metric-evidence").textContent} resultaatonderdelen als zichtbaar gemarkeerd.`,
    audienceFocus(audience),
    ``,
  ];

  themes.forEach((theme) => {
    const related = ambitions.filter((ambition) => ambition.theme === theme.id);
    const average = Math.round(related.reduce((sum, ambition) => sum + Number(state[ambition.id].progress), 0) / related.length);
    lines.push(`${theme.title}`);
    lines.push(`Gemiddelde voortgang: ${average}%`);
    related.forEach((ambition) => {
      const current = state[ambition.id];
      const visibleResults = ambition.results.filter((_, index) => current.visible.includes(String(index)));
      lines.push(`- ${ambition.title}: ${current.status}, ${current.progress}% voortgang.`);
      lines.push(`  Uitleg: ${current.explanation || "Nog aan te vullen."}`);
      lines.push(`  Planning: ${current.planningYears.length ? current.planningYears.join(", ") : "Nog niet gepland."}`);
      lines.push(`  Planningnotitie: ${current.planningNotes || "Nog aan te vullen na definitief schoolplan."}`);
      lines.push(`  Volgende stap: ${current.nextStep || "Nog aan te vullen."}`);
      lines.push(`  Zichtbare resultaten: ${visibleResults.length ? visibleResults.join("; ") : "Nog niet gemarkeerd."}`);
      lines.push(`  Bewijs/bronnen: ${current.evidenceNotes || "Nog aan te vullen."}`);
    });
    lines.push("");
  });

  lines.push("Aandachtspunten voor verantwoording");
  lines.push("- Voeg waar mogelijk meetgegevens toe: LVS, KiVa-monitor, tevredenheidsonderzoeken, visitatieverslagen, notulen en jaarplan-evaluaties.");
  lines.push("- Maak bij risico's expliciet welke bijstelling is gekozen, wie eigenaar is en wanneer opnieuw wordt geevalueerd.");
  lines.push("- Gebruik dezelfde definities voor status en voortgang in rapportages aan inspectie, bestuur en MR.");

  byId("report-output").value = lines.join("\n");
}

function exportJson() {
  const payload = {
    exportedAt: new Date().toISOString(),
    themes,
    ambitions,
    reporting: state,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "kersenboom-schoolplan-rapportage.json";
  link.click();
  URL.revokeObjectURL(url);
}

function routeToHash() {
  const hash = location.hash || "#home";
  const pageViews = document.querySelectorAll(".page-view");
  const themePages = document.querySelectorAll(".theme-page");

  pageViews.forEach((view) => view.classList.add("is-hidden"));
  themePages.forEach((page) => page.classList.add("is-hidden"));

  if (currentRole === "external" && hash === "#home") {
    byId("extern").classList.remove("is-hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  if (hash.startsWith("#thema-")) {
    const themePage = document.querySelector(hash);
    byId("theme-pages").classList.remove("is-hidden");
    if (themePage) themePage.classList.remove("is-hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  if (["#rapportage", "#plannen", "#rapport", "#extern"].includes(hash)) {
    if (hash === "#rapportage") {
      location.replace("#thema-onderwijskwaliteit");
      return;
    }
    if (hash === "#rapport" && currentRole === "external") {
      location.replace("#extern");
      return;
    }
    document.querySelector(hash).classList.remove("is-hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  byId("home").classList.remove("is-hidden");
  if (hash === "#themas") {
    byId("themas").scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function bindEvents() {
  document.querySelectorAll("[data-role-select]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedRole = button.dataset.roleSelect;
      byId("role-choice").classList.add("is-hidden");
      byId("login-form").classList.add("is-active");
      byId("selected-role-label").textContent = roleLabel(selectedRole);
      byId("password-hint").textContent = "Vul het afgesproken wachtwoord in. Dit wachtwoord staat niet in de websitecode.";
      byId("password").value = "";
      byId("password").focus();
    });
  });

  byId("role-back").addEventListener("click", () => {
    selectedRole = null;
    byId("login-form").classList.remove("is-active");
    byId("role-choice").classList.remove("is-hidden");
    byId("login-error").textContent = "";
    byId("password").value = "";
  });

  byId("login-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!selectedRole) {
      byId("login-error").textContent = "Kies eerst intern of extern.";
      return;
    }

    byId("login-error").textContent = "";
    const submitButton = event.currentTarget.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = "Controleren...";
    const result = await authenticate(selectedRole, byId("password").value);
    submitButton.disabled = false;
    submitButton.textContent = "Open";

    if (result.ok) {
      applyRole(selectedRole, result.token);
      byId("gate").classList.add("is-hidden");
      byId("app").classList.remove("is-hidden");
      byId("login-error").textContent = "";
      location.hash = selectedRole === "external" ? "#extern" : "#home";
      routeToHash();
      loadRemoteState();
    } else {
      byId("login-error").textContent = result.message;
    }
  });

  byId("logout-button").addEventListener("click", () => {
    sessionStorage.removeItem("kersenboom-auth");
    sessionStorage.removeItem("kersenboom-role");
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    currentRole = null;
    selectedRole = null;
    delete document.body.dataset.role;
    byId("app").classList.add("is-hidden");
    byId("gate").classList.remove("is-hidden");
    byId("login-form").classList.remove("is-active");
    byId("role-choice").classList.remove("is-hidden");
    byId("password").value = "";
  });

  const navDropdown = document.querySelector(".nav-dropdown");
  const navDropdownButton = document.querySelector(".nav-dropdown__button");
  navDropdownButton.addEventListener("click", () => {
    const isOpen = navDropdown.classList.toggle("is-open");
    navDropdownButton.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (event) => {
    if (navDropdown.contains(event.target)) return;
    navDropdown.classList.remove("is-open");
    navDropdownButton.setAttribute("aria-expanded", "false");
  });

  byId("theme-menu").addEventListener("click", (event) => {
    if (!event.target.closest("a")) return;
    navDropdown.classList.remove("is-open");
    navDropdownButton.setAttribute("aria-expanded", "false");
  });

  byId("theme-grid").addEventListener("click", (event) => {
    const link = event.target.closest(".theme-card__link");
    if (!link) return;
    event.preventDefault();
    location.hash = link.getAttribute("href");
  });

  window.addEventListener("hashchange", routeToHash);

  ["theme-filter", "status-filter", "search-input"].forEach((id) => {
    byId(id).addEventListener("input", renderAmbitions);
  });

  byId("ambition-list").addEventListener("input", (event) => {
    updateAmbitionFromForm(event);
  });

  byId("theme-pages").addEventListener("input", (event) => {
    updateAmbitionFromForm(event);
  });

  function updateAmbitionFromForm(event) {
    const card = event.target.closest(".ambition-card");
    if (!card) return;
    const id = card.dataset.ambitionId;
    const form = card.querySelector(".ambition-form");
    state[id] = {
      ...state[id],
      status: form.status.value,
      progress: Number(form.progress.value),
      owner: form.owner.value,
      deadline: form.deadline.value,
      explanation: form.explanation.value,
      nextStep: form.nextStep.value,
      planningNotes: form.planningNotes.value,
      planningYears: Array.from(form.querySelectorAll('input[name="planningYears"]:checked')).map((input) => input.value),
      evidenceNotes: form.evidenceNotes.value,
      visible: Array.from(form.querySelectorAll('input[name="visible"]:checked')).map((input) => input.value),
    };
    form.querySelector("output").textContent = `${state[id].progress}%`;
    updateCard(id);
    saveState();
  }

  byId("generate-report").addEventListener("click", generateReport);
  byId("export-json").addEventListener("click", exportJson);
  byId("print-report").addEventListener("click", () => {
    if (!byId("report-output").value.trim()) generateReport();
    window.print();
  });
}

function boot() {
  renderThemes();
  renderThemeMenu();
  renderThemePages();
  renderFilters();
  renderAmbitions();
  renderPlans();
  renderExternalProgress();
  updateMetrics();
  bindEvents();
  generateReport();

  if (sessionStorage.getItem("kersenboom-auth") === "true" && sessionStorage.getItem(AUTH_TOKEN_KEY)) {
    applyRole(currentRole || "internal");
    byId("gate").classList.add("is-hidden");
    byId("app").classList.remove("is-hidden");
  }
  routeToHash();
  if (sessionStorage.getItem(AUTH_TOKEN_KEY)) loadRemoteState();
}

boot();
