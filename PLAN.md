# Piano Globale di Trasformazione: openGym -> PT Platform (Personal Trainer & Clienti)

## 1. Obiettivi e Requisiti Chiave
- **Architettura Ruoli:**
  - **Trainer (PT/Admin):** Gestione clienti, libreria template schede, assegnazione/personalizzazione schede cliente, monitoraggio real-time di allenamenti, PR e grafici, chat 1-a-1.
  - **Cliente:** Visualizzazione della scheda assegnata dal PT, esecuzione guidata del workout (GIF/istruzioni, log carichi e RPE), possibilità controllata di sostituire o aggiungere esercizi (modalità mista), chat con il PT.
- **Autenticazione:** WebAuthn (Passkeys) via link d'onboarding one-time generato dal PT.
- **Comunicazione:** Chat integrata leggera 1-a-1 memorizzata in file JSON sul server.
- **Snellimento (No Bloat):** Rimozione/disattivazione dei componenti superflui dell'AI Coach, mantenendo intatte le parti core stabili e deterministiche (progression engine, e1RM, body-weight, push notifications).
- **Integrità & Stabilità:** Nessuna regressione sui test di base, zero dipendenze esterne pesanti.

---

## 2. Struttura dei Task & Suddivisione per Subagenti Specializzati

Per mantenere la context window focalizzata ed evitare collisioni, il lavoro è suddiviso in task sequenziali e paralleli ben definiti:

### 🟢 FASE 1: Cleanup & Modello Dati Backend
- **Task 1: Backend Data Model & Core API (Sequenziale - Fondamenta)**
  - *Agente:* `backend-core`
  - *Scope:*
    - Modifica `api/server.js` per gestire:
      - Ruoli (`role: 'trainer' | 'client'`).
      - Client creation & Onboarding passkey tokens.
      - Schema template schede (`db.templates`).
      - Endpoint CRUD per template schede (`/api/trainer/templates`).
      - Endpoint per assegnazione/aggiornamento scheda cliente da parte del PT (`/api/trainer/client/:id/plan`).
      - Endpoint monitoraggio clienti con storico completo (`/api/trainer/clients`, `/api/trainer/client/:id`).
      - Sistema di messaggistica/chat 1-a-1 (`/api/chat/:clientId`).
    - Disattivazione o rimozione route Coach non utilizzate per snellire il backend.
    - Test delle nuove API.

---

### 🟡 FASE 2: Frontend Client API & Store Extension (In successione alla Fase 1)
- **Task 2: Frontend State & Client Libs**
  - *Agente:* `frontend-store`
  - *Scope:*
    - Aggiornamento `frontend/src/store/useStore.js` e `api.js`:
      - Gestione ruolo utente (`user.role`).
      - Sincronizzazione template schede per il PT.
      - Nuove azioni API per: lista clienti, assegnazione scheda, invio/ricezione messaggi chat.
      - Gestione permessi e flag per abilitare la sostituzione esercizi da parte del cliente senza rompere il piano originale del PT.

---

### 🔵 FASE 3: Sviluppo Interfacce Trainer e Cliente (Parallelizzabile)
- **Task 3A: Interfaccia Personal Trainer (Dashboard, Gestione Clienti, Template)**
  - *Agente:* `trainer-ui`
  - *Scope:*
    - Creazione vista `TrainerView.jsx` o potenziamento di `Admin.jsx` / viste dedicate:
      - **Dashboard Clienti:** Elenco clienti con stato ultimo allenamento, carichi recenti, note.
      - **Onboarding Cliente:** Creazione nuovo cliente con generazione codice/link d'accesso Passkey.
      - **Dettaglio Cliente & Assegnazione Scheda:** Schermata per comporre o assegnare un template, visualizzare i progressi (PR, e1RM, peso corporeo).
      - **Libreria Template Schede:** Creazione, modifica ed eliminazione template di allenamento.
      - **Interfaccia Chat PT-Cliente:** Finestra chat con lista conversazioni clienti.

- **Task 3B: Interfaccia Cliente & Modalità Mista**
  - *Agente:* `client-ui`
  - *Scope:*
    - Adattamento schermate per il cliente:
      - `Home.jsx` e `Plan.jsx`: Il cliente vede la scheda assegnata dal suo PT con note tecniche e badge "Scheda del Trainer".
      - `RoutineEdit.jsx` / `Workout.jsx`: Permettere la modalità mista (sostituzione esercizio se macchinario occupato o aggiunta esercizio complementare, con feedback visivo chiaro).
      - Tab / Finestra Chat con il Trainer: Accessibile dalla barra di navigazione o dalla scheda per chiedere chiarimenti tecnici sull'esecuzione.

---

### 🟣 FASE 4: Revisione, Rifinitura, Pulizia e Test E2E
- **Task 4: Integrazione Globale & Test E2E**
  - *Agente:* `qa-integrator`
  - *Scope:*
    - Verifica del flusso completo:
      1. Login Trainer -> Creazione Cliente -> Generazione invito passkey.
      2. Registrazione Cliente con passkey.
      3. Trainer crea un template e lo assegna al cliente con note ed esercizi.
      4. Cliente si collega, vede la scheda con GIF, esegue il workout, segna carichi e scambia un esercizio.
      5. Trainer riceve il log del workout in tempo reale e risponde via chat.
    - Esecuzione test unitari e verifica build produzione (`npm run build`).
