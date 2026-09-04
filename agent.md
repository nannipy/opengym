# openGym — Repository Agent Guide (`agent.md`)

> **Guida globale e comprensiva per AI Agent e sviluppatori**  
> Progetto: **openGym** (Fork con integrazione **AI Coach**)  
> Licenza: **GNU AGPL v3.0** · Stack principale: React 19, Vite, Zustand, Node.js (Vanilla), WebAuthn, Docker Compose, Nginx, Capacitor.

---

## 1. Visione d'insieme e Filosofia

**openGym** è un'applicazione self-hosted open-source per il tracciamento degli allenamenti in palestra e del peso corporeo, progettata secondo principi cardine:
- **Sovranità del dato (Zero Telemetry, Zero Cloud lock-in):** I dati risiedono esclusivamente sul server dell'utente (o in locale sul dispositivo mobile) in formato JSON trasparente (`./data`).
- **Autenticazione Passwordless nativa:** Autenticazione biometrica basata sullo standard **WebAuthn (Passkeys)** (Face ID, Touch ID, Windows Hello, sensore d'impronte). Nessun server gestisce o memorizza chiavi private.
- **Architettura Single-Origin:** WebAuthn vincola rigidamente le credenziali a un hostname (`RP_ID`) e richiede HTTPS (o `http://localhost`). Per questo motivo, un reverse proxy Nginx serve sia il frontend statico che l'API (`/api/`) dallo stesso dominio e porta.
- **Leggerezza e zero dipendenze superflue:** Nessun database relazionale o ORM pesante (file JSON con scrittura atomica); nessun framework massiccio nel backend (puro `node:http`); solo React, Zustand e React Router nel frontend.
- **Supporto Mobile Ibrido:** Lo stesso codebase compila un'app PWA web e un'applicazione mobile nativa offline-first per Android e iOS tramite **Capacitor** (`VITE_MOBILE=1`), senza alcun server richiesto.

---

## 2. Architettura di Sistema

Il sistema è distribuito tramite `docker-compose.yml` e consta di tre servizi:

```
                  ┌──────────────────────────────┐
                  │  Dispositivo Utente (Browser) │
                  └──────────────┬───────────────┘
                                 │ HTTPS / WebAuthn
                                 ▼
                  ┌──────────────────────────────┐
                  │       web (Nginx:Alpine)     │
                  │  - Serve SPA React (dist)    │
                  │  - Serve /img e /gif (media) │
                  │  - Reverse proxy /api ───────┼────────┐
                  └──────────────────────────────┘        │
                                                          │ HTTP :3000
                                                          ▼
┌─────────────────────────────┐           ┌──────────────────────────────┐
│       media (Alpine/Git)    │           │      api (Node.js Vanilla)   │
│  - One-shot download asset  │           │  - WebAuthn Server           │
│    esercizi (~140MB) in     │           │  - Web Push / VAPID          │
│    volume ./media           │           │  - Gestione State JSON       │
└─────────────────────────────┘           │  - Motore AI Coach (SDK/CLI) │
                                          └──────────────┬───────────────┘
                                                         │
                                                         ▼
                                          ┌──────────────────────────────┐
                                          │      Host Volume ./data      │
                                          │  - db.json (utenti, creds)   │
                                          │  - state-<uid>.json          │
                                          │  - secret (HMAC sessioni)    │
                                          │  - coach.json (config AI)    │
                                          │  - vapid.json (push keys)    │
                                          └──────────────────────────────┘
```

### Flusso dei Dati
1. **Frontend:** React 19 (SPA) gestisce lo stato tramite uno store reattivo **Zustand** (`useStore.js`). Le mutazioni sono salvate immediatamente in `localStorage` e debounced (1.5s) sincronizzate con `PUT /api/data`.
2. **Backend API:** Riceve `state` e lo scrive atomicamente (`.tmp` -> rename) in `/data/state-<uid>.json`. Il file `db.json` contiene la tabella utenti, credenziali pubbliche WebAuthn, sottoscrizioni WebPush e codici invito.
3. **Sessioni:** Cookie cifrati e firmati via HMAC-SHA256 (`gymsid`) contenenti `<uid>:<expiry>:<version>`, con supporto a invalidazione globale di tutte le sessioni (`POST /api/logout/all`).

---

## 3. Struttura delle Directory e File Chiave

```
opengym/
├── api/                           # Backend Node.js
│   ├── coach/                     # Sottosistema AI Coach
│   │   ├── adapters/              # Adapter per provider AI (Claude Agent SDK, Codex CLI, Fixture)
│   │   │   ├── claude.js          # Integrazione Claude Code via Agent SDK
│   │   │   ├── codex-cli.js       # Adapter per OpenAI Codex CLI
│   │   │   ├── fixture-cli.mjs    # Mock CLI per test e demo locale
│   │   │   ├── index.js           # Registry degli adapter
│   │   │   └── spawn.js           # Esecuzione sicura di processi CLI unprivileged
│   │   ├── cadence.js             # Scheduler revisioni periodiche (settimanali, N sessioni)
│   │   ├── config.js              # Configurazione coach (AES-256-GCM per credenziali a riposo)
│   │   ├── jobs.js                # Job runner: enqueue, single-flight, timeout, repair-round
│   │   ├── library.json           # Catalogo compatto di 1.324 esercizi (generato per validazione)
│   │   ├── oauth.js               # Flussi di autenticazione provider / device code
│   │   ├── payload.js             # Allowlist rigorosa per payload privacy-safe
│   │   ├── prompts/               # Prompt templates di sistema (create, review, repair)
│   │   ├── routes.js              # Endpoint HTTP /api/coach/* e /api/admin/coach/*
│   │   └── validate.js            # Security boundary: validazione e parsing risposte LLM
│   ├── test/                      # Test di backend (node --test)
│   ├── Dockerfile                 # Multi-stage image con runtime Claude & Codex preinstallati
│   ├── package.json
│   └── server.js                  # Entry point API HTTP senza framework
├── frontend/                      # Applicazione Client React 19
│   ├── src/
│   │   ├── components/            # Componenti UI (BodyMap, LineChart, Heatmap, Modals, etc.)
│   │   ├── lib/                   # Logica di business pura e utility
│   │   │   ├── api.js             # Client fetch e interazione WebAuthn (credentials.create/get)
│   │   │   ├── coach.js           # Gestione client AI Coach (applicazioni atomiche, snapshot, rollback)
│   │   │   ├── coach-api.js       # Hook e chiamate API per Coach
│   │   │   ├── coach-demo.js      # Provider mock locale per la demo statica
│   │   │   ├── effort.js          # Statistiche e conversioni sforzo RIR / RPE
│   │   │   ├── exercises.js       # Lookup e gestione esercizi (built-in e custom)
│   │   │   ├── exercises-data.js   # Dataset completo di 1.324 esercizi
│   │   │   ├── history.js         # Calcolo streak, volume, routine effettive, formattazione log
│   │   │   ├── i18n.js            # Sistema internazionalizzazione (12 lingue)
│   │   │   ├── import-csv.js      # Parser import da FitNotes, Strong, Hevy, Apple Health
│   │   │   ├── mobile.js          # Rilevamento runtime Capacitor e persistenza su filesystem nativo
│   │   │   ├── muscles.js         # Mappatura e pesi muscolari per BodyMap
│   │   │   ├── onerm.js           # Calcolo 1RM stimato (Epley, Brzycki, Lombardi) con tetto a 12 rep
│   │   │   ├── plan-share.js      # Export/import piani d'allenamento in JSON/PDF
│   │   │   ├── progression.js     # Motore deterministico di progressione (Linear, Greyskull, Double, Time)
│   │   │   ├── push.js            # Registrazione Web Push e notifiche browser
│   │   │   └── wakelock.js        # Screen WakeLock API per mantenere lo schermo acceso in workout
│   │   ├── locales/               # File di traduzione (en, it, de, fr, es, pt, etc.)
│   │   ├── store/                 # Zustand store (useStore.js, useUI.js)
│   │   ├── views/                 # Pagine SPA (Home, Workout, Plan, RoutineEdit, Stats, Coach, Admin...)
│   │   ├── App.jsx                # Shell dell'app, routing e controlli globali
│   │   ├── sheets.jsx             # Gestore di tutti i bottom-sheet / modal operativi
│   │   └── index.css              # Stili CSS con variabili tematiche e safe-area mobile
│   ├── android/                   # Shell nativa Android (Capacitor)
│   ├── ios/                       # Shell nativa iOS (Capacitor)
│   ├── package.json
│   └── vite.config.js
├── web/                           # Container Nginx
│   ├── Dockerfile                 # Build multi-stage del frontend + Nginx
│   └── nginx.conf                 # Configurazione proxy e caching asset
├── docs/                          # Documentazione tecnica dettagliata
│   ├── AI_COACH.md                # Specifiche complete sul funzionamento dell'AI Coach
│   ├── MOBILE.md                  # Istruzioni compilazione APK Android e iOS
│   └── SELF_HOSTING.md            # Guida al deployment self-hosted e proxying HTTPS
├── ai-enablement/                 # Documenti di specifica, piani di implementazione e report AI
├── scripts/                       # Script di manutenzione e generazione dati
│   ├── build-coach-library.mjs    # Generatore di api/coach/library.json dal dataset frontend
│   ├── build-instructions.mjs    # Generatore delle istruzioni esercizi multilingua
│   └── fetch-media.sh             # Script ausiliario per download asset
└── docker-compose.yml             # Orchestrazione container Docker
```

---

## 4. I Due Mondi: Engine Deterministico vs AI Coach

Una delle scelte architetturali più sofisticate del progetto è la **rigida separazione tra logica matematica e giudizio analitico**.

```
┌────────────────────────────────────────┐       ┌────────────────────────────────────────┐
│               AI COACH                 │       │           PROGRESSION ENGINE           │
│        (Giudizio & Adattamento)        │       │        (Matematica Deterministica)     │
├────────────────────────────────────────┤       ├────────────────────────────────────────┤
│ • Genera routine e split settimanali   │  ──▶  │ • Calcola i carichi per la sessione    │
│ • Analizza aderenza e trend RPE/RIR    │  fissa│ • Applica regole: Linear, Greyskull LP │
│ • Propone modifiche ed esercizi        │ piano │ • Gestisce stall e deload deterministici│
│ • Suggerisce variazioni e volumi       │       │ • Esegue 100% offline e client-side    │
└────────────────────────────────────────┘       └────────────────────────────────────────┘
```

### 4.1 Il Progression Engine (`frontend/src/lib/progression.js`)
- Esegue esclusivamente nel client come funzione pura della cronologia degli allenamenti.
- **Politiche di progressione (`POLICIES`):**
  1. `linear`: Se tutte le ripetizioni e serie sono completate al target, il carico sale (default +2.5kg upper body, +5kg lower body). Se si fallisce per 3 sessioni consecutive (`DELOAD_AFTER.linear = 3`), scatta un deload del 10%.
  2. `greyskull`: 2 serie target + 1 serie finale AMRAP (As Many Reps As Possible). Se l'AMRAP supera il target, incrementa il carico (raddoppia l'incremento se si raddoppiano le rep). Un singolo fallimento innesca subito un deload del 10%.
  3. `double` (Double Progression): Lavoro all'interno di un range di ripetizioni (es. 8-12). Si aumentano le ripetizioni; quando tutte le serie toccano il massimo del range, sale il carico e le ripetizioni tornano alla base.
  4. `time`: Incremento progressivo del tempo per esercizi isometrici/timed (+5 sec).
  5. `off`: Nessun cambio automatico.

### 4.2 L'AI Coach (`api/coach/` & `frontend/src/lib/coach.js`)
- **Scopo:** Aiutare l'utente nell'intake iniziale (creare una scheda su misura) e revisionare periodicamente la programmazione in base alle evidenze registrate (sessioni saltate, RPE costantemente troppo alto, stall prolungati, squilibri muscolari).
- **Zero-touch automatico (Human-in-the-loop):** L'AI non applica MAI modifiche al database o al piano in autonomia. Produce una **proposta atomica di modifiche** (`CoachProposal.jsx`).
- **Rollback Garantito:** Prima di applicare qualsiasi proposta dell'AI, il client esegue un snapshot del piano (`snapshots`). L'utente può annullare le modifiche in qualunque momento con un solo tocco, lasciando intatti i log degli allenamenti.

---

## 5. Modello di Sicurezza, Privacy e Sandbox

1. **Principio di Minimo Privilegio nel Container (`api/`):**
   - I processi dell'AI Coach vengono eseguiti tramite un utente non privilegiato (`coach`).
   - La cartella `/data` è protetta con permessi `0700`. Il worker AI non può accedere direttamente a `db.json`, `secret` o ai file di stato degli altri utenti.
   - Le credenziali API o token di sessione (es. Claude setup token) sono cifrati a riposo con **AES-256-GCM**, la cui chiave deriva tramite HKDF dal `secret` dell'istanza.
2. **Costruzione dell'Ambiente e Allowlist di Dati (`api/coach/payload.js`):**
   - L'ambiente di processo per i CLI AI viene istanziato da zero (non eredita le variabili dell'ambiente genitore, prevenendo fughe di chiavi VAPID, token o admin id).
   - I dati inviati al provider AI sono rigidamente filtrati campo per campo: ID utente, nomi, email, token e credenziali WebAuthn **non lasciano mai il server**. L'utente è identificato tramite uno pseudonimo effimero non reversibile.
   - La cronologia d'allenamento inviata per la revisione è limitata a una finestra temporale massima (12 settimane o 60 sessioni).
3. **Validatore Rigoroso (`api/coach/validate.js`):**
   - L'output dell'LLM passa attraverso una lista chiusa di azioni permesse (`CHANGE_TYPES`: `add-exercise`, `swap-exercise`, `sets`, `reps`, `routine-prog`, `week`, etc.). Qualsiasi comando o proprietà non prevista viene scartata.
   - Gli ID degli esercizi proposti devono esistere obbligatoriamente nel catalogo `library.json` (1.324 esercizi).

---

## 6. Frontend: State Management e Flussi Utente

### Struttura dello Stato (`useStore.js`):
Lo schema base dello stato (`DEF`) racchiude:
- `unit`: `'kg'` | `'lb'`
- `restSec`: tempo di recupero predefinito (sec)
- `sound`, `keepAwake`: impostazioni audio e WakeLock
- `theme`, `accent`: personalizzazione estetica (8 colori d'accento, dark/light)
- `routines`: elenco delle schede/giornate di allenamento con relativi esercizi, serie, target e politiche di progressione
- `week`: mappa dei giorni della settimana (1=Lun ... 0=Dom) associati all'ID della routine
- `dayPlan`: override puntuali per date specifiche (es. spostamento workout o impostazione giorno di riposo)
- `workouts`: storico completo delle sessioni svolte, set completati, volume, RPE/RIR registrato
- `bodyweight`: storico pesate corporee con obiettivo `targetW`
- `active`: sessione di allenamento attualmente in corso (non sincronizzata al server, rimane locale al dispositivo)
- `coach`: stato del coach AI (consenso, profilo utente, cadenza revisioni, log storico, snapshot)

### Modalità Operative Speciali:
1. **PWA / Browser Standard:** Connesso a `api/`, autenticato con Passkey, sincronizzazione automatica bidirezionale.
2. **Guest Mode:** Permette l'utilizzo completo dell'app nel browser senza account. Tutti i dati restano isolati in `localStorage`.
3. **Standalone Mobile (Capacitor):** Compilata con `VITE_MOBILE=1`. Non mostra schermate di login, non contatta il backend, persiste lo stato su file locale (`@capacitor/filesystem`), supporta notifiche locali per gli allenamenti e condivide i backup tramite la Share Sheet di sistema.
4. **Live Demo:** Esegue interamente nel browser con dati demo inizializzati e un finto provider AI locale (`coach-demo.js`).

---

## 7. Linee Guida per Agenti e Sviluppatori

Quando effettui modifiche su questa repository, osserva rigorosamente queste regole:

1. **Preserva la leggerezza delle dipendenze:**
   - **Frontend:** Mantieni solo React, React Router e Zustand. Non introdurre UI library pesanti (es. MUI, Tailwind) o framework di validazione complessi.
   - **Backend:** Mantieni l'approccio vanilla (`node:http`). Evita di aggiungere Express, Fastify, database server o ORM.
2. **Logica di allenamento sempre isolata e testata:**
   - Qualsiasi formula o calcolo riguardante progressioni, 1RM, carichi o lettura delle serie deve risiedere in funzioni pure dentro `frontend/src/lib/` (es. `progression.js`, `onerm.js`, `effort.js`) ed essere accompagnata da test unitari (`npm test` con Vitest).
3. **Integrità del catalogo esercizi:**
   - Se viene modificato il catalogo in `frontend/src/lib/exercises-data.js`, è **obbligatorio** rigenerare la libreria del backend eseguendo:
     ```bash
     node scripts/build-coach-library.mjs
     ```
   - La CI fallirà se `api/coach/library.json` risulta disallineato rispetto ai dati frontend.
4. **Coerenza tra Server e Client per il Coach:**
   - La funzione `canonicalPlan()` e l'algoritmo di hash del piano `hashPlan()` sono duplicati intenzionalmente tra `api/coach/payload.js` e `frontend/src/lib/coach.js` per evitare dipendenze cross-runtime. Se si modifica la serializzazione canonica, **entrambi i file devono essere aggiornati simultaneamente**.
5. **Traduzioni e Localizzazione:**
   - Il frontend supporta 12 lingue via `frontend/src/lib/i18n.js`. Le nuove stringhe UI per gli utenti devono essere wrappate con `t('...')`.
   - Le viste amministrative (`Admin.jsx`, `AdminCoach.jsx`) sono deliberatamente escluse dall'internazionalizzazione e rimangono in inglese.
6. **Comandi di verifica rapida:**
   - Test unitari backend: `cd api && npm test`
   - Test unitari frontend: `cd frontend && npm test`
   - Build produzione frontend: `cd frontend && npm run build`
   - Build container locale: `docker compose up -d --build`
